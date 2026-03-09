// pages/shop/detail/detail.js
const app = getApp();

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

  // 检查用户类型与积分（基于登录缓存与 /api/user/profile）
  checkUserType() {
    const cachedUser = wx.getStorageSync('catplan_user') || null;
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const openid = wx.getStorageSync('catplan_user_openid') || '';

    this.setData({
      userInfo: cachedUser,
      isTypeA: typeof userType === 'string' && userType.indexOf('A') !== -1
    });

    if (openid) {
      const token = wx.getStorageSync('catplan_token') || '';
      wx.request({
        url: app.globalData.backendBase + '/api/user/profile',
        method: 'GET',
        data: { openid },
        header: token ? { Authorization: 'Bearer ' + token } : {},
        success: (res) => {
          if (res.statusCode === 200 && res.data && typeof res.data.points !== 'undefined') {
            this.setData({ points: res.data.points });
          }
        }
      });
    }
  },

  // 加载商品详情
  loadProductDetail(id) {
    wx.request({
      url: app.globalData.backendBase + '/api/shop/products/' + id,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ok) {
          this.setData({
            product: res.data.item,
            loading: false
          });
          
          // 设置页面标题
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
