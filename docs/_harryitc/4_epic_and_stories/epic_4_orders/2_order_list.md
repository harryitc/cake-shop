---
task_id: 2_order_list
epic_id: epic_4_orders
title: "Danh sách đơn hàng — User View"
status: todo
priority: medium
related_overview: ./OVERVIEW.md
layer:
  - backend
  - frontend
created_at: 2026-03-24
---

# 📝 Task 2: Danh sách đơn hàng — User View

> **Epic:** [epic_4_orders](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng API lấy danh sách đơn hàng và trang lịch sử đơn cho User. Mỗi user chỉ thấy đơn hàng của mình.

---

## 📖 User Story

**As a** logged-in user  
**I want to** xem lịch sử các đơn hàng đã đặt  
**So that** tôi biết trạng thái đơn và những gì đã mua

---

## 🔧 Technical Breakdown

### Backend

**API Endpoints:**
```
GET /api/v1/orders         → User: đơn của mình | Admin: tất cả (require auth)
GET /api/v1/orders/:id     → Chi tiết 1 đơn (require auth + ownership check)
```

**GET /orders Response (`200`):**
```json
{
  "data": {
    "items": [
      {
        "id": "...",
        "status": "pending",
        "total_price": 390000,
        "address": "...",
        "created_at": "2026-03-24T...",
        "items_count": 3
      }
    ]
  }
}
```

**Files cần tạo / sửa:**
- [ ] `services/order.service.js` — `getOrders(userId, role)`: nếu role=admin thì không filter theo userId
- [ ] `services/order.service.js` — `getOrderById(orderId, userId, role)`: populate order_items + check ownership
- [ ] `controllers/order.controller.js` — handlers: `getOrders`, `getOrderById`
- [ ] `routes/order.routes.js` — `GET /`, `GET /:id` require auth

---

### Frontend — User

**Files cần tạo / sửa:**
- [ ] `modules/orders/api.ts` — `orderApi.getAll()`, `orderApi.getById(id)`
- [ ] `modules/orders/mapper.ts` — `mapOrderToModel(dto)`
- [ ] `modules/orders/hooks.ts` — `useOrdersQuery()`, `useOrderQuery(id)`
- [ ] `modules/orders/components/OrderList.tsx` — Ant Design List/Table hiển thị đơn hàng, badge trạng thái
- [ ] `app/(shop)/orders/page.tsx` — import `<OrderList />`

---

## ✅ Acceptance Criteria

- [ ] `GET /api/v1/orders` — user chỉ thấy đơn của mình
- [ ] `GET /api/v1/orders/:id` — user lấy đơn người khác → `404`
- [ ] `/orders` hiển thị danh sách đơn, trạng thái dạng badge màu (pending=vàng, confirmed=xanh, done=xanh đậm, rejected=đỏ)
- [ ] Đơn rỗng → Empty state + link về `/cakes`

---

## 📌 Notes

- Admin dùng cùng endpoint `GET /orders` nhưng không filter userId (phân biệt qua `req.user.role`)
- Badge màu trạng thái dùng Ant Design `<Tag>` component
