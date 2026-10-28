import { NextResponse } from "next/server";
import { fetchEccangAnalytics, getEccangConfig } from "@/lib/eccang";

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
        },
        analytics,
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
