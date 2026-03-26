---
epic_id: epic_6_profile_security
title: "Profile & Security — Tài khoản & Bảo mật"
version: 1.0
status: todo
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
- [ ] Backend: Cập nhật Schema User (Profile fields, Avatar, Reset Tokens).
- [ ] Backend: Middleware Rate Limiting cho API đặt hàng.
- [ ] Backend: API Quản lý Profile (`/me`, `/profile`, `/change-password`).
- [ ] Backend: API Quên mật khẩu (`/forgot-password`, `/reset-password`).
- [ ] Frontend: Trang Profile (User/Admin) hỗ trợ cập nhật thông tin.
- [ ] Frontend: Tích hợp `antd-img-crop` để xử lý Avatar.
- [ ] Frontend: Luồng giao diện Quên/Đặt lại mật khẩu.

---

## 🗂️ Danh sách Task

1. **Task 1: Backend Schema & Migration**
   - Bổ sung các field mới vào `User.schema.js`.
2. **Task 2: Backend Auth Service Extensions**
   - Viết logic xử lý Profile, Change Password.
   - Viết logic xử lý Forgot/Reset Password (sinh token, verify).
3. **Task 3: Security Middleware**
   - Cài đặt và cấu hình `express-rate-limit`.
4. **Task 4: Frontend Profile UI**
   - Xây dựng form thông tin cá nhân.
   - Tích hợp Upload Avatar kèm Crop logic.
5. **Task 5: Frontend Forgot Password UI**
   - Xây dựng trang nhập Email và trang nhập Mật khẩu mới.

---

## ✅ Acceptance Criteria
- [ ] User đổi được mật khẩu và login lại thành công.
- [ ] User không thể tạo quá 5 đơn hàng trong 1 giờ (nhận lỗi 429).
- [ ] Avatar sau khi Crop 1:1 và upload phải hiển thị đúng trên Profile.
- [ ] Token reset mật khẩu có hiệu lực đúng 1 giờ.
