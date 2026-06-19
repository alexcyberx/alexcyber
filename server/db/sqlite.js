const path = require('path');
const fs   = require('fs');

const DATA_DIR  = path.join(__dirname, '../../data');
const WEB01_DB  = path.join(DATA_DIR, 'web01.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// sql.js wrapper that mimics better-sqlite3 sync API
let _SQL = null;

async function initSqlJs() {
  if (_SQL) return _SQL;
  const initSql = require('sql.js');
  _SQL = await initSql();
  return _SQL;
}

// Simple persistent DB class using sql.js
class PersistentDB {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async init(SQL) {
    if (fs.existsSync(this.dbPath)) {
      const buf = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buf);
    } else {
      this.db = new SQL.Database();
    }
  }

  exec(sql) {
    this.db.run(sql);
    this._persist();
  }

  prepare(sql) {
    const self = this;
    return {
      run: (...args) => {
        const params = Array.isArray(args[0]) ? args[0] : args;
        self.db.run(sql, params);
        self._persist();
        // return lastInsertRowid
        const [{ values }] = self.db.exec('SELECT last_insert_rowid()');
        return { lastInsertRowid: values[0][0] };
      },
      get: (...args) => {
        const params = Array.isArray(args[0]) ? args[0] : args;
        const res = self.db.exec(sql, params);
        if (!res.length || !res[0].values.length) return undefined;
        const { columns, values } = res[0];
        const row = {};
        columns.forEach((c, i) => row[c] = values[0][i]);
        return row;
      },
      all: (...args) => {
        const params = Array.isArray(args[0]) ? args[0] : args;
        const res = self.db.exec(sql, params);
        if (!res.length) return [];
        const { columns, values } = res[0];
        return values.map(v => {
          const row = {};
          columns.forEach((c, i) => row[c] = v[i]);
          return row;
        });
      }
    };
  }

  pragma() {} // no-op for compat

  _persist() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }
}

// Global instances
let web01Db = null;

async function getWeb01Db() {
  if (web01Db) return web01Db;
  const SQL = await initSqlJs();
  web01Db = new PersistentDB(WEB01_DB);
  await web01Db.init(SQL);

  web01Db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role     TEXT NOT NULL DEFAULT 'user',
      email    TEXT
    );
    CREATE TABLE IF NOT EXISTS secrets (
      id   INTEGER PRIMARY KEY,
      flag TEXT NOT NULL,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS posts (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      title   TEXT,
      content TEXT,
      author  TEXT
    );
  `);

  const count = web01Db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (!count || count.c === 0) {
    web01Db.prepare(`INSERT INTO users (username,password,role,email) VALUES (?,?,?,?)`).run('admin','SuperS3cr3t!','admin','admin@corp.internal');
    web01Db.prepare(`INSERT INTO users (username,password,role,email) VALUES (?,?,?,?)`).run('john','password123','user','john@corp.internal');
    web01Db.prepare(`INSERT INTO users (username,password,role,email) VALUES (?,?,?,?)`).run('sarah','qwerty2024','user','sarah@corp.internal');
    web01Db.prepare(`INSERT INTO users (username,password,role,email) VALUES (?,?,?,?)`).run('dev_user','dev_only_8821','dev','dev@corp.internal');
    web01Db.prepare(`INSERT INTO secrets (id,flag,note) VALUES (?,?,?)`).run(1,'ACX{blind_injection_is_still_injection}','Do not expose this table to the app layer');
    web01Db.prepare(`INSERT INTO posts (title,content,author) VALUES (?,?,?)`).run('Welcome','Internal portal launched.','admin');
    console.log('[DB] web01 seed data inserted');
  }
  return web01Db;
}

// For web02 XSS
async function getWeb02Db() {
  const SQL = await initSqlJs();
  const dbPath = path.join(DATA_DIR, 'web02.db');
  const db = new PersistentDB(dbPath);
  await db.init(SQL);
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      username   TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}


// For web-01 Hidden in Plain Sight (flag submission tracking)
async function getHiddenDb() {
  const SQL = await initSqlJs();
  const dbPath = path.join(DATA_DIR, 'hidden.db');
  const db = new PersistentDB(dbPath);
  await db.init(SQL);
  db.exec(`
    CREATE TABLE IF NOT EXISTS attempts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      flag_input TEXT NOT NULL,
      result     TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}

module.exports = { getWeb01Db, getWeb02Db, getHiddenDb };
