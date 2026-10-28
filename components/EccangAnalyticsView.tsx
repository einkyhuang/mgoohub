"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
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
  const [config, setConfig] = useState<{ appKeyConfigured: boolean; serviceUrl: string; connected: boolean }>({
    appKeyConfigured: false,
    serviceUrl: "https://open.eccang.com/api",
    connected: false,
  });
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eccang/analytics");
      const json = await res.json() as { data?: { config: typeof config; analytics: EccangSalesOverview } };
      if (json.data) {
        setConfig(json.data.config);
        setData(json.data.analytics);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-blue-200/60 bg-gradient-to-r from-slate-950 via-[#0c1829] to-[#071321] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
              <Database className="h-3.5 w-3.5" /> 易仓 ERP (ECCANG) 2C 数据中台
            </span>
            <Badge variant="outline" className={config.connected ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10" : "border-slate-500 text-slate-300 bg-white/5"}>
              {config.connected ? "已绑定企业接口" : "已挂载模拟生产中台"}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">2C 跨境多平台经营分析 & 2B/2C 爆款协同</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            聚合 TikTok Shop、Shopify 独立站、Amazon、SHEIN 等海外 2C 渠道的实时动销、库存与利润数据。更关键的是：将 2C 真实爆款热销数据直接转化为 2B 批发业务员促成 30-50 件定制订单的核心弹药！
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href="https://www.eccang.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20"
          >
            易仓官网 <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button
            onClick={fetchAnalytics}
            className="rounded-2xl bg-blue-500 px-5 font-semibold text-white shadow-md hover:bg-blue-400 text-xs"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> 实时同步数据
          </Button>
        </div>
      </section>

      {/* Overview Metric Cards */}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">今日 2C 销售额 (GMV)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  ${data.todayGmvUsd.toLocaleString("en-US", { minimumFractionDigits: 1 })}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="mr-1 h-3.5 w-3.5" /> +18.4%
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">累计本月：<span className="font-semibold text-slate-800">${data.monthGmvUsd.toLocaleString()}</span></p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">本月订单总量</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {data.monthOrdersCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">单</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">平均客单价 (AOV)：<span className="font-semibold text-slate-800">${data.avgOrderValueUsd}</span></p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">综合毛利率 (Gross Margin)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-600">
                  {data.grossMarginPct}%
                </span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">高利润品类</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">400g 卫衣与瑜伽裤贡献超 60% 利润</p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">退货率 (Return Rate)</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {data.returnRatePct}%
                </span>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[10px] text-blue-700">远低于行业 12%</Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">归功于重磅纯棉不缩水与裸感防透光面料</p>
            </Card>
          </div>

          {/* Platform Distribution & Inventory Alerts */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
            {/* Platform Sales Share */}
            <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900">多渠道 2C 营收分布</h3>
                  <p className="text-xs text-slate-400">易仓 ERP 各店铺销售数据汇集</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">30 天总额 ${data.monthGmvUsd.toLocaleString()}</Badge>
              </div>

              <div className="space-y-4">
                {data.platformDistribution.map((p) => (
                  <div key={p.platform} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.platform}
                      </span>
                      <span className="text-slate-500">
                        <b>${p.gmvAmountUsd.toLocaleString()}</b> ({p.gmvShare}%) · {p.orderCount} 笔订单
                      </span>
                    </div>
                    <Progress value={p.gmvShare} className="h-2 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900 space-y-1">
                <p className="font-bold text-blue-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /> 2C 市场洞察提示：
                </p>
                <p className="leading-relaxed">
                  美区 TikTok Shop 400g 卫衣系列增速最快 (+38.5%)，买家评论高度集中于“落肩版型绝绝子”和“重磅保暖”。建议批发业务员重点向欧美初创品牌推销 400g 卫衣现胚！
                </p>
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
                    <h3 className="font-bold text-slate-900">易仓海外仓与工厂库存预警</h3>
                    <p className="text-[11px] text-slate-400">防止旺季断流与大货脱销</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[10px] text-rose-700 font-bold">
                  {data.inventoryAlerts.length} 项预警
                </Badge>
              </div>

              <div className="space-y-3">
                {data.inventoryAlerts.map((alert, idx) => (
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
                ))}
              </div>
            </Card>
          </div>

          {/* 2B and 2C Synergy: Top SKUs that feed 2B sales */}
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
      )}
    </div>
  );
}
