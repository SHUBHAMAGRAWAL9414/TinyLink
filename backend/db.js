// db.js - small wrapper using better-sqlite3
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_FILE || path.join(__dirname, 'data', 'tinylink.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// initialize table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS links (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    last_clicked TEXT,
    created_at TEXT NOT NULL
  )
`).run();

module.exports = {
  getAllLinks: () => {
    return db.prepare(`SELECT code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC`).all();
  },
  getLink: (code) => {
    return db.prepare(`SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code = ?`).get(code);
  },
  createLink: ({ code, url }) => {
    const now = new Date().toISOString();
    return db.prepare(`INSERT INTO links (code, url, created_at) VALUES (?, ?, ?)`).run(code, url, now);
  },
  incrementClick: (code) => {
    const now = new Date().toISOString();
    return db.prepare(`UPDATE links SET clicks = clicks + 1, last_clicked = ? WHERE code = ?`).run(now, code);
  },
  deleteLink: (code) => {
    return db.prepare(`DELETE FROM links WHERE code = ?`).run(code);
  },
  codeExists: (code) => {
    return !!db.prepare(`SELECT 1 FROM links WHERE code = ?`).get(code);
  }
};
