const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image_url: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tự gen slug từ name trước khi lưu nếu slug chưa có (hoặc khi name thay đổi)
cakeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    // Loại bỏ ký tự đặc biệt
      .replace(/[\s_-]+/g, '-')    // Đổi khoảng trắng, gạch dưới thành gạch ngang
      .replace(/^-+|-+$/g, '');    // Loại bỏ gạch ngang ở 2 đầu
  }
  next();
});

module.exports = mongoose.model('Cake', cakeSchema);
