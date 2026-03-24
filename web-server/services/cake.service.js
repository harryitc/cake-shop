const Cake = require('../schemas/Cake.schema');
const { createError } = require('../utils/response.utils');

/**
 * Láy danh sách bánh (có phân trang và tìm kiếm theo tên)
 * @param {Object} params - { page, limit, search }
 * @returns {Object} { items, total, page, limit }
 */
const getAll = async ({ page = 1, limit = 10, search = '' }) => {
  const query = {};

  if (search) {
    // Case-insensitive search
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Cake.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Cake.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

/**
 * Láy chi tiết bánh theo ID
 * @param {string} id
 * @returns {Object} item
 */
const getById = async (id) => {
  const cake = await Cake.findById(id);
  if (!cake) {
    throw createError('Không tìm thấy sản phẩm bánh này', 404, 'NOT_FOUND');
  }
  return cake;
};

/**
 * Tạo mới bánh (Chỉ Admin)
 * @param {Object} data - { name, price, description, image_url }
 * @returns {Object} item
 */
const create = async (data) => {
  const cake = await Cake.create(data);
  return cake;
};

/**
 * Cập nhật bánh (Chỉ Admin)
 * @param {string} id 
 * @param {Object} data 
 * @returns {Object} item
 */
const update = async (id, data) => {
  // runValidators để mongoose check lại rule min: 0 của price
  // new: true để trả về document sau khi update
  const cake = await Cake.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cake) {
    throw createError('Không tìm thấy sản phẩm bánh để cập nhật', 404, 'NOT_FOUND');
  }
  return cake;
};

/**
 * Xóa bánh (Chỉ Admin)
 * @param {string} id 
 * @returns {boolean} success
 */
const remove = async (id) => {
  const cake = await Cake.findByIdAndDelete(id);
  if (!cake) {
    throw createError('Không tìm thấy sản phẩm bánh để xóa', 404, 'NOT_FOUND');
  }
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
