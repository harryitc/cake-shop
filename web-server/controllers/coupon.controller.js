const couponService = require('../services/coupon.service');
const { sendSuccess, createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');
const Joi = require('joi');

class CouponController {
  async create(req, res, next) {
    try {
      const schema = Joi.object({
        code: Joi.string().required().trim().uppercase(),
        type: Joi.string().valid('PERCENT', 'FIXED').required(),
        value: Joi.number().min(0).required(),
        min_order_value: Joi.number().min(0).default(0),
        max_discount_value: Joi.number().min(0).allow(null).optional(),
        start_date: Joi.date().required(),
        end_date: Joi.date().min(Joi.ref('start_date')).required(),
        usage_limit: Joi.number().min(1).allow(null).optional(),
        usage_limit_per_user: Joi.number().min(1).default(1),
        applicable_categories: Joi.array().items(Joi.string()).default([]),
        description: Joi.string().allow('').optional(),
        is_active: Joi.boolean().default(true),
      });

      const { error, value } = schema.validate(req.body);
      if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

      const coupon = await couponService.createCoupon(value);
      return sendSuccess(res, coupon, 'Tạo mã giảm giá thành công', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const coupons = await couponService.getAllCoupons();
      return sendSuccess(res, coupons);
    } catch (err) {
      next(err);
    }
  }

  async validate(req, res, next) {
    try {
      const { code } = req.body;
      const userId = req.user ? req.user.userId : null;

      if (!code) {
        throw createError('Vui lòng cung cấp mã giảm giá', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      if (!userId) {
        throw createError('Bạn cần đăng nhập để sử dụng mã giảm giá', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      // Tự động lấy giỏ hàng từ DB để đảm bảo tính chính xác và bảo mật
      const cartService = require('../services/cart.service');
      const cart = await cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw createError('Giỏ hàng của bạn đang trống', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      // Map cart items sang định dạng service mong muốn
      const cartItemsForService = cart.items.map(item => ({
        cake_id: item.cake ? item.cake._id : null,
        quantity: item.quantity,
        price_at_buy: item.price
      }));

      const result = await couponService.validateCoupon(code, cart.total, userId, cartItemsForService);
      return sendSuccess(res, result, 'Mã giảm giá hợp lệ');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      if (!coupon) throw createError('Không tìm thấy mã giảm giá', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      return sendSuccess(res, coupon, 'Cập nhật thành công');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const coupon = await couponService.deleteCoupon(req.params.id);
      if (!coupon) throw createError('Không tìm thấy mã giảm giá', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      return sendSuccess(res, null, 'Xóa thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CouponController();
