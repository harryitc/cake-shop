---
epic_id: epic_1_auth
title: "Authentication — Đăng ký & Đăng nhập"
version: 1.0
status: todo
related_prd: ../../2_prd/prd_v1.md
related_architecture:
  - ../../3_architecture/3_backend_architecture.md
  - ../../3_architecture/2_frontend_architecture.md
created_at: 2026-03-24
---

# 🔐 Epic 1: Authentication — Đăng ký & Đăng nhập

> Xây dựng toàn bộ hệ thống xác thực người dùng: đăng ký tài khoản, đăng nhập, bảo vệ API bằng JWT và phân quyền theo role.

---

## 🏁 Mục tiêu (Goal)

Người dùng có thể **đăng ký** tài khoản mới và **đăng nhập** để nhận JWT Token. Token đó được dùng xuyên suốt phiên làm việc để truy cập các API yêu cầu xác thực. Admin có quyền cao hơn User thông thường.

---

## 👥 Actor

| Actor | Vai trò |
|-------|---------|
| User | Đăng ký + Đăng nhập, nhận Token để đặt hàng |
| Admin | Đăng nhập (tài khoản tạo sẵn), quản lý hệ thống |

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [x] Đăng ký tài khoản mới (email + password)
- [x] Đăng nhập, nhận JWT Access Token
- [x] Middleware xác thực JWT cho các protected routes
- [x] Middleware phân quyền role (`user` / `admin`)
- [x] Form Register + Login trên Frontend
- [x] Lưu token vào LocalStorage, inject vào mọi request

### Ngoài phạm vi (Out of Scope):
- Refresh Token / Logout chủ động (Phase 1 dùng token hết hạn tự nhiên)
- Đăng nhập qua Google / Social OAuth
- Quên mật khẩu / Reset mật khẩu

---

## 🗂️ Danh sách Task Files (Checklist)

- [ ] [`1_register.md`](./1_register.md) — API đăng ký + Form Register Frontend
- [ ] [`2_login.md`](./2_login.md) — API đăng nhập + Form Login Frontend + lưu Token
- [ ] [`3_auth_middleware.md`](./3_auth_middleware.md) — Middleware JWT verify + Role guard

---

## ✅ Acceptance Criteria

- [ ] `POST /api/v1/auth/register` trả `201` với token khi email hợp lệ, chưa tồn tại
- [ ] `POST /api/v1/auth/login` trả `200` với token khi đúng credentials
- [ ] API trả `400` nếu thiếu field hoặc email đã tồn tại
- [ ] API trả `401` nếu sai mật khẩu
- [ ] Token lưu vào `localStorage`, được inject tự động vào `Authorization: Bearer <T>`
- [ ] Protected API trả `401` nếu không có / sai token
- [ ] Admin-only API trả `403` nếu role là `user`
- [ ] Form FE hiển thị Toast lỗi khi API thất bại (qua React Query global onError)

---

## 🔗 Dependencies

| Phụ thuộc vào | Lý do |
|---------------|-------|
| Phase 1 (Backend Setup) | Cần có `error-handler`, `response.utils`, kết nối MongoDB |
