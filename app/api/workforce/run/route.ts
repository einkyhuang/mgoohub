import { NextRequest, NextResponse } from "next/server";
import { AI_WORKFORCE, runAIEmployeeTask } from "@/lib/ai-workforce";

export async function GET() {
  return NextResponse.json({
    code: 0,
    msg: "success",
    data: AI_WORKFORCE,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      employeeId: string;
      targetBrandOrNiche: string;
      extraNotes?: string;
    };

    if (!body.employeeId || !body.targetBrandOrNiche) {
      return NextResponse.json(
        { code: -1, msg: "employeeId and targetBrandOrNiche are required" },
        { status: 400 },
      );
    }

    const taskResult = await runAIEmployeeTask(body.employeeId, {
      targetBrandOrNiche: body.targetBrandOrNiche,
      extraNotes: body.extraNotes,
    });

    return NextResponse.json({
      code: 0,
      msg: "success",
      data: taskResult,
    });
  } catch (err) {
    console.error("AI Employee task error:", err);
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
