const Joi = require('joi');
const cartService = require('../services/cart.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');

// --- Schemas Validate ---
const itemObject = Joi.object({
  cake_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Cake ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp cake_id',
  }),
  variant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  quantity: Joi.number().min(1).default(1),
});

const addItemSchema = Joi.alternatives().try(
  itemObject,
  Joi.array().items(itemObject).min(1)
);

const itemIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Item ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp item id',
  })
});

const updateQuantitySchema = Joi.object({
  quantity: Joi.number().min(1).required().messages({
    'number.min': 'Số lượng tối thiểu là 1',
    'any.required': 'Vui lòng cung cấp số lượng',
  })
});

// --- Handlers ---
const getCart = async (req, res) => {
  // req.user.userId đã được attach từ auth.middleware
  const data = await cartService.getCart(req.user.userId);
  return sendSuccess(res, data, 'Lấy giỏ hàng thành công', HTTP_STATUS.OK);
};

const addItem = async (req, res) => {
  const { error, value } = addItemSchema.validate(req.body, { abortEarly: false });
  if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

  const data = await cartService.addItem(req.user.userId, value);
  return sendSuccess(res, data, 'Cập nhật giỏ hàng thành công', HTTP_STATUS.OK);
};

const removeItem = async (req, res) => {
  const { error, value } = itemIdParamSchema.validate(req.params, { abortEarly: false });
  if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

  await cartService.removeItem(req.user.userId, value.id);
  return sendSuccess(res, null, 'Đã xóa sản phẩm khỏi giỏ hàng', HTTP_STATUS.OK);
};

const updateItemQuantity = async (req, res) => {
  const { error: paramError, value: paramValue } = itemIdParamSchema.validate(req.params, { abortEarly: false });
  if (paramError) throw ApiError.BAD_REQUEST(paramError.details[0].message, paramError.details);

  const { error: bodyError, value: bodyValue } = updateQuantitySchema.validate(req.body, { abortEarly: false });
  if (bodyError) throw ApiError.BAD_REQUEST(bodyError.details[0].message, bodyError.details);

  const data = await cartService.updateItemQuantity(req.user.userId, paramValue.id, bodyValue.quantity);
  return sendSuccess(res, data, 'Cập nhật số lượng thành công', HTTP_STATUS.OK);
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  updateItemQuantity,
};
