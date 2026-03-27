# Bulk Data Architecture: Generic Import/Export Module

## 1. Kiến trúc tổng thể (High-Level Architecture)

Cái nhìn tổng quát về cách hệ thống hoạt động từ giao diện người dùng đến cơ sở dữ liệu:

```ascii
+-----------------------+       +-------------------------+       +------------------------+
|   Giao diện Admin     |       |    Cổng API (Server)    |       |   Lưu trữ (Database)   |
| (Next.js Admin Panel) |       |   (Node.js / Express)   |       |       (MongoDB)        |
+-----------+-----------+       +------------+------------+       +-----------+------------+
            |                                |                                |
            | 1. Upload File Excel           | 2. Tiếp nhận & Phân loại       | 4. Lưu dữ liệu chính   |
            +------------------------------->| (Routes/Controllers)           | (Products, Categories) |
            |                                |           |                    |                        |
            | 5. Xem kết quả & Lịch sử       |           v                    |                        |
            |<-------------------------------+ 3. Động cơ xử lý chính         | 4. Lưu lịch sử & Lỗi   |
            |                                | (Import Service + Configs)     | (Import History)       |
            +--------------------------------+--------------------------------+------------------------+
```

**Mô tả các lớp (Layer Descriptions):**
*   **Lớp Giao diện (Frontend)**: Nơi Admin thực hiện thao tác tải file lên, chọn chế độ nhập dữ liệu (Thêm mới/Cập nhật) và theo dõi tiến độ hoặc tải về báo cáo lỗi.
*   **Lớp Điều phối (API Layer)**: Đóng vai trò như người lễ tân, kiểm tra quyền truy cập, tiếp nhận file và chuyển giao cho đúng bộ phận xử lý.
*   **Lớp Động cơ (Service & Configs)**: Đây là trung tâm xử lý. Nó đọc file, "so khớp" dữ liệu với quy tắc nghiệp vụ (Configs) để đảm bảo dữ liệu đúng định dạng trước khi lưu.
*   **Lớp Dữ liệu (Database)**: Nơi lưu trữ cuối cùng của dữ liệu nghiệp vụ và toàn bộ nhật ký (History) để phục vụ việc tra cứu sau này.

## 2. Overview (Chuyên sâu)
Hệ thống xử lý dữ liệu lớn (Bulk Data) được thiết kế theo hướng module hóa (Plug-and-play), tách biệt hoàn toàn giữa **Cơ sở hạ tầng xử lý file (Service)** và **Quy tắc nghiệp vụ (Config)**. 

Kiến trúc này cho phép:
- Tái sử dụng logic cốt lõi cho mọi thực thể (Cakes, Categories, Coupons...).
- Xử lý hàng nghìn dòng dữ liệu với hiệu năng cao nhờ Batch Processing.
- Quản lý lịch sử và khắc phục lỗi dữ liệu một cách trực quan.

## 3. Sơ đồ Kiến trúc kỹ thuật (Technical Diagrams)

### A. Luồng xử lý Import (Sequence Diagram - ASCII)

```ascii
[ Admin Panel ]       [ API Gateway ]       [ ImportService ]       [ Config File ]       [ MongoDB ]
       |                     |                     |                      |                   |
       |--- POST /import --->|                     |                      |                   |
       |    (file + mode)    |                     |                      |                   |
       |                     |--- execute() ------>|                      |                   |
       |                     |                     |--- createHistory() --------------------->| (Status: processing)
       |                     |                     |                      |                   |
       |                     |                     |--- load Config <---->|                   |
       |                     |                     |                      |                   |
       |                     |                     |--- read Excel Row ---|                   |
       |                     |                     |                      |                   |
       |                     |                     |--- mapping() ------->|                   | (Excel -> DB Field)
       |                     |                     |                      |                   |
       |                     |                     |--- transform() <---->|                   | (Async: Lookup IDs, Slugs)
       |                     |                     |                      |                   |
       |                     |                     |--- validate() <----->|                   | (Joi Validation)
       |                     |                     |                      |                   |
       |                     |                     |--- push to Batch ----|                   | (Batch Size: 500)
       |                     |                     |                      |                   |
       |                     |                     |--- bulkWrite() ------------------------->| (Update/Insert)
       |                     |                     |                      |                   |
       |                     |                     |--- finalizeHistory --------------------->| (Status: completed)
       |                     |                     |                      |                   |
       | <--- 200 OK --------|                     |                      |                   |
       |    (historyId)      |                     |                      |                   |
```

