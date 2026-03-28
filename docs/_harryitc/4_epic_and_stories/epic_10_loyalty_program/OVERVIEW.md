# EPIC 10: LOYALTY PROGRAM (CAKE SHOP REWARDS)

## 1. Overview
Hệ thống thành viên giúp gắn kết khách hàng thông qua tích điểm và phân hạng dựa trên mức chi tiêu. Đây là giải pháp CRM (Customer Relationship Management) tinh gọn để tăng tỷ lệ giữ chân khách hàng (Retention).

## 2. User Stories
### 2.1 Đối với Khách hàng (User)
* **US-1:** Tôi muốn tích điểm sau mỗi lần mua hàng thành công để sử dụng cho các đơn hàng sau.
* **US-2:** Tôi muốn thăng hạng thành viên (Bạc, Vàng, Kim cương) để nhận được nhiều ưu đãi hơn.
* **US-3:** Tôi muốn xem lịch sử điểm và hạng hiện tại của mình trong trang cá nhân.
* **US-4:** Tôi muốn dùng điểm tích lũy để trừ trực tiếp vào tổng tiền khi thanh toán.

### 2.2 Đối với Quản trị viên (Admin)
* **US-5:** Tôi muốn xem danh sách khách hàng kèm theo hạng và tổng chi tiêu của họ.
* **US-6:** Tôi muốn lọc khách hàng theo hạng (ví dụ: chỉ xem khách VIP) để gửi ưu đãi.
* **US-7:** Tôi muốn cộng hoặc trừ điểm thủ công cho khách hàng kèm theo lý do cụ thể (Audit Trail).
* **US-8:** Tôi muốn tạo các chiến dịch nhân đôi/nhân ba điểm thưởng (Multipliers) trong thời gian giới hạn.
* **US-9:** Tôi muốn cấu hình các tham số hệ thống (ngưỡng thăng hạng, tỷ lệ tích điểm) trực tiếp trên Dashboard.

## 3. Business Rules
### 3.1 Phân hạng (Tiers)
| Hạng | Ngưỡng chi tiêu | Tỷ lệ tích điểm | Ưu đãi thêm |
| :--- | :--- | :--- | :--- |
| **Đồng (Bronze)** | Mặc định | 1% | - |
| **Bạc (Silver)** | > 2.000.000đ | 2% | Tặng 1 mã giảm giá 10% khi lên hạng |
| **Vàng (Gold)** | > 5.000.000đ | 3% | Giảm trực tiếp 5% trên mọi đơn hàng |
| **Kim cương (Diamond)** | > 10.000.000đ | 5% | Giảm trực tiếp 10% + Miễn phí giao hàng |

### 3.2 Quy tắc Điểm (Points)
* **Tích điểm:** Điểm chỉ được cộng khi đơn hàng chuyển sang trạng thái `DONE`.
* **Quy đổi:** 1 điểm = 1 VNĐ.
* **Tiêu điểm:** Tối đa dùng điểm chi trả 20% giá trị đơn hàng.
* **Hủy đơn:** Nếu đơn hàng có dùng điểm bị hủy, điểm phải được hoàn lại cho người dùng.
* **Điều chỉnh thủ công:** Mọi hành động từ Admin phải được ghi nhật ký (Log) chi tiết.

## 4. Architecture Flow
1. **Order DONE** -> `OrderService` triggers `LoyaltyService.processCompletion`.
2. `LoyaltyService` updates `User.total_spent` and `User.loyalty_points`.
3. `LoyaltyService` checks tier upgrade criteria.
4. Record added to `PointHistory`.
