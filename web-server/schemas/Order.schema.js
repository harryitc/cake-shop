const mongoose = require('mongoose');

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
    final_price: {
      type: Number,
      required: true, // total_price - discount_amount
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'DONE', 'REJECTED'],
      default: 'PENDING',
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
