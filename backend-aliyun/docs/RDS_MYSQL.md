# 使用RDS MySQL数据库

本项目支持使用阿里云RDS MySQL数据库，提供更稳定、更易维护的数据存储方案。

## 📋 准备工作

### 1. 购买阿里云RDS MySQL

1. 登录阿里云控制台
2. 搜索"云数据库 RDS"
3. 购买MySQL实例
   - **推荐配置**：1核2G，20GB存储
   - **版本**：MySQL 8.0
   - **地域**：与ECS同地域
   - **网络**：VPC网络（与ECS在同一VPC）

### 2. 配置RDS

1. **设置白名单**
   - 添加ECS内网IP
   - 或添加 `0.0.0.0/0`（开发测试用，生产环境不推荐）

2. **创建数据库账号**
   ```
   用户名：catplan
   密码：设置强密码
   权限：读写权限
   ```

3. **创建数据库**
   ```
   数据库名：catplan
   字符集：utf8mb4
   排序规则：utf8mb4_unicode_ci
   ```

## 🚀 快速开始

### 1. 初始化数据库

连接到RDS MySQL：

```bash
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -P 3306 -u catplan -p
```

执行初始化脚本：

```bash
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -P 3306 -u catplan -p catplan < scripts/init_mysql.sql
```

或在MySQL客户端中执行：

```sql
source /path/to/scripts/init_mysql.sql;
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库类型
DB_TYPE=mysql

# RDS MySQL 配置
MYSQL_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
MYSQL_PORT=3306
MYSQL_USER=catplan
MYSQL_PASSWORD=your-strong-password
MYSQL_DATABASE=catplan
```

### 3. 安装依赖

```bash
npm install
```

确保已安装 `mysql2` 和 `sequelize`：

```bash
npm install mysql2 sequelize --save
```

### 4. 启动服务

```bash
npm start
```

## 📊 数据库结构

### 核心表

1. **users** - 用户表
2. **checkin_history** - 签到历史
3. **tasks** - 任务表
4. **user_tasks** - 用户任务记录
5. **goods** - 商品表
6. **exchange_records** - 兑换记录

### ER图

```
users (用户)
  ├── checkin_history (签到历史) [1:N]
  ├── user_tasks (任务记录) [1:N]
  └── exchange_records (兑换记录) [1:N]

tasks (任务)
  └── user_tasks (任务记录) [1:N]
```

## 🔄 从MongoDB迁移

### 方案1：使用迁移脚本（推荐）

```bash
node scripts/migrateToMySQL.js
```

### 方案2：手动导出导入

1. **导出MongoDB数据**

```bash
mongoexport --uri="mongodb://..." --collection=users --out=users.json
mongoexport --uri="mongodb://..." --collection=tasks --out=tasks.json
mongoexport --uri="mongodb://..." --collection=goods --out=goods.json
```

2. **编写转换脚本**

```javascript
const fs = require('fs');
const mysql = require('mysql2/promise');

async function importUsers() {
  const data = JSON.parse(fs.readFileSync('users.json'));
  const conn = await mysql.createConnection({
    host: 'rm-xxxxx.mysql.rds.aliyuncs.com',
    user: 'catplan',
    password: 'your-password',
    database: 'catplan'
  });

  for (const user of data) {
    await conn.execute(
      `INSERT INTO users (open_id, nick_name, avatar_url, points, level, checkin_days) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.openId, user.nickName, user.avatarUrl, user.points || 0, 
       user.level || 1, user.checkinDays || 0]
    );
  }
  
  console.log('导入完成');
  await conn.end();
}

importUsers();
```

## 🔧 常用操作

### 查看数据

```sql
-- 查看用户数量
SELECT COUNT(*) FROM users;

-- 查看碎片排行榜
SELECT nick_name, points FROM users ORDER BY points DESC LIMIT 10;

-- 查看今日签到人数
SELECT COUNT(DISTINCT open_id) FROM checkin_history 
WHERE checkin_date = CURDATE();

-- 查看商品兑换情况
SELECT g.title, COUNT(*) as exchange_count, SUM(e.points) as total_points
FROM exchange_records e
JOIN goods g ON e.good_id = g.id
GROUP BY g.id
ORDER BY exchange_count DESC;
```

### 备份数据

```bash
# 备份整个数据库
mysqldump -h rm-xxxxx.mysql.rds.aliyuncs.com -u catplan -p catplan > backup_$(date +%Y%m%d).sql

# 仅备份数据（不含结构）
mysqldump -h rm-xxxxx.mysql.rds.aliyuncs.com -u catplan -p --no-create-info catplan > data_backup.sql

# 恢复备份
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u catplan -p catplan < backup_20250101.sql
```

### 性能优化

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看索引使用情况
SHOW INDEX FROM users;

-- 分析表
ANALYZE TABLE users;

-- 优化表
OPTIMIZE TABLE users;
```

## 📈 监控告警

### RDS控制台监控

1. 登录阿里云RDS控制台
2. 查看监控指标：
   - CPU使用率
   - 内存使用率
   - IOPS
   - 连接数
   - 慢查询

### 设置告警

1. 进入"监控告警"
2. 设置告警规则：
   - CPU > 80%
   - 内存 > 80%
   - 慢查询 > 10个/分钟

## 💰 成本优化

1. **选择合适规格**：根据实际用户量选择，初期用最小规格
2. **包年付费**：比按量付费便宜30%
3. **定期清理数据**：删除过期的签到记录、日志等
4. **优化查询**：添加索引，减少慢查询

## ⚠️ 注意事项

1. **字符集**：必须使用 utf8mb4，支持emoji表情
2. **时区**：设置为 `+08:00` 东八区
3. **连接池**：合理配置连接池大小，避免连接耗尽
4. **备份**：RDS自动备份，建议保留7天
5. **安全**：生产环境严格设置白名单，不要开放公网访问

## 🔗 相关文档

- [阿里云RDS MySQL文档](https://help.aliyun.com/product/26090.html)
- [Sequelize文档](https://sequelize.org/)
- [MySQL 8.0文档](https://dev.mysql.com/doc/refman/8.0/en/)
