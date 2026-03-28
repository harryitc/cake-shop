const reviewService = require('../services/review.service');
const { sendSuccess, createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');
const Joi = require('joi');

class ReviewController {
  async create(req, res, next) {
    try {
      const schema = Joi.object({
        cake_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
          'string.pattern.base': 'ID Bánh không hợp lệ',
          'any.required': 'Vui lòng cung cấp ID Bánh',
        }),
        order_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
          'string.pattern.base': 'ID Đơn hàng không hợp lệ',
          'any.required': 'Vui lòng cung cấp ID Đơn hàng',
        }),
        rating: Joi.number().min(1).max(5).required().messages({
          'number.min': 'Số sao tối thiểu là 1',
          'number.max': 'Số sao tối đa là 5',
          'any.required': 'Vui lòng chọn số sao đánh giá',
        }),
        comment: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

      const review = await reviewService.createReview(req.user.userId, value);
      return sendSuccess(res, review, 'Gửi đánh giá thành công', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getCakeReviews(req, res, next) {
    try {
      const { cakeId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const data = await reviewService.getCakeReviews(cakeId, { page, limit });
      return sendSuccess(res, data, 'Lấy danh sách đánh giá thành công');
    } catch (err) {
      next(err);
    }
  }

  async getAllAdmin(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await reviewService.getAllReviewsAdmin({ page, limit });
      return sendSuccess(res, data, 'Lấy danh sách đánh giá cho Admin thành công');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { is_approved } = req.body;
      
      if (typeof is_approved !== 'boolean') {
        throw createError('Trạng thái is_approved phải là boolean', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      const review = await reviewService.updateReviewStatus(reviewId, is_approved);
      return sendSuccess(res, review, 'Cập nhật trạng thái đánh giá thành công');
    } catch (err) {
      next(err);
    }
  }
  async reply(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { reply } = req.body;

      if (!reply || reply.trim() === '') {
        throw createError('Vui lòng nhập nội dung phản hồi', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      const review = await reviewService.adminReply(reviewId, reply);
      return sendSuccess(res, review, 'Phản hồi đánh giá thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();
