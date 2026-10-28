"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  Globe,
  Layers,
  Mail,
  MessageSquare,
  Package,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_WORKFORCE,
  AIEmployee,
  PipelineExecutionReport,
  VisualDeliverable,
} from "@/lib/workforce-types";

// Preset quick scenarios for instant task dispatching
const PRESET_SCENARIOS = [
  {
    label: "🔥 欧美街潮 400g 卫衣",
    query: "Kith / Represent Clo 风格欧美初创街头潮牌，咨询 400g 做旧连帽卫衣",
    notes: "关注工艺：重磅纯棉毛圈、酸洗做旧、3D发泡印花，首批起订量 30-50 件现胚，要求 DDP 空运至加州",
  },
  {
    label: "🧘 瑜伽馆主理人贴牌",
    query: "英国伦敦高端普拉提与瑜伽工作室主理人，咨询 80/20 裸感瑜伽裤贴牌定制",
    notes: "要求裸感防透、高腰提臀、无缝拼接，首单 50 件打样，需要带专属洗水标与防伪吊牌",
  },
  {
    label: "⚡ TikTok 爆款紧急翻单",
    query: "美区 TikTok Shop 畅销短袖 T恤断货，买家急需 50-100 件快速翻单",
    notes: "要求 240gsm 紧密纯棉、落肩宽松版型、预缩处理，7 天内空运交付，解决断流降权危机",
  },
  {
    label: "👔 展会偶遇买家深挖",
    query: "广交会/MAGIC 展会结识的澳洲独立买家品牌，寻找有 16 年出口经验的大厂",
    notes: "买家此前合作巴基斯坦工厂延期严重，现急需稳定现胚供应与 DDP 门到门物流保障",
  },
];

