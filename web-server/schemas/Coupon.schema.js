const mongoose = require('mongoose');
const { COUPON_TYPES } = require('../config/constants');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Mã luôn in hoa để tránh nhầm lẫn
    },
    type: {
      type: String,
      enum: Object.values(COUPON_TYPES),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    min_order_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    max_discount_value: {
      type: Number,
      default: null, // Chỉ dùng cho loại PERCENT
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    usage_limit: {
      type: Number,
      default: null, // null là không giới hạn
    },
    used_count: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
