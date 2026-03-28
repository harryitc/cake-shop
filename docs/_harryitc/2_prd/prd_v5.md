# PRD v5: Loyalty Program & Membership (Cake Rewards)

## 1. Bối cảnh (Background)
Để tăng tỷ lệ quay lại của khách hàng (Retention Rate) và xây dựng cộng đồng khách hàng thân thiết, Cake Shop cần một hệ thống tích điểm và phân hạng thành viên. Khách hàng chi tiêu càng nhiều sẽ nhận được càng nhiều ưu đãi.

## 2. Mục tiêu (Objectives)
- **Gắn kết khách hàng**: Khuyến khích khách hàng mua sắm nhiều hơn để thăng hạng.
- **Tăng giá trị đơn hàng**: Sử dụng điểm thưởng như một hình thức giảm giá trực tiếp.
- **Quản lý CRM**: Giúp Admin hiểu rõ hành vi chi tiêu của khách hàng qua mô hình 360-view.

## 3. Đối tượng người dùng (User Personas)
- **Khách hàng (User)**: Muốn được ghi nhận lòng trung thành qua các ưu đãi và hạng thành viên.
- **Quản trị viên (Admin)**: Muốn theo dõi, quản lý điểm và cấu hình các quy tắc tích điểm linh hoạt.

## 4. Đặc tả Tính năng (Functional Requirements)

### F1: Tích điểm & Phân hạng (Points & Tiers)
- Tự động cộng điểm khi đơn hàng chuyển sang trạng thái `DONE`.
- Tự động thăng hạng dựa trên tổng chi tiêu (`total_spent`).
- 4 hạng: Đồng (Bronze), Bạc (Silver), Vàng (Gold), Kim cương (Diamond).
- Mỗi hạng có tỷ lệ tích điểm khác nhau (1% -> 5%).

### F2: Sử dụng điểm (Redemption)
- Cho phép dùng điểm để giảm giá trực tiếp khi thanh toán (1 điểm = 1 VNĐ).
- Giới hạn tối đa 20% giá trị đơn hàng khi dùng điểm để bảo vệ lợi nhuận.
- Hoàn lại điểm nếu đơn hàng bị hủy (`REJECTED`).

### F3: Quản trị khách hàng (Admin CRM - Customer 360)
- Xem chi tiết hồ sơ khách hàng: Tổng chi tiêu, điểm hiện tại, lịch sử đơn hàng, lịch sử điểm.
- Điều chỉnh điểm thủ công (Cộng/Trừ) kèm lý do.
- Ghi đè và khóa hạng (Rank Override & Lock).
- Cấu hình hệ thống (Ngưỡng thăng hạng, tỷ lệ tích điểm).

### F4: Trải nghiệm người dùng (User Experience)
- Tab "Cake Rewards" trong trang cá nhân: Hiển thị Badge hạng, thanh tiến trình lên hạng tiếp theo.
- Lịch sử thay đổi điểm chi tiết.
- Tích hợp dùng điểm mượt mà tại trang Checkout.

## 5. Ràng buộc & Quy tắc (Rules & Constraints)
- Tỷ lệ quy đổi: 1 điểm = 1 VNĐ.
- Giới hạn dùng điểm: Tối đa 20% giá trị đơn hàng (sau khi đã áp dụng Coupon).
- Điểm thưởng chỉ được tính trên giá trị thanh toán cuối cùng (`final_price`).
- Tính toán nguyên tử (Atomic updates) để tránh race condition khi cập nhật điểm.
