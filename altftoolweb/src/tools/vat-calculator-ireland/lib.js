/**
 * Irish VAT maths (Value-Added Tax Consolidation Act 2010, administered by Revenue).
 *
 * Net -> gross:  VAT = net x rate/100 ;  gross = net + VAT
 * Gross -> net:  net = gross / (1 + rate/100) ;  VAT = gross - net
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Irish VAT rates. */
export const VAT_RATES = [
  {
    id: "standard",
    label: "Standard",
    rate: 23,
    note: "Most goods and services, including alcohol, electrical goods, professional services and telecoms.",
  },
  {
    id: "reduced",
    label: "Reduced",
    rate: 13.5,
    note: "Building and construction services, fuel for heat and light, veterinary fees, short-term car hire.",
  },
  {
    id: "second",
    label: "Second reduced",
    rate: 9,
    note: "Newspapers, e-books, sporting facilities and certain hospitality supplies.",
  },
  {
    id: "livestock",
    label: "Livestock",
    rate: 4.8,
    note: "Livestock, live greyhounds and the hire of horses — a rate unique to Ireland.",
  },
  {
    id: "zero",
    label: "Zero",
    rate: 0,
    note: "Most food and drink, oral medicines, children's clothes and shoes, books, exports and intra-EU supplies.",
  },
];

export const STANDARD_RATE = 23;

/**
 * VAT registration thresholds, raised on 1 January 2025:
 * EUR 85,000 for supplies of goods and EUR 42,500 for supplies of services.
 * They apply to any continuous 12-month period, not the calendar year.
 */
export const REGISTRATION_THRESHOLDS = {
  goods: { limit: 85000, label: "Supply of goods" },
  services: { limit: 42500, label: "Supply of services" },
};

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "en-IE";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole cents. */
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

/** Share of a gross price that is VAT: rate / (100 + rate), in lowest terms. */
export function vatFraction(ratePercent) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
  // Scale by 10 so 13.5% and 4.8% stay whole numbers.
  const numerator = Math.round(ratePercent * 10);
  const denominator = Math.round((100 + ratePercent) * 10);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    text: `${numerator / divisor}/${denominator / divisor}`,
    decimal: ratePercent / (100 + ratePercent),
  };
}

/**
 * @param {object} input
 * @param {number} input.amount       figure typed in
 * @param {number} input.ratePercent  VAT rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as net, "remove" as gross
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
    vatShareOfGross: gross > 0 ? (vat / gross) * 100 : 0,
  };
}

/** The same net price at each Irish rate. */
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
 * Registration test against the Revenue thresholds for a rolling 12-month period.
 * @param {number} turnover taxable turnover, excluding VAT
 * @param {"goods"|"services"} activity
 */
export function checkRegistration(turnover, activity = "services") {
  if (!isNum(turnover) || turnover < 0) {
    return { error: "Enter your 12-month taxable turnover as a positive number." };
  }
  const band = REGISTRATION_THRESHOLDS[activity];
  if (!band) return { error: "Choose goods or services." };
  const mustRegister = turnover > band.limit;
  return {
    turnover: roundMoney(turnover),
    activity,
    threshold: band.limit,
    label: band.label,
    mustRegister,
    headroom: roundMoney(band.limit - turnover),
  };
}
