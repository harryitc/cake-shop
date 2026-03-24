const Joi = require('joi');
const authService = require('../services/auth.service');
const { sendSuccess, createError } = require('../utils/response.utils');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email sai định dạng',
    'any.required': 'Vui lòng nhập email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự',
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email sai định dạng',
    'any.required': 'Vui lòng nhập email',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = await authService.register(value);
    return sendSuccess(res, data, 'Đăng ký thành công', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = await authService.login(value);
    return sendSuccess(res, data, 'Đăng nhập thành công', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
