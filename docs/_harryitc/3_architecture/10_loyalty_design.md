# Loyalty Architecture Design (Cake Rewards)

## 1. Overview
Hệ thống Loyalty là một bộ máy phức tạp kết nối giữa Đơn hàng (Orders), Người dùng (Users) và Cấu hình (Config). Nó yêu cầu tính toàn vẹn dữ liệu cao và hiệu năng xử lý tốt để không làm gián đoạn quy trình thanh toán.

## 2. Các thực thể chính (Entities)

### 2.1 User
Lưu trữ trạng thái hiện tại của người dùng:
- `loyalty_points`: Điểm tích lũy hiện có.
- `total_spent`: Tổng số tiền đã chi tiêu (Chỉ tính đơn hàng `DONE`).
- `rank`: Hạng thành viên hiện tại (`BRONZE`, `SILVER`, `GOLD`, `DIAMOND`).
- `rank_lock`: Cờ khóa hạng (Ngăn hệ thống tự động thay đổi khi Admin đã gán tay).

### 2.2 PointHistory
Nhật ký chi tiết các giao dịch điểm:
- `user`: Tham chiếu tới User.
- `points_change`: Số điểm thay đổi (luôn lưu giá trị dương).
- `type`: `PLUS` (Cộng) hoặc `MINUS` (Trừ).
- `reason`: Lý do thay đổi.
- `order`: Tham chiếu tới đơn hàng liên quan (nếu có).
- `admin`: Tham chiếu tới Admin thực hiện (nếu là điều chỉnh thủ công).

### 2.3 LoyaltyConfig
Cấu hình động cho toàn bộ hệ thống (để Admin có thể chỉnh mà không cần sửa code):
- `tier_thresholds`: Ngưỡng chi tiêu cho từng hạng.
- `point_ratios`: Tỷ lệ tích điểm cho từng hạng.
- `point_to_vnd_ratio`: Tỷ lệ quy đổi điểm sang tiền.
- `max_point_discount_percentage`: % giảm giá tối đa từ điểm.

## 3. Quy trình Xử lý (Workflows)

### 3.1 Luồng Tích điểm & Thăng hạng
1. **Order Status Changed to DONE**:
    - `OrderService.updateStatus` -> `LoyaltyService.processOrderCompletion`.
2. **LoyaltyService.processOrderCompletion**:
    - Lấy cấu hình từ `LoyaltyConfig`.
    - Cộng `final_price` vào `User.total_spent`.
    - Tính số điểm thưởng dựa trên `User.rank` hiện tại.
    - Gọi `LoyaltyService.addPoints` để cập nhật số dư và tạo lịch sử.
3. **Thăng hạng**:
    - So sánh `User.total_spent` mới với `tier_thresholds`.
    - Nếu đủ điều kiện, cập nhật `User.rank`.

### 3.2 Luồng Dùng điểm khi Thanh toán (Redemption)
1. **Checkout Modal**: Người dùng chọn "Dùng điểm".
2. **Order Creation**:
    - Kiểm tra số dư điểm của người dùng.
    - Tính toán số điểm tối đa có thể dùng (Dựa trên `max_point_discount_percentage`).
    - Trừ điểm ngay lập tức (`MINUS`) trong cùng một Transaction khi tạo đơn hàng.
3. **Refund**: Nếu đơn hàng bị `REJECTED`, hệ thống gọi `LoyaltyService.refundPoints` để hoàn lại số điểm đã dùng cho người dùng (`PLUS`).

## 4. Tối ưu hóa Kỹ thuật (Technical Optimization)

- **Atomic Updates**: Sử dụng lệnh `$inc` của MongoDB để cập nhật điểm và chi tiêu. Điều này đảm bảo tính đúng đắn ngay cả khi có nhiều request đồng thời (Race condition).
- **Mongoose Sessions (Transactions)**: Sử dụng Transaction trong quy trình Tạo đơn hàng và Cập nhật trạng thái để đảm bảo nếu một bước thất bại, toàn bộ quá trình sẽ được Rollback (ví dụ: Tạo đơn thành công nhưng trừ điểm lỗi thì đơn cũng không được tạo).
- **Aggregation Pipeline**: Sử dụng Aggregation cho tính năng "Customer 360" và "Loyalty Dashboard" để gộp dữ liệu từ nhiều Collection (User, Order, PointHistory) một cách nhanh chóng.
- **Caching**: Caching cấu hình `LoyaltyConfig` trong bộ nhớ ứng dụng để giảm thiểu truy vấn Database dư thừa.
