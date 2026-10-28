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
  Layers,
  Mail,
  MessageSquare,
  Package,
  Play,
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
import { AI_WORKFORCE, AIEmployee, VisualDeliverable } from "@/lib/workforce-types";

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
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee>(AI_WORKFORCE[0]);
  const [selectedGroup, setSelectedGroup] = useState<"all" | "prospecting" | "outreach" | "closing">("all");
  const [inputQuery, setInputQuery] = useState(PRESET_SCENARIOS[0].query);
  const [extraNotes, setExtraNotes] = useState(PRESET_SCENARIOS[0].notes);
  const [isExecuting, setIsExecuting] = useState(false);
  const [deliverable, setDeliverable] = useState<VisualDeliverable | null>(null);
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

  // Run automatically on first render for high-end preview
  useEffect(() => {
    handleRunEmployee();
  }, [selectedEmployee.id]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/80 bg-gradient-to-r from-slate-950 via-[#0a192f] to-[#071321] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <Users className="h-3.5 w-3.5" /> 6+2 AI 外贸全链路员工兵团
            </span>
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 bg-emerald-500/10 text-xs">
              8 位专职 AI 员工全员在线就绪
            </Badge>
            <Badge variant="outline" className="border-sky-400/40 text-sky-300 bg-sky-500/10 text-xs">
              可视化 HTML 交付物
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">24 小时不间断作业的 MGOO 智能外贸数字兵团</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            全面覆盖市场情报、ICP精准筛选、客户穿透背调、采购时机捕获、决策人定位与个性化触达，结合 MGOO 专属夜间留单与业务陪练。交付物均为结构化卡片与话术，拒绝枯燥纯文本！
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">响应时效</span>
            <span className="text-lg font-extrabold text-sky-300">&lt; 2 秒</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">外贸知识库</span>
            <span className="text-lg font-extrabold text-emerald-300">16 年东莞大厂</span>
          </div>
        </div>
      </section>

      {/* 8-Step Interactive Pipeline */}
      <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-sky-700 text-xs font-bold">
              ⚡
            </span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              8 大 AI 员工全链路协作工作流（点击任一节点快速调遣）
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            从发现商机到客户成交 · 环环相扣自动流转
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
          {employees.map((emp) => {
            const isSelected = selectedEmployee.id === emp.id;
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`group cursor-pointer rounded-2xl border p-2.5 transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? "border-sky-500 bg-sky-50/80 text-sky-950 shadow-xs ring-1 ring-sky-500/30"
                    : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-700">#{emp.number}号</span>
                  <span className="text-sm">{emp.avatar}</span>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-slate-900 text-[11px] leading-tight truncate">{emp.name.replace("AI ", "")}</p>
                  <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{emp.groupName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Workbench Grid: Left = Employee Roster & Task Input; Right = Visual HTML Deliverable */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
        {/* Left Column: Employee Selection & Task Form */}
        <div className="space-y-4">
          {/* Employee Group Filter */}
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

          {/* Employee Cards Slider / Grid */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmployee.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
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

          {/* Interactive Task Form */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedEmployee.avatar}</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    派活任务台：【{selectedEmployee.name}】
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    #{selectedEmployee.number}号专职员工 · {selectedEmployee.title}
                  </p>
                </div>
              </div>
              <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px]" variant="outline">
                输出格式: 可视化 HTML
              </Badge>
            </div>

            {/* Quick preset chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-sky-600" /> 快捷场景填充：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SCENARIOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(p.query);
                      setExtraNotes(p.notes);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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

        {/* Right Column: Visual HTML Deliverable Cards (彻底替换 Markdown 纯文本) */}
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
                    `${deliverable.title}\n${deliverable.summary}\n\n【关键数据】：\n${deliverable.keyInsights.map((k) => `• ${k.label}: ${k.value}`).join("\n")}\n\n【成单策略】：\n${deliverable.strategicPitches.map((p) => `• ${p.title}: ${p.desc}`).join("\n")}`,
                    "full_deliverable",
                  )
                }
                className="rounded-xl border-slate-200 text-xs h-7 text-slate-600 hover:text-slate-900"
              >
                {copiedKey === "full_deliverable" ? (
                  <>
                    <Check className="mr-1 h-3 w-3 text-emerald-600" /> 已复制全部结果
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" /> 一键复制报告
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Visual Deliverable Showcase Card */}
          {deliverable ? (
            <Card className="rounded-3xl border border-sky-200/80 bg-white p-5 shadow-sm space-y-5 animate-in fade-in duration-300">
              {/* Deliverable Header */}
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

              {/* Executive Summary Banner */}
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/90 to-blue-50/50 p-4 text-xs text-sky-950 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  <span>核心研判与商业结论：</span>
                </div>
                <p className="text-slate-700">{deliverable.summary}</p>
              </div>

              {/* Key Insights Matrix (4 Visual Cards) */}
              {deliverable.keyInsights.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-sky-600" /> 关键洞察与画像参数矩阵
                  </h5>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {deliverable.keyInsights.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 space-y-1 hover:border-sky-200 transition-all"
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
                </div>
              )}

              {/* Strategic Pitches: MGOO Winning Playbook */}
              {deliverable.strategicPitches.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-600" /> MGOO 专属成单打法与破冰策略
                  </h5>
                  <div className="space-y-2">
                    {deliverable.strategicPitches.map((pitch, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white text-[9px]">
                              {idx + 1}
                            </span>
                            {pitch.title}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                            {pitch.highlight}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{pitch.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready-to-Use Outreach Templates (with One-Click Copy) */}
              {deliverable.outreachTemplates && deliverable.outreachTemplates.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-sky-600" /> 即用型高转化率话术 / 开发信模版
                    </h5>
                    <span className="text-[10px] text-slate-400">已结合 16 年外贸实战打磨</span>
                  </div>

                  {/* Template tabs if multiple */}
                  {deliverable.outreachTemplates.length > 1 && (
                    <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
                      {deliverable.outreachTemplates.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTemplateTab(idx)}
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-medium transition-all ${
                            activeTemplateTab === idx
                              ? "bg-sky-500 text-white font-semibold shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {t.styleName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active template display */}
                  {deliverable.outreachTemplates[activeTemplateTab] && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {deliverable.outreachTemplates[activeTemplateTab].channel} 触达模版
                          </span>
                          {deliverable.outreachTemplates[activeTemplateTab].subject && (
                            <span className="text-slate-400 truncate max-w-[200px]">
                              主题：{deliverable.outreachTemplates[activeTemplateTab].subject}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              deliverable.outreachTemplates![activeTemplateTab].content,
                              `template_${activeTemplateTab}`,
                            )
                          }
                          className="rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[10px] h-7 px-2.5"
                        >
                          {copiedKey === `template_${activeTemplateTab}` ? (
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

                      <pre className="font-sans whitespace-pre-wrap leading-relaxed text-[11px] text-slate-200 selection:bg-sky-500 selection:text-white">
                        {deliverable.outreachTemplates[activeTemplateTab].content}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Next Actions Checklist */}
              {deliverable.nextActionChecklist.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 建议业务员立即执行的下一步动作
                  </h5>
                  <div className="space-y-1.5">
                    {deliverable.nextActionChecklist.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100"
                      >
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className="font-medium">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /* Loading / Empty Deliverable Skeleton */
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
  );
}
