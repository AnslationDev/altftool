/**
 * Spanish VAT (IVA - Impuesto sobre el Valor Añadido) maths.
 *
 * Base -> total:  IVA  = base x tipo/100 ;  total = base + IVA
 * Total -> base:  base = total / (1 + tipo/100) ;  IVA = total - base
 *
 * Retailers on the recargo de equivalencia regime are charged a second
 * surcharge on the same base by their supplier, so the invoice total becomes
 *     base x (1 + tipo/100 + recargo/100).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory Spanish rates (Ley 37/1992 del IVA, arts. 90-91). */
export const VAT_RATES = [
  {
    id: "general",
    label: "Tipo general",
    rate: 21,
    // Recargo de equivalencia percentages set by art. 161 Ley 37/1992.
    surcharge: 5.2,
    note: "Default rate for most goods and services. 21% since 1 September 2012.",
  },
  {
    id: "reducido",
    label: "Tipo reducido",
    rate: 10,
    surcharge: 1.4,
    note: "Hospitality and restaurants, passenger transport, hotels, most foodstuffs, glasses and lenses.",
  },
  {
    id: "superreducido",
    label: "Tipo superreducido",
    rate: 4,
    surcharge: 0.5,
    note: "Bread, milk, cheese, eggs, fruit and vegetables, books, newspapers, medicines, disability vehicles.",
  },
  {
    id: "exento",
    label: "Exento / 0%",
    rate: 0,
    surcharge: 0,
    note: "Exports and intra-EU deliveries; also education, medical care and financial services (exempt, no input recovery).",
  },
];

export const STANDARD_RATE = 21;

/** Recargo de equivalencia on tobacco, a special case (art. 161 Ley 37/1992). */
export const TOBACCO_SURCHARGE = 1.75;

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "EUR";
export const LOCALE = "es-ES";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole céntimos. */
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

/** Share of a total that is tax: tipo / (100 + tipo), in lowest terms. */
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
 * @param {number} input.amount            figure typed in
 * @param {number} input.ratePercent       IVA rate, percent
 * @param {"add"|"remove"} input.mode      "add" treats amount as base, "remove" as total
 * @param {number} [input.surchargePercent] recargo de equivalencia, percent (0 if not applicable)
 */
export function calculateVat({ amount, ratePercent, mode = "add", surchargePercent = 0 } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent)) return { error: "Enter an IVA rate as a number." };
  if (ratePercent < 0) return { error: "The IVA rate cannot be negative." };
  if (ratePercent > MAX_RATE) return { error: `Enter an IVA rate of ${MAX_RATE}% or less.` };
  if (!isNum(surchargePercent) || surchargePercent < 0 || surchargePercent > MAX_RATE) {
    return { error: "The recargo de equivalencia must be between 0% and 100%." };
  }
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove IVA." };

  const combined = ratePercent + surchargePercent;
  let net;
  let vat;
  let surcharge;
  let gross;

  if (mode === "add") {
    net = roundMoney(amount);
    vat = roundMoney((net * ratePercent) / 100);
    surcharge = roundMoney((net * surchargePercent) / 100);
    gross = roundMoney(net + vat + surcharge);
  } else {
    gross = roundMoney(amount);
    net = roundMoney(gross / (1 + combined / 100));
    vat = roundMoney((net * ratePercent) / 100);
    // Give any rounding remainder to the surcharge so the invoice reconciles.
    surcharge = roundMoney(gross - net - vat);
    if (surchargePercent === 0) {
      vat = roundMoney(gross - net);
      surcharge = 0;
    }
  }

  return {
    mode,
    ratePercent,
    surchargePercent,
    net,
    vat,
    surcharge,
    gross,
    fraction: vatFraction(ratePercent),
    vatShareOfGross: gross > 0 ? ((vat + surcharge) / gross) * 100 : 0,
  };
}

/** The same base priced at each Spanish rate. */
export function compareRates(netAmount, withSurcharge = false) {
  if (!isNum(netAmount) || netAmount < 0) return [];
  return VAT_RATES.map((band) => {
    const result = calculateVat({
      amount: netAmount,
      ratePercent: band.rate,
      mode: "add",
      surchargePercent: withSurcharge ? band.surcharge : 0,
    });
    return {
      id: band.id,
      label: band.label,
      rate: band.rate,
      surcharge: band.surcharge,
      note: band.note,
      vat: result.error ? null : result.vat,
      surchargeAmount: result.error ? null : result.surcharge,
      gross: result.error ? null : result.gross,
    };
  });
}
