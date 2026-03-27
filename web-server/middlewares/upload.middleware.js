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

module.exports = upload;
