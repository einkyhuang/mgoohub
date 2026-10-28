import { createHash } from "node:crypto";
import { env } from "cloudflare:workers";

export const SALESMARTLY_API_BASE = "https://developer.salesmartly.com/api/v2";

type RuntimeEnv = Cloudflare.Env;

export type ConnectionState = {
  configured: boolean;
  projectId: string | null;
  replyMode: "draft" | "live";
  missing: string[];
};

export interface SaleSmartlyConfig {
  projectId?: string;
  apiToken?: string;
  webhookSecret?: string;
  webhookToken?: string;
  apiBase?: string;
}

// In-memory overrides updated dynamically from Web Settings UI
const inMemoryEnvOverrides: Record<string, string> = {};

export function setRuntimeEnvOverrides(overrides: Record<string, string>): void {
  for (const [k, v] of Object.entries(overrides)) {
    inMemoryEnvOverrides[k] = v;
    if (typeof process !== "undefined" && process.env) {
      process.env[k] = v;
    }
  }
}

/**
 * Safely resolves environment variables across Cloudflare Workers and Node/Next.js runtimes.
 */
export function runtimeEnv(): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  // 1. Process environment (Node / Next.js)
  if (typeof process !== "undefined" && process.env) {
    Object.assign(result, process.env);
  }

  // 2. Cloudflare worker environment
  try {
    if (typeof env !== "undefined" && env && typeof env === "object") {
      Object.assign(result, env as unknown as Record<string, string | undefined>);
    }
  } catch {
    // env not available in pure node context
  }

  // 3. Dynamic UI settings overrides take highest priority
  Object.assign(result, inMemoryEnvOverrides);

  return result;
}

export function getConnectionState(explicitConfig?: SaleSmartlyConfig): ConnectionState {
  const envVars = runtimeEnv();
  const projectId = explicitConfig?.projectId || envVars.SALESMARTLY_PROJECT_ID;
  const apiToken = explicitConfig?.apiToken || envVars.SALESMARTLY_API_TOKEN;
  const webhookSecret = explicitConfig?.webhookSecret || envVars.SALESMARTLY_WEBHOOK_SECRET;
  const replyMode = envVars.SALESMARTLY_REPLY_MODE === "live" ? "live" : "draft";

  const missing: string[] = [];
  if (!projectId) missing.push("SALESMARTLY_PROJECT_ID");
  if (!apiToken) missing.push("SALESMARTLY_API_TOKEN");
  if (!webhookSecret) missing.push("SALESMARTLY_WEBHOOK_SECRET");

  return {
    configured: missing.length === 0,
    projectId: projectId ?? null,
    replyMode,
    missing,
  };
}

/**
 * Creates the official external-sign MD5 signature required by SaleSmartly OpenAPI.
 * Rule: token & sorted params (alphabetical A-Z, key=value joined by &).
 */
export function createApiSignature(
  token: string,
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const sorted = Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined && entry[1] !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);

  return createHash("md5").update([token, ...sorted].join("&")).digest("hex");
}

export function verifyWebhookSignature(
  secret: string,
  signature: string,
  event: string,
  data: unknown,
): boolean {
  if (!signature || !secret) return false;
  const dataStr = typeof data === "string" ? data : JSON.stringify(data ?? {});
  const expected = createHash("md5")
    .update(`${secret}&data=${dataStr}&event=${event}`)
    .digest("hex");
  return expected.toLowerCase() === signature.toLowerCase();
}

export interface ApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
  request_id?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  config?: SaleSmartlyConfig;
}

/**
 * Core generic request executor for SaleSmartly OpenAPI.
 */
export async function salesmartlyRequest<T>(
  path: string,
  queryParams: Record<string, any> = {},
  bodyData?: Record<string, unknown> | FormData,
  options: RequestOptions = {},
): Promise<T> {
  const envVars = runtimeEnv();
  const projectId = options.config?.projectId || envVars.SALESMARTLY_PROJECT_ID;
  const token = options.config?.apiToken || envVars.SALESMARTLY_API_TOKEN;
  const base = options.config?.apiBase || SALESMARTLY_API_BASE;

  if (!projectId || !token) {
    throw new Error("SaleSmartly connection is not configured (SALESMARTLY_PROJECT_ID or SALESMARTLY_API_TOKEN missing)");
  }

  const method = options.method || (bodyData ? "POST" : "GET");

  // Merge project_id into parameters
  const query = { project_id: projectId, ...queryParams };
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) search.set(key, String(value));
  });

  // Calculate signature
  // For GET requests, sign query params.
  // For POST requests, sign merged payload or query according to documentation.
  const signParams: Record<string, string | number | boolean | undefined | null> = { ...query };
  if (bodyData && !(bodyData instanceof FormData)) {
    Object.entries(bodyData).forEach(([k, v]) => {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        signParams[k] = v;
      }
    });
  }

  const sign = createApiSignature(token, signParams);
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${base}/${cleanPath}${search.toString() ? `?${search.toString()}` : ""}`;

  const headers: Record<string, string> = {
    "external-sign": sign,
    ...options.headers,
  };

  let body: BodyInit | undefined;
  if (bodyData) {
    if (bodyData instanceof FormData) {
      body = bodyData;
    } else {
      headers["content-type"] = "application/json";
      body = JSON.stringify(bodyData);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`SaleSmartly HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (payload.code !== 0) {
    throw new Error(payload.msg || `SaleSmartly error code ${payload.code}`);
  }

  return payload.data;
}

/**
 * Legacy & convenient helper for GET requests
 */
export async function salesmartlyGet<T>(
  path: string,
  params: Record<string, any> = {},
  options?: RequestOptions,
): Promise<T> {
  return salesmartlyRequest<T>(path, params, undefined, { ...options, method: "GET" });
}

