import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET() {
  const values = env as Cloudflare.Env;
  const gatewayUrl = values.CODEX_GATEWAY_URL?.replace(/\/$/, "") ?? null;
  let gatewayReachable = false;

  if (gatewayUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await fetch(`${gatewayUrl}/models`, {
        headers: values.CODEX_GATEWAY_TOKEN ? { authorization: `Bearer ${values.CODEX_GATEWAY_TOKEN}` } : {},
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      gatewayReachable = response.ok;
    } catch {
      gatewayReachable = false;
    }
  }

  const backend = gatewayReachable ? "codex-gateway" : values.OPENAI_API_KEY ? "openai-agents" : "local-rules";
  return NextResponse.json({
    configured: gatewayReachable || Boolean(values.OPENAI_API_KEY),
    backend,
    model: backend === "codex-gateway" ? values.CODEX_GATEWAY_MODEL ?? "deepseek/deepseek-flash" : values.OPENAI_AGENT_MODEL ?? "gpt-6-astra",
    gatewayUrl,
    gatewayReachable,
    replyMode: values.SALESMARTLY_REPLY_MODE === "live" ? "live" : "draft",
  });
}
