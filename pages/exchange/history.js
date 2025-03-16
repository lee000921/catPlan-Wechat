// pages/exchange/history.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    exchangeRecords: []
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    if (this.data.isLogin) {
      this.fetchExchangeRecords();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
      this.fetchExchangeRecords();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 获取兑换记录
  fetchExchangeRecords: function() {
    this.setData({ loading: true });
    
    wx.cloud.callFunction({
      name: 'getExchangeRecords',
      success: res => {
        if (res.result && res.result.success) {
          const records = res.result.data || [];
          this.setData({
            exchangeRecords: records,
            loading: false
          });
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '获取兑换记录失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('获取兑换记录失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取兑换记录失败',
          icon: 'none'
        });
      }
    });
  },

  // 格式化时间
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  }
});