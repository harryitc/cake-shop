const Coupon = require('../schemas/Coupon.schema');
const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

class CouponService {
  /**
   * Tạo mã giảm giá mới
   */
  async createCoupon(data) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw createError('Mã giảm giá đã tồn tại', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.DUPLICATE_ERROR);
    
    return await Coupon.create(data);
  }

  /**
   * Lấy danh sách mã giảm giá (Admin)
   */
  async getAllCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  /**
   * Kiểm tra và tính toán giá trị giảm giá của mã
   * @param {string} code 
   * @param {number} orderTotal 
   */
  async validateCoupon(code, orderTotal) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), is_active: true });
    
    if (!coupon) {
      throw createError('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa', HTTP_STATUS.NOT_FOUND, ERROR_CODES.COUPON_INVALID);
    }

    const now = new Date();
    if (now < coupon.start_date) {
      throw createError('Mã giảm giá chưa đến thời gian sử dụng', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_NOT_STARTED);
    }
    if (now > coupon.end_date) {
      throw createError('Mã giảm giá đã hết hạn', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_EXPIRED);
    }

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      throw createError('Mã giảm giá đã hết lượt sử dụng', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_LIMIT_REACHED);
    }

    if (orderTotal < coupon.min_order_value) {
      throw createError(`Giá trị đơn hàng tối thiểu để dùng mã này là ${coupon.min_order_value.toLocaleString()}đ`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_MIN_VALUE_NOT_MET);
    }

    let discountAmount = 0;
    if (coupon.type === 'FIXED') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'PERCENT') {
      discountAmount = (orderTotal * coupon.value) / 100;
      if (coupon.max_discount_value) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_value);
      }
    }

    // Đảm bảo số tiền giảm không vượt quá tổng tiền đơn hàng
    discountAmount = Math.min(discountAmount, orderTotal);

    return {
      coupon,
      discountAmount,
      finalPrice: orderTotal - discountAmount
    };
  }

  /**
   * Cập nhật số lần sử dụng mã
   */
  async incrementUsedCount(code, session = null) {
    return await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { used_count: 1 } },
      { session, new: true }
    );
  }

  async updateCoupon(id, data) {
    return await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCoupon(id) {
    return await Coupon.findByIdAndDelete(id);
  }
}

module.exports = new CouponService();
