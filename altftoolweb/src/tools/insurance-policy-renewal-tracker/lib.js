/**
 * Insurance policy renewal tracker.
 *
 * What it computes for each policy:
 *
 *   annual premium = premium amount x instalments per year for the payment mode
 *   grace end      = renewal date + grace period days
 *   days to renewal = renewal date - today
 *
 * and across the portfolio: total annualised premium, total sum insured by
 * type, the next renewal due, and the gap against a life-cover benchmark.
 *
 * Grace periods, from Indian regulation and standard policy wording:
 *
 *  - Health insurance: the IRDAI (Insurance Products) Regulations and the 2024
 *    Master Circular on health insurance set a grace period of 15 days where
 *    premium is paid monthly and 30 days for quarterly, half-yearly and annual
 *    modes. Continuity of waiting periods is preserved if the premium is paid
 *    inside the grace period, but a claim arising during a break in cover is
 *    not payable.
 *
 *  - Life insurance: the same 15 / 30 day split is the standard policy term.
 *    A policy not revived within the grace period lapses and can only be
 *    reinstated under the revival provisions, usually within five years.
 *
 *  - Motor insurance: there is no grace period. Cover ceases at the expiry
 *    moment, and driving without at least third-party cover is an offence under
 *    section 146 of the Motor Vehicles Act, 1988. A no-claim bonus is normally
 *    protected only if the policy is renewed within 90 days of expiry.
 *
 *  - Portability of health cover: IRDAI requires the request to reach the new
 *    insurer at least 30 days before the renewal date, and it may be made up to
 *    60 days before.
 *
 * The life-cover benchmark of 10 times annual income is a widely used rule of
 * thumb, not a regulation. It is a starting point, not personalised advice —
 * actual need depends on dependants, liabilities and existing assets.
 *
 * Informational only. Nothing here is insurance, investment or financial advice;
 * speak to a licensed adviser before changing cover.
 */

export const MS_PER_DAY = 86400000;

/** Grace period in days for a monthly premium mode (IRDAI health circular). */
export const GRACE_DAYS_MONTHLY = 15;
/** Grace period for quarterly, half-yearly and annual modes. */
export const GRACE_DAYS_OTHER = 30;
/** Days after motor expiry within which a no-claim bonus is usually retained. */
export const NCB_RETENTION_DAYS = 90;
/** Health portability request must reach the new insurer this far ahead. */
export const PORTABILITY_LEAD_DAYS = 30;
/** Common rule-of-thumb multiple of annual income for term life cover. */
export const LIFE_COVER_INCOME_MULTIPLE = 10;

export const MAX_POLICIES = 40;
export const MAX_HORIZON_DAYS = 3650;

export const PAYMENT_MODES = [
  { id: "monthly", label: "Monthly", perYear: 12, graceDays: GRACE_DAYS_MONTHLY },
  { id: "quarterly", label: "Quarterly", perYear: 4, graceDays: GRACE_DAYS_OTHER },
  { id: "halfYearly", label: "Half-yearly", perYear: 2, graceDays: GRACE_DAYS_OTHER },
  { id: "annual", label: "Annual", perYear: 1, graceDays: GRACE_DAYS_OTHER },
  { id: "single", label: "Single premium (already paid)", perYear: 0, graceDays: 0 },
];

