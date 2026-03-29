const { createError } = require('./response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

const ApiError = {
  BAD_REQUEST: (msg = 'Yêu cầu không hợp lệ', details = null) => 
    createError(msg, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, details),
    
  UNAUTHORIZED: (msg = 'Vui lòng đăng nhập') => 
    createError(msg, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED),
    
  FORBIDDEN: (msg = 'Không có quyền truy cập') => 
    createError(msg, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN),
    
  NOT_FOUND: (msg = 'Không tìm thấy tài nguyên') => 
    createError(msg, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND),
    
  CONFLICT: (msg = 'Dữ liệu đã tồn tại', details = null) => 
    createError(msg, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, details),
    
  LOGIC: (msg = 'Lỗi nghiệp vụ', details = null) => 
    createError(msg, HTTP_STATUS.LOGIC_ERROR, ERROR_CODES.LOGIC_ERROR, details),
    
  INTERNAL: (msg = 'Lỗi máy chủ') => 
    createError(msg, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR)
};

module.exports = ApiError;
