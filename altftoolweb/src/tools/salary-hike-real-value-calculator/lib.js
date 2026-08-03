/**
 * What a salary hike is actually worth, after tax and after inflation.
 *
 * A raise is eaten twice. First by tax: the increment sits on top of your existing income,
 * so it is taxed at your *marginal* rate, not your average rate — and that marginal rate is
 * grossed up by surcharge (where applicable) and by the 4% Health and Education Cess.
 *
 *     effective marginal rate = slab rate x (1 + surcharge) x (1 + cess)
 *
 * Second by inflation, which erodes the whole salary and not just the increment:
 *
 *     new take-home        = current take-home + increment x (1 - effective marginal rate)
 *     real new take-home   = new take-home / (1 + inflation)          [Fisher deflation]
 *     real gain            = real new take-home - current take-home
 *
 * From the same relation, the hike that leaves you exactly where you started is
 *
 *     break-even hike on gross = current take-home x inflation
 *                               / ((1 - effective marginal rate) x current gross)
 *
 * Slab rates are taken as an input rather than hardcoded, because income tax slabs are reset
 * by the Finance Act every year and a stale table would silently give the wrong answer. The
 * cess rate and the surcharge thresholds below have been stable for several years, but
 * confirm them for the year you are filing.
 */

/** Health and Education Cess on income tax plus surcharge. Levied at this rate since FY 2018-19. */
export const CESS_PCT = 4;

/** Marginal slab rates that appear in the Indian income tax schedule. */
export const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

/**
 * Surcharge on income tax, by total income. Thresholds are on total income, not on the
 * raise. The new tax regime caps surcharge at 25%.
 */
export const SURCHARGE_OPTIONS = [
  { value: 0, label: "No surcharge (total income up to ₹50 lakh)" },
  { value: 10, label: "10% surcharge (total income above ₹50 lakh)" },
  { value: 15, label: "15% surcharge (total income above ₹1 crore)" },
  { value: 25, label: "25% surcharge (total income above ₹2 crore)" },
];

export const MAX_HIKE_PCT = 500;
export const MAX_INFLATION_PCT = 50;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

// Math.round() can return -0 for any input in (-0.5, 0), which
// Intl.NumberFormat then renders as a nonsensical "-₹0". Normalise it to a
// plain positive zero — -0 === 0 is true in JS, so this only touches values
// that rounded to zero either way and leaves every other value untouched.
const round0 = (value) => {
  const rounded = Math.round(value);
  return rounded === 0 ? 0 : rounded;
};
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number|string} input.currentGross Current annual gross salary or CTC.
 * @param {number|string} input.currentTakeHome Current annual in-hand pay, after tax and PF.
 * @param {number|string} input.hikePct The raise offered, % of gross.
 * @param {number|string} input.inflationPct Inflation over the same period, % per year.
 * @param {number|string} [input.marginalRatePct] Your top slab rate.
 * @param {number|string} [input.surchargePct] Surcharge applying to your total income.
 * @param {number|string} [input.cessPct] Health and Education Cess.
 */
