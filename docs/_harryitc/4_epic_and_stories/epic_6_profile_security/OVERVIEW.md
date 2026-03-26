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
- [ ] API lấy thông tin cá nhân hiện tại.
- [ ] API cập nhật Profile (Tên, Email...).
- [ ] Chức năng Đổi mật khẩu.
- [ ] Áp dụng Rate Limiting cho API đặt hàng.
- [ ] UI trang Profile trên cả 2 Frontend.

### Ngoài phạm vi (Out of Scope):
- Đăng nhập bằng Google/Facebook.
- Khôi phục mật khẩu qua Email (Phase 3).

---

## ✅ Acceptance Criteria
- [ ] User đổi được mật khẩu và login lại thành công.
- [ ] User không thể tạo quá 5 đơn hàng trong 1 giờ.
- [ ] Thông tin Profile được hiển thị chính xác.
