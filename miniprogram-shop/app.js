// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('积分商城小程序启动');
    
    // 从本地缓存获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
    
    // 从本地缓存获取积分余额
    const points = wx.getStorageSync('points');
    if (points) {
      this.globalData.points = points;
    }
  },

  globalData: {
    userInfo: null,
    points: 0,
    baseUrl: 'https://your-api-domain.com/api'
  }
})
