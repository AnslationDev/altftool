/**
 * Free Look Cancellation Letter Generator (India, IRDAI free look period).
 *
 * Rules encoded here:
 *  - IRDAI (Protection of Policyholders' Interests, Operations and Allied
 *    Matters of Insurers) Regulations, 2024 give the policyholder a free look
 *    period of 30 days from the date of RECEIPT of the policy document to
 *    review the terms and return the policy for cancellation, stating the
 *    reason. The earlier 15-day window (30 days only for distance marketing
 *    and electronic policies) no longer applies.
 *  - The free look option attaches to policies with a term of one year or
 *    more, so a short-term or single-trip cover is flagged rather than
 *    silently assumed to qualify.
 *  - On a valid free look cancellation the insurer refunds the premium paid
 *    after deducting (a) the proportionate risk premium for the period the
 *    policyholder was actually on cover, (b) the expenses the insurer incurred
 *    on the medical examination, and (c) stamp duty charges. For a unit-linked
 *    policy the insurer additionally repurchases the units at the unit price
 *    prevailing on the date of cancellation, so the refund tracks the fund
 *    value rather than the premium.
 *  - The refund is to be paid promptly once the request is received; 7 days is
 *    the turnaround stated in IRDAI's policyholder-protection circulars and is
 *    used here as the date to quote in the letter.
 *
 * Informational only. This is not insurance, legal or tax advice — the exact
 * deductions are governed by the policy contract and the insurer's own
 * schedule of charges.
 */

/** Free look period in days from receipt of the policy document (IRDAI 2024 regulations). */
export const FREE_LOOK_DAYS = 30;
/** Turnaround the insurer is expected to meet for the refund, in days. */
export const REFUND_WITHIN_DAYS = 7;
/** Minimum policy term, in years, for the free look option to attach. */
export const MIN_POLICY_TERM_YEARS = 1;
/** Denominator used for the proportionate risk premium (a plain 365-day year). */
export const DAYS_PER_YEAR = 365;

const MS_PER_DAY = 86400000;
/** Free-text field cap, to keep the drafted letter readable. */
const MAX_FIELD = 140;
/** Upper sanity bound on any rupee amount this tool will accept. */
const MAX_AMOUNT = 100000000;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Policy families, and how the refund is built for each. */
export const POLICY_KINDS = [
  {
    id: "non-linked",
    label: "Traditional life policy (term, endowment, money-back)",
    linked: false,
    note: "Refund = premium paid less proportionate risk premium, medical examination expenses and stamp duty.",
  },
  {
    id: "health",
    label: "Health or personal accident policy (1 year or more)",
    linked: false,
    note: "Same deductions as a traditional policy. Cover of less than one year does not carry a free look option.",
  },
  {
    id: "linked",
    label: "Unit-linked policy (ULIP)",
    linked: true,
    note: "Units are repurchased at the unit price on the cancellation date, so the refund follows the fund value, not the premium.",
  },
];

/** Reasons the regulations expect you to state in the request. */
export const CANCELLATION_REASONS = [
  {
    id: "mis-sold",
    label: "Terms differ from what was explained at the time of sale",
    text: "the terms and conditions in the policy document differ materially from what was explained to me at the time of sale",
  },
  {
    id: "premium",
    label: "Premium or premium paying term is not what I agreed to",
    text: "the premium amount and the premium paying term stated in the policy schedule are not what I agreed to at the time of purchase",
  },
  {
    id: "cover",
    label: "Cover, benefits or exclusions are not suitable",
    text: "the benefits, exclusions and waiting periods set out in the policy document do not meet the requirement for which I bought the cover",
  },
  {
    id: "returns",
    label: "Returns or charges are not as illustrated",
    text: "the charges and the benefit illustration in the policy document do not match the illustration shown to me before purchase",
  },
  {
    id: "duplicate",
    label: "Duplicate or unintended purchase",
    text: "the policy duplicates cover I already hold and I do not wish to continue with it",
  },
];

