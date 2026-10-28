"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Layers,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
  Terminal,
  Trash2,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EccangSalesOverview } from "@/lib/eccang-types";

export function EccangAnalyticsView() {
  const [data, setData] = useState<EccangSalesOverview | null>(null);
  const [config, setConfig] = useState<{
    appKeyConfigured: boolean;
    serviceUrl: string;
    connected: boolean;
    userTokenConfigured: boolean;
  }>({
    appKeyConfigured: false,
    serviceUrl: "https://open.eccang.com/api",
    connected: false,
    userTokenConfigured: false,
  });
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ai_prompt" | "rest_api" | "env_setup">("ai_prompt");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eccang/analytics");
      const json = (await res.json()) as {
        data?: {
          config: typeof config;
          analytics: EccangSalesOverview | null;
        };
      };
      if (json.data) {
        setConfig(json.data.config);
        setData(json.data.analytics || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    setLoading(true);
    try {
      await fetch("/api/eccang/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      setData(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eccang/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sample" }),
      });
      const json = (await res.json()) as { data?: EccangSalesOverview };
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Standard AI integration prompt for Codex / WorkBuddy
  const aiIntegrationSkillPrompt = `【任务目标】：对接 MGOO 全域工作台的「易仓 ERP 2C 经营数据中台」。
请编写自动化数据获取或同步脚本，将易仓开放平台 (ECCANG OpenAPI) 的 2C 销售与库存数据同步推送到 MGOO 本地工作台。

1. 本地工作台数据接收端点：
   - REST API 接口: POST http://localhost:5173/api/eccang/analytics
   - 或者同步专用端点: POST http://localhost:5173/api/eccang/sync
   - 或者通过 MCP 工具调用: sync_eccang_overview

2. 推送的数据 JSON 规范：
{
  "todayGmvUsd": 15800.5,
  "monthGmvUsd": 412000.0,
  "monthOrdersCount": 6890,
  "avgOrderValueUsd": 59.8,
  "grossMarginPct": 53.5,
  "returnRatePct": 4.2,
  "platformDistribution": [
    { "platform": "TikTok Shop (US)", "gmvShare": 45, "gmvAmountUsd": 185400, "orderCount": 3120, "color": "#000000" },
    { "platform": "Shopify (Brand D2C)", "gmvShare": 30, "gmvAmountUsd": 123600, "orderCount": 1950, "color": "#96bf48" },
    { "platform": "Amazon (US & EU)", "gmvShare": 17, "gmvAmountUsd": 70040, "orderCount": 1210, "color": "#ff9900" },
    { "platform": "SHEIN / TEMU", "gmvShare": 8, "gmvAmountUsd": 32960, "orderCount": 610, "color": "#10b981" }
  ],
  "topSkus": [
    {
      "sku": "MGOO-HD-400-VBLK",
      "name": "400gsm Heavyweight Acid-Wash Oversized Hoodie",
      "category": "Streetwear",
      "monthlySalesUnits": 1950,
      "inventoryLevel": 380,
      "safetyStock": 300,
      "status": "hot_reorder",
      "revenueUsd": 134550,
      "growthPct": 36.4,
      "b2bSynergyTip": "🔥 2C 爆款数据背书：TikTok 单款月销近 2000 件，极受海外街头潮牌欢迎！业务员在 WhatsApp 谈批发时，推 30-50 件现胚定制出单率超 70%。"
    }
  ],
  "inventoryAlerts": [
    {
      "warehouse": "美西洛杉矶海外仓",
      "sku": "MGOO-HD-400-VBLK (L/XL)",
      "remainingDays": 7,
      "actionRequired": "空运补仓 500 件防 TikTok 爆单断流",
      "urgency": "urgent"
    }
  ]
}

请编写一个 Node.js 或 Python 脚本，拉取易仓 OpenAPI 并自动 POST 到上述地址。`;

  // Standard cURL push example
  const curlPushSnippet = `curl -X POST http://localhost:5173/api/eccang/analytics \\
  -H "Content-Type: application/json" \\
  -d '{
    "todayGmvUsd": 12500.0,
    "monthGmvUsd": 320000.0,
    "monthOrdersCount": 5400,
    "avgOrderValueUsd": 59.2,
    "grossMarginPct": 52.0,
    "returnRatePct": 4.5,
    "platformDistribution": [
      { "platform": "TikTok Shop (US)", "gmvShare": 50, "gmvAmountUsd": 160000, "orderCount": 2700, "color": "#000000" },
      { "platform": "Shopify D2C", "gmvShare": 50, "gmvAmountUsd": 160000, "orderCount": 2700, "color": "#96bf48" }
    ],
    "topSkus": [
      {
        "sku": "MGOO-HD-400",
        "name": "400gsm Heavyweight Hoodie",
        "category": "Streetwear",
        "monthlySalesUnits": 1500,
        "inventoryLevel": 400,
        "safetyStock": 200,
        "status": "healthy",
        "revenueUsd": 90000,
        "growthPct": 25.0,
        "b2bSynergyTip": "2C 畅销款，可直接拿给 2B 批发客户推现胚定制！"
      }
    ],
    "inventoryAlerts": []
  }'`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/80 bg-gradient-to-r from-slate-950 via-[#0a192f] to-[#071321] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <Database className="h-3.5 w-3.5" /> 易仓 ERP (ECCANG) 2C 数据中台
            </span>
            <Badge
              variant="outline"
              className={
                data
                  ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                  : "border-amber-400/40 text-amber-300 bg-amber-500/10"
              }
            >
              {data
                ? `已接入数据 (${data.dataSource === "sample_test" ? "样例演示" : data.dataSource === "live_api" ? "官方API直连" : "外部推送"})`
                : "虚拟数据已清空 · 接口就绪待接入"}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">2C 跨境多平台经营分析 & 2B/2C 爆款协同</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            本模块预留标准对接接口与 AI Skill。支持官方易仓开放平台直连或由 Codex / WorkBuddy
            定时推送真实动销与库存数据，将 2C 爆款作为 2B 批发业务员成单武器！
          </p>
        </div>

        <div className="flex flex-wrap shrink-0 items-center gap-2.5">
          <a
            href="https://www.eccang.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all"
          >
            易仓开放平台 <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {data ? (
            <Button
              onClick={clearData}
              variant="outline"
              className="rounded-2xl border-white/20 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-xs hover:text-white"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> 清空重置
            </Button>
          ) : (
            <Button
              onClick={loadSampleData}
              variant="outline"
              className="rounded-2xl border-sky-400/30 bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 text-xs hover:text-white"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> 载入样例演示
            </Button>
          )}
          <Button
            onClick={fetchAnalytics}
            className="rounded-2xl bg-sky-500 px-4 font-semibold text-white shadow-md hover:bg-sky-400 text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> 刷新接口
          </Button>
        </div>
      </section>

      {/* Connection & AI Integration Skill Card (Always visible or in empty state) */}
      <Card className="rounded-3xl border border-sky-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 font-bold border border-sky-200">
              <Code2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">预留对接接口与 AI 对接 Skill</h3>
                <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800 text-[10px] font-bold">
                  专为 Codex / WorkBuddy 预留
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                虚拟数据已全部清空。你可以随时一键把下面的 Skill 指令发给 AI，快速对接你的易仓 ERP。
              </p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setActiveTab("ai_prompt")}
              className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                activeTab === "ai_prompt"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🤖 给 AI 的对接指令
            </button>
            <button
              onClick={() => setActiveTab("rest_api")}
              className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                activeTab === "rest_api"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ⚡ REST 接口与 cURL
            </button>
            <button
              onClick={() => setActiveTab("env_setup")}
              className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                activeTab === "env_setup"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🔑 环境变量设置
            </button>
          </div>
        </div>

        {/* Tab 1: AI Prompt */}
        {activeTab === "ai_prompt" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 font-medium">
                💡 复制以下 Prompt 发送给 <b>Codex</b> 或 <b>WorkBuddy</b>，AI 将自动分析并为你生成对接易仓 ERP 的脚本：
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(aiIntegrationSkillPrompt, "ai_prompt")}
                className="rounded-xl border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs h-8"
              >
                {copiedKey === "ai_prompt" ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> 已复制到剪贴板
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" /> 一键复制 AI 对接 Skill
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-60 overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-sky-200 leading-relaxed border border-slate-800">
              {aiIntegrationSkillPrompt}
            </pre>
          </div>
        )}

        {/* Tab 2: REST API & cURL */}
        {activeTab === "rest_api" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 font-medium">
                预留的数据同步端点：<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sky-800">POST /api/eccang/analytics</code> 或 <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sky-800">POST /api/eccang/sync</code>
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(curlPushSnippet, "curl_snippet")}
                className="rounded-xl border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs h-8"
              >
                {copiedKey === "curl_snippet" ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> 已复制 cURL
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" /> 复制 cURL 命令
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-60 overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-300 leading-relaxed border border-slate-800">
              {curlPushSnippet}
            </pre>
          </div>
        )}

        {/* Tab 3: Environment Variables */}
        {activeTab === "env_setup" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              若使用易仓开放平台直连模式，在项目根目录 <code className="font-mono text-sky-800">.dev.vars</code> 或 <code className="font-mono text-sky-800">.env.local</code> 中配置以下凭证：
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">ECCANG_APP_KEY</span>
                <p className="font-mono text-slate-800 font-semibold">{config.appKeyConfigured ? "已配置 ●●●●●●" : "未配置 (待填写)"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">ECCANG_APP_SECRET</span>
                <p className="font-mono text-slate-800 font-semibold">{config.connected ? "已配置 ●●●●●●" : "未配置 (待填写)"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">ECCANG_SERVICE_URL</span>
                <p className="font-mono text-slate-800">{config.serviceUrl || "https://open.eccang.com/api"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">ECCANG_USER_TOKEN</span>
                <p className="font-mono text-slate-800">{config.userTokenConfigured ? "已配置" : "可选参数 (选填)"}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Metrics Section: Real data or Empty States */}
      {data ? (
        <>
          {/* Real Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">今日 2C 销售额 (GMV)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  ${data.todayGmvUsd.toLocaleString("en-US", { minimumFractionDigits: 1 })}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="mr-1 h-3.5 w-3.5" /> 实时动销
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                累计本月：<span className="font-semibold text-slate-800">${data.monthGmvUsd.toLocaleString()}</span>
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">本月订单总量</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {data.monthOrdersCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">单</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                平均客单价 (AOV)：<span className="font-semibold text-slate-800">${data.avgOrderValueUsd}</span>
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">综合毛利率 (Gross Margin)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-600">
                  {data.grossMarginPct}%
                </span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                  高动销
                </Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">毛利数据来自各渠道结算汇算</p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">退货率 (Return Rate)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {data.returnRatePct}%
                </span>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-[10px] text-sky-700">
                  质量可控
                </Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                更新时间：{data.lastSyncAt ? new Date(data.lastSyncAt).toLocaleTimeString() : "刚刚"}
              </p>
            </Card>
          </div>

          {/* Platform Distribution & Inventory Alerts */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
            {/* Platform Sales Share */}
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900">多渠道 2C 营收分布</h3>
                  <p className="text-xs text-slate-400">各店铺与销售中台数据汇集</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  总额 ${data.monthGmvUsd.toLocaleString()}
                </Badge>
              </div>

              <div className="space-y-4">
                {data.platformDistribution.length > 0 ? (
                  data.platformDistribution.map((p) => (
                    <div key={p.platform} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color || "#0284c7" }} />
                          {p.platform}
                        </span>
                        <span className="text-slate-500">
                          <b>${p.gmvAmountUsd.toLocaleString()}</b> ({p.gmvShare}%) · {p.orderCount} 笔订单
                        </span>
                      </div>
                      <Progress value={p.gmvShare} className="h-2 rounded-full" />
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">暂无渠道占比数据</div>
                )}
              </div>
            </Card>

            {/* Inventory Alerts */}
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">海外仓与工厂库存预警</h3>
                    <p className="text-[11px] text-slate-400">防止旺季断流与大货脱销</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[10px] text-rose-700 font-bold">
                  {data.inventoryAlerts.length} 项预警
                </Badge>
              </div>

              <div className="space-y-3">
                {data.inventoryAlerts.length > 0 ? (
                  data.inventoryAlerts.map((alert, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{alert.warehouse}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            alert.urgency === "urgent"
                              ? "border-rose-300 bg-rose-50 text-rose-700 font-bold"
                              : "border-amber-300 bg-amber-50 text-amber-700"
                          }`}
                        >
                          仅剩 {alert.remainingDays} 天可用
                        </Badge>
                      </div>
                      <p className="text-slate-600 font-mono text-[11px]">{alert.sku}</p>
                      <p className="text-[11px] font-medium text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                        👉 建议动作：{alert.actionRequired}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">库存状态健康，暂无紧急断货告警</div>
                )}
              </div>
            </Card>
          </div>

          {/* Top SKUs */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">🔥 2C 爆款与 2B 批发业务协同赋能矩阵</h3>
                  <Badge className="bg-emerald-600 text-white text-[10px]">用真实爆款数据帮业务员成单</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  业务员谈批发客户时，直接调取 2C 实际畅销数据做背书，消除买家对款式的犹疑！
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {data.topSkus.map((sku) => (
                <div key={sku.sku} className="rounded-2xl border border-slate-200/70 p-4 space-y-2.5 bg-slate-50/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{sku.name}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{sku.sku} · {sku.category}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs">
                      月销 {sku.monthlySalesUnits.toLocaleString()} 件
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs py-1">
                    <div className="rounded-xl bg-white p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">月营收</span>
                      <span className="font-bold text-slate-800">${sku.revenueUsd.toLocaleString()}</span>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">月环比增速</span>
                      <span className="font-bold text-emerald-600">+{sku.growthPct}%</span>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">现货可做现胚</span>
                      <span className="font-bold text-slate-800">{sku.inventoryLevel} 件</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-950 leading-relaxed">
                    <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp 业务员话术锦囊：
                    </p>
                    {sku.b2bSynergyTip}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Empty State with Placeholders */
        <div className="space-y-6">
          {/* Zeroed Placeholder Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-75">
            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">今日 2C 销售额 (GMV)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-400">$0.00</span>
                <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px]">待同步</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">等待易仓 ERP 接口接入</p>
            </Card>

            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">本月订单总量</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-400">0</span>
                <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px]">待同步</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">平均客单价：$0.00</p>
            </Card>

            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">综合毛利率</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-400">--%</span>
                <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px]">待同步</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">需录入各店铺实际采购成本</p>
            </Card>

            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">退货率</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-400">--%</span>
                <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px]">待同步</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">包含 TikTok / Amazon / Shopify 汇总</p>
            </Card>
          </div>

          {/* Clean Waiting for Data Card */}
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 border border-sky-100">
              <Database className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">虚拟数据已清空 · 正在等待真实数据注入</h3>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-500">
              为了确保经营决策真实可靠，原有的模拟销售数据已全部重置。您可以通过上方的{" "}
              <b>「🤖 给 AI 的对接指令」</b> 让 Codex 或 WorkBuddy 编写对接脚本，或者点击右上角{" "}
              <b>「载入样例演示」</b> 临时查看界面完整视觉排版。
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => copyToClipboard(aiIntegrationSkillPrompt, "ai_prompt_center")}
                className="rounded-2xl bg-sky-600 px-5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500"
              >
                {copiedKey === "ai_prompt_center" ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" /> 已复制 AI 对接 Skill
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" /> 复制对接指令给 Codex / WorkBuddy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={loadSampleData}
                className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-sky-600" /> 载入样例数据临时预览
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
