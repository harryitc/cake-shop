# Technical Design: Generic Import/Export Module

## 1. Kiến trúc Hệ thống (Architecture)

Hệ thống được thiết kế theo mô hình **Entity-Specific API + Reusable Core Service**.

### A. Lớp Route & Controller (Specific)
Mỗi module (Cakes, Categories...) khai báo endpoint riêng:
- `POST /api/v1/cakes/import` -> `cakeController.importCakes`
- `POST /api/v1/categories/import` -> `categoryController.importCategories`

### B. Lớp Lõi: ImportService (Generic)
Dịch vụ trung tâm xử lý logic nặng:
- `execute(buffer, config, mode)`: Hàm thực thi chính.
- `parseExcel(buffer, mapping)`: Chuyển đổi Excel thành JSON thô.
- `processBatch(data, config, mode)`: Chuyển đổi dữ liệu và thực hiện `bulkWrite`.

### C. Lớp Cấu hình (Configuration)
Mỗi thực thể định nghĩa một file cấu hình:
- `model`: Mongoose Model tương ứng.
- `uniqueKey`: Khóa định danh duy nhất (Slug, Code...).
- `mapping`: Ánh xạ `Cột Excel` -> `Trường DB`.
- `validationSchema`: Joi Schema để kiểm tra dữ liệu.

## 2. Logic Database Strategy (bulkWrite)

Dựa trên `importMode`, hệ thống sinh lệnh `bulkWrite` như sau:

| Mode | MongoDB Operation |
| :--- | :--- |
| **UPSERT** | `updateOne({ uniqueKey }, { $set: data }, { upsert: true })` |
| **INSERT_ONLY** | `updateOne({ uniqueKey }, { $setOnInsert: data }, { upsert: true })` |
| **UPDATE_ONLY** | `updateOne({ uniqueKey }, { $set: data }, { upsert: false })` |

## 3. Quản lý Hiệu năng (Performance)
- **Streaming API**: Sử dụng `exceljs.WorkbookWriter` cho Export và `exceljs.WorkbookReader` cho Import.
- **Batching**: Xử lý mặc định 500 dòng một đợt để cân bằng giữa RAM và tốc độ I/O.

## 4. Schema: ImportHistory
Lưu lại lịch sử phục vụ đối soát và báo cáo lỗi:
- `userId`: Người thực hiện.
- `entityType`: Loại dữ liệu.
- `fileName`: Tên file gốc.
- `importMode`: Chế độ đã chọn.
- `stats`: `{ total, success, failed, skipped }`.
- `errors`: Danh sách `{ row, rawData, message }`.
