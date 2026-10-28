# MGOO 全域外贸客服工作台与 AI 营销中枢 (mgoohub)

[![Next.js](https://img.shields.io/badge/Framework-Vinext%20%2F%20Next.js-black)](https://github.com/cloudflare/vinext)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS%20v4-38bdf8)](https://tailwindcss.com/)
[![MCP Ready](https://img.shields.io/badge/MCP-2024--11--05-0284c7)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)

> MGOO 时尚服饰集团 16 年外贸供应链沉淀 · 全域多渠道（WhatsApp / Instagram / Email / TikTok）客户推进中台与 8 大 AI 数字员工兵团。

---

## 🌟 核心功能一览

### 1. 👥 8 大外贸全链路 AI 数字员工兵团
参照外贸爆款方法论深度定制，赋能全链路获客与转化：
- **AI 市场情报员 (`market-intel`)**：24 小时全网扫描行业大牌新品发布、TikTok 趋势爆款与做旧洗水工艺。
- **AI ICP 客户筛选员 (`icp-scorer`)**：根据国家、预算、起订量对线索进行 A/B/C 分级与投产比评估。
- **AI 目标客户研究员 (`deep-researcher`)**：深度剖析买家官网与价格带，输出《一页纸攻防画像》。
- **AI 采购信号分析员 (`buying-signals`)**：监控品牌换季上新与采购招聘，找准黄金破冰窗口。
- **AI 决策链挖掘员 (`decision-hunter`)**：穿透买家组织架构，锁定主理人与供应链采购拍板人。
- **AI 个性化开发信助理 (`outreach-assistant`)**：结合 MGOO 30-50 件低起订量现胚优势，生成 3 种高转化开发信。
- **MGOO 夜间成交助攻员 (`night-closer`)**：下班后与夜间时段自动接管 WhatsApp 咨询，早晨输出《晨报交接清单》。
- **MGOO 销售实战教练 (`sales-coach`)**：与高仿欧美买家对练，提供 4 维度打分与销冠金牌话术。

### 2. 🥋 销售实战高仿对练模拟器
- **三大海外真实买家画像**：
  - `Marcus Vance`：洛杉矶初创街潮主理人（追求 380-400gsm 重磅连帽卫衣，极度看重版型与低起订量）
  - `Chloe Evans`：英国高端普拉提/瑜伽馆主理人（追求裸感提臀、80/20 锦氨防透 Squat-Proof 面料）
  - `David Miller`：澳洲成熟电商品牌采购经理（老练严苛，疯狂砍价，考验业务员价值防守能力）
- **AI 资深销售教练**：实时评估回复质量，从 **需求挖掘、异议化解、产品专业度、关单技巧** 4 维度打分并给出示范话术。

### 3. 🌙 24/7 夜间自动托管与晨报交接
- **时段自动接管**：默认 19:00 - 次日 09:00 及周末全天自动接管 WhatsApp 进店商机。
- **3 分钟超时无应答监测**：白天人工繁忙时智能介入，防止海外买家跳出流失。
- **晨间 9:00 销售交接清单**：早晨自动输出夜间意向客户清单、紧急程度标签与建议跟进行动。

### 4. 📈 易仓 ERP 2C 动销经营数据协同
- **多渠道 GMV 大盘**：实时统计 TikTok Shop (US)、Shopify D2C、Amazon 等渠道动销与退货率。
- **2B / 2C 协同促单**：提示业务员将 2C 爆款数据（如 400g 卫衣月销 1,840 件、好评率 98.4%）作为 2B 批发客户背书，打消买家下单顾虑。

### 5. 🎨 高级浅蓝（Soft Sky Blue）LeaseFlow 现代仪表盘
- **外贸 6 阶段推进漏斗**：新入站 → 需求初筛 → 看样打样 → 核价报价 → 样衣确认 → 大货成交。
- **三大视角自由切换**：
  - `看板总览 (Dashboard)`：KPI 卡片 + 外贸漏斗 + 今日日程/待复核/预警三栏作业区
  - `漏斗深度分析 (Analytics)`：全流程大漏斗与 6 个月成单趋势、AI 自动化运行效能
  - `推进流水表 (Pipeline Table)`：外贸订单明细表与倒计时进度条
- **全新 5 栏响应式客户开发看板 (Kanban)**：告别杂乱折行，阶段流转一目了然。

### 6. 🔌 原生支持 Model Context Protocol (MCP)
- 提供标准 `/mcp` 接口（JSON-RPC 2.0），内置 9 个高阶外贸工具。
- 无缝直连 **Codex / WorkBuddy / Cursor / Claude Desktop**，支持外部 AI 大模型操控工作台。

---

## 🚀 快速启动指南

### 1. 克隆与安装依赖
```bash
git clone https://github.com/einkyhuang/mgoohub.git
cd mgoohub
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.dev.vars`：
```bash
cp .env.example .dev.vars
```
填入您的 API 密钥（如 `SALESMARTLY_API_TOKEN`、`DEEPSEEK_API_KEY` 等）。

### 3. 本地启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:5173](http://localhost:5173)。

---

## 🤖 Codex / WorkBuddy 挂载指南

在您的 Codex / WorkBuddy / Cursor 的 `mcp_config.json` 中添加：

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

更多详细教程与完整的智能体系统提示词，请参阅 [`MGOO_MCP_SKILL.md`](./MGOO_MCP_SKILL.md) 或在工作台左侧的 **「对接与教程中心」** 一键复制。

---

## 📄 许可证
Private Proprietary &copy; 2026 MGOO Fashion Group. All rights reserved.
