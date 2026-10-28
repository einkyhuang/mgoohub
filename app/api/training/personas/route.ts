import { NextResponse } from "next/server";
import { BUYER_PERSONAS } from "@/lib/sales-training";

export async function GET() {
  return NextResponse.json({
    code: 0,
    msg: "success",
    data: BUYER_PERSONAS,
  });
}
