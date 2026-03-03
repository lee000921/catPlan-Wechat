# 开发指南

## 🛠️ 开发环境配置

### 必需工具

1. **微信开发者工具** (最新版本)
   - 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2. **Node.js** (14.x 或更高版本)
   - 下载地址：https://nodejs.org/

3. **Git**
   - 用于版本控制

### 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd catPlan-Wechat

# 安装依赖
npm install
```

## 📁 项目结构

```
catPlan-Wechat/
├── miniprogram/              # 小程序源代码目录
│   ├── app.json             # 全局配置文件
│   ├── app.ts               # 小程序入口
│   ├── app.wxss             # 全局样式
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   └── logs/            # 日志页
│   ├── services/            # API 服务层
│   └── utils/               # 工具函数
├── typings/                 # TypeScript 类型定义
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── project.config.json      # 微信开发者工具配置
```

## 🔧 开发流程

### 1. 创建新页面

```bash
# 在 pages 目录下创建新页面文件夹
mkdir miniprogram/pages/newpage

# 创建页面文件
touch miniprogram/pages/newpage/newpage.{ts,wxml,wxss,json}
```

在 `app.json` 中注册页面：

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs",
    "pages/newpage/newpage"
  ]
}
```

### 2. 编写 TypeScript 代码

示例页面逻辑 (`pages/index/index.ts`)：

```typescript
Page({
  data: {
    message: 'Hello World'
  },

  onLoad() {
    console.log('页面加载')
  },

  onReady() {
    console.log('页面渲染完成')
  }
})
```

### 3. 调用 API 服务

使用封装好的服务层：

```typescript
import { getUserInfo } from '../../services/user'

Page({
  async onLoad() {
    const userInfo = await getUserInfo()
    this.setData({ userInfo })
  }
})
```

### 4. 样式开发

使用 WXSS 编写样式：

```wxss
/* pages/index/index.wxss */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 20px;
  color: #333;
}
```

## 🧪 调试

### 微信开发者工具调试

1. 打开开发者工具
2. 点击 "编译" 按钮
3. 在控制台查看日志
4. 使用 Wxml 面板调试结构
5. 使用 Network 面板查看网络请求

### 真机调试

1. 点击开发者工具右上角 "预览"
2. 使用微信扫描二维码
3. 在真机上测试功能

### 远程调试

1. 点击 "预览" → "真机调试"
2. 在开发者工具中查看真机日志

## 📦 依赖管理

### 安装依赖

```bash
npm install <package-name> --save
```

### 更新依赖

```bash
npm update
```

### 使用 npm 包

在 `project.config.json` 中配置：

```json
{
  "setting": {
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./miniprogram/"
      }
    ]
  }
}
```

然后执行：工具 → 构建 npm

## 🎯 最佳实践

### 代码规范

1. **TypeScript 严格模式**: 项目已启用严格类型检查
2. **命名规范**: 
   - 文件/文件夹使用小写 + 连字符
   - 变量/函数使用驼峰命名
   - 常量使用大写 + 下划线
3. **注释**: 复杂逻辑必须添加注释

### 性能优化

1. **懒加载**: 按需加载页面和资源
2. **图片优化**: 压缩图片，使用 WebP 格式
3. **数据缓存**: 合理使用本地存储
4. **减少 setData**: 避免频繁调用

### 错误处理

```typescript
try {
  const result = await api.call()
} catch (error) {
  console.error('API 调用失败:', error)
  wx.showToast({
    title: '请求失败',
    icon: 'none'
  })
}
```

## 📝 Git 工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送分支
git push origin feature/new-feature

# 合并到主分支
git checkout main
git merge feature/new-feature
```

## 🔍 常见问题

### Q: TypeScript 编译错误？
A: 检查 `tsconfig.json` 配置，确保类型定义正确

### Q: 页面不显示？
A: 检查 `app.json` 是否注册了页面路径

### Q: API 请求失败？
A: 检查服务器域名配置和网络权限

## 📚 参考资料

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [glass-easel 组件框架](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/glass-easel/migration.html)
