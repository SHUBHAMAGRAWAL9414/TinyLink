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
const allowedOrigins = [
    "https://tiny-link-omega.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0', uptime: process.uptime() });
});

app.use('/api/links', linksRouter);

const distPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/:code', (req, res) => {
    const code = req.params.code;
    const link = db.getLink(code);
    if (!link) return res.status(404).send('Not found');
    db.incrementClick(code);
    res.redirect(302, link.url);
  });

  app.get('*', (req, res, next) => {
    const p = req.path || '';
    if (p.startsWith('/api') || p === '/healthz') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!(process.env.NODE_ENV === 'production' && fs.existsSync(distPath))) {
  app.get('/:code', (req, res) => {
    const code = req.params.code;
    const link = db.getLink(code);
    if (!link) return res.status(404).send('Not found');
    db.incrementClick(code);
    res.redirect(302, link.url);
  });
}

app.get('/', (req, res) => {
  res.send(`TinyLink backend running. API: /api/links. Base URL: ${BASE_URL}`);
});

app.listen(PORT, () => {
  console.log(`TinyLink backend listening on ${PORT}`);
});
