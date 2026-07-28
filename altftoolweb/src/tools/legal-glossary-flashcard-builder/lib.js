/**
 * Legal glossary flashcard builder.
 *
 * Two published rules do the work here:
 *
 * 1. SM-2 spaced repetition (Wozniak, SuperMemo 2, 1987), the algorithm Anki and most
 *    open-source review apps are built on:
 *      EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), floored at 1.3
 *      I(1) = 1 day, I(2) = 6 days, I(n) = round(I(n-1) * EF) for n > 2
 *      a grade below 3 resets the repetition count to zero and the card is seen again the
 *      next day.
 *
 * 2. The minimum information principle (also Wozniak): a card should carry one simple,
 *    atomic fact. Long answers are the main cause of failed reviews, so the deck audit
 *    flags answers past a word ceiling, circular definitions and duplicate terms.
 *
 * Study aid only. Definitions are general plain-language explanations, not legal advice,
 * and the meaning of a term can differ between jurisdictions.
 */

/** SM-2 constants (Wozniak, 1987). */
export const SM2 = {
  MIN_EASE: 1.3,
  DEFAULT_EASE: 2.5,
  FIRST_INTERVAL: 1,
  SECOND_INTERVAL: 6,
  PASS_GRADE: 3,
  MAX_GRADE: 5,
};

/** Leitner box intervals in days — the classic five-box doubling schedule. */
export const LEITNER_BOXES = [
  { box: 1, days: 1, label: "Daily" },
  { box: 2, days: 2, label: "Every 2 days" },
  { box: 3, days: 4, label: "Twice a week" },
  { box: 4, days: 8, label: "Weekly" },
  { box: 5, days: 16, label: "Fortnightly" },
];

/**
 * Card-quality ceilings. The 25-word answer limit follows the minimum information
 * principle: past roughly one line, recall accuracy drops and the card should be split.
 */
export const CARD_LIMITS = { MAX_ANSWER_WORDS: 25, MAX_TERM_WORDS: 6 };

/** Supported term/definition separators. */
export const SEPARATORS = [
  { id: "auto", label: "Detect automatically", pattern: null },
  { id: "tab", label: "Tab", pattern: /\t+/ },
  { id: "colon", label: "Colon  term: definition", pattern: /\s*:\s+/ },
  { id: "dash", label: "Dash  term - definition", pattern: /\s+[-–—]\s+/ },
  { id: "pipe", label: "Pipe  term | definition", pattern: /\s*\|\s*/ },
  { id: "comma", label: "Comma  term, definition", pattern: /\s*,\s+/ },
];

const AUTO_ORDER = ["tab", "pipe", "colon", "dash", "comma"];

/** Export formats. */
export const EXPORT_FORMATS = [
  { id: "anki", label: "Anki / Quizlet (tab separated)" },
  { id: "csv", label: "CSV (spreadsheet)" },
  { id: "markdown", label: "Markdown table" },
  { id: "study", label: "Plain study list" },
];

