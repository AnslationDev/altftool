/**
 * Random Startup Idea Generator — pure combinatorial idea builder.
 *
 * An idea is five independent choices, made deterministically from one seed:
 *
 *   audience  x  problem  x  delivery model  x  technology twist  x  pricing
 *
 * The seed is hashed once, then split by mixed-radix division (the same trick
 * an odometer uses): the remainder against each list length picks that list's
 * item, and the quotient carries into the next list. Every seed therefore maps
 * to exactly one combination, and consecutive seeds do not produce near-copies
 * because the hash scrambles the input first.
 *
 * The build-effort score is a rule, not a guess: each part carries an effort
 * weight from 1 (a form and a spreadsheet) to 5 (regulated or hardware-heavy),
 * and the score is the sum of the four weighted parts mapped onto 1-10.
 *
 * Pure module: no React, no DOM, no clock reads. Randomness comes in as `seed`.
 */

/** Who the product is for. `weight` = effort to reach and sell to this buyer:
 *  1 = self-serve consumer, 5 = long enterprise or regulated procurement cycle. */
export const AUDIENCES = [
  { id: "freelancers", label: "freelancers and solo consultants", weight: 1 },
  { id: "creators", label: "video and podcast creators", weight: 1 },
  { id: "smb-retail", label: "small retail and kirana shop owners", weight: 2 },
  { id: "restaurants", label: "independent restaurants and cloud kitchens", weight: 2 },
  { id: "teachers", label: "school teachers and coaching centres", weight: 2 },
  { id: "devteams", label: "small engineering teams", weight: 3 },
  { id: "recruiters", label: "in-house recruiters", weight: 3 },
  { id: "accountants", label: "accountants and tax practitioners", weight: 3 },
  { id: "logistics", label: "last-mile delivery fleets", weight: 4 },
  { id: "clinics", label: "single-doctor clinics and diagnostic labs", weight: 5 },
  { id: "banks", label: "co-operative banks and NBFCs", weight: 5 },
  { id: "manufacturers", label: "small-batch manufacturers", weight: 4 },
];

/** The job to be done. `weight` = difficulty of doing it well. */
export const PROBLEMS = [
  { id: "onboarding", label: "onboarding new customers takes days of manual back-and-forth", weight: 2 },
  { id: "quotes", label: "quotes and estimates are rebuilt from scratch every time", weight: 1 },
  { id: "scheduling", label: "scheduling collapses the moment one person cancels", weight: 2 },
  { id: "invoices", label: "invoices go out late and payment chasing is done by memory", weight: 2 },
  { id: "handover", label: "knowledge lives in one person's head and leaves when they do", weight: 3 },
  { id: "compliance", label: "compliance paperwork is discovered only after the deadline", weight: 4 },
  { id: "inventory", label: "stock counts drift from reality between physical audits", weight: 3 },
  { id: "reporting", label: "the weekly report is assembled by hand from four tools", weight: 2 },
  { id: "support", label: "the same twenty support questions are answered every week", weight: 2 },
  { id: "pricing", label: "nobody can tell which customers are actually profitable", weight: 3 },
  { id: "quality", label: "defects are caught by the customer rather than by the process", weight: 4 },
  { id: "hiring", label: "screening applicants eats a full day of every week", weight: 2 },
];

/** How it reaches the user. `weight` = engineering effort of the shell itself. */
export const MODELS = [
  { id: "webapp", label: "a focused web app", weight: 2 },
  { id: "mobile", label: "a mobile-first app", weight: 3 },
  { id: "whatsapp", label: "a WhatsApp-first workflow", weight: 2 },
  { id: "browser-ext", label: "a browser extension", weight: 2 },
  { id: "api", label: "a developer API with a thin dashboard", weight: 3 },
  { id: "marketplace", label: "a two-sided marketplace", weight: 5 },
  { id: "sheets", label: "a spreadsheet add-on", weight: 1 },
  { id: "slack", label: "a Slack and Teams bot", weight: 2 },
  { id: "kiosk", label: "an in-store tablet kiosk", weight: 4 },
  { id: "service", label: "a productised done-for-you service", weight: 1 },
];

