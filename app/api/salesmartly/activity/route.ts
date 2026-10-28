import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = (env as Cloudflare.Env).DB;
  if (!db) {
    return NextResponse.json({ audit: [], runs: [], summary: { events: 0, drafts: 0, sent: 0, humanReview: 0 } });
  }

  try {
    const [audit, runs, summary] = await db.batch([
      db.prepare("SELECT id, action, status, actor, details, created_at FROM audit_events ORDER BY created_at DESC, id DESC LIMIT 20"),
      db.prepare("SELECT id, external_id, chat_user_id, skill, status, mode, customer_stage, requires_human, draft_reply, created_at FROM agent_jobs ORDER BY created_at DESC, id DESC LIMIT 12"),
      db.prepare("SELECT COUNT(*) AS events, SUM(CASE WHEN status IN ('drafted','sent') THEN 1 ELSE 0 END) AS drafts, SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) AS sent, SUM(CASE WHEN requires_human = 1 THEN 1 ELSE 0 END) AS human_review FROM agent_jobs"),
    ]);
    const row = (summary.results[0] ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      audit: audit.results,
      runs: runs.results,
      summary: {
        events: Number(row.events ?? 0),
        drafts: Number(row.drafts ?? 0),
        sent: Number(row.sent ?? 0),
        humanReview: Number(row.human_review ?? 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { audit: [], runs: [], error: error instanceof Error ? error.message : "读取失败" },
      { status: 502 },
    );
  }
}
