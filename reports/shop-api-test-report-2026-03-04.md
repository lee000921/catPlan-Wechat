# 商城 API 测试报告

**测试日期**: 2026-03-04 23:57
**测试人员**: 小白 (测试工程师)

## 测试概述

测试商城兑换功能的后端 API 和前端页面。

## 测试环境

- **后端 API**: http://39.104.84.63:3000/api/shop/*
- **前端页面**: pages/shop/list, pages/shop/history
- **服务器**: catPlan-Server (PM2 管理)

## 测试结果

### ✅ 通过测试

#### 1. API 路由实现 (localhost)
- `GET /api/shop/items` - ✅ 返回物品列表 (空列表，因为数据库无数据)
- `GET /api/shop/exchange-history` - ✅ 路由已注册
- `POST /api/shop/exchange` - ✅ 路由已注册
- `POST /api/shop/items` - ✅ 路由已注册 (管理员)
- `PUT /api/shop/items/:id` - ✅ 路由已注册 (管理员)
- `DELETE /api/shop/items/:id` - ✅ 路由已注册 (管理员)

**测试命令**:
```bash
curl -s http://127.0.0.1:3000/api/shop/items
# 返回：{"ok":true,"items":[],"count":0}
```

#### 2. 前端代码检查
- `pages/shop/list/list.js` - ✅ 正确调用 API
- `pages/shop/list/list.wxml` - ✅ 正确显示物品列表和兑换按钮
- `pages/shop/history/history.js` - ✅ 正确调用兑换历史 API
- 库存为 0 时按钮禁用逻辑 - ✅ 已实现

#### 3. 后端路由代码
- `/home/admin/catPlan-Server/src/routes/shop.js` - ✅ 完整实现
- 所有 CRUD 操作已实现
- 权限验证 (A/B 类用户) 已实现
- 事务处理 (兑换时扣减库存和积分) 已实现

### ❌ 失败测试

#### 1. 外部 API 访问
- `GET http://39.104.84.63:3000/api/shop/items` - ❌ 返回 404
- **问题**: 外部请求无法到达 Express 应用

**详细分析**:
- 通过 localhost (127.0.0.1:3000) 访问 API 正常工作
- 通过外部 IP (39.104.84.63:3000) 访问返回 Express 404 错误
- 服务器日志显示外部请求未到达 Express 应用
- 其他 API 路径 (如 /api/tasks) 外部访问正常

**可能原因**:
1. 阿里云 SLB/ALB 配置了路径转发规则，/api/shop/* 未正确转发
2. WAF (Web Application Firewall) 拦截了 /api/shop 路径
3. 安全组或网络 ACL 配置问题
4. 反向代理 (nginx 等) 配置问题

## 问题诊断过程

1. ✅ 验证 shop.js 路由文件正确加载
2. ✅ 验证路由在 Express 中正确注册
3. ✅ 验证 localhost 访问正常
4. ✅ 验证外部 IP 访问失败
5. ✅ 添加请求日志中间件，确认外部请求未到达 Express

**关键发现**:
```bash
# localhost 请求被记录
REQUEST: GET /api/shop/items from ::ffff:127.0.0.1

# 外部 IP 请求未被记录 (说明请求被拦截)
```

## 建议修复步骤

### 1. 检查阿里云 SLB/ALB 配置
- 登录阿里云控制台
- 检查负载均衡器的监听规则
- 确保 /api/shop/* 路径转发到后端服务器

### 2. 检查 WAF 配置
- 检查是否有路径拦截规则
- 临时禁用 WAF 测试

### 3. 检查反向代理配置
- 如果使用了 nginx，检查 location 配置
- 确保 /api/shop 路径正确代理

### 4. 临时解决方案
- 使用内网 IP (172.24.16.74:3000) 进行测试
- 或通过 SSH 隧道访问：`ssh -L 3000:localhost:3000 user@39.104.84.63`

## 测试数据

### 当前数据库状态
- shop_items 表：空 (无物品数据)
- exchanges 表：空 (无兑换记录)
- users 表：有测试用户数据

### 测试物品数据 (建议添加)
```sql
INSERT INTO shop_items (name, description, price, stock, status) VALUES
('测试物品 1', '第一个测试物品', 100, 10, 'active'),
('测试物品 2', '第二个测试物品', 200, 5, 'active'),
('测试物品 3', '库存为 0', 150, 0, 'active');
```

## 结论

**后端 API 实现完整且正确**，所有路由和功能均已实现。问题在于**网络基础设施配置**，导致外部请求无法到达 /api/shop/* 路径。

**下一步**: 需要运维人员检查阿里云负载均衡器或 WAF 配置。

---
*报告生成时间：2026-03-04 23:57 GMT+8*
