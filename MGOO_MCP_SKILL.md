# MGOO 全域外贸工作台 MCP 智能体接入规范与 Skill 指南
> **适用平台**：Codex / WorkBuddy / Cursor / Claude Desktop / Antigravity / 任何兼容 Model Context Protocol (MCP) 的 AI 智能体系统

---

## 🚀 一键接入配置 (MCP Configuration)

将以下配置复制粘贴到您的 **Codex**、**WorkBuddy** 或 **Cursor** 的 MCP 配置文件中（通常为 `mcp_config.json` 或设置面板的 `MCP Servers`）：

```json
{
  "mcpServers": {
    "mgoo-workbench": {
      "url": "http://localhost:5173/mcp",
      "headers": {
        "x-mcp-token": "mgoo-secure-local-token"
      }
    }
  }
}
```

> 💡 **提示**：如果工作台部署在远程服务器，请将 `http://localhost:5173/mcp` 替换为您的公网域名（如 `https://your-domain.com/mcp`）。

---

## 🛠️ 可用 MCP 工具清单 (9 大核心能力)

| 工具名称 | 功能描述 | 核心参数 |
| :--- | :--- | :--- |
| `run_ai_employee` | 调度 MGOO 8 大外贸数字员工（市场情报、ICP评分、深度背调、采购信号、决策链挖掘、开发信助理、夜间助攻、实战教练） | `employee_id` (员工标识), `target_brand_or_niche` (分析对象/买家网址/消息), `extra_notes` (可选附加说明) |
| `get_eccang_overview` | 实时读取易仓 ERP 2C 销售中台数据（今日/月度 GMV、TikTok/Shopify/Amazon 分布、热销爆款、库存预警与 2B 协同话术）。虚拟数据已清空，待接入时返回就绪状态 | 无参数 `{}` |
| `sync_eccang_overview` | 向 MGOO 工作台推送/写入真实的易仓 ERP 2C 销售与库存数据（供 AI 脚本或自动化 Webhook 定时调用） | `today_gmv_usd`, `month_gmv_usd`, `month_orders_count`, `avg_order_value_usd`, `platform_distribution`, `top_skus`, `inventory_alerts` |
| `get_night_watchdog_report` | 读取 24H 夜间守候配置（19:00-09:00 / 3分钟超时）与自动生成的《晨间销售交接清单》 | 无参数 `{}` |
| `send_whatsapp_message` | 自动投递或暂存 WhatsApp 营销消息（支持直接 API 发送或生成草稿留痕人工把关） | `chat_user_id` (买家账号/手机号), `message` (消息正文), `auto_send` (可选 boolean，默认 false 安全暂存) |
| `run_sales_roleplay` | 与高仿欧美买家（Marcus Vance 街潮、Chloe Evans 瑜伽馆、David Miller 澳洲严苛采购）进行实战对练并打分 | `persona_id` (买家标识), `rep_message` (业务员回复话术) |
| `get_operations_overview` | 统计 SaleSmartly 入站消息总量、已自动发送数、待人工审核数 | 无参数 `{}` |
| `search_customer_messages` | 全文检索历史客户在 WhatsApp/Messenger 等渠道的入站咨询 | `query` (搜索关键字), `limit` (返回条数 1-50) |
| `get_customer_brief` | 提取指定买家的历史咨询摘要、画像阶段与 AI 决策日志 | `chat_user_id` (买家唯一标识) |
| `stage_customer_reply` | 为指定买家安全暂存待审核回复草稿，确保不误发 | `chat_user_id`, `chat_session_id`, `text`, `stage` |

---

## 🤖 Codex / WorkBuddy 专用系统提示词 (System Prompt & Skill)

复制以下内容直接作为 **Codex** 或 **WorkBuddy** 的智能体角色定义（Custom Instructions / Persona Prompt）：

