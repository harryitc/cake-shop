# Story 4: Review & Cake/Coupon Utility Cleanup (Dọn dẹp chung)

## 1. Mục tiêu (Goals)
Đồng bộ hóa toàn bộ Backend theo quy tắc Clean Code: Truy vấn Database đơn giản và Xử lý logic bằng JavaScript.

---

## 🛠️ 2. Phương pháp Triển khai (Implementation Method)

### A. Refactor `CakeService.getAll` (Lấy danh sách bánh)
**Giải pháp**: Sử dụng filter tường minh (Standard filter object) và lọc nâng cao bằng JS.

```javascript
/* [V6-4.1] Phương pháp triển khai chi tiết: getAll */
async getAll(filters) {
  // 1. Khởi tạo query object minh bạch
  const queryObj = { is_active: true };
  if (filters.category) queryObj.category_id = filters.category;
  if (filters.size) queryObj.size = filters.size;

  // 2. Query Databases với lean
  const cakes = await Cake.find(queryObj).sort({ createdAt: -1 }).lean();

  // 3. Xử lý Search bằng JS thay vì filter trong MongoDB
  if (filters.search) {
    const searchStr = filters.search.toLowerCase();
    return cakes.filter(c => c.name.toLowerCase().includes(searchStr));
  }

  return cakes;
}
```

### B. Refactor `CouponService.validateCoupon` (Kiểm tra mã giảm giá)
**Giải pháp**: Lấy Coupon thô và kiểm tra danh mục hợp lệ bằng JS `some`/`includes`.

```javascript
/* [V6-4.2] Phương pháp triển khai chi tiết: validateCoupon */
async validateCoupon(code, cartItems) {
  const coupon = await Coupon.findOne({ code, is_active: true }).lean();
  if (!coupon) throw new Error('Mã giảm giá hông tồn tại');

  // Kiểm tra danh mục hợp lệ (JS Processing)
  const validCatIds = coupon.valid_categories.map(c => c.toString());
  
  const isInvalid = cartItems.some(item => {
    return !validCatIds.includes(item.cake_id.category_id.toString());
  });
  
  if (isInvalid) throw new Error('Có sản phẩm không áp dụng được mã giảm giá này');
  return true;
}
```

### C. Refactor `recalculateCakeRating` (Tính lại điểm bánh)
**Giải pháp**: Lấy danh sách review APPROVED và tính trung bình cộng bằng JS.

```javascript
/* [V6-4.3] Phương pháp triển khai chi tiết: recalculateRating */
async recalculateCakeRating(cakeId) {
  const reviews = await Review.find({ cake_id: cakeId, is_approved: true }).select('rating').lean();
  
  if (reviews.length === 0) return 0;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Cake.findByIdAndUpdate(cakeId, { average_rating: avg, total_reviews: reviews.length });
  return avg;
}
```
---

## ✅ 3. Kết quả Cuối cùng (Final Result)
Dự án được dọn dẹp sạch sẽ các câu query phức tạp lồng nhau. Toàn bộ các tác vụ xử lý điều kiện được thực hiện thông qua mã nguồn JavaScript tường minh và dễ debug.
