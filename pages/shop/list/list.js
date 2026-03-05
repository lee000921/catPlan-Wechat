// pages/shop/list/list.js
const API_BASE = 'http://39.104.84.63:3000/api/shop';

Page({
  data: {
    items: [],
    loading: false,
    error: null
  },

  onLoad() {
    this.loadItems();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadItems();
  },

  async loadItems() {
    this.setData({ loading: true, error: null });
    
    try {
      const res = await wx.request({
        url: `${API_BASE}/items`,
        method: 'GET',
        timeout: 5000
      });
      
      if (res.statusCode === 200 && res.data) {
        this.setData({ items: res.data });
      } else {
        this.setData({ error: '加载失败，请稍后重试' });
      }
    } catch (err) {
      console.error('加载物品列表失败:', err);
      this.setData({ error: '网络错误，请检查连接' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onExchange(e) {
    const { id, name, price } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换"${name}"吗？（${price}积分）`,
      success: async (modalRes) => {
        if (modalRes.confirm) {
          await this.doExchange(id, name, price);
        }
      }
    });
  },

  async doExchange(itemId, itemName, price) {
    wx.showLoading({ title: '兑换中...' });
    
    try {
      const res = await wx.request({
        url: `${API_BASE}/exchange`,
        method: 'POST',
        data: { itemId },
        timeout: 5000
      });
      
      wx.hideLoading();
      
      if (res.statusCode === 200 && res.data) {
        wx.showToast({
          title: '兑换成功',
          icon: 'success'
        });
        // 刷新列表
        this.loadItems();
      } else {
        wx.showToast({
          title: res.data?.message || '兑换失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('兑换失败:', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/shop/history/history'
    });
  }
});
