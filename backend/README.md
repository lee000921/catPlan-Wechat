# 积分商城后端 - 周期任务功能

## 项目结构

```
backend/
├── config/
│   ├── database.js          # 数据库配置
│   ├── db.js                # 数据库连接和工具函数
│   └── schema.sql           # 数据库表结构
├── models/
│   ├── index.js             # 模型导出
│   ├── User.js              # 用户模型
│   ├── Task.js              # 任务实例模型
│   ├── PeriodicTask.js      # 周期任务配置模型
│   └── PeriodicTaskLog.js   # 完成记录模型
├── routes/
│   ├── periodicTasks.js     # 周期任务 API 路由
│   └── tasks.js             # 任务实例 API 路由
├── scheduler/
│   └── taskScheduler.js     # 定时任务调度器
├── scripts/
│   └── dailyTaskCreator.js  # 每日任务创建脚本（cron 用）
├── server.js                # 服务器入口
├── package.json             # 项目配置
└── README.md                # 本文档
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 3. 测试调度器（可选）

```bash
npm run scheduler:test
```

## 数据库表结构

### 核心表

#### users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| openid | VARCHAR(64) | 用户唯一标识 |
| nickname | VARCHAR(100) | 昵称 |
| user_type | VARCHAR(10) | 用户类型（A: 申请者，B: 普通用户） |
| points | INTEGER | 积分余额 |

#### products - 物品表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | VARCHAR(100) | 物品名称 |
| points | INTEGER | 所需积分 |
| stock | INTEGER | 库存 |

#### exchange_records - 兑换记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户 ID |
| product_id | INTEGER | 物品 ID |
| points | INTEGER | 消耗积分 |
| status | INTEGER | 状态（0: 处理中，1: 成功，2: 失败） |

### 周期任务扩展表

#### tasks - 任务表（新增字段）
| 字段 | 类型 | 说明 |
|------|------|------|
| is_periodic | INTEGER | 是否周期任务（0: 否，1: 是） |
| periodic_type | VARCHAR(20) | 周期类型（daily/weekly/monthly） |
| periodic_config | TEXT | 周期配置（JSON） |
| parent_task_id | INTEGER | 关联的周期任务配置 ID |
| due_date | DATE | 任务截止日期 |

#### periodic_tasks - 周期任务配置表（新增）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户 ID |
| title | VARCHAR(200) | 任务标题 |
| points | INTEGER | 完成奖励积分 |
| is_active | INTEGER | 是否激活（0: 否，1: 是） |
| periodic_type | VARCHAR(20) | 周期类型（daily/weekly/monthly） |
| periodic_config | TEXT | 周期配置（JSON） |
| approval_status | INTEGER | 审批状态（0: 待审批，1: 已通过，2: 已拒绝） |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期（NULL 表示无限期） |
| total_created | INTEGER | 累计创建的任务实例数 |
| total_completed | INTEGER | 累计完成的任务实例数 |

#### periodic_task_logs - 完成记录表（新增）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| periodic_task_id | INTEGER | 周期任务配置 ID |
| task_id | INTEGER | 任务实例 ID |
| user_id | INTEGER | 用户 ID |
| completed_at | DATETIME | 完成时间 |
| points_earned | INTEGER | 获得积分 |

## API 接口

### 周期任务接口

#### 1. 申请周期任务
```
POST /api/tasks/periodic
```

**请求头:**
```
X-User-ID: 1
```

**请求体:**
```json
{
  "title": "每日签到",
  "description": "每天签到获得积分",
  "points": 10,
  "periodicType": "daily",
  "periodicConfig": {
    "hour": 9
  },
  "startDate": "2026-03-05",
  "endDate": "2026-12-31"
}
```

**周期配置说明:**
- `daily`: `{ "hour": 9 }` - 每天 9 点
- `weekly`: `{ "weekday": 1, "hour": 9 }` - 每周一 9 点（weekday: 0-6, 0=周日）
- `monthly`: `{ "dayOfMonth": 15, "hour": 9 }` - 每月 15 号 9 点

**响应:**
```json
{
  "code": 0,
  "message": "周期任务申请成功，等待审批",
  "data": {
    "id": 1,
    "title": "每日签到",
    "periodicType": "daily",
    "startDate": "2026-03-05",
    "endDate": "2026-12-31",
    "approvalStatus": 0
  }
}
```

#### 2. 获取我的周期任务
```
GET /api/tasks/periodic/my?page=1&pageSize=10&status=1
```

**查询参数:**
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `status`: 状态筛选（0: 停用，1: 激活）

**响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "每日签到",
        "points": 10,
        "periodicType": "daily",
        "periodicConfig": { "hour": 9 },
        "is_active": 1,
        "approval_status": 1,
        "total_created": 5,
        "total_completed": 3
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 3. 完成周期任务
```
POST /api/tasks/periodic/:id/complete
```

**请求头:**
```
X-User-ID: 1
```

**响应:**
```json
{
  "code": 0,
  "message": "任务完成成功",
  "data": {
    "taskId": 10,
    "pointsEarned": 10,
    "completedAt": "2026-03-05T09:00:00.000Z"
  }
}
```

**注意:** 每个周期任务每天只能完成一次。

#### 4. 获取完成记录
```
GET /api/tasks/periodic/:id/logs?page=1&pageSize=20
```

**响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "periodic_task_id": 1,
        "task_id": 10,
        "user_id": 1,
        "completed_at": "2026-03-05T09:00:00.000Z",
        "points_earned": 10,
        "remark": "完成周期任务：每日签到"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

### 任务实例接口

#### 1. 获取任务列表
```
GET /api/tasks?page=1&pageSize=20&status=0&isPeriodic=1
```

**查询参数:**
- `status`: 状态筛选（0: 待完成，1: 已完成，2: 已过期）
- `isPeriodic`: 是否周期任务（0: 否，1: 是）

#### 2. 获取今日任务
```
GET /api/tasks/today
```

**响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10,
        "title": "每日签到",
        "points": 10,
        "status": 0,
        "due_date": "2026-03-05",
        "is_periodic": 1
      }
    ],
    "date": "2026-03-05"
  }
}
```

