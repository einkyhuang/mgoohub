import { NextResponse } from "next/server";
import { updateEccangAnalytics } from "@/lib/eccang";
import { EccangSalesOverview } from "@/lib/eccang-types";

/**
 * Standard Reserved Sync Webhook & AI Ingestion Endpoint for ECCANG ERP.
 * Endpoint: POST /api/eccang/sync
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const payload = (body.data || body.payload || body) as Partial<EccangSalesOverview>;
    const updated = updateEccangAnalytics({
      ...payload,
      dataSource: "webhook_push",
    });

    return NextResponse.json({
      code: 0,
      msg: "ECCANG ERP 2C sales data synchronized successfully",
      syncedAt: updated.lastSyncAt,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json(
      {
        code: -1,
        msg: err instanceof Error ? err.message : "Sync payload invalid",
      },
      { status: 400 },
    );
  }
}
