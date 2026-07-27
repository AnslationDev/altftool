/**
 * Revision-limit pricing and contract clause helper.
 *
 * The arithmetic here is straightforward project economics, stated explicitly so the numbers can
 * be checked:
 *   totalHoursIfAllRevisionsUsed = baseHours + includedRounds x hoursPerRound
 *   effectiveHourlyRate          = projectFee / totalHoursIfAllRevisionsUsed
 *   includedRevisionValue        = includedRounds x hoursPerRound x hourlyRate
 *   revisionShareOfFee           = includedRevisionValue / projectFee x 100
 *   extraRoundFee                = hoursPerRound x hourlyRate, rounded up to the billing increment
 * The point of the effective hourly rate is that a fixed fee quietly falls as revisions are
 * consumed: the fee is agreed once, the hours are not.
 *
 * The clause language follows standard freelance contract practice — defining a round, requiring
 * consolidated written feedback, distinguishing a revision from a change of brief, and setting a
 * deemed-approval window. It is drafting help, not legal advice; have a lawyer review anything
 * you sign.
 */

export const CURRENCIES = {
  INR: { label: "Indian rupee (INR)", locale: "en-IN", increment: 500 },
  USD: { label: "US dollar (USD)", locale: "en-US", increment: 25 },
  EUR: { label: "Euro (EUR)", locale: "en-IE", increment: 25 },
  GBP: { label: "Pound sterling (GBP)", locale: "en-GB", increment: 25 },
  AUD: { label: "Australian dollar (AUD)", locale: "en-AU", increment: 25 },
  CAD: { label: "Canadian dollar (CAD)", locale: "en-CA", increment: 25 },
};

/** Included-revision value above this share of the fee means the rounds are effectively unpriced. */
export const REVISION_SHARE_WARNING_PERCENT = 30;
/** Below this fraction of your target rate, the fixed fee has stopped covering the work. */
export const EFFECTIVE_RATE_WARNING_FRACTION = 0.8;
/** More included rounds than this and clients treat revision as the process rather than the exception. */
export const MAX_SENSIBLE_ROUNDS = 4;
/** Extra-round scenarios modelled in the cost table. */
export const EXTRA_ROUND_SCENARIOS = [1, 2, 3];

