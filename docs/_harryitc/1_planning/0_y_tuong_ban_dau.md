# 🛒 PROJECT: Cake Shop (RESTful API)

> Mô tả: Ý tưởng ban đầu.

## 🎯 Scope

* Stack: **Express (BE) + Next.js (FE)** + **MongoDB (Database)**
* Auth: JWT
* Payment: COD
* Role: `user`, `admin`

---

# 1. 📦 FEATURES (FINAL)

## 👤 USER

* Đăng ký / đăng nhập
* Xem danh sách bánh
* Xem chi tiết bánh
* Thêm vào giỏ hàng
* Tạo đơn hàng
* Xem danh sách đơn hàng của mình

---

## 👨‍💼 ADMIN

* Đăng nhập
* CRUD bánh
* Xem tất cả đơn hàng
* Update trạng thái đơn hàng

---

# 2. 🌐 FRONTEND ROUTES

## User (Next.js)

```bash
/                 # landing
/cakes            # list
/cakes/[id]       # detail
/cart             # cart
/orders           # list orders
/login
/register
```

---

## Admin

```bash
/admin/login
/admin/cakes
/admin/orders
```

---

# 3. 🔥 RESTful API (FINAL)

## Auth

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

---

## Cakes

```http
GET    /api/v1/cakes
GET    /api/v1/cakes/:id
POST   /api/v1/cakes        (admin)
PUT    /api/v1/cakes/:id    (admin)
DELETE /api/v1/cakes/:id    (admin)
```

---

## Cart

```http
GET    /api/v1/cart
POST   /api/v1/cart/items
DELETE /api/v1/cart/items/:id
```

---

## Orders

```http
POST   /api/v1/orders
GET    /api/v1/orders        (user: own orders)
GET    /api/v1/orders/:id
PATCH  /api/v1/orders/:id    (admin: update status)
```

---

# 4. 🗄️ DATABASE

## users

```sql
id (uuid)
email (unique)
password_hash
role (user | admin)
created_at
```

---

## cakes

```sql
id (uuid)
name
description
info { slug (slug name) }
price
image_url
created_at
```

---

## cart_items

```sql
id (uuid)
user_id
cake_id
quantity
```

---

## orders

```sql
id (uuid)
user_id
total_price
status
address
created_at
```

---

## order_items

```sql
id (uuid)
order_id
cake_id
quantity
price
```

---

# 5. 🔄 ORDER FLOW

## Status

```text
PENDING → CONFIRMED → DONE
         ↘ REJECTED
```

---

## Create Order (flow)

1. Lấy cart items
2. Tính total price
3. Insert `orders`
4. Insert `order_items`
5. Xóa cart

👉 dùng **transaction**

---

## Middleware

### auth.middleware.ts

* Verify JWT
* attach `req.user`

---

### role.middleware.ts

```ts
(role: 'admin') => next()
```

---

# 6. 📡 API RESPONSE FORMAT

## Success

```json
{
  "data": {},
  "message": "success"
}
```

---

## Error

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid data"
  }
}
```

---

# 7. 🔐 AUTH

* JWT access token
* gửi qua header:

```http
Authorization: Bearer <token>
```

---

# 8. 📌 VALIDATION

* Email format
* Password >= 6 chars
* Price > 0
* Quantity > 0

---

# 9. 🚀 NON-FUNCTIONAL

* Pagination:

```http
GET /cakes?page=1&limit=10
```

* Basic filter:

```http
GET /cakes?search=chocolate
```

---