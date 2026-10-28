"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Bot,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { BUYER_PERSONAS, BuyerPersona, CoachEvaluation } from "@/lib/training-types";

export function SalesTrainingView() {
  const [personas, setPersonas] = useState<BuyerPersona[]>(BUYER_PERSONAS);
  const [activePersona, setActivePersona] = useState<BuyerPersona>(BUYER_PERSONAS[0]);
  const [messages, setMessages] = useState<{ role: "buyer" | "rep"; content: string; time: string }[]>([
    {
      role: "buyer",
      content: BUYER_PERSONAS[0].initialMessage,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CoachEvaluation | null>(null);

  const handleSelectPersona = (p: BuyerPersona) => {
    setActivePersona(p);
    setEvaluation(null);
    setMessages([
      {
        role: "buyer",
        content: p.initialMessage,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isReplying) return;

    const repMsg = inputText.trim();
    const newMessages = [
      ...messages,
      {
        role: "rep" as const,
        content: repMsg,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setMessages(newMessages);
    setInputText("");
    setIsReplying(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/training/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buyer_turn",
          personaId: activePersona.id,
          history,
          latestRepMessage: repMsg,
        }),
      });

      const json = await res.json() as { data?: { reply?: string } };
      const reply = json.data?.reply || "Thanks for the info! Can you send me photos of the fabric weights?";

      setMessages((prev) => [
        ...prev,
        {
          role: "buyer",
          content: reply,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleEvaluate = async () => {
    if (messages.length < 2 || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const dialogue = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/training/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          personaId: activePersona.id,
          dialogue,
        }),
      });

      const json = await res.json() as { data?: CoachEvaluation };
      if (json.data) {
        setEvaluation(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setMessages([
      {
        role: "buyer",
        content: activePersona.initialMessage,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-950 via-[#0a271c] to-[#071a13] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> MGOO 金牌外贸业务实战陪练系统
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI 买家高仿对练 · 零成本快速练出销冠</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-emerald-100/70 sm:text-sm">
            内置欧美高频真实买家模型（美潮主理人、英国瑜伽馆馆长、严苛压价采购等）。模拟真实 WhatsApp 节奏与异议，AI 金牌教练 4 维度深度诊断，输出示范话术。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            onClick={handleEvaluate}
            disabled={messages.length < 2 || isEvaluating}
            className="rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 shadow-md hover:bg-emerald-300"
          >
            {isEvaluating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Award className="mr-2 h-4 w-4" />
            )}
            AI 教练诊断打分
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> 重新开始
          </Button>
        </div>
      </section>

      {/* Main Grid: Personas & Chat */}
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Column: Persona Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">选择实战对练客户</h3>
            <span className="text-xs text-slate-400">{personas.length} 个典型买家场景</span>
          </div>

          <div className="space-y-3">
            {personas.map((p) => {
              const active = p.id === activePersona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.title} · {p.brand}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        p.difficulty === "beginner"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : p.difficulty === "intermediate"
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-rose-300 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {p.difficulty === "beginner" ? "入门" : p.difficulty === "intermediate" ? "中阶" : "高难谈判"}
                    </Badge>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {p.scenario}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                    <span>目标品类: {p.targetProduct}</span>
                    <span className="font-medium text-emerald-600">选择对练 →</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Persona Context Card */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> 买家核心隐蔽需求与底线
            </h4>
            <div className="mt-2 space-y-1.5 text-xs text-slate-600">
              <p>• 心理预算：<span className="font-semibold text-slate-800">{activePersona.hiddenConstraints.budgetPerPiece}</span></p>
              <p>• 首单计划：<span className="font-semibold text-slate-800">{activePersona.hiddenConstraints.maxFirstOrder} 件以内</span></p>
              <p>• 最大顾虑：{activePersona.hiddenConstraints.concerns.join("、")}</p>
              <p>• 样品付费意愿：{activePersona.hiddenConstraints.willingToPaySample ? "愿意付费（看重质感与交期）" : "倾向免样品费或大货抵扣"}</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Chat & Evaluation */}
        <div className="flex flex-col space-y-4">
          {/* Chat Window */}
          <Card className="flex h-[520px] flex-col rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activePersona.avatar}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{activePersona.name}</p>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                      在线模拟
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{activePersona.brand} · {activePersona.country}</p>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                对话轮数: <span className="font-semibold text-slate-700">{Math.floor(messages.length / 2)}</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m, idx) => {
                const isBuyer = m.role === "buyer";
                return (
                  <div key={idx} className={`flex items-start gap-3 ${isBuyer ? "" : "flex-row-reverse"}`}>
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        isBuyer ? "bg-slate-100 text-slate-700" : "bg-[#071a13] text-emerald-300"
                      }`}
                    >
                      {isBuyer ? activePersona.avatar : "业务"}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      isBuyer
                        ? "bg-slate-100/80 text-slate-800 rounded-tl-sm"
                        : "bg-[#0b241b] text-white rounded-tr-sm"
                    }`}>
                      <p>{m.content}</p>
                      <span className={`mt-1 block text-[9px] ${isBuyer ? "text-slate-400" : "text-emerald-200/60"}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isReplying && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="animate-spin text-sm">⏳</span> {activePersona.name} 正在输入...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-3.5">
              <div className="flex items-end gap-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入你的业务回复（支持英文或中英文混合沟通，Enter 发送）…"
                  className="min-h-[58px] resize-none rounded-2xl border-slate-200 bg-white text-xs shadow-none focus-visible:ring-emerald-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isReplying}
                  className="h-[58px] rounded-2xl bg-[#0b241b] px-5 text-white hover:bg-[#123829]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                💡 贴士：可主动询问买家 Instagram 链接、目标发售时间，或告知 MGOO 卫衣 350-400g 现胚 30-50 件起订。
              </p>
            </div>
          </Card>

          {/* AI Coach Evaluation Panel (shown when evaluated) */}
          {evaluation && (
            <Card className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-md space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 font-black text-xl text-white shadow-sm">
                    {evaluation.grade}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">AI 销售教练综合诊断报告</h3>
                    <p className="text-xs text-slate-500">综合得分：<span className="font-bold text-emerald-600 text-sm">{evaluation.score} / 100</span></p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1 px-3">
                  {evaluation.summary}
                </Badge>
              </div>

              {/* 4 Dimension Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">需求挖掘</span>
                    <span className="font-bold text-slate-800">{evaluation.dimensionScores.discovery}分</span>
                  </div>
                  <Progress value={evaluation.dimensionScores.discovery} className="h-1.5" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">异议化解</span>
                    <span className="font-bold text-slate-800">{evaluation.dimensionScores.objectionHandling}分</span>
                  </div>
                  <Progress value={evaluation.dimensionScores.objectionHandling} className="h-1.5" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">产品专业度</span>
                    <span className="font-bold text-slate-800">{evaluation.dimensionScores.productKnowledge}分</span>
                  </div>
                  <Progress value={evaluation.dimensionScores.productKnowledge} className="h-1.5" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">推进成单</span>
                    <span className="font-bold text-slate-800">{evaluation.dimensionScores.closingTechnique}分</span>
                  </div>
                  <Progress value={evaluation.dimensionScores.closingTechnique} className="h-1.5" />
                </div>
              </div>

              {/* Highlights & Improvements */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 本轮表现亮点
                  </h4>
                  <ul className="space-y-1.5 text-emerald-800">
                    {evaluation.highlights.map((h, i) => (
                      <li key={i}>• {h}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-600" /> 销冠进阶改进建议
                  </h4>
                  <ul className="space-y-1.5 text-amber-800">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gold Model Reply */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  🏆 MGOO 销冠示范话术 (Gold Standard Reply)
                </p>
                <p className="text-xs font-mono leading-relaxed text-slate-200 bg-black/40 p-3 rounded-xl border border-white/10 select-all">
                  {evaluation.recommendedModelReply}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
