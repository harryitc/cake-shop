---
title: Frontend Architecture
version: 1.0
type: architecture
related_docs:
  - 1_system_architecture.md
  - 3_backend_architecture.md
---

# 🌐 KIẾN TRÚC FRONTEND - CAKE SHOP

> Tài liệu mô tả bức tranh công nghệ, kiến trúc thành phần và các tiêu chuẩn coding (Coding Standards) chung thống nhất cho cả 2 ứng dụng Frontend: `user` và `admin`.

---

## 1. ⚛️ Lớp Công Nghệ Cốt Lõi (Tech Stack)

Hệ thống Frontend cấu tạo bởi 2 Repository độc lập (`user` và `admin`) nhưng sử dụng **chung 100% chuẩn kiến trúc** và bộ công nghệ để quá trình phát triển đồng nhất:

- **Core Framework:** 
  - `Next.js 16.x` với **App Router**. Kết hợp đan xen linh hoạt giữa Server Components (RSC) và Client Components, ưu tiên xử lý dữ liệu từ phía Server giảm tải UI.
  - `React 19`.
- **CSS Architecture & UI Framework:**
  - `TailwindCSS v4`: Quản lý style trực tiếp.
  - `Ant Design (antd)`: Thư viện UI Component chính, hỗ trợ làm giao diện cực nhanh với Table, Form, Modal, v.v. Có cấu hình và tinh chỉnh lại màu qua `ConfigProvider`.
  - `@ant-design/nextjs-registry`: Để tích hợp Ant Design hoàn hảo cùng cơ chế SSR của Next.js App Router.
  - `Shadcn UI`: Đi kèm nhưng chỉ ưu tiên dùng cho các thành phần đặc biệt (nếu Antd không cover được).
  - Quản lý Class động bằng `clsx` + `tailwind-merge` thông qua tiện ích `cn`.
  - Iconography: Khuyến khích `@ant-design/icons` và hỗ trợ thêm `lucide-react`.
- **Design System Integration:**
  - Hệ thống màu sắc thiết kế lấy trực tiếp từ `website-design-system-token.json`. Đặc điểm file token này chứa chuẩn màu HDS dạng CSS Variables như `--hds-color-util-brand-900` hoặc màu hex palette (`#533afd`, `#ff6118`).
  - Lớp màu này sẽ được load/inject vào file `globals.css` làm biến CSS native để Tailwind v4 có thể import bằng `@theme`.
- **Data Fetching & State Management:** 
  - KHÔNG DÙNG Redux hay Zustand.
  - **`React Query` (TanStack Query v5):** Đóng vai trò tuyệt đối trong việc Fetch Data, Caching dữ liệu API và đảm nhiệm luôn vai trò State Management (Client State / Server State Sync). Giỏ hàng, session hay config chung sẽ dùng bộ Cache của React Query kết hợp Mutation.

---

## 2. 📁 Tổ chức cấu trúc chung theo Module (Module-Based Feature Design)

Thay vì thiết kế phân tách theo loại file bề ngang (layer-by-layer) như toàn bộ `components`, toàn bộ `services`, ứng dụng của chúng ta sẽ được đóng gói **nghiệp vụ theo từng Module** dọc từ trên xuống dưới. Điều này giúp code cực kỳ cô đọng, dễ scale và dễ test độc lập. Mỗi module đại diện cho một tính năng/domain (VD: Auth, Cake, Order).

