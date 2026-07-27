/**
 * Cash rounding and denomination breakdown for Indian rupee payouts.
 *
 * Two independent steps:
 *  1. ROUNDING. Coins below ₹1 are no longer practical for counter payments —
 *     coins of 25 paise and below ceased to be legal tender on 30 June 2011, and
 *     the 50 paise coin, though still legal tender, is rarely available. Cash is
 *     therefore rounded to a whole rupee or to a coarser step (₹5, ₹10, ₹50, ₹100)
 *     when a payout has to be made in notes alone. The rounding difference is
 *     reported so it can be posted to a rounding-off account.
 *  2. DENOMINATION SPLIT. The fewest pieces are found with a minimum-coin dynamic
 *     program, not simple largest-first greed, so the answer stays correct even when
 *     some denominations are switched off (largest-first fails on, say, ₹600 when only
 *     ₹500 and ₹200 are available, while the dynamic program returns three ₹200 notes).
 *
 * Denominations are the Reserve Bank of India series in circulation: banknotes of
 * ₹10, ₹20, ₹50, ₹100, ₹200 and ₹500, plus circulating coins of ₹1, ₹2, ₹5, ₹10 and ₹20.
 * The ₹2000 note was withdrawn from circulation on 19 May 2023 — it remains legal
 * tender but is no longer issued, so it is listed and switched off by default.
 */

/** Highest amount the tool will break down, to keep the run time and the piece counts sane. */
export const MAX_AMOUNT = 50000000; // ₹5 crore
/** Above this many reduced units the dynamic program is skipped for a largest-first pass. */
const DP_LIMIT = 200000;

/** Value in rupees, the form it circulates in, and whether the RBI still issues it. */
export const DENOMINATIONS = [
  { value: 2000, kind: "note", label: "₹2000", form: "Note (withdrawn 2023)", inIssue: false },
  { value: 500, kind: "note", label: "₹500", form: "Note", inIssue: true },
  { value: 200, kind: "note", label: "₹200", form: "Note", inIssue: true },
  { value: 100, kind: "note", label: "₹100", form: "Note", inIssue: true },
  { value: 50, kind: "note", label: "₹50", form: "Note", inIssue: true },
  { value: 20, kind: "note", label: "₹20", form: "Note or coin", inIssue: true },
  { value: 10, kind: "note", label: "₹10", form: "Note or coin", inIssue: true },
  { value: 5, kind: "coin", label: "₹5", form: "Coin", inIssue: true },
  { value: 2, kind: "coin", label: "₹2", form: "Coin", inIssue: true },
  { value: 1, kind: "coin", label: "₹1", form: "Coin", inIssue: true },
];

