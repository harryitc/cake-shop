const Cake = require('../schemas/Cake.schema');
const ApiError = require('../utils/error.factory');
const excelService = require('./excel.service');

/**
 * Lấy danh sách bánh (có phân trang và tìm kiếm theo tên)
 * Refactored: Standard Query + JS Processing
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
  const limitNum = Number(limit);
  const pageNum = Number(page);

  // 1. Tìm kiếm theo tên
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // 2. Lọc theo danh mục
  if (category) {
    query.$or = [{ category: category }, { categories: category }];
  } else if (categories?.length > 0) {
    const categoryList = Array.isArray(categories) ? categories : [categories];
    query.$or = [
      { category: { $in: categoryList } },
      { categories: { $in: categoryList } }
    ];
  }

  // 3. Lọc theo khoảng giá
  const min = Number(min_price);
  const max = Number(max_price);
  if (!isNaN(min) || (!isNaN(max) && max < Infinity)) {
    query.price = {};
    if (!isNaN(min)) query.price.$gte = min;
    if (!isNaN(max) && max < Infinity) query.price.$lte = max;
  }

  // 4. Lọc theo thẻ
  if (tags?.length > 0) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  // 5. Thiết lập sắp xếp
  const sortOptions = {
    'price_asc': { price: 1 },
    'price_desc': { price: -1 },
    'rating': { average_rating: -1 },
    'oldest': { createdAt: 1 },
    'newest': { createdAt: -1 }
  };
  const sortOption = sortOptions[sort] || sortOptions['newest'];

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Cake.find(query)
      .populate('category', 'name slug')
      .populate('categories', 'name slug')
      .skip(skip)
      .limit(limitNum)
      .sort(sortOption)
      .lean(),
    Cake.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Lấy chi tiết bánh theo ID
 */
const getById = async (id) => {
  const cake = await Cake.findById(id)
    .populate('category', 'name slug')
    .populate('categories', 'name slug')
    .lean();
  if (!cake) throw ApiError.NOT_FOUND('Không tìm thấy sản phẩm bánh này');
  return cake;
};

/**
 * Tạo mới bánh (Chỉ Admin)
 */
const create = async (data) => {
  return await Cake.create(data);
};

/**
 * Cập nhật bánh (Chỉ Admin)
 */
const update = async (id, data) => {
  const cake = await Cake.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cake) throw ApiError.NOT_FOUND('Không tìm thấy sản phẩm bánh để cập nhật');
  return cake;
};

/**
 * Xóa bánh (Chỉ Admin)
 */
const remove = async (id) => {
  const cake = await Cake.findByIdAndDelete(id);
  if (!cake) throw ApiError.NOT_FOUND('Không tìm thấy sản phẩm bánh để xóa');
  return true;
};

/**
 * Xuất danh sách bánh ra file Excel (Chỉ Admin)
 */
const exportExcel = async (sortBy = 'name', sortOrder = 1) => {
  const sortCriteria = { [sortBy]: sortOrder };

  const cakes = await Cake.find()
    .populate('category')
    .sort(sortCriteria)
    .lean();

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
    ingredients: cake.ingredients?.join(', ') || '',
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
