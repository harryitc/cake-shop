# Kế hoạch triển khai: Quản lý tồn kho cơ bản (Basic Inventory Management)

## 1. Quản lý Tồn kho là gì? (What is it?)
**Quản lý tồn kho (Inventory Management)** trong ngữ cảnh một cửa hàng bánh (Cake Shop) là việc kiểm soát xem mỗi loại bánh hiện tại còn bao nhiêu chiếc có thể bán.
- **Tại sao cần thiết?** Để tránh tình trạng khách hàng đặt mua nhưng thực tế tiệm đã hết bánh (bán vượt quá số lượng cho phép - overselling).
- **Quy trình hoạt động:** 
  1. Khi Admin tạo bánh mới, sẽ điền thêm số lượng `stock` (tồn kho ban đầu).
  2. Khách hàng chỉ có thể mua tối đa số lượng `stock` còn lại. Bánh nào `stock = 0` sẽ hiện "Hết hàng".
  3. Khi khách đặt hàng thành công (Trạng thái đơn: `PENDING`), hệ thống lập tức trừ đi lượng `stock` tương ứng của các bánh trong đơn hàng.
  4. Nếu vì lý do nào đó đơn hàng bị hủy (`REJECTED`), hệ thống sẽ tự động hoàn trả lại (cộng lại) số lượng `stock` để bán tiếp.

---

## 2. Kế hoạch triển khai (Implementation Plan)

### Phase 1: Database & Backend Logic
**1. Cập nhật Schema Bánh (`web-server/schemas/Cake.schema.js`)**
- Bổ sung field `stock`:
  ```js
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
  ```

**2. Cập nhật API Quản lý Bánh (`web-server/controllers/cake.controller.js`)**
- Cập nhật Joi schema validation của các API `create` và `update` để cho phép truyền lên trường `stock`.

**3. Xử lý Trừ Tồn Kho khi Đặt Hàng (`web-server/services/order.service.js`)**
- Tại hàm `createOrder`:
  - Trước khi tạo đơn, cần check: `if (cake.stock < item.quantity)` -> Throw lỗi "Bánh X không đủ số lượng".
  - Sử dụng chung Transaction hiện có, update lại số lượng tồn kho của bánh: `await Cake.findByIdAndUpdate(item.cake_id, { $inc: { stock: -item.quantity } }, { session })`.

**4. Xử lý Hoàn Tồn Kho khi Hủy Đơn (`web-server/services/order.service.js`)**
- Tại hàm `updateStatus`:
  - Nếu `newStatus === 'REJECTED'` và trạng thái cũ là `PENDING` hoặc `CONFIRMED`:
    - Loop qua các item trong đơn hàng, cộng lại `stock` cho bánh: `await Cake.findByIdAndUpdate(item.cake_id, { $inc: { stock: item.quantity } })`.

---

### Phase 2: Frontend
**1. Admin Panel (`web-client/admin/.../cakes`)**
- Form tạo / sửa bánh: Thêm field input `Stock` (Số lượng).
- Bảng danh sách bánh: Thêm cột hiển thị số lượng tồn kho hiện tại.

**2. User Storefront (`web-client/user/.../cakes` & `cart`)**
- Chi tiết bánh / Danh sách bánh: Nếu `stock === 0`, disable nút "Thêm vào giỏ" và hiển thị badge "Hết hàng".
- Giỏ hàng: Nút Tăng/Giảm số lượng bị chặn giới hạn tối đa (max) bằng đúng số `stock` còn lại của bánh đó. (Phòng trường hợp khách cố tình nhập tay số lượng lớn hơn kho).
