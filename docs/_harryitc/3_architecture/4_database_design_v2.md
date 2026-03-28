---
title: Database Design & Schemas (V2)
version: 2.0
type: architecture
related_docs:
  - 1_system_architecture.md
  - 9_bulk_data_architecture.md
  - 10_loyalty_design.md
---

# 🗄️ DATABASE DESIGN & SCHEMAS (V2)

> Tài liệu này mô tả chi tiết các Schema Mongoose hiện có trong hệ thống Cake Shop tính đến Phase 5 (Loyalty Program).

---

## 1. 👤 `User.schema.js`
Mở rộng từ V1 để hỗ trợ Loyalty và Profile nâng cao.
- `email`: String (Unique).
- `password_hash`: String.
- `role`: Enum `['user', 'admin']`.
- `full_name`: String.
- `phone`: String.
- `address`: String.
- `avatar_url`: String.
- **Loyalty Fields**:
    - `loyalty_points`: Number (Default 0).
    - `total_spent`: Number (Default 0).
    - `rank`: Enum `['BRONZE', 'SILVER', 'GOLD', 'DIAMOND']` (Default `BRONZE`).
    - `rank_lock`: Boolean (Default false).

## 2. 🎂 `Cake.schema.js`
Mở rộng để hỗ trợ Danh mục, Biến thể và Đánh giá.
- `name`: String.
- `description`: String.
- `image_url`: String.
- `price`: Number.
- `stock`: Number (Tổng tồn kho cho bản Standard).
- `category`: ObjectId (Ref `Category`).
- `slug`: String (Unique).
- **Variants**:
    - `variants`: Array of { `size`: String, `price`: Number, `stock`: Number }.
- **Review Stats**:
    - `average_rating`: Number (Default 0).
    - `review_count`: Number (Default 0).

## 3. 🧾 `Order.schema.js`
Hỗ trợ Coupon, Loyalty Points và Biến thể.
- `user_id`: ObjectId (Ref `User`).
- `items`: Array of:
    - `cake_id`: ObjectId.
    - `variant_id`: ObjectId (Optional).
    - `variant_size`: String.
    - `quantity`: Number.
    - `price_at_buy`: Number.
- `total_price`: Number (Giá gốc trước giảm giá).
- `coupon_code`: String.
- `discount_amount`: Number (Từ Coupon).
- `points_used`: Number.
- `points_discount_amount`: Number (Từ Points).
- `final_price`: Number (Giá thanh toán cuối cùng).
- `status`: Enum `['PENDING', 'CONFIRMED', 'DONE', 'REJECTED']`.
- `address`: String.

## 4. 🗃️ `Category.schema.js`
- `name`: String.
- `slug`: String (Unique).
- `description`: String.
- `image_url`: String.

## 5. 🏷️ `Coupon.schema.js`
- `code`: String (Unique).
- `discount_percent`: Number.
- `min_order_value`: Number.
- `max_discount_value`: Number.
- `expiry_date`: Date.
- `used_count`: Number.
- `usage_limit`: Number.
- `is_active`: Boolean.

## 6. ⭐ `Review.schema.js`
- `user`: ObjectId (Ref `User`).
- `cake`: ObjectId (Ref `Cake`).
- `order`: ObjectId (Ref `Order`).
- `rating`: Number (1-5).
- `comment`: String.

## 7. ❤️ `Wishlist.schema.js`
- `user`: ObjectId (Ref `User`).
- `cakes`: Array of ObjectId (Ref `Cake`).

## 8. 📜 `PointHistory.schema.js`
- `user`: ObjectId (Ref `User`).
- `order`: ObjectId (Ref `Order`, Optional).
- `admin`: ObjectId (Ref `User`, Optional).
- `points_change`: Number.
- `type`: Enum `['PLUS', 'MINUS']`.
- `reason`: String.

## 9. ⚙️ `LoyaltyConfig.schema.js`
- `key`: String (Thường là 'default_config').
- `tier_thresholds`: Object { `SILVER`: Number, `GOLD`: Number, `DIAMOND`: Number }.
- `point_ratios`: Object { `BRONZE`: Number, `SILVER`: Number, `GOLD`: Number, `DIAMOND`: Number }.
- `point_to_vnd_ratio`: Number.
- `max_point_discount_percentage`: Number.

## 10. 📁 `ImportHistory.schema.js`
- `entityType`: String (e.g., 'cakes').
- `fileName`: String.
- `status`: Enum `['processing', 'completed', 'failed']`.
- `totalRows`: Number.
- `successCount`: Number.
- `errorCount`: Number.
- `errorDetails`: Array of { `row`: Number, `data`: Object, `message`: String }.
- `duration`: Number (ms).
- `createdBy`: ObjectId (Ref `User`).
