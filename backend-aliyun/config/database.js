// 数据库配置 - 支持 MySQL 和 MongoDB
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const DB_TYPE = process.env.DB_TYPE || 'mongodb';

let db = null;

/**
 * 连接数据库
 */
async function connectDatabase() {
  if (DB_TYPE === 'mysql') {
    // MySQL 连接 (使用 Sequelize)
    const sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg),
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        timezone: '+08:00'
      }
    );

    try {
      await sequelize.authenticate();
      logger.info('MySQL 连接成功');
      db = sequelize;
      return sequelize;
    } catch (error) {
      logger.error('MySQL 连接失败:', error);
      throw error;
    }
  } else {
    // MongoDB 连接 (使用 Mongoose)
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('MongoDB 连接成功');
      db = mongoose.connection;
      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB 连接失败:', error);
      throw error;
    }
  }
}

/**
 * 获取数据库实例
 */
function getDatabase() {
  return db;
}

/**
 * 获取数据库类型
 */
function getDatabaseType() {
  return DB_TYPE;
}

module.exports = {
  connectDatabase,
  getDatabase,
  getDatabaseType
};
