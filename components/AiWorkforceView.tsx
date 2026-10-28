"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  Flame,
  Layers,
  Play,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_WORKFORCE, AIEmployee } from "@/lib/workforce-types";

export function AiWorkforceView() {
  const [employees, setEmployees] = useState<AIEmployee[]>(AI_WORKFORCE);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee>(AI_WORKFORCE[0]);
  const [inputQuery, setInputQuery] = useState("Kith / Represent Clo 风格欧美初创街头潮牌，咨询 400g 卫衣");
  const [extraNotes, setExtraNotes] = useState("关注工艺：做旧水洗、发泡印花，首批起订量 50 件，要求 DDP 空运至加州");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ result: string; highlights: string[] } | null>(null);

  const handleRunEmployee = async () => {
    if (!inputQuery.trim() || isExecuting) return;
    setIsExecuting(true);
    setExecutionResult(null);

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

      const json = await res.json() as { data?: { result: string; highlights: string[] } };
      if (json.data) {
        setExecutionResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-purple-200/60 bg-gradient-to-r from-slate-950 via-[#190d2e] to-[#0c051a] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30">
            <Users className="h-3.5 w-3.5" /> 微信官方报道架构升级版：6+2 AI 外贸数字团队
          </div>
          <h2 className="text-2xl font-bold tracking-tight">打造 24 小时不下班的 MGOO 智能外贸数字兵团</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-purple-100/70 sm:text-sm">
            基于微信外贸热文架构全面升级。将业务员从找名单、查背景、判采购时机、找决策人、写开发信等繁重重复劳动中彻底解放，配合 MGOO 专属夜间接单与销售对练，专注于高价值成交！
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Badge variant="outline" className="border-purple-400/40 bg-purple-500/10 text-purple-300 text-xs py-1.5 px-3">
            8 位专职 AI 员工全员在线
          </Badge>
        </div>
      </section>

      {/* Synergistic Workflow Pipeline Banner */}
      <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          🔄 8 大 AI 员工全链路自动化协作流水线
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { num: "1号", name: "市场情报员", tag: "发现商机" },
            { num: "2号", name: "ICP筛选员", tag: "线索分级" },
            { num: "3号", name: "客户研究员", tag: "穿透画像" },
            { num: "4号", name: "采购信号员", tag: "时机捕捉" },
            { num: "5号", name: "决策链挖掘", tag: "找拍板人" },
            { num: "6号", name: "个性开发信", tag: "精准触达" },
            { num: "7号", name: "夜间助攻员", tag: "24h留单" },
            { num: "8号", name: "销售教练", tag: "新业务陪练" },
          ].map((step, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedEmployee(employees[idx])}
              className={`cursor-pointer rounded-2xl border p-2.5 transition-all ${
                selectedEmployee.id === employees[idx]?.id
                  ? "border-purple-500 bg-purple-50 text-purple-900 shadow-sm"
                  : "border-slate-100 bg-slate-50/60 hover:border-slate-200"
              }`}
            >
              <span className="text-[10px] font-bold text-purple-600 block">{step.num}</span>
              <p className="font-bold text-slate-800 text-[11px] mt-0.5">{step.name}</p>
              <span className="text-[9px] text-slate-400 block mt-1">{step.tag}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Grid: Employee Cards & Task Execution Bench */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        {/* Left: 8 Employee Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">AI 外贸员工清单 (点击选择任一员工派单)</h3>
            <span className="text-xs text-slate-400">8/8 在岗</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {employees.map((emp) => {
              const isSelected = emp.id === selectedEmployee.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setExecutionResult(null);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{emp.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                          <span className="text-[10px] font-mono text-purple-600">#{emp.number}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{emp.title}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                      就绪
                    </Badge>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {emp.roleDescription}
                  </p>

                  <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">📦 {emp.coreDeliverable}</span>
                    <span className="font-semibold text-purple-600 shrink-0">点击派单 →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Task Execution Panel */}
        <div className="space-y-4">
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-3xl">{selectedEmployee.avatar}</span>
              <div>
                <h3 className="font-bold text-slate-900">派发任务给【{selectedEmployee.name}】</h3>
                <p className="text-xs text-slate-400">{selectedEmployee.title} · #{selectedEmployee.number}号数字员工</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">目标分析对象（买家官网 / 品牌名 / 询盘消息）</label>
                <Input
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="例如：https://kith.com 或 美潮新品牌找 400g 卫衣工厂"
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">补充业务诉求与重点工艺</label>
                <Textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="例如：主推 350-400gsm 纯棉卫衣，30-50 件低起订量现胚，要求 DDP 空运"
                  className="min-h-[70px] resize-none rounded-xl border-slate-200 text-xs"
                />
              </div>

              <Button
                onClick={handleRunEmployee}
                disabled={!inputQuery.trim() || isExecuting}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-500 hover:to-indigo-500"
              >
                {isExecuting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4 fill-white" />
                )}
                {isExecuting ? "AI 员工分析中..." : `立即交由 ${selectedEmployee.name} 执行`}
              </Button>
            </div>

            {/* Result Box */}
            {executionResult && (
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 交付物已就绪
                  </h4>
                  <div className="flex gap-1">
                    {executionResult.highlights.map((h, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] border-purple-200 bg-white text-purple-700">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-purple-100 text-xs text-slate-800 leading-relaxed font-sans max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {executionResult.result}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
