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
    .populate('cake_id', 'name price image_url slug stock variants')
    .sort({ createdAt: -1 });

  // Tính subtotal cho mỗi items và tổng total
  let total = 0;
  const formattedItems = items.map((item) => {
    let price = 0;
    let variant = null;

    if (item.cake_id) {
      if (item.variant_id && item.cake_id.variants && item.cake_id.variants.length > 0) {
        variant = item.cake_id.variants.find(v => v._id.toString() === item.variant_id.toString());
        if (variant) {
          price = variant.price;
        } else {
          price = item.cake_id.price;
        }
      } else {
        price = item.cake_id.price;
      }
    }

    const subtotal = price * item.quantity;
    total += subtotal;

    return {
      id: item._id,
      cake: item.cake_id || null,
      variant_id: item.variant_id,
      variant: variant,
      quantity: item.quantity,
      price: price,
      subtotal: subtotal,
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
 * @param {Object} payload - { cake_id, quantity, variant_id }
 * @returns {Object} updatedItem
 */
const addItem = async (userId, { cake_id, quantity = 1, variant_id = null }) => {
  // Check sản phẩm có tồn tại không
  const cake = await Cake.findById(cake_id);
  if (!cake) {
    throw createError('Không tìm thấy sản phẩm bánh này', 404, 'NOT_FOUND');
  }

  // Nếu có variant_id, kiểm tra xem variant có tồn tại trong cake không
  if (variant_id) {
    const variantExists = cake.variants.find(v => v._id.toString() === variant_id.toString());
    if (!variantExists) {
      throw createError('Không tìm thấy biến thể cho sản phẩm này', 404, 'NOT_FOUND');
    }
  }

  // Dùng findOneAndUpdate với upsert: true để tiết kiệm câu query (hoặc insert hoặc update)
  // Phải khớp cả cake_id và variant_id
  const item = await CartItem.findOneAndUpdate(
    { user_id: userId, cake_id: cake_id, variant_id: variant_id || null },
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
