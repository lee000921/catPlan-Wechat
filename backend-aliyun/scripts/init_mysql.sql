-- 阿里云RDS MySQL 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS catplan DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE catplan;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  open_id VARCHAR(64) UNIQUE NOT NULL COMMENT '微信OpenID',
  nick_name VARCHAR(128) COMMENT '昵称',
  avatar_url VARCHAR(512) COMMENT '头像',
  gender TINYINT COMMENT '性别 0未知 1男 2女',
  country VARCHAR(64) COMMENT '国家',
  province VARCHAR(64) COMMENT '省份',
  city VARCHAR(64) COMMENT '城市',
  points INT DEFAULT 0 COMMENT '碎片数量',
  level INT DEFAULT 1 COMMENT '等级',
  checkin_days INT DEFAULT 0 COMMENT '累计签到天数',
  last_checkin_date DATETIME COMMENT '最后签到时间',
  last_lottery_date DATETIME COMMENT '最后抽奖时间',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  last_login_time DATETIME COMMENT '最后登录时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_open_id (open_id),
  INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 签到历史表
CREATE TABLE IF NOT EXISTS checkin_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  points INT DEFAULT 0 COMMENT '获得碎片',
  checkin_date DATE NOT NULL COMMENT '签到日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_open_id (open_id),
  INDEX idx_checkin_date (checkin_date),
  UNIQUE KEY uk_user_date (open_id, checkin_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到历史';

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(32) PRIMARY KEY COMMENT '任务ID',
  title VARCHAR(128) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  points INT NOT NULL COMMENT '奖励碎片',
  category ENUM('daily', 'growth') NOT NULL COMMENT '任务类型',
  max_progress INT DEFAULT 1 COMMENT '最大进度',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 用户任务记录表
CREATE TABLE IF NOT EXISTS user_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  task_id VARCHAR(32) NOT NULL COMMENT '任务ID',
  finish_time DATETIME NOT NULL COMMENT '完成时间',
  points INT DEFAULT 0 COMMENT '获得碎片',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_task (user_id, task_id),
  INDEX idx_open_id (open_id),
  INDEX idx_finish_time (finish_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务记录';

-- 商品表
CREATE TABLE IF NOT EXISTS goods (
  id VARCHAR(32) PRIMARY KEY COMMENT '商品ID',
  title VARCHAR(128) NOT NULL COMMENT '商品名称',
  image VARCHAR(512) COMMENT '商品图片',
  points INT NOT NULL COMMENT '所需碎片',
  origin_price DECIMAL(10,2) COMMENT '原价',
  stock INT DEFAULT 0 COMMENT '库存',
  sold INT DEFAULT 0 COMMENT '已售',
  type VARCHAR(32) COMMENT '商品类型',
  description TEXT COMMENT '商品描述',
  delivery_info TEXT COMMENT '配送信息',
  exchange_limit INT DEFAULT 1 COMMENT '兑换限制',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_points (points),
  INDEX idx_stock (stock),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 兑换记录表
CREATE TABLE IF NOT EXISTS exchange_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  open_id VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  good_id VARCHAR(32) NOT NULL COMMENT '商品ID',
  good_title VARCHAR(128) COMMENT '商品名称',
  good_image VARCHAR(512) COMMENT '商品图片',
  points INT NOT NULL COMMENT '消耗碎片',
  status ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  receiver_name VARCHAR(64) COMMENT '收货人',
  receiver_phone VARCHAR(32) COMMENT '手机号',
  receiver_province VARCHAR(64) COMMENT '省份',
  receiver_city VARCHAR(64) COMMENT '城市',
  receiver_district VARCHAR(64) COMMENT '区县',
  receiver_detail TEXT COMMENT '详细地址',
  express_company VARCHAR(64) COMMENT '快递公司',
  express_number VARCHAR(128) COMMENT '快递单号',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_open_id (open_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换记录';

-- 插入测试数据（可选）
-- INSERT INTO users (open_id, nick_name, points, level) VALUES ('test_openid', '测试用户', 100, 1);
