# 阿里云迁移指南

## 目录
1. [🚀 快速上手（推荐新手）](#快速上手)
2. [架构对比](#架构对比)
3. [准备工作](#准备工作)
4. [数据库迁移](#数据库迁移)
5. [后端迁移方案](#后端迁移方案)
6. [存储迁移](#存储迁移)
7. [小程序前端改造](#小程序前端改造)
8. [部署步骤](#部署步骤)
9. [成本估算](#成本估算)

---

## 快速上手

> 💡 **适合场景**：云资源已开通，想快速跑通整个流程，后续逐步完善功能

### 📋 前提检查

确认您已经有：
- ✅ ECS云服务器（已购买）
- ✅ 数据库（RDS或自建MongoDB/MySQL）
- ✅ 域名（已购买并备案）
- ✅ SSL证书（已申请）
- ✅ OSS存储（已开通，可选）

### 🎯 分阶段实施路线图

#### 第一阶段：搭建最小可用系统（1-2天）⭐ 从这里开始
```
目标：部署一个最简单的API，能响应请求
包含：用户登录 + 健康检查
时间：半天到1天
```

#### 第二阶段：添加核心业务（2-3天）
```
目标：实现签到和碎片系统
包含：签到、抽奖、积分
时间：1-2天
```

#### 第三阶段：完整功能（3-5天）
```
目标：完整的业务功能
包含：任务系统、商品兑换
时间：2-3天
```

---

### 🚀 第一阶段：搭建最小可用系统

#### 步骤1：连接ECS服务器（5分钟）

```bash
# 使用SSH连接（Windows用户可用PuTTY或VS Code）
ssh root@your-ecs-ip

# 首次登录建议修改密码
passwd
```

#### 步骤2：安装基础环境（15分钟）

```bash
# 1. 更新系统
yum update -y

# 2. 安装Node.js 16.x
curl -sL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# 验证安装
node -v  # 应显示 v16.x.x
npm -v   # 应显示 8.x.x

# 3. 安装Git
yum install -y git

# 4. 安装PM2（进程管理器）
npm install -g pm2

# 5. 安装Nginx
yum install -y nginx

# 启动Nginx
systemctl start nginx
systemctl enable nginx
```

#### 步骤3：部署最小后端（30分钟）

**方案A：从GitHub克隆完整代码（推荐）**

```bash
# 1. 创建项目目录
mkdir -p /www/catplan
cd /www/catplan

# 2. 克隆代码（如果您的代码已上传GitHub）
git clone https://github.com/lee000921/catPlan.git .

# 3. 进入后端目录
cd backend-aliyun

# 4. 安装依赖
npm install

# 5. 配置环境变量
cp .env.example .env
vim .env
```

**配置.env（最小配置）**：
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置（选一个）
# 如果用MongoDB
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/catplan

# 如果用RDS MySQL
# DB_TYPE=mysql
# MYSQL_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
# MYSQL_PORT=3306
# MYSQL_USER=catplan
# MYSQL_PASSWORD=your-password
# MYSQL_DATABASE=catplan

# JWT密钥（随机字符串）
JWT_SECRET=your-random-secret-key-123456

# 微信配置（先用测试值）
WECHAT_APPID=wx557d4f3490a318fe
WECHAT_APPSECRET=your-appsecret
```

**方案B：从零开始创建最小后端**

如果想从最简单开始，我为您创建一个超简化版本：

```bash
# 1. 创建项目
mkdir -p /www/catplan-mini
cd /www/catplan-mini

# 2. 初始化项目
npm init -y

# 3. 安装依赖
npm install express dotenv cors helmet compression morgan
npm install mongoose  # 如果用MongoDB
# 或
# npm install mysql2 sequelize  # 如果用MySQL
```

创建 `app.js`（最小版本）：
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '服务器运行正常',
    timestamp: new Date() 
  });
});

// 测试API
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API工作正常！',
    data: { version: '1.0.0' }
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
```

创建 `.env`：
```env
PORT=3000
NODE_ENV=production
```

#### 步骤4：启动服务（5分钟）

```bash
# 测试运行
node app.js

# 另开一个终端测试
curl http://localhost:3000/health
# 应该返回：{"status":"ok",...}

# 如果测试成功，用PM2启动
pm2 start app.js --name catplan-api
pm2 save
pm2 startup
```

#### 步骤5：配置Nginx反向代理（10分钟）

```bash
# 创建Nginx配置
vim /etc/nginx/conf.d/catplan.conf
```

**最简配置（先不配SSL）**：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 测试外网访问
curl http://your-domain.com/health
```

#### 步骤6：配置HTTPS（15分钟）

```bash
# 安装Certbot
yum install -y certbot python3-certbot-nginx

# 自动申请SSL并配置
certbot --nginx -d your-domain.com

# 按提示操作：
# 1. 输入邮箱
# 2. 同意协议
# 3. 选择 Yes（自动跳转HTTPS）

# 设置自动续期
echo "0 2 * * * certbot renew --quiet" | crontab -

# 测试HTTPS
curl https://your-domain.com/health
```

#### 步骤7：添加用户登录API（20分钟）

简化版登录（不连数据库，仅用于测试）：

在 `app.js` 中添加：

```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// 模拟登录
app.post('/api/auth/login', (req, res) => {
  const { code, userInfo } = req.body;
  
  // 生成token
  const token = jwt.sign(
    { 
      openId: 'test_' + Date.now(),
      nickName: userInfo?.nickName || '测试用户'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  res.json({
    success: true,
    message: '登录成功',
    data: {
      token,
      userInfo: {
        openId: 'test_' + Date.now(),
        nickName: userInfo?.nickName || '测试用户',
        points: 100,
        level: 1
      }
    }
  });
});

// 测试获取用户信息
app.get('/api/user/info', (req, res) => {
  res.json({
    success: true,
    data: {
      openId: 'test_openid',
      nickName: '测试用户',
      points: 100,
      level: 1
    }
  });
});
```

```bash
# 安装jsonwebtoken
npm install jsonwebtoken

# 重启服务
pm2 restart catplan-api

# 测试登录API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test","userInfo":{"nickName":"小猫咪"}}'
```

#### 步骤8：前端连接测试（15分钟）

在小程序中测试：

**修改 `config/api-aliyun.js`**：
```javascript
const API_BASE_URL = 'https://your-domain.com';

module.exports = {
  API_BASE_URL,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  GET_USER_INFO: `${API_BASE_URL}/api/user/info`,
};
```

**在微信开发者工具中测试**：
```javascript
const api = require('./services/api-aliyun.js');

// 测试登录
api.login('test_code', { nickName: '测试' }).then(res => {
  console.log('登录成功', res);
}).catch(err => {
  console.error('登录失败', err);
});
```

**配置微信小程序域名白名单**：
1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → request合法域名
4. 添加：`https://your-domain.com`

✅ **第一阶段完成检查清单**：
- [ ] ECS可以SSH连接
- [ ] Node.js环境安装成功
- [ ] 最小API能响应请求
- [ ] Nginx配置成功
- [ ] HTTPS证书配置成功
- [ ] 小程序能调用API
- [ ] 能成功登录并返回token

---

### 🔧 第二阶段：添加核心业务

#### 步骤9：连接数据库（30分钟）

**如果使用MongoDB**：

```bash
# 方案A：自建MongoDB
yum install -y mongodb-org

# 启动MongoDB
systemctl start mongod
systemctl enable mongod

# 方案B：使用RDS MongoDB
# 直接用RDS连接字符串，跳过安装
```

**如果使用MySQL**：

```bash
# 方案A：自建MySQL
yum install -y mysql-server

# 启动MySQL
systemctl start mysqld
systemctl enable mysqld

# 获取临时密码
grep 'temporary password' /var/log/mysqld.log

# 登录并修改密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourPassword123!';

# 创建数据库
CREATE DATABASE catplan DEFAULT CHARACTER SET utf8mb4;

# 方案B：使用RDS MySQL
# 直接用RDS，跳过安装
```

**初始化数据库**：

```bash
cd /www/catplan/backend-aliyun

# 如果用MySQL，执行初始化脚本
mysql -h your-db-host -u root -p catplan < scripts/init_mysql.sql

# 如果用MongoDB，导入数据
node scripts/importData.js
```

#### 步骤10：实现签到功能（1小时）

复制完整的路由文件：
```bash
# 使用仓库中的完整代码
# routes/checkin.js 已包含完整逻辑

# 重启服务
pm2 restart catplan-api

# 测试签到API
curl -X POST https://your-domain.com/api/checkin \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"
```

#### 步骤11：实现抽奖功能（1小时）

```bash
# routes/lottery.js 已包含完整逻辑
# 重启服务测试
pm2 restart catplan-api
```

#### 步骤12：前端对接签到和抽奖（2小时）

按照 `FRONTEND_MIGRATION.md` 中的步骤，修改小程序页面。

✅ **第二阶段完成检查清单**：
- [ ] 数据库连接成功
- [ ] 用户数据能正常存储
- [ ] 签到功能正常
- [ ] 抽奖功能正常
- [ ] 碎片增减正常

---

### 📦 第三阶段：完整功能

#### 步骤13：实现任务系统（2小时）
- 导入任务数据
- 测试任务完成
- 对接前端页面

#### 步骤14：实现商品兑换（2小时）
- 导入商品数据
- 测试兑换功能
- 对接前端页面

#### 步骤15：配置OSS图片存储（1小时）
- 上传商品图片到OSS
- 更新数据库图片链接
- 测试图片显示

✅ **第三阶段完成检查清单**：
- [ ] 任务系统正常
- [ ] 商品兑换正常
- [ ] 图片正常显示
- [ ] 所有功能联调通过

---

### 🎯 快速命令参考

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs catplan-api

# 重启服务
pm2 restart catplan-api

# 查看数据库
# MongoDB
mongo
use catplan
db.users.find()

# MySQL
mysql -u root -p
use catplan;
select * from users;

# 查看Nginx日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# 测试API
curl https://your-domain.com/health
```

---

### 💡 调试技巧

1. **API不通**：
   - 检查防火墙：`firewall-cmd --list-all`
   - 检查端口：`netstat -tlnp | grep 3000`
   - 查看PM2日志：`pm2 logs`

2. **数据库连接失败**：
   - 检查连接字符串
   - 检查数据库服务：`systemctl status mongod`
   - 检查RDS白名单

3. **HTTPS证书问题**：
   - 检查证书：`certbot certificates`
   - 测试SSL：`openssl s_client -connect your-domain.com:443`

4. **微信小程序调用失败**：
   - 检查域名是否已备案
   - 检查是否在白名单中
   - 查看开发者工具控制台错误

---

### 📞 遇到问题怎么办？

1. **查看日志**：90%的问题都能从日志找到答案
2. **Google/百度**：搜索具体错误信息
3. **检查配置**：对比文档中的配置示例
4. **逐步排查**：从最简单的开始，一步步验证

---

## 架构对比

### 原架构（腾讯云）
```
微信小程序
    ↓
wx.cloud.callFunction()
    ↓
腾讯云 CloudBase
    ├── 云函数
    ├── 云数据库（MongoDB）
    └── 云存储
```

### 新架构（阿里云）- 方案一：函数计算
```
微信小程序
    ↓
wx.request() → API网关
    ↓
阿里云函数计算（FC）
    ↓
├── MongoDB Atlas / 阿里云MongoDB
└── 阿里云 OSS
```

### 新架构（阿里云）- 方案二：ECS服务器 ⭐推荐
```
微信小程序
    ↓
wx.request() → Nginx
    ↓
Node.js Express API (ECS)
    ↓
├── 阿里云 RDS MySQL / MongoDB云数据库
└── 阿里云 OSS
```

**推荐：方案二（ECS + RDS）**
- 成本可控
- 部署简单
- 便于调试
- 适合中小型项目
- **RDS优势**：自动备份、高可用、免运维

---

## 准备工作

### 1. 阿里云账号准备
- [x] 注册阿里云账号
- [x] 实名认证
- [x] 充值（建议200元起）

### 2. 开通服务

#### 方案A：使用RDS数据库（推荐）⭐
- [x] **ECS 云服务器**（推荐配置：2核4G，带宽3M）
- [x] **RDS MySQL数据库**（推荐：1核2G，20GB存储）
  - 或 **RDS MongoDB**（如果偏好NoSQL）
- [x] **对象存储 OSS**（存储图片）
- [ ] **SSL证书**（小程序必须使用HTTPS）
- [ ] **域名**（需备案）

#### 方案B：自建数据库（成本更低）
- [ ] **ECS 云服务器**（推荐配置：2核4G，带宽3M）
- [ ] 在ECS上自建 MongoDB 或 MySQL
- [ ] **对象存储 OSS**（存储图片）
- [ ] **SSL证书**（小程序必须使用HTTPS）
- [ ] **域名**（需备案）

**RDS vs 自建对比**：

| 对比项 | RDS | 自建 |
|--------|-----|------|
| 成本 | ¥50-150/月 | ¥0（占用ECS资源） |
| 运维 | 阿里云托管 | 需要自己维护 |
| 备份 | 自动备份 | 需手动配置 |
| 高可用 | 支持主备 | 需自己搭建 |
| 性能 | 优化过的 | 看配置 |
| 推荐场景 | 生产环境 | 开发测试 |

### 3. 域名与SSL证书申请 🌐

#### 步骤1：注册域名

**在阿里云注册域名（推荐）**：

1. **登录阿里云控制台**
   - 访问：https://wanwang.aliyun.com/
   - 搜索您想要的域名

2. **选择域名类型**
   ```
   推荐：
   - .com  （国际域名，¥55-65/年）
   - .cn   （中国域名，¥29-35/年，需备案）
   - .top  （新顶级域名，¥8-15/年）
   
   示例：
   - catplan.com
   - catplan.cn
   - api.catplan.com（建议用子域名做API）
   ```

3. **购买并实名认证**
   - 加入购物车并支付
   - 提交实名认证（个人/企业）
   - 审核时间：1-3个工作日

4. **域名解析设置**（购买后设置）
   - 进入「云解析DNS」
   - 添加A记录：
     ```
     主机记录：api（或 @）
     记录类型：A
     记录值：你的ECS公网IP
     TTL：10分钟
     ```

**示例配置**：
```
# 如果域名是 catplan.com
api.catplan.com  →  指向ECS IP：47.100.1.1

# 访问地址
https://api.catplan.com/health
```

#### 步骤2：域名备案（.cn域名必须，.com建议）

**为什么要备案**：
- ✅ 国内服务器必须备案才能访问
- ✅ 微信小程序要求域名备案
- ✅ 提升用户信任度

**备案流程**（阿里云）：

1. **准备材料**
   - 个人备案：身份证、手机号
   - 企业备案：营业执照、法人身份证、公章

2. **提交备案申请**
   ```
   登录阿里云备案系统：https://beian.aliyun.com/
   
   填写信息：   
   - 域名：catplan.com
   - 服务器：选择你的ECS
   - 主体信息：个人/企业信息
   - 网站信息：网站名称、内容
   ```

3. **阿里云初审**（1-2个工作日）
   - 检查资料是否完整
   - 可能要求补充材料

4. **工信部终审**（10-20个工作日）
   - 管局审核
   - 短信核验
   - 等待备案号

5. **备案成功**
   - 获得备案号：如 `京ICP备12345678号`
   - 网站底部显示备案号

**备案时间**：首次备案约 15-30天

**快速备案技巧**：
- ✅ 资料准备齐全，一次性提交
- ✅ 网站名称不要包含敏感词
- ✅ 个人备案比企业备案快
- ✅ 有些地区支持加急备案

#### 步骤3：申请SSL证书（免费方案）⭐

**方案A：Let's Encrypt 免费证书（推荐）**

1. **使用Certbot自动申请**
   ```bash
   # 安装Certbot
   yum install -y certbot python3-certbot-nginx
   
   # 自动申请并配置Nginx
   certbot --nginx -d api.catplan.com
   
   # 按提示输入邮箱
   # 同意服务条款
   # 选择是否重定向HTTP到HTTPS（选Yes）
   ```

2. **自动续期**
   ```bash
   # 测试续期
   certbot renew --dry-run
   
   # 设置自动续期（添加到crontab）
   crontab -e
   
   # 添加以下行（每天凌晨2点检查）
   0 2 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
   ```

3. **证书位置**
   ```
   证书文件：/etc/letsencrypt/live/api.catplan.com/fullchain.pem
   私钥文件：/etc/letsencrypt/live/api.catplan.com/privkey.pem
   有效期：90天（自动续期）
   ```

**方案B：阿里云免费SSL证书**

1. **申请免费证书**
   ```
   登录阿里云控制台 → 搜索"SSL证书"
   
   选择：免费版DV SSL
   - 品牌：DigiCert
   - 有效期：1年
   - 数量：每个账号20个/年
   - 适用：单个域名
   ```

2. **填写域名信息**
   ```
   证书绑定域名：api.catplan.com
   域名验证方式：DNS验证（推荐）或文件验证
   ```

3. **域名验证**
   
   **DNS验证方式**（推荐）：
   ```bash
   # 系统会提示添加一条DNS记录
   主机记录：_dnsauth
   记录类型：TXT
   记录值：202501261234567890abcdef...
   
   # 在阿里云云解析DNS中添加此记录
   # 等待验证（通常5-10分钟）
   ```

4. **下载证书**
   ```
   验证通过后下载证书
   - 选择：Nginx格式
   - 下载包含：
     * xxx.pem（证书文件）
     * xxx.key（私钥文件）
   ```

5. **上传到服务器**
   ```bash
   # 创建证书目录
   mkdir -p /etc/nginx/ssl
   
   # 上传证书文件
   scp xxx.pem root@your-server:/etc/nginx/ssl/
   scp xxx.key root@your-server:/etc/nginx/ssl/
   
   # 设置权限
   chmod 600 /etc/nginx/ssl/xxx.key
   chmod 644 /etc/nginx/ssl/xxx.pem
   ```

**方案C：云盾证书服务（付费，更安全）**

适合企业用户：
```
OV证书：¥1500-3000/年（组织验证）
EV证书：¥3000-8000/年（扩展验证，地址栏显示企业名）
通配符证书：¥2000-5000/年（支持 *.catplan.com）
```

#### 步骤4：配置Nginx HTTPS

```nginx
# /etc/nginx/conf.d/catplan.conf

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name api.catplan.com;
    
    # 强制跳转HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name api.catplan.com;
    
    # SSL 证书配置（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/api.catplan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.catplan.com/privkey.pem;
    
    # 或使用阿里云证书
    # ssl_certificate /etc/nginx/ssl/xxx.pem;
    # ssl_certificate_key /etc/nginx/ssl/xxx.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS（可选，增强安全性）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 反向代理到Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 设置开机自启
systemctl enable nginx
```

#### 步骤5：验证HTTPS

```bash
# 1. 测试HTTPS访问
curl https://api.catplan.com/health

# 2. 检查SSL证书
openssl s_client -connect api.catplan.com:443 -servername api.catplan.com

# 3. 在线检测（推荐）
# 访问：https://myssl.com/
# 输入：api.catplan.com
# 查看评分（A+最佳）
```

#### 域名与SSL完整流程总结

```
1️⃣ 购买域名（catplan.com）        → 10分钟，¥55/年
2️⃣ 域名解析（api.catplan.com）   → 5分钟，免费
3️⃣ 域名备案（必须）              → 15-30天，免费
4️⃣ 申请SSL证书（Let's Encrypt）  → 5分钟，免费
5️⃣ 配置Nginx HTTPS              → 10分钟，免费
6️⃣ 测试验证                     → 5分钟

总耗时：35分钟 + 备案等待时间
总费用：¥55/年（域名）
```

#### 常见问题

**Q1: 域名备案期间可以使用吗？**
A: 不可以。备案期间域名无法访问，建议先用IP测试。

**Q2: Let's Encrypt证书安全吗？**
A: 非常安全，全球数百万网站使用，支持所有浏览器。

**Q3: 证书过期了怎么办？**
A: Let's Encrypt自动续期，阿里云免费证书需手动续期。

**Q4: 一个域名可以配置多个子域名吗？**
A: 可以。每个子域名需单独申请证书，或购买通配符证书。

**Q5: 微信小程序对域名有什么要求？**
A: 必须HTTPS、必须备案、不能是IP地址。

### 4. 微信小程序配置
- [ ] 设置服务器域名白名单
- [ ] 配置业务域名
- [ ] 获取 AppID 和 AppSecret

---

## 数据库迁移

### 选择数据库类型

#### 方案A：使用RDS MySQL（推荐用于生产环境）⭐

**优势**：
- ✅ 关系型数据库，数据结构清晰
- ✅ 支持复杂查询和事务
- ✅ 阿里云RDS自动备份、高可用
- ✅ 性能监控和优化工具完善
- ✅ 成本可控（按配置收费）

**数据库结构设计**：

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  open_id VARCHAR(64) UNIQUE NOT NULL COMMENT '微信OpenID',
  nick_name VARCHAR(128) COMMENT '昵称',
  avatar_url VARCHAR(512) COMMENT '头像',
  points INT DEFAULT 0 COMMENT '碎片数量',
  level INT DEFAULT 1 COMMENT '等级',
  checkin_days INT DEFAULT 0 COMMENT '累计签到天数',
  last_checkin_date DATETIME COMMENT '最后签到时间',
  last_lottery_date DATETIME COMMENT '最后抽奖时间',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  last_login_time DATETIME COMMENT '最后登录时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_open_id (open_id),
  INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 签到历史表
CREATE TABLE checkin_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  points INT DEFAULT 0 COMMENT '获得碎片',
  checkin_date DATE NOT NULL COMMENT '签到日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_open_id (open_id),
  INDEX idx_checkin_date (checkin_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到历史';

-- 任务表
CREATE TABLE tasks (
  id VARCHAR(32) PRIMARY KEY COMMENT '任务ID',
  title VARCHAR(128) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  points INT NOT NULL COMMENT '奖励碎片',
  category ENUM('daily', 'growth') NOT NULL COMMENT '任务类型',
  max_progress INT DEFAULT 1 COMMENT '最大进度',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 用户任务记录表
CREATE TABLE user_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  task_id VARCHAR(32) NOT NULL COMMENT '任务ID',
  finish_time DATETIME NOT NULL COMMENT '完成时间',
  points INT DEFAULT 0 COMMENT '获得碎片',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_task (user_id, task_id),
  INDEX idx_open_id (open_id),
  INDEX idx_finish_time (finish_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户任务记录';

-- 商品表
CREATE TABLE goods (
  id VARCHAR(32) PRIMARY KEY COMMENT '商品ID',
  title VARCHAR(128) NOT NULL COMMENT '商品名称',
  image VARCHAR(512) COMMENT '商品图片',
  points INT NOT NULL COMMENT '所需碎片',
  origin_price DECIMAL(10,2) COMMENT '原价',
  stock INT DEFAULT 0 COMMENT '库存',
  sold INT DEFAULT 0 COMMENT '已售',
  type VARCHAR(32) COMMENT '商品类型',
  description TEXT COMMENT '商品描述',
  delivery_info TEXT COMMENT '配送信息',
  exchange_limit INT DEFAULT 1 COMMENT '兑换限制',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_points (points),
  INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 兑换记录表
CREATE TABLE exchange_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  good_id VARCHAR(32) NOT NULL COMMENT '商品ID',
  good_title VARCHAR(128) COMMENT '商品名称',
  good_image VARCHAR(512) COMMENT '商品图片',
  points INT NOT NULL COMMENT '消耗碎片',
  status ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  receiver_name VARCHAR(64) COMMENT '收货人',
  receiver_phone VARCHAR(32) COMMENT '手机号',
  receiver_address TEXT COMMENT '收货地址',
  express_company VARCHAR(64) COMMENT '快递公司',
  express_number VARCHAR(128) COMMENT '快递单号',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_open_id (open_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='兑换记录';
```

**数据迁移脚本（MongoDB → MySQL）**：

```javascript
// scripts/migrateToMySQL.js
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

async function migrate() {
  // 连接MongoDB
  await mongoose.connect('mongodb://...');
  
  // 连接MySQL
  const mysqlConn = await mysql.createConnection({
    host: 'your-rds-host',
    user: 'your-username',
    password: 'your-password',
    database: 'catplan'
  });

  // 迁移用户数据
  const users = await mongoose.connection.db.collection('users').find().toArray();
  for (const user of users) {
    await mysqlConn.execute(
      `INSERT INTO users (open_id, nick_name, avatar_url, points, level, checkin_days, 
       last_checkin_date, register_time, last_login_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.openId, user.nickName, user.avatarUrl, user.points || 0, user.level || 1,
       user.checkinDays || 0, user.lastCheckinDate, user.registerTime, user.lastLoginTime]
    );
  }

  // 迁移任务数据、商品数据等...
  
  console.log('迁移完成！');
}
```

#### 方案B：使用RDS MongoDB（保持NoSQL结构）

如果希望保持现有的MongoDB数据结构，可以直接使用阿里云RDS MongoDB。

**MongoDB 数据导出（腾讯云）**：

```bash
# 使用腾讯云控制台导出数据
# 或使用 mongoexport 命令

# 导出 users 集合
mongoexport --uri="mongodb://用户名:密码@腾讯云地址/数据库" --collection=users --out=users.json

# 导出 tasks 集合
mongoexport --uri="mongodb://用户名:密码@腾讯云地址/数据库" --collection=tasks --out=tasks.json

# 导出 goods 集合
mongoexport --uri="mongodb://用户名:密码@腾讯云地址/数据库" --collection=goods --out=goods.json

# 导出 exchangeRecords 集合
mongoexport --uri="mongodb://用户名:密码@腾讯云地址/数据库" --collection=exchangeRecords --out=exchangeRecords.json
```

**MongoDB 数据导入（阿里云RDS）**：

```bash
# 导入到阿里云 RDS MongoDB
mongoimport --uri="mongodb://用户名:密码@dds-xxxxx.mongodb.rds.aliyuncs.com:3717/数据库?replicaSet=mgset-xxxxx" --collection=users --file=users.json
mongoimport --uri="mongodb://用户名:密码@dds-xxxxx.mongodb.rds.aliyuncs.com:3717/数据库?replicaSet=mgset-xxxxx" --collection=tasks --file=tasks.json
mongoimport --uri="mongodb://用户名:密码@dds-xxxxx.mongodb.rds.aliyuncs.com:3717/数据库?replicaSet=mgset-xxxxx" --collection=goods --file=goods.json
mongoimport --uri="mongodb://用户名:密码@dds-xxxxx.mongodb.rds.aliyuncs.com:3717/数据库?replicaSet=mgset-xxxxx" --collection=exchangeRecords --file=exchangeRecords.json
```

#### 方案C：自建数据库（成本最低）

在ECS服务器上自建MongoDB或MySQL，适合开发测试环境。

---

## 后端迁移方案

### 创建 Node.js Express 后端

项目结构：
```
catPlan-backend/
├── config/
│   ├── db.js              # 数据库配置
│   ├── oss.js             # OSS配置
│   └── wechat.js          # 微信配置
├── routes/
│   ├── auth.js            # 登录相关
│   ├── checkin.js         # 签到
│   ├── lottery.js         # 抽奖
│   ├── tasks.js           # 任务
│   ├── goods.js           # 商品
│   └── user.js            # 用户
├── models/
│   ├── User.js
│   ├── Task.js
│   ├── Good.js
│   └── ExchangeRecord.js
├── middleware/
│   ├── auth.js            # 认证中间件
│   └── error.js           # 错误处理
├── utils/
│   ├── wechat.js          # 微信工具函数
│   └── response.js        # 统一响应格式
├── app.js
├── package.json
└── ecosystem.config.js    # PM2配置
```

---

## 存储迁移

### 图片迁移到阿里云 OSS

```javascript
// utils/oss.js
const OSS = require('ali-oss');

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'catplan'
});

// 上传文件
async function uploadFile(filePath, fileName) {
  try {
    const result = await client.put(fileName, filePath);
    return result.url;
  } catch (error) {
    console.error('上传失败', error);
    throw error;
  }
}

module.exports = { client, uploadFile };
```

### 批量迁移图片

```javascript
// scripts/migrateImages.js
const https = require('https');
const fs = require('fs');
const { uploadFile } = require('../utils/oss');

// 从腾讯云下载图片并上传到阿里云OSS
async function migrateImage(cloudUrl, ossPath) {
  return new Promise((resolve, reject) => {
    const tempFile = './temp/' + Date.now() + '.jpg';
    const file = fs.createWriteStream(tempFile);
    
    https.get(cloudUrl, response => {
      response.pipe(file);
      file.on('finish', async () => {
        file.close();
        try {
          const ossUrl = await uploadFile(tempFile, ossPath);
          fs.unlinkSync(tempFile); // 删除临时文件
          resolve(ossUrl);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
```

---

## 小程序前端改造

### 1. 创建 API 配置文件

```javascript
// config/api.js
const API_BASE_URL = 'https://api.yourdomain.com'; // 替换为你的域名

module.exports = {
  API_BASE_URL,
  
  // API 端点
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  GET_USER_INFO: `${API_BASE_URL}/api/user/info`,
  UPDATE_USER_INFO: `${API_BASE_URL}/api/user/update`,
  CHECKIN: `${API_BASE_URL}/api/checkin`,
  LOTTERY: `${API_BASE_URL}/api/lottery`,
  GET_TASKS: `${API_BASE_URL}/api/tasks`,
  GET_GOODS: `${API_BASE_URL}/api/goods`,
  EXCHANGE_GOODS: `${API_BASE_URL}/api/exchange`,
  GET_EXCHANGE_RECORDS: `${API_BASE_URL}/api/exchange/records`
};
```

### 2. 创建 HTTP 请求工具

```javascript
// utils/request.js
const config = require('../config/api.js');

/**
 * 统一的HTTP请求方法
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: url,
      method: options.method || 'POST',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            // 业务错误
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token过期，重新登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/user/login'
          });
          reject(new Error('登录已过期'));
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(new Error('网络错误'));
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = { request };
```

### 3. 创建 API 服务层

```javascript
// services/api.js
const { request } = require('../utils/request.js');
const API = require('../config/api.js');

// 登录
function login(code, userInfo) {
  return request(API.LOGIN, {
    method: 'POST',
    data: { code, userInfo }
  });
}

// 获取用户信息
function getUserInfo() {
  return request(API.GET_USER_INFO, {
    method: 'GET'
  });
}

// 签到
function checkin() {
  return request(API.CHECKIN, {
    method: 'POST'
  });
}

// 抽奖
function lottery() {
  return request(API.LOTTERY, {
    method: 'POST'
  });
}

// 获取任务列表
function getTasks() {
  return request(API.GET_TASKS, {
    method: 'GET'
  });
}

// 更新用户信息
function updateUserInfo(data) {
  return request(API.UPDATE_USER_INFO, {
    method: 'POST',
    data
  });
}

// 获取商品列表
function getGoods() {
  return request(API.GET_GOODS, {
    method: 'GET'
  });
}

// 兑换商品
function exchangeGoods(goodId) {
  return request(API.EXCHANGE_GOODS, {
    method: 'POST',
    data: { goodId }
  });
}

// 获取兑换记录
function getExchangeRecords() {
  return request(API.GET_EXCHANGE_RECORDS, {
    method: 'GET'
  });
}

module.exports = {
  login,
  getUserInfo,
  checkin,
  lottery,
  getTasks,
  updateUserInfo,
  getGoods,
  exchangeGoods,
  getExchangeRecords
};
```

### 4. 修改页面调用方式

**原来（腾讯云）：**
```javascript
wx.cloud.callFunction({
  name: 'checkin',
  success: res => {
    // 处理结果
  }
});
```

**现在（阿里云）：**
```javascript
const api = require('../../services/api.js');

api.checkin().then(res => {
  // 处理结果
}).catch(err => {
  console.error(err);
});
```

### 5. 修改 app.js

```javascript
// app.js
const api = require('./services/api.js');

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: null
  },
  
  onLaunch: function() {
    // 移除云开发初始化
    // wx.cloud.init() 代码删除
    
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow: function() {
    // updateManager 保持不变
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      console.log('本地存储有用户信息', userInfo);
      return true;
    }
    
    console.log('本地存储没有用户信息');
    return false;
  },
  
  // 登录
  login: function() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            // 获取用户信息
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: userRes => {
                // 调用后端登录接口
                api.login(res.code, userRes.userInfo).then(loginRes => {
                  if (loginRes.success) {
                    // 保存token和用户信息
                    wx.setStorageSync('token', loginRes.data.token);
                    wx.setStorageSync('userInfo', loginRes.data.userInfo);
                    this.globalData.token = loginRes.data.token;
                    this.globalData.userInfo = loginRes.data.userInfo;
                    this.globalData.isLogin = true;
                    resolve(loginRes.data);
                  } else {
                    reject(new Error(loginRes.message));
                  }
                }).catch(reject);
              },
              fail: reject
            });
          } else {
            reject(new Error('获取code失败'));
          }
        },
        fail: reject
      });
    });
  }
});
```

---

## 部署步骤

### 1. ECS服务器配置

```bash
# 连接到ECS
ssh root@your-server-ip

# 更新系统
yum update -y

# 安装Node.js 16.x
curl -sL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# 安装MongoDB（或使用云数据库）
# 参考：https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/

# 安装Nginx
yum install -y nginx

# 安装PM2（进程管理器）
npm install -g pm2

# 安装Git
yum install -y git
```

### 2. 部署后端代码

```bash
# 创建项目目录
mkdir -p /www/catplan-backend
cd /www/catplan-backend

# 克隆代码（或上传代码）
git clone your-backend-repo.git .

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
vim .env

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. 配置Nginx

```nginx
# /etc/nginx/conf.d/catplan.conf
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 4. 配置SSL证书

```bash
# 使用Let's Encrypt免费证书
yum install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d api.yourdomain.com

# 自动续期
crontab -e
# 添加：0 0 1 * * certbot renew --quiet
```

### 5. 微信小程序配置

1. 登录微信公众平台
2. 进入「开发」-「开发管理」-「开发设置」
3. 在「服务器域名」中添加：
   - request合法域名：`https://api.yourdomain.com`
   - uploadFile合法域名：`https://your-oss-bucket.oss-cn-hangzhou.aliyuncs.com`
   - downloadFile合法域名：`https://your-oss-bucket.oss-cn-hangzhou.aliyuncs.com`

---

## 成本估算

### 阿里云资源配置建议

#### 方案A：使用RDS数据库（推荐生产环境）

| 服务 | 配置 | 月费用 | 说明 |
|------|------|--------|------|
| ECS服务器 | 2核4G 3M带宽 | ¥100-150 | 推荐按量付费转包年 |
| **RDS MySQL** | 1核2G 20GB | ¥70-120 | 自动备份、高可用 ⭐ |
| OSS存储 | 10GB + 流量 | ¥10-30 | 按实际使用 |
| 域名 | .com/.cn | ¥50-80/年 | 首年更便宜 |
| SSL证书 | Let's Encrypt | 免费 | 或购买商业证书 |
| **合计** | - | **¥280-400/月** | 稳定可靠 |

#### 方案B：使用RDS MongoDB（保持NoSQL）

| 服务 | 配置 | 月费用 | 说明 |
|------|------|--------|------|
| ECS服务器 | 2核4G 3M带宽 | ¥100-150 | 推荐按量付费转包年 |
| **RDS MongoDB** | 1核2G 10GB | ¥90-150 | 副本集架构 |
| OSS存储 | 10GB + 流量 | ¥10-30 | 按实际使用 |
| 域名 | .com/.cn | ¥50-80/年 | 首年更便宜 |
| SSL证书 | Let's Encrypt | 免费 | 或购买商业证书 |
| **合计** | - | **¥300-430/月** | NoSQL优势 |

#### 方案C：自建数据库（成本最低）

| 服务 | 配置 | 月费用 | 说明 |
|------|------|--------|------|
| ECS服务器 | 2核4G 3M带宽 | ¥100-150 | 同时运行应用+数据库 |
| 自建 MongoDB/MySQL | - | ¥0 | 占用ECS资源 |
| OSS存储 | 10GB + 流量 | ¥10-30 | 按实际使用 |
| 域名 | .com/.cn | ¥50-80/年 | 首年更便宜 |
| SSL证书 | Let's Encrypt | 免费 | 或购买商业证书 |
| **合计** | - | **¥210-280/月** | 适合开发测试 |

### RDS vs 自建数据库详细对比

| 对比项 | RDS MySQL/MongoDB | 自建数据库 |
|--------|-------------------|------------|
| **成本** | ¥70-150/月 | ¥0（占用ECS资源） |
| **运维复杂度** | 零运维，阿里云托管 | 需要自己维护升级 |
| **自动备份** | ✅ 每天自动备份，保留7天 | ❌ 需手动配置 |
| **高可用** | ✅ 主备架构，自动切换 | ❌ 单点故障 |
| **监控告警** | ✅ 完善的监控面板 | ❌ 需自己搭建 |
| **性能优化** | ✅ 参数优化、慢查询分析 | 🔧 需要经验 |
| **安全性** | ✅ 白名单、SSL加密 | 🔧 需要配置 |
| **扩容** | ✅ 一键升级配置 | ❌ 需要迁移 |
| **适用场景** | 🏢 生产环境、重要数据 | 🧪 开发测试、低预算 |

### 推荐选择

- **预算充足（>300元/月）**：RDS MySQL + ECS ⭐⭐⭐
  - 最稳定、最省心
  - 适合正式上线的项目
  
- **预算中等（200-300元/月）**：RDS MongoDB + ECS ⭐⭐
  - 保持现有架构
  - 快速迁移
  
- **预算紧张（<200元/月）**：自建数据库 + ECS ⭐
  - 适合开发测试
  - 需要一定运维能力

### 成本优化建议

1. **新用户优惠**：阿里云新用户可享受1-3折优惠，首年成本更低
2. **包年付费**：长期使用建议包年，通常有7-8折优惠
3. **RDS规格**：根据实际用户量选择，初期可用最小规格
4. **按量付费**：开发测试阶段可用按量付费，正式上线转包年
5. **CDN加速**：流量大时考虑使用CDN，降低OSS流量费用
6. **弹性伸缩**：使用负载均衡+多台小规格ECS，比单台大规格更灵活

---

## 监控与维护

### PM2 进程监控

```bash
# 查看运行状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart catplan-backend

# 查看资源占用
pm2 monit
```

### 日志管理

```javascript
// 使用winston记录日志
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

---

## 常见问题

### Q1: 小程序request请求失败？
**A**: 检查服务器域名是否已在微信公众平台配置白名单，必须使用HTTPS。

### Q2: 数据库连接失败？
**A**: 检查MongoDB连接字符串、网络安全组规则、数据库用户权限。

### Q3: OSS图片无法显示？
**A**: 检查OSS bucket权限设置为公共读，或配置签名URL。

### Q4: 502 Bad Gateway错误？
**A**: 检查Node.js服务是否正常运行（`pm2 status`），检查Nginx配置。

---

## 总结

迁移到阿里云需要：
1. ✅ 重构后端为 Express API
2. ✅ 迁移数据库数据
3. ✅ 迁移图片到OSS
4. ✅ 改造小程序API调用方式
5. ✅ 配置服务器和域名
6. ✅ 测试所有功能

**预计迁移时间：3-5天**（含测试）

如有问题，欢迎提Issue！
