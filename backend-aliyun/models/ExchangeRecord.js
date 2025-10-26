const mongoose = require('mongoose');

const exchangeRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  openId: {
    type: String,
    required: true,
    index: true
  },
  goodId: {
    type: String,
    required: true
  },
  goodTitle: String,
  goodImage: String,
  points: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  address: {
    name: String,
    phone: String,
    province: String,
    city: String,
    district: String,
    detail: String
  },
  expressCompany: String,
  expressNumber: String,
  remark: String
}, {
  timestamps: true
});

// 索引
exchangeRecordSchema.index({ openId: 1, createdAt: -1 });
exchangeRecordSchema.index({ status: 1 });

module.exports = mongoose.model('ExchangeRecord', exchangeRecordSchema);
