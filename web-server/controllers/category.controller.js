const categoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');
const Joi = require('joi');

class CategoryController {
  async create(req, res) {
    const schema = Joi.object({
      name: Joi.string().required().trim().messages({
        'string.empty': 'Vui lòng nhập tên danh mục',
        'any.required': 'Vui lòng nhập tên danh mục',
      }),
      description: Joi.string().allow('').optional(),
      image_url: Joi.string().allow('').optional(),
      parent_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
      type: Joi.string().valid('OCCASION', 'FLAVOR', 'DIET', 'OTHER').optional(),
      is_featured: Joi.boolean().optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

    try {
      const category = await categoryService.createCategory(value);
      return sendSuccess(res, category, 'Tạo danh mục thành công', HTTP_STATUS.CREATED);
    } catch (err) {
      if (err.code === 11000) throw ApiError.CONFLICT('Tên danh mục đã tồn tại');
      throw err;
    }
  }

  async getAll(req, res) {
    const categories = await categoryService.getAllCategories(req.query);
    return sendSuccess(res, categories);
  }

  async getById(req, res) {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) throw ApiError.NOT_FOUND('Không tìm thấy danh mục');
    return sendSuccess(res, category);
  }

  async update(req, res) {
    const schema = Joi.object({
      name: Joi.string().trim().optional(),
      description: Joi.string().allow('').optional(),
      image_url: Joi.string().allow('').optional(),
      parent_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
      type: Joi.string().valid('OCCASION', 'FLAVOR', 'DIET', 'OTHER').optional(),
      is_featured: Joi.boolean().optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

    try {
      const category = await categoryService.updateCategory(req.params.id, value);
      if (!category) throw ApiError.NOT_FOUND('Không tìm thấy danh mục');
      
      return sendSuccess(res, category, 'Cập nhật danh mục thành công');
    } catch (err) {
      if (err.code === 11000) throw ApiError.CONFLICT('Tên danh mục đã tồn tại');
      throw err;
    }
  }

  async delete(req, res) {
    // Logic kiểm tra category có cake không đã nằm ở service
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) throw ApiError.NOT_FOUND('Không tìm thấy danh mục');
    
    return sendSuccess(res, null, 'Xóa danh mục thành công');
  }
}

module.exports = new CategoryController();
