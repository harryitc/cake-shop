---
task_id: 3_cake_list_page
epic_id: epic_2_cakes
title: "Cake Pages — User & Admin Frontend"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - frontend
created_at: 2026-03-24
---

# 📝 Task 3: Cake Pages — User & Admin Frontend

> **Epic:** [epic_2_cakes](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Xây dựng module Cakes trên Frontend: giao diện danh sách + chi tiết cho User, bảng CRUD quản lý cho Admin.

---

## 📖 User Story

**As a** user  
**I want to** xem danh sách bánh và chi tiết từng bánh  
**So that** tôi có thể chọn và thêm vào giỏ hàng

---

## 🔧 Technical Breakdown

### Frontend — User (`web-client/user`)

**Data Flow:**
```
/cakes/page.tsx → <CakeList /> → useCakesQuery() → cakeApi.getAll() → GET /api/v1/cakes
/cakes/[id]/page.tsx → <CakeDetail /> → useCakeQuery(id) → cakeApi.getById() → GET /api/v1/cakes/:id
```

**Files cần tạo / sửa (User):**
- [ ] `modules/cakes/types.ts` — `ICakeDTO` (raw), `ICake` (mapped model)
- [ ] `modules/cakes/api.ts` — `cakeApi.getAll(params)`, `cakeApi.getById(id)`
- [ ] `modules/cakes/mapper.ts` — `mapCakeToModel(dto: ICakeDTO): ICake`
- [ ] `modules/cakes/hooks.ts` — `useCakesQuery(params)`, `useCakeQuery(id)`
- [ ] `modules/cakes/components/CakeList.tsx` — Grid cards Ant Design, có ô tìm kiếm
- [ ] `modules/cakes/components/CakeCard.tsx` — Card hiển thị ảnh, tên, giá
- [ ] `modules/cakes/components/CakeDetail.tsx` — Chi tiết đầy đủ + nút "Thêm vào giỏ"
- [ ] `app/(shop)/cakes/page.tsx` — import `<CakeList />`
- [ ] `app/(shop)/cakes/[id]/page.tsx` — import `<CakeDetail />`

### Frontend — Admin (`web-client/admin`)

**Files cần tạo / sửa (Admin):**
- [ ] `modules/cakes/` — tương tự user nhưng thêm `cakeApi.create()`, `update()`, `delete()`
- [ ] `modules/cakes/hooks.ts` — thêm `useCreateCakeMutation()`, `useUpdateCakeMutation()`, `useDeleteCakeMutation()`
- [ ] `modules/cakes/components/CakeTable.tsx` — Ant Design Table: columns, nút Edit/Delete
- [ ] `modules/cakes/components/CakeFormModal.tsx` — Modal tạo/sửa: React Hook Form + Zod
- [ ] `app/admin/cakes/page.tsx` — import `<CakeTable />`

---

## ✅ Acceptance Criteria

- [ ] `/cakes` hiển thị danh sách dạng grid, mỗi card có ảnh, tên, giá
- [ ] Ô tìm kiếm debounce 300ms, gọi lại API với `search` param
- [ ] `/cakes/[id]` hiển thị đầy đủ thông tin, nút "Thêm vào giỏ"
- [ ] Trang loading state: hiển thị Ant Design Skeleton khi đang fetch
- [ ] `/admin/cakes` có bảng, nút "Tạo mới", nút Edit/Delete trên mỗi hàng
- [ ] Modal tạo/sửa validate inline trước khi gọi API

---

## 📌 Notes

- `mapper.ts`: chuyển `price` (số) → `formattedPrice` (VD: `"150.000đ"`)
- User FE: nút "Thêm vào giỏ" gọi Cart mutation (epic_3_cart), nên để stub trước
- Ảnh bánh dùng URL, nếu null dùng placeholder image
