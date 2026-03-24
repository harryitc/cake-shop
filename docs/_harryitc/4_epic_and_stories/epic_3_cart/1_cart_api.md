---
task_id: 1_cart_api
epic_id: epic_3_cart
title: "Cart API Backend"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
created_at: 2026-03-24
---

# 📝 Task 1: Cart API Backend

> **Epic:** [epic_3_cart](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng Schema và toàn bộ API backend cho giỏ hàng. Mỗi user có giỏ hàng riêng, có thể thêm/xem/xóa items.

---

## 📖 User Story

**As a** logged-in user  
**I want to** thêm bánh vào giỏ, xem giỏ hàng và xóa item  
**So that** tôi có thể chuẩn bị trước khi đặt đơn

---

## 🔧 Technical Breakdown

### Backend

**API Endpoints:**
```
GET    /api/v1/cart              → Lấy giỏ hàng current user (require auth)
POST   /api/v1/cart/items        → Thêm item vào giỏ (require auth)
DELETE /api/v1/cart/items/:id    → Xóa item khỏi giỏ (require auth)
```

**POST /cart/items Request body:**
```json
{ "cake_id": "<objectId>", "quantity": 2 }
```

**GET /cart Response (`200`):**
```json
{
  "data": {
    "items": [
      {
        "id": "...",
        "cake": { "id": "...", "name": "Bánh Dâu", "price": 120000, "image_url": "..." },
        "quantity": 2,
        "subtotal": 240000
      }
    ],
    "total": 240000
  }
}
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | `quantity <= 0`, thiếu `cake_id` |
| 401 | Chưa đăng nhập |
| 404 | `cake_id` không tồn tại / `item_id` không tồn tại hoặc không thuộc user |

**Files cần tạo / sửa:**
- [ ] `schemas/CartItem.schema.js` — fields: user_id (ref User), cake_id (ref Cake), quantity
- [ ] `services/cart.service.js` — `getCart(userId)`, `addItem(userId, {cake_id, quantity})`, `removeItem(userId, itemId)`
- [ ] `controllers/cart.controller.js` — handlers: `getCart`, `addItem`, `removeItem`
- [ ] `routes/cart.routes.js` — tất cả routes đều cần `authenticate`
- [ ] `app.js` — mount `/api/v1/cart`

---

## ✅ Acceptance Criteria

- [ ] `GET /api/v1/cart` trả danh sách items với thông tin bánh được populate, kèm `total`
- [ ] `POST` với `cake_id` đã có trong giỏ → tăng `quantity` thay vì tạo document mới
- [ ] `POST` với `cake_id` không tồn tại → `404`
- [ ] `DELETE /cart/items/:id` không phải của user hiện tại → `404` (không lộ existence)
- [ ] Tất cả API không có token → `401`

---

## 📌 Notes

- `getCart` phải `populate('cake_id')` để trả thông tin bánh
- Logic "tăng quantity nếu đã tồn tại": dùng `findOneAndUpdate` với `$inc: { quantity }`
- `subtotal` của mỗi item và `total` tính tại service, không lưu vào DB
