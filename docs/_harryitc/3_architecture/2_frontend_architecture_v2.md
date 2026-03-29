# Frontend Unified Architecture (V2) - Data Flow & Standards

Tài liệu này quy định tư duy lập trình đồng nhất cho cả hai project `admin` và `user`. Mọi tính năng mới hoặc refactor phải tuân thủ nghiêm ngặt cấu trúc phân lớp này.

## 1. Sơ đồ luồng dữ liệu (Data Flow)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (UI)                            │
│  (Components, Pages, Forms)                                                 │
└───────────────────────┬───────────────────────────────▲─────────────────────┘
                        │ call hook                     │ return data (Model)
┌───────────────────────▼───────────────────────────────┴─────────────────────┐
│                            STATE LAYER (Hooks)                              │
│  (TanStack Query: useQuery, useMutation)                                    │
└───────────────────────┬───────────────────────────────▲─────────────────────┘
                        │ call api                      │ transform (Mapper)
┌───────────────────────▼───────────────────────────────┴─────────────────────┐
│                          SERVICE LAYER (API)                                │
│  (Axios methods: .get, .post, .put, .delete)                                │
└───────────────────────┬───────────────────────────────▲─────────────────────┘
                        │ request                       │ response (Unwrapped)
┌───────────────────────▼───────────────────────────────┴─────────────────────┐
│                        INFRASTRUCTURE LAYER (Axios)                         │
│  (Interceptors, Auth Header, Error Handling)                                │
└───────────────────────┬───────────────────────────────▲─────────────────────┘
                        │ HTTP Request                  │ JSON Response
┌───────────────────────▼───────────────────────────────┴─────────────────────┐
│                               BACKEND API                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết các lớp (Architectural Layers)

### Lớp 1: Infrastructure Layer (`lib/http.ts`)
- **Nhiệm vụ**: Cấu hình Axios Instance lõi.
- **Tiêu chuẩn**:
    - **Request Interceptor**: Tự động gắn `Authorization: Bearer <token>` từ localStorage.
    - **Response Interceptor**: Tự động "unwrap" dữ liệu (`response.data.data`) và xử lý lỗi `401` tập trung.
- **Cấm**: Không gọi trực tiếp `fetch` hoặc các instance Axios khác ngoài `httpClient`.

### Lớp 2: Service Layer (`modules/[name]/api.ts`)
- **Nhiệm vụ**: Định nghĩa endpoint và tham số truyền đi.
- **Tiêu chuẩn**:
    - Sử dụng các method Axios (`.get`, `.post`, `.put`, `.delete`).
    - Sử dụng thuộc tính `params` để truyền Query Strings.
    - Không chứa logic xử lý UI hay thông báo lỗi (Toast).
- **Ví dụ**:
    ```typescript
    getAll: (params) => httpClient.get('/cakes', { params })
    ```

### Lớp 3: Transformation Layer (`modules/[name]/mapper.ts`)
- **Nhiệm vụ**: Chuyển đổi dữ liệu từ Backend (DTO) sang định dạng Frontend (Model).
- **Tiêu chuẩn**:
    - Phải có hàm `mapToModel` cho dữ liệu nhận về.
    - (Tùy chọn) Có hàm `mapToDTO` cho dữ liệu gửi đi nếu cần biến đổi phức tạp.
- **Lợi ích**: Bảo vệ UI Components khỏi các thay đổi đột ngột từ API.

### Lớp 4: State Layer (`modules/[name]/hooks.ts`)
- **Nhiệm vụ**: Quản lý Server State bằng TanStack Query.
- **Tiêu chuẩn**:
    - Sử dụng `useQuery` cho các tác vụ lấy dữ liệu (Read).
    - Sử dụng `useMutation` cho các tác vụ thay đổi dữ liệu (Write).
    - **Phải gọi Mapper** bên trong `queryFn`.
    - Quản lý việc `invalidateQueries` để đồng bộ dữ liệu sau khi mutation thành công.

### Lớp 5: Presentation Layer (`modules/[name]/components/`)
- **Nhiệm vụ**: Hiển thị giao diện và nhận tương tác.
- **Tiêu chuẩn**:
    - **Tuyệt đối không gọi API trực tiếp**.
    - Chỉ làm việc với dữ liệu đã qua xử lý từ Hooks.
    - Tập trung vào logic hiển thị, validation form và tương tác người dùng.

---

## 3. Quy tắc vàng (Golden Rules)

1. **Centralized Token**: Không truy cập `localStorage.getItem("access_token")` ở bất kỳ đâu ngoài `http.ts`.
2. **Clean URL**: Không bao giờ cộng chuỗi URL (`url + "?id=" + id`). Luôn dùng `{ params: { id } }`.
3. **Implicit Unwrap**: Vì Interceptor đã bóc tách `data.data`, code ở Service và Hooks phải gọn gàng, không lặp lại `.data`.
4. **Consistency**: File `api.ts`, `hooks.ts`, `mapper.ts`, `types.ts` là bộ tứ bắt buộc cho mỗi module.
