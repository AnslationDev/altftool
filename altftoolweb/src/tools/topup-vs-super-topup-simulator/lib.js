/**
 * Top-up vs Super Top-up Deductible Simulator — pure computation layer.
 *
 * RULE IMPLEMENTED
 * ----------------
 * 1. Standard definition of "Deductible", from the IRDAI Guidelines on
 *    Standardisation in Health Insurance (Ref. IRDA/HLT/REG/CIR/146/07/2016,
 *    dated 29 July 2016), as reproduced in current standard policy wordings:
 *
 *      "Deductible means a cost sharing requirement under a health insurance
 *       policy that provides that the insurer will not be liable for a
 *       specified rupee amount in case of indemnity policies ... which will
 *       apply before any benefits are payable by the insurer. A deductible
 *       does not reduce the Sum Insured."
 *
 *    Two consequences are load-bearing here:
 *      (a) the deductible bites BEFORE the upper layer pays anything, and
 *      (b) the deductible does NOT eat into the top-up sum insured — the full
 *          top-up sum insured sits above the deductible line.
 *
 * 2. Whether that "specified rupee amount" is measured PER CLAIM or on the
 *    AGGREGATE of the policy year is not a regulatory choice — it is stated on
 *    the policy schedule, and it is the only structural difference between the
 *    two products sold in the Indian retail market:
 *
 *      TOP-UP        deductible applies to EACH claim separately. Only the part
 *                    of that ONE claim above the deductible is payable. A claim
 *                    smaller than the deductible pays nothing, however many
 *                    such claims occur in the year.
 *
 *      SUPER TOP-UP  deductible applies to the AGGREGATE of all admissible
 *                    claims in the policy year. Once cumulative claims cross
 *                    the deductible, everything above it is payable regardless
 *                    of how small the individual claims were.
 *
 *    Both readings are of the same clause; only the basis of measurement moves.
 *
 * 3. Indemnity principle: the total paid across the base policy and the upper
 *    layer can never exceed the claim itself. This only binds when a user sets
 *    a deductible SMALLER than the base sum insured (an unusual schedule); with
 *    the common deductible = base sum insured it never binds.
 *
 * SETTLEMENT ORDER MODELLED
 * -------------------------
 * The base policy pays first, up to its remaining sum insured. Whatever the
 * claim leaves unpaid is then tested against the deductible under each
 * structure. Claims count toward the aggregate deductible whether they were met
 * by the base policy or borne by the insured — that is why a deductible set
 * equal to the base sum insured is the standard pairing.
 *
 * Sums insured are annual: both the base and the upper layer deplete across the
 * policy year and are not reinstated here. Restore/refill benefits, sub-limits,
 * copays, room rent caps, waiting periods and non-payables are NOT modelled;
 * "claim" here means the admissible amount after all of those.
 *
 * This module computes on numbers the user supplies. It does not read,
 * interpret or represent any particular insurance contract, and it states no
 * view on which structure a person should buy.
 */

/** Date the standard definition and market schedules above were read. */
export const RULE_AS_OF = "2026-07-29";

/** Citation surfaced in the UI beside the result. */
export const RULE_SOURCE =
  'Standard definition of "Deductible", IRDAI Guidelines on Standardisation in Health Insurance (Ref. IRDA/HLT/REG/CIR/146/07/2016, 29 July 2016), as reproduced in standard policy wordings. Whether the deductible is measured per claim or on the policy-year aggregate is stated on the policy schedule.';

/**
 * Upper guard on any rupee input. Rs 100 crore. Past this the user has almost
 * certainly typed extra zeros, and a confident answer would be worse than none.
 */
export const MAX_MONEY = 1_000_000_000;

/**
 * Upper guard on the number of hospitalisations entered for one policy year.
 * Twenty-four separate admissions in twelve months is already far outside
 * anything a retail indemnity policy sees; beyond it the input is not a year.
 */
export const MAX_CLAIMS = 24;

/**
 * The commonest retail pairing on Indian schedules: deductible set equal to the
 * base sum insured, so the base policy is expected to absorb the deductible.
 * A market convention observed on policy schedules, not a regulatory figure —
 * used only as a starting value, never hard-coded into the arithmetic.
 */
export const COMMON_DEDUCTIBLE_EQUALS_BASE = true;

