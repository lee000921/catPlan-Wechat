#!/bin/bash
# catPlan 项目日报自动提交脚本
# 每日 18:00 自动执行

DATE=$(date +%Y-%m-%d)
REPORT_PATH="/home/admin/.openclaw/workspace/reports/daily/${DATE}.md"
WEBSITE_PATH="/home/admin/.openclaw/workspace/daily-report.html"

echo "📊 生成项目日报..."

# 1. 检查日报是否已存在
if [ -f "$REPORT_PATH" ]; then
    echo "✅ 今日日报已存在：$REPORT_PATH"
else
    echo "❌ 今日日报未生成，请先手动创建"
    exit 1
fi

# 2. 提交到 Git
cd /home/admin/.openclaw/workspace
git add reports/daily/${DATE}.md
git commit -m "docs: 添加项目日报 (${DATE})

Co-authored-by: 龙虾 🦞"
git push origin master

echo "✅ 日报已提交到 Git"

# 3. 更新网站日报列表
# （需要手动更新 daily-report.html，因为需要统计信息）
echo "⚠️  请手动更新网站日报列表：${WEBSITE_PATH}"

# 4. 发送通知
echo "📱 发送完成通知..."
# （可以添加 DingTalk/微信通知）

echo "✅ 日报自动提交完成！"
