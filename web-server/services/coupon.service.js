const Coupon = require('../schemas/Coupon.schema');
const Order = require('../schemas/Order.schema');
const Cake = require('../schemas/Cake.schema');
const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES, ORDER_STATUS } = require('../config/constants');

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
    return await Coupon.find().populate('applicable_categories').sort({ createdAt: -1 });
  }

  /**
   * Kiểm tra và tính toán giá trị giảm giá của mã
   * @param {string} code 
   * @param {number} orderTotal 
   * @param {string} userId 
   * @param {Array} cartItems Danh sách các mặt hàng trong giỏ [{ cake_id, quantity, price_at_buy }]
   */
  async validateCoupon(code, orderTotal, userId = null, cartItems = []) {
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

    // 1. Kiểm tra giới hạn tổng lượt dùng toàn hệ thống
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      throw createError('Mã giảm giá đã hết lượt sử dụng', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_LIMIT_REACHED);
    }

    // 2. Kiểm tra giới hạn lượt dùng của từng người dùng
    if (userId && coupon.usage_limit_per_user) {
      const usedByUserCount = await Order.countDocuments({
        user_id: userId,
        coupon_code: coupon.code,
        status: { $ne: ORDER_STATUS.REJECTED } // Không tính đơn bị từ chối/hủy
      });

      if (usedByUserCount >= coupon.usage_limit_per_user) {
        throw createError(`Bạn đã sử dụng mã này tối đa ${coupon.usage_limit_per_user} lần`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_LIMIT_REACHED);
      }
    }

    // 3. Kiểm tra giá trị đơn hàng tối thiểu
    if (orderTotal < coupon.min_order_value) {
      throw createError(`Giá trị đơn hàng tối thiểu để dùng mã này là ${coupon.min_order_value.toLocaleString()}đ`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_MIN_VALUE_NOT_MET);
    }

    // 4. Kiểm tra điều kiện danh mục sản phẩm (nếu có)
    let baseAmountForDiscount = orderTotal;

    if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
      // Nếu có giới hạn danh mục nhưng giỏ hàng trống (truyền sai tham số)
      if (!cartItems || cartItems.length === 0) {
        throw createError('Không tìm thấy thông tin sản phẩm để áp dụng mã giảm giá theo danh mục', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_INVALID);
      }

      // Lấy thông tin category của các sản phẩm trong giỏ hàng
      const cakeIds = cartItems
        .filter(item => item && item.cake_id)
        .map(item => item.cake_id);
      
      const cakesInCart = await Cake.find({ _id: { $in: cakeIds } }).select('category_id');
      
      const cakeCategoryMap = cakesInCart.reduce((acc, cake) => {
        if (cake && cake._id && cake.category_id) {
          acc[cake._id.toString()] = cake.category_id.toString();
        }
        return acc;
      }, {});

      // Lọc các sản phẩm thuộc danh mục được áp dụng
      const validItems = cartItems.filter(item => {
        if (!item || !item.cake_id) return false;
        const categoryId = cakeCategoryMap[item.cake_id.toString()];
        
        return categoryId && coupon.applicable_categories && coupon.applicable_categories.some(catId => {
          return catId && catId.toString() === categoryId;
        });
      });

      if (validItems.length === 0) {
        throw createError('Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng của bạn', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.COUPON_INVALID);
      }

      // Chỉ tính giảm giá trên tổng tiền của các sản phẩm thuộc danh mục hợp lệ
      baseAmountForDiscount = validItems.reduce((sum, item) => {
        const price = item.price_at_buy || 0;
        const qty = item.quantity || 0;
        return sum + (price * qty);
      }, 0);
    }

    // 5. Tính toán số tiền giảm
    let discountAmount = 0;
    if (coupon.type === 'FIXED') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'PERCENT') {
      discountAmount = (baseAmountForDiscount * coupon.value) / 100;
      if (coupon.max_discount_value) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_value);
      }
    }

    // Đảm bảo số tiền giảm không vượt quá tổng tiền của phần được áp dụng
    discountAmount = Math.floor(Math.min(discountAmount, baseAmountForDiscount));

    return {
      coupon,
      discountAmount,
      finalPrice: orderTotal - discountAmount,
      appliedOnAmount: baseAmountForDiscount
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
    if (data.code) {
      const normalizedCode = data.code.toUpperCase();
      const existing = await Coupon.findOne({ 
        code: normalizedCode, 
        _id: { $ne: id } 
      });
      
      if (existing) {
        throw createError('Mã giảm giá đã tồn tại', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.DUPLICATE_ERROR);
      }
      data.code = normalizedCode;
    }
    
    return await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCoupon(id) {
    return await Coupon.findByIdAndDelete(id);
  }
}

module.exports = new CouponService();
