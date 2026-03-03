const app = getApp();

Page({
  data: {
    backendBase: '',
    userInfo: null,
    openid: '',
    formData: {
      title: '',
      description: '',
      points: 10
    },
    submitting: false
  },

  onLoad() {
    // 从全局配置获取后端地址
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }
    
    // 从缓存获取用户信息
    const userInfo = wx.getStorageSync('catplan_user');
    const openid = wx.getStorageSync('catplan_user_openid');
    if (userInfo && openid) {
      this.setData({ userInfo, openid });
    }
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  // 输入积分
  onPointsInput(e) {
    const points = parseInt(e.detail.value) || 0;
    this.setData({
      'formData.points': points
    });
  },

  // 提交表单
  onSubmit() {
    const { title, description, points } = this.data.formData;
    const { openid, backendBase } = this.data;

    if (!title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      });
      return;
    }

    if (!points || points <= 0) {
      wx.showToast({
        title: '积分必须大于0',
        icon: 'none'
      });
      return;
    }

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    wx.request({
      url: `${backendBase}/api/tasks`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        applicant_openid: openid,
        title: title.trim(),
        description: description.trim(),
        points: points
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });
          // 返回任务列表并刷新
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.error || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('提交任务失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  }
});