export function AiWorkforceView() {
  const [employees] = useState<AIEmployee[]>(AI_WORKFORCE);
  const [workMode, setWorkMode] = useState<"pipeline" | "single">("pipeline");
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee>(AI_WORKFORCE[0]);
  const [selectedGroup, setSelectedGroup] = useState<"all" | "prospecting" | "outreach" | "closing">("all");
  const [inputQuery, setInputQuery] = useState(PRESET_SCENARIOS[0].query);
  const [extraNotes, setExtraNotes] = useState(PRESET_SCENARIOS[0].notes);

  // Single employee execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [deliverable, setDeliverable] = useState<VisualDeliverable | null>(null);

  // Autonomous pipeline execution state
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineReport, setPipelineReport] = useState<PipelineExecutionReport | null>(null);
  const [selectedPipelineStepIdx, setSelectedPipelineStepIdx] = useState<number>(0);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<number>(0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredEmployees = employees.filter((emp) => {
    if (selectedGroup === "all") return true;
    return emp.group === selectedGroup;
  });

  // Single employee dispatch
  const handleRunEmployee = async () => {
    if (!inputQuery.trim() || isExecuting) return;
    setIsExecuting(true);
    setDeliverable(null);

    try {
      const res = await fetch("/api/workforce/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          targetBrandOrNiche: inputQuery.trim(),
          extraNotes: extraNotes.trim(),
        }),
      });

      const json = (await res.json()) as {
        data?: {
          result: string;
          highlights: string[];
          visualDeliverable: VisualDeliverable;
        };
      };

      if (json.data?.visualDeliverable) {
        setDeliverable(json.data.visualDeliverable);
        setActiveTemplateTab(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Full autonomous pipeline dispatch
  const handleRunPipeline = async () => {
    if (!inputQuery.trim() || isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineProgress(1);

    try {
      // Simulate live stage progression animation for high visual feedback
      const timer1 = setTimeout(() => setPipelineProgress(2), 250);
      const timer2 = setTimeout(() => setPipelineProgress(4), 500);
      const timer3 = setTimeout(() => setPipelineProgress(6), 750);

      const res = await fetch("/api/workforce/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetNiche: inputQuery.trim(),
          extraNotes: extraNotes.trim(),
        }),
      });

      const json = (await res.json()) as { data?: PipelineExecutionReport };
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (json.data) {
        setPipelineReport(json.data);
        setSelectedPipelineStepIdx(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPipelineRunning(false);
      setPipelineProgress(6);
    }
  };

  // Initial trigger for immediate preview
  useEffect(() => {
    handleRunPipeline();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner with Mode Selector */}
      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/80 bg-gradient-to-r from-slate-950 via-[#0a192f] to-[#071321] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <Users className="h-3.5 w-3.5" /> 6+2 AI 外贸全链路员工兵团
            </span>
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 bg-emerald-500/10 text-xs">
              8 位专职 AI 员工全员在线
            </Badge>
            <Badge variant="outline" className="border-sky-400/40 text-sky-300 bg-sky-500/10 text-xs">
              可视化 HTML 交付物
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">24 小时不间断作业的 MGOO 智能外贸数字兵团</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            支持所有员工<b>「端到端全自动获客巡航」</b>与<b>「专职单兵精准派单」</b>双模式。从全网雷达扫描、ICP分级、一页纸背调、采购信号捕捉到直接输出 WhatsApp 开发信，彻底告别大海捞针！
          </p>
        </div>

        {/* Work Mode Switcher */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center rounded-2xl bg-white/10 p-1 border border-white/20 text-xs backdrop-blur-md">
            <button
              onClick={() => setWorkMode("pipeline")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium transition-all ${
                workMode === "pipeline"
                  ? "bg-sky-500 text-white shadow-sm font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Zap className="h-3.5 w-3.5" /> 🚀 全自动协同巡航
            </button>
            <button
              onClick={() => setWorkMode("single")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium transition-all ${
                workMode === "single"
                  ? "bg-sky-500 text-white shadow-sm font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bot className="h-3.5 w-3.5" /> 专职员工独立派活
            </button>
          </div>
          <span className="text-[10px] text-slate-400 text-center">
            {workMode === "pipeline" ? "✨ 1号至6号员工自动接力推进" : "🎯 指定某一专职员工单独执行"}
          </span>
        </div>
      </section>

      {/* MODE 1: Autonomous Lead Generation Pipeline (用户问到的核心功能：全员自动化) */}
      {workMode === "pipeline" && (
        <div className="space-y-6">
          {/* Pipeline Controller Card */}
          <Card className="rounded-3xl border border-sky-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-700 font-bold">
                    <Zap className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    全链路无人获客巡航控制台 (Autonomous Prospecting Cruise)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  输入任意赛道或买家方向，系统将自动驱动 <b>1号市场情报员</b>、<b>2号ICP筛选员</b>、<b>3号客户研究员</b>、<b>4号采购信号员</b>、<b>5号决策链挖掘员</b> 和 <b>6号开发信助理</b> 接力完成全部背调与触达物料输出！
                </p>
              </div>

              {/* Quick Scenario Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SCENARIOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(p.query);
                      setExtraNotes(p.notes);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 transition-all font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs & Launch Button */}
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] items-end">
              <div>
                <label className="text-slate-700 block mb-1 text-xs font-semibold">
                  目标开发赛道 / 买家官网 / 行业关键词
                </label>
                <Input
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="例如：欧美中高端潮牌 400g 卫衣，或 https://kith.com"
                  className="rounded-xl border-slate-200 text-xs h-9 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 text-xs font-semibold">
                  重点主推工艺与供应链诉求
                </label>
                <Input
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="例如：350-420g 纯棉毛圈、做旧水洗、30-50件现胚起订、DDP包税到门"
                  className="rounded-xl border-slate-200 text-xs h-9 bg-slate-50/50"
                />
              </div>

              <Button
                onClick={handleRunPipeline}
                disabled={!inputQuery.trim() || isPipelineRunning}
                className="rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md text-xs h-9 px-5 shrink-0"
              >
                {isPipelineRunning ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-white" />
                )}
                {isPipelineRunning ? "8位员工接力作业中..." : "启动全自动协同获客流水线"}
              </Button>
            </div>

            {/* Live 6-Step Pipeline Visual Progress */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { num: "1号", name: "市场情报员", icon: "📡", role: "发现商机雷达" },
                  { num: "2号", name: "ICP筛选员", icon: "🎯", role: "评级与投产比" },
                  { num: "3号", name: "客户研究员", icon: "🔍", role: "一页纸画像" },
                  { num: "4号", name: "采购信号员", icon: "⚡", role: "断货时机捕捉" },
                  { num: "5号", name: "决策链挖掘", icon: "🕵️", role: "锁定拍板人" },
                  { num: "6号", name: "个性开发信", icon: "✍️", role: "WhatsApp破冰" },
                ].map((step, idx) => {
                  const isDone = Boolean(pipelineReport && pipelineReport.steps[idx]);
                  const isActive = selectedPipelineStepIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPipelineStepIdx(idx)}
                      className={`cursor-pointer rounded-2xl border p-2.5 transition-all text-left flex flex-col justify-between ${
                        isActive
                          ? "border-sky-500 bg-sky-50 text-sky-950 shadow-xs ring-1 ring-sky-500/30"
                          : isDone
                          ? "border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70"
                          : "border-slate-100 bg-slate-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-sky-800">{step.num}</span>
                        <span className="text-xs">{step.icon}</span>
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{step.name}</p>
                        <span className="text-[9px] text-slate-500 block mt-0.5 truncate">{step.role}</span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200/40 flex items-center justify-between text-[9px]">
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> 已完成
                        </span>
                        <span className="text-sky-700 font-bold">查看 →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Autonomous Execution Results: Top Lead Dossier + Active Step Deliverable */}
          {pipelineReport && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start">
              {/* Left: Overall Dossier Summary Card */}
              <div className="space-y-4">
                <Card className="rounded-3xl border border-sky-200/80 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        全自动协同交付总结
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {pipelineReport.leadTier}
                      </h4>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-mono text-xs">
                      匹配指数 {pipelineReport.leadScore} 分
                    </Badge>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">首单推荐规模</span>
                      <p className="font-bold text-slate-800">30 - 50 件现胚定制</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">交付时效保障</span>
                      <p className="font-bold text-slate-800">DDP 空运 7 天门到门</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">关键拍板人</span>
                      <p className="font-bold text-slate-800">Founder & Creative Dir.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">采购窗口期</span>
                      <p className="font-bold text-emerald-600">断货翻单黄金期 (急迫)</p>
                    </div>
                  </div>

                  {/* Ready-to-Send Outreach Card */}
                  <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-xs space-y-2.5 text-sky-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-sky-400" /> WhatsApp 现成开单话术
                      </span>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(pipelineReport.readyOutreach.text, "pipeline_outreach")}
                        className="rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[10px] h-7 px-2.5"
                      >
                        {copiedKey === "pipeline_outreach" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> 已复制话术
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> 一键复制话术
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="font-sans whitespace-pre-wrap leading-relaxed text-[11px] text-slate-200">
                      {pipelineReport.readyOutreach.text}
                    </pre>
                  </div>

                  {/* Actions: Sync to Kanban */}
                  <div className="pt-1 flex flex-col gap-2">
                    <Button
                      onClick={() => alert("✅ 该优质潜客档案已成功同步推送到【客户开发看板】中的「新线索」泳道！业务员可随时查看跟进。")}
                      className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm h-9"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> 一键归档入库【客户开发看板】
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right: Step-by-Step Deliverable Details */}
              <div className="space-y-4">
                {pipelineReport.steps[selectedPipelineStepIdx] && (
                  <Card className="rounded-3xl border border-sky-200/80 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">
                          {pipelineReport.steps[selectedPipelineStepIdx].avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {pipelineReport.steps[selectedPipelineStepIdx].employeeName}
                            </span>
                            <Badge variant="outline" className="border-sky-200 bg-sky-50 text-[10px] text-sky-800">
                              步骤 {pipelineReport.steps[selectedPipelineStepIdx].step} / 6
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {pipelineReport.steps[selectedPipelineStepIdx].actionTitle}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            pipelineReport.steps[selectedPipelineStepIdx].deliverable.summary,
                            "step_summary",
                          )
                        }
                        className="rounded-xl border-slate-200 text-xs h-7"
                      >
                        {copiedKey === "step_summary" ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-emerald-600" /> 已复制
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> 复制本步交付物
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Step Visual Deliverable Render */}
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs text-sky-950 space-y-1.5 leading-relaxed">
                      <span className="font-bold text-sky-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-sky-600" /> 交付物核心结论：
                      </span>
                      <p className="text-slate-700">
                        {pipelineReport.steps[selectedPipelineStepIdx].deliverable.summary}
                      </p>
                    </div>

                    {/* Key Insights */}
                    {pipelineReport.steps[selectedPipelineStepIdx].deliverable.keyInsights.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        {pipelineReport.steps[selectedPipelineStepIdx].deliverable.keyInsights.map((k, i) => (
                          <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-semibold">{k.label}</span>
                              {k.tag && (
                                <Badge variant="outline" className="border-sky-200 bg-white text-[9px] text-sky-700">
                                  {k.tag}
                                </Badge>
                              )}
                            </div>
                            <p className="font-bold text-slate-900 leading-snug">{k.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next Action Checklist */}
                    {pipelineReport.steps[selectedPipelineStepIdx].deliverable.nextActionChecklist.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-slate-800 text-[11px] block mb-1">
                          建议业务员本步落地动作：
                        </span>
                        {pipelineReport.steps[selectedPipelineStepIdx].deliverable.nextActionChecklist.map((act, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-slate-700 border border-slate-100 text-[11px]">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Single Employee Interactive Dispatch Workbench */}
      {workMode === "single" && (
        <div className="space-y-6">
          {/* Employee Selection & Workbench Grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
            {/* Left Column: Employee Selection & Task Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">选择派活的 AI 员工</h3>
                <div className="flex items-center rounded-2xl bg-slate-100 p-1 text-[11px]">
                  <button
                    onClick={() => setSelectedGroup("all")}
                    className={`rounded-xl px-2.5 py-1 font-medium transition-all ${
                      selectedGroup === "all" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    全部 (8)
                  </button>
                  <button
                    onClick={() => setSelectedGroup("prospecting")}
                    className={`rounded-xl px-2.5 py-1 font-medium transition-all ${
                      selectedGroup === "prospecting" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    获客背调 (3)
                  </button>
                  <button
                    onClick={() => setSelectedGroup("outreach")}
                    className={`rounded-xl px-2.5 py-1 font-medium transition-all ${
                      selectedGroup === "outreach" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    意向触达 (3)
                  </button>
                  <button
                    onClick={() => setSelectedGroup("closing")}
                    className={`rounded-xl px-2.5 py-1 font-medium transition-all ${
                      selectedGroup === "closing" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    成交赋能 (2)
                  </button>
                </div>
              </div>

              {/* Employee Cards Grid */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {filteredEmployees.map((emp) => {
                  const isSelected = emp.id === selectedEmployee.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setDeliverable(null);
                      }}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-500/30"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emp.avatar}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                                <span className="text-[10px] font-mono text-sky-600 font-bold">#{emp.number}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{emp.title}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              isSelected
                                ? "border-sky-300 bg-sky-100/70 text-sky-800 font-bold"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isSelected ? "已选派" : "在线"}
                          </Badge>
                        </div>

                        <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {emp.roleDescription}
                        </p>
                      </div>

                      <div className="mt-2.5 border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[170px]">📦 {emp.coreDeliverable.slice(0, 18)}...</span>
                        <span className="font-semibold text-sky-700">派活 →</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Task Form Card */}
              <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedEmployee.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        任务派发台：【{selectedEmployee.name}】
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        #{selectedEmployee.number}号专职员工 · {selectedEmployee.title}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px]" variant="outline">
                    可视化 HTML
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      1. 目标分析对象（买家官网 / 品牌名 / 询盘消息）
                    </label>
                    <Input
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="例如：https://representclo.com 或 欧美新潮牌咨询 400g 卫衣"
                      className="rounded-xl border-slate-200 text-xs h-9 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      2. 补充业务诉求与重点工艺（选填）
                    </label>
                    <Textarea
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      placeholder="例如：主推 380-420gsm 紧密纯棉毛圈、做旧酸洗、30-50 件低起订量现胚定制"
                      className="min-h-[65px] resize-none rounded-xl border-slate-200 text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <Button
                    onClick={handleRunEmployee}
                    disabled={!inputQuery.trim() || isExecuting}
                    className="w-full rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md text-xs h-10 transition-all"
                  >
                    {isExecuting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4 fill-white" />
                    )}
                    {isExecuting ? "AI 员工全速分析生成中..." : `立即派发给【${selectedEmployee.name}】执行`}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Visual Deliverable */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                    <FileCheck2 className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    员工交付成果 (结构化可视化 HTML)
                  </h3>
                </div>
                {deliverable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        `${deliverable.title}\n${deliverable.summary}\n\n【关键数据】：\n${deliverable.keyInsights.map((k) => `• ${k.label}: ${k.value}`).join("\n")}`,
                        "single_deliverable",
                      )
                    }
                    className="rounded-xl border-slate-200 text-xs h-7 text-slate-600 hover:text-slate-900"
                  >
                    {copiedKey === "single_deliverable" ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-600" /> 已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" /> 一键复制报告
                      </>
                    )}
                  </Button>
                )}
              </div>

              {deliverable ? (
                <Card className="rounded-3xl border border-sky-200/80 bg-white p-5 shadow-sm space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedEmployee.avatar}</span>
                        <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800 text-[10px] font-bold">
                          {deliverable.badge}
                        </Badge>
                        {deliverable.score && (
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            评分 {deliverable.score} 分
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                        {deliverable.title}
                      </h4>
                    </div>

                    {deliverable.grade && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-right shrink-0">
                        <span className="text-[10px] text-emerald-700 block font-semibold">综合评级</span>
                        <span className="text-xs font-extrabold text-emerald-900">{deliverable.grade}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/90 to-blue-50/50 p-4 text-xs text-sky-950 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-sky-900">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      <span>核心研判与商业结论：</span>
                    </div>
                    <p className="text-slate-700">{deliverable.summary}</p>
                  </div>

                  {deliverable.keyInsights.length > 0 && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {deliverable.keyInsights.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {item.label}
                            </span>
                            {item.tag && (
                              <Badge variant="outline" className="border-sky-200 bg-white text-[9px] text-sky-700">
                                {item.tag}
                              </Badge>
                            )}
                          </div>
                          <p className="font-bold text-xs text-slate-900 leading-snug">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {deliverable.outreachTemplates && deliverable.outreachTemplates.length > 0 && (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-xs text-sky-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                        <span className="font-bold text-white">
                          {deliverable.outreachTemplates[0].channel} 触达模版
                        </span>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(deliverable.outreachTemplates![0].content, "single_tpl")}
                          className="rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[10px] h-7 px-2.5"
                        >
                          {copiedKey === "single_tpl" ? (
                            <>
                              <Check className="mr-1 h-3 w-3" /> 已复制
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" /> 一键复制
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="font-sans whitespace-pre-wrap leading-relaxed text-[11px] text-slate-200">
                        {deliverable.outreachTemplates[0].content}
                      </pre>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center shadow-2xs space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">正在等待 AI 员工交付结果</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    请在左侧输入客户信息并点击「立即派发」，AI 员工将在此渲染高保真可视化交付卡片。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
