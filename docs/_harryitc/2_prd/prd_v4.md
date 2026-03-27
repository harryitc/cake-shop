# PRD v4: Bulk Data Management System (Import/Export Excel)

## 1. Bối cảnh (Background)
Khi cửa hàng Cake Shop phát triển, số lượng sản phẩm (Cakes) và danh mục (Categories) tăng lên nhanh chóng. Việc nhập thủ công từng sản phẩm qua giao diện Admin trở nên tốn thời gian và dễ sai sót. 

## 2. Mục tiêu (Objectives)
- **Tự động hóa**: Cho phép Admin nhập hàng trăm sản phẩm chỉ trong vài giây qua file Excel.
- **Tính chính xác**: Hệ thống tự động kiểm tra tính hợp lệ của dữ liệu (giá, số lượng, danh mục) trước khi lưu.
- **Tính linh hoạt**: Cung cấp 3 chế độ (Ghi đè, Thêm mới, Cập nhật) để xử lý dữ liệu trùng lặp.

## 3. Đối tượng người dùng (User Personas)
- **Shop Admin**: Người quản lý kho hàng và cập nhật giá cả thường xuyên.

## 4. Đặc tả Tính năng (Functional Requirements)

### F1: Xuất dữ liệu (Export)
- Admin có thể xuất toàn bộ danh sách hiện tại ra file `.xlsx`.
- Hỗ trợ xuất dữ liệu dựa trên bộ lọc (Filter) đang áp dụng trên giao diện.

### F2: Nhập dữ liệu (Import)
- Hỗ trợ file Excel (.xlsx).
- **Import Wizard**: Quy trình 3 bước (Cấu hình -> Xử lý -> Kết quả).
- **Import Strategies**:
    - **Upsert**: Cập nhật nếu trùng mã/slug, tạo mới nếu chưa có.
    - **Insert Only**: Chỉ thêm mới, bỏ qua trùng.
    - **Update Only**: Chỉ cập nhật thông tin cũ.

### F3: Báo cáo & Nhật ký (Audit & Error Handling)
- **Error Report**: Nếu có dòng lỗi, hệ thống sinh ra file Excel chi tiết lỗi để Admin sửa nhanh.
- **History**: Lưu lại lịch sử ai đã import file gì, khi nào và kết quả ra sao.

## 5. Ràng buộc & Hiệu năng (Constraints & Performance)
- Xử lý được file có tối thiểu 10,000 dòng dữ liệu.
- Thời gian xử lý batch 500 dòng không quá 5 giây.
- Không gây nghẽn RAM của server (Sử dụng Stream).
