# Story 3: Cake Module Restructuring [✅ DONE]

## 📋 Mô tả
Tái cấu trúc module Bánh (Cakes) — Module quan trọng nhất của Storefront. Tập trung vào logic lọc (Filter) và xử lý Biến thể (Variants).

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Lấy danh sách | `cake.service.getAllCakes` | `router.get('/')` |
| Lấy chi tiết | `cake.service.getCakeById` | `router.get('/:id')` |
| Tìm theo slug | `cake.service.getCakeBySlug` | `router.get('/slug/:slug')` |
| Tạo mới | `cake.controller.create` + `service.createCake` | `router.post('/')` |
| Cập nhật | `cake.controller.update` + `service.updateCake` | `router.put('/:id')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/cake.validation.js`)
- Schema: `createSchema`, `updateSchema`, `querySchema` (cho phân trang/lọc).

### Bước 2: Tái cấu trúc Route (`routes/cake.routes.js`)
**Cấu trúc logic bên trong Route Handler:**
1.  **GET `/` (Lọc & Phân trang):**
    - Trích xuất `page`, `limit`, `search`, `category` từ `req.query`.
    - Xây dựng object query Mongoose đơn giản.
    - Thực hiện `Cake.find(query).limit().skip().sort().lean()`.
2.  **POST `/` (Tạo mới):**
    - Validate `req.body`.
    - Gọi `slugify(name)` để tạo slug.
    - Lưu trực tiếp: `const cake = new Cake(value); await cake.save();`.

### Bước 3: Logic đặc biệt (Business Logic)
- **Xử lý Variants:** Logic tính toán giá thấp nhất từ mảng variants để hiển thị (nếu cần) sẽ thực hiện bằng JS `.reduce()`.
- **Cập nhật tồn kho:** Các thao tác tăng/giảm tồn kho dùng `$inc` trực tiếp.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất):**
```javascript
router.get('/', async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const filter = { is_active: true };
  if (search) filter.name = new RegExp(search, 'i');
  if (category) filter.category = category;

  const data = await Cake.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
    
  return sendSuccess(res, data);
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/cake.controller.js`
- `web-server/services/cake.service.js`
