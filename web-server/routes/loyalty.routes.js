const express = require('express');
const router = express.Router();
const LoyaltyController = require('../controllers/loyalty.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../config/constants');

// Tất cả các route yêu cầu đăng nhập
router.use(authMiddleware);

// Route cho người dùng cá nhân
router.get('/me', LoyaltyController.getMyLoyalty);

// Route cho Admin quản lý
router.use(roleMiddleware(USER_ROLES.ADMIN));

router.get('/admin/stats', LoyaltyController.getStats);
router.get('/admin/customers', LoyaltyController.getCustomers);
router.get('/admin/history/:userId', LoyaltyController.getPointHistory);
router.post('/admin/adjust-points/:userId', LoyaltyController.adjustPoints);
router.post('/admin/override-rank/:userId', LoyaltyController.overrideRank);
router.get('/admin/config', LoyaltyController.getConfig);
router.put('/admin/config', LoyaltyController.updateConfig);

module.exports = router;
