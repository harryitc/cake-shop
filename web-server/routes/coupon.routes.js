const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Public route (User cần check mã trước khi đặt)
router.post('/validate', authenticate, couponController.validate);

// Admin routes
router.get('/', authenticate, requireRole('admin'), couponController.getAll);
router.post('/', authenticate, requireRole('admin'), couponController.create);
router.put('/:id', authenticate, requireRole('admin'), couponController.update);
router.delete('/:id', authenticate, requireRole('admin'), couponController.delete);

module.exports = router;
