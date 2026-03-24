const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cake_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cake',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo compound index để db query nhanh hơn và dễ đếm unique items của user
cartItemSchema.index({ user_id: 1, cake_id: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
