const mongoose = require('mongoose');

const ImportHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['cakes', 'categories', 'orders', 'coupons'] // Mở rộng theo nhu cầu
  },
  fileName: {
    type: String,
    required: true
  },
  importMode: {
    type: String,
    required: true,
    enum: ['UPSERT', 'INSERT_ONLY', 'UPDATE_ONLY'],
    default: 'UPSERT'
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  stats: {
    total: { type: Number, default: 0 },
    success: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 }
  },
  errors: [{
    row: Number,
    rawData: Object,
    message: String
  }],
  duration: Number, // Thời gian xử lý tính bằng ms
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ImportHistory', ImportHistorySchema);
