const mongoose = require('mongoose');
const Order = require('../schemas/Order.schema');
const CartItem = require('../schemas/CartItem.schema');
const Cake = require('../schemas/Cake.schema');
const User = require('../schemas/User.schema');
const CouponService = require('./coupon.service');
const LoyaltyService = require('./loyalty.service');
const excelService = require('./excel.service');
const ApiError = require('../utils/error.factory');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email.utils');
const { ORDER_STATUS } = require('../config/constants');

const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DONE],
  [ORDER_STATUS.DONE]: [],
  [ORDER_STATUS.REJECTED]: [],
};

/**
 * [V6-3.1] Hàm chính tạo đơn hàng (Clean Flow)
 */
const createOrder = async (userId, address, couponCode = null, pointsToUse = 0) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Kiểm tra User & Giỏ hàng & Tồn kho
    const { user, cartItems, items, total_price } = await _validateAndPrepareCart(userId, session);

    // 2. Trừ tồn kho (Atomic)
    await _updateInventory(items, session);

    // 3. Xử lý Coupon
    const { validatedCoupon, discount_amount, priceAfterCoupon } = await _handleCoupon(
      couponCode, total_price, userId, items, session
    );

    // 4. Xử lý Dùng điểm
    const { points_used, points_discount_amount, final_price } = await _handlePoints(
      user, pointsToUse, priceAfterCoupon, session
    );

    // 5. Lưu đơn hàng & Dọn dẹp
    const finalOrder = await _finalizeOrder(
      userId, user, address, total_price, couponCode, discount_amount, 
      points_used, points_discount_amount, final_price, items, session
    );

    await session.commitTransaction();
    return finalOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Helper: Kiểm tra User, Giỏ hàng và Tồn kho
 */
const _validateAndPrepareCart = async (userId, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw ApiError.NOT_FOUND('Người dùng không tồn tại');

  const cartItems = await CartItem.find({ user_id: userId }).populate('cake_id').session(session);
  if (!cartItems?.length) throw ApiError.BAD_REQUEST('Giỏ hàng trống');

  let total_price = 0;
  const items = [];

  for (const item of cartItems) {
    if (!item.cake_id) throw ApiError.BAD_REQUEST('Sản phẩm không còn tồn tại');

    let price_at_buy = item.cake_id.price;
    let variant_size = '';
    let current_stock = item.cake_id.stock;

    if (item.variant_id) {
      const variant = item.cake_id.variants.find(v => v._id.toString() === item.variant_id.toString());
      if (!variant) throw ApiError.BAD_REQUEST(`Không tìm thấy biến thể cho "${item.cake_id.name}"`);
      price_at_buy = variant.price;
      variant_size = variant.size;
      current_stock = variant.stock;
    }

    if (current_stock < item.quantity) {
      throw ApiError.BAD_REQUEST(`Sản phẩm "${item.cake_id.name}" không đủ số lượng`);
    }

    total_price += price_at_buy * item.quantity;
    items.push({
      cake_id: item.cake_id._id,
      quantity: item.quantity,
      variant_id: item.variant_id || null,
      variant_size,
      price_at_buy,
    });
  }

  return { user, cartItems, items, total_price };
};

/**
 * Helper: Cập nhật tồn kho (Trừ kho)
 */
const _updateInventory = async (items, session) => {
  for (const item of items) {
    if (item.variant_id) {
      await Cake.updateOne(
        { _id: item.cake_id, "variants._id": item.variant_id },
        { $inc: { "variants.$.stock": -item.quantity } },
        { session }
      );
    } else {
      await Cake.findByIdAndUpdate(item.cake_id, { $inc: { stock: -item.quantity } }, { session });
    }
  }
};

/**
 * Helper: Xử lý logic Coupon
 */
const _handleCoupon = async (couponCode, total_price, userId, items, session) => {
  if (!couponCode) return { validatedCoupon: null, discount_amount: 0, priceAfterCoupon: total_price };

  const couponResult = await CouponService.validateCoupon(couponCode, total_price, userId, items);
  await CouponService.incrementUsedCount(couponCode, session);

  return {
    validatedCoupon: couponResult.coupon,
    discount_amount: couponResult.discountAmount,
    priceAfterCoupon: couponResult.finalPrice
  };
};

/**
 * Helper: Xử lý dùng điểm thưởng
 */
const _handlePoints = async (user, pointsToUse, priceAfterCoupon, session) => {
  if (pointsToUse <= 0) return { points_used: 0, points_discount_amount: 0, final_price: priceAfterCoupon };

  if (user.loyalty_points < pointsToUse) throw ApiError.BAD_REQUEST('Số dư điểm không đủ');

  const config = await LoyaltyService.getConfig();
  const maxDiscountVnd = Math.floor(priceAfterCoupon * (config.max_point_discount_percentage / 100));
  
  const points_used = Math.min(pointsToUse, Math.floor(maxDiscountVnd / config.point_to_vnd_ratio));
  const points_discount_amount = points_used * config.point_to_vnd_ratio;

  await LoyaltyService.addPoints(user._id, -points_used, 'Dùng điểm cho đơn hàng', null, null, session);

  return { points_used, points_discount_amount, final_price: priceAfterCoupon - points_discount_amount };
};

/**
 * Helper: Tạo đơn hàng, xóa giỏ và gửi email
 */
