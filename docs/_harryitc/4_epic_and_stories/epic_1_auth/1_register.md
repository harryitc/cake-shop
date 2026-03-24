---
task_id: 1_register
epic_id: epic_1_auth
title: "Đăng ký tài khoản (Register)"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
  - frontend
created_at: 2026-03-24
---

# 📝 Task 1: Đăng ký tài khoản (Register)

> **Epic:** [epic_1_auth](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng API đăng ký tài khoản mới và Form Register trên Frontend. Người dùng nhập email + password, hệ thống tạo tài khoản, băm mật khẩu bằng bcrypt và trả về JWT Token.

---

## 📖 User Story

**As a** visitor (khách chưa có tài khoản)  
**I want to** điền email và password để tạo tài khoản  
**So that** tôi có thể đăng nhập và đặt hàng bánh

---

## 🔧 Technical Breakdown

### Backend

**API Endpoint:**
```
POST /api/v1/auth/register
```

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response thành công (`201 Created`):**
```json
{
  "data": {
    "token": "<jwt_access_token>",
    "user": { "id": "...", "email": "...", "role": "user" }
  },
  "message": "Đăng ký thành công"
}
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Thiếu email/password, email sai định dạng, password < 6 ký tự |
| 409 | Email đã tồn tại trong hệ thống |

**Files cần tạo / sửa:**
- [ ] `schemas/User.schema.js` — fields: email (unique), password_hash, role (default: `user`)
- [ ] `services/auth.service.js` — hàm `register({ email, password })`: validate duplicate, bcrypt hash, create user, sign JWT
- [ ] `controllers/auth.controller.js` — handler `register()`: Joi validate input, gọi service, trả JSON
- [ ] `routes/auth.routes.js` — `POST /register` → controller
- [ ] `app.js` — mount `authRouter` tại `/api/v1/auth`
- [ ] `utils/response.utils.js` — hàm `sendSuccess(res, data, message, statusCode)` và `sendError(next, message, statusCode, code)`

---

### Frontend

**Route / Page:** `/register`

**Component chịu trách nhiệm:** `modules/auth/components/RegisterForm.tsx`

**Data Flow:**
```
/register/page.tsx → <RegisterForm /> → useRegisterMutation() → authApi.register() → http.ts → POST /api/v1/auth/register
```

**Sau khi thành công:** lưu token vào `localStorage`, redirect `/cakes`

**Files cần tạo / sửa:**
- [ ] `modules/auth/types.ts` — interface `IAuthResponse`, `IUserInfo`, `IRegisterPayload`
- [ ] `modules/auth/api.ts` — hàm `authApi.register(payload: IRegisterPayload)`
- [ ] `modules/auth/hooks.ts` — `useRegisterMutation()`: onSuccess → localStorage.setItem + router.push
- [ ] `lib/http.ts` — hoàn thiện inject token từ localStorage nếu có
- [ ] `modules/auth/components/RegisterForm.tsx` — Form Ant Design (email, password), React Hook Form + Zod validate
- [ ] `app/register/page.tsx` — import `<RegisterForm />`

---

## ✅ Acceptance Criteria

- [ ] `POST /api/v1/auth/register` với email mới → `201` + token
- [ ] Email đã tồn tại → `409`
- [ ] Thiếu field hoặc email sai format → `400`
- [ ] Password < 6 ký tự → `400`
- [ ] Token được lưu vào `localStorage` sau khi đăng ký
- [ ] Redirect về `/cakes` sau khi đăng ký thành công
- [ ] Form hiển thị lỗi inline (Zod) và Toast (API error)

---

## 📌 Notes

- Role mặc định là `user`, không cho phép client tự set role
- Không trả `password_hash` ra ngoài trong bất kỳ response nào
- JWT payload tối thiểu: `{ userId, role }`
