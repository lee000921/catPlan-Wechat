/**
 * 统一成功响应
 */
function success(data = null, message = '操作成功') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * 统一失败响应
 */
function error(message = '操作失败', code = 400) {
  return {
    success: false,
    message,
    code
  };
}

module.exports = {
  success,
  error
};
