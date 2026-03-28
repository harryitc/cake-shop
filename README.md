# 🎂 Cake Shop - Modern E-Commerce Monorepo

[![Project Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/harryitc/test-express)
[![Stack](https://img.shields.io/badge/stack-Next.js%20|%20Express%20|%20MongoDB-green.svg)](https://github.com/harryitc/test-express)

Cake Shop là một nền tảng thương mại điện tử hoàn chỉnh, được xây dựng theo cấu hình Monorepo. Hệ thống bao gồm Backend API mạnh mẽ và hai ứng dụng Frontend chuyên biệt dành cho khách hàng và quản trị viên.

---

## 🌐 Live Demo

Hệ thống có thể được truy cập trực tiếp thông qua các đường dẫn dưới đây:

*   **🛒 Storefront (Người dùng):** [https://cake-shop-user.netlify.app](https://cake-shop-user.netlify.app)
*   **🛡️ Admin Dashboard (Quản trị):** [https://cake-shop-admin.netlify.app](https://cake-shop-admin.netlify.app)

> **Tài khoản quản trị dùng thử:**
> - **Email:** `admin@gmail.com`
> - **Password:** `admin123`

---

## 🌟 Tính năng nổi bật

### 🛒 Cửa hàng khách hàng (`web-client/user`)
*   **Danh mục sản phẩm động**: Duyệt sản phẩm với bộ lọc nâng cao theo danh mục, nhãn và giá.
*   **Xác thực bảo mật**: Hệ thống đăng nhập/đăng ký dựa trên JWT và quản lý thông tin cá nhân.
*   **Giỏ hàng & Yêu thích**: Giỏ hàng lưu trữ bền vững và danh sách yêu thích cho người dùng đã xác thực.
*   **Thanh toán thông minh**: Tích hợp mã giảm giá (Coupon) và theo dõi trạng thái đơn hàng thời gian thực.
*   **Loyalty Program**: Tích lũy điểm thưởng, phân hạng thành viên (Bronze, Silver, Gold, Platinum) và cơ chế đổi điểm.

### 🛡️ Trang Quản trị (`web-client/admin`)
*   **Quản lý kho hàng**: CRUD sản phẩm với hỗ trợ đa biến thể (Product Variants).
*   **Xử lý đơn hàng**: Tiếp nhận và cập nhật trạng thái đơn hàng tập trung.
*   **Hệ thống Import/Export**: Xử lý dữ liệu quy mô lớn qua Excel với các chế độ Upsert, Insert Only, và Update Only.
*   **Trung tâm Analytics**: Báo cáo doanh thu và phân tích hành vi người dùng qua biểu đồ.
*   **Cấu hình Loyalty**: Thiết lập quy tắc tích điểm, hạng thẻ và quản lý danh mục quà tặng.

### ⚙️ Backend Core (`web-server`)
*   **Thiết kế RESTful API**: Các endpoint được tổ chức theo mô hình Route-Controller-Service.
*   **Bulk Engine Hiệu năng cao**: Xử lý tập tin Excel bằng kỹ thuật Streaming (`exceljs`) và MongoDB `bulkWrite`.
*   **Thông báo tự động**: Hệ thống gửi Email thông báo trạng thái đơn hàng và bảo mật.
*   **Bảo mật hệ thống**: Rate limiting, kiểm soát dữ liệu đầu vào với Joi, và mã hóa mật khẩu bcrypt.

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
| :--- | :--- |
| **Backend** | Node.js, Express.js, MongoDB, JWT, Joi, ExcelJS, Sharp, Nodemailer |
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Ant Design, Shadcn UI |
| **Quản lý State** | TanStack Query (React Query) v5, React Hook Form, Zod |
| **Cơ sở dữ liệu** | MongoDB Atlas (v6.0+) |

---

## 🏗️ Cấu trúc dự án

```text
.
├── web-server/         # Express.js REST API
├── web-client/
│   ├── user/           # Next.js Storefront (Giao diện khách hàng)
│   └── admin/          # Next.js Admin Dashboard (Trang quản trị)
├── docs/               # Tài liệu đặc tả dự án (PRDs, Kiến trúc, Epics)
├── scripts/            # Script Seed dữ liệu và tiện ích DB
└── dev.sh / web.sh     # Script khởi chạy nhanh dự án
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Điều kiện tiên quyết
*   **Node.js**: Phiên bản >= 20.0.0
*   **MongoDB Atlas**: Một cụm (cluster) MongoDB Atlas đã được thiết lập và sẵn sàng kết nối.

### 2. Thiết lập Environment
Cấu hình tập tin `.env` cho từng dịch vụ:

*   **Backend (`web-server/.env`)**: Biến `MONGO_URI` cần trỏ chính xác đến chuỗi kết nối (connection string) của MongoDB Atlas.
*   **Frontend**: Cấu hình địa chỉ API URL tương ứng.

### 3. Chạy dự án
Khởi chạy nhanh thông qua các script hỗ trợ:

```bash
# Chạy toàn bộ hệ thống (Server + User + Admin)
./dev.sh

# Chỉ chạy các ứng dụng Frontend (User + Admin)
./web.sh

# Khởi chạy thủ công từng phần
cd web-server && npm run dev
cd web-client/user && npm run dev
cd web-client/admin && npm run dev
```

---

## 📖 Tài liệu dự án
Quy trình phát triển được thực hiện theo mô hình **Documentation-Driven Development**. Mọi đặc tả chi tiết về yêu cầu sản phẩm (PRD), thiết kế kiến trúc, luồng nghiệp vụ và tiến độ phát triển được lưu trữ tập trung trong thư mục `docs/`.

---

## 📜 Giấy phép
Dự án được phát hành dưới giấy phép MIT.
