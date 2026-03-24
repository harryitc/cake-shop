# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) - PRD_V1.md

## 🛒 Cake Shop Website

> Version 1. 
> Ngày tạo: 24/03/2026.

---

# 1. 🎯 Product Overview

## 1.1 Mục tiêu sản phẩm

Xây dựng một website bán bánh kem đơn giản, cho phép:

* Người dùng dễ dàng tìm kiếm và đặt bánh
* Chủ cửa hàng quản lý sản phẩm và đơn hàng hiệu quả

## 1.2 Giá trị cốt lõi

* Đặt bánh nhanh, không rườm rà
* Giao diện rõ ràng, dễ sử dụng
* Tối ưu cho nhu cầu nhỏ (shop cá nhân / local business)

---

# 2. 👥 Target Users

## 2.1 Khách hàng (Customer)

* Người muốn mua bánh nhanh
* Không cần tài khoản phức tạp
* Ưu tiên trải nghiệm đơn giản

## 2.2 Quản trị viên (Admin)

* Chủ shop hoặc nhân viên
* Cần quản lý sản phẩm và đơn hàng

---

# 3. 🎯 Product Scope

## 3.1 In Scope (Phase 1)

* Xem danh sách bánh
* Xem chi tiết bánh
* Thêm vào giỏ hàng
* Đặt hàng (COD)
* Xem lịch sử đơn hàng
* Admin quản lý sản phẩm
* Admin xử lý đơn hàng

## 3.2 Out of Scope (Phase 1)

* Thanh toán online
* Chat realtime
* Gợi ý sản phẩm bằng AI
* Hệ thống kho phức tạp

---

# 4. 🧭 User Experience (UX Flow)

## 4.1 Customer Journey

1. Truy cập website
2. Xem danh sách bánh
3. Chọn bánh → xem chi tiết
4. Thêm vào giỏ hàng
5. Kiểm tra giỏ hàng
6. Nhập thông tin giao hàng
7. Đặt hàng

---

## 4.2 Admin Journey

1. Đăng nhập hệ thống
2. Quản lý danh sách bánh
3. Xem danh sách đơn hàng
4. Cập nhật trạng thái đơn

---

# 5. 📦 Features

## 5.1 Customer Features

### 1. Xem danh sách bánh

* Hiển thị danh sách sản phẩm
* Có thể tìm kiếm theo tên

### 2. Xem chi tiết bánh

* Hình ảnh
* Mô tả
* Giá

### 3. Giỏ hàng

* Thêm sản phẩm
* Xóa sản phẩm
* Cập nhật số lượng

### 4. Đặt hàng

* Nhập địa chỉ giao hàng
* Xác nhận đơn

### 5. Lịch sử đơn hàng

* Xem danh sách đơn đã đặt
* Xem trạng thái đơn

---

## 5.2 Admin Features

### 1. Quản lý sản phẩm

* Tạo mới sản phẩm
* Chỉnh sửa thông tin
* Xóa sản phẩm

### 2. Quản lý đơn hàng

* Xem tất cả đơn
* Cập nhật trạng thái

---

# 6. 🔄 Order Lifecycle

## Trạng thái đơn hàng

* **Pending**: vừa tạo
* **Confirmed**: đã xác nhận
* **Done**: hoàn thành
* **Rejected**: bị hủy

## Quy tắc

* Admin là người thay đổi trạng thái
* Không được quay ngược trạng thái (ví dụ: Done → Pending)

---

# 7. 🧠 Business Rules

* Mỗi đơn hàng phải có ít nhất 1 sản phẩm
* Giá sản phẩm tại thời điểm đặt hàng được giữ nguyên
* Không cho phép đặt hàng với giỏ hàng rỗng
* Số lượng sản phẩm phải lớn hơn 0
* Người dùng chỉ xem được đơn của mình

---

# 8. 🔐 Authentication & Authorization

* Người dùng cần đăng nhập để đặt hàng
* Admin có quyền quản lý dữ liệu hệ thống
* Phân quyền rõ ràng giữa user và admin

---

# 9. 📡 Non-functional Requirements

## 9.1 Hiệu năng

* Trang danh sách tải nhanh (< 2s)
* Hỗ trợ phân trang

## 9.2 Khả dụng

* Responsive (mobile + desktop)
* Giao diện đơn giản, dễ hiểu

## 9.3 Bảo mật

* Bảo vệ thông tin người dùng
* Ngăn chặn truy cập trái phép vào admin

---

# 10. 📊 Success Metrics

* Tỷ lệ hoàn thành đơn hàng
* Thời gian đặt hàng trung bình
* Số lượng đơn hàng mỗi ngày
* Tỷ lệ người dùng quay lại

---

# 11. 🚀 Future Enhancements

* Thanh toán online
* Tracking đơn hàng realtime
* Đánh giá sản phẩm
* Gợi ý sản phẩm
* Quản lý tồn kho

---

# 12. ⚠️ Risks & Assumptions

## Assumptions

* Shop nhỏ, lượng đơn vừa phải
* Không cần hệ thống phức tạp

## Risks

* Người dùng bỏ giỏ hàng
* Sai sót khi xử lý đơn thủ công
* Không kiểm soát tồn kho

---
