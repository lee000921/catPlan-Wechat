/**
 * 任务 API 路由
 */

const express = require('express');
const router = express.Router();
const { TaskModel, PeriodicTaskModel, UserModel } = require('../models');
const db = require('../config/db');

/**
 * 验证用户中间件
 */
function authMiddleware(req, res, next) {
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
 * GET /api/tasks
 * 获取用户的任务列表
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, isPeriodic, page = 1, pageSize = 20 } = req.query;
        
        const tasks = await TaskModel.findByUserId(req.userId, {
            status: status !== undefined ? parseInt(status) : undefined,
            isPeriodic: isPeriodic !== undefined ? parseInt(isPeriodic) : undefined,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
        
        // 获取总数
        let countSql = `SELECT COUNT(*) as total FROM tasks WHERE user_id = ?`;
        const countParams = [req.userId];
        
        if (status !== undefined) {
            countSql += ' AND status = ?';
            countParams.push(parseInt(status));
        }
        
        const countResult = await db.runGet(countSql, countParams);
        
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
        console.error('获取任务列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * GET /api/tasks/today
 * 获取今日任务
 * 注意：必须放在 /:id 之前，否则会被 /:id 匹配
 */
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const sql = `
            SELECT 
                t.*,
                pt.title as periodic_task_title
            FROM tasks t
            LEFT JOIN periodic_tasks pt ON t.parent_task_id = pt.id
            WHERE t.user_id = ?
            AND date(t.due_date) = ?
            ORDER BY t.created_at DESC
        `;
        
        const tasks = await db.runQuery(sql, [req.userId, today]);
        
        res.json({
            code: 0,
            message: 'success',
            data: {
                list: tasks.map(row => ({
                    ...row,
                    periodicConfig: row.periodic_config ? JSON.parse(row.periodic_config) : null
                })),
                date: today
            }
        });
    } catch (error) {
        console.error('获取今日任务失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * GET /api/tasks/:id
 * 获取任务详情
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await TaskModel.findById(parseInt(req.params.id));
        
        if (!task) {
            return res.status(404).json({
                code: 404,
                message: '任务不存在'
            });
        }
        
        if (task.user_id !== req.userId) {
            return res.status(403).json({
                code: 403,
                message: '无权查看此任务'
            });
        }
        
        res.json({
            code: 0,
            message: 'success',
            data: task
        });
    } catch (error) {
        console.error('获取任务详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * POST /api/tasks/:id/complete
 * 完成任务
 */
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.userId;
        
        const task = await TaskModel.findById(taskId);
        if (!task) {
            return res.status(404).json({
                code: 404,
                message: '任务不存在'
            });
        }
        
        if (task.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权操作此任务'
            });
        }
        
        if (task.status !== 0) {
            return res.status(400).json({
                code: 400,
                message: '任务已完成或已过期'
            });
        }
        
        // 完成任务
        await TaskModel.complete(taskId, userId);
        
        // 如果是周期任务，增加用户积分
        if (task.is_periodic && task.points > 0) {
            await UserModel.updatePoints(userId, task.points);
        }
        
        res.json({
            code: 0,
            message: '任务完成成功',
            data: {
                taskId,
                pointsEarned: task.points,
                completedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('完成任务失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router;
