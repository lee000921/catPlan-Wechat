const mongoose = require('mongoose');

const goodSchema = new mongoose.Schema({
  _id: String, // 使用自定义ID
  title: {
    type: String,
    required: true
  },
  image: String,
  points: {
    type: Number,
    required: true
  },
  originPrice: Number,
  stock: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  type: String,
  description: String,
  deliveryInfo: String,
  exchangeLimit: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  _id: false,
  timestamps: true
});

module.exports = mongoose.model('Good', goodSchema);
