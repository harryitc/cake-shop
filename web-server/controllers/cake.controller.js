const Joi = require('joi');
const cakeService = require('../services/cake.service');
const { sendSuccess, createError } = require('../utils/response.utils');

// --- Schemas Validate ---
const getAllQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
});

const idParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'ID không hợp lệ',
  })
});

const createBodySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Vui lòng nhập tên bánh',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Giá tiền không được nhỏ hơn 0',
    'any.required': 'Vui lòng nhập giá tiền',
  }),
  stock: Joi.number().min(0).default(0).messages({
    'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
  }),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().allow('').optional(),
});

const updateBodySchema = Joi.object({
  name: Joi.string().trim().optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().allow('').optional(),
}).min(1).messages({
  'object.min': 'Phải truyền ít nhất một trường để cập nhật'
});

// --- Handlers ---
const getAll = async (req, res, next) => {
  try {
    const { error, value } = getAllQuerySchema.validate(req.query);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await cakeService.getAll(value);
    return sendSuccess(res, data, 'Lấy danh sách thành công', 200);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await cakeService.getById(value.id);
    return sendSuccess(res, data, 'Lấy chi tiết thành công', 200);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createBodySchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await cakeService.create(value);
    return sendSuccess(res, data, 'Tạo bánh thành công', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    // Validate param ID
    const paramVal = idParamSchema.validate(req.params);
    if (paramVal.error) throw createError(paramVal.error.details[0].message, 400, 'VALIDATION_ERROR');

    // Validate body
    const bodyVal = updateBodySchema.validate(req.body);
    if (bodyVal.error) throw createError(bodyVal.error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await cakeService.update(paramVal.value.id, bodyVal.value);
    return sendSuccess(res, data, 'Cập nhật bánh thành công', 200);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    await cakeService.remove(value.id);
    return sendSuccess(res, null, 'Xóa bánh thành công', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
