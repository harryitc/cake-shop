# Story 8: Analytics & Import Restructuring [✅ DONE]

## 📋 Mô tả
Hệ thống báo cáo và Engine xử lý file Excel. Chuyển đổi logic xử lý file và thống kê tập trung tại Route.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Top bán chạy | `analytics.service.getBestSellers` | `router.get('/best-sellers')` |
| Thống kê doanh thu | `analytics.service.getRevenueStats` | `router.get('/revenue')` |
| Import Excel | `import.service.processExcel` | `router.post('/process')` |
| Báo cáo lỗi | `excel.service.generateErrorReport` | `router.get('/history/:id/report')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Analytics Route (`routes/analytics.routes.js`)
**Cấu trúc logic bên trong Route Handler (GET `/best-sellers`):**
1.  **Fetch Orders:** `Order.find({ status: 'DONE' }).select('items').lean()`.
2.  **JS Map:** Gom nhóm số lượng bán của từng `cake_id` bằng `new Map()`.
3.  **Sort:** Sắp xếp và lấy Top 5 bằng JS `.sort()`.
4.  **Fetch Cakes:** Query thông tin bánh tương ứng và trộn dữ liệu (Merge).

### Bước 2: Import Route (`routes/import.routes.js`)
**Cấu trúc logic bên trong Route Handler (POST `/process`):**
1.  **Read File:** Sử dụng `ExcelJS` để đọc file từ `req.file.path`.
2.  **Mapping:** Duyệt từng dòng (`eachRow`) và map dữ liệu sang Cake Schema.
3.  **Bulk Write:** Thực hiện `Cake.bulkWrite()` để lưu hàng loạt.
4.  **History Log:** Lưu kết quả vào `ImportHistory.save()`.

### Bước 3: Logic đặc biệt (Business Logic)
- **Excel Report:** Logic tạo file Excel mới bằng `Workbook` sẽ được viết trực tiếp trong handler để trả về luồng dữ liệu (Stream/Buffer) cho Client tải về.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Import Process):**
```javascript
router.post('/process', authenticate, requireRole('admin'), async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(req.file.path);
  const worksheet = workbook.getWorksheet(1);
  const cakesToImport = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    cakesToImport.push({ name: row.getCell(1).value, price: row.getCell(2).value });
  });

  const result = await Cake.bulkWrite(cakesToImport.map(c => ({
    insertOne: { document: c }
  })));
  
  return sendSuccess(res, result, 'Import thành công');
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/analytics.controller.js`
- `web-server/services/analytics.service.js`
- `web-server/controllers/import.controller.js`
- `web-server/services/excel.service.js`
- `web-server/services/import/` (folder con)
