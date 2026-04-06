# Story 4: Cart & Wishlist Restructuring [✅ DONE]

## 📋 Mô tả
Chuyển đổi các thao tác quản lý giỏ hàng và sản phẩm yêu thích của người dùng vào Route handler.

## 🛠️ Bản đồ Biến đổi Mã nguồn (Code Transformation Map)

| Hành động | Nguồn (Cũ) | Đích (Mới) |
|-----------|------------|------------|
| Lấy giỏ hàng | `cart.service.getCart` | `router.get('/')` (trong `cart.routes.js`) |
| Thêm vào giỏ | `cart.service.addToCart` | `router.post('/items')` |
| Sửa số lượng | `cart.service.updateQuantity` | `router.put('/items/:id')` |
| Xóa khỏi giỏ | `cart.service.removeFromCart` | `router.delete('/items/:id')` |
| Toggle yêu thích | `wishlist.service.toggle` | `router.post('/toggle')` (trong `wishlist.routes.js`) |

## ⚙️ Chi tiết thực hiện (Step-by-Step)

### Bước 1: Tạo Validation (`validations/cart.validation.js`)
- Schema: `addItem`, `updateQuantity`.

### Bước 2: Tái cấu trúc Route (`routes/cart.routes.js`)
**Cấu trúc logic bên trong Route Handler:**
1.  **POST `/items` (Thêm vào giỏ):**
    - Kiểm tra sản phẩm đã có trong giỏ chưa (`User.findOne({ "cart.cake_id": cakeId })`).
    - Nếu có: `$inc` số lượng của phần tử mảng đó.
    - Nếu chưa: `$push` phần tử mới vào mảng `cart`.
2.  **DELETE `/items/:id`:**
    - Sử dụng `$pull` để xóa phần tử mảng theo `cake_id` hoặc `item_id`.

### Bước 3: Logic đặc biệt (Business Logic)
- **Wishlist:** Sử dụng `User.findByIdAndUpdate` với `$addToSet` (để tránh trùng lặp) hoặc `$pull` tùy trạng thái hiện tại.

## 🧪 Kết quả mong đợi (Before vs After)

**Sau (Route duy nhất - Add to cart):**
```javascript
router.post('/items', async (req, res) => {
  const { cake_id, quantity } = req.body;
  const user = await User.findById(req.user.id);
  const existingItem = user.cart.find(item => item.cake_id.toString() === cake_id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.cart.push({ cake_id, quantity });
  }
  
  await user.save();
  return sendSuccess(res, user.cart);
});
```

## ✅ Danh sách file bị xóa
- `web-server/controllers/cart.controller.js`
- `web-server/services/cart.service.js`
- `web-server/controllers/wishlist.controller.js`
- `web-server/services/wishlist.service.js`
