---
task_id: 1_cake_schema
epic_id: epic_2_cakes
title: "Cake Schema & Service Base"
status: todo
priority: high
related_overview: ./OVERVIEW.md
layer:
  - backend
created_at: 2026-03-24
---

# 📝 Task 1: Cake Schema & Service Base

> **Epic:** [epic_2_cakes](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

Định nghĩa Mongoose Schema cho Cake và xây dựng các hàm service base (getAll, getById) làm nền tảng cho các task tiếp theo.

---

## 📖 User Story

**As a** developer  
**I want to** có schema và service chuẩn cho Cake  
**So that** các API CRUD có thể dựa vào để thao tác dữ liệu nhất quán

---

## 🔧 Technical Breakdown

### Backend

**Cake Schema fields:**
```js
{
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  image_url: { type: String },
  slug: { type: String, unique: true }, // tự gen từ name
  createdAt, updatedAt // timestamps: true
}
```

**Service functions:**
- `cakeService.getAll({ page, limit, search })` — aggregate pagination + search theo `name`
- `cakeService.getById(id)` — findById, throw 404 nếu null

**Files cần tạo / sửa:**
- [ ] `schemas/Cake.schema.js` — schema + model export
- [ ] `services/cake.service.js` — `getAll()`, `getById()`

---

## ✅ Acceptance Criteria

- [ ] Schema có đủ fields, `price >= 0`, timestamps tự động
- [ ] `slug` được tự tạo từ `name` khi `pre('save')`
- [ ] `getAll()` trả đúng cấu trúc `{ items, total, page, limit }`
- [ ] `getById()` throw error code `404` nếu không tìm thấy

---

## 📌 Notes

- Dùng thư viện `slugify` để gen slug từ name (hoặc tự viết đơn giản)
- `search` dùng MongoDB `$regex` case-insensitive trên field `name`
