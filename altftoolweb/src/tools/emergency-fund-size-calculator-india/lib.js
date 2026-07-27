/**
 * Emergency fund sizing for Indian households.
 *
 * The size of a contingency fund is expressed in months of essential outgo
 * (essential living expenses + committed loan EMIs). Standard financial-planning
 * guidance is 3 to 6 months for a stable salaried earner and 6 to 12 months where
 * income is variable or a single income supports several people. This module starts
 * from a 6-month baseline and adjusts it for the risks that actually change how long
 * a household would need to survive without income.
 *
 * Time-to-goal uses the closed-form future value of a growing balance plus a monthly
 * contribution:  target = existing*(1+r)^n + pmt*((1+r)^n - 1)/r
 * solved for n, where r is the monthly rate on the parked money.
 */

/** Baseline months of essential outgo before any risk adjustment. */
export const BASELINE_MONTHS = 6;
/** No household should hold less than this, even in the safest job. */
export const MIN_MONTHS = 3;
/** Beyond this, idle cash loses more to inflation than it buys in safety. */
export const MAX_MONTHS = 12;

/** Extra or fewer months by how predictable the income is. */
export const EMPLOYMENT_TYPES = [
  { value: "government", label: "Government or PSU (very secure)", months: -2 },
  { value: "salariedLarge", label: "Salaried, large or listed company", months: 0 },
  { value: "salariedStartup", label: "Salaried at a startup or small firm", months: 1 },
  { value: "contract", label: "Contract or fixed-term employee", months: 2 },
  { value: "commission", label: "Commission or variable pay heavy", months: 3 },
  { value: "selfEmployed", label: "Self-employed, freelance or business owner", months: 3 },
];

/** A single income supporting the household is a concentration risk. */
export const EARNER_OPTIONS = [
  { value: "single", label: "One earner", months: 1 },
  { value: "dual", label: "Two or more earners", months: -1 },
];

/** Months added per financially dependent person (spouse not earning, child, parent). */
export const MONTHS_PER_DEPENDANT = 0.5;
/** Cap on the dependant adjustment so a large family does not push the fund past MAX_MONTHS alone. */
export const MAX_DEPENDANT_MONTHS = 3;

/**
 * Health cover adjustment. A hospitalisation is the most common reason an Indian
 * emergency fund gets drained, so thin cover means the fund must absorb it.
 * IRDAI-regulated retail floater plans of 5 lakh and above are the common benchmark.
 */
export const HEALTH_COVER_OPTIONS = [
  { value: "none", label: "No health insurance", months: 2 },
  { value: "employerOnly", label: "Employer group cover only", months: 1 },
  { value: "under5L", label: "Own policy under 5 lakh", months: 0.5 },
  { value: "over5L", label: "Own policy of 5 lakh or more", months: 0 },
];

/** If EMIs eat this share or more of essential outgo, add a buffer month. */
export const HIGH_EMI_SHARE = 30;
/** The extra month added when EMIs dominate the outgo. */
export const HIGH_EMI_MONTHS = 1;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;
const round0 = (value) => Math.round(value);

const optionMonths = (options, value) => {
  const found = options.find((option) => option.value === value);
  return found ? found.months : null;
};

/**
 * @param {object} input
 * @param {number|string} input.monthlyEssentials Rent, food, utilities, school fees, medicines.
 * @param {number|string} [input.monthlyEmi] Committed loan instalments per month.
 * @param {string} [input.employment] One of EMPLOYMENT_TYPES values.
 * @param {string} [input.earners] One of EARNER_OPTIONS values.
 * @param {number|string} [input.dependants] Count of financially dependent people.
 * @param {string} [input.healthCover] One of HEALTH_COVER_OPTIONS values.
 * @param {number|string} [input.existingFund] What is already set aside and liquid.
 * @param {number|string} [input.monthlyContribution] What you can add each month.
 * @param {number|string} [input.annualReturn] Return on the parked money, % per year.
 */
