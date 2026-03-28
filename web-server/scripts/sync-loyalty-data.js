const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Định nghĩa Schema trực tiếp để tránh lỗi SSL khi import Service/Schema bên ngoài
const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  total_spent: Number,
  loyalty_points: Number,
  rank: String,
  rank_lock: Boolean
});

const orderSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  final_price: Number,
  total_price: Number,
  status: String
});

const User = mongoose.model('SyncUser', userSchema, 'users');
const Order = mongoose.model('SyncOrder', orderSchema, 'orders');

async function syncLoyaltyData() {
  try {
    console.log('--- Đang kết nối Database ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối thành công!');

    const users = await User.find({ role: 'user' });
    console.log(`Tìm thấy ${users.length} khách hàng.`);

    const TIER_THRESHOLDS = {
      SILVER: 2000000,
      GOLD: 5000000,
      DIAMOND: 10000000,
    };

    for (const user of users) {
      const doneOrders = await Order.find({ 
        user_id: user._id, 
        status: 'DONE' 
      });
      
      const totalSpent = doneOrders.reduce((sum, order) => {
        const val = Number(order.final_price || order.total_price || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      
      console.log(`\nUser: ${user.email}`);
      console.log(`- Chi tiêu: ${totalSpent.toLocaleString()} VNĐ (${doneOrders.length} đơn DONE)`);

      // Tính hạng mới
      let newRank = 'BRONZE';
      if (totalSpent >= TIER_THRESHOLDS.DIAMOND) newRank = 'DIAMOND';
      else if (totalSpent >= TIER_THRESHOLDS.GOLD) newRank = 'GOLD';
      else if (totalSpent >= TIER_THRESHOLDS.SILVER) newRank = 'SILVER';

      const rankPriority = { BRONZE: 0, SILVER: 1, GOLD: 2, DIAMOND: 3 };
      
      const updateData = { total_spent: totalSpent };
      
      // Chỉ cập nhật hạng nếu hạng mới cao hơn hạng cũ và không bị khóa
      if (!user.rank_lock && rankPriority[newRank] > rankPriority[user.rank || 'BRONZE']) {
        updateData.rank = newRank;
        console.log(`- Thăng hạng: ${user.rank || 'BRONZE'} -> ${newRank}`);
      }

      await User.updateOne({ _id: user._id }, { $set: updateData });
      console.log(`- Đã cập nhật xong.`);
    }

    console.log('\n--- HOÀN TẤT ĐỒNG BỘ ---');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
    process.exit(1);
  }
}

syncLoyaltyData();
