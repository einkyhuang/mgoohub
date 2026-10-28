import { env } from "cloudflare:workers";
import { agentPluginBase64 } from "@/lib/generated/agent-plugin";

export type AgentInput = {
  message: string;
  channel: number;
  channelName?: string;
  chatUserId?: string;
  chatSessionId?: string;
};

export type AgentDecision = {
  skill: string;
  reply: string;
  stage: "new" | "qualified" | "quote" | "follow_up" | "won" | "risk";
  priority: "low" | "normal" | "high" | "urgent";
  confidence: number;
  requires_human: boolean;
  reason: string;
  next_actions: string[];
  mode: "openai" | "codex" | "simulation" | "fallback";
  provider?: "openai-chat" | "deepseek-chat" | "codex-gateway" | "openai-agents" | "local-rules";
  agent_session_id?: string;
};


const MGOO_COMPANY_KNOWLEDGE = `
COMPANY PROFILE:
- Name: MGOO Fashion (Official Website: https://www.mgoofashion.com)
- Identity: Premier apparel manufacturer and export partner with 16+ years of clothing manufacturing experience.
- Social Proof: 1M+ followers on social media, automated production lines, serving emerging and scaling streetwear & activewear brands globally.
- Shipping Terms: Supports DDP (Door to Door, tax & customs duties included) worldwide for seamless delivery.
- Core Mission: Help brand owners launch and scale with low risk, fast turnaround, high margin, and reliable quality.

CORE PRODUCT LINES:
1. Streetwear Collection:
   - T-shirts, heavy polos, shorts, hats, heavyweight hoodies, streetwear sweatpants.
   - Key Specs: 230g-250g combed cotton T-shirts, 350gsm-400gsm heavyweight fleece hoodies & pants (80% cotton / 20% polyester or 100% cotton), acid wash / vintage wash, oversized trendy streetwear cuts.
2. Activewear & Yoga Wear:
   - Yoga pants, flare pants, pocket leggings, sports bras, biker shorts, plus-size activewear (up to 4XL).
   - Key Specs: Buttery soft high-stretch fabrics (75/25 or 80/20 nylon/spandex, 79/21 nylon/spandex), moisture-wicking, four-way stretch.
3. Custom Packaging & Branding:
   - Custom woven labels, hangtags, frosted zip bags, printed poly mailers, custom embroidery, screen printing, puff print, DTG, silicone heat transfer.

TWO BUSINESS MODES / ROUTES:
- Route A: Ready Blanks + Custom Logo (Quick-start & Low Risk):
  * Best for emerging brands testing the market.
  * Low MOQ: Starting from 30-50 pcs per style (supports mixing sizes and colors).
  * Fast turnaround, proven best-selling fits.
- Route B: Full Custom Production (Cut & Sew):
  * For brands with original tech packs, unique designs, custom fabric weights/dyes.
  * Professional sample development available first.

COMMUNICATION & CONVERSION SOP (WHATSAPP SPECIFIC):
1. When asked about catalogs:
   - Welcome warmly as MGOO Fashion (https://www.mgoofashion.com).
   - Clarify category (Activewear/Yoga vs. Streetwear/T-shirts/Hoodies) and route (ready blanks with custom logo vs. full custom development).
   - Politely ask for their Instagram or website so we can recommend the best-selling styles tailored to their brand aesthetic.
2. When asked about MOQ:
   - Explain our flexible low MOQ starting from 30-50 pcs for ready blanks with custom branding, making it safe to test the market.
   - For full custom tech packs, explain that it depends on the design complexity and ask for their target order quantity.
3. When asked about samples:
   - Confirm sample development is supported. Ask for their destination city/zip code (for shipping estimate), target specs/techpack, and expected bulk order size.
4. When asked about pricing:
   - Do not throw out a random blind price without knowing specs. Ask for category, planned quantity, and logo technique so our specialist can calculate the most accurate, competitive bulk tier price.
5. Payment rhythm:
   - Standard house pattern: 40% deposit to commence production, balance after final bulk photos/inspection approval before dispatch.
`;

