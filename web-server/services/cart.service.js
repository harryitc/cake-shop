const CartItem = require('../schemas/CartItem.schema');
const Cake = require('../schemas/Cake.schema');
const ApiError = require('../utils/error.factory');

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
 * Hỗ trợ thêm đơn lẻ hoặc mảng nhiều sản phẩm (phục vụ Mua lại ngay)
 * @param {string} userId 
 * @param {Object|Array} payload - { cake_id, quantity, variant_id } hoặc [{...}]
 * @returns {Object|Array} updatedItem(s)
 */
const addItem = async (userId, payload) => {
  const { cake_id, quantity = 1, variant_id = null } = payload;

    // Check sản phẩm có tồn tại không
    const cake = await Cake.findById(cake_id);
    if (!cake) {
      throw ApiError.NOT_FOUND(`Không tìm thấy sản phẩm bánh: ${cake_id}`);
    }

    // Nếu có variant_id, kiểm tra xem variant có tồn tại trong cake không
    if (variant_id) {
      const variantExists = cake.variants.find(v => v._id.toString() === variant_id.toString());
      if (!variantExists) {
        throw ApiError.NOT_FOUND(`Không tìm thấy biến thể cho sản phẩm: ${cake_id}`);
      }
    }

    // Dùng findOneAndUpdate với upsert: true
    return await CartItem.findOneAndUpdate(
      { user_id: userId, cake_id: cake_id, variant_id: variant_id || null },
      { $inc: { quantity: Number(quantity) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

/**
 * Đồng bộ giỏ hàng từ Local Storage lên Server
 * @param {string} userId 
 * @param {Array} itemsToAdd - [{ cake_id, quantity, variant_id }]
 * @returns {Array} updatedItems
 */
const syncCart = async (userId, itemsToAdd) => {
  const results = await Promise.all(itemsToAdd.map(async ({ cake_id, quantity = 1, variant_id = null }) => {
    // Check sản phẩm có tồn tại không
    const cake = await Cake.findById(cake_id);
    if (!cake) {
      throw ApiError.NOT_FOUND(`Không tìm thấy sản phẩm bánh: ${cake_id}`);
    }

    // Nếu có variant_id, kiểm tra xem variant có tồn tại trong cake không
    if (variant_id) {
      const variantExists = cake.variants.find(v => v._id.toString() === variant_id.toString());
      if (!variantExists) {
        throw ApiError.NOT_FOUND(`Không tìm thấy biến thể cho sản phẩm: ${cake_id}`);
      }
    }

    return await CartItem.findOneAndUpdate(
      { user_id: userId, cake_id: cake_id, variant_id: variant_id || null },
      { $inc: { quantity: Number(quantity) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }));

  return results;
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
    throw ApiError.NOT_FOUND('Không tìm thấy sản phẩm trong giỏ hàng');
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
    throw ApiError.NOT_FOUND('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  return item;
};

module.exports = {
  getCart,
  addItem,
  syncCart,
  removeItem,
  updateItemQuantity,
};
