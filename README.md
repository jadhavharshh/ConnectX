# ConnectX

ConnectX is a full-stack learning management system (LMS) designed for educational institutions. It integrates modern web technologies and AI services to streamline content delivery, communication, and task management.

## 🧱 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **AI Services:** Python, Flask
- **Monorepo:** Turborepo with pnpm

---

## 📁 Project Structure

```
ConnectX/
├── apps/
│   ├── client/           # React frontend
│   ├── server/           # Node.js backend
│   └── pythonserver/     # Python AI services
├── packages/             # Shared packages
│   ├── eslint-config/    # ESLint configurations
│   ├── typescript-config/ # TypeScript configurations
│   └── ui/              # Shared UI components
├── package.json          # Root package.json with turbo scripts
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json           # Turbo configuration
```

### apps/client/
- Built with Vite for fast development and builds.
- Main source code lives in `apps/client/src/`.
- Handles routing, authentication UI, tasks, announcements, and chat frontend.

### apps/server/
- Express backend with REST APIs.
- Manages users, tasks, announcements, and real-time chat using Socket.IO.
- Main entry point: `apps/server/src/index.ts`

### apps/pythonserver/
- Flask server handling AI-powered features (e.g., content generation, smart replies).
- Main entry point: `apps/pythonserver/main.py`

---

## ✅ Prerequisites

- Node.js 18+ & pnpm
- Python 3.8+
- MongoDB

---

## 🚀 Getting Started

### Quick Start (Recommended)
```bash
# Install dependencies for all packages
pnpm install

# Start all applications in development mode
pnpm run dev
```

### Individual Setup

#### 1. Install Dependencies
```bash
# Install all dependencies across the monorepo
pnpm install
```

#### 2. Environment Variables
Create `.env` files in each app directory:

**apps/client/.env:**
```
VITE_BACKEND_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

**apps/server/.env:**
```
DATABASE_URL=mongodb://localhost:27017/connectx
PORT=5001
JWT_SECRET=your_jwt_secret
```

**apps/pythonserver/.env:**
```
PORT=6001
GROQ_API_KEY=your_api_key
```

#### 3. Install Python Dependencies
```bash
cd apps/pythonserver
pip3 install -r requirements.txt
```

---

## 🛠 Available Commands

### Development
```bash
# Start all applications in development mode
pnpm run dev

# Start individual applications
pnpm run dev --filter=client
pnpm run dev --filter=server
pnpm run dev --filter=pythonserver
```

### Build
```bash
# Build all applications
pnpm run build

# Build individual applications
pnpm run build --filter=client
pnpm run build --filter=server
```

### Linting
```bash
# Lint all applications
pnpm run lint

# Lint individual applications
pnpm run lint --filter=client
```

### Production
```bash
# Start all applications in production mode
pnpm run start
```

---

## 🌐 Development URLs

When running `pnpm run dev`, applications will be available at:

- **Frontend (React):** http://localhost:5173/
- **Backend (Node.js):** http://localhost:5001/
- **AI Server (Python):** http://localhost:6001/

---

## 💬 Features Overview

### Chat
- Real-time using Socket.IO
- Smart AI responses via Python server
- Relevant files:
  - Frontend: `apps/client/src/pages/Chat/Chat.tsx`
  - Backend routes: `apps/server/src/Routes/ChatRoutes.ts`

### Tasks & Announcements
- Managed in Node server
- Supports file/image uploads
- Related files:
  - Frontend: `apps/client/src/pages/Create-Tasks/CreateTasks.tsx`, `apps/client/src/pages/Create-Announcements/CreateAnnouncements.tsx`
  - Backend: `apps/server/src/controllers/DataController.ts`

### Styling
- Tailwind CSS
- Configuration in `apps/client/tailwind.config.js`

---

## 🧩 Troubleshooting

### Environment Variables
- Ensure `.env` files are correctly placed in each app directory (`apps/client/`, `apps/server/`, `apps/pythonserver/`).

### Dependency Issues
- If you face errors:
  ```bash
  rm -rf node_modules apps/*/node_modules
  pnpm install
  ```

### Python Server Issues
- Make sure to use `python3` instead of `python`
- Install Python dependencies: `pip3 install -r apps/pythonserver/requirements.txt`

### Backend URLs
- Ensure frontend `.env` matches backend URLs (Node and Python servers).

### Turbo Cache Issues
- If you encounter caching problems:
  ```bash
  pnpm run build --force
  # or
  rm -rf .turbo
  ```

---

## 🔄 Migration from npm

This project has been migrated from npm to pnpm with Turborepo. Key changes:

- **Package Manager:** Now uses pnpm instead of npm
- **Monorepo Structure:** Organized with Turborepo for better caching and parallel execution
- **Build System:** Turbo handles build orchestration and caching
- **Workspace:** Configured with pnpm-workspace.yaml

---

Happy building with ConnectX! 🚀

