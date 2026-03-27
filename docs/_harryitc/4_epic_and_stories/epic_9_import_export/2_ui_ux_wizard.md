# UI/UX Specification: Import Wizard Modal

## 1. Flow quy trình (3-Step Wizard)

### Bước 1: Thiết lập & Upload (Configuration)
- **Strategy Selector**: `Radio.Group` cho phép chọn 1 trong 3 chế độ (Upsert, Insert Only, Update Only).
- **Upload Dragger**: AntD `Upload.Dragger` hỗ trợ kéo thả file `.xlsx`.
- **Template Downloader**: Nút "Tải file Excel mẫu" đặt dưới vùng upload.

### Bước 2: Tiến trình xử lý (Live Progress)
- **Progress Bar**: Hiển thị phần trăm (%) hoàn thành.
- **Live Counters**: Thẻ `Statistic` hiển thị số lượng Thành công, Bỏ qua, Thất bại thời gian thực.
- **Mini-Log**: Cửa sổ nhỏ hiển thị dòng trạng thái: *"Đang xử lý dòng 500/1200..."*.

### Bước 3: Kết quả & Báo cáo lỗi (Completion)
- **Result Summary**: Hiển thị tổng kết cuối cùng.
- **Error Download**: Nút "Tải báo cáo lỗi chi tiết" (màu đỏ) nếu `failedCount > 0`.
  - File báo cáo chứa dữ liệu gốc + Cột "Lý do lỗi" ở cuối.

## 2. Các trang tích hợp
- **Trang Quản lý Bánh**: Nút [Import] bên cạnh nút [Thêm bánh].
- **Trang Danh mục**: Nút [Import] bên cạnh nút [Thêm danh mục].
- **Trang Lịch sử Import**: Một menu mới trong Admin để xem lại `ImportHistory`.

## 3. Xử lý Trạng thái (Edge Cases)
- **File sai định dạng**: Thông báo Alert đỏ báo lỗi ngay lập tức.
- **Mất mạng**: Nút `Retry` cho phép tiếp tục phiên import hiện tại.
