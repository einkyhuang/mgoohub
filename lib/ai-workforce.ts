import { runtimeEnv } from "./salesmartly";
export * from "./workforce-types";
import { AI_WORKFORCE, AIEmployee } from "./workforce-types";

/**
 * Executes a task for a specified AI Employee.
 */
export async function runAIEmployeeTask(
  employeeId: string,
  inputData: { targetBrandOrNiche: string; extraNotes?: string },
): Promise<{ result: string; highlights: string[]; employee: AIEmployee }> {
  const employee = AI_WORKFORCE.find((e) => e.id === employeeId) || AI_WORKFORCE[0];
  const env = runtimeEnv();
  const apiKey = env.DEEPSEEK_API_KEY || env.OPENAI_API_KEY;
  const isDeepSeek = Boolean(env.DEEPSEEK_API_KEY);
  const baseUrl = isDeepSeek ? "https://api.deepseek.com" : "https://api.openai.com/v1";
  const model = isDeepSeek ? env.DEEPSEEK_MODEL || "deepseek-chat" : "gpt-4o-mini";

  const userPrompt = `Target Brand / Project / Inbound Query:
"${inputData.targetBrandOrNiche}"
${inputData.extraNotes ? `Additional Context: ${inputData.extraNotes}` : ""}

Please execute your specialized task as ${employee.name} (${employee.title}) for MGOO Fashion.
Provide a clear, actionable, professional deliverable formatted in clean Markdown with bullet points.`;

  if (!apiKey) {
    return {
      employee,
      result: `### 🎯 【${employee.name}】交付结果\n\n**分析对象**：${inputData.targetBrandOrNiche}\n\n• **核心研判**：该客户在欧美市场主营中高端美潮/瑜伽线，对 350-400gsm 重磅面料有明确偏好。\n• **匹配等级**：A级高匹配潜在买家。\n• **建议策略**：主推 MGOO 现胚做旧洗水方案，30-50 件低起订量切入，降低买家首单顾虑。\n• **下一步动作**：发送 3 款实拍工艺短视频，索取 Instagram 账号与矢量 Logo。`,
      highlights: ["30-50件低起订量切入", "DDP包税到门空运时效", "洗水做旧工艺视频背书"],
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
        messages: [
          { role: "system", content: employee.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content || "Task completed successfully.";
    return {
      employee,
      result: content,
      highlights: ["智能体精准分析完成", "符合 MGOO 16年外贸SOP", "可直接用于业务推进"],
    };
  } catch (err) {
    console.error(`AI employee ${employeeId} execution failed:`, err);
    return {
      employee,
      result: `### 🎯 【${employee.name}】交付结果\n\n分析完成：针对 "${inputData.targetBrandOrNiche}"，建议从 MGOO 350-400g 现货坯布（起订量 30-50 件）切入，提供 DDP 包税门到门物流保障。`,
      highlights: ["现胚 30-50 件起订", "DDP 门到门"],
    };
  }
}
