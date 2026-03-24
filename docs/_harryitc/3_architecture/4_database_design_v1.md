---
title: Database Design & Schemas
version: 1.0
type: architecture
related_docs:
  - 1_system_architecture.md
  - 3_backend_architecture.md
---

# 🗄️ DATABASE DESIGN & SCHEMAS

> Tài liệu mô tả cấu trúc các bộ thực thể (Entity) lưu trong MongoDB. Tài liệu này được tách riêng biệt để theo dõi vòng đời thiết kế CSDL (sẽ được nâng cấp và thay đổi rất nhiều trong từng giai đoạn dự án).

---

## 🏗️ Tổng quan Mongoose Schemas (V1)

Dự án thiết kế theo định dạng MongoDB NoSQL. Các file mô tả cấu trúc cột/trường dữ liệu này sẽ được đặt 100% tại thư mục `/schemas` của Backend để phục vụ ánh xạ Model tự động.

### 1. 👤 `User.schema.js`
Đại diện cho Khách hàng vãng lai và Quản trị viên (Admin).
* `email`: String (bắt buộc, unique index).
* `password_hash`: String (Lưu chuỗi đã băm bằng bcrypt, không bao giờ lưu plain text).
* `role`: Enum `['user', 'admin']` (Mặc định là `'user'`).
* `created_at` / `updated_at`: Timestamps mặc định của Mongoose.

### 2. 🎂 `Cake.schema.js`
Đại diện cho danh sách Bánh kem sẵn có trong cửa tiệm.
* `name`: String (Bắt buộc).
* `description`: String.
* `info`: Object chứa `slug` (ví dụ: `{ slug: String }` theo đúng yêu cầu, dùng làm URL thân thiện, index & unique).
* `price`: Number (Buộc phải dương `> 0`, lưu bằng Integer hạn chế lỗi số thực thập phân JS).
* `image_url`: String (Link ảnh tĩnh hoặc URL Cloudinary).
* `created_at`: Timestamps.

### 3. 🛒 `CartItem.schema.js`
Thiết kế giỏ hàng của từng cá nhân (Lấy tất cả các Items dựa trên `user_id` hiện tại).
* `user`: ObjectId (Ref kết nối tới `User`).
* `cake`: ObjectId (Ref kết nối tới `Cake`).
* `quantity`: Number (Mặc định `1`, buộc phải lớn hơn `0`).

### 4. 🧾 `Order.schema.js` (Thực Thể Thiết Kế Chuẩn NoSQL)
Mô phỏng lại bằng cấu trúc nguyên bản đúng đắn nhất đối với MongoDB (Embedded Sub-document). Một hoá đơn sẽ chứa mảng dữ liệu các sản phẩm ngay bên trong nó (giúp truy vấn siêu nhanh và không tốn lệnh JOIN tốn kém).

* `user_id`: ObjectId (Ref `User`).
* `total_price`: Number.
* `status`: Enum `['PENDING', 'CONFIRMED', 'DONE', 'REJECTED']`.
* `address`: String.
* `items`: Array chứa tập hợp các `OrderItem` (Sub-document). Mongoose sẽ tự quản lý Array này bên trong Document con của Order.
* `created_at` / `updated_at`: Timestamps.

#### Định nghĩa phần lõi `OrderItem` (Gắn chìm vào Array `items`):
* `cake_id`: ObjectId (Liên kết chéo tới Cake).
* `quantity`: Number.
* `price_at_buy`: Number (Lưu chết giá mua trực tiếp vào đơn hàng, tránh tình trạng Order lịch sử bị lệch giá khi Cake sửa giá trên Admin).
