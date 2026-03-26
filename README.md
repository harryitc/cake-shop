# 🎂 Cake Shop - Monorepo

Welcome to the Cake Shop Project! This project is a full-stack monorepo featuring a backend (Express) and two frontends (Next.js).

## 🚀 Getting Started

### Prerequisites
- **Docker**: For running MongoDB replica sets.
- **Node.js**: Versions 18.x or later.

### Quick Start
You can run all three services concurrently using the provided bash script.

```bash
# 1. Start MongoDB (if not running)
docker-compose up -d

# 2. Run the start-up script

# Option A: Start EVERYTHING (Server + User + Admin)
./dev.sh

# Option B: Start FRONTENDS ONLY (User + Admin)
./web.sh
```

## 🏗 Project Structure
- `web-server/`: Express.js & MongoDB (v4000)
- `web-client/user/`: Customer Storefront (v3000)
- `web-client/admin/`: Admin Panel (v3001)

Refer to [GEMINI.md](GEMINI.md) for more detailed development conventions.
