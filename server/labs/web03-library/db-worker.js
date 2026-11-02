// ── web-03 database thread ──────────────────────────────────────
// The catalogue search is vulnerable on purpose (SQL injection). To keep the
// labs server safe, every query runs here, not on the main thread:
// - one in-memory database per lab instance (kept in a small cache), read
//   only, SQLite heap capped, so a huge string or blob gets "out of memory";
// - the routes stop and restart this thread if a query runs too long.
const { parentPort, workerData } = require('worker_threads');
const initSqlJs = require('sql.js');
const { build } = require('./data');

const MAX_ROWS = 60;
const MAX_CELL = 200;
const MAX_DBS = 150;

(async () => {
  const SQL = await initSqlJs();
  const dbs = new Map(); // suffix -> Database (oldest first)
  function dbFor(suffix) {
    let db = dbs.get(suffix);
    if (db) { dbs.delete(suffix); dbs.set(suffix, db); return db; }
    db = new SQL.Database();
    build(db, workerData.flag, suffix);
    db.run('PRAGMA hard_heap_limit = 33554432');
    db.run('PRAGMA query_only = 1');
    dbs.set(suffix, db);
    if (dbs.size > MAX_DBS) { const [k, old] = dbs.entries().next().value; dbs.delete(k); try { old.close(); } catch (_) { /* closed */ } }
    return db;
  }
  const cell = (v) => {
    if (v === null || v === undefined) return 'NULL';
    if (v instanceof Uint8Array) return '[blob ' + v.length + ' bytes]';
    const s = String(v);
    return s.length > MAX_CELL ? s.slice(0, MAX_CELL) + '...' : s;
  };
  parentPort.on('message', ({ id, suffix, sql }) => {
    let stmt;
    try {
      stmt = dbFor(suffix).prepare(sql);
      const rows = [];
      let truncated = false;
      while (stmt.step()) {
        if (rows.length >= MAX_ROWS) { truncated = true; break; }
        rows.push(stmt.get().map(cell));
      }
      parentPort.postMessage({ id, ok: true, rows, truncated });
    } catch (e) {
      parentPort.postMessage({ id, ok: false, error: String((e && e.message) || e).slice(0, 200) });
    } finally {
      if (stmt) { try { stmt.free(); } catch (_) { /* already freed */ } }
    }
  });
  parentPort.postMessage({ ready: true });
})().catch((e) => { parentPort.postMessage({ fatal: String(e && e.message) }); });
