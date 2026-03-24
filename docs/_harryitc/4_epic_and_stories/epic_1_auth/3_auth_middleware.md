---
task_id: 3_auth_middleware
epic_id: epic_1_auth
title: "Auth Middleware — JWT Verify + Role Guard"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
created_at: 2026-03-24
---

# 📝 Task 3: Auth Middleware — JWT Verify + Role Guard

> **Epic:** [epic_1_auth](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng 2 middleware bảo vệ API: (1) xác thực JWT Token và gắn `req.user`, (2) kiểm tra role để bảo vệ các endpoint chỉ dành cho admin. Đây là lá chắn bắt buộc cho tất cả protected API của các epic sau.

---

## 📖 User Story

**As a** backend system  
**I want to** chặn mọi request không hợp lệ trước khi vào controller  
**So that** chỉ người dùng đúng token và role mới được truy cập tài nguyên

---

## 🔧 Technical Breakdown

### Backend

**Middleware 1 — `auth.middleware.js`:**
- Đọc header `Authorization: Bearer <token>`
- Verify token bằng `jsonwebtoken.verify(token, JWT_SECRET)`
- Nếu hợp lệ: gắn `req.user = { userId, role }`, gọi `next()`
- Nếu không có token: `next(ApiError(401, "Chưa xác thực"))`
- Nếu token hết hạn / sai: `next(ApiError(401, "Token không hợp lệ"))`

**Middleware 2 — `role.middleware.js`:**
```js
// Dùng kiểu Higher-Order Function để linh hoạt
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return next(ApiError(403, "Không có quyền truy cập"));
  }
  next();
};
```

**Cách dùng trong Route:**
```js
// Protected route — chỉ cần đăng nhập
router.get('/cart', authenticate, cartController.getCart);

// Admin-only route
router.post('/cakes', authenticate, requireRole('admin'), cakeController.create);
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 401 | Không có token hoặc token sai / hết hạn |
| 403 | Có token hợp lệ nhưng không đủ quyền (sai role) |

**Files cần tạo / sửa:**
- [ ] `middlewares/auth.middleware.js` — export `authenticate`
- [ ] `middlewares/role.middleware.js` — export `requireRole`
- [ ] Tích hợp vào `routes/cake.routes.js` (write endpoints)
- [ ] Tích hợp vào `routes/order.routes.js` (tất cả endpoints)

---

## ✅ Acceptance Criteria

- [ ] Request không có token → `401`
- [ ] Request có token hết hạn → `401`
- [ ] Request có token hợp lệ → `req.user` được gắn đúng `{ userId, role }`
- [ ] User role `user` gọi admin endpoint → `403`
- [ ] Admin role `admin` gọi admin endpoint → thành công

---

## 📌 Notes

- Luôn check `Authorization` header, không dùng cookie (theo architecture)
- Lỗi từ middleware phải được đẩy qua `next(err)` để Global Error Handler bắt
- `requireRole` chạy sau `authenticate` — chỉ được gọi khi đã có `req.user`