```text
/web-client/[user, admin]
├── /app                    # Định tuyến (Routing Layer) nối với Module
│   ├── (shop)              # Group route giao diện User
│   │   ├── /cakes/page.tsx # Chỉ việc import `<CakeList />` component từ module
│   │   └── /cart/page.tsx
│   ├── layout.tsx          # Root Layout (Inject Providers)
│   └── page.tsx
│
├── /components             # UI Component tái sử dụng thuần tuý (Không có nghiệp vụ)
│   ├── /ui                 # Base components (nếu có, không ưu tiên vì dùng Antd)
│   └── /layout             # Header, Footer, Sidebar
│
├── /lib                    # Thư viện dùng chung toàn dự án
│   ├── providers.tsx       # Bọc `QueryClient` và `AntdRegistry`
│   ├── antd-theme.ts       # Cấu hình Antd Theme Token
│   └── http.ts             # Khởi tạo Fetch/Axios (xử lý Token Header)
│
├── /modules                # ❇️ NƠI CHỨA NGHIỆP VỤ MODULE CHÍNH ❇️
│   ├── /auth               
│   │   ├── components/     # <LoginForm />, <RegisterForm />
│   │   ├── hooks.ts        # useLoginMutation(), useGlobalAuthStore()...
│   │   ├── api.ts          # api.login(), api.verify()
│   │   ├── mapper.ts       # Chuyển đổi Raw DTO từ API thành Frontend Model
│   │   └── types.ts        # type User, type LoginPayload
│   │
│   ├── /cakes              
│   │   ├── components/     # <CakeList />, <CakeDetail />, <CakeCard />
│   │   ├── hooks.ts        # useCakesQuery(), useCakeDetail()
│   │   ├── api.ts          # cakeApi.getAll(), cakeApi.getById()
│   │   ├── mapper.ts       # function mapCakeToModel(raw)
│   │   └── types.ts        # interface ICake (Frontend Model), ICakeDTO (Raw)
│   │
│   └── /cart               # [Module Giỏ Hàng]
│       ├── components/     # <CartTable />, <AddToCartBtn />
│       ├── hooks.ts        # useCart(), useAddToCartMutation()
│       └── api.ts          # cartApi.add(), cartApi.remove()
```

### Nguyên tắc Module-based
1. **Đóng gói dữ liệu:** Component trong `cakes/components/CakeList.tsx` tự động gọi `hooks.ts` nội bộ của chính module đó. Nó sẽ fetch data và nhúng vào component Antd Table ngay lập tức. Layer `/app/cakes` không hề dính líu đến `axios` hay `react-query`, nó chỉ lo nhiệm vụ duy nhất là import `<CakeList />` và Render (chia sẻ URL).
2. Tách bạch hoàn toàn: Module Bánh (`cakes`) sẽ không thể truy xuất trực tiếp các API nội bộ của Module Auth. Chúng giao tiếp ở tầng Component hoặc Global Store nếu cần.

---

## 3. 🛡️ Quy trình Quản lý Trạng thái & Data Flow 

Loại bỏ hoàn toàn kiến trúc store quản lý trạng thái tĩnh (Zustand/Redux), dự án dịch chuyển sang hướng Server-State-Driven của **React Query**:

### A. Chiến lược Lấy và Ánh xạ Dữ liệu (API Fetching & Model Mapping)
Đây là quy tắc **bắt buộc** để cách ly rủi ro khi Backend thay đổi API. Giao diện (UI) tuyệt đối không dùng trực tiếp dữ liệu thô (Raw Data) trả về từ Backend.

1. **Gọi HTTP (API Layer):** `api.cake.ts` sử dụng custom axios/fetch (`http.ts`) để gọi lên server Express. Dữ liệu nhận về được định kiểu tạm là `ICakeDTO` (Data Transfer Object).
2. **Ánh xạ Model (Mapper Layer):** Dữ liệu DTO ngay lập tức được truyền qua một hàm mapper (vd: `mapCakeToModel(dto)` tại `mapper.ts`). Hàm này xử lý các việc như:
   - Đổi tên biến snake_case từ DB thành camelCase (ví dụ: `created_at` $\to$ `createdAt`).
   - Format lại giá tiền (Ví dụ: `price: 50000` $\to$ `formattedPrice: "50.000đ"`).
   - Xử lý các giá trị `null` / `undefined` thành giá trị mặc định.
3. **Lưu Cache (React Query Hook):** Custom hook (vd: `useCakesQuery()`) sẽ nhận Frontend Model đã sạch sẽ từ bước 2 và ném vào Query Cache.
4. **Hiển thị (UI Component):** Bề mặt React component / Antd Table chỉ việc bế Model xịn sò ra để render lên màn hình.

### B. Invalidation & Optimistic Updates
1. **Mutating:** Khi tạo mới 1 món, gọi `useAddToCartMutation()`.
2. **Invalidation:** Ngay khi trả Result Success $\to$ React Query gọi `invalidateQueries` ép các Component dùng chung dữ liệu tự động re-fetch và chạy lại quy trình Mapping phía trên.

### C. Authentication Sync (Dòng chảy Xác thực)
1. Giữ chuẩn **JWT** Token (Access Token).
2. Khi xử lý Login thành công, Web Client lưu lại token qua **Local Storage**. 
3. File cầu nối `lib/http.ts` đóng vài trò Interceptor: Dính Token này vào dòng `Authorization: Bearer <T>` ở mọi API request. Lỗi Unauthorized 401 thì bắn Global event / tự `remove` token và đá văng về `/login`.

