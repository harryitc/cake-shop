const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * Global Error Handler Middleware
 * Bắt toàn bộ lỗi được đẩy qua next(err), nén thành JSON chuẩn.
 * Không bao giờ để lộ stack trace ra ngoài môi trường production.
 */
const errorHandler = (err, req, res, next) => {
  // Lấy statusCode từ err (nếu có), mặc định ban đầu là 500
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = err.code || ERROR_CODES.INTERNAL_ERROR;
  
  // Lưu lại message gốc để logging ở server
  const originalMessage = err.message || 'Unknown Error';

  // --- Tùy chỉnh: Ép các lỗi hệ thống bất ngờ (500) về lỗi Logic (422) ---
  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    statusCode = HTTP_STATUS.LOGIC_ERROR; // 422
    code = ERROR_CODES.LOGIC_ERROR;
  }

  let message = err.message || 'Có lỗi xảy ra từ máy chủ';
  let details = err.details || null;

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

  const isProd = process.env.NODE_ENV === 'production';

  const errorBody = {
    error: {
      code,
      statuscode: statusCode,
      timestamp: err.timestamp || new Date().toISOString(),
      path: req.originalUrl, // <--- THÊM TRƯỞNG PATH
      message: (code === ERROR_CODES.LOGIC_ERROR) 
               ? 'Hệ thống gặp sự cố nghiệp vụ, vui lòng thử lại sau.' 
               : message,
      details
    }
  };

  // --- LOGGING TẠI SERVER ---
  // Nếu là lỗi Logic Error (422), chúng ta log chi tiết lỗi gốc để Dev kiểm tra
  if (code === ERROR_CODES.LOGIC_ERROR) {
    console.error(`[LOGIC ERROR at ${req.originalUrl}]:`, originalMessage);
    if (err.stack) console.error(err.stack);
  } else if (!isProd) {
    console.error(`[ERROR] ${code}:`, message);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json(errorBody);
};

module.exports = errorHandler;
