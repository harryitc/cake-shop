const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { orderLimiter } = require('../middlewares/rate-limiter');

router.use(authenticate);

router.post('/', orderLimiter, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id', requireRole('admin'), orderController.updateStatus);

module.exports = router;
