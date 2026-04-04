# Hướng dẫn Triển khai: Backend Refactor (Clean Query - JS Processing)

Tài liệu này đặc tả chi tiết cách thức thực hiện (implementation) cho từng đầu việc được nêu trong Epic 11.

---

## 🏗️ 1. Nâng cấp Mongoose Schema (Phase 1)

Mục tiêu: Đưa các logic tự động hóa vào Schema để rút gọn code tại Service.

### 1.1: Order.schema.js
Thêm Virtuals để tự tính tổng số lượng món và Query Helpers để lọc nhanh.

```javascript
// Thêm vào Order.schema.js
orderSchema.virtual('items_count').get(function() {
  return this.items.length;
});

orderSchema.query.byUser = function(userId) {
  return this.where({ user_id: userId });
};

orderSchema.query.sortNewest = function() {
  return this.sort({ createdAt: -1 });
};
```

---

## 💎 2. Refactor Loyalty Service (Phase 2)

Mục tiêu: Thay thế Aggregation khó đọc bằng JavaScript thuần.

### 2.1: getLoyaltyStats (Thống kê Loyalty)

**Hiện tại (Aggregation):** Quá nhiều `$group`, `$sum`, `$cond`.
**Triển khai mới (JS Processing):**

```javascript
async getLoyaltyStats() {
  // Lấy dữ liệu thô (Simple Query)
  const users = await User.find({ role: 'user' }).lean();

  // Xử lý bằng JS Array Methods
  return users.reduce((acc, u) => {
    acc.totalPointsIssued += (u.loyalty_points || 0);
    acc.totalUsers++;
    
    const rank = u.rank || 'BRONZE';
    acc.ranks[rank] = (acc.ranks[rank] || 0) + 1;
    
    if (rank === 'GOLD' || rank === 'DIAMOND') acc.vipCount++;
    return acc;
  }, { 
    totalPointsIssued: 0, 
    totalUsers: 0, 
    ranks: { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 }, 
    vipCount: 0 
  });
}
```

---

## 📊 3. Refactor Analytics Service (Phase 2)

Mục tiêu: Loại bỏ `$lookup` và `$unwind` phức tạp.

### 3.1: getBestSellers (Top 5 Bán chạy)

**Triển khai mới (Hybrid Fetching):**

```javascript
async getBestSellers() {
  // 1. Lấy tất cả đơn hàng thành công trong 30 ngày qua
  const orders = await Order.find({ status: 'DONE' }).select('items').lean();

  // 2. Gom nhóm số lượng bán bằng JS Map
  const salesMap = new Map();
  orders.forEach(order => {
    order.items.forEach(item => {
      const current = salesMap.get(item.cake_id.toString()) || 0;
      salesMap.set(item.cake_id.toString(), current + item.quantity);
    });
  });

  // 3. Sắp xếp và lấy Top 5
  const topIds = [...salesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 4. Lấy thông tin bánh (Simple Query)
  const cakes = await Cake.find({ _id: { $in: topIds.map(t => t[0]) } }).lean();
  
  // 5. Trộn dữ liệu (Merge Data)
  return cakes.map(cake => ({
    ...cake,
    soldQuantity: salesMap.get(cake._id.toString())
  }));
}
```

---

## 🛒 4. Refactor Order Service (Phase 2)

Mục tiêu: Chia nhỏ hàm `createOrder` khổng lồ thành các hàm chuyên biệt.

### 4.1: Tách hàm Helper

```javascript
// Tách logic kiểm kho
const _validateStock = async (cartItems, session) => {
  for (const item of cartItems) {
    // Logic check tồn kho ở đây
  }
};

// Tách logic khuyến mãi
const _applyPromotions = async (total, couponCode, pointsToUse, user) => {
  // Logic tính giảm giá ở đây
};

// Hàm chính (Main function) trở nên cực kỳ sạch sẽ
const createOrder = async (data) => {
  const session = await mongoose.startSession();
  await _validateStock(cartItems, session);
  const discountData = await _applyPromotions(...);
  const order = await _persistOrder(...);
};
```

---

## ✅ 5. Quy tắc Vàng khi Triển khai

1.  **Luôn dùng `.lean()`**: Khi chỉ đọc dữ liệu thống kê, bắt buộc dùng `.lean()` để Node.js xử lý object nhanh hơn.
2.  **No more $lookup**: Nếu dữ liệu liên quan ở collection khác, ưu tiên dùng 2 lần query `.find()` đơn giản và map dữ liệu bằng JS thay vì `$lookup` trong DB.
3.  **Tách logic tính toán**: Các phép tính cộng (sum), nhân (multiply) thực hiện hoàn toàn trong JS.
