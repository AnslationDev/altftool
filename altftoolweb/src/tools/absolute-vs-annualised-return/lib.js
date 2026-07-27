/**
 * Absolute (total) return <-> annualised (CAGR) return conversion.
 *
 * Absolute return is the whole-period gain:      A = (end / start) - 1
 * Annualised return compounds that across years: 1 + A = (1 + R)^years
 *
 * Rearranged, the two directions are:
 *   R = (1 + A)^(1 / years) - 1        absolute -> annualised
 *   A = (1 + R)^years - 1              annualised -> absolute
 *
 * Both are exact identities, not approximations. The commonly quoted
 * "absolute / years" figure is a simple average and is included only for
 * contrast — it overstates the rate whenever the gain is positive.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Fractional years per unit of holding period.
 * 1/12 for months (calendar convention) and 1/365.2425 for days, where
 * 365.2425 is the mean Gregorian year (146097 days per 400 years / 400). */
export const PERIOD_UNITS = {
  years: { label: "Years", yearsPerUnit: 1 },
  months: { label: "Months", yearsPerUnit: 1 / 12 },
  days: { label: "Days", yearsPerUnit: 1 / 365.2425 },
};

/** A return of exactly -100% means total loss; anything below that would imply
 * owing more than was invested, which these identities cannot represent. */
export const MIN_RETURN_PERCENT = -100;

/** Sanity ceiling on the holding period, in years. */
export const MAX_YEARS = 200;

/** Sanity ceiling on a reportable rate: 1,000,000% (a 10,000x multiple).
 * Beyond this, annualising or compounding produces figures that are technically
 * correct but useless to quote. */
export const MAX_REPORTABLE_PERCENT = 1000000;

/** Horizons used for the side-by-side comparison table (years). */
export const COMPARISON_HORIZONS = [1, 2, 3, 5, 7, 10, 15, 20];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Convert a holding period expressed in a unit into fractional years.
 *
 * @param {number} amount
 * @param {"years"|"months"|"days"} unit
 * @returns {{ years: number } | { error: string }}
 */
export function periodToYears(amount, unit) {
  const meta = PERIOD_UNITS[unit];
  if (!meta) return { error: "Choose years, months or days for the holding period." };
  if (!isNum(amount)) return { error: "Enter the holding period as a number." };
  if (amount <= 0) return { error: "The holding period must be greater than zero." };
  const years = amount * meta.yearsPerUnit;
  if (years > MAX_YEARS) return { error: `Keep the holding period under ${MAX_YEARS} years.` };
  return { years };
}

/**
 * Absolute (total) return -> annualised return.
 *
 * @param {object} input
 * @param {number} input.absolutePercent total gain over the whole period, e.g. 100 for +100%
 * @param {number} input.years holding period in years (> 0)
 * @returns {object} result, or { error }
 */
export function absoluteToAnnualised({ absolutePercent, years }) {
  if (!isNum(absolutePercent)) return { error: "Enter the total return as a number." };
  if (!isNum(years) || years <= 0) return { error: "The holding period must be greater than zero." };
  if (years > MAX_YEARS) return { error: `Keep the holding period under ${MAX_YEARS} years.` };
  if (absolutePercent < MIN_RETURN_PERCENT) {
    return { error: "A total return cannot be worse than -100% — that is already a full loss." };
  }

  const multiple = 1 + absolutePercent / 100;
  const annualised = Math.pow(multiple, 1 / years) - 1;
  if (!Number.isFinite(annualised) || annualised * 100 > MAX_REPORTABLE_PERCENT) {
    return {
      error:
        "Annualising this gain over so short a period gives a rate too extreme to be meaningful — quote the absolute return instead.",
    };
  }

  return buildResult({
    absolutePercent,
    annualisedPercent: annualised * 100,
    years,
    multiple,
  });
}

/**
 * Annualised return -> absolute (total) return.
 *
 * @param {object} input
 * @param {number} input.annualisedPercent yearly compounded rate, e.g. 12 for 12% p.a.
 * @param {number} input.years holding period in years (> 0)
 * @returns {object} result, or { error }
 */
export function annualisedToAbsolute({ annualisedPercent, years }) {
  if (!isNum(annualisedPercent)) return { error: "Enter the annualised return as a number." };
  if (!isNum(years) || years <= 0) return { error: "The holding period must be greater than zero." };
  if (years > MAX_YEARS) return { error: `Keep the holding period under ${MAX_YEARS} years.` };
  if (annualisedPercent < MIN_RETURN_PERCENT) {
    return { error: "An annualised return cannot be worse than -100% a year." };
  }

  const multiple = Math.pow(1 + annualisedPercent / 100, years);
  const absolute = multiple - 1;
  if (!Number.isFinite(absolute) || absolute * 100 > MAX_REPORTABLE_PERCENT) {
    return {
      error:
        "Compounding this rate over that many years gives a total return too large to be meaningful — shorten the period.",
    };
  }

  return buildResult({
    absolutePercent: absolute * 100,
    annualisedPercent,
    years,
    multiple,
  });
}

/** ln(2), for the doubling-time identity t = ln 2 / ln(1 + r). */
const LN2 = Math.log(2);

function buildResult({ absolutePercent, annualisedPercent, years, multiple }) {
  const rate = annualisedPercent / 100;
  return {
    absolutePercent,
    annualisedPercent,
    /** The naive "total / years" figure people often quote by mistake. */
    simpleAnnualPercent: absolutePercent / years,
    /** How much the simple average overstates (or understates) the true rate. */
    simpleOverstatementPoints: absolutePercent / years - annualisedPercent,
    multiple,
    years,
    doublingYears: rate > 0 ? LN2 / Math.log(1 + rate) : null,
  };
}

/**
 * Grow a starting amount at the annualised rate to show the conversion in money.
 *
 * @param {number} startAmount
 * @param {number} annualisedPercent
 * @param {number} years
 * @returns {{ endAmount: number, gain: number } | { error: string }}
 */
export function applyToAmount(startAmount, annualisedPercent, years) {
  if (!isNum(startAmount) || startAmount < 0) return { error: "Enter a non-negative amount." };
  if (!isNum(annualisedPercent) || !isNum(years) || years <= 0) {
    return { error: "Enter a valid rate and holding period." };
  }
  const endAmount = startAmount * Math.pow(1 + annualisedPercent / 100, years);
  if (!Number.isFinite(endAmount)) return { error: "That combination is too large to compute." };
  return { endAmount, gain: endAmount - startAmount };
}

/**
 * The same annualised rate expressed as an absolute return over several horizons,
 * which is what makes short-period returns look deceptively small or large.
 *
 * @param {number} annualisedPercent
 * @returns {Array<{ years: number, absolutePercent: number, multiple: number }>}
 */
export function buildHorizonTable(annualisedPercent) {
  if (!isNum(annualisedPercent) || annualisedPercent < MIN_RETURN_PERCENT) return [];
  const rows = [];
  for (const years of COMPARISON_HORIZONS) {
    const multiple = Math.pow(1 + annualisedPercent / 100, years);
    if (!Number.isFinite(multiple)) break;
    rows.push({ years, multiple, absolutePercent: (multiple - 1) * 100 });
  }
  return rows;
}
