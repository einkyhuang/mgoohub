export interface VisualInsight {
  label: string;
  value: string;
  tag?: string;
  icon?: string;
}

export interface StrategicPitch {
  title: string;
  desc: string;
  highlight: string;
}

export interface OutreachTemplate {
  channel: "WhatsApp" | "Email" | "Instagram DM";
  styleName: string;
  subject?: string;
  content: string;
}

export interface VisualDeliverable {
  title: string;
  badge: string;
  grade?: string; // e.g. "Tier A (高优潜客)"
  score?: number; // e.g. 94
  summary: string;
  keyInsights: VisualInsight[];
  strategicPitches: StrategicPitch[];
  outreachTemplates?: OutreachTemplate[];
  nextActionChecklist: string[];
}

export interface PipelineStepResult {
  step: number;
  employeeId: string;
  employeeName: string;
  avatar: string;
  actionTitle: string;
  status: "completed" | "running" | "pending";
  deliverable: VisualDeliverable;
  keyOutput: string;
}

export interface PipelineExecutionReport {
  targetNiche: string;
  executedAt: string;
  totalDurationMs: number;
  leadScore: number;
  leadTier: string;
  steps: PipelineStepResult[];
  readyOutreach: {
    channel: string;
    text: string;
  };
}

export interface AIEmployee {
  id: string;
  number: number;
  name: string;
  title: string;
  avatar: string;
  group: "prospecting" | "outreach" | "closing";
  groupName: string;
  roleDescription: string;
  coreDeliverable: string;
  status: "active" | "standby" | "training";
  systemPrompt: string;
}

