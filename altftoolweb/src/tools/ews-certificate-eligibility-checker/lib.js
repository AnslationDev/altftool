/**
 * Economically Weaker Section (EWS) certificate criteria.
 *
 * Rule source: Office Memorandum No. 36039/1/2019-Estt (Res) issued by the Department of
 * Personnel and Training on 31 January 2019, which gives effect to the 10% reservation for
 * economically weaker sections introduced by the Constitution (One Hundred and Third
 * Amendment) Act, 2019.
 *
 * The OM has two independent tests. First, the person must not be covered by the existing
 * reservation for Scheduled Castes, Scheduled Tribes or Other Backward Classes, and family
 * gross annual income must be BELOW ₹8 lakh. Second, the family must not own or possess any
 * of four listed assets — those disqualify irrespective of income.
 */

/** Family gross annual income must be below this figure. The limit is exclusive. */
export const EWS_INCOME_LIMIT = 800000;

/** Exclusion at 5 acres of agricultural land "and above". */
export const EWS_AGRI_LAND_LIMIT_ACRES = 5;

/** Exclusion at a residential flat of 1,000 sq ft "and above". */
export const EWS_FLAT_LIMIT_SQFT = 1000;

/** Exclusion at a residential plot of 100 sq yards "and above" in notified municipalities. */
export const EWS_PLOT_LIMIT_NOTIFIED_SQYD = 100;

/** Exclusion at a residential plot of 200 sq yards "and above" outside notified municipalities. */
export const EWS_PLOT_LIMIT_OTHER_SQYD = 200;

/**
 * Who counts as "family" for both tests, per the OM: the applicant, their parents, their
 * siblings below 18, their spouse, and their children below 18.
 */
export const EWS_FAMILY_DEFINITION = [
  "The person seeking the benefit",
  "Their parents",
  "Their siblings below the age of 18",
  "Their spouse",
  "Their children below the age of 18",
];

/** Income heads the OM asks to be counted — income from all sources. */
export const EWS_INCOME_HEADS = [
  { id: "salary", label: "Salary and pension" },
  { id: "agriculture", label: "Agriculture" },
  { id: "business", label: "Business" },
  { id: "profession", label: "Profession" },
  { id: "other", label: "Other sources (rent, interest, dividends)" },
];

/** Exact area conversions, used so a user can enter land in whichever unit their papers use. */
export const SQFT_PER_SQYD = 9;
export const SQM_PER_SQFT = 0.09290304;
export const SQM_PER_SQYD = 0.83612736;
export const SQM_PER_ACRE = 4046.8564224;
export const SQM_PER_HECTARE = 10000;

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a land area to acres from acre, hectare or square metre. */
export function toAcres(value, unit = "acre") {
  if (!isNum(value) || value < 0) return { error: "Land area cannot be negative." };
  if (unit === "acre") return { acres: value };
  if (unit === "hectare") return { acres: (value * SQM_PER_HECTARE) / SQM_PER_ACRE };
  if (unit === "sqm") return { acres: value / SQM_PER_ACRE };
  return { error: "Choose acres, hectares or square metres." };
}

/** Convert a built-up area to square feet from square foot, square yard or square metre. */
export function toSqft(value, unit = "sqft") {
  if (!isNum(value) || value < 0) return { error: "Area cannot be negative." };
  if (unit === "sqft") return { sqft: value };
  if (unit === "sqyd") return { sqft: value * SQFT_PER_SQYD };
  if (unit === "sqm") return { sqft: value / SQM_PER_SQFT };
  return { error: "Choose square feet, square yards or square metres." };
}

/** Convert a plot area to square yards from square yard, square foot or square metre. */
export function toSqyd(value, unit = "sqyd") {
  if (!isNum(value) || value < 0) return { error: "Area cannot be negative." };
  if (unit === "sqyd") return { sqyd: value };
  if (unit === "sqft") return { sqyd: value / SQFT_PER_SQYD };
  if (unit === "sqm") return { sqyd: value / SQM_PER_SQYD };
  return { error: "Choose square yards, square feet or square metres." };
}

/**
 * Add up family income across the heads the OM lists.
 *
 * @param {Record<string, number>} amounts Keyed by EWS_INCOME_HEADS id.
 * @returns {{total: number, breakdown: Array<{id: string, label: string, amount: number}>}|{error: string}}
 */
export function computeFamilyIncome(amounts = {}) {
  const breakdown = [];
  let total = 0;
  for (const head of EWS_INCOME_HEADS) {
    const raw = amounts[head.id];
    const amount = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(amount)) {
      return { error: `Enter a number for ${head.label.toLowerCase()}, or leave it blank.` };
    }
    if (amount < 0) return { error: "Income cannot be negative." };
    total += amount;
    breakdown.push({ id: head.id, label: head.label, amount: round2(amount) });
  }
  return { total: round2(total), breakdown };
}

/**
 * Run all EWS criteria against one applicant.
 *
 * Note that all four asset tests are exclusions: crossing any one of them disqualifies the
 * family however low its income is. Property in different cities is clubbed together before
 * the test is applied.
 *
 * @param {object} input
 * @param {boolean} input.coveredByScStObcReservation
 * @param {number} input.familyAnnualIncome Gross income of the family for the previous financial year.
 * @param {number} input.agriLandAcres      Total agricultural land held anywhere, in acres.
 * @param {number} input.flatAreaSqft       Largest residential flat held, in square feet.
 * @param {number} input.plotNotifiedSqyd   Residential plot in notified municipalities, in square yards.
 * @param {number} input.plotOtherSqyd      Residential plot elsewhere, in square yards.
 * @returns {object} { eligible, checks, failedCount, margins } or { error }
 */
