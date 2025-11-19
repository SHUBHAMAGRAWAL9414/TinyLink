# TinyLink Deployment Guide

This guide walks you through deploying the TinyLink app (Frontend + Backend). It covers hosting the frontend on Vercel and the backend on Render or Railway. It also shows how to run the app locally and how to optionally serve the frontend from the backend for single-server deployments.

## Overview

Architecture:
- Frontend: React + Vite + Tailwind (folder: `frontend`) — deploy to Vercel
- Backend: Node + Express + MongoDB (folder: `backend`) — deploy to Render or Railway

Prerequisites:
- GitHub account (to connect repositories to hosting platforms)
- Vercel account (for frontend)
- Render or Railway account (for backend)
- Basic familiarity with Git and your terminal

Important files added:
- `backend/.env.example` — template for backend environment variables
- `frontend/.env.example` — template for frontend environment variables (Vite)
- `frontend/vercel.json` — Vercel config for SPA rewrites

---

## 1) Backend Deployment (Render)

This section shows how to deploy the backend to Render. You can follow similar steps on Railway.

1. Create a new Web Service on Render
   - Click "New" → "Web Service" → Connect your GitHub repository
   - Select the repo and the `backend` directory as the root (if requested)
2. Build & Start commands
   - Build command: (none required for this simple Node app)
   - Start command: `npm start`
3. Environment variables
   - Add the variables from `backend/.env.example`:
     - `PORT` — typically left empty for Render (Render supplies a port via $PORT)
     - `BASE_URL` — the full URL Render assigns to your service (e.g., `https://your-backend.onrender.com`)
     - `DATABASE_FILE` — e.g., `./data/tinylink.db`
     - `NODE_ENV=production`
   - Ensure you create the `data/` directory or configure a persistent disk (see below)
4. Database persistence
   - This project now uses MongoDB (Atlas or self-hosted) as the primary data store. The legacy SQLite `data/` folder has been removed from the repository and is intentionally ignored by `.gitignore` to avoid accidental commits of binary DB files.
   - If you previously relied on the SQLite file, migrate your data to MongoDB before removing local artifacts.
5. Deploy and verify
   - Deploy the service and copy the public URL. Use this value as `BASE_URL` and for the frontend's `VITE_API_BASE`.

### Alternative: Deploy to Railway
- Create a new project in Railway and connect your GitHub repo.
- Set the root to `backend` if requested.
- Add environment variables (same as above).
- Railway provides options to add a persistent volume. Use it for the SQLite file or consider switching to a hosted DB for production.

---

## 2) Frontend Deployment (Vercel)

1. Import project to Vercel
   - Go to Vercel dashboard → "New Project" → Import Git Repository
   - Select your repository and set the root directory to `frontend` (if the project is mono-repo)
2. Build & Output
   - Build command: `npm run build`
   - Output directory: `dist`
3. Environment variables
   - Add `VITE_API_BASE` with the deployed backend URL (e.g., `https://your-backend.onrender.com`)
   - Make sure there is no trailing slash on the URL
4. Add `vercel.json`
   - The repository already includes `frontend/vercel.json` with an SPA rewrite rule. This ensures client-side routes (e.g., `/code/:code`) work on direct navigation.
5. Deploy and verify
   - Deploy the project. Once deployed, confirm the frontend can call the backend API and create/redirect links.

---

## 3) Environment Variables Reference

Backend (`backend/.env`):
- `PORT` — port number (default 4000). Hosting platforms usually provide this automatically.
- `BASE_URL` — full public URL for your backend (e.g., `https://your-backend.onrender.com`). Used for constructing links.
- `DATABASE_FILE` — path to SQLite DB, e.g., `./data/tinylink.db`
- `NODE_ENV` — `production` for deployed services

Frontend (`frontend/.env`):
- `VITE_API_BASE` — backend API base (no trailing slash). Example: `https://your-backend.onrender.com`

Example local values (for testing):
- Backend: `BASE_URL=http://localhost:4000`, `DATABASE_FILE=./data/tinylink.db`, `NODE_ENV=development`
- Frontend: `VITE_API_BASE=http://localhost:4000`

---

## 4) Post-Deployment Verification

After both services are deployed:
- Open `<frontend_url>/` and confirm the app loads.
- Check backend health: `GET <backend_url>/healthz` — should return `{ ok: true }`.
- Create a short link using the UI and confirm it appears in the dashboard.
- Open the shortened link path (e.g., `<frontend_url>/abc123`) to verify redirect.
- Verify the Stats page for a code: `<frontend_url>/code/abc123`.

---

## 5) Troubleshooting

- CORS errors: Ensure the backend's `BASE_URL` and the frontend's `VITE_API_BASE` are correct. Confirm backend allows requests from the frontend origin.
- Database persistence: If data resets after deploys, configure a persistent disk/volume or use a hosted database (Postgres, etc.).
- 404 on refresh or client routes: Ensure `frontend/vercel.json` is present in the repo root under `frontend/` and Vercel project root is set to `frontend`.
- API connection failures: Confirm backend URL is reachable and environment variables are correctly set in the hosting panel.

---

## 6) Local Development Quick Reference

Backend:
```powershell
cd backend
npm install
# copy backend/.env.example to backend/.env and edit
npm run dev
```

Frontend:
```powershell
cd frontend
npm install
# copy frontend/.env.example to frontend/.env and edit
npm run dev
```

Visit `http://localhost:5173` (default Vite port) or check the console for the correct URL.

---

## 7) Optional: Single-server deployment

If you prefer to host both frontend and backend from a single server (e.g., a single Render or Railway service), you can:
1. Build the frontend locally or during the CI step: `cd frontend && npm run build` (produces `frontend/dist`)
2. Ensure the `frontend/dist` folder is present next to the `backend` folder in your deployment container.
3. The backend has optional static serving logic which will serve `frontend/dist` when `NODE_ENV=production` and the folder exists.

Important route ordering note for single-server setups:
- The backend registers routes in this order to avoid conflicts:
   1. `/healthz`
   2. `/api/links` (API routes)
   3. Static files from `frontend/dist` (if present)
   4. `/:code` redirect route (handled server-side so short codes redirect)
   5. SPA catch-all (`*`) which serves `index.html` for client-side routes

This ordering ensures that short-code redirects (e.g. `/abc123`) are handled by
the server before the SPA catch-all can intercept the request. If you build the
frontend into `frontend/dist`, make sure it is available to the backend service
when `NODE_ENV=production` so the static serving and route ordering take effect.

Notes:
- Serving frontend from the backend simplifies deployment but requires a way to persist the SQLite DB.
- For larger-scale production, consider using a managed database and separate frontend hosting for better scalability.

---

If you want, I can also:
- Add a minimal GitHub Actions workflow to build frontend and deploy it to Vercel automatically.
- Add Render or Railway specific config files if you prefer one platform over the other.

Happy to continue with automated CI or run a smoke test in your environment — tell me which you'd like next.
