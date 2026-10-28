import { NextRequest, NextResponse } from "next/server";
import { getSystemApiSettings, saveSystemApiSettings } from "@/lib/settings-service";

export async function GET() {
  try {
    const settings = getSystemApiSettings();
    // Sanitize: never return full raw secrets in JSON payload
    const sanitized = {
      ...settings,
      deepSeekApiKey: settings.deepSeekApiKeyMasked,
      openAiApiKey: settings.openAiApiKeyMasked,
      saleSmartlyApiToken: settings.saleSmartlyApiTokenMasked,
      saleSmartlyWebhookSecret: settings.saleSmartlyWebhookSecretMasked,
      eccangAppKey: settings.eccangAppKeyMasked,
      eccangAppSecret: settings.eccangAppSecretMasked,
      eccangUserToken: settings.eccangUserTokenMasked,
    };
    return NextResponse.json({
      code: 0,
      msg: "success",
      data: sanitized,
    });
  } catch (err) {
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;

    const keysToSave: Record<string, string> = {};

    // Filter and sanitize allowed keys
    if (body.DEEPSEEK_API_KEY && !body.DEEPSEEK_API_KEY.includes("••••")) {
      keysToSave.DEEPSEEK_API_KEY = body.DEEPSEEK_API_KEY.trim();
    }
    if (body.OPENAI_API_KEY && !body.OPENAI_API_KEY.includes("••••")) {
      keysToSave.OPENAI_API_KEY = body.OPENAI_API_KEY.trim();
    }
    if (body.AI_PROVIDER) {
      keysToSave.AI_PROVIDER = body.AI_PROVIDER.trim();
    }
    if (body.DEEPSEEK_MODEL) {
      keysToSave.DEEPSEEK_MODEL = body.DEEPSEEK_MODEL.trim();
    }
    if (body.OPENAI_AGENT_MODEL) {
      keysToSave.OPENAI_AGENT_MODEL = body.OPENAI_AGENT_MODEL.trim();
    }
    if (body.AI_BASE_URL) {
      keysToSave.AI_BASE_URL = body.AI_BASE_URL.trim();
    }

    // SaleSmartly
    if (body.SALESMARTLY_PROJECT_ID) {
      keysToSave.SALESMARTLY_PROJECT_ID = body.SALESMARTLY_PROJECT_ID.trim();
    }
    if (body.SALESMARTLY_API_TOKEN && !body.SALESMARTLY_API_TOKEN.includes("••••")) {
      keysToSave.SALESMARTLY_API_TOKEN = body.SALESMARTLY_API_TOKEN.trim();
    }
    if (body.SALESMARTLY_WEBHOOK_SECRET && !body.SALESMARTLY_WEBHOOK_SECRET.includes("••••")) {
      keysToSave.SALESMARTLY_WEBHOOK_SECRET = body.SALESMARTLY_WEBHOOK_SECRET.trim();
    }
    if (body.SALESMARTLY_REPLY_MODE) {
      keysToSave.SALESMARTLY_REPLY_MODE = body.SALESMARTLY_REPLY_MODE.trim();
    }

    // ECCANG
    if (body.ECCANG_SERVICE_URL) {
      keysToSave.ECCANG_SERVICE_URL = body.ECCANG_SERVICE_URL.trim();
    }
    if (body.ECCANG_APP_KEY && !body.ECCANG_APP_KEY.includes("••••")) {
      keysToSave.ECCANG_APP_KEY = body.ECCANG_APP_KEY.trim();
    }
    if (body.ECCANG_APP_SECRET && !body.ECCANG_APP_SECRET.includes("••••")) {
      keysToSave.ECCANG_APP_SECRET = body.ECCANG_APP_SECRET.trim();
    }

    const saveResult = saveSystemApiSettings(keysToSave);
    const updatedSettings = getSystemApiSettings();

    return NextResponse.json({
      code: 0,
      msg: saveResult.message,
      data: updatedSettings,
    });
  } catch (err) {
    return NextResponse.json(
      { code: -1, msg: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 500 },
    );
  }
}
