const router = require('express').Router();
const cakeController = require('../controllers/cake.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const excelUpload = require('../middlewares/excel-upload.middleware');


// Routes công khai cho người dùng và khách xem
router.get('/', cakeController.getAll);
router.get('/export', authenticate, requireRole('admin'), cakeController.exportExcel);
router.get('/:id', cakeController.getById);

// Routes bảo vệ chỉ dành cho quản trị viên thêm sửa xoá
router.post('/import', authenticate, requireRole('admin'), excelUpload.single('file'), cakeController.importCakes);
router.post('/', authenticate, requireRole('admin'), cakeController.create);
router.put('/:id', authenticate, requireRole('admin'), cakeController.update);
router.delete('/:id', authenticate, requireRole('admin'), cakeController.remove);

module.exports = router;
