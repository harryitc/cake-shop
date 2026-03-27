require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  try {
    console.log("--- BẮT ĐẦU CHẨN ĐOÁN ---");
    console.log("URI trong file .env:", process.env.MONGO_URI ? "Đã tìm thấy (đang ẩn phần nhạy cảm)" : "KHÔNG TÌM THẤY!");
    
    if (process.env.MONGO_URI) {
        // Log một phần URI để kiểm tra database name (vùng trước dấu ?)
        const maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@");
        console.log("URI (đã ẩn pass):", maskedUri);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối thành công!");
    console.log("📂 Database hiện tại:", mongoose.connection.name);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📄 Danh sách collections:", collections.map(c => c.name));
    
    if (collections.length === 0) {
      console.log("⚠️ CẢNH BÁO: Database này đang TRỐNG (0 collections).");
    } else {
      const cakeCount = await mongoose.connection.db.collection('cakes').countDocuments();
      console.log(`🎂 Số lượng bản ghi trong collection 'cakes': ${cakeCount}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi kết nối:", err.message);
    process.exit(1);
  }
}

check();
