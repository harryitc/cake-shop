const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middlewares/auth.middleware');

// Toàn bộ API giỏ hàng đều yêu cầu người dùng phải đăng nhập trước
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:id', cartController.updateItemQuantity);
router.delete('/items/:id', cartController.removeItem);

module.exports = router;
