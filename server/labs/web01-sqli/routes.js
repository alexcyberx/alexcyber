const express  = require('express');
const router   = express.Router();
const { getWeb01Db } = require('../../db/sqlite');
const { loginLimiter } = require('../../middleware/rateLimit');
const { logAttempt }   = require('../../middleware/logger');

const FLAG = process.env.FLAG_WEB01 || 'ACX{sql1_bypassed_auth_layer}';

// GET /api/lab/web01/init
router.get('/init', async (req, res) => {
  res.json({
    labId:      'WEB-01',
    title:      'SQL Injection',
    difficulty: 'Medium',
    tables: [
      { name: 'users',   columns: ['id','username','password','role','email'] },
      { name: 'secrets', columns: ['id','flag','note'] }
    ],
    endpoint:    'POST /api/lab/web01/login',
    contentType: 'application/x-www-form-urlencoded'
  });
});

// POST /api/lab/web01/login — intentionally vulnerable
router.post('/login', loginLimiter, async (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  const ip       = req.ip;

  if (!username && !password) {
    return res.status(400).json({ success: false, error: 'Missing credentials', query: null });
  }

  // Intentionally injectable — DO NOT fix
  const rawQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  let rows, dbError = null;

  try {
    const db = await getWeb01Db();
    rows = db.prepare(rawQuery).all();
  } catch (err) {
    dbError = err.message;
    logAttempt('WEB-01', ip, rawQuery, 'db_error');

    return res.status(500).json({
      success: false,
      error:   'Database error',
      detail:  dbError,
      query:   rawQuery
    });
  }

  const bypass = rows && rows.length > 0;
  logAttempt('WEB-01', ip, rawQuery, bypass ? 'bypass_success' : 'login_fail');

  if (bypass) {
    const db = await getWeb01Db();
    const secretRow = db.prepare('SELECT flag FROM secrets WHERE id = 1').get();
    return res.json({
      success:     true,
      message:     'Login successful',
      user:        rows[0],
      flag:        FLAG,
      secret_data: secretRow,
      query:       rawQuery
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials',
    query:   rawQuery,
    rows_returned: 0
  });
});

module.exports = router;