export function assessEwsEligibility({
  coveredByScStObcReservation = false,
  familyAnnualIncome,
  agriLandAcres = 0,
  flatAreaSqft = 0,
  plotNotifiedSqyd = 0,
  plotOtherSqyd = 0,
} = {}) {
  if (!isNum(familyAnnualIncome) || familyAnnualIncome < 0) {
    return { error: "Enter the family's gross annual income for the previous financial year." };
  }
  const areas = { agriLandAcres, flatAreaSqft, plotNotifiedSqyd, plotOtherSqyd };
  for (const [key, value] of Object.entries(areas)) {
    if (!isNum(value) || value < 0) {
      return { error: `Enter a number of zero or more for every area field (${key}).` };
    }
  }

  const checks = [
    {
      id: "reservation",
      label: "Not covered by SC, ST or OBC reservation",
      passed: !coveredByScStObcReservation,
      detail: coveredByScStObcReservation
        ? "EWS reservation is only for people not already covered by the reservation for Scheduled Castes, Scheduled Tribes or Other Backward Classes."
        : "Not covered by an existing reservation, which is the first condition in the OM.",
    },
    {
      id: "income",
      label: `Family gross annual income below ₹${EWS_INCOME_LIMIT.toLocaleString("en-IN")}`,
      passed: familyAnnualIncome < EWS_INCOME_LIMIT,
      detail:
        familyAnnualIncome < EWS_INCOME_LIMIT
          ? `₹${Math.round(familyAnnualIncome).toLocaleString("en-IN")} is ₹${Math.round(EWS_INCOME_LIMIT - familyAnnualIncome).toLocaleString("en-IN")} below the limit. Income from all sources for the financial year before the year of application is counted.`
          : `₹${Math.round(familyAnnualIncome).toLocaleString("en-IN")} is at or above the ₹${EWS_INCOME_LIMIT.toLocaleString("en-IN")} limit. The limit is exclusive, so exactly ₹8,00,000 does not qualify.`,
    },
    {
      id: "agri-land",
      label: `Agricultural land under ${EWS_AGRI_LAND_LIMIT_ACRES} acres`,
      passed: agriLandAcres < EWS_AGRI_LAND_LIMIT_ACRES,
      detail:
        agriLandAcres < EWS_AGRI_LAND_LIMIT_ACRES
          ? `${round2(agriLandAcres)} acres, below the ${EWS_AGRI_LAND_LIMIT_ACRES}-acre exclusion.`
          : `${round2(agriLandAcres)} acres reaches the exclusion, which bites at ${EWS_AGRI_LAND_LIMIT_ACRES} acres and above regardless of income. Land in different places is added together first.`,
    },
    {
      id: "flat",
      label: `Residential flat under ${EWS_FLAT_LIMIT_SQFT} sq ft`,
      passed: flatAreaSqft < EWS_FLAT_LIMIT_SQFT,
      detail:
        flatAreaSqft < EWS_FLAT_LIMIT_SQFT
          ? `${round2(flatAreaSqft)} sq ft, below the ${EWS_FLAT_LIMIT_SQFT} sq ft exclusion.`
          : `${round2(flatAreaSqft)} sq ft reaches the exclusion, which bites at ${EWS_FLAT_LIMIT_SQFT} sq ft and above regardless of income.`,
    },
    {
      id: "plot-notified",
      label: `Residential plot in a notified municipality under ${EWS_PLOT_LIMIT_NOTIFIED_SQYD} sq yards`,
      passed: plotNotifiedSqyd < EWS_PLOT_LIMIT_NOTIFIED_SQYD,
      detail:
        plotNotifiedSqyd < EWS_PLOT_LIMIT_NOTIFIED_SQYD
          ? `${round2(plotNotifiedSqyd)} sq yards, below the ${EWS_PLOT_LIMIT_NOTIFIED_SQYD} sq yard exclusion.`
          : `${round2(plotNotifiedSqyd)} sq yards reaches the exclusion for notified municipalities, which bites at ${EWS_PLOT_LIMIT_NOTIFIED_SQYD} sq yards and above.`,
    },
    {
      id: "plot-other",
      label: `Residential plot outside notified municipalities under ${EWS_PLOT_LIMIT_OTHER_SQYD} sq yards`,
      passed: plotOtherSqyd < EWS_PLOT_LIMIT_OTHER_SQYD,
      detail:
        plotOtherSqyd < EWS_PLOT_LIMIT_OTHER_SQYD
          ? `${round2(plotOtherSqyd)} sq yards, below the ${EWS_PLOT_LIMIT_OTHER_SQYD} sq yard exclusion.`
          : `${round2(plotOtherSqyd)} sq yards reaches the exclusion for areas outside notified municipalities, which bites at ${EWS_PLOT_LIMIT_OTHER_SQYD} sq yards and above.`,
    },
  ];

  const failed = checks.filter((check) => !check.passed);

  return {
    eligible: failed.length === 0,
    failedCount: failed.length,
    checks,
    margins: {
      incomeHeadroom: round2(Math.max(0, EWS_INCOME_LIMIT - familyAnnualIncome)),
      agriLandHeadroomAcres: round2(Math.max(0, EWS_AGRI_LAND_LIMIT_ACRES - agriLandAcres)),
      flatHeadroomSqft: round2(Math.max(0, EWS_FLAT_LIMIT_SQFT - flatAreaSqft)),
      plotNotifiedHeadroomSqyd: round2(Math.max(0, EWS_PLOT_LIMIT_NOTIFIED_SQYD - plotNotifiedSqyd)),
      plotOtherHeadroomSqyd: round2(Math.max(0, EWS_PLOT_LIMIT_OTHER_SQYD - plotOtherSqyd)),
    },
  };
}
