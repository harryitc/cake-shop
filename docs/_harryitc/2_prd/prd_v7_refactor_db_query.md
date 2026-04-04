# PRD v7: Clean Code Standards for Database Interactions

## 1. Mục tiêu (Goals)
Xây dựng một bộ tiêu chuẩn code đồng nhất cho việc tương tác với Database (MongoDB/Mongoose), nhằm thay thế các truy vấn phức tạp bằng mã nguồn JavaScript tường minh và dễ bảo trì.

## 2. Các Tiêu chuẩn Vàng (The Golden Standards)

### S1: Simple Fetching (Truy vấn đơn giản)
- Ưu tiên dùng các lệnh `.find()`, `.findOne()`, `.findById()`.
- Hạn chế tối đa các pipeline Aggregation lồng nhau (không quá 2 tầng).
- Nếu dữ liệu ở collection khác, ưu tiên dùng `.populate()` hoặc query rời và map dữ liệu bằng JS thay vì `$lookup`.

### S2: JS Logic First (Xử lý bằng JavaScript)
- Các logic tính toán (tổng tiền, đếm số lượng, nhóm danh mục) phải được xử lý bằng các hàm mảng của JS (`map`, `filter`, `reduce`).
- Mã nguồn phải có khả năng `console.log()` rõ ràng tại từng bước biến đổi dữ liệu.

### S3: Schema Encapsulation (Đóng gói tại Schema)
- Mọi logic hiển thị hoặc biến đổi dữ liệu cơ bản từ các trường có sẵn phải được đặt trong **Mongoose Virtuals**.
- Mọi logic lọc dữ liệu (query) phổ biến phải được đóng gói trong **Query Helpers**.

### S4: Lean by Default (Luôn dùng Lean)
- Bắt buộc dùng `.lean()` cho tất cả các truy vấn Read-Only để giảm chi phí bộ nhớ của Mongoose Document.

## 3. Định nghĩa Kết quả cuối cùng (Definition of Done)
- Mã nguồn tại Service không còn xuất hiện các "Bức tường code" Aggregation.
- Flow dữ liệu tại Service mạch lạc, đọc lên như một câu chuyện logic.
- Hiệu năng được đảm bảo và dễ dàng viết Unit Test.
