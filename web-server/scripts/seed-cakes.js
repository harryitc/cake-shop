const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db.config');
const Cake = require('../schemas/Cake.schema');

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const flavors = [
  { name: 'Dâu tây', keywords: 'strawberry,cake', desc: 'Vị dâu tây tươi mát kết hợp kem mịn.' },
  { name: 'Chocolate', keywords: 'chocolate,cake,dark', desc: 'Socola đậm đà, vị đắng nhẹ tinh tế.' },
  { name: 'Vani', keywords: 'vanilla,cake,white', desc: 'Hương vani truyền thống, ngọt thanh dịu nhẹ.' },
  { name: 'Matcha', keywords: 'matcha,greentea,cake', desc: 'Trà xanh Uji Nhật Bản, thơm nồng nàn.' },
  { name: 'Tiramisu', keywords: 'tiramisu,coffee,cake', desc: 'Sự kết hợp hoàn hảo giữa cà phê và phô mai.' },
  { name: 'Phô mai', keywords: 'cheese,cheesecake', desc: 'Vị béo ngậy của phô mai cao cấp tan chảy.' },
  { name: 'Việt quất', keywords: 'blueberry,cake', desc: 'Quả việt quất tươi mọng, chua ngọt hài hòa.' },
  { name: 'Sầu riêng', keywords: 'durian,bakery', desc: 'Hương vị đặc sản nồng nàn, quyến rũ.' },
  { name: 'Xoài', keywords: 'mango,cake,fruit', desc: 'Xoài cát chín mọng, vị nhiệt đới đặc trưng.' },
  { name: 'Chanh dây', keywords: 'passionfruit,cake', desc: 'Vị chua thanh khiết, kích thích vị giác.' },
  { name: 'Cà phê', keywords: 'coffee,cake,latte', desc: 'Hương cà phê rang xay đậm chất tỉnh táo.' },
  { name: 'Hạnh nhân', keywords: 'almond,cake,nut', desc: 'Hạt hạnh nhân giòn tan, bùi bùi béo béo.' },
  { name: 'Sữa tươi', keywords: 'milk,cream,cake', desc: 'Sữa tươi nguyên chất, tinh túy và bổ dưỡng.' },
  { name: 'Caramel', keywords: 'caramel,cake,sweet', desc: 'Lớp caramel ngọt lịm, óng ả quyến rũ.' },
  { name: 'Bắp', keywords: 'corn,cake,creamy', desc: 'Bánh bắp non thơm lừng, vị ngọt tự nhiên.' },
  { name: 'Cam đào', keywords: 'peach,orange,cake', desc: 'Sự kết hợp trái cây tươi mới, dễ chịu.' },
  { name: 'Hoa đậu biếc', keywords: 'blue,butterflypea,cake', desc: 'Màu sắc tự nhiên huyền ảo, vị thanh tao.' }
];

const styles = [
  { name: 'Mini', suffix: 'với kích thước nhỏ gọn cho cá nhân.' },
  { name: 'Cỡ vừa', suffix: 'phù hợp cho gia đình nhỏ 3-4 người.' },
  { name: 'Cỡ lớn', suffix: 'lựa chọn tuyệt vời cho các buổi tiệc.' },
  { name: '2 tầng', suffix: 'sang trọng và hoành tráng cho các sự kiện lớn.' },
  { name: 'Trái tim', suffix: 'thay lời muốn nói gửi trao yêu thương.' },
  { name: 'Minimalist', suffix: 'phong cách tối giản, tinh tế từng chi tiết.' },
  { name: 'Floral Style', suffix: 'trang trí hoa tươi/kem hoa lãng mạn.' },
  { name: 'Modern', suffix: 'thiết kế hiện đại, dẫn đầu xu hướng.' },
  { name: 'Luxury', suffix: 'đẳng cấp từ nguyên liệu đến cách trình bày.' },
  { name: 'Vintage', suffix: 'mang hơi hướng cổ điển, ấm cúng.' }
];

const localImages = [
  '/uploads/chocolate-luxury.png',
  '/uploads/strawberry-cream.png',
  '/uploads/matcha-crepe.png',
  '/uploads/tiramisu-classic.png'
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing cakes...');
    await Cake.deleteMany({});

    const cakes = [];
    const usedNames = new Set();

    // 1. Thêm 4 bánh Local Premium
    const premiums = [
      { name: 'Bánh Chocolate Luxury dát vàng', desc: 'Đỉnh cao của sự sang trọng với chocolate đen nguyên chất và lớp dát vàng 24k.', price: 1500000, img: localImages[0] },
      { name: 'Bánh Kem Dâu Tây Strawberry Dream', desc: 'Lớp kem tươi mịn màng kết hợp cùng dâu tây Đà Lạt tươi mọng nhất.', price: 550000, img: localImages[1] },
      { name: 'Bánh Matcha Mille Crepe', desc: 'Hàng chục lớp bánh crepe mỏng tang xen kẽ lớp kem trà xanh Uji tinh khiết.', price: 680000, img: localImages[2] },
      { name: 'Bánh Tiramisu Classic Italian', desc: 'Hương vị cà phê Espresso đậm đà thấm đẫm trong từng lớp bánh quy Savoiardi.', price: 450000, img: localImages[3] }
    ];

    for (const p of premiums) {
      cakes.push({
        name: p.name,
        description: p.desc,
        price: p.price,
        stock: Math.floor(Math.random() * 50) + 10,
        image_url: p.img,
        slug: generateSlug(p.name)
      });
      usedNames.add(p.name);
    }

    // 2. Tạo 196 bánh còn lại ngẫu nhiên nhưng có logic
    console.log('Generating additional 196 unique cakes...');
    let lockId = 100;
    
    while (cakes.length < 200) {
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const prefix = ['Bánh', 'Ổ bánh', 'Cake'][Math.floor(Math.random() * 3)];
      
      const name = `${prefix} ${flavor.name} ${style.name}`;
      
      if (!usedNames.has(name)) {
        usedNames.add(name);
        
        // Giá dựa trên phong cách bánh
        let basePrice = 200000;
        if (style.name === 'Mini') basePrice = 120000;
        if (style.name === '2 tầng' || style.name === 'Luxury') basePrice = 800000;
        
        const priceVariator = Math.floor(Math.random() * 200) * 1000;
        const finalPrice = basePrice + priceVariator;

        cakes.push({
          name: name,
          description: `${flavor.desc} Đây là mẫu bánh ${style.name.toLowerCase()} ${style.suffix}`,
          price: finalPrice,
          stock: Math.floor(Math.random() * 91) + 5,
          // Sử dụng các từ khóa khác nhau cho hình ảnh sinh động hơn
          image_url: `https://loremflickr.com/400/400/${flavor.keywords}?lock=${lockId++}`,
          slug: generateSlug(name),
        });
      }
    }

    await Cake.insertMany(cakes);
    console.log(`Successfully seeded ${cakes.length} cakes with unique data.`);
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