const SYSTEM_PROMPT = `You are the lead international sales consultant representing MGOO Fashion (https://www.mgoofashion.com) on WhatsApp and omnichannel channels.

${MGOO_COMPANY_KNOWLEDGE}

CORE COMMUNICATION RULES:
1. Natural & Tailored:
   - Answer the customer's specific question directly.
   - Sound like a seasoned, warm, confident, and trustworthy sales partner, NEVER an AI robot or template.
   - Reply in the EXACT SAME LANGUAGE the customer used (e.g. English, Spanish, Arabic, Portuguese, French, German, Chinese, etc.).
2. Funnel Advancement:
   - Keep momentum moving: ask 1-2 sharp, relevant questions to qualify the customer (e.g. quantity, category, destination city, brand IG/website).
3. Risk & Escalation:
   - If the customer raises a dispute, payment issue, refund request, serious defect, anger/complaint, or legal/safety concern, set requires_human: true so human staff handles it, and reply with an empathetic, de-escalating acknowledgement.

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "skill": "salesmartly-product-advisor" | "salesmartly-lead-qualification" | "salesmartly-followup-planner" | "salesmartly-risk-escalation",
  "reply": "string (the natural, ready-to-send reply message)",
  "stage": "new" | "qualified" | "quote" | "follow_up" | "won" | "risk",
  "priority": "low" | "normal" | "high" | "urgent",
  "confidence": 0.0 to 1.0,
  "requires_human": boolean (true if risk/refund/dispute or uncertain, false if normal product/business inquiry),
  "reason": "short explanation of the decision",
  "next_actions": ["action1", "action2"]
}`;

const ROUTER_INSTRUCTIONS = SYSTEM_PROMPT;


const riskPattern = /refund|chargeback|fraud|scam|lawyer|legal|unsafe|injur|broken|angry|complaint|退款|投诉|欺诈|律师|受伤|安全|赔偿|disputa|reembolso/i;
const followUpPattern = /follow.?up|checking in|remind|confirm|update|next step|跟进|确认一下|进度|再次联系|rappel|seguimiento/i;
const leadPattern = /distributor|wholesale|private label|partnership|agent|reseller|bulk|批发|经销|代理|合作|贴牌|卸売|distribuidor/i;

function localDecision(input: AgentInput): AgentDecision {
  const message = input.message.trim();
  const preferEnglish = !/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/u.test(message);
  if (riskPattern.test(message)) {
    return {
      skill: "salesmartly-risk-escalation",
      reply: preferEnglish ? "Thank you for reaching out. We take this very seriously and have prioritized your request for human review. Please share the order reference and a brief description so we can assist immediately." : "感谢您告诉我们这个情况。我们已将问题标记为优先人工处理。请提供订单编号与问题简述，我们会尽快为您处理。",
      stage: "risk",
      priority: "urgent",
      confidence: 0.9,
      requires_human: true,
      reason: "消息包含投诉、退款或其他高影响风险信号。",
      next_actions: ["分配给人工负责人", "核对订单与售后政策"],
      mode: "simulation",
    };
  }
  if (followUpPattern.test(message)) {
    return {
      skill: "salesmartly-followup-planner",
      reply: preferEnglish ? "Thank you for following up! Could you please share the relevant product or order reference so I can immediately check the exact progress for you?" : "感谢您的跟进！请问方便提供一下相关的产品型号或订单编号吗？我立刻帮您查询最新进度。",
      stage: "follow_up",
      priority: "normal",
      confidence: 0.76,
      requires_human: true,
      reason: "识别为已有机会的跟进消息，需要结合历史会话确认事实。",
      next_actions: ["调取历史会话", "确认负责人和下一步"],
      mode: "simulation",
    };
  }
  if (leadPattern.test(message)) {
    return {
      skill: "salesmartly-lead-qualification",
      reply: preferEnglish ? "Thank you for your partnership inquiry! We would love to collaborate. To provide the most tailored information, could you share the target products, estimated initial quantity, and your destination market?" : "感谢您的合作咨询！我们非常期待与您合作。为了提供最匹配的方案，能否请您告知目标产品、预计首单数量以及主要销售市场？",
      stage: "new",
      priority: "high",
      confidence: 0.84,
      requires_human: false,
      reason: "识别为批发、经销或合作线索。",
      next_actions: ["收集采购规模与市场", "满足条件后进入报价阶段"],
      mode: "simulation",
    };
  }
  return {
    skill: "salesmartly-product-advisor",
    reply: preferEnglish ? "Thank you for contacting us! I'd be delighted to assist you with our products. Could you let me know which specific model or specification you are interested in, and approximately what quantity you have in mind?" : "您好！很高兴为您服务。请问您对哪款产品或型号感兴趣？预计需要多少数量呢？我们会为您提供最优惠的方案。",
    stage: "quote",
    priority: "normal",
    confidence: 0.72,
    requires_human: false,
    reason: "识别为常规产品或采购信息咨询。",
    next_actions: ["补齐产品、数量、目的地与时间", "准备准确报价"],
    mode: "simulation",
  };
}

