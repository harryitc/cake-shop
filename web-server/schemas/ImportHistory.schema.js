const mongoose = require('mongoose');
const { IMPORT_MODES, IMPORT_STATUS, IMPORT_ENTITIES } = require('../config/constants');

const ImportHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: Object.values(IMPORT_ENTITIES)
  },
  fileName: {
    type: String,
    required: true
  },
  importMode: {
    type: String,
    required: true,
    enum: Object.values(IMPORT_MODES),
    default: IMPORT_MODES.UPSERT
  },
  status: {
    type: String,
    enum: Object.values(IMPORT_STATUS),
    default: IMPORT_STATUS.PROCESSING
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
