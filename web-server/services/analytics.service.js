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
/**
 * Top 5 sản phẩm bán chạy nhất (Refactored: JS Processing)
 */
const getBestSellers = async () => {
  // 1. Lấy đơn hàng hoàn thành (Simple Query)
  const orders = await Order.find({ status: 'DONE' }).select('items').lean();

  // 2. Tính toán số lượng và doanh thu bằng JS
  const salesMap = new Map();
  orders.forEach(order => {
    order.items.forEach(item => {
      const idStr = item.cake_id.toString();
      const existing = salesMap.get(idStr) || { soldQuantity: 0, revenue: 0 };
      salesMap.set(idStr, {
        soldQuantity: existing.soldQuantity + item.quantity,
        revenue: existing.revenue + (item.quantity * item.price_at_buy)
      });
    });
  });

  // 3. Sắp xếp và lấy Top 5 IDs
  const topSales = [...salesMap.entries()]
    .sort((a, b) => b[1].soldQuantity - a[1].soldQuantity)
    .slice(0, 5);

  if (topSales.length === 0) return [];

  // 4. Lấy thông tin chi tiết Bánh (Simple Query)
  const cakeIds = topSales.map(t => t[0]);
  const cakes = await Cake.find({ _id: { $in: cakeIds } }).select('name image_url price').lean();

  // 5. Trộn dữ liệu bảo toàn thứ tự sắp xếp
  return topSales.map(([id, stats]) => {
    const cake = cakes.find(c => c._id.toString() === id);
    return {
      name: cake ? cake.name : 'Unknown',
      image_url: cake ? cake.image_url : '',
      price: cake ? cake.price : 0,
      soldQuantity: stats.soldQuantity,
      revenue: stats.revenue
    };
  });
};

/**
 * Thống kê doanh thu theo danh mục (chỉ tính đơn DONE)
 */
/**
 * Thống kê doanh thu theo danh mục (Refactored: JS Processing)
 */
const getCategoryDistribution = async () => {
  const [orders, cakes] = await Promise.all([
    Order.find({ status: 'DONE' }).select('items').lean(),
    Cake.find().select('category').populate('category', 'name').lean()
  ]);

  // Tạo Map CakeID -> CategoryName
  const cakeCategoryMap = new Map();
  cakes.forEach(cake => {
    if (cake.category) {
      cakeCategoryMap.set(cake._id.toString(), cake.category.name);
    }
  });

  // Tính doanh thu theo từng Category Name
  const distributionMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const catName = cakeCategoryMap.get(item.cake_id.toString()) || 'Khác';
      distributionMap[catName] = (distributionMap[catName] || 0) + (item.quantity * item.price_at_buy);
    });
  });

  // Format cho Recharts (Frontend)
  return Object.keys(distributionMap)
    .map(name => ({ name, value: distributionMap[name] }))
    .sort((a, b) => b.value - a.value);
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
/**
 * Biểu đồ doanh thu 30 ngày gần nhất (Refactored: JS Processing)
 */
const getRevenueTimeline = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await Order.find({
    status: 'DONE',
    createdAt: { $gte: thirtyDaysAgo },
  }).select('total_price createdAt').lean();

  const timelineMap = {};
  
  // Khởi tạo 30 ngày gần đây để đảm bảo biểu đồ không bị "đứt đoạn"
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    timelineMap[dateStr] = { date: dateStr, revenue: 0, orderCount: 0 };
  }

  // Đổ dữ liệu thật vào
  orders.forEach(order => {
    const dateStr = order.createdAt.toISOString().split('T')[0];
    if (timelineMap[dateStr]) {
      timelineMap[dateStr].revenue += (order.total_price || 0);
      timelineMap[dateStr].orderCount += 1;
    }
  });

  return Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));
};

module.exports = {
  getStats,
  getOrderStatusDistribution,
  getBestSellers,
  getCategoryDistribution,
  getRecentOrders,
  getRevenueTimeline,
};
