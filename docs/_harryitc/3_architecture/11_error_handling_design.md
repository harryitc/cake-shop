---
title: Kiến trúc Hệ thống Xử lý Lỗi (Error Handling Architecture)
status: Approved
version: 1.2.0
date: 2026-03-29
author: Gemini CLI
prd_ref: "docs/_harryitc/2_prd/prd_v6_error_handling.md"
---

# Kiến trúc Hệ thống Xử lý Lỗi (Error Handling Architecture)

Tài liệu này quy định kiến trúc xử lý lỗi thống nhất giữa Backend (Express) và Frontend (Next.js) cho toàn bộ dự án Cake Shop. Mục tiêu là tạo ra một hệ thống phản hồi lỗi nhất quán, dễ debug và mang lại trải nghiệm người dùng tốt nhất.

---

## 1. Định dạng Phản hồi Lỗi Chuẩn (Standard Response Format)

Mọi phản hồi lỗi từ Backend **BẮT BUỘC** phải tuân thủ định dạng JSON sau:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",         // Mã định danh (ví dụ: USER_NOT_FOUND)
    "statuscode": 404,                   // Mã trạng thái HTTP (numeric)
    "timestamp": "2026-03-29T10:00:00Z", // Thời điểm lỗi (ISO 8601)
    "message": "Thông báo lỗi thân thiện", // Nội dung hiển thị cho UI
    "details": {}                        // (Tùy chọn) Chi tiết lỗi (ví dụ: validation)
  }
}
```

---

## 2. Kiến trúc Backend (web-server)

### 2.1 Luồng xử lý (Data Flow)
**Controller** (ném lỗi) -> **Global Error Handler Middleware** -> **JSON Response**.

### 2.2 Các mã trạng thái HTTP (HTTP Status Codes)
| Status | Mã lỗi (Code) | Ý nghĩa & Ngữ cảnh sử dụng |
| :--- | :--- | :--- |
| **400** | `BAD_REQUEST` | **Lỗi Cấu trúc**: Request sai format JSON, thiếu field bắt buộc hoặc sai kiểu dữ liệu cơ bản. |
| **401** | `UNAUTHORIZED` | **Lỗi Xác thực**: Chưa đăng nhập, Token hết hạn hoặc không hợp lệ. |
| **403** | `FORBIDDEN` | **Lỗi Ủy quyền**: Đã đăng nhập nhưng không có quyền thực hiện hành động này. |
| **404** | `NOT_FOUND` | **Lỗi Tài nguyên**: Không tìm thấy dữ liệu hoặc Endpoint yêu cầu. |
| **409** | `CONFLICT` | **Lỗi Trạng thái**: Xung đột dữ liệu (Email/Username đã tồn tại, trùng lặp khóa duy nhất). |
| **422** | `LOGIC_ERROR` | **Lỗi Logic**: Đúng cấu trúc nhưng sai Logic nghiệp vụ (Hết hàng, Voucher hết hạn, Sai quy tắc tính toán). |
| **500** | `INTERNAL_ERROR` | **Lỗi Hệ thống**: Lỗi code server, lỗi Database connection hoặc các ngoại lệ chưa xác định. |

---

## 3. Kiến trúc Frontend (web-client)

Hệ thống Frontend sử dụng **Axios Interceptor** làm trung tâm điều phối lỗi (Error Dispatcher).

### 3.1 Phân loại lỗi (Error Classification)

Lỗi được chia thành 2 loại chính:

#### A. Lỗi Hệ thống (Global Errors)
Đây là các lỗi nghiêm trọng, do hệ thống hoặc hạ tầng, cần thông báo ngay lập tức cho người dùng qua UI Notification.
- **Network Error**: Mất kết nối, DNS lỗi.
- **5xx**: Server sập hoặc lỗi logic nghiêm trọng.
- **403**: Truy cập trái phép vào tài nguyên bị cấm.
- **404 (API)**: Endpoint không tồn tại.

**Hành động**: Tự động hiển thị Notification Global thông qua Interceptor.

#### B. Lỗi Logic (Local Errors)
Đây là các lỗi phát sinh từ hành vi của người dùng hoặc logic nghiệp vụ từ server, cần được xử lý cụ thể tại từng Component.
- **422**: **Lỗi trọng tâm (Sai quy tắc nghiệp vụ, Logic chi tiết).**
- **400**: Sai định dạng gửi lên.
- **409**: Xung đột dữ liệu.

**Hành động**: Interceptor thực hiện ném lỗi (Throw Error), Component thực hiện bắt lỗi (Catch) để hiển thị thông báo/giao diện cục bộ.

### 3.2 Sơ đồ Luồng xử lý Frontend

```text
┌─────────────────────────────────────────────────────────┐
│                    AXIOS INTERCEPTOR                    │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
       [Lỗi Hệ Thống]                 [Lỗi Logic]
       (500, 403, Net)              (422, 400, 409)
               │                           │
┌──────────────▼──────────────┐   ┌────────▼──────────────┐
│   UI GLOBAL NOTIFICATION    │   │      THROW ERROR      │
│ (notification.error - antd) │   │ (Cần Catch tại Comp)  │
└─────────────────────────────┘   └────────┬──────────────┘
                                           │
                                  ┌────────▼──────────────┐
                                  │   LOCAL COMPONENT     │
                                  │ (Show Inline/Message) │
                                  └───────────────────────┘
```

1. **Tại Backend**: Sử dụng `createError(message, status, code)` để ném lỗi từ Controller/Service. Tuyệt đối không dùng `res.status(500).send()` trực tiếp.
2. **Tại Frontend Interceptor**: Ưu tiên bóc tách `error.response.data.error.message` để hiển thị. Luôn `Promise.reject(error)` để không làm gãy luồng xử lý của Component.
3. **Phân cấp Thông báo**:
   - Lỗi Hệ thống: Thông báo phải có tiêu đề "Lỗi Hệ Thống" và mô tả ngắn gọn qua Notification.
   - Lỗi Logic: Thông báo phải chỉ rõ người dùng cần sửa gì (Toast hoặc Inline error).
4. **Bảo mật**: Tuyệt đối không để lộ thông tin kỹ thuật nhạy cảm trong thuộc tính `message` ở môi trường Production.