/**
 * Convenient helper for POST requests
 */
export async function salesmartlyPost<T>(
  path: string,
  bodyData?: Record<string, unknown>,
  queryParams: Record<string, string | number | boolean | undefined | null> = {},
  options?: RequestOptions,
): Promise<T> {
  return salesmartlyRequest<T>(path, queryParams, bodyData, { ...options, method: "POST" });
}

// -----------------------------------------------------------------------------
// High-Level OpenAPI Domain API Helpers
// -----------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SessionListParams extends PaginationParams {
  session_status?: 0 | 1; // 0: 活跃, 1: 已结束
  sub_status?: 0 | 1 | 2; // 0: 有客服接待, 1: 未分配, 2: 机器人接待
  sys_user_id?: number | string;
  start_time?: string; // JSON: {"start":123,"end":456}
  end_time?: string;
  channel?: number | string;
  channel_id?: string;
}

export interface ContactListParams extends PaginationParams {
  updated_time?: string; // JSON: {"start":1638288000,"end":1638892800}
  chat_user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  channel?: string | number;
  channel_id?: string;
  sys_user_id?: string | number;
  country?: string;
  city?: string;
  is_online?: 0 | 1;
  language?: string;
  labels?: string;
  user_type?: "individual" | "group";
}

export interface AllMessagesParams extends PaginationParams {
  sort_type?: 0 | 1;
  start_time?: string;
  end_time?: string;
  channel?: number | string;
  chat_user_id?: string;
}

export interface UserMessagesParams extends PaginationParams {
  chat_user_id: string;
}

export const SaleSmartlyOpenAPI = {
  /**
   * 获取会话列表
   */
  getSessions: (params: SessionListParams = {}, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; page: number; page_size: number; total: number }>(
      "get-session-list",
      params,
      { config },
    ),

  /**
   * 获取全量聊天记录
   */
  getAllMessages: (params: AllMessagesParams = {}, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; page: number; page_size: number; total: number }>(
      "get-all-message-list",
      params,
      { config },
    ),

  /**
   * 获取指定用户的聊天记录
   */
  getUserMessages: (params: UserMessagesParams, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; page: number; page_size: number; total: number }>(
      "get-message-list",
      params,
      { config },
    ),

  /**
   * 结束会话
   */
  endSession: (
    data: { session_id: string; chat_user_id: string },
    config?: SaleSmartlyConfig,
  ) =>
    salesmartlyPost<Record<string, unknown>>("end-session", data, {}, { config }),

  /**
   * 会话分配接口
   */
  assignSession: (
    data: { session_id: string; chat_user_id: string; sys_user_id: string | number },
    config?: SaleSmartlyConfig,
  ) =>
    salesmartlyPost<Record<string, unknown>>("assign-chat-user", data, {}, { config }),

  /**
   * 获取客户列表
   */
  getContacts: (params: ContactListParams = {}, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; page: number; page_size: number; total: number }>(
      "get-contact-list",
      params,
      { config },
    ),

  /**
   * 获取访客标签列表
   */
  getContactLabels: (params: PaginationParams & { label_name?: string } = {}, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; page: number; page_size: number; total: number }>(
      "get-label-list",
      params,
      { config },
    ),

  /**
   * 获取团队成员列表
   */
  getMembers: (params: PaginationParams = {}, config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; total?: number } | unknown[]>(
      "get-member-list",
      params,
      { config },
    ),

  /**
   * 获取 WhatsApp App 列表 (个人号/云控)
   */
  getWhatsAppApps: (config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[]; total?: number }>("get-individual-whatsapp-list", {}, { config }),

  /**
   * 获取 WhatsApp API 列表
   */
  getWhatsAppApis: (config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[] }>("get-whatsapp-api-list", {}, { config }),

  /**
   * 获取 LINE 官方账号列表
   */
  getLineAccounts: (config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[] }>("get-line-list", {}, { config }),

  /**
   * 获取 Messenger 列表
   */
  getMessengerAccounts: (config?: SaleSmartlyConfig) =>
    salesmartlyGet<{ list: unknown[] }>("get-messenger-list", {}, { config }),

  /**
   * 快速测试 API 连通性
   */
  testConnection: async (config?: SaleSmartlyConfig) => {
    try {
      const data = await salesmartlyGet<{ list: unknown[]; total: number }>(
        "get-session-list",
        { page: 1, page_size: 1, session_status: 0 },
        { config },
      );
      return { success: true, activeSessionsCount: data.total };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
};

const SEND_ENDPOINTS: Record<number, string> = {
  1: "messenger/send",
  2: "plugin/send",
  5: "instagram/send",
  6: "line/send",
  7: "whatsapp/send",
  12: "individual_whatsapp/send",
  14: "wecome/send",
  15: "telegram_app/send",
  24: "line_app/send",
};

export async function sendReply(input: {
  channel: number;
  chatUserId: string;
  chatSessionId: string;
  text: string;
}) {
  const envVars = runtimeEnv();
  const token = envVars.SALESMARTLY_WEBHOOK_TOKEN;
  const endpoint = SEND_ENDPOINTS[input.channel];
  if (!token || !endpoint) throw new Error("Outbound webhook token or supported channel is unavailable");

  const body = {
    data: {
      msg_type: 3,
      msg: { template1: { text: input.text } },
      chat_user_id: input.chatUserId,
      chat_session_id: input.chatSessionId,
      send_time: String(Date.now()),
      channel: input.channel,
    },
  };
  const response = await fetch(
    `https://webhook.salesmartly.com/${endpoint}?timestamp=${Date.now()}&signature=${encodeURIComponent(token)}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!response.ok) throw new Error(`SaleSmartly send HTTP ${response.status}`);
  return response.json();
}

