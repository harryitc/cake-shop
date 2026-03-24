---
task_id: 1_create_order
epic_id: epic_4_orders
title: "Tạo đơn hàng (Create Order)"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
  - frontend
created_at: 2026-03-24
---

# 📝 Task 1: Tạo đơn hàng (Create Order)

> **Epic:** [epic_4_orders](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng API tạo đơn hàng từ giỏ hàng hiện tại bằng Mongoose Transaction. Đảm bảo tính toàn vẹn dữ liệu: tạo order, tạo order_items, xóa cart trong 1 transaction duy nhất.

---

## 📖 User Story

**As a** logged-in user với giỏ hàng không rỗng  
**I want to** nhập địa chỉ giao hàng và xác nhận đặt hàng  
**So that** cửa hàng nhận được đơn và chuẩn bị giao bánh cho tôi

---

## 🔧 Technical Breakdown

### Backend

**API Endpoint:**
```
POST /api/v1/orders
```

**Request body:**
```json
{ "address": "123 Đường ABC, Quận 1, TP.HCM" }
```

**Response thành công (`201 Created`):**
```json
{
  "data": {
    "order": {
      "id": "...",
      "status": "pending",
      "total_price": 390000,
      "address": "123 Đường ABC...",
      "items": [...]
    }
  },
  "message": "Đặt hàng thành công"
}
```

**Transaction Flow trong `order.service.js`:**
```
1. session.startTransaction()
2. Lấy cart items của user (populate cake)
3. Nếu cart rỗng → throw 400
4. Tính total_price = Σ (cake.price × quantity) [snapshot giá tại thời điểm mua]
5. Tạo Order document (.save({ session }))
6. Tạo OrderItem documents cho mỗi cart item (.insertMany({ session }))
7. Xóa toàn bộ CartItem của user (.deleteMany({ session }))
8. session.commitTransaction()
→ catch: session.abortTransaction()
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Giỏ hàng rỗng, thiếu address |
| 401 | Chưa đăng nhập |

**Files cần tạo / sửa:**
- [ ] `schemas/Order.schema.js` — fields: user_id, total_price, status (default: `pending`), address, timestamps
- [ ] `schemas/OrderItem.schema.js` — fields: order_id, cake_id, quantity, price (snapshot)
- [ ] `services/order.service.js` — hàm `createOrder(userId, address)` với Transaction
- [ ] `controllers/order.controller.js` — handler `createOrder`: Joi validate, gọi service
- [ ] `routes/order.routes.js` — `POST /` require auth

---

### Frontend

**Route:** Từ `/cart` bấm "Đặt hàng" → Modal nhập địa chỉ → confirm

**Files cần tạo / sửa:**
- [ ] `modules/orders/types.ts` — `IOrder`, `IOrderItem`, `ICreateOrderPayload`
- [ ] `modules/orders/api.ts` — `orderApi.create(payload)`
- [ ] `modules/orders/hooks.ts` — `useCreateOrderMutation()`: onSuccess → invalidate cart + router.push('/orders')
- [ ] `modules/orders/components/CheckoutModal.tsx` — Modal nhập address + nút xác nhận
- [ ] `app/(shop)/cart/page.tsx` — nút "Đặt hàng" mở `<CheckoutModal />`

---

## ✅ Acceptance Criteria

- [ ] `POST /api/v1/orders` với giỏ hàng hợp lệ → `201`, cart bị xóa
- [ ] Giỏ rỗng → `400 "Giỏ hàng trống"`
- [ ] `total_price` tính đúng, `price` trong order_items = giá bánh lúc đặt (không bị ảnh hưởng bởi thay đổi sau)
- [ ] Nếu bất kỳ bước nào trong transaction lỗi → transaction rollback, không có dữ liệu rác
- [ ] Sau tạo đơn thành công: redirect về `/orders`, giỏ hàng hiển thị rỗng

---

## 📌 Notes

- `price` trong `OrderItem` phải snapshot từ `cake.price` lúc tạo, KHÔNG reference sang Cake
- MongoDB Transaction yêu cầu Replica Set (dùng MongoDB Atlas free tier hoặc local replica set)
- Tham khảo: `3_architecture/5_business_flows.md`
