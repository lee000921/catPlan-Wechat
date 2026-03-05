# Subagent 任务执行模板

**用途**：确保 Subagent 执行任务时有完整的上下文，避免出错

---

## 📋 标准任务描述模板

```markdown
【任务类型】任务标题

## 背景
- 项目名称：catPlan
- 当前进度：[阶段说明]
- 相关功能：[功能模块]
- 涉及文件：[文件路径]

## 需求
- 具体任务：[要做什么]
- 实现细节：[技术要求]
- 验收标准：[完成标准]

## 参考文档
- 项目上下文：/home/admin/.openclaw/workspace/PROJECT-CONTEXT.md
- API 文档：/home/admin/catPlan-Server/docs/api.md
- 相关文件：[具体文件路径]

## 代码规范
- 使用 async/await 语法
- 添加详细注释（JSDoc 格式）
- 包含错误处理
- 遵循现有代码风格

## 提交要求
- Git commit 格式：<type>(scope): subject
- 署名格式：Co-authored-by: 花名 <角色>
- 示例：
  ```bash
  git commit -m "feat(shop): 添加兑换功能
  
  - 实现 POST /api/shop/exchange 路由
  - 添加库存验证逻辑
  
  Co-authored-by: 扳手 🔧"
  ```

## 输出
- 完成的代码文件
- 测试结果
- 遇到的问题（如有）
```

---

## 📝 任务类型示例

### 后端开发任务

```markdown
【后端开发】商城兑换 API 实现

## 背景
- 项目名称：catPlan
- 当前进度：商城功能开发阶段
- 相关功能：积分兑换
- 涉及文件：
  - /home/admin/catPlan-Server/src/routes/shop.js
  - /home/admin/catPlan-Server/src/db.js

## 需求
- 实现 POST /api/shop/exchange 接口
- 需要事务处理（扣库存、扣积分、记录流水）
- 验证用户积分是否充足
- 验证库存是否充足

## 参考文档
- 项目上下文：/home/admin/.openclaw/workspace/PROJECT-CONTEXT.md
- API 文档：/home/admin/catPlan-Server/docs/api.md
- 数据库设计：/home/admin/catPlan-Server/docs/database.md

## 代码规范
- 使用 async/await 语法
- 添加详细注释（JSDoc 格式）
- 包含错误处理
- 遵循现有代码风格

## 提交要求
- Git commit 格式：feat(shop): 添加兑换 API
- 署名格式：Co-authored-by: 扳手 🔧

## 输出
- 完成的代码文件
- API 测试结果
- 遇到的问题（如有）
```

### 前端开发任务

```markdown
【前端开发】商城详情页开发

## 背景
- 项目名称：catPlan
- 当前进度：商城 UI 开发阶段
- 相关功能：商品详情展示
- 涉及文件：
  - /home/admin/catPlan-Wechat/miniprogram/pages/shop/detail/

## 需求
- 创建商品详情页面
- 显示商品图片、名称、价格、库存
- 添加兑换按钮
- 实现页面跳转逻辑

## 参考文档
- 项目上下文：/home/admin/.openclaw/workspace/PROJECT-CONTEXT.md
- UI 设计：/home/admin/.openclaw/workspace/ui-preview.html
- 前端规范：/home/admin/catPlan-Wechat/docs/frontend-guide.md

## 代码规范
- 使用微信小程序原生语法
- 添加详细注释
- 遵循现有代码风格
- 响应式设计

## 提交要求
- Git commit 格式：feat(shop): 添加商品详情页
- 署名格式：Co-authored-by: 画眉 🎨

## 输出
- 完成的页面文件（.js, .wxml, .wxss, .json）
- 页面截图
- 遇到的问题（如有）
```

### Bug 修复任务

```markdown
【Bug 修复】审批权限验证 Bug

## 背景
- 项目名称：catPlan
- Bug 编号：BUG-007
- 问题描述：用户可以审批自己创建的任务
- 涉及文件：
  - /home/admin/catPlan-Server/src/routes/tasks.js

## 需求
- 在审批接口添加身份验证
- 防止用户审批自己的任务
- 返回 403 错误提示

## 参考文档
- Bug 报告：/home/admin/.openclaw/workspace/bugs.md
- 测试报告：/home/admin/.openclaw/workspace/reports/shop-api-test-report.md

## 代码规范
- 使用 async/await 语法
- 添加详细注释
- 包含错误处理

## 提交要求
- Git commit 格式：fix(tasks): 修复审批权限验证
- 署名格式：Co-authored-by: 扳手 🔧

## 输出
- 修复后的代码
- 测试验证结果
```

---

## ✅ 任务执行检查清单

### 执行前

- [ ] 已阅读项目上下文文档
- [ ] 已理解任务需求
- [ ] 已查看参考文档
- [ ] 已了解代码规范

### 执行中

- [ ] 遵循现有代码风格
- [ ] 添加详细注释
- [ ] 包含错误处理
- [ ] 编写测试用例

### 执行后

- [ ] 代码自测通过
- [ ] Git commit 格式正确
- [ ] 添加署名信息
- [ ] 提交任务结果

---

## 🚨 常见问题处理

### Q1: 不知道项目结构？

**解决**：查看 PROJECT-CONTEXT.md
```bash
cat /home/admin/.openclaw/workspace/PROJECT-CONTEXT.md
```

### Q2: 不知道 API 规范？

**解决**：查看 API 文档
```bash
cat /home/admin/catPlan-Server/docs/api.md
```

### Q3: 不知道如何提交代码？

**解决**：遵循提交规范
```bash
git add .
git commit -m "feat(module): description

Co-authored-by: 花名 <角色>"
git push origin master
```

---

**本模板由龙虾维护，确保 Subagent 执行任务时有清晰的指导！** 🚀
