"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  Clock3,
  ContactRound,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Gauge,
  Headphones,
  Inbox,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { channelMeta, demoAccounts, demoConversations, demoRules, trend } from "@/lib/demo-data";
import { SalesTrainingView } from "@/components/SalesTrainingView";
import { NightWatchdogView } from "@/components/NightWatchdogView";
import { EccangAnalyticsView } from "@/components/EccangAnalyticsView";
import { AiWorkforceView } from "@/components/AiWorkforceView";
import { GuideCenterView } from "@/components/GuideCenterView";

type View =
  | "overview"
  | "training"
  | "nightmode"
  | "eccang"
  | "workforce"
  | "inbox"
  | "accounts"
  | "leads"
  | "guide"
  | "agents"
  | "rules"
  | "audit"
  | "settings";
type Conversation = (typeof demoConversations)[number];
type Account = (typeof demoAccounts)[number];
type AuditEvent = { id: string; time: string; icon: typeof Database; action: string; detail: string; status: string };
type AgentRun = { id: string; customer: string; skill: string; result: string; state: string };
type DashboardPayload = { mode?: string; conversations?: Conversation[]; leads?: Conversation[]; accounts?: Account[]; trend?: typeof trend };
type ActivityPayload = { audit?: Record<string, unknown>[]; runs?: Record<string, unknown>[]; summary?: { events: number; drafts: number; sent: number; humanReview: number } };

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute: (input: Record<string, unknown>) => unknown;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

interface NavItem {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupLabel: "经营大盘",
    items: [
      { id: "overview", label: "运营总览", icon: LayoutDashboard },
      { id: "eccang", label: "易仓 2C 经营分析", icon: BarChart3, badge: "ERP" },
    ],
  },
  {
    groupLabel: "AI 员工与实战",
    items: [
      { id: "workforce", label: "AI 外贸员工团队", icon: Users, badge: "8人" },
      { id: "training", label: "销售实战对练", icon: Sparkles, badge: "对练" },
      { id: "nightmode", label: "夜间托管与交接", icon: Moon, badge: "24H" },
    ],
  },
  {
    groupLabel: "客户与多渠道",
    items: [
      { id: "inbox", label: "统一收件箱", icon: Inbox },
      { id: "leads", label: "客户开发看板", icon: Target },
      { id: "accounts", label: "渠道账号监控", icon: Activity },
    ],
  },
  {
    groupLabel: "规则与系统",
    items: [
      { id: "guide", label: "对接与教程中心", icon: BookOpen, badge: "一键接入" },
      { id: "agents", label: "智能体中心", icon: Bot },
      { id: "rules", label: "自动回复规则", icon: Workflow },
      { id: "audit", label: "审计记录", icon: FileText },
      { id: "settings", label: "接入设置", icon: Settings2 },
    ],
  },
];

const headings: Record<View, { eyebrow: string; title: string; copy: string }> = {
  overview: { eyebrow: "今日运营", title: "把每一条消息，变成可跟进的机会", copy: "统一查看渠道状态、回复效率和客户推进情况。" },
  training: { eyebrow: "业务实战训练", title: "AI 买家高仿对练 · 零成本练出销冠", copy: "模拟真实欧美买家对话，智能评估业务员 4 大维度技能并输出金牌示范话术。" },
  nightmode: { eyebrow: "24H 智能守候", title: "夜间自动托管 & 3分钟超时智能兜底", copy: "设置下班与周末自动接管时段，早晨自动生成《晨间销售交接清单》助力开单。" },
  eccang: { eyebrow: "跨境 2C 协同", title: "易仓 ERP 2C 销售与经营数据中台", copy: "查看多渠道动销与库存，将 2C 爆款热销数据作为 2B 批发业务员成单武器。" },
  workforce: { eyebrow: "数字团队", title: "6+2 AI 外贸全链路员工兵团", copy: "市场情报、ICP筛选、深度背调、采购信号、决策人挖掘、个性开发信协同推进。" },
  inbox: { eyebrow: "实时会话", title: "统一收件箱", copy: "集中处理已接入 SaleSmartly 的客户消息。" },
  accounts: { eyebrow: "渠道健康", title: "账号与连接", copy: "监控已识别账号、未读消息与异常连接。" },
  leads: { eyebrow: "销售协同", title: "客户开发看板", copy: "用明确阶段管理线索，不把自动化变成无差别群发。" },
  guide: { eyebrow: "智能体连接与教程", title: "Codex & WorkBuddy 对接与指令中心", copy: "标准 MCP 配置、外贸操盘官 Skill 提示词与一键复制指令，秒级打通跨系统自动化。" },
  agents: { eyebrow: "Codex Skills", title: "智能体中心", copy: "每条入站消息先路由到专业 Skill，再经过安全门生成草稿或回复。" },
  rules: { eyebrow: "安全自动化", title: "自动回复规则", copy: "默认生成草稿；只有通过审核的规则才允许自动发送。" },
  audit: { eyebrow: "可追溯", title: "操作与发送记录", copy: "记录同步、规则命中、草稿与人工发送结果。" },
  settings: { eyebrow: "SaleSmartly", title: "接入设置", copy: "核对套餐、密钥、Webhook 与发送模式。" },
};

function ChannelMark({ channel, size = "md" }: { channel: number; size?: "sm" | "md" | "lg" }) {
  const item = channelMeta[channel] ?? { name: "其他", color: "#64748b", short: "?" };
  const dimensions = size === "lg" ? "h-11 w-11 text-sm" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return <span title={item.name} className={`${dimensions} grid shrink-0 place-items-center rounded-xl font-bold text-white shadow-sm`} style={{ backgroundColor: item.color }}>{item.short}</span>;
}

function StatusDot({ status }: { status: string }) {
  const tone = status === "online" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-slate-400";
  return <span className={`inline-block h-2 w-2 rounded-full ${tone}`} />;
}

function MetricCard({ icon: Icon, label, value, note, accent = "emerald" }: { icon: typeof Inbox; label: string; value: string; note: string; accent?: "emerald" | "amber" | "blue" | "violet" }) {
  const colors = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", blue: "bg-sky-50 text-sky-700", violet: "bg-violet-50 text-violet-700" };
  return (
    <article className="metric-card">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl ${colors[accent]}`}><Icon className="h-5 w-5" /></div>
      <div className="mt-7 flex items-end justify-between gap-3">
        <div><p className="text-[13px] text-slate-500">{label}</p><p className="mt-1 text-[30px] font-semibold tracking-[-0.04em] text-slate-950">{value}</p></div>
        <span className="mb-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">{note}</span>
      </div>
    </article>
  );
}

function ConversationRow({ item, active, onClick }: { item: Conversation; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`conversation-row ${active ? "conversation-row-active" : ""}`}>
      <div className="relative"><ChannelMark channel={item.channel} /><span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${item.online ? "bg-emerald-500" : "bg-slate-300"}`} /></div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-900">{item.name}</p><span className="shrink-0 text-[11px] text-slate-400">{item.time}</span></div>
        <div className="mt-1 flex items-center justify-between gap-3"><p className="truncate text-xs text-slate-500">{item.message}</p>{item.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">{item.unread}</span>}</div>
      </div>
    </button>
  );
}

