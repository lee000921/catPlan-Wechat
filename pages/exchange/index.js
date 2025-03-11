// pages/exchange/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    currentTab: 0,
    tabs: ['全部', '实物奖品', '虚拟奖品', '优惠券'],
    exchangeItems: [],
    allItems: [
      // {
      //   id: 'item_1',
      //   title: '盒马有机苹果汁',
      //   image: '/assets/images/exchange/keychain.png',
      //   points: 6,
      //   originalPrice: '¥29.9',
      //   type: '实物奖品',
      //   stock: 99,
      //   sold: 99,
      //   description: '香甜可口的有机苹果汁，无添加糖分，营养健康。',
      //   exchangeLimit: 99,
      //   deliveryInfo: '兑换后需填写收货地址，预计7-15天内发货。'
      // },
      // {
      //   id: 'item_2',
      //   title: '猫咪主题保温杯',
      //   image: '/assets/images/exchange/cup.png',
      //   points: 500,
      //   originalPrice: '¥59',
      //   type: '实物奖品',
      //   stock: 50,
      //   sold: 75,
      //   description: '304不锈钢内胆，12小时保温，可爱猫咪图案，容量500ml。',
      //   exchangeLimit: 1,
      //   deliveryInfo: '兑换后需填写收货地址，预计7-15天内发货。'
      // },
      // {
      //   id: 'item_3',
      //   title: '1个月会员卡',
      //   image: '/assets/images/exchange/membership.png',
      //   points: 300,
      //   originalPrice: '¥30',
      //   type: '虚拟奖品',
      //   stock: 999,
      //   sold: 500,
      //   description: '1个月会员特权，享受专属功能和服务。',
      //   exchangeLimit: 12,
      //   deliveryInfo: '兑换后自动激活，无需手动操作。'
      // },
      // {
      //   id: 'item_4',
      //   title: '¥5元优惠券',
      //   image: '/assets/images/exchange/coupon.png',
      //   points: 50,
      //   originalPrice: '¥5',
      //   type: '优惠券',
      //   stock: 999,
      //   sold: 2000,
      //   description: '满30元可用，有效期30天。',
      //   exchangeLimit: 10,
      //   deliveryInfo: '兑换后自动发放至账户，可在"我的-优惠券"中查看。'
      // },
      // {
      //   id: 'item_5',
      //   title: '¥10元优惠券',
      //   image: '/assets/images/exchange/coupon.png',
      //   points: 100,
      //   originalPrice: '¥10',
      //   type: '优惠券',
      //   stock: 999,
      //   sold: 1500,
      //   description: '满60元可用，有效期30天。',
      //   exchangeLimit: 5,
      //   deliveryInfo: '兑换后自动发放至账户，可在"我的-优惠券"中查看。'
      // },
      // {
      //   id: 'item_6',
      //   title: '猫咪抱枕',
      //   image: '/assets/images/exchange/pillow.png',
      //   points: 800,
      //   originalPrice: '¥89',
      //   type: '实物奖品',
      //   stock: 30,
      //   sold: 45,
      //   description: '超柔软猫咪造型抱枕，材质舒适，尺寸40*40cm。',
      //   exchangeLimit: 1,
      //   deliveryInfo: '兑换后需填写收货地址，预计7-15天内发货。'
      // },
      // {
      //   id: 'item_7',
      //   title: '头像框30天',
      //   image: '/assets/images/exchange/avatar_frame.png',
      //   points: 100,
      //   originalPrice: '¥10',
      //   type: '虚拟奖品',
      //   stock: 999,
      //   sold: 300,
      //   description: '专属猫咪头像框，使用期限30天。',
      //   exchangeLimit: 12,
      //   deliveryInfo: '兑换后自动激活，可在个人主页查看。'
      // },
      // {
      //   id: 'item_8',
      //   title: '¥20元优惠券',
      //   image: '/assets/images/exchange/coupon.png',
      //   points: 180,
      //   originalPrice: '¥20',
      //   type: '优惠券',
      //   stock: 500,
      //   sold: 800,
      //   description: '满100元可用，有效期30天。',
      //   exchangeLimit: 3,
      //   deliveryInfo: '兑换后自动发放至账户，可在"我的-优惠券"中查看。'
      // }
    ]
  },

  onLoad: function() {
    this.checkLoginStatus();
    this.filterItems(0);
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
        console.log('[云函数] [getExchangeItems] 调用成功', res);
        const allItems = res.result.data;
        this.setData({
          allItems: allItems
        });
        this.filterItems(this.data.currentTab);
      },
      fail: err => {
        console.error('[云函数] [getExchangeItems] 调用失败', err);
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

  // 切换标签
  handleTabChange: function(e) {
    const index = e.detail.value;
    this.setData({
      currentTab: index
    });
    this.filterItems(index);
  },

  // 根据标签筛选商品
  filterItems: function(tabIndex) {
    let filteredItems = [];
    
    if (tabIndex === 0) {
      // 全部商品
      filteredItems = this.data.allItems;
    } else {
      // 根据类型筛选
      const tabType = this.data.tabs[tabIndex];
      filteredItems = this.data.allItems.filter(item => item.type === tabType);
    }
    
    this.setData({
      exchangeItems: filteredItems
    });
  },

  // 点击商品
  handleItemClick: function(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.allItems.find(item => item.id === id);
    
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
    const item = this.data.allItems.find(item => item.id === id);
    
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
    
    // 模拟兑换请求
    setTimeout(() => {
      wx.hideLoading();
      
      // 更新用户碎片
      const userInfo = this.data.userInfo;
      userInfo.points -= item.points;
      
      // 更新本地存储
      wx.setStorageSync('userInfo', userInfo);
      
      // 更新界面
      this.setData({
        userInfo: userInfo
      });
      
      // 根据商品类型处理后续流程
      if (item.type === '实物奖品') {
        wx.showModal({
          title: '兑换成功',
          content: '请前往"我的-收货地址"完善收货信息',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '/pages/exchange/history'
            });
          }
        });
      } else {
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
      }
    }, 1000);
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