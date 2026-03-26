const CartItem = require('../schemas/CartItem.schema');
const Cake = require('../schemas/Cake.schema');
const { createError } = require('../utils/response.utils');

/**
 * Lấy danh sách giỏ hàng của current user
 * @param {string} userId
 * @returns {Object} { items, total }
 */
const getCart = async (userId) => {
  const items = await CartItem.find({ user_id: userId })
    .populate('cake_id', 'name price image_url slug')
    .sort({ createdAt: -1 });

  // Tính subtotal cho mỗi items và tổng total
  let total = 0;
  const formattedItems = items.map((item) => {
    // Nếu bánh đã bị xoá khỏi db, cake_id sẽ là null
    const price = item.cake_id ? item.cake_id.price : 0;
    const subtotal = price * item.quantity;
    total += subtotal;

    return {
      id: item._id,
      cake: item.cake_id || null, // Xử lý graceful degradation
      quantity: item.quantity,
      subtotal,
    };
  });

  return {
    items: formattedItems,
    total,
  };
};

/**
 * Thêm sản phẩm vào giỏ hàng (tự động cộng dồn số lượng nếu đã tồn tại)
 * @param {string} userId 
 * @param {Object} payload - { cake_id, quantity }
 * @returns {Object} updatedItem
 */
const addItem = async (userId, { cake_id, quantity = 1 }) => {
  // Check sản phẩm có tồn tại không
  const cakeExists = await Cake.findById(cake_id);
  if (!cakeExists) {
    throw createError('Không tìm thấy sản phẩm bánh này', 404, 'NOT_FOUND');
  }

  // Dùng findOneAndUpdate với upsert: true để tiết kiệm câu query (hoặc insert hoặc update)
  const item = await CartItem.findOneAndUpdate(
    { user_id: userId, cake_id: cake_id },
    { $inc: { quantity: quantity } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return item;
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 * @param {string} userId 
 * @param {string} itemId 
 * @returns {boolean}
 */
const removeItem = async (userId, itemId) => {
  // Phải kiểm tra cả user_id để tránh xoá hộ giỏ hàng người khác
  const item = await CartItem.findOneAndDelete({ _id: itemId, user_id: userId });
  if (!item) {
    throw createError('Không tìm thấy sản phẩm trong giỏ hàng', 404, 'NOT_FOUND');
  }
  return true;
};

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng
 * @param {string} userId
 * @param {string} itemId
 * @param {number} quantity
 * @returns {Object}
 */
const updateItemQuantity = async (userId, itemId, quantity) => {
  const item = await CartItem.findOneAndUpdate(
    { _id: itemId, user_id: userId },
    { quantity },
    { new: true }
  );

  if (!item) {
    throw createError('Không tìm thấy sản phẩm trong giỏ hàng', 404, 'NOT_FOUND');
  }

  return item;
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  updateItemQuantity,
};
