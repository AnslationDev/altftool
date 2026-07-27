/**
 * Tracing dormant and unclaimed money in India: when an asset goes inoperative,
 * where it is transferred once it stays unclaimed, and what is needed to get it back.
 *
 * Rule sources for every threshold below:
 *
 *  - RBI Master Direction on Inoperative Accounts / Unclaimed Deposits in Banks
 *    (DOR.SOG(LEG).REC/64/09.08.024/2023-24 dated 1 January 2024, effective
 *    1 April 2024): a savings or current account with no customer-induced
 *    transaction for over two years is classified inoperative. Banks may not levy
 *    any charge for reactivating it, nor a minimum balance penalty on it.
 *
 *  - Section 26A of the Banking Regulation Act, 1949 with the Depositor Education
 *    and Awareness Fund Scheme, 2014: credit balances in any deposit account that
 *    have not been operated for ten years, and deposits remaining unclaimed for ten
 *    years after maturity, are transferred to RBI's DEAF. The depositor's right to
 *    claim survives the transfer — the bank pays and then claims a refund from RBI.
 *
 *  - RBI notification effective 1 July 2018: interest payable on DEAF-transferred
 *    interest-bearing deposits is 3% per annum simple, for the period from transfer
 *    until payment to the depositor.
 *
 *  - RBI's UDGAM portal (Unclaimed Deposits — Gateway to Access inforMation),
 *    launched 17 August 2023, searches unclaimed deposits across participating banks.
 *
 *  - Section 124(5) and 124(6) of the Companies Act, 2013: a dividend unpaid or
 *    unclaimed for seven years from the date it became due is transferred to the
 *    Investor Education and Protection Fund, and the underlying shares are also
 *    transferred where the dividend has been unclaimed for seven consecutive years.
 *    Recovery is by e-filing Form IEPF-5 followed by a physical claim through the
 *    company's Nodal Officer.
 *
 *  - Senior Citizens' Welfare Fund Rules, 2016 read with the IRDAI instructions on
 *    unclaimed amounts of policyholders: unclaimed amounts lying with an insurer for
 *    ten years or more are transferred to the Senior Citizens' Welfare Fund, and
 *    insurers must publish unclaimed amounts of ₹1,000 and above on their websites.
 *
 *  - EPF Scheme, 1952 as amended in 2016: an account becomes inoperative thirty-six
 *    months after the amount becomes payable, and interest continues to be credited
 *    up to the member attaining 58 years of age.
 *
 *  - Post Office Savings Account Rules, 2019: an account with no deposit or
 *    withdrawal for three consecutive financial years is treated as silent.
 *
 *  - SEBI and AMFI's MITRA platform (Mutual Fund Investment Tracing and Retrieval
 *    Assistant) traces inactive folios where no investor-initiated transaction has
 *    taken place for ten years and units remain unclaimed.
 *
 * Nothing here is legal advice. Claim formats differ between institutions.
 */

/** Days in a mean Gregorian year, used to convert an elapsed period to years. */
export const DAYS_IN_YEAR = 365.2425;

/** Simple interest RBI pays on DEAF-transferred interest-bearing deposits, per annum. */
export const DEAF_INTEREST_RATE_PERCENT = 3;

/** Insurers must publish unclaimed amounts at or above this value on their websites. */
export const IRDAI_DISPLAY_THRESHOLD = 1000;

/**
 * Every traceable asset class, with the statutory clock that applies to it.
 * `dormantYears` is when it stops being treated as live; `transferYears` is when it
 * leaves the institution for a statutory fund. `null` means the rule does not exist
 * for that asset class.
 */
