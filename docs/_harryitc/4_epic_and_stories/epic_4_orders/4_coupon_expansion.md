# 🎫 Mở rộng tính năng Mã giảm giá (Coupon Expansion)

## 📋 Tổng quan
Nâng cấp hệ thống mã giảm giá hiện tại để hỗ trợ các điều kiện áp dụng phức tạp hơn, giúp tăng hiệu quả các chiến dịch marketing và kiểm soát chi phí giảm giá tốt hơn.

## 🚀 Các tính năng mới

### 1. Giới hạn sử dụng trên mỗi người dùng (Usage Limit per User)
- **Mô tả:** Mỗi khách hàng chỉ được sử dụng một mã cụ thể tối đa `n` lần.
- **Thay đổi Schema:** Thêm trường `usage_limit_per_user` (Number, default: 1).
- **Logic Kiểm tra:** Khi validate coupon, cần kiểm tra lịch sử đơn hàng của User xem đã dùng mã này bao nhiêu lần.

### 2. Áp dụng theo Danh mục sản phẩm (Category-specific)
- **Mô tả:** Mã giảm giá chỉ áp dụng khi giỏ hàng có chứa sản phẩm thuộc danh mục được chỉ định.
- **Thay đổi Schema:** Thêm trường `applicable_categories` (Array of ObjectId, reference `Category`).
- **Logic Kiểm tra:** 
    - Nếu danh sách này rỗng: Áp dụng cho toàn bộ giỏ hàng (hành vi cũ).
    - Nếu có danh sách: Chỉ tính toán giảm giá dựa trên tổng tiền của các sản phẩm thuộc danh mục đó.

### 3. Thông tin hiển thị (UI Metadata)
- **Mô tả:** Thêm mô tả chi tiết để hiển thị cho người dùng.
- **Thay đổi Schema:** Thêm trường `description` (String).

---

## 🛠️ Chi tiết kỹ thuật

### 1. Database Schema (`Coupon.schema.js`)
```javascript
{
  // ... existing fields
  usage_limit_per_user: {
    type: Number,
    default: 1, // Mặc định mỗi người dùng dùng 1 lần
    min: 1
  },
  applicable_categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: []
  }],
  description: {
    type: String,
    trim: true
  }
}
```

### 2. Logic Validation (`coupon.service.js`)
Hàm `validateCoupon` sẽ được nâng cấp để chấp nhận các tham số mới:
- `userId`: Để kiểm tra giới hạn sử dụng của người dùng cụ thể.
- `cartItems`: Để lọc các sản phẩm hợp lệ thuộc danh mục được cấu hình.

---

## ✅ Kế hoạch kiểm thử (Testing)
1. **Test Case 1:** Người dùng sử dụng mã vượt quá `usage_limit_per_user` -> Báo lỗi.
2. **Test Case 2:** Mã giảm giá cho danh mục "Bánh Kem", giỏ hàng chỉ có "Phụ kiện" -> Báo lỗi hoặc giảm giá = 0.
3. **Test Case 3:** Mã giảm giá cho danh mục "Bánh Kem", giỏ hàng có cả "Bánh Kem" và "Phụ kiện" -> Chỉ giảm giá trên phần tiền của "Bánh Kem".
