// Turns the analysis object into concrete, evidence-based suggestions.
// Every line references an actual number or actual detected word from the
// analysis — nothing here is a canned "best practice" shown unconditionally.

export function generateSuggestions(analysis) {
  const suggestions = [];
  if (!analysis?.subject) return suggestions;

  const { scores, detected, flags, chars } = analysis;

  if (chars < 20) {
    suggestions.push(
      `Your subject is only ${chars} characters — consider expanding toward 30-50 characters for the best open-rate balance.`,
    );
  } else if (chars > 60) {
    suggestions.push(
      `At ${chars} characters, this subject will be truncated on most inboxes — trim it closer to 50 characters.`,
    );
  }

  if (detected.spamWords.length > 0) {
    const sample = detected.spamWords.slice(0, 3).join('", "');
    suggestions.push(
      `Remove or rephrase ${detected.spamWords.length} spam-trigger phrase${detected.spamWords.length > 1 ? "s" : ""} ("${sample}"${detected.spamWords.length > 3 ? ", …" : ""}) to lower spam-filter risk.`,
    );
  }

  if (scores.spamRisk >= 50) {
    suggestions.push(
      `Spam risk is high (${scores.spamRisk}/100) — avoid stacking exclamation marks, ALL-CAPS words and dollar signs together.`,
    );
  }

  if (flags.isAllCaps) {
    suggestions.push(
      "The entire subject is in ALL CAPS — this is one of the strongest spam-filter triggers. Switch to sentence case.",
    );
  }

  if (scores.personalization <= 30 && !flags.hasMergeTag) {
    suggestions.push(
      'Add a personalization token (e.g. "{FirstName}") or a direct "you/your" to make the email feel individually written.',
    );
  }

  if (detected.urgencyWords.length >= 3) {
    suggestions.push(
      `${detected.urgencyWords.length} urgency phrases detected — stacking this many reads as pressure tactics and can hurt trust.`,
    );
  } else if (detected.urgencyWords.length === 0 && scores.urgency < 50) {
    suggestions.push(
      "No urgency or time-bound language found — consider adding a light deadline if the offer is genuinely time-limited.",
    );
  }

  if (detected.powerWords.length === 0) {
    suggestions.push(
      'No power words detected — words like "exclusive", "proven" or "instantly" can make the subject more persuasive.',
    );
  }

  if (scores.readability < 50) {
    suggestions.push(
      `Readability score is low (${scores.readability}/100) — use shorter, more common words or split the idea into a simpler phrase.`,
    );
  }

  if (detected.emojis.length >= 3) {
    suggestions.push(
      `${detected.emojis.length} emojis detected — more than 1-2 emojis often looks unprofessional or triggers spam filters.`,
    );
  } else if (detected.emojis.length === 0) {
    suggestions.push(
      "No emoji used — a single relevant emoji can lift open rates on mobile without hurting deliverability.",
    );
  }

  if (!flags.hasNumber) {
    suggestions.push(
      "No numbers present — a specific number (a stat, a percentage, a count) often boosts perceived credibility.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("This subject line is well balanced across every metric — no changes needed.");
  }

  return suggestions;
}
