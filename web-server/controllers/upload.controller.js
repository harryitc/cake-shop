const FileSystem = require('../schemas/FileSystem.schema');
const { sendSuccess, createError } = require('../utils/response.utils');
const path = require('path');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('Vui lòng chọn file để tải lên', 400, 'BAD_REQUEST');
    }

    const fileInfo = {
      filename_client: req.file.originalname,
      filename_server: req.file.filename,
      ext: path.extname(req.file.originalname),
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      domain: '', // Mặc định trống như yêu cầu
    };

    // Lưu thông tin vào database
    const newFile = await FileSystem.create(fileInfo);

    return sendSuccess(
      res,
      { path: newFile.path },
      'Tải lên hình ảnh thành công',
      201
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadImage,
};
