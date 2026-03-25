const mongoose = require('mongoose');
const Order = require('../schemas/Order.schema');
const CartItem = require('../schemas/CartItem.schema');
const { createError } = require('../utils/response.utils');

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['DONE'],
  DONE: [],
  REJECTED: [],
};

const createOrder = async (userId, address) => {
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
    const items = cartItems.map((item) => {
      if (!item.cake_id) {
        throw createError('Một sản phẩm trong giỏ hàng không còn tồn tại', 400, 'BAD_REQUEST');
      }
      const price_at_buy = item.cake_id.price;
      total_price += price_at_buy * item.quantity;
      return {
        cake_id: item.cake_id._id,
        quantity: item.quantity,
        price_at_buy: price_at_buy,
      };
    });

    const newOrders = await Order.create(
      [
        {
          user_id: userId,
          total_price,
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

  const orders = await Order.find(query).sort({ createdAt: -1 });
  
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
  const order = await Order.findById(orderId).populate('items.cake_id', 'name price image_url slug');
  if (!order) {
    throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
  }

  if (role !== 'admin' && order.user_id.toString() !== userId) {
    throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
  }

  return order;
};

const updateStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw createError('Đơn hàng không tồn tại', 404, 'NOT_FOUND');
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw createError(`Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`, 400, 'BAD_REQUEST');
  }

  order.status = newStatus;
  await order.save();

  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
};
