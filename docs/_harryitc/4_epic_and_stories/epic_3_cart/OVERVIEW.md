---
epic_id: epic_3_cart
title: "Cart — Giỏ hàng"
version: 1.0
status: todo
related_prd: ../../2_prd/prd_v1.md
related_architecture:
  - ../../3_architecture/3_backend_architecture.md
  - ../../3_architecture/2_frontend_architecture.md
  - ../../3_architecture/4_database_design_v1.md
created_at: 2026-03-24
---

# 🛒 Epic 3: Cart — Giỏ hàng

> Xây dựng tính năng giỏ hàng: cho phép User thêm bánh vào giỏ, xem giỏ hàng, điều chỉnh số lượng và xóa sản phẩm khỏi giỏ.

---

## 🏁 Mục tiêu (Goal)

User đã đăng nhập có thể **quản lý giỏ hàng** của mình: thêm bánh, thay đổi số lượng, xóa sản phẩm. Giỏ hàng là trạng thái trung gian trước khi tạo đơn hàng (Epic 4).

---

## 👥 Actor

| Actor | Vai trò |
|-------|---------|
| User | Thêm, xem, sửa số lượng, xóa item trong giỏ |

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [x] Schema `CartItem` (user_id, cake_id, quantity)
- [x] API GET giỏ hàng của user hiện tại
- [x] API POST thêm item vào giỏ (hoặc tăng quantity nếu đã có)
- [x] API PUT cập nhật số lượng trực tiếp (inline quantity update)
- [x] API DELETE xóa item khỏi giỏ
- [x] Trang `/cart` — hiển thị giỏ hàng, nút xóa, điều chỉnh số lượng, nút đặt hàng
- [x] Nút "Thêm vào giỏ" trên trang chi tiết bánh

### Ngoài phạm vi (Out of Scope):
- Giỏ hàng cho khách chưa đăng nhập (guest cart)
- Coupon / discount

---

## 🗂️ Danh sách Task Files (Checklist)

- [x] [`1_cart_api.md`](./1_cart_api.md) — Schema + API Backend giỏ hàng
- [x] [`2_cart_page.md`](./2_cart_page.md) — Module cart + Trang `/cart` Frontend

---

## ✅ Acceptance Criteria

- [x] `GET /api/v1/cart` trả danh sách items của user hiện tại (join thông tin bánh)
- [x] `POST /api/v1/cart/items` thêm item, tự tăng quantity nếu đã có cùng cake_id
- [x] `PUT /api/v1/cart/items/:id` cập nhật trực tiếp số lượng
- [x] `DELETE /api/v1/cart/items/:id` xóa item, trả `404` nếu không tìm thấy
- [x] Tất cả API yêu cầu token, trả `401` nếu chưa đăng nhập
- [x] Trang `/cart` hiển thị danh sách items, tổng tiền, nút "Đặt hàng" và input chỉnh số lượng
- [x] Nút "Thêm vào giỏ" ở `/cakes/[id]` hoạt động, hiển thị Toast thành công

---

## 🔗 Dependencies

| Phụ thuộc vào | Lý do |
|---------------|-------|
| epic_1_auth | Cần token để xác định giỏ hàng của ai |
| epic_2_cakes | Cần cake_id hợp lệ, join thông tin bánh khi GET cart |
