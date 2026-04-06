# Story 5: Order & Checkout Restructuring [✅ DONE]

## 📋 Mô tả
Chuyển đổi logic thanh toán (Checkout) cực kỳ quan trọng vào Route handler. Sử dụng Transaction để đảm bảo tính nhất quán dữ liệu.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Tạo đơn hàng | `order.service.createOrder` | `router.post('/')` |
| Lấy đơn hàng | `order.service.getOrders` | `router.get('/')` |
| Cập nhật trạng thái | `order.service.updateStatus` | `router.put('/:id/status')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/order.validation.js`)
- Schema: `createOrder`, `updateStatus`.

### Bước 2: Tái cấu trúc Route (`routes/order.routes.js`)
**Cấu trúc logic bên trong Route Handler (POST `/`):**
1.  **Validation:** `validation.createOrder.validate(req.body)`.
2.  **Transaction:** Khởi tạo `session = await mongoose.startSession()`.
3.  **Stock Check:** `Cake.find({ _id: { $in: cakeIds } })`. Duyệt mảng bằng JS để kiểm tra tồn kho.
4.  **Pricing & Promo:**
    - Tính tổng tiền bằng JS `.reduce()`.
    - Gọi logic Coupon (Kiểm tra hạn dùng, điều kiện tối thiểu).
    - Tính giảm giá từ Loyalty Points dựa trên `LoyaltyConfig.findOne()`.
5.  **Database Updates:**
    - `Order.save({ session })`.
    - `Cake.updateMany({ _id: item.cake_id }, { $inc: { stock: -item.qty } }, { session })`.
    - `PointHistory.save({ session })` nếu có dùng điểm.
6.  **Commit:** `await session.commitTransaction()`.

### Bước 3: Logic đặc biệt (Business Logic)
- **Refund Points:** Khi Admin chuyển đơn sang `REJECTED`, logic hoàn trả điểm sẽ thực hiện trực tiếp trong handler cập nhật trạng thái.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Create Order):**
```javascript
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, coupon_code, points_to_use } = req.body;
    // ... Logic kiểm kho bằng JS loop ...
    // ... Logic tính tiền bằng JS reduce ...
    const order = new Order({ ...data });
    await order.save({ session });
    await session.commitTransaction();
    return sendSuccess(res, order, 'Đặt hàng thành công', 201);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/order.controller.js`
- `web-server/services/order.service.js`
