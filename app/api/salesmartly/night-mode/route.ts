import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { agentJobs } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  DEFAULT_WATCHDOG_CONFIG,
  generateMorningReport,
  NightWatchdogConfig,
  shouldWatchdogTrigger,
} from "@/lib/night-watchdog";

// In-memory or persisted runtime config
let activeConfig: NightWatchdogConfig = { ...DEFAULT_WATCHDOG_CONFIG };

export async function GET() {
  const now = new Date();
  const triggerCheck = shouldWatchdogTrigger(activeConfig, now);

  // Fetch recent night jobs for handover report
  let recentJobs: {
    id: number;
    chatUserId: string | null;
    input: string;
    output: string;
    createdAt: Date;
  }[] = [];

  try {
    const db = getDb();
    recentJobs = await db
      .select({
        id: agentJobs.id,
        chatUserId: agentJobs.chatUserId,
        input: agentJobs.input,
        output: agentJobs.output,
        createdAt: agentJobs.createdAt,
      })
      .from(agentJobs)
      .orderBy(desc(agentJobs.id))
      .limit(15);
  } catch {
    // db fallback
  }

  const report = generateMorningReport(
    recentJobs.map((j) => ({ ...j, chatUserId: j.chatUserId ?? undefined })),
  );

  return NextResponse.json({
    code: 0,
    msg: "success",
    data: {
      config: activeConfig,
      currentServerTime: now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isTriggerActive: triggerCheck.trigger,
      triggerReason: triggerCheck.reason,
      morningReport: report,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<NightWatchdogConfig>;
    activeConfig = {
      ...activeConfig,
      ...body,
    };

    return NextResponse.json({
      code: 0,
      msg: "Watchdog configuration updated",
      data: activeConfig,
    });
  } catch (err) {
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 },
    );
  }
}
