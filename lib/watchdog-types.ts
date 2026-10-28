export interface NightWatchdogConfig {
  enabled: boolean;
  // 时段自动接管模式
  scheduleMode: "always" | "night_only" | "custom_hours" | "disabled";
  startHour: number; // e.g. 19 (7 PM)
  endHour: number;   // e.g. 9 (9 AM next morning)
  weekendAllDay: boolean; // 周末全天接管
  
  // 无应答超时接管 (分钟)
  unansweredTimeoutMinutes: number; // e.g. 3 mins

  // 渠道范围
  channelScope: "all" | "whatsapp_only" | "specified";
  targetChannels: number[]; // e.g. [7, 12]

  // 营销与成交策略
  salesStrategy: "qualify_and_book" | "moq_and_catalog" | "urgent_capture";
}

export const DEFAULT_WATCHDOG_CONFIG: NightWatchdogConfig = {
  enabled: true,
  scheduleMode: "night_only",
  startHour: 19,
  endHour: 9,
  weekendAllDay: true,
  unansweredTimeoutMinutes: 3,
  channelScope: "all",
  targetChannels: [7, 12],
  salesStrategy: "qualify_and_book",
};

export interface MorningHandoverLead {
  id: string;
  customerName: string;
  phoneOrContact: string;
  channel: string;
  receivedAt: string;
  inquiryProduct: string;
  qualifiedNeeds: {
    targetQty: string;
    styleOrSpec: string;
    timeline: string;
    socialOrLink: string;
  };
  urgency: "high" | "medium" | "low";
  aiLastReply: string;
  recommendedAction: string;
}

export interface NightReportStats {
  period: string;
  totalNightMessages: number;
  aiHandledCount: number;
  averageResponseTimeSec: number;
  capturedLeadsCount: number;
  qualifiedRate: string; // e.g. "82%"
  urgentLeadsCount: number;
  leads: MorningHandoverLead[];
}
