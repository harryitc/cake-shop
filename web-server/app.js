require('dotenv').config();

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const logger = require('morgan');

const connectDB = require('./config/db.config');
const errorHandler = require('./middlewares/error-handler');
const { createError } = require('./utils/response.utils');

// Kết nối MongoDB
connectDB();

const app = express();

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static('public/uploads'));

// ─── Middlewares ──────────────────────────────────────────────────────────────
const allowedOrigins = '*';
// const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*';
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/cakes', require('./routes/cake.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));
app.use('/api/v1/coupons', require('./routes/coupon.routes'));
app.use('/api/v1/uploads', require('./routes/upload.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));
app.use('/api/v1/wishlist', require('./routes/wishlist.routes'));
app.use('/api/v1/import', require('./routes/import.routes'));
app.use('/api/v1/loyalty', require('./routes/loyalty.routes'));

const { HTTP_STATUS, ERROR_CODES } = require('./config/constants');

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(createError('Route không tồn tại', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND));
});

// ─── Global Error Handler (phải đứng cuối cùng) ───────────────────────────────
app.use(errorHandler);

module.exports = app;
