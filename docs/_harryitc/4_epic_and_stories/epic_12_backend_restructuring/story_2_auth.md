# Story 2: Auth Module Restructuring [✅ DONE]

## 📋 Mô tả
Chuyển đổi logic xác thực (Auth) vào Route. Xử lý tập trung logic Token và Mật khẩu.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Đăng ký | `auth.service.register` | `router.post('/register')` |
| Đăng nhập | `auth.service.login` | `router.post('/login')` |
| Đổi mật khẩu | `auth.service.changePassword` | `router.post('/change-password')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/auth.validation.js`)
- Schema: `register`, `login`.
- Di chuyển logic Joi từ `auth.controller.js`.

### Bước 2: Tái cấu trúc Route (`routes/auth.routes.js`)
**Cấu trúc logic bên trong Route Handler:**
1.  **Validation:** `validation.schema.validate(req.body)`.
2.  **Database Check:** `User.findOne({ email })`.
3.  **Password Ops:** Sử dụng `bcryptjs` trực tiếp: `compare(password, user.password)`.
4.  **Token Ops:** Sử dụng `jsonwebtoken` tạo `accessToken` trực tiếp trong handler.
5.  **Response:** Trả về data người dùng kèm token.

### Bước 3: Logic đặc biệt (Business Logic)
- Xóa bỏ mật khẩu khỏi object người dùng trước khi trả về.
- Ném lỗi `ApiError.UNAUTHORIZED` nếu mật khẩu sai hoặc user không tồn tại.

## 🧪 Kết quả mong đợi (Before vs After)

**Trước (Service):**
```javascript
// authService.login()
const user = await User.findOne({ email });
const isMatch = await bcrypt.compare(password, user.password);
const token = jwt.sign(...);
return { user, token };
```

**Sau (Route duy nhất):**
```javascript
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw ApiError.UNAUTHORIZED('Sai tài khoản hoặc mật khẩu');
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  return sendSuccess(res, { user, token });
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/auth.controller.js`
- `web-server/services/auth.service.js`
