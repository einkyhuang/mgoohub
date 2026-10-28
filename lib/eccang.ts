import { createHash } from "node:crypto";
import { runtimeEnv } from "./salesmartly";
export * from "./eccang-types";
import { EccangConfig, EccangSalesOverview } from "./eccang-types";

// In-memory data store for ECCANG ERP analytics (synced from API, AI agent, or webhook)
let memoryEccangData: EccangSalesOverview | null = null;

export function getEccangConfig(): EccangConfig {
  const env = runtimeEnv();
  const appKey = env.ECCANG_APP_KEY || "";
  const appSecret = env.ECCANG_APP_SECRET || "";
  const serviceUrl = env.ECCANG_SERVICE_URL || "https://open.eccang.com/api";
  const userToken = env.ECCANG_USER_TOKEN || "";

  return {
    appKey,
    appSecret,
    serviceUrl,
    userToken,
    configured: Boolean(appKey && appSecret),
  };
}

/**
 * Calculates MD5 signature for ECCANG Open API calls
 */
export function createEccangSign(appKey: string, appSecret: string, timestamp: string, paramsStr: string): string {
  // ECCANG standard: md5(app_key + timestamp + app_secret + biz_content)
  return createHash("md5")
    .update(`${appKey}${timestamp}${appSecret}${paramsStr}`)
    .digest("hex")
    .toLowerCase();
}

/**
 * Helper to call official ECCANG Open API (易仓开放平台)
 */
export async function callEccangOpenApi(
  service: string,
  params: Record<string, unknown> = {},
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  const config = getEccangConfig();
  if (!config.configured) {
    return {
      success: false,
      message: "未配置 ECCANG_APP_KEY 或 ECCANG_APP_SECRET，请在环境变量中设置",
    };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsStr = JSON.stringify(params);
  const sign = createEccangSign(config.appKey, config.appSecret, timestamp, paramsStr);

  try {
    const res = await fetch(`${config.serviceUrl}/openapi/router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app-key": config.appKey,
        "token": config.userToken || "",
      },
      body: JSON.stringify({
        service,
        app_key: config.appKey,
        timestamp,
        sign,
        bizcontent: paramsStr,
      }),
    });

    if (!res.ok) {
      return { success: false, message: `ECCANG API HTTP ${res.status}: ${res.statusText}` };
    }

    const json = await res.json() as { code?: number; data?: unknown; msg?: string; message?: string };
    if (json.code === 200 || json.code === 0) {
      return { success: true, data: json.data };
    }
    return { success: false, message: json.msg || json.message || "ECCANG API call failed" };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Fetches real ECCANG ERP Sales Analytics.
 * If no real credentials configured and no data pushed, returns null (clean empty state).
 */
export async function fetchEccangAnalytics(): Promise<EccangSalesOverview | null> {
  // 1. If we already received synced data via webhook / AI push / API, return it:
  if (memoryEccangData) {
    return memoryEccangData;
  }

  const config = getEccangConfig();

  // 2. In production with live API credentials, call live ECCANG openapi gateway:
  if (config.configured) {
    try {
      const res = await fetch(`${config.serviceUrl}/sales/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "app-key": config.appKey,
          token: config.userToken || "",
        },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
        }),
      });

      if (res.ok) {
        const live = await res.json() as EccangSalesOverview;
        if (live && typeof live.todayGmvUsd === "number") {
          live.lastSyncAt = new Date().toISOString();
          live.dataSource = "live_api";
          memoryEccangData = live;
          return live;
        }
      }
    } catch (err) {
      console.warn("Live ECCANG API call failed:", err);
    }
  }

  // 3. Virtual mock data is cleared: Return null when not configured or no real data pushed
  return null;
}

/**
 * Updates or pushes ECCANG ERP analytics data from an external script, webhook, or AI agent.
 */
