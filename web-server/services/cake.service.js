const Cake = require('../schemas/Cake.schema');
const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');
const excelService = require('./excel.service');

/**
 * Láy danh sách bánh (có phân trang và tìm kiếm theo tên)
 * @param {Object} params - { page, limit, search, category, categories, min_price, max_price, tags, sort }
 * @returns {Object} { items, total, page, limit }
 */
const getAll = async ({ 
  page = 1, 
  limit = 10, 
  search = '', 
  category = '', 
  categories = [], 
  min_price = 0, 
  max_price = Infinity,
  tags = [],
  sort = 'newest'
}) => {
  const query = {};

  // 1. Tìm kiếm theo tên
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // 2. Lọc theo danh mục (hỗ trợ cả đơn lẻ và mảng)
  if (category) {
    query.$or = [{ category: category }, { categories: category }];
  } else if (categories && (Array.isArray(categories) ? categories.length > 0 : categories)) {
    const categoryList = Array.isArray(categories) ? categories : [categories];
    query.$or = [
      { category: { $in: categoryList } },
      { categories: { $in: categoryList } }
    ];
  }

  // 3. Lọc theo khoảng giá
  const min = Number(min_price);
  const max = Number(max_price);
  if (!isNaN(min) || !isNaN(max)) {
    query.price = {};
    if (!isNaN(min)) query.price.$gte = min;
    if (!isNaN(max) && max < Infinity) query.price.$lte = max;
    
    // Nếu query.price rỗng (cả hai đều NaN) thì xóa thuộc tính price
    if (Object.keys(query.price).length === 0) delete query.price;
  }

  // 4. Lọc theo thẻ (tags)
  if (tags && tags.length > 0) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagList };
  }

  // 5. Thiết lập sắp xếp
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { average_rating: -1 };
  else if (sort === 'oldest') sortOption = { createdAt: 1 };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Cake.find(query)
      .populate('category', 'name slug')
      .populate('categories', 'name slug')
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption),
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
  const cake = await Cake.findById(id)
    .populate('category', 'name slug')
    .populate('categories', 'name slug');
  if (!cake) {
    throw createError('Không tìm thấy sản phẩm bánh này', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
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
    throw createError('Không tìm thấy sản phẩm bánh để cập nhật', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
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
    throw createError('Không tìm thấy sản phẩm bánh để xóa', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
  return true;
};

/**
 * Xuất danh sách bánh ra file Excel (Chỉ Admin)
 * @returns {Promise<ExcelJS.Workbook>}
 */
const exportExcel = async (sortBy = 'name', sortOrder = 1) => {
  const sortCriteria = {};
  sortCriteria[sortBy] = sortOrder;

  const cakes = await Cake.find()
    .populate('category')
    .sort(sortCriteria);

  const columns = [
    { header: 'ID Sản phẩm', key: '_id', width: 30 },
    { header: 'Tên Bánh', key: 'name', width: 35 },
    { header: 'Danh Mục', key: 'category_name', width: 25 },
    { header: 'Giá Gốc (VNĐ)', key: 'price', width: 15 },
    { header: 'Tồn Kho', key: 'stock', width: 15 },
    { header: 'Nguyên Liệu', key: 'ingredients', width: 50 },
  ];

  const rows = cakes.map(cake => ({
    _id: cake._id.toString(),
    name: cake.name,
    category_name: cake.category ? cake.category.name : 'N/A',
    price: cake.price,
    stock: cake.stock || 0,
    ingredients: cake.ingredients && Array.isArray(cake.ingredients) ? cake.ingredients.join(', ') : '',
  }));

  return await excelService.generateExcel('Danh sách Bánh', columns, rows);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  exportExcel,
};
