# ConnectX

ConnectX is a full-stack learning management system (LMS) designed for educational institutions. It integrates modern web technologies and AI services to streamline content delivery, communication, and task management.

## 🧱 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **AI Services:** Python, Flask

---

## 📁 Project Structure

```
ConnectX/
├── client/           # React frontend
├── server/           # Node.js backend
└── pythonserver/     # Python AI services
```

### client/
- Built with Vite for fast development and builds.
- Main source code lives in `client/src/`.
- Handles routing, authentication UI, tasks, announcements, and chat frontend.

### server/
- Express backend with REST APIs.
- Manages users, tasks, announcements, and real-time chat using Socket.IO.
- Main entry point: `server/src/index.ts`

### pythonserver/
- Flask server handling AI-powered features (e.g., content generation, smart replies).
- Main entry point: `pythonserver/main.py`

---

## ✅ Prerequisites

- Node.js & npm/yarn
- Python 3.8+
- MongoDB

---

## 🚀 Getting Started

### 1. Frontend
```bash
cd client
npm install
```
Create a `.env` file:
```
VITE_BACKEND_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=your_key
```
Run development server:
```bash
npm run dev
```
Build for production:
```bash
npm run build
```

### 2. Node Server
```bash
cd server
npm install
```
Create a `.env` file:
```
DATABASE_URL=mongodb://localhost:27017/connectx
PORT=5001
JWT_SECRET=your_jwt_secret

```
Run in development:
```bash
npm run dev
```
Or use `nodemon`:
```bash
npx nodemon src/index.ts
```

### 3. Python Server
```bash
cd pythonserver
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file:
```
PORT=6000
GROQ_API_KEY=your_api_key
```
Run the server:
```bash
python main.py
```

---

## 🛠 Running All Components

### Development
Run each component in a separate terminal:
```bash
cd client && npm run dev
cd server && npm run dev
cd pythonserver && python main.py
```

### Production
- Build frontend: `npm run build`
- Deploy servers with your preferred method (Docker, PM2, etc.)

---

## 💬 Features Overview

### Chat
- Real-time using Socket.IO
- Smart AI responses via Python server
- Relevant files:
  - Frontend: `Chat.tsx`
  - Backend routes: `ChatRoutes.ts`

### Tasks & Announcements
- Managed in Node server
- Supports file/image uploads
- Related files:
  - Frontend: `CreateTasks.tsx`, `CreateAnnouncements.tsx`
  - Backend: `DataController.ts`

### Styling
- Tailwind CSS
- Configuration in `tailwind.config.js`

---

## 🧩 Troubleshooting

### Environment Variables
- Ensure `.env` files are correctly placed and configured in each directory.

### Dependency Issues
- If you face errors:
  ```bash
  rm -rf node_modules && npm install
  ```

### Backend URLs
- Ensure frontend `.env` matches backend URLs (Node and Python servers).

---

Happy building with ConnectX! 🚀

