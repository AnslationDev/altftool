// Deterministic, rule-based subject line analyzer.
//
// Every number produced here comes from a fixed formula applied to the
// dictionaries in ./dictionaries.js — there is no randomness and no network
// call, so the same input always produces the same output. Where a
// well-known formula exists (Flesch Reading Ease for readability) we use the
// real formula rather than inventing one.

import {
  SPAM_WORDS,
  URGENCY_WORDS,
  POWER_WORDS,
  PERSONALIZATION_WORDS,
  PERSONALIZATION_MERGE_TAG_PATTERNS,
  CURIOSITY_WORDS,
  TRUST_WORDS,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  EMOJI_REGEX,
} from "./dictionaries";

// Weights used by scoreOverall — surfaced to the UI so the score never feels
// like a black box. They sum to 1.
export const OVERALL_WEIGHTS = {
  length: 0.2,
  spamSafety: 0.15,
  readability: 0.15,
  personalization: 0.1,
  urgency: 0.1,
  powerWords: 0.1,
  capitalization: 0.1,
  numbers: 0.05,
  emoji: 0.05,
};

const IDEAL_LENGTH_MIN = 30;
const IDEAL_LENGTH_MAX = 50;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Returns the dictionary entries that appear in `lowerText`. Multi-word
// phrases are matched as substrings; single words are matched on word
// boundaries so "you" doesn't match inside "youth".
function findMatches(lowerText, dictionary) {
  const found = [];
  for (const phrase of dictionary) {
    const needle = phrase.toLowerCase();
    if (needle.includes(" ")) {
      if (lowerText.includes(needle)) found.push(phrase);
    } else {
      const re = new RegExp(`\\b${escapeRegExp(needle)}\\b`, "i");
      if (re.test(lowerText)) found.push(phrase);
    }
  }
  return found;
}

// Locates non-overlapping spans of dictionary matches in the *original*
// (case-preserved) subject, for highlighting. Earlier + longer + higher
// priority (spam > urgency > power > personalization) matches win overlaps.
export function findHighlightSpans(subject) {
  const lower = subject.toLowerCase();
  const categories = [
    { name: "spam", list: SPAM_WORDS },
    { name: "urgency", list: URGENCY_WORDS },
    { name: "power", list: POWER_WORDS },
    { name: "personalization", list: PERSONALIZATION_WORDS },
  ];

  const candidates = [];
  for (const { name, list } of categories) {
    for (const phrase of list) {
      const needle = phrase.toLowerCase();
      let searchFrom = 0;
      for (;;) {
        const idx = lower.indexOf(needle, searchFrom);
        if (idx === -1) break;
        const before = idx === 0 ? "" : lower[idx - 1];
        const after = idx + needle.length >= lower.length ? "" : lower[idx + needle.length];
        const isBoundaryOk =
          needle.includes(" ") || (!/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after));
        if (isBoundaryOk) {
          candidates.push({
            start: idx,
            end: idx + needle.length,
            category: name,
            text: subject.slice(idx, idx + needle.length),
          });
        }
        searchFrom = idx + needle.length;
      }
    }
  }

  const priority = { spam: 0, urgency: 1, power: 2, personalization: 3 };
  candidates.sort(
    (a, b) =>
      a.start - b.start ||
      b.end - b.start - (a.end - a.start) ||
      priority[a.category] - priority[b.category],
  );

  const spans = [];
  let lastEnd = -1;
  for (const span of candidates) {
    if (span.start >= lastEnd) {
      spans.push(span);
      lastEnd = span.end;
    }
  }
  return spans;
}

