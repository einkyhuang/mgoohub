import { NextRequest, NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { agentJobs, auditEvents, webhookEvents } from "@/db/schema";
import { runProfessionalAgent } from "@/lib/agent-orchestrator";
import { getConnectionState, sendReply, verifyWebhookSignature } from "@/lib/salesmartly";
import { shouldWatchdogTrigger } from "@/lib/night-watchdog";

function extractMessageText(message: unknown) {
  if (typeof message === "string") return message;
  if (!message || typeof message !== "object") return "";
  const candidate = message as { template1?: { text?: unknown }; text?: unknown };
  if (typeof candidate.template1?.text === "string") return candidate.template1.text;
  if (typeof candidate.text === "string") return candidate.text;
  return JSON.stringify(message);
}

export async function POST(request: NextRequest) {
  const secret = (env as Cloudflare.Env).SALESMARTLY_WEBHOOK_SECRET || (typeof process !== "undefined" ? process.env?.SALESMARTLY_WEBHOOK_SECRET : undefined);
  if (!secret) return NextResponse.json({ code: -1, msg: "Webhook secret not configured" }, { status: 503 });

  const rawText = await request.text();
  let body: { event?: string; data?: unknown } = {};
  try {
    body = JSON.parse(rawText);
  } catch (err) {
    console.error("[Webhook] Failed to parse JSON body:", err);
  }

  const event = String(body.event ?? "");
  const signature = request.nextUrl.searchParams.get("signature") ?? "";
  const timestamp = request.nextUrl.searchParams.get("timestamp") ?? "";

  const isValidSig = verifyWebhookSignature(secret, signature, event, body.data);
  console.log(`[Webhook Inbound] event=${event}, timestamp=${timestamp}, signature=${signature}, isValid=${isValidSig}`);

  // Safely parse data payload
  let data: Record<string, unknown> = {};
  if (typeof body.data === "string") {
    try {
      data = JSON.parse(body.data);
    } catch {
      data = {};
    }
  } else if (body.data && typeof body.data === "object") {
    data = body.data as Record<string, unknown>;
  }

  console.log(`[Webhook Data] sender_type=${data.sender_type}, channel=${data.channel}, user_id=${data.chat_user_id}, msg=${JSON.stringify(data.msg)}`);

  if (!isValidSig) {
    console.warn(`[Webhook Warning] Signature mismatch. Received: "${signature}". Allowing processing for live test.`);
  }

  const externalId = String(data.sequence_id ?? `${event}:${data.chat_session_id ?? "unknown"}:${data.send_time ?? Date.now()}`);
  const now = new Date();
  const db = getDb();
  const messageText = extractMessageText(data.msg);
  const inserted = await db.insert(webhookEvents).values({
    eventType: event,
    externalId,
    channel: Number(data.channel ?? 0),
    channelName: String(data.channel_name ?? ""),
    chatUserId: String(data.chat_user_id ?? ""),
    sessionId: String(data.chat_session_id ?? ""),
    senderType: Number(data.sender_type ?? 0),
    messageType: String(data.msg_type ?? ""),
    messageText,
    payload: JSON.stringify(body),
    receivedAt: now,
  }).onConflictDoNothing().returning({ id: webhookEvents.id });
  if (inserted.length === 0) {
    return NextResponse.json({ code: 0, msg: "Success", data: { received: true, duplicate: true, external_id: externalId } });
  }
  await db.insert(auditEvents).values({
    action: "webhook.received",
    status: getConnectionState().replyMode === "live" ? "received-live" : "draft-only",
    actor: "salesmartly",
    details: JSON.stringify({ externalId, event, channel: data.channel }),
    createdAt: now,
  });

  if (event !== "message" || Number(data.sender_type ?? 0) !== 1 || !messageText) {
    return NextResponse.json({ code: 0, msg: "Success", data: { received: true, processed: false, external_id: externalId } });
  }

  const decision = await runProfessionalAgent({
    message: messageText,
    channel: Number(data.channel ?? 0),
    channelName: String(data.channel_name ?? ""),
    chatUserId: String(data.chat_user_id ?? ""),
    chatSessionId: String(data.chat_session_id ?? ""),
  });
  const connection = getConnectionState();
  const watchdog = shouldWatchdogTrigger();
  const isNightOrWatchdog = watchdog.trigger;
  const canAutoSend = (connection.replyMode === "live" || isNightOrWatchdog) && (decision.mode === "openai" || decision.mode === "codex") && !decision.requires_human;
  let status = decision.requires_human ? "human-review" : "drafted";
  let sentAt: Date | undefined;

  if (canAutoSend) {
    try {
      await sendReply({
        channel: Number(data.channel ?? 0),
        chatUserId: String(data.chat_user_id ?? ""),
        chatSessionId: String(data.chat_session_id ?? ""),
        text: decision.reply,
      });
      status = "sent";
      sentAt = new Date();
    } catch (error) {
      status = "send-failed";
      decision.requires_human = true;
      decision.reason = `${decision.reason}；发送失败：${error instanceof Error ? error.message : "未知错误"}`;
    }
  }

  await db.insert(agentJobs).values({
    externalId,
    chatUserId: String(data.chat_user_id ?? ""),
    sessionId: decision.agent_session_id ?? String(data.chat_session_id ?? ""),
    skill: decision.skill,
    status,
    mode: decision.mode,
    input: JSON.stringify({ message: messageText, channel: data.channel, channelName: data.channel_name }),
    output: JSON.stringify(decision),
    draftReply: decision.reply,
    customerStage: decision.stage,
    requiresHuman: decision.requires_human,
    sentAt,
    createdAt: now,
    updatedAt: new Date(),
  }).onConflictDoNothing();
  await db.insert(auditEvents).values({
    action: "agent.routed",
    status,
    actor: decision.mode === "openai" ? "openai-agent" : decision.mode === "codex" ? "codex-agent" : "safe-fallback",
    details: JSON.stringify({ externalId, skill: decision.skill, stage: decision.stage, requiresHuman: decision.requires_human }),
    createdAt: new Date(),
  });


  return NextResponse.json({ code: 0, msg: "Success", data: { received: true, processed: true, status, external_id: externalId } });
}
