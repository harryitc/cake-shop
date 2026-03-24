/**
 * Gửi response thành công chuẩn
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
const sendSuccess = (res, data = null, message = 'success', statusCode = 200) => {
  return res.status(statusCode).json({ data, message });
};

/**
 * Tạo Error object chuẩn để ném qua next(err) → error-handler bắt
 * @param {string} message
 * @param {number} statusCode
 * @param {string} code
 */
const createError = (message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

module.exports = { sendSuccess, createError };
