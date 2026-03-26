const mongoose = require('mongoose');
const Category = require('../schemas/Category.schema');
const Cake = require('../schemas/Cake.schema');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cake-shop-rs';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Đã kết nối MongoDB để seeding...');

    // 1. Xóa dữ liệu cũ
    await Category.deleteMany({});
    await Cake.deleteMany({});
    console.log('Đã dọn dẹp dữ liệu cũ.');

    // 2. Tạo Danh mục theo Dịp (OCCASION)
    const occasionsData = [
      { name: 'Sinh nhật', type: 'OCCASION', description: 'Bánh mừng tuổi mới', is_featured: true },
      { name: 'Kỷ niệm', type: 'OCCASION', description: 'Ngày đặc biệt của đôi ta', is_featured: true },
      { name: 'Đám cưới', type: 'OCCASION', description: 'Ngày hạnh phúc nhất đời' },
    ];
    const occasions = [];
    for (const d of occasionsData) {
      const cat = new Category(d);
      await cat.save();
      occasions.push(cat);
    }

    // 3. Tạo Danh mục theo Hương vị (FLAVOR)
    const flavorsData = [
      { name: 'Socola', type: 'FLAVOR', description: 'Đắng nhẹ, ngọt ngào' },
      { name: 'Trà xanh Matcha', type: 'FLAVOR', description: 'Thanh mát từ Nhật Bản', is_featured: true },
      { name: 'Tiramisu', type: 'FLAVOR', description: 'Hương vị cafe Ý nồng nàn' },
      { name: 'Trái cây nhiệt đới', type: 'FLAVOR', description: 'Tươi mát với dâu, xoài, dứa' },
    ];
    const flavors = [];
    for (const d of flavorsData) {
      const cat = new Category(d);
      await cat.save();
      flavors.push(cat);
    }

    // 4. Tạo Danh mục theo Chế độ ăn (DIET)
    const dietsData = [
      { name: 'Ít đường', type: 'DIET', description: 'Tốt cho sức khỏe' },
      { name: 'Keto', type: 'DIET', description: 'Hỗ trợ ăn kiêng' },
    ];
    const diets = [];
    for (const d of dietsData) {
      const cat = new Category(d);
      await cat.save();
      diets.push(cat);
    }

    console.log('Đã tạo các danh mục mẫu.');

    // 5. Tạo các loại Bánh mẫu
    const cakes = [
      {
        name: 'Bánh Mousse Matcha Cao Cấp',
        description: 'Bánh mousse mịn màng hòa quyện cùng bột matcha Uji hảo hạng từ Nhật Bản.',
        price: 250000,
        stock: 10,
        image_url: '/uploads/matcha-mousse.jpg',
        category: occasions[0]._id, // Mặc định là bánh sinh nhật
        categories: [occasions[0]._id, flavors[1]._id],
        tags: ['Best Seller', 'New'],
        ingredients: ['Bột matcha', 'Kem tươi', 'Gelatin', 'Trứng', 'Đường'],
        specifications: { weight: '500g', servings: '4-6 người' },
        variants: [
          { size: '10cm', price: 150000, stock: 5 },
          { size: '15cm', price: 250000, stock: 3 },
          { size: '20cm', price: 400000, stock: 2 },
        ]
      },
      {
        name: 'Bánh Kem Socola Bỉ',
        description: 'Lớp bánh bông lan mềm mại cùng kem socola Bỉ đậm đà nguyên chất.',
        price: 320000,
        stock: 15,
        image_url: '/uploads/chocolate-cake.jpg',
        category: occasions[1]._id, // Bánh kỷ niệm
        categories: [occasions[1]._id, flavors[0]._id],
        tags: ['Popular'],
        ingredients: ['Socola Bỉ', 'Bơ lạt', 'Bột mì', 'Sữa tươi'],
        specifications: { weight: '800g', servings: '6-8 người' },
        variants: [
          { size: '15cm', price: 320000, stock: 10 },
          { size: '20cm', price: 550000, stock: 5 },
        ]
      },
      {
        name: 'Tiramisu Truyền Thống',
        description: 'Đậm đà hương vị cà phê và phô mai mascarpone béo ngậy.',
        price: 280000,
        stock: 8,
        image_url: '/uploads/tiramisu.jpg',
        category: occasions[0]._id,
        categories: [occasions[0]._id, flavors[2]._id],
        tags: ['Chef Pick'],
        ingredients: ['Phô mai Mascarpone', 'Cafe Espresso', 'Rượu Rum', 'Bánh sâm panh'],
        specifications: { weight: '600g', servings: '4-5 người' },
        variants: [
          { size: 'Hộp nhỏ', price: 85000, stock: 20 },
          { size: 'Ổ lớn 15cm', price: 280000, stock: 8 },
        ]
      },
      {
        name: 'Bánh Kem Trái Cây Keto',
        description: 'Bánh kem dành riêng cho người ăn kiêng, không dùng đường tinh luyện.',
        price: 350000,
        stock: 5,
        image_url: '/uploads/keto-fruit.jpg',
        category: occasions[0]._id,
        categories: [occasions[0]._id, flavors[3]._id, diets[1]._id],
        tags: ['Healthy', 'Keto'],
        ingredients: ['Bột hạnh nhân', 'Đường cỏ ngọt Stevia', 'Kem tươi ít béo', 'Trái cây tươi'],
        specifications: { weight: '500g', servings: '4-6 người' },
        variants: [
          { size: '15cm', price: 350000, stock: 5 },
        ]
      }
    ];

    for (const cakeData of cakes) {
      const cake = new Cake(cakeData);
      await cake.save();
    }
    console.log('Đã tạo thành công các loại bánh mẫu.');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
