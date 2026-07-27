/**
 * Social security pensions under the National Social Assistance Programme (NSAP).
 *
 * Rule source: NSAP guidelines issued by the Ministry of Rural Development, covering the
 * Indira Gandhi National Old Age Pension Scheme (IGNOAPS), the Indira Gandhi National Widow
 * Pension Scheme (IGNWPS), the Indira Gandhi National Disability Pension Scheme (IGNDPS),
 * the National Family Benefit Scheme (NFBS) and the Annapurna scheme.
 *
 * Every one of these schemes is for a household below the poverty line as identified by the
 * state government. The amounts here are the CENTRAL assistance only. States add their own
 * top-up and the combined pension differs a great deal from one state to another, so the
 * top-up is taken as an input rather than assumed.
 */

/** Central assistance steps up once the beneficiary reaches this age. */
export const ENHANCED_PENSION_AGE = 80;

/** Central assistance for a beneficiary aged 80 or above, common to all three pensions. */
export const CENTRAL_PENSION_AT_80 = 500;

/** IGNOAPS: minimum age and the central share below 80. */
export const IGNOAPS_MIN_AGE = 60;
export const IGNOAPS_CENTRAL_BELOW_80 = 200;

/** IGNWPS: minimum age and the central share below 80. */
export const IGNWPS_MIN_AGE = 40;
export const IGNWPS_CENTRAL_BELOW_80 = 300;

/** IGNDPS: minimum age, disability threshold and the central share below 80. */
export const IGNDPS_MIN_AGE = 18;
export const IGNDPS_MIN_DISABILITY_PCT = 80;
export const IGNDPS_CENTRAL_BELOW_80 = 300;

/** NFBS: one-time grant on the death of the primary breadwinner. */
export const NFBS_GRANT = 20000;
export const NFBS_BREADWINNER_MIN_AGE = 18;
export const NFBS_BREADWINNER_MAX_AGE = 59;

/** Annapurna: free foodgrain each month for eligible senior citizens not drawing IGNOAPS. */
export const ANNAPURNA_KG_PER_MONTH = 10;

/** Practical ceiling used only to reject typing mistakes in the age field. */
const MAX_AGE = 120;

export const NSAP_SCHEMES = [
  {
    id: "ignoaps",
    label: "Old age pension (IGNOAPS)",
    minAge: IGNOAPS_MIN_AGE,
    centralBelow80: IGNOAPS_CENTRAL_BELOW_80,
    summary: `Aged ${IGNOAPS_MIN_AGE} or above and belonging to a household below the poverty line. Central assistance is ₹${IGNOAPS_CENTRAL_BELOW_80} a month, rising to ₹${CENTRAL_PENSION_AT_80} from age ${ENHANCED_PENSION_AGE}.`,
  },
  {
    id: "ignwps",
    label: "Widow pension (IGNWPS)",
    minAge: IGNWPS_MIN_AGE,
    centralBelow80: IGNWPS_CENTRAL_BELOW_80,
    summary: `A widow aged ${IGNWPS_MIN_AGE} or above from a household below the poverty line. Central assistance is ₹${IGNWPS_CENTRAL_BELOW_80} a month, rising to ₹${CENTRAL_PENSION_AT_80} from age ${ENHANCED_PENSION_AGE}.`,
  },
  {
    id: "igndps",
    label: "Disability pension (IGNDPS)",
    minAge: IGNDPS_MIN_AGE,
    centralBelow80: IGNDPS_CENTRAL_BELOW_80,
    summary: `Aged ${IGNDPS_MIN_AGE} or above with severe or multiple disability of ${IGNDPS_MIN_DISABILITY_PCT}% or more, from a household below the poverty line. Central assistance is ₹${IGNDPS_CENTRAL_BELOW_80} a month, rising to ₹${CENTRAL_PENSION_AT_80} from age ${ENHANCED_PENSION_AGE}.`,
  },
];

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a scheme definition by id. */
export function getNsapScheme(schemeId) {
  return NSAP_SCHEMES.find((item) => item.id === schemeId) || null;
}

/** Central assistance for a scheme at a given age. */
function centralAssistance(scheme, ageYears) {
  return ageYears >= ENHANCED_PENSION_AGE ? CENTRAL_PENSION_AT_80 : scheme.centralBelow80;
}

/**
 * Check one applicant against an NSAP pension scheme and work out the monthly amount.
 *
 * @param {object} input
 * @param {"ignoaps"|"ignwps"|"igndps"} input.scheme
 * @param {number} input.ageYears
 * @param {boolean} input.isBpl        Household identified as below the poverty line by the state.
 * @param {boolean} [input.isWidow]    Needed only for IGNWPS.
 * @param {number} [input.disabilityPct] Needed only for IGNDPS.
 * @param {number} [input.stateTopUp]  Monthly state top-up, which varies by state.
 * @returns {object} { eligible, checks, amounts } or { error }
 */
