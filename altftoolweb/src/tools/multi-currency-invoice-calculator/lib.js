/**
 * Multi-currency invoice total calculator — pure logic.
 *
 * An invoice with lines priced in different currencies has exactly one honest
 * total: every line converted at a stated rate, on a stated date, into one
 * settlement currency. The two things that go wrong are the direction of the
 * quote and the rounding.
 *
 * Quote direction:
 *   "per unit"  rate = units of settlement currency for 1 unit of line currency
 *               converted = amount x rate            (e.g. 1 USD = 83.50 INR)
 *   "inverse"   rate = units of line currency for 1 unit of settlement currency
 *               converted = amount / rate            (e.g. 1 INR = 0.01198 USD)
 *
 * Rounding: each converted line is rounded to the settlement currency's ISO 4217
 * minor units before being summed, which is how accounting systems post them and
 * why a spreadsheet that rounds only the total drifts by a cent or two.
 *
 * No rates are fetched or bundled. Rates are entered by the user, because a
 * stale hard-coded rate is worse than no rate at all.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** ISO 4217 minor-unit exponents for the currencies offered here.
 * JPY has no minor unit; KWD and BHD have three. */
export const CURRENCY_DECIMALS = {
  USD: 2, EUR: 2, GBP: 2, INR: 2, AUD: 2, CAD: 2, SGD: 2, AED: 2,
  CHF: 2, ZAR: 2, NZD: 2, SEK: 2, NOK: 2, PLN: 2, MXN: 2, BRL: 2,
  CNY: 2, HKD: 2, MYR: 2, PHP: 2, THB: 2, IDR: 2, NGN: 2, KES: 2,
  JPY: 0, KRW: 0, VND: 0,
  KWD: 3, BHD: 3, OMR: 3,
};

export const CURRENCY_CODES = Object.keys(CURRENCY_DECIMALS).sort();

/** Locale hints so amounts group the way each market expects. */
export const CURRENCY_LOCALES = {
  INR: "en-IN", GBP: "en-GB", EUR: "en-IE", JPY: "ja-JP", CNY: "zh-CN",
  AED: "en-AE", SGD: "en-SG", AUD: "en-AU", CAD: "en-CA", CHF: "de-CH",
};

/** How a rate has been written down. */
export const QUOTE_DIRECTIONS = {
  "per-unit": {
    id: "per-unit",
    label: "Settlement currency per 1 unit of line currency",
    describe: (from, to) => `1 ${from} = ? ${to}`,
  },
  inverse: {
    id: "inverse",
    label: "Line currency per 1 unit of settlement currency",
    describe: (from, to) => `1 ${to} = ? ${from}`,
  },
};

/** A rate outside this band is almost certainly a typo or an inverted quote. */
export const MIN_RATE = 1e-9;
export const MAX_RATE = 1e9;

/** Decimals for a currency, defaulting to the ISO 4217 majority of 2. */
export function decimalsFor(code) {
  return CURRENCY_DECIMALS[code] ?? 2;
}

