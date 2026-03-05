/**
 * 任务实例模型
 */

const db = require('../config/db');

class TaskModel {
    /**
     * 创建任务实例
     */
    static async create(data) {
        const sql = `
            INSERT INTO tasks 
            (user_id, title, description, points, is_periodic, periodic_type, periodic_config, parent_task_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.userId,
            data.title,
            data.description,
            data.points || 0,
            data.isPeriodic ? 1 : 0,
            data.periodicType || null,
            data.periodicConfig ? JSON.stringify(data.periodicConfig) : null,
            data.parentTaskId || null,
            data.dueDate
        ];
        
        const result = await db.runExec(sql, params);
        return result.lastID;
    }

    /**
     * 获取用户的任务列表
     */
    static async findByUserId(userId, options = {}) {
        const { status, isPeriodic, page = 1, pageSize = 20 } = options;
        const offset = (page - 1) * pageSize;
        
        let sql = `
            SELECT 
                t.*,
                pt.title as periodic_task_title
            FROM tasks t
            LEFT JOIN periodic_tasks pt ON t.parent_task_id = pt.id
            WHERE t.user_id = ?
        `;
        const params = [userId];
        
        if (status !== undefined) {
            sql += ' AND t.status = ?';
            params.push(status);
        }
        
        if (isPeriodic !== undefined) {
            sql += ' AND t.is_periodic = ?';
            params.push(isPeriodic ? 1 : 0);
        }
        
        sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        const rows = await db.runQuery(sql, params);
        
        // 解析 periodic_config JSON
        return rows.map(row => ({
            ...row,
            periodicConfig: row.periodic_config ? JSON.parse(row.periodic_config) : null
        }));
    }

    /**
     * 根据 ID 获取任务
     */
    static async findById(id) {
        const sql = `
            SELECT 
                t.*,
                u.nickname as user_name,
                pt.title as periodic_task_title
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN periodic_tasks pt ON t.parent_task_id = pt.id
            WHERE t.id = ?
        `;
        
        const row = await db.runGet(sql, [id]);
        if (row && row.periodic_config) {
            row.periodicConfig = JSON.parse(row.periodic_config);
        }
        return row;
    }

    /**
     * 完成任务
     */
    static async complete(id, userId) {
        const sql = `
            UPDATE tasks 
            SET 
                status = 1,
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ? AND status = 0
        `;
        return await db.runExec(sql, [id, userId]);
    }

    /**
     * 更新任务状态
     */
    static async updateStatus(id, status) {
        const sql = `
            UPDATE tasks 
            SET 
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [status, id]);
    }

    /**
     * 获取待完成的周期任务实例
     */
    static async findPendingPeriodicTasks() {
        const sql = `
            SELECT 
                t.*,
                pt.title as periodic_task_title
            FROM tasks t
            INNER JOIN periodic_tasks pt ON t.parent_task_id = pt.id
            WHERE t.status = 0
            AND t.is_periodic = 1
            ORDER BY t.due_date ASC
        `;
        
        const rows = await db.runQuery(sql);
        return rows.map(row => ({
            ...row,
            periodicConfig: row.periodic_config ? JSON.parse(row.periodic_config) : null
        }));
    }

    /**
     * 删除任务
     */
    static async delete(id) {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        return await db.runExec(sql, [id]);
    }
}

module.exports = TaskModel;
