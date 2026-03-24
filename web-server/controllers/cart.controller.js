const Joi = require('joi');
const cartService = require('../services/cart.service');
const { sendSuccess, createError } = require('../utils/response.utils');

// --- Schemas Validate ---
const addItemSchema = Joi.object({
  cake_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Cake ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp cake_id',
  }),
  quantity: Joi.number().min(1).default(1),
});

const itemIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Item ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp item id',
  })
});

// --- Handlers ---
const getCart = async (req, res, next) => {
  try {
    // req.user.userId đã được attach từ auth.middleware
    const data = await cartService.getCart(req.user.userId);
    return sendSuccess(res, data, 'Lấy giỏ hàng thành công', 200);
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { error, value } = addItemSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await cartService.addItem(req.user.userId, value);
    return sendSuccess(res, data, 'Cập nhật giỏ hàng thành công', 200);
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { error, value } = itemIdParamSchema.validate(req.params);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    await cartService.removeItem(req.user.userId, value.id);
    return sendSuccess(res, null, 'Đã xóa sản phẩm khỏi giỏ hàng', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  removeItem,
};
