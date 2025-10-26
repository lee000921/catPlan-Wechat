const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickName: String,
  avatarUrl: String,
  gender: Number,
  country: String,
  province: String,
  city: String,
  language: String,
  
  // 碎片和等级
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  
  // 签到相关
  checkinDays: {
    type: Number,
    default: 0
  },
  lastCheckinDate: Date,
  checkinHistory: [{
    date: Date,
    points: Number
  }],
  
  // 任务记录
  tasks: [{
    taskId: String,
    finishTime: Date,
    points: Number
  }],
  
  // 兑换记录（引用）
  exchanges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRecord'
  }],
  
  // 时间戳
  registerTime: {
    type: Date,
    default: Date.now
  },
  lastLoginTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ openId: 1 });
userSchema.index({ points: -1 });
userSchema.index({ checkinDays: -1 });

module.exports = mongoose.model('User', userSchema);
