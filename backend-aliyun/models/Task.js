const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  _id: String, // 使用自定义ID（与原数据保持一致）
  title: {
    type: String,
    required: true
  },
  desc: String,
  points: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['daily', 'growth'],
    required: true
  },
  maxProgress: {
    type: Number,
    default: 1
  },
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  _id: false, // 使用自定义_id
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
