const path = require('path');
const fs   = require('fs');

const DATA_DIR  = path.join(__dirname, '../../data');

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

// For hidden-sight (flag submission tracking)
// FIX: same singleton pattern, pehle har call pe naya instance tha.
let hiddenDb = null;
async function getHiddenDb() {
  if (hiddenDb) return hiddenDb;
  const SQL = await initSqlJs();
  const dbPath = path.join(DATA_DIR, 'hidden.db');
  hiddenDb = new PersistentDB(dbPath);
  await hiddenDb.init(SQL);
  hiddenDb.exec(`
    CREATE TABLE IF NOT EXISTS attempts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      flag_input TEXT NOT NULL,
      result     TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return hiddenDb;
}

module.exports = { getHiddenDb };
