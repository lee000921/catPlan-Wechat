/**
 * 用户模型
 */

const db = require('../config/db');

class UserModel {
    /**
     * 根据 openid 获取或创建用户
     */
    static async findByOpenid(openid) {
        const sql = 'SELECT * FROM users WHERE openid = ?';
        return await db.runGet(sql, [openid]);
    }

    /**
     * 创建用户
     */
    static async create(data) {
        const sql = `
            INSERT INTO users (openid, nickname, avatar_url, user_type, points)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            data.openid,
            data.nickname || null,
            data.avatarUrl || null,
            data.userType || 'B',
            data.points || 0
        ];
        
        const result = await db.runExec(sql, params);
        return result.lastID;
    }

    /**
     * 根据 ID 获取用户
     */
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return await db.runGet(sql, [id]);
    }

    /**
     * 更新用户信息
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        
        if (data.nickname !== undefined) {
            fields.push('nickname = ?');
            params.push(data.nickname);
        }
        if (data.avatarUrl !== undefined) {
            fields.push('avatar_url = ?');
            params.push(data.avatarUrl);
        }
        if (data.userType !== undefined) {
            fields.push('user_type = ?');
            params.push(data.userType);
        }
        
        if (fields.length === 0) return null;
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        return await db.runExec(sql, params);
    }

    /**
     * 更新用户积分
     */
    static async updatePoints(id, points) {
        const sql = `
            UPDATE users 
            SET 
                points = points + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return await db.runExec(sql, [points, id]);
    }

    /**
     * 获取用户积分余额
     */
    static async getPoints(id) {
        const sql = 'SELECT points FROM users WHERE id = ?';
        const row = await db.runGet(sql, [id]);
        return row ? row.points : 0;
    }

    /**
     * 检查用户是否有足够积分
     */
    static async hasEnoughPoints(id, requiredPoints) {
        const points = await this.getPoints(id);
        return points >= requiredPoints;
    }
}

module.exports = UserModel;
