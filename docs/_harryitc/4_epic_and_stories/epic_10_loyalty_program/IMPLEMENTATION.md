# Implementation Plan: Loyalty Program

## 1. Database & Security
### 1.1 Schema Updates
- [x] **`User` (web-server/schemas/User.schema.js):**
    - `loyalty_points`: { type: Number, default: 0 }
    - `total_spent`: { type: Number, default: 0 }
    - `rank`: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'], default: 'BRONZE' }
    - `birthday`: { type: Date }
- [x] **`PointHistory` (New Schema):**
    - `user_id`: ObjectId (Ref `User`)
    - `order_id`: ObjectId (Ref `Order`, Optional)
    - `points_change`: Number
    - `type`: Enum ['PLUS', 'MINUS']
    - `reason`: String
    - `created_at`: Date
- [x] **`Order` (web-server/schemas/Order.schema.js):**
    - `points_used`: Number
    - `points_discount_amount`: Number
- [x] **`LoyaltyConfig` (New Schema):** Cấu hình động các ngưỡng và tỷ lệ.

## 2. Backend Logic (Services)
- [x] **`Loyalty.service.js`:**
    - `processOrderCompletion(orderId)`: Hàm chính điều phối việc cộng tiền, cộng điểm và thăng hạng.
    - `calculatePoints(amount, rank)`: Logic tính điểm dựa trên bảng quy định.
    - `checkTierUpgrade(userId)`: So sánh `total_spent` với các ngưỡng thăng hạng.
    - `addPoints(userId, points, reason, orderId)`: Ghi nhận giao dịch cộng/trừ điểm.
    - `getConfig/updateConfig`: Quản lý cấu hình động.
- [x] **`Order.service.js` Integration:**
    - Trigger `LoyaltyService` on order status change.
    - Support `pointsToUse` in `createOrder`.
- [x] **Loyalty Controller & Routes:**
    - APIs for Admin: `customers`, `history`, `adjust-points`, `config`.
    - APIs for User: `me`.

## 3. Frontend Integration (Admin) - Customer 360 View
- [x] **Customer Table (Optimized):** 
    - Columns: Customer (Avatar/Info), Phone, Membership (Rank/Points), Transactions (Spent/Order Count), Action.
    - Width and layout adjustments for professional CRM look.
    - Integrated tooltips for business logic explanation.
- [x] **Customer Detail Modal (Fullscreen 360 View):**
    - **Sidebar**: Complete user profile & contact info.
    - **Overview Tab**: Core stats (Total Spent, Points, Order Count) + Progress Bar to next rank.
    - **Orders Tab**: Detailed purchase history with mini-stats for Success, Processing, and Rejected orders (including both count and amount).
    - **Points Tab**: Chronological timeline of point changes.
    - **Loyalty Tab**: Rank management & lock status.
    - **Actions Tab**: Admin controls for manual point adjustments and rank overrides.
- [x] **Loyalty Stats Dashboard:** Global summary cards with UX tooltips and icons.
- [x] **Loyalty Settings Page:** Dynamic configuration for business rules (Thresholds, Ratios).

## 4. Backend Enhancements
- [x] **High-Performance Aggregation:** Combined user and order data for fast listing and statistics.
- [x] **Technical Integrity:** Atomic updates ($inc), Transaction support (session), and consistent data mapping (camelCase).
- [x] **Sync Script:** `web-server/scripts/sync-loyalty-data.js` for migrating existing data.

## 5. Frontend Integration (User)
- [x] **Profile Page:** Thêm tab "Cake Rewards" hiển thị Rank Badge, Progress Bar và điểm hiện tại.
- [x] **Checkout Page:** 
    - [x] Input nhập số điểm muốn dùng.
    - [x] Validation thời gian thực (Check số dư điểm, check giới hạn 20% đơn hàng).
    - [x] Hiển thị số tiền được giảm tương ứng.

## 6. Deployment & Migration Strategy
- [x] Chạy script cập nhật `total_spent` cho các user đã có đơn hàng `DONE` trước đó để đồng bộ hạng thành viên ban đầu.
