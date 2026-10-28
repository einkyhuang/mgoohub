export interface EccangConfig {
  appKey: string;
  appSecret: string;
  serviceUrl: string; // e.g. https://open.eccang.com/openapi or erp gateway
  userToken?: string;
  configured: boolean;
}

export interface EccangPlatformDistribution {
  platform: string;
  gmvShare: number; // percentage e.g. 42%
  gmvAmountUsd: number;
  orderCount: number;
  color: string;
}

export interface EccangTopSku {
  sku: string;
  name: string;
  category: "Streetwear" | "Activewear" | "Basics" | string;
  monthlySalesUnits: number;
  inventoryLevel: number;
  safetyStock: number;
  status: "healthy" | "low_stock" | "hot_reorder";
  revenueUsd: number;
  growthPct: number;
  b2bSynergyTip: string; // How sales reps can use this 2C winner to sell 2B blanks
}

export interface EccangInventoryAlert {
  warehouse: string;
  sku: string;
  remainingDays: number;
  actionRequired: string;
  urgency: "urgent" | "warning" | "normal";
}

export interface EccangSalesOverview {
  todayGmvUsd: number;
  monthGmvUsd: number;
  monthOrdersCount: number;
  avgOrderValueUsd: number;
  grossMarginPct: number;
  returnRatePct: number;
  platformDistribution: EccangPlatformDistribution[];
  topSkus: EccangTopSku[];
  inventoryAlerts: EccangInventoryAlert[];
  lastSyncAt?: string;
  dataSource?: "live_api" | "webhook_push" | "sample_test";
}
