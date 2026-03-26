const categoryService = require('../services/category.service');
const Cake = require('../schemas/Cake.schema');
const { sendSuccess, sendError } = require('../utils/response.utils');
const Joi = require('joi');

class CategoryController {
  async create(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().allow('').optional(),
        image_url: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) return sendError(res, error.details[0].message, 400);

      const category = await categoryService.createCategory(value);
      sendSuccess(res, category, 'Tạo danh mục thành công', 201);
    } catch (err) {
      if (err.code === 11000) return sendError(res, 'Tên danh mục đã tồn tại', 400);
      sendError(res, err.message);
    }
  }

  async getAll(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      sendSuccess(res, categories);
    } catch (err) {
      sendError(res, err.message);
    }
  }

  async getById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) return sendError(res, 'Không tìm thấy danh mục', 404);
      sendSuccess(res, category);
    } catch (err) {
      sendError(res, err.message);
    }
  }

  async update(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().trim().optional(),
        description: Joi.string().allow('').optional(),
        image_url: Joi.string().allow('').optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) return sendError(res, error.details[0].message, 400);

      const category = await categoryService.updateCategory(req.params.id, value);
      if (!category) return sendError(res, 'Không tìm thấy danh mục', 404);
      sendSuccess(res, category, 'Cập nhật danh mục thành công');
    } catch (err) {
      if (err.code === 11000) return sendError(res, 'Tên danh mục đã tồn tại', 400);
      sendError(res, err.message);
    }
  }

  async delete(req, res) {
    try {
      // Kiểm tra xem có bánh nào đang thuộc danh mục này không
      const cakesCount = await Cake.countDocuments({ category: req.params.id });
      if (cakesCount > 0) {
        return sendError(res, 'Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.', 400);
      }

      const category = await categoryService.deleteCategory(req.params.id);
      if (!category) return sendError(res, 'Không tìm thấy danh mục', 404);
      sendSuccess(res, null, 'Xóa danh mục thành công');
    } catch (err) {
      sendError(res, err.message);
    }
  }
}

module.exports = new CategoryController();
