const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Chỉ dành cho admin
router.get('/stats', authenticate, requireRole('admin'), analyticsController.getDashboardStats);

module.exports = router;
