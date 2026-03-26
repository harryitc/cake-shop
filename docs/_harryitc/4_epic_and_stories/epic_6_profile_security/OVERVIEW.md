---
epic_id: epic_6_profile_security
title: "Profile & Security — Tài khoản & Bảo mật"
version: 1.0
status: done
related_prd: ../../2_prd/prd_v2.md
related_architecture: ../../3_architecture/7_comprehensive_v2_design.md
created_at: 2026-03-26
---

# 🛡️ Epic 6: Profile & Security — Tài khoản & Bảo mật

> Quản lý thông tin cá nhân và tăng cường bảo mật cho hệ thống đặt hàng.

---

## 🏁 Mục tiêu (Goal)
Cung cấp khả năng tự quản lý tài khoản cho User/Admin và bảo vệ shop khỏi việc bị spam đơn hàng ảo.

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [x] Backend: Cập nhật Schema User (Profile fields, Avatar, Reset Tokens).
- [x] Backend: Middleware Rate Limiting cho API đặt hàng.
- [x] Backend: API Quản lý Profile (`/me`, `/profile`, `/change-password`).
- [x] Backend: API Quên mật khẩu (`/forgot-password`, `/reset-password`).
- [x] Frontend: Trang Profile (User/Admin) hỗ trợ cập nhật thông tin.
- [x] Frontend: Tích hợp `antd-img-crop` để xử lý Avatar.
- [x] Frontend: Luồng giao diện Quên/Đặt lại mật khẩu.

---

## 🗂️ Danh sách Task

1. **Task 1: Backend Schema & Migration** [DONE]
2. **Task 2: Backend Auth Service Extensions** [DONE]
3. **Task 3: Security Middleware** [DONE]
4. **Task 4: Frontend Profile UI** [DONE]
5. **Task 5: Frontend Forgot Password UI** [DONE]

---

## ✅ Acceptance Criteria
- [x] User đổi được mật khẩu và login lại thành công.
- [x] User không thể tạo quá 5 đơn hàng trong 1 giờ (nhận lỗi 429).
- [x] Avatar sau khi Crop 1:1 và upload phải hiển thị đúng trên Profile.
- [x] Token reset mật khẩu có hiệu lực đúng 1 giờ.
