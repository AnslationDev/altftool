/**
 * AI Dependency Self Check
 *
 * A reflective worksheet, not a clinical or psychometric instrument. The
 * scoring scheme is defined here in full so every figure can be reproduced
 * by hand:
 *
 *   For each skill domain you give three numbers:
 *     delegation      0-4  how often the task goes to AI first
 *     confidenceNow   0-10 how confident you feel doing it unaided today
 *     confidenceBefore 0-10 how confident you felt before you used AI for it
 *
 *   reliance%      = delegation / 4 x 100
 *   confidenceDrop = confidenceBefore - confidenceNow (points, negative means
 *                    you improved)
 *   relativeDrop%  = confidenceDrop / confidenceBefore x 100, floored at 0 and
 *                    defined as 0 when confidenceBefore is 0
 *   atrophyRisk%   = reliance% x relativeDrop% / 100
 *
 * The product form is deliberate: heavy delegation with no confidence loss
 * scores low, and a confidence loss in something you rarely delegate scores
 * low too. Only the overlap of both scores high.
 *
 * Overall figures are unweighted means across the domains you filled in, so no
 * single domain is treated as more important than another.
 */

/** Top of the delegation frequency scale; the bottom is 0. */
export const MAX_DELEGATION = 4;

/** Top of the unaided confidence scale; the bottom is 0. */
export const MAX_CONFIDENCE = 10;

export const DELEGATION_SCALE = [
  { value: 0, label: "0 - I always do it myself" },
  { value: 1, label: "1 - Rarely, for hard cases only" },
  { value: 2, label: "2 - About half the time" },
  { value: 3, label: "3 - Usually AI first, I edit after" },
  { value: 4, label: "4 - Almost always AI, start to finish" },
];

export const SKILL_DOMAINS = [
  {
    id: "writing",
    label: "Writing and editing",
    prompt: "Drafting emails, documents, posts and rewrites.",
  },
  {
    id: "coding",
    label: "Coding and debugging",
    prompt: "Writing functions, reading errors and fixing bugs.",
  },
  {
    id: "research",
    label: "Research and fact-finding",
    prompt: "Finding sources, checking claims and summarising them.",
  },
  {
    id: "analysis",
    label: "Arithmetic and data analysis",
    prompt: "Working through numbers, formulas and spreadsheets.",
  },
  {
    id: "planning",
    label: "Planning and decisions",
    prompt: "Weighing options, sequencing work and choosing an approach.",
  },
  {
    id: "recall",
    label: "Memory and recall",
    prompt: "Holding facts, names, syntax and procedures in your head.",
  },
];

/** Domains at or above this risk are worth deliberate unaided practice. */
export const FLAG_THRESHOLD = 25;

/** Descriptive bands for the overall risk figure. Cut points are quartile-based. */
export const BANDS = [
  {
    min: 0,
    max: 9,
    label: "Tool-shaped use",
    guidance:
      "You delegate without losing the underlying skill. Nothing here suggests a change is needed.",
  },
  {
    min: 10,
    max: 24,
    label: "Watch one or two areas",
    guidance:
      "One domain is drifting. Doing that task unaided once in a while is usually enough to hold the line.",
  },
  {
    min: 25,
    max: 49,
    label: "Deliberate practice worth scheduling",
    guidance:
      "Reliance and confidence loss overlap in several domains. Pick the top one and do a real task in it without help.",
  },
  {
    min: 50,
    max: 100,
    label: "Reliance is broad",
    guidance:
      "Most domains show both heavy delegation and lost confidence. Rebuild one skill at a time rather than trying to stop using AI altogether.",
  },
];

function bandFor(percent) {
  return BANDS.find((band) => percent >= band.min && percent <= band.max) || BANDS[BANDS.length - 1];
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Score the self-check.
 *
 * @param {object} input
 * @param {Record<string, {delegation:number, confidenceNow:number, confidenceBefore:number}>} input.domains
 * @returns {{overallRisk:number,overallReliance:number,averageDrop:number,band:object,
 *   rows:Array,flagged:Array,improved:Array,answered:number,totalDomains:number}|{error:string}}
 */
export function scoreDependencyCheck({ domains = {} } = {}) {
  if (!domains || typeof domains !== "object") {
    return { error: "Fill in at least one skill domain." };
  }

  const rows = [];

  for (const domain of SKILL_DOMAINS) {
    const entry = domains[domain.id];
    if (!entry) continue;

    const delegation = Number(entry.delegation);
    const confidenceNow = Number(entry.confidenceNow);
    const confidenceBefore = Number(entry.confidenceBefore);

    if (![delegation, confidenceNow, confidenceBefore].every(Number.isFinite)) {
      return { error: `${domain.label}: every field needs a number.` };
    }
    if (delegation < 0 || delegation > MAX_DELEGATION) {
      return {
        error: `${domain.label}: delegation must be between 0 and ${MAX_DELEGATION}.`,
      };
    }
    if (
      confidenceNow < 0 ||
      confidenceNow > MAX_CONFIDENCE ||
      confidenceBefore < 0 ||
      confidenceBefore > MAX_CONFIDENCE
    ) {
      return {
        error: `${domain.label}: confidence must be between 0 and ${MAX_CONFIDENCE}.`,
      };
    }

    const reliance = (delegation / MAX_DELEGATION) * 100;
    const confidenceDrop = confidenceBefore - confidenceNow;
    const relativeDrop =
      confidenceBefore > 0 ? Math.max(0, (confidenceDrop / confidenceBefore) * 100) : 0;
    const atrophyRisk = (reliance * relativeDrop) / 100;

    rows.push({
      id: domain.id,
      label: domain.label,
      prompt: domain.prompt,
      delegation,
      confidenceNow,
      confidenceBefore,
      reliance: Math.round(reliance),
      confidenceDrop: round1(confidenceDrop),
      relativeDrop: Math.round(relativeDrop),
      atrophyRisk: Math.round(atrophyRisk),
    });
  }

  if (rows.length === 0) {
    return { error: "Fill in at least one skill domain to see a result." };
  }

  const overallRisk = Math.round(
    rows.reduce((total, row) => total + row.atrophyRisk, 0) / rows.length,
  );
  const overallReliance = Math.round(
    rows.reduce((total, row) => total + row.reliance, 0) / rows.length,
  );
  const averageDrop = round1(
    rows.reduce((total, row) => total + row.confidenceDrop, 0) / rows.length,
  );

  const ranked = [...rows].sort((a, b) => b.atrophyRisk - a.atrophyRisk);

  return {
    overallRisk,
    overallReliance,
    averageDrop,
    band: bandFor(overallRisk),
    rows,
    ranked,
    flagged: ranked.filter((row) => row.atrophyRisk >= FLAG_THRESHOLD),
    improved: rows.filter((row) => row.confidenceDrop < 0),
    answered: rows.length,
    totalDomains: SKILL_DOMAINS.length,
  };
}
