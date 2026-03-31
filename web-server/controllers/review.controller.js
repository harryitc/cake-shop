const reviewService = require('../services/review.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');
const Joi = require('joi');

class ReviewController {
  async create(req, res) {
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

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

    const review = await reviewService.createReview(req.user.userId, value);
    return sendSuccess(res, review, 'Gửi đánh giá thành công', HTTP_STATUS.CREATED);
  }

  async getCakeReviews(req, res) {
    const { cakeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const data = await reviewService.getCakeReviews(cakeId, { page, limit });
    return sendSuccess(res, data, 'Lấy danh sách đánh giá thành công');
  }

  async getAllAdmin(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const data = await reviewService.getAllReviewsAdmin({ page, limit });
    return sendSuccess(res, data, 'Lấy danh sách đánh giá cho Admin thành công');
  }

  async updateStatus(req, res) {
    const { reviewId } = req.params;
    const { is_approved } = req.body;
    
    if (typeof is_approved !== 'boolean') {
      throw ApiError.BAD_REQUEST('Trạng thái is_approved phải là boolean');
    }

    const review = await reviewService.updateReviewStatus(reviewId, is_approved);
    return sendSuccess(res, review, 'Cập nhật trạng thái đánh giá thành công');
  }

  async reply(req, res) {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === '') {
      throw ApiError.BAD_REQUEST('Vui lòng nhập nội dung phản hồi');
    }

    const review = await reviewService.adminReply(reviewId, reply);
    return sendSuccess(res, review, 'Phản hồi đánh giá thành công');
  }
}

module.exports = new ReviewController();
