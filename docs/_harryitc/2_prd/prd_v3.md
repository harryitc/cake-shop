# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) - PRD_V3.md

## 🛒 Cake Shop Website - Expansion Phase

> Version 3. 
> Ngày tạo: 26/03/2026.

---

# 1. 🎯 Product Overview

## 1.1 Mục tiêu sản phẩm

Nâng cấp Cake Shop thành một nền tảng thương mại điện tử chuyên nghiệp, tăng khả năng chuyển đổi và giữ chân khách hàng thông qua các tính năng tương tác, khuyến mãi và quản lý thông minh.

## 1.2 Giá trị cốt lõi

* **Tương tác:** Đánh giá, bình luận giúp xây dựng lòng tin.
* **Tiện lợi:** Tìm kiếm nâng cao, Danh sách yêu thích, Đăng nhập mạng xã hội.
* **Tăng trưởng:** Hệ thống mã giảm giá, Chiến dịch khuyến mãi.

---

# 2. 👥 Target Users

## 2.1 Khách hàng (Customer)
* Cần tìm kiếm bánh theo dịp (Sinh nhật, Đám cưới, Kỷ niệm).
* Muốn xem đánh giá từ người mua trước.
* Muốn lưu lại các mẫu bánh yêu thích.

## 2.2 Quản trị viên (Admin)
* Quản lý danh mục linh hoạt.
* Tạo và quản lý các chương trình khuyến mãi/mã giảm giá.
* Kiểm duyệt đánh giá của khách hàng.

---

# 3. 🎯 Product Scope

## 3.1 In Scope (Phase 3 Expansion)

* **Hệ thống Danh mục (Categories):** Quản lý bánh theo phân loại (Birthday, Wedding, Mini, etc.).
* **Đánh giá & Phản hồi (Reviews & Ratings):** Khách hàng đánh giá (1-5 sao) và bình luận sau khi hoàn thành đơn hàng.
* **Tìm kiếm & Lọc nâng cao:** Lọc theo danh mục, khoảng giá, đánh giá.
* **Khuyến mãi & Mã giảm giá (Coupons):** Tạo mã giảm giá (theo % hoặc số tiền cố định).
* **Thông báo Email:** Gửi email tự động khi trạng thái đơn hàng thay đổi.
* **Danh sách yêu thích (Wishlist):** Lưu các mẫu bánh yêu thích để mua sau.

## 3.2 Out of Scope (Phase 3)

* **Thanh toán Online (Momo/VNPay):** Sẽ triển khai ở giai đoạn sau.
* Hệ thống Chat Realtime (Chuyển sang Phase 4).
* AI Recommendation chuyên sâu (Dựa trên hành vi click - Chuyển sang Phase 4).
* Đa ngôn ngữ (i18n).

---

# 4. 🧭 User Experience (UX Flow)

## 4.1 Customer Journey
1. Tìm kiếm bánh theo từ khóa hoặc lọc theo danh mục/giá.
2. Xem đánh giá của người dùng khác tại trang chi tiết.
3. Thêm vào Wishlist hoặc Giỏ hàng.
4. Áp dụng mã giảm giá tại trang Checkout.
5. Đặt hàng (COD).
6. Nhận Email xác nhận và cập nhật đơn hàng.
7. Viết đánh giá sau khi nhận được bánh.

---

## 4.2 Admin Journey
1. Quản lý danh mục (Thêm/Sửa/Xóa).
2. Tạo mã giảm giá cho các chiến dịch.
3. Phê duyệt/Phản hồi đánh giá của khách hàng.

---

# 5. 📦 Features (New in V3)

## 5.1 Categorization & Dynamic Tags
* Admin có thể tạo các danh mục bánh (ví dụ: Bánh sinh nhật, Bánh cưới, Bánh theo mùa).
* Mỗi sản phẩm có thể thuộc một hoặc nhiều danh mục.

## 5.2 Ratings & Reviews
* Chỉ những khách hàng đã mua sản phẩm (đơn hàng DONE) mới được đánh giá.
* Hiển thị điểm trung bình sao và danh sách bình luận tại trang chi tiết sản phẩm.

## 5.3 Coupon System
* Loại mã: Giảm theo % hoặc Giảm số tiền cụ thể.
* Điều kiện áp dụng: Giá trị đơn hàng tối thiểu, Ngày hết hạn, Số lần sử dụng tối đa.

## 5.4 Automated Email Notifications
* Gửi email khi: Đặt hàng thành công, Đơn hàng được xác nhận, Đơn hàng đang giao, Đơn hàng hoàn thành/bị hủy.

---

# 6. 🧠 Business Rules (New in V3)

* **Review Rule:** Mỗi user chỉ được đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng.
* **Coupon Rule:** Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá duy nhất.

---

# 7. 📡 Non-functional Requirements

* **SEO:** Tối ưu Meta Tags, JSON-LD cho sản phẩm để hiển thị tốt trên Google.
* **Hiệu năng:** Caching danh mục và sản phẩm phổ biến để tăng tốc độ tải trang.

---
