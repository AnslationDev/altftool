/**
 * RTI fee and timeline calculator.
 *
 * FEES - Right to Information Rules, 2012 (Central), which apply to central
 * public authorities. State governments and the High Courts notify their own
 * rules, and several states charge different amounts, so the tool lets the
 * rates be overridden while defaulting to the central figures:
 *
 *  - Rule 3: an application must be accompanied by a fee of RUPEES TEN.
 *  - Rule 4(a): rupees TWO for each page in A-4 or A-3 size paper created or
 *    copied.
 *  - Rule 4(b): the actual cost or price of a copy in a larger size of paper.
 *  - Rule 4(c): the actual cost or price for samples or models.
 *  - Rule 4(d): rupees FIFTY per diskette or floppy - in practice applied to a
 *    CD or other electronic medium supplied by the public authority.
 *  - Rule 4(e): for a publication, the price fixed for it; for extracts from a
 *    publication, rupees two per page of photocopy.
 *  - Rule 4(f): inspection of records is FREE for the first hour, and rupees
 *    FIVE for each subsequent hour or fraction of an hour.
 *  - Rule 8: no fee is charged from a person below the poverty line. The same
 *    exemption comes from the proviso to Section 7(5) of the Act.
 *  - Section 7(6): if the public authority fails to comply with the time limit
 *    in Section 7(1), the information must be provided FREE OF CHARGE.
 *
 * TIMELINE - Right to Information Act, 2005:
 *
 *  - Section 7(1): reply within THIRTY days of receipt of the request.
 *  - Proviso to Section 7(1): where the information sought concerns the LIFE
 *    OR LIBERTY of a person, it must be provided within FORTY-EIGHT hours.
 *  - Section 5(2): where a request is given to an Assistant Public Information
 *    Officer, FIVE days are ADDED in computing the period for response.
 *  - Section 7(3): where a further fee is required, the officer must intimate
 *    the applicant, and the period between the despatch of that intimation and
 *    the payment of the fee is EXCLUDED from the thirty-day period.
 *  - Section 11(3): where third-party information is involved, the decision
 *    must be made within FORTY days of the receipt of the request.
 *  - Section 7(2): failure to reply within the period is a DEEMED REFUSAL,
 *    which is what an appeal is filed against.
 *  - Section 19(1): first appeal within THIRTY days of the decision or of the
 *    expiry of the reply period; the appellate authority disposes of it within
 *    thirty days, extendable to FORTY-FIVE days for reasons recorded.
 *  - Section 19(3): second appeal to the Information Commission within NINETY
 *    days.
 *  - Section 20(1): a penalty of RUPEES TWO HUNDRED AND FIFTY per day of
 *    delay, subject to a ceiling of RUPEES TWENTY-FIVE THOUSAND, on the PIO.
 *
 * Informational only; not legal advice.
 */

/** Rule 3, RTI Rules 2012. */
export const APPLICATION_FEE_INR = 10;
/** Rule 4(a), RTI Rules 2012. */
export const PAGE_FEE_INR = 2;
/** Rule 4(d), RTI Rules 2012. */
export const MEDIA_FEE_INR = 50;
/** Rule 4(f), RTI Rules 2012 - free first hour, then this per hour. */
export const INSPECTION_HOURLY_INR = 5;
export const INSPECTION_FREE_HOURS = 1;
/** Section 7(1), RTI Act 2005. */
export const REPLY_DAYS = 30;
/** Section 11(3), RTI Act 2005 - third-party information. */
export const THIRD_PARTY_DAYS = 40;
/** Proviso to Section 7(1) - life and liberty, in hours and whole days. */
export const LIFE_LIBERTY_HOURS = 48;
const LIFE_LIBERTY_DAYS = 2;
/** Section 5(2), RTI Act 2005 - extra days when filed through an APIO. */
export const APIO_EXTRA_DAYS = 5;
/** Section 6(3), RTI Act 2005 - transfer to the correct public authority. */
export const TRANSFER_DAYS = 5;
/** Section 19(1), RTI Act 2005. */
export const FIRST_APPEAL_DAYS = 30;
export const FAA_DECISION_DAYS = 30;
export const FAA_EXTENDED_DAYS = 45;
/** Section 19(3), RTI Act 2005. */
export const SECOND_APPEAL_DAYS = 90;
/** Section 20(1), RTI Act 2005. */
export const PENALTY_PER_DAY_INR = 250;
export const PENALTY_CAP_INR = 25000;

