/**
 * 周期任务完成记录模型
 */

const db = require('../config/db');

class PeriodicTaskLogModel {
    /**
     * 创建完成记录
     */
    static async create(data) {
        const sql = `
            INSERT INTO periodic_task_logs 
            (periodic_task_id, task_id, user_id, points_earned, remark)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            data.periodicTaskId,
            data.taskId,
            data.userId,
            data.pointsEarned || 0,
            data.remark || null
        ];
        
        const result = await db.runExec(sql, params);
        return result.lastID;
    }

    /**
     * 获取周期任务的完成记录
     */
    static async findByPeriodicTaskId(periodicTaskId, options = {}) {
        const { page = 1, pageSize = 20 } = options;
        const offset = (page - 1) * pageSize;
        
        const sql = `
            SELECT 
                pl.*,
                t.title as task_title,
                u.nickname as user_name
            FROM periodic_task_logs pl
            LEFT JOIN tasks t ON pl.task_id = t.id
            LEFT JOIN users u ON pl.user_id = u.id
            WHERE pl.periodic_task_id = ?
            ORDER BY pl.completed_at DESC
            LIMIT ? OFFSET ?
        `;
        
        return await db.runQuery(sql, [periodicTaskId, pageSize, offset]);
    }

    /**
     * 获取用户的完成记录
     */
    static async findByUserId(userId, options = {}) {
        const { page = 1, pageSize = 20 } = options;
        const offset = (page - 1) * pageSize;
        
        const sql = `
            SELECT 
                pl.*,
                pt.title as periodic_task_title,
                t.title as task_title
            FROM periodic_task_logs pl
            LEFT JOIN periodic_tasks pt ON pl.periodic_task_id = pt.id
            LEFT JOIN tasks t ON pl.task_id = t.id
            WHERE pl.user_id = ?
            ORDER BY pl.completed_at DESC
            LIMIT ? OFFSET ?
        `;
        
        return await db.runQuery(sql, [userId, pageSize, offset]);
    }

    /**
     * 统计完成次数
     */
    static async countByPeriodicTaskId(periodicTaskId) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM periodic_task_logs 
            WHERE periodic_task_id = ?
        `;
        
        const row = await db.runGet(sql, [periodicTaskId]);
        return row ? row.count : 0;
    }

    /**
     * 检查用户今天是否已完成周期任务
     */
    static async hasCompletedToday(periodicTaskId, userId) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM periodic_task_logs 
            WHERE periodic_task_id = ? 
            AND user_id = ?
            AND date(completed_at) = date('now')
        `;
        
        const row = await db.runGet(sql, [periodicTaskId, userId]);
        return row && row.count > 0;
    }
}

module.exports = PeriodicTaskLogModel;
