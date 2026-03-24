const { createError } = require('../utils/response.utils');

/**
 * MIddleware kiểm tra quyền truy cập (Role Guard)
 * @param {string} role - Role yêu cầu, vd: 'admin'
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Chưa xác thực', 401, 'UNAUTHORIZED'));
    }

    if (req.user.role !== role) {
      return next(createError('Không có quyền truy cập', 403, 'FORBIDDEN'));
    }

    next();
  };
};

module.exports = requireRole;
