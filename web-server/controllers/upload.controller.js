const FileSystem = require('../schemas/FileSystem.schema');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadImage = async (req, res) => {
  if (!req.file) {
    throw ApiError.BAD_REQUEST('Vui lòng chọn file để tải lên');
  }

  // Tạo tên file mới với đuôi .webp
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const newFilename = `image-${uniqueSuffix}.webp`;
  const uploadDir = 'public/uploads/';
  const fullPath = path.join(uploadDir, newFilename);

  // Kiểm tra và tạo thư mục nếu chưa tồn tại
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Dùng sharp để chuyển sang .webp và nén
  // Lưu ý: req.file.buffer có được nhờ multer.memoryStorage()
  const metadata = await sharp(req.file.buffer)
    .webp({ quality: 80 }) // Chuyển sang webp, chất lượng 80% (tốt & nhẹ)
    .toFile(fullPath);

  const fileInfo = {
    filename_client: req.file.originalname,
    filename_server: newFilename,
    ext: '.webp',
    size: metadata.size, // Kích thước sau khi đã nén
    path: `/uploads/${newFilename}`,
    domain: '', // Để trống như cấu hình ban đầu
  };

  // Lưu thông tin vào database
  const newFile = await FileSystem.create(fileInfo);

  return sendSuccess(
    res,
    { path: newFile.path },
    'Tải lên và tối ưu hóa hình ảnh (.webp) thành công',
    HTTP_STATUS.CREATED
  );
};

const uploadModel = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('Vui lòng chọn file để tải lên', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const ext = path.extname(req.file.originalname) || '.glb';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const newFilename = `model-${uniqueSuffix}${ext}`;
    const uploadDir = 'public/uploads/models/';
    const fullPath = path.join(uploadDir, newFilename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Ghi thẳng buffer dạng nhị phân vào file
    fs.writeFileSync(fullPath, req.file.buffer);

    const fileInfo = {
      filename_client: req.file.originalname,
      filename_server: newFilename,
      ext: ext,
      size: req.file.size || Buffer.byteLength(req.file.buffer),
      path: `/uploads/models/${newFilename}`,
      domain: '',
    };

    const newFile = await FileSystem.create(fileInfo);

    return sendSuccess(
      res,
      { path: newFile.path },
      'Tải lên mô hình 3D thành công',
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadImage,
  uploadModel,
};