/** A starter deck of general legal vocabulary, in plain language. */
export const STARTER_DECK = [
  ["Actus reus", "The physical act or unlawful omission that forms the conduct element of a crime."],
  ["Mens rea", "The mental element an offence requires — intention, knowledge or recklessness."],
  ["Ratio decidendi", "The legal reasoning essential to a decision; the part that binds later courts."],
  ["Obiter dicta", "Remarks in a judgment not necessary to the decision, so persuasive rather than binding."],
  ["Stare decisis", "The practice of following the reasoning of earlier decisions of higher courts."],
  ["Consideration", "Something of value each side gives in a contract; the price paid for a promise."],
  ["Estoppel", "A rule stopping a party going back on a position another has relied on to their detriment."],
  ["Tort", "A civil wrong other than breach of contract, usually remedied by an award of damages."],
  ["Negligence", "Breach of a duty of care that causes foreseeable damage to the claimant."],
  ["Locus standi", "A person's right to bring a particular case before a particular court."],
  ["Habeas corpus", "A writ requiring the state to justify a person's detention before a court."],
  ["Prima facie", "On its face; evidence sufficient to establish a fact unless it is rebutted."],
  ["Res judicata", "A matter finally decided between the same parties cannot be litigated again."],
  ["Ultra vires", "Beyond the powers granted by statute or constitution, and therefore invalid."],
  ["Injunction", "A court order requiring a party to do, or to stop doing, a specified act."],
  ["Burden of proof", "The duty to prove a fact: beyond reasonable doubt in criminal cases, on the balance of probabilities in most civil cases."],
  ["Affidavit", "A written statement of facts sworn or affirmed to be true and used as evidence."],
  ["Jurisdiction", "The authority of a court to hear and decide a particular kind of case."],
  ["Caveat emptor", "Let the buyer beware — the buyer carries the quality risk unless a term or statute shifts it."],
  ["Force majeure", "A contract clause excusing performance when named extraordinary events prevent it."],
  ["Indemnity", "A promise to make good another party's loss, usually without proving a breach."],
  ["Bailment", "Delivery of goods to someone else for a purpose, on terms that they be returned or dealt with as directed."],
];

function words(text) {
  const matches = String(text || "").match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g);
  return matches ? matches.length : 0;
}

function trim(value) {
  return String(value == null ? "" : value).trim();
}

function splitLine(line, pattern) {
  const index = line.search(pattern);
  if (index < 0) return null;
  const match = line.match(pattern);
  if (!match) return null;
  const term = line.slice(0, index);
  const definition = line.slice(index + match[0].length);
  if (!trim(term) || !trim(definition)) return null;
  return [trim(term), trim(definition)];
}

/**
 * Parse pasted glossary text into cards.
 * @param {string} text One term/definition pair per line.
 * @param {string} separatorId One of SEPARATORS ids.
 * @returns {object} { cards, unparsed, duplicates, separatorUsed } or { error }
 */
export function parseGlossary(text, separatorId = "auto") {
  const source = trim(text);
  if (!source) return { error: "Paste at least one term and definition, one pair per line." };

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return { error: "No usable lines were found in the text." };

  let chosen = SEPARATORS.find((item) => item.id === separatorId);
  if (!chosen) return { error: "Unknown separator." };

  if (chosen.id === "auto") {
    let best = null;
    let bestHits = 0;
    AUTO_ORDER.forEach((id) => {
      const candidate = SEPARATORS.find((item) => item.id === id);
      const hits = lines.filter((line) => splitLine(line, candidate.pattern)).length;
      if (hits > bestHits) {
        bestHits = hits;
        best = candidate;
      }
    });
    if (!best) {
      return {
        error: "No separator found. Put a tab, a colon, a pipe or a dash between each term and its definition.",
      };
    }
    chosen = best;
  }

  const cards = [];
  const unparsed = [];
  const duplicates = [];
  const seen = new Map();

  lines.forEach((line, index) => {
    const parts = splitLine(line, chosen.pattern);
    if (!parts) {
      unparsed.push({ line: index + 1, text: line });
      return;
    }
    const [term, definition] = parts;
    const key = term.toLowerCase();
    if (seen.has(key)) {
      duplicates.push({ term, firstSeenAt: seen.get(key) });
      return;
    }
    seen.set(key, index + 1);
    cards.push({ term, definition, answerWords: words(definition), termWords: words(term) });
  });

  if (cards.length === 0) {
    return { error: `No line matched the "${chosen.label}" separator. Try a different one.` };
  }

  return { cards, unparsed, duplicates, separatorUsed: chosen.id, separatorLabel: chosen.label };
}

/**
 * Audit a parsed deck against the minimum information principle.
 * @returns {object} { longAnswers, circular, longTerms, cleanCount }
 */
