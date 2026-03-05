/**
 * 周期任务 API 路由
 */

const express = require('express');
const router = express.Router();
const { PeriodicTaskModel, TaskModel, PeriodicTaskLogModel, UserModel } = require('../models');

/**
 * 验证用户中间件（简化版，实际应使用 JWT 或 session）
 */
function authMiddleware(req, res, next) {
    // 从 header 或 query 获取用户 ID
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
        return res.status(401).json({
            code: 401,
            message: '未授权，请提供用户 ID'
        });
    }
    
    req.userId = parseInt(userId);
    next();
}

/**
 * POST /api/tasks/periodic
 * 申请周期任务
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, points, periodicType, periodicConfig, startDate, endDate } = req.body;
        
        // 参数验证
        if (!title || !periodicType || !periodicConfig || !startDate) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填参数：title, periodicType, periodicConfig, startDate'
            });
        }
        
        // 验证周期类型
        const validTypes = ['daily', 'weekly', 'monthly'];
        if (!validTypes.includes(periodicType)) {
            return res.status(400).json({
                code: 400,
                message: `无效的周期类型，仅支持：${validTypes.join(', ')}`
            });
        }
        
        // 验证周期配置
        if (typeof periodicConfig !== 'object') {
            return res.status(400).json({
                code: 400,
                message: 'periodicConfig 必须是 JSON 对象'
            });
        }
        
        // 创建周期任务申请
        const taskId = await PeriodicTaskModel.create({
            userId: req.userId,
            title,
            description: description || '',
            points: points || 0,
            periodicType,
            periodicConfig,
            startDate,
            endDate: endDate || null
        });
        
        res.status(201).json({
            code: 0,
            message: '周期任务申请成功，等待审批',
            data: {
                id: taskId,
                title,
                periodicType,
                startDate,
                endDate,
                approvalStatus: 0 // 待审批
            }
        });
    } catch (error) {
        console.error('创建周期任务失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * GET /api/tasks/periodic/my
 * 获取我的周期任务列表
 */
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, pageSize = 10 } = req.query;
        
        const tasks = await PeriodicTaskModel.findByUserId(req.userId, {
            status: status !== undefined ? parseInt(status) : undefined,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
        
        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM periodic_tasks WHERE user_id = ?`;
        const countResult = await require('../config/db').runGet(countSql, [req.userId]);
        
        res.json({
            code: 0,
            message: 'success',
            data: {
                list: tasks,
                total: countResult ? countResult.total : 0,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        console.error('获取周期任务列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * POST /api/tasks/periodic/:id/complete
 * 完成周期任务
 */
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const periodicTaskId = parseInt(req.params.id);
        const userId = req.userId;
        
        // 获取周期任务
        const periodicTask = await PeriodicTaskModel.findById(periodicTaskId);
        if (!periodicTask) {
            return res.status(404).json({
                code: 404,
                message: '周期任务不存在'
            });
        }
        
        // 检查是否属于该用户
        if (periodicTask.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权操作此任务'
            });
        }
        
        // 检查是否已激活且已审批
        if (!periodicTask.is_active || periodicTask.approval_status !== 1) {
            return res.status(400).json({
                code: 400,
                message: '任务未激活或未通过审批'
            });
        }
        
        // 检查今天是否已完成
        const hasCompleted = await PeriodicTaskLogModel.hasCompletedToday(periodicTaskId, userId);
        if (hasCompleted) {
            return res.status(400).json({
                code: 400,
                message: '今天已完成此任务'
            });
        }
        
        // 查找今天的任务实例
        const today = new Date().toISOString().split('T')[0];
        const task = await require('../config/db').runGet(
            `SELECT * FROM tasks WHERE parent_task_id = ? AND user_id = ? AND date(due_date) = ?`,
            [periodicTaskId, userId, today]
        );
        
        if (!task) {
            return res.status(404).json({
                code: 404,
                message: '今日任务实例不存在'
            });
        }
        
        // 完成任务
        await TaskModel.complete(task.id, userId);
        
        // 创建完成记录
        await PeriodicTaskLogModel.create({
            periodicTaskId,
            taskId: task.id,
            userId,
            pointsEarned: periodicTask.points,
            remark: `完成周期任务：${periodicTask.title}`
        });
        
        // 更新周期任务完成计数
        await PeriodicTaskModel.incrementCompleted(periodicTaskId);
        
        // 增加用户积分
        if (periodicTask.points > 0) {
            await UserModel.updatePoints(userId, periodicTask.points);
        }
        
        res.json({
            code: 0,
            message: '任务完成成功',
            data: {
                taskId: task.id,
                pointsEarned: periodicTask.points,
                completedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('完成周期任务失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * GET /api/tasks/periodic/:id/logs
 * 获取周期任务完成记录
 */
router.get('/:id/logs', authMiddleware, async (req, res) => {
    try {
        const periodicTaskId = parseInt(req.params.id);
        const { page = 1, pageSize = 20 } = req.query;
        
        // 验证任务存在且属于该用户
        const periodicTask = await PeriodicTaskModel.findById(periodicTaskId);
        if (!periodicTask) {
            return res.status(404).json({
                code: 404,
                message: '周期任务不存在'
            });
        }
        
        if (periodicTask.user_id !== req.userId) {
            return res.status(403).json({
                code: 403,
                message: '无权查看此任务的记录'
            });
        }
        
        const logs = await PeriodicTaskLogModel.findByPeriodicTaskId(periodicTaskId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
        
        // 获取总数
        const count = await PeriodicTaskLogModel.countByPeriodicTaskId(periodicTaskId);
        
        res.json({
            code: 0,
            message: 'success',
            data: {
                list: logs,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        console.error('获取完成记录失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * GET /api/tasks/periodic/:id
 * 获取周期任务详情
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const periodicTask = await PeriodicTaskModel.findById(parseInt(req.params.id));
        
        if (!periodicTask) {
            return res.status(404).json({
                code: 404,
                message: '周期任务不存在'
            });
        }
        
        res.json({
            code: 0,
            message: 'success',
            data: periodicTask
        });
    } catch (error) {
        console.error('获取周期任务详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * PUT /api/tasks/periodic/:id/status
 * 更新周期任务状态（激活/停用）
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { isActive } = req.body;
        const periodicTaskId = parseInt(req.params.id);
        
        const periodicTask = await PeriodicTaskModel.findById(periodicTaskId);
        if (!periodicTask) {
            return res.status(404).json({
                code: 404,
                message: '周期任务不存在'
            });
        }
        
        if (periodicTask.user_id !== req.userId) {
            return res.status(403).json({
                code: 403,
                message: '无权操作此任务'
            });
        }
        
        await PeriodicTaskModel.updateStatus(periodicTaskId, isActive);
        
        res.json({
            code: 0,
            message: `任务已${isActive ? '激活' : '停用'}`,
            data: {
                id: periodicTaskId,
                isActive
            }
        });
    } catch (error) {
        console.error('更新任务状态失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router;