/** Round to a currency's minor units without float drift on .005 cases. */
export function roundToCurrency(value, code) {
  const factor = Math.pow(10, decimalsFor(code));
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Convert one amount into the settlement currency.
 *
 * @param {object} input
 * @param {number} input.amount amount in the line currency
 * @param {number} input.rate the quoted rate
 * @param {string} input.direction key of QUOTE_DIRECTIONS
 * @param {string} input.toCurrency settlement currency, for rounding
 * @returns {{ converted: number, effectiveRate: number } | { error: string }}
 */
export function convertAmount({ amount, rate, direction = "per-unit", toCurrency = "USD" }) {
  if (!isNum(amount)) return { error: "Enter the line amount as a number." };
  if (amount < 0) return { error: "Line amounts cannot be negative." };
  if (!QUOTE_DIRECTIONS[direction]) return { error: "Choose which way round the rate is quoted." };
  if (!isNum(rate)) return { error: "Enter the exchange rate as a number." };
  if (rate <= 0) return { error: "An exchange rate must be greater than zero." };
  if (rate < MIN_RATE || rate > MAX_RATE) {
    return { error: "That exchange rate is outside any plausible range — check the direction of the quote." };
  }

  const effectiveRate = direction === "per-unit" ? rate : 1 / rate;
  const converted = amount * effectiveRate;
  if (!Number.isFinite(converted)) return { error: "That conversion is too large to compute." };

  return { converted: roundToCurrency(converted, toCurrency), effectiveRate };
}

/**
 * The implied rate between two currencies that are both quoted against the
 * settlement currency. Cross rate A/B = (A per settlement) / (B per settlement).
 *
 * @param {number} rateA settlement units per 1 unit of A
 * @param {number} rateB settlement units per 1 unit of B
 * @returns {{ cross: number } | { error: string }}
 */
export function crossRate(rateA, rateB) {
  if (!isNum(rateA) || !isNum(rateB)) return { error: "Both rates must be numbers." };
  if (rateA <= 0 || rateB <= 0) return { error: "Rates must be greater than zero." };
  return { cross: rateA / rateB };
}

/**
 * Total a multi-currency invoice.
 *
 * @param {object} input
 * @param {Array<object>} input.lines [{ description, amount, currency, rate, direction, taxable }]
 * @param {string} input.settlementCurrency
 * @param {number} [input.taxPercent] applied to taxable lines after conversion
 * @param {number} [input.bankFeePercent] the spread your bank or gateway adds on settlement
 * @param {number} [input.fixedFee] a flat transfer fee in the settlement currency
 * @returns {object} totals, or { error }
 */
export function computeMultiCurrencyInvoice({
  lines,
  settlementCurrency = "USD",
  taxPercent = 0,
  bankFeePercent = 0,
  fixedFee = 0,
}) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { error: "Add at least one invoice line." };
  }
  if (!CURRENCY_DECIMALS[settlementCurrency]) {
    return { error: "Choose a supported settlement currency." };
  }
  if (!isNum(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "The tax rate must be between 0% and 100%." };
  }
  if (!isNum(bankFeePercent) || bankFeePercent < 0 || bankFeePercent > 100) {
    return { error: "The bank spread must be between 0% and 100%." };
  }
  if (!isNum(fixedFee) || fixedFee < 0) return { error: "The fixed fee cannot be negative." };

  const converted = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const sameCurrency = line.currency === settlementCurrency;
    const result = convertAmount({
      amount: line.amount,
      rate: sameCurrency ? 1 : line.rate,
      direction: sameCurrency ? "per-unit" : line.direction,
      toCurrency: settlementCurrency,
    });
    if (result.error) return { error: `Line ${i + 1}: ${result.error}` };
    converted.push({
      description: line.description ?? "",
      amount: line.amount,
      currency: line.currency,
      rate: sameCurrency ? 1 : line.rate,
      direction: sameCurrency ? "per-unit" : line.direction,
      effectiveRate: result.effectiveRate,
      converted: result.converted,
      taxable: line.taxable !== false,
    });
  }

  const subtotal = roundToCurrency(
    converted.reduce((sum, line) => sum + line.converted, 0),
    settlementCurrency,
  );
  const taxableBase = roundToCurrency(
    converted.reduce((sum, line) => sum + (line.taxable ? line.converted : 0), 0),
    settlementCurrency,
  );
  const tax = roundToCurrency(taxableBase * (taxPercent / 100), settlementCurrency);
  const invoiceTotal = roundToCurrency(subtotal + tax, settlementCurrency);

  const bankSpread = roundToCurrency(invoiceTotal * (bankFeePercent / 100), settlementCurrency);
  const netReceived = roundToCurrency(invoiceTotal - bankSpread - fixedFee, settlementCurrency);

  // Share of the invoice that carries currency risk (anything not already in
  // the settlement currency).
  const foreignValue = converted.reduce(
    (sum, line) => sum + (line.currency === settlementCurrency ? 0 : line.converted),
    0,
  );

  return {
    settlementCurrency,
    lines: converted,
    subtotal,
    taxableBase,
    tax,
    invoiceTotal,
    bankSpread,
    fixedFee,
    netReceived,
    foreignValue: roundToCurrency(foreignValue, settlementCurrency),
    foreignSharePercent: invoiceTotal > 0 ? (foreignValue / invoiceTotal) * 100 : 0,
    currencyCount: new Set(converted.map((line) => line.currency)).size,
  };
}

/**
 * How much the total moves if every foreign line's rate shifts by a percentage.
 * Useful for sizing the risk between raising an invoice and being paid.
 *
 * @param {object} input same shape as computeMultiCurrencyInvoice
 * @param {Array<number>} shifts percentage moves to test, e.g. [-5, -2, 2, 5]
 * @returns {Array<{ shiftPercent: number, invoiceTotal: number, delta: number }>}
 */
export function buildSensitivity(input, shifts = [-5, -2, 0, 2, 5]) {
  const base = computeMultiCurrencyInvoice(input);
  if (base.error) return [];
  const rows = [];
  for (const shiftPercent of shifts) {
    if (!isNum(shiftPercent)) continue;
    const factor = 1 + shiftPercent / 100;
    if (factor <= 0) continue;
    const shifted = computeMultiCurrencyInvoice({
      ...input,
      lines: input.lines.map((line) =>
        line.currency === input.settlementCurrency
          ? line
          : {
              ...line,
              rate: line.direction === "inverse" ? line.rate / factor : line.rate * factor,
            },
      ),
    });
    if (shifted.error) continue;
    rows.push({
      shiftPercent,
      invoiceTotal: shifted.invoiceTotal,
      delta: roundToCurrency(shifted.invoiceTotal - base.invoiceTotal, input.settlementCurrency),
    });
  }
  return rows;
}
