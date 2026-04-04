# Story 1: Loyalty Service Transformation (Cải biến Loyalty)

## 1. Mục tiêu (Goals)
Chuyển đổi các logic thống kê nặng nề từ Database sang JavaScript tại Service để dễ dàng bảo trì và minh bạch hóa các bước tính toán.

---

## 🛠️ 2. Phương pháp Triển khai (Implementation Method)

### A. Refactor `getLoyaltyStats` (Thống kê Loyalty)
**Giải pháp**: Dùng `User.find({ role: 'user' }).lean()` kết hợp `.reduce()`.

```javascript
/* [V6-1.1] Phương pháp triển khai chi tiết */
async getLoyaltyStats() {
  // 1. Lấy dữ liệu thô (Simple Query)
  const users = await User.find({ role: 'user' }).lean();

  // 2. Xử lý logic hoàn toàn bằng JavaScript
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

### B. Refactor `getCustomers` (View 360 độ Khách hàng)
**Giải pháp**: Lấy User và Order riêng rẽ bằng query `.find()`, sau đó trộn (Merge) bằng JS Map.

```javascript
/* [V6-1.2] Phương pháp triển khai chi tiết */
async getCustomers() {
  const users = await User.find({ role: 'user' }).lean();
  const orders = await Order.find({ user_id: { $in: users.map(u => u._id) } }).lean();

  // Gom nhóm đơn hàng bằng JS Map
  const ordersByUserId = new Map();
  orders.forEach(order => {
    const list = ordersByUserId.get(order.user_id.toString()) || [];
    list.push(order);
    ordersByUserId.set(order.user_id.toString(), list);
  });

  // Merge dữ liệu tại Service
  return users.map(user => {
    const uOrders = ordersByUserId.get(user._id.toString()) || [];
    return {
      ...user,
      orderCount: uOrders.length,
      totalSpent: uOrders.filter(o => o.status === 'DONE').reduce((sum, o) => sum + o.total_price, 0)
    };
  });
}
```
