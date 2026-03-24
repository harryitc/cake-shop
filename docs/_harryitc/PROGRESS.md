---
title: V1 Project Progress Tracker
project: Cake Shop
version: 1.0
created_at: 2026-03-24
---

# 🚀 Cake Shop V1 — Progress Tracker

> Cập nhật status của task khi bắt đầu `[/]` và hoàn thành `[x]`.

---

## Phase 0 — 📋 Docs: Epic & Stories
> Tạo cấu trúc tài liệu Epic & Stories

- [x] `epic_1_auth/` — OVERVIEW + 3 task files
- [x] `epic_2_cakes/` — OVERVIEW + 3 task files
- [x] `epic_3_cart/` — OVERVIEW + 2 task files
- [x] `epic_4_orders/` — OVERVIEW + 3 task files
- [x] `_templates/` — OVERVIEW_template + epic_task_template

**Status: ✅ DONE**

---

## Phase 1 — ⚙️ Backend: Setup & Infrastructure
> Refactor `web-server/` sang 3-layer architecture

**Spec:** không có epic riêng (cơ sở hạ tầng)

- [x] Cài dependencies: `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `joi`
- [x] Tạo cấu trúc thư mục: `config/`, `routes/`, `controllers/`, `services/`, `schemas/`, `middlewares/`, `utils/`
- [x] `config/db.config.js` — kết nối MongoDB
- [x] `app.js` — cấu hình lại CORS, json, mount routes, error-handler
- [x] `utils/response.utils.js` — `sendSuccess()` + `sendError()`
- [x] `middlewares/error-handler.js` — global catch-all
- [x] `.env` + `.env.example`

**Status: ✅ DONE**

---

## Phase 2 — 🔐 Backend: Auth Module
> **Spec:** [`epic_1_auth/`](./_harryitc/4_epic_and_stories/epic_1_auth/OVERVIEW.md)

- [x] `1_register` — Schema User + Service register + Controller + Route
- [x] `2_login` — Service login + Controller + Route
- [x] `3_auth_middleware` — `auth.middleware.js` + `role.middleware.js`

**Status: ✅ DONE**

---

## Phase 3 — 🎂 Backend: Cakes Module
> **Spec:** [`epic_2_cakes/`](./_harryitc/4_epic_and_stories/epic_2_cakes/OVERVIEW.md)

- [ ] `1_cake_schema` — Schema Cake + Service getAll/getById
- [ ] `2_cake_crud_api` — Service create/update/delete + Controller + Route (with auth guard)

**Status: 🔲 TODO**

---

## Phase 4 — 🛒 Backend: Cart Module
> **Spec:** [`epic_3_cart/`](./_harryitc/4_epic_and_stories/epic_3_cart/OVERVIEW.md)

- [ ] `1_cart_api` — Schema CartItem + Service + Controller + Route

**Status: 🔲 TODO**

---

## Phase 5 — 📦 Backend: Orders Module
> **Spec:** [`epic_4_orders/`](./_harryitc/4_epic_and_stories/epic_4_orders/OVERVIEW.md)

- [ ] `1_create_order` — Schema Order + OrderItem + Service (Transaction) + Controller + Route
- [ ] `2_order_list` — Service getOrders/getById + Controller + Route
- [ ] `3_update_order_status` — Service updateStatus (state machine) + Controller + Route

**Status: 🔲 TODO**

---

## Phase 6 — 🖥️ Frontend: User App (`web-client/user`)
> **Spec:** task files Frontend trong các epic

- [ ] Setup: `lib/http.ts` (LocalStorage token), `lib/providers.tsx`, `lib/antd-theme.ts`
- [ ] `epic_1_auth` → `1_register` FE + `2_login` FE (Form, hooks, api, pages)
- [ ] `epic_2_cakes` → `3_cake_list_page` (Module + `/cakes` + `/cakes/[id]`)
- [ ] `epic_3_cart` → `2_cart_page` (Module + `/cart`, `AddToCartBtn`)
- [ ] `epic_4_orders` → `2_order_list` (Module + `/orders`, `CheckoutModal`)

**Status: 🔲 TODO**

---

## Phase 7 — 🖥️ Frontend: Admin App (`web-client/admin`)
> **Spec:** phần Admin trong các epic task files

- [ ] Setup: `lib/http.ts`, `lib/providers.tsx`
- [ ] `epic_1_auth` → `2_login` FE Admin (`/admin/login`)
- [ ] `epic_2_cakes` → `3_cake_list_page` Admin (`/admin/cakes` — CRUD Table)
- [ ] `epic_4_orders` → `3_update_order_status` Admin (`/admin/orders` — Table + status update)

**Status: 🔲 TODO**

---

## Phase 8 — ✅ Integration & Testing

- [ ] Test full User flow: Register → Login → Cakes → Cart → Order → History
- [ ] Test full Admin flow: Login → CRUD Cake → Update Order Status
- [ ] Test error cases: 401, 403, 404, 400 validation
- [ ] CORS config cho cả 2 FE origins
- [ ] `.env` đầy đủ cho 3 projects

**Status: 🔲 TODO**

---

## 📊 Tổng tiến độ

| Phase | Mô tả | Status |
|-------|-------|--------|
| 0 | Docs — Epic & Stories | ✅ DONE |
| 1 | Backend Setup | ✅ DONE |
| 2 | Backend Auth | ✅ DONE |
| 3 | Backend Cakes | 🔲 TODO |
| 4 | Backend Cart | 🔲 TODO |
| 5 | Backend Orders | 🔲 TODO |
| 6 | Frontend User | 🔲 TODO |
| 7 | Frontend Admin | 🔲 TODO |
| 8 | Integration & Test | 🔲 TODO |
