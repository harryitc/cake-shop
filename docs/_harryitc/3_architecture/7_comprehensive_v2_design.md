# 🏗️ Kiến trúc Hệ thống Nâng cấp (V2 Design)

Tài liệu này mô tả chi tiết các thay đổi về mặt kỹ thuật cho các tính năng mới trong Phase 2.

---

## 1. Local Image Upload (Quản lý Ảnh Nội bộ)

### 1.1 Backend Storage & Tracking
- **Công nghệ:** Sử dụng `multer` middleware cho Express.
- **Database Tracking:** Toàn bộ file tải lên được lưu vết trong Table `file_system`.
- **Schema `FileSystem`:**
    - `filename_client`: Tên file gốc người dùng tải lên.
    - `filename_server`: Tên file duy nhất được server generate.
    - `ext`: Định dạng file.
    - `size`: Dung lượng (bytes).
    - `path`: Đường dẫn tương đối (e.g., `/uploads/1711420000-cake.jpg`).
    - `domain`: Domain lưu trữ (mặc định rỗng).
- **Quy trình:**
    1. Client gửi `multipart/form-data` chứa file ảnh.
    2. Multer xử lý lưu file vật lý vào `web-server/public/uploads/`.
    3. Controller tạo bản ghi trong Table `file_system`.
    4. Server trả về đường dẫn `path`.
- **Static Files:** Cấu hình Express phục vụ file tĩnh từ thư mục `public`.

### 1.2 Frontend Integration
- **Lưu trữ:** Trong Database `Cake`, trường `image_url` sẽ chỉ lưu giá trị `path` (ví dụ: `/uploads/abc.jpg`).
- **Hiển thị:** Cấu trúc URL ảnh = `DOMAIN_API + cake.image_url`.
- **Admin Cake Form:** Tích hợp component `Upload` của Ant Design. Khi chọn file, gọi API upload ngay lập tức để lấy `path` và gán vào form.

---

## 2. Profile & Security (Tài khoản & Bảo mật)

### 2.1 User Profile
- **API mới:**
    - `GET /api/v1/auth/me`: Trả về thông tin user hiện tại từ token.
    - `PUT /api/v1/auth/profile`: Cập nhật thông tin cơ bản.
    - `PUT /api/v1/auth/change-password`: Kiểm tra mật khẩu cũ, hash và lưu mật khẩu mới.

### 2.2 Rate Limiting (Chống Spam)
- **Middleware:** `express-rate-limit`.
- **Áp dụng:** Riêng cho API `POST /api/v1/orders`.
- **Cấu hình:** 5 requests / 60 minutes trên mỗi IP/User ID.

---

## 3. Analytics Dashboard (Báo cáo & Thống kê)

### 3.1 Data Aggregation (MongoDB Pipeline)
- **Tổng doanh thu:** Sum `total_price` của tất cả các đơn hàng có trạng thái `DONE`.
- **Top 5 Bán chạy:**
    - Unwind mảng `items` trong `Order`.
    - Group theo `cake_id`.
    - Sum `quantity`.
    - Sort Descending và Limit 5.
- **Biểu đồ doanh thu theo ngày:**
    - Group theo `$dateToString` format `%Y-%m-%d`.
    - Sum `total_price`.

### 3.2 UI Dashboard
- **Layout:** Grid với các thẻ `Card` thống kê ở trên đầu.
- **Charts:** Sử dụng `recharts` hoặc thư viện tương đương để vẽ biểu đồ đường (doanh thu) và biểu đồ tròn (trạng thái đơn hàng).

---

## 4. Database Schema Changes
- Không có thay đổi lớn về Schema hiện tại. Dữ liệu báo cáo sẽ được tổng hợp từ Schema `Order` và `Cake` đã có.
