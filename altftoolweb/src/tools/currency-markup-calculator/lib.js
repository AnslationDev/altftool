/**
 * Currency conversion markup calculator — pure logic.
 *
 * The mid-market rate is the midpoint between the buy and sell prices of a
 * currency pair on the interbank market. It is the rate quoted by search
 * engines and financial data providers, and nobody at retail actually gets it:
 * providers earn most of their revenue by quoting a slightly worse rate and
 * keeping the difference. That difference is the markup, or spread.
 *
 *   markup %          = (mid - offered) / mid x 100
 *   value at mid      = amount x mid
 *   amount received   = (amount - explicit fees) x offered
 *   true all-in cost  = amount - received / mid          (in the source currency)
 *
 * The last line is the one that matters: it converts everything — the hidden
 * rate spread and the visible fees — back into the currency you started with,
 * which is the only way to compare two providers whose costs are split
 * differently between rate and fee.
 *
 * No rates are fetched or bundled: the mid-market rate is entered by the user,
 * because a hard-coded rate would be wrong within minutes.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Rates outside this band are certainly typos or inverted quotes. */
export const MIN_RATE = 1e-9;
export const MAX_RATE = 1e9;

/** How a rate has been written down. */
export const QUOTE_DIRECTIONS = {
  "per-unit": {
    id: "per-unit",
    label: "Target currency per 1 unit of source",
    describe: (from, to) => `1 ${from} = ? ${to}`,
  },
  inverse: {
    id: "inverse",
    label: "Source currency per 1 unit of target",
    describe: (from, to) => `1 ${to} = ? ${from}`,
  },
};

/** Typical all-in markups seen at retail, for orientation only. Actual spreads
 * vary by pair, amount, channel and time of day. */
export const MARKUP_BENCHMARKS = [
  { id: "specialist", label: "Specialist FX / fintech transfer", lowPercent: 0.3, highPercent: 1 },
  { id: "card", label: "Card payment abroad with conversion", lowPercent: 1, highPercent: 3 },
  { id: "bank", label: "High-street bank transfer", lowPercent: 2, highPercent: 4 },
  { id: "dcc", label: "Dynamic currency conversion at a terminal or ATM", lowPercent: 4, highPercent: 12 },
];

/** Normalise a quoted rate into "target units per 1 source unit". */
export function normaliseRate(rate, direction = "per-unit") {
  if (!isNum(rate)) return { error: "Enter the rate as a number." };
  if (rate <= 0) return { error: "A rate must be greater than zero." };
  if (rate < MIN_RATE || rate > MAX_RATE) {
    return { error: "That rate is outside any plausible range — check which way round it is quoted." };
  }
  if (!QUOTE_DIRECTIONS[direction]) return { error: "Choose which way round the rate is quoted." };
  return { rate: direction === "per-unit" ? rate : 1 / rate };
}

/**
 * Mid-market rate and spread from a dealer's two-way price.
 *
 * @param {number} bid the price at which the dealer buys the base currency
 * @param {number} ask the price at which the dealer sells it
 * @returns {{ mid: number, spread: number, spreadPercent: number } | { error: string }}
 */
export function midFromBidAsk(bid, ask) {
  if (!isNum(bid) || !isNum(ask)) return { error: "Enter both the bid and the ask as numbers." };
  if (bid <= 0 || ask <= 0) return { error: "Bid and ask must both be greater than zero." };
  if (ask < bid) return { error: "The ask should not be below the bid — the two look swapped." };
  const mid = (bid + ask) / 2;
  return { mid, spread: ask - bid, spreadPercent: ((ask - bid) / mid) * 100 };
}

/**
 * Full cost of a conversion at an offered rate, versus the mid-market rate.
 *
 * @param {object} input
 * @param {number} input.amount amount being converted, in the source currency
 * @param {number} input.midRate mid-market rate as quoted
 * @param {number} input.offeredRate the rate you are actually being given
 * @param {string} [input.direction] how both rates are quoted
 * @param {number} [input.fixedFee] explicit fee in the source currency
 * @param {number} [input.percentFee] explicit fee as a % of the amount
 * @returns {object} the cost breakdown, or { error }
 */
