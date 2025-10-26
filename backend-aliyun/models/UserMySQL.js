// MySQL 版本的用户模型 (使用 Sequelize)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    openId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'open_id'
    },
    nickName: {
      type: DataTypes.STRING(128),
      field: 'nick_name'
    },
    avatarUrl: {
      type: DataTypes.STRING(512),
      field: 'avatar_url'
    },
    gender: {
      type: DataTypes.TINYINT
    },
    country: {
      type: DataTypes.STRING(64)
    },
    province: {
      type: DataTypes.STRING(64)
    },
    city: {
      type: DataTypes.STRING(64)
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    checkinDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'checkin_days'
    },
    lastCheckinDate: {
      type: DataTypes.DATE,
      field: 'last_checkin_date'
    },
    lastLotteryDate: {
      type: DataTypes.DATE,
      field: 'last_lottery_date'
    },
    registerTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'register_time'
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      field: 'last_login_time'
    }
  }, {
    tableName: 'users',
    underscored: true,
    indexes: [
      { fields: ['open_id'] },
      { fields: ['points'] }
    ]
  });

  return User;
};
