---
epic_id: epic_4_orders
title: "Orders — Đặt hàng & Quản lý đơn"
version: 1.0
status: todo
related_prd: ../../2_prd/prd_v1.md
related_architecture:
  - ../../3_architecture/3_backend_architecture.md
  - ../../3_architecture/2_frontend_architecture.md
  - ../../3_architecture/4_database_design_v1.md
  - ../../3_architecture/5_business_flows.md
created_at: 2026-03-24
---

# 📦 Epic 4: Orders — Đặt hàng & Quản lý đơn

> Xây dựng luồng đặt hàng hoàn chỉnh: User tạo đơn từ giỏ hàng, xem lịch sử đơn; Admin xem và cập nhật trạng thái đơn.

---

## 🏁 Mục tiêu (Goal)

User có thể **tạo đơn hàng** từ giỏ hàng hiện tại (kèm địa chỉ giao hàng). Đơn được tạo an toàn bằng **Transaction** (tạo order → tạo order_items → xóa cart). User xem được lịch sử đơn. Admin xem toàn bộ đơn và cập nhật trạng thái.

---

## 👥 Actor

| Actor | Vai trò |
|-------|---------|
| User | Tạo đơn từ giỏ hàng, xem lịch sử đơn của mình |
| Admin | Xem tất cả đơn, cập nhật trạng thái đơn |

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [x] Schema `Order` (với array items `OrderItem` schema embedded)
- [x] API POST tạo đơn (dùng Mongoose Transaction)
- [x] API GET đơn hàng (user: đơn mình | admin: tất cả)
- [x] API PATCH cập nhật trạng thái đơn (chỉ admin, không quay ngược)
- [x] Trang `/orders` — lịch sử đơn User
- [x] Trang `/admin/orders` — bảng tất cả đơn + cập nhật trạng thái

### Ngoài phạm vi (Out of Scope):
- Thanh toán online (COD only)
- Tracking realtime
- Hủy đơn từ phía User

---

## 🗂️ Danh sách Task Files (Checklist)

- [ ] [`1_create_order.md`](./1_create_order.md) — API tạo đơn với Transaction + nhập địa chỉ
- [ ] [`2_order_list.md`](./2_order_list.md) — API GET đơn + Trang lịch sử đơn User
- [ ] [`3_update_order_status.md`](./3_update_order_status.md) — API PATCH + Trang admin quản lý đơn

---

## ✅ Acceptance Criteria

- [ ] `POST /api/v1/orders` tạo đơn thành công, giỏ hàng bị xóa, trả `201`
- [ ] Nếu giỏ rỗng: trả `400 "Giỏ hàng trống"`
- [ ] Giá bánh trong `order.items` được snapshot tại thời điểm đặt hàng
- [ ] `GET /api/v1/orders` — user chỉ thấy đơn của mình
- [ ] `PATCH /api/v1/orders/:id` — chỉ admin, transition hợp lệ (PENDING→CONFIRMED, CONFIRMED→DONE/REJECTED)
- [ ] Trang `/orders` User hiển thị lịch sử + trạng thái đơn
- [ ] Trang `/admin/orders` Admin có thể đổi trạng thái qua dropdown/select

---

## 🔗 Dependencies

| Phụ thuộc vào | Lý do |
|---------------|-------|
| epic_1_auth | Cần token, phân quyền user/admin |
| epic_2_cakes | Snapshot giá bánh khi tạo order_items |
| epic_3_cart | Lấy cart items để tạo đơn, sau đó xóa cart |