---

## 4. 🎨 Mapping Design System & CSS

Vì dùng Tailwind 4 (Native CSS variables config):

1. Hệ thống Tokens từ `website-design-system-token.json` sẽ được extract tự động (hoặc thủ công bằng CLI) các giá trị `cssVariables` và `palette` đưa vào file **`app/globals.css`**.
2. **Định dạng `@theme` Tailwind 4:**
   ```css
   @theme {
     --color-primary-500: #533afd; /* Theo token */
     --color-hds-brand-900: var(--hds-color-util-brand-900);
   }
   ```
3. Nhờ đó, team Dev chỉ việc gọi `className="bg-primary-500 text-hds-brand-900"` đồng nhất trực tiếp không bị vỡ Layout.

---

## 5. 📏 Tiêu chuẩn Lập trình (Strict Rules)

1. **Next.js thuần tuý là Client UI (KHÔNG XỬ LÝ BACKEND):** Ứng dụng Next.js này (gồm cả `/user` và `/admin`) tuyệt đối KHÔNG chứa bất kỳ logic Backend nào (Không khai báo Route Handlers `/app/api`, không kết nối Database hay viết API trực tiếp ở Next.js). Toàn bộ nghiệp vụ Backend phải nằm ở server Express. Next.js đóng vai trò nhận UI và gọi sang Express thông qua custom axios/fetch (`http.ts`).
2. **"Use Client" rất khắt khe:** Chỉ tận dụng ở Components cấp độ thấp sát tương tác (`<Login_Form />`, `<Add_To_Cart_Button />`). Hạn chế tối đa đặt `"use client"` ở File `page.tsx` gốc các mặt trang tĩnh.
3. **React Query bọc ngoài Layer:** Phân đoạn kĩ file `api.*.ts` (chỉ phụ trách fetch/JSON) $\to$ file `hooks/queries/...` (chỉ phụ trách React Query Logic) $\to$ `Component` (Chỉ lấy `{ data, isLoading }`).
4. 100% Request đầu vào ở tầng Form được kiểm định nhờ **React Hook Form + Zod** trước khi Mutation API. Đảm bảo UI luôn chặn sai sót trước khi đẩy lên Backend.

---

## 6. 🚨 Kiến trúc Bắt & Xử lý Lỗi Bề Mặt (Global Error Handling)

Nhằm tránh việc Developer phải viết khối lệnh `try...catch` dài dòng ở hàng trăm Component, hệ thống xây dựng mô hình **Bắt lỗi tập trung (Centralized Error Catching)** xuyên suốt luồng kết nối Express $\to$ Next.js UI:

### A. Chuẩn hoá cấu trúc lỗi từ Server
Mọi Response HTTP mang mã 40x / 50x từ Express Server phải tuân thủ chuẩn JSON cố định:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu email không đúng định dạng",
    "details": [...] 
  }
}
```

### B. Móc chặn Interceptor (`lib/http.ts`)
* Axios/Fetch khai báo ngầm hàm Interceptor chặn Response. 
* Nếu phát hiện Status `>= 400`, file `http.ts` tiến hành phân tích cục JSON lỗi trên $\to$ Ném ra (Throw) một Object `ApiError` thống nhất có chứa `message`, `code` và `statusCode`.

### C. Gắn vào UI Phản hồi nhanh qua React Query
* Toàn bộ Component sẽ uỷ thác lại lỗi cho React Query thông qua cấu hình Global tại `providers.tsx`. 
* Khi React Query hứng được lỗi từ Fetch $\to$ Tại hook `onError` toàn cục, frontend tự động kích hoạt **Ant Design Notification/Message**:  `message.error(error.message)` để văng Toast đỏ lên màn hình người dùng.
* **Component Code (Gọn Gàng):**
  ```tsx
  // Không cần try...catch!
  const { mutate } = useAddToCartMutation();
  return <Button onClick={() => mutate({ cakeId })}>Mua Bánh</Button>;
  ```
  Nếu Express báo Hết Bánh (Lỗi 400 $\to$ Kèm thông điệp "Sản phẩm hiện đã hết") $\to$ Toast Antd sẽ tự động vọt lên báo "Sản phẩm hiện đã hết" mà bạn không cần phải viết thêm dòng render alert nào ở Component. Lập trình viên chỉ cần lo nhánh "Thành Công" (Happy Path).
