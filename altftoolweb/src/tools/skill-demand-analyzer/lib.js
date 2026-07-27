/**
 * Skill Demand Analyzer — scoring engine.
 *
 * The tool turns five labour-market readings that anyone can pull from a job
 * board (live openings, openings in the same window a year ago, applicants per
 * posting, median advertised salary for the skill, median salary for the role
 * family, and the share of postings that are remote) into a single 0-100
 * Skill Demand Score.
 *
 * Nothing here is scraped or guessed: every number comes from the user. The
 * constants below are the published rubric of this tool, stated so the score is
 * reproducible and auditable.
 */

/**
 * Weights of the five sub-scores. They sum to 100.
 * Volume and growth carry the most weight because a skill with few postings and
 * no growth is not in demand however well it pays.
 */
export const DEMAND_WEIGHTS = Object.freeze({
  volume: 30,
  growth: 30,
  competition: 20,
  pay: 15,
  remote: 5,
});

/**
 * Openings count at which the volume sub-score saturates at 100.
 * 10,000 concurrent live postings for one named skill in one market is the
 * level at which extra postings stop telling you anything new, so the volume
 * curve is log10 based and capped there.
 */
export const VOLUME_SATURATION_OPENINGS = 10000;

/** Year-on-year change (%) mapped to a growth sub-score of 0 and of 100. */
export const GROWTH_FLOOR_PCT = -50;
export const GROWTH_CEILING_PCT = 50;

/**
 * Applicants per posting. Below the floor the market is candidate-short
 * (score 100); above the ceiling every opening is heavily contested (score 0).
 * The 5 and 100 bounds bracket the range job boards typically report.
 */
export const COMPETITION_FLOOR_APPLICANTS = 5;
export const COMPETITION_CEILING_APPLICANTS = 100;

/** Salary premium over the role-family median (%) mapped to pay scores 0 / 100. */
export const PAY_FLOOR_PREMIUM_PCT = -20;
export const PAY_CEILING_PREMIUM_PCT = 60;

/**
 * Score bands used to label the composite result.
 * Each band is [inclusive minimum score, label, plain-language meaning].
 */
