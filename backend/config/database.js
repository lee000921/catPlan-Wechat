/**
 * 数据库配置文件
 */

const path = require('path');

module.exports = {
    // 数据库文件路径
    database: path.join(__dirname, '../../data/points_mall.db'),
    
    // 数据库配置选项
    options: {
        // 启用外键约束
        foreignKeys: true,
        // 详细模式
        verbose: console.log
    },
    
    // 连接池配置（SQLite 不需要，但保留接口）
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    }
};
