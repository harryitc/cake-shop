const mongoose = require('mongoose');
const Coupon = require('../schemas/Coupon.schema');
const Category = require('../schemas/Category.schema');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cake-shop';

/**
 * Cấu hình các bộ mã muốn tạo
 */
const COUPON_GROUPS = [
  {
    prefix: 'WELCOME',
    count: 5,
    data: {
      type: 'PERCENT',
      value: 10,
      description: 'Mã giảm giá 10% cho khách hàng mới',
      min_order_value: 0,
      max_discount_value: 50000,
      usage_limit: 1,
      usage_limit_per_user: 1,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    }
  },
  {
    prefix: 'CAKE20',
    count: 3,
    data: {
      type: 'FIXED',
      value: 20000,
      description: 'Giảm 20k cho đơn hàng từ 200k',
      min_order_value: 200000,
      usage_limit: 100,
      usage_limit_per_user: 1,
      start_date: new Date(),
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 ngày
    }
  }
];

const generateRandomString = (length = 4) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const run = async () => {
  try {
    console.log('🔗 Đang kết nối tới database...');
    // Thêm option để tránh lỗi SSL trong môi trường test
    const connectionUri = MONGO_URI.includes('?') 
      ? `${MONGO_URI}&tlsAllowInvalidCertificates=true` 
      : `${MONGO_URI}?tlsAllowInvalidCertificates=true`;
      
    await mongoose.connect(connectionUri);
    console.log('🚀 Kết nối thành công!');

    // Lấy một vài category ngẫu nhiên để test
    const categories = await Category.find().limit(2);
    const categoryIds = categories.map(c => c._id);

    // Thêm nhóm mã giảm giá theo danh mục
    if (categoryIds.length > 0) {
      COUPON_GROUPS.push({
        prefix: 'CATSPECIAL',
        count: 2,
        data: {
          type: 'PERCENT',
          value: 15,
          description: `Giảm 15% cho các sản phẩm danh mục: ${categories.map(c => c.name).join(', ')}`,
          min_order_value: 100000,
          applicable_categories: categoryIds,
          usage_limit: 50,
          usage_limit_per_user: 2,
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        }
      });
    }

    const couponsToCreate = [];
    const existingCodes = new Set((await Coupon.find().select('code')).map(c => c.code));

    for (const group of COUPON_GROUPS) {
      let createdInGroup = 0;
      let attempts = 0;
      const maxAttempts = group.count * 10;

      while (createdInGroup < group.count && attempts < maxAttempts) {
        const randomSuffix = generateRandomString(4);
        const fullCode = `${group.prefix}${randomSuffix}`;

        if (!existingCodes.has(fullCode)) {
          couponsToCreate.push({
            ...group.data,
            code: fullCode,
          });
          existingCodes.add(fullCode);
          createdInGroup++;
        }
        attempts++;
      }
      console.log(`✅ Đã chuẩn bị ${createdInGroup} mã cho nhóm ${group.prefix}`);
    }

    if (couponsToCreate.length > 0) {
      const result = await Coupon.insertMany(couponsToCreate);
      console.log(`🎉 Thành công! Đã tạo tổng cộng ${result.length} mã giảm giá mới.`);
    } else {
      console.log('ℹ️ Không có mã nào mới được tạo.');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã đóng kết nối database.');
  }
};

run();