**Mô tả luồng xử lý (Sequence Description):**
1. **Khởi tạo (Tracking)**: Ngay khi nhận file, hệ thống tạo bản ghi History (`processing`) để Admin có thể theo dõi tiến độ thời gian thực.
2. **Cấu hình hóa (Config-driven)**: `ImportService` (Engine chung) tải cấu hình từ file `Config` của module tương ứng để biết quy tắc xử lý.
3. **Pipeline Xử lý**: Dữ liệu đi qua chuỗi: `Mapping` (Đổi tên field) -> `Transform` (Xử lý logic, lookup DB) -> `Validate` (Kiểm tra tính hợp lệ).
4. **Batching & Persistence**: Thay vì lưu từng dòng, hệ thống gom 500 dòng thành một Batch và dùng `bulkWrite` để tối ưu hóa hiệu năng Database, giảm thiểu độ trễ I/O.
5. **Hoàn tất**: Cập nhật kết quả cuối cùng vào History và trả về ID để truy xuất báo cáo lỗi nếu có.

### B. Sơ đồ Cấu trúc Module (Component Diagram)

```ascii
+-----------------------+      +---------------------------+      +---------------------------+
|    ImportService      |      |   Entity Config (.js)     |      |   ImportHistory Schema    |
|  (The Generic Engine) |      |  (Business Logic Only)    |      |    (Tracking & Audit)     |
+-----------+-----------+      +-------------+-------------+      +-------------+-------------+
            |                                |                                  |
            | 1. Reads Excel                 | 1. Model & uniqueKey             | 1. Status (proc/comp/fail)
            | 2. Orchestrates Flow           | 2. Excel Header Mapping          | 2. Stats (Total/S/F/Skip)
            | 3. Manages Batches             | 3. Transform (Async logic)       | 3. Error Rows (rawData)
            | 4. Handles Errors              | 4. Validation (Joi)              | 4. Duration & Timestamp
            +--------------------------------+----------------------------------+
```

**Mô tả thành phần (Component Description):**
*   **ImportService (The Brain)**: Đóng vai trò là động cơ điều phối chính. Chịu trách nhiệm về hạ tầng (đọc file Excel, quản lý luồng dữ liệu, quản lý lỗi hệ thống và tối ưu hóa Batch).
*   **Entity Config (The Plugin)**: Chứa toàn bộ "trí tuệ nghiệp vụ" của module. Đây là nơi định nghĩa cách dữ liệu được hiểu và biến đổi. Việc thêm module mới chỉ đơn giản là tạo thêm một "Plugin" Config này.
*   **ImportHistory Schema (The Memory)**: Lưu trữ nhật ký chi tiết của mọi đợt vận hành. Nó lưu cả dữ liệu lỗi (`rawData`) để phục vụ tính năng sửa lỗi thông minh cho người dùng.

## 4. Luồng xử lý chi tiết (Detailed Processing Flow)

Tiến trình Import được chia thành 4 giai đoạn nghiêm ngặt:

### Giai đoạn 1: Khởi tạo & Đọc File (Initiation)
1. **Tạo dấu vết (Traceability)**: Hệ thống tạo bản ghi `ImportHistory` với trạng thái `processing`.
2. **Trích xuất Header**: Đọc dòng đầu tiên của Excel để xây dựng bản đồ vị trí cột, cho phép thay đổi thứ tự cột Excel linh hoạt.

### Giai đoạn 2: Xử lý từng dòng (Row-by-Row Processing)
1. **Mapping**: Chuyển đổi giá trị ô Excel sang Field Name trong Database dựa vào `config.mapping`.
2. **Transformation (Hook)**: Gọi hàm `async transform()`. Đây là nơi thực hiện:
   - Truy vấn DB để chuyển đổi Text thành ObjectId (VD: Danh mục "Bánh Kem" -> ID).
   - Xử lý logic phức tạp (tách chuỗi, sinh slug, chuẩn hóa dữ liệu).
3. **Validation (Hook)**: Kiểm tra dữ liệu qua bộ lọc (Joi/Custom). 
   - **Thất bại**: Đẩy dòng lỗi vào mảng `errors` kèm theo `rawData` và thông báo lỗi.
   - **Thành công**: Chuyển dòng dữ liệu sang Giai đoạn 3.

