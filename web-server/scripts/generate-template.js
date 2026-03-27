const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cakes');

  // Add headers
  worksheet.columns = [
    { header: 'Tên Bánh', key: 'name', width: 30 },
    { header: 'Mô tả', key: 'desc', width: 40 },
    { header: 'Giá', key: 'price', width: 15 },
    { header: 'Tồn kho', key: 'stock', width: 15 },
    { header: 'Ảnh', key: 'image', width: 40 },
    { header: 'Danh mục', key: 'category', width: 25 },
    { header: 'Tags', key: 'tags', width: 25 },
    { header: 'Thành phần', key: 'ingredients', width: 30 },
    { header: 'Trọng lượng', key: 'weight', width: 15 },
    { header: 'Số khẩu phần', key: 'servings', width: 15 }
  ];

  // Add sample row
  worksheet.addRow({
    name: 'Bánh Kem Dâu Tây',
    desc: 'Bánh kem tươi với dâu tây đà lạt',
    price: 350000,
    stock: 50,
    image: 'https://example.com/dau-tay.jpg',
    category: 'Bánh Kem Mousse',
    tags: 'dâu tây, mousse, sinh nhật',
    ingredients: 'Bột mì, trứng, sữa, dâu tây',
    weight: '500g',
    servings: '4-6'
  });

  // Ensure directory exists
  const dir = path.join(__dirname, '../../web-client/admin/public/templates');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, 'cake_import_template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Template created at ${filePath}`);
}

createTemplate().catch(console.error);
