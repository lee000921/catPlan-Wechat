// pages/shop/history/history.js
const app = getApp();

Page({
  data: {
    exchangeList: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10,
    total: 0,
    userInfo: null
  },

  onLoad() {
    this.loadExchangeHistory();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadExchangeHistory();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadExchangeHistory(true);
    }
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.exchangeList.length > 0) {
      this.setData({ page: 1, hasMore: true, exchangeList: [] });
      this.loadExchangeHistory();
    }
  },

  // 加载兑换历史
  loadExchangeHistory(isLoadMore = false) {
    this.setData({ loading: true });

    const { page, pageSize } = this.data;
    const currentPage = isLoadMore ? page + 1 : 1;
    const offset = (currentPage - 1) * pageSize;

    const token = wx.getStorageSync('catplan_token') || wx.getStorageSync('token') || '';

    wx.request({
      url: app.globalData.backendBase + '/api/shop/exchange-history',
      method: 'GET',
      data: {
        limit: pageSize,
        offset
      },
      header: token ? {
        'Authorization': 'Bearer ' + token
      } : {},
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ok) {
          const list = res.data.exchanges || [];
          const total = typeof res.data.total === 'number' ? res.data.total : list.length;
          
          if (isLoadMore) {
            this.setData({
              exchangeList: [...this.data.exchangeList, ...list],
              page: currentPage,
              loading: false,
              hasMore: this.data.exchangeList.length + list.length < total,
              total
            });
          } else {
            this.setData({
              exchangeList: list,
              page: currentPage,
              loading: false,
              hasMore: list.length < total,
              total
            });
          }
          
          wx.stopPullDownRefresh();
        } else {
          this.setData({ loading: false });
          wx.stopPullDownRefresh();
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载兑换历史失败', err);
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 查看兑换详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/shop/detail/detail?id=${id}`
    });
  },

  // 联系商家
  contactSeller() {
    wx.showModal({
      title: '联系客服',
      content: '请联系管理员领取您的兑换物品',
      confirmText: '拨打电话',
      confirmColor: '#4A90D9',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '1234567890' // 替换为实际客服电话
          });
        }
      }
    });
  },

  // 返回列表
  goBack() {
    wx.navigateBack();
  }
})
