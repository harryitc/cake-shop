const WishlistService = require('../services/wishlist.service');
const { sendSuccess } = require('../utils/response.utils');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const wishlist = await WishlistService.getWishlist(userId);
    return sendSuccess(res, wishlist, 'Lấy danh sách yêu thích thành công', HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cake_id } = req.body;
    
    if (!cake_id) {
      return sendSuccess(res, null, 'Thiếu ID bánh', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await WishlistService.toggleWishlist(userId, cake_id);
    const message = result.isAdded 
      ? 'Đã thêm vào danh sách yêu thích' 
      : 'Đã xóa khỏi danh sách yêu thích';
      
    return sendSuccess(res, result.wishlist, message, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
