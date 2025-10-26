// 阿里云API配置
const API_BASE_URL = 'https://api.yourdomain.com'; // 请替换为你的域名

module.exports = {
  API_BASE_URL,
  
  // API 端点
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  GET_USER_INFO: `${API_BASE_URL}/api/user/info`,
  UPDATE_USER_INFO: `${API_BASE_URL}/api/user/update`,
  CHECKIN: `${API_BASE_URL}/api/checkin`,
  LOTTERY: `${API_BASE_URL}/api/lottery`,
  GET_TASKS: `${API_BASE_URL}/api/tasks`,
  GET_GOODS: `${API_BASE_URL}/api/goods`,
  EXCHANGE_GOODS: `${API_BASE_URL}/api/exchange`,
  GET_EXCHANGE_RECORDS: `${API_BASE_URL}/api/exchange/records`
};
