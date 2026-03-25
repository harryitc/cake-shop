const Joi = require('joi');
const orderService = require('../services/order.service');
const { sendSuccess, createError } = require('../utils/response.utils');

const createOrderSchema = Joi.object({
  address: Joi.string().trim().required().messages({
    'string.empty': 'Vui lòng cung cấp địa chỉ giao hàng',
    'any.required': 'Vui lòng cung cấp địa chỉ giao hàng',
  }),
});

const idParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp ID',
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'DONE', 'REJECTED', 'PENDING').required().messages({
    'any.only': 'Trạng thái không hợp lệ',
    'any.required': 'Vui lòng cung cấp trạng thái mới',
  }),
});

const createOrder = async (req, res, next) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const order = await orderService.createOrder(req.user.userId, value.address);
    return sendSuccess(res, { order }, 'Đặt hàng thành công', 201);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const data = await orderService.getOrders(req.user.userId, req.user.role);
    return sendSuccess(res, data, 'Lấy danh sách đơn hàng thành công', 200);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
    if (paramError) throw createError(paramError.details[0].message, 400, 'VALIDATION_ERROR');

    const order = await orderService.getOrderById(paramValue.id, req.user.userId, req.user.role);
    return sendSuccess(res, { order }, 'Lấy chi tiết đơn hàng thành công', 200);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
    if (paramError) throw createError(paramError.details[0].message, 400, 'VALIDATION_ERROR');

    const { error: bodyError, value: bodyValue } = updateStatusSchema.validate(req.body);
    if (bodyError) throw createError(bodyError.details[0].message, 400, 'VALIDATION_ERROR');

    const order = await orderService.updateStatus(paramValue.id, bodyValue.status);
    return sendSuccess(res, { order }, 'Cập nhật trạng thái đơn hàng thành công', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
};
