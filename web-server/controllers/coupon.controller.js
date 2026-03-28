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
      const { code, order_total, cart_items } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!code || !order_total) {
        throw createError('Vui lòng cung cấp mã và tổng tiền', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      const result = await couponService.validateCoupon(code, order_total, userId, cart_items || []);
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
