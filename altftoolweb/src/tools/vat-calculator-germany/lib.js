/**
 * German VAT (Umsatzsteuer, commonly Mehrwertsteuer / MwSt) maths.
 *
 * Netto -> brutto:  USt   = netto x Satz/100 ;  brutto = netto + USt
 * Brutto -> netto:  netto = brutto / (1 + Satz/100) ;  USt = brutto - netto
 * The reverse step is often quoted as a fraction of the gross price:
 * at 19% the tax inside a brutto figure is 19/119 of it.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory German rates (§ 12 UStG). */
export const VAT_RATES = [
  {
    id: "standard",
    label: "Regelsteuersatz (standard)",
    rate: 19,
    note: "Most goods and services. 19% since 1 January 2007.",
  },
  {
    id: "reduced",
    label: "Ermäßigter Satz (reduced)",
    rate: 7,
    note: "Groceries, books, newspapers, cut flowers, local public transport, cultural admissions.",
  },
  {
    id: "zero",
    label: "Nullsatz (zero)",
    rate: 0,
    note: "Exports and intra-EU supplies; residential photovoltaic systems since 1 January 2023.",
  },
];

export const STANDARD_RATE = 19;

/**
 * Kleinunternehmerregelung, § 19 UStG as reformed from 1 January 2025:
 * no VAT is charged if turnover stayed at or below EUR 25,000 in the previous
 * calendar year AND does not exceed EUR 100,000 in the current year.
 */
export const KU_PREVIOUS_YEAR_LIMIT = 25000;
export const KU_CURRENT_YEAR_LIMIT = 100000;

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "de-DE";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole cents, the unit a German invoice is issued in. */
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

/** Share of a gross price that is tax: rate / (100 + rate), in lowest terms. */
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
 * @param {number} input.ratePercent  VAT rate, percent
 * @param {"add"|"remove"} input.mode "add" treats amount as netto, "remove" as brutto
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

/** The same netto figure priced at each statutory rate. */
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
 * Kleinunternehmer test under the rules in force from 1 January 2025.
 * Both conditions must hold to stay outside the VAT charge.
 */
export function checkKleinunternehmer({ previousYear, currentYear } = {}) {
  if (!isNum(previousYear) || previousYear < 0) {
    return { error: "Enter last year's turnover as a positive number." };
  }
  if (!isNum(currentYear) || currentYear < 0) {
    return { error: "Enter this year's expected turnover as a positive number." };
  }
  const previousOk = previousYear <= KU_PREVIOUS_YEAR_LIMIT;
  const currentOk = currentYear <= KU_CURRENT_YEAR_LIMIT;
  return {
    previousYear: roundMoney(previousYear),
    currentYear: roundMoney(currentYear),
    previousLimit: KU_PREVIOUS_YEAR_LIMIT,
    currentLimit: KU_CURRENT_YEAR_LIMIT,
    previousOk,
    currentOk,
    eligible: previousOk && currentOk,
    headroom: roundMoney(KU_PREVIOUS_YEAR_LIMIT - previousYear),
  };
}
