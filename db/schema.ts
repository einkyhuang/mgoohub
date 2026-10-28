import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const webhookEvents = sqliteTable("webhook_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("event_type").notNull(),
  externalId: text("external_id").notNull().unique(),
  channel: integer("channel"),
  channelName: text("channel_name"),
  chatUserId: text("chat_user_id"),
  sessionId: text("session_id"),
  senderType: integer("sender_type"),
  messageType: text("message_type"),
  messageText: text("message_text"),
  payload: text("payload").notNull(),
  receivedAt: integer("received_at", { mode: "timestamp" }).notNull(),
});

export const replyRules = sqliteTable("reply_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  keywords: text("keywords").notNull(),
  replyText: text("reply_text").notNull(),
  channels: text("channels").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  autoSend: integer("auto_send", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  status: text("status").notNull(),
  actor: text("actor").notNull(),
  details: text("details").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const agentJobs = sqliteTable("agent_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalId: text("external_id").notNull().unique(),
  chatUserId: text("chat_user_id"),
  sessionId: text("session_id"),
  skill: text("skill").notNull(),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  input: text("input").notNull(),
  output: text("output").notNull(),
  draftReply: text("draft_reply"),
  customerStage: text("customer_stage"),
  requiresHuman: integer("requires_human", { mode: "boolean" }).notNull().default(true),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
