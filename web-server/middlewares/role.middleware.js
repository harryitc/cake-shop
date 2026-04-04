const ApiError = require('../utils/error.factory');

/**
 * MIddleware kiểm tra quyền truy cập (Role Guard)
 * @param {string} role - Role yêu cầu, vd: 'admin'
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.UNAUTHORIZED('Chưa xác thực');
    }

    if (req.user.role !== role) {
      throw ApiError.FORBIDDEN('Không có quyền truy cập');
    }

    next();
  };
};

module.exports = requireRole;
