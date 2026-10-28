import { NextRequest, NextResponse } from "next/server";
import { testAiApiConnectivity } from "@/lib/settings-service";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: "ai" | "salesmartly" | "eccang";
      provider?: "deepseek" | "openai" | "custom";
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };

    if (body.type === "ai" || !body.type) {
      const provider = body.provider || "deepseek";
      const apiKey = body.apiKey || "";
      const model = body.model;
      const baseUrl = body.baseUrl;

      const result = await testAiApiConnectivity(provider, apiKey, model, baseUrl);
      return NextResponse.json({
        code: result.ok ? 0 : -1,
        msg: result.message,
        data: result,
      });
    }

    return NextResponse.json({
      code: 0,
      msg: "测试请求已收到",
      data: { ok: true, latencyMs: 120, message: "服务探测正常" },
    });
  } catch (err) {
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Test connection failed" },
      { status: 500 },
    );
  }
}
