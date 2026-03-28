const mongoose = require('mongoose');
const { USER_ROLES, LOYALTY_RANKS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    full_name: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    avatar_url: {
      type: String,
      default: '',
    },
    birthday: {
      type: Date,
      default: null,
    },
    loyalty_points: {
      type: Number,
      default: 0,
      index: true,
    },
    total_spent: {
      type: Number,
      default: 0,
      index: true,
    },
    rank: {
      type: String,
      enum: Object.values(LOYALTY_RANKS),
      default: LOYALTY_RANKS.BRONZE,
      index: true,
    },
    rank_lock: {
      type: Boolean,
      default: false,
    },
    reset_password_token: {
      type: String,
      default: null,
    },
    reset_password_expires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
