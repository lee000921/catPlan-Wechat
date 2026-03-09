const app = getApp();

Page({
  data: {
    formData: {
      title: '',
      description: '',
      points: '',
      periodic_type: 'daily',
      every_days: '1',
      weekdays: [1],
      day_of_month: '1',
      start_date: '',
      end_date: ''
    },
    submitting: false
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
  },

  onDescInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onPointsInput(e) {
    this.setData({ 'formData.points': e.detail.value });
  },

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

  onSubmit() {
    const { formData } = this.data;
    
    if (!formData.title || !formData.points) {
      wx.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    const periodicConfig = {};
    if (formData.periodic_type === 'daily') {
      periodicConfig.every_days = parseInt(formData.every_days) || 1;
    } else if (formData.periodic_type === 'weekly') {
      periodicConfig.weekdays = formData.weekdays;
    } else if (formData.periodic_type === 'monthly') {
      periodicConfig.day_of_month = parseInt(formData.day_of_month) || 1;
    }

    this.setData({ submitting: true });

    wx.request({
      // 使用新周期任务模板 API
      url: app.globalData.backendBase + '/api/periodic-tasks',
      method: 'POST',
      data: {
        title: formData.title,
        description: formData.description,
        points: parseInt(formData.points),
        periodic_type: formData.periodic_type,
        periodic_config: periodicConfig,
        start_date: formData.start_date || new Date().toISOString().slice(0, 10),
        end_date: formData.end_date
      },
      success: (res) => {
        if (res.data.ok) {
          wx.showToast({ title: '创建成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.data.error || '创建失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  }
});
