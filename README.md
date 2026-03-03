# catPlan 微信小程序

## 📋 项目介绍

`catPlan` 是一个微信小程序项目，采用 TypeScript 开发，提供现代化的用户体验。

## 🏗️ 项目结构

```
catPlan-Wechat/
├── miniprogram/              # 小程序源代码
│   ├── app.json             # 小程序配置文件
│   ├── app.ts               # 小程序入口文件
│   ├── app.wxss             # 小程序全局样式
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   └── logs/            # 日志页面
│   ├── services/            # API 服务层
│   └── utils/               # 工具函数
├── typings/                 # TypeScript 类型定义
├── package.json             # 项目依赖配置
├── project.config.json      # 微信开发者工具配置
├── tsconfig.json            # TypeScript 配置
├── DEPLOY.md                # 部署指南
└── DEVELOPMENT.md           # 开发指南
```

## 🛠️ 技术栈

- **语言**: TypeScript
- **框架**: 微信小程序
- **编译工具**: 微信开发者工具
- **组件框架**: glass-easel
- **目标环境**: ES2020

## 🚀 快速开始

### 环境要求
- 微信开发者工具 (最新版本)
- Node.js 14.x 或更高版本

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd catPlan-Wechat

# 安装依赖
npm install

# 打开微信开发者工具
# 选择项目目录，工具会自动编译 TypeScript
```

### 配置说明

#### project.config.json
- **AppID**: `wx557d4f3490a318fe` (请替换为你的小程序 AppID)
- **小程序根目录**: `miniprogram/`
- TypeScript 编译支持已启用

#### tsconfig.json
- 严格模式已启用
- 目标：ES2020
- 模块：CommonJS

## 📝 主要功能

- 微信授权登录
- 本地数据存储
- HTTP 请求统一封装
- API 服务层封装

## 📦 部署

详见 [DEPLOY.md](./DEPLOY.md)

## 🔧 开发

详见 [DEVELOPMENT.md](./DEVELOPMENT.md)

## 📚 相关文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 📄 许可证

暂未指定

## 👤 作者

Repository Owner: lee000921

---

**更新日期**: 2026-03-04
