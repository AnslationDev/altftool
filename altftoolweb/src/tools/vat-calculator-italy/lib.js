/**
 * Italian VAT (IVA - Imposta sul Valore Aggiunto) maths.
 *
 * Imponibile -> totale:  IVA = imponibile x aliquota/100 ; totale = imponibile + IVA
 * Totale -> imponibile ("scorporo"):
 *        imponibile = totale / (1 + aliquota/100) ; IVA = totale - imponibile
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory Italian rates (DPR 633/1972 and its tables). */
export const VAT_RATES = [
  {
    id: "ordinaria",
    label: "Aliquota ordinaria",
    rate: 22,
    note: "Default rate for most goods and services. 22% since 1 October 2013.",
  },
  {
    id: "ridotta10",
    label: "Aliquota ridotta",
    rate: 10,
    note: "Restaurants and hotels, domestic electricity and gas, many foods, building renovation work.",
  },
  {
    id: "ridotta5",
    label: "Aliquota ridotta",
    rate: 5,
    note: "Certain social, health and welfare services, some herbs and foodstuffs, urban transport by private operators.",
  },
  {
    id: "minima",
    label: "Aliquota minima",
    rate: 4,
    note: "Basic foods such as bread, pasta and milk, books and newspapers, medical devices, first-home purchases.",
  },
  {
    id: "zero",
    label: "Non imponibile / 0%",
    rate: 0,
    note: "Exports and intra-EU supplies (non imponibile, artt. 8 and 41), plus exempt operations under art. 10.",
  },
];

export const STANDARD_RATE = 22;

/**
 * Regime forfettario (L. 190/2014 as amended): flat-rate regime for small
 * businesses that charge no IVA. The entry limit is EUR 85,000 of revenue;
 * crossing EUR 100,000 during the year ends the regime immediately, with IVA
 * due from that operation onward.
 */
export const FORFETTARIO_LIMIT = 85000;
export const FORFETTARIO_HARD_EXIT = 100000;

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "it-IT";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole centesimi. */
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

/** Share of a gross total that is tax: aliquota / (100 + aliquota). */
export function vatFraction(ratePercent) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
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
 * @param {number} input.ratePercent  IVA rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as imponibile, "remove" as totale
 */
export function calculateVat({ amount, ratePercent, mode = "add" } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent)) return { error: "Enter an IVA rate as a number." };
  if (ratePercent < 0) return { error: "The IVA rate cannot be negative." };
  if (ratePercent > MAX_RATE) return { error: `Enter an IVA rate of ${MAX_RATE}% or less.` };
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove IVA." };

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

/** The same imponibile priced at each Italian rate. */
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

/** Regime forfettario eligibility test against the two statutory limits. */
export function checkForfettario(revenue) {
  if (!isNum(revenue) || revenue < 0) {
    return { error: "Enter your annual revenue as a positive number." };
  }
  const withinLimit = revenue <= FORFETTARIO_LIMIT;
  const hardExit = revenue > FORFETTARIO_HARD_EXIT;
  return {
    revenue: roundMoney(revenue),
    limit: FORFETTARIO_LIMIT,
    hardExitLimit: FORFETTARIO_HARD_EXIT,
    withinLimit,
    // Between 85,000 and 100,000 the regime ends from the following year.
    exitsNextYear: !withinLimit && !hardExit,
    hardExit,
    headroom: roundMoney(FORFETTARIO_LIMIT - revenue),
  };
}
