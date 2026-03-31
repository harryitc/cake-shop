require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../schemas/User.schema');
const { USER_ROLES } = require('../config/constants');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Lỗi: Không tìm thấy MONGO_URI trong file .env");
  process.exit(1);
}

const createAdmin = async () => {
  try {
    console.log("⏳ Đang kết nối tới MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!");

    const email = 'admin@gmail.com';
    const password = 'admin123';

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`⚠️ Tài khoản ${email} đã tồn tại trong database.`);
      
      // Nếu đã có nhưng không phải quyền admin thì update lại quyền
      if (existingAdmin.role !== USER_ROLES.ADMIN) {
        existingAdmin.role = USER_ROLES.ADMIN;
        await existingAdmin.save();
        console.log("✅ Đã cập nhật quyền ADMIN cho tài khoản này.");
      }
      process.exit(0);
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Tạo User mới
    const adminUser = new User({
      email,
      password_hash,
      role: USER_ROLES.ADMIN,
      full_name: 'Super Admin',
    });

    await adminUser.save();
    console.log(`🎉 Đã tạo thành công tài khoản Admin!`);
    console.log(`Email: ${email}`);
    console.log(`Mật khẩu: ${password}`);

  } catch (error) {
    console.error("❌ Lỗi khi tạo tài khoản Admin:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
