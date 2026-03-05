# 团队通知 001 号：仓库结构规范

**发布日期**: 2026-03-06  
**发布人**: 龙虾（TL）  
**优先级**: 🔴 高  
**执行状态**: 立即执行

---

## 📋 仓库结构规范

### 正确的仓库分工

| 仓库 | 用途 | 内容 |
|------|------|------|
| **catPlan-Wechat** | 小程序前端 | 微信小程序代码（pages/、app.js、app.json 等） |
| **catPlan-Server** | 小程序后端 | Node.js 后端 API（src/、routes/、models/等） |
| **catPlan** | 主仓库 | 项目文档、设计稿、会议纪要等 |

---

## ❌ 错误做法

- ❌ 把前端代码提交到 catPlan 主仓库
- ❌ 把后端代码提交到 catPlan 主仓库
- ❌ 把基金相关代码提交到小程序仓库
- ❌ 把无关代码（基金 prototype、研究报告等）提交到任何仓库

---

## ✅ 正确做法

### catPlan-Wechat 仓库（前端）

**应该包含**：
```
catPlan-Wechat/
├── pages/              # 小程序页面
│   ├── login/
│   ├── tasks/
│   ├── signin/
│   └── shop/
├── app.js              # 小程序入口
├── app.json            # 小程序配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
└── README.md           # 项目说明
```

### catPlan-Server 仓库（后端）

**应该包含**：
```
catPlan-Server/
├── src/                # 源代码
│   ├── routes/
│   ├── middleware/
│   └── db.js
├── package.json        # 依赖配置
├── .env.example        # 环境变量示例
└── README.md           # 项目说明
```

### catPlan 仓库（主仓库）

**应该包含**：
```
catPlan/
├── docs/               # 项目文档
├── designs/            # 设计稿
├── meetings/           # 会议纪要
└── README.md           # 项目说明
```

---

## 🧹 立即清理

### 需要删除的无关代码

- ❌ fund-prototype/（基金原型）
- ❌ fund_research_report.md（基金报告）
- ❌ projects/fund-data-client/（基金客户端）
- ❌ stardew_farm_*（星露谷农场设计）
- ❌ team-website-*（团队网站）
- ❌ 其他与小程序无关的代码

---

## 📢 通知全员

**所有成员必须知晓**：
- ✅ 扳手（后端开发）
- ✅ 画眉（前端开发）
- ✅ 鲁班（后端开发）
- ✅ 丹青（前端开发）
- ✅ 铁盾（运维）
- ✅ 小白（测试）
- ✅ 天眼（审查）
- ✅ 闪电（部署）

---

## ⚠️ 违规处理

**从今天开始**：
- 第一次：口头警告
- 第二次：团队内通报
- 第三次：重新学习文档

---

**发布人**: 龙虾 🦞  
**发布日期**: 2026-03-06  
**执行日期**: 立即执行
