// config.example.js - 配置文件示例
// 复制此文件为 config.js 并修改为实际配置

module.exports = {
  // 后端 API 基础地址
  baseUrl: 'https://your-api-domain.com/api',
  
  // 小程序 AppID
  appid: 'wxxxxxxxxxxx',
  
  // 客服电话
  servicePhone: '1234567890',
  
  // 默认商品图片路径
  defaultProductImage: '/images/default-product.png',
  
  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10
  },
  
  // 请求超时时间（毫秒）
  timeout: 10000
}
