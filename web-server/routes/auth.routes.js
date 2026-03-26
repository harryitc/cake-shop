const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');

// Routes công khai
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Routes yêu cầu đăng nhập
router.use(authenticate);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;