function Overview({ onOpenInbox, accounts, conversations, trendData, summary, leadsCount }: { onOpenInbox: () => void; accounts: Account[]; conversations: Conversation[]; trendData: typeof trend; summary: { events: number; drafts: number; sent: number; humanReview: number }; leadsCount: number }) {
  const [overviewTab, setOverviewTab] = useState<"dashboard" | "analytics" | "table">("dashboard");
  const [pipelinePeriod, setPipelinePeriod] = useState<"30" | "quarter" | "year">("30");

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200/70 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setOverviewTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              overviewTab === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            看板总览 (Dashboard)
          </button>
          <button
            onClick={() => setOverviewTab("analytics")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              overviewTab === "analytics"
                ? "bg-slate-900 text-white shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            漏斗深度分析 (Analytics)
          </button>
          <button
            onClick={() => setOverviewTab("table")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              overviewTab === "table"
                ? "bg-slate-900 text-white shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            推进流水表 (Pipeline Table)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>全品类外贸线</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>近 90 天</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs">
            <Download className="h-3.5 w-3.5" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* ================= MODE 1: DASHBOARD (Screenshot 3) ================= */}
      {overviewTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top KPI Metrics Row (6 white cards + 1 Sky Blue Highlight Card) */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 items-stretch">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">今日新线索</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">128</span>
                <span className="inline-flex items-center text-[11px] font-semibold text-sky-600">
                  ↗ 12%
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">活跃商机会话</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">38</span>
                <span className="inline-flex items-center text-[11px] font-semibold text-sky-600">
                  ↗ 6
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">打样看样排期</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">12</span>
                <span className="inline-flex items-center text-[11px] font-semibold text-sky-600">
                  ↗ 3
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">深度商务核价</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">24</span>
                <span className="inline-flex items-center text-[11px] font-semibold text-sky-600">
                  ↗ 4
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">晨间待交接单</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">9</span>
                <span className="inline-flex items-center text-[11px] font-semibold text-slate-400">
                  ↘ 2
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500">重点复购返单</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-950">17</span>
                <span className="text-[11px] font-medium text-slate-400">90 天周期</span>
              </div>
            </div>

            {/* Right Highlight Card in Soft Sky Blue */}
            <div className="rounded-2xl border border-sky-200/90 bg-sky-100/85 p-4 text-sky-950 shadow-2xs flex flex-col justify-between relative overflow-hidden sm:col-span-2 lg:col-span-4 xl:col-span-1">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-sky-900">全链路成单转化</span>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-sky-800 shadow-2xs">
                    ✦ AI 运行中
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-sky-950">8.6%</span>
                  <span className="text-xs font-bold text-sky-700">↗ 1.2 pts</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-tight text-sky-800/85">
                来自 1,482 条线索的 128 笔实际大单。AI 接管前为 7.4%。
              </p>
              {/* Upward sparkline curve */}
              <div className="mt-2 h-6 w-full">
                <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 20 Q 25 18, 45 14 T 75 9 T 100 3"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="3" r="2.5" fill="#0284c7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Middle Section: Leasing / Sales pipeline Funnel Cards (Screenshot 3) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  外贸全链路推进管道 (Sales pipeline)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  新入站线索到最终大货成交 · 全品类实时漏斗
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setPipelinePeriod("30")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    pipelinePeriod === "30" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  近 30 天
                </button>
                <button
                  onClick={() => setPipelinePeriod("quarter")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    pipelinePeriod === "quarter" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  本季度
                </button>
                <button
                  onClick={() => setPipelinePeriod("year")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    pipelinePeriod === "year" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  本年度
                </button>
              </div>
            </div>

            {/* 6 Stage Funnel Cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {/* Stage 1: New Lead */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900 px-2 py-0.5 rounded-full bg-white border border-slate-200/80">
                    新入站
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">62% &gt;</span>
                </div>
                <div className="h-10 w-full rounded-xl striped-bar border border-slate-200/70" />
                <div>
                  <p className="text-xl font-bold text-slate-950">128</p>
                  <p className="text-[11px] text-slate-500 font-medium">位意向买家</p>
                </div>
              </div>

              {/* Stage 2: Qualified */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">需求初筛</span>
                  <span className="text-[11px] font-semibold text-slate-400">58% &gt;</span>
                </div>
                <div className="h-10 w-full rounded-xl striped-bar border border-slate-200/70" />
                <div>
                  <p className="text-xl font-bold text-slate-950">79</p>
                  <p className="text-[11px] text-slate-500 font-medium">位合格客户</p>
                </div>
              </div>

              {/* Stage 3: Tours / Samples */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">打样看样</span>
                  <span className="text-[11px] font-semibold text-slate-400">52% &gt;</span>
                </div>
                <div className="h-10 w-full rounded-xl striped-bar border border-slate-200/70" />
                <div>
                  <p className="text-xl font-bold text-slate-950">46</p>
                  <p className="text-[11px] text-slate-500 font-medium">份样衣寄送</p>
                </div>
              </div>

              {/* Stage 4: Applied / Quoted */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">核价报价</span>
                  <span className="text-[11px] font-semibold text-slate-400">63% &gt;</span>
                </div>
                <div className="h-10 w-full rounded-xl striped-bar border border-slate-200/70" />
                <div>
                  <p className="text-xl font-bold text-slate-950">24</p>
                  <p className="text-[11px] text-slate-500 font-medium">份大货报价</p>
                </div>
              </div>

              {/* Stage 5: Approved */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">样衣确认</span>
                  <span className="text-[11px] font-semibold text-slate-400">73% &gt;</span>
                </div>
                <div className="h-10 w-full rounded-xl striped-bar border border-slate-200/70" />
                <div>
                  <p className="text-xl font-bold text-slate-950">15</p>
                  <p className="text-[11px] text-slate-500 font-medium">份合同审核</p>
                </div>
              </div>

              {/* Stage 6: Bulk Leased (Sky Blue Highlight) */}
              <div className="rounded-2xl border border-sky-300 bg-sky-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full bg-slate-900">
                    大货成交
                  </span>
                  <span className="text-[11px] font-bold text-sky-800">8.6% 整体转化</span>
                </div>
                <div className="h-10 w-full rounded-xl bg-sky-400 border border-sky-500/40 shadow-xs" />
                <div>
                  <p className="text-xl font-extrabold text-slate-950">11</p>
                  <p className="text-[11px] text-sky-900 font-semibold">笔批量大单</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Working Grid (Screenshot 3) */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Column 1: Today's schedule / tours */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">今日打样与沟通日程</h4>
                  <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                    全部日程 &gt;
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">10:30 AM · Marcus Vance</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">RAW DISCIPLINE LA · 380g 连帽卫衣做旧确认</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      ● 已确认
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">12:00 PM · Chloe Evans</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">LUMEN Active London · 裸感提臀瑜伽裤防透打样</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      ● 已确认
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">2:30 PM · David Miller</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Apex Athletic Sydney · 1,000 件定金与空运谈判</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-[10px] font-semibold text-sky-700 border border-sky-200">
                      ● 已安排
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">4:30 PM · Tom Becker</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">欧美街潮品牌 · 50 件现胚发泡印花排期</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-[10px] font-semibold text-amber-700 border border-amber-200">
                      ● 改期谈判
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">今日快捷开放时段：</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="px-2.5 py-1 rounded-xl border border-dashed border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-slate-400">
                    + 10:00 AM
                  </button>
                  <button className="px-2.5 py-1 rounded-xl border border-dashed border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-slate-400">
                    + 14:00 PM
                  </button>
                  <button className="px-2.5 py-1 rounded-xl border border-dashed border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-slate-400">
                    + 16:30 PM
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: AI conversations to review (4 waiting) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">AI 会话待人工复核</h4>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                      4 待处理
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">已触发风控或特批规则，暂缓发送等待确认</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                        MV
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Marcus Vance</p>
                        <p className="text-[10px] text-slate-400">RAW DISCIPLINE (LA)</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">4 分钟前</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;Can you waive the $80 sample fee if we commit to 50 hoodies upfront?&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                        起订量/样品费特批
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-medium">
                        高意向 A级
                      </span>
                    </div>
                    <button
                      onClick={onOpenInbox}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 shadow-2xs"
                    >
                      复核回复
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-white text-[10px] font-bold">
                        CE
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Chloe Evans</p>
                        <p className="text-[10px] text-slate-400">LUMEN Active (London)</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">12 分钟前</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;Need 100% squat proof guarantee. Can you send test report certificate?&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-medium">
                        防透质检报告
                      </span>
                    </div>
                    <button
                      onClick={onOpenInbox}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 shadow-2xs"
                    >
                      复核回复
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-700 text-white text-[10px] font-bold">
                        DM
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">David Miller</p>
                        <p className="text-[10px] text-slate-400">Apex Athletic (Sydney)</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">18 分钟前</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;I need to speak with a human rep regarding 1,000 pcs DDP terms...&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                        买家要求转人工
                      </span>
                    </div>
                    <button
                      onClick={onOpenInbox}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 shadow-2xs"
                    >
                      接入会话
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Actionable follow-ups & operational reminders */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">业务协同与预警待办</h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-amber-200/70 bg-amber-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">资料待补齐买家 (5 &gt;)</span>
                    <span className="text-[10px] font-semibold text-amber-700">需推进</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Marcus Vance · RAW DISCIPLINE</span>
                      <span className="text-amber-800 font-medium">缺矢量印花稿</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chloe Evans · LUMEN Active</span>
                      <span className="text-amber-800 font-medium">缺寄样邮编地址</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">重点买家到期跟进 (6 &gt;)</span>
                    <span className="text-[10px] font-semibold text-slate-400">返单节点</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Robert Lang · Finch &amp; Ninth</span>
                      <span className="text-slate-500 font-medium">交期后 28 天 · 追翻单</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace Kim · Oakline Lofts</span>
                      <span className="text-slate-500 font-medium">秋季新品排期 34 天</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-sky-200/80 bg-sky-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-950">易仓 2C 爆款库存预警 (8 &gt;)</span>
                    <span className="text-[10px] font-semibold text-sky-700">供应链联动</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>美西洛杉矶海外仓 · 240g 短袖</span>
                      <span className="text-rose-600 font-bold">仅剩 6 天现胚</span>
                    </div>
                    <div className="flex justify-between">
                      <span>东莞总仓 · 380g 纯棉毛圈布</span>
                      <span className="text-amber-700 font-medium">需下达 5 吨定织</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 2: ANALYTICS (Screenshot 1) ================= */}
      {overviewTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] items-stretch">
            {/* Left: Leasing Funnel Chart */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    外贸转化全流程漏斗 (Leasing funnel)
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Jun 23 to Sep 21 · 全部海外渠道与买家线索
                  </p>
                </div>
                <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200/80 text-xs font-semibold">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white">全渠道来源</span>
                  <span className="px-3 py-1 text-slate-500">按细分来源</span>
                </div>
              </div>

              {/* Horizontal Striped Funnel Bars */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24">新入站线索</span>
                  <div className="flex-1 h-9 rounded-xl striped-bar border border-slate-200/80" />
                  <span className="w-16 text-right font-extrabold text-slate-900 text-sm">1,482</span>
                  <span className="w-12 text-right text-slate-400 text-[11px]">—</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24">需求初筛合格</span>
                  <div className="w-[62%] h-9 rounded-xl striped-bar border border-slate-200/80" />
                  <span className="w-16 text-right font-extrabold text-slate-900 text-sm">918</span>
                  <span className="w-12 text-right text-slate-500 text-[11px]">↘ 62%</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24">看样与打样</span>
                  <div className="w-[36%] h-9 rounded-xl striped-bar border border-slate-200/80" />
                  <span className="w-16 text-right font-extrabold text-slate-900 text-sm">531</span>
                  <span className="w-12 text-right text-slate-500 text-[11px]">↘ 58%</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24">核价方案提交</span>
                  <div className="w-[19%] h-9 rounded-xl striped-bar border border-slate-200/80" />
                  <span className="w-16 text-right font-extrabold text-slate-900 text-sm">276</span>
                  <span className="w-12 text-right text-slate-500 text-[11px]">↘ 52%</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24">合同与样衣核定</span>
                  <div className="w-[12%] h-9 rounded-xl striped-bar border border-slate-200/80" />
                  <span className="w-16 text-right font-extrabold text-slate-900 text-sm">172</span>
                  <span className="w-12 text-right text-slate-500 text-[11px]">↘ 62%</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="w-24 text-sky-900">大货成交签单</span>
                  <div className="w-[9%] h-9 rounded-xl bg-sky-400 border border-sky-500/30 shadow-xs" />
                  <span className="w-16 text-right font-extrabold text-sky-950 text-sm">128</span>
                  <span className="w-12 text-right text-sky-700 font-bold text-[11px]">↘ 74%</span>
                </div>
              </div>

              {/* Bottom Summary Metrics */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">线索到看样转化率</p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">35.8%</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">看样到方案报价转化</p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">52.0%</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">报价到大货签单转化</p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">46.4%</p>
                </div>
              </div>
            </div>

            {/* Right: Big Sky Blue Highlight Overall Conversion Card */}
            <div className="rounded-3xl border border-sky-200/90 bg-sky-100/90 p-6 text-sky-950 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                    全链路成单转化率 (Overall conversion)
                  </span>
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 shadow-2xs">
                    ✦ AI 运行中 (自 6月1日)
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-black tracking-tight text-sky-950">8.6%</span>
                  <span className="text-sm font-bold text-sky-700">↗ 1.2 pts</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-sky-900/85">
                  128 笔大货订单转化自 1,482 条入站商机。在引入 MGOO AI 营销管家前，季度历史平均转化率为 7.4%。
                </p>
              </div>

              {/* Monthly Trend Area Chart */}
              <div className="mt-6 pt-4 border-t border-sky-200/60">
                <p className="text-[11px] font-semibold text-sky-800 mb-2">过去 6 个月成单转化趋势：</p>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 4, right: 0, bottom: 0, left: -30 }}>
                      <defs>
                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        fill="url(#skyGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards: AI Performance & Leasing Operations */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* AI Performance Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI 自动化运行效能</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">智能应答、意图路由与人工交接效率</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                  ✦ MGOO AI
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">AI 自动应答率</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">97%</p>
                  <span className="text-[10px] text-sky-600 font-semibold">↗ 2 pts</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">转人工干预率</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">11%</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">↘ 3 pts (更少打扰)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">平均应答耗时</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">42 秒</p>
                  <span className="text-[10px] text-sky-600 font-semibold">↘ 18 秒 (极速响应)</span>
                </div>
              </div>
            </div>

            {/* Leasing Operations Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">外贸履约与服务表现</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">样衣打样、核价审批与客户复购返单</p>
                </div>
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                  详情 &gt;
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">样衣看样爽约率</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">9%</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">↘ 4 pts (按时看样)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">报价方案完成率</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">81%</p>
                  <span className="text-[10px] text-sky-600 font-semibold">↗ 9 pts</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">老客复购翻单率</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">72%</p>
                  <span className="text-[10px] text-sky-600 font-semibold">↗ 5 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 3: PIPELINE TABLE (Screenshot 2) ================= */}
      {overviewTab === "table" && (
        <div className="space-y-5">
          {/* Top Step Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">● 90 天到期返单</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">6</p>
              <p className="text-[10px] text-slate-400 mt-0.5">AI 计划于 9月24日 启动触达</p>
            </div>

            <div className="rounded-2xl border border-sky-300 bg-sky-50/70 p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-900">开发信已发送</span>
              <p className="mt-1 text-2xl font-extrabold text-sky-950">4</p>
              <p className="text-[10px] text-sky-700 font-medium mt-0.5">2 家尚未回复</p>
            </div>

            <div className="rounded-2xl border-2 border-slate-900 bg-white p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-900">● 商务谈判中</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">3</p>
              <p className="text-[10px] text-slate-500 mt-0.5">$7,250 预期月度订单额</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">● 打样已确认</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">2</p>
              <p className="text-[10px] text-slate-400 mt-0.5">大货合同起草中</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">● 大货已签单</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">1</p>
              <p className="text-[10px] text-slate-400 mt-0.5">本月已交定金排产</p>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              品类：全部 ▾
            </button>
            <button className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              交期：90 天内 ▾
            </button>
            <button className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              优先级：全部 ▾
            </button>
            <button className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              买家响应：全部 ▾
            </button>
          </div>

          {/* Data Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">买家 / 品牌</th>
                  <th className="py-3 px-4">主营款 / 规格</th>
                  <th className="py-3 px-4">合同意向金额</th>
                  <th className="py-3 px-4">交期 / 返单节点</th>
                  <th className="py-3 px-4">买家最新反馈</th>
                  <th className="py-3 px-4">优先级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      RL
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Robert Lang</p>
                      <p className="text-[10px] text-slate-400">Finch &amp; Ninth (2024合作)</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">400g 连帽卫衣 (Unit 305)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$2,400</td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">10月19日 <span className="text-rose-600 font-bold">28天后</span></p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-rose-200">
                      <div className="h-full w-3/4 rounded-full bg-rose-500" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">希望签订 6 个月供货协议</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                      ● 需紧急跟进
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      GK
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Grace Kim</p>
                      <p className="text-[10px] text-slate-400">Oakline Lofts (2023合作)</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">裸感瑜伽裤 (Unit 112)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$1,850</td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">10月25日 <span className="text-slate-500">34天后</span></p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-200">
                      <div className="h-full w-1/2 rounded-full bg-slate-400" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">暂无回复，已发 2 条消息</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                      ● 暂无回复
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      TR
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Tomás Rivera</p>
                      <p className="text-[10px] text-slate-400">The Alder (2022合作)</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">240g 纯棉T恤 (Unit 306)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$2,250</td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">11月08日 <span className="text-slate-500">48天后</span></p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-200">
                      <div className="h-full w-1/3 rounded-full bg-slate-400" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">正在评估换季新品预算</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                      ● 重点培育
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      JN
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Julia Novak</p>
                      <p className="text-[10px] text-slate-400">Marlowe Court (2024合作)</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">重磅卫裤成套 (Unit 207)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$1,980</td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">11月14日 <span className="text-slate-500">54天后</span></p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-200">
                      <div className="h-full w-1/4 rounded-full bg-slate-400" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">已二次打开报价单</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
                      ● 报价已送达
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      DM
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Dev Malhotra</p>
                      <p className="text-[10px] text-slate-400">Juniper Flats (2023合作)</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">健身速干背心 (Unit 415)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$2,600</td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900 font-semibold">11月20日 <span className="text-slate-500">60天后</span></p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-sky-200">
                      <div className="h-full w-2/3 rounded-full bg-sky-500" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">意向续签翻单，准备打样</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      ● 高意向商机
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxView({ conversations }: { conversations: Conversation[] }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<number | "all">("all");
  const [selected, setSelected] = useState<Conversation>(conversations[0] ?? demoConversations[0]);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;
  const [draft, setDraft] = useState("感谢您的咨询。我们的常规起订量会根据型号和定制要求调整。请告诉我目标产品、预计数量和收货城市，我马上为您整理准确报价与交期。");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => conversations.filter((item) => {
    const matchesQuery = `${item.name} ${item.message} ${item.account}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (channel === "all" || item.channel === channel);
  }), [query, channel, conversations]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "filter_inbox",
      title: "筛选统一收件箱",
      description: "按关键词筛选当前工作台里的客户会话，不会发送任何消息。",
      inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) { const value = String(input.query ?? ""); setQuery(value); return { query: value, matches: conversationsRef.current.filter((item) => `${item.name} ${item.message}`.toLowerCase().includes(value.toLowerCase())).length }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({
      name: "stage_reply",
      title: "准备回复草稿",
      description: "为指定客户准备一条可编辑草稿；只写入草稿框，不会对外发送。",
      inputSchema: { type: "object", properties: { conversationId: { type: "string" }, text: { type: "string" } }, required: ["conversationId", "text"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { const item = conversationsRef.current.find((row) => row.id === input.conversationId); if (!item) throw new Error("找不到会话"); setSelected(item); setDraft(String(input.text)); return { staged: true, conversationId: item.id, sent: false }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function stageSend() {
    setNotice("已保存为待审核草稿，没有对外发送");
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <div className="inbox-shell">
      <section className="inbox-list">
        <div className="flex items-center gap-2 border-b border-slate-100 p-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索客户或消息" className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm"/></div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200"><Filter className="h-4 w-4"/></Button>
        </div>
        <div className="scrollbar-none flex gap-2 overflow-x-auto border-b border-slate-100 px-3 py-2.5">
          {[{ id: "all" as const, label: "全部" }, { id: 7 as const, label: "WhatsApp" }, { id: 5 as const, label: "Instagram" }, { id: 2 as const, label: "官网" }].map((item) => <button key={item.id} onClick={() => setChannel(item.id)} className={`filter-pill ${channel === item.id ? "filter-pill-active" : ""}`}>{item.label}</button>)}
        </div>
        <div className="scrollbar-thin overflow-y-auto p-2">{filtered.map((item) => <ConversationRow key={item.id} item={item} active={selected.id === item.id} onClick={() => setSelected(item)}/>)}</div>
      </section>

      <section className="conversation-panel">
        <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><ChannelMark channel={selected.channel}/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold text-slate-900">{selected.name}</h3><Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">{selected.stage}</Badge></div><p className="mt-0.5 text-xs text-slate-400">{selected.account} · {selected.locale}</p></div><Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5"/></Button></header>
        <div className="scrollbar-thin flex-1 overflow-y-auto bg-[#f8fbf9] px-5 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-center text-[11px] font-medium text-slate-400">今天 15:32</p>
            <div className="message-bubble message-in"><p>Hello, I’m interested in your wholesale collection.</p><span>15:32</span></div>
            <div className="message-bubble message-out"><p>Hi {selected.name.split(" ")[0]}, happy to help. Which products and market are you buying for?</p><span>15:34 · 已送达</span></div>
            <div className="message-bubble message-in"><p>{selected.message}</p><span>15:39</span></div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-white p-4">
          <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-emerald-700"><Sparkles className="h-3.5 w-3.5"/> 建议回复 · 需人工确认</div><span className="text-[11px] text-slate-400">草稿模式</span></div>
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-24 resize-none rounded-2xl border-slate-200 bg-slate-50/60 text-sm leading-6 focus-visible:ring-emerald-500/20"/>
          <div className="mt-3 flex items-center justify-between gap-3"><p className="text-[11px] text-slate-400">不会自动发送；确认前可继续编辑。</p><Button onClick={stageSend} className="rounded-xl bg-[#0b241b] px-4 text-white hover:bg-[#123829]"><Send className="h-4 w-4"/> 存为待审草稿</Button></div>
          {notice && <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{notice}</div>}
        </div>
      </section>

      <aside className="customer-panel">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white">{selected.name.slice(0, 2).toUpperCase()}</div><div><p className="font-semibold text-slate-900">{selected.name}</p><p className="text-xs text-slate-400">{selected.locale}</p></div></div>
        <div className="mt-6 grid grid-cols-2 gap-3"><div className="mini-stat"><span>潜在价值</span><strong>{selected.value}</strong></div><div className="mini-stat"><span>负责人</span><strong>{selected.owner}</strong></div></div>
        <div className="mt-6"><p className="section-label">客户阶段</p><div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 p-3"><div><p className="text-sm font-semibold text-slate-800">{selected.stage}</p><p className="text-[11px] text-slate-400">最后更新：今天</p></div><ChevronRight className="h-4 w-4 text-slate-400"/></div></div>
        <div className="mt-6"><p className="section-label">建议下一步</p><div className="mt-3 rounded-2xl bg-violet-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-violet-800"><Sparkles className="h-4 w-4"/> 补充资格信息</div><p className="mt-2 text-xs leading-5 text-violet-700/70">确认目标型号、预计数量、交付地区和采购时间。</p></div></div>
        <div className="mt-6"><p className="section-label">标签</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline">批发</Badge><Badge variant="outline">高意向</Badge><Badge variant="outline">需报价</Badge></div></div>
      </aside>
    </div>
  );
}

function AccountsView({ accounts }: { accounts: Account[] }) {
  return <div className="panel overflow-hidden p-0"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-base font-semibold">已识别渠道账号</h3><p className="mt-1 text-xs text-slate-400">来自账号接口与 Webhook 消息中的渠道身份</p></div><Button variant="outline" className="rounded-xl"><RefreshCw className="h-4 w-4"/> 刷新状态</Button></div><div className="divide-y divide-slate-100">{accounts.map((account) => <div key={account.name} className="account-row"><ChannelMark channel={account.channel}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{account.name}</p><p className="mt-0.5 text-xs text-slate-400">{account.handle}</p></div><div className="hidden text-right sm:block"><p className="text-xs font-medium text-slate-700">{account.messages} 条消息</p><p className="mt-1 text-[11px] text-slate-400">平均响应 {account.response}</p></div><Badge variant="outline" className={account.status === "online" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}><StatusDot status={account.status}/>{account.status === "online" ? "在线" : "需检查"}</Badge><Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button></div>)}</div></div>;
}

const LEAD_STAGE_ORDER = ["新线索", "待回复", "已询价", "方案跟进", "待成交"];
const LEAD_STAGE_META: Record<
  string,
  { label: string; tone: string; pillBg: string; desc: string; sampleTag: string }
> = {
  "新线索": {
    label: "新线索 (New Leads)",
    tone: "bg-sky-500",
    pillBg: "bg-sky-50 text-sky-800 border-sky-200",
    desc: "海外初次入站意向，等待意向资质初筛",
    sampleTag: "380g 连帽卫衣 (MOQ 50件)",
  },
  "待回复": {
    label: "待回复 (Follow-up Due)",
    tone: "bg-amber-500",
    pillBg: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "买家已有明确发问，建议 3 分钟内响应",
    sampleTag: "做旧洗水工艺核定",
  },
  "已询价": {
    label: "已询价 (Quotation Sent)",
    tone: "bg-indigo-500",
    pillBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    desc: "已寄送色卡或打样，大货报价单已提交",
    sampleTag: "裸感防透瑜伽裤",
  },
  "方案跟进": {
    label: "方案跟进 (Negotiation)",
    tone: "bg-violet-500",
    pillBg: "bg-violet-50 text-violet-800 border-violet-200",
    desc: "价格条款、空运 DDP 时效与首单定金核定中",
    sampleTag: "240g 落肩纯棉T恤",
  },
  "待成交": {
    label: "待成交 (Closing Deals)",
    tone: "bg-emerald-500",
    pillBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "样衣确认合格，大货合同起草与定金支付",
    sampleTag: "大货 1,000 件定单",
  },
};

function normalizeStage(stage: string): string {
  if (stage === "意向") return "新线索";
  if (stage === "询价") return "已询价";
  if (stage === "跟进") return "方案跟进";
  if (LEAD_STAGE_ORDER.includes(stage)) return stage;
  return "新线索";
}

function groupLeads(leads: Conversation[]) {
  return LEAD_STAGE_ORDER.map((stage) => {
    const meta = LEAD_STAGE_META[stage];
    const items = leads.filter((lead) => normalizeStage(lead.stage) === stage);
    return {
      title: stage,
      meta,
      items,
    };
  });
}

function LeadsView({ leads }: { leads: Conversation[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<number | "all">("all");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.locale.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChannel = channelFilter === "all" || lead.channel === channelFilter;
      return matchSearch && matchChannel;
    });
  }, [leads, searchQuery, channelFilter]);

  const leadColumns = useMemo(() => groupLeads(filteredLeads), [filteredLeads]);

  return (
    <div className="space-y-6">
      {/* Top 5 Stage Pipeline Stepper Strip (LeaseFlow Stepper Style) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-stretch">
        {leadColumns.map((col) => (
          <div
            key={col.title}
            className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${col.meta.tone}`} />
                  {col.title}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                  {col.items.length} 位
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-black text-slate-950">{col.items.length}</p>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 line-clamp-1">{col.meta.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索买家、品牌、国家地区或诉求…"
              className="h-8 rounded-full border-slate-200 bg-slate-50/70 pl-8 text-xs shadow-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                channelFilter === "all" ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              全部渠道
            </button>
            <button
              onClick={() => setChannelFilter(7)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                channelFilter === 7 ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannelFilter(5)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                channelFilter === 5 ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setChannelFilter(3)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                channelFilter === 3 ? "bg-slate-900 text-white shadow-xs" : "hover:text-slate-900"
              }`}
            >
              Email
            </button>
          </div>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>新建商机</span>
          </button>
        </div>
      </div>

      {/* 5-Column Responsive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start">
        {leadColumns.map((column) => (
          <section
            key={column.title}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-3 min-h-[460px] flex flex-col justify-between"
          >
            <div>
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.meta.tone}`} />
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">{column.title}</h3>
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-600 border border-slate-200 shadow-2xs px-1">
                    {column.items.length}
                  </span>
                </div>
                <button className="grid h-6 w-6 place-items-center rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Lead Cards List */}
              <div className="mt-3 space-y-3">
                {column.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-2.5 hover:shadow-xs hover:border-slate-300 transition-all text-left group"
                  >
                    {/* Buyer Avatar & Channel */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ChannelMark channel={item.channel} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 leading-snug">
                            {item.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400 mt-0.5">{item.locale}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                    </div>

                    {/* Target Product Tag */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-[10px] font-medium text-sky-800 border border-sky-200">
                      <span>🏷️ {column.meta.sampleTag}</span>
                    </div>

                    {/* Inquiry Message Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      &ldquo;{item.message}&rdquo;
                    </p>

                    {/* Deal Value & Owner Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">{item.value}</span>
                        <span className="text-[10px] text-slate-400 ml-1">意向首单</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">{item.owner}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800">
                          跟进
                        </span>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Empty State */}
                {column.items.length === 0 && (
                  <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-200/80 bg-white/40 text-center p-4">
                    <div>
                      <Check className="mx-auto h-5 w-5 text-slate-300" />
                      <p className="mt-1.5 text-xs text-slate-400 font-medium">暂无待推进买家</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const skillCards = [
  { name: "意图路由", id: "salesmartly-intent-router", icon: Workflow, tone: "bg-emerald-50 text-emerald-700", copy: "识别语言、意图、优先级并选择唯一专业 Skill。" },
  { name: "产品顾问", id: "salesmartly-product-advisor", icon: Sparkles, tone: "bg-sky-50 text-sky-700", copy: "处理产品、MOQ、样品、价格和交付信息，不编造参数。" },
  { name: "线索资格", id: "salesmartly-lead-qualification", icon: Target, tone: "bg-violet-50 text-violet-700", copy: "收集产品、数量、市场与采购时间，推进客户阶段。" },
  { name: "风险转人工", id: "salesmartly-risk-escalation", icon: ShieldCheck, tone: "bg-rose-50 text-rose-700", copy: "投诉、退款、支付、法律与安全问题自动暂停发送。" },
  { name: "跟进规划", id: "salesmartly-followup-planner", icon: Clock3, tone: "bg-amber-50 text-amber-700", copy: "为已有机会生成下一步，不制造虚假紧迫感。" },
];

const demoAgentRuns: AgentRun[] = [
  { id: "demo-run-1", customer: "Liam Carter", skill: "产品顾问", result: "报价信息待补齐", state: "待人工审核" },
  { id: "demo-run-2", customer: "Sophia Müller", skill: "线索资格", result: "进入新线索阶段", state: "已生成草稿" },
  { id: "demo-run-3", customer: "售后测试会话", skill: "风险转人工", result: "检测到退款关键词", state: "已阻止发送" },
];

const skillNameById = new Map(skillCards.map((skill) => [skill.id, skill.name] as const));
const AGENT_STATE_LABEL: Record<string, string> = { sent: "已发送", drafted: "已生成草稿", "human-review": "待人工审核", "send-failed": "发送失败" };

function skillLabel(id: string): string {
  return skillNameById.get(id) ?? (id || "未分类");
}

function toAgentRun(row: Record<string, unknown>): AgentRun {
  const status = String(row.status ?? "");
  const requiresHuman = Number(row.requires_human) === 1 || row.requires_human === true;
  const stage = String(row.customer_stage ?? "");
  const draft = String(row.draft_reply ?? "").replace(/\s+/g, " ").trim();
  return {
    id: String(row.id ?? row.external_id ?? "").trim() || String(row.chat_user_id ?? "run"),
    customer: String(row.chat_user_id ?? "").trim() || String(row.external_id ?? "未知客户"),
    skill: skillLabel(String(row.skill ?? "")),
    result: (stage ? `阶段：${stage}` : draft ? `${draft.slice(0, 46)}${draft.length > 46 ? "…" : ""}` : "—"),
    state: AGENT_STATE_LABEL[status] ?? (requiresHuman ? "待人工审核" : "已处理"),
  };
}

function AgentsView({ configured, providedRuns }: { configured: boolean; providedRuns: AgentRun[] }) {
  const flow = ["SaleSmartly Webhook", "意图路由", "专业 Skill", "风险安全门", "草稿 / 安全回发", "客户阶段与审计"];
  const runs = providedRuns.length > 0 ? providedRuns : demoAgentRuns;
  return <div className="space-y-5">
    <section className="panel panel-dark overflow-hidden">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl"><div className="flex items-center gap-2"><Badge className={configured ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-300" : "bg-amber-300 text-amber-950 hover:bg-amber-300"}>{configured ? "Codex 已连接" : "模拟路由"}</Badge><span className="text-xs text-emerald-100/55">默认草稿模式</span></div><h3 className="mt-4 text-xl font-semibold">一条消息，只进入一个明确工作流</h3><p className="mt-2 text-sm leading-6 text-emerald-50/65">消息内容被视为不可信数据；Skill 只能生成有边界的业务建议。风险、事实不足和商业承诺会自动转人工。</p></div>
        <div className="grid min-w-60 grid-cols-2 gap-3"><div className="rounded-2xl bg-white/[.07] p-4"><p className="text-[11px] text-emerald-100/50">已安装 Skills</p><p className="mt-2 text-2xl font-semibold">5</p></div><div className="rounded-2xl bg-white/[.07] p-4"><p className="text-[11px] text-emerald-100/50">发送安全门</p><p className="mt-2 text-sm font-semibold text-emerald-300">已启用</p></div></div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">{flow.map((step, index) => <div key={step} className="flex items-center gap-2"><span className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-emerald-50/80">{step}</span>{index < flow.length - 1 && <ChevronRight className="h-4 w-4 text-emerald-300/35"/>}</div>)}</div>
    </section>

    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">{skillCards.map((skill) => <article key={skill.id} className="panel"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${skill.tone}`}><skill.icon className="h-5 w-5"/></span><h3 className="mt-5 text-sm font-semibold text-slate-900">{skill.name}</h3><p className="mt-1 font-mono text-[9px] leading-4 text-slate-400">{skill.id}</p><p className="mt-3 text-xs leading-5 text-slate-500">{skill.copy}</p></article>)}</section>

    <section className="panel p-0"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h3 className="font-semibold">最近自动化运行</h3><p className="mt-1 text-xs text-slate-400">{providedRuns.length > 0 ? "来自 SaleSmartly Webhook 的真实处理结果" : "演示记录；接入密钥后显示真实 Webhook 处理结果"}</p></div><Badge variant="outline">全程留痕</Badge></div><div className="divide-y divide-slate-100">{runs.map((run) => <div key={run.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(140px,1fr)_minmax(120px,.8fr)_minmax(180px,1.2fr)_auto] sm:items-center"><p className="text-sm font-semibold text-slate-800">{run.customer}</p><p className="text-xs text-slate-500">{run.skill}</p><p className="text-xs text-slate-500">{run.result}</p><Badge variant="outline" className="justify-self-start sm:justify-self-end">{run.state}</Badge></div>)}</div></section>
  </div>;
}

function RulesView() {
  const [rules, setRules] = useState(demoRules);
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]"><section className="panel p-0"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h3 className="font-semibold">回复规则</h3><p className="mt-1 text-xs text-slate-400">关键词命中后先生成草稿</p></div><Button className="rounded-xl bg-[#0b241b] text-white hover:bg-[#123829]"><Plus className="h-4 w-4"/> 新建规则</Button></div><div className="divide-y divide-slate-100">{rules.map((rule) => <article key={rule.id} className="p-5"><div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Zap className="h-5 w-5"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold text-slate-900">{rule.name}</h4>{rule.autoSend ? <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">自动发送</Badge> : <Badge variant="outline">仅草稿</Badge>}</div><div className="mt-2 flex flex-wrap gap-1.5">{rule.keywords.map((keyword) => <span key={keyword} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">{keyword}</span>)}</div><p className="mt-3 text-xs leading-5 text-slate-500">{rule.reply}</p><p className="mt-3 text-[11px] text-slate-400">近 7 天命中 {rule.hits} 次</p></div><Switch checked={rule.enabled} onCheckedChange={(checked) => setRules((rows) => rows.map((row) => row.id === rule.id ? { ...row, enabled: checked } : row))} aria-label={`启用${rule.name}`}/></div></article>)}</div></section><aside className="space-y-5"><div className="panel"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700"><ShieldCheck className="h-5 w-5"/></span><div><h3 className="text-sm font-semibold">发送安全阀</h3><p className="text-xs text-slate-400">当前：草稿模式</p></div></div><div className="mt-5 space-y-3 text-xs text-slate-600"><p className="rule-check"><Check/>默认不自动发送</p><p className="rule-check"><Check/>人工发送前保留最终确认</p><p className="rule-check"><Check/>记录规则、操作者与结果</p><p className="rule-check"><Check/>渠道窗口外自动阻止</p></div></div><div className="panel"><p className="panel-kicker">接口限制</p><h3 className="mt-2 text-sm font-semibold">已主动纳入规则</h3><ul className="mt-4 space-y-3 text-xs leading-5 text-slate-500"><li>• Email 可接收，暂不支持 Webhook 回发。</li><li>• 群消息不在当前 Webhook 接收范围。</li><li>• Messenger、Instagram 与 WhatsApp 需遵守平台服务窗口。</li></ul></div></aside></div>;
}

const demoAuditEvents: AuditEvent[] = [
  { id: "demo-audit-1", time: "16:42:08", icon: Database, action: "同步完成", detail: "会话 50 · 消息 50 · 客户 50", status: "成功" },
  { id: "demo-audit-2", time: "16:40:31", icon: Sparkles, action: "规则命中", detail: "询价与 MOQ · Liam Carter", status: "已生成草稿" },
  { id: "demo-audit-3", time: "16:36:12", icon: ContactRound, action: "客户阶段更新", detail: "Sophia Müller · 新线索 → 意向", status: "人工操作" },
  { id: "demo-audit-4", time: "16:28:49", icon: CircleAlert, action: "账号状态变化", detail: "MGOO LATAM · 连接质量下降", status: "需检查" },
  { id: "demo-audit-5", time: "16:18:02", icon: Send, action: "回复已发送", detail: "Lucas Ferreira · 操作者 Ana", status: "成功" },
];

const AUDIT_STATUS_LABEL: Record<string, string> = { "draft-only": "仅草稿", "received-live": "实时接收", "human-review": "待人工审核", drafted: "已生成草稿", sent: "已发送", "send-failed": "发送失败" };

function toMillis(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed > 1e12 ? parsed : parsed * 1000;
}

function auditDetail(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const parts: string[] = [];
    if (parsed.skill) parts.push(skillLabel(String(parsed.skill)));
    if (parsed.stage) parts.push(`阶段 ${parsed.stage}`);
    if (parsed.event) parts.push(`事件 ${parsed.event}`);
    if (parsed.channel !== undefined) parts.push(channelMeta[Number(parsed.channel)]?.name ?? `渠道 ${parsed.channel}`);
    return parts.join(" · ") || raw;
  } catch {
    return raw;
  }
}

function toAuditEvent(row: Record<string, unknown>): AuditEvent {
  const action = String(row.action ?? "系统操作");
  const status = String(row.status ?? "");
  const icon = status === "send-failed" ? CircleAlert : action.startsWith("webhook") ? Database : action.startsWith("agent") ? Sparkles : FileText;
  const clock = toMillis(row.created_at);
  return {
    id: String(row.id ?? `${action}-${clock}`) || action,
    time: clock ? new Date(clock).toLocaleTimeString("zh-CN", { hour12: false }) : "—",
    icon,
    action: action === "webhook.received" ? "收到入站消息" : action === "agent.routed" ? "智能体已路由" : action,
    detail: auditDetail(String(row.details ?? "")),
    status: AUDIT_STATUS_LABEL[status] ?? status,
  };
}

function AuditView({ providedEvents }: { providedEvents: AuditEvent[] }) {
  const events = providedEvents.length > 0 ? providedEvents : demoAuditEvents;
  return <div className="panel p-0"><div className="border-b border-slate-100 p-5"><h3 className="font-semibold">今日记录</h3><p className="mt-1 text-xs text-slate-400">发送、同步与规则操作均可追溯</p></div><div className="divide-y divide-slate-100">{events.map((event) => <div key={event.id} className="grid gap-3 p-5 sm:grid-cols-[90px_40px_minmax(0,1fr)_auto] sm:items-center"><span className="text-xs tabular-nums text-slate-400">{event.time}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><event.icon className="h-4 w-4"/></span><div><p className="text-sm font-semibold text-slate-800">{event.action}</p><p className="mt-1 text-xs text-slate-400">{event.detail}</p></div><Badge variant="outline" className="justify-self-start text-slate-500 sm:justify-self-end">{event.status}</Badge></div>)}</div></div>;
}

const AGENT_BACKEND_LABEL: Record<string, string> = { "codex-gateway": "Codex 本地网关", "openai-agents": "OpenAI Agents API", "local-rules": "本地规则（降级）" };

function SettingsView({ connected, agentConnected, agentBackend, agentModel }: { connected: boolean; agentConnected: boolean; agentBackend: string; agentModel: string }) {
  const items = [
    { label: "Salesmartly Max 套餐", value: connected ? "已确认" : "待确认", ok: connected },
    { label: "Project ID", value: connected ? "已安全配置" : "待配置", ok: connected },
    { label: "API Token", value: connected ? "已安全配置" : "待配置", ok: connected },
    { label: "Webhook Secret", value: connected ? "已安全配置" : "待配置", ok: connected },
    { label: "Codex 智能体内核", value: agentConnected ? `${AGENT_BACKEND_LABEL[agentBackend] ?? agentBackend} · ${agentModel}` : "待配置", ok: agentConnected },
  ];
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]"><section className="panel"><div className="flex items-start justify-between gap-4"><div><p className="panel-kicker">连接状态</p><h3 className="mt-2 text-lg font-semibold">{connected && agentConnected ? "真实数据与 Codex 已接入" : "当前使用安全演示数据"}</h3><p className="mt-2 text-sm leading-6 text-slate-500">密钥只应保存在服务端运行环境，不能写进浏览器、项目文件或聊天消息。</p></div><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${connected && agentConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{connected && agentConnected ? <ShieldCheck className="h-6 w-6"/> : <Gauge className="h-6 w-6"/>}</span></div><div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">{items.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full ${item.ok ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{item.ok ? <Check className="h-4 w-4"/> : <span className="text-[10px] font-bold">—</span>}</span><span className="text-sm font-medium text-slate-700">{item.label}</span></div><span className="text-xs text-slate-400">{item.value}</span></div>)}</div></section><aside className="space-y-5"><div className="panel"><p className="panel-kicker">自定义 AI 成员接收地址</p><div className="mt-3 break-all rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-5 text-emerald-200">https://你的站点/api/salesmartly/webhook</div><p className="mt-3 text-xs leading-5 text-slate-500">在 SaleSmartly 新建自定义 AI 成员并使用此地址；开启会话自动分配，关闭“机器人优先接待”。</p></div><div className="panel"><p className="panel-kicker">运行变量</p><div className="mt-4 space-y-2 font-mono text-[11px] text-slate-600"><p>SALESMARTLY_PROJECT_ID</p><p>SALESMARTLY_API_TOKEN</p><p>SALESMARTLY_WEBHOOK_SECRET</p><p>SALESMARTLY_WEBHOOK_TOKEN</p><p>OPENAI_API_KEY</p><p>OPENAI_AGENT_MODEL=gpt-6-astra</p><p>SALESMARTLY_REPLY_MODE=draft</p></div></div></aside></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [connected, setConnected] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentBackend, setAgentBackend] = useState("local-rules");
  const [agentModel, setAgentModel] = useState("");
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [leads, setLeads] = useState<Conversation[]>(demoConversations);
  const [trendData, setTrendData] = useState<typeof trend>(trend);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [summary, setSummary] = useState({ events: 0, drafts: 0, sent: 0, humanReview: 0 });
  const heading = headings[view];

  useEffect(() => {
    fetch("/api/salesmartly/dashboard", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<DashboardPayload> : Promise.reject())
      .then((payload) => {
        setConnected(payload.mode === "live");
        if (Array.isArray(payload.conversations)) setConversations(payload.conversations);
        if (Array.isArray(payload.leads)) setLeads(payload.leads);
        if (Array.isArray(payload.accounts)) setAccounts(payload.accounts);
        if (Array.isArray(payload.trend) && payload.trend.length > 0) setTrendData(payload.trend);
      })
      .catch(() => setConnected(false));
    fetch("/api/agent/status", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ configured?: boolean; backend?: string; model?: string }> : Promise.reject())
      .then((payload) => {
        setAgentConnected(Boolean(payload.configured));
        if (payload.backend) setAgentBackend(payload.backend);
        if (payload.model) setAgentModel(payload.model);
      })
      .catch(() => setAgentConnected(false));
    fetch("/api/salesmartly/activity", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<ActivityPayload> : Promise.reject())
      .then((payload) => {
        if (Array.isArray(payload.audit)) setAuditEvents(payload.audit.map(toAuditEvent));
        if (Array.isArray(payload.runs)) setAgentRuns(payload.runs.map(toAgentRun));
        if (payload.summary) setSummary(payload.summary);
      })
      .catch(() => undefined);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#edebe6] p-2.5 sm:p-3.5 md:p-4 gap-3 md:gap-4 antialiased text-slate-800">
        <Sidebar collapsible="icon" className="border border-slate-200/80 bg-white text-slate-800 rounded-[26px] shadow-2xs overflow-hidden">
          <SidebarHeader className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 font-extrabold text-white text-sm shadow-xs">
                M
              </span>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-bold text-slate-900 leading-none">MGOO Omnichannel</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Apparel Sourcing Desk
                </p>
              </div>
            </div>

            {/* Workspace Selector Pill (LeaseFlow Harborline style) */}
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-slate-700 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white text-slate-700 border border-slate-200/60 shadow-2xs">
                  <Building2 className="h-3.5 w-3.5 text-slate-600" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-bold text-slate-900">MGOO 跨境服饰总仓</p>
                  <p className="truncate text-[10px] text-slate-400">3个主营品类 · 东莞总厂</p>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2.5 py-3 gap-2 overflow-y-auto">
            {navGroups.map((group) => (
              <SidebarGroup key={group.groupLabel} className="p-0">
                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400 px-3 h-6">
                  {group.groupLabel}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={view === item.id}
                          onClick={() => setView(item.id)}
                          className="h-9 rounded-full px-3.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:font-semibold data-[active=true]:text-white transition-all shadow-none data-[active=true]:shadow-xs"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="text-xs truncate">{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 peer-data-[active=true]/menu-button:bg-white/20 peer-data-[active=true]/menu-button:text-white">
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-3 space-y-2.5">
            {/* AI Assistant Card in Soft Sky Blue (Matching LeaseFlow AI Card) */}
            <div className="rounded-2xl border border-sky-200/90 bg-sky-50/90 p-3 text-sky-950 shadow-2xs group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-200 text-sky-800 text-[10px] font-bold">
                    ✦
                  </span>
                  <div>
                    <p className="text-xs font-bold text-sky-950">MGOO AI 营销管家</p>
                    <p className="text-[10px] text-sky-700 font-medium">运行中 · 38 个活跃会话</p>
                  </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-sky-600 scale-75" />
              </div>
              <button
                onClick={() => setView("inbox")}
                className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-sky-900 shadow-2xs hover:bg-white transition-all"
              >
                <span>4 个需人工复核会话</span>
                <ChevronRight className="h-3.5 w-3.5 text-sky-600" />
              </button>
            </div>

            {/* User Profile Row */}
            <div className="flex items-center gap-2.5 rounded-2xl p-1.5 text-slate-800">
              <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-900 border border-slate-200">
                KY
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </span>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs font-bold text-slate-900">KY (业务总监)</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Head of Global Sales</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Rounded Card Deck Container */}
        <SidebarInset className="min-w-0 flex-1 rounded-[26px] bg-white border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 rounded-xl text-slate-600 hover:text-slate-900" />
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">早上好，KY</h2>
                <p className="text-[11px] text-slate-400">全域跨渠道外贸客户推进与 AI 协同中台</p>
              </div>
            </div>

            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索买家、品牌、WhatsApp 或订单…"
                className="h-9 rounded-full border-slate-200/80 bg-slate-50/80 pl-9 text-xs shadow-none focus-visible:bg-white"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>全部渠道 ▾</span>
              </button>
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>近 30 天 ▾</span>
              </button>
              <button className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white" />
              </button>
              <Button
                onClick={() => setView("inbox")}
                className="h-9 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs px-4"
              >
                <span>处理全域商机</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-5 sm:p-7 overflow-y-auto">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-sky-700">{heading.eyebrow}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{heading.title}</h1>
                <p className="mt-1 text-xs text-slate-500">{heading.copy}</p>
              </div>
              {view === "overview" && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-full border-slate-200 bg-white text-xs font-semibold shadow-2xs">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> 刷新数据
                  </Button>
                  <Button onClick={() => setView("inbox")} className="rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs">
                    进入会话 <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {view === "overview" && (
              <Overview
                onOpenInbox={() => setView("inbox")}
                accounts={accounts}
                conversations={conversations}
                trendData={trendData}
                summary={summary}
                leadsCount={leads.length}
              />
            )}
            {view === "training" && <SalesTrainingView />}
            {view === "nightmode" && <NightWatchdogView />}
            {view === "eccang" && <EccangAnalyticsView />}
            {view === "workforce" && <AiWorkforceView />}
            {view === "inbox" && <InboxView conversations={conversations} />}
            {view === "accounts" && <AccountsView accounts={accounts} />}
            {view === "leads" && <LeadsView leads={leads} />}
            {view === "guide" && <GuideCenterView />}
            {view === "agents" && <AgentsView configured={agentConnected} providedRuns={agentRuns} />}
            {view === "rules" && <RulesView />}
            {view === "audit" && <AuditView providedEvents={auditEvents} />}
            {view === "settings" && (
              <SettingsView
                connected={connected}
                agentConnected={agentConnected}
                agentBackend={agentBackend}
                agentModel={agentModel}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
