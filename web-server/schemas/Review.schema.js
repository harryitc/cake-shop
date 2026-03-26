const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cake',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    is_approved: {
      type: Boolean,
      default: true, // Mặc định tự động duyệt, có thể chuyển thành false nếu cần kiểm duyệt gắt gao
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo mỗi user chỉ đánh giá 1 sản phẩm trong 1 đơn hàng duy nhất
reviewSchema.index({ user: 1, cake: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
