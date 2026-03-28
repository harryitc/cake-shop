const LoyaltyService = require('../services/loyalty.service');
const { sendSuccess } = require('../utils/response.utils');
const { HTTP_STATUS } = require('../config/constants');

class LoyaltyController {
  /**
   * [ADMIN] Lấy danh sách khách hàng và thông tin loyalty
   */
  async getCustomers(req, res, next) {
    try {
      const data = await LoyaltyService.getCustomers(req.query);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Lấy lịch sử điểm của 1 khách hàng
   */
  async getPointHistory(req, res, next) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const data = await LoyaltyService.getPointHistory(userId, page, limit);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Điều chỉnh điểm thủ công
   */
  async adjustPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const { points, reason } = req.body;
      const adminId = req.user.id;

      const user = await LoyaltyService.addPoints(userId, points, reason, null, adminId);

      sendSuccess(res, {
        id: user._id,
        loyalty_points: user.loyalty_points,
        rank: user.rank
      }, 'Điều chỉnh điểm thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Lấy thống kê tổng quan
   */
  async getStats(req, res, next) {
    try {
      const stats = await LoyaltyService.getLoyaltyStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Ghi đè hạng thành viên
   */
  async overrideRank(req, res, next) {
    try {
      const { userId } = req.params;
      const { rank, rank_lock } = req.body;
      const user = await LoyaltyService.overrideRank(userId, rank, rank_lock);
      sendSuccess(res, user, 'Cập nhật hạng thành viên thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * [USER] Lấy thông tin loyalty của tôi
   */
  async getMyLoyalty(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await require('../schemas/User.schema').findById(userId);
      const history = await LoyaltyService.getPointHistory(userId, 1, 10);

      sendSuccess(res, {
        rank: user.rank,
        loyalty_points: user.loyalty_points,
        total_spent: user.total_spent,
        history: history.items
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Lấy cấu hình hệ thống
   */
  async getConfig(req, res, next) {
    try {
      const config = await LoyaltyService.getConfig();
      sendSuccess(res, config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Cập nhật cấu hình hệ thống
   */
  async updateConfig(req, res, next) {
    try {
      const config = await LoyaltyService.updateConfig(req.body);
      sendSuccess(res, config, 'Cập nhật cấu hình thành công');
    } catch (error) {
      next(error);
    }
  }
}


module.exports = new LoyaltyController();
