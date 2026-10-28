import { channelMeta } from "@/lib/demo-data";

type Rec = Record<string, unknown>;

export type Conversation = {
  id: string;
  name: string;
  channel: number;
  account: string;
  message: string;
  time: string;
  unread: number;
  stage: string;
  locale: string;
  owner: string;
  value: string;
  online: boolean;
};

export type Account = {
  name: string;
  channel: number;
  handle: string;
  status: string;
  messages: number;
  unread: number;
  response: string;
};

export type TrendPoint = { label: string; messages: number; leads: number };

export type DashboardData = {
  conversations: Conversation[];
  leads: Conversation[];
  accounts: Account[];
  trend: TrendPoint[];
  counts: { conversations: number; leads: number; accounts: number };
};

const str = (value: unknown, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function toSeconds(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed > 1e12 ? Math.round(parsed / 1000) : Math.round(parsed);
}

export function channelName(channel: number, fallback = "其他渠道"): string {
  return channelMeta[channel]?.name ?? fallback;
}

function relativeTime(timestampSeconds: number, now = Date.now()): string {
  if (!timestampSeconds) return "—";
  const diff = now / 1000 - timestampSeconds;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function firstLabel(labels: unknown): string | null {
  if (Array.isArray(labels) && labels.length > 0) {
    const first = labels[0];
    if (typeof first === "string") return first;
    return str((first as Rec)?.tag_name ?? (first as Rec)?.name) || null;
  }
  if (typeof labels === "string" && labels.trim()) {
    try {
      const parsed = JSON.parse(labels) as unknown;
      if (Array.isArray(parsed)) return firstLabel(parsed);
    } catch {
      return labels.trim();
    }
  }
  return null;
}

function contactName(contact: Rec, fallback: string): string {
  return str(contact.remark_name) || str(contact.name) || str(contact.remark) || fallback;
}

function memberLookup(members: Rec[]): Map<number, string> {
  const lookup = new Map<number, string>();
  for (const member of members) {
    const id = num(member.sys_user_id ?? member.id ?? member.user_id, -1);
    const name = str(member.name ?? member.nick_name ?? member.username);
    if (id >= 0 && name) lookup.set(id, name);
  }
  return lookup;
}

function latestMessageByUser(messages: Rec[]): Map<string, Rec> {
  const latest = new Map<string, Rec>();
  for (const message of messages) {
    const key = str(message.chat_user_id);
    if (!key) continue;
    const current = latest.get(key);
    if (!current || toSeconds(message.send_time) >= toSeconds(current.send_time)) latest.set(key, message);
  }
  return latest;
}

function toConversation(source: Rec, contact: Rec, latest: Rec | undefined, members: Map<number, string>): Conversation {
  const channel = num(source.channel ?? contact.channel);
  const sysUserId = num(source.sys_user_id ?? contact.sys_user_id, -1);
  const locale = [str(contact.country), str(contact.language)].filter(Boolean).join(" · ");
  const lastText = str(latest?.text) || str(source.last_message) || str(contact.remark);
  return {
    id: str(source.chat_user_id) || str(contact.chat_user_id),
    name: contactName(contact, str(source.title, "未命名客户")),
    channel,
    account: channelName(channel),
    message: lastText || "（暂无文字消息）",
    time: relativeTime(toSeconds(latest?.send_time ?? source.start_time ?? contact.updated_time)),
    unread: 0,
    stage: firstLabel(contact.labels) ?? "新线索",
    locale: locale || "未知地区",
    owner: members.get(sysUserId) ?? "待分配",
    value: "待评估",
    online: num(contact.is_online) === 1,
  };
}

export function buildConversations(sessions: Rec[], contacts: Rec[], messages: Rec[], members: Rec[]): Conversation[] {
  const contactByUser = new Map(contacts.map((contact) => [str(contact.chat_user_id), contact]));
  const memberNames = memberLookup(members);
  const latest = latestMessageByUser(messages);
  return sessions.map((session, index) => {
    const userId = str(session.chat_user_id);
    const contact = contactByUser.get(userId) ?? {};
    const conversation = toConversation(session, contact, latest.get(userId), memberNames);
    return { ...conversation, id: conversation.id || `session-${index}` };
  });
}

export function buildLeads(contacts: Rec[], members: Rec[]): Conversation[] {
  const memberNames = memberLookup(members);
  return contacts
    .filter((contact) => str(contact.chat_user_id))
    .map((contact) => toConversation({}, contact, undefined, memberNames));
}

export function buildAccounts(sessions: Rec[], contacts: Rec[], members: Rec[]): Account[] {
  const byChannel = new Map<number, { messages: number; customers: number; online: number }>();
  for (const session of sessions) {
    const channel = num(session.channel);
    const entry = byChannel.get(channel) ?? { messages: 0, customers: 0, online: 0 };
    entry.messages += num(session.msg_count);
    entry.customers += 1;
    byChannel.set(channel, entry);
  }
  for (const contact of contacts) {
    const channel = num(contact.channel);
    const entry = byChannel.get(channel) ?? { messages: 0, customers: 0, online: 0 };
    if (num(contact.is_online) === 1) entry.online += 1;
    byChannel.set(channel, entry);
  }
  void members;
  return [...byChannel.entries()]
    .sort(([, a], [, b]) => b.messages - a.messages)
    .map(([channel, entry]) => ({
      name: channelName(channel),
      channel,
      handle: `${entry.customers} 位客户`,
      status: "online",
      messages: entry.messages,
      unread: 0,
      response: "—",
    }));
}

export function buildTrend(messages: Rec[], contacts: Rec[]): TrendPoint[] {
  const buckets = new Map<string, TrendPoint>();
  const bucket = (label: string) => {
    const existing = buckets.get(label) ?? { label, messages: 0, leads: 0 };
    buckets.set(label, existing);
    return existing;
  };
  for (const message of messages) {
    const seconds = toSeconds(message.send_time);
    if (!seconds) continue;
    bucket(String(new Date(seconds * 1000).getHours()).padStart(2, "0")).messages += 1;
  }
  for (const contact of contacts) {
    const seconds = toSeconds(contact.created_time);
    if (!seconds) continue;
    bucket(String(new Date(seconds * 1000).getHours()).padStart(2, "0")).leads += 1;
  }
  return [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function buildDashboard(input: {
  sessions: Rec[];
  messages: Rec[];
  contacts: Rec[];
  members: Rec[];
}): DashboardData {
  const conversations = buildConversations(input.sessions, input.contacts, input.messages, input.members);
  const leads = buildLeads(input.contacts, input.members);
  const accounts = buildAccounts(input.sessions, input.contacts, input.members);
  const trend = buildTrend(input.messages, input.contacts);
  return {
    conversations,
    leads,
    accounts,
    trend,
    counts: { conversations: conversations.length, leads: leads.length, accounts: accounts.length },
  };
}

export function asList(value: unknown): Rec[] {
  if (Array.isArray(value)) return value as Rec[];
  if (value && typeof value === "object" && Array.isArray((value as { list?: unknown }).list)) {
    return (value as { list: Rec[] }).list;
  }
  return [];
}
