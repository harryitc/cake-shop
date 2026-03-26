# 🏗️ Thiết kế Hệ thống Mở rộng (V3 Design)

Tài liệu này mô tả chi tiết các thay đổi về mặt kỹ thuật cho các tính năng mới trong Phase 3.

---

## 1. Hệ thống Danh mục (Categorization)

### 1.1 Database Schema
- **New Schema `Category`:**
    - `name`: String (Unique).
    - `slug`: String (Unique).
    - `description`: String.
    - `image_url`: String.
- **Update Schema `Cake`:**
    - `category`: ObjectId (Ref `Category`).

### 1.2 Frontend Integration
- **Admin:** Thêm trang quản lý Danh mục (CRUD). Form tạo bánh cho phép chọn Danh mục từ Dropdown.
- **User:** Thanh Sidebar hoặc Menu ngang để lọc bánh theo Danh mục.

---

## 2. Đánh giá & Phản hồi (Reviews & Ratings)

### 2.1 Database Schema
- **New Schema `Review`:**
    - `user`: ObjectId (Ref `User`).
    - `cake`: ObjectId (Ref `Cake`).
    - `order`: ObjectId (Ref `Order`).
    - `rating`: Number (1-5).
    - `comment`: String.
    - `is_approved`: Boolean (Mặc định `true` hoặc `false` tùy cấu hình).
- **Update Schema `Cake`:**
    - `average_rating`: Number (Mặc định 0).
    - `review_count`: Number (Mặc định 0).

### 2.2 Quy trình
- Khi `Order.status === 'DONE'`, Frontend hiển thị nút "Đánh giá" cho từng sản phẩm trong đơn.
- Khi một Review được tạo:
    - Tính toán lại `average_rating` của Cake tương ứng.
    - Update Cake document.

---

## 3. Hệ thống Khuyến mãi (Coupon System)

### 3.1 Database Schema
- **New Schema `Coupon`:**
    - `code`: String (Unique, In hoa, ví dụ: CAKE2026).
    - `type`: Enum `['PERCENT', 'FIXED']`.
    - `value`: Number.
    - `min_order_value`: Number.
    - `max_discount_value`: Number (Cho loại PERCENT).
    - `start_date`: Date.
    - `end_date`: Date.
    - `usage_limit`: Number.
    - `used_count`: Number.
    - `is_active`: Boolean.

### 3.2 Logic áp dụng
- Frontend: Ô nhập mã tại trang Thanh toán. Gọi API `POST /api/v1/coupons/apply`.
- Backend: Kiểm tra tính hợp lệ (date, limit, min_order) -> Trả về số tiền được giảm.
- Khi tạo Order: Lưu `coupon_code` và `discount_amount` vào Order document.

---

## 4. Thông báo Email (Automated Notifications)

- **Công nghệ:** `nodemailer` (SMTP).
- **Template:** Sử dụng `ejs` hoặc `handlebars` để render HTML email chuyên nghiệp.
- **Sự kiện:** Hook vào `Order.service` tại các hàm tạo đơn và cập nhật trạng thái.

---

## 5. Danh sách yêu thích (Wishlist)

- **Database Schema `Wishlist`:**
    - `user`: ObjectId (Ref `User`).
    - `cakes`: Array of ObjectId (Ref `Cake`).
- **Frontend:** Nút ❤️ trên từng Card sản phẩm. Trang `/wishlist` hiển thị danh sách đã lưu.

---
