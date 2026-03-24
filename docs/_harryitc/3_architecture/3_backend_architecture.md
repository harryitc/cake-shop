---
title: Backend Architecture
version: 1.0
type: architecture
related_docs:
  - 1_system_architecture.md
  - 4_database_design_v1.md
---

# ⚙️ KIẾN TRÚC BACKEND - CAKE SHOP

> Tài liệu mô tả kiến trúc bộ xử lý dữ liệu và logic tầng Backend sử dụng **Express.js (Node.js thuần/Vanilla JavaScript)** và **MongoDB**.

---

## 1. 🟢 Framework & Database Stack

Đúng như khởi tạo thực tế của bạn, dự án Express.js mặc định sử dụng **Vanilla JavaScript (CommonJS)** cực kỳ nhẹ nhàng, không cần qua bước compile như TypeScript.

- **Runtime Env:** Node.js V20+
- **Web Framework:** Express.js 4.x (Khởi tạo sẵn với cấu trúc `bin/www` và `app.js`).
- **Ngôn ngữ:** JavaScript thuần (Sử dụng cú pháp `require` và `module.exports`).
- **Database:** MongoDB (NoSQL) với thư viện **Mongoose ORM**.
- **Security & Utilities:** `jsonwebtoken` (JWT), `bcryptjs` (Mã hoá mk), `cors` (Mở cổng gọi API cho Frontend).

---

## 2. 📁 Cấu trúc thư mục (3-Layer Architecture)

Mặc dù bạn tạo sẵn bằng `express-generator` có chứa thư mục `views` (cho HTML sinh trên server) và `public` (chứa CSS tĩnh), nhưng dự án này là **RESTful API** tương tác trả về JSON cho Next.js, nên ta sẽ bỏ qua `views`/`public` và bắt buộc dựng cấu trúc Cốt lõi (**3 Lớp**) sau vào source-code:

```text
/web-server/
├── bin/
│   └── www                     # Chạy server ứng dụng gốc (App entry point)
├── app.js                      # Cấu hình Express, CORS, Global Middlewares, load routes
│
├── /config                     # Cấu hình môi trường (DB Connection, ENV vars)
│   └── db.config.js
│
├── /routes                     # Định nghĩa API Endpoints (Nhận URL và điều hướng)
│   ├── auth.routes.js
│   ├── cake.routes.js
│   └── order.routes.js
│
├── /controllers                # Xử lý Logic lấy Input/Output JSON (Request/Response API)
│   ├── auth.controller.js
│   ├── cake.controller.js
│   └── order.controller.js
│
├── /services                   # Xử lý Logic Nghiệp vụ Cốt lõi (Business Logic)
│   ├── auth.service.js         # (Vd: Check pass, tạo Token)
│   └── order.service.js        # (Vd: Tính tổng tiền, call DB transaction)
│
├── /schemas                    # Định nghĩa cấu trúc Database (Mongoose Schemas)
│   ├── User.schema.js
│   ├── Cake.schema.js
│   ├── CartItem.schema.js
│   └── Order.schema.js
│
├── /middlewares                # Nơi chứa các lá chắn chặn API
│   ├── logger.middleware.js    # Ghi nhận log truy cập (kết hợp Morgan/Winston)
│   ├── auth.middleware.js      # Xác thực JWT Token & Phân quyền Role
│   └── error-handler.js        # Bắt Error tập trung để nén JSON lỗi
│
└── /utils                      # Các function hỗ trợ chung
    └── response.utils.js       # Hàm format json API lỗi cho Frontend dễ đọc
```

---

## 3. 🧩 Quy trình xử lý (Request Lifecycle) & Nguyên Tắc Viết Code (Best Practices)

1. **Vòng đời của 1 Request (Lifecycle)**:
   - **Logging:** Bất kỳ Request nào (lên URL nào) cũng phải chạy qua `logger.middleware.js` (hoặc cấu hình `morgan`) ở app gốc để lưu trữ thông tin thời gian thực thi, IP và trạng thái (200, 400). Rất tốt khi Monitor lỗi trên Server (Production).
   - **Router $\to$ Middleware bảo mật $\to$ Controller $\to$ Service $\to$ Mongoose DB**.
   
2. **Nguyên tắc "Controller Mỏng, Service Dày"**: 
   - `Controller` tuyệt đối KHÔNG chứa vòng lặp lưu Data. Ở Controller chỉ gọi `service.buyCake()`, xong gọi trả về `res.status(200).json(...)`.
   - Nếu Controller vướng lỗi, chuyển thẳng lỗi sang `next(err)` để Middleware xử lý lỗi (Error Handler) gánh vác tập trung.
   - Mọi logic tính toán (tính tiền giỏ hàng, mã hoá mật khẩu, Check tồn kho) đặt sâu ở `Service`. Do JS không báo lỗi type nên Data truyền xuống Service phải lấy triệt để.

---

## 4. 🗄️ Database Design (Entity Mongoose JS)

> **LƯU Ý:** Do thiết kế Cơ sở dữ liệu thường xuyên thay đổi linh hoạt theo từng giai đoạn (Version) độc lập với toàn cục Backend, vui lòng tham khảo riêng tại tệp phân tích CSDL chuyên biệt:
> 👉 [Xem chi tiết: Database Design & Schemas (4_database_design_v1.md)](./4_database_design_v1.md)

---

## 5. 🔗 Tạo Order bằng Cặp Transaction

Do Node.js chạy bất đồng bộ (Async/Await JS), ở Backend Service `/services/order.service.js` cho `/api/v1/orders` bắt buộc xài lệnh Mongoose Transaction để giữ nguyên vẹn dữ liệu:

1. `const session = await mongoose.startSession(); session.startTransaction();`
2. Lấy dữ liệu Giỏ hàng của KH.
3. Tạo và `.save({ session })` hoá đơn Bánh + Món.
4. Xoá cực mạnh `.deleteMany({ user: user_id }).session(session)` để clear giỏ hàng.
5. `await session.commitTransaction();` $\to$ Cục giao dịch mới tính là hoàn tất và dữ liệu ghi vô DB thật. Bất trắc lỗi xảy ra thì dùng catch `await session.abortTransaction()` trả đồ lại nguyên vẹn như trước khi mua.
