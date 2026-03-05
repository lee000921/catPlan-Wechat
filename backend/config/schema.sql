-- 积分商城数据库表结构
-- 包含周期任务功能扩展

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(64) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(255),
    user_type VARCHAR(10) DEFAULT 'B', -- A: 申请者，B: 普通用户
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 物品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    points INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    limit_per_user INTEGER DEFAULT 1,
    exchange_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1, -- 1: 上架，0: 下架
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 兑换记录表
CREATE TABLE IF NOT EXISTS exchange_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(100),
    product_image VARCHAR(255),
    points INTEGER NOT NULL,
    count INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    status INTEGER DEFAULT 0, -- 0: 处理中，1: 成功，2: 失败
    order_no VARCHAR(64) UNIQUE,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==================== 周期任务功能扩展 ====================

-- 任务表（新增周期任务字段）
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0, -- 0: 待完成，1: 已完成，2: 已过期
    is_periodic INTEGER DEFAULT 0, -- 是否周期任务：0-否，1-是
    periodic_type VARCHAR(20), -- 周期类型：daily, weekly, monthly
    periodic_config TEXT, -- 周期配置（JSON）：{"weekday": 1, "day_of_month": 15, "hour": 9}
    parent_task_id INTEGER, -- 关联的周期任务配置 ID
    due_date DATE, -- 任务截止日期
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_task_id) REFERENCES periodic_tasks(id)
);

-- 周期任务配置表（新增）
CREATE TABLE IF NOT EXISTS periodic_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1, -- 是否激活：0-否，1-是
    periodic_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    periodic_config TEXT NOT NULL, -- 周期配置（JSON）
    -- daily: {"hour": 9} 每天 9 点
    -- weekly: {"weekday": 1, "hour": 9} 每周一 9 点 (weekday: 0-6, 0=周日)
    -- monthly: {"day_of_month": 15, "hour": 9} 每月 15 号 9 点
    approval_status INTEGER DEFAULT 0, -- 审批状态：0-待审批，1-已通过，2-已拒绝
    approved_by INTEGER, -- 审批人 ID
    approved_at DATETIME,
    start_date DATE NOT NULL, -- 开始日期
    end_date DATE, -- 结束日期（NULL 表示无限期）
    total_created INTEGER DEFAULT 0, -- 累计创建的任务实例数
    total_completed INTEGER DEFAULT 0, -- 累计完成的任务实例数
    last_created_at DATETIME, -- 上次创建任务实例的时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 周期任务完成记录表（新增）
CREATE TABLE IF NOT EXISTS periodic_task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    periodic_task_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL, -- 关联的任务实例 ID
    user_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    points_earned INTEGER DEFAULT 0,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (periodic_task_id) REFERENCES periodic_tasks(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_periodic ON tasks(is_periodic);
CREATE INDEX IF NOT EXISTS idx_periodic_tasks_user_id ON periodic_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_periodic_tasks_active ON periodic_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_periodic_task_logs_periodic_id ON periodic_task_logs(periodic_task_id);
CREATE INDEX IF NOT EXISTS idx_exchange_records_user_id ON exchange_records(user_id);

-- 插入示例数据（可选）
-- INSERT INTO users (openid, nickname, user_type, points) VALUES ('demo_openid', '演示用户', 'A', 1000);
