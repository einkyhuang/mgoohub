export const channelMeta: Record<number, { name: string; color: string; short: string }> = {
  1: { name: "Messenger", color: "#2374E1", short: "Me" },
  2: { name: "网站聊天", color: "#7C3AED", short: "站" },
  3: { name: "Email", color: "#64748B", short: "邮" },
  5: { name: "Instagram", color: "#DB2777", short: "Ig" },
  7: { name: "WhatsApp API", color: "#16A34A", short: "WA" },
  12: { name: "WhatsApp App", color: "#059669", short: "W" },
  15: { name: "Telegram", color: "#0284C7", short: "Tg" },
  16: { name: "TikTok", color: "#18181B", short: "Tk" },
};

export const demoConversations = [
  { id: "c1", name: "Liam Carter", channel: 7, account: "+1 415 *** 2881", message: "Could you share the MOQ and delivery time to California?", time: "刚刚", unread: 3, stage: "询价", locale: "美国 · 英语", owner: "Mia", value: "$3,800", online: true },
  { id: "c2", name: "Sophia Müller", channel: 5, account: "@mgoo_global", message: "Do you offer private label packaging?", time: "4 分钟", unread: 1, stage: "意向", locale: "德国 · 英语", owner: "Leo", value: "$6,200", online: false },
  { id: "c3", name: "Lucas Ferreira", channel: 1, account: "MGOO LATAM", message: "Obrigado. I will confirm the colors with my team.", time: "12 分钟", unread: 0, stage: "跟进", locale: "巴西 · 葡语", owner: "Ana", value: "$2,450", online: true },
  { id: "c4", name: "Ava Thompson", channel: 2, account: "mgoo.com", message: "Is the sample fee refundable after bulk order?", time: "28 分钟", unread: 2, stage: "询价", locale: "英国 · 英语", owner: "待分配", value: "$1,900", online: true },
  { id: "c5", name: "山田商事", channel: 15, account: "MGOO Japan", message: "カタログと卸売価格表をお願いします。", time: "1 小时", unread: 0, stage: "新线索", locale: "日本 · 日语", owner: "Ken", value: "$8,100", online: false },
  { id: "c6", name: "Nora Bianchi", channel: 3, account: "sales@mgoo.co", message: "Re: 2026 wholesale catalogue", time: "2 小时", unread: 0, stage: "待回复", locale: "意大利 · 英语", owner: "Mia", value: "$4,600", online: false },
];

export const demoAccounts = [
  { name: "MGOO Global WA", channel: 7, handle: "+852 6*** 8310", status: "online", messages: 128, unread: 9, response: "2m 18s" },
  { name: "MGOO US", channel: 12, handle: "+1 415 *** 2881", status: "online", messages: 86, unread: 4, response: "3m 02s" },
  { name: "Instagram Global", channel: 5, handle: "@mgoo_global", status: "online", messages: 64, unread: 3, response: "4m 41s" },
  { name: "MGOO LATAM", channel: 1, handle: "fb.me/mgoo.latam", status: "warning", messages: 42, unread: 1, response: "7m 16s" },
  { name: "官网咨询", channel: 2, handle: "mgoo.com", status: "online", messages: 37, unread: 2, response: "1m 55s" },
  { name: "MGOO Japan", channel: 15, handle: "@mgoo_jp_bot", status: "online", messages: 21, unread: 0, response: "8m 09s" },
];

export const demoRules = [
  { id: 1, name: "询价与 MOQ", keywords: ["price", "quote", "MOQ", "报价"], reply: "感谢咨询。已收到您的产品与数量需求，我们会在 10 分钟内给您准确报价。", enabled: true, autoSend: false, hits: 28 },
  { id: 2, name: "样品政策", keywords: ["sample", "样品", "试单"], reply: "可以安排样品。请告诉我们目标型号、数量和收货国家，我们将核算样品与运费。", enabled: true, autoSend: false, hits: 13 },
  { id: 3, name: "非工作时间", keywords: ["fallback"], reply: "我们已收到消息。当前为非工作时间，业务同事将在下一个工作时段优先回复。", enabled: true, autoSend: true, hits: 46 },
];

export const trend = [
  { label: "09", messages: 28, leads: 8 },
  { label: "10", messages: 46, leads: 12 },
  { label: "11", messages: 39, leads: 10 },
  { label: "12", messages: 62, leads: 18 },
  { label: "13", messages: 54, leads: 16 },
  { label: "14", messages: 71, leads: 23 },
  { label: "15", messages: 64, leads: 19 },
];
