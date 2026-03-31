const Joi = require('joi');
const cakeService = require('../services/cake.service');
const { sendSuccess, createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

// --- Schemas Validate ---
const getAllQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  categories: Joi.alternatives().try(
    Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  ).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  sort: Joi.string().valid('newest', 'oldest', 'price_asc', 'price_desc', 'rating').default('newest'),
});

const variantSchema = Joi.object({
  size: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).default(0),
});

const idParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'ID không hợp lệ',
  }),
});

const createBodySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Vui lòng nhập tên bánh',
  }),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Category ID không hợp lệ',
    'any.required': 'Vui lòng chọn danh mục chính',
  }),
  categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Giá tiền không được nhỏ hơn 0',
    'any.required': 'Vui lòng nhập giá tiền',
  }),
  stock: Joi.number().min(0).default(0).messages({
    'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
  }),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().allow('').optional(),
  model_url: Joi.string().allow('').optional(),
  variants: Joi.array().items(variantSchema).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object({
    weight: Joi.string().allow('').optional(),
    servings: Joi.string().allow('').optional(),
  }).optional(),
});

const updateBodySchema = Joi.object({
  name: Joi.string().trim().optional(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().allow('').optional(),
  model_url: Joi.string().allow('').optional(),
  variants: Joi.array().items(variantSchema).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object({
    weight: Joi.string().allow('').optional(),
    servings: Joi.string().allow('').optional(),
  }).optional(),
}).min(1).messages({
  'object.min': 'Phải truyền ít nhất một trường để cập nhật'
});

const importService = require('../services/import/ImportService');
const cakeImportConfig = require('../services/import/configs/cake.import.config');

// --- Handlers ---
const importCakes = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('Vui lòng tải lên file Excel', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    const { mode } = req.query; // UPSERT, INSERT_ONLY, UPDATE_ONLY
    const userId = req.user.userId;

    const result = await importService.execute(req.file.buffer, cakeImportConfig, mode, userId);
    
    return sendSuccess(res, result, 'Tiến trình import đã hoàn tất', HTTP_STATUS.OK);
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { error, value } = getAllQuerySchema.validate(req.query);
    if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    const data = await cakeService.getAll(value);
    return sendSuccess(res, data, 'Lấy danh sách thành công', HTTP_STATUS.OK);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    const data = await cakeService.getById(value.id);
    return sendSuccess(res, data, 'Lấy chi tiết thành công', HTTP_STATUS.OK);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createBodySchema.validate(req.body);
    if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    const data = await cakeService.create(value);
    return sendSuccess(res, data, 'Tạo bánh thành công', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    // Validate param ID
    const paramVal = idParamSchema.validate(req.params);
    if (paramVal.error) throw createError(paramVal.error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    // Validate body
    const bodyVal = updateBodySchema.validate(req.body);
    if (bodyVal.error) throw createError(bodyVal.error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    const data = await cakeService.update(paramVal.value.id, bodyVal.value);
    return sendSuccess(res, data, 'Cập nhật bánh thành công', HTTP_STATUS.OK);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

    await cakeService.remove(value.id);
    return sendSuccess(res, null, 'Xóa bánh thành công', HTTP_STATUS.OK);
  } catch (err) {
    next(err);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const { sortBy, order } = req.query;
    const sortOrder = order === 'desc' ? -1 : 1;
    const workbook = await cakeService.exportExcel(sortBy, sortOrder);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `BAO_CAO_CAKES_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
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
  importCakes,
  exportExcel,
};
