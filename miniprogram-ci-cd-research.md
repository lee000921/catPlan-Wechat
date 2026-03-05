# 微信小程序自动化部署测试方案调研

## 方案一：微信官方 miniprogram-ci + 自建脚本

### 原理
使用微信官方提供的 `miniprogram-ci` npm 包，通过 Node.js 脚本调用微信开发者工具的 CLI 能力，实现代码上传、预览、构建 npm 等功能。配合 Shell 脚本或 Node.js 脚本实现自动化流程。

### 优点
- **官方支持**：微信官方维护，稳定性高，功能更新及时
- **功能完整**：支持上传、预览、构建 npm、云函数上传、云托管等完整功能
- **灵活可控**：完全自主控制部署流程，可自定义任意环节
- **免费使用**：无需额外费用，只需配置密钥和 IP 白名单
- **支持第三方平台**：从 1.0.28 版本开始支持第三方平台开发模式

### 缺点
- **需要密钥管理**：需在微信公众平台生成代码上传密钥，并配置 IP 白名单
- **无内置测试**：仅负责部署，测试需配合其他框架
- **命令行功能有限**：相比脚本调用，命令行参数较少
- **需要服务器配置**：部署服务器 IP 需加入白名单

### 实施步骤

1. **准备密钥**
   ```bash
   # 在微信公众平台生成代码上传密钥
   # 路径：微信公众平台 > 管理 > 开发管理 > 开发设置 > 小程序代码上传
   ```

2. **安装依赖**
   ```bash
   npm install miniprogram-ci --save-dev
   ```

3. **创建部署脚本**
   ```javascript
   // deploy.js
   const ci = require('miniprogram-ci')
   
   async function deploy() {
     const project = await ci.createProject({
       appid: 'wx1234567890',
       projectPath: './dist',
       privateKeyPath: './private.key',
       type: 'miniProgram'
     })
   
     await ci.upload({
       project,
       version: '1.0.0',
       desc: '自动化部署 v1.0.0',
       robot: 1
     })
   }
   
   deploy()
   ```

4. **配置 CI/CD 流水线**
   ```yaml
   # 在 CI 环境中执行
   npm install
   npm run build
   node deploy.js
   ```

---

## 方案二：miniprogram-simulate + Jest 单元测试 + miniprogram-ci

### 原理
结合微信官方的测试框架 `miniprogram-simulate` 进行组件和页面测试，使用 Jest 运行单元测试，测试通过后通过 `miniprogram-ci` 自动部署。形成完整的测试 + 部署流水线。

### 优点
- **完整测试覆盖**：支持 WXML、WXSS、JavaScript 逻辑测试
- **官方测试框架**：miniprogram-simulate 由微信官方维护
- **Jest 生态丰富**：可利用 Jest 的断言、mock、覆盖率等能力
- **自动化程度高**：测试失败自动阻断部署
- **支持自定义测试场景**：可模拟各种用户交互和数据场景

### 缺点
- **配置复杂**：需要配置 Jest、miniprogram-simulate、babel 等
- **学习成本**：团队需要学习测试框架的使用
- **部分 API 不支持**：部分微信原生 API 需要 mock
- **维护成本**：测试用例需要随业务迭代维护

### 实施步骤

1. **安装测试依赖**
   ```bash
   npm install --save-dev miniprogram-simulate jest @types/jest
   ```

2. **配置 Jest**
   ```javascript
   // jest.config.js
   module.exports = {
     testMatch: ['**/__tests__/**/*.js'],
     transform: {
       '^.+\\.js$': 'babel-jest'
     },
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1'
     }
   }
   ```

3. **编写测试用例**
   ```javascript
   // __tests__/index.test.js
   const simulate = require('miniprogram-simulate')
   
   test('页面加载', () => {
     const page = simulate.load('pages/index/index')
     const vm = simulate.render(page)
     vm.attach(document.createElement('wrapper'))
     
     expect(vm.data.message).toBe('Hello World')
   })
   ```

4. **配置 CI 流水线**
   ```yaml
   # .github/workflows/deploy.yml
   name: 小程序部署
   
   on:
     push:
       branches: [main]
   
   jobs:
     test-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm install
         - run: npm test  # 运行测试
         - run: npm run build
         - run: node deploy.js  # 部署
   ```

