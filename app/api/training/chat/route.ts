import { NextRequest, NextResponse } from "next/server";
import { BUYER_PERSONAS, evaluateRoleplaySession, runBuyerTurn } from "@/lib/sales-training";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: "buyer_turn" | "evaluate";
      personaId: string;
      history?: { role: "buyer" | "rep"; content: string }[];
      latestRepMessage?: string;
      dialogue?: { role: "buyer" | "rep"; content: string }[];
    };

    const persona = BUYER_PERSONAS.find((p) => p.id === body.personaId) || BUYER_PERSONAS[0];

    if (body.action === "buyer_turn") {
      const buyerReply = await runBuyerTurn(
        persona,
        body.history || [],
        body.latestRepMessage || "",
      );
      return NextResponse.json({
        code: 0,
        msg: "success",
        data: {
          reply: buyerReply,
          timestamp: Date.now(),
        },
      });
    }

    if (body.action === "evaluate") {
      const evaluation = await evaluateRoleplaySession(
        persona,
        body.dialogue || [],
      );
      return NextResponse.json({
        code: 0,
        msg: "success",
        data: evaluation,
      });
    }

    return NextResponse.json({ code: -1, msg: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Training chat error:", error);
    return NextResponse.json(
      { code: -1, msg: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
