import { NextResponse } from "next/server";
import {
  clearEccangAnalytics,
  fetchEccangAnalytics,
  getEccangConfig,
  injectSampleEccangData,
  updateEccangAnalytics,
} from "@/lib/eccang";
import { EccangSalesOverview } from "@/lib/eccang-types";

export async function GET() {
  try {
    const config = getEccangConfig();
    const analytics = await fetchEccangAnalytics();

    return NextResponse.json({
      code: 0,
      msg: "success",
      data: {
        config: {
          appKeyConfigured: Boolean(config.appKey),
          serviceUrl: config.serviceUrl,
          connected: config.configured,
          userTokenConfigured: Boolean(config.userToken),
        },
        analytics,
        isRealData: Boolean(analytics && analytics.dataSource !== "sample_test"),
        hasData: Boolean(analytics),
      },
    });
  } catch (error) {
    console.error("ECCANG API fetch error:", error);
    return NextResponse.json(
      { code: -1, msg: error instanceof Error ? error.message : "Failed to load ECCANG analytics" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // Handle clear action
    if (body.action === "clear") {
      clearEccangAnalytics();
      return NextResponse.json({
        code: 0,
        msg: "易仓经营数据已清空恢复为空状态",
        data: null,
      });
    }

    // Handle test sample injection action
    if (body.action === "sample") {
      const sample = injectSampleEccangData();
      return NextResponse.json({
        code: 0,
        msg: "测试样例数据已载入",
        data: sample,
      });
    }

    // Otherwise, accept real data push from external AI, script, or webhook
    const payload = (body.payload || body) as Partial<EccangSalesOverview>;
    const updated = updateEccangAnalytics(payload);

    return NextResponse.json({
      code: 0,
      msg: "易仓 ERP 数据已成功同步写入工作台",
      data: updated,
    });
  } catch (error) {
    console.error("ECCANG data push error:", error);
    return NextResponse.json(
      { code: -1, msg: error instanceof Error ? error.message : "Failed to update ECCANG data" },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  clearEccangAnalytics();
  return NextResponse.json({
    code: 0,
    msg: "易仓经营数据已清空",
  });
}
