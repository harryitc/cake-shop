const mongoose = require('mongoose');
const Review = require('../schemas/Review.schema');
const Cake = require('../schemas/Cake.schema');
const Order = require('../schemas/Order.schema');
const ApiError = require('../utils/error.factory');
const { ORDER_STATUS } = require('../config/constants');

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
      throw ApiError.BAD_REQUEST('Bạn chỉ có thể đánh giá những đơn hàng đã hoàn thành');
    }

    // 2. Kiểm tra xem bánh này có trong đơn hàng không
    const hasCake = order.items.some(item => item.cake_id.toString() === cake_id);
    if (!hasCake) {
      throw ApiError.BAD_REQUEST('Sản phẩm này không nằm trong đơn hàng của bạn');
    }

    // 3. Kiểm tra xem đã đánh giá chưa (Review Schema có unique index nhưng check trước cho chắc)
    const existingReview = await Review.findOne({ user: userId, cake: cake_id, order: order_id });
    if (existingReview) {
      throw ApiError.BAD_REQUEST('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi');
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
   * Tính toán lại điểm đánh giá trung bình cho Cake (Refactored: JS Processing)
   */
  async recalculateCakeRating(cakeId) {
    // 1. Lấy tất cả rating hợp lệ của sản phẩm này (Simple Query)
    const approvedReviews = await Review.find({ 
      cake: cakeId, 
      is_approved: true 
    }).select('rating').lean();

    const count = approvedReviews.length;
    
    // 2. Tính toán bằng JS
    const totalRating = approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

    // 3. Cập nhật vào Cake
    await Cake.findByIdAndUpdate(cakeId, {
      average_rating: avgRating,
      review_count: count,
    });
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
    if (!review) throw ApiError.NOT_FOUND('Không tìm thấy đánh giá');
    
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
    if (!review) throw ApiError.NOT_FOUND('Không tìm thấy đánh giá');
    return review;
  }
}

module.exports = new ReviewService();
