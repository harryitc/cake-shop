const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');

const orderItemSchema = new mongoose.Schema(
  {
    cake_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cake',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    variant_size: {
      type: String,
      default: '',
    },
    price_at_buy: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false // Optional, giấu id của subdoc để JSON response gọn hơn
  }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    coupon_code: {
      type: String,
      default: '',
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    points_used: {
      type: Number,
      default: 0,
    },
    points_discount_amount: {
      type: Number,
      default: 0,
    },
    points_earned: {
      type: Number,
      default: 0,
    },
    final_price: {
      type: Number,
      required: true, // total_price - discount_amount - points_discount_amount
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    address: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