export const DEMAND_BANDS = Object.freeze([
  [80, "Critical demand", "Employers are short of this skill — expect fast processes and pay premiums."],
  [60, "Strong demand", "A healthy, competitive market. Worth investing a full learning cycle in."],
  [40, "Emerging demand", "Real but thin. Pair it with a second skill rather than betting a career on it."],
  [20, "Soft demand", "More candidates than openings. Only worth it if it supports work you already do."],
  [0, "Oversupplied", "Openings are scarce or contested. Treat this as a maintenance skill, not a growth bet."],
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/** Linear interpolation of `value` between `low` (=0) and `high` (=100), clamped. */
export function linearScore(value, low, high) {
  if (high === low) return 0;
  return clamp(((value - low) / (high - low)) * 100, 0, 100);
}

/** Log-scaled volume sub-score: 0 openings scores 0, VOLUME_SATURATION scores 100. */
export function volumeScore(openings) {
  const safe = Math.max(0, openings);
  const ratio = Math.log10(safe + 1) / Math.log10(VOLUME_SATURATION_OPENINGS + 1);
  return clamp(ratio * 100, 0, 100);
}

/** Look up the band for a composite score. */
export function demandBand(score) {
  const found = DEMAND_BANDS.find(([min]) => score >= min);
  return found ? { label: found[1], advice: found[2] } : { label: "Oversupplied", advice: DEMAND_BANDS[4][2] };
}

/**
 * Analyse one skill.
 *
 * @param {object} input
 * @param {string} input.skill              Skill name (label only, not scored).
 * @param {number} input.openings           Live postings naming the skill today.
 * @param {number} input.openingsLastYear   Postings in the same window 12 months ago.
 * @param {number} input.applicantsPerPosting Average applicants per posting.
 * @param {number} input.skillMedianSalary  Median advertised salary for postings naming the skill.
 * @param {number} input.marketMedianSalary Median advertised salary for the whole role family.
 * @param {number} input.remoteSharePct     Share of the skill's postings that are remote (0-100).
 * @returns {object} score breakdown, or { error }
 */
export function analyzeSkillDemand(input = {}) {
  const skill = String(input.skill == null ? "" : input.skill).trim();
  const openings = toFiniteNumber(input.openings);
  const openingsLastYear = toFiniteNumber(input.openingsLastYear);
  const applicants = toFiniteNumber(input.applicantsPerPosting);
  const skillPay = toFiniteNumber(input.skillMedianSalary);
  const marketPay = toFiniteNumber(input.marketMedianSalary);
  const remoteShare = toFiniteNumber(input.remoteSharePct);

  if (skill === "") return { error: "Name the skill you are analysing." };
  if (!Number.isFinite(openings) || openings < 0) {
    return { error: "Live openings must be a number of 0 or more." };
  }
  if (!Number.isFinite(openingsLastYear) || openingsLastYear <= 0) {
    return { error: "Openings 12 months ago must be greater than 0 — growth cannot be measured from a zero baseline." };
  }
  if (!Number.isFinite(applicants) || applicants <= 0) {
    return { error: "Applicants per posting must be greater than 0." };
  }
  if (!Number.isFinite(marketPay) || marketPay <= 0) {
    return { error: "Role-family median salary must be greater than 0." };
  }
  if (!Number.isFinite(skillPay) || skillPay < 0) {
    return { error: "Skill median salary must be a number of 0 or more." };
  }
  if (!Number.isFinite(remoteShare) || remoteShare < 0 || remoteShare > 100) {
    return { error: "Remote share must be between 0 and 100 percent." };
  }

  const growthPct = ((openings - openingsLastYear) / openingsLastYear) * 100;
  const payPremiumPct = ((skillPay - marketPay) / marketPay) * 100;

  const subScores = {
    volume: volumeScore(openings),
    growth: linearScore(growthPct, GROWTH_FLOOR_PCT, GROWTH_CEILING_PCT),
    competition: linearScore(
      applicants,
      COMPETITION_CEILING_APPLICANTS,
      COMPETITION_FLOOR_APPLICANTS,
    ),
    pay: linearScore(payPremiumPct, PAY_FLOOR_PREMIUM_PCT, PAY_CEILING_PREMIUM_PCT),
    remote: clamp(remoteShare, 0, 100),
  };

  const weightedTotal =
    subScores.volume * DEMAND_WEIGHTS.volume +
    subScores.growth * DEMAND_WEIGHTS.growth +
    subScores.competition * DEMAND_WEIGHTS.competition +
    subScores.pay * DEMAND_WEIGHTS.pay +
    subScores.remote * DEMAND_WEIGHTS.remote;

  const totalWeight =
    DEMAND_WEIGHTS.volume +
    DEMAND_WEIGHTS.growth +
    DEMAND_WEIGHTS.competition +
    DEMAND_WEIGHTS.pay +
    DEMAND_WEIGHTS.remote;

  const score = Math.round((weightedTotal / totalWeight) * 10) / 10;
  const band = demandBand(score);

  /**
   * Openings available per competing applicant. One posting attracts
   * `applicants` people, so the whole market holds openings * applicants
   * candidates chasing `openings` roles — i.e. 1/applicants openings each.
   */
  const openingsPerApplicant = 1 / applicants;
  /** Total live openings divided by applicants per posting — a raw scarcity read. */
  const opportunityIndex = openings / applicants;

  /** Straight-line projection of next year's openings at the observed rate. */
  const projectedOpenings = Math.max(0, Math.round(openings * (1 + growthPct / 100)));

  const weakest = Object.entries(subScores).sort((a, b) => a[1] - b[1])[0];

  return {
    skill,
    score,
    band: band.label,
    advice: band.advice,
    growthPct: Math.round(growthPct * 10) / 10,
    payPremiumPct: Math.round(payPremiumPct * 10) / 10,
    applicantsPerPosting: applicants,
    skillMedianSalary: skillPay,
    marketMedianSalary: marketPay,
    openings,
    openingsPerApplicant: Math.round(openingsPerApplicant * 1000) / 1000,
    opportunityIndex: Math.round(opportunityIndex * 100) / 100,
    projectedOpenings,
    weakestFactor: weakest[0],
    subScores: {
      volume: Math.round(subScores.volume * 10) / 10,
      growth: Math.round(subScores.growth * 10) / 10,
      competition: Math.round(subScores.competition * 10) / 10,
      pay: Math.round(subScores.pay * 10) / 10,
      remote: Math.round(subScores.remote * 10) / 10,
    },
    weights: { ...DEMAND_WEIGHTS },
  };
}

/** Rank several analysed skills, strongest first. Rows with errors are dropped. */
export function rankSkills(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => analyzeSkillDemand(row))
    .filter((row) => !row.error)
    .sort((a, b) => b.score - a.score);
}
