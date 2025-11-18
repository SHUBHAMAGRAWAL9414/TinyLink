// index.js - main server
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const linksRouter = require('./routes/links');

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0', uptime: process.uptime() });
});

// API routes
app.use('/api/links', linksRouter);

// Optional: When running in production and a built frontend exists at ../frontend/dist,
// serve those static files so a single server can host both the API and the SPA.
// This is useful for single-server deployments (Render/Railway) where you may want
// the backend to serve the frontend build. It is optional and only activated when
// NODE_ENV=production and the dist folder exists.
const distPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  // Serve static assets
  app.use(express.static(distPath));
  // Redirect route — must be AFTER /api and /healthz and AFTER static middleware,
  // but BEFORE the SPA catch-all. This ensures short-code redirect URLs like
  // `https://example.com/abc123` are handled by the backend redirect logic
  // instead of being swallowed by the frontend's client-side router.
  app.get('/:code', (req, res) => {
    const code = req.params.code;
    const link = db.getLink(code);
    if (!link) return res.status(404).send('Not found');
    db.incrementClick(code);
    // 302 redirect
    res.redirect(302, link.url);
  });

  // Catch-all for client-side routing. This will serve index.html for any
  // non-API and non-healthz route (and only after the redirect route has had
  // a chance to match). This keeps React Router working on direct navigations
  // while allowing server-side redirects for short codes.
  app.get('*', (req, res, next) => {
    const p = req.path || '';
    if (p.startsWith('/api') || p === '/healthz') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
// If we are NOT serving a built frontend (local development or dist missing),
// still register the redirect route so short codes work as expected.
if (!(process.env.NODE_ENV === 'production' && fs.existsSync(distPath))) {
  app.get('/:code', (req, res) => {
    const code = req.params.code;
    const link = db.getLink(code);
    if (!link) return res.status(404).send('Not found');
    db.incrementClick(code);
    // 302 redirect
    res.redirect(302, link.url);
  });
}

// Fallback root — serves a small message (UI will be from frontend)
app.get('/', (req, res) => {
  res.send(`TinyLink backend running. API: /api/links. Base URL: ${BASE_URL}`);
});

app.listen(PORT, () => {
  console.log(`TinyLink backend listening on ${PORT}`);
});
