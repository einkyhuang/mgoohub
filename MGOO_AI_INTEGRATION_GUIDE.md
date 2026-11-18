# MGOO 全域外贸客服工作台 — AI 智能体对接与多员工配置开发文档

> **版本**：v2.4.0 (2026 生产级规范)  
> **适用受众**：技术运维、外贸业务主管、IT 架构师、外贸业务员  
> **核心定位**：专为服装外贸出口打造的「全域消息聚合 + 多大模型接入 + 8大数字员工协同 + 易仓 ERP 联动」中台系统

---

## 目录
1. [系统总体架构与 AI 协作机制](#一系统总体架构与-ai-协作机制)
2. [后台全局配置 vs 员工个人配置（权限与模式）](#二后台全局配置-vs-员工个人配置权限与模式)
3. [支持的 AI 模型与接口对接指南](#三支持的-ai-模型与接口对接指南)
   - 3.1 [DeepSeek 官方直连（推荐首选）](#31-deepseek-官方直连推荐首选)
   - 3.2 [OpenAI 官方直连](#32-openai-官方直连)
   - 3.3 [OneAPI / NewAPI / 聚合中转网关（企业级）](#33-oneapi--newapi--聚合中转网关企业级)
   - 3.4 [Claude 3.5 Sonnet 接入](#34-claude-35-sonnet-接入)
4. [图形化后台配置操作流程（零代码开箱）](#四图形化后台配置操作流程零代码开箱)
5. [外贸知识库、提示词与风控规则定制](#五外贸知识库提示词与风控规则定制)
6. [Model Context Protocol (MCP) 智能体协议对接](#六model-context-protocol-mcp-智能体协议对接)
7. [生产部署、环境变量与启动运维](#七生产部署环境变量与启动运维)
8. [常见问题与排错手册 (FAQ)](#八常见问题与排错手册-faq)

---

## 一、系统总体架构与 AI 协作机制

MGOO 全域工作台将海外多渠道买家消息无缝接入，并通过 AI 智能体管道完成自动分级、背调分析与智能回复。

```
[海外客户] WhatsApp / Messenger / Instagram / 官网LiveChat / Telegram / TikTok
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │     全域统一消息接入层 (SaleSmartly / Webhook)     │
          └────────────────────────┬─────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │             MGOO 全域工作台协同中台               │
          │                                                  │
          │  ┌────────────────────┐   ┌───────────────────┐  │
          │  │ 8 大外贸数字员工    │   │ 24H 夜间看守系统  │  │
          │  │ (背调/评分/开发信) │   │ (自动值班+晨会报) │  │
          │  └─────────┬──────────┘   └─────────┬─────────┘  │
          │            │                        │            │
          │  ┌─────────▼────────────────────────▼─────────┐  │
          │  │         AI 统一模型网关 (Settings API)      │  │
          │  │  (支持 DeepSeek / OpenAI / Claude / 自建)  │  │
          │  └─────────────────────┬──────────────────────┘  │
          │                        │                         │
          │  ┌─────────────────────▼──────────────────────┐  │
          │  │      业务安全隔离区 (Human-in-the-Loop)     │  │
          │  │  • 普通线索: 生成草稿供业务员一键复核修改  │  │
          │  │  • 夜间紧急: 超时未回自动触发出价排期      │  │
          │  └────────────────────────────────────────────┘  │
          └────────────────────────┬─────────────────────────┘
                                   │
                                   ▼
             [企业数据联动] 易仓 ERP 2C 动销背书 / 私有外贸知识库
```

### 核心亮点
1. **真实商机分级 (A/B/C/D)**：自动抓取买家公司规模、目标品类（如 400g 重磅做旧卫衣、裸感瑜伽服）、首单目标数量及交期。
2. **安全草稿流 (Draft Mode)**：AI 默认仅生成建议回复草稿，由业务员在右侧侧边栏一键点击「一键发送」或修改后发出，杜绝 AI 乱报超低价风险。
3. **夜间 24H 托管 (Night Watchdog)**：北京时间 19:00 至次日 09:00（正值欧美工作时间），AI 自动接管，3 分钟内快速响应欧美买家，早晨自动生成《晨间销售交接清单》。
4. **易仓 ERP 2C 降维打击 2B**：实时调用美区 TikTok Shop、Amazon 等独立站真实爆款销量背书，用海外实销数据说服批发客户。

---

## 二、后台全局配置 vs 员工个人配置（权限与模式）

针对客户与管理团队关心的核心问题：**“使用的人如何配置？可否直接后台设置好？员工是否也需要配 API？”**

本系统提供了 **三种灵活可控的配置模式**：

| 配置模式 | 适用场景 | 管理员动作 | 员工/业务员动作 | 计费与风控 |
| :--- | :--- | :--- | :--- | :--- |
| **模式 A：企业全局统一配置（强烈推荐）** | 公司统一采买 API 账号，业务员无需任何技术门槛，开箱即用 | 在后台设置中心填写公司统一 API Key（如 DeepSeek 或 OpenAI） | **无需配置任何 API**，打开网页直接使用所有 AI 功能 | 公司统一充值监控，便于统一设定敏感词与底线价格风控 |
| **模式 B：多员工独立专属配置** | 各业务组（欧美组、中东组、拉美组）或合伙人使用独立 API 账号与专属口吻 | 开放员工个人中心中的「专属 AI 密钥」填写入口 | 在个人设置页填入自己申请的 Key，可选择定制系统人设 | 各组自负盈亏，支持差异化模型（如欧美组用 Claude 3.5，中东组用 DeepSeek） |
| **模式 C：双轨混合分权模式** | 中大型外贸企业分级管理 | 配置公司全局通用底座 Key（兜底） | 可选填个人 Key；若填则优先走个人账户，未填自动走公司全局兜底 | 既保障了 100% 员工即时可用，又满足了资深业务员个性化微调的需求 |

### 管理员如何让员工“完全零门槛上手”？
1. 管理员登录系统，进入左侧导航栏底部的 **「设置与接入」**。
2. 在 **「AI 智能体模型网关」** 中填入公司统一的 DeepSeek 或 OpenAI API Key。
3. 点击 **「测试连通性」** 并保存。
4. **此时全公司所有业务员的电脑立即生效**，员工不需要了解什么是 API，直接在工作台右侧与客户对话、生成外贸开发信、查看背调报告。

---

## 三、支持的 AI 模型与接口对接指南

工作台原生采用兼容 **OpenAI 国际标准协议** 的请求引擎，支持主流商用大模型。

### 3.1 DeepSeek 官方直连（推荐首选）
> **优势**：中文外贸业务理解深刻、英语商务信件措辞地道、成本极低（约为 GPT-4o 的 1/20）、推理与砍价防守逻辑极强。

- **官方平台**：[https://platform.deepseek.com/](https://platform.deepseek.com/)
- **获取 API Key**：注册登录 -> 左侧「API Keys」 -> 点击「创建 API Key」
- **后台填写参数**：
  - **AI 服务商**：选择 `DeepSeek`
  - **API 地址 (Base URL)**：`https://api.deepseek.com`
  - **API Key**：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`
  - **默认模型 (Model)**：
    - 日常客服与极速对话：`deepseek-chat` (即 DeepSeek-V3)
    - 深度背调与复杂报价核算：`deepseek-reasoner` (即 DeepSeek-R1)

### 3.2 OpenAI 官方直连
> **优势**：全球跨国节点访问极速，多语言（西语、法语、德语、阿拉伯语）通用泛化能力极佳。

- **官方平台**：[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **后台填写参数**：
  - **AI 服务商**：选择 `OpenAI`
  - **API 地址 (Base URL)**：`https://api.openai.com/v1`
  - **API Key**：`sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx`
  - **默认模型 (Model)**：
    - 性价比首选：`gpt-4o-mini`
    - 复杂图像识别与精细排版：`gpt-4o`

### 3.3 OneAPI / NewAPI / 聚合中转网关（企业级）
> **适用**：国内服务器部署无法直连外网，或企业内网搭建了 OneAPI / NewAPI / FastGPT 统一管理多模型额度。

- **后台填写参数**：
  - **AI 服务商**：选择 `自定义 OpenAI 兼容网关 (Custom Gateway)`
  - **API 地址 (Base URL)**：`https://your-oneapi-domain.com/v1`（注意必须保留 `/v1`）
  - **API Key**：在 OneAPI 中生成的令牌密钥
  - **默认模型 (Model)**：填入网关支持的任意模型名称（如 `claude-3-5-sonnet-20241022`、`deepseek-ai/DeepSeek-V3`、`qwen-plus` 等）

### 3.4 Claude 3.5 Sonnet 接入
若需使用 Anthropic 的 Claude 3.5 Sonnet（公认编写地道欧美商务邮件、长篇合同分析最顶级的模型）：
- 建议通过 OneAPI / NewAPI 或 AWS Bedrock / OpenRouter 代理接入。
- 填写示例：
  - **Base URL**：`https://openrouter.ai/api/v1`
  - **API Key**：OpenRouter Key
  - **Model**：`anthropic/claude-3.5-sonnet`

---

## 四、图形化后台配置操作流程（零代码开箱）

系统内置了可视化的系统设置面板（位于 `/` 主界面的设置标签页或独立 `/settings` 路由）：

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ MGOO 系统对接与 API 管理后台                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [1. AI 模型接口配置]                                        │
│   服务商选择:  (•) DeepSeek   ( ) OpenAI   ( ) 自定义网关   │
│   API Base URL: [ https://api.deepseek.com            ]     │
│   API Key:      [ sk-••••••••••••••••••••••••••••3a9f ] [👁️] │
│   默认模型:     [ deepseek-chat                       ]     │
│                                                             │
│   [ ⚡ 测试连通性 ] ──> 🟢 连通成功！DeepSeek 响应时延 428ms │
│                                                             │
│ [2. 全域客服聚合 (SaleSmartly) 对接]                        │
│   项目 Project ID: [ 10839201                         ]     │
│   API Token:       [ tk_live_•••••••••••••••••••••88  ]     │
│   回复模式:        (•) 安全草稿模式 (人工复核)               │
│                    ( ) 自动直接投递 (适合夜间全自动)        │
│                                                             │
│ [3. 易仓 ERP 2C 数据协同]                                   │
│   API Service URL: [ https://open.eccang.com/api      ]     │
│   App Key / Secret: 已受企业级高强度加密保护                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                  [ 💾 保存并全系统热更新 ]              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 操作步骤：
1. **选择服务商**：点击对应服务商卡片（默认推荐 DeepSeek）。
2. **粘贴 Key**：将申请到的 API Key 粘贴进输入框，系统自动提供「显示/隐藏明文」按钮方便核对。
3. **点击测试**：点击「测试连通性」按钮。系统会自动向服务商发起一次仅耗费 1 个 Token 的握手探测，并在下方展示绿色时延（如 `🟢 连通成功！420ms`）。如果报错，将直接显示 HTTP 状态码与详细排错建议。
4. **点击保存**：系统会执行两项操作：
   - 立即热更新当前 Node.js / Cloudflare 运行时内存，无需重启服务；
   - 自动将配置安全覆写至根目录 `.dev.vars`，确保重启后永久保留。

---

## 五、外贸知识库、提示词与风控规则定制

工作台预设了深度整合 **MGOO 16 年服饰供应链** 的核心 Prompt 与规则引擎（位于 `lib/salesmartly.ts` 及 `lib/night-watchdog.ts`）。

### 5.1 核心提示词资产与外贸杀手锏
```markdown
# 核心商务策略
1. 极低起订量破冰：
   海外初创品牌通常担心起订量（MOQ 500+）压货风险。
   话术核心：“我们支持 30-50 件低起订量现胚定制 + 极速出样（3-5天），助您零库存试款。”

2. 2C 爆款数据降维打击 2B 批发客户：
   调取美区 TikTok / 独立站热销款数据背书。
   话术核心：“这款 400gsm 做旧黑连帽卫衣单月在美区出单 1,800+ 件，好评率 98.4%，
   国内现胚充足，随时可以下样单验证版型。”

3. 专业工艺背书：
   - 卫衣：380g-450gsm 法式重磅毛圈 (French Terry)、植物酵素洗水、做旧磨破、发泡印花、Tone-on-tone 刺绣。
   - 瑜伽服：裸感锦氨 (80% Nylon 20% Spandex)、四针六线无缝拼缝、100% 防透防走光 (Squat-Proof)。
```

### 5.2 报价与风控安全围栏
为防止 AI “胡乱承诺降价”，系统内置了 3 道安全防线：
1. **底价硬红线**：若买家开价低于预设底价（例如要求 450g 卫衣低于 $9.5/件），AI 自动触发预警并回复：“此数量与工艺要求需由业务总监审批，我已为您加急提交，稍后给您正式核价单。”
2. **交期预警**：大货交期常规为 15-20 天，若买家要求 5 天出大货，AI 自动转为引导提供「现胚加急打标」替代方案。
3. **敏感信息过滤**：自动脱敏同行敏感价格与工厂内部排产批号。

---

## 六、Model Context Protocol (MCP) 智能体协议对接

MGOO 全域工作台原生支持 Anthropic 主导的 **MCP (Model Context Protocol)** 协议。
这意味着你可以把整个工作台作为外部工具集挂载到 **Codex、WorkBuddy、Cursor、Claude Desktop、Antigravity** 中。

### 6.1 MCP 客户端接入配置 (`mcp_config.json`)
```json
{
  "mcpServers": {
    "mgoo-workbench": {
      "url": "http://127.0.0.1:5173/mcp",
      "headers": {
        "x-mcp-token": "mgoo-secure-local-token"
      }
    }
  }
}
```

### 6.2 工作台开放的 9 大核心 MCP 工具

| 工具名 (Tool Name) | 功能说明 | 核心输入参数 |
| :--- | :--- | :--- |
| `run_ai_employee` | 调度 8 大外贸数字员工（背调、开发信、决策链分析等） | `employee_id`, `target_brand_or_niche`, `extra_notes` |
| `get_night_watchdog_report` | 读取 19:00-09:00 夜间自动截获的高意向欧美线索与交接清单 | 无参数 `{}` |
| `get_eccang_overview` | 读取易仓 ERP 2C 真实动销数据（爆款 SKU、TikTok/Shopify 销量、库存预警） | 无参数 `{}` |
| `sync_eccang_overview` | 写入/同步易仓 ERP 真实数据 | `today_gmv_usd`, `month_gmv_usd`, `top_skus` 等 |
| `send_whatsapp_message` | 自动投递或暂存 WhatsApp 营销消息（默认 `auto_send: false` 暂存安全草稿） | `chat_user_id`, `message`, `auto_send` |
| `run_sales_roleplay` | 与高仿欧美买家（严苛采购、街潮主理人）进行实战对练与打分 | `persona_id`, `rep_message` |
| `get_operations_overview` | 统计全渠道入站消息总量、已自动回复数与待人工复核数 | 无参数 `{}` |
| `search_customer_messages` | 全文检索历史客户在 WhatsApp/Messenger 等渠道的入站咨询 | `query`, `limit` |
| `get_customer_brief` | 提取指定买家的历史咨询摘要、画像阶段与 AI 决策日志 | `chat_user_id` |

---

## 七、生产部署、环境变量与启动运维

### 7.1 核心环境变量表 (`.env` 或 `.dev.vars`)
在项目根目录创建或编辑 `.dev.vars`：

```bash
# ==========================================
# 1. AI 引擎配置 (二选一或全部配置)
# ==========================================
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat

# 若使用 OpenAI:
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
# OPENAI_MODEL=gpt-4o-mini

# 若使用自建 OneAPI / NewAPI 中转:
# AI_PROVIDER=custom
# AI_BASE_URL=https://your-gateway.com/v1
# DEEPSEEK_API_KEY=your-token
# DEEPSEEK_MODEL=claude-3-5-sonnet

# ==========================================
# 2. SaleSmartly 全域客服网关 (选配，连通真实社媒)
# ==========================================
SALESMARTLY_PROJECT_ID=your_project_id
SALESMARTLY_API_TOKEN=your_api_token
SALESMARTLY_WEBHOOK_SECRET=your_webhook_secret
SALESMARTLY_REPLY_MODE=draft  # draft=安全草稿模式, live=直接发送

# ==========================================
# 3. 易仓 ERP 2C 数据中台 (选配)
# ==========================================
ECCANG_SERVICE_URL=https://open.eccang.com/api
ECCANG_APP_KEY=your_app_key
ECCANG_APP_SECRET=your_app_secret
ECCANG_USER_TOKEN=your_user_token
```

### 7.2 快速运行指令
```bash
# 1. 解压项目后进入目录
cd mgoo-omnichannel-desk

# 2. 安装依赖 (推荐 Node.js >= 22.13.0)
npm install
# 或使用 pnpm
pnpm install

# 3. 启动本地开发服务 (默认监听 127.0.0.1:5173)
npm run dev

# 4. 构建生产代码
npm run build
```

---

## 八、常见问题与排错手册 (FAQ)

### Q1：员工点击 AI 生成没反应或提示 `Unauthorized (401)`？
- **原因**：填写的 API Key 失效、欠费或包含了不可见的空格换行符。
- **解决**：进入工作台设置页面，点击「测试连通性」，查看具体返回。若提示欠费请前往 DeepSeek / OpenAI 控制台充值。

### Q2：为什么推荐将工作台访问地址固定为 `http://127.0.0.1:5173/` 而不是 `localhost:5173`？
- **原因**：部分现代操作系统（如 macOS）的 `localhost` 默认优先解析至 IPv6 `[::1]`，如果本机有其他后台服务（如 Python 脚本或代理工具）占用了 IPv6 的 5173 端口，会导致访问错乱。明确使用 `127.0.0.1` 可确保 100% 精准直达 MGOO 工作台。

### Q3：如何将本工作台部署到公网供公司全体异地员工使用？
- **方式一（轻量推荐）**：使用 Cloudflare Tunnel（零公网 IP、自带免费 HTTPS 与团队访问控制）：
  ```bash
  cloudflared tunnel --url http://127.0.0.1:5173
  ```
- **方式二（服务器部署）**：在腾讯云 / 阿里云 / 香港 VPS 上安装 Node 22，使用 PM2 守护进程部署：
  ```bash
  pm2 start "npm run dev" --name "mgoo-desk"
  ```
  配合 Nginx 反向代理绑定公司二级域名（如 `desk.mgoo.com`）。

### Q4：AI 会不会私自给客户降价或者报错运费？
- 系统默认开启 `SALESMARTLY_REPLY_MODE=draft`（安全草稿模式）。所有 AI 对话均暂存在业务员沟通界面的「待复核区域」，业务员肉眼核对价格无误后，点击「确认发送」才会真实投递至客户 WhatsApp / Messenger，从根本上阻断越权报价。

---

*文档编写与审核：MGOO 数字化工程团队 · 保留所有权利*
