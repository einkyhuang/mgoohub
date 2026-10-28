import { NextResponse } from "next/server";
import { demoAccounts, demoConversations, trend } from "@/lib/demo-data";
import { asList, buildDashboard } from "@/lib/salesmartly-map";
import { getConnectionState, salesmartlyGet } from "@/lib/salesmartly";

export const dynamic = "force-dynamic";

const DAY_IN_SECONDS = 24 * 60 * 60;

export async function GET() {
  const connection = getConnectionState();
  if (!connection.configured) {
    return NextResponse.json({
      mode: "demo",
      connection,
      conversations: demoConversations,
      leads: demoConversations,
      accounts: demoAccounts,
      trend,
      counts: { conversations: demoConversations.length, leads: demoConversations.length, accounts: demoAccounts.length },
    });
  }

  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - 30 * DAY_IN_SECONDS;
    const [sessions, messages, contacts, members] = await Promise.all([
      salesmartlyGet("get-session-list", { page: 1, page_size: 100, session_status: 0 }),
      salesmartlyGet("get-all-message-list", { page: 1, page_size: 100, sort_type: 0 }),
      salesmartlyGet("get-contact-list", { page: 1, page_size: 100, updated_time: JSON.stringify({ start, end }) }),
      salesmartlyGet("get-member-list", { page: 1, page_size: 100 }),
    ]);
    const data = buildDashboard({
      sessions: asList(sessions),
      messages: asList(messages),
      contacts: asList(contacts),
      members: asList(members),
    });
    return NextResponse.json({ mode: "live", connection, ...data });
  } catch (error) {
    return NextResponse.json(
      { mode: "error", connection, error: error instanceof Error ? error.message : "同步失败" },
      { status: 502 },
    );
  }
}
