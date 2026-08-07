/**
 * RTI application drafter for a stuck or rejected scholarship.
 *
 * A scholarship application on the National Scholarship Portal passes through
 * a fixed chain - student submission, institute (Institute Nodal Officer)
 * verification, district or state verification, ministry sanction, and then
 * payment by Direct Benefit Transfer through PFMS into an Aadhaar-seeded bank
 * account. Every one of those steps leaves a dated record, and this drafter
 * asks for the record at each step rather than asking the office to explain
 * itself.
 *
 * The statutory hooks used in the drafted application:
 *
 *  - Right to Information Act 2005, Section 6(1): application to the Public
 *    Information Officer of the public authority holding the record.
 *  - Section 6(2): no reason for the request need be given.
 *  - Section 6(3): where the record is held by another public authority - the
 *    institute, the district social welfare office, the state department or
 *    the ministry - the application must be transferred within FIVE days.
 *  - Section 4(1)(d): a public authority must PROVIDE REASONS for its
 *    administrative or quasi-judicial decisions to affected persons. This is
 *    the provision that makes "why was my scholarship rejected" a proper RTI
 *    question rather than a request for an opinion.
 *  - Section 7(1): reply within THIRTY days; forty-eight hours for life or
 *    liberty.
 *  - Section 7(5): no fee for a person below the poverty line.
 *  - Section 7(6): free information if the deadline is missed.
 *  - Section 7(9): information to be given in the form in which it is sought,
 *    unless that would disproportionately divert resources.
 *  - Section 10(1): exempt material to be severed and the rest supplied.
 *  - Section 19(1) and 19(3): first appeal in thirty days, second appeal in
 *    ninety days.
 *  - Section 20(1): penalty of Rs 250 per day up to Rs 25,000 on the PIO.
 *  - RTI Rules 2012, Rule 3: application fee Rs 10; Rule 4: Rs 2 per A-4 page,
 *    inspection free for the first hour and Rs 5 per hour after that.
 *
 * Informational only; not legal or financial advice.
 */

/** Section 7(1), RTI Act 2005. */
export const REPLY_DAYS = 30;
/** Section 6(3), RTI Act 2005. */
export const TRANSFER_DAYS = 5;
/** Section 19(1), RTI Act 2005. */
export const FIRST_APPEAL_DAYS = 30;
/** Section 19(6) - FAA decision window and its outer limit. */
export const FAA_DECISION_DAYS = 30;
export const FAA_EXTENDED_DAYS = 45;
/** Section 19(3), RTI Act 2005. */
export const SECOND_APPEAL_DAYS = 90;
/** Section 20(1), RTI Act 2005. */
export const PENALTY_PER_DAY_INR = 250;
export const PENALTY_CAP_INR = 25000;
/** Rule 3, RTI Rules 2012. */
export const APPLICATION_FEE_INR = 10;

const MS_PER_DAY = 86400000;
const MAX_FIELD = 120;

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

/** Who to address, depending on where the file appears to be stuck. */
export const AUTHORITY_LEVELS = [
  {
    id: "institute",
    label: "The institute (Institute Nodal Officer)",
    holds:
      "the institute-level verification record, the date the application was verified or defected, and the register of applications forwarded",
  },
  {
    id: "district",
    label: "District social welfare / minority welfare office",
    holds:
      "the district-level verification record and the list of applications forwarded to the state",
  },
  {
    id: "state",
    label: "State department running the scheme",
    holds: "the sanction list, the fund release order and the state-level rejection record",
  },
  {
    id: "ministry",
    label: "Central ministry administering the scheme",
    holds:
      "the sanction order, the fund allotment to the state, and the scheme guidelines as they applied to your year",
  },
];

