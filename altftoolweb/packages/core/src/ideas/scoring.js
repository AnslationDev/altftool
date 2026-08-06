/*
 * AltF Ideas scoring
 *
 * Single source of truth for the six-signal opportunity score. Every surface
 * — cards, rings, filter rail, compare table, quadrant map — reads signal
 * order and colour from here, so the palette can never drift between views.
 *
 * The score is deliberately transparent: AOS is always the plain weighted mean
 * of the six displayed signals. If a user adds up the parts they must get the
 * whole, otherwise the product's central claim is a lie.
 */

import { TIERS } from "./taxonomy.js";

export const SIGNALS = Object.freeze([
  {
    key: "demand",
    label: "Demand",
    short: "DEM",
    weight: 22,
    cssVar: "--afi-demand",
    blurb: "Search trend, community pain frequency, and money already being spent on the problem.",
  },
  {
    key: "moat",
    label: "Moat",
    short: "MOA",
    weight: 20,
    cssVar: "--afi-moat",
    blurb: "Defensibility from a data loop, workflow lock-in, regulation, or distribution.",
  },
  {
    key: "money",
    label: "Monetisation",
    short: "MON",
    weight: 18,
    cssVar: "--afi-money",
    blurb: "Contract value against willingness to pay and the shape of retention.",
  },
  {
    key: "feasibility",
    label: "Feasibility",
    short: "FEA",
    weight: 16,
    cssVar: "--afi-feasibility",
    blurb: "How small the first shippable version can be, and how much technical risk it carries.",
  },
  {
    key: "timing",
    label: "Timing",
    short: "TIM",
    weight: 14,
    cssVar: "--afi-timing",
    blurb: "Whether something changed recently that makes this possible or urgent now.",
  },
  {
    key: "competition",
    label: "Open field",
    short: "OPN",
    weight: 10,
    cssVar: "--afi-competition",
    blurb: "How much room is left — high means incumbents have not covered this properly.",
  },
]);

export const SIGNAL_KEYS = Object.freeze(SIGNALS.map((s) => s.key));

export const DEFAULT_WEIGHTS = Object.freeze(
  Object.fromEntries(SIGNALS.map((s) => [s.key, s.weight])),
);

/**
 * Weighted mean of the six signals. Weights need not sum to 100 — they are
 * normalised — so the tuner can let a user drag every slider to the top
 * without silently rescaling their intent.
 */
export function computeAos(scores, weights = DEFAULT_WEIGHTS) {
  let weighted = 0;
  let total = 0;
  for (const key of SIGNAL_KEYS) {
    const w = weights[key] ?? 0;
    weighted += (scores?.[key] ?? 0) * w;
    total += w;
  }
  return total === 0 ? 0 : Math.round(weighted / total);
}

export { TIERS };

export function tierOf(aos) {
  if (aos >= TIERS.s) return { name: "S", key: "s", cssVar: "--afi-tier-s" };
  if (aos >= TIERS.a) return { name: "A", key: "a", cssVar: "--afi-tier-a" };
  if (aos >= TIERS.b) return { name: "B", key: "b", cssVar: "--afi-tier-b" };
  return { name: "C", key: "c", cssVar: "--afi-tier-c" };
}

/**
 * Badges are computed from the scores, never authored. That keeps them honest:
 * a badge cannot claim something the underlying numbers do not support.
 */
const BADGE_RULES = Object.freeze([
  { id: "underserved", label: "Underserved", test: (s) => s.demand >= 70 && s.competition >= 65 },
  { id: "weekend", label: "Weekend build", test: (s) => s.feasibility >= 85 },
  { id: "cash", label: "Cash machine", test: (s) => s.money >= 80 && s.demand >= 60 },
  { id: "moat", label: "Deep moat", test: (s) => s.moat >= 80 },
  { id: "timing", label: "Timing window", test: (s) => s.timing >= 85 },
  { id: "contrarian", label: "Contrarian", test: (s) => s.demand <= 45 && s.moat >= 75 },
]);

export function derivedBadges(scores, limit = Infinity) {
  if (!scores) return [];
  return BADGE_RULES.filter((rule) => rule.test(scores))
    .slice(0, limit)
    .map(({ id, label }) => ({ id, label }));
}

/** Presets for the weight tuner. A solo dev and a VC-track team should not
 *  be handed the same ranking. */
export const WEIGHT_PRESETS = Object.freeze({
  balanced: { label: "Balanced", weights: DEFAULT_WEIGHTS },
  solo: {
    label: "Solo dev",
    weights: { demand: 16, moat: 8, money: 18, feasibility: 34, timing: 14, competition: 10 },
  },
  bootstrapper: {
    label: "Bootstrapper",
    weights: { demand: 18, moat: 10, money: 34, feasibility: 22, timing: 8, competition: 8 },
  },
  vc: {
    label: "VC track",
    weights: { demand: 26, moat: 32, money: 18, feasibility: 4, timing: 16, competition: 4 },
  },
  agency: {
    label: "Agency",
    weights: { demand: 24, moat: 6, money: 26, feasibility: 24, timing: 10, competition: 10 },
  },
});

/** Serialise weights for the URL so a tuned ranking is shareable. */
export function encodeWeights(weights) {
  return SIGNAL_KEYS.map((k) => weights[k] ?? 0).join(",");
}

export function decodeWeights(value) {
  if (typeof value !== "string") return null;
  const parts = value.split(",").map((n) => Number.parseInt(n, 10));
  if (parts.length !== SIGNAL_KEYS.length || parts.some((n) => !Number.isFinite(n) || n < 0)) {
    return null;
  }
  if (parts.every((n) => n === 0)) return null;
  return Object.fromEntries(SIGNAL_KEYS.map((k, i) => [k, parts[i]]));
}

export const EFFORT_LABELS = Object.freeze({
  weekend: "Weekend",
  month: "~1 month",
  quarter: "~1 quarter",
  year: "6-12 months",
});

/** Prose form of the effort band, for sentences rather than chips.
 *  "reachable in a weekend" reads; "reachable in weekend" does not. */
export const EFFORT_PHRASES = Object.freeze({
  weekend: "a weekend",
  month: "about a month",
  quarter: "about a quarter",
  year: "six to twelve months",
});

/**
 * Correct indefinite article for a phrase. The mechanism names include
 * "anomaly detection", "autonomous agent" and "optimisation engine", so a
 * hardcoded "a" mis-renders on tens of thousands of pages.
 * Sound-based, not letter-based: "an hour", but "a university".
 */
export function indefiniteArticle(phrase = "") {
  const word = String(phrase).trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (!word) return "a";
  if (/^(hour|honest|honou?r|heir)/.test(word)) return "an";
  if (/^(uni|use|user|usu|eu|one|once)/.test(word)) return "a";
  return /^[aeiou]/.test(word) ? "an" : "a";
}

/** `withArticle("anomaly detection")` -> "an anomaly detection" */
export function withArticle(phrase) {
  return `${indefiniteArticle(phrase)} ${phrase}`;
}

export function formatUsd(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k`;
  return `$${n}`;
}
