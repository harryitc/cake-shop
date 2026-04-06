# Story 7: Loyalty Engine Restructuring [✅ DONE]

## 📋 Mô tả
Chuyển đổi công cụ tính điểm và phân hạng thành viên (Loyalty Engine) vào Route. Thay thế hoàn toàn Aggregation bằng JS Processing.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Lấy thống kê Loyalty | `loyalty.service.getLoyaltyStats` | `router.get('/stats')` |
| Tính hạng | `loyalty.service.recalculateRank` | `router.post('/recalculate-rank')` |
| Lấy Dashboard User | `loyalty.service.getUserLoyaltyInfo` | `router.get('/my-status')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/loyalty.validation.js`)
- Schema: `updateConfigSchema`, `manualAdjustmentSchema`.

### Bước 2: Tái cấu trúc Route (`routes/loyalty.routes.js`)
**Cấu trúc logic bên trong Route Handler (GET `/stats`):**
1.  **Fetch Raw Data:** `User.find({ role: 'user' }).lean()`.
2.  **JS Reduction:** Duyệt mảng `users` bằng `.reduce()` để đếm số lượng từng hạng (`ranks`), tính tổng điểm (`totalPoints`), đếm số VIP.
3.  **Return:** Trả về object thống kê cuối cùng.

**Cấu trúc logic bên trong Route Handler (GET `/my-status`):**
1.  **Fetch User:** `User.findById(req.user.id).lean()`.
2.  **Fetch Config:** `LoyaltyConfig.findOne().lean()`.
3.  **JS Logic:** Tính khoảng cách đến hạng tiếp theo (Progress %) bằng công thức JS: `(total_spent / next_threshold) * 100`.

### Bước 3: Logic đặc biệt (Business Logic)
- **Atomic updates:** Sử dụng `$inc` khi cộng/trừ điểm để tránh mất dữ liệu khi nhiều đơn hàng xong cùng lúc.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Loyalty Stats):**
```javascript
router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  const users = await User.find({ role: 'user' }).lean();
  const stats = users.reduce((acc, u) => {
    const rank = u.rank || 'BRONZE';
    acc.ranks[rank] = (acc.ranks[rank] || 0) + 1;
    acc.totalPointsIssued += (u.loyalty_points || 0);
    return acc;
  }, { totalPointsIssued: 0, ranks: { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 } });
  
  return sendSuccess(res, stats);
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/loyalty.controller.js`
- `web-server/services/loyalty.service.js`