/** What went wrong, and the queries that get to the bottom of it. */
export const PROBLEM_TYPES = [
  {
    id: "not-verified",
    label: "Application still not verified by the institute or district",
    intro: "my scholarship application not having been verified at the institute or district level",
    queries: [
      "The date on which my application was received at each verification level, the date it was acted on at that level, and the present status recorded against it.",
      "The name and designation of the officer responsible for verifying applications of my category at the level where my application is presently resting.",
      "The number of applications of the same scheme and academic year pending verification at this office as on the date this application is answered, in numbers only.",
      "The internal timeline, circular or office order fixing how long verification at this level may take.",
    ],
  },
  {
    id: "rejected",
    label: "Application rejected and I want the recorded reason",
    intro:
      "the reasons recorded for the rejection of my scholarship application, which Section 4(1)(d) of the Right to Information Act 2005 requires to be provided to an affected person",
    queries: [
      "A copy of the order, note or system entry rejecting my application, showing the exact ground of rejection, the date of the decision and the designation of the officer who took it.",
      "The scheme guideline, eligibility clause or circular relied on for that rejection, as it stood on the date I applied.",
      "A copy of any document or check-list on the basis of which my application was found ineligible, and whether I was given an opportunity to correct the defect before the decision.",
      "The procedure and the time limit for filing an appeal or representation against a rejection under this scheme, and the authority to whom it lies.",
    ],
  },
  {
    id: "sanctioned-not-paid",
    label: "Sanctioned but the money has not reached my account",
    intro:
      "the disbursal of a scholarship that has been sanctioned in my name but has not reached my bank account",
    queries: [
      "A copy of the sanction order under which my scholarship was sanctioned, with the sanctioned amount and the date of sanction.",
      "The date on which the payment file containing my name was generated, the date it was signed by the drawing and disbursing officer, and the date it was pushed for payment.",
      "The Direct Benefit Transfer or PFMS transaction reference, the unique transaction number and the date of the credit or of the failure, as recorded in the payment system for my application.",
      "Where the payment failed, the failure reason recorded by the bank or the payment system, and what the office is required to do to re-initiate it.",
      "The bank account number, in masked form, and the Aadhaar seeding or NPCI mapping status recorded against my application at the time of payment.",
    ],
  },
  {
    id: "partial-payment",
    label: "Only part of the sanctioned amount was received",
    intro: "a scholarship instalment received in part against the sanctioned amount",
    queries: [
      "The total amount sanctioned to me for the academic year stated, broken up into maintenance allowance, fee component and any other head.",
      "Every instalment released against my application, with the amount, the date of release and the transaction reference of each.",
      "The reason recorded for any head or instalment not having been released, and the date by which it is due to be released.",
      "A copy of the scheme guideline fixing the rate of each head of the scholarship for my category and course for that academic year.",
    ],
  },
  {
    id: "renewal-blocked",
    label: "Renewal blocked or reverted",
    intro: "the renewal of my scholarship having been blocked, reverted or not processed",
    queries: [
      "The status of my renewal application, the date of each action taken on it, and the level at which it is presently pending.",
      "The reason recorded for the renewal having been reverted or blocked, with a copy of the note or system entry recording it.",
      "The eligibility condition for renewal under this scheme, including any attendance or marks requirement, as it stood for the academic year stated.",
      "A copy of the record showing the attendance, marks or promotion status of mine that the office relied on while processing the renewal.",
    ],
  },
];

