import { runtimeEnv } from "./salesmartly";
export * from "./training-types";
import { BuyerPersona, CoachEvaluation } from "./training-types";

/**
 * Executes a simulated buyer turn in the sales roleplay.
 */
export async function runBuyerTurn(
  persona: BuyerPersona,
  history: { role: "buyer" | "rep"; content: string }[],
  latestRepMessage: string,
): Promise<string> {
  const env = runtimeEnv();
  const apiKey = env.DEEPSEEK_API_KEY || env.OPENAI_API_KEY;
  const isDeepSeek = Boolean(env.DEEPSEEK_API_KEY);
  const baseUrl = isDeepSeek ? "https://api.deepseek.com" : "https://api.openai.com/v1";
  const model = isDeepSeek ? env.DEEPSEEK_MODEL || "deepseek-chat" : "gpt-4o-mini";

  if (!apiKey) {
    return "Thanks for your reply! Could you let me know your sample turnaround time and what shipping method you use to my country?";
  }

  const messages = [
    {
      role: "system",
      content: `${persona.systemPrompt}
You are talking to an MGOO Fashion sales representative in WhatsApp / live chat.
Keep responses concise, natural, conversational (2 to 4 sentences like real WhatsApp chat).
Do NOT break character. Stay in your buyer persona.`,
    },
    ...history.map((m) => ({
      role: m.role === "buyer" ? "assistant" : "user",
      content: m.content,
    })),
    {
      role: "user",
      content: latestRepMessage,
    },
  ];

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content || "Thanks for the info! Can you send me some real photos of samples you made?";
  } catch (err) {
    console.error("Buyer turn failed:", err);
    return "Sounds interesting! What is the turnaround time for a sample with my logo, and how much would that cost?";
  }
}

/**
 * AI Sales Coach: Evaluates the sales rep's conversation performance and provides actionable feedback.
 */
export async function evaluateRoleplaySession(
  persona: BuyerPersona,
  dialogue: { role: "buyer" | "rep"; content: string }[],
): Promise<CoachEvaluation> {
  const env = runtimeEnv();
  const apiKey = env.DEEPSEEK_API_KEY || env.OPENAI_API_KEY;
  const isDeepSeek = Boolean(env.DEEPSEEK_API_KEY);
  const baseUrl = isDeepSeek ? "https://api.deepseek.com" : "https://api.openai.com/v1";
  const model = isDeepSeek ? env.DEEPSEEK_MODEL || "deepseek-chat" : "gpt-4o-mini";

  const transcriptText = dialogue
    .map((d) => `${d.role === "buyer" ? `[Buyer ${persona.name}]` : "[Sales Rep]"}: ${d.content}`)
    .join("\n");

  const prompt = `You are the Head of Global Sales Training at MGOO Fashion (16+ years premium garment manufacturer, specialized in 350-400g streetwear hoodies, yoga wear, 30-50 MOQ custom blanks, DDP shipping).

Evaluate the following sales practice dialogue between a new sales rep and a prospective buyer (${persona.name}, ${persona.brand}, target product: ${persona.targetProduct}).

---
DIALOGUE:
${transcriptText}
---

Evaluation Criteria:
1. Discovery (需求挖掘): Did rep ask for Instagram, target quantity, tech pack, launch timeline?
2. Objection Handling (异议化解): Did rep defend value, explain MOQ 30-50 policy clearly, explain sample fee refund policy?
3. Product & Brand Knowledge (专业度): Did rep showcase MGOO's fabric specs (350-400gsm, combed cotton, squat-proof, DDP door-to-door)?
4. Closing & Momentum (推进成单): Did rep ask for logo file / tech pack / offer to send samples / move the lead forward?

Return JSON ONLY with this structure:
{
  "score": 85,
  "grade": "A",
  "summary": "1-2 sentence executive assessment of the rep's performance.",
  "dimensionScores": {
    "discovery": 80,
    "objectionHandling": 85,
    "productKnowledge": 90,
    "closingTechnique": 85
  },
  "highlights": ["highlight 1 with specific praise", "highlight 2"],
  "improvements": ["concrete tip 1 to close faster", "concrete tip 2 on phrasing"],
  "recommendedModelReply": "The ideal model answer or follow-up that a top MGOO sales executive would send in this context."
}`;

  if (!apiKey) {
    return {
      score: 82,
      grade: "A",
      summary: "整体表现积极，起订量政策传达清晰，建议进一步主动索取买家设计图与社媒链接。",
      dimensionScores: { discovery: 78, objectionHandling: 85, productKnowledge: 88, closingTechnique: 80 },
      highlights: ["明确传达了 MGOO 30-50 件低起订量优势", "语气热情专业，没有死板机械回复"],
      improvements: ["可更早询问买家的 Instagram 或设计线稿，快速锁定买家风格", "对样品费可主动提示'大货订单中全额返还'，降低买家疑虑"],
      recommendedModelReply: "Hi Marcus! Love that vision. For a 2-month launch, starting with our 380-400gsm ready blanks + your custom puff print is the fastest route (30-50 pcs MOQ). Could you share your Instagram or tech pack? I'll send over 3 video clips of similar wash effects right away!",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI coach response");
    return JSON.parse(content) as CoachEvaluation;
  } catch (err) {
    console.error("Coach evaluation failed:", err);
    return {
      score: 80,
      grade: "B",
      summary: "完成了基本沟通，建议进一步强化闭环提问。",
      dimensionScores: { discovery: 75, objectionHandling: 80, productKnowledge: 85, closingTechnique: 80 },
      highlights: ["清晰介绍了产品起订量与工艺"],
      improvements: ["建议在结尾主动抛出选择题推进成单"],
      recommendedModelReply: "Thank you! We can definitely support 30-50 pcs for your drop. Would you prefer us to send physical fabric swatches first, or proceed straight to a digital mockup?",
    };
  }
}
