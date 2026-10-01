/* ═══════════════════════════════════════════════════════════
   Shared LLM helper for every AI feature (chat lab, hints, ...)
   ═══════════════════════════════════════════════════════════
   Why this is one file: the free API quota belongs to the whole
   site, so all AI features must count against the same limits.

   Env vars (set on Render, never commit real values):
     GROQ_API_KEY       key from console.groq.com (free tier)
     AI_API_KEY         optional, used instead of GROQ_API_KEY
     AI_BASE_URL        optional, any OpenAI-compatible API (default: Groq)
     AI_MODEL_EASY      first model to try   (default openai/gpt-oss-20b)
     AI_MODEL_FALLBACK  backup model         (default openai/gpt-oss-120b)
     AI_GLOBAL_PER_MIN  max AI calls per minute, whole site (default 10)
     AI_GLOBAL_PER_DAY  max AI calls per day, whole site    (default 600)
                        (the old name AI_EASY_PER_DAY still works)
═══════════════════════════════════════════════════════════ */

const rateLimit = require('express-rate-limit');

function num(name, def) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/* ── Config (env is read at call time where it can change) ── */
function apiKey()  { return process.env.AI_API_KEY || process.env.GROQ_API_KEY || ''; }
function baseUrl() { return (process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, ''); }

// Two models are tried in order. Free-tier limits are per model, so the
// second one also acts as a backup when the first is busy or retired.
function models() {
  const list = [process.env.AI_MODEL_EASY || 'openai/gpt-oss-20b', process.env.AI_MODEL_FALLBACK || 'openai/gpt-oss-120b'];
  return list.filter((m, i) => m && list.indexOf(m) === i);
}

const GLOBAL_PER_MIN      = num('AI_GLOBAL_PER_MIN', 10);
const GLOBAL_PER_DAY      = num('AI_GLOBAL_PER_DAY', num('AI_EASY_PER_DAY', 600));
const UPSTREAM_TIMEOUT_MS = 20 * 1000;

/* ── Site-wide quota (all AI features share it) ── */
const globalHits = [];   // timestamps of AI calls in the last minute
let dayKey = '';
let dayCount = 0;

// Returns null if a call is allowed, otherwise 'day' or 'minute'.
function quotaCheck() {
  const now = Date.now();
  while (globalHits.length && now - globalHits[0] > 60 * 1000) globalHits.shift();
  const key = new Date().toISOString().slice(0, 10);
  if (key !== dayKey) { dayKey = key; dayCount = 0; }
  if (dayCount >= GLOBAL_PER_DAY)          return 'day';
  if (globalHits.length >= GLOBAL_PER_MIN) return 'minute';
  return null;
}
function quotaCount() { globalHits.push(Date.now()); dayCount++; }

/* ── Per-IP limiter factory (429 with a friendly JSON message) ── */
function ipLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs, max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const retryAfter = Math.max(0, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000));
      res.status(429).json({ error: message, retryAfter });
    }
  });
}

/* ── Errors ── */
function fail(code, message) {
  const e = new Error(message || code);
  e.code = code;
  return e;
}

// code -> [http status, text that is safe to show to players]
const ERROR_REPLIES = {
  NO_KEY:   [503, 'The assistant is offline right now. Try again later.'],
  AUTH:     [503, 'The assistant is offline right now. Try again later.'],
  RATE:     [429, 'The helpdesk is busy right now. Wait a moment and try again.'],
  TIMEOUT:  [504, 'The assistant took too long to answer. Try sending your message again.'],
  EMPTY:    [502, 'The assistant sent an empty reply. Try sending your message again.'],
  UPSTREAM: [502, 'The assistant is not available right now. Try again in a moment.'],
  NETWORK:  [502, 'The assistant is not available right now. Try again in a moment.']
};

/* ── LLM call (OpenAI-compatible chat completions) ── */

// One HTTP call to the provider. Returns { status, data, text }.
async function post(model, messages, withReasoning, opts) {
  const o = opts || {};
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const body = {
      model, messages,
      temperature: typeof o.temperature === 'number' ? o.temperature : 0.7,
      max_completion_tokens: o.maxTokens || 700
    };
    // gpt-oss models "think" before answering; keep that short so the reply fits the token budget
    if (withReasoning) body.reasoning_effort = 'low';
    const r = await fetch(baseUrl() + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey() },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    const text = await r.text().catch(() => '');
    let data = null;
    try { data = JSON.parse(text); } catch (e) {}
    return { status: r.status, data, text };
  } catch (err) {
    if (err.name === 'AbortError') throw fail('TIMEOUT', 'Provider timed out');
    throw fail('NETWORK', err.message);
  } finally {
    clearTimeout(timer);
  }
}

// If the provider rejects the request (400), try once more without the optional reasoning setting.
async function callModel(model, messages, opts) {
  let res = await post(model, messages, true, opts);
  if (res.status === 400) res = await post(model, messages, false, opts);
  return res;
}

// Returns the reply text, or throws an error with .code (see ERROR_REPLIES).
async function callLLM(messages, opts, tag) {
  const label = '[' + (tag || 'AI') + ']';
  if (!apiKey()) throw fail('NO_KEY', 'No API key configured (set GROQ_API_KEY)');

  let sawRate = false, sawEmpty = false;
  for (const model of models()) {
    const res = await callModel(model, messages, opts);

    if (res.status === 404) { console.warn(label, 'model unavailable (404):', model, ', trying next'); continue; }
    if (res.status === 429) { sawRate = true; console.warn(label, 'model rate limited (429):', model, ', trying next'); continue; }
    if (res.status === 401 || res.status === 403) {
      console.error(label, 'provider rejected the API key (' + res.status + ')');
      throw fail('AUTH', 'Provider rejected the API key');
    }
    if (res.status < 200 || res.status >= 300) {
      console.error(label, 'provider error', res.status, res.text.slice(0, 300));
      throw fail('UPSTREAM', 'Provider error ' + res.status);
    }

    const msg = res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message;
    const text = msg && msg.content;
    if (typeof text !== 'string' || !text.trim()) {
      sawEmpty = true;
      console.warn(label, 'empty reply from', model, ', trying next');
      continue;
    }
    // the chat windows show plain text, so drop markdown bold markers the model may still add
    return text.replace(/\*\*(.+?)\*\*/g, '$1').trim().slice(0, 2000);
  }
  if (sawRate)  throw fail('RATE', 'All models rate limited');
  if (sawEmpty) throw fail('EMPTY', 'Empty reply from provider');
  throw fail('UPSTREAM', 'No model available');
}

module.exports = {
  num, apiKey, baseUrl, models,
  quotaCheck, quotaCount, ipLimiter,
  fail, ERROR_REPLIES, callLLM, callModel
};
