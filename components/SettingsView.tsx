"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Globe,
  HelpCircle,
  KeyRound,
  Lock,
  MessageSquare,
  Play,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SystemApiSettings } from "@/lib/settings-service";

export function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemApiSettings | null>(null);

  // Form states
  const [aiProvider, setAiProvider] = useState<"deepseek" | "openai" | "custom">("deepseek");
  const [deepSeekKey, setDeepSeekKey] = useState("");
  const [deepSeekModel, setDeepSeekModel] = useState("deepseek-chat");
  const [openAiKey, setOpenAiKey] = useState("");
  const [openAiModel, setOpenAiModel] = useState("gpt-4o-mini");
  const [aiBaseUrl, setAiBaseUrl] = useState("");

  const [saleSmartlyProjectId, setSaleSmartlyProjectId] = useState("");
  const [saleSmartlyToken, setSaleSmartlyToken] = useState("");
  const [saleSmartlyWebhookSecret, setSaleSmartlyWebhookSecret] = useState("");
  const [saleSmartlyReplyMode, setSaleSmartlyReplyMode] = useState<"draft" | "live">("draft");

  const [eccangServiceUrl, setEccangServiceUrl] = useState("https://open.eccang.com/api");
  const [eccangAppKey, setEccangAppKey] = useState("");
  const [eccangAppSecret, setEccangAppSecret] = useState("");

  // Visibility toggles
  const [showDeepSeekKey, setShowDeepSeekKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showSaleSmartlyToken, setShowSaleSmartlyToken] = useState(false);
  const [showEccangSecret, setShowEccangSecret] = useState(false);

  // Test connection feedback
  const [testResult, setTestResult] = useState<{
    testing: boolean;
    ok?: boolean;
    latencyMs?: number;
    message?: string;
  }>({ testing: false });

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load current settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/keys");
      const json = (await res.json()) as { data?: SystemApiSettings };
      if (json.data) {
        setSettings(json.data);
        setAiProvider(json.data.aiProvider);
        setDeepSeekModel(json.data.deepSeekModel);
        setOpenAiModel(json.data.openAiModel);
        setAiBaseUrl(json.data.aiBaseUrl);
        setSaleSmartlyProjectId(json.data.saleSmartlyProjectId);
        setSaleSmartlyReplyMode(json.data.saleSmartlyReplyMode);
        setEccangServiceUrl(json.data.eccangServiceUrl);

        // Populate masked placeholders if set
        if (json.data.deepSeekApiKeyMasked) {
          setDeepSeekKey(json.data.deepSeekApiKeyMasked);
        }
        if (json.data.openAiApiKeyMasked) {
          setOpenAiKey(json.data.openAiApiKeyMasked);
        }
        if (json.data.saleSmartlyApiTokenMasked) {
          setSaleSmartlyToken(json.data.saleSmartlyApiTokenMasked);
        }
        if (json.data.saleSmartlyWebhookSecretMasked) {
          setSaleSmartlyWebhookSecret(json.data.saleSmartlyWebhookSecretMasked);
        }
        if (json.data.eccangAppKeyMasked) {
          setEccangAppKey(json.data.eccangAppKeyMasked);
        }
        if (json.data.eccangAppSecretMasked) {
          setEccangAppSecret(json.data.eccangAppSecretMasked);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings handler
  const handleSave = async (section: "ai" | "salesmartly" | "eccang" | "all") => {
    setSavingKey(section);
    setSaveToast(null);

    const payload: Record<string, string> = {};

    if (section === "ai" || section === "all") {
      payload.AI_PROVIDER = aiProvider;
      if (aiProvider === "deepseek") {
        payload.DEEPSEEK_API_KEY = deepSeekKey;
        payload.DEEPSEEK_MODEL = deepSeekModel;
      } else if (aiProvider === "openai") {
        payload.OPENAI_API_KEY = openAiKey;
        payload.OPENAI_AGENT_MODEL = openAiModel;
      }
      if (aiBaseUrl.trim()) {
        payload.AI_BASE_URL = aiBaseUrl.trim();
      }
    }

    if (section === "salesmartly" || section === "all") {
      payload.SALESMARTLY_PROJECT_ID = saleSmartlyProjectId;
      payload.SALESMARTLY_API_TOKEN = saleSmartlyToken;
      payload.SALESMARTLY_WEBHOOK_SECRET = saleSmartlyWebhookSecret;
      payload.SALESMARTLY_REPLY_MODE = saleSmartlyReplyMode;
    }

    if (section === "eccang" || section === "all") {
      payload.ECCANG_SERVICE_URL = eccangServiceUrl;
      payload.ECCANG_APP_KEY = eccangAppKey;
      payload.ECCANG_APP_SECRET = eccangAppSecret;
    }

    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { code: number; msg: string; data?: SystemApiSettings };
      if (json.code === 0) {
        setSaveToast("✅ " + json.msg);
        if (json.data) setSettings(json.data);
      } else {
        setSaveToast("❌ " + json.msg);
      }
    } catch (err) {
      setSaveToast("❌ 保存失败：" + (err instanceof Error ? err.message : "网络错误"));
    } finally {
      setSavingKey(null);
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  // Test AI connectivity
  const handleTestAiConnection = async () => {
    setTestResult({ testing: true });
    try {
      const activeKey = aiProvider === "deepseek" ? deepSeekKey : openAiKey;
      const activeModel = aiProvider === "deepseek" ? deepSeekModel : openAiModel;

      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ai",
          provider: aiProvider,
          apiKey: activeKey,
          model: activeModel,
          baseUrl: aiBaseUrl,
        }),
      });

      const json = (await res.json()) as {
        code: number;
        msg: string;
        data?: { ok: boolean; latencyMs: number; message: string };
      };

      if (json.data) {
        setTestResult({
          testing: false,
          ok: json.data.ok,
          latencyMs: json.data.latencyMs,
          message: json.data.message,
        });
      }
    } catch (err) {
      setTestResult({
        testing: false,
        ok: false,
        message: "测试失败：" + (err instanceof Error ? err.message : "网络超时"),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/80 bg-gradient-to-r from-slate-950 via-[#0a192f] to-[#071321] p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <KeyRound className="h-3.5 w-3.5" /> 系统设置 & API 密钥中枢
            </span>
            <Badge
              variant="outline"
              className={
                settings?.status.hasAiKey
                  ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10 text-xs"
                  : "border-amber-400/40 text-amber-300 bg-amber-500/10 text-xs"
              }
            >
              {settings?.status.hasAiKey
                ? `已连通真实 AI 引擎 (${settings.status.activeAiProvider})`
                : "当前使用内置 16 年外贸离线模型"}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">配置您的专属大模型与业务接口</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            无需手动编辑终端配置文件！直接在下方填入 <b>DeepSeek / OpenAI</b>、<b>SaleSmartly</b> 或 <b>易仓 ERP</b> 的 API 密钥，点击保存即可实时热更新生效。
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            onClick={fetchSettings}
            variant="outline"
            className="rounded-2xl border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> 重新加载
          </Button>
        </div>
      </section>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-xs font-bold text-sky-900 shadow-sm animate-in fade-in duration-200 flex items-center justify-between">
          <span>{saveToast}</span>
          <span className="text-[10px] text-sky-700 font-normal">密钥已安全加密保存在本地 .dev.vars</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)] items-start">
        {/* Left Column: API Configuration Forms */}
        <div className="space-y-6">
          {/* Card 1: AI Model Configuration (Core) */}
          <Card className="rounded-3xl border border-sky-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 font-bold border border-sky-200">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">内置 AI 大模型设置</h3>
                    <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px]" variant="outline">
                      驱动 8 位数字员工与对练模拟器
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    推荐使用 <b>DeepSeek</b>（极致性价比，千 token 仅需 1 分钱，外贸长文本理解能力极强）
                  </p>
                </div>
              </div>

              {/* Provider Selector Tabs */}
              <div className="flex items-center rounded-2xl bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAiProvider("deepseek")}
                  className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                    aiProvider === "deepseek"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🔥 DeepSeek (推荐)
                </button>
                <button
                  type="button"
                  onClick={() => setAiProvider("openai")}
                  className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                    aiProvider === "openai"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  OpenAI / ChatGPT
                </button>
              </div>
            </div>

            {/* Provider Form Fields */}
            {aiProvider === "deepseek" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-sky-600" /> DeepSeek API Key
                    </label>
                    <a
                      href="https://platform.deepseek.com/api_keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      前往 DeepSeek 开放平台申请 Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      type={showDeepSeekKey ? "text" : "password"}
                      value={deepSeekKey}
                      onChange={(e) => setDeepSeekKey(e.target.value)}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="rounded-xl border-slate-200 text-xs pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeepSeekKey(!showDeepSeekKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showDeepSeekKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">模型名称 (Model)</label>
                    <Input
                      value={deepSeekModel}
                      onChange={(e) => setDeepSeekModel(e.target.value)}
                      placeholder="deepseek-chat"
                      className="rounded-xl border-slate-200 text-xs font-mono"
                    />
                    <div className="mt-1 flex gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setDeepSeekModel("deepseek-chat")}
                        className="text-sky-600 hover:underline"
                      >
                        [常规 chat]
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeepSeekModel("deepseek-reasoner")}
                        className="text-sky-600 hover:underline"
                      >
                        [深度思考 R1]
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">API Base URL (可选)</label>
                    <Input
                      value={aiBaseUrl}
                      onChange={(e) => setAiBaseUrl(e.target.value)}
                      placeholder="默认: https://api.deepseek.com"
                      className="rounded-xl border-slate-200 text-xs font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">留空即使用官方直连地址</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-sky-600" /> OpenAI API Key
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      前往 OpenAI 平台获取 Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      type={showOpenAiKey ? "text" : "password"}
                      value={openAiKey}
                      onChange={(e) => setOpenAiKey(e.target.value)}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="rounded-xl border-slate-200 text-xs pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOpenAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">模型名称 (Model)</label>
                    <Input
                      value={openAiModel}
                      onChange={(e) => setOpenAiModel(e.target.value)}
                      placeholder="gpt-4o-mini"
                      className="rounded-xl border-slate-200 text-xs font-mono"
                    />
                    <div className="mt-1 flex gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOpenAiModel("gpt-4o-mini")}
                        className="text-sky-600 hover:underline"
                      >
                        [gpt-4o-mini 快速]
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenAiModel("gpt-4o")}
                        className="text-sky-600 hover:underline"
                      >
                        [gpt-4o 全能]
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">自定义反代 / 中转 URL</label>
                    <Input
                      value={aiBaseUrl}
                      onChange={(e) => setAiBaseUrl(e.target.value)}
                      placeholder="默认: https://api.openai.com/v1"
                      className="rounded-xl border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Test Connection Results Badge */}
            {testResult.message && (
              <div
                className={`rounded-2xl p-3 text-xs flex items-center justify-between border ${
                  testResult.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <span>{testResult.message}</span>
                {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                  <Badge variant="outline" className="border-emerald-300 text-[10px] bg-white">
                    {testResult.latencyMs}ms
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons for AI */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={testResult.testing}
                onClick={handleTestAiConnection}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-9"
              >
                {testResult.testing ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                )}
                {testResult.testing ? "正在向 API 发送测试请求..." : "测试连通性"}
              </Button>
              <Button
                type="button"
                onClick={() => handleSave("ai")}
                disabled={savingKey === "ai"}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs h-9 px-5 shadow-sm"
              >
                {savingKey === "ai" ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                保存 AI 模型配置
              </Button>
            </div>
          </Card>

          {/* Card 2: SaleSmartly Omnichannel Customer Service */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">SaleSmartly 多渠道客服与 WhatsApp 对接</h3>
                <p className="text-[11px] text-slate-400">
                  用于接收海外 WhatsApp、Instagram、Messenger 进店消息与自动留痕回发
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Project ID (项目标识)</label>
                  <Input
                    value={saleSmartlyProjectId}
                    onChange={(e) => setSaleSmartlyProjectId(e.target.value)}
                    placeholder="例如: 219502"
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">自动回复执行模式</label>
                  <select
                    value={saleSmartlyReplyMode}
                    onChange={(e) => setSaleSmartlyReplyMode(e.target.value as "draft" | "live")}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800"
                  >
                    <option value="draft">草稿留痕模式 (生成草稿供人工确认，安全防误发)</option>
                    <option value="live">自动外发模式 (直接调用 API 实时回发客户)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">API Token (OpenAPI 接口密钥)</label>
                  <a
                    href="https://app.salesmartly.com/setting/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline text-[11px]"
                  >
                    从 SaleSmartly 控制台获取 Token →
                  </a>
                </div>
                <div className="relative">
                  <Input
                    type={showSaleSmartlyToken ? "text" : "password"}
                    value={saleSmartlyToken}
                    onChange={(e) => setSaleSmartlyToken(e.target.value)}
                    placeholder="从 SaleSmartly 后台复制的开发者 Token"
                    className="rounded-xl border-slate-200 text-xs pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSaleSmartlyToken(!showSaleSmartlyToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSaleSmartlyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Webhook Secret (验签密钥)</label>
                <Input
                  type="password"
                  value={saleSmartlyWebhookSecret}
                  onChange={(e) => setSaleSmartlyWebhookSecret(e.target.value)}
                  placeholder="Webhook 回调签名私钥"
                  className="rounded-xl border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => handleSave("salesmartly")}
                  disabled={savingKey === "salesmartly"}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-5"
                >
                  {savingKey === "salesmartly" ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  保存 SaleSmartly 配置
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 3: ECCANG ERP */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-amber-100 text-amber-700 font-bold border border-amber-200">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">易仓 ERP (ECCANG) 2C 数据中台 API</h3>
                <p className="text-[11px] text-slate-400">
                  用于获取多渠道 2C 动销 GMV、热销爆款与海外仓库存，作为 2B 批发业务员成单依据
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">易仓开放平台网关地址</label>
                <Input
                  value={eccangServiceUrl}
                  onChange={(e) => setEccangServiceUrl(e.target.value)}
                  placeholder="https://open.eccang.com/api"
                  className="rounded-xl border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">ECCANG App Key</label>
                  <Input
                    value={eccangAppKey}
                    onChange={(e) => setEccangAppKey(e.target.value)}
                    placeholder="易仓开放平台分配的 App Key"
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">ECCANG App Secret</label>
                  <Input
                    type={showEccangSecret ? "text" : "password"}
                    value={eccangAppSecret}
                    onChange={(e) => setEccangAppSecret(e.target.value)}
                    placeholder="易仓开放平台分配的 App Secret"
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => handleSave("eccang")}
                  disabled={savingKey === "eccang"}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-5"
                >
                  {savingKey === "eccang" ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  保存易仓配置
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Key Security & Environment Status Info */}
        <div className="space-y-5">
          {/* Security Guarantee Card */}
          <Card className="rounded-3xl border border-sky-200 bg-sky-50/60 p-5 shadow-sm space-y-3 text-xs text-sky-950">
            <div className="flex items-center gap-2 font-bold text-sky-900">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
              <span>密钥安全防护保障</span>
            </div>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              1. <b>严格脱敏保护</b>：您在此保存的所有 API Token 仅存储在服务端的 <code className="font-mono text-sky-800">.dev.vars</code> 本地环境变量中。<br />
              2. <b>杜绝代码泄露</b>：<code className="font-mono text-sky-800">.dev.vars</code> 已被严格加入 <code className="font-mono text-sky-800">.gitignore</code>，无论执行多少次 Git 推送，您的真实 API Key 都绝对不会被推送到 GitHub。<br />
              3. <b>界面防录屏掩码</b>：已配置的密钥均采用 <code className="font-mono text-slate-500">sk-••••••abcd</code> 脱敏呈现，开会演示或录屏时万无一失。
            </p>
          </Card>

          {/* Webhook Endpoint for SaleSmartly */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              SaleSmartly 自定义 AI 成员接收地址
            </span>
            <div className="rounded-2xl bg-slate-950 p-3.5 font-mono text-[11px] text-emerald-300 break-all border border-slate-800">
              http://localhost:5173/api/salesmartly/webhook
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              在 SaleSmartly 后台创建「自定义 AI 成员」或 Webhook 机器人时，填入上述地址，即可实现夜间消息自动接管与 3 分钟超时守护。
            </p>
          </Card>

          {/* MCP Endpoint for External AI */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Codex / WorkBuddy MCP 直连地址
            </span>
            <div className="rounded-2xl bg-slate-950 p-3.5 font-mono text-[11px] text-sky-300 break-all border border-slate-800">
              http://localhost:5173/mcp
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              在 Codex 或 WorkBuddy 中配置此端点，外部大模型可直接调度工作台内的 8 位 AI 员工、查询易仓经营数据与外发 WhatsApp 消息。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
