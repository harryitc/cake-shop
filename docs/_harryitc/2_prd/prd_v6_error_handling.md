---
title: PRD - Hệ thống Xử lý Lỗi Thống nhất (Unified Error Handling System)
status: Approved
version: 1.1.0
date: 2026-03-29
author: Gemini CLI
architecture_ref: "docs/_harryitc/3_architecture/11_error_handling_design.md"
---

# PRD: Hệ thống Xử lý Lỗi Thống nhất (Unified Error Handling System)

## 1. Tổng quan (Overview)

### 1.1 Vấn đề (Problem Statement)
Hiện tại, khi ứng dụng gặp sự cố (như lỗi kết nối máy chủ, lỗi dữ liệu, hoặc quyền truy cập), các thông báo hiển thị cho người dùng không nhất quán. Có trường hợp lỗi không được thông báo dẫn đến ứng dụng "treo" về mặt trải nghiệm, hoặc thông báo quá kỹ thuật gây hoang mang cho người dùng cuối. Đội ngũ phát triển cũng thiếu thông tin định danh cụ thể để truy vết và khắc phục sự cố nhanh chóng.

### 1.2 Mục tiêu (Goals)
- **Minh bạch**: Người dùng luôn được thông báo về tình trạng thực tế của ứng dụng thay vì trạng thái không xác định.
- **Phân cấp Thông báo**: Phân biệt rõ giữa lỗi hạ tầng (System Failure) và lỗi thao tác người dùng (User/Business Logic) để có cách phản hồi UI phù hợp.
- **Hỗ trợ Truy vết**: Cung cấp các mã định danh lỗi và mốc thời gian chính xác để hỗ trợ khách hàng và sửa lỗi.
- **Tự động hóa**: Giảm thiểu việc lập trình viên phải viết code xử lý lỗi trùng lặp ở từng module đơn lẻ.

---

## 2. Đối tượng mục tiêu (Target Audience)
- **Người dùng cuối (End-users)**: Nhận được hướng dẫn rõ ràng (ví dụ: "Vui lòng kiểm tra lại kết nối mạng" hoặc "Tên đăng nhập đã tồn tại").
- **Lập trình viên**: Có quy chuẩn chung để trao đổi thông tin lỗi giữa các thành phần của hệ thống Monorepo.
- **Đội ngũ Vận hành**: Có dữ liệu (mã lỗi, timestamp) để đối soát nhật ký hệ thống (logs).

---

## 3. Yêu cầu Chức năng (Functional Requirements)

### 3.1 Yêu cầu về Thông tin Phản hồi (Error Feedback)
- **Mã định danh duy nhất**: Mỗi loại lỗi nghiệp vụ phải có mã định danh không trùng lặp (ví dụ: `CAKE_OUT_OF_STOCK`).
- **Xác định thời điểm**: Mọi lỗi phải được gắn kèm mốc thời gian chính xác (Timestamp).
- **Mô tả thân thiện**: Thông tin lỗi phải có nội dung mô tả bằng ngôn ngữ dễ hiểu, không chứa các thuật ngữ lập trình nhạy cảm.
- **Dữ liệu bổ sung**: Cho phép đính kèm danh sách chi tiết các trường dữ liệu bị lỗi (ví dụ: lỗi validation trên form đăng ký).

### 3.2 Yêu cầu về Hiển thị UI (UI Presentation)
- **Thông báo Hệ thống Global**: Tự động hiển thị thông báo nổi bật (Notification) cho các lỗi nghiêm trọng như sập máy chủ, mất mạng, hoặc bị từ chối truy cập.
- **Xử lý Lỗi Nghiệp vụ Local**: Cho phép hiển thị lỗi ngay tại vị trí xảy ra thao tác người dùng (Inline Error) đối với các lỗi liên quan đến dữ liệu đầu vào.
- **Tự động Redirect**: Hệ thống phải tự động đưa người dùng về trang đăng nhập nếu phiên làm việc (Session) hết hạn.

---

## 4. Yêu cầu Phi chức năng (Non-functional Requirements)

- **Bảo mật**: Tuyệt đối không để lộ cấu trúc thư mục, tên database, hay các đoạn mã lệnh trong thông báo lỗi hiển thị cho người dùng ở môi trường Production.
- **Hiệu năng**: Quá trình xử lý và định dạng lại thông tin lỗi tại máy chủ không được làm tăng đáng kể thời gian phản hồi của API.
- **Tính sẵn sàng**: Cơ chế thông báo lỗi phải hoạt động ngay cả khi kết nối Internet bị gián đoạn.

---

## 5. Định nghĩa Thành công (Success Metrics)
- 100% lỗi hệ thống được thông báo tự động và nhất quán trên toàn ứng dụng mà không cần can thiệp ở từng Component.
- Người dùng không bao giờ gặp tình trạng thao tác mà ứng dụng không có phản hồi hình ảnh.
- Đội ngũ kỹ thuật có thể xác định nguyên nhân lỗi thông qua mã định danh lỗi do người dùng cung cấp.
