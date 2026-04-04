const Coupon = require('../schemas/Coupon.schema');
const Order = require('../schemas/Order.schema');
const Cake = require('../schemas/Cake.schema');
const ApiError = require('../utils/error.factory');
const { ORDER_STATUS } = require('../config/constants');

class CouponService {
  /**
   * Tạo mã giảm giá mới
   */
  async createCoupon(data) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw ApiError.BAD_REQUEST('Mã giảm giá đã tồn tại');
    
    return await Coupon.create(data);
  }

  /**
   * Lấy danh sách mã giảm giá (Admin)
   */
  async getAllCoupons() {
    return await Coupon.find().populate('applicable_categories').sort({ createdAt: -1 });
  }

  /**
   * Kiểm tra mã giảm giá (Refactored: Clean Logic)
   */
  async validateCoupon(code, orderTotal, userId = null, cartItems = []) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), is_active: true });
    if (!coupon) throw ApiError.NOT_FOUND('Mã giảm giá đã vô hiệu hóa');

    const now = new Date();
    if (now < coupon.start_date) throw ApiError.BAD_REQUEST('Mã chưa đến hạn dùng');
    if (now > coupon.end_date) throw ApiError.BAD_REQUEST('Mã đã hết hạn');

    // 1. Kiểm tra giới hạn lượt dùng
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      throw ApiError.BAD_REQUEST('Mã đã hết lượt sử dụng');
    }

    // 2. Kiểm tra lượt dùng cá nhân (JS check)
    if (userId && coupon.usage_limit_per_user) {
      const userOrders = await Order.find({ user_id: userId, coupon_code: coupon.code }).select('status').lean();
      const validOrdersCount = userOrders.filter(o => o.status !== ORDER_STATUS.REJECTED).length;
      if (validOrdersCount >= coupon.usage_limit_per_user) throw ApiError.BAD_REQUEST('Bạn đã hết lượt dùng mã');
    }

    if (orderTotal < coupon.min_order_value) throw ApiError.BAD_REQUEST('Chưa đủ giá trị tối thiểu');

    // 3. Tính toán phần tiền được giảm
    let baseAmountForDiscount = orderTotal;
    
    if (coupon.applicable_categories?.length > 0) {
      const validItems = await this._getValidItemsForCoupon(cartItems, coupon.applicable_categories);
      if (validItems.length === 0) throw ApiError.BAD_REQUEST('Mã không áp dụng cho sản phẩm này');
      
      baseAmountForDiscount = validItems.reduce((sum, item) => sum + (item.price_at_buy * item.quantity), 0);
    }

    let discountAmount = coupon.type === 'FIXED' 
      ? coupon.value 
      : Math.min((baseAmountForDiscount * coupon.value) / 100, coupon.max_discount_value || Infinity);

    discountAmount = Math.floor(Math.min(discountAmount, baseAmountForDiscount));

    return { coupon, discountAmount, finalPrice: orderTotal - discountAmount, appliedOnAmount: baseAmountForDiscount };
  }

  /**
   * Private Helper: Lọc sản phẩm hợp lệ theo Category
   */
  async _getValidItemsForCoupon(cartItems, allowedCategoryIds) {
    const cakeIds = cartItems.map(item => item.cake_id);
    const cakes = await Cake.find({ _id: { $in: cakeIds } }).select('category_id').lean();
    
    const cakeCatMap = cakes.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.category_id?.toString() }), {});

    return cartItems.filter(item => {
      const catId = cakeCatMap[item.cake_id.toString()];
      return allowedCategoryIds.some(cid => cid.toString() === catId);
    });
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
        throw ApiError.BAD_REQUEST('Mã giảm giá đã tồn tại');
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
