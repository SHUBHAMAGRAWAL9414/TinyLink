const express = require('express');
const router = express.Router();
const db = require('../db');
const validUrl = require('valid-url');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;


router.get('/', (req, res) => {
  const all = db.getAllLinks();
  res.json(all);
});

router.post('/', (req, res) => {
  const { url, code: customCode } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });
  if (!validUrl.isWebUri(url)) return res.status(400).json({ error: 'invalid url' });

  let code = customCode && String(customCode).trim();
  if (code) {
    if (!CODE_REGEX.test(code)) return res.status(400).json({ error: 'code must match [A-Za-z0-9]{6,8}' });
    if (db.codeExists(code)) return res.status(409).json({ error: 'code already exists' });
  } else {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    do {
      code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    } while (db.codeExists(code));
  }

  db.createLink({ code, url });
  const created = db.getLink(code);
  res.status(201).json(created);
});

router.get('/:code', (req, res) => {
  const code = req.params.code;
  const link = db.getLink(code);
  if (!link) return res.status(404).json({ error: 'not found' });
  res.json(link);
});

router.delete('/:code', (req, res) => {
  const code = req.params.code;
  const link = db.getLink(code);
  if (!link) return res.status(404).json({ error: 'not found' });
  db.deleteLink(code);
  res.status(204).send();
});

module.exports = router;