#### 3. 完成任务
```
POST /api/tasks/:id/complete
```

## 定时任务

### 自动创建机制

系统每天 00:00 自动为所有激活且已审批的周期任务创建当天的任务实例。

**调度逻辑:**
1. 查询所有 `is_active=1` 且 `approval_status=1` 的周期任务
2. 根据周期类型判断是否需要创建今日实例
3. 检查是否已存在今日任务（避免重复）
4. 创建任务实例，`due_date` 设为今天
5. 更新周期任务的 `last_created_at` 和 `total_created`

### 使用系统 Cron（可选）

如果不想使用内置调度器，可以使用系统 cron:

```bash
# 编辑 crontab
crontab -e

# 添加每日 00:00 执行的任务
0 0 * * * /usr/bin/node /home/admin/.openclaw/workspace/backend/scripts/dailyTaskCreator.js >> /var/log/daily_tasks.log 2>&1
```

## 审批流程

周期任务需要审批后才能激活：

1. 用户申请周期任务（`approval_status=0`）
2. 管理员审批（调用 `/api/tasks/periodic/:id/approve`，设置 `approval_status=1`）
3. 审批通过后，系统自动开始创建每日任务实例

**审批接口（需管理员权限）:**
```
PUT /api/tasks/periodic/:id/approve
```

**请求体:**
```json
{
  "approved": true
}
```

## 前端集成示例

### 微信小程序调用示例

```javascript
// app.js
globalData: {
  baseUrl: 'https://your-api-domain.com/api',
  userId: 1 // 实际应从登录态获取
}

// pages/task/list/list.js
Page({
  data: {
    tasks: []
  },
  
  onLoad() {
    this.loadTasks();
  },
  
  async loadTasks() {
    const { baseUrl, userId } = getApp().globalData;
    
    wx.request({
      url: `${baseUrl}/tasks/periodic/my`,
      header: {
        'X-User-ID': userId
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ tasks: res.data.data.list });
        }
      }
    });
  },
  
  async completeTask(taskId) {
    const { baseUrl, userId } = getApp().globalData;
    
    wx.request({
      url: `${baseUrl}/tasks/periodic/${taskId}/complete`,
      method: 'POST',
      header: {
        'X-User-ID': userId
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: `获得 ${res.data.data.pointsEarned} 积分`,
            icon: 'success'
          });
          this.loadTasks();
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      }
    });
  }
});
```

## 开发说明

### 添加新的周期类型

1. 在 `PeriodicTask.js` 的 `shouldCreateTask` 方法中添加新类型的判断逻辑
2. 更新 `schema.sql` 中的注释说明
3. 更新本文档

### 测试

```bash
# 启动开发服务器
npm run dev

# 测试调度器
npm run scheduler:test

# 使用 curl 测试 API
curl -X POST http://localhost:3000/api/tasks/periodic \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "title": "测试任务",
    "periodicType": "daily",
    "periodicConfig": {"hour": 9},
    "startDate": "2026-03-05"
  }'
```

## 注意事项

1. **用户认证**: 当前使用简单的 `X-User-ID` 头，生产环境应使用 JWT 或其他安全认证方式
2. **时区处理**: 所有日期使用服务器本地时区，确保时区设置正确
3. **并发控制**: 调度器有 `isRunning` 标志防止并发执行
4. **数据备份**: 定期备份 SQLite 数据库文件
5. **日志记录**: 生产环境建议添加日志文件记录

## 开发者

- **Luban (Backend-2)**
- 开发时间：2026-03-05