/** Denomination values that are switched on when the page first loads. */
export const DEFAULT_VALUES = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export const ROUNDING_STEPS = [1, 5, 10, 50, 100];
export const ROUNDING_MODES = ["nearest", "up", "down"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/**
 * Round a rupee amount to a cash-payable figure.
 *
 * @param {number} amount
 * @param {number} step  one of ROUNDING_STEPS
 * @param {"nearest"|"up"|"down"} mode
 * @returns {{ rounded: number, difference: number }|{ error: string }}
 *          difference is rounded minus original: positive means the payer gives extra.
 */
export function roundCash(amount, step = 1, mode = "nearest") {
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (!isNum(step) || step <= 0) return { error: "The rounding step must be greater than zero." };
  if (!ROUNDING_MODES.includes(mode)) return { error: "Choose a valid rounding mode." };

  // Work in paise so 0.1-style binary error cannot shift a value across the midpoint.
  const paise = Math.round(amount * 100);
  const stepPaise = Math.round(step * 100);
  let unitsPaise;
  if (mode === "up") unitsPaise = Math.ceil(paise / stepPaise) * stepPaise;
  else if (mode === "down") unitsPaise = Math.floor(paise / stepPaise) * stepPaise;
  else unitsPaise = Math.round(paise / stepPaise) * stepPaise;

  const rounded = unitsPaise / 100;
  return { rounded, difference: (unitsPaise - paise) / 100 };
}

/**
 * Fewest notes and coins for a whole-rupee amount.
 *
 * @param {number} amount        whole rupees
 * @param {number[]} values      available denomination values, any order
 * @returns {object} { pieces, totalPieces, remainder, exact, method } or { error }
 */
export function splitDenominations(amount, values = DEFAULT_VALUES) {
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (amount < 0) return { error: "The amount to pay out cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount of ₹5,00,00,000 or less." };

  const denoms = [...new Set((values || []).filter((v) => isNum(v) && v > 0).map(Math.floor))].sort(
    (a, b) => b - a,
  );
  if (denoms.length === 0) return { error: "Select at least one note or coin." };

  const target = Math.round(amount);
  if (target === 0) {
    return { pieces: [], totalPieces: 0, remainder: 0, exact: true, method: "exact" };
  }

  // Reduce by the greatest common divisor so notes-only sets run 10x to 100x smaller.
  const g = denoms.reduce((acc, d) => gcd(acc, d), 0);
  const counts = new Map();
  let working = target;

  if (target % g !== 0) {
    // Not payable to the rupee with this set — pay the largest possible and report the rest.
    working = target - (target % g);
  }

  let reduced = working / g;
  const reducedDenoms = denoms.map((d) => d / g);
  const largest = reducedDenoms[0];

  // For any amount above largest^2, an optimal solution must use the largest piece:
  // the non-largest pieces in an optimal solution number at most `largest` (pigeonhole on
  // partial sums modulo `largest`), so their value is under largest^2. Peeling those off
  // first keeps the dynamic program small without changing the optimum.
  let bulk = 0;
  if (reduced > DP_LIMIT) {
    bulk = Math.max(0, Math.floor((reduced - largest * largest) / largest));
    reduced -= bulk * largest;
  }

  let method = "exact";
  if (reduced > DP_LIMIT) {
    // Very large payout: fall back to largest-first, which is optimal for the standard
    // RBI denominations because that set is canonical.
    method = "greedy";
    for (const d of reducedDenoms) {
      const n = Math.floor(reduced / d);
      if (n > 0) {
        counts.set(d * g, (counts.get(d * g) || 0) + n);
        reduced -= n * d;
      }
    }
  } else {
    const best = new Int32Array(reduced + 1).fill(-1);
    const pick = new Int32Array(reduced + 1).fill(-1);
    best[0] = 0;
    for (let i = 1; i <= reduced; i += 1) {
      for (const d of reducedDenoms) {
        if (d > i) continue;
        const prev = best[i - d];
        if (prev >= 0 && (best[i] < 0 || prev + 1 < best[i])) {
          best[i] = prev + 1;
          pick[i] = d;
        }
      }
    }
    if (best[reduced] < 0) {
      // The reduced amount is a multiple of the gcd yet still unreachable (possible with
      // gapped custom sets) — take largest-first and leave the rest as a remainder.
      method = "greedy";
      for (const d of reducedDenoms) {
        const n = Math.floor(reduced / d);
        if (n > 0) {
          counts.set(d * g, (counts.get(d * g) || 0) + n);
          reduced -= n * d;
        }
      }
    } else {
      let i = reduced;
      while (i > 0) {
        const d = pick[i];
        counts.set(d * g, (counts.get(d * g) || 0) + 1);
        i -= d;
      }
      reduced = 0;
    }
  }

  if (bulk > 0) counts.set(largest * g, (counts.get(largest * g) || 0) + bulk);

  const pieces = [...counts.entries()]
    .map(([value, count]) => ({ value, count, subtotal: value * count }))
    .sort((a, b) => b.value - a.value);

  const paid = pieces.reduce((sum, p) => sum + p.subtotal, 0);
  const totalPieces = pieces.reduce((sum, p) => sum + p.count, 0);

  return {
    pieces,
    totalPieces,
    remainder: target - paid,
    exact: target - paid === 0,
    method,
  };
}

/**
 * Round an amount, break it into pieces, and multiply up for identical packets.
 *
 * @param {object} input
 * @param {number} input.amount     amount per packet, in rupees
 * @param {number} [input.packets]  how many identical envelopes to prepare
 * @param {number} [input.step]     rounding step in rupees
 * @param {"nearest"|"up"|"down"} [input.mode]
 * @param {number[]} [input.values] denominations available
 */
export function buildPayout({ amount, packets = 1, step = 1, mode = "nearest", values = DEFAULT_VALUES } = {}) {
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (amount < 0) return { error: "The amount to pay out cannot be negative." };
  if (!isNum(packets) || packets < 1) return { error: "Prepare at least one packet." };
  if (packets > 10000) return { error: "Enter 10,000 packets or fewer." };

  const rounding = roundCash(amount, step, mode);
  if (rounding.error) return { error: rounding.error };

  const split = splitDenominations(rounding.rounded, values);
  if (split.error) return { error: split.error };

  const count = Math.floor(packets);
  return {
    original: amount,
    rounded: rounding.rounded,
    roundingDifference: rounding.difference,
    packets: count,
    perPacket: split,
    totalCash: rounding.rounded * count,
    totalPieces: split.totalPieces * count,
    grandPieces: split.pieces.map((p) => ({
      value: p.value,
      count: p.count * count,
      subtotal: p.subtotal * count,
    })),
    remainder: split.remainder,
    exact: split.exact,
    method: split.method,
  };
}
