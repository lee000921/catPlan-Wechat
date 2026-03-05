# catPlan 项目上下文文档

**最后更新**：2026-03-05 11:25  
**维护者**：龙虾（TL）

---

## 📋 项目概览

**项目名称**：catPlan - 微信小程序任务管理系统  
**技术栈**：
- 前端：微信小程序 + TypeScript
- 后端：Node.js + Express + MySQL
- 部署：阿里云 ECS + 百炼 Coding Plan

**仓库结构**：
```
catPlan (主仓库)
├── frontend/ → catPlan-Wechat (前端子模块)
└── backend/ → catPlan-Server (后端子模块)
```

---

## 🎯 当前进度

### ✅ 已完成功能

| 功能模块 | 状态 | 负责人 | 完成时间 |
|----------|------|--------|----------|
| 用户登录/注册 | ✅ 100% | 画眉 | 03-04 |
| 任务创建/审批 | ✅ 100% | 扳手 | 03-04 |
| 任务完成/积分 | ✅ 100% | 扳手 | 03-04 |
| 签到系统 | ✅ 100% | 扳手 | 03-04 |
| 商城兑换 | ✅ 100% | 画眉/扳手 | 03-05 |
| 周期任务 | ✅ 100% | 鲁班 | 03-05 |
| UI 优化 | ✅ 100% | 丹青 | 03-05 |

### 📊 测试状态

| 测试类别 | 通过率 | 最后测试 |
|----------|--------|----------|
| 商城功能 | 100% | 01:30 |
| 审批权限 | 100% | 01:30 |
| UI 测试 | 100% | 01:30 |
| 性能测试 | 100% | 01:30 |

---

## 📁 关键文档位置

| 文档类型 | 文件路径 | 用途 |
|----------|----------|------|
| **项目上下文** | `/home/admin/.openclaw/workspace/PROJECT-CONTEXT.md` | 本文档 |
| **API 文档** | `/home/admin/catPlan-Server/docs/api.md` | 后端 API 说明 |
| **前端规范** | `/home/admin/catPlan-Wechat/docs/frontend-guide.md` | 前端开发规范 |
| **部署指南** | `/home/admin/catPlan-Server/docs/deployment.md` | 部署流程 |
| **测试报告** | `/home/admin/.openclaw/workspace/reports/` | 测试报告汇总 |
| **Bug 列表** | `/home/admin/.openclaw/workspace/bugs.md` | Bug 跟踪 |

---

## 🏗️ 技术架构

### 前端架构

```
catPlan-Wechat/
├── miniprogram/
│   ├── pages/
│   │   ├── login/        # 登录页
│   │   ├── tasks/        # 任务列表
│   │   ├── task-submit/  # 任务提交
│   │   ├── task-detail/  # 任务详情
│   │   ├── signin/       # 签到页
│   │   └── shop/         # 商城（4 个页面）
│   ├── services/         # API 服务层
│   └── utils/            # 工具函数
```

### 后端架构

```
catPlan-Server/
├── src/
│   ├── routes/
│   │   ├── auth.js         # 认证路由
│   │   ├── user.js         # 用户路由
│   │   ├── tasks.js        # 任务路由
│   │   ├── signin.js       # 签到路由
│   │   ├── shop.js         # 商城路由
│   │   └── periodicTasks.js # 周期任务路由
│   ├── middleware/
│   │   ├── auth.js         # 认证中间件
│   │   └── userTypeValidator.js # 用户类型验证
│   └── db.js               # 数据库连接
```

---

## 🔧 开发环境配置

### 后端配置

**位置**：`/home/admin/catPlan-Server/.env`

```bash
PORT=3000
DB_HOST=rm-hp38wlo973b3mm8qu.mysql.huhehaote.rds.aliyuncs.com
DB_USER=openclaw
DB_PASSWORD=13947105982lyD!
DB_DATABASE=catplan
```

### 前端配置

**位置**：`/home/admin/catPlan-Wechat/miniprogram/utils/config.js`

```javascript
module.exports = {
  baseUrl: 'http://39.104.84.63:3000/api',
  appid: 'wx557d4f3490a318fe'
}
```

---

## 📝 Subagent 任务执行指南

### 任务描述模板

```markdown
【任务类型】任务标题

**背景**：
- 项目当前状态
- 相关功能模块
- 涉及的文件

**需求**：
- 具体要做什么
- 实现细节
- 验收标准

**参考文件**：
- /path/to/file1.js
- /path/to/file2.md

**输出要求**：
- 代码风格
- 注释要求
- 测试要求
```

### 示例：商城 API 开发

```markdown
【后端开发】商城兑换 API 实现

**背景**：
- catPlan 小程序需要积分兑换功能
- 前端页面已完成（pages/shop/exchange）
- 数据库表已创建（shop_items, exchanges）

**需求**：
- 实现 POST /api/shop/exchange 接口
- 需要事务处理（扣库存、扣积分、记录流水）
- 验证用户积分是否充足
- 验证库存是否充足

**参考文件**：
- /home/admin/catPlan-Server/src/routes/shop.js
- /home/admin/catPlan-Server/src/db.js

**输出要求**：
- 使用 async/await 语法
- 添加详细注释
- 包含错误处理
- 提交时署名
```

---

## 📋 代码提交规范

### Git Commit 格式

```
<type>(scope): subject

body

footer
```

### 类型说明

| Type | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(shop): 添加兑换功能 |
| fix | Bug 修复 | fix(auth): 修复登录验证 Bug |
| docs | 文档更新 | docs: 更新 API 文档 |
| style | 代码格式 | style: 格式化代码 |
| refactor | 重构 | refactor: 重构用户模块 |
| test | 测试 | test: 添加单元测试 |
| chore | 构建/工具 | chore: 更新依赖 |

### 署名格式

**在 commit message 末尾添加**：

```
Co-authored-by: 花名 <角色>
```

**示例**：
```bash
git commit -m "feat(shop): 添加兑换功能

- 实现 POST /api/shop/exchange 路由
- 添加库存验证逻辑
- 添加积分扣减事务处理

Co-authored-by: 扳手 🔧"
```

---

## 🚨 常见问题

### Q1: Subagent 不知道项目结构？

**解决**：提供项目结构文档
```
参考：/home/admin/.openclaw/workspace/PROJECT-CONTEXT.md
```

### Q2: Subagent 不知道 API 规范？

**解决**：提供 API 文档
```
参考：/home/admin/catPlan-Server/docs/api.md
```

### Q3: Subagent 提交的代码没有署名？

**解决**：在任务描述中明确要求
```
**输出要求**：
- 提交时添加署名：Co-authored-by: 花名 <角色>
```

---

## 📊 团队信息

| 花名 | 角色 | 模型 | 职责 |
|------|------|------|------|
| 🦞 龙虾 | TL | Qwen3.5-Plus | 项目协调 |
| 🔧 扳手 | 后端开发 | GLM-5 | API 开发 |
| 🎨 画眉 | 前端开发 | GLM-5 | 界面开发 |
| 🛡️ 铁盾 | 运维工程师 | GLM-5 | 系统运维 |
| 🏗️ 鲁班 | 后端开发 | GLM-5 | 架构设计 |
| 🔍 天眼 | 代码审查 | Qwen3.5-Plus | 代码审查 |
| 🧪 小白 | 测试工程师 | GLM-5 | 功能测试 |
| ✏️ 丹青 | 前端开发 | GLM-5 | UI 优化 |
| ⚡ 闪电 | 自动化部署 | GLM-5 | CI/CD |

---

**本文档由龙虾维护，确保 Subagent 执行任务时有完整的上下文信息！** 🚀
