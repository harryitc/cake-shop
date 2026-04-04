const User = require('../schemas/User.schema.js');
const Order = require('../schemas/Order.schema.js');
const PointHistory = require('../schemas/PointHistory.schema.js');
const LoyaltyConfig = require('../schemas/LoyaltyConfig.schema.js');
const { LOYALTY_RANKS, POINT_TYPES } = require('../config/constants');
const ApiError = require('../utils/error.factory');
const mongoose = require('mongoose');

class LoyaltyService {
  constructor() {
    this.config = null;
  }

  /**
   * Lấy cấu hình Loyalty hiện tại (có Caching nhẹ)
   */
  async getConfig() {
    if (this.config) return this.config;

    let config = await LoyaltyConfig.findOne({ key: 'default_config' });
    if (!config) {
      config = await LoyaltyConfig.create({ key: 'default_config' });
    }
    this.config = config;
    return config;
  }

  /**
   * Cập nhật cấu hình (Admin)
   */
  async updateConfig(data) {
    const config = await LoyaltyConfig.findOneAndUpdate(
      { key: 'default_config' },
      { $set: data },
      { new: true, upsert: true }
    );
    this.config = config;
    return config;
  }

  /**
   * Xử lý khi đơn hàng hoàn thành (DONE)
   */
  async processOrderCompletion(orderId, session = null) {
    const config = await this.getConfig();
    const order = await Order.findById(orderId).populate('user_id').session(session);
    if (!order || !order.user_id) return;

    const user = order.user_id;
    const amount = order.final_price;
    
    // Ưu tiên dùng points_earned đã lưu, nếu không có (đơn cũ) thì tính lại theo hạng hiện tại
    let pointsEarned = order.points_earned;
    if (pointsEarned === undefined || pointsEarned === null) {
      const earnRatio = config.point_ratios[user.rank] || 0.01;
      pointsEarned = Math.floor(amount * earnRatio);
    }

    // 1. Cập nhật User tổng chi tiêu (Sử dụng atomic update $inc)
    await User.updateOne(
      { _id: user._id },
      { $inc: { total_spent: amount } },
      { session }
    );

    // 2. Cộng điểm
    if (pointsEarned > 0) {
      await this.addPoints(
        user._id,
        pointsEarned,
        `Tích điểm từ đơn hàng #${order._id}`,
        order._id,
        null,
        session
      );
    }

    // 3. Kiểm tra thăng hạng
    await this.checkTierUpgrade(user._id, session);
  }

