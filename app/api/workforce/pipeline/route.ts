import { NextRequest, NextResponse } from "next/server";
import { runAutonomousPipeline } from "@/lib/ai-workforce";

/**
 * Endpoint for running the 6+2 Autonomous Customer Discovery & Prospecting Pipeline.
 * POST /api/workforce/pipeline
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      targetNiche?: string;
      extraNotes?: string;
    };

    const targetNiche = body.targetNiche?.trim() || "欧美中高端街头潮牌，咨询 400g 重磅做旧卫衣";
    const extraNotes = body.extraNotes?.trim() || "关注工艺：做旧水洗、发泡印花、30-50件低起订量现胚定制";

    const report = await runAutonomousPipeline(targetNiche, extraNotes);

    return NextResponse.json({
      code: 0,
      msg: "Autonomous prospecting pipeline executed successfully",
      data: report,
    });
  } catch (err) {
    console.error("Pipeline execution error:", err);
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Pipeline error" },
      { status: 500 },
    );
  }
}
