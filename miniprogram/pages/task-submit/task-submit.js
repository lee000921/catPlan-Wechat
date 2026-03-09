const app = getApp();

Page({
  data: {
    taskType: 'single', // 'single' 或 'periodic'
    formData: {
      title: '',
      description: '',
      points: '',
      // 周期任务配置
      periodic_type: 'daily',
      every_days: '1',
      weekdays: [1],
      day_of_month: '1',
      start_date: '',
      end_date: ''
    },
    submitting: false
  },

  onLoad(options) {
    // 设置默认开始日期为今天
    const today = new Date().toISOString().slice(0, 10);
    this.setData({ 'formData.start_date': today });
  },

  // 选择任务类型
  selectTaskType(e) {
    this.setData({ taskType: e.currentTarget.dataset.type });
  },

  // 输入处理
  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onPointsInput(e) {
    this.setData({ 'formData.points': e.detail.value });
  },

  // 周期任务配置
  selectPeriodicType(e) {
    this.setData({ 'formData.periodic_type': e.currentTarget.dataset.type });
  },

  onEveryDaysInput(e) {
    this.setData({ 'formData.every_days': e.detail.value || '1' });
  },

  toggleWeekday(e) {
    const day = e.currentTarget.dataset.day;
    let weekdays = this.data.formData.weekdays;
    
    if (weekdays.includes(day)) {
      weekdays = weekdays.filter(d => d !== day);
    } else {
      weekdays.push(day);
    }
    
    this.setData({ 'formData.weekdays': weekdays.sort() });
  },

  onDayOfMonthInput(e) {
    this.setData({ 'formData.day_of_month': e.detail.value || '1' });
  },

  onStartDateChange(e) {
    this.setData({ 'formData.start_date': e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ 'formData.end_date': e.detail.value });
  },

  // 提交任务
  onSubmit() {
    const { taskType, formData } = this.data;
    const openid = wx.getStorageSync('catplan_user_openid');

    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!formData.title || !formData.points) {
      wx.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    if (taskType === 'periodic') {
      // 创建周期任务
      this.createPeriodicTask(openid);
    } else {
      // 创建单次任务
      this.createSingleTask(openid);
    }
  },

  // 创建单次任务
  createSingleTask(openid) {
    const { formData } = this.data;

    wx.request({
      url: app.globalData.baseUrl + '/api/tasks',
      method: 'POST',
      data: {
        applicant_openid: openid,
        title: formData.title,
        description: formData.description || '',
        points: parseInt(formData.points)
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({ title: '任务已提交审核', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ title: res.data.error || '提交失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  },

  // 创建周期任务
  createPeriodicTask(openid) {
    const { formData } = this.data;

    // 构建周期配置
    let periodicConfig = {};
    if (formData.periodic_type === 'daily') {
      periodicConfig.every_days = parseInt(formData.every_days) || 1;
    } else if (formData.periodic_type === 'weekly') {
      periodicConfig.weekdays = formData.weekdays;
    } else if (formData.periodic_type === 'monthly') {
      periodicConfig.day_of_month = parseInt(formData.day_of_month) || 1;
    }

    wx.request({
      url: app.globalData.baseUrl + '/api/periodic-tasks/periodic',
      method: 'POST',
      data: {
        applicant_openid: openid,
        title: formData.title,
        description: formData.description || '',
        points: parseInt(formData.points),
        periodic_type: formData.periodic_type,
        periodic_config: periodicConfig,
        start_date: formData.start_date,
        end_date: formData.end_date || null
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({ title: '周期任务已创建', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ title: res.data.error || '提交失败', icon: 'none' });
          console.error('周期任务创建失败:', res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'none' });
        console.error('周期任务创建失败:', err);
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  }
});
