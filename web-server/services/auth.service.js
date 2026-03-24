const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../schemas/User.schema');
const { createError } = require('../utils/response.utils');

/**
 * Đăng ký tài khoản mới
 * @param {Object} data - { email, password }
 * @returns {Object} { token, user }
 */
const register = async ({ email, password }) => {
  // Check duplicate
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('Email đã được sử dụng', 409, 'DUPLICATE_EMAIL');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password_hash,
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
    throw createError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
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

module.exports = {
  register,
  login,
};
