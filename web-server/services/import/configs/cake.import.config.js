const Joi = require('joi');
const Cake = require('../../../schemas/Cake.schema');
const Category = require('../../../schemas/Category.schema');
const { IMPORT_ENTITIES } = require('../../../config/constants');

const cakeImportConfig = {
  entity: IMPORT_ENTITIES.CAKE,
  model: Cake,
  uniqueKey: '_id',
  batchSize: 500,

  // Mapping Excel Header -> DB Field
  mapping: {
    'ID Sản phẩm': '_id',
    'Tên Bánh': 'name',
    'Mô tả': 'description',
    'Giá': 'price',
    'Tồn kho': 'stock',
    'Ảnh': 'image_url',
    'Danh mục': 'category',
    'Tags': 'tags',
    'Thành phần': 'ingredients',
    'Trọng lượng': 'weight',
    'Số khẩu phần': 'servings'
  },

  /**
   * Biến đổi dữ liệu trước khi validate (ví dụ: tìm ID danh mục từ tên)
   */
  transform: async (rowData) => {
    // 1. Xử lý Category (Tìm ID từ tên danh mục)
    if (rowData.category) {
      const category = await Category.findOne({
        name: { $regex: new RegExp(`^${rowData.category}$`, 'i') }
      });
      if (category) {
        rowData.category = category._id;
      } else {
        throw new Error(`Danh mục '${rowData.category}' không tồn tại trong hệ thống.`);
      }
    }

    // 2. Xử lý Tags & Ingredients (Chuỗi phân cách bằng dấu phẩy thành mảng)
    if (typeof rowData.tags === 'string') {
      rowData.tags = rowData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (typeof rowData.ingredients === 'string') {
      rowData.ingredients = rowData.ingredients.split(',').map(i => i.trim()).filter(Boolean);
    }

    // 3. Xử lý Specifications
    if (rowData.weight || rowData.servings) {
      rowData.specifications = {
        weight: rowData.weight || '',
        servings: rowData.servings || ''
      };
      delete rowData.weight;
      delete rowData.servings;
    }

    // 4. Tự động sinh slug nếu chưa có (Để UniqueKey hoạt động cho Upsert)
    if (rowData.name && !rowData.slug) {
      rowData.slug = rowData.name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  },

  /**
   * Validate dữ liệu bằng Joi
   */
  validate: (rowData) => {
    const schema = Joi.object({
      name: Joi.string().required().messages({ 
        'any.required': 'Tên bánh là bắt buộc',
        'string.empty': 'Tên bánh không được để trống'
      }),
      description: Joi.string().allow(''),
      price: Joi.number().min(0).required().messages({ 
        'number.base': 'Giá bánh phải là định dạng số',
        'number.min': 'Giá bánh không được nhỏ hơn 0',
        'any.required': 'Giá bánh là bắt buộc'
      }),
      stock: Joi.number().min(0).default(0).messages({
        'number.base': 'Số lượng tồn kho phải là số',
        'number.min': 'Số lượng tồn kho không được nhỏ hơn 0'
      }),
      image_url: Joi.string().allow(''),
      slug: Joi.string().required(),
      category: Joi.any().required().messages({
        'any.required': 'Danh mục là bắt buộc và phải tồn tại trong hệ thống'
      }),
      tags: Joi.array().items(Joi.string()),
      ingredients: Joi.array().items(Joi.string()),
      specifications: Joi.object({
        weight: Joi.string().allow(''),
        servings: Joi.string().allow('')
      })
    }).unknown(true);

    return schema.validate(rowData);
  }
};

module.exports = cakeImportConfig;
