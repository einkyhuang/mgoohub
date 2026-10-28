#!/usr/bin/env bash

# ==============================================================================
# MGOO 全域智能外贸营销工作台 (mgoohub) - 一键安装与启动脚本
# 支持 macOS / Linux / WSL
# ==============================================================================

set -e

# 终端彩色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
  __  __  ____  ____   ____    _   _       _     
 |  \/  |/ ___|/ __ \ / __ \  | | | |_   _| |__  
 | |\/| | |  _| |  | | |  | | | |_| | | | | '_ \ 
 | |  | | |_| | |__| | |__| | |  _  | |_| | |_) |
 |_|  |_|\____|\____/ \____/  |_| |_|\__,_|_.__/ 

  🚀 MGOO 全域智能外贸营销工作台 · 一键快速部署脚本
  6+2 AI数字员工兵团 | 销售对练 | 夜间3分钟接单 | 易仓ERP
EOF
echo -e "${NC}"

# 1. 检查 Node.js 环境
echo -e "${BLUE}▶ 正在检查系统环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未检测到 Node.js，请先安装 Node.js (推荐 v20 或 v22)：${NC}"
    echo -e "   macOS (Homebrew): brew install node"
    echo -e "   或访问官网下载: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo -e "${GREEN}✓ Node.js 已安装: v${NODE_VERSION}${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 未检测到 npm，请确认 Node.js 安装完整。${NC}"
    exit 1
fi

# 2. 准备环境变量配置文件
echo -e "\n${BLUE}▶ 检查配置文件...${NC}"
if [ ! -f ".dev.vars" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .dev.vars
        echo -e "${GREEN}✓ 已从 .env.example 自动创建基础配置文件 .dev.vars${NC}"
    else
        touch .dev.vars
        echo -e "${YELLOW}! 创建空的 .dev.vars 配置文件${NC}"
    fi
else
    echo -e "${GREEN}✓ 本地配置文件 .dev.vars 已存在${NC}"
fi

# 3. 安装项目依赖
echo -e "\n${BLUE}▶ 正在安装项目依赖 (npm install)...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ node_modules 已存在，快速检查更新...${NC}"
    npm install --prefer-offline || npm install
fi
echo -e "${GREEN}✓ 所有依赖安装完成！${NC}"

# 4. 打印就绪提示与访问指南
echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 MGOO 工作台安装就绪！${NC}"
echo -e "   本地访问地址: ${BLUE}http://localhost:5173${NC}"
echo -e "   MCP 接口地址: ${BLUE}http://localhost:5173/mcp${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "💡 提示："
echo -e "  - 若要对接真实的 SaleSmartly 或 DeepSeek，可编辑 ${YELLOW}.dev.vars${NC}"
echo -e "  - 未配置密钥时，系统将自动使用高保真外贸生产中台模型，所有功能均可正常体验。"
echo -e "  - 日常启动指令: ${YELLOW}npm run dev${NC}\n"

# 5. 询问是否立即启动
read -p "是否立即启动本地服务？[Y/n]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo -e "${GREEN}▶ 正在启动 MGOO 全域外贸工作台...${NC}"
    npm run dev
fi
