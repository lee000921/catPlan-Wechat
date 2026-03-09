// pages/shop/exchange/exchange.js
const app = getApp();

Page({
  data: {
    product: null,
    loading: true,
    points: 0,
    userInfo: null,
    isTypeA: false,
    exchangeCount: 1,
    submitting: false,
    canExchange: false
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

  // 检查用户类型和权限
  checkUserType() {
    const cachedUser = wx.getStorageSync('catplan_user') || null;
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const openid = wx.getStorageSync('catplan_user_openid') || '';

    const isTypeA = typeof userType === 'string' && userType.indexOf('A') !== -1;

    this.setData({
      userInfo: cachedUser,
      isTypeA
    });

    if (!isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '仅 A 类用户（申请者）可以进行兑换',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }

    if (openid) {
      const token = wx.getStorageSync('catplan_token') || '';
      wx.request({
        url: app.globalData.backendBase + '/api/user/profile',
        method: 'GET',
        data: { openid },
        header: token ? { Authorization: 'Bearer ' + token } : {},
        success: (res) => {
          if (res.statusCode === 200 && res.data && typeof res.data.points !== 'undefined') {
            wx.setStorageSync('points', res.data.points);
            this.setData({ points: res.data.points });
            this.checkCanExchange();
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
          const product = res.data.item;
          this.setData({ 
            product,
            loading: false
          });
          this.checkCanExchange();
          
          wx.setNavigationBarTitle({
            title: '确认兑换'
          });
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

  // 检查是否可以兑换
  checkCanExchange() {
    const { product, points, exchangeCount, isTypeA } = this.data;
    
    if (product && isTypeA) {
      const totalPoints = product.points * exchangeCount;
      const canExchange = points >= totalPoints && 
                         product.stock >= exchangeCount &&
                         (!product.limitPerUser || exchangeCount <= product.limitPerUser);
      this.setData({ canExchange });
    }
  },

  // 修改兑换数量
  changeCount(e) {
    const { type } = e.currentTarget.dataset;
    const { product, exchangeCount, points } = this.data;
    
    let newCount = exchangeCount;
    
    if (type === 'add') {
      newCount = exchangeCount + 1;
      // 检查库存限制
      if (product.stock && newCount > product.stock) {
        wx.showToast({
          title: '超过库存限制',
          icon: 'none'
        });
        return;
      }
      // 检查每人限兑
      if (product.limitPerUser && newCount > product.limitPerUser) {
        wx.showToast({
          title: `每人限兑${product.limitPerUser}件`,
          icon: 'none'
        });
        return;
      }
    } else if (type === 'minus') {
      newCount = Math.max(1, exchangeCount - 1);
    }
    
    this.setData({ exchangeCount: newCount });
    this.checkCanExchange();
  },

  // 手动输入数量
  inputCount(e) {
    let value = parseInt(e.detail.value) || 1;
    const { product } = this.data;
    
    value = Math.max(1, value);
    
    if (product.limitPerUser) {
      value = Math.min(value, product.limitPerUser);
    }
    
    this.setData({ exchangeCount: value });
    this.checkCanExchange();
  },

  // 确认兑换
  confirmExchange() {
    if (this.data.submitting) {
      return;
    }

    const { product, exchangeCount, points } = this.data;
    const totalPoints = product.points * exchangeCount;

    // 再次验证
    if (points < totalPoints) {
      wx.showModal({
        title: '积分不足',
        content: `需要${totalPoints}积分，当前${points}积分`,
        showCancel: false
      });
      return;
    }

    if (product.stock < exchangeCount) {
      wx.showModal({
        title: '库存不足',
        content: '库存不足以完成此次兑换',
        showCancel: false
      });
      return;
    }

    // 显示确认对话框
    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换"${product.name}" x${exchangeCount}吗？\n将扣除${totalPoints}积分`,
      confirmText: '确认兑换',
      confirmColor: '#4A90D9',
      success: (res) => {
        if (res.confirm) {
          this.submitExchange();
        }
      }
    });
  },

  // 提交兑换请求
  submitExchange() {
    this.setData({ submitting: true });

    const { product } = this.data;

    // 后端当前一次请求只支持兑换 1 件物品
    wx.request({
      url: app.globalData.backendBase + '/api/shop/exchange',
      method: 'POST',
      data: {
        item_id: product.id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + (wx.getStorageSync('catplan_token') || wx.getStorageSync('token') || '')
      },
      success: (res) => {
        this.setData({ submitting: false });
        
        if (res.statusCode === 200 && res.data && res.data.ok) {
          // 兑换成功
          wx.showModal({
            title: '兑换成功',
            content: `已成功兑换"${product.name}"\n扣除${res.data.points_spent || product.points}积分`,
            showCancel: false,
            confirmText: '查看记录',
            success: () => {
              // 更新本地积分缓存
              const newPoints = typeof res.data.remaining_points === 'number'
                ? res.data.remaining_points
                : this.data.points - (res.data.points_spent || product.points);
              wx.setStorageSync('points', newPoints);
              
              // 跳转到兑换历史页
              wx.redirectTo({
                url: '/pages/shop/history/history'
              });
            }
          });
        } else {
          wx.showModal({
            title: '兑换失败',
            content: res.data.message || '请稍后重试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('兑换请求失败', err);
        this.setData({ submitting: false });
        wx.showModal({
          title: '兑换失败',
          content: '网络错误，请稍后重试',
          showCancel: false
        });
      }
    });
  }
})
