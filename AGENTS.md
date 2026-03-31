# AGENTS.md

## Language Rules
- Chat với user → Tiếng Việt  
- Thực hiện công việc (thinking, tools, code, actions) → English  
- Tách rõ giao tiếp và xử lý, không trộn lẫn

## Coding Rules
*   **No `any` type:** Do not use the `any` type in TypeScript/JavaScript code. The agent must use explicit types, `unknown`, or `never` instead.
*   **Use typed contracts:** Ensure all functions and variables have specific types defined.
