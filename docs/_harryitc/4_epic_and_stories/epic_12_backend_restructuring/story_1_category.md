# Story 1: Category Module Restructuring (Pilot) [✅ DONE]

## 📋 Mô tả
Tái cấu trúc module Category để làm mẫu cho toàn bộ hệ thống. Chuyển đổi từ mô hình 3 lớp sang Route-Centric.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Lấy danh sách | `category.service.getAllCategories` | `router.get('/')` |
| Lấy chi tiết | `category.service.getCategoryById` | `router.get('/:id')` |
| Tạo mới | `category.controller.create` + `service.createCategory` | `router.post('/')` |
| Cập nhật | `category.controller.update` + `service.updateCategory` | `router.put('/:id')` |
| Xóa | `category.controller.delete` + `service.deleteCategory` | `router.delete('/:id')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/category.validation.js`)
- Di chuyển logic Joi từ `category.controller.js`.
- Xuất ra một object chứa `createSchema` và `updateSchema`.

### Bước 2: Tái cấu trúc Route (`routes/category.routes.js`)
**Cấu trúc logic bên trong Route Handler:**
1.  **Validation:** Gọi `validation.schema.validate(req.body)`. Nếu lỗi, `throw ApiError.BAD_REQUEST`.
2.  **Database Ops:** Gọi trực tiếp `Category.find()`, `Category.findByIdAndUpdate()`, v.v.
3.  **Response:** Gọi `sendSuccess(res, data, message)`.

### Bước 3: Logic đặc biệt (Business Logic)
- Trong `router.post('/')`: Phải bắt lỗi `err.code === 11000` (trùng tên/slug) và quăng `ApiError.CONFLICT`.
- Sử dụng `.lean()` cho các route `GET` để tối ưu hiệu năng.

## 🧪 Kết quả mong đợi (Before vs After)

**Trước (Service):**
```javascript
// service
async getAll() { return await Category.find().lean(); }
// controller
async getAll(req, res) { const data = await service.getAll(); sendSuccess(res, data); }
```

**Sau (Route duy nhất):**
```javascript
router.get('/', async (req, res) => {
  const categories = await Category.find(req.query).sort({ name: 1 }).lean();
  return sendSuccess(res, categories);
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/category.controller.js`
- `web-server/services/category.service.js`