function parseMoney(value, label, { allowZero = true } = {}) {
  if (value === "" || value === null || value === undefined) {
    return allowZero ? 0 : { error: `${label} is required.` };
  }
  const num =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(num)) return { error: `${label} must be a number.` };
  if (num < 0) return { error: `${label} cannot be negative.` };
  if (num > MAX_MONEY) {
    return { error: `${label} looks unrealistic — keep it at or below Rs 100 crore.` };
  }
  return Math.round(num * 100) / 100;
}

function isErr(v) {
  return v !== null && typeof v === "object" && typeof v.error === "string";
}

/**
 * Portion of one claim that lies above an AGGREGATE deductible line, given how
 * much claim value the year had already accumulated before it.
 *
 * cumulativeBefore .. cumulativeBefore + claim is the slice this claim occupies
 * on the year's cumulative axis; the payable part is whatever of that slice
 * sits above `deductible`.
 */
function sliceAboveAggregate(cumulativeBefore, claim, deductible) {
  const after = cumulativeBefore + claim;
  return Math.max(after - deductible, 0) - Math.max(cumulativeBefore - deductible, 0);
}

/**
 * Run a policy year of claims through a base policy plus an upper layer, under
 * both deductible bases, and return the claim-by-claim waterfall.
 *
 * @param {object} input
 * @param {number|string} input.baseSumInsured   Annual sum insured of the base policy (0 = no base policy).
 * @param {number|string} input.topUpSumInsured  Annual sum insured of the top-up / super top-up layer.
 * @param {number|string} input.deductible       The deductible printed on the upper layer's schedule.
 * @param {Array<number|string>} input.claims    Admissible claim amounts in the policy year, in order of occurrence.
 * @returns {object} Result, or { error } with a plain-language reason.
 */
