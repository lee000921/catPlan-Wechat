#!/bin/bash
# catPlan 后端部署脚本 - 生产环境
# 执行环境：生产 ECS (39.104.84.63)
# 创建时间：2026-03-04

set -e

echo "========================================="
echo "catPlan 后端部署脚本"
echo "========================================="
echo ""

# 1. 检查 Node.js
echo "📦 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js 版本：$NODE_VERSION"

# 2. 检查 PM2
echo "📦 检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    npm install -g pm2 --prefix ~/.local
    export PATH=$PATH:$HOME/.local/bin
fi
PM2_VERSION=$(pm2 --version | grep -oP '\d+\.\d+\.\d+')
echo "✅ PM2 版本：$PM2_VERSION"

# 3. 克隆或更新代码
echo "📦 准备代码..."
cd /home/admin
if [ -d "catPlan-Server" ]; then
    echo "⚠️  catPlan-Server 目录已存在，跳过克隆"
    cd catPlan-Server
    # git pull origin main  # 如果需要更新代码
else
    echo "📥 克隆代码仓库..."
    git clone https://github.com/lee000921/catPlan-Server.git
    cd catPlan-Server
fi

# 4. 安装依赖
echo "📦 安装依赖..."
npm install --omit=dev
echo "✅ 依赖安装完成"

# 5. 配置环境变量
echo "📦 配置环境变量..."
if [ ! -f ".env" ]; then
    cp .env.bak .env
    echo "✅ .env 文件已创建"
else
    echo "⚠️  .env 文件已存在，跳过"
fi

# 显示当前配置（隐藏密码）
echo ""
echo "当前数据库配置:"
grep "DB_HOST" .env
grep "DB_USER" .env
grep "DB_DATABASE" .env
echo ""

# 6. 测试数据库连接
echo "📦 测试数据库连接..."
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'rm-hp38wlo973b3mm8qu.mysql.huhehaote.rds.aliyuncs.com',
      port: 3306,
      user: process.env.DB_USER || 'openclaw',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'catplan'
    });
    console.log('✅ MySQL 连接成功！');
    await conn.end();
  } catch(e) {
    console.log('❌ MySQL 连接失败:', e.message);
    process.exit(1);
  }
})();" || {
    echo "⚠️  数据库连接失败，但继续部署（使用 Mock 模式）"
}

# 7. 停止旧服务
echo "📦 停止旧服务..."
export PATH=$PATH:$HOME/.local/bin
pm2 stop catplan-api 2>/dev/null || true
pm2 delete catplan-api 2>/dev/null || true

# 8. 启动新服务
echo "📦 启动服务..."
pm2 start src/index.js --name catplan-api --env production
pm2 save

# 9. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 10. 检查服务状态
echo ""
echo "========================================="
echo "📊 服务状态"
echo "========================================="
pm2 list

echo ""
echo "========================================="
echo "📋 最近日志"
echo "========================================="
pm2 logs catplan-api --lines 10 --nostream 2>&1 | tail -15

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "服务访问地址:"
echo "  健康检查：http://39.104.84.63:3000/health"
echo "  API 接口：http://39.104.84.63:3000/api/*"
echo ""
echo "PM2 管理命令:"
echo "  pm2 list              # 查看状态"
echo "  pm2 logs catplan-api  # 查看日志"
echo "  pm2 restart catplan-api  # 重启"
echo "  pm2 stop catplan-api  # 停止"
echo ""
