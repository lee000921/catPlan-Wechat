const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * JWT认证中间件
 */
function authMiddleware(req, res, next) {
  try {
    // 获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(error('未提供认证令牌', 401));
    }

    const token = authHeader.substring(7);

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = {
      openId: decoded.openId,
      userId: decoded.userId
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(error('认证令牌已过期', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(error('无效的认证令牌', 401));
    } else {
      logger.error('认证错误:', err);
      return res.status(500).json(error('认证失败', 500));
    }
  }
}

module.exports = authMiddleware;
