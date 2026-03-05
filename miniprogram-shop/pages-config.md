# 页面路径配置

## app.json 中的 pages 配置

```json
{
  "pages": [
    "pages/shop/list/list",
    "pages/shop/detail/detail",
    "pages/shop/exchange/exchange",
    "pages/shop/history/history"
  ]
}
```

## 页面路径说明

| 页面 | 路径 | 说明 | 参数 |
|------|------|------|------|
| 物品列表 | pages/shop/list/list | 商城首页，显示可兑换物品列表 | 无 |
| 物品详情 | pages/shop/detail/detail | 查看物品详细信息 | id: 物品 ID |
| 兑换确认 | pages/shop/exchange/exchange | 确认兑换并扣除积分 | id: 物品 ID |
| 兑换历史 | pages/shop/history/history | 查看个人兑换记录 | 无 |

## 页面跳转方式

### 从列表页跳转到详情页
```javascript
wx.navigateTo({
  url: '/pages/shop/detail/detail?id=' + productId
})
```

### 从详情页跳转到兑换页
```javascript
wx.navigateTo({
  url: '/pages/shop/exchange/exchange?id=' + productId
})
```

### 从兑换成功页跳转到历史页
```javascript
wx.redirectTo({
  url: '/pages/shop/history/history'
})
```

### 从历史页返回列表页
```javascript
wx.navigateBack()
```

## 注意事项

1. `pages` 数组的第一项是小程序的默认首页
2. 使用 `wx.navigateTo` 可以返回上一页
3. 使用 `wx.redirectTo` 不能返回，用于替换当前页面
4. 所有页面路径不需要 `.js/.wxml/.wxss` 扩展名
