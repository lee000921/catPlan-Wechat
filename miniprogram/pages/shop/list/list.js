// pages/shop/list/list.js
const app = getApp();

Page({
  data: {
    productList: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10,
    userInfo: null,
    isTypeA: false // 是否为 A 类用户（申请者）
  },

  onLoad() {
    this.checkUserType();
    this.loadProductList();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadProductList();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProductList(true);
    }
  },

  // 检查用户类型（基于登录时缓存的信息）
  checkUserType() {
    const cachedUser = wx.getStorageSync('catplan_user') || null;
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    this.setData({
      userInfo: cachedUser,
      isTypeA: typeof userType === 'string' && userType.indexOf('A') !== -1
    });
  },

  // 加载商品列表
  loadProductList(isLoadMore = false) {
    this.setData({ loading: true });

    wx.request({
      url: app.globalData.backendBase + '/api/shop/products',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ok) {
          const items = res.data.items || [];
          // 当前后端未提供分页，这里一次性加载全部商品
          this.setData({
            productList: items,
            page: 1,
            loading: false,
            hasMore: false
          });
          wx.stopPullDownRefresh();
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载商品列表失败', err);
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 点击商品查看详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/shop/detail/detail?id=${id}`
    });
  },

  // 立即兑换
  exchangeNow(e) {
    if (!this.data.isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '仅 A 类用户（申请者）可以进行兑换',
        showCancel: false
      });
      return;
    }

    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/shop/exchange/exchange?id=${id}`
    });
  }
})
