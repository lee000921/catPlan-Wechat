# 阿里云版本迁移指南

本文档说明如何将小程序从腾讯云版本切换到阿里云版本。

## 一、后端部署（必读）

详细部署步骤请参考：[ALIYUN_MIGRATION.md](./ALIYUN_MIGRATION.md)

确保后端服务已经：
1. ✅ 部署到阿里云 ECS
2. ✅ 配置好 MongoDB 数据库
3. ✅ 配置好 Nginx 和 HTTPS
4. ✅ 服务正常运行（访问 https://你的域名/health 返回 ok）

## 二、前端改造步骤

### 1. 配置 API 地址

编辑 `config/api-aliyun.js`：

```javascript
const API_BASE_URL = 'https://api.yourdomain.com'; // 改为你的域名
```

### 2. 替换 app.js

```javascript
// app.js
import updateManager from './common/updateManager';
const api = require('./services/api-aliyun.js');

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: null
  },
  
  onLaunch: function() {
    // 移除云开发初始化代码
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow: function() {
    updateManager();
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      return true;
    }
    return false;
  },
  
  // 用户登录
  login: function() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: userRes => {
                api.login(res.code, userRes.userInfo).then(loginRes => {
                  if (loginRes.success) {
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
          }
        },
        fail: reject
      });
    });
  }
});
```

### 3. 修改页面调用方式

#### 原来（腾讯云）：
```javascript
wx.cloud.callFunction({
  name: 'checkin',
  success: res => {
    console.log(res.result);
  }
});
```

#### 现在（阿里云）：
```javascript
const api = require('../../services/api-aliyun.js');

api.checkin().then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});
```

### 4. 页面示例改造

#### 签到页面 (pages/checkin/index.js)

```javascript
const app = getApp();
const api = require('../../services/api-aliyun.js');

Page({
  data: {
    // ...
  },

  // 获取签到数据
  fetchCheckInData: function() {
    this.setData({ loading: true });
    
    api.getUserInfo().then(res => {
      if (res.success && res.data) {
        const userData = res.data;
        
        // 更新用户信息
        app.globalData.userInfo = userData;
        wx.setStorageSync('userInfo', userData);
        
        // 检查今日是否已签到
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const beginTime = today.getTime();
        today.setHours(23, 59, 59, 999);
        const endTime = today.getTime();
        const lastCheckinTime = userData.lastCheckinDate ? new Date(userData.lastCheckinDate).getTime() : 0;
        const todayChecked = lastCheckinTime >= beginTime && lastCheckinTime <= endTime;
        
        // 更新日历...
        
        this.setData({
          userInfo: userData,
          checkInDays: userData.checkinDays || 0,
          todayChecked: todayChecked,
          loading: false
        });
      }
    }).catch(err => {
      console.error('获取签到数据失败', err);
      this.setData({ loading: false });
    });
  },

  // 执行签到
  handleCheckIn: function() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }

    if (this.data.todayChecked) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    this.setData({ checkInAnimation: true });

    api.checkin().then(res => {
      if (res.success) {
        const result = res.data;
        
        // 更新界面...
        
        wx.showToast({
          title: `签到成功 +${result.basePoints}碎片`,
          icon: 'success'
        });
      }
    }).catch(err => {
      console.error('签到失败', err);
    }).finally(() => {
      this.setData({ checkInAnimation: false });
    });
  }
});
```

### 5. 配置服务器域名白名单

1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 在「服务器域名」中添加：
   - **request合法域名**：`https://api.yourdomain.com`
   - **uploadFile合法域名**：`https://your-bucket.oss-cn-hangzhou.aliyuncs.com`
   - **downloadFile合法域名**：`https://your-bucket.oss-cn-hangzhou.aliyuncs.com`

## 三、文件修改清单

需要修改的文件：

```
✅ app.js - 移除云开发初始化，添加新的登录逻辑
✅ config/api-aliyun.js - 配置API地址（新增）
✅ utils/request-aliyun.js - HTTP请求工具（新增）
✅ services/api-aliyun.js - API服务层（新增）
✅ pages/checkin/index.js - 改用API调用
✅ pages/lottery/index.js - 改用API调用
✅ pages/tasks/index.js - 改用API调用
✅ pages/exchange/index.js - 改用API调用
✅ pages/user/*.js - 改用API调用
```

## 四、测试清单

部署后需要测试的功能：

- [ ] 用户登录
- [ ] 获取用户信息
- [ ] 每日签到
- [ ] 签到日历显示
- [ ] 幸运抽奖
- [ ] 任务列表加载
- [ ] 完成任务
- [ ] 商品列表加载
- [ ] 商品兑换
- [ ] 兑换记录查询
- [ ] Token过期自动跳转登录

## 五、常见问题

### Q1: 提示"request:fail url not in domain list"
**A**: 需要在微信公众平台配置服务器域名白名单

### Q2: 请求返回401
**A**: Token过期或无效，检查登录流程

### Q3: 后端返回500错误
**A**: 检查后端日志 `pm2 logs catplan-backend`

### Q4: 数据无法显示
**A**: 检查数据库是否正确导入初始数据

## 六、回滚方案

如果阿里云版本有问题，可以快速回滚到腾讯云版本：

1. 恢复 app.js 中的云开发初始化代码
2. 将所有 `api.xxx()` 调用改回 `wx.cloud.callFunction()`
3. 在开发者工具中重新编译

## 七、性能优化建议

1. **启用CDN**：为静态资源和API配置CDN加速
2. **请求缓存**：合理使用本地缓存减少请求次数
3. **图片优化**：使用OSS图片处理功能压缩图片
4. **懒加载**：商品列表使用分页加载
5. **错误重试**：网络请求失败时自动重试

## 八、监控与维护

1. **日志查看**：`pm2 logs catplan-backend`
2. **服务状态**：`pm2 status`
3. **重启服务**：`pm2 restart catplan-backend`
4. **数据备份**：定期备份MongoDB数据
5. **SSL证书**：定期检查SSL证书有效期

---

如有问题，欢迎提Issue！