const toNumber = (raw) => {
  if (raw === "" || raw === null || raw === undefined) return NaN;
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Round up to the nearest billing increment so quoted fees are not odd numbers. */
export function roundUpTo(value, increment) {
  if (!(increment > 0)) return value;
  return Math.ceil(value / increment) * increment;
}

/**
 * Price the revision policy.
 * Pure function: no clock, no randomness.
 *
 * @returns {{error: string} | {effectiveHourlyRate: number, includedRevisionValue: number,
 *   revisionSharePercent: number, extraRoundFee: number, totalHours: number,
 *   scenarios: object[], warnings: string[], currency: object}}
 */
export function priceRevisionPolicy(input = {}) {
  const currencyCode = String(input.currency ?? "INR").trim().toUpperCase();
  const currency = CURRENCIES[currencyCode];
  if (!currency) return { error: "Pick a currency." };

  const projectFee = toNumber(input.projectFee);
  const baseHours = toNumber(input.baseHours);
  const includedRounds = toNumber(input.includedRounds);
  const hoursPerRound = toNumber(input.hoursPerRound);
  const hourlyRate = toNumber(input.hourlyRate);

  if ([projectFee, baseHours, includedRounds, hoursPerRound, hourlyRate].some(Number.isNaN)) {
    return { error: "Enter a number in every field." };
  }
  if (!(projectFee > 0)) return { error: "Project fee must be greater than zero." };
  if (!(baseHours > 0)) return { error: "Base hours must be greater than zero — that is the work before any revisions." };
  if (!(hourlyRate > 0)) return { error: "Your target hourly rate must be greater than zero." };
  if (includedRounds < 0 || !Number.isInteger(includedRounds)) {
    return { error: "Included revision rounds must be a whole number, zero or more." };
  }
  if (includedRounds > 0 && !(hoursPerRound > 0)) {
    return { error: "Hours per revision round must be greater than zero if you include any rounds." };
  }
  if (hoursPerRound < 0) return { error: "Hours per revision round cannot be negative." };
  if (baseHours > 10000 || hoursPerRound > 1000) return { error: "Those hours look like a typo — check the numbers." };

  const revisionHours = includedRounds * hoursPerRound;
  const totalHours = baseHours + revisionHours;
  const effectiveHourlyRate = projectFee / totalHours;
  const includedRevisionValue = revisionHours * hourlyRate;
  const revisionSharePercent = (includedRevisionValue / projectFee) * 100;

  const overrideFee = toNumber(input.extraRoundFee);
  const computedFee = roundUpTo((hoursPerRound || 1) * hourlyRate, currency.increment);
  const extraRoundFee = Number.isNaN(overrideFee) || overrideFee <= 0 ? computedFee : overrideFee;

  const scenarios = EXTRA_ROUND_SCENARIOS.map((rounds) => {
    const billed = projectFee + rounds * extraRoundFee;
    const hours = totalHours + rounds * (hoursPerRound || 1);
    return {
      rounds,
      billedTotal: billed,
      hours,
      effectiveRateIfBilled: billed / hours,
      effectiveRateIfAbsorbed: projectFee / hours,
    };
  });

  const warnings = [];
  if (effectiveHourlyRate < hourlyRate * EFFECTIVE_RATE_WARNING_FRACTION) {
    warnings.push(
      `If every included round is used, your effective rate falls to about ${Math.round(effectiveHourlyRate)} against a target of ${Math.round(hourlyRate)}. Either raise the fee, cut a round, or reduce the hours you allow per round.`,
    );
  }
  if (revisionSharePercent > REVISION_SHARE_WARNING_PERCENT) {
    warnings.push(
      `Included revisions are worth ${revisionSharePercent.toFixed(0)}% of the fee. Above ${REVISION_SHARE_WARNING_PERCENT}% you are selling revision time you have not priced.`,
    );
  }
  if (includedRounds > MAX_SENSIBLE_ROUNDS) {
    warnings.push(
      `${includedRounds} included rounds trains the client to treat revision as the process. Two or three rounds with a clear definition works better than five vague ones.`,
    );
  }
  if (includedRounds === 0) {
    warnings.push("Zero included rounds reads as hostile in most markets. One consolidated round plus a clear extra-round rate lands better and costs you little.");
  }
  if (!Number.isNaN(overrideFee) && overrideFee > 0 && overrideFee < computedFee * 0.75) {
    warnings.push(
      `Your extra-round fee is well below the ${Math.round(computedFee)} the hours are actually worth — extra rounds should not be cheaper per hour than the main project.`,
    );
  }

  return {
    currency,
    currencyCode,
    projectFee,
    baseHours,
    includedRounds,
    hoursPerRound,
    hourlyRate,
    revisionHours,
    totalHours,
    effectiveHourlyRate,
    includedRevisionValue,
    revisionSharePercent,
    extraRoundFee,
    computedFee,
    scenarios,
    warnings,
  };
}

const plural = (count, singular, pluralWord) => `${count} ${count === 1 ? singular : pluralWord}`;

/**
 * Draft the revision-scope clause using the priced numbers.
 * Pure function: takes the formatted money strings so it does no formatting of its own.
 *
 * @param {object} pricing        Result of priceRevisionPolicy.
 * @param {object} options        { feedbackWindowDays, deemedApprovalDays, formatMoney, includeKillFee }
 * @returns {{error: string} | {clauses: Array<{heading: string, body: string}>, text: string}}
 */
export function draftRevisionClause(pricing, options = {}) {
  if (!pricing || pricing.error) return { error: "Fix the numbers above before drafting the clause." };

  const feedbackWindowDays = Number(options.feedbackWindowDays);
  const deemedApprovalDays = Number(options.deemedApprovalDays);
  if (!Number.isFinite(feedbackWindowDays) || feedbackWindowDays < 0 || feedbackWindowDays > 90) {
    return { error: "Feedback window must be between 0 and 90 days." };
  }
  if (!Number.isFinite(deemedApprovalDays) || deemedApprovalDays < 0 || deemedApprovalDays > 90) {
    return { error: "Deemed-approval window must be between 0 and 90 days." };
  }

  const formatMoney = typeof options.formatMoney === "function" ? options.formatMoney : (value) => String(Math.round(value));
  const rounds = pricing.includedRounds;

  const clauses = [
    {
      heading: "Included revisions",
      body: `The fee includes ${plural(rounds, "round", "rounds")} of revisions${rounds > 0 ? ` on the selected concept, allowing up to ${plural(pricing.hoursPerRound, "hour", "hours")} of work per round` : ""}. A round means one set of consolidated written comments from the Client, delivered together, and the single set of amendments made in response.`,
    },
    {
      heading: "What counts as a revision",
      body: "A revision is a refinement of the agreed direction: copy edits, colour and spacing adjustments, image swaps and layout tuning within the approved structure. Requests that change the brief, the audience, the format, the number of deliverables or the creative direction are new work, not revisions, and are quoted separately before any work begins.",
    },
    {
      heading: "Consolidated feedback",
      body: `Feedback is provided once per round, in writing, consolidated from every stakeholder into a single document. Contradictory instructions arriving separately count as separate rounds. The Client will nominate one person who is authorised to approve.`,
    },
    {
      heading: "Additional rounds",
      body: `Further rounds beyond those included are billed at ${formatMoney(pricing.extraRoundFee)} per round, or at ${formatMoney(pricing.hourlyRate)} per hour where the work does not fall neatly into a round, invoiced with the next payment milestone. Additional rounds are scheduled against current availability and may move the delivery date.`,
    },
  ];

  if (feedbackWindowDays > 0) {
    clauses.push({
      heading: "Feedback window",
      body: `Feedback on each delivery is due within ${plural(feedbackWindowDays, "business day", "business days")}. Feedback arriving later is accommodated where possible, but the delivery schedule moves by at least the length of the delay.`,
    });
  }
  if (deemedApprovalDays > 0) {
    clauses.push({
      heading: "Deemed approval",
      body: `If no written feedback is received within ${plural(deemedApprovalDays, "business day", "business days")} of a delivery, that delivery is treated as approved and the project moves to the next stage. Later changes to an approved stage are billed as additional rounds.`,
    });
  }
  if (options.includeKillFee) {
    clauses.push({
      heading: "Cancellation",
      body: "If the project is cancelled after work has begun, the Client pays for all work completed to the date of cancellation plus any non-refundable costs already committed. The deposit is not refundable.",
    });
  }

  clauses.push({
    heading: "Approval and handover",
    body: "Final files are released on written approval and receipt of the final payment. Ownership of the delivered work transfers to the Client on payment in full; until then the Designer retains all rights.",
  });

  const text = clauses.map((clause) => `${clause.heading}\n${clause.body}`).join("\n\n");
  return { clauses, text };
}
