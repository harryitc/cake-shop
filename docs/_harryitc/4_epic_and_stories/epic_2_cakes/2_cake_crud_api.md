---
task_id: 2_cake_crud_api
epic_id: epic_2_cakes
title: "Cake CRUD API Endpoints"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
created_at: 2026-03-24
---

# 📝 Task 2: Cake CRUD API Endpoints

> **Epic:** [epic_2_cakes](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng toàn bộ API CRUD cho sản phẩm bánh. Public endpoints cho User đọc, protected endpoints chỉ Admin mới tạo/sửa/xóa.

---

## 📖 User Story

**As an** admin  
**I want to** tạo, sửa và xóa sản phẩm bánh qua API  
**So that** giao diện admin có thể quản lý danh mục sản phẩm

---

## 🔧 Technical Breakdown

### Backend

**API Endpoints:**
```
GET    /api/v1/cakes              → Public (pagination + search)
GET    /api/v1/cakes/:id          → Public
POST   /api/v1/cakes              → Admin only
PUT    /api/v1/cakes/:id          → Admin only
DELETE /api/v1/cakes/:id          → Admin only
```

**POST Request body:**
```json
{
  "name": "Bánh Chocolate",
  "description": "Mô tả bánh",
  "price": 150000,
  "image_url": "https://..."
}
```

**GET /cakes Response (`200`):**
```json
{
  "data": {
    "items": [...],
    "total": 20,
    "page": 1,
    "limit": 10
  },
  "message": "success"
}
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Thiếu name/price, price <= 0 |
| 403 | User thường gọi POST/PUT/DELETE |
| 404 | GET/PUT/DELETE với id không tồn tại |

**Files cần tạo / sửa:**
- [ ] `services/cake.service.js` — thêm `create()`, `update()`, `delete()`
- [ ] `controllers/cake.controller.js` — handlers: `getAll`, `getById`, `create`, `update`, `remove`
- [ ] `routes/cake.routes.js` — áp dụng `authenticate` + `requireRole('admin')` cho write endpoints
- [ ] `app.js` — mount `/api/v1/cakes`

---

## ✅ Acceptance Criteria

- [ ] `GET /api/v1/cakes?page=1&limit=10&search=choco` trả đúng response có pagination
- [ ] `GET /api/v1/cakes/:id` với id hợp lệ → `200`, id không tồn tại → `404`
- [ ] `POST` không có token → `401`, có token user → `403`, có token admin → `201`
- [ ] `PUT` thiếu field không bắt buộc thì chỉ cập nhật field được gửi (partial update)
- [ ] `DELETE` xóa thành công → `200`

---

## 📌 Notes

- Dùng Joi để validate input ở controller trước khi gọi service
- `PUT` dùng `findByIdAndUpdate` với `{ new: true, runValidators: true }`