### Giai đoạn 3: Tối ưu hóa Database (Batching & Persistence)
1. **Batching**: Gom dữ liệu "sạch" vào mảng tạm (Batch Size mặc định: 500).
2. **Bulk Operation**: Sử dụng `model.bulkWrite()` với lệnh `updateOne` và `{ upsert: true }`. 
   - Tối ưu hiệu năng bằng cách giảm số lượng Round-trip tới Database.

### Giai đoạn 4: Kết thúc & Báo cáo (Finalization)
1. **Tổng hợp**: Tính toán thống kê Thành công/Lỗi/Bỏ qua.
2. **Hoàn tất**: Cập nhật trạng thái `completed`, lưu danh sách lỗi và tính toán thời gian xử lý (`duration`).

## 5. Thành phần cấu hình (`.import.config.js`)

| Thuộc tính | Mô tả |
| :--- | :--- |
| `entity` | Tên định danh module (VD: 'cakes', 'categories'). |
| `model` | Mongoose Model sẽ thực hiện lưu dữ liệu. |
| `uniqueKey` | Field dùng để nhận diện trùng lặp (VD: 'slug', 'sku'). |
| `mapping` | Map `{ 'Tiêu đề Excel': 'db_field' }`. |
| `transform` | Hàm Async để xử lý logic nghiệp vụ bổ sung. |
| `validate` | Hàm kiểm tra tính hợp lệ của dữ liệu (thường dùng Joi). |

## 6. Quản lý Lịch sử & Khắc phục lỗi (Error Management)
- **Error Audit Trail**: Lưu trữ `rawData` của các dòng lỗi để phục vụ việc tải báo cáo lỗi.
- **Error Report Layout**: Tự động sinh file Excel báo lỗi với các cột dữ liệu cũ và thêm cột "LỖI CHI TIẾT" ở cuối, giúp người dùng sửa và Re-upload nhanh chóng.

## 7. Hướng dẫn triển khai cho Module mới (Implementation Guide)

Để thêm tính năng Import cho một thực thể mới (ví dụ: `Coupon`), hãy thực hiện theo 4 bước sau:

### Bước 1: Tạo file cấu hình (Config)
Tạo file tại `web-server/services/import/configs/coupon.import.config.js`:
```javascript
const Coupon = require('../../../schemas/Coupon.schema');

module.exports = {
  entity: 'coupons',
  model: Coupon,
  uniqueKey: 'code', // Dùng mã giảm giá làm khóa duy nhất
  mapping: {
    'Mã code': 'code',
    'Phần trăm': 'discount_percent',
    'Ngày hết hạn': 'expiry_date'
  },
  transform: async (data) => {
    data.code = data.code.toUpperCase(); // Chuẩn hóa dữ liệu
    return data;
  },
  validate: (data) => {
    if (data.discount_percent > 100) return { error: { message: 'Giảm giá không quá 100%' } };
    return { value: data };
  }
};
```

### Bước 2: Tạo Controller xử lý
Trong Controller của module đó (ví dụ: `coupon.controller.js`):
```javascript
const ImportService = require('../services/import/ImportService');
const couponConfig = require('../services/import/configs/coupon.import.config');

const importCoupons = async (req, res, next) => {
  try {
    const { mode = 'UPSERT' } = req.body;
    const result = await ImportService.execute(
      req.file.buffer, 
      couponConfig, 
      mode, 
      req.user._id
    );
    return sendSuccess(res, result, 'Bắt đầu tiến trình import');
  } catch (err) {
    next(err);
  }
};
```

### Bước 3: Khai báo Route
Tại file `routes/coupon.routes.js`:
```javascript
const upload = require('../middlewares/excel-upload.middleware');
router.post('/import', auth, role('admin'), upload.single('file'), couponController.importCoupons);
```

### Bước 4: Tích hợp xem Lịch sử & Tải file lỗi
Sử dụng các endpoint chung đã có sẵn trong `import.routes.js`:
*   `GET /api/import/history?entityType=coupons`: Xem danh sách các đợt import.
*   `GET /api/import/history/:historyId/download-errors`: Tải file Excel chứa các dòng bị lỗi để sửa.
