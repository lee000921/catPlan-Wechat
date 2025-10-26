# CatPlan - 小猫咪计划

<div align="center">
  <h3>一个帮助你养成好习惯、完成学习目标的微信小程序</h3>
  <p>通过每日任务、签到打卡、抽奖游戏等趣味化方式，积累碎片兑换心仪奖品</p>
</div>

---

## 📖 项目简介

**CatPlan（小猫咪计划）** 是一款基于微信云开发的习惯养成与任务管理小程序。通过游戏化的机制，帮助用户培养健康生活习惯、坚持学习计划，并通过完成任务获得虚拟碎片，最终兑换实物奖品。

### 🎯 核心功能

- **📅 每日签到**：签到获得碎片奖励，查看签到日历和连续签到天数
- **🎰 幸运抽奖**：签到后可参与每日抽奖，获得随机碎片奖励
- **✅任务系统**：完成每日任务和成长任务，积累更多碎片
- **🎁 商品兑换**：使用碎片兑换美妆、数码等实物奖品
- **👤 个人中心**：查看碎片余额、兑换记录等个人信息

---

## 🚀 技术栈

### 前端
- **框架**：微信小程序原生开发
- **UI组件库**：TDesign Miniprogram
- **工具库**：dayjs（时间处理）

### 后端（支持两种部署方式）

#### 方案一：腾讯云 CloudBase（默认）
- **云数据库**：存储用户、任务、商品等数据
- **云函数**：实现业务逻辑（签到、抽奖、任务完成等）
- **云存储**：存储商品图片等静态资源

#### 方案二：阿里云（推荐）⭐
- **服务器**：阿里云 ECS + Node.js Express
- **数据库**：MongoDB（阿里云MongoDB或自建）
- **存储**：阿里云 OSS
- **部署**：Nginx + PM2
- **优势**：成本可控、部署灵活、便于维护

> 💡 **迁移指南**：想要部署到阿里云？请查看 [阿里云部署完整指南](./ALIYUN_MIGRATION.md)

---

## 📁 项目结构

```
catPlan/
├── pages/                    # 页面目录
│   ├── checkin/             # 签到页面
│   ├── lottery/             # 抽奖页面
│   ├── tasks/               # 任务页面
│   ├── exchange/            # 商品兑换页面
│   └── user/                # 用户中心页面
├── cloudfunctions/          # 云函数目录
│   ├── checkin/             # 签到云函数
│   ├── lottery/             # 抽奖云函数
│   ├── getTasks/            # 获取任务列表
│   ├── getGoods/            # 获取商品列表
│   ├── exchangeGoods/       # 兑换商品
│   ├── getUserInfo/         # 获取用户信息
│   ├── updateUserInfo/      # 更新用户信息
│   └── login/               # 用户登录
├── components/              # 自定义组件
├── data/                    # 初始数据
│   ├── tasks.json          # 任务数据模板
│   └── goods.json          # 商品数据模板
├── utils/                   # 工具函数
├── app.js                   # 小程序入口文件
└── project.config.json      # 项目配置文件
```

---

## 🎮 功能详解

### 1. 签到系统
- 每日签到获得 **5碎片** 基础奖励
- 签到日历展示本月签到记录
- 累计签到天数统计
- 签到后自动跳转抽奖页面

### 2. 抽奖系统
- 每日可参与一次幸运转盘抽奖
- 6个奖励档位：1/2/5/10/20/50 碎片
- 转盘动画效果，提升用户体验

### 3. 任务系统

#### 每日任务（可重复完成）
- **健康类**：早睡、早起、运动、控糖等（1-30碎片）
- **学习类**：学习时长打卡（1小时-9小时，1-10碎片）
- **英语类**：背单词、每日一句、阅读、听力（10碎片）

#### 成长任务（一次性完成）
- **学习进度**：累计完成网课、习题章节（5-50碎片）
- **单词积累**：累计背单词数量（10碎片/档）
- **科目复习**：完成各科目复习（250-5000碎片）
- **终极目标**：完成考研、通过六级等（500-10000碎片）

### 4. 兑换系统
- 涵盖美妆、护肤、数码等多类商品
- 价格范围：70-6700碎片
- 商品详情展示、库存管理
- 兑换记录查询
- 收货地址填写

---

## 🛠️ 快速开始

> **选择部署方式**：
> - **腾讯云版本**：继续阅读下方步骤
> - **阿里云版本**：查看 [阿里云部署指南](./ALIYUN_MIGRATION.md) 和 [前端改造指南](./FRONTEND_MIGRATION.md)

### 环境要求（腾讯云版本）
- Node.js >= 12.0
- 微信开发者工具（支持云开发）
- 微信小程序基础库 >= 2.2.3

### 快速开始（阿里云版本）
如果选择阿里云部署，请直接查看：
- 📖 [阿里云完整部署指南](./ALIYUN_MIGRATION.md)
- 🔧 [后端快速部署](./backend-aliyun/README.md)
- 📱 [前端改造步骤](./FRONTEND_MIGRATION.md)

### 安装步骤（腾讯云版本）

1. **克隆项目**
```bash
git clone https://github.com/lee000921/catPlan.git
cd catPlan
```

2. **安装依赖**
```bash
npm install
```

如果安装失败，尝试使用管理员权限：
```bash
sudo npm install
```

