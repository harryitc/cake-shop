---
epic_id: epic_5_uploads
title: "FileSystem — Quản lý Hình ảnh"
version: 1.0
status: todo
related_prd: ../../2_prd/prd_v2.md
related_architecture: ../../3_architecture/7_comprehensive_v2_design.md
created_at: 2026-03-26
---

# 🖼️ Epic 5: FileSystem — Quản lý Hình ảnh

> Cho phép Admin upload ảnh trực tiếp lên server để quản lý sản phẩm chuyên nghiệp hơn.

---

## 🏁 Mục tiêu (Goal)
Thay thế việc nhập link ảnh thủ công bằng quy trình chọn file từ máy tính.

---

## 📦 Phạm vi (Scope)

### Trong phạm vi (In Scope):
- [ ] Backend: Cấu hình `multer` lưu file local.
- [ ] Backend: API `POST /api/v1/uploads`.
- [ ] Frontend Admin: Component Upload trong form bánh.
- [ ] Xử lý preview ảnh trước khi lưu.

### Ngoài phạm vi (Out of Scope):
- Chỉnh sửa ảnh (Crop/Resize) trên web.
- Lưu trữ Cloud (Cloudinary/S3) - để dành Phase 3.

---

## ✅ Acceptance Criteria
- [ ] Admin chọn được file ảnh (jpg, png, webp).
- [ ] File được lưu vào thư mục `public/uploads`.
- [ ] Sau khi lưu bánh, ảnh hiển thị đúng trên trang User.
- [ ] Chặn file > 5MB.