export const POLICY_TYPES = [
  {
    id: "term",
    label: "Term life",
    countsAsLifeCover: true,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Lapses if the premium is not paid within the grace period; revival is usually possible for five years, sometimes with fresh underwriting.",
  },
  {
    id: "endowment",
    label: "Endowment / money-back / ULIP",
    countsAsLifeCover: true,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Acquires a paid-up value after the minimum premiums are paid, but the sum assured falls sharply if you stop.",
  },
  {
    id: "healthIndividual",
    label: "Health — individual",
    countsAsLifeCover: false,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Pay inside the grace period to keep waiting periods and no-claim bonus intact; a claim during the break is not payable.",
  },
  {
    id: "healthFamily",
    label: "Health — family floater",
    countsAsLifeCover: false,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "The floater sum insured is shared, so one large claim can exhaust the cover for everyone until renewal.",
  },
  {
    id: "criticalIllness",
    label: "Critical illness / personal accident",
    countsAsLifeCover: false,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Pays a lump sum on diagnosis of a listed condition; survival periods and definitions differ sharply between insurers.",
  },
  {
    id: "motor",
    label: "Motor (car / two-wheeler)",
    countsAsLifeCover: false,
    defaultGrace: 0,
    note: "No grace period — cover ends at expiry. Renew within 90 days to keep the no-claim bonus, and note that a break usually forces a fresh inspection.",
  },
  {
    id: "home",
    label: "Home / shop / fire",
    countsAsLifeCover: false,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Check that the sum insured still reflects rebuilding cost and the value of contents.",
  },
  {
    id: "travel",
    label: "Travel",
    countsAsLifeCover: false,
    defaultGrace: 0,
    note: "Single-trip cover ends on the return date; annual multi-trip cover renews like any other policy.",
  },
  {
    id: "other",
    label: "Other",
    countsAsLifeCover: false,
    defaultGrace: GRACE_DAYS_OTHER,
    note: "Set the grace period from the policy wording.",
  },
];

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Annualise a premium for a payment mode.
 * A single-premium policy has no recurring outgo, so it annualises to zero.
 */
export function annualisePremium(amount, modeId) {
  const mode = PAYMENT_MODES.find((item) => item.id === modeId);
  if (!mode) return { error: "Choose how often the premium is paid." };
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) {
    return { error: "Premium must be zero or more." };
  }
  return { annual: value * mode.perYear, perYear: mode.perYear, mode };
}

/**
 * Score one policy against a reference date.
 *
 * @param {object} policy  { id, name, typeId, number, insurer, sumInsured,
 *                           premium, modeId, renewalDate, graceDays }
 * @param {number} todayMs reference date as a UTC timestamp
 */
export function scorePolicy(policy, todayMs) {
  const name = String(policy.name ?? "").trim();
  if (!name) return { error: "Every policy needs a name." };

  const type = POLICY_TYPES.find((item) => item.id === policy.typeId) ?? POLICY_TYPES.at(-1);

  const premiumResult = annualisePremium(policy.premium, policy.modeId);
  if (premiumResult.error) return { error: `"${name}": ${premiumResult.error}` };

  const sumInsured = Number(policy.sumInsured);
  if (!Number.isFinite(sumInsured) || sumInsured < 0) {
    return { error: `"${name}": the sum insured must be zero or more.` };
  }

  const renewalMs = parseIsoDate(policy.renewalDate);
  if (Number.isNaN(renewalMs)) {
    return { error: `"${name}": enter the renewal date as a real calendar date.` };
  }

  const graceDays = Number(policy.graceDays ?? type.defaultGrace);
  if (!Number.isFinite(graceDays) || graceDays < 0 || graceDays > 90) {
    return { error: `"${name}": the grace period must be between 0 and 90 days.` };
  }

  const daysToRenewal = Math.round((renewalMs - todayMs) / MS_PER_DAY);
  if (Math.abs(daysToRenewal) > MAX_HORIZON_DAYS) {
    return { error: `"${name}": that renewal date is more than 10 years away — check the year.` };
  }

  const graceEndMs = renewalMs + graceDays * MS_PER_DAY;
  const daysToGraceEnd = Math.round((graceEndMs - todayMs) / MS_PER_DAY);
  const portabilityCutoffMs = renewalMs - PORTABILITY_LEAD_DAYS * MS_PER_DAY;

  let status = "active";
  if (daysToGraceEnd < 0) status = "lapsed";
  else if (daysToRenewal < 0) status = "inGrace";
  else if (daysToRenewal <= 30) status = "dueSoon";

  return {
    id: policy.id,
    name,
    typeId: type.id,
    typeLabel: type.label,
    note: type.note,
    countsAsLifeCover: type.countsAsLifeCover,
    insurer: String(policy.insurer ?? "").trim(),
    number: String(policy.number ?? "").trim(),
    sumInsured,
    premium: Number(policy.premium) || 0,
    modeId: premiumResult.mode.id,
    modeLabel: premiumResult.mode.label,
    annualPremium: premiumResult.annual,
    renewalDate: toIsoDate(renewalMs),
    graceDays,
    graceEndDate: toIsoDate(graceEndMs),
    portabilityCutoff: toIsoDate(portabilityCutoffMs),
    daysToRenewal,
    daysToGraceEnd,
    status,
    ncbDeadline:
      type.id === "motor" ? toIsoDate(renewalMs + NCB_RETENTION_DAYS * MS_PER_DAY) : "",
  };
}

