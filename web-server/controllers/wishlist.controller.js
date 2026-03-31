const WishlistService = require('../services/wishlist.service');
const { sendSuccess } = require('../utils/response.utils');
const ApiError = require('../utils/error.factory');
const { HTTP_STATUS } = require('../config/constants');

const getWishlist = async (req, res) => {
  const userId = req.user.userId;
  const wishlist = await WishlistService.getWishlist(userId);
  return sendSuccess(res, wishlist, 'Lấy danh sách yêu thích thành công', HTTP_STATUS.OK);
};

const toggleWishlist = async (req, res) => {
  const userId = req.user.userId;
  const { cake_id } = req.body;
  
  if (!cake_id) {
    throw ApiError.BAD_REQUEST('Thiếu ID bánh');
  }

  const result = await WishlistService.toggleWishlist(userId, cake_id);
  const message = result.isAdded 
    ? 'Đã thêm vào danh sách yêu thích' 
    : 'Đã xóa khỏi danh sách yêu thích';
    
  return sendSuccess(res, result.wishlist, message, HTTP_STATUS.OK);
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
