"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  FileCode,
  Flame,
  Layers,
  MessageSquare,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GuideCenterView() {
  const [copiedId, setCopiedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"mcp" | "whatsapp" | "eccang" | "security">("mcp");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2200);
  };

  const mcpConfigJson = `{
  "mcpServers": {
    "mgoo-workbench": {
      "url": "http://localhost:5173/mcp",
      "headers": {
        "x-mcp-token": "mgoo-secure-local-token"
      }
    }
  }
}`;

  const skillPromptText = `# Role: MGOO 外贸出海全域智能营销操盘官 (MGOO Global Sourcing & Marketing Copilot)

## 1. 核心定位与背景
你是 MGOO 时尚服饰集团的首席外贸数字操盘官。MGOO 拥有 16 年专注中高端街头潮牌（380g-400gsm 重磅连帽卫衣、做旧洗水工艺、发泡印花）与高弹运动瑜伽服（裸感提臀、80/20 锦氨防透 Squat-Proof）的供应链沉淀。
你已经通过 MCP 协议连接了本地运行的「MGOO 全域外贸工作台 (mgoo-workbench)」。

## 2. 核心外贸杀手锏与策略原则
- 极低起订量破冰：海外初创品牌通常担心库存积压（MOQ 500+），必须主打「30-50 件低起订量现胚定制 + 极速出样」，打消买家首单风险。
- 2C 爆款数据降维打击 2B 买家：调用 get_eccang_overview 查看易仓 2C 爆款销量（如 TikTok Shop 月销 1,840 件 400g 卫衣），用真实海外买家实穿视频和断货数据向 2B 批发客户背书。
- 千人千面开发：严禁发送千篇一律的无意义群发开发信；必须调用 run_ai_employee（员工: deep-researcher 或 outreach-assistant）结合买家痛点输出定制内容。
- 安全营销闭环：日常外贸营销与 WhatsApp 追单优先调用 send_whatsapp_message（auto_send: false）生成草稿供业务员复核；夜间时段（19:00-09:00）或急单可执行全自动化。

## 3. 可用的 9 大 MCP 工具与标准调用规范
1. run_ai_employee: 调度 8 位 AI 数字员工 (market-intel, icp-scorer, deep-researcher, buying-signals, decision-hunter, outreach-assistant, night-closer, sales-coach)。
2. get_eccang_overview: 读取易仓 ERP 2C 销售中台（今日/月度 GMV、TikTok/Shopify/Amazon 分布、热销 SKU 与 2B/2C 联动建议）。
3. get_night_watchdog_report: 读取夜间 19:00-09:00 自动接管状态与《晨间销售交接清单》。
4. send_whatsapp_message: 发送或暂存 WhatsApp 营销消息（auto_send 设为 false 存为草稿，true 真实下发）。
5. run_sales_roleplay: 与真实买家（Marcus Vance / Chloe Evans / David Miller）对练并由教练点评打分。
6. get_operations_overview: 获取 SaleSmartly 全域运营指标。
7. search_customer_messages: 搜索历史 WhatsApp/Messenger 消息。
8. get_customer_brief: 读取特定买家的完整沟通履历与画像。
9. stage_customer_reply: 为买家生成待审核的安全回复草稿。

## 4. 常见指令与联动范式
- 当我说“背调这个品牌 [网址]，出开发信”：依次调用 run_ai_employee (deep-researcher) 和 run_ai_employee (outreach-assistant)，并用 send_whatsapp_message 存为草稿。
- 当我说“查看今天早上的夜间交接晨报”：调用 get_night_watchdog_report 梳理最紧急需跟进的欧美买家。
- 当我说“买家觉得价格贵怎么推销”：调用 get_eccang_overview 提取当前月销 Top1 爆款数据和 b2bSynergyTip 给予话术。`;

  const curlTestCommands = `# 1. 验证 MCP 工具列表获取
curl -s -X POST http://localhost:5173/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 2. 验证读取易仓 2C 销售数据
curl -s -X POST http://localhost:5173/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_eccang_overview","arguments":{}}}'

# 3. 验证调用 8 大 AI 员工 (如 ICP 客户筛选员)
curl -s -X POST http://localhost:5173/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"run_ai_employee","arguments":{"employee_id":"icp-scorer","target_brand_or_niche":"Kith 风格欧美初创街潮品牌，咨询 50 件卫衣"}}}'`;

  return (
    <div className="space-y-6">
      {/* Top Status & Live Indicator Banner */}
      <div className="rounded-3xl border border-sky-200/90 bg-sky-50/70 p-5 text-sky-950 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-200 text-sky-900 font-bold shadow-2xs">
              <Network className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-sky-950">MCP 标准服务已就绪</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  在线运行 (JSON-RPC 2.0)
                </span>
              </div>
              <p className="text-xs text-sky-800/80 mt-1">
                挂载端点：<code className="px-1.5 py-0.5 rounded-md bg-white/80 font-mono text-[11px] text-sky-900 font-semibold border border-sky-200">http://localhost:5173/mcp</code>
                ，已挂载 9 个生产级外贸工具（8位AI员工、易仓2C、夜间晨报、WhatsApp自动化）。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-900 bg-white/90 border border-sky-200 px-3 py-1.5 rounded-full shadow-2xs">
              协议版本: 2024-11-05
            </span>
          </div>
        </div>
      </div>

      {/* 3 Large One-Click Copy Cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Card 1: MCP Server JSON */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                  1
                </span>
                <h4 className="text-sm font-bold text-slate-900">Codex / WorkBuddy MCP 配置</h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">mcp_config.json</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              粘贴到客户端的 MCP Servers 配置项中，IDE 即可自动识别并挂载全部 9 个外贸工具。
            </p>
            <div className="mt-3 relative rounded-2xl bg-slate-950 p-3.5 font-mono text-[11px] leading-5 text-sky-200 overflow-x-auto">
              <pre>{mcpConfigJson}</pre>
            </div>
          </div>

          <Button
            onClick={() => handleCopy(mcpConfigJson, "mcp-json")}
            className="w-full h-9 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5"
          >
            {copiedId === "mcp-json" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">配置已复制到剪贴板！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>一键复制 MCP 配置</span>
              </>
            )}
          </Button>
        </div>

        {/* Card 2: Skill System Instructions */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-sky-100 text-sky-800 text-xs font-bold">
                  2
                </span>
                <h4 className="text-sm font-bold text-slate-900">外贸操盘官 Skill 提示词</h4>
              </div>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                System Instructions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              复制粘贴到 Codex / WorkBuddy 角色设定中，赋予 AI 16 年外贸面料知识库与自动调用能力。
            </p>
            <div className="mt-3 relative rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 font-mono text-[11px] leading-5 text-slate-700 max-h-36 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{skillPromptText}</pre>
            </div>
          </div>

          <Button
            onClick={() => handleCopy(skillPromptText, "skill-prompt")}
            className="w-full h-9 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5"
          >
            {copiedId === "skill-prompt" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">Skill 提示词已复制！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>一键复制 Skill 完整提示词</span>
              </>
            )}
          </Button>
        </div>

        {/* Card 3: Terminal cURL Test Commands */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                  3
                </span>
                <h4 className="text-sm font-bold text-slate-900">终端联通与测试指令</h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">cURL Commands</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              无需开启任何额外应用，直接在 macOS / Linux 终端粘贴运行，秒级检验接口响应。
            </p>
            <div className="mt-3 relative rounded-2xl bg-slate-950 p-3.5 font-mono text-[11px] leading-5 text-emerald-300 max-h-36 overflow-y-auto">
              <pre>{curlTestCommands}</pre>
            </div>
          </div>

          <Button
            onClick={() => handleCopy(curlTestCommands, "curl-test")}
            className="w-full h-9 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5"
          >
            {copiedId === "curl-test" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">测试指令已复制！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>一键复制 cURL 测试命令</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step-by-Step Practical Guides Tabs */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">四步实战对接与落地方案</h3>
            <p className="text-xs text-slate-500 mt-0.5">从本地工具挂载到 24 小时全自动营销闭环的操作指引</p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("mcp")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "mcp" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ① WorkBuddy挂载
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "whatsapp" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ② WhatsApp夜间接管
            </button>
            <button
              onClick={() => setActiveTab("eccang")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "eccang" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ③ 易仓 2C 促单
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === "security" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ④ 生产安全配置
            </button>
          </div>
        </div>

        {/* Tab 1: WorkBuddy / Codex Setup */}
        {activeTab === "mcp" && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 grid place-items-center rounded-full bg-slate-900 text-white text-[10px]">1</span>
                  添加 MCP 服务器
                </span>
                <p className="text-slate-500">
                  打开 WorkBuddy 或 Codex 设置，找到 MCP 配置页面，添加名称为 <code className="font-mono text-sky-800">mgoo-workbench</code>，URL 填写 <code className="font-mono text-sky-800">http://localhost:5173/mcp</code>。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 grid place-items-center rounded-full bg-slate-900 text-white text-[10px]">2</span>
                  填入系统提示词
                </span>
                <p className="text-slate-500">
                  复制上方的「外贸操盘官 Skill 完整提示词」，粘贴到您的智能体角色设定或 Custom Instructions 中，让 AI 熟知业务逻辑。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 grid place-items-center rounded-full bg-slate-900 text-white text-[10px]">3</span>
                  对话测试
                </span>
                <p className="text-slate-500">
                  在对话框中发送：“帮我背调洛杉矶街潮品牌 RAW DISCIPLINE”，AI 会自动调用 <code className="font-mono text-sky-800">run_ai_employee</code> 生成画像与开发信！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: WhatsApp Auto-reply */}
        {activeTab === "whatsapp" && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2">
              <h5 className="font-bold text-sky-950 text-sm">💡 WhatsApp 24 小时夜间自动接管与防流失机制</h5>
              <p className="text-sky-900/80">
                1. <strong>时段自动接管（19:00 - 次日 09:00）</strong>：海外客户因时差夜间在 WhatsApp 咨询时，SaleSmartly Webhook 触发工作台智能路由，AI 夜间助攻员以「30-50 件低起订量现胚做旧」切入，索取买家 Logo 与 Instagram 账号。<br />
                2. <strong>3 分钟超时兜底</strong>：白天人工服务时间，若业务员忙碌超过 3 分钟未应答，系统自动触发高情商挽留回复，防止买家跳出转向竞争对手。<br />
                3. <strong>早晨 9:00 销售交接清单</strong>：业务员上班后直接在工作台查看夜间高意向商机与建议跟进行动，无缝开单。
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: ECCANG 2C Synergy */}
        {activeTab === "eccang" && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h5 className="font-bold text-slate-900 text-sm">🔥 易仓 ERP 2C 数据中台对接（虚拟数据已清空，接口与 Skill 已预留）</h5>
              <p className="text-slate-600">
                系统现已清空演示用的虚拟销售数据，预留了标准化的数据接收端点与 MCP 工具，方便直接交给 <b>Codex</b> 或 <b>WorkBuddy</b> 编写自动化拉取脚本：<br />
                &bull; <strong>本地接收接口</strong>：<code className="font-mono text-sky-800">POST http://localhost:5173/api/eccang/analytics</code> 或 <code className="font-mono text-sky-800">POST /api/eccang/sync</code><br />
                &bull; <strong>MCP 工具</strong>：<code className="font-mono text-sky-800">get_eccang_overview</code>（读取）与 <code className="font-mono text-sky-800">sync_eccang_overview</code>（写入/更新）<br />
                &bull; <strong>2B/2C 业务协同价值</strong>：当海外初创品牌主理人在 WhatsApp 犹豫下单时，业务员通过调取 2C 真实爆款动销与现胚库存，用硬数据消除客户疑虑，促成 30-50 件首单定制！
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-2">
              <h5 className="font-bold text-sky-950 text-sm">🤖 一键把对接任务交给 AI 员工</h5>
              <p className="text-sky-900/80">
                您可以直接对 Codex 或 WorkBuddy 发送指令：<br />
                <em>“请帮我对接易仓 ERP 开放平台接口，将每日 2C 订单、GMV 和热销款式定时推送到 http://localhost:5173/api/eccang/analytics”</em>
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Security */}
        {activeTab === "security" && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h5 className="font-bold text-amber-950 text-sm">🔒 生产环境密钥与安全守则</h5>
              <p className="text-amber-900/80">
                1. <strong>密钥安全隔离</strong>：所有敏感凭据（<code className="font-mono">SALESMARTLY_API_TOKEN</code>、<code className="font-mono">DEEPSEEK_API_KEY</code>）均保存在根目录 <code className="font-mono">.dev.vars</code> 服务端环境变量中，严禁写入浏览器前端。<br />
                2. <strong>防封号与人工安全门</strong>：默认策略为「生成草稿，人工复核」。只有通过审核的规则或在明确设定的夜间时段才允许真实回发，确保客户体验万无一失。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
