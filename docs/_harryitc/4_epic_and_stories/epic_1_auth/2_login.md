---
task_id: 2_login
epic_id: epic_1_auth
title: "Đăng nhập (Login)"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
  - frontend
created_at: 2026-03-24
---

# 📝 Task 2: Đăng nhập (Login)

> **Epic:** [epic_1_auth](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng API đăng nhập và Form Login trên Frontend. Người dùng nhập email + password, hệ thống xác thực credentials, trả về JWT Token. Token lưu vào localStorage và được tự động gắn vào mọi request tiếp theo.

---

## 📖 User Story

**As a** user đã có tài khoản  
**I want to** đăng nhập bằng email và password  
**So that** tôi có thể thêm vào giỏ hàng và đặt đơn bánh

---

## 🔧 Technical Breakdown

### Backend

**API Endpoint:**
```
POST /api/v1/auth/login
```

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response thành công (`200 OK`):**
```json
{
  "data": {
    "token": "<jwt_access_token>",
    "user": { "id": "...", "email": "...", "role": "user" }
  },
  "message": "Đăng nhập thành công"
}
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Thiếu email/password |
| 401 | Email không tồn tại hoặc sai mật khẩu |

**Files cần tạo / sửa:**
- [ ] `services/auth.service.js` — hàm `login({ email, password })`: tìm user, bcrypt.compare, sign JWT
- [ ] `controllers/auth.controller.js` — handler `login()`: Joi validate, gọi service, trả JSON
- [ ] `routes/auth.routes.js` — `POST /login` → controller

---

### Frontend

**Route / Page:** `/login`, `/admin/login`

**Component chịu trách nhiệm:** `modules/auth/components/LoginForm.tsx`

**Data Flow:**
```
/login/page.tsx → <LoginForm /> → useLoginMutation() → authApi.login() → http.ts → POST /api/v1/auth/login
```

**Sau khi thành công:**
- Lưu token vào `localStorage` key `access_token`
- Lưu thông tin user (role) để dùng cho phân quyền FE
- Redirect: user → `/cakes`, admin → `/admin/cakes`

**Files cần tạo / sửa:**
- [ ] `modules/auth/api.ts` — hàm `authApi.login(payload: ILoginPayload)`
- [ ] `modules/auth/hooks.ts` — `useLoginMutation()`: onSuccess → localStorage, redirect theo role
- [ ] `modules/auth/components/LoginForm.tsx` — Form Ant Design + React Hook Form + Zod  
- [ ] `app/login/page.tsx` — import `<LoginForm />`
- [ ] `app/admin/login/page.tsx` — import `<LoginForm mode="admin" />`

---

## ✅ Acceptance Criteria

- [ ] `POST /api/v1/auth/login` đúng credentials → `200` + token
- [ ] Sai password → `401`
- [ ] Email không tồn tại → `401` (không được tiết lộ email nào tồn tại)
- [ ] Token lưu vào `localStorage` với key `access_token`
- [ ] User role `user` redirect `/cakes` sau login
- [ ] User role `admin` redirect `/admin/cakes` sau login
- [ ] Form hiển thị Toast lỗi khi sai credentials

---

## 📌 Notes

- Luôn trả cùng thông báo `"Email hoặc mật khẩu không đúng"` cho cả 2 trường hợp sai email / sai password (tránh user enumeration)
- Token thời hạn: `7d` (cấu hình qua `.env JWT_EXPIRES_IN`)
