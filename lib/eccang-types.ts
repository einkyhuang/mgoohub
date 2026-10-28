export interface EccangConfig {
  appKey: string;
  appSecret: string;
  serviceUrl: string; // e.g. https://open.eccang.com/openapi or erp gateway
  userToken?: string;
  configured: boolean;
}

export interface EccangSalesOverview {
  todayGmvUsd: number;
  monthGmvUsd: number;
  monthOrdersCount: number;
  avgOrderValueUsd: number;
  grossMarginPct: number;
  returnRatePct: number;
  platformDistribution: {
    platform: string;
    gmvShare: number; // percentage e.g. 42%
    gmvAmountUsd: number;
    orderCount: number;
    color: string;
  }[];
  topSkus: {
    sku: string;
    name: string;
    category: "Streetwear" | "Activewear" | "Basics";
    monthlySalesUnits: number;
    inventoryLevel: number;
    safetyStock: number;
    status: "healthy" | "low_stock" | "hot_reorder";
    revenueUsd: number;
    growthPct: number;
    b2bSynergyTip: string; // How sales reps can use this 2C winner to sell 2B blanks
  }[];
  inventoryAlerts: {
    warehouse: string;
    sku: string;
    remainingDays: number;
    actionRequired: string;
    urgency: "urgent" | "warning" | "normal";
  }[];
}
