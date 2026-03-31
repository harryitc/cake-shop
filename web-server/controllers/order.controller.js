const Joi = require('joi');
const orderService = require('../services/order.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS, ORDER_STATUS } = require('../config/constants');

const createOrderSchema = Joi.object({
  address: Joi.string().trim().required().messages({
    'string.empty': 'Vui lòng cung cấp địa chỉ giao hàng',
    'any.required': 'Vui lòng cung cấp địa chỉ giao hàng',
  }),
  coupon_code: Joi.string().trim().uppercase().allow('').optional(),
  points_to_use: Joi.number().min(0).optional().default(0),
});

const idParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'ID không hợp lệ',
    'any.required': 'Vui lòng cung cấp ID',
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).required().messages({
    'any.only': 'Trạng thái không hợp lệ',
    'any.required': 'Vui lòng cung cấp trạng thái mới',
  }),
});

const createOrder = async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });
  if (error) throw ApiError.BAD_REQUEST(error.details[0].message, error.details);

  const order = await orderService.createOrder(
    req.user.userId, 
    value.address, 
    value.coupon_code,
    value.points_to_use
  );
  return sendSuccess(res, { order }, 'Đặt hàng thành công', HTTP_STATUS.CREATED);
};

const getOrders = async (req, res) => {
  // Admin có thể truyền userId qua query để lọc
  const targetUserId = req.user.role === 'admin' ? req.query.userId : req.user.userId;
  const data = await orderService.getOrders(targetUserId, req.user.role);
  return sendSuccess(res, data, 'Lấy danh sách đơn hàng thành công', HTTP_STATUS.OK);
};

const getOrderById = async (req, res) => {
  const { error: paramError, value: paramValue } = idParamSchema.validate(req.params, { abortEarly: false });
  if (paramError) throw ApiError.BAD_REQUEST(paramError.details[0].message, paramError.details);

  const order = await orderService.getOrderById(paramValue.id, req.user.userId, req.user.role);
  return sendSuccess(res, { order }, 'Lấy chi tiết đơn hàng thành công', HTTP_STATUS.OK);
};

const updateStatus = async (req, res) => {
  const { error: paramError, value: paramValue } = idParamSchema.validate(req.params, { abortEarly: false });
  if (paramError) throw ApiError.BAD_REQUEST(paramError.details[0].message, paramError.details);

  const { error: bodyError, value: bodyValue } = updateStatusSchema.validate(req.body, { abortEarly: false });
  if (bodyError) throw ApiError.BAD_REQUEST(bodyError.details[0].message, bodyError.details);

  const order = await orderService.updateStatus(paramValue.id, bodyValue.status);
  return sendSuccess(res, { order }, 'Cập nhật trạng thái đơn hàng thành công', HTTP_STATUS.OK);
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
};