function clean(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when it is not a real date.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function isoOf(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

function amountError(value, label) {
  if (!Number.isFinite(value)) return `Enter ${label} as a number.`;
  if (value < 0) return `Amounts cannot be negative — check ${label}.`;
  if (value > MAX_AMOUNT) return `The figure entered for ${label} looks too large.`;
  return null;
}

/**
 * Work out the free look deadline, the refund after the permitted deductions,
 * and the letter to send to the insurer.
 *
 * Proportionate risk premium = annual risk (mortality / morbidity) premium
 * x days on cover / 365, where days on cover runs from the risk commencement
 * date to the date the cancellation request is made, counting both days.
 *
 * @param {object} input
 * @param {string} input.receiptDate      yyyy-mm-dd the policy document was received.
 * @param {string} input.riskStartDate    yyyy-mm-dd risk commenced under the policy.
 * @param {string} input.requestDate      yyyy-mm-dd the cancellation request is made.
 * @param {number} input.premiumPaid      Premium actually paid, in rupees.
 * @param {number} input.annualRiskPremium Annual risk / mortality premium component, in rupees.
 * @param {number} input.medicalExpenses  Medical examination cost borne by the insurer, in rupees.
 * @param {number} input.stampDuty        Stamp duty charged on the policy, in rupees.
 * @param {number} input.fundValue        ULIP only: fund value on the cancellation date, in rupees.
 * @param {number} input.chargesRecovered ULIP only: unallocated premium plus charges recovered by cancelling units.
 * @param {number} input.policyTermYears  Policy term in years.
 * @param {string} input.kindId           One of POLICY_KINDS ids.
 * @param {string} input.reasonId         One of CANCELLATION_REASONS ids.
 * @param {string} input.policyholderName
 * @param {string} input.policyNumber
 * @param {string} input.insurerName
 * @param {string} input.bankAccount      Account number the refund should be credited to.
 * @param {string} input.ifsc             IFSC of that account.
 * @returns {object|{error:string}}
 */
export function buildFreeLookRequest({
  receiptDate,
  riskStartDate,
  requestDate,
  premiumPaid,
  annualRiskPremium,
  medicalExpenses = 0,
  stampDuty = 0,
  fundValue = 0,
  chargesRecovered = 0,
  policyTermYears,
  kindId,
  reasonId,
  policyholderName,
  policyNumber,
  insurerName,
  bankAccount,
  ifsc,
}) {
  const kind = POLICY_KINDS.find((k) => k.id === kindId);
  if (!kind) return { error: "Choose the kind of policy you are cancelling." };
  const reason = CANCELLATION_REASONS.find((r) => r.id === reasonId);
  if (!reason) return { error: "Choose the reason for returning the policy." };

  const receipt = parseIsoDate(receiptDate);
  const riskStart = parseIsoDate(riskStartDate);
  const request = parseIsoDate(requestDate);
  if (receipt === null) return { error: "Enter a valid date on which you received the policy document." };
  if (riskStart === null) return { error: "Enter a valid risk commencement date from the policy schedule." };
  if (request === null) return { error: "Enter a valid date for the cancellation request." };
  if (request < receipt) {
    return { error: "The request cannot be dated before you received the policy document." };
  }

  const premium = Number(premiumPaid);
  const riskPremium = Number(annualRiskPremium);
  const medical = Number(medicalExpenses);
  const stamp = Number(stampDuty);
  const fund = Number(fundValue);
  const charges = Number(chargesRecovered);

  const amountProblem =
    amountError(premium, "the premium paid") ||
    amountError(riskPremium, "the annual risk premium") ||
    amountError(medical, "the medical examination expense") ||
    amountError(stamp, "the stamp duty") ||
    (kind.linked ? amountError(fund, "the fund value") : null) ||
    (kind.linked ? amountError(charges, "the charges recovered") : null);
  if (amountProblem) return { error: amountProblem };
  if (!(premium > 0)) return { error: "Enter the premium you actually paid, greater than zero." };
  if (riskPremium > premium) {
    return { error: "The annual risk premium cannot be more than the premium paid." };
  }

  const term = Number(policyTermYears);
  if (!Number.isFinite(term) || term <= 0 || term > 100) {
    return { error: "Enter the policy term in years, between 1 and 100." };
  }

  const name = clean(policyholderName);
  const policy = clean(policyNumber);
  const insurer = clean(insurerName);
  const account = clean(bankAccount);
  const ifscCode = clean(ifsc);
  if (!name) return { error: "Enter the policyholder's name as it appears on the policy." };
  if (!policy) return { error: "Enter the policy number." };
  if (!insurer) return { error: "Enter the insurer's name." };
  if (!account) return { error: "Enter the bank account number the refund should be credited to." };
  if (!ifscCode) return { error: "Enter the IFSC of the account receiving the refund." };
  if ([name, policy, insurer, account, ifscCode].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each text field under ${MAX_FIELD} characters.` };
  }

  // Day 1 of the free look window is the day of receipt, so the last day is
  // receipt + (FREE_LOOK_DAYS - 1).
  const deadline = receipt + (FREE_LOOK_DAYS - 1) * MS_PER_DAY;
  const daysUsed = Math.round((request - receipt) / MS_PER_DAY) + 1;
  const daysRemaining = Math.round((deadline - request) / MS_PER_DAY);
  const withinWindow = request <= deadline;

  const daysOnCover =
    request < riskStart ? 0 : Math.round((request - riskStart) / MS_PER_DAY) + 1;
  const proportionateRisk = (riskPremium * daysOnCover) / DAYS_PER_YEAR;

  const grossBase = kind.linked ? fund + charges : premium;
  const deductions = proportionateRisk + medical + stamp;
  const rawRefund = grossBase - deductions;
  const refund = Math.max(0, rawRefund);
  const refundShare = (refund / premium) * 100;
  const refundDueBy = request + REFUND_WITHIN_DAYS * MS_PER_DAY;

  const warnings = [];
  if (!withinWindow) {
    warnings.push(
      `The ${FREE_LOOK_DAYS}-day free look window closed on ${formatStamp(deadline)}. The insurer can refuse a free look refund after that date; what remains is surrender (for a savings policy) or cancellation for the unexpired term (for health cover), both of which pay far less. Send the request anyway if the policy document reached you later than the date recorded by the insurer, and say so in writing.`,
    );
  }
  if (term < MIN_POLICY_TERM_YEARS) {
    warnings.push(
      `The free look option attaches to policies with a term of ${MIN_POLICY_TERM_YEARS} year or more. A shorter cover may not carry it.`,
    );
  }
  if (riskStart < receipt) {
    warnings.push(
      `Risk started on ${formatStamp(riskStart)}, before the policy document reached you on ${formatStamp(receipt)}. You were on cover for ${daysOnCover} day${daysOnCover === 1 ? "" : "s"}, and the proportionate risk premium for those days is deductible.`,
    );
  }
  if (rawRefund < 0) {
    warnings.push(
      "The permitted deductions come to more than the amount available, so the refund works out to nil. Check the risk premium and medical expense figures against the policy schedule before assuming this is correct.",
    );
  }
  if (kind.linked) {
    warnings.push(
      "Units in a unit-linked policy are repurchased at the price on the cancellation date, so a fall in the fund since allocation is borne by you and the refund can be below the premium paid.",
    );
  }

  const linkedLine = kind.linked
    ? `As this is a unit-linked policy, I understand the units will be repurchased at the unit price prevailing on the date of cancellation. The fund value as per my latest statement is ${Math.round(fund)} rupees.`
    : "";

  const letter = [
    `Date: ${formatStamp(request)}`,
    "",
    "To,",
    "The Grievance Redressal Officer / Policy Servicing Department,",
    insurer,
    "",
    `Subject: Free look cancellation of policy no. ${policy} under the IRDAI free look provision`,
    "",
    "Dear Sir / Madam,",
    "",
    `I, ${name}, am the policyholder of policy no. ${policy} issued by you. The policy document was received by me on ${formatStamp(receipt)} and the risk commencement date shown in the schedule is ${formatStamp(riskStart)}.`,
    "",
    `On reviewing the policy I find that ${reason.text}. I therefore exercise the free look option and request cancellation of the policy with effect from the date of this letter. The free look period of ${FREE_LOOK_DAYS} days from receipt of the policy document runs to ${formatStamp(deadline)}, and this request is made ${withinWindow ? `within that period, on day ${daysUsed}` : `after that period, on day ${daysUsed}, for the reasons explained separately`}.`,
    "",
    `I request a refund of the premium paid, ${Math.round(premium)} rupees, after deducting only the proportionate risk premium for the ${daysOnCover} day${daysOnCover === 1 ? "" : "s"} of cover, the actual expenses incurred on the medical examination and the stamp duty charges, as permitted. ${linkedLine}`.trim(),
    "",
    "Kindly credit the refund to the account below by NEFT and send me the cancellation endorsement and the refund advice by email:",
    `Account number: ${account}`,
    `IFSC: ${ifscCode}`,
    "",
    `I request that the refund be processed within ${REFUND_WITHIN_DAYS} days of receipt of this request, that is by ${formatStamp(refundDueBy)}. The original policy document and the premium receipt are enclosed. Please acknowledge this request with a service request number.`,
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    name,
    `Policy no. ${policy}`,
  ].join("\n");

  return {
    withinWindow,
    deadlineIso: isoOf(deadline),
    deadlineLong: formatStamp(deadline),
    daysUsed,
    daysRemaining,
    daysOnCover,
    proportionateRisk,
    medical,
    stampDuty: stamp,
    deductions,
    grossBase,
    refund,
    refundShare,
    refundDueByIso: isoOf(refundDueBy),
    refundDueByLong: formatStamp(refundDueBy),
    premiumPaid: premium,
    linked: kind.linked,
    warnings,
    letter,
  };
}
