/**
 * French VAT (TVA - taxe sur la valeur ajoutée) maths.
 *
 * HT -> TTC:  TVA = HT x taux/100 ;  TTC = HT + TVA
 * TTC -> HT:  HT  = TTC / (1 + taux/100) ;  TVA = TTC - HT
 * (HT = hors taxes, TTC = toutes taxes comprises.)
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Metropolitan French rates, article 278 and following of the CGI. */
export const VAT_RATES = [
  {
    id: "normal",
    label: "Taux normal",
    rate: 20,
    note: "Default rate for most goods and services (art. 278 CGI). 20% since 1 January 2014.",
  },
  {
    id: "intermediaire",
    label: "Taux intermédiaire",
    rate: 10,
    note: "Restaurants and takeaway food, hotels, passenger transport, renovation of homes over two years old.",
  },
  {
    id: "reduit",
    label: "Taux réduit",
    rate: 5.5,
    note: "Staple foods, water, gas and electricity subscriptions, books, cinema, energy-efficiency works, period products.",
  },
  {
    id: "particulier",
    label: "Taux particulier",
    rate: 2.1,
    note: "Reimbursable medicines, licensed press publications, certain live performances.",
  },
  {
    id: "zero",
    label: "Exonéré / 0%",
    rate: 0,
    note: "Exports and intra-EU deliveries; also the effective position for exempt activities.",
  },
];

export const STANDARD_RATE = 20;

/**
 * Franchise en base de TVA (art. 293 B CGI): below these turnover limits a
 * business charges no TVA and states "TVA non applicable, art. 293 B du CGI".
 * The higher "tolérance" figure is the ceiling you may reach for one year
 * before the exemption is lost.
 */
export const FRANCHISE_LIMITS = {
  goods: { base: 85000, tolerance: 93500, label: "Sale of goods, food to take away, accommodation" },
  services: { base: 37500, tolerance: 41250, label: "Services and liberal professions" },
};

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "fr-FR";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole centimes. */
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

/** Share of a TTC price that is tax: taux / (100 + taux), in lowest terms. */
export function vatFraction(ratePercent) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
  // Scale by 10 so the 5.5% and 2.1% rates stay whole numbers.
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
 * @param {number} input.ratePercent  TVA rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as HT, "remove" as TTC
 */
export function calculateVat({ amount, ratePercent, mode = "add" } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent)) return { error: "Enter a TVA rate as a number." };
  if (ratePercent < 0) return { error: "The TVA rate cannot be negative." };
  if (ratePercent > MAX_RATE) return { error: `Enter a TVA rate of ${MAX_RATE}% or less.` };
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove TVA." };

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

/** The same HT price priced at each French rate. */
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
 * Franchise en base test.
 * @param {number} turnover annual turnover, HT
 * @param {"goods"|"services"} activity
 */
export function checkFranchiseEnBase(turnover, activity = "services") {
  if (!isNum(turnover) || turnover < 0) {
    return { error: "Enter your annual turnover as a positive number." };
  }
  const limits = FRANCHISE_LIMITS[activity];
  if (!limits) return { error: "Choose sale of goods or services." };
  const withinBase = turnover <= limits.base;
  const withinTolerance = turnover <= limits.tolerance;
  return {
    turnover: roundMoney(turnover),
    activity,
    base: limits.base,
    tolerance: limits.tolerance,
    label: limits.label,
    withinBase,
    withinTolerance,
    // Charging TVA becomes compulsory once the tolerance ceiling is passed.
    mustCharge: !withinTolerance,
    headroom: roundMoney(limits.base - turnover),
  };
}
