/**
 * Polish VAT (podatek od towarów i usług, VAT/PTU) maths.
 *
 * Netto -> brutto:  VAT   = netto x stawka/100 ;  brutto = netto + VAT
 * Brutto -> netto:  netto = brutto / (1 + stawka/100) ;  VAT = brutto - netto
 * The reverse step is the "metoda w stu": at 23% the tax inside a gross price
 * is 23/123 of it.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Statutory Polish rates (ustawa o VAT z 11 marca 2004, art. 41 and art. 146ea). */
export const VAT_RATES = [
  {
    id: "podstawowa",
    label: "Stawka podstawowa",
    rate: 23,
    note: "Default rate for most goods and services. 23% since 1 January 2011.",
  },
  {
    id: "obnizona8",
    label: "Stawka obniżona",
    rate: 8,
    note: "Medicines, hotels and restaurant meals, passenger transport, housing construction, some services.",
  },
  {
    id: "obnizona5",
    label: "Stawka obniżona",
    rate: 5,
    note: "Basic foodstuffs, books and specialist periodicals, baby and hygiene products.",
  },
  {
    id: "zero",
    label: "Stawka 0% / zwolniony",
    rate: 0,
    note: "Exports and intra-EU supplies at 0%; medical, educational and financial services are zwolnione (exempt).",
  },
];

export const STANDARD_RATE = 23;

/**
 * Zwolnienie podmiotowe (art. 113 ustawy o VAT): a small-business exemption
 * for annual sales up to PLN 200,000. Sales are counted excluding tax, and the
 * limit is pro-rated for a business that starts mid-year.
 */
export const EXEMPTION_LIMIT = 200000;

/**
 * Mandatory split payment (mechanizm podzielonej płatności, art. 108a):
 * required when the total invoice amount exceeds PLN 15,000 gross and the
 * invoice covers goods or services listed in załącznik nr 15.
 */
export const SPLIT_PAYMENT_THRESHOLD = 15000;

export const MAX_AMOUNT = 1e12;
export const MAX_RATE = 100;

export const CURRENCY = "PLN";
export const LOCALE = "pl-PL";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole grosze. */
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

/** Share of a gross price that is tax: stawka / (100 + stawka). */
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
    // Informational flag: the value test for mandatory split payment.
    splitPaymentValueTest: gross > SPLIT_PAYMENT_THRESHOLD,
  };
}

/** The same netto price at each Polish rate. */
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
 * Zwolnienie podmiotowe test.
 * @param {number} sales annual sales value, excluding tax
 * @param {number} [monthsTrading] months traded this year, for a mid-year start (1-12)
 */
export function checkExemption(sales, monthsTrading = 12) {
  if (!isNum(sales) || sales < 0) {
    return { error: "Enter your annual sales as a positive number." };
  }
  if (!isNum(monthsTrading) || monthsTrading < 1 || monthsTrading > 12) {
    return { error: "Months trading must be between 1 and 12." };
  }
  // Art. 113 ust. 9: the limit is proportional to the part of the year traded.
  const limit = roundMoney((EXEMPTION_LIMIT * monthsTrading) / 12);
  const eligible = sales <= limit;
  return {
    sales: roundMoney(sales),
    monthsTrading,
    limit,
    fullLimit: EXEMPTION_LIMIT,
    eligible,
    headroom: roundMoney(limit - sales),
  };
}
