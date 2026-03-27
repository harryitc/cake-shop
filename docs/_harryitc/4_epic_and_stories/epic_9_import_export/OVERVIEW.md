# Epic 9: Hệ thống Import/Export Dữ liệu (Generic Engine)

## 📝 Tổng quan (Overview)
Hệ thống Import/Export cho phép quản trị viên (Admin) xử lý dữ liệu lớn (hàng nghìn dòng) một cách hiệu quả thông qua file Excel (.xlsx). Hệ thống được thiết kế theo hướng "Generic" (Tổng quát) ở tầng Service để có thể áp dụng cho mọi loại dữ liệu (Bánh, Đơn hàng, Khách hàng, Danh mục, v.v.) chỉ bằng cấu hình, nhưng cung cấp các API Endpoint riêng biệt cho từng thực thể.

### Mục tiêu chính:
*   **Tiết kiệm thời gian**: Nhập/Xuất dữ liệu hàng loạt thay vì nhập thủ công từng bản ghi.
*   **Tính linh hoạt**: Hỗ trợ 3 chiến lược nhập liệu (Ghi đè, Chỉ thêm mới, Chỉ cập nhật).
*   **Độ tin cậy cao**: Xử lý dữ liệu lớn bằng kỹ thuật Streaming & BulkWrite để tránh lỗi tràn RAM và tối ưu tốc độ Database.
*   **Trải nghiệm người dùng tốt**: Quy trình 3 bước (Wizard) minh bạch, có báo cáo lỗi chi tiết từng dòng.

---

## 🚀 Tính năng chính (Key Features)

### 1. Engine Xử lý Backend (The Core Engine)
*   **Streaming Reader**: Đọc file Excel theo luồng (Row-by-row) bằng `exceljs` để xử lý file nặng với RAM tối thiểu.
*   **Batch Processing**: Chia nhỏ dữ liệu thành từng đợt (ví dụ 500 dòng/lần) để tối ưu hiệu năng ghi DB.
*   **Strategy Dispatcher**: Tự động sinh lệnh `bulkWrite` dựa trên chiến lược (Upsert, Insert Only, Update Only).
*   **Entity-Specific APIs**: Mỗi thực thể có endpoint riêng (ví dụ: `POST /api/v1/cakes/import`).

### 2. Các chiến lược Nhập liệu (Import Strategies)
Admin có thể chọn một trong các tùy chọn sau tại UI:
*   **UPSERT (Mặc định)**: Cập nhật nếu dữ liệu đã tồn tại (khớp mã định danh), nếu chưa có thì tạo mới.
*   **INSERT_ONLY**: Chỉ thêm mới những bản ghi chưa có. Bỏ qua (Skip) những bản ghi đã tồn tại.
*   **UPDATE_ONLY**: Chỉ cập nhật những bản ghi đã có sẵn trong hệ thống. Không tạo mới.

### 3. Giao diện Wizard 3 Bước (UI/UX Flow)
*   **Bước 1 - Cấu hình**: Chọn file, chọn chiến lược nhập liệu, tải file mẫu (Template).
*   **Bước 2 - Xử lý**: Hiển thị tiến trình (%) và các bộ đếm (Thành công, Bỏ qua, Thất bại) thời gian thực.
*   **Bước 3 - Kết quả**: Tổng kết kết quả và cung cấp file "Báo cáo lỗi chi tiết" nếu có dòng dữ liệu không hợp lệ.

### 4. Báo cáo lỗi thông minh (Smart Error Reporting)
*   **Preview lỗi**: Hiển thị ngay 10 lỗi đầu tiên tại màn hình kết quả (Bước 3) kèm theo lý do cụ thể.
*   **Excel Error Report**: Xuất file Excel chứa toàn bộ dữ liệu gốc bị lỗi, với cột **"LỖI CHI TIẾT"** được đẩy về cuối file (Cột K) để Admin tiện sửa và upload lại.

### 5. Quản lý Lịch sử Import (History Management)
*   Lưu vết mọi phiên import (Ai thực hiện, Chế độ gì, Thống kê dòng thành công/thất bại).
*   Drawer xem lịch sử có hỗ trợ tải lại file báo cáo lỗi của các phiên cũ.

---

## 📂 Tài liệu chi tiết
- [1. Technical Design](./1_technical_design.md)
- [2. UI/UX Specification](./2_ui_ux_wizard.md)
- [3. Error Handling Spec](./TECHNICAL_SPEC_ERROR_HANDLING.md)

---

## 📅 Trạng thái (Status)
*   **Giai đoạn**: Hoàn thiện tính năng (Phase 4)
*   **Mức độ ưu tiên**: Cao
*   **Trạng thái**: ✅ HOÀN THÀNH (DONE)
