// pages/shop/list/detail/detail.js
Page({
  data: {
    product: null,
    loading: true,
    isTypeA: false,
    points: 0,
    userInfo: null
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ productId: id });
      this.loadProductDetail(id);
      this.checkUserType();
    } else {
      wx.showToast({
        title: '商品 ID 缺失',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 检查用户类型
  checkUserType() {
    const userInfo = wx.getStorageSync('userInfo');
    const points = wx.getStorageSync('points');
    
    if (userInfo) {
      this.setData({
        userInfo,
        isTypeA: userInfo.userType === 'A',
        points: points || 0
      });
    } else {
      this.fetchUserInfo();
    }
  },

  fetchUserInfo() {
    wx.request({
      url: getApp().globalData.baseUrl + '/user/info',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const userInfo = res.data.data;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({
            userInfo,
            isTypeA: userInfo.userType === 'A'
          });
        }
      }
    });

    // 获取积分余额
    wx.request({
      url: getApp().globalData.baseUrl + '/user/points',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const points = res.data.data.points;
          wx.setStorageSync('points', points);
          this.setData({ points });
        }
      }
    });
  },

  // 加载商品详情
  loadProductDetail(id) {
    wx.request({
      url: getApp().globalData.backendBase + '/api/shop/products/' + id,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ok) {
          this.setData({
            product: res.data.item,
            loading: false
          });
          
          if (res.data.item && res.data.item.name) {
            wx.setNavigationBarTitle({
              title: res.data.item.name
            });
          }
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载商品详情失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 立即兑换
  exchangeNow() {
    if (!this.data.isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '仅 A 类用户（申请者）可以进行兑换',
        showCancel: false
      });
      return;
    }

    const { product, points } = this.data;
    
    // 检查积分是否足够
    if (points < product.points) {
      wx.showModal({
        title: '积分不足',
        content: `当前积分：${points}，需要：${product.points}`,
        showCancel: false
      });
      return;
    }

    // 检查库存
    if (product.stock <= 0) {
      wx.showModal({
        title: '库存不足',
        content: '该商品已兑完',
        showCancel: false
      });
      return;
    }

    // 跳转到兑换确认页
    wx.navigateTo({
      url: `/pages/shop/exchange/exchange?id=${product.id}`
    });
  },

  // 查看兑换历史
  goToHistory() {
    wx.navigateTo({
      url: '/pages/shop/history/history'
    });
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/shop/list/list'
    });
  }
})