const MS_PER_DAY = 86400000;
/** Guard rails so a typo cannot produce an absurd bill. */
const MAX_PAGES = 100000;
const MAX_MEDIA = 500;
const MAX_INSPECTION_HOURS = 200;

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

/** How the request reached the public authority. */
export const FILING_ROUTES = [
  {
    id: "pio",
    label: "Directly with the Public Information Officer",
    extraDays: 0,
    note: "The thirty-day clock runs from the date the PIO receives the application.",
  },
  {
    id: "apio",
    label: "Through an Assistant Public Information Officer",
    extraDays: APIO_EXTRA_DAYS,
    note: `Section 5(2) adds ${APIO_EXTRA_DAYS} days when the request is handed to an APIO, because the application still has to travel to the PIO.`,
  },
];

function roundPaise(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when unreal.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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

function describe(stamp) {
  const date = new Date(stamp);
  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    long: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
  };
}

/**
 * Format yyyy-mm-dd as "3 August 2026".
 * @param {string} iso
 * @returns {string|null}
 */
export function formatIsoLong(iso) {
  const stamp = parseIsoDate(iso);
  return stamp === null ? null : describe(stamp).long;
}

/**
 * Fee payable on an RTI request.
 *
 * A person below the poverty line pays nothing at all (Rule 8, RTI Rules 2012
 * and the proviso to Section 7(5) of the Act). Where the public authority has
 * missed the Section 7(1) deadline, no FURTHER fee may be charged for the
 * information, though the ten-rupee application fee already paid is not
 * refunded - Section 7(6).
 *
 * @param {object} input
 * @param {boolean} [input.isBpl]
 * @param {number} [input.pages]            A-4 or A-3 pages copied.
 * @param {number} [input.largePages]       Pages in a larger size of paper.
 * @param {number} [input.largePageCost]    Actual cost of one such page.
 * @param {number} [input.mediaCount]       CDs or diskettes supplied.
 * @param {number} [input.inspectionHours]  Hours of record inspection.
 * @param {number} [input.publicationCost]  Price fixed for a publication.
 * @param {boolean} [input.deadlineMissed]  Section 7(6) applies.
 * @param {number} [input.applicationFee]   Override for a state's own rate.
 * @param {number} [input.pageFee]          Override for a state's own rate.
 * @returns {{applicationFee:number, pageFee:number, largePageFee:number,
 *            mediaFee:number, inspectionFee:number, publicationFee:number,
 *            chargeableInspectionHours:number, additionalFee:number,
 *            totalPayable:number, freeUnderSection76:boolean,
 *            exemptUnderRule8:boolean} | {error:string}}
 */
