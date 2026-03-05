# catPlan 项目现状文档

**文档版本**: v1.0  
**整理日期**: 2026-03-04  
**整理者**: Team AI Dev  
**生产环境**: 阿里云 ECS (39.104.84.63)

---

## 📋 项目概述

catPlan 是一个**前后端分离**的微信小程序任务管理系统，支持申请者和审批者两种角色，实现任务创建、审批、完成和积分兑换等功能。

---

## 🏗️ 项目结构

### 代码库分布

| 仓库 | 用途 | 位置 | 状态 |
|------|------|------|------|
| **catPlan-Server** | 后端 API 服务 | `/home/admin/catPlan-Server` | ✅ 已克隆 |
| **catPlan** (Frontend) | 微信小程序前端 | `/home/admin/catPlan-Frontend` | ✅ 已克隆 |

---

## 🔧 技术栈

### 后端 (catPlan-Server)

| 技术 | 版本/说明 |
|------|----------|
| **运行时** | Node.js |
| **框架** | Express.js |
| **数据库** | MySQL (支持阿里云 RDS) |
| **认证** | JWT (可选) |
| **部署** | 阿里云 ECS + PM2 |
| **语言** | JavaScript (CommonJS) |

### 前端 (catPlan)

| 技术 | 版本/说明 |
|------|----------|
| **平台** | 微信小程序 |
| **语言** | TypeScript |
| **UI 框架** | 微信小程序原生框架 |
| **编译工具** | 微信开发者工具 |
| **代码加载** | glass-easel + 懒加载 |

---

## 📁 后端项目详情 (catPlan-Server)

### 目录结构

```
catPlan-Server/
├── src/
│   ├── index.js           # 应用入口
│   ├── config.js          # 环境配置
│   ├── db.js              # 数据库连接 (mysql2)
│   ├── memory-db.js       # 内存数据库 (降级方案)
│   ├── middleware/
│   │   └── auth.js        # 认证中间件 (可选)
│   └── routes/
│       ├── auth.js        # 登录认证
│       ├── user.js        # 用户资料
│       ├── signin.js      # 签到功能
│       └── tasks.js       # 任务管理 ⭐
├── frontend-mini/         # 简化版前端参考
├── .env.example           # 环境变量示例
├── .env.bak               # 备份配置
├── package.json           # 依赖配置
├── init-tasks-db.js       # 数据库初始化脚本
├── 需求文档.md            # 详细需求文档
├── CODE_REVIEW_*.md       # 代码审查文档 (3 份)
├── IFLOW.md               # 交互流程文档
└── SOLUTION-APPROVAL.md   # 方案审批文档
```

### 已实现功能

#### 1. 用户认证 (`/api/auth`)
- ✅ 微信登录 (jscode2session)
- ✅ Mock 模式支持 (开发调试)
- ✅ JWT Token 生成

#### 2. 用户管理 (`/api/user`)
- ✅ 获取用户资料
- ✅ 更新用户资料
- ✅ 内存存储 (降级方案)

#### 3. 签到系统 (`/api/signin`)
- ✅ 每日签到
- ✅ 连续签到奖励
- ✅ 签到历史记录

#### 4. 任务管理 (`/api/tasks`) ⭐
- ✅ 创建任务 (A 类用户)
- ✅ 任务列表查询
- ✅ 任务详情查询
- ✅ 审批任务 (B 类用户)
- ✅ 完成任务 (A 类用户)
- ✅ 用户类型管理 (A/B/AB)

### 数据库表结构

#### 已创建表

| 表名 | 说明 | 状态 |
|------|------|------|
| `users` | 用户表 (openid, user_type, points) | ✅ |
| `signins` | 签到记录表 | ✅ |
| `tasks` | 任务表 | ✅ |
| `task_approvals` | 任务审批记录 | ✅ |
| `task_completions` | 任务完成记录 | ✅ |
| `user_points` | 积分流水表 | ✅ |
| `shop_items` | 商城物品表 | ✅ |
| `exchanges` | 兑换记录表 | ✅ |
| `item_suggestions` | 物品建议表 | ✅ |

### 环境变量配置

```bash
# .env 文件
PORT=3000
WECHAT_APPID=YOUR_APPID
WECHAT_SECRET=YOUR_SECRET
DB_HOST=your-rds-host.rds.aliyuncs.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=catplan
JWT_SECRET=your_jwt_secret_here
```

### 特性

- ✅ **双模式运行**: MySQL 模式 / 内存 Mock 模式
- ✅ **自动降级**: 数据库连接失败自动切换到内存模式
- ✅ **事务支持**: 关键操作使用数据库事务
- ✅ **用户类型系统**: A(申请者)/B(审批者)/AB(双重角色)

---

## 📱 前端项目详情 (catPlan)

