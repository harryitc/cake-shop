const mongoose = require('mongoose');
const Order = require('../schemas/Order.schema');
const CartItem = require('../schemas/CartItem.schema');
const Cake = require('../schemas/Cake.schema');
const User = require('../schemas/User.schema');
const CouponService = require('./coupon.service');
const LoyaltyService = require('./loyalty.service');
const excelService = require('./excel.service');
const { createError } = require('../utils/response.utils');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email.utils');
const { HTTP_STATUS, ERROR_CODES, ORDER_STATUS } = require('../config/constants');

const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DONE],
  [ORDER_STATUS.DONE]: [],
  [ORDER_STATUS.REJECTED]: [],
};

const createOrder = async (userId, address, couponCode = null, pointsToUse = 0) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw createError('Người dùng không tồn tại', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const cartItems = await CartItem.find({ user_id: userId })
      .populate('cake_id')
      .session(session);

    if (!cartItems || cartItems.length === 0) {
      throw createError('Giỏ hàng trống', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    let total_price = 0;
    const items = [];

    // Kiểm tra tồn kho trước khi tính toán
    for (const item of cartItems) {
      if (!item.cake_id) {
        throw createError('Một sản phẩm trong giỏ hàng không còn tồn tại', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      let price_at_buy = item.cake_id.price;
      let variant_size = '';
      let current_stock = item.cake_id.stock;

      // Nếu có biến thể
      if (item.variant_id) {
        const variant = item.cake_id.variants.find(v => v._id.toString() === item.variant_id.toString());
        if (!variant) {
          throw createError(`Không tìm thấy biến thể cho sản phẩm "${item.cake_id.name}"`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
        }
        price_at_buy = variant.price;
        variant_size = variant.size;
        current_stock = variant.stock;
      }

      if (current_stock < item.quantity) {
        const productLabel = variant_size ? `"${item.cake_id.name} (${variant_size})"` : `"${item.cake_id.name}"`;
        throw createError(`Sản phẩm ${productLabel} không đủ số lượng trong kho (còn lại: ${current_stock})`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      total_price += price_at_buy * item.quantity;
      items.push({
        cake_id: item.cake_id._id,
        quantity: item.quantity,
        variant_id: item.variant_id || null,
        variant_size: variant_size,
        price_at_buy: price_at_buy,
      });
    }

    // Trừ tồn kho
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

    // Xử lý Coupon
    let discount_amount = 0;
    let final_price = total_price;
    let validatedCoupon = null;

    if (couponCode) {
      const couponResult = await CouponService.validateCoupon(couponCode, total_price, userId, items);
      validatedCoupon = couponResult.coupon;
      discount_amount = couponResult.discountAmount;
      final_price = couponResult.finalPrice;

      // Tăng số lần sử dụng mã
      await CouponService.incrementUsedCount(couponCode, session);
    }

    // Xử lý dùng điểm (Points Redemption)
    let points_discount_amount = 0;
    let points_used = 0;
    const loyaltyConfig = await LoyaltyService.getConfig();

    if (pointsToUse > 0) {
      if (user.loyalty_points < pointsToUse) {
        throw createError('Số dư điểm không đủ', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }

      const maxDiscountPercent = loyaltyConfig.max_point_discount_percentage / 100;
      const pointToVndRatio = loyaltyConfig.point_to_vnd_ratio;

      // Giới hạn dùng điểm
      const maxPointsDiscount = Math.floor(final_price * maxDiscountPercent);
      points_used = Math.min(pointsToUse, Math.floor(maxPointsDiscount / pointToVndRatio));
      points_discount_amount = points_used * pointToVndRatio;

      final_price -= points_discount_amount;

      // Trừ điểm của người dùng
      await LoyaltyService.addPoints(
        userId,
        -points_used,
        `Dùng điểm cho đơn hàng #${userId}_${Date.now()}`,
        null,
        null,
        session
      );
    }

    // Tính toán số điểm sẽ tích lũy được (points_earned)
    const earnRatio = loyaltyConfig.point_ratios[user.rank] || 0.01;
    const points_earned = Math.floor(final_price * earnRatio);

    const newOrders = await Order.create(
      [
        {
          user_id: userId,
          total_price,
          coupon_code: couponCode || '',
          discount_amount,
          points_used,
          points_discount_amount,
          points_earned, // Lưu số điểm sẽ tích lũy được
          final_price,
          status: ORDER_STATUS.PENDING,
          address,
          items,
        },
      ],
      { session }
    );

    const order = newOrders[0];

    // Cập nhật lại lịch sử điểm với ID đơn hàng thực tế
    if (points_used > 0) {
      const PointHistory = require('../schemas/PointHistory.schema');
      await PointHistory.findOneAndUpdate(
        { user: userId, points_change: -points_used, order: null },
        { order: order._id, reason: `Dùng điểm cho đơn hàng #${order._id}` },
        { session }
      );
    }

    await CartItem.deleteMany({ user_id: userId }).session(session);

    await session.commitTransaction();

    // Trả về order đã được populate đầy đủ để frontend mapper hoạt động chính xác
    const finalOrder = await Order.findById(order._id)
      .populate('user_id', 'email full_name phone avatar_url')
      .populate('items.cake_id', 'name price image_url slug');

    if (finalOrder && finalOrder.user_id.email) {
      sendOrderConfirmationEmail(finalOrder.user_id.email, finalOrder);
    }

    return finalOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getOrders = async (userId, role) => {
  let query = {};
  // Nếu là user bình thường, chỉ lấy đơn của họ
  // Nếu là admin và có truyền userId, lấy đơn của user đó. Nếu không truyền, lấy tất cả.
  if (role !== 'admin') {
    query.user_id = userId;
  } else if (userId) {
    query.user_id = userId;
  }

  const orders = await Order.find(query)
    .populate('user_id', 'email full_name phone avatar_url')
    .populate('items.cake_id', 'name price image_url slug')
    .sort({ createdAt: -1 });

  const formattedOrders = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items_count = order.items.length;
    return orderObj;
  });

  return {
    items: formattedOrders,
  };
};

const getOrderById = async (orderId, userId, role) => {
  const order = await Order.findById(orderId)
    .populate('user_id', 'email full_name phone avatar_url')
    .populate('items.cake_id', 'name price image_url slug');
  if (!order) {
    throw createError('Đơn hàng không tồn tại', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  if (role !== 'admin' && order.user_id._id.toString() !== userId) {
    throw createError('Đơn hàng không tồn tại', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  return order;
};

const updateStatus = async (orderId, newStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw createError('Đơn hàng không tồn tại', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const allowedTransitions = VALID_TRANSITIONS[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw createError(`Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
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
