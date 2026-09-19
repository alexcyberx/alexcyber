/* ═══════════════════════════════════════════════════════════
   AlexTrace - Password Pattern Intelligence module
   ═══════════════════════════════════════════════════════════
   Fully offline (no external calls, no storage), mirrors what a
   pentester's mental checklist looks like when eyeballing a
   password: character-class entropy as a baseline, then pattern
   detection that knocks the estimate down for predictable
   structures (keyboard walks, l33t substitutions, years/dates,
   repeated/sequential runs, common dictionary words).

   The password itself is NEVER sent anywhere or logged - this
   module receives it in a request body, computes on it, and
   returns only the analysis. routes.js must not log or persist
   the raw password value.
═══════════════════════════════════════════════════════════ */

// Small, curated list, enough to catch the overwhelmingly common
// cases (password itself, common words, brand names) without
// shipping a huge wordlist into the repo. This is a heuristic aid,
// not a full rockyou-style dictionary attack simulation.
const COMMON_WORDS = [
  'password', 'passw0rd', 'letmein', 'welcome', 'admin', 'login',
  'qwerty', 'dragon', 'master', 'monkey', 'football', 'baseball',
  'shadow', 'superman', 'batman', 'trustno1', 'iloveyou', 'princess',
  'sunshine', 'flower', 'starwars', 'freedom', 'whatever', 'jordan',
  'hunter', 'ranger', 'buster', 'soccer', 'hockey', 'killer',
  'george', 'summer', 'winter', 'autumn', 'chelsea', 'liverpool',
  'cricket', 'india', 'mumbai', 'delhi', 'admin123', 'test123'
];

const KEYBOARD_ROWS = [
  '`1234567890-=',
  'qwertyuiop[]\\',
  'asdfghjkl;\'',
  'zxcvbnm,./'
];

const L33T_MAP = { '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't' };

function deleetify(str) {
  return str.toLowerCase().split('').map(c => L33T_MAP[c] || c).join('');
}

function hasKeyboardWalk(pw, minLen = 4) {
  const lower = pw.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - minLen; i++) {
      const forward = row.slice(i, i + minLen);
      const backward = forward.split('').reverse().join('');
      if (lower.includes(forward) || lower.includes(backward)) return true;
    }
  }
  return false;
}

function hasSequentialRun(pw, minLen = 4) {
  // Catches "abcd", "1234", "9876" etc.
  const lower = pw.toLowerCase();
  let ascRun = 1, descRun = 1;
  for (let i = 1; i < lower.length; i++) {
    const prev = lower.charCodeAt(i - 1);
    const curr = lower.charCodeAt(i);
    ascRun = curr === prev + 1 ? ascRun + 1 : 1;
    descRun = curr === prev - 1 ? descRun + 1 : 1;
    if (ascRun >= minLen || descRun >= minLen) return true;
  }
  return false;
}

function hasRepeatedChars(pw, minLen = 4) {
  return new RegExp(`(.)\\1{${minLen - 1},}`).test(pw);
}

function hasYearOrDate(pw) {
  return /(19|20)\d{2}/.test(pw) || /\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/.test(pw);
}

function matchesCommonWord(pw) {
  const cleaned = deleetify(pw).replace(/[^a-z0-9]/g, '');
  return COMMON_WORDS.some(w => cleaned.includes(w));
}

function characterSetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33; // common symbol set
  return size || 1;
}

function formatCrackTime(seconds) {
  if (seconds < 1) return 'instantly';
  const units = [
    ['century', 'centuries', 60 * 60 * 24 * 365 * 100],
    ['year', 'years', 60 * 60 * 24 * 365],
    ['day', 'days', 60 * 60 * 24],
    ['hour', 'hours', 60 * 60],
    ['minute', 'minutes', 60],
    ['second', 'seconds', 1]
  ];
  for (const [singular, plural, unitSeconds] of units) {
    if (seconds >= unitSeconds) {
      const count = Math.round(seconds / unitSeconds);
      return `~${count.toLocaleString()} ${count === 1 ? singular : plural}`;
    }
  }
  return 'instantly';
}

function analyzePassword(password) {
  const pw = String(password || '');
  if (!pw) {
    return { error: 'Please enter a password to analyze.' };
  }
  if (pw.length > 128) {
    return { error: 'Password is too long to analyze (128 character limit).' };
  }

  const length = pw.length;
  const charsetSize = characterSetSize(pw);
  const bitsEntropy = length * Math.log2(charsetSize);

  const patterns = [];
  if (hasKeyboardWalk(pw)) patterns.push('Contains a keyboard walk pattern (e.g. "qwerty", "asdf")');
  if (hasSequentialRun(pw)) patterns.push('Contains a sequential run of characters (e.g. "1234", "abcd")');
  if (hasRepeatedChars(pw)) patterns.push('Contains repeated characters (e.g. "aaaa")');
  if (hasYearOrDate(pw)) patterns.push('Contains what looks like a year or date, easy to guess if it\'s personal (birthday, anniversary)');
  if (matchesCommonWord(pw)) patterns.push('Contains a common word or well-known password, even with number/symbol substitutions');

  // Effective entropy: heavy penalty per detected weak pattern,
  // since these patterns are exactly what real cracking tools
  // (hashcat rules, common wordlists) target first, regardless of
  // the raw character-set math looking "strong".
  let effectiveBits = bitsEntropy;
  patterns.forEach(() => { effectiveBits = effectiveBits * 0.35; });
  effectiveBits = Math.max(effectiveBits, length > 0 ? 4 : 0);

  // Offline guesses/sec: representative of a modern GPU rig doing
  // an offline hash-cracking attempt against a fast, unsalted hash.
  // This is intentionally a "worst case for the defender" estimate,
  // not an online-login-throttled scenario, since that's the
  // realistic threat model once a database has already leaked.
  const GUESSES_PER_SECOND = 10_000_000_000; // 10B/s
  const totalGuesses = Math.pow(2, effectiveBits);
  const secondsToCrack = totalGuesses / GUESSES_PER_SECOND / 2; // average case, not worst case

  let level;
  if (effectiveBits < 28) level = 'very_weak';
  else if (effectiveBits < 40) level = 'weak';
  else if (effectiveBits < 60) level = 'moderate';
  else if (effectiveBits < 80) level = 'strong';
  else level = 'very_strong';

  const suggestions = [];
  if (length < 12) suggestions.push('Use at least 12-16 characters, length matters more than complexity.');
  if (patterns.length > 0) suggestions.push('Avoid dictionary words, keyboard patterns, and personal dates entirely.');
  if (!/[^a-zA-Z0-9]/.test(pw)) suggestions.push('Mixing in symbols helps, but length and unpredictability matter more.');
  if (suggestions.length === 0) suggestions.push('Consider using a password manager to generate and store even stronger, unique passwords per site.');

  return {
    length,
    charsetSize,
    rawEntropyBits: Math.round(bitsEntropy),
    effectiveEntropyBits: Math.round(effectiveBits),
    level,
    patterns,
    estimatedCrackTime: formatCrackTime(secondsToCrack),
    suggestions
  };
}

module.exports = { analyzePassword };
