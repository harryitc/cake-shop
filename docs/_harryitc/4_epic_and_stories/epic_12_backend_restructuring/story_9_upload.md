# Story 9: Upload Module Restructuring [✅ DONE]

## 📋 Mô tả
Xử lý tải lên tệp tin và tối ưu hóa hình ảnh trực tiếp tại Route. Chuyển đổi logic xử lý tệp sang kiến trúc Route-Centric.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Tải ảnh đơn | `upload.controller.uploadSingle` | `router.post('/single')` |
| Tải nhiều ảnh | `upload.controller.uploadMultiple` | `router.post('/multiple')` |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Sửa đổi Route (`routes/upload.routes.js`)
**Cấu trúc logic bên trong Route Handler:**
1.  **Middleware:** Sử dụng `upload.middleware` (Multer) để nhận file.
2.  **Image Processing:** 
    - Nếu là ảnh, sử dụng `sharp(req.file.buffer)` để resize và nén.
    - Lưu file vào `public/uploads/`.
3.  **Return:** Trả về URL của file vừa upload.

### Bước 2: Logic đặc biệt (Business Logic)
- **Error Handling:** Phải bắt lỗi `LIMIT_FILE_SIZE` từ Multer và trả về `ApiError.BAD_REQUEST`.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Upload single):**
```javascript
router.post('/single', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) throw ApiError.BAD_REQUEST('Vui lòng chọn ảnh');
  
  const fileName = `${Date.now()}-${req.file.originalname}`;
  const filePath = `public/uploads/${fileName}`;
  
  // Xử lý ảnh trực tiếp tại Route
  await sharp(req.file.buffer)
    .resize(800)
    .toFile(filePath);
    
  return sendSuccess(res, { url: `/uploads/${fileName}` }, 'Upload thành công');
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/upload.controller.js`
- `web-server/services/upload.service.js` (nếu có)
