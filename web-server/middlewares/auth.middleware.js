const jwt = require('jsonwebtoken');
const ApiError = require('../utils/error.factory');

/**
 * Middleware xác thực JWT Token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.UNAUTHORIZED('Không tìm thấy token. Vui lòng đăng nhập.');
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
    throw ApiError.UNAUTHORIZED('Token không hợp lệ hoặc đã hết hạn');
  }
};

module.exports = authenticate;
