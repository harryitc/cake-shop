const categoryService = require('../services/category.service');
const { sendSuccess, createError } = require('../utils/response.utils');
const Joi = require('joi');

class CategoryController {
  async create(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().required().trim().messages({
          'string.empty': 'Vui lòng nhập tên danh mục',
          'any.required': 'Vui lòng nhập tên danh mục',
        }),
        description: Joi.string().allow('').optional(),
        image_url: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

      const category = await categoryService.createCategory(value);
      return sendSuccess(res, category, 'Tạo danh mục thành công', 201);
    } catch (err) {
      if (err.code === 11000) return next(createError('Tên danh mục đã tồn tại', 400, 'DUPLICATE_ERROR'));
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      return sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) throw createError('Không tìm thấy danh mục', 404, 'NOT_FOUND');
      return sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().trim().optional(),
        description: Joi.string().allow('').optional(),
        image_url: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

      const category = await categoryService.updateCategory(req.params.id, value);
      if (!category) throw createError('Không tìm thấy danh mục', 404, 'NOT_FOUND');
      
      return sendSuccess(res, category, 'Cập nhật danh mục thành công');
    } catch (err) {
      if (err.code === 11000) return next(createError('Tên danh mục đã tồn tại', 400, 'DUPLICATE_ERROR'));
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      // Logic kiểm tra category có cake không đã nằm ở service
      const category = await categoryService.deleteCategory(req.params.id);
      if (!category) throw createError('Không tìm thấy danh mục', 404, 'NOT_FOUND');
      
      return sendSuccess(res, null, 'Xóa danh mục thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
