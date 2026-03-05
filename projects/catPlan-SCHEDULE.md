# catPlan 项目定时任务配置

**创建日期**: 2026-03-04  
**配置人**: TL

---

## 📅 定时任务清单

### 1. 每日进度汇报（18:00）

**时间**: 每天 18:00  
**内容**: 
- 收集团队成员日报
- 汇总项目进展
- 发送给用户

**执行方式**: cron 任务

**cron 表达式**: `0 18 * * *`

**脚本路径**: `/home/admin/.openclaw/workspace/projects/scripts/daily-report.sh`

---

### 2. AI 动向晨报（08:00）

**时间**: 每天 08:00  
**内容**:
- 搜索 AI 领域最新动态
- 整理成简报
- 发送给用户

**执行方式**: cron 任务

**cron 表达式**: `0 8 * * *`

**脚本路径**: `/home/admin/.openclaw/workspace/projects/scripts/ai-digest.sh`

---

### 3. 团队成员日报提醒（17:30）

**时间**: 每天 17:30  
**内容**:
- 提醒团队成员写日报
- 收集日报内容

**执行方式**: cron 任务

**cron 表达式**: `30 17 * * *`

---

## 🔧 cron 配置

### 添加到 crontab

```bash
# 编辑 crontab
crontab -e

# 添加以下行（示例，实际路径需要调整）
30 17 * * * /home/admin/.openclaw/workspace/projects/scripts/remind-daily-report.sh
0 18 * * * /home/admin/.openclaw/workspace/projects/scripts/daily-report.sh
0 8 * * * /home/admin/.openclaw/workspace/projects/scripts/ai-digest.sh
```

---

## 📝 替代方案：OpenClaw Heartbeat

如果 cron 不可用，使用 OpenClaw heartbeat 机制：

在 `HEARTBEAT.md` 中添加：

```markdown
# 每日 18:00 项目汇报
# 每日 08:00 AI 动向晨报
```

---

## 📊 报告存储位置

- **日报**: `/home/admin/.openclaw/workspace/projects/reports/daily/YYYY-MM-DD.md`
- **晨报**: `/home/admin/.openclaw/workspace/projects/reports/ai-digest/YYYY-MM-DD.md`
- **周报**: `/home/admin/.openclaw/workspace/projects/reports/weekly/YYYY-Www.md`

---

**配置完成时间**: 2026-03-04 02:00
