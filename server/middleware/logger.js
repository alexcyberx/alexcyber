const fs   = require('fs');
const path = require('path');

const LOG_DIR  = path.join(__dirname, '../../data/logs');
const LOG_FILE = path.join(LOG_DIR, 'attempts.log');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function logAttempt(labId, ip, payload, result) {
  const entry = JSON.stringify({
    ts:     new Date().toISOString(),
    lab:    labId,
    ip:     ip,
    payload: payload,
    result: result
  }) + '\n';

  fs.appendFile(LOG_FILE, entry, err => {
    if (err) console.error('[Logger] Write failed:', err.message);
  });
}

module.exports = { logAttempt };
