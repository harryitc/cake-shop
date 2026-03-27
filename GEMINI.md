# Cake Shop Project - Manifesto & Guidelines

## 📋 Tổng quan dự án (Project Overview)

Đây là một ứng dụng thương mại điện tử chuyên nghiệp cho Cake Shop, được tổ chức dưới dạng Monorepo. Dự án được xây dựng với tư duy ưu tiên hiệu năng, tính mở rộng và trải nghiệm người dùng hiện đại.

**Các thành phần chính:**
- **Backend (`web-server/`)**: RESTful API xây dựng trên Express.js. Tuân thủ nghiêm ngặt mô hình Route-Controller-Service-Schema.
- **Admin Panel (`web-client/admin/`)**: Dashboard quản trị bằng Next.js 15 (React 19). Tập trung vào quản lý kho hàng, đơn hàng và xử lý dữ liệu lớn.
- **User Storefront (`web-client/user/`)**: Trang thương mại điện tử bằng Next.js 15 (React 19), tối ưu hóa cho khách hàng.
- **Documentation (`docs/`)**: Nguồn chân lý của dự án. Chứa PRDs, Thiết kế kiến trúc và Đặc tả các Epics.

## ⚖️ Quy ước & Nguyên tắc phát triển (Development Mandates)

### 1. Documentation-Driven Development (DDD)
- **Nguyên tắc**: Không triển khai tính năng lớn hoặc thay đổi kiến trúc nào mà không có tài liệu đặc tả tương ứng trong thư mục `docs/`.
- **Nguyên tắc**: Việc thực thi code phải bám sát tài liệu. Nếu có thay đổi so với đặc tả ban đầu, tài liệu **PHẢI** được cập nhật trước hoặc song song với code.

### 2. Kiến trúc Backend (Separation of Concerns)
- **Routes**: Chỉ định nghĩa endpoint và gắn middleware (Auth, Roles). Không chứa logic nghiệp vụ.
- **Controllers**: Xử lý logic HTTP, trích xuất tham số và định dạng phản hồi. **BẮT BUỘC** sử dụng Joi để validate dữ liệu đầu vào.
- **Services**: Nơi chứa logic nghiệp vụ cốt lõi. Đây là lớp duy nhất được phép tương tác phức tạp và thực hiện các tính toán business.
- **Schemas**: Định nghĩa cấu trúc dữ liệu Mongoose, các hooks (như tự động tạo slug) và indexes.

### 3. Tiêu chuẩn Frontend
- **Stack**: Next.js App Router, React 19, TypeScript.
- **Styling**: Tailwind CSS là công cụ chính. Sử dụng Shadcn UI và Ant Design cho các thành phần UI phức tạp.
- **State Management**: TanStack Query (React Query) cho server state; React Hook Form + Zod cho validation form.

### 4. Quy trình Git & Workflow
- **Nguyên tắc**: Mọi tính năng, bản sửa lỗi hoặc tái cấu trúc đều phải đi kèm với commit có mô tả rõ ràng.
- **Nguyên tắc**: Khi cập nhật logic hoặc kiến trúc, tài liệu trong `docs/` **PHẢI** được cập nhật trong cùng một lần thay đổi để phản ánh đúng hiện trạng dự án.
- **Bảo mật**: Tuyệt đối không commit các file `.env` hoặc thông tin nhạy cảm.