export function computeEmergencyFund({
  monthlyEssentials,
  monthlyEmi = 0,
  employment = "salariedLarge",
  earners = "single",
  dependants = 0,
  healthCover = "over5L",
  existingFund = 0,
  monthlyContribution = 0,
  annualReturn = 6,
} = {}) {
  const essentials = toNumber(monthlyEssentials);
  const emi = toNumber(monthlyEmi);
  const dependantCount = toNumber(dependants);
  const existing = toNumber(existingFund);
  const contribution = toNumber(monthlyContribution);
  const rateAnnual = toNumber(annualReturn);

  if (
    [essentials, emi, dependantCount, existing, contribution, rateAnnual].some((value) =>
      Number.isNaN(value),
    )
  ) {
    return { error: "Enter valid numbers in every field." };
  }
  if (essentials < 0 || emi < 0 || existing < 0 || contribution < 0 || dependantCount < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (!(essentials > 0)) {
    return { error: "Enter your monthly essential expenses to size the fund." };
  }
  if (rateAnnual < 0 || rateAnnual > 30) {
    return { error: "Return on a liquid emergency fund should be between 0% and 30% a year." };
  }
  if (dependantCount > 20) {
    return { error: "Enter a dependant count of 20 or fewer." };
  }

  const employmentMonths = optionMonths(EMPLOYMENT_TYPES, employment);
  const earnerMonths = optionMonths(EARNER_OPTIONS, earners);
  const coverMonths = optionMonths(HEALTH_COVER_OPTIONS, healthCover);
  if (employmentMonths === null || earnerMonths === null || coverMonths === null) {
    return { error: "Choose a valid option for employment, earners and health cover." };
  }

  const monthlyOutgo = essentials + emi;
  const emiShare = monthlyOutgo > 0 ? (emi / monthlyOutgo) * 100 : 0;

  const dependantMonths = Math.min(
    dependantCount * MONTHS_PER_DEPENDANT,
    MAX_DEPENDANT_MONTHS,
  );
  const emiRiskMonths = emiShare >= HIGH_EMI_SHARE ? HIGH_EMI_MONTHS : 0;

  const rawMonths =
    BASELINE_MONTHS +
    employmentMonths +
    earnerMonths +
    dependantMonths +
    coverMonths +
    emiRiskMonths;

  const recommendedMonths = round2(Math.min(MAX_MONTHS, Math.max(MIN_MONTHS, rawMonths)));

  const factors = [
    { label: "Baseline contingency fund", months: BASELINE_MONTHS },
    {
      label: EMPLOYMENT_TYPES.find((option) => option.value === employment).label,
      months: employmentMonths,
    },
    {
      label: EARNER_OPTIONS.find((option) => option.value === earners).label,
      months: earnerMonths,
    },
    { label: `${dependantCount} dependant(s)`, months: round2(dependantMonths) },
    {
      label: HEALTH_COVER_OPTIONS.find((option) => option.value === healthCover).label,
      months: coverMonths,
    },
    {
      label: `EMIs are ${round0(emiShare)}% of essential outgo`,
      months: emiRiskMonths,
    },
  ];

  const targetCorpus = round0(monthlyOutgo * recommendedMonths);
  const gap = round0(Math.max(0, targetCorpus - existing));
  const coverageMonths = monthlyOutgo > 0 ? round2(existing / monthlyOutgo) : 0;
  const progress = targetCorpus > 0 ? round2(Math.min(100, (existing / targetCorpus) * 100)) : 0;

  let monthsToGoal = 0;
  let goalNote = "Your emergency fund already covers the recommended months.";
  if (gap > 0) {
    if (!(contribution > 0)) {
      monthsToGoal = null;
      goalNote = "Add a monthly contribution to see how long the gap takes to close.";
    } else {
      const r = rateAnnual / 12 / 100;
      if (r === 0) {
        monthsToGoal = Math.ceil(gap / contribution);
      } else {
        const x = (targetCorpus + contribution / r) / (existing + contribution / r);
        monthsToGoal = Math.ceil(Math.log(x) / Math.log(1 + r));
      }
      if (!Number.isFinite(monthsToGoal) || monthsToGoal < 0) monthsToGoal = null;
      goalNote =
        monthsToGoal === null
          ? "Add a monthly contribution to see how long the gap takes to close."
          : `Saving ${contribution} a month at ${rateAnnual}% closes the gap in about ${monthsToGoal} month(s).`;
    }
  }

  return {
    monthlyOutgo: round0(monthlyOutgo),
    essentials: round0(essentials),
    emi: round0(emi),
    emiShare: round2(emiShare),
    rawMonths: round2(rawMonths),
    recommendedMonths,
    clamped: round2(rawMonths) !== recommendedMonths,
    targetCorpus,
    existingFund: round0(existing),
    gap,
    coverageMonths,
    progress,
    monthsToGoal,
    goalNote,
    factors,
  };
}
