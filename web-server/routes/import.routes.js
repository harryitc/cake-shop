const router = require('express').Router();
const importController = require('../controllers/import.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/history', authenticate, requireRole('admin'), importController.getHistory);
router.get('/errors/:historyId', authenticate, requireRole('admin'), importController.downloadErrors);

module.exports = router;
