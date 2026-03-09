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
    approvalForm: {
      status: 'approved',
      comment: ''
    },
    submitting: false,
    showApprovalForm: false,
    showCompleteButton: false
  },

  onLoad(options) {
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }
    
    const userInfo = wx.getStorageSync('catplan_user');
    const openid = wx.getStorageSync('catplan_user_openid');
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    
    console.log('=== Task Detail onLoad ===');
    console.log('UserType:', userType);
    console.log('OpenID:', openid);
    
    if (userInfo && openid) {
      this.setData({ 
        userInfo, 
        openid,
        userType: userType
      });
    }
    
    if (options.id) {
      this.loadTaskDetail(options.id);
    }
  },

  onShow() {
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const openid = wx.getStorageSync('catplan_user_openid');
    
    this.setData({
      userType: userType,
      openid: openid
    });
    
    if (this.data.task && this.data.task.id) {
      this.loadTaskDetail(this.data.task.id);
    }
  },

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
        console.log('=== Task Detail Response ===');
        console.log('Response:', res.data);
        
        if (res.data && res.data.ok && res.data.task) {
          const task = res.data.task;
          const userType = this.data.userType;
          
          console.log('Current userType:', userType);
          
          // 判断是否为审核者（B 类用户）
          const isBUser = (userType === 'B') || (userType && userType.includes('B'));
          const isPending = task.status === 'pending';
          
          console.log('Is B user:', isBUser);
          console.log('Is pending:', isPending);
          
          // 只有 B 类用户且任务为 pending 状态才显示审批表单
          const showApprovalForm = isBUser && isPending;
          // 非 B 类用户且任务为 approved 状态显示完成按钮
          const showCompleteButton = !isBUser && task.status === 'approved';
          
          console.log('showApprovalForm:', showApprovalForm);
          console.log('showCompleteButton:', showCompleteButton);
          
          this.setData({
            task: task,
            approvals: res.data.approvals || [],
            showApprovalForm: showApprovalForm,
            showCompleteButton: showCompleteButton
          });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('加载任务详情失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 选择审批状态
  selectApprovalStatus(e) {
    const status = e.currentTarget.dataset.status;
    console.log('Selected approval status:', status);
    this.setData({ 'approvalForm.status': status });
  },

  onCommentInput(e) {
    this.setData({ 'approvalForm.comment': e.detail.value });
  },

  // 取消审批 - 返回上一页
  onCancelApproval() {
    console.log('Cancel approval, navigating back');
    wx.navigateBack();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 提交审批
  onSubmitApproval() {
    console.log('=== Submit Approval ===');
    console.log('UserType:', this.data.userType);
    
    // 再次验证用户类型
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const isBUser = (userType === 'B') || (userType && userType.includes('B'));
    
    console.log('Is B user:', isBUser);
    
    if (!isBUser) {
      wx.showToast({ title: '只有审核者才能审批任务', icon: 'none' });
      return;
    }

    const { status, comment } = this.data.approvalForm;
    const { openid, backendBase } = this.data;
    const taskId = this.data.task.id;

    console.log('Task ID:', taskId);
    console.log('OpenID:', openid);
    console.log('Status:', status);

    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!taskId) {
      wx.showToast({ title: '任务 ID 无效', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    wx.request({
      url: `${backendBase}/api/tasks/${taskId}/approve`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        approver_openid: openid,
        status: status,
        comment: comment
      },
      success: (res) => {
        console.log('Approval response:', res.data);
        
        if (res.data && res.data.ok) {
          wx.showToast({ title: '审批成功', icon: 'success', duration: 2000 });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ title: res.data.error || '审批失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('审批失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  },

  onCompleteTask() {
    if (!this.data.task) return;

    const { openid, backendBase } = this.data;
    const taskId = this.data.task.id;

    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.task.status !== 'approved') {
      wx.showToast({ title: '任务未通过审批', icon: 'none' });
      return;
    }

    if (this.data.task.applicant_openid !== openid) {
      wx.showToast({ title: '只能完成自己的任务', icon: 'none' });
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
      header: { 'content-type': 'application/json' },
      data: { applicant_openid: openid },
      success: (res) => {
        if (res.data && res.data.ok) {
          wx.showToast({ title: `完成！获得${res.data.points_earned}碎片`, icon: 'success', duration: 2000 });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ title: res.data.error || '完成失败', icon: 'none' });
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
