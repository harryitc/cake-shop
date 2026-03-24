/**
 * Global Error Handler Middleware
 * Bắt toàn bộ lỗi được đẩy qua next(err), nén thành JSON chuẩn.
 * Không bao giờ để lộ stack trace ra ngoài môi trường production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Có lỗi xảy ra từ máy chủ'
      : err.message || 'Có lỗi xảy ra từ máy chủ';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} ${code}:`, err.message);
  }

  return res.status(statusCode).json({
    error: { code, message },
  });
};

module.exports = errorHandler;
