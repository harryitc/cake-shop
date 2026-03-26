const rateLimit = require('express-rate-limit');

/**
 * Giới hạn số lần tạo đơn hàng để chống spam
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Tối đa 5 đơn hàng mỗi giờ
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Bạn đã đặt hàng quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
  },
  standardHeaders: true, // Trả về thông tin giới hạn trong `RateLimit-*` headers
  legacyHeaders: false, // Tắt `X-RateLimit-*` headers
});

module.exports = {
  orderLimiter,
};
