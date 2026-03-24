const router = require('express').Router();
const authController = require('../controllers/auth.controller');

// Nơi các route công khai (không cần xác thực)
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
