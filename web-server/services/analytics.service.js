const Order = require('../schemas/Order.schema');
const Cake = require('../schemas/Cake.schema');

/**
 * Lấy các chỉ số thống kê tổng quan
 */
const getStats = async () => {
  // 1. Tổng doanh thu (chỉ tính đơn DONE)
  const revenueData = await Order.aggregate([
    { $match: { status: 'DONE' } },
    { $group: { _id: null, total: { $sum: '$total_price' } } },
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // 2. Tổng số đơn hàng thành công
  const completedOrders = await Order.countDocuments({ status: 'DONE' });

  // 3. Đơn hàng đang chờ (PENDING)
  const pendingOrders = await Order.countDocuments({ status: 'PENDING' });

  // 4. Tổng số loại bánh
  const totalCakes = await Cake.countDocuments();

  // 5. Giá trị đơn hàng trung bình (AOV)
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  return {
    totalRevenue,
    totalOrders: await Order.countDocuments(),
    completedOrders,
    pendingOrders,
    totalCakes,
    averageOrderValue,
  };
};

/**
 * Thống kê tỷ lệ trạng thái đơn hàng
 */
const getOrderStatusDistribution = async () => {
  return await Order.aggregate([
    { $group: { _id: '$status', value: { $sum: 1 } } },
    { $project: { name: '$_id', value: 1, _id: 0 } },
  ]);
};

/**
 * Top 5 sản phẩm bán chạy nhất
 */
const getBestSellers = async () => {
  return await Order.aggregate([
    { $match: { status: 'DONE' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.cake_id',
        soldQuantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price_at_buy'] } },
      },
    },
    { $sort: { soldQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'cakes',
        localField: '_id',
        foreignField: '_id',
        as: 'cakeInfo',
      },
    },
    { $unwind: '$cakeInfo' },
    {
      $project: {
        name: '$cakeInfo.name',
        image_url: '$cakeInfo.image_url',
        price: '$cakeInfo.price',
        soldQuantity: 1,
        revenue: 1,
      },
    },
  ]);
};

/**
 * Thống kê doanh thu theo danh mục (chỉ tính đơn DONE)
 */
const getCategoryDistribution = async () => {
  return await Order.aggregate([
    { $match: { status: 'DONE' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'cakes',
        localField: 'items.cake_id',
        foreignField: '_id',
        as: 'cake',
      },
    },
    { $unwind: '$cake' },
    {
      $lookup: {
        from: 'categories',
        localField: 'cake.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$category.name',
        value: { $sum: { $multiply: ['$items.quantity', '$items.price_at_buy'] } },
      },
    },
    { $project: { name: '$_id', value: 1, _id: 0 } },
    { $sort: { value: -1 } },
  ]);
};

/**
 * 5 Đơn hàng gần đây nhất
 */
const getRecentOrders = async () => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user_id', 'full_name email')
    .lean();
};

/**
 * Biểu đồ doanh thu 30 ngày gần nhất
 */
const getRevenueTimeline = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await Order.aggregate([
    {
      $match: {
        status: 'DONE',
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total_price' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', revenue: 1, orderCount: 1, _id: 0 } },
  ]);
};

module.exports = {
  getStats,
  getOrderStatusDistribution,
  getBestSellers,
  getCategoryDistribution,
  getRecentOrders,
  getRevenueTimeline,
};
