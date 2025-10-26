const config = require('../config/api-aliyun.js');

/**
 * 统一的HTTP请求方法
 * @param {String} url 请求地址
 * @param {Object} options 请求选项
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token');
    
    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }

    wx.request({
      url: url,
      method: options.method || 'POST',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        wx.hideLoading();

        if (res.statusCode === 200) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            // 业务错误
            if (options.showError !== false) {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none',
                duration: 2000
              });
            }
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token过期，重新登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/user/login'
            });
          }, 2000);
          
          reject(new Error('登录已过期'));
        } else {
          if (options.showError !== false) {
            wx.showToast({
              title: '网络错误',
              icon: 'none',
              duration: 2000
            });
          }
          reject(new Error('网络错误'));
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败', err);
        
        if (options.showError !== false) {
          wx.showToast({
            title: '网络连接失败，请检查网络',
            icon: 'none',
            duration: 2000
          });
        }
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}, options = {}) {
  const queryString = Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return request(fullUrl, {
    method: 'GET',
    ...options
  });
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request(url, {
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request(url, {
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 */
function del(url, data = {}, options = {}) {
  return request(url, {
    method: 'DELETE',
    data,
    ...options
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del
};
