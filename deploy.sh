#!/usr/bin/env bash
# 秋招投递助手 —— Linux 服务器部署脚本
# 用法：
#   bash deploy.sh          仅安装依赖、构建、启动（默认，不动 git）
#   bash deploy.sh --pull   先 git pull 拉取最新代码再部署
set -e

if [ "$1" = "--pull" ]; then
  echo "==> 拉取最新代码"
  git pull
fi

echo "==> 安装后端依赖（含 better-sqlite3 原生编译）"
cd server
npm install --omit=dev
cd ..

echo "==> 安装前端依赖并构建"
cd client
npm install
npm run build
cd ..

echo "==> 通过 PM2 启动/重载服务"
if pm2 describe qiuzhao-tracker > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo "==> 部署完成，服务运行在端口 3001"
