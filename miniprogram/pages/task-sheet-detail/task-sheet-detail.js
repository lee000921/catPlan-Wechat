const app = getApp();

Page({
  data: {
    backendBase: '',
    openid: '',
    sheetId: null,
    
    // 任务单数据
    sheet: null,
    tasks: [],
    progress: null,
    
    // 状态
    loading: true,
    error: null
  },

  onLoad(options) {
    // 从全局配置获取后端地址
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }
    
    // 从缓存获取用户信息
    const openid = wx.getStorageSync('catplan_user_openid');
    if (openid) {
      this.setData({ openid });
    }
    
    // 获取任务单 ID
    if (options.id) {
      this.setData({ sheetId: options.id });
      this.loadSheetDetail();
    } else {
      this.setData({ 
        error: '缺少任务单ID',
        loading: false 
      });
    }
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.sheetId) {
      this.loadSheetDetail();
    }
  },

  // 加载任务单详情
  loadSheetDetail() {
    if (!this.data.backendBase || !this.data.sheetId) {
      return;
    }

    this.setData({ loading: true, error: null });

    wx.request({
      url: `${this.data.backendBase}/api/task-sheets/${this.data.sheetId}`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.ok) {
          this.setData({
            sheet: res.data.sheet,
            tasks: res.data.tasks || [],
            progress: res.data.progress,
            loading: false
          });
          
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: res.data.sheet.title || '任务单详情'
          });
        } else {
          this.setData({
            error: (res.data && res.data.error) || '加载失败' || '加载失败',
            loading: false
          });
        }
      },
      fail: (err) => {
        console.error('加载任务单详情失败', err);
        this.setData({
          error: '网络错误',
          loading: false
        });
      }
    });
  },

  // 同步进度
  onSyncProgress() {
    wx.showLoading({ title: '同步中...' });
    
    wx.request({
      url: `${this.data.backendBase}/api/task-sheets/${this.data.sheetId}/sync-progress`,
      method: 'POST',
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.ok) {
          this.setData({
            sheet: res.data.sheet,
            progress: res.data.progress
          });
          wx.showToast({
            title: '已同步',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '同步失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到任务详情
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    });
  },

  // 删除任务单
  onDeleteSheet() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个任务单吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          wx.request({
            url: `${this.data.backendBase}/api/task-sheets/${this.data.sheetId}`,
            method: 'DELETE',
            success: (res) => {
              wx.hideLoading();
              if (res.data && res.data.ok) {
                wx.showToast({
                  title: '已删除',
                  icon: 'success'
                });
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  },

  // 获取状态文字
  getStatusText(status) {
    const statusMap = {
      'pending': '待开始',
      'in_progress': '进行中',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  },

  // 获取状态样式类
  getStatusClass(status) {
    const classMap = {
      'pending': 'status-pending',
      'in_progress': 'status-progress',
      'completed': 'status-completed'
    };
    return classMap[status] || '';
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadSheetDetail();
    wx.stopPullDownRefresh();
  }
});