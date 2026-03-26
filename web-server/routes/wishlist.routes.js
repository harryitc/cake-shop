const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả các route trong file này đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);

module.exports = router;
