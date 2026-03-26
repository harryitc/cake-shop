const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
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
  }
);

module.exports = mongoose.model('Upload', uploadSchema);
