// Generates 5 improved subject-line variations using fixed, deterministic
// string templates keyed off the actual weaknesses the scoring engine found
// (no randomness, no network call). Each variation is re-scored with the
// same analyzeSubject() used for the original, so the "projected score" shown
// in the UI is real, not decorative.
//
// AI-ready by design: `generateVariations` delegates to a `provider` object
// shaped `{ generate(subject, analysis): VariationDraft[] }`. RULE_BASED_PROVIDER
// is the only implementation today; a future AI-backed provider (e.g. one that
// calls an LLM) can implement the same interface — `generate` may become
// async there — and be swapped in via the `provider` option without touching
// any UI code.

import { analyzeSubject } from "./scoringEngine";
import { POWER_WORDS, URGENCY_WORDS } from "./dictionaries";

function capitalize(word) {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
}

function lowerFirstChar(text) {
  if (!text) return text;
  const firstWord = text.match(/^\S+/)?.[0] ?? "";
  const isShouting = firstWord.length > 1 && firstWord === firstWord.toUpperCase() && /[A-Z]/.test(firstWord);
  // Don't mangle a leading ALL-CAPS word (e.g. "FREE!!!") into something like "fREE!!!".
  if (isShouting) return text;
  return text[0].toLowerCase() + text.slice(1);
}

function trimTrailingPunctuation(text) {
  return text.replace(/[.!?]+$/, "").trim();
}

function findFirstMatch(lowerText, list) {
  for (const phrase of list) {
    if (lowerText.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

function removeFirstOccurrence(subject, phrase) {
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return subject.replace(re, "").replace(/\s{2,}/g, " ").trim();
}

function personalizedVariant(subject, analysis) {
  if (analysis.flags.hasMergeTag) {
    return { text: `Just for you: ${subject}`, rationale: "Reframed as a 1:1 offer for readers who don't respond to merge tags." };
  }
  return {
    text: `{FirstName}, ${lowerFirstChar(subject)}`,
    rationale: `Personalization score was ${analysis.scores.personalization}/100 — a merge tag lifts it to the maximum.`,
  };
}

function curiosityVariant(subject) {
  const stripped = trimTrailingPunctuation(subject);
  if (subject.trim().endsWith("?")) {
    return { text: `Here's why: ${subject}`, rationale: "Already a question — added a curiosity lead-in instead of a second question." };
  }
  return {
    text: `Why ${lowerFirstChar(stripped)}?`,
    rationale: "Reframed as a question to trigger curiosity and boost the clickability score.",
  };
}

function urgencyVariant(subject, analysis) {
  const lowerText = subject.toLowerCase();
  const existingUrgency = findFirstMatch(lowerText, URGENCY_WORDS);
  if (!existingUrgency) {
    const candidate = `${subject} — Ends Tonight`;
    const text = candidate.length <= 70 ? candidate : `${subject} — Today Only`;
    return { text, rationale: `No urgency language found (urgency score ${analysis.scores.urgency}/100) — added a light deadline.` };
  }
  const withoutFirst = removeFirstOccurrence(subject, existingUrgency);
  return {
    text: `${withoutFirst || subject} (Today Only)`,
    rationale: `${analysis.detected.urgencyWords.length} urgency phrase(s) detected — reduced stacking to one clear deadline.`,
  };
}

function numberVariant(subject, analysis) {
  if (!analysis.flags.hasNumber) {
    return {
      text: `3 Reasons ${lowerFirstChar(trimTrailingPunctuation(subject))}`,
      rationale: "No numbers detected — a concrete count adds credibility and a scannable hook.",
    };
  }
  return { text: `${subject} (Save Now)`, rationale: "Already contains a number — paired it with a direct call to action." };
}

function lengthOrPowerVariant(subject, analysis) {
  const IDEAL_MAX = 50;
  const IDEAL_MIN = 30;
  if (analysis.chars > IDEAL_MAX) {
    const truncated = subject.slice(0, 47).replace(/\s+\S*$/, "");
    return { text: `${truncated}…`, rationale: `At ${analysis.chars} characters this would be truncated on most inboxes — tightened to fit the ideal 30-50 range.` };
  }
  if (analysis.chars < IDEAL_MIN) {
    return { text: `${subject} — See What's Inside`, rationale: `At ${analysis.chars} characters this is shorter than the ideal 30-50 range — extended with a benefit clause.` };
  }
  const lowerText = subject.toLowerCase();
  const unusedPowerWord = POWER_WORDS.find((word) => !lowerText.includes(word.toLowerCase()) && !word.includes(" "));
  if (unusedPowerWord) {
    return { text: `${capitalize(unusedPowerWord)}: ${subject}`, rationale: `Length is already ideal — added the power word "${unusedPowerWord}" to lift persuasiveness.` };
  }
  return { text: `${subject} (Limited Spots)`, rationale: "Length is already ideal — added a scarcity cue." };
}

export const RULE_BASED_PROVIDER = {
  name: "rule-based",
  generate(subject, analysis) {
    return [
      personalizedVariant(subject, analysis),
      curiosityVariant(subject, analysis),
      urgencyVariant(subject, analysis),
      numberVariant(subject, analysis),
      lengthOrPowerVariant(subject, analysis),
    ];
  },
};

export function generateVariations(subject, analysis, { provider = RULE_BASED_PROVIDER } = {}) {
  if (!subject?.trim()) return [];

  const drafts = provider.generate(subject, analysis);
  const seen = new Set([subject.trim().toLowerCase()]);

  return drafts
    .filter((draft) => {
      const key = draft.text.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((draft, index) => {
      const projected = analyzeSubject(draft.text);
      return {
        id: `variation-${index + 1}`,
        text: draft.text,
        rationale: draft.rationale,
        projectedScore: projected.scores.overall,
        projectedGrade: projected.scores.grade,
        scoreDelta: projected.scores.overall - analysis.scores.overall,
      };
    });
}