export function auditDeck(cards = []) {
  const list = Array.isArray(cards) ? cards : [];
  const longAnswers = list.filter((card) => card.answerWords > CARD_LIMITS.MAX_ANSWER_WORDS);
  const longTerms = list.filter((card) => card.termWords > CARD_LIMITS.MAX_TERM_WORDS);
  const circular = list.filter((card) => {
    const term = card.term.toLowerCase();
    if (term.length < 4) return false;
    return card.definition.toLowerCase().includes(term);
  });
  const flagged = new Set([...longAnswers, ...longTerms, ...circular].map((card) => card.term));
  return {
    longAnswers,
    longTerms,
    circular,
    flaggedCount: flagged.size,
    cleanCount: Math.max(0, list.length - flagged.size),
  };
}

/**
 * One SM-2 review step.
 * @param {object} input { ease, repetitions, interval, quality }
 * @returns {object} { ease, repetitions, interval, lapsed } or { error }
 */
export function sm2Update({ ease = SM2.DEFAULT_EASE, repetitions = 0, interval = 0, quality } = {}) {
  const q = Number(quality);
  if (!Number.isFinite(q) || q < 0 || q > SM2.MAX_GRADE) {
    return { error: "Grade a card from 0 (blank) to 5 (perfect recall)." };
  }
  const ef = Number.isFinite(Number(ease)) && Number(ease) >= SM2.MIN_EASE ? Number(ease) : SM2.DEFAULT_EASE;
  const reps = Number.isFinite(Number(repetitions)) && Number(repetitions) >= 0 ? Math.floor(Number(repetitions)) : 0;
  const prevInterval = Number.isFinite(Number(interval)) && Number(interval) > 0 ? Number(interval) : 0;

  const raw = ef + (0.1 - (SM2.MAX_GRADE - q) * (0.08 + (SM2.MAX_GRADE - q) * 0.02));
  const nextEase = Math.max(SM2.MIN_EASE, Math.round(raw * 1000) / 1000);

  if (q < SM2.PASS_GRADE) {
    return { ease: nextEase, repetitions: 0, interval: SM2.FIRST_INTERVAL, lapsed: true };
  }

  const nextReps = reps + 1;
  let nextInterval;
  if (nextReps === 1) nextInterval = SM2.FIRST_INTERVAL;
  else if (nextReps === 2) nextInterval = SM2.SECOND_INTERVAL;
  else nextInterval = Math.max(1, Math.round(prevInterval * nextEase));

  return { ease: nextEase, repetitions: nextReps, interval: nextInterval, lapsed: false };
}

/**
 * The day offsets, counted from the day a card is first studied, on which SM-2 schedules
 * reviews within a horizon, assuming the learner keeps giving the same grade.
 * @returns {number[]} cumulative day offsets, ascending
 */
export function sm2Schedule({ quality = 4, horizonDays = 60, ease = SM2.DEFAULT_EASE } = {}) {
  const horizon = Number(horizonDays);
  if (!Number.isFinite(horizon) || horizon <= 0) return [];
  const q = Number(quality);
  if (!Number.isFinite(q) || q < SM2.PASS_GRADE) {
    // A failing grade repeats every day; cap the list at the horizon.
    const daily = [];
    for (let day = 1; day <= Math.min(horizon, 365); day += 1) daily.push(day);
    return daily;
  }

  const offsets = [];
  let state = { ease: Number(ease) || SM2.DEFAULT_EASE, repetitions: 0, interval: 0 };
  let cursor = 0;
  for (let step = 0; step < 60; step += 1) {
    const next = sm2Update({ ...state, quality: q });
    if (next.error) break;
    cursor += next.interval;
    if (cursor > horizon) break;
    offsets.push(cursor);
    state = { ease: next.ease, repetitions: next.repetitions, interval: next.interval };
  }
  return offsets;
}

/**
 * Workload plan: introduce newPerDay cards a day and review them on the SM-2 schedule.
 * @returns {object} { daysToIntroduceAll, totalReviews, totalCardTouches, peakDay,
 *                     peakLoad, averageLoad, daily } or { error }
 */