### 目录结构

```
catPlan/
├── miniprogram/
│   ├── app.json           # 小程序配置
│   ├── app.ts             # 应用入口
│   ├── pages/
│   │   ├── login/         # 登录页面 (角色选择)
│   │   ├── signin/        # 签到页面
│   │   ├── tasks/         # 任务列表
│   │   ├── task-submit/   # 任务提交
│   │   └── task-detail/   # 任务详情
│   ├── utils/
│   │   ├── request.ts     # HTTP 请求封装
│   │   ├── config.ts      # 配置文件
│   │   └── util.ts        # 工具函数
│   └── services/
│       └── user.ts        # 用户服务
├── typings/               # TypeScript 类型定义
├── project.config.json    # 微信开发者工具配置
├── tsconfig.json          # TypeScript 配置
├── ARCHITECTURE.md        # 架构文档 ⭐⭐⭐
├── BACKEND_ENVIRONMENT.md # 后端环境说明
├── DEVELOPER_GUIDE.md     # 开发者指南
├── QUICK_START.md         # 快速开始
└── 其他文档 (8 份)
```

### 已实现页面

| 页面 | 路径 | 功能 | 状态 |
|------|------|------|------|
| 登录页 | `pages/login` | 微信登录 + 角色选择 | ✅ |
| 签到页 | `pages/signin` | 每日签到 | ✅ |
| 任务列表 | `pages/tasks` | 查看任务列表 | ✅ |
| 任务提交 | `pages/task-submit` | 创建新任务 | ✅ |
| 任务详情 | `pages/task-detail` | 查看任务详情 | ✅ |

### 核心配置

```json
// project.config.json
{
  "appid": "wx557d4f3490a318fe",
  "projectname": "catPlan",
  "miniprogramRoot": "miniprogram/",
  "compileType": "miniprogram",
  "setting": {
    "es6": true,
    "enhance": true,
    "skylineRenderEnable": true
  }
}
```

### 特性

- ✅ **前后端分离**: 通过 `request.ts` 封装 API 调用
- ✅ **TypeScript**: 严格类型检查
- ✅ **Token 管理**: 自动在请求头添加 Authorization
- ✅ **错误处理**: 统一的错误拦截

---

## 🌐 API 接口清单

### 认证相关

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/auth/login` | POST | 微信登录 | ✅ |
| `/api/user/profile` | GET | 获取用户资料 | ✅ |
| `/api/user/profile` | POST | 更新用户资料 | ✅ |

### 签到相关

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/signin/checkin` | POST | 每日签到 | ✅ |
| `/api/signin/history` | GET | 签到历史 | ✅ |

### 任务相关

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/tasks` | POST | 创建任务 | ✅ |
| `/api/tasks` | GET | 任务列表 | ✅ |
| `/api/tasks/:id` | GET | 任务详情 | ✅ |
| `/api/tasks/:id/approve` | POST | 审批任务 | ✅ |
| `/api/tasks/:id/complete` | POST | 完成任务 | ✅ |
| `/api/tasks/fix-user-type` | POST | 修复用户类型 (临时) | ✅ |

### 商城相关 (待实现)

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/shop/items` | GET | 获取物品列表 | ⏳ |
| `/api/shop/items` | POST | 上架物品 | ⏳ |
| `/api/shop/exchange` | POST | 兑换物品 | ⏳ |
| `/api/shop/exchange-history` | GET | 兑换历史 | ⏳ |
| `/api/shop/suggestions` | GET | 物品建议 | ⏳ |

---

## 🚀 部署状态

### 生产环境

| 项目 | 配置 | 状态 |
|------|------|------|
| **服务器** | 阿里云 ECS | ✅ |
| **公网 IP** | 39.104.84.63 | ✅ |
| **后端服务** | Node.js + PM2 | ⏳ 待部署 |
| **数据库** | MySQL (本地/云) | ⏳ 待确认 |
| **域名** | 未配置 | ⏳ |
| **HTTPS** | 未配置 | ⏳ |

### 开发环境

| 项目 | 配置 | 状态 |
|------|------|------|
| **后端** | localhost:3000 | ✅ 可运行 |
| **前端** | 微信开发者工具 | ✅ 可运行 |
| **数据库** | Mock 模式 | ✅ 可用 |

---

## 📊 项目完成度

### 后端

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 用户认证 | 80% | 基础功能完成，需完善 JWT |
| 签到系统 | 100% | 完整实现 |
| 任务管理 | 90% | 核心功能完成 |
| 商城系统 | 0% | 数据库表已创建，接口未实现 |
| 数据持久化 | 50% | 支持 MySQL，但生产环境未配置 |

