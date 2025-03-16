// pages/exchange/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    exchangeItems: []
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    if (this.data.isLogin) {
      this.refreshUserInfo();
      this.fetchGoodsData();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true,
        loading: false
      });
      this.fetchGoodsData();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 获取商品数据
  fetchGoodsData: function() {
    wx.cloud.callFunction({
      name: 'getGoods',
      data: {},
      success: res => {
        console.log('[云函数] [getGoods] 调用成功', res);
        if (res.result && res.result.success) {
          const items = res.result.data;
          this.setData({
            exchangeItems: items
          });
        } else {
          wx.showToast({
            title: '获取商品数据失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('[云函数] [getGoods] 调用失败', err);
        wx.showToast({
          title: '获取商品数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 刷新用户信息
  refreshUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },

  // 点击商品
  handleItemClick: function(e) {
    const { id } = e.currentTarget.dataset;
    console.log('handleItemClick', id);
    const item = this.data.exchangeItems.find(item => item._id === id);
    
    if (!item) return;
    
    wx.navigateTo({
      url: `/pages/exchange/detail?id=${id}`
    });
  },

  // 兑换商品
  handleExchange: function(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }

    const { id } = e.currentTarget.dataset;
    const item = this.data.exchangeItems.find(item => item._id === id);
    
    if (!item) return;
    
    // 检查库存
    if (item.stock <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }
    
    // 检查碎片是否足够
    if (this.data.userInfo.points < item.points) {
      wx.showToast({
        title: '碎片不足',
        icon: 'none'
      });
      return;
    }
    
    // 确认兑换
    wx.showModal({
      title: '确认兑换',
      content: `确定使用${item.points}碎片兑换"${item.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.processExchange(item);
        }
      }
    });
  },

  // 处理兑换逻辑
  processExchange: function(item) {
    wx.showLoading({
      title: '兑换中...',
    });
    
    wx.cloud.callFunction({
      name: 'exchangeGoods',
      data: {
        goodId: item._id
      },
      success: res => {
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 更新用户碎片
          if (res.result.data && res.result.data.userInfo) {
            const userInfo = res.result.data.userInfo;
            
            // 更新本地存储和全局数据
            wx.setStorageSync('userInfo', userInfo);
            app.globalData.userInfo = userInfo;
            
            // 更新界面
            this.setData({
              userInfo: userInfo
            });
          } else {
            // 如果没有返回更新后的用户信息，手动更新
            const userInfo = this.data.userInfo;
            userInfo.points -= item.points;
            
            // 更新本地存储
            wx.setStorageSync('userInfo', userInfo);
            app.globalData.userInfo = userInfo;
            
            // 更新界面
            this.setData({
              userInfo: userInfo
            });
          }
          
          // 刷新商品列表
          this.fetchGoodsData();
          
          // 兑换成功提示
          wx.showToast({
            title: '兑换成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/exchange/history'
                });
              }, 2000);
            }
          });
        } else {
          wx.showToast({
            title: res.result.message || '兑换失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('兑换失败', err);
        wx.showToast({
          title: '兑换失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 查看兑换记录
  viewExchangeHistory: function() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/exchange/history'
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  }
});