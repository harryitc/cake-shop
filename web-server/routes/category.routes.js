const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Public routes
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin routes
router.post('/', authenticate, requireRole('admin'), categoryController.create);
router.put('/:id', authenticate, requireRole('admin'), categoryController.update);
router.delete('/:id', authenticate, requireRole('admin'), categoryController.delete);

module.exports = router;
