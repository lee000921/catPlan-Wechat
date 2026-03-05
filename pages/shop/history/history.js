// pages/shop/history/history.js
const API_BASE = 'http://39.104.84.63:3000/api/shop';

Page({
  data: {
    records: [],
    loading: false,
    error: null
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 每次显示时刷新
    this.loadHistory();
  },

  async loadHistory() {
    this.setData({ loading: true, error: null });
    
    try {
      const res = await wx.request({
        url: `${API_BASE}/exchange-history`,
        method: 'GET',
        timeout: 5000
      });
      
      if (res.statusCode === 200 && res.data) {
        this.setData({ records: res.data });
      } else {
        this.setData({ error: '加载失败，请稍后重试' });
      }
    } catch (err) {
      console.error('加载历史记录失败:', err);
      this.setData({ error: '网络错误，请检查连接' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.loadHistory().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
