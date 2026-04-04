# Epic 11: Backend Refactor (Simple Query - JS Processing)

## 🎯 Tổng quan (Overview)
Đưa các tiêu chuẩn **Clean Code** vào việc tương tác với Database. Epic này tập trung vào việc biến các truy vấn Database khó hiểu thành mã JavaScript tường minh và dễ bảo trì.

---

## 🛠️ Danh sách các Method cần Refactor (Target Methods)

| Service | Method cần xử lý | Tình trạng | Giải pháp (Strategy) |
| :--- | :--- | :--- | :--- |
| **Loyalty Service** | `getLoyaltyStats`, `getCustomers` | [ ] PENDING | Chuyển sang JS Processing |
| **Analytics Service** | `getBestSellers`, `getCategoryDistribution`, `getRevenueTimeline` | [ ] PENDING | Loại bỏ Aggregation Pipeline |
| **Order Service** | `createOrder` (Factorization), `getAllOrders` (Apply Helpers) | [ ] PENDING | Bẻ nhỏ logic & dùng Query Helpers |
| **Review Service** | `recalculateCakeRating` | [ ] PENDING | Tính Rating bằng JS thay vì DB |
| **Cake Service** | `getAll` (Filtering logic) | [ ] PENDING | Gói gọn bộ lọc vào Query Helpers |
| **Coupon Service** | `validateCoupon` | [ ] PENDING | Tối ưu logic kiểm tra bằng JS |

---

## 📋 Danh sách Story (Stories List)

Dưới đây là các Story đại diện cho từng phần được sửa đổi:

1.  **Story 1 — Loyalty Service Transformation (Cải biến Loyalty)**
    - *Mô tả*: Thay thế Aggregations phức tạp bằng JS Array Methods.
    - *Chi tiết*: [`story_1_loyalty_service_refactor.md`](./story_1_loyalty_service_refactor.md)

2.  **Story 2 — Analytics Service Transformation (Cải biến Analytics)**
    - *Mô tả*: Loại bỏ các pipeline `$lookup` lồng nhiều tầng.
    - *Chi tiết*: [`story_2_analytics_service_refactor.md`](./story_2_analytics_service_refactor.md)

3.  **Story 3 — Order Service Factorization (Chia nhỏ Order)**
    - *Mô tả*: Chia nhỏ hàm `createOrder` khổng lồ thành các module logic.
    - *Chi tiết*: [`story_3_order_service_refactor.md`](./story_3_order_service_refactor.md)

4.  **Story 4 — Review & Cake/Coupon Utility Cleanup (Dọn dẹp chung)**
    - *Mô tả*: Refactor logic tính toán Rating, lọc Bánh (Cake) và kiểm tra Coupon (validateCoupon).
    - *Chi tiết*: [`story_4_review_cleanup_refactor.md`](./story_4_review_cleanup_refactor.md)

---

## ⚖️ Quy trình Triển khai (Execution Process)
- Thực hiện tuần tự từ các Service quan trọng: Loyalty $\to$ Analytics $\to$ Orders.
- Hoàn tất đợt refactor với các Service phụ trợ (Review, Coupon).