/** Questions worth attaching to almost any scholarship RTI. */
export const COMMON_QUERIES = [
  {
    id: "guidelines",
    label: "Scheme guidelines for my academic year",
    text: "A copy of the scheme guidelines, including the income ceiling, the rates payable and the eligibility conditions, as they stood for the academic year for which I applied.",
  },
  {
    id: "timeline-circular",
    label: "Official processing timeline",
    text: "A copy of every circular or office order fixing the timeline within which applications under this scheme are to be verified, sanctioned and disbursed.",
  },
  {
    id: "fund-release",
    label: "Fund release to the state or institute",
    text: "The dates and amounts of funds released for this scheme and academic year to the state or to the institute, and the balance of those funds remaining undisbursed on the date this application is answered.",
  },
  {
    id: "pending-count",
    label: "How many applications are still pending",
    text: "The number of applications under this scheme and academic year that are verified but not yet paid, in numbers only, as on the date this application is answered.",
  },
  {
    id: "grievance-action",
    label: "Action taken on my grievances so far",
    text: "The action taken on each grievance, ticket or representation submitted by me on this application, with the date each was received, the officer it was marked to and the action recorded against it.",
  },
  {
    id: "pio-details",
    label: "PIO and appellate authority details",
    text: "The name, designation and address of the Public Information Officer and of the First Appellate Authority of this office, published under Section 4(1)(b) of the Right to Information Act 2005.",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
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
 * Calendar difference between two dates, in years, months and days.
 *
 * Month arithmetic clamps to the last day of the target month, so
 * 31 January to 1 March is one month and one day, not two months.
 *
 * @param {string} fromIso yyyy-mm-dd
 * @param {string} toIso   yyyy-mm-dd
 * @returns {{years:number, months:number, days:number, totalDays:number,
 *            text:string} | {error:string}}
 */
export function calendarGap(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (from === null || to === null) {
    return { error: "Enter valid dates in yyyy-mm-dd form." };
  }
  if (to < from) {
    return { error: "The later date falls before the earlier one." };
  }

  const start = new Date(from);
  const end = new Date(to);
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  if (end.getUTCDate() < start.getUTCDate()) months -= 1;
  if (months < 0) months = 0;

  const anchorYear = start.getUTCFullYear() + Math.floor((start.getUTCMonth() + months) / 12);
  const anchorMonth = (start.getUTCMonth() + months) % 12;
  const lastDayOfAnchorMonth = new Date(Date.UTC(anchorYear, anchorMonth + 1, 0)).getUTCDate();
  const anchorDay = Math.min(start.getUTCDate(), lastDayOfAnchorMonth);
  const anchor = Date.UTC(anchorYear, anchorMonth, anchorDay);

  const days = Math.round((to - anchor) / MS_PER_DAY);
  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (restMonths > 0) parts.push(`${restMonths} month${restMonths === 1 ? "" : "s"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);

  return {
    years,
    months: restMonths,
    days,
    totalDays: Math.round((to - from) / MS_PER_DAY),
    text: parts.join(", "),
  };
}

/**
 * Statutory RTI dates flowing from the day the application is received.
 *
 * @param {object} input
 * @param {string} input.filedDate
 * @param {boolean} [input.lifeLiberty]
 * @returns {object|{error:string}}
 */
export function computeRtiTimeline({ filedDate, lifeLiberty = false }) {
  const filed = parseIsoDate(filedDate);
  if (filed === null) return { error: "Enter a valid RTI filing date in yyyy-mm-dd form." };

  const replyDue = filed + (lifeLiberty ? 2 : REPLY_DAYS) * MS_PER_DAY;
  const firstAppealBy = replyDue + FIRST_APPEAL_DAYS * MS_PER_DAY;
  const faaDecisionDue = firstAppealBy + FAA_DECISION_DAYS * MS_PER_DAY;

  return {
    replyDue: describe(replyDue),
    transferBy: describe(filed + TRANSFER_DAYS * MS_PER_DAY),
    firstAppealBy: describe(firstAppealBy),
    faaDecisionDue: describe(faaDecisionDue),
    faaExtendedDue: describe(firstAppealBy + FAA_EXTENDED_DAYS * MS_PER_DAY),
    secondAppealBy: describe(faaDecisionDue + SECOND_APPEAL_DAYS * MS_PER_DAY),
    replyWindowText: lifeLiberty
      ? "48 hours (life and liberty proviso to Section 7(1))"
      : `${REPLY_DAYS} days (Section 7(1))`,
  };
}

/**
 * Draft the RTI application about a scholarship.
 *
 * @param {object} input
 * @param {string} input.studentName
 * @param {string} input.address
 * @param {string} input.phone
 * @param {string} input.email
 * @param {string} input.authorityName    Office the application is addressed to.
 * @param {string} input.levelId          One of AUTHORITY_LEVELS ids.
 * @param {string} input.schemeName       Scholarship scheme name.
 * @param {string} input.academicYear     e.g. "2025-26".
 * @param {string} input.applicationId    NSP or state portal application id.
 * @param {string} input.instituteName
 * @param {string} input.appliedDate      yyyy-mm-dd the scholarship was applied for.
 * @param {string} input.problemId        One of PROBLEM_TYPES ids.
 * @param {string[]} input.commonQueryIds
 * @param {string} input.filedDate        yyyy-mm-dd the RTI is filed.
 * @param {string} input.asOnDate         yyyy-mm-dd the pendency is measured on.
 * @param {boolean} [input.isBpl]
 * @param {boolean} [input.wantsInspection]
 * @param {boolean} [input.lifeLiberty]
 * @returns {{application:string, subject:string, queryCount:number,
 *            timeline:object, pendency:object, levelNote:string} | {error:string}}
 */
export function buildScholarshipRti({
  studentName,
  address,
  phone,
  email,
  authorityName,
  levelId,
  schemeName,
  academicYear,
  applicationId,
  instituteName,
  appliedDate,
  problemId,
  commonQueryIds = [],
  filedDate,
  asOnDate,
  isBpl = false,
  wantsInspection = false,
  lifeLiberty = false,
}) {
  const name = clean(studentName);
  const addr = clean(address);
  const tel = clean(phone);
  const mail = clean(email);
  const authority = clean(authorityName);
  const scheme = clean(schemeName);
  const year = clean(academicYear);
  const appId = clean(applicationId);
  const institute = clean(instituteName);

  if (!name) return { error: "Enter the student's name." };
  if (!addr) return { error: "Enter a postal address - the reply is sent there." };
  if (!authority) return { error: "Enter the office the application is addressed to." };
  if (!scheme) return { error: "Enter the name of the scholarship scheme." };
  if (!year) return { error: "Enter the academic year, for example 2025-26." };
  if (!appId) return { error: "Enter the application or registration number from the portal." };
  if ([name, tel, mail, authority, scheme, year, appId, institute].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }
  if (addr.length > 400) return { error: "Keep the address under 400 characters." };

  const level = AUTHORITY_LEVELS.find((item) => item.id === levelId);
  if (!level) return { error: "Choose which office you are writing to." };

  const problem = PROBLEM_TYPES.find((item) => item.id === problemId);
  if (!problem) return { error: "Choose what has gone wrong with the application." };

  const appliedLong = formatIsoLong(appliedDate);
  if (!appliedLong) return { error: "Enter a valid date on which the scholarship was applied for." };

  const timeline = computeRtiTimeline({ filedDate, lifeLiberty });
  if (timeline.error) return { error: timeline.error };
  const filedLong = formatIsoLong(filedDate);

  const pendency = calendarGap(appliedDate, asOnDate);
  if (pendency.error) {
    return { error: `Pendency: ${pendency.error}` };
  }

  const extras = COMMON_QUERIES.filter((query) => commonQueryIds.includes(query.id));
  const queries = [
    `The present status of my application bearing number ${appId} under the ${scheme} for the academic year ${year}, stated in plain words, along with the date on which it reached that status.`,
    ...problem.queries,
    ...extras.map((query) => query.text),
  ];

  const feeLine = isBpl
    ? "Fee: not payable. I am a person below the poverty line and am exempt under Section 7(5) of the Act; a copy of my BPL card is enclosed."
    : `Fee: Rs ${APPLICATION_FEE_INR} paid as the application fee prescribed by Rule 3 of the Right to Information Rules 2012, with proof of payment enclosed.`;

  const inspectionLine = wantsInspection
    ? "I would first like to inspect the relevant file under Section 2(j)(i) of the Act. Please fix a date and time for inspection; the first hour is free and each subsequent hour costs Rs 5 under Rule 4 of the RTI Rules 2012."
    : "";

  const application = [
    "APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005",
    "",
    `Date: ${filedLong}`,
    "",
    "To,",
    "The Public Information Officer",
    authority,
    "",
    `Subject: Status, sanction and disbursal record of ${scheme} application number ${appId} for the academic year ${year}`,
    "",
    "Sir / Madam,",
    "",
    `I, ${name}, a citizen of India${institute ? ` and a student of ${institute}` : ""}, seek the following information under Section 6(1) of the Right to Information Act, 2005 in respect of my own scholarship application bearing number ${appId} under the ${scheme} for the academic year ${year}, submitted on ${appliedLong}. The subject of this application is ${problem.intro}. As on ${formatIsoLong(asOnDate)} the application has been pending for ${pendency.text}.`,
    "",
    "Information sought:",
    ...queries.map((query, index) => `${index + 1}. ${query}`),
    "",
    ...(inspectionLine ? [inspectionLine, ""] : []),
    `Please supply the information in the form in which it is sought, as Section 7(9) of the Act requires. If any part is treated as exempt, please state the exact clause of Section 8 or Section 9 relied on and supply the remainder after severance under Section 10(1). This office holds ${level.holds}; if any part of the information is held by another public authority, please transfer that part within five days under Section 6(3) and inform me of the transfer.`,
    "",
    `I am not required to give any reason for seeking this information, as Section 6(2) provides. ${feeLine}`,
    "",
    `The information is due within ${timeline.replyWindowText}, that is on or before ${timeline.replyDue.long}. If that date passes, the information becomes free of charge under Section 7(6), and Section 20(1) provides for a penalty of Rs ${PENALTY_PER_DAY_INR} per day of delay up to Rs ${PENALTY_CAP_INR}.`,
    "",
    "Yours faithfully,",
    "",
    name,
    addr,
    ...(tel ? [`Phone: ${tel}`] : []),
    ...(mail ? [`Email: ${mail}`] : []),
    `Application number: ${appId}`,
  ].join("\n");

  return {
    application,
    subject: `Status, sanction and disbursal record of ${scheme} application number ${appId} for the academic year ${year}`,
    queryCount: queries.length,
    timeline,
    pendency,
    levelNote: `This office holds ${level.holds}. If the record you need sits at a different level, name that office instead - the application will otherwise be transferred under Section 6(3) and lose five days.`,
  };
}
