# Bulk Data Architecture: Generic Import/Export Module

## 1. Overview
Hệ thống xử lý dữ liệu lớn (Bulk Data) được thiết kế theo hướng module hóa (Plug-and-play), cho phép tái sử dụng logic cốt lõi cho mọi thực thể (Cakes, Orders, Coupons...).

## 2. Luồng xử lý dữ liệu (Data Flow)

### Import Flow (Excel -> DB)
1. **API Layer**: Nhận multipart file (Excel) kèm theo `importMode` (Upsert/Insert/Update).
2. **Streaming Layer**: `ImportService` mở luồng đọc file bằng `exceljs` để tránh nạp toàn bộ dữ liệu vào RAM.
3. **Batching & Mapping**: 
   - Đọc 500 dòng một đợt (Batch).
   - Ánh xạ Tiêu đề cột sang DB fields dựa trên file `config` của thực thể.
   - Chuyển đổi dữ liệu (Transform) ví dụ: `Danh mục: "Bánh Kem"` -> `ID: "65f..."`.
4. **Validation Layer**: Kiểm tra từng dòng dựa trên Joi Schema.
5. **Database Layer (BulkWrite)**: Gom tất cả lệnh ghi thành một yêu cầu `bulkWrite` duy nhất tới MongoDB để tối ưu tốc độ I/O.

### Export Flow (DB -> Excel)
1. **Query Layer**: Truy vấn dữ liệu dựa trên Filter từ API.
2. **Streaming Layer**: Sử dụng `exceljs.WorkbookWriter` để ghi dữ liệu trực tiếp vào Stream phản hồi (Response Stream).

## 3. Thành phần kiến trúc (Structural Components)

- **ImportService.js**: Lõi xử lý logic (Generic Engine) hỗ trợ Chunking và BulkWrite.
- **cake.import.config.js**: Nơi định nghĩa `mapping` (Header <-> DB Field), `transform` (Category lookup) và `validate` (Joi rules).
- **ImportHistory.schema.js**: Schema MongoDB lưu trữ lịch sử, thống kê và danh sách lỗi (`errors: [ { row, rawData, message } ]`).
- **import.controller.js**: Xử lý logic nghiệp vụ cho việc lấy lịch sử và sinh file Excel báo cáo lỗi.

## 4. Tối ưu trải nghiệm (UX Strategy)
- **Error Mapping**: Tự động ánh xạ ngược dữ liệu DB về đúng tên cột Excel gốc để báo cáo lỗi.
- **Preview Table**: Hiển thị bảng 10 lỗi đầu tiên bằng UI Ant Design để Admin sửa nhanh.
- **Error Report Layout**: Cột "LỖI CHI TIẾT" được đẩy về cuối file (Column K) để giữ nguyên vị trí dữ liệu cũ, thuận tiện cho việc Re-upload.