export const ASSET_TYPES = [
  {
    id: "bank",
    label: "Bank savings or current account",
    dormantYears: 2,
    transferYears: 10,
    dormantLabel: "Inoperative",
    transferredTo: "RBI's Depositor Education and Awareness (DEAF) Fund",
    clockFrom: "the last customer-induced transaction",
    portal: "RBI UDGAM portal, plus the unclaimed deposits list on the bank's own website",
    earnsDeafInterest: true,
    rule: "Section 26A, Banking Regulation Act 1949 with the DEAF Scheme 2014",
  },
  {
    id: "bankDeposit",
    label: "Fixed or recurring deposit",
    dormantYears: null,
    transferYears: 10,
    dormantLabel: "Matured and unclaimed",
    transferredTo: "RBI's Depositor Education and Awareness (DEAF) Fund",
    clockFrom: "the maturity date, not the date the deposit was opened",
    portal: "RBI UDGAM portal, plus the unclaimed deposits list on the bank's own website",
    earnsDeafInterest: true,
    rule: "Section 26A, Banking Regulation Act 1949 with the DEAF Scheme 2014",
  },
  {
    id: "shares",
    label: "Shares and unpaid dividends",
    dormantYears: null,
    transferYears: 7,
    dormantLabel: "Unclaimed",
    transferredTo: "the Investor Education and Protection Fund (IEPF)",
    clockFrom: "the date the first unclaimed dividend became due",
    portal: "iepf.gov.in — the IEPF claim system, plus the company's investor relations page",
    earnsDeafInterest: false,
    rule: "Sections 124(5) and 124(6), Companies Act 2013",
  },
  {
    id: "insurance",
    label: "Life insurance maturity or survival benefit",
    dormantYears: null,
    transferYears: 10,
    dormantLabel: "Unclaimed",
    transferredTo: "the Senior Citizens' Welfare Fund",
    clockFrom: "the date the benefit fell due",
    portal: "the insurer's unclaimed amounts search on its own website",
    earnsDeafInterest: false,
    rule: "Senior Citizens' Welfare Fund Rules 2016 with IRDAI instructions",
  },
  {
    id: "epf",
    label: "Employees' Provident Fund balance",
    dormantYears: 3,
    transferYears: null,
    dormantLabel: "Inoperative",
    transferredTo: "no statutory fund — it stays with EPFO",
    clockFrom: "the date the amount became payable",
    portal: "the EPFO member portal and the Inoperative Accounts Help Desk",
    earnsDeafInterest: false,
    rule: "EPF Scheme 1952 as amended in 2016",
  },
  {
    id: "mutualFund",
    label: "Mutual fund folio",
    dormantYears: 10,
    transferYears: null,
    dormantLabel: "Inactive",
    transferredTo: "no statutory fund — unclaimed amounts stay in a designated scheme",
    clockFrom: "the last investor-initiated transaction",
    portal: "AMFI's MITRA search, plus the CAMS and KFintech investor portals",
    earnsDeafInterest: false,
    rule: "SEBI and AMFI framework for inactive folios and unclaimed amounts",
  },
  {
    id: "postOffice",
    label: "Post office savings or small savings account",
    dormantYears: 3,
    transferYears: null,
    dormantLabel: "Silent",
    transferredTo: "no statutory fund — it stays with the Department of Posts",
    clockFrom: "the last deposit or withdrawal",
    portal: "the home post office, with the account or certificate number",
    earnsDeafInterest: false,
    rule: "Post Office Savings Account Rules 2019",
  },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Parse an ISO date (YYYY-MM-DD) into a UTC timestamp.
 * @returns {number|null} milliseconds, or null when the string is not a real date.
 */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/**
 * Elapsed years between two ISO dates, as a decimal. Pure — both dates are arguments.
 * Use this for display and for prorating interest, never for testing a threshold:
 * a mean year of 365.2425 days is shorter than most calendar years, so ten calendar
 * years works out to 9.9988 by this measure and would fail a `>= 10` test.
 *
 * @returns {number|null} years as a decimal, or null when either date is unusable.
 */
export function yearsBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (from === null || to === null) return null;
  const days = (to - from) / 86400000;
  return days / DAYS_IN_YEAR;
}

/**
 * The same calendar date a whole number of years later, clamped to the end of the
 * month so 29 February plus one year lands on 28 February rather than 1 March.
 *
 * @param {number} ms  UTC milliseconds of the starting date.
 * @param {number} n   Whole years to add.
 * @returns {number} UTC milliseconds of the anniversary.
 */
export function addYearsMs(ms, n) {
  const start = new Date(ms);
  const year = start.getUTCFullYear() + n;
  const month = start.getUTCMonth();
  const day = start.getUTCDate();
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDayOfMonth));
}

/**
 * Whole calendar years elapsed between two ISO dates — the measure the statutory
 * thresholds actually use. Ten years to the day counts as ten.
 *
 * @returns {number|null} completed years, or null when either date is unusable.
 */
export function completedYearsBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (from === null || to === null || to < from) return null;
  let count = 0;
  while (addYearsMs(from, count + 1) <= to) count += 1;
  return count;
}

/**
 * Progress across a checklist.
 * @returns {{ done: number, total: number, percent: number, complete: boolean }}
 */
export function computeChecklistProgress(total, completed) {
  const totalSteps = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const doneSteps = Number.isFinite(completed) ? Math.min(Math.max(0, Math.floor(completed)), totalSteps) : 0;
  return {
    done: doneSteps,
    total: totalSteps,
    percent: totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100),
    complete: totalSteps > 0 && doneSteps === totalSteps,
  };
}

