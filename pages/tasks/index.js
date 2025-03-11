// pages/tasks/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    completedTasks: 0,
    totalTasks: 0,
    todayEarnedPoints: 0,
    taskGroups : []
  },

  onLoad: function() {
    this.checkLoginStatus();
    wx.cloud.callFunction({
      name: 'initTaskCollection',
      data: {},
      success: res => {
        console.log('[云函数] [initTaskCollection] 调用成功', res);
      },
      fail: err => {
        console.error('[云函数] [getTasks] 调用失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取任务数据失败',
          icon: 'none'
        });
      }
    });
  },

  onShow: function() {
    if (app.globalData.isLogin !== this.data.isLogin) {
      this.setData({
        isLogin: app.globalData.isLogin
      });
    }
    if (this.data.isLogin) {
      this.fetchTaskData();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
      this.fetchTaskData();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 判断时间是不是在今天范围内
  isToday: function(date) {
    // 这里的date是string形式的时间，转换成时间戳
    date = new Date(date);
    const currentTime = date.getTime();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const beginTime = now.getTime();
    now.setHours(23, 59, 59, 999);
    const endTime = now.getTime();
    return currentTime >= beginTime && currentTime <= endTime;
  },

  // 获取任务数据
  fetchTaskData: function() {
    this.setData({ loading: true });

    // 从云平台collections中读取任务数据
    wx.cloud.callFunction({
      name: 'getTasks',
      data: {},
      success: res => {
        const tasks = res.result.data;
        const dailyTasks = tasks.dailyTasks;
        const growthTasks = tasks.growthTasks;
        const taskGroups = [
          { title: '每日任务', 
            desc: '每日任务，每天完成任务可获得碎片',
            tasks: dailyTasks },
          { title: '成长任务', 
            desc: '成长任务，完成任务可获得更多碎片',
            tasks: growthTasks }
        ];

        wx.cloud.callFunction({
          name: 'getUserInfo',
          data: {},
          success: res => {
            if (res.result && res.result.data) {
              const userInfo = res.result.data;
              console.log('用户信息', userInfo);
              // 先处理每日任务，先判断userInfo中是否存在该taskId，若存在，判断finishTime是否为今天，若是，则progress+1
              taskGroups.forEach(group => {
                if (group.title === '每日任务') {
                  group.tasks.forEach(task => {
                    const userTask = userInfo.tasks.find(t => t.taskId === task._id);
                    if (userTask && this.isToday(userTask.finishTime)) {
                      task.progress = 1;
                      task.completed = task.progress === task.maxProgress;
                    }
                  });
                } else {
                  // 处理成长任务，先判断userInfo中是否存在该taskId，若存在，判断progress是否等于maxProgress，若是，则completed=true
                    
                  // 创建一个map，key为taskId，value为出现次数
                  const taskCountMap = userInfo.tasks.reduce((acc, task) => {
                    // 从每个任务对象中获取 taskId
                    const taskId = task.taskId;
                    
                    // 增加该 taskId 的计数
                    acc[taskId] = (acc[taskId] || 0) + 1;
                    
                    return acc;
                }, {});
                    group.tasks.forEach(task => {
                    if (taskCountMap[task._id]) {
                      task.progress = taskCountMap[task._id];
                      task.completed = task.progress === task.maxProgress;
                    }
                  });
                }
              });
              // 计算已完成任务数和总任务数
              let completedTasks = 0;
              let totalTasks = 0;
              let todayEarnedPoints = 0;

              console.log(taskGroups);

              // 对每个task，根据completed状态，添加buttonText字段
              taskGroups.forEach(group => {
                group.tasks.forEach(task => {
                  if (task.category === 'daily') {
                    totalTasks++;
                  }
                  if (task.completed) {
                    if (task.category === 'daily') {
                      completedTasks++;
                      todayEarnedPoints += task.points;
                    }
                    task.buttonText = '已完成';
                  } else {
                    task.buttonText = '去完成';
                  }
              });
        });

        this.setData({
          taskGroups,
          completedTasks,
          totalTasks,
          todayEarnedPoints,
          loading: false
        });
            }
          },
          fail: err => {
            console.error('[云函数] [getUserInfo] 调用失败', err);
          }
        });

        
      },
      fail: err => {
        console.error('[云函数] [getTasks] 调用失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取任务数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理任务点击
  handleTaskClick: function(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }

    const { groupIndex, taskIndex } = e.currentTarget.dataset;
    const task = this.data.taskGroups[groupIndex].tasks[taskIndex];
    
    if (task.completed) {
      wx.showToast({
        title: '任务已完成',
        icon: 'none'
      });
      return;
    }

    //
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        taskId: task._id
      },
      success: res => {
        console.log('[云函数] [updateUserInfo] 调用成功', res);
        this.updateTaskProgress(groupIndex, taskIndex, task.progress + 1);
      },
      fail: err => {
        console.error('[云函数] [updateUserInfo] 调用失败', err);
      }
    });
  },

  // 更新任务进度
  updateTaskProgress: function(groupIndex, taskIndex, newProgress) {
    const taskGroups = this.data.taskGroups;
    const task = taskGroups[groupIndex].tasks[taskIndex];
    
    // 更新进度，不超过最大值
    task.progress = Math.min(newProgress, task.maxProgress);
    
    // 检查是否完成
    if (task.progress >= task.maxProgress && !task.completed) {
      task.completed = true;
      task.buttonText = '已完成';
      
      // 更新完成任务数和今日获得碎片
      this.setData({
        completedTasks: this.data.completedTasks + 1,
        todayEarnedPoints: this.data.todayEarnedPoints + task.points
      });

      wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          point: task.points,
        },
        success: res => {
          console.log('[云函数] [updateUserInfo] 调用成功', res);
        },
        fail: err => {
          console.error('[云函数] [updateUserInfo] 调用失败', err);
        }
      });
      
      // 显示获得碎片提示
      wx.showToast({
        title: `任务完成 +${task.points}碎片`,
        icon: 'success'
      });
    }
    
    this.setData({
      taskGroups: taskGroups
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  }
});