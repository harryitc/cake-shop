# Epic 12: Backend Restructuring — Route-Centric Architecture

> Mục tiêu: Tái cấu trúc toàn bộ hệ thống Backend `web-server` để loại bỏ tầng Controller và Service, đưa toàn bộ logic xử lý vào Route và tách biệt validation Joi vào folder mới.

---

## 🎯 Tổng quan (Overview)

Dự án Cake Shop sẽ chuyển đổi từ mô hình kiến trúc đa tầng (Controller-Service-Schema) sang mô hình kiến trúc phẳng (Route-Centric). Việc này giúp giảm số lượng file và tầng xử lý trung gian, giúp logic xử lý của một API nằm trọn vẹn trong route handler.

### Các thành phần chính của kiến trúc mới:
1.  **`routes/`**: Nơi chứa toàn bộ logic xử lý API (bao gồm logic Controller và Service cũ).
2.  **`validations/`**: Thư mục mới chứa các Joi Schema để kiểm tra dữ liệu đầu vào.
3.  **`schemas/`**: Giữ nguyên để định nghĩa Mongoose Schema (Data models).
4.  **`middlewares/`**: Giữ nguyên cho Auth, Role, Error Handling.

---

## 🛠️ Quy tắc Vàng (Golden Rules)

1.  **Direct Processing:** Không được tạo thêm Service hay Controller. Mọi logic tính toán, gọi DB, map dữ liệu phải nằm trực tiếp trong `router.method(...)`.
2.  **Explicit Validation:** Mọi route có nhận dữ liệu (`POST`, `PUT`) phải gọi đến validation tương ứng từ folder `validations/`.
3.  **Lean & Clean:** Tiếp tục duy trì các tiêu chuẩn đã đề ra trong PRD v7 (Clean Query) như sử dụng `.lean()`, Virtuals và Query Helpers.
4.  **Error Propagation:** Sử dụng `express-async-errors` để tự động ném lỗi (Direct Throw) mà không cần gọi `next(err)`.

---

## 📊 Lộ trình triển khai (Stories List)

| Story | Module | Trạng thái | Mô tả |
|-------|--------|------------|-------|
| 1 | **Category** | [/] IN PROGRESS | Pilot module: CRUD Category & Validation |
| 2 | **Auth** | [ ] TODO | Login/Register logic & JWT processing |
| 3 | **Cake** | [ ] TODO | Cake CRUD, Upload images, Slug logic |
| 4 | **Cart & Wishlist** | [ ] TODO | User items management |
| 5 | **Order** | [ ] TODO | Checkout logic (Stock, Coupons, Points) |
| 6 | **Coupon & Review** | [ ] TODO | Marketing & Feedback modules |
| 7 | **Loyalty** | [ ] TODO | Points calculation & Tiering logic |
| 8 | **Analytics & Import** | [ ] TODO | Aggregation processing & Excel Engine |
| 9 | **Upload** | [ ] TODO | File & Image processing logic |

---

## ✅ Định nghĩa hoàn thành (Definition of Done)
1.  Xóa hoàn toàn Controller và Service của module tương ứng.
2.  Tạo folder `validations/` và có đủ schema cho module.
3.  Tất cả API của module chạy đúng kết quả như cũ.
4.  Code sạch, dễ đọc, tuân thủ `Standard Response`.
