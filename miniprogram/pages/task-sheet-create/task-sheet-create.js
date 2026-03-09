const app = getApp();

Page({
  data: {
    formData: {
      title: '',
      date: new Date().toISOString().slice(0, 10)
    },
    taskMode: 'select',
    todayTasks: [], // 当天已有的任务（单次 + 周期）
    availableTasks: [],
    selectedTasks: [],
    newTasks: [],
    newTask: {
      title: '',
      description: '',
      points: ''
    },
    submitting: false
  },

  onLoad() {
    this.loadTodayTasks();
  },

  // 加载当天已有任务
  loadTodayTasks() {
    const openid = wx.getStorageSync('catplan_user_openid');
    const date = this.data.formData.date;
    
    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.request({
      url: app.globalData.backendBase + '/api/tasks?date=' + date + '&applicant_openid=' + openid,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.ok) {
          this.setData({
            todayTasks: res.data.tasks || []
          });
        }
      }
    });
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
  },

  onDateChange(e) {
    this.setData({ 
      'formData.date': e.detail.value,
      'formData.title': e.detail.value + ' 任务单'
    });
    this.loadTodayTasks(); // 重新加载当天的任务
  },

  setTaskMode(e) {
    this.setData({ taskMode: e.currentTarget.dataset.mode });
  },

  toggleTask(e) {
    const taskId = e.currentTarget.dataset.id;
    let selected = this.data.selectedTasks;
    
    if (selected.includes(taskId)) {
      selected = selected.filter(id => id !== taskId);
    } else {
      selected.push(taskId);
    }
    
    this.setData({ selectedTasks: selected });
  },

  onNewTaskTitleInput(e) {
    this.setData({ 'newTask.title': e.detail.value });
  },

  onNewTaskDescInput(e) {
    this.setData({ 'newTask.description': e.detail.value });
  },

  onNewTaskPointsInput(e) {
    this.setData({ 'newTask.points': e.detail.value });
  },

  addNewTask() {
    const { newTask } = this.data;
    
    if (!newTask.title || !newTask.points) {
      wx.showToast({ title: '请填写任务标题和积分', icon: 'none' });
      return;
    }

    const newTasks = [...this.data.newTasks, { ...newTask, id: 'new_' + Date.now() }];
    
    this.setData({
      newTasks,
      'newTask': { title: '', description: '', points: '' }
    });

    wx.showToast({ title: '已添加', icon: 'success' });
  },

  goToCreateTask() {
    wx.navigateTo({
      url: '/pages/task-submit/task-submit'
    });
  },

  getTaskTitle(taskId) {
    const task = this.data.todayTasks.find(t => t.id === taskId);
    return task ? task.title : '未知任务';
  },

  onSubmit() {
    const { formData, selectedTasks, newTasks } = this.data;
    const openid = wx.getStorageSync('catplan_user_openid');

    if (!formData.title && selectedTasks.length === 0 && newTasks.length === 0) {
      wx.showToast({ title: '请填写任务单标题或添加任务', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const createNewTasks = () => {
      const promises = newTasks.map(task => {
        return new Promise((resolve) => {
          wx.request({
            url: app.globalData.backendBase + '/api/tasks',
            method: 'POST',
            data: {
              applicant_openid: openid,
              title: task.title,
              description: task.description || '',
              points: parseInt(task.points)
            },
            success: (res) => {
              resolve(res.data && res.data.ok ? res.data.taskId || (res.data.task && res.data.task.id) : null);
            },
            fail: () => resolve(null)
          });
        });
      });
      return Promise.all(promises);
    };

    const createTaskSheet = (newTaskIds = []) => {
      const allTaskIds = [...selectedTasks, ...newTaskIds.filter(id => id !== null)];
      
      wx.request({
        url: app.globalData.backendBase + '/api/task-sheets',
        method: 'POST',
        data: {
          title: formData.title || formData.date + ' 任务单',
          date: formData.date,
          applicant_openid: openid,
          task_ids: allTaskIds
        },
        success: (res) => {
          if (res.data && res.data.ok) {
            wx.showToast({ title: '任务单已提交审核', icon: 'success' });
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
    };

    if (newTasks.length > 0) {
      createNewTasks().then(newTaskIds => {
        createTaskSheet(newTaskIds);
      });
    } else {
      createTaskSheet([]);
    }
  }
});
