import fs from "node:fs";
import path from "node:path";
import { runtimeEnv, setRuntimeEnvOverrides } from "./salesmartly";

export function maskSecret(secret?: string, visibleChars = 4): string {
  if (!secret) return "";
  if (secret.length <= visibleChars * 2) {
    return "••••••••";
  }
  const prefix = secret.slice(0, visibleChars);
  const suffix = secret.slice(-visibleChars);
  return `${prefix}••••••••${suffix}`;
}

export interface SystemApiSettings {
  aiProvider: "deepseek" | "openai" | "custom";
  deepSeekApiKey: string;
  deepSeekApiKeyMasked: string;
  deepSeekModel: string;
  openAiApiKey: string;
  openAiApiKeyMasked: string;
  openAiModel: string;
  aiBaseUrl: string;

  saleSmartlyProjectId: string;
  saleSmartlyApiToken: string;
  saleSmartlyApiTokenMasked: string;
  saleSmartlyWebhookSecret: string;
  saleSmartlyWebhookSecretMasked: string;
  saleSmartlyReplyMode: "draft" | "live";

  eccangServiceUrl: string;
  eccangAppKey: string;
  eccangAppKeyMasked: string;
  eccangAppSecret: string;
  eccangAppSecretMasked: string;
  eccangUserToken: string;
  eccangUserTokenMasked: string;

  status: {
    hasAiKey: boolean;
    activeAiProvider: string;
    hasSaleSmartly: boolean;
    hasEccang: boolean;
  };
}

export function getSystemApiSettings(): SystemApiSettings {
  const env = runtimeEnv();

  const deepSeekKey = env.DEEPSEEK_API_KEY || "";
  const openAiKey = env.OPENAI_API_KEY || "";
  const aiProvider = (env.AI_PROVIDER as "deepseek" | "openai" | "custom") || (deepSeekKey ? "deepseek" : openAiKey ? "openai" : "deepseek");
  const deepSeekModel = env.DEEPSEEK_MODEL || "deepseek-chat";
  const openAiModel = env.OPENAI_AGENT_MODEL || env.OPENAI_MODEL || "gpt-4o-mini";
  const aiBaseUrl = env.AI_BASE_URL || (aiProvider === "deepseek" ? "https://api.deepseek.com" : "https://api.openai.com/v1");

  const saleSmartlyProjectId = env.SALESMARTLY_PROJECT_ID || "";
  const saleSmartlyApiToken = env.SALESMARTLY_API_TOKEN || "";
  const saleSmartlyWebhookSecret = env.SALESMARTLY_WEBHOOK_SECRET || "";
  const saleSmartlyReplyMode = (env.SALESMARTLY_REPLY_MODE === "live" ? "live" : "draft") as "draft" | "live";

  const eccangServiceUrl = env.ECCANG_SERVICE_URL || "https://open.eccang.com/api";
  const eccangAppKey = env.ECCANG_APP_KEY || "";
  const eccangAppSecret = env.ECCANG_APP_SECRET || "";
  const eccangUserToken = env.ECCANG_USER_TOKEN || "";

  return {
    aiProvider,
    deepSeekApiKey: deepSeekKey,
    deepSeekApiKeyMasked: maskSecret(deepSeekKey),
    deepSeekModel,
    openAiApiKey: openAiKey,
    openAiApiKeyMasked: maskSecret(openAiKey),
    openAiModel,
    aiBaseUrl,

    saleSmartlyProjectId,
    saleSmartlyApiToken,
    saleSmartlyApiTokenMasked: maskSecret(saleSmartlyApiToken),
    saleSmartlyWebhookSecret,
    saleSmartlyWebhookSecretMasked: maskSecret(saleSmartlyWebhookSecret),
    saleSmartlyReplyMode,

    eccangServiceUrl,
    eccangAppKey,
    eccangAppKeyMasked: maskSecret(eccangAppKey),
    eccangAppSecret,
    eccangAppSecretMasked: maskSecret(eccangAppSecret),
    eccangUserToken,
    eccangUserTokenMasked: maskSecret(eccangUserToken),

    status: {
      hasAiKey: Boolean(deepSeekKey || openAiKey),
      activeAiProvider: deepSeekKey ? "DeepSeek" : openAiKey ? "OpenAI" : "内置外贸大模型",
      hasSaleSmartly: Boolean(saleSmartlyProjectId && saleSmartlyApiToken),
      hasEccang: Boolean(eccangAppKey && eccangAppSecret),
    },
  };
}

/**
 * Persists user API key settings to in-memory runtime and `.dev.vars` file on disk.
 */
export function saveSystemApiSettings(newValues: Record<string, string>): { success: boolean; message: string } {
  // 1. Update in-memory overrides for immediate hot reload without restart
  setRuntimeEnvOverrides(newValues);

  // 2. Persist to .dev.vars on disk if possible
  try {
    const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
    let content = "";
    if (fs.existsSync(devVarsPath)) {
      content = fs.readFileSync(devVarsPath, "utf-8");
    } else {
      const examplePath = path.resolve(process.cwd(), ".env.example");
      if (fs.existsSync(examplePath)) {
        content = fs.readFileSync(examplePath, "utf-8");
      }
    }

    // Update each key in content
    for (const [key, val] of Object.entries(newValues)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${val}`);
      } else {
        content += `\n${key}=${val}`;
      }
    }

    fs.writeFileSync(devVarsPath, content.trim() + "\n", "utf-8");
    return { success: true, message: "配置已成功保存并在全系统实时生效！" };
  } catch (err) {
    console.warn("Could not write to .dev.vars on disk:", err);
    return { success: true, message: "内存配置已热更新生效 (磁盘写入略过)" };
  }
}

/**
 * Tests live connectivity of an AI model API Key
 */
export async function testAiApiConnectivity(
  provider: "deepseek" | "openai" | "custom",
  apiKey: string,
  model?: string,
  baseUrl?: string,
): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  if (!apiKey || apiKey.includes("••••")) {
    return { ok: false, latencyMs: 0, message: "请输入完整的真实 API Key 进行测试" };
  }

  const endpoint =
    (baseUrl?.trim() || (provider === "deepseek" ? "https://api.deepseek.com" : "https://api.openai.com/v1")) +
    "/chat/completions";
  const targetModel = model?.trim() || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 3,
      }),
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;

    if (res.ok) {
      return {
        ok: true,
        latencyMs,
        message: `🟢 连通成功！${provider === "deepseek" ? "DeepSeek" : "OpenAI"} API 验证通过，响应时延 ${latencyMs}ms`,
      };
    } else {
      const errorText = await res.text();
      return {
        ok: false,
        latencyMs,
        message: `🔴 认证失败 (HTTP ${res.status}): ${errorText.slice(0, 120)}`,
      };
    }
  } catch (err) {
    const latencyMs = Date.now() - start;
    return {
      ok: false,
      latencyMs,
      message: `🔴 网络请求失败: ${err instanceof Error ? err.message : "连接超时或无法访问 API 地址"}`,
    };
  }
}
