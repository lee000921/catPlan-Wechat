/**
 * 定时任务调度器
 * 每天 00:00 自动为周期任务创建当天的任务实例
 */

const { PeriodicTaskModel, TaskModel } = require('../models');
const db = require('../config/db');

class TaskScheduler {
    constructor() {
        this.cronJob = null;
        this.isRunning = false;
    }

    /**
     * 检查周期任务是否应该在今日创建实例
     */
    shouldCreateTask(periodicTask, targetDate = new Date()) {
        const { periodicType, periodicConfig, lastCreatedAt } = periodicTask;
        
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth(); // 0-11
        const date = targetDate.getDate(); // 1-31
        const day = targetDate.getDay(); // 0-6, 0=周日
        const hours = targetDate.getHours();
        
        // 如果配置了小时，检查当前时间是否到达
        if (periodicConfig.hour !== undefined) {
            if (hours < periodicConfig.hour) {
                return false; // 还没到创建时间
            }
        }
        
        switch (periodicType) {
            case 'daily':
                // 每天创建
                // 检查是否已经今天创建过
                if (lastCreatedAt && lastCreatedAt !== null) {
                    const lastDate = new Date(lastCreatedAt);
                    if (lastDate.toDateString() === targetDate.toDateString()) {
                        return false;
                    }
                }
                return true;
                
            case 'weekly':
                // 每周特定某天创建
                if (periodicConfig.weekday === undefined) {
                    return false;
                }
                if (day !== periodicConfig.weekday) {
                    return false;
                }
                // 检查是否已经本周创建过
                if (lastCreatedAt) {
                    const lastDate = new Date(lastCreatedAt);
                    const lastWeek = this.getWeekNumber(lastDate);
                    const currentWeek = this.getWeekNumber(targetDate);
                    if (lastWeek === currentWeek && lastDate.getFullYear() === year) {
                        return false;
                    }
                }
                return true;
                
            case 'monthly':
                // 每月特定某天创建
                if (periodicConfig.dayOfMonth === undefined) {
                    return false;
                }
                if (date !== periodicConfig.dayOfMonth) {
                    return false;
                }
                // 检查是否已经本月创建过
                if (lastCreatedAt) {
                    const lastDate = new Date(lastCreatedAt);
                    if (lastDate.getMonth() === month && lastDate.getFullYear() === year) {
                        return false;
                    }
                }
                return true;
                
            default:
                return false;
        }
    }

    /**
     * 获取周数
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * 创建任务实例
     */
    async createTaskInstance(periodicTask) {
        const today = new Date();
        const dueDate = today.toISOString().split('T')[0];
        
        try {
            // 检查是否已存在今日任务
            const existingTask = await db.runGet(
                `SELECT id FROM tasks WHERE parent_task_id = ? AND user_id = ? AND date(due_date) = ?`,
                [periodicTask.id, periodicTask.user_id, dueDate]
            );
            
            if (existingTask) {
                console.log(`任务已存在，跳过创建：${periodicTask.title} (用户：${periodicTask.user_id})`);
                return null;
            }
            
            // 创建任务实例
            const taskId = await TaskModel.create({
                userId: periodicTask.user_id,
                title: periodicTask.title,
                description: periodicTask.description,
                points: periodicTask.points,
                isPeriodic: true,
                periodicType: periodicTask.periodic_type,
                periodicConfig: periodicTask.periodicConfig,
                parentTaskId: periodicTask.id,
                dueDate: dueDate
            });
            
            // 更新周期任务的最后创建时间
            await PeriodicTaskModel.updateLastCreated(periodicTask.id);
            
            console.log(`创建任务实例成功：${periodicTask.title} (ID: ${taskId}, 用户：${periodicTask.user_id})`);
            
            return {
                taskId,
                periodicTaskId: periodicTask.id,
                userId: periodicTask.user_id,
                title: periodicTask.title,
                dueDate
            };
        } catch (error) {
            console.error(`创建任务实例失败：${periodicTask.title}`, error);
            throw error;
        }
    }

    /**
     * 执行每日任务创建
     */
    async runDailyTaskCreation() {
        if (this.isRunning) {
            console.log('调度器正在运行，跳过本次执行');
            return;
        }
        
        this.isRunning = true;
        console.log('开始执行每日任务创建...');
        
        try {
            // 获取所有激活且已审批的周期任务
            const periodicTasks = await PeriodicTaskModel.findDueTasks();
            
            console.log(`找到 ${periodicTasks.length} 个符合条件的周期任务`);
            
            const results = {
                success: [],
                skipped: [],
                failed: []
            };
            
            for (const task of periodicTasks) {
                try {
                    if (this.shouldCreateTask(task)) {
                        const result = await this.createTaskInstance(task);
                        if (result) {
                            results.success.push(result);
                        } else {
                            results.skipped.push({
                                periodicTaskId: task.id,
                                title: task.title,
                                reason: '任务已存在'
                            });
                        }
                    } else {
                        results.skipped.push({
                            periodicTaskId: task.id,
                            title: task.title,
                            reason: '未到创建时间'
                        });
                    }
                } catch (error) {
                    results.failed.push({
                        periodicTaskId: task.id,
                        title: task.title,
                        error: error.message
                    });
                }
            }
            
            console.log('每日任务创建完成:', {
                success: results.success.length,
                skipped: results.skipped.length,
                failed: results.failed.length
            });
            
            return results;
        } catch (error) {
            console.error('执行每日任务创建失败:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * 启动调度器
     */
    start() {
        console.log('任务调度器已启动');
        
        // 立即执行一次（用于测试）
        this.runDailyTaskCreation().catch(console.error);
        
        // 设置定时器：每天 00:00 执行
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        console.log(`距离下次执行还有：${Math.floor(timeUntilMidnight / 1000 / 60)} 分钟`);
        
        setTimeout(() => {
            this.runDailyTaskCreation().catch(console.error);
            // 之后每 24 小时执行一次
            setInterval(() => {
                this.runDailyTaskCreation().catch(console.error);
            }, 24 * 60 * 60 * 1000);
        }, timeUntilMidnight);
    }

    /**
     * 手动触发执行（用于测试）
     */
    async trigger() {
        console.log('手动触发任务创建...');
        return await this.runDailyTaskCreation();
    }
}

// 导出单例
module.exports = new TaskScheduler();
