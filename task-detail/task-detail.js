const app = getApp();

Page({
  data: {
    backendBase: '',
    userInfo: null,
    openid: '',
    userType: 'A',
    task: null,
    approvals: [],
    loading: true,
    // 审批表单
    approvalForm: {
      status: 'approved',
      comment: ''
    },
    submitting: false
  },

  onLoad(options) {
    // 从全局配置获取后端地址
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }
    
    // 从缓存获取用户信息
    const userInfo = wx.getStorageSync('catplan_user');
    const openid = wx.getStorageSync('catplan_user_openid');
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    
    console.log('Task detail loaded with userType:', userType); // 添加调试日志
    
    if (userInfo && openid) {
      this.setData({ 
        userInfo, 
        openid,
        userType: userType
      }, () => {
        // 数据设置完成后，检查UI条件
        console.log('Data set complete, checking UI conditions:', {
          userType: this.data.userType,
          hasB: this.data.userType === 'B' || (this.data.userType && this.data.userType.includes('B')),
          taskStatus: this.data.task ? this.data.task.status : 'no task yet'
        });
      });
    }
    
    // 获取任务ID
    if (options.id) {
      this.loadTaskDetail(options.id);
    }
  },

  onShow() {
    // 页面显示时刷新用户类型和任务状态
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const openid = wx.getStorageSync('catplan_user_openid');
    
    this.setData({
      userType: userType,
      openid: openid
    });
    
    // 如果有任务ID，重新加载任务详情
    if (this.data.task && this.data.task.id) {
      this.loadTaskDetail(this.data.task.id);
    }
  },

  // 加载任务详情
  loadTaskDetail(taskId) {
    if (!this.data.backendBase) {
      console.error('后端地址未配置');
      return;
    }

    this.setData({ loading: true });

    wx.request({
      url: `${this.data.backendBase}/api/tasks/${taskId}`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.ok) {
          console.log('Task loaded:', res.data.task);
          console.log('User type:', this.data.userType);
          
          // 重新获取用户类型，确保是最新的
          const userType = wx.getStorageSync('catplan_user_type') || 'A';
          console.log('User type from storage:', userType);
          
          const showApprovalForm = (userType === 'B' || (userType && userType.includes('B'))) && 
                                   res.data.task.status === 'pending';
          
          const showCompleteButton = (userType === 'A' || (userType && userType.includes('A'))) && 
                                     res.data.task.status === 'approved';
          
          console.log('Show approval form:', showApprovalForm);
          console.log('Show complete button:', showCompleteButton);
          
          this.setData({
            task: res.data.task,
            approvals: res.data.approvals || [],
            userType: userType, // 更新用户类型
            showApprovalForm: showApprovalForm,
            showCompleteButton: showCompleteButton
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载任务详情失败', err);
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

  // 审批状态改变
  onApprovalStatusChange(e) {
    this.setData({
      'approvalForm.status': e.detail.value
    });
  },

  // 审批意见输入
  onCommentInput(e) {
    this.setData({
      'approvalForm.comment': e.detail.value
    });
  },

  // 取消审批
  onCancelApproval() {
    this.setData({
      approvalForm: {
        status: 'approved',
        comment: ''
      }
    });
  },

  // 提交审批
  onSubmitApproval() {
    if (!this.data.task) {
      return;
    }

    const { status, comment } = this.data.approvalForm;
    const { openid, backendBase } = this.data;
    const taskId = this.data.task.id;

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    wx.request({
      url: `${backendBase}/api/tasks/${taskId}/approve`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        approver_openid: openid,
        status: status,
        comment: comment
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({
            title: '审批成功',
            icon: 'success',
            duration: 2000
          });
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId);
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.error || '审批失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('审批失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  },

  // 完成任务
  onCompleteTask() {
    if (!this.data.task) {
      return;
    }

    const { openid, backendBase } = this.data;
    const taskId = this.data.task.id;

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (this.data.task.status !== 'approved') {
      wx.showToast({
        title: '任务未通过审批',
        icon: 'none'
      });
      return;
    }

    if (this.data.task.applicant_openid !== openid) {
      wx.showToast({
        title: '只能完成自己的任务',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认完成',
      content: `完成任务后将获得 ${this.data.task.points} 碎片，确定已完成吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitComplete(taskId, openid, backendBase);
        }
      }
    });
  },

  submitComplete(taskId, openid, backendBase) {
    this.setData({ submitting: true });

    wx.request({
      url: `${backendBase}/api/tasks/${taskId}/complete`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        applicant_openid: openid
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({
            title: `完成！获得${res.data.points_earned}碎片`,
            icon: 'success',
            duration: 2000
          });
          // 返回任务列表页并刷新
          setTimeout(() => {
            wx.navigateBack({
              success: () => {
                // 获取任务列表页实例并刷新
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 1];
                if (prevPage && prevPage.loadTasks) {
                  prevPage.loadTasks();
                }
              }
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.error || '完成失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('完成任务失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  }
});
