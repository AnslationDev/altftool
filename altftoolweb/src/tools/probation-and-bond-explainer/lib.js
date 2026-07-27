/**
 * Probation & service-bond explainer — reference notes plus a bond
 * liability calculator.
 *
 * Reference points encoded below:
 *  - Central government: DoPT consolidated instructions on probation
 *    (O.M. No. 28020/1/2010-Estt(C), 21.07.2014) prescribe 2 years'
 *    probation for direct recruits to Group A/B/C posts as the normal rule,
 *    extendable; confirmation follows successful completion.
 *  - Public sector banks: officer appointment terms commonly include a
 *    2-3 year service bond with a monetary undertaking (the exact amount
 *    and period are set in each bank's recruitment notification).
 *  - Bond recovery practice is either "full amount" (the whole undertaking
 *    becomes payable on early exit) or "pro-rata" (liability reduces in
 *    proportion to service completed) — which one applies is written in
 *    the bond text itself.
 */

export const REFERENCE_NOTES = [
  {
    id: "central-probation",
    title: "Central government probation — the 2-year norm",
    body:
      "DoPT's consolidated instructions on probation (2014) make 2 years the standard probation period for direct recruits to Group A, B and C central posts, extendable if performance or vigilance issues arise. During probation you are assessed for confirmation; increments accrue normally, but the appointment can be terminated more easily than after confirmation.",
  },
  {
    id: "bank-bond",
    title: "Bank officer service bonds",
    body:
      "Public sector bank PO appointments commonly carry a service bond of around 2 to 3 years with a monetary undertaking, payable if you resign before completing the period. The exact amount and period are stated in the recruitment notification and the appointment letter — read the bond clause before joining, not after.",
  },
  {
    id: "probation-vs-bond",
    title: "Probation is not a bond",
    body:
      "Probation is an assessment period — the employer decides whether to confirm you. A bond is a financial undertaking — you pay if you leave early. A post can have both, either, or neither, and their periods need not match.",
  },
  {
    id: "resign-during-probation",
    title: "Resigning during probation",
    body:
      "Resignation during probation is generally permitted with the notice period stated in the appointment letter, but any service bond still applies independently. Government servants also need their resignation accepted before it takes effect; simply stopping work can invite disciplinary consequences.",
  },
  {
    id: "technical-resignation",
    title: "Technical resignation between government jobs",
    body:
      "If you move from one government post to another applied for through proper channel, a 'technical resignation' can protect past service for pay protection, leave and pension purposes — and bond recovery is often waived when the new post is also under government. Route applications through your current employer to keep this option open.",
  },
];

/** Recovery models actually used in bond clauses. */
export const RECOVERY_TYPES = [
  { id: "full", label: "Full amount — whole bond payable on early exit" },
  { id: "pro-rata", label: "Pro-rata — liability reduces with service completed" },
];

/**
 * Compute the amount payable on leaving before the bond period ends.
 *
 * Pro-rata formula (as written in pro-rata bond clauses):
 *   payable = bondAmount × remainingMonths / bondMonths
 * Full-recovery clauses make the entire bondAmount payable while any part
 * of the period remains unserved.
 *
 * @param {object} input
 * @param {number} input.bondAmount     Bond undertaking in rupees.
 * @param {number} input.bondMonths     Bond period in months.
 * @param {number} input.servedMonths   Months already served.
 * @param {string} input.recoveryType   "full" | "pro-rata".
 * @returns {object} result or { error }
 */
export function computeBondLiability({ bondAmount, bondMonths, servedMonths, recoveryType }) {
  const amount = Number(bondAmount);
  const period = Number(bondMonths);
  const served = Number(servedMonths);

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Bond amount must be zero or a positive number of rupees." };
  }
  if (amount > 100000000) {
    return { error: "Bond amount looks implausibly large — check the figure." };
  }
  if (!Number.isFinite(period) || period <= 0) {
    return { error: "Bond period must be a positive number of months." };
  }
  if (!Number.isFinite(served) || served < 0) {
    return { error: "Months served cannot be negative." };
  }
  if (recoveryType !== "full" && recoveryType !== "pro-rata") {
    return { error: "Choose how the bond clause says recovery works: full or pro-rata." };
  }

  const remainingMonths = Math.max(0, period - served);
  const completed = remainingMonths === 0;

  let payable;
  if (completed) {
    payable = 0;
  } else if (recoveryType === "full") {
    payable = amount;
  } else {
    payable = Math.round((amount * remainingMonths) / period);
  }

  return {
    payable,
    remainingMonths,
    servedMonths: Math.min(served, period),
    bondMonths: period,
    bondAmount: amount,
    completed,
    percentServed: Math.round(Math.min(100, (served / period) * 100)),
  };
}
