/**
 * Router: /api/links
 *
 * This module provides CRUD endpoints for shortened links backed by MongoDB.
 * - GET  /        -> list all links
 * - POST /        -> create a new link (optional custom code)
 * - GET  /:code   -> get stats for a single link
 * - DELETE /:code -> delete a link
 *
 * Notes:
 * - Codes are validated by `CODE_REGEX` (6-8 alphanumeric characters).
 * - Database operations are performed via the `backend/db.js` abstraction
 *   which returns plain JS objects (it uses `.lean()` where appropriate).
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const validUrl = require('valid-url');

// Validation pattern for custom codes: 6-8 alphanumeric characters
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// List all links
router.get('/', async (req, res) => {
  try {
    const all = await db.getAllLinks();
    res.json(all);
  } catch (err) {
    // Unexpected database errors may occur here (network, transient). Log and
    // return a generic 500 response to the client to avoid leaking internals.
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create link
router.post('/', async (req, res) => {
  try {
    const { url, code: customCode } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });
    if (!validUrl.isWebUri(url)) return res.status(400).json({ error: 'invalid url' });

    let code = customCode && String(customCode).trim();
    if (code) {
      if (!CODE_REGEX.test(code)) return res.status(400).json({ error: 'code must match [A-Za-z0-9]{6,8}' });
      if (await db.codeExists(code)) return res.status(409).json({ error: 'code already exists' });
    } else {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      do {
        code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
      } while (await db.codeExists(code));
    }

    await db.createLink({ code, url });
    const created = await db.getLink(code);
    res.status(201).json(created);
  } catch (err) {
    // Database errors during creation can happen for reasons including
    // validation or unique index violations. Specifically, a race can occur
    // where `codeExists` returns false but another concurrent insert creates
    // the same code before `createLink()` runs. In that case MongoDB will
    // throw a duplicate-key error (E11000) which we map to HTTP 409.
    console.error('Database error:', err);
    // Detect MongoDB duplicate key error for the `code` field (E11000).
    const isDup = err && (err.code === 11000 || (err.message && err.message.includes && err.message.includes('E11000') && err.message.includes('code')));
    if (isDup) {
      return res.status(409).json({ error: 'code already exists' });
    }
    // Fallback — generic internal server error for other failures.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats for one code
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const link = await db.getLink(code);
    if (!link) return res.status(404).json({ error: 'not found' });
    res.json(link);
  } catch (err) {
    // Query errors are typically transient (DB down/unreachable). Log and
    // return a 500 to the client.
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a link
router.delete('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const link = await db.getLink(code);
    if (!link) return res.status(404).json({ error: 'not found' });
    await db.deleteLink(code);
    res.status(204).send();
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
