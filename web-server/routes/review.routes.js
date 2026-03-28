const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Public routes
router.get('/cake/:cakeId', reviewController.getCakeReviews);

// User routes (Yêu cầu đăng nhập)
router.post('/', authenticate, reviewController.create);

// Admin routes
router.get('/admin', authenticate, requireRole('admin'), reviewController.getAllAdmin);
router.put('/admin/:reviewId/status', authenticate, requireRole('admin'), reviewController.updateStatus);
router.put('/admin/:reviewId/reply', authenticate, requireRole('admin'), reviewController.reply);

module.exports = router;
