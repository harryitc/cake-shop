---
task_id: <index>_<task_name>     # VD: 1_register — khớp với tên file
epic_id: <epic_folder_name>      # VD: epic_1_auth — khớp với epic_id trong OVERVIEW.md
title: "[Tên Task đầy đủ]"
status: todo                     # todo | in-progress | done | blocked
priority: high                   # high | medium | low
related_overview: ./OVERVIEW.md
layer:                           # backend | frontend | both
  - backend
  - frontend
created_at: YYYY-MM-DD
---

# 📝 Task N: [Tên Task]

> **Epic:** [`<epic_id>`](./OVERVIEW.md)

---

## 🎯 Mục tiêu Task

[1-2 câu: task này làm gì và tại sao cần.]

---

## 📖 User Story

**As a** [user / admin / system]  
**I want to** [hành động cụ thể]  
**So that** [lợi ích / mục đích]

---

## 🔧 Technical Breakdown

### Backend (nếu có)

**API Endpoint:**
```
METHOD /api/v1/<path>
```

**Request body:**
```json
{ "field": "type" }
```

**Response thành công (`20x`):**
```json
{ "data": {}, "message": "success" }
```

**Các lỗi cần xử lý:**
| Mã lỗi | Trường hợp |
|--------|-----------|
| 400 | Validation sai |
| 401 | Chưa đăng nhập |
| 404 | Không tìm thấy |

**Files cần tạo / sửa:**
- [ ] `schemas/<Name>.schema.js`
- [ ] `services/<module>.service.js` — hàm `<functionName>()`
- [ ] `controllers/<module>.controller.js` — handler `<handlerName>()`
- [ ] `routes/<module>.routes.js` — mount endpoint

---

### Frontend (nếu có)

**Route / Page:** `/path/to/page`

**Data Flow:**
```
page.tsx → <Component /> → hooks.ts → api.ts → http.ts → Express API
```

**Files cần tạo / sửa:**
- [ ] `modules/<module>/types.ts` — interface `I<Model>`
- [ ] `modules/<module>/api.ts` — `<module>Api.<action>()`
- [ ] `modules/<module>/mapper.ts` — `map<Model>ToModel(dto)`
- [ ] `modules/<module>/hooks.ts` — `use<Action>()`
- [ ] `modules/<module>/components/<Name>.tsx`
- [ ] `app/<route>/page.tsx`

---

## ✅ Acceptance Criteria

- [ ] [Điều kiện 1 — cụ thể, test được]
- [ ] [Điều kiện 2]

---

## 📌 Notes

- [Ghi chú kỹ thuật, edge cases, ràng buộc cần lưu ý]
