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
   * Lấy thống kê tổng quan (Sử dụng Aggregation cho hiệu năng cao)
   */
  async getLoyaltyStats() {
    const config = await this.getConfig();

    const aggregationResult = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: null,
          total_points: { $sum: { $ifNull: ['$loyalty_points', 0] } },
          total_users: { $sum: 1 },
          bronze_count: { $sum: { $cond: [{ $eq: ['$rank', LOYALTY_RANKS.BRONZE] }, 1, 0] } },
          silver_count: { $sum: { $cond: [{ $eq: ['$rank', LOYALTY_RANKS.SILVER] }, 1, 0] } },
          gold_count: { $sum: { $cond: [{ $eq: ['$rank', LOYALTY_RANKS.GOLD] }, 1, 0] } },
          diamond_count: { $sum: { $cond: [{ $eq: ['$rank', LOYALTY_RANKS.DIAMOND] }, 1, 0] } }
        }
      }
    ]);

    const baseStats = aggregationResult[0] || {
      total_points: 0,
      total_users: 0,
      bronze_count: 0,
      silver_count: 0,
      gold_count: 0,
      diamond_count: 0
    };

    // Tính Near Upgrade bằng một pipeline khác (phức tạp hơn để chạy chung)
    // Hoặc tính toán nhanh cho các hạng phổ biến
    const nearUpgradeCount = await User.countDocuments({
      role: 'user',
      $or: [
        { rank: LOYALTY_RANKS.BRONZE, total_spent: { $gte: config.tier_thresholds[LOYALTY_RANKS.SILVER] * 0.8, $lt: config.tier_thresholds[LOYALTY_RANKS.SILVER] } },
        { rank: LOYALTY_RANKS.SILVER, total_spent: { $gte: config.tier_thresholds[LOYALTY_RANKS.GOLD] * 0.8, $lt: config.tier_thresholds[LOYALTY_RANKS.GOLD] } },
        { rank: LOYALTY_RANKS.GOLD, total_spent: { $gte: config.tier_thresholds[LOYALTY_RANKS.DIAMOND] * 0.8, $lt: config.tier_thresholds[LOYALTY_RANKS.DIAMOND] } }
      ]
    });

    return {
      totalPointsIssued: baseStats.total_points,
      totalUsers: baseStats.total_users,
      ranks: {
        [LOYALTY_RANKS.BRONZE]: baseStats.bronze_count,
        [LOYALTY_RANKS.SILVER]: baseStats.silver_count,
        [LOYALTY_RANKS.GOLD]: baseStats.gold_count,
        [LOYALTY_RANKS.DIAMOND]: baseStats.diamond_count
      },
      vipCount: baseStats.gold_count + baseStats.diamond_count,
      nearUpgradeCount: nearUpgradeCount
    };
  }

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

    const customers = await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user_id',
          as: 'all_orders'
        }
      },
      {
        $project: {
          email: 1,
          full_name: 1,
          phone: 1,
          address: 1,
          loyalty_points: 1,
          total_spent: 1,
          rank: 1,
          avatar_url: 1,
          createdAt: 1,
          rank_lock: 1,
          total_orders: { $size: '$all_orders' }
        }
      },
      { $sort: { total_spent: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum }
    ]);

    const total = await User.countDocuments(match);

    return {
      items: customers,
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
