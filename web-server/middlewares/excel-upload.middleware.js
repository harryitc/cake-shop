const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Định dạng tệp không được hỗ trợ! Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const excelUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB cho file dữ liệu
  },
});

module.exports = excelUpload;
