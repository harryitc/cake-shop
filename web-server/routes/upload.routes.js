const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Cho phép người dùng đã đăng nhập upload ảnh (ví dụ avatar hoặc admin tạo bánh)
router.post(
  '/',
  authenticate,
  upload.single('image'),
  uploadController.uploadImage
);

module.exports = router;
