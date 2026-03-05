/**
 * 数据库初始化模块
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbConfig = require('./database');

let db = null;

/**
 * 初始化数据库连接
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        // 确保数据目录存在
        const dataDir = path.dirname(dbConfig.database);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`创建数据目录：${dataDir}`);
        }

        // 创建数据库连接
        db = new sqlite3.Database(dbConfig.database, (err) => {
            if (err) {
                console.error('数据库连接失败:', err);
                reject(err);
                return;
            }
            console.log('数据库连接成功:', dbConfig.database);
            
            // 启用外键约束
            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) {
                    console.error('启用外键约束失败:', err);
                } else {
                    console.log('外键约束已启用');
                }
            });
            
            resolve(db);
        });
    });
}

/**
 * 执行 SQL 脚本创建表
 */
function createTables() {
    return new Promise((resolve, reject) => {
        const schemaPath = path.join(__dirname, 'schema.sql');
        fs.readFile(schemaPath, 'utf8', (err, sql) => {
            if (err) {
                console.error('读取 schema.sql 失败:', err);
                reject(err);
                return;
            }
            
            // 移除注释行，然后按分号分割
            const cleanedSql = sql
                .split('\n')
                .filter(line => !line.trim().startsWith('--'))
                .join('\n');
            
            const statements = cleanedSql.split(';').filter(s => s.trim());
            let completed = 0;
            let errors = [];
            
            function executeNext() {
                if (completed >= statements.length) {
                    if (errors.length > 0) {
                        console.log(`表创建完成，但有 ${errors.length} 个非致命错误`);
                    } else {
                        console.log('所有表创建完成');
                    }
                    resolve();
                    return;
                }
                
                const statement = statements[completed].trim();
                if (!statement || statement.startsWith('--')) {
                    completed++;
                    executeNext();
                    return;
                }
                
                db.run(statement, function(err) {
                    if (err) {
                        // 忽略 "already exists" 错误
                        if (err.message.includes('already exists')) {
                            console.log(`跳过已存在的对象 [${completed + 1}]`);
                        } else {
                            console.error(`执行 SQL 失败 [${completed + 1}]:`, err.message);
                            errors.push({ index: completed + 1, error: err.message });
                        }
                    }
                    completed++;
                    executeNext();
                });
            }
            
            executeNext();
        });
    });
}

/**
 * 获取数据库实例
 */
function getDb() {
    return db;
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('数据库连接已关闭');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

/**
 * 运行查询（返回多行）
 */
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

/**
 * 运行单行查询
 */
function runGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

/**
 * 运行插入/更新/删除
 */
function runExec(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
}

module.exports = {
    initDatabase,
    createTables,
    getDb,
    closeDatabase,
    runQuery,
    runGet,
    runExec
};
