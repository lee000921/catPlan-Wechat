// pages/shop/list/list.js
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

  // 检查用户类型
  checkUserType() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        isTypeA: userInfo.userType === 'A'
      });
    } else {
      // 从后端获取用户信息
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
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
      }
    });
  },

  // 加载商品列表
  loadProductList(isLoadMore = false) {
    this.setData({ loading: true });

    const { page, pageSize } = this.data;
    
    wx.request({
      url: getApp().globalData.baseUrl + '/shop/products',
      method: 'GET',
      data: {
        page: isLoadMore ? page + 1 : 1,
        pageSize
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const { list, total, page: currentPage, pageSize: size } = res.data.data;
          
          if (isLoadMore) {
            this.setData({
              productList: [...this.data.productList, ...list],
              page: currentPage,
              loading: false,
              hasMore: this.data.productList.length + list.length < total
            });
          } else {
            this.setData({
              productList: list,
              page: currentPage,
              loading: false,
              hasMore: list.length < total
            });
          }
          
          // 停止下拉刷新
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
