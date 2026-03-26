const mongoose = require('mongoose');

const fileSystemSchema = new mongoose.Schema(
  {
    filename_client: {
      type: String,
      required: true,
    },
    filename_server: {
      type: String,
      required: true,
      unique: true,
    },
    ext: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'file_system', // Đặt tên table là file_system như yêu cầu
  }
);

module.exports = mongoose.model('FileSystem', fileSystemSchema);