/**
 * Build the portfolio view.
 *
 * @param {object} input
 * @param {object[]} input.policies    rows as described in scorePolicy
 * @param {string}   input.today       reference date, YYYY-MM-DD
 * @param {number}   input.annualIncome used only for the life-cover benchmark
 * @returns {object} rows, totals and the next renewal — or { error }
 */
export function buildPortfolio({ policies = [], today, annualIncome = 0 } = {}) {
  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  if (!Array.isArray(policies) || policies.length === 0) {
    return { error: "Add at least one policy to build the tracker." };
  }
  if (policies.length > MAX_POLICIES) {
    return { error: `This tracker holds up to ${MAX_POLICIES} policies.` };
  }

  const income = Number(annualIncome);
  if (!Number.isFinite(income) || income < 0) {
    return { error: "Annual income must be zero or more." };
  }

  const rows = [];
  for (const policy of policies) {
    const scored = scorePolicy(policy, todayMs);
    if (scored.error) return { error: scored.error };
    rows.push(scored);
  }

  rows.sort((a, b) => a.daysToRenewal - b.daysToRenewal);

  const totalAnnualPremium = rows.reduce((sum, row) => sum + row.annualPremium, 0);
  const totalSumInsured = rows.reduce((sum, row) => sum + row.sumInsured, 0);
  const lifeCover = rows
    .filter((row) => row.countsAsLifeCover)
    .reduce((sum, row) => sum + row.sumInsured, 0);
  const healthCover = rows
    .filter((row) => row.typeId === "healthIndividual" || row.typeId === "healthFamily")
    .reduce((sum, row) => sum + row.sumInsured, 0);

  const recommendedLifeCover = income * LIFE_COVER_INCOME_MULTIPLE;
  const lifeCoverGap = Math.max(0, recommendedLifeCover - lifeCover);

  const byType = rows.reduce((acc, row) => {
    const bucket = acc[row.typeLabel] ?? { count: 0, sumInsured: 0, annualPremium: 0 };
    bucket.count += 1;
    bucket.sumInsured += row.sumInsured;
    bucket.annualPremium += row.annualPremium;
    acc[row.typeLabel] = bucket;
    return acc;
  }, {});

  const nextRenewal = rows.find((row) => row.daysToRenewal >= 0) ?? null;
  const counts = {
    lapsed: rows.filter((row) => row.status === "lapsed").length,
    inGrace: rows.filter((row) => row.status === "inGrace").length,
    dueSoon: rows.filter((row) => row.status === "dueSoon").length,
    active: rows.filter((row) => row.status === "active").length,
  };

  return {
    rows,
    counts,
    total: rows.length,
    totalAnnualPremium,
    monthlyPremium: totalAnnualPremium / 12,
    totalSumInsured,
    lifeCover,
    healthCover,
    recommendedLifeCover,
    lifeCoverGap,
    premiumAsShareOfIncome: income > 0 ? (totalAnnualPremium / income) * 100 : null,
    nextRenewal,
    today: toIsoDate(todayMs),
  };
}