export function computeMarkup({
  amount,
  midRate,
  offeredRate,
  direction = "per-unit",
  fixedFee = 0,
  percentFee = 0,
}) {
  if (!isNum(amount) || amount <= 0) return { error: "The amount to convert must be greater than zero." };
  if (!isNum(fixedFee) || fixedFee < 0) return { error: "The fixed fee cannot be negative." };
  if (!isNum(percentFee) || percentFee < 0 || percentFee > 100) {
    return { error: "The percentage fee must be between 0% and 100%." };
  }

  const mid = normaliseRate(midRate, direction);
  if (mid.error) return { error: `Mid-market rate: ${mid.error}` };
  const offered = normaliseRate(offeredRate, direction);
  if (offered.error) return { error: `Offered rate: ${offered.error}` };

  const explicitFees = fixedFee + amount * (percentFee / 100);
  if (explicitFees >= amount) {
    return { error: "The fees are as large as the amount being converted — nothing would be sent." };
  }

  const convertedAmount = amount - explicitFees;
  const received = convertedAmount * offered.rate;
  const valueAtMid = amount * mid.rate;

  if (!Number.isFinite(received) || !Number.isFinite(valueAtMid)) {
    return { error: "Those figures are too large to compute." };
  }

  // Rate markup on its own, ignoring the visible fees.
  const markupPercent = ((mid.rate - offered.rate) / mid.rate) * 100;
  const hiddenCostTarget = convertedAmount * (mid.rate - offered.rate);
  const hiddenCostSource = hiddenCostTarget / mid.rate;

  // Everything expressed back in the source currency.
  const receivedValueInSource = received / mid.rate;
  const totalCostSource = amount - receivedValueInSource;
  const totalCostPercent = (totalCostSource / amount) * 100;

  return {
    amount,
    midRate: mid.rate,
    offeredRate: offered.rate,
    markupPercent,
    explicitFees,
    convertedAmount,
    received,
    valueAtMid,
    shortfallTarget: valueAtMid - received,
    hiddenCostTarget,
    hiddenCostSource,
    feeCostSource: explicitFees,
    totalCostSource,
    totalCostPercent,
    /** The single rate that would produce the same outcome with no fees. */
    effectiveAllInRate: received / amount,
    betterThanMid: offered.rate > mid.rate,
  };
}

/**
 * The rate a provider must offer to match a rival's all-in outcome, given its
 * own fee structure. Derived from received = (amount - fees) x rate.
 *
 * @param {object} input
 * @param {number} input.targetReceived the amount to match, in the target currency
 * @param {number} input.amount amount being converted
 * @param {number} [input.fixedFee]
 * @param {number} [input.percentFee]
 * @returns {{ requiredRate: number } | { error: string }}
 */
export function breakEvenRate({ targetReceived, amount, fixedFee = 0, percentFee = 0 }) {
  if (!isNum(targetReceived) || targetReceived <= 0) return { error: "Enter the amount to match." };
  if (!isNum(amount) || amount <= 0) return { error: "Enter the amount being converted." };
  if (!isNum(fixedFee) || fixedFee < 0) return { error: "The fixed fee cannot be negative." };
  if (!isNum(percentFee) || percentFee < 0 || percentFee > 100) {
    return { error: "The percentage fee must be between 0% and 100%." };
  }
  const net = amount - fixedFee - amount * (percentFee / 100);
  if (net <= 0) return { error: "The fees consume the whole amount, so no rate can match it." };
  return { requiredRate: targetReceived / net };
}

/**
 * Rank competing quotes by what actually arrives.
 *
 * @param {Array<object>} quotes [{ name, offeredRate, direction, fixedFee, percentFee }]
 * @param {object} context { amount, midRate, direction }
 * @returns {Array<object>} best first
 */
export function compareQuotes(quotes, { amount, midRate, direction = "per-unit" }) {
  if (!Array.isArray(quotes)) return [];
  const rows = [];
  for (const quote of quotes) {
    const result = computeMarkup({
      amount,
      midRate,
      offeredRate: quote.offeredRate,
      direction: quote.direction ?? direction,
      fixedFee: quote.fixedFee ?? 0,
      percentFee: quote.percentFee ?? 0,
    });
    if (result.error) {
      rows.push({ name: quote.name, error: result.error });
      continue;
    }
    rows.push({
      name: quote.name,
      received: result.received,
      totalCostSource: result.totalCostSource,
      totalCostPercent: result.totalCostPercent,
      markupPercent: result.markupPercent,
      effectiveAllInRate: result.effectiveAllInRate,
    });
  }
  const valid = rows.filter((row) => !row.error).sort((a, b) => b.received - a.received);
  const invalid = rows.filter((row) => row.error);
  if (valid.length > 0) {
    const best = valid[0].received;
    for (const row of valid) row.lossVersusBest = best - row.received;
  }
  return [...valid, ...invalid];
}