---

## 方案三：GitHub Actions + 第三方部署服务（如云开发 CLI）

### 原理
利用 GitHub Actions 作为 CI/CD 平台，结合微信云开发 CLI 或第三方部署服务（如微盟、有赞等 SaaS 平台提供的部署 API）实现自动化部署。适合使用云开发或第三方平台的小程序项目。

### 优点
- **云端执行**：无需自建服务器，GitHub 提供运行环境
- **生态集成**：与 GitHub 代码仓库深度集成，PR 检查、自动触发
- **免费额度**：GitHub Actions 每月有免费运行时长
- **插件丰富**：可使用社区开发的 Action 插件
- **多环境支持**：可配置开发、测试、生产多环境部署

### 缺点
- **网络限制**：国内访问 GitHub 可能不稳定
- **密钥安全**：需妥善管理 GitHub Secrets
- **依赖第三方**：部分功能依赖社区维护的 Action
- **配置学习成本**：需要学习 GitHub Actions YAML 语法

### 实施步骤

1. **配置 GitHub Secrets**
   ```
   在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加:
   - WECHAT_APPID: 小程序 AppID
   - WECHAT_PRIVATE_KEY: 上传密钥 (Base64 编码)
   - WECHAT_IP_WHITELIST: IP 白名单
   ```

2. **创建 Workflow 文件**
   ```yaml
   # .github/workflows/miniprogram-deploy.yml
   name: 微信小程序自动部署
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
         - name: 检出代码
           uses: actions/checkout@v3
         
         - name: 设置 Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - name: 安装依赖
           run: npm ci
         
         - name: 运行测试
           run: npm test
         
         - name: 构建项目
           run: npm run build
         
         - name: 上传小程序
           run: |
             echo "${{ secrets.WECHAT_PRIVATE_KEY }}" | base64 -d > private.key
             node deploy.js
           env:
             WECHAT_APPID: ${{ secrets.WECHAT_APPID }}
   ```

3. **创建部署脚本**
   ```javascript
   // deploy.js
   const ci = require('miniprogram-ci')
   const fs = require('fs')
   
   async function main() {
     const project = await ci.createProject({
       appid: process.env.WECHAT_APPID,
       projectPath: './dist',
       privateKeyPath: './private.key'
     })
   
     const version = `1.0.${Date.now()}`
     
     await ci.upload({
       project,
       version,
       desc: `GitHub Actions 自动部署 ${version}`,
       robot: 1
     })
     
     console.log(`部署成功！版本：${version}`)
   }
   
   main().catch(console.error)
   ```

---

## 方案四：Jenkins + Docker 容器化部署

### 原理
使用 Jenkins 作为 CI/CD 平台，通过 Docker 容器封装 Node.js 环境和微信开发者工具依赖，实现可重复、隔离的部署环境。适合企业级、多项目并行部署场景。

### 优点
- **企业级功能**：支持权限管理、审批流程、多环境管理
- **容器化隔离**：Docker 保证环境一致性，避免依赖冲突
- **高度可定制**：Jenkins Pipeline 支持复杂部署逻辑
- **可视化界面**：提供部署历史、日志查看等管理功能
- **多项目支持**：可同时管理多个小程序项目部署

### 缺点
- **运维成本高**：需要维护 Jenkins 服务器和 Docker 环境
- **配置复杂**：Jenkins Pipeline 编写需要学习成本
- **资源占用**：需要专用服务器运行 Jenkins
- **初始投入大**：适合中大型团队，小团队可能过度设计