/** The differentiator. `weight` = technical risk it adds. */
export const TWISTS = [
  { id: "ai-draft", label: "an AI that drafts the first version and a human approves it", weight: 3 },
  { id: "ocr", label: "photo capture with OCR so nothing is typed twice", weight: 3 },
  { id: "offline", label: "full offline support that syncs when the signal returns", weight: 4 },
  { id: "templates", label: "a shared template library the community contributes to", weight: 2 },
  { id: "benchmarks", label: "anonymised benchmarks against similar businesses", weight: 3 },
  { id: "automation", label: "no-code automations triggered by everyday events", weight: 3 },
  { id: "voice", label: "voice notes in the local language converted into structured records", weight: 4 },
  { id: "escrow", label: "built-in escrow so money moves only on delivery", weight: 5 },
  { id: "audit", label: "a tamper-evident audit trail for every change", weight: 3 },
  { id: "embedded", label: "an embeddable widget partners drop into their own product", weight: 2 },
];

/** How it makes money. `weight` = billing and collections complexity. */
export const PRICING = [
  { id: "flat", label: "a flat monthly subscription per business", weight: 1 },
  { id: "seat", label: "per-seat pricing with a free single-user tier", weight: 2 },
  { id: "usage", label: "usage-based pricing metered per document or job", weight: 3 },
  { id: "takerate", label: "a percentage take rate on transactions", weight: 4 },
  { id: "freemium", label: "freemium with paid exports and integrations", weight: 2 },
  { id: "annual", label: "annual licences sold through partner resellers", weight: 4 },
];

/** Total distinct ideas the lists can produce. */
export const TOTAL_COMBINATIONS =
  AUDIENCES.length * PROBLEMS.length * MODELS.length * TWISTS.length * PRICING.length;

/** Effort weights: audience 1-5, problem 1-4, model 1-5, twist 2-5, pricing 1-4,
 *  so the achievable raw total runs 6..23. */
export const MIN_RAW_EFFORT = 6;
export const MAX_RAW_EFFORT = 23;

/** Labels for the 1-10 effort score. Thresholds are inclusive upper bounds. */
export const EFFORT_BANDS = [
  { max: 3, label: "Weekend build", detail: "One person could ship a usable v1 in a few days." },
  { max: 6, label: "Small team, one quarter", detail: "Realistic for two or three people over about 12 weeks." },
  { max: 8, label: "Funded build", detail: "Needs a real team, integrations and a support function." },
  { max: 10, label: "Hard mode", detail: "Regulated, hardware-bound or marketplace liquidity risk." },
];

/** Largest accepted seed (2^31 - 1). */
export const MAX_SEED = 2147483647;

/**
 * mulberry32 mixing step — spreads any finite number over the 32-bit range.
 * @param {number} seed
 * @returns {number} unsigned 32-bit integer
 */
export function hashSeed(seed) {
  let x = Math.floor(Math.abs(Number(seed) || 0)) % 4294967296;
  x = (x + 0x6d2b79f5) >>> 0;
  x = Math.imul(x ^ (x >>> 15), x | 1) >>> 0;
  x ^= (x + Math.imul(x ^ (x >>> 7), x | 61)) >>> 0;
  return (x ^ (x >>> 14)) >>> 0;
}

/**
 * Map a raw effort total (5..25) onto a 1-10 score.
 * Linear: score = 1 + 9 * (raw - 5) / 20, rounded to the nearest integer.
 * @param {number} raw
 * @returns {number} integer 1..10
 */
export function effortScore(raw) {
  if (!Number.isFinite(raw)) return 1;
  const clamped = Math.min(Math.max(raw, MIN_RAW_EFFORT), MAX_RAW_EFFORT);
  const spread = MAX_RAW_EFFORT - MIN_RAW_EFFORT;
  return Math.round(1 + (9 * (clamped - MIN_RAW_EFFORT)) / spread);
}

