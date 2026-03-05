/**
 * 积分商城后端服务器
 * 支持周期任务功能
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const taskScheduler = require('./scheduler/taskScheduler');

// 导入路由
const periodicTasksRouter = require('./routes/periodicTasks');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API 路由
app.use('/api/tasks/periodic', periodicTasksRouter);
app.use('/api/tasks', tasksRouter);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        code: 0,
        message: 'OK',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: '接口不存在'
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 初始化并启动服务器
async function startServer() {
    try {
        // 初始化数据库
        console.log('初始化数据库...');
        await db.initDatabase();
        await db.createTables();
        
        // 启动任务调度器
        console.log('启动任务调度器...');
        taskScheduler.start();
        
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`服务器启动成功：http://localhost:${PORT}`);
            console.log(`API 文档:`);
            console.log(`  - POST   /api/tasks/periodic         申请周期任务`);
            console.log(`  - GET    /api/tasks/periodic/my      我的周期任务`);
            console.log(`  - POST   /api/tasks/periodic/:id/complete  完成周期任务`);
            console.log(`  - GET    /api/tasks/periodic/:id/logs      完成记录`);
            console.log(`  - GET    /api/tasks                    任务列表`);
            console.log(`  - GET    /api/tasks/today              今日任务`);
            console.log(`  - POST   /api/tasks/:id/complete       完成任务`);
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM 信号，正在关闭...');
    await db.closeDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('收到 SIGINT 信号，正在关闭...');
    await db.closeDatabase();
    process.exit(0);
});

// 启动
startServer();

module.exports = app;