const COMMON_DOCUMENTS = [
  "Photo identity of the claimant — Aadhaar, PAN or passport",
  "Proof of current address",
  "Cancelled cheque or passbook page of a live bank account for the credit",
  "Any old passbook, statement, certificate or folio number you still have",
  "A fresh KYC form, since the institution will re-verify before paying",
];

const DECEASED_DOCUMENTS = [
  "Death certificate of the holder, in original for verification",
  "Nomination record, or a legal heir certificate / succession certificate where there is no nominee",
  "Indemnity bond and affidavit on non-judicial stamp paper",
  "No-objection or disclaimer letters from the other legal heirs",
];

const TYPE_DOCUMENTS = {
  bank: [
    "The bank's claim form for inoperative or unclaimed deposits",
    "Old account number, branch name and the approximate date it was last used",
  ],
  bankDeposit: [
    "The original deposit receipt or certificate, or a signed indemnity if it is lost",
    "The maturity date, which is when the ten-year clock starts",
  ],
  shares: [
    "Form IEPF-5, filed online on iepf.gov.in before anything is sent by post",
    "Indemnity bond on stamp paper and an advance stamped receipt",
    "Original share certificates, or the client master list from your demat account",
    "Entitlement letter issued by the company's Nodal Officer after verification",
  ],
  insurance: [
    "Policy document, or the policy number with a signed lost-policy indemnity",
    "Completed discharge voucher and NEFT mandate",
  ],
  epf: [
    "Universal Account Number, with Aadhaar and bank account seeded and verified",
    "Composite claim form, or Form 19 and Form 10C where the UAN route is not available",
    "Signature or attestation from the last employer if the KYC is not digitally approved",
  ],
  mutualFund: [
    "Folio number and PAN, or a MITRA search result identifying the folio",
    "Updated KYC with the current address and bank mandate",
    "Redemption or transmission request to CAMS or KFintech as registrar",
  ],
  postOffice: [
    "Passbook or certificate, and the home post office where it was opened",
    "The prescribed claim form, and the settlement route that applies where there is no nomination",
  ],
};

/**
 * Classify one asset and build the claim checklist for it.
 *
 * @param {object} input
 * @param {string} input.assetType         One of the ASSET_TYPES ids.
 * @param {string} input.lastActivityDate  ISO date of the last activity or maturity.
 * @param {string} input.asOfDate          ISO date to measure against (pass today's date).
 * @param {boolean} [input.holderDeceased] True when claiming as nominee or legal heir.
 * @param {number} [input.amount]          Approximate amount in INR, 0 if unknown.
 * @returns {object} result object, or { error } when an input is not usable.
 */
