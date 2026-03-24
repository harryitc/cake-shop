---
epic_id: epic_2_cakes
title: "Cakes — Quản lý sản phẩm bánh"
version: 1.0
status: todo
related_prd: ../../2_prd/prd_v1.md
related_architecture:
  - ../../3_architecture/3_backend_architecture.md
  - ../../3_architecture/2_frontend_architecture.md
  - ../../3_architecture/4_database_design_v1.md
created_at: 2026-03-24
---

# 🎂 Epic 2: Cakes — Quản lý sản phẩm bánh

> Xây dựng toàn bộ tính năng liên quan đến sản phẩm bánh: Admin CRUD bánh trên dashboard, User xem danh sách và chi tiết bánh trên giao diện shop.

---

## 🏁 Mục tiêu (Goal)

Admin có thể **tạo, sửa, xóa** sản phẩm bánh. User có thể **xem danh sách** bánh (có phân trang, tìm kiếm) và **xem chi tiết** từng bánh để quyết định mua.

---

## 👥 Actor

| Actor | Vai trò |
|-------|---------|
| Admin | CRUD đầy đủ sản phẩm bánh |
| User | Xem danh sách, tìm kiếm, xem chi tiết |

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [x] Schema Mongoose cho Cake
- [x] API GET danh sách có pagination + search
- [x] API GET chi tiết bánh theo ID
- [x] API POST/PUT/DELETE bánh (chỉ admin)
- [x] Trang `/cakes` — danh sách bánh User
- [x] Trang `/cakes/[id]` — chi tiết bánh User
- [x] Trang `/admin/cakes` — bảng CRUD Admin

### Ngoài phạm vi (Out of Scope):
- Upload ảnh thực (dùng URL ảnh trực tiếp)
- Phân loại bánh theo danh mục (category)
- Quản lý tồn kho

---

## 🗂️ Danh sách Task Files (Checklist)

- [ ] [`1_cake_schema.md`](./1_cake_schema.md) — Định nghĩa Mongoose Schema + Service base
- [ ] [`2_cake_crud_api.md`](./2_cake_crud_api.md) — Toàn bộ API endpoints CRUD
- [ ] [`3_cake_list_page.md`](./3_cake_list_page.md) — Module + Pages Cakes trên User FE + Admin FE

---

## ✅ Acceptance Criteria

- [ ] `GET /api/v1/cakes?page=1&limit=10&search=chocolate` trả danh sách đúng
- [ ] `GET /api/v1/cakes/:id` trả chi tiết bánh, `404` nếu không tìm thấy
- [ ] `POST/PUT/DELETE` yêu cầu token admin, trả `403` nếu là user
- [ ] Trang `/cakes` User hiển thị danh sách, có ô tìm kiếm
- [ ] Trang `/cakes/[id]` hiển thị đầy đủ thông tin bánh + nút "Thêm vào giỏ"
- [ ] Trang `/admin/cakes` có bảng + modal tạo/sửa + nút xóa

---

## 🔗 Dependencies

| Phụ thuộc vào | Lý do |
|---------------|-------|
| epic_1_auth | Middleware auth + role cho các API write |
| Phase 1 (Backend Setup) | Cần kết nối DB, error handler |