export function buildStudyPlan({ cardCount, newPerDay, daysToExam, quality = 4 } = {}) {
  const total = Number(cardCount);
  const perDay = Number(newPerDay);
  const horizon = Number(daysToExam);

  if (!Number.isFinite(total) || total <= 0) return { error: "The deck has no cards to schedule." };
  if (!Number.isFinite(perDay) || perDay <= 0) return { error: "Set at least 1 new card a day." };
  if (!Number.isFinite(horizon) || horizon <= 0) return { error: "Days until the exam must be 1 or more." };
  if (horizon > 730) return { error: "Plan for 730 days (two years) or fewer." };

  const cards = Math.min(Math.floor(total), 20000);
  const introducePerDay = Math.min(Math.floor(perDay), cards);
  const days = Math.floor(horizon);

  const daysToIntroduceAll = Math.ceil(cards / introducePerDay);
  const offsets = sm2Schedule({ quality, horizonDays: days });

  const newLoad = new Array(days + 1).fill(0);
  const reviewLoad = new Array(days + 1).fill(0);
  let introduced = 0;
  for (let day = 1; day <= days && introduced < cards; day += 1) {
    const batch = Math.min(introducePerDay, cards - introduced);
    introduced += batch;
    newLoad[day] += batch;
    offsets.forEach((offset) => {
      const reviewDay = day + offset;
      if (reviewDay <= days) reviewLoad[reviewDay] += batch;
    });
  }

  const daily = [];
  let peakDay = 1;
  let peakLoad = 0;
  let totalReviews = 0;
  let totalNew = 0;
  for (let day = 1; day <= days; day += 1) {
    const load = newLoad[day] + reviewLoad[day];
    totalReviews += reviewLoad[day];
    totalNew += newLoad[day];
    if (load > peakLoad) {
      peakLoad = load;
      peakDay = day;
    }
    daily.push({ day, newCards: newLoad[day], reviews: reviewLoad[day], total: load });
  }

  const coversDeck = introduced >= cards;
  const totalCardTouches = totalNew + totalReviews;

  return {
    cards,
    daysToIntroduceAll,
    introduced,
    coversDeck,
    totalNew,
    totalReviews,
    totalCardTouches,
    peakDay,
    peakLoad,
    averageLoad: totalCardTouches / days,
    firstPassIntervals: offsets,
    daily,
  };
}

function csvCell(value) {
  const text = String(value == null ? "" : value).replace(/"/g, '""');
  return `"${text}"`;
}

/**
 * Render the deck in an export format.
 * @returns {object} { text, lineCount } or { error }
 */
export function formatDeck(cards = [], format = "anki") {
  const list = Array.isArray(cards) ? cards : [];
  if (list.length === 0) return { error: "There are no cards to export." };
  const known = EXPORT_FORMATS.some((item) => item.id === format);
  if (!known) return { error: "Unknown export format." };

  let lines;
  if (format === "anki") {
    lines = list.map((card) => `${card.term}\t${card.definition}`);
  } else if (format === "csv") {
    lines = ["Term,Definition", ...list.map((card) => `${csvCell(card.term)},${csvCell(card.definition)}`)];
  } else if (format === "markdown") {
    lines = [
      "| Term | Definition |",
      "| --- | --- |",
      ...list.map((card) => `| ${card.term.replace(/\|/g, "\\|")} | ${card.definition.replace(/\|/g, "\\|")} |`),
    ];
  } else {
    lines = list.map((card, index) => `${index + 1}. ${card.term}\n   ${card.definition}`);
  }

  return { text: lines.join("\n"), lineCount: lines.length };
}

/** The starter deck rendered as pasteable "Term: definition" text. */
export function starterDeckText() {
  return STARTER_DECK.map(([term, definition]) => `${term}: ${definition}`).join("\n");
}
