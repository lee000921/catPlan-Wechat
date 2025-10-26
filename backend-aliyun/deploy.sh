#!/bin/bash

# CatPlan 后端快速部署脚本

echo "================================"
echo "  CatPlan 后端快速部署脚本"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 检查MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  未检测到 MongoDB，请确保 MongoDB 已安装并运行"
fi

echo ""
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑配置后重新运行"
    echo ""
    echo "需要配置的项:"
    echo "  - MONGODB_URI (MongoDB连接地址)"
    echo "  - JWT_SECRET (JWT密钥)"
    echo "  - WECHAT_APPID (微信小程序AppID)"
    echo "  - WECHAT_APPSECRET (微信小程序AppSecret)"
    exit 0
fi

echo "✅ 找到 .env 配置文件"
echo ""

# 创建日志目录
if [ ! -d logs ]; then
    mkdir logs
    echo "✅ 创建日志目录"
fi

# 导入初始数据
echo "📋 导入初始数据..."
node scripts/importData.js

if [ $? -ne 0 ]; then
    echo "⚠️  数据导入失败，请检查 MongoDB 连接"
    echo "   继续部署..."
fi

echo ""
echo "================================"
echo "  部署完成！"
echo "================================"
echo ""
echo "启动方式:"
echo "  开发环境: npm run dev"
echo "  生产环境: npm start"
echo "  PM2启动:  npm run pm2:start"
echo ""
echo "健康检查: http://localhost:3000/health"
echo ""