  /**
   * Thêm hoặc trừ điểm của người dùng (Atomic update)
   */
  async addPoints(userId, points, reason, orderId = null, adminId = null, session = null) {
    const type = points >= 0 ? POINT_TYPES.PLUS : POINT_TYPES.MINUS;

    // Tạo lịch sử
    const history = new PointHistory({
      user: userId,
      order: orderId,
      admin: adminId,
      points_change: Math.abs(points),
      type,
      reason
    });
    await history.save({ session });

    // Cập nhật điểm của User nguyên tử
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { loyalty_points: points } },
      { new: true, session }
    );

    if (!updatedUser) throw ApiError.NOT_FOUND('User không tồn tại');

    // Đảm bảo điểm không âm (Fix lại nếu bị âm sau khi trừ)
    if (updatedUser.loyalty_points < 0) {
      await User.updateOne({ _id: userId }, { $set: { loyalty_points: 0 } }, { session });
      updatedUser.loyalty_points = 0;
    }

    return updatedUser;
  }

  /**
   * Kiểm tra và thăng hạng thành viên
   */
  async checkTierUpgrade(userId, session = null) {
    const config = await this.getConfig();
    const user = await User.findById(userId).session(session);
    if (!user || user.rank_lock) return;

    let newRank = LOYALTY_RANKS.BRONZE;
    const thresholds = config.tier_thresholds;

    if (user.total_spent >= thresholds[LOYALTY_RANKS.DIAMOND]) {
      newRank = LOYALTY_RANKS.DIAMOND;
    } else if (user.total_spent >= thresholds[LOYALTY_RANKS.GOLD]) {
      newRank = LOYALTY_RANKS.GOLD;
    } else if (user.total_spent >= thresholds[LOYALTY_RANKS.SILVER]) {
      newRank = LOYALTY_RANKS.SILVER;
    }

    const rankPriority = {
      [LOYALTY_RANKS.BRONZE]: 0,
      [LOYALTY_RANKS.SILVER]: 1,
      [LOYALTY_RANKS.GOLD]: 2,
      [LOYALTY_RANKS.DIAMOND]: 3
    };

    if (rankPriority[newRank] > rankPriority[user.rank]) {
      await User.updateOne(
        { _id: userId },
        { $set: { rank: newRank } },
        { session }
      );
    }
  }

  /**
   * Ghi đè hạng và khóa hạng (Admin)
   */
  async overrideRank(userId, rank, isLocked = true) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { rank, rank_lock: isLocked } },
      { new: true }
    );
    if (!updatedUser) throw ApiError.NOT_FOUND('User không tồn tại');
    return updatedUser;
  }

  /**
   * Lấy thống kê tổng quan (Refactored: JS Processing)
   */
  async getLoyaltyStats() {
    const config = await this.getConfig();
    const users = await User.find({ role: 'user' }).lean();

    const stats = users.reduce((acc, u) => {
      acc.totalPointsIssued += (u.loyalty_points || 0);
      acc.totalUsers++;
      
      const rank = u.rank || LOYALTY_RANKS.BRONZE;
      acc.ranks[rank] = (acc.ranks[rank] || 0) + 1;
      
      // Tính Near Upgrade (Sử dụng logic JS thay vì query DB riêng lẻ)
      const thresholds = config.tier_thresholds;
      let nextRank = null;
      if (rank === LOYALTY_RANKS.BRONZE) nextRank = LOYALTY_RANKS.SILVER;
      else if (rank === LOYALTY_RANKS.SILVER) nextRank = LOYALTY_RANKS.GOLD;
      else if (rank === LOYALTY_RANKS.GOLD) nextRank = LOYALTY_RANKS.DIAMOND;

      if (nextRank && u.total_spent >= thresholds[nextRank] * 0.8 && u.total_spent < thresholds[nextRank]) {
        acc.nearUpgradeCount++;
      }

      return acc;
    }, {
      totalPointsIssued: 0,
      totalUsers: 0,
      ranks: {
        [LOYALTY_RANKS.BRONZE]: 0,
        [LOYALTY_RANKS.SILVER]: 0,
        [LOYALTY_RANKS.GOLD]: 0,
        [LOYALTY_RANKS.DIAMOND]: 0
      },
      nearUpgradeCount: 0
    });

    return {
      ...stats,
      vipCount: stats.ranks[LOYALTY_RANKS.GOLD] + stats.ranks[LOYALTY_RANKS.DIAMOND]
    };
  }

  /**
   * Lấy danh sách khách hàng (Refactored: JS Merging)
   */
  async getCustomers(query = {}) {
    const { rank, search, page = 1, limit = 10 } = query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const match = { role: 'user' };
    if (rank) match.rank = rank;
    if (search) {
      match.$or = [
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } }
      ];
    }

    // 1. Lấy danh sách User (Read-only, dùng lean)
    const users = await User.find(match)
      .select('email full_name phone address loyalty_points total_spent rank avatar_url createdAt rank_lock')
      .sort({ total_spent: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(match);

    // 2. Lấy số lượng đơn hàng cho tập User hiện tại (JS Mapping)
    const userIds = users.map(u => u._id);
    
    // Sử dụng countDocuments cho từng user là không tối ưu, 
    // ta nên dùng 1 lệnh aggregate đơn giản để lấy count cho cả group này
    const orderCounts = await Order.aggregate([
      { $match: { user_id: { $in: userIds } } },
      { $group: { _id: '$user_id', count: { $sum: 1 } } }
    ]);

    // Chuyển orderCounts thành dictionary để tra cứu nhanh (O(1))
    const countsMap = orderCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    // 3. Trộn dữ liệu
    const items = users.map(user => ({
      ...user,
      total_orders: countsMap[user._id.toString()] || 0
    }));

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum
    };
  }

  async getPointHistory(userId, page = 1, limit = 20) {
    const history = await PointHistory.find({ user: userId })
      .populate('admin', 'full_name email')
      .populate('order', 'total_price status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PointHistory.countDocuments({ user: userId });

    return {
      items: history,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  async refundPoints(orderId, session = null) {
    const order = await Order.findById(orderId).session(session);
    if (order && order.points_used > 0) {
      await this.addPoints(
        order.user_id,
        order.points_used,
        `Hoàn điểm từ đơn hàng bị hủy #${order._id}`,
        order._id,
        null,
        session
      );
    }
  }
}

module.exports = new LoyaltyService();
