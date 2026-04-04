# Story 3: Order Service Factorization (Chia nhỏ Order)

## 1. Mục tiêu (Goals)
Bẻ gãy (Decompose) các hàm nghiệp vụ dài và phức tạp (Order Flow) thành các module logic nhỏ. Giúp code tại `order.service.js` trở nên sạch và dễ test cho từng stage.

---

## 🛠️ 2. Phương pháp Triển khai (Implementation Method)

### A. Refactor `createOrder` (Factorization)
**Hiện tại**: 1 hàm khổng lồ >150 dòng.
**Triển khai mới**: Chia làm các Stage chính để đọc flow như một câu chuyện.

```javascript
/* [V6-3.1] Phương pháp triển khai chi tiết */
async createOrder(data) {
  const session = await mongoose.startSession();
  try {
    // Stage 1: Validation (Kiểm tra kho, nạp dữ liệu Cake thô)
    const itemsWithFullPrice = await _validateStock(data.cartItems, session);
    
    // Stage 2: Promotions & Points (Tính giảm giá hoàn toàn bằng JS)
    const finalAmount = _calculateFinalPrices(itemsWithFullPrice, data.coupon, data.pointsToUse);
    
    // Stage 3: Save to Database (Mongoose create với session)
    return await _saveOrderToDB(data, finalAmount, session);
  } catch (error) { ... }
}
```

### B. Refactor `getAllOrders` (Standard Logic)
**Triển khai mới**: Sử dụng các query tiêu chuẩn (Standard Queries) được viết minh bạch thay cho Helpers.

```javascript
/* [V6-3.2] Phương pháp triển khai chi tiết */
async getAllOrders(filters) {
  // Viết query trực tiếp minh bạch và dễ hiểu tại Service
  const query = {
    user_id: filters.userId,
    status: filters.status
  };

  const results = await Order.find(query)
    .sort({ createdAt: -1 })
    .lean();
    
  return results;
}
```

---

## ✅ 3. Kết quả Cuối cùng (Final Result)
Hàm `createOrder` trở nên cực kỳ sạch (<20 dòng chính). Dễ dàng kiểm soát lỗi (debug) tại bất kỳ stage nào mà không phải đọc cả 150 dòng code.
