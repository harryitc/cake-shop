const mongoose = require('mongoose');
const Order = require('../schemas/Order.schema');
const CartItem = require('../schemas/CartItem.schema');
const Cake = require('../schemas/Cake.schema');
const CouponService = require('./coupon.service');
const { createError } = require('../utils/response.utils');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email.utils');

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['DONE'],
  DONE: [],
  REJECTED: [],
};

const createOrder = async (userId, address, couponCode = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cartItems = await CartItem.find({ user_id: userId })
      .populate('cake_id')
      .session(session);

    if (!cartItems || cartItems.length === 0) {
      throw createError('Giỏ hàng trống', 400, 'BAD_REQUEST');
    }

    let total_price = 0;
    const items = [];
    
    // Kiểm tra tồn kho trước khi tính toán
    for (const item of cartItems) {
      if (!item.cake_id) {
        throw createError('Một sản phẩm trong giỏ hàng không còn tồn tại', 400, 'BAD_REQUEST');
      }

      let price_at_buy = item.cake_id.price;
      let variant_size = '';
      let current_stock = item.cake_id.stock;

      // Nếu có biến thể
      if (item.variant_id) {
        const variant = item.cake_id.variants.find(v => v._id.toString() === item.variant_id.toString());
        if (!variant) {
          throw createError(`Không tìm thấy biến thể cho sản phẩm "${item.cake_id.name}"`, 400, 'BAD_REQUEST');
        }
        price_at_buy = variant.price;
        variant_size = variant.size;
        current_stock = variant.stock;
      }

      if (current_stock < item.quantity) {
        const productLabel = variant_size ? `"${item.cake_id.name} (${variant_size})"` : `"${item.cake_id.name}"`;
        throw createError(`Sản phẩm ${productLabel} không đủ số lượng trong kho (còn lại: ${current_stock})`, 400, 'BAD_REQUEST');
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
      const couponResult = await CouponService.validateCoupon(couponCode, total_price);
      validatedCoupon = couponResult.coupon;
      discount_amount = couponResult.discountAmount;
      final_price = couponResult.finalPrice;
      
      // Tăng số lần sử dụng mã
      await CouponService.incrementUsedCount(couponCode, session);
    }

    const newOrders = await Order.create(
      [
        {
          user_id: userId,
          total_price,
          coupon_code: couponCode || '',
          discount_amount,
          final_price,
          status: 'PENDING',
          address,
          items,
        },
      ],
      { session }
    );

    const order = newOrders[0];

    await CartItem.deleteMany({ user_id: userId }).session(session);

    await session.commitTransaction();

    // Gửi email xác nhận (không chạy trong transaction để tránh làm chậm, 
    // và gửi sau khi commit thành công)
    const orderWithPopulatedData = await Order.findById(order._id)
      .populate('user_id', 'email')
      .populate('items.cake_id', 'name');
    
    if (orderWithPopulatedData && orderWithPopulatedData.user_id.email) {
      sendOrderConfirmationEmail(orderWithPopulatedData.user_id.email, orderWithPopulatedData);
    }

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getOrders = async (userId, role) => {
  let query = {};
  if (role !== 'admin') {
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
    throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
  }

  if (role !== 'admin' && order.user_id._id.toString() !== userId) {
    throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
  }

  return order;
};

const updateStatus = async (orderId, newStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
    }

    const allowedTransitions = VALID_TRANSITIONS[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw createError(`Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`, 400, 'BAD_REQUEST');
    }

    // Hoàn kho nếu hủy đơn
    if (newStatus === 'REJECTED' && (order.status === 'PENDING' || order.status === 'CONFIRMED')) {
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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
};
