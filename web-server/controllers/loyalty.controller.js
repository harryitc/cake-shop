const LoyaltyService = require('../services/loyalty.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');

class LoyaltyController {
  /**
   * [ADMIN] Lấy danh sách khách hàng và thông tin loyalty
   */
  async getCustomers(req, res) {
    const data = await LoyaltyService.getCustomers(req.query);
    return sendSuccess(res, data);
  }

  /**
   * [ADMIN] Lấy lịch sử điểm của 1 khách hàng
   */
  async getPointHistory(req, res) {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const data = await LoyaltyService.getPointHistory(userId, page, limit);
    return sendSuccess(res, data);
  }

  /**
   * [ADMIN] Điều chỉnh điểm thủ công
   */
  async adjustPoints(req, res) {
    const { userId } = req.params;
    const { points, reason } = req.body;
    const adminId = req.user.id;

    const user = await LoyaltyService.addPoints(userId, points, reason, null, adminId);

    return sendSuccess(res, {
      id: user._id,
      loyalty_points: user.loyalty_points,
      rank: user.rank
    }, 'Điều chỉnh điểm thành công');
  }

  /**
   * [ADMIN] Lấy thống kê tổng quan
   */
  async getStats(req, res) {
    const stats = await LoyaltyService.getLoyaltyStats();
    return sendSuccess(res, stats);
  }

  /**
   * [ADMIN] Tái thẩm định hạng thủ công theo bộ lọc
   */
  async recalculateRanks(req, res) {
    const filters = req.body;
    const result = await LoyaltyService.recalculateRanks(filters);
    return sendSuccess(res, result, `Đã quét ${result.total_scanned} khách hàng và cập nhật ${result.total_updated} người.`);
  }

  /**
   * [ADMIN] Ghi đè hạng thành viên
   */
  async overrideRank(req, res) {
    const { userId } = req.params;
    const { rank, rank_lock } = req.body;
    const user = await LoyaltyService.overrideRank(userId, rank, rank_lock);
    return sendSuccess(res, user, 'Cập nhật hạng thành viên thành công');
  }

  /**
   * [USER] Lấy thông tin loyalty của tôi
   */
  async getMyLoyalty(req, res) {
    const userId = req.user.userId;
    const user = await require('../schemas/User.schema').findById(userId);
    const history = await LoyaltyService.getPointHistory(userId, 1, 10);

    return sendSuccess(res, {
      rank: user.rank,
      loyalty_points: user.loyalty_points,
      total_spent: user.total_spent,
      history: history.items
    });
  }

  /**
   * [USER] Lấy cấu hình loyalty công khai
   */
  async getPublicConfig(req, res) {
    const config = await LoyaltyService.getConfig();
    return sendSuccess(res, config);
  }

  /**
   * [ADMIN] Lấy cấu hình hệ thống
   */
  async getConfig(req, res) {
    const config = await LoyaltyService.getConfig();
    return sendSuccess(res, config);
  }

  /**
   * [ADMIN] Cập nhật cấu hình hệ thống
   */
  async updateConfig(req, res) {
    const config = await LoyaltyService.updateConfig(req.body);
    return sendSuccess(res, config, 'Cập nhật cấu hình thành công');
  }
}

module.exports = new LoyaltyController();
