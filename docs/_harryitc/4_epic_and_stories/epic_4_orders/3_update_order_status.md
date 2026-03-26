---
task_id: 3_update_order_status
epic_id: epic_4_orders
title: "Cập nhật trạng thái đơn — Admin"
status: todo
priority: medium
related_overview: ./OVERVIEW.md
layer:
  - backend
  - frontend
created_at: 2026-03-24
---

# 📝 Task 3: Cập nhật trạng thái đơn — Admin

> **Epic:** [epic_4_orders](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng API cập nhật trạng thái đơn hàng (chỉ Admin) và trang quản lý đơn hàng cho Admin Dashboard. Trạng thái chỉ được phép chuyển theo chiều tiến, không quay ngược.

---

## 📖 User Story

**As an** admin  
**I want to** xem tất cả đơn hàng và cập nhật trạng thái  
**So that** tôi có thể xử lý và theo dõi quá trình giao bánh

---

## 🔧 Technical Breakdown

### Backend

**API Endpoint:**
```
PUT /api/v1/orders/:id    → Admin only
```

**Request body:**
```json
{ "status": "CONFIRMED" }
```

**Quy tắc chuyển trạng thái (State Machine):**
```
PENDING    → CONFIRMED | REJECTED
CONFIRMED  → DONE
DONE       → [KHÔNG được phép chuyển]
REJECTED   → [KHÔNG được phép chuyển]
```

**Validation logic trong Service:**
- Đọc `currentStatus` của order
- Kiểm tra xem `newStatus` có trong danh sách chuyển hợp lệ không
- Nếu không hợp lệ → throw `400 "Không thể chuyển trạng thái từ X sang Y"`

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Chuyển trạng thái không hợp lệ (VD: DONE → PENDING) |
| 403 | Role user gọi PUT |
| 404 | Order không tồn tại |

**Files cần tạo / sửa:**
- [ ] `services/order.service.js` — hàm `updateStatus(orderId, newStatus)` với state machine check
- [ ] `controllers/order.controller.js` — handler `updateStatus`
- [ ] `routes/order.routes.js` — `PUT /:id` require `authenticate + requireRole('admin')`

---

### Frontend — Admin

**Files cần tạo / sửa:**
- [ ] `modules/orders/hooks.ts` — `useUpdateOrderStatusMutation()`: onSuccess → invalidateQueries(['orders'])
- [ ] `modules/orders/components/OrderTable.tsx` — Ant Design Table: tất cả đơn, cột trạng thái là Select dropdown
- [ ] `app/admin/orders/page.tsx` — import `<OrderTable />`

---

## ✅ Acceptance Criteria

- [ ] `PUT /api/v1/orders/:id` với role user → `403`
- [ ] Chuyển từ `DONE` sang bất kỳ → `400`
- [ ] Chuyển từ `PENDING` → `CONFIRMED` → `200`, trạng thái cập nhật đúng
- [ ] Trang `/admin/orders` hiển thị tất cả đơn với dropdown chọn trạng thái
- [ ] Sau cập nhật trạng thái: bảng tự refresh (invalidate)

---

## 📌 Notes

- State machine định nghĩa là object constant ở service:
  ```js
  const VALID_TRANSITIONS = {
    PENDING: ['CONFIRMED', 'REJECTED'],
    CONFIRMED: ['DONE'],
    DONE: [],
    REJECTED: []
  };
  ```
- Admin FE: disable các option không hợp lệ trong dropdown theo trạng thái hiện tại
