# Story 3: Order & Checkout Restructuring (Complex)

## 📋 Mô tả
Đây là module phức tạp nhất vì liên quan đến nhiều logic nghiệp vụ lồng nhau (Kiểm kho, Tính điểm, Áp mã giảm giá).

## ⚙️ Chi tiết thực hiện

### 1. Tạo Validation (`validations/order.validation.js`)
- Schema: `createOrder`, `updateStatus`.

### 2. Sửa đổi Route (`routes/order.routes.js`)
- Import: `Order`, `Cake`, `User`, `Coupon`, `LoyaltyConfig` schemas.
- **Logic `POST /` (Create Order):**
    - Kiểm tra tồn kho từng món (`Cake.findById`).
    - Tính tổng tiền.
    - Áp dụng Coupon (nếu có).
    - Tính toán giảm giá bằng Loyalty Points.
    - Trừ kho (`$inc: { stock: -qty }`).
    - Lưu Order và Point History.
    - Sử dụng `mongoose.startSession()` cho Transaction.

## 🧪 Kết quả mong đợi
- Toàn bộ flow thanh toán mượt mà, đảm bảo tính nguyên tử (Atomic).
- Xóa `order.service.js` (hơn 400 dòng code).
