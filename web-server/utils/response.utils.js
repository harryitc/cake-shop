const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * Gửi response thành công chuẩn
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
const sendSuccess = (res, data = null, message = 'success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({ data, message });
};

/**
 * Tạo Error object chuẩn để ném qua next(err) → error-handler bắt
 * @param {string} message
 * @param {number} statusCode
 * @param {string} code
 * @param {*} details
 */
const createError = (message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = ERROR_CODES.INTERNAL_ERROR, details = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.timestamp = new Date().toISOString();
  err.details = details;
  return err;
};

module.exports = { sendSuccess, createError };