export function updateEccangAnalytics(payload: Partial<EccangSalesOverview>): EccangSalesOverview {
  const merged: EccangSalesOverview = {
    todayGmvUsd: Number(payload.todayGmvUsd || 0),
    monthGmvUsd: Number(payload.monthGmvUsd || 0),
    monthOrdersCount: Number(payload.monthOrdersCount || 0),
    avgOrderValueUsd: Number(payload.avgOrderValueUsd || 0),
    grossMarginPct: Number(payload.grossMarginPct || 0),
    returnRatePct: Number(payload.returnRatePct || 0),
    platformDistribution: Array.isArray(payload.platformDistribution) ? payload.platformDistribution : [],
    topSkus: Array.isArray(payload.topSkus) ? payload.topSkus : [],
    inventoryAlerts: Array.isArray(payload.inventoryAlerts) ? payload.inventoryAlerts : [],
    lastSyncAt: new Date().toISOString(),
    dataSource: payload.dataSource || "webhook_push",
  };

  memoryEccangData = merged;
  return merged;
}

/**
 * Clears current ECCANG data back to empty state.
 */
export function clearEccangAnalytics(): void {
  memoryEccangData = null;
}

/**
 * Injects a high-fidelity sample dataset for demonstration or testing when requested by user.
 */
export function injectSampleEccangData(): EccangSalesOverview {
  return updateEccangAnalytics({
    todayGmvUsd: 14280.5,
    monthGmvUsd: 384500.0,
    monthOrdersCount: 6420,
    avgOrderValueUsd: 59.89,
    grossMarginPct: 54.2,
    returnRatePct: 4.8,
    dataSource: "sample_test",
    platformDistribution: [
      { platform: "TikTok Shop (US)", gmvShare: 42, gmvAmountUsd: 161490, orderCount: 2850, color: "#000000" },
      { platform: "Shopify (Brand D2C)", gmvShare: 31, gmvAmountUsd: 119195, orderCount: 1820, color: "#96bf48" },
      { platform: "Amazon (US & EU)", gmvShare: 18, gmvAmountUsd: 69210, orderCount: 1180, color: "#ff9900" },
      { platform: "SHEIN & TEMU", gmvShare: 9, gmvAmountUsd: 34605, orderCount: 570, color: "#10b981" },
    ],
    topSkus: [
      {
        sku: "MGOO-HD-400-VBLK",
        name: "400gsm Heavyweight Acid-Wash Oversized Hoodie (Vintage Black)",
        category: "Streetwear",
        monthlySalesUnits: 1840,
        inventoryLevel: 420,
        safetyStock: 300,
        status: "hot_reorder",
        revenueUsd: 126960,
        growthPct: 38.5,
        b2bSynergyTip: "🔥 2C 绝对爆款！月销 1,840 件，好评率 98.4%。业务员在 WhatsApp 谈批发时，可直接拿该款的海外买家实穿视频和断货数据背书，推 30-50 件现胚定制！",
      },
      {
        sku: "MGOO-YG-08-NUD",
        name: "Butter-Soft High-Waist Pocket Leggings (Squat-Proof 80/20 Nylon)",
        category: "Activewear",
        monthlySalesUnits: 1420,
        inventoryLevel: 680,
        safetyStock: 400,
        status: "healthy",
        revenueUsd: 68160,
        growthPct: 22.1,
        b2bSynergyTip: "瑜伽馆主理人最爱面料！裸感提臀，退货率仅 2.1%。推荐给英国和澳洲普拉提客户做贴牌样衣。",
      },
      {
        sku: "MGOO-TEE-240-OVR",
        name: "240gsm Combed Cotton Boxy Streetwear Tee (Drop Shoulder)",
        category: "Streetwear",
        monthlySalesUnits: 2150,
        inventoryLevel: 210,
        safetyStock: 500,
        status: "low_stock",
        revenueUsd: 53750,
        growthPct: 45.2,
        b2bSynergyTip: "短袖百搭底胚！海外 TikTok 网红开箱常客。目前工厂现胚库存偏紧，可促成 B2B 买家提前下定金锁胚。",
      },
    ],
    inventoryAlerts: [
      {
        warehouse: "美西洛杉矶海外仓",
        sku: "MGOO-TEE-240-OVR (White / L)",
        remainingDays: 6,
        actionRequired: "国内工厂紧急空运补仓 500 件，防止 TikTok Shop 断流降权",
        urgency: "urgent",
      },
      {
        warehouse: "东莞保税制造仓 (国内胚布仓)",
        sku: "380g 纯棉毛圈原胚面料 (黑/白)",
        remainingDays: 14,
        actionRequired: "下达 5 吨面料定织订单，支撑海外旺季现货翻单",
        urgency: "warning",
      },
    ],
  });
}
