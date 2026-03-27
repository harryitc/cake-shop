const jwt = require('jsonwebtoken');
const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * Middleware xác thực JWT Token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Không tìm thấy token. Vui lòng đăng nhập.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Gắn thông tin user vào request để các middleware/controller sau có thể dùng
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch (err) {
    return next(createError('Token không hợp lệ hoặc đã hết hạn', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN));
  }
};

module.exports = authenticate;
