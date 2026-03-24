---
task_id: 2_cart_page
epic_id: epic_3_cart
title: "Cart Page — Frontend"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - frontend
created_at: 2026-03-24
---

# 📝 Task 2: Cart Page — Frontend

> **Epic:** [epic_3_cart](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng module Cart và trang `/cart` trên User Frontend. User xem giỏ hàng, xóa item và tiến hành đặt hàng.

---

## 📖 User Story

**As a** logged-in user  
**I want to** xem giỏ hàng, xóa item và đặt hàng  
**So that** tôi có thể hoàn thành việc mua bánh

---

## 🔧 Technical Breakdown

### Frontend — User (`web-client/user`)

**Data Flow:**
```
/cart/page.tsx → <CartTable /> → useCartQuery() → cartApi.getCart() → GET /api/v1/cart
<AddToCartBtn /> → useAddToCartMutation() → cartApi.addItem() → POST /api/v1/cart/items
```

**Files cần tạo / sửa:**
- [ ] `modules/cart/types.ts` — `ICartItem`, `ICart`, `IAddToCartPayload`
- [ ] `modules/cart/api.ts` — `cartApi.getCart()`, `cartApi.addItem()`, `cartApi.removeItem(id)`
- [ ] `modules/cart/hooks.ts` — `useCartQuery()`, `useAddToCartMutation()`, `useRemoveCartItemMutation()`
- [ ] `modules/cart/components/CartTable.tsx` — Ant Design Table: ảnh bánh, tên, giá, số lượng, subtotal, nút Xóa
- [ ] `modules/cart/components/AddToCartBtn.tsx` — `'use client'`, dùng `useAddToCartMutation()`, hiển thị Toast
- [ ] `app/(shop)/cart/page.tsx` — import `<CartTable />`, hiển thị tổng tiền, nút "Đặt hàng"

**Tích hợp vào CakeDetail:**
- [ ] Import `<AddToCartBtn cakeId={...} />` vào `modules/cakes/components/CakeDetail.tsx`

---

## ✅ Acceptance Criteria

- [ ] `/cart` hiển thị danh sách items với ảnh, tên, giá đơn, số lượng, thành tiền
- [ ] Hiển thị tổng tiền cuối trang
- [ ] Nút "Xóa" xóa item và tự cập nhật list (React Query invalidateQueries)
- [ ] Giỏ rỗng → hiển thị Empty state Ant Design + link về `/cakes`
- [ ] Nút "Thêm vào giỏ" trên `/cakes/[id]` hoạt động, hiện Toast "Đã thêm vào giỏ"
- [ ] Chưa đăng nhập bấm "Thêm vào giỏ" → redirect `/login`
- [ ] Nút "Đặt hàng" ở trang cart → sau này nối vào epic_4_orders (stub `router.push('/checkout')`)

---

## 📌 Notes

- `useAddToCartMutation` sau khi success: `invalidateQueries(['cart'])` để tự refresh
- `AddToCartBtn` là `'use client'` vì cần onClick handler
- Khi giỏ hàng update/xóa: dùng optimistic UI (tùy chọn) hoặc đơn giản là invalidate + refetch
