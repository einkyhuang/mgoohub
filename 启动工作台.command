#!/bin/bash
# ========================================================
# MGOO 全域外贸客服工作台 — 本地极速启动脚本
# ========================================================

cd "$(dirname "$0")"

echo "========================================================"
echo "🚀 正在启动 MGOO 全域外贸客服工作台..."
echo "========================================================"

# 检查 Node.js 环境
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 Node.js 环境，请先安装 Node.js (推荐 v22+)"
  echo "下载地址: https://nodejs.org/"
  read -p "按回车键退出..."
  exit 1
fi

echo "🟢 Node.js 版本: $(node -v)"

# 如果 node_modules 不存在，自动安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 正在自动安装项目依赖，请稍候..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    npm install
  fi
fi

echo "✨ 启动开发服务器中 (固定端口: 5173)..."
echo "🌐 本地访问地址: http://127.0.0.1:5173/"
echo "💡 提示: 若需要停止服务，请直接关闭本终端窗口。"
echo "========================================================"

# 延时 2 秒自动在默认浏览器中打开页面
(sleep 2 && open "http://127.0.0.1:5173/") &

npm run dev
