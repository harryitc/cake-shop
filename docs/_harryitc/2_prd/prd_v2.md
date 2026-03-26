# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) - PRD_V2.md

## 🛒 Cake Shop Website

> Version 2. 
> Ngày tạo: 26/03/2026.

---

# 1. 🎯 Product Overview

## 1.1 Mục tiêu sản phẩm

Xây dựng một website bán bánh kem chuyên nghiệp, hỗ trợ quản lý toàn diện từ sản phẩm, kho hàng đến báo cáo kinh doanh.

## 1.2 Giá trị cốt lõi

* Trải nghiệm người dùng mượt mà (Thêm giỏ hàng, cập nhật số lượng, đặt hàng COD)
* Quản trị thông minh (Upload ảnh local, Quản lý tồn kho, Dashboard doanh thu)
* Hệ thống bảo mật (Phân quyền, Rate Limiting đơn hàng)

---

# 2. 👥 Target Users

## 2.1 Khách hàng (Customer)

* Người mua bánh nhanh, giao diện thân thiện.
* Có trang cá nhân để quản lý thông tin và lịch sử đơn hàng.

## 2.2 Quản trị viên (Admin)

* Chủ shop quản lý danh mục, kho hàng và theo dõi chỉ số kinh doanh.

---

# 3. 🎯 Product Scope

## 3.1 In Scope (Phase 2 Upgrade)

* **Quản lý Hình ảnh:** Cho phép Admin upload ảnh trực tiếp lên server (local storage).
* **Quản lý Tài khoản (Profile):** User/Admin có thể xem thông tin cá nhân và đổi mật khẩu.
* **Báo cáo & Thống kê (Analytics):** Dashboard cho Admin xem doanh thu, đơn hàng và sản phẩm bán chạy.
* **Bảo mật nâng cao:** Tích hợp Rate Limiting để ngăn chặn spam tạo đơn hàng.
* **Quản lý Tồn kho:** (Đã triển khai) Tự động trừ/hoàn kho khi đặt/hủy đơn.

## 3.2 Out of Scope (Phase 2)

* Thanh toán online (VNPay/Momo).
* Chat realtime.
* Gợi ý sản phẩm bằng AI.

---

# 4. 🧭 User Experience (UX Flow)

## 4.1 Customer Journey
1. Xem danh sách bánh → Chi tiết bánh.
2. Thêm vào giỏ hàng → Điều chỉnh số lượng (chặn theo tồn kho).
3. Đặt hàng COD.
4. **Mới:** Truy cập Profile → Cập nhật thông tin / Đổi mật khẩu.

---

## 4.2 Admin Journey
1. **Mới:** Xem Dashboard (Doanh thu, Top sản phẩm).
2. Quản lý danh sách bánh (**Mới:** Upload ảnh từ máy tính).
3. Quản lý đơn hàng (Trạng thái, Tự động hoàn kho khi Reject).

---

# 5. 📦 Features (New in V2)

## 5.1 Local Image Upload
* Admin có thể chọn file từ máy tính khi tạo/sửa bánh.
* Hệ thống lưu trữ file vật lý tại thư mục `/public/uploads` trên server.
* **Mới:** Lưu trữ thông tin metadata (tên gốc, tên server, kích thước, đường dẫn) vào bảng `Upload` trong Database để quản lý.
* API trả về đường dẫn `path` (relative), Frontend tự ghép với Domain để hiển thị.

## 5.2 User/Admin Profile
* Xem thông tin Email, Vai trò.
* Cập nhật thông tin cá nhân.
* Chức năng Đổi mật khẩu bảo mật.

## 5.3 Analytics Dashboard
* Thống kê tổng doanh thu theo thời gian.
* Biểu đồ số lượng đơn hàng (Pending, Confirmed, Done, Rejected).
* Danh sách Top 5 sản phẩm bán chạy nhất.

---

# 6. 🧠 Business Rules (New in V2)

* **Rate Limiting:** Mỗi User chỉ được tạo tối đa 5 đơn hàng trong vòng 1 giờ để tránh spam.
* **File Upload:** Chỉ chấp nhận các định dạng ảnh (jpg, png, webp) và dung lượng tối đa 5MB.
* **Stock Constraint:** Khách không thể chọn số lượng trong giỏ lớn hơn số tồn kho hiện có.

---

# 7. 📡 Non-functional Requirements

* **Bảo mật:** Hash mật khẩu (Bcrypt), JWT Auth, Chống tấn công Brute-force/Spam đơn hàng.
* **Lưu trữ:** Đảm bảo thư mục upload được phân quyền và phục vụ static files đúng cách.

---
