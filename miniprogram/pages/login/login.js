Page({
    data: {
      backendBase: '',
      userInfo: null,
      logged: false,
      message: '',
      selectedRole: 'A', // 默认选择申请者
      roleOptions: [
        { value: 'A', label: '申请者', desc: '可以创建任务、完成任务和兑换物品' },
        { value: 'B', label: '审批者', desc: '可以审批任务和管理商城' },
        { value: 'AB', label: '双重角色', desc: '同时拥有申请者和审批者权限' }
      ]
    },
  
    onLoad() {
      // try to load cached user
      const cached = wx.getStorageSync('catplan_user');
      const openid = wx.getStorageSync('catplan_user_openid');
      if (cached && openid) {
        this.setData({ userInfo: cached, logged: true });
        // 如果已登录，自动跳转到任务列表页
        wx.reLaunch({
          url: '/pages/tasks/tasks',
          success: () => {
            wx.showToast({
              title: '已自动登录',
              icon: 'success',
              duration: 1500
            });
          }
        });
        return;
      }
      // read global backendBase if set
      try {
        const app = getApp();
        const base = app && app.globalData && app.globalData.backendBase;
        if (base) this.setData({ backendBase: base });
      } catch (e) {}
    },
  
    // 角色选择处理
    onRoleChange(e) {
      this.setData({
        selectedRole: e.detail.value
      });
    },
  
    onLoginTap() {
      this.setData({ message: '正在获取授权...' });
      // must be directly in tap callback to satisfy user-gesture requirement
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo;
          this.setData({ message: '正在登录...', userInfo });
  
          // get code
          wx.login({
            success: (loginRes) => {
              const code = loginRes.code;
              if (!code) {
                this.setData({ message: '登录失败：未获取到 code' });
                return;
              }
  
              // exchange code for openid
              wx.request({
                url: `${this.data.backendBase}/api/auth/login`,
                method: 'POST',
                header: { 'content-type': 'application/json' },
                data: { code, user_type: this.data.selectedRole },
                success: (authResp) => {
                  const data = authResp.data || {};
                  const openid = data.openid;
                  if (!openid) {
                    this.setData({ message: '后端未返回 openid' });
                    console.error('authResp', authResp);
                    return;
                  }
  
                  // save to backend
                  wx.request({
                    url: `${this.data.backendBase}/api/user/profile`,
                    method: 'POST',
                    header: { 'content-type': 'application/json' },
                    data: { openid, profile: userInfo },
                    success: (saveResp) => {
                      this.setData({ message: '登录并保存成功', logged: true });
                      // cache profile and openid for later pages
                      wx.setStorageSync('catplan_user', userInfo);
                      wx.setStorageSync('catplan_user_openid', openid);
                      // if backend returned token, cache it for Authorization
                      if (authResp && authResp.data && authResp.data.token) {
                        wx.setStorageSync('catplan_token', authResp.data.token);
                      }
                      // 保存用户类型（从登录响应中获取）
                      const userType = authResp.data.user_type || 'A';
                      wx.setStorageSync('catplan_user_type', userType);
                      
                      // 显示角色信息
    const found = this.data.roleOptions.find(r => r.value === userType); const roleLabel = found ? found.label : '申请者';
                      
                      // 自动跳转到任务列表页（主页面）
                      wx.reLaunch({
                        url: '/pages/tasks/tasks',
                        success: () => {
                          wx.showToast({
                            title: `登录成功 (${roleLabel})`,
                            icon: 'success',
                            duration: 2000
                          });
                        }
                      });
                    },
                    fail: (err) => {
                      console.error('保存用户失败', err);
                      this.setData({ message: '保存用户失败' });
                    }
                  });
                },
                fail: (err) => {
                  console.error('请求后端 /api/auth/login 失败', err);
                  this.setData({ message: '登录失败（后端）' });
                }
              });
            },
            fail: (err) => {
              console.error('wx.login 失败', err);
              this.setData({ message: '登录失败' });
            }
          });
        },
        fail: (err) => {
          console.error('getUserProfile 拒绝或失败', err);
          this.setData({ message: '需要授权用户信息' });
        }
      });
    },
  
    onLogout() {
      wx.removeStorageSync('catplan_user');
      this.setData({ userInfo: null, logged: false, message: '已退出' });
    }
  });
  