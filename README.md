# SmartFeed AI

MERN-based feed and silage quality screening workspace.

## Stack

- React + Vite frontend
- Node.js + Express API
- MongoDB persistence when `MONGODB_URI` is configured
- Demo fallback data when MongoDB is unavailable

## Run

Double-click `run-mern.bat`, or run these commands in separate terminals:

```powershell
cd backend
npm install
npm start
```

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The API health check is available at `http://localhost:8000/api/health`.

## MongoDB

Set `MONGODB_URI` in `backend/.env` to enable MongoDB persistence. Without it, the app uses the built-in demo dataset so the interface remains usable locally.

## Languages

English and Hindi are fully supported for all labels, settings, notifications, alerts, and AI Assistant interactions.
