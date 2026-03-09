/**
 * API 请求封装
 * 统一管理所有 HTTP 请求
 */

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';
  data?: Record<string, any>;
  header?: Record<string, string>;
  timeout?: number;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 从本地存储获取 token（兼容旧 key）
function getToken(): string {
  // 新版统一使用 catplan_token，兼容读取旧的 token key
  const token = wx.getStorageSync('catplan_token') || wx.getStorageSync('token');
  return token || '';
}

// 请求拦截器 - 添加公共 header
function setDefaultHeaders(config: RequestConfig): RequestConfig {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.header,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...config,
    header: headers,
  };
}

// 响应拦截器 - 处理通用错误
function handleResponse<T>(
  response: any,
  resolve: (value: T) => void,
  reject: (reason?: any) => void
): void {
  const { statusCode, data } = response;

  if (statusCode === 200 || statusCode === 201) {
    const apiResponse = data as ApiResponse<T>;

    if (apiResponse.code === 0) {
      // 业务请求成功
      resolve(apiResponse.data);
    } else if (apiResponse.code === 401) {
      // token 过期或无效，清除本地数据并重新登录
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      wx.showModal({
        title: '登录过期',
        content: '请重新登录',
        confirmText: '立即登录',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            wx.redirectTo({
              url: '/pages/login/login',
            });
          }
        },
      });
      reject(new Error('Unauthorized'));
    } else {
      // 业务请求失败
      reject(new Error(apiResponse.message || '请求失败'));
    }
  } else {
    // HTTP 状态码错误
    reject(
      new Error(
        `HTTP Error: ${statusCode} ${data?.message || 'Unknown error'}`
      )
    );
  }
}

/**
 * 统一 API 请求函数
 * @param config 请求配置
 * @returns Promise<ApiResponse>
 */
export function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    const finalConfig = setDefaultHeaders({
      method: 'GET',
      timeout: 10000,
      ...config,
    });

    wx.request({
      url: `${getApiBaseUrl()}${finalConfig.url}`,
      method: finalConfig.method,
      data: finalConfig.data,
      header: finalConfig.header,
      timeout: finalConfig.timeout,
      success: (response) => {
        handleResponse<T>(response, resolve, reject);
      },
      fail: (error) => {
        console.error('Request failed:', error);
        reject(new Error('网络请求失败'));
      },
    });
  });
}

/**
 * GET 请求
 */
export function get<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>
): Promise<T> {
  return request<T>({
    ...config,
    url,
    method: 'GET',
  });
}

/**
 * POST 请求
 */
export function post<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    ...config,
    url,
    method: 'POST',
    data,
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    ...config,
    url,
    method: 'PUT',
    data,
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>
): Promise<T> {
  return request<T>({
    ...config,
    url,
    method: 'DELETE',
  });
}

/**
 * 获取 API 基础 URL
 */
function getApiBaseUrl(): string {
  // 优先从全局 app 配置读取，保证与小程序其它页面保持一致
  try {
    const app = getApp<{
      globalData?: { backendBase?: string; baseUrl?: string };
    }>();
    if (app && app.globalData) {
      if (app.globalData.backendBase) {
        return app.globalData.backendBase;
      }
      if (app.globalData.baseUrl) {
        return app.globalData.baseUrl;
      }
    }
  } catch (e) {
    // getApp 在极早期调用时可能不可用，忽略错误走默认值
  }

  // 默认回退到正式环境域名（需在微信后台配置为合法 request 域名）
  return 'https://catplan.xin';
  // return 'http://localhost:3000'; // 如需本地开发可暂时切换
}

/**
 * 保存 token 到本地存储
 */
export function setToken(token: string): void {
  // 统一存到 catplan_token，并兼容旧 key
  wx.setStorageSync('catplan_token', token);
  wx.setStorageSync('token', token);
}

/**
 * 清除 token
 */
export function clearToken(): void {
  wx.removeStorageSync('catplan_token');
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('catplan_user');
}
