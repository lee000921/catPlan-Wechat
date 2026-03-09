const app = getApp();

Page({
  data: {
    backendBase: '',
    tasks: [],
    loading: false,
    userInfo: null,
    openid: '',
    userType: 'A', // A: 申请者, B: 审批者, AB: 双重角色
    fabExpanded: false,
    showMyApprovals: false // 是否显示我审批过的任务（仅审批者）
  },

  onLoad() {
    // 从全局配置获取后端地址
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }
    
    // 从缓存获取用户信息
    const userInfo = wx.getStorageSync('catplan_user');
    const openid = wx.getStorageSync('catplan_user_openid');
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    if (userInfo && openid) {
      this.setData({ userInfo, openid, userType });
    }
    
    // 加载任务列表
    this.loadTasks();
  },

  onShow() {
    // 页面显示时刷新用户类型
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    this.setData({ userType: userType });
    
    // 页面显示时刷新数据
    this.loadTasks();
  },

  // 加载任务列表
  loadTasks() {
    if (!this.data.backendBase) {
      console.error('后端地址未配置');
      return;
    }

    this.setData({ loading: true });

    const requestData = {
      openid: this.data.openid,
      user_type: this.data.userType
    };
    
    // 如果是审批者且切换到"我的审批"视图，添加参数
    if ((this.data.userType === 'B' || (this.data.userType && this.data.userType.includes('B'))) && this.data.showMyApprovals) {
      requestData.my_approvals = 'true';
    }

    wx.request({
      url: `${this.data.backendBase}/api/tasks`,
      method: 'GET',
      data: requestData,
      success: (res) => {
        if (res.data && res.data.ok) {
          const tasks = res.data.tasks || [];
          // 计算统计数据
          const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            approved: tasks.filter(t => t.status === 'approved').length,
            completed: tasks.filter(t => t.status === 'completed').length
          };
          this.setData({ 
            tasks: tasks,
            stats: stats
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载任务失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTasks();
    wx.stopPullDownRefresh();
  },

  // 点击任务项
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    });
  },

  // 点击提交新任务按钮
  onSubmitTask() {
    console.log('onSubmitTask 被调用');
    wx.showToast({
      title: '正在跳转...',
      icon: 'loading',
      duration: 500
    });
    
    wx.navigateTo({
      url: '/pages/task-submit/task-submit',
      success: () => {
        console.log('跳转成功');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 切换用户类型（测试用）
  onToggleUserType() {
    const newType = this.data.userType === 'A' ? 'B' : 'A';
    this.setData({ userType: newType });
    
    // 保存用户类型到本地存储
    wx.setStorageSync('catplan_user_type', newType);
    
    wx.showToast({
      title: `已切换为${newType === 'A' ? '申请者' : '审批者'}`,
      icon: 'none'
    });
    this.loadTasks();
  },

  // 切换视图（待审批 / 我的审批）
  onSwitchView(e) {
    const view = e.currentTarget.dataset.view;
    const showMyApprovals = view === 'my';
    
    this.setData({ 
      showMyApprovals: showMyApprovals 
    }, () => {
      this.loadTasks();
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('catplan_user');
          wx.removeStorageSync('catplan_user_openid');
          wx.removeStorageSync('catplan_user_type');
          wx.removeStorageSync('catplan_token');
          
          // 显示提示
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500,
            complete: () => {
              // 跳转到登录页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/login/login'
                });
              }, 1500);
            }
          });
        }
      }
    });
  },

  // 创建周期任务
  onCreatePeriodicTask() {
    wx.navigateTo({
      url: '/pages/periodic-task-create/periodic-task-create'
    });
  },

  // 创建任务单
  onCreateTaskSheet() {
    wx.navigateTo({
      url: '/pages/task-sheet-create/task-sheet-create'
    });
  },

  // 切换 FAB 展开状态
  onFabToggle() {
    this.setData({ fabExpanded: !this.data.fabExpanded });
  },
});
