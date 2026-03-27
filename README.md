# 🎂 Cake Shop - Modern E-Commerce Monorepo

[![Project Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/harryitc/test-express)
[![Stack](https://img.shields.io/badge/stack-Next.js%20|%20Express%20|%20MongoDB-green.svg)](https://github.com/harryitc/test-express)

Chào mừng bạn đến với dự án **Cake Shop**! Đây là một nền tảng thương mại điện tử hoàn chỉnh, hiện đại, được xây dựng với cấu hình Monorepo. Dự án bao gồm một Backend API mạnh mẽ và hai ứng dụng Frontend chuyên biệt cho khách hàng và quản trị viên.

---

## 🌟 Tính năng nổi bật

### 🛒 Cửa hàng khách hàng (`web-client/user`)
*   **Danh mục sản phẩm động**: Duyệt bánh với bộ lọc nâng cao (Danh mục, Tags, Giá).
*   **Xác thực bảo mật**: Đăng nhập/Đăng ký dựa trên JWT và quản lý Profile.
*   **Giỏ hàng & Yêu thích**: Giỏ hàng lưu trữ bền vững và danh sách yêu thích cho người dùng đã đăng nhập.
*   **Thanh toán thông minh**: Tích hợp hệ thống Mã giảm giá (Coupon) và theo dõi đơn hàng thời gian thực.
*   **Đánh giá & Phản hồi**: Chia sẻ cảm nghĩ về các sản phẩm đã mua.

### 🛡️ Trang Quản trị (`web-client/admin`)
*   **Quản lý kho hàng**: CRUD Bánh với hỗ trợ đa biến thể (Product Variants).
*   **Xử lý đơn hàng**: Quản lý và cập nhật trạng thái đơn hàng theo thời gian thực.
*   **Hệ thống Import/Export (NEW!)**: Xử lý dữ liệu lớn qua Excel (Hỗ trợ các chế độ Upsert, Insert Only, Update Only).
*   **Trung tâm Analytics**: Xem báo cáo doanh thu và hành vi khách hàng.
*   **Cấu hình hệ thống**: Quản lý Danh mục, Coupon, và phê duyệt Đánh giá.

### ⚙️ Backend Core (`web-server`)
*   **Thiết kế RESTful API**: Các endpoint sạch sẽ, tuân thủ mô hình Route-Controller-Service.
*   **Bulk Engine Hiệu năng cao**: Xử lý file Excel bằng kỹ thuật Streaming (`exceljs`) và MongoDB `bulkWrite`.
*   **Thông báo tự động**: Gửi Email thông báo trạng thái đơn hàng và bảo mật tài khoản.
*   **Bảo mật tối ưu**: Rate limiting, xác thực Joi, và mã hóa mật khẩu bằng bcrypt.

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
| :--- | :--- |
| **Backend** | Node.js, Express.js, MongoDB (Atlas/External), JWT, Joi, ExcelJS, Sharp, Nodemailer |
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Ant Design, Shadcn UI |
| **Quản lý State** | TanStack Query (React Query) v5, React Hook Form, Zod |
| **Cơ sở dữ liệu** | MongoDB (v6.0+) |

---

## 🏗️ Cấu trúc dự án

```text
.
├── web-server/         # Express.js REST API
├── web-client/
│   ├── user/           # Next.js Storefront (Giao diện khách hàng)
│   └── admin/          # Next.js Admin Dashboard (Trang quản trị)
├── docs/               # Tài liệu chi tiết (PRDs, Kiến trúc, Epics)
├── scripts/            # Script Seed dữ liệu và tiện ích DB
└── dev.sh / web.sh     # Script khởi chạy nhanh dự án
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Điều kiện tiên quyết
*   **Node.js**: Phiên bản >= 20.0.0
*   **MongoDB**: Một instance MongoDB đang chạy (Atlas hoặc cài đặt Local).

### 2. Thiết lập Environment
Bạn cần cấu hình file `.env` cho từng dịch vụ:

*   **Backend (`web-server/.env`)**: Đảm bảo biến `MONGO_URI` trỏ chính xác đến database của bạn.
*   **Frontend**: Cấu hình API URL tương ứng.

### 3. Chạy dự án
Sử dụng các script hỗ trợ để khởi chạy nhanh:

```bash
# Lựa chọn A: Chạy TẤT CẢ (Server + User + Admin)
./dev.sh

# Lựa chọn B: Chỉ chạy FRONTEND (User + Admin)
./web.sh

# Chạy thủ công (Nếu cần)
cd web-server && npm run dev
cd web-client/user && npm run dev
cd web-client/admin && npm run dev
```

---

## 📖 Tài liệu tham khảo
Chúng tôi tuân thủ quy trình **Documentation-Driven Development**. Bạn có thể tìm thấy các đặc tả chi tiết trong thư mục `docs/_harryitc/`:
*   [Product Requirements (PRD)](./docs/_harryitc/2_prd/prd_v4.md)
*   [Kiến trúc hệ thống](./docs/_harryitc/3_architecture/1_system_architecture.md)
*   [Thiết kế xử lý dữ liệu lớn (Import/Export)](./docs/_harryitc/3_architecture/9_bulk_data_architecture.md)
*   [Tiến độ dự án (Progress Tracker)](./docs/_harryitc/PROGRESS.md)

---

## 📜 Giấy phép
Dự án được phát hành dưới giấy phép MIT.

---
*Phát triển bởi ❤️ HarryITC và Gemini CLI Agent.*