export function computeRealHike({
  currentGross,
  currentTakeHome,
  hikePct,
  inflationPct,
  marginalRatePct = 30,
  surchargePct = 0,
  cessPct = CESS_PCT,
} = {}) {
  const gross = toNumber(currentGross);
  const takeHome = toNumber(currentTakeHome);
  const hike = toNumber(hikePct);
  const inflation = toNumber(inflationPct);
  const slab = toNumber(marginalRatePct);
  const surcharge = toNumber(surchargePct);
  const cess = toNumber(cessPct);

  const all = [gross, takeHome, hike, inflation, slab, surcharge, cess];
  if (all.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (all.some((value) => value < 0)) {
    return { error: "Salary, hike and rates cannot be negative." };
  }
  if (!(gross > 0)) return { error: "Enter your current annual gross salary." };
  if (!(takeHome > 0)) return { error: "Enter your current annual take-home pay." };
  if (takeHome > gross) {
    return { error: "Take-home pay cannot be more than gross salary." };
  }
  if (hike > MAX_HIKE_PCT) return { error: `Enter a hike of ${MAX_HIKE_PCT}% or less.` };
  if (inflation > MAX_INFLATION_PCT) {
    return { error: `Enter an inflation rate of ${MAX_INFLATION_PCT}% or less.` };
  }
  if (slab > 50) return { error: "A marginal slab rate above 50% is not a real rate." };
  if (surcharge > 37) return { error: "Surcharge does not exceed 37%." };
  if (cess > 10) return { error: "Cess is charged in low single digits, not above 10%." };

  const effectiveMarginalPct = round2((slab * (1 + surcharge / 100) * (1 + cess / 100)));
  const t = effectiveMarginalPct / 100;
  const i = inflation / 100;

  const increment = (gross * hike) / 100;
  const taxOnIncrement = increment * t;
  const netIncrement = increment - taxOnIncrement;

  const newGross = gross + increment;
  const newTakeHome = takeHome + netIncrement;
  const realNewTakeHome = newTakeHome / (1 + i);
  const realGain = realNewTakeHome - takeHome;
  const realGainPct = takeHome > 0 ? (realGain / takeHome) * 100 : 0;

  // Real hike before tax, purely the Fisher relation on gross pay.
  const realGrossHikePct = ((1 + hike / 100) / (1 + i) - 1) * 100;

  const keepShare = 1 - t;
  const breakEvenHikePct =
    keepShare > 0 ? ((takeHome * i) / (keepShare * gross)) * 100 : null;

  const inflationCost = newTakeHome - realNewTakeHome;

  // Same three-way split the verdict text uses (>0.5 better off, <-0.5 pay
  // cut, otherwise a neutral "about even" band) so the UI can colour the
  // verdict consistently with what it says — a binary cutoff at exactly 0
  // would land the neutral band's own edge cases (e.g. 0% hike, 0% inflation)
  // in the "pay cut" colour.
  let verdict;
  let verdictTone;
  if (realGain > 0.5) {
    verdict = "You are genuinely better off in purchasing power.";
    verdictTone = "positive";
  } else if (realGain < -0.5) {
    verdict = "After tax and inflation this raise is a pay cut in real terms.";
    verdictTone = "negative";
  } else {
    verdict = "This raise leaves you almost exactly where you started.";
    verdictTone = "neutral";
  }

  // currentTakeHome and netIncrement are rounded independently below for
  // display; newTakeHome is derived from those SAME rounded figures (rather
  // than rounded separately from the raw float) so the UI's "New take-home"
  // row always equals "Current take-home" + "Extra in hand per year" exactly,
  // with no possibility of a rounding-boundary mismatch between the two.
  const currentTakeHomeRounded = round0(takeHome);
  const netIncrementRounded = round0(netIncrement);
  const newTakeHomeRounded = currentTakeHomeRounded + netIncrementRounded;

  return {
    currentGross: round0(gross),
    currentTakeHome: currentTakeHomeRounded,
    hikePct: round2(hike),
    increment: round0(increment),
    effectiveMarginalPct,
    taxOnIncrement: round0(taxOnIncrement),
    netIncrement: netIncrementRounded,
    netIncrementMonthly: round0(netIncrement / 12),
    newGross: round0(newGross),
    newTakeHome: newTakeHomeRounded,
    newTakeHomeMonthly: round0(newTakeHomeRounded / 12),
    inflationCost: round0(inflationCost),
    realNewTakeHome: round0(realNewTakeHome),
    realGain: round0(realGain),
    realGainMonthly: round0(realGain / 12),
    realGainPct: round2(realGainPct),
    realGrossHikePct: round2(realGrossHikePct),
    breakEvenHikePct: breakEvenHikePct === null ? null : round2(breakEvenHikePct),
    keptShareOfRaisePct: round2(keepShare * 100),
    verdict,
    verdictTone,
  };
}
