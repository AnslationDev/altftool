/**
 * Dutch VAT (BTW - belasting over de toegevoegde waarde) maths.
 *
 * Netto -> bruto:  BTW   = netto x tarief/100 ;  bruto = netto + BTW
 * Bruto -> netto:  netto = bruto / (1 + tarief/100) ;  BTW = bruto - netto
 *
 * The BTW return (aangifte omzetbelasting) then nets the BTW charged on sales
 * against the voorbelasting (input BTW on purchases):
 *     te betalen = BTW over omzet - voorbelasting
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory Dutch rates (Wet op de omzetbelasting 1968, arts. 9 and 20). */
export const VAT_RATES = [
  {
    id: "hoog",
    label: "Hoog tarief",
    rate: 21,
    note: "Default rate for most goods and services. 21% since 1 October 2012.",
  },
  {
    id: "laag",
    label: "Laag tarief",
    rate: 9,
    note: "Food and drink, medicines, books, water, hairdressers, bicycle repairs, cultural admissions.",
  },
  {
    id: "nul",
    label: "Nultarief",
    rate: 0,
    note: "Exports and intra-EU supplies; solar panels on and near homes have been 0% since 1 January 2023.",
  },
];

export const STANDARD_RATE = 21;

/**
 * Kleineondernemersregeling (KOR): a turnover-based exemption. Below EUR 20,000
 * of Dutch turnover a year you may opt in, charge no BTW and file no returns —
 * but you also cannot reclaim voorbelasting.
 */
export const KOR_LIMIT = 20000;

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "nl-NL";

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

/** Share of a bruto price that is tax: tarief / (100 + tarief). */
export function vatFraction(ratePercent) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
  // Scale by however many decimal places the rate actually has (bounded to
  // avoid floating-point noise from very long decimals) instead of a fixed
  // factor of 10, so custom rates with more than one decimal place — e.g.
  // 21.55, or tiny rates like 0.04 — still reduce to an exact fraction
  // rather than being rounded down to one decimal digit first.
  const decimalPart = ratePercent.toFixed(6).replace(/0+$/, "").split(".")[1] || "";
  const scale = 10 ** Math.min(decimalPart.length, 6);
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
 * @param {object} input
 * @param {number} input.amount       figure typed in
 * @param {number} input.ratePercent  BTW rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as netto, "remove" as bruto
 */
export function calculateVat({ amount, ratePercent, mode = "add" } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent)) return { error: "Enter a BTW rate as a number." };
  if (ratePercent < 0) return { error: "The BTW rate cannot be negative." };
  if (ratePercent > MAX_RATE) return { error: `Enter a BTW rate of ${MAX_RATE}% or less.` };
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove BTW." };

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

/** The same netto price at each Dutch rate. */
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
 * Net position for one BTW return period.
 * A positive figure is payable to the Belastingdienst; a negative one is a refund.
 */
export function netBtwPosition({ outputVat, inputVat } = {}) {
  if (!isNum(outputVat) || outputVat < 0) {
    return { error: "Enter the BTW charged on your sales as a positive number." };
  }
  if (!isNum(inputVat) || inputVat < 0) {
    return { error: "Enter your voorbelasting as a positive number." };
  }
  const balance = roundMoney(outputVat - inputVat);
  return {
    outputVat: roundMoney(outputVat),
    inputVat: roundMoney(inputVat),
    balance,
    payable: balance > 0,
    refund: balance < 0 ? Math.abs(balance) : 0,
  };
}

/** KOR eligibility test against the EUR 20,000 turnover limit. */
export function checkKor(turnover) {
  if (!isNum(turnover) || turnover < 0) {
    return { error: "Enter your annual Dutch turnover as a positive number." };
  }
  const eligible = turnover <= KOR_LIMIT;
  return {
    turnover: roundMoney(turnover),
    limit: KOR_LIMIT,
    eligible,
    headroom: roundMoney(KOR_LIMIT - turnover),
  };
}
