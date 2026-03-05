# 积分商城小程序

微信小程序原生开发的积分商城兑换功能。

## 项目结构

```
miniprogram-shop/
├── app.js                 # 小程序入口
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json           # 站点地图配置
├── README.md              # 项目说明
└── pages/
    └── shop/
        ├── list/          # 物品列表页
        │   ├── list.js
        │   ├── list.wxml
        │   └── list.wxss
        ├── detail/        # 物品详情页
        │   ├── detail.js
        │   ├── detail.wxml
        │   └── detail.wxss
        ├── exchange/      # 兑换确认页
        │   ├── exchange.js
        │   ├── exchange.wxml
        │   └── exchange.wxss
        └── history/       # 兑换历史页
            ├── history.js
            ├── history.wxml
            └── history.wxss
```

## 页面说明

### 1. 物品列表页 (pages/shop/list)
- 显示可兑换物品列表
- 展示物品图片、名称、积分价格、库存
- 支持下拉刷新和上拉加载更多
- 显示用户信息和积分余额
- 仅 A 类用户可看到兑换按钮

### 2. 物品详情页 (pages/shop/detail)
- 展示物品详细信息
- 显示库存、已兑换数量、每人限兑数量
- 展示兑换说明
- 计算并显示兑换后剩余积分
- 提供兑换入口

### 3. 兑换确认页 (pages/shop/exchange)
- 选择兑换数量
- 显示积分明细（单价、数量、总计）
- 验证用户权限（仅 A 类用户）
- 验证积分余额和库存
- 提交兑换请求

### 4. 兑换历史页 (pages/shop/history)
- 查看个人兑换记录
- 显示兑换状态（成功/处理中/失败）
- 显示订单号、兑换时间
- 提供联系客服入口

## 后端 API 配置

在 `app.js` 中修改 `baseUrl` 为实际后端地址：

```javascript
globalData: {
  baseUrl: 'https://your-api-domain.com/api'
}
```

## API 接口

### 获取用户信息
```
GET /api/user/info
返回：{ code: 0, data: { userType: 'A', nickname, avatarUrl } }
```

### 获取积分余额
```
GET /api/user/points
返回：{ code: 0, data: { points: 1000 } }
```

### 获取物品列表
```
GET /api/shop/products?page=1&pageSize=10
返回：{ code: 0, data: { list: [], total, page, pageSize } }
```

### 获取物品详情
```
GET /api/shop/products/:id
返回：{ code: 0, data: { id, name, description, imageUrl, points, stock, limitPerUser, exchangeCount } }
```

### 提交兑换
```
POST /api/shop/exchange
请求体：{ productId, count, points }
返回：{ code: 0, data: { orderId } }
```

### 获取兑换历史
```
GET /api/shop/exchange/history?page=1&pageSize=10
返回：{ code: 0, data: { list: [{ id, productId, productName, productImage, points, count, status, createTime, orderNo }], total } }
```

## 用户权限

- **A 类用户（申请者）**: 可以进行兑换操作
- **其他用户**: 只能浏览物品，无法兑换

## 开发工具

- 微信开发者工具
- 基础库版本：2.19.4
- 调试基础库：可在开发者工具中切换

## 部署步骤

1. 打开微信开发者工具
2. 导入项目（选择 miniprogram-shop 目录）
3. 在 `project.config.json` 中修改 `appid` 为你的小程序 AppID
4. 在 `app.js` 中修改 `baseUrl` 为实际后端 API 地址
5. 编译并预览

## 注意事项

1. 确保后端 API 支持跨域请求
2. 兑换接口需要用户登录态（token）
3. 客服电话需要在 `history.js` 中配置
4. 默认商品图片需要放置在 `/images/default-product.png`

## 技术栈

- 微信小程序原生开发
- WXML + WXSS + JavaScript
- 调用后端 RESTful API
