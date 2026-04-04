const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../schemas/User.schema');
const ApiError = require('../utils/error.factory');
const { sendResetPasswordEmail } = require('../utils/email.utils');

/**
 * Đăng ký tài khoản mới
 * @param {Object} data - { email, password }
 * @returns {Object} { token, user }
 */
const register = async ({ email, password, full_name, phone, birthday, address }) => {
  // Check duplicate
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.CONFLICT('Email đã được sử dụng');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password_hash,
    full_name,
    phone,
    birthday,
    address,
    role: 'user', // force role user for public register
  });

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Đăng nhập
 * @param {Object} data - { email, password }
 * @returns {Object} { token, user }
 */
const login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    // Luôn trả cùng 1 message để tránh user enumeration
    throw ApiError.UNAUTHORIZED('Email hoặc mật khẩu không đúng');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.UNAUTHORIZED('Email hoặc mật khẩu không đúng');
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Lấy thông tin cá nhân hiện tại
 * @param {string} userId 
 * @returns {Object} user profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password_hash -reset_password_token -reset_password_expires');
  if (!user) {
    throw ApiError.NOT_FOUND('Không tìm thấy người dùng');
  }
  return user;
};

/**
 * Cập nhật thông tin cá nhân
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Object} updated user
 */
const updateProfile = async (userId, updateData) => {
  const allowedFields = ['full_name', 'phone', 'address', 'avatar_url'];
  const filteredData = {};
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select('-password_hash');

  if (!user) {
    throw ApiError.NOT_FOUND('Không tìm thấy người dùng');
  }

  return user;
};

/**
 * Đổi mật khẩu
 * @param {string} userId 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('Không tìm thấy người dùng');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) {
    throw ApiError.BAD_REQUEST('Mật khẩu cũ không chính xác');
  }

  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  await user.save();

  return true;
};

/**
 * Yêu cầu quên mật khẩu
 * @param {string} email 
 * @returns {string} token (In real app, send via email)
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.NOT_FOUND('Không tìm thấy tài khoản với email này');
  }

  // Tạo token ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Lưu hash token và thời gian hết hạn (1 giờ)
  user.reset_password_token = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.reset_password_expires = Date.now() + 3600000;

  await user.save();

  // Gửi email đặt lại mật khẩu
  await sendResetPasswordEmail(user.email, resetToken);

  return resetToken;
};

/**
 * Đặt lại mật khẩu mới
 * @param {string} token 
 * @param {string} newPassword 
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    reset_password_token: hashedToken,
    reset_password_expires: { $gt: Date.now() }
  });

  if (!user) {
    throw ApiError.BAD_REQUEST('Token không hợp lệ hoặc đã hết hạn');
  }

  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  user.reset_password_token = null;
  user.reset_password_expires = null;

  await user.save();
  return true;
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
