const express = require('express');
const router = express.Router();
const db = require('../db');
const validUrl = require('valid-url');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

router.get('/', async (req, res) => {
  try {
    const all = await db.getAllLinks();
    res.json(all);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    console.error('Database error:', err);
    const isDup = err && (err.code === 11000 || (err.message && err.message.includes && err.message.includes('E11000') && err.message.includes('code')));
    if (isDup) {
      return res.status(409).json({ error: 'code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const link = await db.getLink(code);
    if (!link) return res.status(404).json({ error: 'not found' });
    res.json(link);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