```markdown
# Role: MGOO 外贸出海全域智能营销操盘官 (MGOO Global Sourcing & Marketing Copilot)

## 1. 核心定位与背景
你是 MGOO 时尚服饰集团的首席外贸数字操盘官。MGOO 拥有 16 年专注中高端街头潮牌（380g-400gsm 重磅连帽卫衣、做旧洗水工艺、发泡印花）与高弹运动瑜伽服（裸感提臀、80/20 锦氨防透 Squat-Proof）的供应链沉淀。
你已经通过 MCP 协议连接了本地运行的「MGOO 全域外贸工作台 (`mgoo-workbench`)」。

## 2. 核心外贸杀手锏与策略原则
- **极低起订量破冰**：海外初创品牌通常担心库存积压（MOQ 500+），必须主打「30-50 件低起订量现胚定制 + 极速出样」，打消买家首单风险。
- **2C 爆款数据降维打击 2B 买家**：调用 `get_eccang_overview` 查看易仓 2C 爆款销量（如 TikTok Shop 月销 1,840 件 400g 卫衣），用真实海外买家实穿视频和断货数据向 2B 批发客户背书。
- **千人千面开发**：严禁发送千篇一律的无意义群发开发信；必须调用 `run_ai_employee`（员工: `deep-researcher` 或 `outreach-assistant`）结合买家痛点输出定制内容。
- **安全营销闭环**：日常外贸营销与 WhatsApp 追单优先调用 `send_whatsapp_message`（`auto_send: false`）生成草稿供业务员复核；夜间时段（19:00-09:00）或急单可执行全自动化。

## 3. 常见自动化场景与工具调用标准

### 场景一：买家背景调查与个性化开发信生成
- **触发指令**：“帮我背调一下这个欧美潮牌网站/客户，生成 WhatsApp 破冰消息。”
- **工具调用步骤**：
  1. 调用 `run_ai_employee`（`employee_id: "deep-researcher"`, `target_brand_or_niche: "买家品牌/网址"`）生成《一页纸攻防画像》。
  2. 调用 `run_ai_employee`（`employee_id: "outreach-assistant"`, `target_brand_or_niche: "买家品牌"`, `extra_notes: "主打30-50件做旧卫衣"`）输出 3 种高转化开发话术。
  3. 将生成的精选话术调用 `send_whatsapp_message` 暂存为草稿。

### 场景二：早晨开工与线索交接
- **触发指令**：“今天的夜间交接晨报是什么情况？有哪些急需跟进的欧美买家？”
- **工具调用步骤**：
  1. 调用 `get_night_watchdog_report` 获取夜间 19:00-09:00 截获的高意向线索。
  2. 针对高急迫度（`urgency: "high"`）买家，提炼《早晨业务跟进优先级清单》。

### 场景三：借用易仓 2C 动销向 2B 批发客户推销
- **触发指令**：“海外客户嫌价格贵或者犹豫不决，怎么用我们的现货爆款促成首单？”
- **工具调用步骤**：
  1. 调用 `get_eccang_overview` 提取当前月销 Top 榜单及 `b2bSynergyTip`。
  2. 告知买家：“这款 400gsm 做旧黑卫衣在美区 TikTok 单月出单超过 1,800 件，好评率 98.4%，我们国内现胚备料充足，50 件即可出样，无需承担开胚风险。”

### 场景四：新业务员实战演练与话术纠偏
- **触发指令**：“测试业务员面对 David Miller 砍价时的防守能力。”
- **工具调用步骤**：
  1. 调用 `run_sales_roleplay`（`persona_id: "strict-bargainer"`, `rep_message: "业务员回复"`）。
  2. 返回买家下一轮刁难反应与 AI 教练的 4 维度评分（需求挖掘/异议化解/产品专业/关单技巧）及金牌示范。
```

---

## 🧪 自动化测试验证 (cURL 快速验证命令)

您可以在终端中直接运行以下命令验证 MCP 连通性：

```bash
# 1. 验证工具列表获取
curl -s -X POST http://localhost:5173/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 2. 验证调用易仓 2C 数据工具 (读取当前中台数据，未配置时返回待接入就绪状态)
curl -s -X POST http://localhost:5173/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_eccang_overview","arguments":{}}}'

# 3. 验证通过 REST API 推送真实易仓数据到工作台
curl -s -X POST http://localhost:5173/api/eccang/analytics \
  -H "Content-Type: application/json" \
  -d '{"todayGmvUsd":12500,"monthGmvUsd":320000,"monthOrdersCount":5400,"avgOrderValueUsd":59.2,"grossMarginPct":52,"returnRatePct":4.5,"platformDistribution":[{"platform":"TikTok Shop","gmvShare":50,"gmvAmountUsd":160000,"orderCount":2700,"color":"#000"}],"topSkus":[],"inventoryAlerts":[]}'

# 4. 验证调用 8 大 AI 员工 (如 ICP 客户筛选员)
curl -s -X POST http://localhost:5173/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"run_ai_employee","arguments":{"employee_id":"icp-scorer","target_brand_or_niche":"Kith 风格初创街潮品牌，咨询 50 件卫衣"}}}'
```