export function traceUnclaimedAsset({
  assetType = "bank",
  lastActivityDate,
  asOfDate,
  holderDeceased = false,
  amount = 0,
} = {}) {
  const asset = ASSET_TYPES.find((entry) => entry.id === assetType);
  if (!asset) return { error: "Choose one of the asset types listed." };

  const value = Number(amount);
  if (!Number.isFinite(value)) return { error: "Enter a valid amount, or 0 if you do not know it." };
  if (value < 0) return { error: "The amount cannot be negative." };
  if (value > 1e12) return { error: "That amount is outside the range of this checklist." };

  const from = parseIsoDate(lastActivityDate);
  const to = parseIsoDate(asOfDate);
  if (from === null) return { error: "Enter the date of last activity as a real calendar date." };
  if (to === null) return { error: "Enter a valid date to measure against." };
  if (to < from) return { error: "The date you are measuring to cannot be before the last activity." };

  const years = (to - from) / 86400000 / DAYS_IN_YEAR;
  const elapsedYears = round2(years);
  const elapsedMonths = Math.round(years * 12);

  // Thresholds are calendar-anniversary tests, not decimal-year comparisons.
  const transferAt = asset.transferYears === null ? null : addYearsMs(from, asset.transferYears);
  const dormantAt = asset.dormantYears === null ? null : addYearsMs(from, asset.dormantYears);
  const transferred = transferAt !== null && to >= transferAt;
  const dormant = dormantAt !== null && to >= dormantAt;

  let status;
  let statusLabel;
  let where;
  if (transferred) {
    status = "transferred";
    statusLabel = `Transferred out — ${asset.dormantLabel.toLowerCase()} for ${asset.transferYears} years or more`;
    where = asset.transferredTo;
  } else if (dormant) {
    status = "dormant";
    statusLabel = asset.dormantLabel;
    where = "still with the institution, but flagged and frozen for fresh debits";
  } else {
    status = "active";
    statusLabel = "Still treated as live";
    where = "with the institution, on its normal books";
  }

  // The next milestone is whichever stage has not been reached yet: dormancy first,
  // then transfer out to a statutory fund.
  let nextStageAt = null;
  let nextStageLabel = "";
  if (!dormant && dormantAt !== null) {
    nextStageAt = dormantAt;
    nextStageLabel = asset.dormantLabel;
  } else if (!transferred && transferAt !== null) {
    nextStageAt = transferAt;
    nextStageLabel = `transfer to ${asset.transferredTo}`;
  }
  const yearsToNextStage =
    nextStageAt === null ? 0 : round2(Math.max(0, (nextStageAt - to) / 86400000 / DAYS_IN_YEAR));

  const yearsInFund = transferred
    ? round2(Math.max(0, (to - transferAt) / 86400000 / DAYS_IN_YEAR))
    : 0;
  const deafInterest =
    asset.earnsDeafInterest && transferred && value > 0
      ? round2((value * DEAF_INTEREST_RATE_PERCENT * yearsInFund) / 100)
      : 0;
  const estimatedRecoverable = round2(value + deafInterest);

  const steps = [];
  steps.push({
    id: "search",
    title: `Search for it — ${asset.portal}`,
    detail: `The clock on this asset runs from ${asset.clockFrom}. Search on name, and on any former name or address you used at the time.`,
  });
  steps.push({
    id: "identify",
    title: "Write down the identifiers before you contact anyone",
    detail:
      "Account, policy, folio or certificate number, the branch or office, and the exact name spelling used then. Mismatched names are the single commonest reason a claim is returned.",
  });
  if (holderDeceased) {
    steps.push({
      id: "heirship",
      title: "Establish your standing as nominee or legal heir",
      detail:
        "A registered nomination is the quickest route. Without one you will need a legal heir or succession certificate, plus an indemnity bond and disclaimers from the other heirs.",
    });
  }
  steps.push({
    id: "kyc",
    title: "Complete fresh KYC in the current name and address",
    detail:
      "Every institution re-verifies before paying. Update the address, mobile number and bank mandate first so the payment has somewhere to land.",
  });
  if (transferred) {
    steps.push({
      id: "claim-fund",
      title: `File the claim for money now held by ${asset.transferredTo}`,
      detail:
        asset.id === "shares"
          ? "File Form IEPF-5 online, then send the printed claim with the indemnity bond to the company's Nodal Officer, who verifies it and sends an entitlement letter to the IEPF Authority."
          : "You still claim through the institution, not the fund. It pays you and then recovers the amount from the fund, so refusal on the ground that the money has been transferred is not correct.",
    });
  } else {
    steps.push({
      id: "reactivate",
      title: dormant ? "Ask for reactivation, in writing" : "Put a transaction through to keep it live",
      detail: dormant
        ? "For a bank account no charge may be levied for reactivation, and no minimum balance penalty applies while it is inoperative."
        : `A single customer-initiated transaction resets the clock. Left alone it reaches ${nextStageLabel || "the next stage"} in about ${yearsToNextStage} year(s).`,
    });
  }
  steps.push({
    id: "escalate",
    title: "Escalate if there is no answer within 30 days",
    detail:
      "Use the institution's grievance channel first, then the relevant ombudsman — the RBI Integrated Ombudsman for banks, the Insurance Ombudsman for policies, SEBI SCORES for market intermediaries or EPFiGMS for provident fund.",
  });
  steps.push({
    id: "protect",
    title: "Register a nomination the moment the money is back",
    detail:
      "Nomination on the receiving account, folio and policy is what stops the same money going unclaimed again in the next generation.",
  });

  const documents = [
    ...COMMON_DOCUMENTS,
    ...(TYPE_DOCUMENTS[asset.id] || []),
    ...(holderDeceased ? DECEASED_DOCUMENTS : []),
  ];

  return {
    asset,
    elapsedYears,
    elapsedMonths,
    status,
    statusLabel,
    where,
    transferred,
    dormant,
    yearsToNextStage,
    nextStageLabel,
    yearsInFund,
    amount: round2(value),
    deafInterest,
    estimatedRecoverable,
    holderDeceased: Boolean(holderDeceased),
    steps,
    documents,
    displayThresholdNote:
      asset.id === "insurance"
        ? `Insurers must publish unclaimed amounts of ₹${IRDAI_DISPLAY_THRESHOLD} and above on their websites, so anything at or over that figure should be searchable by name.`
        : "",
  };
}

export default traceUnclaimedAsset;
