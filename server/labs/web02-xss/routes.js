const express  = require('express');
const router   = express.Router();
const { getWeb02Db } = require('../../db/sqlite');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_WEB02 || 'ACX{st0red_xss_p4yload_exec}';

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /on\w+\s*=\s*["']?[^"'>]+/i,
  /<svg[\s\S]*?on\w+/i,
  /<img[^>]+on\w+/i,
  /javascript\s*:/i
];

function hasXss(str) {
  return XSS_PATTERNS.some(p => p.test(str));
}

// GET /api/lab/web02/init
router.get('/init', (req, res) => {
  res.json({
    labId: 'WEB-02', title: 'Stored XSS', difficulty: 'Medium',
    endpoints: ['POST /api/lab/web02/comment','GET /api/lab/web02/comments','POST /api/lab/web02/reset'],
    server_info: { render_mode: 'innerHTML', sanitization: 'none' }
  });
});

// POST /api/lab/web02/comment
router.post('/comment', async (req, res) => {
  const { username, message } = req.body;
  const session_id = req.headers['x-lab-session'] || req.ip;

  if (!username || !message)
    return res.status(400).json({ error: 'Missing fields', detail: 'username and message required' });
  if (message.length > 500)
    return res.status(400).json({ error: 'Message too long', detail: 'Max 500 characters' });

  logAttempt('WEB-02', req.ip, message.substring(0,120), hasXss(message) ? 'xss_detected' : 'clean');

  try {
    const db = await getWeb02Db();
    const result = db.prepare(
      'INSERT INTO comments (session_id, username, message) VALUES (?, ?, ?)'
    ).run(session_id, username, message);

    res.json({
      success: true,
      comment_id: result.lastInsertRowid,
      message: 'Comment posted.',
      debug: { sanitized: false, stored_as: 'raw_string' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// GET /api/lab/web02/comments
router.get('/comments', async (req, res) => {
  const session_id = req.headers['x-lab-session'] || req.ip;

  try {
    const db = await getWeb02Db();
    const rows = db.prepare(
      'SELECT id, username, message, created_at FROM comments WHERE session_id = ? ORDER BY rowid ASC'
    ).all(session_id);

    const xssFound = rows.some(r => hasXss(r.message));
    const response = {
      comments: rows,
      server_info: { render_mode: 'innerHTML', sanitization: 'none', template_engine: 'raw_string_concat' }
    };
    if (xssFound) {
      response.flag = FLAG;
      response.flag_trigger = 'xss_payload_stored_and_retrieved';
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// POST /api/lab/web02/reset
router.post('/reset', async (req, res) => {
  const session_id = req.headers['x-lab-session'] || req.ip;
  try {
    const db = await getWeb02Db();
    db.prepare('DELETE FROM comments WHERE session_id = ?').run(session_id);
    res.json({ success: true, message: 'Session comments cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

module.exports = router;
