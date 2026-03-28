const mongoose = require('mongoose');
const { POINT_TYPES } = require('../config/constants');

const pointHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    points_change: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(POINT_TYPES),
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

pointHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PointHistory', pointHistorySchema);
