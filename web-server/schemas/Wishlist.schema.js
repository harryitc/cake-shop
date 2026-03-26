const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cakes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cake',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Wishlist', WishlistSchema);
