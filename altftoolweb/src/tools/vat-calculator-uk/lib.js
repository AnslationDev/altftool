/**
 * United Kingdom VAT (Value Added Tax) maths.
 *
 * VAT is charged on the net (VAT-exclusive) price:
 *     VAT   = net x rate/100
 *     gross = net + VAT
 * Working backwards from a VAT-inclusive price:
 *     net   = gross / (1 + rate/100)
 *     VAT   = gross - net
 * HMRC also expresses the reverse step as the "VAT fraction": at the 20%
 * standard rate the VAT inside a gross price is 1/6 of it.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory UK VAT rates (HMRC VAT Notice 700, rates and thresholds guidance). */
export const VAT_RATES = [
  {
    id: "standard",
    label: "Standard",
    rate: 20,
    note: "Most goods and services. 20% since 4 January 2011.",
  },
  {
    id: "reduced",
    label: "Reduced",
    rate: 5,
    note: "Domestic fuel and power, children's car seats, mobility aids for the over-60s.",
  },
  {
    id: "zero",
    label: "Zero",
    rate: 0,
    note: "Most food, books and newspapers, children's clothing, public transport, new-build housing.",
  },
];

export const STANDARD_RATE = 20;

/** VAT registration threshold: £90,000 of taxable turnover from 1 April 2024. */
export const REGISTRATION_THRESHOLD = 90000;
/** Deregistration threshold: £88,000 from 1 April 2024. */
export const DEREGISTRATION_THRESHOLD = 88000;

/** Highest amount the calculator will accept, to keep results readable. */
export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "GBP";
export const LOCALE = "en-GB";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole pence, the unit HMRC expects on an invoice. */
export function roundMoney(value) {
  if (!isNum(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * The VAT fraction: the share of a VAT-inclusive price that is VAT.
 * rate / (100 + rate), reduced to lowest terms. 20% -> 1/6, 5% -> 1/21.
 */
export function vatFraction(ratePercent) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
  // Scale by enough powers of 10 to capture the rate's own decimal
  // precision — a fixed x10 only works for rates with at most one decimal
  // place (e.g. 12.5%); a custom rate like 12.34% needs x100 or the
  // fraction comes out mathematically wrong. JS's number-to-string
  // conversion gives the shortest round-tripping decimal, so this reads the
  // precision the user actually typed rather than binary floating-point
  // noise; capped at 6 decimal places to keep the denominator sane.
  const [, decimalDigits = ""] = String(ratePercent).split(".");
  const scale = 10 ** Math.min(decimalDigits.length, 6);
  const numerator = Math.round(ratePercent * scale);
  const denominator = Math.round((100 + ratePercent) * scale);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    text: `${numerator / divisor}/${denominator / divisor}`,
    decimal: ratePercent / (100 + ratePercent),
  };
}

/**
 * Core VAT calculation.
 *
 * @param {object} input
 * @param {number} input.amount       the figure typed in
 * @param {number} input.ratePercent  VAT rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as net, "remove" as gross
 * @returns {object} { net, vat, gross, ... } or { error }
 */
export function calculateVat({ amount, ratePercent, mode = "add" } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent)) return { error: "Enter a VAT rate as a number." };
  if (ratePercent < 0) return { error: "The VAT rate cannot be negative." };
  if (ratePercent > MAX_RATE) return { error: `Enter a VAT rate of ${MAX_RATE}% or less.` };
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove VAT." };

  let net;
  let vat;
  let gross;

  if (mode === "add") {
    net = roundMoney(amount);
    vat = roundMoney((net * ratePercent) / 100);
    gross = roundMoney(net + vat);
  } else {
    gross = roundMoney(amount);
    net = roundMoney(gross / (1 + ratePercent / 100));
    vat = roundMoney(gross - net);
  }

  return {
    mode,
    ratePercent,
    net,
    vat,
    gross,
    fraction: vatFraction(ratePercent),
    // Share of the gross price that is tax, as a percentage.
    vatShareOfGross: gross > 0 ? (vat / gross) * 100 : 0,
  };
}

/**
 * Compare one net amount across every statutory rate.
 * Useful when you are unsure which rate a supply falls into.
 */
export function compareRates(netAmount) {
  if (!isNum(netAmount) || netAmount < 0) return [];
  return VAT_RATES.map((band) => {
    const result = calculateVat({ amount: netAmount, ratePercent: band.rate, mode: "add" });
    return {
      id: band.id,
      label: band.label,
      rate: band.rate,
      note: band.note,
      vat: result.error ? null : result.vat,
      gross: result.error ? null : result.gross,
    };
  });
}

/**
 * Registration test against the £90,000 rolling 12-month taxable turnover
 * threshold (HMRC: register within 30 days of the end of the month in which
 * you go over).
 */
export function checkRegistration(annualTurnover) {
  if (!isNum(annualTurnover) || annualTurnover < 0) {
    return { error: "Enter your taxable turnover for the last 12 months." };
  }
  const mustRegister = annualTurnover > REGISTRATION_THRESHOLD;
  return {
    turnover: roundMoney(annualTurnover),
    deregistrationThreshold: DEREGISTRATION_THRESHOLD,
    mustRegister,
    headroom: roundMoney(REGISTRATION_THRESHOLD - annualTurnover),
    canDeregister: annualTurnover < DEREGISTRATION_THRESHOLD,
  };
}
