const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * Lấy toàn bộ thông tin thống kê cho Dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [stats, distribution, bestSellers, timeline, categoryDistribution, recentOrders] = await Promise.all([
      analyticsService.getStats(),
      analyticsService.getOrderStatusDistribution(),
      analyticsService.getBestSellers(),
      analyticsService.getRevenueTimeline(),
      analyticsService.getCategoryDistribution(),
      analyticsService.getRecentOrders(),
    ]);

    return sendSuccess(
      res,
      {
        summary: stats,
        orderDistribution: distribution,
        bestSellers,
        revenueTimeline: timeline,
        categoryDistribution,
        recentOrders,
      },
      'Lấy thống kê thành công'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};
