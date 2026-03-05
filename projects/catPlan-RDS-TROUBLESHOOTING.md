# RDS 数据库连接问题排查

**问题**: ECS 无法连接到 RDS MySQL 实例  
**时间**: 2026-03-04  
**RDS 实例**: `rm-hp38wlo973b3mm8qu.mysql.huhehaote.rds.aliyuncs.com`  
**ECS 公网 IP**: `39.104.84.63`  
**ECS 内网 IP**: `172.24.16.74`

---

## 🔍 当前状态

### 测试结果

| 测试项 | 结果 | 说明 |
|--------|------|------|
| Ping RDS | ❌ 100% 丢包 | RDS 默认禁 ping |
| TCP 3306 端口 | ❌ 连接超时 | 白名单未放行 |
| Node.js MySQL 连接 | ❌ ETIMEDOUT | 同上 |
| 服务状态 | ✅ 运行中 | 使用 Mock 模式 |

---

## ✅ 解决方案（按优先级）

### 方案 1: 添加 ECS 内网 IP 到 RDS 白名单（推荐）

**适用场景**: ECS 和 RDS 在同一地域（华北）

**操作步骤**:

1. 登录 [阿里云 RDS 控制台](https://rds.console.aliyun.com/)
2. 选择实例 `rm-hp38wlo973b3mm8qu`
3. 点击左侧 **数据库连接** → **白名单**
4. 点击 **添加白名单分组**
5. 填写：
   - 分组名称：`ecs-allow`
   - IP 地址：`172.24.16.74/32`
6. 点击 **确定**

**等待时间**: 1-2 分钟生效

---

### 方案 2: 添加 ECS 安全组到 RDS 白名单（最佳实践）

**适用场景**: ECS 和 RDS 在同一 VPC

**操作步骤**:

1. 登录 [ECS 控制台](https://ecs.console.aliyun.com/)
2. 找到当前 ECS 实例
3. 查看 **安全组 ID**（例如：`sg-bp12345678`）
4. 登录 [RDS 控制台](https://rds.console.aliyun.com/)
5. 选择实例 → **白名单**
6. 添加白名单分组：
   - 分组名称：`ecs-security-group`
   - IP 地址：选择 **添加安全组**
   - 选择 ECS 的安全组 ID
7. 点击 **确定**

**优点**: ECS 内网 IP 变化时自动生效

---

### 方案 3: 临时测试 - 添加公网 IP 白名单

**⚠️ 仅用于测试，不推荐生产环境**

**操作步骤**:

1. RDS 控制台 → 白名单
2. 添加 IP：`39.104.84.63/32`
3. 确保 RDS 实例有**公网连接地址**

**缺点**: 
- 需要 RDS 开启公网访问
- 安全性较低

---

## 🔧 验证步骤

配置白名单后，执行以下命令验证：

### 1. 重启服务

```bash
export PATH=$PATH:$HOME/.local/bin
pm2 restart catplan-api --update-env
```

### 2. 查看日志

```bash
pm2 logs catplan-api --lines 30
```

**成功标志**:
```
✅ 看到 "Successfully connected to MySQL"
❌ 没有 "switching to mock mode" 提示
```

### 3. 测试健康检查

```bash
curl http://localhost:3000/health
# 预期：{"ok":true}
```

### 4. 测试数据库读写

```bash
# 测试签到（会写入数据库）
curl -X POST http://localhost:3000/api/signin/checkin \
  -H "Content-Type: application/json" \
  -d '{"openid":"db_test_user"}'

# 预期响应包含积分信息，而不是 Mock 数据
```

---

## 📋 检查清单

在配置前，请确认：

- [ ] RDS 实例状态：**运行中**
- [ ] RDS 实例地域：与 ECS **同一地域**（华北）
- [ ] RDS 账号密码：正确（`root` / `13947105982lyD!`）
- [ ] 数据库名称：`catplan` 已创建
- [ ] 白名单已添加：`172.24.16.74/32` 或 ECS 安全组

---

## 🚨 常见问题

### Q1: 白名单添加了还是连不上？

**可能原因**:
1. ECS 和 RDS 不在同一 VPC
2. RDS 实例没有创建数据库 `catplan`
3. 白名单未生效（等待 2 分钟）

**解决方法**:
```bash
# 1. 检查 VPC 网络
# ECS 控制台 → 实例详情 → VPC ID
# RDS 控制台 → 实例详情 → VPC ID
# 必须相同

# 2. 检查数据库是否存在
# 需要先在 RDS 控制台创建数据库 catplan

# 3. 重启 PM2 服务
pm2 restart catplan-api --update-env
```

### Q2: 如何确认 ECS 和 RDS 在同一 VPC？

**方法 1**: 阿里云控制台
- ECS 实例详情 → 网络信息 → VPC ID
- RDS 实例详情 → 网络类型 → VPC ID
- 两者必须相同

**方法 2**: 如果不在同一 VPC
- 需要配置 VPC 对等连接
- 或者迁移到同一 VPC

### Q3: 数据库 `catplan` 还没创建怎么办？

**方法 1**: RDS 控制台创建
1. RDS 控制台 → 实例 → 数据库管理
2. 点击 **创建数据库**
3. 数据库名：`catplan`
4. 字符集：`utf8mb4`
5. 权限：授予 `root` 账号

**方法 2**: 代码自动创建
- 当前代码会在连接成功后自动建表
- 但需要先能连接上数据库

---

## 📞 需要提供的信息

如果你已经配置了白名单，请告诉我：

1. **白名单配置截图**（可选）
2. **ECS 和 RDS 是否在同一 VPC**
3. **数据库 `catplan` 是否已创建**

然后我会再次验证连接！

---

## 🔗 相关文档

- [阿里云 RDS 白名单设置](https://help.aliyun.com/document_detail/51933.html)
- [ECS 和 RDS 内网互通](https://help.aliyun.com/document_detail/51934.html)
- [部署报告](./catPlan-DEPLOYMENT-REPORT.md)

---

**更新时间**: 2026-03-04 00:55