### 实施步骤

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # 安装微信开发者工具依赖
   RUN apk add --no-cache chromium
   ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   CMD ["node", "deploy.js"]
   ```

2. **配置 Jenkins Pipeline**
   ```groovy
   // Jenkinsfile
   pipeline {
     agent {
       docker {
         image 'node:18-alpine'
       }
     }
     
     environment {
       WECHAT_APPID = credentials('wechat-appid')
       WECHAT_KEY = credentials('wechat-private-key')
     }
     
     stages {
       stage('Checkout') {
         steps {
           checkout scm
         }
       }
       
       stage('Install') {
         steps {
           sh 'npm ci'
         }
       }
       
       stage('Test') {
         steps {
           sh 'npm test'
         }
       }
       
       stage('Build') {
         steps {
           sh 'npm run build'
         }
       }
       
       stage('Deploy') {
         steps {
           sh '''
             echo $WECHAT_KEY | base64 -d > private.key
             node deploy.js
           '''
         }
       }
     }
     
     post {
       success {
         echo '部署成功！'
       }
       failure {
         echo '部署失败，请检查日志'
       }
     }
   }
   ```

3. **配置 Jenkins 凭据**
   - 在 Jenkins 管理界面添加 Credentials
   - 类型：Secret text
   - ID: wechat-appid, wechat-private-key

---

## 推荐方案

### 🏆 推荐：方案一 + 方案二组合

**推荐组合：miniprogram-ci + miniprogram-simulate + GitHub Actions**

#### 推荐理由

| 维度 | 评分 | 说明 |
|------|------|------|
| 成本 | ⭐⭐⭐⭐⭐ | 完全免费，仅需 GitHub 账号 |
| 易用性 | ⭐⭐⭐⭐ | 配置简单，文档完善 |
| 稳定性 | ⭐⭐⭐⭐⭐ | 官方工具 + GitHub 平台双重保障 |
| 扩展性 | ⭐⭐⭐⭐ | 支持后续添加更多测试和部署环节 |
| 适用场景 | ⭐⭐⭐⭐⭐ | 适合个人开发者到中小团队 |

#### 完整实施架构

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   npm test  │→ │ npm build   │→ │  deploy.js  │     │
│  │ (Jest +     │  │ (构建生产   │  │ (miniprogram│     │
│  │  simulate)  │  │  代码)      │  │   -ci)      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              微信公众平台 (代码上传成功)                   │
│                   ↓                                      │
│              开发版小程序                                 │
│                   ↓                                      │
│              体验成员扫码体验                             │
└─────────────────────────────────────────────────────────┘
```

#### 快速启动模板

```bash
# 1. 初始化项目
mkdir my-miniprogram-ci
cd my-miniprogram-ci
npm init -y

# 2. 安装依赖
npm install miniprogram-ci --save-dev
npm install jest miniprogram-simulate --save-dev

# 3. 创建目录结构
mkdir -p src __tests__ .github/workflows

# 4. 复制上述配置文件中
#    - jest.config.js
#    - .github/workflows/miniprogram-deploy.yml
#    - deploy.js

# 5. 在 GitHub 配置 Secrets
#    WECHAT_APPID, WECHAT_PRIVATE_KEY

# 6. 提交代码触发自动部署
git add .
git commit -m "feat: 初始化 CI/CD"
git push
```

#### 注意事项

1. **密钥安全**：私钥文件不要提交到代码仓库，使用 CI 平台的 Secrets 功能
2. **IP 白名单**：GitHub Actions 的 IP 是动态的，建议关闭 IP 白名单或定期更新
3. **版本号管理**：建议使用语义化版本号或时间戳作为版本号
4. **测试覆盖率**：建议设置测试覆盖率阈值，低于阈值阻断部署
5. **多环境部署**：可配置不同分支部署到不同环境（develop→开发版，main→体验版）

---

## 附录：常用命令参考

### miniprogram-ci 常用 API

```javascript
// 上传代码
ci.upload({ project, version, desc, robot })

// 预览代码
ci.preview({ project, desc, qrcodeOutputDest })

// 构建 npm
ci.buildNpm({ project })

// 上传云函数
ci.uploadCloudFunction({ project, env, name, path })
```

### 编译设置选项

```javascript
const setting = {
  es6: true,           // ES6 转 ES5
  es7: true,           // 增强编译
  minifyJS: true,      // 压缩 JS
  minifyWXML: true,    // 压缩 WXML
  minifyWXSS: true,    // 压缩 WXSS
  minify: true,        // 压缩所有代码
  codeProtect: false,  // 代码保护
  autoPrefixWXSS: true // 样式自动补全
}
```

---

*调研完成时间：2026-03-04*
