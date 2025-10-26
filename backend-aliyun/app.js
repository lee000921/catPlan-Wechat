require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(compression()); // 压缩响应
app.use(cors()); // 跨域
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // 日志

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/lottery', require('./routes/lottery'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/goods', require('./routes/goods'));
app.use('/api/exchange', require('./routes/exchange'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('MongoDB 连接成功');
  
  // 启动服务器
  app.listen(PORT, () => {
    logger.info(`服务器运行在端口 ${PORT}`);
    logger.info(`环境: ${process.env.NODE_ENV}`);
  });
})
.catch(err => {
  logger.error('MongoDB 连接失败:', err);
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB 连接关闭');
    process.exit(0);
  });
});

module.exports = app;
