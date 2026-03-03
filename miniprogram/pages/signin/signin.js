const util = {
    pad: (n)=> n<10?('0'+n):(''+n)
  };
  
  Page({
    data: {
      year: 0,
      month: 0,
      weekdays: ['日','一','二','三','四','五','六'],
      cells: [],
      signedDaysSet: {},
      signedCount: 0,
      signedToday: false,
      checking: false,
      stats: {
        totalPoints: 0
      },
      // backendBase will be read from app globalData in onLoad
      backendBase: ''
    },
  
    onLoad() {
      const d = new Date();
      this.setData({ year: d.getFullYear(), month: d.getMonth()+1 });
      this.buildCalendar();
      // set backend base from global config if available
      try {
        const app = getApp();
        const base = app && app.globalData && app.globalData.backendBase;
        if (base) this.setData({ backendBase: base });
      } catch (e) {}
      // load userInfo from storage and token
      const userInfo = wx.getStorageSync('catplan_user') || null;
      const token = wx.getStorageSync('catplan_token') || null;
      this.setData({ userInfo });
      this.token = token;
      this.fetchHistory();
      this.fetchUserPoints(); // 获取用户积分
    },
  
    onShow() {
      // 页面显示时刷新数据
      // 强制检查今天的签到状态，无论当前显示的是哪个月份
      this.checkTodaySigninStatus();
      
      // 检查是否是当前月份，如果是当前月份，则确保显示最新状态
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // 如果当前显示的是本月，则刷新为最新状态
      if (this.data.year === currentYear && this.data.month === currentMonth) {
        this.buildCalendar(); // 重建日历确保今天的状态正确
      }
      
      this.fetchHistory();
      this.fetchUserPoints(); // 同时刷新用户积分
    },
  
    // 检查今天的签到状态
    async checkTodaySigninStatus() {
      const openid = wx.getStorageSync('catplan_user_openid') || null;
      if (!openid) return;
      
      // 使用本地时间而不是UTC时间
      const now = new Date();
      const today = `${now.getFullYear()}-${util.pad(now.getMonth()+1)}-${util.pad(now.getDate())}`;
      const currentMonth = `${now.getFullYear()}-${util.pad(now.getMonth()+1)}`;
      
      console.log('Checking today signin status for:', { openid, today, currentMonth });
      
      const url = `${this.data.backendBase}/api/signin/history?openid=${openid}&month=${currentMonth}`;
      
      try {
        const headers = {};
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
        const resp = await new Promise((resolve,reject)=>{
          wx.request({ url, header: headers, success: r=>resolve(r.data), fail:reject });
        });
        
        const days = resp.days || [];
        const signedToday = days.includes(today);
        
        console.log('Today signin check result:', { today, days, signedToday });
        
        // 立即更新signedToday状态
        this.setData({ signedToday });
      } catch (e) {
        console.error('check today signin status failed', e);
      }
    },
  
    // build calendar cells for current month
    buildCalendar() {
      const y = this.data.year, m = this.data.month;
      const first = new Date(y, m-1, 1);
      const last = new Date(y, m, 0);
      const startWeek = first.getDay();
      const totalDays = last.getDate();
      const cells = [];
      
      // 获取今天的日期
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${util.pad(today.getMonth()+1)}-${util.pad(today.getDate())}`;
      
      // leading blanks
      for (let i=0;i<startWeek;i++) cells.push({ display: '', date: '', signed:false, isToday: false });
      for (let d=1; d<=totalDays; d++) {
        const dateStr = `${y}-${util.pad(m)}-${util.pad(d)}`;
        cells.push({ 
          display: d, 
          date: dateStr, 
          signed: false,
          isToday: dateStr === todayStr
        });
      }
      this.setData({ cells });
    },
  
    async fetchHistory() {
      const openid = wx.getStorageSync('catplan_user_openid') || null;
      // We assume frontend stored openid in storage earlier; otherwise backend should provide via token
      if (!openid) {
        console.log('No openid found, skipping fetchHistory');
        // try to read from previous flow: if userInfo exists, we did not store openid; skip
        return;
      }
      const month = `${this.data.year}-${util.pad(this.data.month)}`;
      const url = `${this.data.backendBase}/api/signin/history?openid=${openid}&month=${month}`;
      console.log('Fetching history from:', url); // 添加调试日志
      try {
        const headers = {};
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
        const resp = await new Promise((resolve,reject)=>{
          wx.request({ url, header: headers, success: r=>resolve(r.data), fail:reject });
        });
        console.log('History response:', resp); // 添加调试日志
        const days = resp.days || [];
        console.log('Signin days:', days); // 添加调试日志
        const set = {};
        days.forEach(d=>set[d]=true);
        const cells = this.data.cells.map(c=>{
          if (!c.date) return c;
          return { ...c, signed: !!set[c.date] };
        });
        console.log('Updated cells with signin status:', cells); // 添加调试日志
        const signedCount = days.length;
        // compute consecutive count up to today
        const consecutive = this.computeConsecutive(set);
        
        // 确定今天是否签到 - 需要检查今天是否在当前显示的月份中
        // 使用本地时间而不是UTC时间
        const now = new Date();
        const today = `${now.getFullYear()}-${util.pad(now.getMonth()+1)}-${util.pad(now.getDate())}`;
        let signedToday = false;
        
        // 检查当前显示的月份是否是当前月份，如果是则检查今天是否签到
        const currentMonth = `${new Date().getFullYear()}-${util.pad(new Date().getMonth()+1)}`;
        const displayMonth = `${this.data.year}-${util.pad(this.data.month)}`;
        
        if (currentMonth === displayMonth) {
          // 如果显示的是当前月份，则检查今天是否签到
          signedToday = !!set[today];
        } else {
          // 如果显示的不是当前月份，需要单独检查今天的签到状态
          // 通过获取当前月份的签到历史来确定
          const currentMonthUrl = `${this.data.backendBase}/api/signin/history?openid=${openid}&month=${currentMonth}`;
          try {
            const currentMonthResp = await new Promise((resolve,reject)=>{
              wx.request({ url: currentMonthUrl, header: headers, success: r=>resolve(r.data), fail:reject });
            });
            const currentMonthDays = currentMonthResp.days || [];
            signedToday = currentMonthDays.includes(today);
          } catch (e) {
            console.error('fetch current month history failed', e);
            signedToday = false;
          }
        }
        
        console.log('Setting data:', { signedCount, consecutiveCount: consecutive, signedToday }); // 添加调试日志
        this.setData({ cells, signedDaysSet: set, signedCount, consecutiveCount: consecutive, signedToday });
      } catch (e) {
        console.error('fetch history failed', e);
      }
    },
  
    async onCheckin() {
      const openid = wx.getStorageSync('catplan_user_openid') || null;
      if (!openid) { wx.showToast({ title: '未获取到 openid，请先登录', icon:'none' }); return; }
      // 使用本地时间而不是UTC时间
      const now = new Date();
      const today = `${now.getFullYear()}-${util.pad(now.getMonth()+1)}-${util.pad(now.getDate())}`;
      if (this.data.signedToday) { wx.showToast({ title: '今天已签到', icon:'none' }); return; }
      if (this.data.checking) return;
      const url = `${this.data.backendBase}/api/signin/checkin`;
      try {
        this.setData({ checking: true });
        const headers = { 'content-type': 'application/json' };
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
        const resp = await new Promise((resolve, reject) => {
          wx.request({ 
            url, 
            method: 'POST', 
            header: headers, 
            data: { openid, day: today }, 
            success: r => {
              // HTTP 2xx 状态码时 success 回调会被调用，即使后端返回错误信息
              if (r.statusCode >= 200 && r.statusCode < 300) {
                resolve(r.data);
              } else {
                // HTTP 4xx/5xx 状态码时，将错误信息作为响应返回
                resolve(r.data || { error: `HTTP Error: ${r.statusCode}` });
              }
            }, 
            fail: e => reject(e) 
          });
        });
        
        if (resp && resp.ok) {
          wx.showToast({ title: '签到成功' });
          // update UI
          const set = this.data.signedDaysSet || {};
          const already = !!set[today];
          set[today] = true;
          const cells = this.data.cells.map(c => c.date === today ? { ...c, signed:true } : c);
          const consecutive = this.computeConsecutive(set);
          this.setData({ 
            cells, 
            signedDaysSet: set, 
            signedCount: (this.data.signedCount||0)+ (already?0:1), 
            consecutiveCount: consecutive, 
            signedToday: true, 
            checking: false 
          });
          
          // 显示积分获取动画
          if (resp.points_earned && resp.points_earned > 0) {
            this.showPointsAnimation(resp.points_earned);
            // 更新总积分显示
            this.setData({
              'stats.totalPoints': resp.total_points || (this.data.stats.totalPoints || 0) + resp.points_earned
            });
          }
        } else {
          // 检查是否是重复签到错误
          if (resp && resp.error && typeof resp.error === 'string' && resp.error.includes('Already checked in today')) {
            wx.showToast({ title: '今天已签到', icon: 'none' });
            // 更新UI为已签到状态
            const set = this.data.signedDaysSet || {};
            set[today] = true;
            const cells = this.data.cells.map(c => c.date === today ? { ...c, signed: true } : c);
            const consecutive = this.computeConsecutive(set);
            this.setData({ 
              cells, 
              signedDaysSet: set, 
              signedToday: true, 
              checking: false 
            });
          } else {
            wx.showToast({ title: '签到失败', icon:'none' });
            this.setData({ checking: false });
          }
        }
      } catch (e) {
        console.error('checkin failed', e);
        // 检查是否是HTTP错误
        if (e.errMsg && e.errMsg.includes('request:fail')) {
          wx.showToast({ title: '网络连接失败', icon:'none' });
        } else {
          wx.showToast({ title: '服务错误', icon:'none' });
        }
        this.setData({ checking: false });
      }
    },
  
    computeConsecutive(set) {
      // count consecutive days up to today
      const today = new Date();
      let count = 0;
      for (let i=0;i<365;i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const ds = `${d.getFullYear()}-${util.pad(d.getMonth()+1)}-${util.pad(d.getDate())}`;
        if (set[ds]) count++; else break;
      }
      return count;
    },
  
    onPrevMonth() {
      let y = this.data.year, m = this.data.month;
      m -= 1; if (m < 1) { m = 12; y -= 1; }
      this.setData({ year: y, month: m });
      this.buildCalendar();
      this.fetchHistory();
    },
  
    onNextMonth() {
      let y = this.data.year, m = this.data.month;
      m += 1; if (m > 12) { m = 1; y += 1; }
      this.setData({ year: y, month: m });
      this.buildCalendar();
      this.fetchHistory();
    },
  
    onDayTap(e) {
      // optional: show info for day
      const d = e.currentTarget.dataset.day;
      if (!d) return;
      const signed = this.data.signedDaysSet && this.data.signedDaysSet[d];
      wx.showToast({ title: signed? '已签到' : '未签到', icon:'none' });
    },
  
    // 显示积分获取动画
    showPointsAnimation(pointsEarned) {
      // 设置动画数据
      this.setData({
        showPointsAnimation: true,
        animationPoints: pointsEarned
      });
      
      // 延迟隐藏动画
      setTimeout(() => {
        this.setData({
          showPointsAnimation: false
        });
      }, 2000);
    },
  
    // 获取用户积分信息
    async fetchUserPoints() {
      const openid = wx.getStorageSync('catplan_user_openid') || null;
      if (!openid) return;
  
      const url = `${this.data.backendBase}/api/user/profile?openid=${openid}`;
      try {
        const headers = {};
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
        
        const resp = await new Promise((resolve, reject) => {
          wx.request({ 
            url, 
            header: headers, 
            success: r => resolve(r.data), 
            fail: reject 
          });
        });
        
        if (resp && resp.points !== undefined) {
          this.setData({
            'stats.totalPoints': resp.points
          });
        }
      } catch (e) {
        console.error('fetch user points failed', e);
      }
    }
  });
  