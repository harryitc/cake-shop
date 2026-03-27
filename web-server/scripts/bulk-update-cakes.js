const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../schemas/Category.schema');
const Cake = require('../schemas/Cake.schema');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cake-shop';

const bulkUpdate = async () => {
  try {
    console.log('--- BẮT ĐẦU CẬP NHẬT DỮ LIỆU ---');
    await mongoose.connect(MONGO_URI);
    console.log('1. Đã kết nối MongoDB...');

    // 1. Dọn dẹp categories rác và đảm bảo các category hiện có có slug
    await Category.deleteMany({ name: 's' });
    
    // 2. Định nghĩa danh mục chuẩn
    const categoriesData = [
      { name: 'Bánh Sinh Nhật', type: 'OCCASION', description: 'Bánh cho tiệc sinh nhật' },
      { name: 'Bánh Kỷ Niệm', type: 'OCCASION', description: 'Mừng ngày cưới, kỷ niệm yêu nhau' },
      { name: 'Trà Xanh Matcha', type: 'FLAVOR', description: 'Hương vị trà xanh Uji Nhật Bản' },
      { name: 'Socola Bỉ', type: 'FLAVOR', description: 'Socola nguyên chất đậm đà' },
      { name: 'Bánh Mousse', type: 'FLAVOR', description: 'Thanh mát, mịn màng' },
      { name: 'Bánh Kem Keto', type: 'DIET', description: 'Ăn kiêng, ít đường' },
      { name: 'Trái Cây Tươi', type: 'FLAVOR', description: 'Vị thanh khiết từ hoa quả' },
    ];

    const generateSlug = (text) => {
      return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const categoryMap = {};
    for (const catData of categoriesData) {
      const slug = generateSlug(catData.name);
      const cat = await Category.findOneAndUpdate(
        { name: catData.name },
        { $set: { ...catData, slug } },
        { upsert: true, new: true }
      );
      categoryMap[cat.name] = cat._id;
    }
    console.log('2. Đã đồng bộ các Danh mục.');

    // 2. Lấy dữ liệu bánh
    const cakes = await Cake.find({});
    console.log(`3. Tìm thấy ${cakes.length} chiếc bánh cần cập nhật.`);

    const bulkOps = cakes.map((cake, index) => {
      const name = cake.name.toLowerCase();
      let targetCat = categoryMap['Bánh Sinh Nhật']; // Default
      let tags = ['Best Seller'];
      let ingredients = ['Bột mì', 'Đường', 'Trứng', 'Kem tươi'];
      let description = cake.description || 'Bánh tươi ngon được làm trong ngày từ nguyên liệu cao cấp.';

      // Logic gán Category & Tags dựa trên tên
      if (name.includes('matcha') || name.includes('trà xanh')) {
        targetCat = categoryMap['Trà Xanh Matcha'];
        tags.push('Matcha Lover', 'Japanese Style');
        ingredients.push('Bột Matcha Uji');
      } else if (name.includes('socola') || name.includes('chocolate') || name.includes('cacao')) {
        targetCat = categoryMap['Socola Bỉ'];
        tags.push('Dark Chocolate', 'Premium');
        ingredients.push('Socola Bỉ 70%');
      } else if (name.includes('mousse')) {
        targetCat = categoryMap['Bánh Mousse'];
        tags.push('Mousse', 'Soft');
      } else if (name.includes('keto') || name.includes('ăn kiêng')) {
        targetCat = categoryMap['Bánh Kem Keto'];
        tags.push('Healthy', 'Low Carb');
        ingredients = ['Bột hạnh nhân', 'Đường Stevia', 'Kem béo thực vật'];
      } else if (name.includes('trái cây') || name.includes('dâu') || name.includes('cam') || name.includes('đào')) {
        targetCat = categoryMap['Trái Cây Tươi'];
        tags.push('Fruit', 'Fresh');
        ingredients.push('Trái cây tươi theo mùa');
      }

      // Metadata bổ sung
      const variants = [
        { size: '15cm (4-6 người)', price: cake.price, stock: Math.floor(Math.random() * 20) + 5 },
        { size: '20cm (8-10 người)', price: Math.round((cake.price * 1.6) / 1000) * 1000, stock: Math.floor(Math.random() * 10) + 2 }
      ];

      return {
        updateOne: {
          filter: { _id: cake._id },
          update: {
            $set: {
              category: targetCat,
              categories: [targetCat],
              tags: [...new Set(tags)],
              ingredients: ingredients,
              specifications: {
                weight: name.includes('mousse') ? '500g' : '800g',
                servings: '4-10 người'
              },
              variants: variants,
              image_url: cake.image_url || `https://loremflickr.com/400/400/cake?lock=${index}`
            }
          }
        }
      };
    });

    if (bulkOps.length > 0) {
      await Cake.bulkWrite(bulkOps);
      console.log(`4. Đã cập nhật xong ${bulkOps.length} chiếc bánh bằng bulkWrite.`);
    }

    console.log('--- HOÀN THÀNH ---');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi nghiêm trọng:', error);
    process.exit(1);
  }
};

bulkUpdate();