export const AI_WORKFORCE: AIEmployee[] = [
  {
    id: "market-intel",
    number: 1,
    name: "AI 市场情报员",
    title: "Market Intelligence Specialist",
    avatar: "📡",
    group: "prospecting",
    groupName: "获客与背调组",
    roleDescription: "负责 24 小时全网扫描行业动态、海外大牌新品发布、TikTok/社媒趋势爆款与竞争对手动作，第一时间提醒商机。",
    coreDeliverable: "输出《海外服饰趋势简报》与《商机雷达分析》",
    status: "active",
    systemPrompt: `You are MGOO's Market Intelligence AI Specialist.
Analyze the provided apparel niche or competitor brand.
Identify:
1. Current trending silhouettes, fabric weights (e.g. 380-400gsm heavyweight fleece, 240g boxy t-shirts).
2. Popular washing/finishing techniques (acid wash, vintage fade, pigment dye, 3D puff embroidery).
3. Emerging market demands and recommended MGOO product opportunities.`,
  },
  {
    id: "icp-scorer",
    number: 2,
    name: "AI ICP客户筛选员",
    title: "Ideal Customer Profile (ICP) Scorer",
    avatar: "🎯",
    group: "prospecting",
    groupName: "获客与背调组",
    roleDescription: "负责判断‘这个客户值不值得跟’。根据国家、品类契合度、预算、首单规模将线索分成：A级(优先马上联系)、B级(持续跟进)、C级(暂不浪费时间)。",
    coreDeliverable: "输出《线索质量分级与投产比评估》",
    status: "active",
    systemPrompt: `You are MGOO's ICP Lead Scoring AI.
Assess the prospective client's company profile and message.
Determine:
- Tier A (Priority): High brand aesthetic fit, orders 30-500 pcs, ready budget, active social presence.
- Tier B (Nurture): Potential brand, needs design polishing or timeline is 3+ months out.
- Tier C (Skip): Low alignment, unrealistic price expectation (<$3 for hoodies), non-target category.
Output a clear grade, score (0-100), and rationale.`,
  },
  {
    id: "deep-researcher",
    number: 3,
    name: "AI 目标客户研究员",
    title: "Deep Prospect Researcher",
    avatar: "🔍",
    group: "prospecting",
    groupName: "获客与背调组",
    roleDescription: "负责把客户‘查明白’。深度剖析买家官网、主营产品价格带、目标客群、竞品品牌与痛点，生成一页纸极简客户画像。",
    coreDeliverable: "输出《一页纸客户穿透画像：卖什么、缺什么、MGOO怎么切进去》",
    status: "active",
    systemPrompt: `You are MGOO's Deep Prospect Research AI.
Analyze the target brand's website or concept.
Generate a 1-page intelligence brief:
1. What they sell (price tier, style, cuts).
2. What they lack (e.g., fabric weight too light, limited colorways, high minimums with current factory).
3. Exact MGOO pitch angle (e.g., offer 380gsm acid-wash hoodie blanks + 30-50 MOQ drop-in solution).`,
  },
  {
    id: "buying-signals",
    number: 4,
    name: "AI 采购信号分析员",
    title: "Buying Intent Signal Analyst",
    avatar: "⚡",
    group: "outreach",
    groupName: "意向与触达组",
    roleDescription: "负责判断‘客户现在是不是有需求’。监控品牌换季上新、招收供应链岗位、参加展会、发新品预告等高意向窗口，找准破冰契机。",
    coreDeliverable: "输出《采购窗口期判断与黄金切入契机》",
    status: "active",
    systemPrompt: `You are MGOO's Buying Signal Analyst.
Evaluate whether the prospect is in an active buying or restocking cycle.
Identify triggers (season prep, sold-out styles, collection expansion) and recommend the exact best moment and angle to reach out.`,
  },
  {
    id: "decision-hunter",
    number: 5,
    name: "AI 决策链挖掘员",
    title: "Decision-Maker Discovery Specialist",
    avatar: "🕵️",
    group: "outreach",
    groupName: "意向与触达组",
    roleDescription: "负责找到‘真正能拍板的人’。梳理品牌创始人、主理人、采购负责人、供应链总监名单，拒绝无意义的无效转达。",
    coreDeliverable: "输出《关键决策人名单与对接切入点》",
    status: "active",
    systemPrompt: `You are MGOO's Decision-Maker Hunter AI.
Map out the target key personas (Founder, Creative Director, Head of Sourcing) and recommend how to address each specifically.`,
  },
  {
    id: "outreach-assistant",
    number: 6,
    name: "AI 个性化触达/开发信助理",
    title: "Hyper-Personalized Outreach Copilot",
    avatar: "✍️",
    group: "outreach",
    groupName: "意向与触达组",
    roleDescription: "负责把‘正确的话发给正确的人’。拒绝千篇一律的垃圾开发信，结合客户品类与采购痛点，生成高转化率、定制化的专属开发内容与WhatsApp话术。",
    coreDeliverable: "输出 3 种不同风格的深度定制开发信与 WhatsApp 破冰消息",
    status: "active",
    systemPrompt: `You are MGOO's Outreach Copilot.
Craft 3 personalized, highly persuasive outreach messages for WhatsApp / Email:
1. Style A (Case study & visual proof - reference similar brand drops).
2. Style B (Low-barrier sample offer - 30-50 pcs ready blanks with custom puff print).
3. Style C (Pain-point solver - solving their MOQ or delivery bottleneck with DDP shipping).`,
  },
  {
    id: "night-closer",
    number: 7,
    name: "MGOO 专属：夜间与即时成交助攻员",
    title: "24/7 WhatsApp Nighttime Closer",
    avatar: "🌙",
    group: "closing",
    groupName: "MGOO 成交赋能组",
    roleDescription: "负责下班后与夜间时段（19:00 - 次日 09:00）或 3 分钟未应答时的即时应答，结合 16 年工厂知识库解决起订量顾虑，主动索取社媒与需求，推进打样。",
    coreDeliverable: "夜间自动接管、意向留存、早晨生成《晨间销售交接清单》",
    status: "active",
    systemPrompt: `You are MGOO's Nighttime WhatsApp Closer.
Ensure no overseas inquiry is lost overnight. Respond with warmth, clarity on 30-50 pcs MOQ, DDP shipping, and ask targeted questions to move toward a sample order.`,
  },
  {
    id: "sales-coach",
    number: 8,
    name: "MGOO 专属：销售实战对练教练",
    title: "Sales Roleplay Master Coach",
    avatar: "🥋",
    group: "closing",
    groupName: "MGOO 成交赋能组",
    roleDescription: "为新进业务员提供全天候实战对练。模拟挑剔买家、预算砍价、工艺刁钻等真实场景，对业务员的回复进行打分、拆解并输出金牌话术。",
    coreDeliverable: "实时角色扮演交互、4维度评分体系、金牌业务员示范话术",
    status: "active",
    systemPrompt: `You are MGOO's Senior Sales Coach.
Help new sales reps master customer communication, value defending, discovery questions, and closing techniques.`,
  },
];
