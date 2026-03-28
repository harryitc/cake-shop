const mongoose = require('mongoose');
const { LOYALTY_RANKS } = require('../config/constants');

const loyaltyConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default_config'
    },
    tier_thresholds: {
      [LOYALTY_RANKS.SILVER]: { type: Number, default: 2000000 },
      [LOYALTY_RANKS.GOLD]: { type: Number, default: 5000000 },
      [LOYALTY_RANKS.DIAMOND]: { type: Number, default: 10000000 },
    },
    point_ratios: {
      [LOYALTY_RANKS.BRONZE]: { type: Number, default: 0.01 },
      [LOYALTY_RANKS.SILVER]: { type: Number, default: 0.02 },
      [LOYALTY_RANKS.GOLD]: { type: Number, default: 0.03 },
      [LOYALTY_RANKS.DIAMOND]: { type: Number, default: 0.05 },
    },
    max_point_discount_percentage: {
      type: Number,
      default: 20 // 20%
    },
    point_to_vnd_ratio: {
      type: Number,
      default: 1 // 1 point = 1 VND
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoyaltyConfig', loyaltyConfigSchema);
