const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * Global Error Handler Middleware
 * Bắt toàn bộ lỗi được đẩy qua next(err), nén thành JSON chuẩn.
 * Không bao giờ để lộ stack trace ra ngoài môi trường production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Có lỗi xảy ra từ máy chủ';

  // --- Xử lý lỗi đặc thù từ Multer (Upload File) ---
  if (err.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = ERROR_CODES.UPLOAD_ERROR;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Kích thước tệp quá lớn! Vui lòng tải lên ảnh dưới 5MB.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Trường tệp không đúng hoặc vượt quá số lượng tệp cho phép.';
        break;
      default:
        message = `Lỗi tải lên: ${err.message}`;
    }
  }

  // Lỗi do định dạng tệp (từ fileFilter trong middleware)
  if (code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
  }

  // --- Ẩn thông báo lỗi hệ thống ở Production ---
  const finalMessage =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Có lỗi xảy ra từ máy chủ'
      : message;

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} ${code}:`, message);
    if (statusCode === 500) console.error(err.stack);
  }

  return res.status(statusCode).json({
    error: { 
      code, 
      message: finalMessage 
    },
  });
};

module.exports = errorHandler;
