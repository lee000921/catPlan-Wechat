# 部署指南

## 📦 部署前准备

### 1. 配置小程序 AppID

在 `project.config.json` 中修改 `appid` 为你的小程序 AppID：

```json
{
  "appid": "你的小程序 AppID"
}
```

### 2. 配置服务器域名

在微信小程序开发者平台配置后端 API 域名：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 → 开发设置 → 服务器域名
3. 配置 `request` 合法域名

## 🚀 部署方式

### 方式一：微信开发者工具手动上传

1. 打开微信开发者工具
2. 导入项目（选择 `catPlan-Wechat` 目录）
3. 点击右上角 "上传" 按钮
4. 填写版本号和项目备注
5. 提交审核

### 方式二：使用 CI 工具自动部署

项目已配置 `miniprogram-ci`，支持命令行上传：

```bash
# 安装依赖
npm install

# 上传预览版
npm run deploy:preview

# 上传正式版
npm run deploy
```

### 部署脚本配置

编辑 `deploy.js` 配置上传参数：

```javascript
const projectPath = '/path/to/catPlan-Wechat';
const appid = '你的小程序 AppID';
```

## 📋 版本管理

### 版本号规范

遵循语义化版本规范：`主版本号。次版本号。修订号`

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 上传示例

```bash
# 上传版本 1.0.0
node deploy.js --version 1.0.0 --desc "首次发布"
```

## ✅ 部署检查清单

- [ ] 更新 `project.config.json` 中的 AppID
- [ ] 配置服务器域名
- [ ] 测试小程序功能
- [ ] 清理调试代码
- [ ] 更新版本号
- [ ] 编写版本说明
- [ ] 上传代码
- [ ] 提交审核

## 🔧 故障排查

### 上传失败

1. 检查网络连接
2. 确认 AppID 正确
3. 检查开发者权限

### 编译错误

1. 检查 TypeScript 语法
2. 确认依赖已安装
3. 查看开发者工具控制台

## 📞 支持

遇到问题请查阅：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [miniprogram-ci 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)
