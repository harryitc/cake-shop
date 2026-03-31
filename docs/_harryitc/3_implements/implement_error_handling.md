---
title: Hướng dẫn Triển khai Chi tiết - Hệ thống Xử lý Lỗi Thống nhất
status: Approved
version: 1.3.1
date: 2026-03-31
author: Gemini CLI
architecture_ref: "docs/_harryitc/3_architecture/11_error_handling_design.md"
prd_ref: "docs/_harryitc/2_prd/prd_v6_error_handling.md"
---

# Hướng dẫn Triển khai Chi tiết: Hệ thống Xử lý Lỗi Thống nhất

Tài liệu này chứa đựng "ý tưởng triển khai chi tiết nhất" cho toàn bộ hệ thống xử lý lỗi trên dự án Cake Shop.

---

## 1. Triển khai tại Backend (web-server)

### 1.1 Nâng cấp Tiện ích `createError`
Sửa đổi `utils/response.utils.js` để trả về một object lỗi giàu ngữ cảnh:

```javascript
/**
 * Ý tưởng: Gắn kèm mã lỗi (code), statuscode và thời điểm (timestamp) ngay khi lỗi phát sinh.
 */
const createError = (message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.timestamp = new Date().toISOString(); 
  err.details = details;
  return err;
};
```

### 1.2 Hiệu chỉnh Middleware `error-handler.js`
Logic bóc tách thông tin và bảo mật theo môi trường:

```javascript
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  const originalMessage = err.message || 'Unknown Error';
  const isProd = process.env.NODE_ENV === 'production';

  // Ép lỗi bất ngờ về Logic Error (422)
  if (statusCode === 500) {
    statusCode = 422;
    code = 'LOGIC_ERROR';
  }

  const errorBody = {
    error: {
      code,
      statuscode: statusCode,
      timestamp: err.timestamp || new Date().toISOString(),
      path: req.originalUrl,
      message: (code === 'LOGIC_ERROR') 
               ? 'Hệ thống gặp sự cố nghiệp vụ, vui lòng thử lại sau.' 
               : err.message,
      details: err.details || null
    }
  };

  // Log lỗi thực tế ở server cho developer
  if (code === 'LOGIC_ERROR') {
    console.error(`[LOGIC ERROR at ${req.originalUrl}]:`, originalMessage);
    if (err.stack) console.error(err.stack);
  } else if (!isProd) {
    console.error(`[ERROR] ${code}:`, err.message);
  }

  res.status(statusCode).json(errorBody);
};
```

### 1.3 Xây dựng Bộ công cụ Tạo lỗi (Error Factory)
Tạo file `web-server/utils/error.factory.js` để đóng gói sẵn các loại lỗi. Giúp code ở Controller đồng nhất tuyệt đối.

```javascript
const { createError } = require('./response.utils');

const ApiError = {
  BAD_REQUEST: (msg = 'Yêu cầu không hợp lệ', details = null) => createError(msg, 400, 'BAD_REQUEST', details),
  UNAUTHORIZED: (msg = 'Vui lòng đăng nhập') => createError(msg, 401, 'UNAUTHORIZED'),
  FORBIDDEN: (msg = 'Không có quyền truy cập') => createError(msg, 403, 'FORBIDDEN'),
  NOT_FOUND: (msg = 'Không tìm thấy tài nguyên') => createError(msg, 404, 'NOT_FOUND'),
  CONFLICT: (msg = 'Dữ liệu đã tồn tại', details = null) => createError(msg, 409, 'CONFLICT', details),
  LOGIC: (msg = 'Lỗi nghiệp vụ', details = null) => createError(msg, 422, 'LOGIC_ERROR', details),
  INTERNAL: (msg = 'Lỗi máy chủ') => createError(msg, 500, 'INTERNAL_ERROR')
};

module.exports = ApiError;
```

### 1.4 Tối ưu hóa luồng ném lỗi (Direct Throw Pattern)
Để loại bỏ việc gọi `next(err)` rườm rà, chúng ta sử dụng thư viện `express-async-errors`.

**Cách sử dụng mới (Sạch sẽ):**
```javascript
const createCake = async (req, res) => {
  if (exists) throw ApiError.CONFLICT('Trùng tên bánh'); 
  
  const result = await cakeService.save(req.body);
  res.status(201).json({ data: result });
};
```

---

## 2. Triển khai tại Frontend (web-client)

### 2.1 Cấu hình Interceptor Điều phối Lỗi (`lib/http.ts`)

```typescript
httpClient.interceptors.response.use(
  (response) => response.data?.data,
  (error: AxiosError) => {
    const errorBody = error.response?.data?.error;
    const status = error.response?.status || 500;
    const message = errorBody?.message || "Lỗi kết nối máy chủ";

    if (status >= 500 || status === 403 || error.code === 'ECONNABORTED') {
      notification.error({ message: 'Lỗi Hệ Thống', description: message });
    }

    if (status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }

    // Ném về Component để xử lý UI riêng cho lỗi Logic (422, 400, 409)
    return Promise.reject({ ...errorBody, statuscode: status });
  }
);
```

### 2.2 Ví dụ sử dụng tại Component

```typescript
const handleAction = async (data) => {
  try {
    await api.doSomething(data);
  } catch (err) {
    // Xử lý lỗi Logic tại đây
    if (err.statuscode === 422) {
      message.warning(err.message); 
    }
  }
}
```

---

## 3. Quy trình Kiểm thử (Verification)
1. **Lỗi Mạng**: Ngắt mạng -> Hiện Notification đỏ.
2. **Lỗi 500**: Mock error server -> Hiện Notification đỏ.
3. **Lỗi 422/409**: Gửi trùng dữ liệu -> Component tự hiện Toast nghiệp vụ.
4. **Lỗi 401**: Xóa token -> Tự động redirect về login.
