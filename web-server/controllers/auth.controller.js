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

const updateProfileSchema = Joi.object({
  full_name: Joi.string().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  avatar_url: Joi.string().allow('').optional(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu cũ',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải từ 6 ký tự',
    'any.required': 'Vui lòng nhập mật khẩu mới',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email sai định dạng',
    'any.required': 'Vui lòng nhập email',
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải từ 6 ký tự',
    'any.required': 'Vui lòng cung cấp mật khẩu mới',
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

const getMe = async (req, res, next) => {
  try {
    const data = await authService.getProfile(req.user.userId);
    return sendSuccess(res, data, 'Lấy thông tin thành công');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const data = await authService.updateProfile(req.user.userId, value);
    return sendSuccess(res, data, 'Cập nhật thông tin thành công');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    await authService.changePassword(req.user.userId, value.oldPassword, value.newPassword);
    return sendSuccess(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    const token = await authService.forgotPassword(value.email);
    
    // In real app, don't return token in response. Log it for now.
    console.log(`Reset Token for ${value.email}: ${token}`);

    return sendSuccess(res, { token }, 'Hướng dẫn đặt lại mật khẩu đã được gửi (test mode)');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');

    await authService.resetPassword(token, value.password);
    return sendSuccess(res, null, 'Đặt lại mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};