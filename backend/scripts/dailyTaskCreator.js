#!/usr/bin/env node

/**
 * 周期任务定时脚本
 * 可通过 crontab 每天 00:00 执行
 * 
 * 使用方法：
 * 1. 添加到 crontab:
 *    0 0 * * * /usr/bin/node /path/to/backend/scripts/dailyTaskCreator.js >> /var/log/daily_tasks.log 2>&1
 * 
 * 2. 或手动执行测试：
 *    node scripts/dailyTaskCreator.js
 */

const path = require('path');
const db = require('../config/db');
const taskScheduler = require('../scheduler/taskScheduler');

async function main() {
    console.log('='.repeat(50));
    console.log(`周期任务定时脚本 - ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    
    try {
        // 初始化数据库
        await db.initDatabase();
        
        // 执行任务创建
        const results = await taskScheduler.trigger();
        
        console.log('='.repeat(50));
        console.log('执行完成统计:');
        console.log(`  ✅ 成功创建：${results.success.length}`);
        console.log(`  ⏭️  跳过：${results.skipped.length}`);
        console.log(`  ❌ 失败：${results.failed.length}`);
        console.log('='.repeat(50));
        
        // 如果有失败的任务，输出错误信息
        if (results.failed.length > 0) {
            console.error('\n失败任务详情:');
            results.failed.forEach(item => {
                console.error(`  - ${item.title}: ${item.error}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('执行失败:', error);
        process.exit(1);
    } finally {
        await db.closeDatabase();
    }
}

// 执行
main();
