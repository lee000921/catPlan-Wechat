# 团队成员署名配置

**用途**：Subagent 提交代码时使用的署名信息

---

## 👥 团队成员署名

| 花名 | 角色 | Emoji | Git 署名格式 |
|------|------|-------|-------------|
| **龙虾** | TL | 🦞 | `Co-authored-by: 龙虾 🦞` |
| **扳手** | 后端开发 | 🔧 | `Co-authored-by: 扳手 🔧` |
| **画眉** | 前端开发 | 🎨 | `Co-authored-by: 画眉 🎨` |
| **铁盾** | 运维工程师 | 🛡️ | `Co-authored-by: 铁盾 🛡️` |
| **鲁班** | 后端开发 | 🏗️ | `Co-authored-by: 鲁班 🏗️` |
| **天眼** | 代码审查 | 🔍 | `Co-authored-by: 天眼 🔍` |
| **小白** | 测试工程师 | 🧪 | `Co-authored-by: 小白 🧪` |
| **丹青** | 前端开发 | ✏️ | `Co-authored-by: 丹青 ✏️` |
| **闪电** | 自动化部署 | ⚡ | `Co-authored-by: 闪电 ⚡` |

---

## 📝 Git Commit 示例

### 后端开发

```bash
git commit -m "feat(shop): 添加兑换 API

- 实现 POST /api/shop/exchange 路由
- 添加库存验证逻辑
- 添加积分扣减事务处理

Co-authored-by: 扳手 🔧"
```

### 前端开发

```bash
git commit -m "feat(shop): 添加商品详情页

- 创建商品详情页面
- 实现兑换按钮交互
- 优化页面加载性能

Co-authored-by: 画眉 🎨"
```

### Bug 修复

```bash
git commit -m "fix(tasks): 修复审批权限验证

- 添加审批人身份验证
- 防止用户审批自己的任务
- 返回 403 错误提示

Co-authored-by: 扳手 🔧"
```

### UI 优化

```bash
git commit -m "style(shop): 优化商城 UI

- 渐变蓝色主题
- 卡片式布局
- 响应式设计

Co-authored-by: 丹青 ✏️"
```

### 测试

```bash
git commit -m "test(shop): 添加商城功能测试

- 兑换功能测试
- 库存验证测试
- 积分扣减测试

Co-authored-by: 小白 🧪"
```

### 运维部署

```bash
git commit -m "chore(deploy): 配置自动化部署

- 添加 CI/CD 配置
- 配置 Git hook
- 优化部署脚本

Co-authored-by: 闪电 ⚡"
```

---

## 🔧 Git 配置命令

### 前端仓库

```bash
cd /home/admin/catPlan-Wechat

# 配置 commit 模板
git config commit.template .gitmessage

# 配置用户信息（可选）
git config user.name "Team AI Dev"
git config user.email "aidev@catplan.com"
```

### 后端仓库

```bash
cd /home/admin/catPlan-Server

# 配置 commit 模板
git config commit.template .gitmessage

# 配置用户信息（可选）
git config user.name "Team AI Dev"
git config user.email "aidev@catplan.com"
```

---

## ✅ 提交检查清单

提交代码前请确认：

- [ ] Commit message 格式正确
- [ ] 包含详细的变更说明
- [ ] 添加了署名信息
- [ ] 代码已通过自测
- [ ] 遵循代码规范

---

## 📊 提交统计

通过署名信息，可以轻松统计每个成员的贡献：

```bash
# 查看每个成员的提交数量
git log --format='%aN' | sort | uniq -c | sort -rn

# 查看特定成员的提交
git log --author="扳手" --oneline

# 查看特定类型的提交
git log --grep="feat" --oneline
```

---

**本文档由龙虾维护，确保团队成员提交代码时有统一的署名格式！** 🚀
