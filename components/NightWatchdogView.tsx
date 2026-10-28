"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Flame,
  Moon,
  Power,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NightReportStats, NightWatchdogConfig } from "@/lib/watchdog-types";

export function NightWatchdogView() {
  const [config, setConfig] = useState<NightWatchdogConfig>({
    enabled: true,
    scheduleMode: "night_only",
    startHour: 19,
    endHour: 9,
    weekendAllDay: true,
    unansweredTimeoutMinutes: 3,
    channelScope: "all",
    targetChannels: [7, 12],
    salesStrategy: "qualify_and_book",
  });
  const [isTriggerActive, setIsTriggerActive] = useState(false);
  const [triggerReason, setTriggerReason] = useState("");
  const [currentServerTime, setCurrentServerTime] = useState("");
  const [report, setReport] = useState<NightReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/salesmartly/night-mode");
      const json = await res.json() as {
        data?: {
          config: NightWatchdogConfig;
          isTriggerActive: boolean;
          triggerReason: string;
          currentServerTime: string;
          morningReport: NightReportStats;
        };
      };
      if (json.data) {
        setConfig(json.data.config);
        setIsTriggerActive(json.data.isTriggerActive);
        setTriggerReason(json.data.triggerReason);
        setCurrentServerTime(json.data.currentServerTime);
        setReport(json.data.morningReport);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/salesmartly/night-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Card */}
      <section className="flex flex-col gap-5 rounded-3xl border border-indigo-200/60 bg-gradient-to-r from-slate-950 via-[#0d1424] to-[#121c33] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isTriggerActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}>
              {isTriggerActive ? <Moon className="h-3.5 w-3.5 text-emerald-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              {isTriggerActive ? "夜间接管模式生效中 (Active)" : "日间人工服务时间 (Day Mode)"}
            </span>
            <span className="text-xs text-slate-400">服务器时间：{currentServerTime || "10:15:00"}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">SaleSmartly 夜间自动接管 & 3分钟超时智能兜底</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            {triggerReason || "智能监控当前 WhatsApp 会话：夜间时段下班后由 AI 自动接管回复并锁定客户需求；白天若业务员超过 3 分钟未应答，AI 自动切入防止商机流失。"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            onClick={fetchStatus}
            variant="outline"
            className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> 刷新状态
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 shadow-md hover:bg-emerald-300 text-xs"
          >
            {saveSuccess ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {saveSuccess ? "已保存生效" : isSaving ? "保存中..." : "保存策略"}
          </Button>
        </div>
      </section>

      {/* Configuration Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rule 1: Night Hours */}
        <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Moon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">夜间下班托管时段</h3>
                <p className="text-[11px] text-slate-400">业务员下班后自动全量接管</p>
              </div>
            </div>
            <Switch
              checked={config.scheduleMode !== "disabled"}
              onCheckedChange={(c) => setConfig({ ...config, scheduleMode: c ? "night_only" : "disabled" })}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">开始接管时间 (小时)</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={config.startHour}
                    onChange={(e) => setConfig({ ...config, startHour: Number(e.target.value) })}
                    className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
                  />
                  <span className="text-slate-400">:00</span>
                </div>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">结束交接时间 (小时)</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={config.endHour}
                    onChange={(e) => setConfig({ ...config, endHour: Number(e.target.value) })}
                    className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
                  />
                  <span className="text-slate-400">:00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 mt-2">
              <div>
                <p className="font-semibold text-slate-800">周末全天自动托管</p>
                <p className="text-[10px] text-slate-400">周六、周日 48 小时全天候智能值班</p>
              </div>
              <Switch
                checked={config.weekendAllDay}
                onCheckedChange={(c) => setConfig({ ...config, weekendAllDay: c })}
              />
            </div>
          </div>
        </Card>

        {/* Rule 2: Unanswered Timeout Watchdog */}
        <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">人工无应答超时监控</h3>
                <p className="text-[11px] text-slate-400">防止白天忙碌漏单流失</p>
              </div>
            </div>
            <Switch
              checked={config.unansweredTimeoutMinutes > 0}
              onCheckedChange={(c) => setConfig({ ...config, unansweredTimeoutMinutes: c ? 3 : 0 })}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">触发阈值（业务员多少分钟未回）</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={config.unansweredTimeoutMinutes}
                  onChange={(e) => setConfig({ ...config, unansweredTimeoutMinutes: Number(e.target.value) })}
                  className="h-9 w-24 rounded-xl border-slate-200 text-xs font-semibold"
                />
                <span className="text-slate-600 font-medium">分钟内无人回复，启动智能应答</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-[11px] text-amber-800 leading-relaxed">
              ⚡ 运作机制：客户在 WhatsApp 发送新消息后，如果分配的人工客服在设定的时间内未发送任何消息，AI 会立即礼貌回应客户并解答起订量、索取买家需求，业务员随时可重新接管！
            </div>
          </div>
        </Card>

        {/* Rule 3: Strategy & Conversion */}
        <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">智能回复与促成策略</h3>
                <p className="text-[11px] text-slate-400">基于 MGOO 16 年外贸销冠经验</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
              自适应 SOP
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => setConfig({ ...config, salesStrategy: "qualify_and_book" })}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                config.salesStrategy === "qualify_and_book"
                  ? "border-emerald-500 bg-emerald-50/50 font-semibold text-slate-900"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            >
              <p className="text-xs">🎯 方案 A：直接释疑 + 索取 Instagram/件数推进报价</p>
              <p className="text-[10px] font-normal text-slate-400 mt-1">
                回答 30-50 件 MOQ，打消高门槛顾虑，紧接着问买家社媒推进选款
              </p>
            </div>

            <div
              onClick={() => setConfig({ ...config, salesStrategy: "moq_and_catalog" })}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                config.salesStrategy === "moq_and_catalog"
                  ? "border-emerald-500 bg-emerald-50/50 font-semibold text-slate-900"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            >
              <p className="text-xs">📚 方案 B：轻量画册破冰 + 推荐 400g 爆款卫衣</p>
              <p className="text-[10px] font-normal text-slate-400 mt-1">
                主动推送 2026 最新秋冬美潮画册，引导客户挑选现胚颜色
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Morning Handover Report (晨间销售交接清单) */}
      {report && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">晨间销售交接清单 (Morning Handover Report)</h3>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">早晨 9:00 自动归集</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                统计时段：{report.period} · 协助业务员一上班就能直奔高意向客户成单
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500">
                夜间拦截消息：<b className="text-slate-900">{report.totalNightMessages} 条</b>
              </span>
              <span className="text-slate-500">
                捕获商机：<b className="text-emerald-600">{report.capturedLeadsCount} 个</b>
              </span>
              <span className="text-slate-500">
                平均响应：<b className="text-indigo-600">{report.averageResponseTimeSec} 秒</b>
              </span>
              <span className="text-slate-500">
                紧急成交机会：<b className="text-rose-600">{report.urgentLeadsCount} 个</b>
              </span>
            </div>
          </div>

          {/* Cards for each captured lead */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {report.leads.map((lead) => (
              <Card key={lead.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{lead.customerName}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          lead.urgency === "high"
                            ? "border-rose-300 bg-rose-50 text-rose-700 font-bold"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {lead.urgency === "high" ? "🔥 极高意向" : "常规咨询"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.phoneOrContact} · {lead.channel}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{lead.receivedAt}</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700">
                  <p><span className="text-slate-400">意向款式：</span><span className="font-semibold text-slate-900">{lead.inquiryProduct}</span></p>
                  <p><span className="text-slate-400">预估件数：</span><span className="font-semibold text-emerald-700">{lead.qualifiedNeeds.targetQty}</span></p>
                  <p><span className="text-slate-400">工艺要求：</span>{lead.qualifiedNeeds.styleOrSpec}</p>
                  <p><span className="text-slate-400">社媒/网址：</span><span className="font-mono text-indigo-600">{lead.qualifiedNeeds.socialOrLink}</span></p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900">
                  <p className="font-bold text-[11px] text-emerald-800 mb-1">👉 建议业务员立即跟进行动：</p>
                  <p className="leading-relaxed">{lead.recommendedAction}</p>
                </div>

                <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 line-clamp-1">
                  AI 昨夜最后回复："{lead.aiLastReply}"
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
