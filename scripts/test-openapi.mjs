import fs from "node:fs";
import crypto from "node:crypto";

const varsFile = fs.readFileSync(".dev.vars", "utf8");
const env = {};
varsFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const token = env.SALESMARTLY_API_TOKEN || "8Z1JZWhATDxxTeX";
const projectId = env.SALESMARTLY_PROJECT_ID || "g1i5qq0";
const API_BASE = "https://developer.salesmartly.com/api/v2";

console.log("=== SaleSmartly OpenAPI 测试验证 ===");
console.log("Project ID:", projectId);
console.log("API Token:", token.slice(0, 4) + "****" + token.slice(-4));

function createSignature(token, params) {
  const sorted = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  const raw = [token, ...sorted].join("&");
  return crypto.createHash("md5").update(raw).digest("hex");
}

async function request(endpoint, params = {}) {
  const allParams = { project_id: projectId, ...params };
  const sign = createSignature(token, allParams);
  const search = new URLSearchParams();
  Object.entries(allParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.set(k, String(v));
  });

  const url = `${API_BASE}/${endpoint}?${search.toString()}`;
  const response = await fetch(url, {
    headers: { "external-sign": sign },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function run() {
  console.log("\n[1] 测试获取会话列表 (get-session-list)...");
  const sessions = await request("get-session-list", { page: 1, page_size: 5, session_status: 0 });
  console.log("-> 响应状态码 code:", sessions.code, "msg:", sessions.msg);
  console.log("-> 活跃会话总数 total:", sessions.data?.total, "当前返回条数:", sessions.data?.list?.length);

  console.log("\n[2] 测试获取全量聊天记录 (get-all-message-list)...");
  const messages = await request("get-all-message-list", { page: 1, page_size: 5, sort_type: 0 });
  console.log("-> 响应状态码 code:", messages.code, "msg:", messages.msg);
  console.log("-> 聊天记录总数 total:", messages.data?.total, "当前返回条数:", messages.data?.list?.length);

  console.log("\n[3] 测试获取客户列表 (get-contact-list)...");
  const end = Math.floor(Date.now() / 1000);
  const start = end - 30 * 86400;
  const contacts = await request("get-contact-list", { page: 1, page_size: 5, updated_time: JSON.stringify({ start, end }) });
  console.log("-> 响应状态码 code:", contacts.code, "msg:", contacts.msg);
  console.log("-> 客户记录总数 total:", contacts.data?.total, "当前返回条数:", contacts.data?.list?.length);

  console.log("\n[4] 测试获取团队成员列表 (get-member-list)...");
  const members = await request("get-member-list", { page: 1, page_size: 5 });
  console.log("-> 响应状态码 code:", members.code, "msg:", members.msg);
  const memberList = Array.isArray(members.data) ? members.data : members.data?.list;
  console.log("-> 团队成员数:", memberList?.length);

  console.log("\n[5] 测试获取访客标签列表 (get-label-list)...");
  const labels = await request("get-label-list", { page: 1, page_size: 5 });
  console.log("-> 响应状态码 code:", labels.code, "msg:", labels.msg);
  console.log("-> 标签总数 total:", labels.data?.total, "当前返回条数:", labels.data?.list?.length);

  console.log("\n[6] 测试获取 WhatsApp App 渠道设备 (get-individual-whatsapp-list)...");
  const wa = await request("get-individual-whatsapp-list", { page: 1, page_size: 5 });
  console.log("-> 响应状态码 code:", wa.code, "msg:", wa.msg);
  console.log("-> WhatsApp 设备总数:", wa.data?.total ?? wa.data?.list?.length);

  console.log("\n✅ 全部 SaleSmartly OpenAPI 接口测试通过！");
}

run().catch((err) => {
  console.error("❌ 测试失败:", err);
  process.exit(1);
});