### 前端

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 登录页面 | 80% | 基础功能完成 |
| 签到页面 | 80% | 基础功能完成 |
| 任务页面 | 70% | 列表/提交/详情完成 |
| 商城页面 | 0% | 未开发 |
| 个人中心 | 0% | 未开发 |

---

## ⚠️ 已知问题

### 后端

1. **数据库配置**: 生产环境 MySQL 连接信息未配置
2. **JWT 认证**: 当前使用可选认证，需强制启用
3. **商城接口**: 数据库表已创建，但 API 未实现
4. **错误处理**: 部分接口错误处理不完善
5. **日志系统**: 缺少统一日志记录

### 前端

1. **API 地址**: 生产环境 API 地址未配置
2. **域名白名单**: 微信小程序服务器域名未配置
3. **商城页面**: 未开发
4. **个人中心**: 未开发
5. **错误提示**: 用户友好提示不足

### 部署

1. **HTTPS 证书**: 未申请和配置
2. **域名**: 未绑定域名
3. **PM2 配置**: 未配置生产环境进程管理
4. **数据库备份**: 未配置自动备份
5. **监控告警**: 未配置服务监控

---

## 🎯 后续发展建议

### 短期目标 (1-2 周)

1. **生产环境部署**
   - [ ] 配置阿里云 RDS MySQL
   - [ ] 部署后端服务到 ECS
   - [ ] 配置 PM2 进程管理
   - [ ] 申请并配置 HTTPS 证书

2. **前后端联调**
   - [ ] 配置前端生产环境 API 地址
   - [ ] 微信小程序服务器域名白名单
   - [ ] 完整测试登录→签到→任务流程

3. **商城功能开发**
   - [ ] 实现商城 API 接口
   - [ ] 开发商城前端页面
   - [ ] 实现兑换功能

### 中期目标 (1 个月)

1. **功能完善**
   - [ ] 个人中心页面
   - [ ] 数据统计功能
   - [ ] 用户管理后台
   - [ ] 消息通知系统

2. **性能优化**
   - [ ] Redis 缓存层
   - [ ] 数据库索引优化
   - [ ] API 响应时间优化
   - [ ] 前端分包加载

3. **安全加固**
   - [ ] 强制 JWT 认证
   - [ ] 输入数据验证
   - [ ] 防刷机制
   - [ ] 敏感数据加密

### 长期目标 (3 个月+)

1. **架构升级**
   - [ ] 前后端代码完全分离 (前端独立仓库)
   - [ ] 微服务架构评估
   - [ ] 容器化部署 (Docker)
   - [ ] CI/CD 流水线

2. **功能扩展**
   - [ ] 多任务类型支持
   - [ ] 任务模板系统
   - [ ] 团队协作功能
   - [ ] 数据分析报表

3. **运营支持**
   - [ ] 用户反馈系统
   - [ ] 运营数据后台
   - [ ] A/B 测试框架
   - [ ] 用户增长工具

---

## 📝 关键决策点

### 1. 前端代码分离

**现状**: 前端代码在 `catPlan` 仓库中，但包含后端相关文档

**建议**: 
- ✅ 将前端代码完全独立到新仓库 `catPlan-Wechat`
- ✅ 当前仓库保留后端相关文档作为参考
- ✅ 建立清晰的仓库边界

### 2. 数据库选择

**现状**: 支持 MySQL，生产环境未配置

**建议**:
- ✅ 使用阿里云 RDS MySQL (稳定、易维护)
- ✅ 配置自动备份
- ✅ 评估是否需要 Redis 缓存层

### 3. 认证方案

**现状**: 可选认证，Mock 模式

**建议**:
- ✅ 生产环境强制 JWT 认证
- ✅ Token 有效期 7 天
- ✅ 支持 Token 刷新

### 4. 部署策略

**现状**: 单机 ECS 部署

**建议**:
- ✅ 短期：保持单机，优化配置
- ⏳ 中期：评估负载均衡
- ⏳ 长期：容器化 + 自动扩缩容

---

## 📞 团队信息

**负责团队**: Team AI Dev  
**技术栈**: OpenClaw + 阿里云百炼  
**成员角色**:
- TL: qwen3.5-plus (协调)
- Developer: qwen3.5-plus (开发)
- Reviewer: qwen3-max (审查)
- Tester: qwen3.5-plus (测试)
- Architect: qwen3-max (架构)

---

## 📚 相关文档

- [需求文档](/home/admin/catPlan-Server/需求文档.md)
- [架构文档](/home/admin/catPlan-Frontend/ARCHITECTURE.md)
- [快速开始](/home/admin/catPlan-Frontend/QUICK_START.md)
- [开发者指南](/home/admin/catPlan-Frontend/DEVELOPER_GUIDE.md)

---

**最后更新**: 2026-03-04  
**下次审查**: 2026-03-11
