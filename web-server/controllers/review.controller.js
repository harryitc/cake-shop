const reviewService = require('../services/review.service');
const { sendSuccess, sendError } = require('../utils/response.utils');
const Joi = require('joi');

class ReviewController {
  async create(req, res) {
    try {
      const schema = Joi.object({
        cake_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        order_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) return sendError(res, error.details[0].message, 400);

      const review = await reviewService.createReview(req.user.userId, value);
      sendSuccess(res, review, 'Gửi đánh giá thành công', 201);
    } catch (err) {
      sendError(res, err.message, err.status || 500);
    }
  }

  async getCakeReviews(req, res) {
    try {
      const { cakeId } = req.params;
      const { page, limit } = req.query;
      const data = await reviewService.getCakeReviews(cakeId, { page, limit });
      sendSuccess(res, data);
    } catch (err) {
      sendError(res, err.message);
    }
  }

  async getAllAdmin(req, res) {
    try {
      const { page, limit } = req.query;
      const data = await reviewService.getAllReviewsAdmin({ page, limit });
      sendSuccess(res, data);
    } catch (err) {
      sendError(res, err.message);
    }
  }

  async updateStatus(req, res) {
    try {
      const { reviewId } = req.params;
      const { is_approved } = req.body;
      
      if (typeof is_approved !== 'boolean') {
        return sendError(res, 'Trạng thái is_approved phải là boolean', 400);
      }

      const review = await reviewService.updateReviewStatus(reviewId, is_approved);
      sendSuccess(res, review, 'Cập nhật trạng thái đánh giá thành công');
    } catch (err) {
      sendError(res, err.message);
    }
  }
}

module.exports = new ReviewController();
