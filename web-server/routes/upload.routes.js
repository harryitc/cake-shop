const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Chỉ cho phép admin upload ảnh
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  uploadController.uploadImage
);

module.exports = router;