export function assessNsapPension({
  scheme: schemeId = "ignoaps",
  ageYears,
  isBpl = true,
  isWidow = false,
  disabilityPct = 0,
  stateTopUp = 0,
} = {}) {
  const scheme = getNsapScheme(schemeId);
  if (!scheme) return { error: "Choose one of the three NSAP pension schemes." };
  if (!isNum(ageYears) || ageYears < 0 || ageYears > MAX_AGE) {
    return { error: `Enter an age between 0 and ${MAX_AGE} completed years.` };
  }
  if (!isNum(stateTopUp) || stateTopUp < 0) {
    return { error: "The state top-up cannot be negative. Enter zero if you do not know it." };
  }
  if (stateTopUp > 20000) {
    return { error: "That state top-up looks wrong — enter the monthly amount, not the yearly one." };
  }
  if (!isNum(disabilityPct) || disabilityPct < 0 || disabilityPct > 100) {
    return { error: "Disability must be between 0% and 100%." };
  }

  const checks = [
    {
      id: "age",
      label: `Aged ${scheme.minAge} or above`,
      passed: ageYears >= scheme.minAge,
      detail:
        ageYears >= scheme.minAge
          ? `${ageYears} completed years, at or above the scheme's minimum of ${scheme.minAge}.`
          : `${scheme.label} opens at ${scheme.minAge}. This applicant is ${round2(scheme.minAge - ageYears)} year(s) short.`,
    },
    {
      id: "bpl",
      label: "Household below the poverty line",
      passed: Boolean(isBpl),
      detail: isBpl
        ? "Identified as a BPL household by the state government, which every NSAP pension requires."
        : "All three NSAP pensions are limited to households the state government has identified as below the poverty line.",
    },
  ];

  if (schemeId === "ignwps") {
    checks.push({
      id: "widow",
      label: "Applicant is a widow",
      passed: Boolean(isWidow),
      detail: isWidow
        ? "Widowhood is the qualifying condition for IGNWPS."
        : "IGNWPS is only for widows. An older applicant who is not a widow should look at IGNOAPS instead.",
    });
  }

  if (schemeId === "igndps") {
    checks.push({
      id: "disability",
      label: `Severe or multiple disability of ${IGNDPS_MIN_DISABILITY_PCT}% or more`,
      passed: disabilityPct >= IGNDPS_MIN_DISABILITY_PCT,
      detail:
        disabilityPct >= IGNDPS_MIN_DISABILITY_PCT
          ? `${round2(disabilityPct)}% disability, at or above the ${IGNDPS_MIN_DISABILITY_PCT}% the scheme requires.`
          : `IGNDPS covers severe or multiple disability of ${IGNDPS_MIN_DISABILITY_PCT}% or more, certified by the competent medical authority. ${round2(disabilityPct)}% falls short.`,
    });
  }

  const failed = checks.filter((check) => !check.passed);
  const eligible = failed.length === 0;

  const central = centralAssistance(scheme, ageYears);
  const monthlyTotal = eligible ? central + stateTopUp : 0;
  const yearsToEnhanced = Math.max(0, ENHANCED_PENSION_AGE - ageYears);

  return {
    scheme: schemeId,
    schemeLabel: scheme.label,
    schemeSummary: scheme.summary,
    eligible,
    failedCount: failed.length,
    checks,
    amounts: {
      centralShare: eligible ? central : 0,
      stateTopUp: eligible ? round2(stateTopUp) : 0,
      monthlyTotal: round2(monthlyTotal),
      annualTotal: round2(monthlyTotal * 12),
      centralShareAt80: CENTRAL_PENSION_AT_80,
      monthlyTotalAt80: eligible ? round2(CENTRAL_PENSION_AT_80 + stateTopUp) : 0,
      atEnhancedRate: ageYears >= ENHANCED_PENSION_AGE,
      yearsToEnhancedRate: round2(yearsToEnhanced),
    },
  };
}

/**
 * National Family Benefit Scheme: a one-time grant to a BPL household when the primary
 * breadwinner dies between 18 and 59 years of age.
 *
 * @param {object} input
 * @param {boolean} input.isBpl
 * @param {number} input.breadwinnerAgeAtDeath
 * @returns {object} { eligible, grant, checks } or { error }
 */
export function assessNfbs({ isBpl = true, breadwinnerAgeAtDeath } = {}) {
  if (!isNum(breadwinnerAgeAtDeath) || breadwinnerAgeAtDeath < 0 || breadwinnerAgeAtDeath > MAX_AGE) {
    return { error: `Enter the breadwinner's age at death, between 0 and ${MAX_AGE}.` };
  }

  const ageOk =
    breadwinnerAgeAtDeath >= NFBS_BREADWINNER_MIN_AGE &&
    breadwinnerAgeAtDeath <= NFBS_BREADWINNER_MAX_AGE;

  const checks = [
    {
      id: "bpl",
      label: "Household below the poverty line",
      passed: Boolean(isBpl),
      detail: isBpl
        ? "NFBS applies to BPL households as identified by the state."
        : "NFBS is limited to households identified as below the poverty line.",
    },
    {
      id: "age",
      label: `Breadwinner aged ${NFBS_BREADWINNER_MIN_AGE} to ${NFBS_BREADWINNER_MAX_AGE} at death`,
      passed: ageOk,
      detail: ageOk
        ? `Age ${round2(breadwinnerAgeAtDeath)} falls inside the qualifying band.`
        : `The grant applies when the primary breadwinner dies between ${NFBS_BREADWINNER_MIN_AGE} and ${NFBS_BREADWINNER_MAX_AGE} years of age.`,
    },
  ];

  const eligible = checks.every((check) => check.passed);

  return {
    eligible,
    grant: eligible ? NFBS_GRANT : 0,
    maximumGrant: NFBS_GRANT,
    checks,
  };
}
