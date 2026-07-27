/**
 * MSME (Udyam) classification under the Micro, Small and Medium Enterprises
 * Development Act, 2006.
 *
 * Since 1 July 2020 classification is a COMPOSITE test: an enterprise must be
 * within BOTH the investment-in-plant-and-machinery/equipment limit AND the
 * turnover limit of a category. Breaching either limit pushes the enterprise
 * into the next higher category. The manufacturing/service distinction was
 * removed at the same time, so one table covers both.
 *
 * Two limit sets are supported:
 *  - "2020": the limits that applied from 1 July 2020.
 *  - "2025": the enhanced limits announced in the Union Budget 2025-26 and
 *    applicable from 1 April 2025 (investment limits 2.5x and turnover limits
 *    2x the 2020 figures).
 *
 * Two further rules from the classification notification are applied:
 *  - Export turnover (goods and services) is EXCLUDED from turnover when
 *    classifying an enterprise.
 *  - Investment means plant and machinery or equipment as per the income-tax
 *    return; land, building, furniture and fittings are excluded.
 */

/** One crore rupees. */
export const CRORE = 10000000;

/** Composite limits, in rupees. Order matters: smallest category first. */
export const CRITERIA_SETS = {
  2025: {
    label: "Current limits (from 1 April 2025)",
    tiers: [
      { category: "Micro", investmentLimit: 2.5 * CRORE, turnoverLimit: 10 * CRORE },
      { category: "Small", investmentLimit: 25 * CRORE, turnoverLimit: 100 * CRORE },
      { category: "Medium", investmentLimit: 125 * CRORE, turnoverLimit: 500 * CRORE },
    ],
  },
  2020: {
    label: "Earlier limits (1 July 2020 to 31 March 2025)",
    tiers: [
      { category: "Micro", investmentLimit: 1 * CRORE, turnoverLimit: 5 * CRORE },
      { category: "Small", investmentLimit: 10 * CRORE, turnoverLimit: 50 * CRORE },
      { category: "Medium", investmentLimit: 50 * CRORE, turnoverLimit: 250 * CRORE },
    ],
  },
};

export const DEFAULT_CRITERIA_SET = "2025";

/** Beyond the Medium limits an enterprise is not an MSME and cannot hold Udyam registration. */
export const LARGE_CATEGORY = "Large";

/**
 * MSMED Act Section 7 / classification notification: an upward reclassification
 * takes effect from 1 April of the financial year following the year of change.
 */
export const UPWARD_CHANGE_EFFECTIVE_FROM = "1 April of the next financial year";

/**
 * A downward reclassification (falling below limits) takes effect only from
 * 1 April of the following year, so benefits continue for the rest of the year.
 */
export const DOWNWARD_CHANGE_EFFECTIVE_FROM = "1 April of the next financial year";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Classify an enterprise from its investment and turnover.
 *
 * @param {object} input
 * @param {number} input.investment plant, machinery and equipment value in rupees
 * @param {number} input.totalTurnover turnover for the year in rupees
 * @param {number} [input.exportTurnover] export turnover in rupees, excluded from the test
 * @param {"2020"|"2025"} [input.criteriaSet]
 * @returns {{error:string}|object}
 */
export function classifyUdyam({
  investment = 0,
  totalTurnover = 0,
  exportTurnover = 0,
  criteriaSet = DEFAULT_CRITERIA_SET,
} = {}) {
  if (!isNum(investment) || !isNum(totalTurnover) || !isNum(exportTurnover)) {
    return { error: "Enter investment, turnover and export turnover as numbers." };
  }
  if (investment < 0 || totalTurnover < 0 || exportTurnover < 0) {
    return { error: "Investment and turnover cannot be negative." };
  }
  if (exportTurnover > totalTurnover) {
    return { error: "Export turnover cannot be more than total turnover." };
  }

  const set = CRITERIA_SETS[String(criteriaSet)];
  if (!set) return { error: "Choose one of the notified limit sets." };

  const classificationTurnover = totalTurnover - exportTurnover;

  let matched = null;
  for (const tier of set.tiers) {
    if (investment <= tier.investmentLimit && classificationTurnover <= tier.turnoverLimit) {
      matched = tier;
      break;
    }
  }

  const isMsme = matched !== null;
  const category = isMsme ? matched.category : LARGE_CATEGORY;

  // Which of the two tests forced the enterprise out of the category below it.
  const tierIndex = isMsme ? set.tiers.indexOf(matched) : set.tiers.length;
  const lowerTier = tierIndex > 0 ? set.tiers[tierIndex - 1] : null;
  let bindingCriterion = "Both tests are comfortably met";
  if (lowerTier) {
    const overInvestment = investment > lowerTier.investmentLimit;
    const overTurnover = classificationTurnover > lowerTier.turnoverLimit;
    if (overInvestment && overTurnover) bindingCriterion = "Both investment and turnover";
    else if (overInvestment) bindingCriterion = "Investment in plant and machinery";
    else if (overTurnover) bindingCriterion = "Turnover";
  }

  const nextTier = isMsme ? set.tiers[tierIndex + 1] || null : null;

  const headroomInvestment = isMsme ? matched.investmentLimit - investment : 0;
  const headroomTurnover = isMsme ? matched.turnoverLimit - classificationTurnover : 0;

  const investmentUtilisationPct = isMsme
    ? (investment / matched.investmentLimit) * 100
    : 100;
  const turnoverUtilisationPct = isMsme
    ? (classificationTurnover / matched.turnoverLimit) * 100
    : 100;

  return {
    category,
    isMsme,
    criteriaSetKey: String(criteriaSet),
    criteriaSetLabel: set.label,
    tiers: set.tiers,
    classificationTurnover,
    exportTurnoverExcluded: exportTurnover,
    investment,
    investmentLimit: isMsme ? matched.investmentLimit : null,
    turnoverLimit: isMsme ? matched.turnoverLimit : null,
    headroomInvestment,
    headroomTurnover,
    investmentUtilisationPct,
    turnoverUtilisationPct,
    bindingCriterion,
    nextCategory: nextTier ? nextTier.category : isMsme ? LARGE_CATEGORY : null,
    nextInvestmentLimit: nextTier ? nextTier.investmentLimit : null,
    nextTurnoverLimit: nextTier ? nextTier.turnoverLimit : null,
    upwardChangeEffectiveFrom: UPWARD_CHANGE_EFFECTIVE_FROM,
  };
}

/** Format a rupee amount as a crore/lakh string for compact display. */
export function toCroreLakh(amount) {
  if (!isNum(amount)) return "—";
  const abs = Math.abs(amount);
  if (abs >= CRORE) return `${(amount / CRORE).toFixed(2)} crore`;
  if (abs >= 100000) return `${(amount / 100000).toFixed(2)} lakh`;
  return String(Math.round(amount));
}
