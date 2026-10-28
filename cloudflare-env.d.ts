declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SALESMARTLY_PROJECT_ID?: string;
    SALESMARTLY_API_TOKEN?: string;
    SALESMARTLY_WEBHOOK_SECRET?: string;
    SALESMARTLY_WEBHOOK_TOKEN?: string;
    SALESMARTLY_REPLY_MODE?: "draft" | "live";
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    OPENAI_AGENT_MODEL?: string;
    OPENAI_BASE_URL?: string;
    DEEPSEEK_API_KEY?: string;
    DEEPSEEK_MODEL?: string;
    BUSINESS_KNOWLEDGE?: string;
    CODEX_GATEWAY_URL?: string;
    CODEX_GATEWAY_MODEL?: string;
    CODEX_GATEWAY_TOKEN?: string;
  }
}