3. **配置云开发环境**
   - 在微信开发者工具中打开项目
   - 进入「云开发控制台」
   - 创建云环境并记录环境 ID
   - 修改 `app.js` 中的云环境 ID：
   ```javascript
   wx.cloud.init({
     env: '你的云环境ID', // 替换为你的云环境ID
     traceUser: true,
   });
   ```

4. **初始化数据库**
   - 在云开发控制台创建以下集合（Collection）：
     - `users` - 用户信息
     - `tasks` - 任务列表
     - `goods` - 商品列表
     - `exchangeRecords` - 兑换记录
   - 导入 `data/` 目录下的初始数据

5. **部署云函数**
   - 右键点击 `cloudfunctions` 目录下的各个云函数
   - 选择「上传并部署：云端安装依赖」

6. **构建 npm**
   - 点击开发者工具菜单栏：工具 → 构建 npm

7. **预览运行**
   - 点击「编译」或「预览」即可体验小程序

---

## 🗄️ 数据库设计

### users 集合
```javascript
{
  _id: "唯一ID",
  openId: "微信openid",
  nickName: "用户昵称",
  avatarUrl: "头像URL",
  points: 0,              // 碎片余额
  checkinDays: 0,         // 累计签到天数
  lastCheckinDate: null,  // 最后签到时间
  checkinHistory: [],     // 签到历史
  tasks: []               // 已完成任务记录
}
```

### tasks 集合
```javascript
{
  _id: "任务ID",
  title: "任务标题",
  desc: "任务描述",
  points: 10,             // 奖励碎片
  category: "daily",      // 类型：daily/growth
  maxProgress: 1          // 最大进度
}
```

### goods 集合
```javascript
{
  _id: "商品ID",
  title: "商品名称",
  image: "图片URL",
  points: 200,            // 所需碎片
  originPrice: 204,       // 原价
  stock: 100,             // 库存
  type: "实物奖品",
  deliveryInfo: "配送信息"
}
```

---

## 📋 云函数说明

| 云函数 | 功能 | 主要逻辑 |
|--------|------|----------|
| `login` | 用户登录 | 获取openid，创建/更新用户信息 |
| `getUserInfo` | 获取用户信息 | 查询用户数据、任务进度等 |
| `updateUserInfo` | 更新用户信息 | 更新碎片、任务进度等 |
| `checkin` | 每日签到 | 验证签到状态，增加碎片和签到天数 |
| `lottery` | 幸运抽奖 | 随机生成奖励，更新用户碎片 |
| `getTasks` | 获取任务列表 | 返回所有可用任务 |
| `getGoods` | 获取商品列表 | 返回所有可兑换商品 |
| `exchangeGoods` | 兑换商品 | 扣除碎片，减少库存，记录兑换 |
| `getExchangeRecords` | 获取兑换记录 | 查询用户兑换历史 |

---

## 🎨 界面预览

主要页面包括：
- 签到页面：日历展示 + 签到按钮
- 抽奖页面：转盘动画 + 中奖提示
- 任务页面：任务列表 + 进度展示
- 兑换页面：商品卡片 + 兑换按钮
- 个人中心：用户信息 + 碎片余额

---

## 📝 开发规范

本项目使用以下工具保证代码质量：

- **ESLint**：代码风格检查
- **Prettier**：代码格式化
- **Husky**：Git hooks 管理
- **Commitlint**：提交信息规范
- **Conventional Changelog**：自动生成更新日志

### 提交规范

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具配置
```

---

## 🔧 配置说明

### 云环境配置
在 `app.js` 中配置云环境 ID：
```javascript
wx.cloud.init({
  env: 'cloudbase-2gtgglf5dbf036d9', // 替换为你的云环境ID
  traceUser: true
});
```

### 小程序信息
在 `project.config.json` 中配置：
- `appid`: 小程序 AppID
- `projectname`: 项目名称
- `cloudfunctionRoot`: 云函数根目录

---

## 📌 注意事项

1. 使用前请确保已开通微信云开发服务
2. 首次运行需要初始化数据库并导入初始数据
3. 商品图片需上传到云存储并更新图片链接
4. 建议在真机上测试完整功能
5. 涉及支付功能需申请微信支付权限

---

## 📚 相关文档

- 📖 [阿里云部署完整指南](./ALIYUN_MIGRATION.md) - 详细的阿里云迁移步骤
- 🔧 [后端API文档](./backend-aliyun/README.md) - Express后端接口说明
- 📱 [前端改造指南](./FRONTEND_MIGRATION.md) - 小程序前端改造步骤
- 💰 [成本对比分析](./ALIYUN_MIGRATION.md#成本估算) - 腾讯云 vs 阿里云成本对比

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源协议

本项目基于 [ISC License](LICENSE) 开源协议。

---

## 👨‍💻 作者

**lee000921**

---

## 🙏 致谢

- [TDesign Miniprogram](https://tdesign.tencent.com/miniprogram/overview) - 提供优质UI组件
- [腾讯云开发](https://cloud.tencent.com/product/tcb) - 提供云服务支持
- [dayjs](https://day.js.org/) - 时间处理库

---

<div align="center">
  <p>如果这个项目对你有帮助，欢迎 Star ⭐️</p>
  <p>Happy Coding! 🎉</p>
</div>
