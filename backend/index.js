require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const linksRouter = require('./routes/links');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;

const app = express();
app.use(helmet());

const rawAllowed = process.env.ALLOWED_ORIGINS || process.env.BASE_URL || '';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, false);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowedOrigins.some(a => a.startsWith('*.') && origin.endsWith(a.replace('*', '')))) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);


app.use(express.json());

/**
 * Validate required environment variables before starting the application.
 * Exits the process with code 1 when a required variable is missing.
 * This fail-fast behavior prevents attempting to connect with incomplete config.
 * @returns {void}
 */
function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.BASE_URL && !process.env.ALLOWED_ORIGINS) missing.push('BASE_URL or ALLOWED_ORIGINS');
  if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0', uptime: process.uptime() });
});

app.use('/api/links', linksRouter);

const distPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));


  app.get('/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const link = await db.getLink(code);
      if (!link) return res.status(404).send('Not found');
      await db.incrementClick(code);
      return res.redirect(302, link.url);
    } catch (err) {
      console.error('Redirect error:', err);
      return res.status(500).send('Internal server error');
    }
  });

  app.get('*', (req, res, next) => {
    const p = req.path || '';
    if (p.startsWith('/api') || p === '/healthz') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const link = await db.getLink(code);
      if (!link) return res.status(404).send('Not found');
      await db.incrementClick(code);
      return res.redirect(302, link.url);
    } catch (err) {
      console.error('Redirect error:', err);
      return res.status(500).send('Internal server error');
    }
  });
}

app.get('/', (req, res) => {
  res.send(`TinyLink backend running. API: /api/links. Base URL: ${BASE_URL}`);
});

/**
 * Global error handler middleware.
 * Catches errors that were not handled by route handlers and returns
 * a normalized response while avoiding leaking internal details.
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  try {
    validateEnv();
    await connectDB();
  } catch (err) {
    console.error('Unable to connect to database, exiting.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`TinyLink backend listening on ${PORT}`);
  });
})();
