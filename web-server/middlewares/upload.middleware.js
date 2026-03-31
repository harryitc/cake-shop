const multer = require('multer');

// Sử dụng memoryStorage để nhận file vào buffer (bộ nhớ tạm)
// Sau đó sẽ dùng sharp để xử lý và lưu vào đĩa
const storage = multer.memoryStorage();

// Bộ lọc file (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Trả về lỗi định dạng cụ thể
    const error = new Error('Định dạng tệp không được hỗ trợ! Chỉ chấp nhận các loại hình ảnh (JPG, PNG, WEBP,...)');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const modelFileFilter = (req, file, cb) => {
  const isGLTF = file.originalname.endsWith('.glb') || file.originalname.endsWith('.gltf');
  if (isGLTF || file.mimetype === 'model/gltf-binary' || file.mimetype === 'model/gltf+json') {
    cb(null, true);
  } else {
    const error = new Error('Định dạng tệp không được hỗ trợ! Chỉ chấp nhận .glb và .gltf');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const uploadModel = multer({
  storage: storage,
  fileFilter: modelFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = { upload, uploadModel };
