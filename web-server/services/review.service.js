const mongoose = require('mongoose');
const Review = require('../schemas/Review.schema');
const Cake = require('../schemas/Cake.schema');
const Order = require('../schemas/Order.schema');
const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES, ORDER_STATUS } = require('../config/constants');

class ReviewService {
  /**
   * Tạo đánh giá mới cho 1 bánh trong đơn hàng
   * @param {string} userId 
   * @param {Object} data - { cake_id, order_id, rating, comment }
   */
  async createReview(userId, data) {
    const { cake_id, order_id, rating, comment } = data;

    // 1. Kiểm tra quyền đánh giá (Đơn hàng phải DONE và đúng của user này)
    const order = await Order.findOne({ _id: order_id, user_id: userId, status: ORDER_STATUS.DONE });
    if (!order) {
      throw createError('Bạn chỉ có thể đánh giá những đơn hàng đã hoàn thành', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ORDER_NOT_COMPLETED);
    }

    // 2. Kiểm tra xem bánh này có trong đơn hàng không
    const hasCake = order.items.some(item => item.cake_id.toString() === cake_id);
    if (!hasCake) {
      throw createError('Sản phẩm này không nằm trong đơn hàng của bạn', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PRODUCT_NOT_IN_ORDER);
    }

    // 3. Kiểm tra xem đã đánh giá chưa (Review Schema có unique index nhưng check trước cho chắc)
    const existingReview = await Review.findOne({ user: userId, cake: cake_id, order: order_id });
    if (existingReview) {
      throw createError('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ALREADY_REVIEWED);
    }

    // 4. Tạo Review mới
    const review = await Review.create({
      user: userId,
      cake: cake_id,
      order: order_id,
      rating,
      comment,
    });

    // 5. Cập nhật average_rating và review_count trong Cake
    await this.recalculateCakeRating(cake_id);

    return review;
  }

  /**
   * Tính toán lại điểm đánh giá trung bình cho Cake
   * @param {string} cakeId 
   */
  async recalculateCakeRating(cakeId) {
    const stats = await Review.aggregate([
      { $match: { cake: new mongoose.Types.ObjectId(cakeId), is_approved: true } },
      {
        $group: {
          _id: '$cake',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Cake.findByIdAndUpdate(cakeId, {
        average_rating: parseFloat(stats[0].avgRating.toFixed(1)),
        review_count: stats[0].count,
      });
    } else {
      await Cake.findByIdAndUpdate(cakeId, {
        average_rating: 0,
        review_count: 0,
      });
    }
  }

  /**
   * Lấy danh sách đánh giá của 1 sản phẩm
   * @param {string} cakeId 
   * @param {Object} options - { page, limit }
   */
  async getCakeReviews(cakeId, { page = 1, limit = 10 }) {
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Review.find({ cake: cakeId, is_approved: true })
        .populate('user', 'name full_name email avatar_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ cake: cakeId, is_approved: true }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Lấy tất cả đánh giá (dành cho Admin quản lý)
   */
  async getAllReviewsAdmin({ page = 1, limit = 20 }) {
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Review.find()
        .populate('user', 'name email full_name avatar_url')
        .populate('cake', 'name slug image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Cập nhật trạng thái duyệt Review (Admin)
   */
  async updateReviewStatus(reviewId, isApproved) {
    const review = await Review.findByIdAndUpdate(reviewId, { is_approved: isApproved }, { new: true });
    if (!review) throw createError('Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    
    // Tính lại rating sau khi ẩn/hiện review
    await this.recalculateCakeRating(review.cake);
    return review;
  }
  /**
   * Cập nhật phản hồi cho Review (Admin)
   */
  async adminReply(reviewId, reply) {
    const review = await Review.findByIdAndUpdate(
      reviewId, 
      { reply, repliedAt: new Date() }, 
      { new: true }
    );
    if (!review) throw createError('Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    return review;
  }
}

module.exports = new ReviewService();
