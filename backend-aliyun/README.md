# CatPlan 后端服务 - 阿里云版本

基于 Express + MongoDB 的后端 API 服务。

## 功能特性

- ✅ 用户登录认证（微信小程序登录）
- ✅ JWT Token 鉴权
- ✅ 每日签到
- ✅ 幸运抽奖
- ✅ 任务系统
- ✅ 商品兑换
- ✅ 兑换记录管理
- ✅ 日志记录
- ✅ 错误处理
- ✅ API限流

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# MongoDB 连接地址
MONGODB_URI=mongodb://localhost:27017/catplan

# JWT 密钥（请更换）
JWT_SECRET=your-super-secret-jwt-key

# 微信小程序配置
WECHAT_APPID=你的小程序AppID
WECHAT_APPSECRET=你的小程序AppSecret

# 阿里云 OSS 配置（可选）
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ACCESS_KEY_ID=你的AccessKeyId
ALIYUN_OSS_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIYUN_OSS_BUCKET=catplan
```

### 3. 导入初始数据

```bash
# 导入任务数据
mongoimport --uri="mongodb://localhost:27017/catplan" --collection=tasks --file=../data/tasks.json --jsonArray

# 导入商品数据
mongoimport --uri="mongodb://localhost:27017/catplan" --collection=goods --file=../data/goods.json --jsonArray
```

### 4. 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

使用 PM2：
```bash
npm run pm2:start
```

## API 文档

### 基础信息

- **Base URL**: `https://api.yourdomain.com/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

### 响应结构

成功：
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息",
  "code": 400
}
```

### 接口列表

#### 1. 用户登录

```
POST /api/auth/login
```

请求参数：
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "country": "中国",
    "province": "省份",
    "city": "城市"
  }
}
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "JWT Token",
    "userInfo": { ... },
    "isNewUser": false
  }
}
```

#### 2. 获取用户信息

```
GET /api/user/info
Headers: Authorization: Bearer {token}
```

#### 3. 每日签到

```
POST /api/checkin
Headers: Authorization: Bearer {token}
```

#### 4. 幸运抽奖

```
POST /api/lottery
Headers: Authorization: Bearer {token}
```

#### 5. 获取任务列表

```
GET /api/tasks
Headers: Authorization: Bearer {token}
```

#### 6. 获取商品列表

```
GET /api/goods
Headers: Authorization: Bearer {token}
```

#### 7. 兑换商品

```
POST /api/exchange
Headers: Authorization: Bearer {token}
```

请求参数：
```json
{
  "goodId": "商品ID",
  "address": {
    "name": "收货人",
    "phone": "手机号",
    "province": "省份",
    "city": "城市",
    "district": "区县",
    "detail": "详细地址"
  }
}
```

#### 8. 获取兑换记录

```
GET /api/exchange/records?page=1&limit=10
Headers: Authorization: Bearer {token}
```

## 部署指南

详见项目根目录的 `ALIYUN_MIGRATION.md`

## 目录结构

```
backend-aliyun/
├── models/          # 数据模型
├── routes/          # 路由
├── middleware/      # 中间件
├── utils/           # 工具函数
├── logs/            # 日志文件
├── app.js           # 应用入口
├── ecosystem.config.js  # PM2配置
└── package.json
```

## 数据库集合

- `users` - 用户信息
- `tasks` - 任务列表
- `goods` - 商品列表  
- `exchangerecords` - 兑换记录

## 注意事项

1. 生产环境请务必更换 `JWT_SECRET`
2. MongoDB 需要设置访问权限
3. 服务器需要开放 3000 端口（或你设置的端口）
4. 使用 HTTPS 协议
5. 定期备份数据库

## License

ISC
