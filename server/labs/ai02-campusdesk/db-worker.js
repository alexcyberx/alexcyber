// ── ai-02 database thread ───────────────────────────────────────
// The lab runs SQL that an AI wrote, on purpose. To keep that safe for the
// labs server, the database lives in this worker thread:
// - it is read only: the routes only send one SELECT (or WITH) statement,
//   and nothing here writes;
// - SQLite's own heap is capped (hard_heap_limit), so a query that tries to
//   build a huge string or blob gets "out of memory" instead of eating RAM;
// - the routes stop and restart this thread if a query runs too long.
const { parentPort, workerData } = require('worker_threads');
const initSqlJs = require('sql.js');
const { build } = require('./data');

const MAX_ROWS = 50;
const MAX_CELL = 200;

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  build(db, workerData.flag);
  db.run('PRAGMA hard_heap_limit = 67108864');
  db.run('PRAGMA query_only = 1');

  const cell = (v) => {
    if (v === null || v === undefined) return 'NULL';
    if (v instanceof Uint8Array) return '[blob ' + v.length + ' bytes]';
    const s = String(v);
    return s.length > MAX_CELL ? s.slice(0, MAX_CELL) + '...' : s;
  };

  parentPort.on('message', ({ id, sql }) => {
    const t0 = Date.now();
    let stmt;
    try {
      stmt = db.prepare(sql);
      const columns = stmt.getColumnNames();
      const rows = [];
      let truncated = false;
      while (stmt.step()) {
        if (rows.length >= MAX_ROWS) { truncated = true; break; }
        rows.push(stmt.get().map(cell));
      }
      parentPort.postMessage({ id, ok: true, columns, rows, truncated, ms: Date.now() - t0 });
    } catch (e) {
      parentPort.postMessage({ id, ok: false, error: String((e && e.message) || e).slice(0, 200) });
    } finally {
      if (stmt) { try { stmt.free(); } catch (_) { /* already freed */ } }
    }
  });
  parentPort.postMessage({ ready: true });
})().catch((e) => { parentPort.postMessage({ fatal: String(e && e.message) }); });
