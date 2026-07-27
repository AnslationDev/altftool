/**
 * Stamp paper denomination splitter.
 *
 * Non-judicial stamp paper in India is printed by the India Security Press,
 * Nashik in a fixed ladder of face values. An instrument has to carry stamp
 * duty of AT LEAST the amount chargeable — under section 35 of the Indian
 * Stamp Act, 1899 an insufficiently stamped instrument is not admissible in
 * evidence until the deficit duty and penalty are made good. Paying more than
 * the duty is legal but the excess is not refunded, so the practical problem is
 * "which sheets add up to the duty with the fewest pieces of paper and the
 * least overshoot".
 *
 * That is an unbounded coin-change problem, solved here exactly by dynamic
 * programming rather than by a greedy split (greedy is not provably optimal on
 * this ladder because 15000 / 20000 / 25000 are not multiples of each other).
 */

/**
 * Every face value of non-judicial stamp paper printed in India, in rupees.
 * Source: India Security Press denomination ladder (Re.1 up to Rs.25,000).
 */
export const STAMP_DENOMINATIONS = [
  1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000, 15000, 20000, 25000,
];

/**
 * The values vendors realistically stock today. The sub-Rs.10 papers are
 * still legal tender for duty but have been withdrawn from most counters.
 */
export const DEFAULT_DENOMINATIONS = [
  10, 20, 50, 100, 500, 1000, 5000, 10000, 15000, 20000, 25000,
];

/**
 * Physical stamp paper stops being practical well before this; duty larger
 * than this is normally paid by e-stamp certificate (SHCIL) or by franking /
 * challan, where any exact amount can be issued on a single certificate.
 */
export const MAX_DUTY = 2500000;

/** Guard on the size of the DP table so the calculation stays instant. */
export const MAX_DP_UNITS = 320000;

const INF = 0x7fffffff;

/** Greatest common divisor of two non-negative integers. */
export function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/** Greatest common divisor of a list; returns 0 for an empty list. */
export function gcdOf(values) {
  return values.reduce((acc, value) => gcd(acc, value), 0);
}

/**
 * Split a stamp duty amount into stamp paper sheets.
 *
 * @param {object} input
 * @param {number} input.duty            Stamp duty payable, in rupees.
 * @param {number[]} [input.denominations] Face values available at the vendor.
 * @returns {object} sheet breakdown, or { error } for unusable input.
 */
export function splitStampDuty({ duty, denominations = DEFAULT_DENOMINATIONS } = {}) {
  const amount = Number(duty);
  if (!Number.isFinite(amount)) {
    return { error: "Enter the stamp duty payable as a number." };
  }
  if (amount <= 0) {
    return { error: "Stamp duty must be greater than zero." };
  }
  if (amount > MAX_DUTY) {
    return {
      error:
        "Duty above Rs.25,00,000 is not issued on physical stamp paper — use an e-stamp certificate, franking or a treasury challan for the exact amount.",
    };
  }

  const values = Array.from(new Set((denominations || []).map(Number)))
    .filter((value) => Number.isFinite(value) && Number.isInteger(value) && value > 0)
    .sort((a, b) => b - a);

  if (values.length === 0) {
    return { error: "Select at least one stamp paper denomination that your vendor stocks." };
  }

  // Every reachable total is a multiple of the gcd of the available face
  // values, so work in units of that step instead of in single rupees.
  const step = gcdOf(values);
  const unitValues = values.map((value) => value / step);
  const maxUnit = unitValues[0];

  // Target rounded up to the nearest reachable step, then extended by one
  // maximum denomination: some multiple of the largest sheet always lands in
  // that window, so a reachable total at or above the duty is guaranteed.
  const target = Math.ceil(amount / step);
  const tableSize = target + maxUnit;
  if (tableSize > MAX_DP_UNITS) {
    return {
      error:
        "That combination of amount and denominations is too fine-grained to solve — remove the very small face values or reduce the duty.",
    };
  }

  const best = new Int32Array(tableSize + 1).fill(INF);
  const pick = new Int32Array(tableSize + 1).fill(-1);
  best[0] = 0;

  for (let i = 1; i <= tableSize; i += 1) {
    for (let k = 0; k < unitValues.length; k += 1) {
      const d = unitValues[k];
      if (d > i) continue;
      const previous = best[i - d];
      if (previous !== INF && previous + 1 < best[i]) {
        best[i] = previous + 1;
        pick[i] = k;
      }
    }
  }

  // First total at or above the duty that can actually be assembled.
  let chosen = -1;
  for (let i = target; i <= tableSize; i += 1) {
    if (best[i] !== INF) {
      chosen = i;
      break;
    }
  }
  if (chosen < 0) {
    return { error: "No combination of the selected denominations can cover that amount." };
  }

  const counts = new Map();
  let cursor = chosen;
  while (cursor > 0) {
    const k = pick[cursor];
    if (k < 0) break;
    const faceValue = values[k];
    counts.set(faceValue, (counts.get(faceValue) || 0) + 1);
    cursor -= unitValues[k];
  }

  const sheets = Array.from(counts.entries())
    .map(([value, count]) => ({ value, count, subtotal: value * count }))
    .sort((a, b) => b.value - a.value);

  const payable = chosen * step;
  const totalSheets = sheets.reduce((sum, row) => sum + row.count, 0);

  return {
    duty: amount,
    payable,
    excess: payable - amount,
    exact: payable === amount,
    totalSheets,
    sheets,
    largestSheet: sheets.length ? sheets[0].value : 0,
    step,
    denominations: values.slice().sort((a, b) => a - b),
  };
}

/**
 * Cost of buying the sheets. Stamp vendors sell at face value; their statutory
 * commission is paid by the government, not added to the buyer's bill. Some
 * counters do charge a separate writing/typing fee, which is taken here as an
 * explicit per-sheet input rather than assumed.
 */
export function stampPurchaseCost({ payable, totalSheets, perSheetServiceFee = 0 }) {
  const face = Number(payable);
  const sheets = Number(totalSheets);
  const fee = Number(perSheetServiceFee);
  if (!Number.isFinite(face) || face < 0) return { error: "Face value must be a positive number." };
  if (!Number.isFinite(sheets) || sheets < 0) return { error: "Sheet count must be a positive number." };
  if (!Number.isFinite(fee) || fee < 0) return { error: "Service fee per sheet cannot be negative." };
  const serviceTotal = sheets * fee;
  return { faceValue: face, serviceTotal, grandTotal: face + serviceTotal };
}
