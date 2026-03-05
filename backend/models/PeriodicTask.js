/**
 * 周期任务模型
 */

const db = require('../config/db');

class PeriodicTaskModel {
    /**
     * 创建周期任务申请
     */
    static async create(data) {
        const sql = `
            INSERT INTO periodic_tasks 
            (user_id, title, description, points, periodic_type, periodic_config, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.userId,
            data.title,
            data.description,
            data.points || 0,
            data.periodicType,
            JSON.stringify(data.periodicConfig),
            data.startDate,
            data.endDate || null
        ];
        
        const result = await db.runExec(sql, params);
        return result.lastID;
    }

    /**
     * 获取用户的周期任务列表
     */
    static async findByUserId(userId, options = {}) {
        const { status, page = 1, pageSize = 10 } = options;
        const offset = (page - 1) * pageSize;
        
        let sql = `
            SELECT 
                pt.*,
                u.nickname as creator_name,
                (SELECT COUNT(*) FROM tasks t WHERE t.parent_task_id = pt.id) as total_instances,
                (SELECT COUNT(*) FROM tasks t WHERE t.parent_task_id = pt.id AND t.status = 1) as completed_instances
            FROM periodic_tasks pt
            LEFT JOIN users u ON pt.user_id = u.id
            WHERE pt.user_id = ?
        `;
        const params = [userId];
        
        if (status !== undefined) {
            sql += ' AND pt.is_active = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY pt.created_at DESC LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        const rows = await db.runQuery(sql, params);
        
        // 解析 periodic_config JSON
        return rows.map(row => ({
            ...row,
            periodicConfig: JSON.parse(row.periodic_config)
        }));
    }

    /**
     * 根据 ID 获取周期任务
     */
    static async findById(id) {
        const sql = `
            SELECT 
                pt.*,
                u.nickname as creator_name,
                au.nickname as approved_by_name
            FROM periodic_tasks pt
            LEFT JOIN users u ON pt.user_id = u.id
            LEFT JOIN users au ON pt.approved_by = au.id
            WHERE pt.id = ?
        `;
        
        const row = await db.runGet(sql, [id]);
        if (row) {
            row.periodicConfig = JSON.parse(row.periodic_config);
        }
        return row;
    }

    /**
     * 更新周期任务状态
     */
    static async updateStatus(id, isActive) {
        const sql = `
            UPDATE periodic_tasks 
            SET is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [isActive ? 1 : 0, id]);
    }

    /**
     * 审批周期任务
     */
    static async approve(id, approvedBy, approved = true) {
        const sql = `
            UPDATE periodic_tasks 
            SET 
                approval_status = ?,
                approved_by = ?,
                approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [approved ? 1 : 2, approvedBy, id]);
    }

    /**
     * 更新最后创建时间
     */
    static async updateLastCreated(id) {
        const sql = `
            UPDATE periodic_tasks 
            SET 
                last_created_at = CURRENT_TIMESTAMP,
                total_created = total_created + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [id]);
    }

    /**
     * 增加完成计数
     */
    static async incrementCompleted(id) {
        const sql = `
            UPDATE periodic_tasks 
            SET 
                total_completed = total_completed + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [id]);
    }

    /**
     * 获取需要创建任务实例的周期任务
     */
    static async findDueTasks() {
        const sql = `
            SELECT * FROM periodic_tasks
            WHERE is_active = 1 
            AND approval_status = 1
            AND (end_date IS NULL OR end_date >= date('now'))
            AND start_date <= date('now')
        `;
        
        const rows = await db.runQuery(sql);
        return rows.map(row => ({
            ...row,
            periodicType: row.periodic_type,
            periodicConfig: JSON.parse(row.periodic_config),
            lastCreatedAt: row.last_created_at
        }));
    }

    /**
     * 删除周期任务
     */
    static async delete(id) {
        const sql = 'DELETE FROM periodic_tasks WHERE id = ?';
        return await db.runExec(sql, [id]);
    }
}

module.exports = PeriodicTaskModel;
