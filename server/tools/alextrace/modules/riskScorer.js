/* ═══════════════════════════════════════════════════════════
   AlexTrace - Correlation + Risk Scoring module
   ═══════════════════════════════════════════════════════════
   Turns raw findings (username hits, email intel, metadata) into
   the "attacker report card": an overall exposure score, per
   category risk levels, correlation signals, and concrete action
   items. This is deliberately simple/transparent logic (not a
   black box) so the reasoning behind the score is explainable.
═══════════════════════════════════════════════════════════ */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function levelFromScore(score) {
  if (score >= 70) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

// Correlation: if the same username shows up on many platforms and
// the email's domain matches a personal/professional signal, we can
// say with more confidence this is a consistent, trackable identity
// - which is itself a meaningful finding for an OSINT-style report.
function correlateIdentity({ usernameResult, emailResult, deepCorrelation }) {
  const signals = [];
  let confidence = 0;

  if (usernameResult && usernameResult.found.length >= 5) {
    signals.push(`The same username appears on ${usernameResult.found.length} platforms, making it easy to link accounts together.`);
    confidence += 30;
  } else if (usernameResult && usernameResult.found.length >= 2) {
    signals.push(`The same username appears on ${usernameResult.found.length} platforms.`);
    confidence += 15;
  }

  if (emailResult && emailResult.gravatar && emailResult.gravatar.registered) {
    signals.push('This email has a public Gravatar profile, which can link it to a real name or photo.');
    confidence += 20;
  }

  if (usernameResult && usernameResult.variationHits && usernameResult.variationHits.length > 0) {
    signals.push(`${usernameResult.variationHits.length} related username variations were also found active, which widens the trackable footprint.`);
    confidence += 15;
  }

  if (deepCorrelation && deepCorrelation.attempted && deepCorrelation.discovered.length > 0) {
    signals.push(`${deepCorrelation.discovered.length} additional account(s) were discoverable just by reading the public GitHub bio, this is exactly how a real investigator pivots from one account to the next.`);
    confidence += clamp(deepCorrelation.discovered.length * 12, 0, 30);
  }

  return { signals, confidence: clamp(confidence, 0, 100) };
}

function scoreUsernameExposure(usernameResult) {
  if (!usernameResult) return { score: 0, level: 'low', notes: [] };
  const foundCount = usernameResult.found.length;
  const notes = [];
  let score = clamp(foundCount * 8, 0, 80);

  if (foundCount === 0) {
    notes.push('This username was not found on any checked platform.');
  } else if (foundCount >= 8) {
    notes.push(`This username is active on ${foundCount} platforms, a wide and easily correlated footprint.`);
  } else {
    notes.push(`This username is active on ${foundCount} platform(s).`);
  }

  if (usernameResult.variationHits && usernameResult.variationHits.length > 0) {
    score = clamp(score + 10, 0, 90);
    notes.push('Common variations of this username are also active elsewhere.');
  }

  return { score, level: levelFromScore(score), notes };
}

function scoreEmailExposure(emailResult) {
  if (!emailResult) return { score: 0, level: 'low', notes: [] };
  const notes = [];
  let score = 0;

  if (emailResult.gravatar && emailResult.gravatar.registered) {
    score += 25;
    notes.push('A public Gravatar profile is linked to this email.');
  }

  if (emailResult.breachSignal && emailResult.breachSignal.checked) {
    const matches = emailResult.breachSignal.matches;
    if (matches.length > 0) {
      score += clamp(matches.length * 15, 0, 55);
      notes.push(`This email's domain matches ${matches.length} known breached service${matches.length === 1 ? '' : 's'} (e.g. a work/company domain that was itself breached).`);
    } else {
      notes.push('This email\'s domain does not directly match any known breached service.');
    }
  } else if (emailResult.breachSignal) {
    notes.push(emailResult.breachSignal.note || 'Breach data was not available for this check.');
  }

  return { score: clamp(score, 0, 100), level: levelFromScore(score), notes };
}

function scoreMetadataExposure(metadataResult) {
  if (!metadataResult || !metadataResult.hasMetadata) {
    return { score: 0, level: 'low', notes: metadataResult ? [metadataResult.note].filter(Boolean) : [] };
  }
  const notes = [];
  let score = 0;
  if (metadataResult.gps) {
    score += 60;
    notes.push('This image contains embedded GPS coordinates showing exactly where it was taken.');
  }
  if (metadataResult.device && (metadataResult.device.make || metadataResult.device.model)) {
    score += 15;
    notes.push('This image reveals the device model used to take it.');
  }
  if (metadataResult.timestamp) {
    score += 10;
    notes.push('This image reveals the exact date and time it was taken.');
  }
  return { score: clamp(score, 0, 100), level: levelFromScore(score), notes };
}

function scorePasswordExposure(passwordResult) {
  if (!passwordResult || passwordResult.error) return { score: 0, level: 'low', notes: [] };
  const levelToScore = { very_weak: 90, weak: 65, moderate: 35, strong: 12, very_strong: 3 };
  const score = levelToScore[passwordResult.level] ?? 0;
  const notes = passwordResult.patterns && passwordResult.patterns.length
    ? passwordResult.patterns.slice(0, 3)
    : [`Estimated crack time: ${passwordResult.estimatedCrackTime}.`];
  return { score, level: levelFromScore(score), notes };
}

function buildActionItems({ usernameScore, emailScore, metadataScore, passwordScore, usernameResult, emailResult, deepCorrelation, passwordResult }) {
  const actions = [];

  if (usernameResult && usernameResult.found.length > 0) {
    actions.push('Review privacy settings on the platforms listed as "found", especially any with public contact info or location.');
  }
  if (usernameResult && usernameResult.variationHits && usernameResult.variationHits.length > 0) {
    actions.push('Consider whether the username variations found elsewhere are actually yours; if not, they may be impersonation accounts worth reporting.');
  }
  if (deepCorrelation && deepCorrelation.attempted && deepCorrelation.discovered.length > 0) {
    actions.push('Your GitHub bio links to other accounts, consider whether all of them need to be publicly connected to each other.');
  }
  if (emailResult && emailResult.breachSignal && emailResult.breachSignal.checked && emailResult.breachSignal.matches.length > 0) {
    actions.push('A service tied to your email domain was breached, if you reused that password elsewhere, change it and enable two-factor authentication.');
  }
  if (emailResult && emailResult.gravatar && emailResult.gravatar.registered) {
    actions.push('If you don\'t want a public profile tied to this email, remove or update it at gravatar.com.');
  }
  if (emailResult && emailResult.domain && emailResult.domain.emailSecurity && !emailResult.domain.emailSecurity.hasDmarc) {
    actions.push('This domain has no DMARC record, if it\'s your company domain, this makes it easier for attackers to spoof emails from it.');
  }
  if (metadataScore && metadataScore.score > 0) {
    actions.push('Strip EXIF metadata before posting photos publicly, most phones/OSes have a "remove location" or "remove metadata" share option.');
  }
  if (passwordResult && !passwordResult.error && passwordScore && passwordScore.score >= 35) {
    actions.push('This password pattern is guessable, ' + (passwordResult.suggestions[0] || 'use a longer, more random password.'));
  }
  if (actions.length === 0) {
    actions.push('No significant exposure found in this check. Keep reviewing privacy settings periodically as new accounts get created.');
  }
  return actions;
}

function buildReport({ usernameResult, emailResult, metadataResult, deepCorrelation = null, passwordResult = null }) {
  const usernameScore = scoreUsernameExposure(usernameResult);
  const emailScore = scoreEmailExposure(emailResult);
  const metadataScore = scoreMetadataExposure(metadataResult);
  const passwordScore = scorePasswordExposure(passwordResult);
  const correlation = correlateIdentity({ usernameResult, emailResult, deepCorrelation });

  const componentScores = [usernameScore.score, emailScore.score, metadataScore.score, passwordScore.score];
  const activeComponents = componentScores.filter((_, i) => {
    if (i === 0) return !!usernameResult;
    if (i === 1) return !!emailResult;
    if (i === 2) return !!(metadataResult && metadataResult.hasMetadata);
    if (i === 3) return !!(passwordResult && !passwordResult.error);
    return false;
  });
  const overallScore = activeComponents.length
    ? Math.round(activeComponents.reduce((a, b) => a + b, 0) / activeComponents.length)
    : 0;

  return {
    overallScore,
    overallLevel: levelFromScore(overallScore),
    categories: {
      social: { score: usernameScore.score, level: usernameScore.level, notes: usernameScore.notes },
      breach: { score: emailScore.score, level: emailScore.level, notes: emailScore.notes },
      metadata: { score: metadataScore.score, level: metadataScore.level, notes: metadataScore.notes },
      password: { score: passwordScore.score, level: passwordScore.level, notes: passwordScore.notes }
    },
    correlation,
    actionItems: buildActionItems({ usernameScore, emailScore, metadataScore, passwordScore, usernameResult, emailResult, deepCorrelation, passwordResult })
  };
}

module.exports = { buildReport };
