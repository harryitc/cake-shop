# Story 2: Analytics Service Transformation (Cải biến Analytics)

## 1. Mục tiêu (Goals)
Loại bỏ hoàn toàn các Aggregation Pipeline phức tạp lồng nhiều tầng. Chuyển sang mô hình: Lấy dữ liệu rời và Xử lý mảng (Transform) bằng JavaScript tại Service.

---

## 🛠️ 2. Phương pháp Triển khai (Implementation Method)

### A. Refactor `getBestSellers` (Top 5 bánh bán chạy)
**Giải pháp**: Dùng `Order.find({ status: 'DONE' }).select('items').lean()` kết hợp JS Map.

```javascript
/* [V6-2.1] Phương pháp triển khai chi tiết */
async getBestSellers() {
  const orders = await Order.find({ status: 'DONE' }).select('items').lean();

  const salesMap = new Map();
  orders.forEach(order => {
    order.items.forEach(item => {
      const idStr = item.cake_id.toString();
      const current = salesMap.get(idStr) || 0;
      salesMap.set(idStr, current + item.quantity);
    });
  });

  const topIds = [...salesMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const cakes = await Cake.find({ _id: { $in: topIds.map(t => t[0]) } }).lean();
  
  return cakes.map(cake => ({
    ...cake,
    soldQuantity: salesMap.get(cake._id.toString())
  }));
}
```

### B. Refactor `getRevenueTimeline` (Biểu đồ doanh thu)
**Giải pháp**: Nhóm đơn hàng theo ngày bằng JS Object Key thay vì `$group` trong DB.

```javascript
/* [V6-2.2] Phương pháp triển khai chi tiết */
async getRevenueTimeline() {
  const last30DaysOrders = await Order.find({ 
    status: 'DONE', 
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
  }).lean();

  const timelineMap = {};
  last30DaysOrders.forEach(order => {
    const dayKey = order.createdAt.toISOString().split('T')[0];
    timelineMap[dayKey] = (timelineMap[dayKey] || 0) + (order.total_price || 0);
  });

  return Object.keys(timelineMap).sort().map(day => ({
    date: day,
    revenue: timelineMap[day]
  }));
}
```
---

## ✅ 3. Kết quả Cuối cùng (Final Result)
Dữ liệu trả về đầy đủ như cũ. Code minh bạch, tất cả logic transform dữ liệu phục vụ biểu đồ đều nằm tại tầng JavaScript của Service.
