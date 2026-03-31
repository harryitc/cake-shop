const Joi = require('joi');
const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');

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
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Vui lòng xác nhận mật khẩu mới',
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

const register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  const data = await authService.register(value);
  return sendSuccess(res, data, 'Đăng ký thành công', HTTP_STATUS.CREATED);
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  const data = await authService.login(value);
  return sendSuccess(res, data, 'Đăng nhập thành công', HTTP_STATUS.OK);
};

const getMe = async (req, res) => {
  const data = await authService.getProfile(req.user.userId);
  return sendSuccess(res, data, 'Lấy thông tin thành công');
};

const updateProfile = async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  const data = await authService.updateProfile(req.user.userId, value);
  return sendSuccess(res, data, 'Cập nhật thông tin thành công');
};

const changePassword = async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  await authService.changePassword(req.user.userId, value.oldPassword, value.newPassword);
  return sendSuccess(res, null, 'Đổi mật khẩu thành công');
};

const forgotPassword = async (req, res) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  await authService.forgotPassword(value.email);
  return sendSuccess(res, null, 'Hướng dẫn đặt lại mật khẩu đã được gửi tới email của bạn');
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.BAD_REQUEST(error.details[0].message, error.details);
  }

  await authService.resetPassword(token, value.password);
  return sendSuccess(res, null, 'Đặt lại mật khẩu thành công');
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