import { NextRequest, NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { runAIEmployeeTask } from "@/lib/ai-workforce";
import { fetchEccangAnalytics, getEccangConfig, updateEccangAnalytics } from "@/lib/eccang";
import { DEFAULT_WATCHDOG_CONFIG, generateMorningReport } from "@/lib/night-watchdog";
import { BUYER_PERSONAS, runBuyerTurn, evaluateRoleplaySession } from "@/lib/sales-training";
import { sendReply } from "@/lib/salesmartly";

type RpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};

const tools = [
  {
    name: "run_ai_employee",
    description:
      "Invoke one of MGOO's 8 specialized foreign-trade AI employees: market-intel (市场情报员), icp-scorer (ICP客户筛选), deep-researcher (客户研究), buying-signals (采购信号), decision-hunter (决策链挖掘), outreach-assistant (个性化开发信助理), night-closer (夜间助攻员), sales-coach (实战对练教练).",
    inputSchema: {
      type: "object",
      properties: {
        employee_id: {
          type: "string",
          description:
            "ID of the employee: 'market-intel', 'icp-scorer', 'deep-researcher', 'buying-signals', 'decision-hunter', 'outreach-assistant', 'night-closer', 'sales-coach'",
        },
        target_brand_or_niche: {
          type: "string",
          description: "Target prospect brand, website URL, niche, or inbound inquiry message to analyze.",
        },
        extra_notes: {
          type: "string",
          description: "Optional extra notes, target MOQ, preferred fabrics, or constraints.",
        },
      },
      required: ["employee_id", "target_brand_or_niche"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "get_eccang_overview",
    description:
      "Read ECCANG ERP 2C sales metrics, GMV by platform (TikTok Shop, Shopify, Amazon), top-selling SKUs, inventory alerts, and 2B/2C sales synergy recommendations for sales reps. Returns connection status if not yet configured.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "sync_eccang_overview",
    description:
      "Push or update real ECCANG ERP 2C sales metrics, platform GMV shares, top SKUs, and inventory alerts into MGOO Workbench.",
    inputSchema: {
      type: "object",
      properties: {
        today_gmv_usd: { type: "number", description: "Today's GMV in USD" },
        month_gmv_usd: { type: "number", description: "Current month's GMV in USD" },
        month_orders_count: { type: "number", description: "Total orders this month" },
        avg_order_value_usd: { type: "number", description: "Average Order Value in USD" },
        gross_margin_pct: { type: "number", description: "Gross margin percentage (e.g. 54.2)" },
        return_rate_pct: { type: "number", description: "Return rate percentage (e.g. 4.8)" },
        platform_distribution: {
          type: "array",
          description: "List of platform sales shares (platform, gmvShare, gmvAmountUsd, orderCount, color)",
          items: { type: "object" },
        },
        top_skus: {
          type: "array",
          description: "List of top selling SKUs (sku, name, category, monthlySalesUnits, inventoryLevel, safetyStock, status, revenueUsd, growthPct, b2bSynergyTip)",
          items: { type: "object" },
        },
        inventory_alerts: {
          type: "array",
          description: "List of inventory alerts (warehouse, sku, remainingDays, actionRequired, urgency)",
          items: { type: "object" },
        },
      },
      required: ["today_gmv_usd", "month_gmv_usd"],
      additionalProperties: true,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "get_night_watchdog_report",
    description:
      "Read the 24/7 Night Watchdog schedule (default 19:00 - 09:00), 3-minute timeout status, and the generated Morning Handover Report of captured overseas leads.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "send_whatsapp_message",
    description:
      "Send or stage a live WhatsApp marketing message to a buyer via SaleSmartly. Supports staging for safe review or immediate sending.",
    inputSchema: {
      type: "object",
      properties: {
        chat_user_id: { type: "string", description: "SaleSmartly customer chat user ID or WhatsApp phone number." },
        message: { type: "string", description: "The marketing message or follow-up text to send." },
        auto_send: { type: "boolean", description: "If true, send directly via SaleSmartly API; if false, save as draft for human review." },
      },
      required: ["chat_user_id", "message"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "run_sales_roleplay",
    description:
      "Simulate a sales training turn with a foreign apparel buyer persona (Marcus Vance - Streetwear LA, Chloe Evans - Yoga London, David Miller - Strict Bargainer Australia) and evaluate rep performance.",
    inputSchema: {
      type: "object",
      properties: {
        persona_id: { type: "string", description: "Persona ID: 'la-streetwear-founder', 'uk-yoga-studio', or 'strict-bargainer'" },
        rep_message: { type: "string", description: "The sales rep reply to test." },
      },
      required: ["persona_id", "rep_message"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "get_operations_overview",
    description: "Read aggregate counts for SaleSmartly messages, agent jobs, drafts, sends, and human-review cases.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "search_customer_messages",
    description: "Search recent inbound customer messages by text. Returns a bounded list and never sends messages.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword to search in customer messages" },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (1-50)" },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_customer_brief",
    description: "Read recent messages and agent decisions for one SaleSmartly chat user.",
    inputSchema: {
      type: "object",
      properties: { chat_user_id: { type: "string", description: "Customer chat user ID" } },
      required: ["chat_user_id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "stage_customer_reply",
    description: "Save an auditable reply draft for human review. This tool never sends an external message.",
    inputSchema: {
      type: "object",
      properties: {
        chat_user_id: { type: "string" },
        chat_session_id: { type: "string" },
        text: { type: "string" },
        stage: { type: "string" },
      },
      required: ["chat_user_id", "chat_session_id", "text"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
];

function rpc(id: RpcRequest["id"], result: unknown, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { status });
}

function rpcError(id: RpcRequest["id"], code: number, message: string, status = 400) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

function toolResult(data: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
    isError: false,
  };
}

function authenticated(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const mcpToken = request.headers.get("x-mcp-token") || "";
  const host = request.headers.get("host") || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const hasOai = Boolean(request.headers.get("oai-authenticated-user-id") || request.headers.get("oai-authenticated-user-email"));

  return isLocal || hasOai || authHeader.startsWith("Bearer ") || Boolean(mcpToken);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as RpcRequest;

  if (body.method === "initialize") {
    return rpc(body.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "mgoo-omnichannel-desk", version: "2.0.0" },
    });
  }
  if (body.method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }
  if (body.method === "tools/list") {
    return rpc(body.id, { tools });
  }
  if (body.method !== "tools/call") {
    return rpcError(body.id, -32601, "Method not found", 404);
  }
  if (!authenticated(request)) {
    return rpcError(body.id, -32001, "Authenticated Codex, WorkBuddy, or local user required", 401);
  }

  const name = body.params?.name;
  const args = body.params?.arguments ?? {};
  const database = (env as Cloudflare.Env)?.DB;

  try {
    // 1. Run AI Employee
    if (name === "run_ai_employee") {
      const employeeId = String(args.employee_id || "icp-scorer");
      const targetBrandOrNiche = String(args.target_brand_or_niche || "");
      const extraNotes = args.extra_notes ? String(args.extra_notes) : undefined;
      const res = await runAIEmployeeTask(employeeId, { targetBrandOrNiche, extraNotes });
      return rpc(body.id, toolResult(res));
    }

    // 2. ECCANG ERP Overview
    if (name === "get_eccang_overview") {
      const analytics = await fetchEccangAnalytics();
      if (!analytics) {
        const config = getEccangConfig();
        return rpc(
          body.id,
          toolResult({
            status: "pending_configuration",
            connected: false,
            message:
              "易仓 ERP 暂未配置 API 凭证或未推送数据（虚拟测试数据已全部清空）。你可以使用 MCP 工具 sync_eccang_overview 或通过 POST /api/eccang/analytics 推送真实数据。",
            apiEndpoint: "http://localhost:5173/api/eccang/analytics",
            syncEndpoint: "http://localhost:5173/api/eccang/sync",
            config: {
              appKeyConfigured: Boolean(config.appKey),
              serviceUrl: config.serviceUrl,
              configured: config.configured,
            },
            data: null,
          }),
        );
      }
      return rpc(body.id, toolResult(analytics));
    }

    // 2.1 Sync ECCANG ERP Overview (For AI agent or webhook push)
    if (name === "sync_eccang_overview") {
      const updated = updateEccangAnalytics({
        todayGmvUsd: Number(args.today_gmv_usd || 0),
        monthGmvUsd: Number(args.month_gmv_usd || 0),
        monthOrdersCount: Number(args.month_orders_count || 0),
        avgOrderValueUsd: Number(args.avg_order_value_usd || 0),
        grossMarginPct: Number(args.gross_margin_pct || 0),
        returnRatePct: Number(args.return_rate_pct || 0),
        platformDistribution: (args.platform_distribution as any) || [],
        topSkus: (args.top_skus as any) || [],
        inventoryAlerts: (args.inventory_alerts as any) || [],
        dataSource: "webhook_push",
      });
      return rpc(
        body.id,
        toolResult({
          success: true,
          message: "易仓经营数据已成功同步并写入 MGOO 全域工作台！",
          syncedAt: updated.lastSyncAt,
          data: updated,
        }),
      );
    }

    // 3. Night Watchdog Report
    if (name === "get_night_watchdog_report") {
      const report = generateMorningReport([]);
      return rpc(body.id, toolResult({ config: DEFAULT_WATCHDOG_CONFIG, report }));
    }

    // 4. Send or Stage WhatsApp Marketing Message
    if (name === "send_whatsapp_message") {
      const chatUserId = String(args.chat_user_id || "");
      const message = String(args.message || "");
      const autoSend = Boolean(args.auto_send);

      if (autoSend) {
        try {
          await sendReply({
            channel: 7, // WhatsApp
            chatUserId,
            chatSessionId: "mcp-outreach",
            text: message,
          });
          return rpc(body.id, toolResult({ success: true, mode: "live_send", chat_user_id: chatUserId, message }));
        } catch (err) {
          return rpc(body.id, toolResult({ success: false, mode: "live_send_failed", error: String(err), chat_user_id: chatUserId, message }));
        }
      } else {
        const externalId = `mcp:${crypto.randomUUID()}`;
        if (database) {
          const now = Math.floor(Date.now() / 1000);
          await database
            .prepare(
              "INSERT INTO agent_jobs (external_id, chat_user_id, session_id, skill, status, mode, input, output, draft_reply, customer_stage, requires_human, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            )
            .bind(externalId, chatUserId, "mcp-session", "outreach-copilot", "staged", "mcp", "{}", "{}", message, "marketing_outreach", 1, now, now)
            .run();
        }
        return rpc(body.id, toolResult({ success: true, mode: "draft_staged", chat_user_id: chatUserId, message, external_id: externalId }));
      }
    }

    // 5. Sales Roleplay Turn
    if (name === "run_sales_roleplay") {
      const personaId = String(args.persona_id || "la-streetwear-founder");
      const repMessage = String(args.rep_message || "");
      const persona = BUYER_PERSONAS.find((p) => p.id === personaId) || BUYER_PERSONAS[0];
      const buyerReply = await runBuyerTurn(persona, [], repMessage);
      const evalResult = await evaluateRoleplaySession(persona, [{ role: "rep", content: repMessage }, { role: "buyer", content: buyerReply }]);
      return rpc(body.id, toolResult({ persona: persona.name, buyerReply, evaluation: evalResult }));
    }

    // 6. Operations Overview
    if (name === "get_operations_overview") {
      if (database) {
        const [messages, jobs] = await database.batch([
          database.prepare("SELECT COUNT(*) AS total FROM webhook_events"),
          database.prepare(
            "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) AS sent, SUM(CASE WHEN requires_human = 1 THEN 1 ELSE 0 END) AS human_review FROM agent_jobs"
          ),
        ]);
        return rpc(body.id, toolResult({ messages: messages.results[0] ?? { total: 0 }, automation: jobs.results[0] ?? { total: 0, sent: 0, human_review: 0 } }));
      }
      return rpc(body.id, toolResult({ messages: { total: 128 }, automation: { total: 42, sent: 35, human_review: 4 } }));
    }

    // 7. Search Customer Messages
    if (name === "search_customer_messages") {
      const query = String(args.query ?? "").trim();
      const limit = Math.max(1, Math.min(50, Number(args.limit ?? 20)));
      if (database) {
        const result = await database
          .prepare("SELECT external_id, channel_name, chat_user_id, session_id, message_text, received_at FROM webhook_events WHERE message_text LIKE ? ORDER BY received_at DESC LIMIT ?")
          .bind(`%${query}%`, limit)
          .all();
        return rpc(body.id, toolResult({ query, items: result.results }));
      }
      return rpc(body.id, toolResult({ query, items: [{ message_text: "Inquiry about 400g heavyweight hoodie sample and MOQ", chat_user_id: "demo-user-1", channel_name: "WhatsApp" }] }));
    }

    // 8. Get Customer Brief
    if (name === "get_customer_brief") {
      const chatUserId = String(args.chat_user_id ?? "").trim();
      if (database) {
        const [messages, decisions] = await database.batch([
          database.prepare("SELECT channel_name, message_text, sender_type, received_at FROM webhook_events WHERE chat_user_id = ? ORDER BY received_at DESC LIMIT 20").bind(chatUserId),
          database.prepare("SELECT skill, status, draft_reply, customer_stage, requires_human, created_at FROM agent_jobs WHERE chat_user_id = ? ORDER BY created_at DESC LIMIT 10").bind(chatUserId),
        ]);
        return rpc(body.id, toolResult({ chat_user_id: chatUserId, messages: messages.results, decisions: decisions.results }));
      }
      return rpc(body.id, toolResult({ chat_user_id: chatUserId, messages: [{ message_text: "Can I do 50 pcs MOQ?", sender_type: "customer" }], decisions: [] }));
    }

    // 9. Stage Customer Reply
    if (name === "stage_customer_reply") {
      const text = String(args.text ?? "").trim();
      if (!text) return rpcError(body.id, -32602, "Reply text is required");
      const externalId = `mcp:${crypto.randomUUID()}`;
      if (database) {
        const now = Math.floor(Date.now() / 1000);
        await database
          .prepare(
            "INSERT INTO agent_jobs (external_id, chat_user_id, session_id, skill, status, mode, input, output, draft_reply, customer_stage, requires_human, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(externalId, String(args.chat_user_id), String(args.chat_session_id), "codex-manual-draft", "human-review", "mcp", "{}", "{}", text, String(args.stage ?? "follow_up"), 1, now, now)
          .run();
      }
      return rpc(body.id, toolResult({ staged: true, sent: false, external_id: externalId }));
    }

    return rpcError(body.id, -32602, `Unknown tool: ${name}`, 404);
  } catch (error) {
    return rpcError(body.id, -32000, error instanceof Error ? error.message : "Tool execution failed", 500);
  }
}
