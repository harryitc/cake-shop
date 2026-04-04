const Wishlist = require('../schemas/Wishlist.schema');

/**
 * Lấy danh sách yêu thích của người dùng
 */
const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user_id: userId }).populate('cakes', 'name price image_url slug stock average_rating review_count');
  
  if (!wishlist) {
    // Nếu chưa có, tạo mới
    wishlist = await Wishlist.create({ user_id: userId, cakes: [] });
  }
  
  return wishlist;
};

/**
 * Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích (Toggle)
 */
const toggleWishlist = async (userId, cakeId) => {
  let wishlist = await Wishlist.findOne({ user_id: userId });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user_id: userId, cakes: [cakeId] });
    return { isAdded: true, wishlist };
  }

  const cakeIndex = wishlist.cakes.indexOf(cakeId);
  let isAdded = false;

  if (cakeIndex > -1) {
    // Nếu đã có thì xóa
    wishlist.cakes.splice(cakeIndex, 1);
    isAdded = false;
  } else {
    // Nếu chưa có thì thêm
    wishlist.cakes.push(cakeId);
    isAdded = true;
  }

  await wishlist.save();
  return { isAdded, wishlist };
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
