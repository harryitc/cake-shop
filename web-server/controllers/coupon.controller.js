const couponService = require('../services/coupon.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');
const Joi = require('joi');

const couponSchema = Joi.object({
  code: Joi.string().trim().uppercase(),
  type: Joi.string().valid('PERCENT', 'FIXED'),
  value: Joi.number().min(0),
  min_order_value: Joi.number().min(0).default(0),
  max_discount_value: Joi.number().min(0).allow(null).optional(),
  start_date: Joi.date(),
  end_date: Joi.date().min(Joi.ref('start_date')),
  usage_limit: Joi.number().min(1).allow(null).optional(),
  usage_limit_per_user: Joi.number().min(1).default(1),
  applicable_categories: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow('').optional(),
  is_active: Joi.boolean().default(true),
});

class CouponController {
  async create(req, res) {
    const { error, value } = couponSchema.fork(
      ['code', 'type', 'value', 'start_date', 'end_date'],
      (schema) => schema.required()
    ).validate(req.body, { abortEarly: false });

    if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

    const coupon = await couponService.createCoupon(value);
    return sendSuccess(res, coupon, 'Tạo mã giảm giá thành công', HTTP_STATUS.CREATED);
  }

  async getAll(req, res) {
    const coupons = await couponService.getAllCoupons();
    return sendSuccess(res, coupons);
  }

  async validate(req, res) {
    const { code } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!code) {
      throw ApiError.BAD_REQUEST('Vui lòng cung cấp mã giảm giá');
    }

    if (!userId) {
      throw ApiError.UNAUTHORIZED('Bạn cần đăng nhập để sử dụng mã giảm giá');
    }

    // Tự động lấy giỏ hàng từ DB để đảm bảo tính chính xác và bảo mật
    const cartService = require('../services/cart.service');
    const cart = await cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw ApiError.BAD_REQUEST('Giỏ hàng của bạn đang trống');
    }

    // Map cart items sang định dạng service mong muốn
    const cartItemsForService = cart.items.map(item => ({
      cake_id: item.cake ? item.cake._id : null,
      quantity: item.quantity,
      price_at_buy: item.price
    }));

    const result = await couponService.validateCoupon(code, cart.total, userId, cartItemsForService);
    return sendSuccess(res, result, 'Mã giảm giá hợp lệ');
  }

  async update(req, res) {
    const { error, value } = couponSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

    const coupon = await couponService.updateCoupon(req.params.id, value);
    if (!coupon) throw ApiError.NOT_FOUND('Không tìm thấy mã giảm giá');
    return sendSuccess(res, coupon, 'Cập nhật thành công');
  }

  async delete(req, res) {
    const coupon = await couponService.deleteCoupon(req.params.id);
    if (!coupon) throw ApiError.NOT_FOUND('Không tìm thấy mã giảm giá');
    return sendSuccess(res, null, 'Xóa thành công');
  }
}

module.exports = new CouponController();