function parseDecision(text: string, sessionId?: string): AgentDecision {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<AgentDecision>;
  if (!parsed.skill || !parsed.reply) throw new Error("Agent returned an incomplete decision");
  return {
    skill: parsed.skill,
    reply: parsed.reply,
    stage: parsed.stage ?? "new",
    priority: parsed.priority ?? "normal",
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0))),
    requires_human: parsed.requires_human !== false,
    reason: parsed.reason ?? "AI generated tailored response.",
    next_actions: Array.isArray(parsed.next_actions) ? parsed.next_actions.map(String).slice(0, 5) : [],
    mode: "openai",
    agent_session_id: sessionId,
  };
}

function runtimeEnv(): Record<string, string | undefined> {
  const nodeEnv = typeof process !== "undefined" && process.env ? process.env : {};
  const cfEnv = typeof env !== "undefined" && env ? (env as Record<string, string | undefined>) : {};
  return { ...nodeEnv, ...cfEnv };
}

async function runAiChat(input: AgentInput): Promise<AgentDecision | null> {
  const values = runtimeEnv();

  // 1. Determine provider & key (DeepSeek or OpenAI)
  const isDeepSeek = Boolean(values.DEEPSEEK_API_KEY);
  const apiKey = values.DEEPSEEK_API_KEY || values.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (
    isDeepSeek
      ? "https://api.deepseek.com"
      : values.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const model = isDeepSeek
    ? values.DEEPSEEK_MODEL || "deepseek-chat"
    : values.OPENAI_MODEL || values.OPENAI_AGENT_MODEL || "gpt-4o-mini";

  const knowledge = values.BUSINESS_KNOWLEDGE ? `\n\nBUSINESS KNOWLEDGE BASE & PRODUCTS:\n${values.BUSINESS_KNOWLEDGE}` : "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}${knowledge}` },
          { role: "user", content: `Customer Inbound Message on Channel ${input.channelName || input.channel}:\n"${input.message}"` },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`${isDeepSeek ? "DeepSeek" : "OpenAI"} HTTP ${response.status}: ${errText}`);
    }

    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI provider returned empty message");
    const decision = parseDecision(content);
    return { ...decision, mode: "openai", provider: isDeepSeek ? "deepseek-chat" : "openai-chat" };
  } catch (error) {
    console.error("AI Chat error:", error);
    return null;
  }
}

async function runCodexGateway(input: AgentInput): Promise<AgentDecision | null> {
  const values = env as Cloudflare.Env;
  const baseUrl = values.CODEX_GATEWAY_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  const model = (values as Record<string, string | undefined>).CODEX_MODEL || "gpt-4o-mini";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(values.CODEX_GATEWAY_TOKEN ? { authorization: `Bearer ${values.CODEX_GATEWAY_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: ROUTER_INSTRUCTIONS },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`Codex gateway HTTP ${response.status}`);

    const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Codex gateway returned no content");
    const decision = parseDecision(content);
    return { ...decision, mode: "codex", provider: "codex-gateway" };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function runProfessionalAgent(input: AgentInput): Promise<AgentDecision> {
  // 1. Try standard OpenAI / DeepSeek Chat Completions if configured
  const aiDecision = await runAiChat(input);
  if (aiDecision) return aiDecision;

  // 2. Try Codex Gateway if configured
  const gateway = await runCodexGateway(input);
  if (gateway) return gateway;

  // 3. Fallback to smart local rules
  return { ...localDecision(input), provider: "local-rules" };
}