const _finalizeOrder = async (userId, user, address, total_price, couponCode, discount_amount, points_used, points_discount_amount, final_price, items, session) => {
  const config = await LoyaltyService.getConfig();
  const points_earned = Math.floor(final_price * (config.point_ratios[user.rank] || 0.01));

  const [order] = await Order.create([{
    user_id: userId, total_price, coupon_code: couponCode || '', 
    discount_amount, points_used, points_discount_amount, points_earned,
    final_price, status: ORDER_STATUS.PENDING, address, items,
  }], { session });

  // Update PointHistory with real order ID
  if (points_used > 0) {
    const PointHistory = require('../schemas/PointHistory.schema');
    await PointHistory.findOneAndUpdate(
      { user: userId, points_change: -points_used, order: null },
      { order: order._id, reason: `Dùng điểm cho đơn hàng #${order._id}` },
      { session }
    );
  }

  await CartItem.deleteMany({ user_id: userId }).session(session);

  const finalOrder = await Order.findById(order._id)
    .populate('user_id', 'email full_name phone avatar_url')
    .populate('items.cake_id', 'name price image_url slug');

  if (finalOrder?.user_id?.email) sendOrderConfirmationEmail(finalOrder.user_id.email, finalOrder);

  return finalOrder;
};

/**
 * [V6-3.2] Lấy danh sách đơn hàng (Standard Logic)
 */
const getOrders = async (userId, role) => {
  // 1. Xây dựng Query Object minh bạch
  const query = {};
  if (role !== 'admin' || userId) {
    query.user_id = userId;
  }

  // 2. Fetch dữ liệu với lean()
  const orders = await Order.find(query)
    .populate('user_id', 'email full_name phone avatar_url')
    .populate('items.cake_id', 'name price image_url slug')
    .sort({ createdAt: -1 })
    .lean();

  // 3. Transform dữ liệu bằng JS
  const items = orders.map((order) => ({
    ...order,
    items_count: order.items.length
  }));

  return { items };
};

const getOrderById = async (orderId, userId, role) => {
  const order = await Order.findById(orderId)
    .populate('user_id', 'email full_name phone avatar_url')
    .populate('items.cake_id', 'name price image_url slug');
  if (!order) {
    throw ApiError.NOT_FOUND('Đơn hàng không tồn tại');
  }

  if (role !== 'admin' && order.user_id._id.toString() !== userId) {
    throw ApiError.NOT_FOUND('Đơn hàng không tồn tại');
  }

  return order;
};

const updateStatus = async (orderId, newStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw ApiError.NOT_FOUND('Đơn hàng không tồn tại');
    }

    const allowedTransitions = VALID_TRANSITIONS[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw ApiError.BAD_REQUEST(`Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`);
    }

    // Hoàn kho nếu hủy đơn
    if (newStatus === ORDER_STATUS.REJECTED && (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED)) {
      for (const item of order.items) {
        if (item.variant_id) {
          await Cake.updateOne(
            { _id: item.cake_id, "variants._id": item.variant_id },
            { $inc: { "variants.$.stock": item.quantity } },
            { session }
          );
        } else {
          await Cake.findByIdAndUpdate(item.cake_id, { $inc: { stock: item.quantity } }, { session });
        }
      }
    }

    order.status = newStatus;
    await order.save({ session });

    // Xử lý Loyalty (Tích điểm/Thăng hạng hoặc Hoàn điểm)
    if (newStatus === ORDER_STATUS.DONE) {
      await LoyaltyService.processOrderCompletion(orderId, session);
    } else if (newStatus === ORDER_STATUS.REJECTED) {
      await LoyaltyService.refundPoints(orderId, session);
    }

    await session.commitTransaction();

    // Gửi email cập nhật trạng thái
    const orderWithUser = await Order.findById(orderId).populate('user_id', 'email');
    if (orderWithUser && orderWithUser.user_id.email) {
      sendOrderStatusUpdateEmail(orderWithUser.user_id.email, orderWithUser);
    }

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Xuất danh sách đơn hàng ra file Excel (Chỉ Admin)
 * @returns {Promise<ExcelJS.Workbook>}
 */
const exportExcel = async (sortBy = 'createdAt', sortOrder = -1) => {
  const sortCriteria = {};
  sortCriteria[sortBy] = sortOrder;

  const orders = await Order.find()
    .populate('user_id', 'username email full_name')
    .populate('items.cake_id', 'name')
    .sort(sortCriteria);

  const columns = [
    { header: 'Ngày Đặt', key: 'createdAt', width: 20 },
    { header: 'Khách Hàng', key: 'userName', width: 25 },
    { header: 'Email', key: 'userEmail', width: 30 },
    { header: 'Địa Chỉ', key: 'address', width: 40 },
    { header: 'Danh Sách Món', key: 'items_summary', width: 50 },
    { header: 'Thanh Toán Cuối (VNĐ)', key: 'final_price', width: 25 },
    { header: 'Trạng Thái', key: 'status', width: 15 },
  ];

  const rows = orders.map(order => {
    const finalPriceVal = order.final_price || (order.total_price - (order.discount_amount || 0) - (order.points_discount_amount || 0));

    return {
      createdAt: order.createdAt ? order.createdAt.toLocaleString('vi-VN') : 'N/A',
      userName: order.user_id ? (order.user_id.full_name || order.user_id.username) : 'Guest',
      userEmail: order.user_id ? order.user_id.email : 'N/A',
      address: order.address,
      items_summary: order.items.map(item => `${item.cake_id?.name || 'Sản phẩm đã xóa'} (x${item.quantity})`).join(', '),
      final_price: finalPriceVal,
      status: order.status,
    };
  });

  return await excelService.generateExcel('Báo cáo Đơn hàng', columns, rows);
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
  exportExcel,
};
