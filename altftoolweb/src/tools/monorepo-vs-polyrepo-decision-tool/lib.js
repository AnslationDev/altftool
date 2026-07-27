/**
 * Monorepo vs polyrepo decision scorer.
 *
 * Each factor is a question whose options award points to the monorepo side,
 * the polyrepo side, or both. The factors encode the widely documented
 * trade-offs of the two strategies (e.g. Google/Meta engineering write-ups on
 * monorepos, the Nx and Turborepo "why monorepo" docs, and Microsoft's
 * polyrepo guidance): monorepos shine with heavy code sharing, atomic
 * cross-project changes and a single dependency policy — provided you invest
 * in selective/affected CI tooling; polyrepos shine with independent teams,
 * strict access boundaries and fully independent release cadences.
 *
 * Scoring: monoScore = sum of chosen options' mono points; max is the sum of
 * each question's best mono option (and likewise for poly). Both are shown as
 * a percentage of their own maximum, so the two sides are comparable even
 * though questions are not perfectly symmetric.
 */

export const FACTORS = [
  {
    id: "sharing",
    question: "How much code do your projects share (UI kits, utils, API clients)?",
    options: [
      { label: "A large shared core used by most projects", mono: 4, poly: 0 },
      { label: "A few shared libraries", mono: 3, poly: 1 },
      { label: "Occasional copy-paste level reuse", mono: 1, poly: 3 },
      { label: "Practically nothing shared", mono: 0, poly: 4 },
    ],
  },
  {
    id: "crossChanges",
    question: "How often does one change need to touch multiple projects at once?",
    options: [
      { label: "Weekly — API and consumers move together", mono: 4, poly: 0 },
      { label: "A few times a month", mono: 3, poly: 1 },
      { label: "Rarely — projects evolve alone", mono: 1, poly: 3 },
      { label: "Never", mono: 0, poly: 4 },
    ],
  },
  {
    id: "tooling",
    question: "Can you invest in monorepo build tooling (Nx, Turborepo, Bazel, affected-only CI)?",
    options: [
      { label: "Yes — we have a platform team for it", mono: 4, poly: 0 },
      { label: "Some time, using off-the-shelf tools", mono: 3, poly: 1 },
      { label: "Very little — CI must stay simple", mono: 1, poly: 3 },
      { label: "None — zero appetite for build tooling", mono: 0, poly: 4 },
    ],
  },
  {
    id: "releases",
    question: "How coupled are your release cadences?",
    options: [
      { label: "Products ship together in lockstep", mono: 4, poly: 0 },
      { label: "Mostly together, some independent", mono: 3, poly: 1 },
      { label: "Each team releases on its own schedule", mono: 1, poly: 3 },
      { label: "Fully independent, including versioned public SDKs", mono: 0, poly: 4 },
    ],
  },
  {
    id: "access",
    question: "Do you need strict per-project access control (contractors, compliance, IP isolation)?",
    options: [
      { label: "No — everyone may see everything", mono: 4, poly: 0 },
      { label: "Mostly open, a couple of sensitive areas", mono: 2, poly: 2 },
      { label: "Yes — several audiences must be walled off", mono: 0, poly: 4 },
    ],
  },
  {
    id: "scale",
    question: "How big is the codebase likely to get in 2-3 years?",
    options: [
      { label: "Small–medium: a handful of apps and libs", mono: 3, poly: 1 },
      { label: "Large but one product family", mono: 4, poly: 1 },
      { label: "Huge and heterogeneous (many languages, many products)", mono: 2, poly: 3 },
    ],
  },
  {
    id: "dependencyPolicy",
    question: "How should third-party dependency versions be managed?",
    options: [
      { label: "One version policy for everyone", mono: 4, poly: 0 },
      { label: "Prefer alignment, allow exceptions", mono: 3, poly: 1 },
      { label: "Teams pin whatever they need", mono: 0, poly: 4 },
    ],
  },
  {
    id: "autonomy",
    question: "How much process autonomy do teams expect (review rules, branch policy, CI config)?",
    options: [
      { label: "Uniform standards are welcome", mono: 4, poly: 0 },
      { label: "Shared defaults with local overrides", mono: 2, poly: 2 },
      { label: "Full autonomy per team is non-negotiable", mono: 0, poly: 4 },
    ],
  },
];

/** Verdict threshold: a gap under 15 percentage points is a toss-up. */
export const DECISION_MARGIN_PCT = 15;

/**
 * Score the questionnaire.
 *
 * @param {object} answers  Map factor id -> chosen option index.
 * @returns {{
 *   monoPct:number, polyPct:number, monoPoints:number, polyPoints:number,
 *   monoMax:number, polyMax:number, verdict:"monorepo"|"polyrepo"|"borderline",
 *   lean:"monorepo"|"polyrepo"|null, headline:string,
 *   breakdown:Array<{id,question,choice,mono,poly}>
 * } | {error:string}}
 */
export function scoreDecision(answers) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer the questions to get a recommendation." };
  }

  let monoPoints = 0;
  let polyPoints = 0;
  let monoMax = 0;
  let polyMax = 0;
  const breakdown = [];

  for (const factor of FACTORS) {
    const idx = Number(answers[factor.id]);
    if (!Number.isInteger(idx) || idx < 0 || idx >= factor.options.length) {
      return { error: `Answer the question: "${factor.question}"` };
    }
    const option = factor.options[idx];
    monoPoints += option.mono;
    polyPoints += option.poly;
    monoMax += Math.max(...factor.options.map((o) => o.mono));
    polyMax += Math.max(...factor.options.map((o) => o.poly));
    breakdown.push({
      id: factor.id,
      question: factor.question,
      choice: option.label,
      mono: option.mono,
      poly: option.poly,
    });
  }

  // monoMax/polyMax are sums of positive maxima, never zero for FACTORS above.
  const monoPct = Math.round((monoPoints / monoMax) * 1000) / 10;
  const polyPct = Math.round((polyPoints / polyMax) * 1000) / 10;
  const gap = monoPct - polyPct;

  let verdict;
  let lean = null;
  let headline;
  if (gap >= DECISION_MARGIN_PCT) {
    verdict = "monorepo";
    headline = "Monorepo — your answers favour shared code, atomic changes and unified tooling.";
  } else if (gap <= -DECISION_MARGIN_PCT) {
    verdict = "polyrepo";
    headline = "Polyrepo — your answers favour team autonomy, isolation and independent releases.";
  } else {
    verdict = "borderline";
    lean = gap >= 0 ? "monorepo" : "polyrepo";
    headline = `Borderline — either can work. The scores lean ${lean}; let team structure and existing tooling break the tie.`;
  }

  return {
    monoPct,
    polyPct,
    monoPoints,
    polyPoints,
    monoMax,
    polyMax,
    verdict,
    lean,
    headline,
    breakdown,
  };
}
