# Story 6: Coupon & Review Restructuring [✅ DONE]

## 📋 Mô tả
Quản lý mã giảm giá và hệ thống phản hồi của khách hàng trực tiếp tại Route.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Kiểm tra Coupon | `coupon.service.validateCoupon` | `router.post('/apply')` (trong `coupon.routes.js`) |
| CRUD Coupon | `coupon.controller.create/update` | `router.post('/')` |
| Đăng đánh giá | `review.service.createReview` | `router.post('/')` (trong `review.routes.js`) |
| Lấy đánh giá | `review.service.getReviewsByCake` | `router.get('/cake/:id')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation
- `validations/coupon.validation.js`: `createSchema`.
- `validations/review.validation.js`: `postReviewSchema`.

### Bước 2: Tái cấu trúc Route (`routes/coupon.routes.js`)
**Cấu trúc logic bên trong Route Handler (POST `/apply`):**
1.  **DB Fetch:** `Coupon.findOne({ code, is_active: true })`.
2.  **Date Check:** So sánh `expiry_date` với `Date.now()`.
3.  **Min Value Check:** Kiểm tra `total_price >= min_order_value`.
4.  **Usage Check:** `used_count < usage_limit`.

### Bước 3: Tái cấu trúc Route (`routes/review.routes.js`)
**Cấu trúc logic bên trong Route Handler (POST `/`):**
1.  **Order Check:** `Order.findOne({ user_id, status: 'DONE', "items.cake_id": cakeId })`. Nếu không có, quăng `ApiError.FORBIDDEN` (Chỉ cho phép đánh giá khi đã mua).
2.  **Save Review:** `await Review.save()`.
3.  **Update Cake Stats:**
    - Lấy toàn bộ Review của Cake này.
    - Tính `average_rating` bằng JS `.reduce()`.
    - `Cake.findByIdAndUpdate(cakeId, { average_rating, $inc: { review_count: 1 } })`.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Post Review):**
```javascript
router.post('/', authenticate, async (req, res) => {
  const { cake_id, rating, comment } = req.body;
  // ... Logic kiểm tra đã mua hàng ...
  const review = new Review({ user: req.user.id, cake: cake_id, rating, comment });
  await review.save();
  
  // Tái tính toán rating trung bình bằng JS (PRD v7)
  const allReviews = await Review.find({ cake: cake_id }).lean();
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await Cake.findByIdAndUpdate(cake_id, { average_rating: avg, review_count: allReviews.length });
  
  return sendSuccess(res, review, 'Đánh giá thành công');
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/coupon.controller.js`
- `web-server/services/coupon.service.js`
- `web-server/controllers/review.controller.js`
- `web-server/services/review.service.js`
