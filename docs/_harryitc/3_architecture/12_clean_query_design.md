# ⚙️ KIẾN TRÚC THIẾT KẾ: CLEAN QUERY & JS PROCESSING

> Tài liệu mô tả cách tinh chỉnh và làm sạch các câu truy vấn Mongoose hiện có.

---

## 1. 🏗️ Mô hình Kiến trúc: Simple Fetch - Clean Logic

Thay vì để MongoDB xử lý tất cả Logic qua Aggregation, dự án sẽ áp dụng mô hình 2 tầng sau (cho các tập dữ liệu nhỏ và vừa):

###  tầng 1: Simple Database Fetching
- Chuyển các câu lệnh phức tạp thành **Mongoose Query Helpers**.
- Sử dụng `.lean()` triệt để cho các yêu cầu Read-Ony để tăng hiệu năng xử lý mảng của Node.js.

### Tầng 2: JavaScript Logic Processing
- Sử dụng các hàm JS như `.map()`, `.filter()`, `.reduce()` ngay tại Service để xử lý mảng kết quả thô nhầm trả về cấu trúc mong muốn.
- Ưu điểm: Tuyệt đối dễ đọc, dễ dùng `console.log()` hay `debugger` để kiểm tra từng dòng code.

---

## 2. 🧩 Các Tính năng Mongoose Đặc thù (Dùng để rút gọn code)

### A. Mongoose Virtuals (Trường ảo)
- Giúp tự động tính toán dữ liệu mà không cần gọi hàm trong Service.
- Ví dụ: `order.totalItems` sẽ tự động trả về `items.length`.

### B. Mongoose Query Helpers
- Giúp gọi câu lệnh query như một ngôn ngữ tự nhiên.
- Thay vì: `Order.find({ user_id: id, status: 'DONE' })`
- Sẽ thành: `Order.find().byUser(id).completed()`

---

## 3. 🛠️ Quy trình Triển khai (Lifecycle)

1.  **Request API** được Controller nhận.
2.  Controller gọi hàm tại **Service**.
3.  Service sử dụng **Query Helper** để lấy dữ liệu thô.
4.  Service sử dụng **JavaScript Array Methods** để transform dữ liệu.
5.  Kết quả được trả về dưới dạng JSON sạch cho Frontend.

---

## 4. 🗄️ Database Design (Phụ lục)

| Thực thể (Entity) | Cần thêm Virtuals? | Cần thêm Helpers? |
|-------------------|--------------------|-------------------|
| Order             | Có (FinalPrice, ItemsCount) | Có (byUser, byStatus) |
| User              | Có (NextTierProgress) | Có (topSpenders) |
| Cake              | Có (ReviewStats) | Có (active, sorted) |
