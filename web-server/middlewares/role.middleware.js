const { createError } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * MIddleware kiểm tra quyền truy cập (Role Guard)
 * @param {string} role - Role yêu cầu, vd: 'admin'
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Chưa xác thực', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED));
    }

    if (req.user.role !== role) {
      return next(createError('Không có quyền truy cập', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

module.exports = requireRole;
