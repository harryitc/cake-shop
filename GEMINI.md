# Cake Shop Project

## Project Overview

This is a full-stack web application for a Cake Shop, organized as a monorepo. It features a Node.js/Express backend for RESTful APIs and two separate Next.js frontends (for users and administrators).

**Key Components:**
- **Backend (`web-server/`)**: An Express.js application providing RESTful APIs. It uses MongoDB (via Mongoose) for data storage, JWT for authentication, and Joi for request validation. The architecture follows a standard Route-Controller-Service-Schema pattern.
- **Admin Panel (`web-client/admin/`)**: A Next.js application (React 19, App Router) designed for shop administrators to manage products, orders, and users. It utilizes Tailwind CSS, Ant Design, Shadcn UI, and React Query.
- **User Storefront (`web-client/user/`)**: A Next.js application serving as the customer-facing e-commerce storefront.
- **Documentation (`docs/`)**: Extensive project planning, PRD, architecture design, and specific epics/tasks are maintained in the `docs/_harryitc/` directory.

## Building and Running

**1. Infrastructure (Database)**
Start the MongoDB replica set using Docker Compose:
```bash
docker-compose up -d
```

**2. Backend API (`web-server/`)**
```bash
cd web-server
npm install
# Cấu hình file .env (đặc biệt là các biến SMTP_*)
npm run dev # Chạy tại http://localhost:5000
```

**3. User Frontend (`web-client/user/`)**
```bash
cd web-client/user
npm install
npm run dev # Chạy tại http://localhost:3000
```

**4. Admin Frontend (`web-client/admin/`)**
```bash
cd web-client/admin
npm install
npm run dev # Chạy tại http://localhost:3001
```

## Development Conventions

- **Git & Workflow**: Sau khi thực hiện xong một tính năng hoặc một yêu cầu chỉnh sửa nào đó, BẮT BUỘC phải thực hiện commit lại những thay đổi tương ứng. Nếu là yêu cầu thêm tính năng hoặc thay đổi logic/kiến trúc, PHẢI cập nhật lại tài liệu trong thư mục `docs/` để phản ánh đúng hiện trạng.
- **Documentation-Driven Development**: All major features and epics are extensively documented in the `docs/` folder before implementation. Changes to architecture or schemas should align with these specs.
- **Backend Architecture**: The Express app enforces a strict separation of concerns:
  - `routes/`: Define API endpoints and attach middleware (auth, roles).
  - `controllers/`: Handle HTTP requests, extract parameters, perform Joi validation, and format HTTP responses.
  - `services/`: Contain the core business logic and database interactions.
  - `schemas/`: Mongoose models defining the database schema and hooks (e.g., auto-generating slugs).
- **Frontend Stack**: Next.js applications utilize modern React practices, including App Router, React Hook Form, Zod validation, Tailwind CSS for styling, and React Query for API data fetching and state management.
