/* ═══════════════════════════════════════════════════════════
   CYBER MISTAKE ANALYZER, backend route
   ═══════════════════════════════════════════════════════════
   POST /api/tools/analyze-command
   Body: { command: "nmap -A target.com" }

   Sends the student's command to Google's Gemini API (free tier)
   and asks it to return structured feedback: what was done right,
   what was wrong, a better version of the command, and when to use
   it. Response is forced into JSON so the frontend can render it
   as distinct sections instead of a wall of text.

   Env var required (set on Render, never commit the real value):
     GEMINI_API_KEY, from Google AI Studio (aistudio.google.com),
                         free tier, no credit card needed.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const { analyzeLimiter } = require('../../middleware/rateLimit');
const { requireToolLogin, checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');

// Try models in this order, if one is retired/unavailable for this
// account (Google occasionally deprecates free-tier models for new
// accounts), fall back to the next one automatically instead of
// failing outright.
const GEMINI_MODEL_CANDIDATES = [
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

async function callGemini(apiKey, prompt) {
  let lastErr = null;
  for (const model of GEMINI_MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const geminiRes = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
        })
      });

      if (geminiRes.status === 404) {
        // Model retired/not available for this account, try the next one.
        const body = await geminiRes.text();
        console.warn(`[MistakeAnalyzer] Model ${model} unavailable (404), trying next. Detail:`, body.slice(0, 200));
        lastErr = { status: 404, body };
        continue;
      }

      if (!geminiRes.ok) {
        const body = await geminiRes.text();
        lastErr = { status: geminiRes.status, body };
        console.error(`[MistakeAnalyzer] Model ${model} error ${geminiRes.status}:`, body.slice(0, 300));
        continue;
      }

      console.log(`[MistakeAnalyzer] Used model: ${model}`);
      return await geminiRes.json();
    } catch (e) {
      lastErr = { status: 0, body: e.message };
      console.error(`[MistakeAnalyzer] Model ${model} request failed:`, e.message);
    }
  }
  const err = new Error('All candidate Gemini models failed');
  err.detail = lastErr;
  throw err;
}

const SYSTEM_PROMPT = `You are a cybersecurity mentor reviewing a command a student is learning to use (tools like nmap, sqlmap, hydra, gobuster, netcat, metasploit, etc., or general Linux/networking commands used in a security context).

Given the student's command, respond with ONLY a JSON object (no markdown fences, no preamble) with exactly these fields:
{
  "tool": "name of the primary tool/command used",
  "whatItDoes": "one or two sentence plain-English summary of what this exact command does",
  "didRight": ["short bullet point", "short bullet point"],
  "didWrong": ["short bullet point", "short bullet point"],
  "betterCommand": "an improved version of the command, or the same command if it was already good practice",
  "betterCommandWhy": "one sentence on why the improved version is better",
  "whenToUse": "one or two sentences on the realistic situation/context where this command is appropriate",
  "riskLevel": "low | medium | high, how risky/noisy/legally-sensitive this command is if run against a system without authorization"
}

Rules:
- Do not use em dashes (—) or en dashes (–) anywhere in your response. Use a comma, a period, or a hyphen (-) instead if needed.
- If didRight has nothing notable, return an empty array, not a made-up point.
- If didWrong has nothing, return an empty array.
- Keep every string concise, this is shown on a small mobile screen.
- Always include a brief reminder-style note inside "whenToUse" that this should only be run against systems the student owns or is authorized to test, when relevant to the tool.
- If the input is not a real recognizable security/networking command, set "tool" to "unrecognized" and explain briefly in "whatItDoes", leave other array fields empty, and set riskLevel to "low".`;

// Backup safety net in case the model ignores the "no em/en dash"
// instruction, replace them with a regular hyphen anywhere in any
// string field (including inside arrays), recursively.
function sanitizeDashes(value) {
  if (typeof value === 'string') {
    return value.replace(/[\u2014\u2013]/g, '-');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeDashes);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeDashes(value[key]);
    }
    return out;
  }
  return value;
}

router.post('/analyze-command', analyzeLimiter, requireToolLogin, checkToolEnabled('mistake_analyzer'), async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string' || !command.trim()) {
      return res.status(400).json({ error: 'Please enter a command to analyze.' });
    }
    if (command.length > 500) {
      return res.status(400).json({ error: 'Command is too long (max 500 characters).' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[MistakeAnalyzer] GEMINI_API_KEY not set on server.');
      return res.status(500).json({ error: 'Analyzer is not configured yet. Please try again later.' });
    }

    let data;
    try {
      data = await callGemini(apiKey, `${SYSTEM_PROMPT}\n\nStudent's command:\n${command.trim()}`);
    } catch (e) {
      console.error('[MistakeAnalyzer] All Gemini models failed:', JSON.stringify(e.detail).slice(0, 300));
      return res.status(502).json({ error: 'Could not reach the analyzer right now. Please try again in a moment.' });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error('[MistakeAnalyzer] Unexpected Gemini response shape:', JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: 'Analyzer returned an unexpected response. Please try again.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error('[MistakeAnalyzer] Failed to parse Gemini JSON:', rawText.slice(0, 300));
      return res.status(502).json({ error: 'Could not parse analysis. Please try again.' });
    }

    logToolUsage('mistake_analyzer', req.toolUserId);
    res.json(sanitizeDashes(parsed));
  } catch (err) {
    console.error('[MistakeAnalyzer] analyze-command failed:', err.message);
    res.status(500).json({ error: 'Something went wrong analyzing your command. Please try again.' });
  }
});

module.exports = router;