export function computeTopUpComparison(input = {}) {
  const baseSumInsured = parseMoney(input.baseSumInsured, "Base sum insured");
  if (isErr(baseSumInsured)) return baseSumInsured;

  const topUpSumInsured = parseMoney(input.topUpSumInsured, "Top-up sum insured");
  if (isErr(topUpSumInsured)) return topUpSumInsured;

  const deductible = parseMoney(input.deductible, "Deductible");
  if (isErr(deductible)) return deductible;

  const rawClaims = Array.isArray(input.claims) ? input.claims : [];
  const entered = rawClaims.filter(
    (c) => !(c === "" || c === null || c === undefined),
  );
  if (entered.length === 0) {
    return { error: "Enter at least one claim amount for the policy year." };
  }
  if (entered.length > MAX_CLAIMS) {
    return {
      error: `That is more than ${MAX_CLAIMS} hospitalisations in one policy year — check the list.`,
    };
  }

  const claims = [];
  for (let i = 0; i < entered.length; i += 1) {
    const amount = parseMoney(entered[i], `Claim ${i + 1}`);
    if (isErr(amount)) return amount;
    if (amount <= 0) return { error: `Claim ${i + 1} must be more than zero.` };
    claims.push(amount);
  }

  const totalClaims = claims.reduce((a, b) => a + b, 0);
  if (totalClaims > MAX_MONEY) {
    return { error: "Total claims for the year exceed Rs 100 crore — check the amounts." };
  }

  let baseLeft = baseSumInsured;
  let topUpLeft = topUpSumInsured; // per-claim deductible basis
  let superLeft = topUpSumInsured; // aggregate deductible basis
  let cumulative = 0; // claim value accumulated before the current claim

  const rows = [];
  let basePaidTotal = 0;
  let topUpPaidTotal = 0;
  let superPaidTotal = 0;
  let topUpOutOfPocket = 0;
  let superOutOfPocket = 0;
  let topUpBelowDeductible = 0; // claim value the per-claim deductible line sits over
  let crossingClaimIndex = null; // 1-based claim on which the aggregate deductible is crossed

  for (let i = 0; i < claims.length; i += 1) {
    const claim = claims[i];

    // Base policy pays first, capped by what is left of its annual sum insured.
    const basePays = Math.min(claim, baseLeft);
    baseLeft -= basePays;
    basePaidTotal += basePays;
    const unpaidAfterBase = claim - basePays;

    // TOP-UP: deductible re-applies to this single claim.
    const topUpEligible = Math.max(claim - deductible, 0);
    const topUpPays = Math.min(topUpEligible, unpaidAfterBase, topUpLeft);
    topUpLeft -= topUpPays;
    topUpPaidTotal += topUpPays;
    const topUpOop = claim - basePays - topUpPays;
    topUpOutOfPocket += topUpOop;
    topUpBelowDeductible += Math.min(claim, deductible);

    // SUPER TOP-UP: deductible measured on the year's running total.
    const superEligible = sliceAboveAggregate(cumulative, claim, deductible);
    const superPays = Math.min(superEligible, unpaidAfterBase, superLeft);
    superLeft -= superPays;
    superPaidTotal += superPays;
    const superOop = claim - basePays - superPays;
    superOutOfPocket += superOop;

    if (crossingClaimIndex === null && cumulative + claim > deductible) {
      crossingClaimIndex = i + 1;
    }
    cumulative += claim;

    rows.push({
      index: i + 1,
      claim,
      cumulativeAfter: cumulative,
      basePays,
      topUp: {
        eligibleAboveDeductible: topUpEligible,
        pays: topUpPays,
        outOfPocket: topUpOop,
        sumInsuredLeft: topUpLeft,
      },
      superTopUp: {
        eligibleAboveDeductible: superEligible,
        pays: superPays,
        outOfPocket: superOop,
        sumInsuredLeft: superLeft,
      },
    });
  }

  const superBelowDeductible = Math.min(totalClaims, deductible);
  const claimsUnderDeductible = claims.filter((c) => c <= deductible).length;
  const largestClaim = claims.reduce((a, b) => Math.max(a, b), 0);

  // Guarded: totalClaims is > 0 here because every claim was required to be > 0.
  const topUpCoveredPercent = (topUpPaidTotal / totalClaims) * 100;
  const superCoveredPercent = (superPaidTotal / totalClaims) * 100;

  return {
    baseSumInsured,
    topUpSumInsured,
    deductible,
    claims,
    claimCount: claims.length,
    totalClaims,
    largestClaim,
    claimsUnderDeductible,
    /** True when no single claim clears the deductible — the case where a top-up pays nothing at all. */
    noSingleClaimClearsDeductible: largestClaim <= deductible,
    /** 1-based claim on which the running total first passes the aggregate deductible; null if it never does. */
    crossingClaimIndex: cumulative > deductible ? crossingClaimIndex : null,
    rows,
    base: {
      pays: basePaidTotal,
      sumInsuredLeft: baseLeft,
    },
    topUp: {
      basis: "per claim",
      pays: topUpPaidTotal,
      outOfPocket: topUpOutOfPocket,
      sumInsuredLeft: topUpLeft,
      sumInsuredUsed: topUpSumInsured - topUpLeft,
      belowDeductible: topUpBelowDeductible,
      coveredPercent: topUpCoveredPercent,
    },
    superTopUp: {
      basis: "policy-year aggregate",
      pays: superPaidTotal,
      outOfPocket: superOutOfPocket,
      sumInsuredLeft: superLeft,
      sumInsuredUsed: topUpSumInsured - superLeft,
      belowDeductible: superBelowDeductible,
      coveredPercent: superCoveredPercent,
    },
    /** Positive when the aggregate basis pays more than the per-claim basis on these claims. */
    payoutDifference: superPaidTotal - topUpPaidTotal,
    /** Positive when the per-claim basis leaves more out of pocket than the aggregate basis. */
    outOfPocketDifference: topUpOutOfPocket - superOutOfPocket,
  };
}

/**
 * One-line statement of what separated the two structures on these numbers.
 * Descriptive only — it states what happened, not what to do about it.
 */
export function describeOutcome(result) {
  if (!result || result.error) return "";
  if (result.payoutDifference === 0) {
    if (result.topUp.pays === 0 && result.superTopUp.pays === 0) {
      return "Neither structure paid: the claims never cleared the deductible on either basis.";
    }
    return "Both structures paid the same on these claims — the deductible was cleared on either basis.";
  }
  if (result.topUp.pays === 0) {
    return `The per-claim deductible paid nothing — no single claim exceeded the deductible — while the aggregate basis paid on the running total.`;
  }
  return "The aggregate basis paid more because it counts every claim in the year toward one deductible.";
}