/**
 * Band an effort score falls into.
 * @param {number} score - 1..10
 * @returns {{label: string, detail: string}}
 */
export function effortBand(score) {
  const found = EFFORT_BANDS.find((band) => score <= band.max);
  return found ?? EFFORT_BANDS[EFFORT_BANDS.length - 1];
}

/**
 * Build one startup idea from a seed.
 *
 * @param {object} input
 * @param {number} input.seed - any finite number
 * @param {string} [input.lockAudience] - AUDIENCES id to force (optional)
 * @param {string} [input.lockModel] - MODELS id to force (optional)
 * @returns {{
 *   headline: string, pitch: string, audience: object, problem: object,
 *   model: object, twist: object, pricing: object,
 *   rawEffort: number, score: number, band: {label: string, detail: string},
 *   combinationIndex: number, totalCombinations: number
 * } | {error: string}}
 */
export function generateIdea({ seed, lockAudience = "", lockModel = "" } = {}) {
  if (typeof seed !== "number" || !Number.isFinite(seed)) {
    return { error: "Pass a finite number as the seed." };
  }
  if (lockAudience && !AUDIENCES.some((a) => a.id === lockAudience)) {
    return { error: "That audience does not exist." };
  }
  if (lockModel && !MODELS.some((m) => m.id === lockModel)) {
    return { error: "That delivery model does not exist." };
  }

  let n = hashSeed(seed);
  const take = (list) => {
    const item = list[n % list.length];
    n = Math.floor(n / list.length);
    return item;
  };

  const pickedAudience = take(AUDIENCES);
  const problem = take(PROBLEMS);
  const pickedModel = take(MODELS);
  const twist = take(TWISTS);
  const pricing = take(PRICING);

  const audience = lockAudience
    ? AUDIENCES.find((a) => a.id === lockAudience)
    : pickedAudience;
  const model = lockModel ? MODELS.find((m) => m.id === lockModel) : pickedModel;

  const rawEffort =
    audience.weight + problem.weight + model.weight + twist.weight + pricing.weight;
  const score = effortScore(rawEffort);

  const headline = `${capitalise(model.label)} for ${audience.label}`;
  const pitch = `${capitalise(model.label)} for ${audience.label}, for whom ${problem.label}. It differentiates with ${twist.label}, and charges through ${pricing.label}.`;

  const combinationIndex =
    (((AUDIENCES.indexOf(audience) * PROBLEMS.length + PROBLEMS.indexOf(problem)) *
      MODELS.length +
      MODELS.indexOf(model)) *
      TWISTS.length +
      TWISTS.indexOf(twist)) *
      PRICING.length +
    PRICING.indexOf(pricing);

  return {
    headline,
    pitch,
    audience,
    problem,
    model,
    twist,
    pricing,
    rawEffort,
    score,
    band: effortBand(score),
    combinationIndex,
    totalCombinations: TOTAL_COMBINATIONS,
  };
}

/**
 * Plain-text version of an idea, for copying into a notes app.
 * @param {object} idea - the object returned by generateIdea
 * @returns {string}
 */
export function formatIdea(idea) {
  if (!idea || idea.error || !idea.headline) return "";
  return [
    idea.headline,
    "",
    idea.pitch,
    "",
    `Audience: ${idea.audience.label}`,
    `Problem: ${idea.problem.label}`,
    `Delivery: ${idea.model.label}`,
    `Twist: ${idea.twist.label}`,
    `Pricing: ${idea.pricing.label}`,
    `Build effort: ${idea.score}/10 — ${idea.band.label}`,
  ].join("\n");
}

/** Uppercase the first letter only; the rest of the phrase is left alone. */
function capitalise(text) {
  if (typeof text !== "string" || text.length === 0) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