function countSyllables(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  const vowelGroups = clean.match(/[aeiouy]+/g) || [];
  let count = vowelGroups.length;
  if (clean.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

// Flesch Reading Ease, treated as a single "sentence" (a subject line has no
// sentence breaks). Clamped to 0-100 since the raw formula has no upper/lower
// bound and short phrases routinely score above 100 or below 0.
function scoreReadability(words) {
  if (words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const syllablesPerWord = totalSyllables / words.length;
  const fre = 206.835 - 1.015 * words.length - 84.6 * syllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(fre)));
}

function scoreLength(chars) {
  if (chars === 0) return 0;
  if (chars >= IDEAL_LENGTH_MIN && chars <= IDEAL_LENGTH_MAX) return 100;
  const distance = chars < IDEAL_LENGTH_MIN ? IDEAL_LENGTH_MIN - chars : chars - IDEAL_LENGTH_MAX;
  return Math.max(10, Math.round(100 - distance * 3));
}

function scoreSpamRisk(subject, spamMatches) {
  let penalty = Math.min(60, spamMatches.length * 12);

  const exclamations = (subject.match(/!/g) || []).length;
  if (exclamations >= 3) penalty += 15;
  else if (exclamations >= 2) penalty += 10;
  else if (exclamations >= 1) penalty += 5;

  const allCapsWords = subject
    .split(/\s+/)
    .filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
  penalty += Math.min(30, allCapsWords.length * 10);

  const dollarSigns = (subject.match(/\$/g) || []).length;
  if (dollarSigns >= 2) penalty += 10;

  if (/([!$%*#])\1{1,}/.test(subject)) penalty += 10;
  if (/\$\d/.test(subject) && /free/i.test(subject)) penalty += 5;

  return Math.max(0, Math.min(100, Math.round(penalty)));
}

function scorePersonalization(matchCount, hasMergeTag) {
  if (hasMergeTag) return 100;
  const score = 30 + Math.min(2, matchCount) * 35;
  return Math.max(0, Math.min(100, score));
}

function scoreUrgency(matchCount) {
  if (matchCount === 0) return 40;
  if (matchCount === 1) return 85;
  if (matchCount === 2) return 100;
  return 70; // stacking urgency phrases reads as less credible, not more
}

function scorePowerWords(matchCount) {
  if (matchCount === 0) return 20;
  if (matchCount === 1) return 60;
  if (matchCount === 2) return 85;
  return 100;
}

function scoreCapitalization(subject) {
  const letters = subject.replace(/[^A-Za-z]/g, "");
  if (!letters) return 100;
  if (subject === subject.toUpperCase() && letters.length > 2) return 10;

  const allCapsWords = subject
    .split(/\s+/)
    .filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (allCapsWords.length === 0) return 100;
  if (allCapsWords.length === 1) return 80;
  if (allCapsWords.length === 2) return 55;
  return 25;
}

function scoreNumbers(numberMatches) {
  if (numberMatches.length === 0) return 55;
  if (numberMatches.length === 1) return 90;
  return 100;
}

function scoreEmoji(emojiMatches) {
  const count = emojiMatches.length;
  if (count === 0) return 65;
  if (count === 1) return 100;
  if (count === 2) return 75;
  return 30;
}

function scoreOverall(scores) {
  const spamSafety = 100 - scores.spamRisk;
  const value =
    scores.length * OVERALL_WEIGHTS.length +
    spamSafety * OVERALL_WEIGHTS.spamSafety +
    scores.readability * OVERALL_WEIGHTS.readability +
    scores.personalization * OVERALL_WEIGHTS.personalization +
    scores.urgency * OVERALL_WEIGHTS.urgency +
    scores.powerWords * OVERALL_WEIGHTS.powerWords +
    scores.capitalization * OVERALL_WEIGHTS.capitalization +
    scores.numbers * OVERALL_WEIGHTS.numbers +
    scores.emoji * OVERALL_WEIGHTS.emoji;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreClickability({
  lengthScore,
  powerWordsScore,
  personalizationScore,
  urgencyScore,
  spamRisk,
  hasQuestion,
}) {
  const questionComponent = hasQuestion ? 100 : 40;
  const value =
    powerWordsScore * 0.25 +
    personalizationScore * 0.2 +
    urgencyScore * 0.15 +
    lengthScore * 0.15 +
    questionComponent * 0.15 +
    (100 - spamRisk) * 0.1;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function gradeFromScore(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "D";
}

function classifyEmotionalTone({
  positiveMatches,
  negativeMatches,
  urgencyMatches,
  powerMatches,
  curiosityMatches,
  trustMatches,
  hasQuestion,
}) {
  const candidates = {
    "Positive & Exciting": positiveMatches.length * 2 + powerMatches.length,
    "Urgent & Assertive": urgencyMatches.length * 2,
    "Curious & Intriguing": curiosityMatches.length * 2 + (hasQuestion ? 2 : 0),
    "Trustworthy & Professional": trustMatches.length * 2,
    Cautionary: negativeMatches.length * 2,
  };

  let label = "Neutral & Informative";
  let max = 0;
  for (const [key, value] of Object.entries(candidates)) {
    if (value > max) {
      max = value;
      label = key;
    }
  }

  return { label, positive: positiveMatches.length, negative: negativeMatches.length };
}

function deriveInsights({
  curiosityMatches,
  hasQuestion,
  trustMatches,
  personalizationScore,
  spamRisk,
  capitalizationScore,
  urgencyScore,
  positiveMatches,
  negativeMatches,
  powerMatches,
  readabilityScore,
}) {
  const curiosity = Math.max(
    0,
    Math.min(100, curiosityMatches.length * 30 + (hasQuestion ? 40 : 0) + 20),
  );
  const trust = Math.max(
    0,
    Math.min(
      100,
      trustMatches.length * 20 + Math.round(personalizationScore * 0.3) + Math.round((100 - spamRisk) * 0.3),
    ),
  );
  const professionalism = Math.max(
    0,
    Math.min(100, Math.round((100 - spamRisk) * 0.5 + capitalizationScore * 0.5)),
  );
  const emotionalImpact = Math.max(
    0,
    Math.min(100, (positiveMatches.length + negativeMatches.length) * 15 + powerMatches.length * 10 + 15),
  );

  return {
    curiosity,
    trust,
    professionalism,
    urgency: urgencyScore,
    emotionalImpact,
    readability: readabilityScore,
  };
}

function buildEmptyResult() {
  return {
    subject: "",
    chars: 0,
    words: 0,
    scores: {
      length: 0,
      spamRisk: 0,
      readability: 0,
      personalization: 0,
      urgency: 0,
      powerWords: 0,
      capitalization: 0,
      numbers: 0,
      emoji: 0,
      overall: 0,
      clickability: 0,
      grade: "D",
    },
    flags: {
      hasQuestion: false,
      hasNumber: false,
      hasEmoji: false,
      isAllCaps: false,
      hasMergeTag: false,
    },
    detected: {
      spamWords: [],
      urgencyWords: [],
      powerWords: [],
      personalizationWords: [],
      curiosityWords: [],
      trustWords: [],
      emojis: [],
      numbers: [],
    },
    emotionalTone: { label: "—", positive: 0, negative: 0 },
    insights: { curiosity: 0, trust: 0, professionalism: 0, urgency: 0, emotionalImpact: 0, readability: 0 },
  };
}

export function analyzeSubject(rawSubject) {
  const subject = (rawSubject || "").trim();
  if (!subject) return buildEmptyResult();

  const lowerText = subject.toLowerCase();
  const words = subject.split(/\s+/).filter(Boolean);
  const chars = subject.length;

  const spamMatches = findMatches(lowerText, SPAM_WORDS);
  const urgencyMatches = findMatches(lowerText, URGENCY_WORDS);
  const powerMatches = findMatches(lowerText, POWER_WORDS);
  const personalizationMatches = findMatches(lowerText, PERSONALIZATION_WORDS);
  const curiosityMatches = findMatches(lowerText, CURIOSITY_WORDS);
  const trustMatches = findMatches(lowerText, TRUST_WORDS);
  const positiveMatches = findMatches(lowerText, POSITIVE_WORDS);
  const negativeMatches = findMatches(lowerText, NEGATIVE_WORDS);
  const hasMergeTag = PERSONALIZATION_MERGE_TAG_PATTERNS.some((re) => re.test(subject));
  const numberMatches = subject.match(/\d+(\.\d+)?%?/g) || [];
  const emojiMatches = subject.match(EMOJI_REGEX) || [];
  const hasQuestion = subject.includes("?");

  const lengthScore = scoreLength(chars);
  const spamRisk = scoreSpamRisk(subject, spamMatches);
  const readabilityScore = scoreReadability(words);
  const personalizationScore = scorePersonalization(personalizationMatches.length, hasMergeTag);
  const urgencyScore = scoreUrgency(urgencyMatches.length);
  const powerWordsScore = scorePowerWords(powerMatches.length);
  const capitalizationScore = scoreCapitalization(subject);
  const numbersScore = scoreNumbers(numberMatches);
  const emojiScore = scoreEmoji(emojiMatches);

  const scores = {
    length: lengthScore,
    spamRisk,
    readability: readabilityScore,
    personalization: personalizationScore,
    urgency: urgencyScore,
    powerWords: powerWordsScore,
    capitalization: capitalizationScore,
    numbers: numbersScore,
    emoji: emojiScore,
  };

  const overall = scoreOverall(scores);
  const grade = gradeFromScore(overall);
  const clickability = scoreClickability({
    lengthScore,
    powerWordsScore,
    personalizationScore,
    urgencyScore,
    spamRisk,
    hasQuestion,
  });

  const emotionalTone = classifyEmotionalTone({
    positiveMatches,
    negativeMatches,
    urgencyMatches,
    powerMatches,
    curiosityMatches,
    trustMatches,
    hasQuestion,
  });

  const insights = deriveInsights({
    curiosityMatches,
    hasQuestion,
    trustMatches,
    personalizationScore,
    spamRisk,
    capitalizationScore,
    urgencyScore: scores.urgency,
    positiveMatches,
    negativeMatches,
    powerMatches,
    readabilityScore,
  });

  return {
    subject,
    chars,
    words: words.length,
    scores: { ...scores, overall, clickability, grade },
    flags: {
      hasQuestion,
      hasNumber: numberMatches.length > 0,
      hasEmoji: emojiMatches.length > 0,
      isAllCaps: subject === subject.toUpperCase() && /[A-Z]/.test(subject),
      hasMergeTag,
    },
    detected: {
      spamWords: spamMatches,
      urgencyWords: urgencyMatches,
      powerWords: powerMatches,
      personalizationWords: personalizationMatches,
      curiosityWords: curiosityMatches,
      trustWords: trustMatches,
      emojis: emojiMatches,
      numbers: numberMatches,
    },
    emotionalTone,
    insights,
  };
}