export function computeRtiFees({
  isBpl = false,
  pages = 0,
  largePages = 0,
  largePageCost = 0,
  mediaCount = 0,
  inspectionHours = 0,
  publicationCost = 0,
  deadlineMissed = false,
  applicationFee = APPLICATION_FEE_INR,
  pageFee = PAGE_FEE_INR,
}) {
  const values = {
    pages: Number(pages),
    largePages: Number(largePages),
    largePageCost: Number(largePageCost),
    mediaCount: Number(mediaCount),
    inspectionHours: Number(inspectionHours),
    publicationCost: Number(publicationCost),
    applicationFee: Number(applicationFee),
    pageFee: Number(pageFee),
  };

  if (!Object.values(values).every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (Object.values(values).some((value) => value < 0)) {
    return { error: "Counts, rates and costs cannot be negative." };
  }
  if (!Number.isInteger(values.pages) || !Number.isInteger(values.largePages)) {
    return { error: "Page counts must be whole numbers." };
  }
  if (!Number.isInteger(values.mediaCount)) {
    return { error: "The number of CDs or diskettes must be a whole number." };
  }
  if (values.pages > MAX_PAGES || values.largePages > MAX_PAGES) {
    return { error: `A single request of more than ${MAX_PAGES} pages is outside what this tool estimates.` };
  }
  if (values.mediaCount > MAX_MEDIA) {
    return { error: `More than ${MAX_MEDIA} discs is outside what this tool estimates.` };
  }
  if (values.inspectionHours > MAX_INSPECTION_HOURS) {
    return { error: `More than ${MAX_INSPECTION_HOURS} hours of inspection is outside what this tool estimates.` };
  }

  if (isBpl) {
    return {
      applicationFee: 0,
      pageFee: 0,
      largePageFee: 0,
      mediaFee: 0,
      inspectionFee: 0,
      publicationFee: 0,
      chargeableInspectionHours: 0,
      additionalFee: 0,
      totalPayable: 0,
      freeUnderSection76: false,
      exemptUnderRule8: true,
    };
  }

  // Rule 4(f): the first hour is free, then each hour or PART of an hour is charged.
  const chargeableInspectionHours = Math.max(
    0,
    Math.ceil(values.inspectionHours) - INSPECTION_FREE_HOURS,
  );

  const pageCharge = roundPaise(values.pages * values.pageFee);
  const largePageCharge = roundPaise(values.largePages * values.largePageCost);
  const mediaCharge = roundPaise(values.mediaCount * MEDIA_FEE_INR);
  const inspectionCharge = roundPaise(chargeableInspectionHours * INSPECTION_HOURLY_INR);
  const publicationCharge = roundPaise(values.publicationCost);

  const additionalFee = deadlineMissed
    ? 0
    : roundPaise(pageCharge + largePageCharge + mediaCharge + inspectionCharge + publicationCharge);

  return {
    applicationFee: roundPaise(values.applicationFee),
    pageFee: deadlineMissed ? 0 : pageCharge,
    largePageFee: deadlineMissed ? 0 : largePageCharge,
    mediaFee: deadlineMissed ? 0 : mediaCharge,
    inspectionFee: deadlineMissed ? 0 : inspectionCharge,
    publicationFee: deadlineMissed ? 0 : publicationCharge,
    chargeableInspectionHours,
    additionalFee,
    totalPayable: roundPaise(values.applicationFee + additionalFee),
    freeUnderSection76: deadlineMissed,
    exemptUnderRule8: false,
  };
}

/**
 * Every date that flows from the day the request is received.
 *
 * @param {object} input
 * @param {string} input.filedDate            yyyy-mm-dd the request is received.
 * @param {string} [input.routeId]            One of FILING_ROUTES ids.
 * @param {boolean} [input.lifeLiberty]       48-hour proviso to Section 7(1).
 * @param {boolean} [input.thirdParty]        Section 11(3) forty-day track.
 * @param {string} [input.feeIntimationDate]  yyyy-mm-dd a further fee was demanded.
 * @param {string} [input.feePaidDate]        yyyy-mm-dd that fee was paid.
 * @param {string} [input.appealFiledDate]    yyyy-mm-dd the first appeal is filed.
 * @returns {{baseDays:number, extraDays:number, excludedDays:number,
 *            totalDays:number, basisText:string,
 *            replyDue:{iso:string,long:string},
 *            transferBy:{iso:string,long:string},
 *            firstAppealBy:{iso:string,long:string},
 *            appealAssumed:boolean,
 *            faaDecisionDue:{iso:string,long:string},
 *            faaExtendedDue:{iso:string,long:string},
 *            secondAppealBy:{iso:string,long:string},
 *            maxPenaltyDays:number} | {error:string}}
 */
export function computeRtiDeadlines({
  filedDate,
  routeId = "pio",
  lifeLiberty = false,
  thirdParty = false,
  feeIntimationDate = "",
  feePaidDate = "",
  appealFiledDate = "",
}) {
  const filed = parseIsoDate(filedDate);
  if (filed === null) return { error: "Enter a valid filing date in yyyy-mm-dd form." };

  const route = FILING_ROUTES.find((item) => item.id === routeId);
  if (!route) return { error: "Choose how the application was filed." };

  let baseDays = REPLY_DAYS;
  let basisText = `${REPLY_DAYS} days under Section 7(1)`;
  if (lifeLiberty) {
    baseDays = LIFE_LIBERTY_DAYS;
    basisText = `${LIFE_LIBERTY_HOURS} hours under the proviso to Section 7(1)`;
  } else if (thirdParty) {
    baseDays = THIRD_PARTY_DAYS;
    basisText = `${THIRD_PARTY_DAYS} days under Section 11(3) because third-party information is involved`;
  }

  let excludedDays = 0;
  if (feeIntimationDate || feePaidDate) {
    const intimated = parseIsoDate(feeIntimationDate);
    const paid = parseIsoDate(feePaidDate);
    if (intimated === null || paid === null) {
      return { error: "Enter both the further-fee intimation date and the payment date, or neither." };
    }
    if (paid < intimated) {
      return { error: "The fee cannot be paid before it was demanded." };
    }
    if (intimated < filed) {
      return { error: "The further-fee intimation cannot pre-date the application." };
    }
    excludedDays = Math.round((paid - intimated) / MS_PER_DAY);
  }

  const totalDays = baseDays + route.extraDays + excludedDays;
  const replyDueStamp = filed + totalDays * MS_PER_DAY;
  const firstAppealByStamp = replyDueStamp + FIRST_APPEAL_DAYS * MS_PER_DAY;

  const supplied = parseIsoDate(appealFiledDate);
  if (appealFiledDate && supplied === null) {
    return { error: "The first appeal date is not a valid yyyy-mm-dd date." };
  }
  if (supplied !== null && supplied < replyDueStamp) {
    return { error: "A first appeal runs from the reply date or from the expiry of the reply period, not before it." };
  }
  if (supplied !== null && supplied > firstAppealByStamp) {
    return { error: "That appeal date is beyond the thirty days allowed by Section 19(1); condonation would have to be sought." };
  }
  const appealStamp = supplied === null ? firstAppealByStamp : supplied;

  const faaDecisionStamp = appealStamp + FAA_DECISION_DAYS * MS_PER_DAY;

  return {
    baseDays,
    extraDays: route.extraDays,
    excludedDays,
    totalDays,
    basisText,
    routeNote: route.note,
    replyDue: describe(replyDueStamp),
    transferBy: describe(filed + TRANSFER_DAYS * MS_PER_DAY),
    firstAppealBy: describe(firstAppealByStamp),
    appealAssumed: supplied === null,
    appealFiled: describe(appealStamp),
    faaDecisionDue: describe(faaDecisionStamp),
    faaExtendedDue: describe(appealStamp + FAA_EXTENDED_DAYS * MS_PER_DAY),
    secondAppealBy: describe(faaDecisionStamp + SECOND_APPEAL_DAYS * MS_PER_DAY),
    maxPenaltyDays: Math.floor(PENALTY_CAP_INR / PENALTY_PER_DAY_INR),
  };
}

/**
 * Penalty exposure of a PIO for a delayed reply, under Section 20(1).
 *
 * Only an Information Commission can impose this; the figure is what the
 * section allows, capped at Rs 25,000.
 *
 * @param {object} input
 * @param {string} input.replyDueIso  yyyy-mm-dd the reply was due.
 * @param {string} input.asOnIso      yyyy-mm-dd the delay is measured on.
 * @returns {{delayDays:number, exposureInr:number, capped:boolean} | {error:string}}
 */
export function computePenaltyExposure({ replyDueIso, asOnIso }) {
  const due = parseIsoDate(replyDueIso);
  const asOn = parseIsoDate(asOnIso);
  if (due === null || asOn === null) {
    return { error: "Enter valid dates in yyyy-mm-dd form." };
  }
  const delayDays = Math.max(0, Math.round((asOn - due) / MS_PER_DAY));
  const raw = delayDays * PENALTY_PER_DAY_INR;
  return {
    delayDays,
    exposureInr: Math.min(raw, PENALTY_CAP_INR),
    capped: raw > PENALTY_CAP_INR,
  };
}
