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
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image_url: {
      type: String,
      default: '',
    },
    model_url: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
      }
    ],
    tags: [String], // vd: ['Best Seller', 'New Arrival', 'Low Sugar']
    ingredients: [String],
    specifications: {
      weight: String,
      servings: String,
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
      min: 0,
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
      .normalize('NFD') // Tách dấu
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd')
      .replace(/[^\w\s-]/g, '')    // Loại bỏ ký tự đặc biệt
      .replace(/[\s_-]+/g, '-')    // Đổi khoảng trắng, gạch dưới thành gạch ngang
      .replace(/^-+|-+$/g, '');    // Loại bỏ gạch ngang ở 2 đầu
  }
  next();
});

module.exports = mongoose.model('Cake', cakeSchema);
