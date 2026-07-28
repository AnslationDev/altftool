/**
 * RTI application drafter for a stuck passport file.
 *
 * Every rule quoted in the drafted application is from the Right to
 * Information Act 2005 and the Right to Information Rules 2012 (Central):
 *
 *  - Section 6(1): the application goes in writing or electronically to the
 *    Central Public Information Officer of the public authority concerned. For
 *    passports that is the CPIO of the Regional Passport Office under the
 *    Ministry of External Affairs.
 *  - Section 6(2): the applicant is NOT required to give any reason for
 *    seeking the information, or any personal detail beyond what is needed to
 *    contact them. The drafted letter says so explicitly.
 *  - Section 6(3): if the information is held by another public authority, the
 *    application must be transferred to it within FIVE days. Police
 *    verification is done by the state police, so that transfer clause matters
 *    for passport files.
 *  - Section 7(1): reply within THIRTY days of receipt; within FORTY-EIGHT
 *    hours where the request concerns the life or liberty of a person.
 *  - Section 7(5): a person below the poverty line pays NO fee.
 *  - Section 7(6): if the CPIO misses the deadline, the information must be
 *    supplied FREE of charge.
 *  - Section 8(1)(j): personal information about a third party can be
 *    withheld, but it does not bar an applicant from getting information about
 *    their own file - which is why the queries below stay on the applicant's
 *    own application.
 *  - Section 19(1): first appeal to the First Appellate Authority within
 *    THIRTY days of the reply or of the expiry of the reply period; the FAA
 *    decides within thirty days, extendable to forty-five with reasons.
 *  - Section 19(3): second appeal to the Central Information Commission within
 *    NINETY days.
 *  - Section 20(1): a penalty of Rs 250 per day of delay, up to Rs 25,000, may
 *    be imposed on the CPIO.
 *  - RTI Rules 2012, Rule 3: application fee of Rs 10.
 *  - RTI Rules 2012, Rule 4: Rs 2 per A-4 or A-3 page created or copied,
 *    Rs 50 per CD, and inspection free for the first hour then Rs 5 per hour.
 *
 * This module is date arithmetic and text assembly only. It is informational
 * and is not legal advice.
 */

/** Section 7(1), RTI Act 2005 - ordinary reply period. */
export const REPLY_DAYS = 30;
/** Section 6(3) - transfer to the correct public authority. */
export const TRANSFER_DAYS = 5;
/** Section 19(1) - window to file the first appeal. */
export const FIRST_APPEAL_DAYS = 30;
/** Section 19(6) - FAA decides within thirty days, extendable to forty-five. */
export const FAA_DECISION_DAYS = 30;
export const FAA_EXTENDED_DAYS = 45;
/** Section 19(3) - window to file the second appeal. */
export const SECOND_APPEAL_DAYS = 90;
/** Section 20(1) - penalty per day of delay and its ceiling. */
export const PENALTY_PER_DAY_INR = 250;
export const PENALTY_CAP_INR = 25000;
/** Rule 3, RTI Rules 2012 - application fee. */
export const APPLICATION_FEE_INR = 10;
/** Section 7(1) proviso - life and liberty cases, in hours. */
export const LIFE_LIBERTY_HOURS = 48;

const MS_PER_DAY = 86400000;
/** Longest a free-text field may run so the application stays readable. */
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

/** Where the passport application appears to be stuck. */
export const STUCK_STAGES = [
  {
    id: "police-verification",
    label: "Police verification not started or not returned",
    focus:
      "the police verification request sent to the police station and the report, if any, received back",
  },
  {
    id: "adverse-report",
    label: "Adverse or incomplete police report suspected",
    focus: "the content and consequence of the police verification report on file",
  },
  {
    id: "granted-not-printed",
    label: "Status shows granted but the passport has not been printed or despatched",
    focus: "printing, despatch and the speed post consignment number",
  },
  {
    id: "document-query",
    label: "A document query or shortfall was raised",
    focus: "the query raised, when it was communicated, and what closes it",
  },
  {
    id: "re-issue-delay",
    label: "Re-issue or renewal pending beyond the normal timeline",
    focus: "the stage the re-issue file is resting at and who holds it",
  },
  {
    id: "tatkal-delay",
    label: "Tatkal application not decided in the tatkal timeline",
    focus: "why the tatkal scheme timeline was not met on this file",
  },
  {
    id: "no-status",
    label: "Status page has not moved at all",
    focus: "the complete movement of the file since submission",
  },
];

/** Optional extra questions a passport applicant commonly needs. */
export const OPTIONAL_QUERIES = [
  {
    id: "file-movement",
    label: "Day-by-day file movement",
    text: "A certified copy of the movement record or noting sheet of my file, showing the date on which it reached each desk, the designation of the officer who held it, and the date it left that desk.",
  },
  {
    id: "officer-details",
    label: "Name and designation of the officer holding the file",
    text: "The name and designation of the officer with whom my file is presently pending, and the date on which it was marked to that officer.",
  },
  {
    id: "pv-dispatch",
    label: "Police verification despatch and receipt dates",
    text: "The date on which the police verification request for my application was sent to the police authority, the name of the police station or unit it was sent to, the mode of transmission, and the date on which the report was received back, if it has been received.",
  },
  {
    id: "pending-reason",
    label: "Reason for pendency in writing",
    text: "The reason recorded on the file for my application remaining undecided beyond the timeline published in the citizen's charter of the Ministry of External Affairs, along with a copy of any note recording that reason.",
  },
  {
    id: "citizen-charter",
    label: "The applicable citizen's charter timeline",
    text: "A copy of the citizen's charter or office order that fixes the timeline for deciding an application of the category I have applied under, as it stood on the date I applied.",
  },
  {
    id: "pendency-count",
    label: "How many similar files are pending",
    text: "The number of applications of the same category and same date of submission at this office that are still undecided as on the date this application is answered, in numbers only.",
  },
  {
    id: "grievance-action",
    label: "Action taken on grievances already filed",
    text: "The action taken on each grievance or reminder submitted by me on this application, with the date each was received, the officer it was marked to, and the action recorded against it.",
  },
  {
    id: "expected-date",
    label: "Expected date of decision",
    text: "The date by which my application is expected to be decided, as recorded on the file; if no such date is recorded, a categorical statement that no such date exists on the file.",
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
 * All statutory dates that flow from the day an RTI is received.
 *
 * @param {object} input
 * @param {string} input.filedDate        yyyy-mm-dd the CPIO receives the application.
 * @param {boolean} [input.lifeLiberty]   Request concerns life or liberty (48-hour rule).
 * @param {string} [input.appealFiledDate] yyyy-mm-dd the first appeal is filed.
 * @returns {{replyDue:{iso:string,long:string}, transferBy:{iso:string,long:string},
 *            firstAppealBy:{iso:string,long:string}, appealAssumed:boolean,
 *            appealFiled:{iso:string,long:string},
 *            faaDecisionDue:{iso:string,long:string},
 *            faaExtendedDue:{iso:string,long:string},
 *            secondAppealBy:{iso:string,long:string},
 *            replyWindowText:string, maxPenaltyDays:number} | {error:string}}
 */
export function computeRtiTimeline({ filedDate, lifeLiberty = false, appealFiledDate = "" }) {
  const filed = parseIsoDate(filedDate);
  if (filed === null) return { error: "Enter a valid filing date in yyyy-mm-dd form." };

  const replyDays = lifeLiberty ? 2 : REPLY_DAYS;
  const replyDue = filed + replyDays * MS_PER_DAY;
  const firstAppealBy = replyDue + FIRST_APPEAL_DAYS * MS_PER_DAY;

  const supplied = parseIsoDate(appealFiledDate);
  if (appealFiledDate && supplied === null) {
    return { error: "The first appeal date is not a valid yyyy-mm-dd date." };
  }
  if (supplied !== null && supplied < replyDue) {
    return {
      error: "A first appeal cannot be filed before the reply period under Section 7(1) has expired.",
    };
  }
  const appealFiled = supplied === null ? firstAppealBy : supplied;

  const faaDecisionDue = appealFiled + FAA_DECISION_DAYS * MS_PER_DAY;
  const faaExtendedDue = appealFiled + FAA_EXTENDED_DAYS * MS_PER_DAY;
  const secondAppealBy = faaDecisionDue + SECOND_APPEAL_DAYS * MS_PER_DAY;

  return {
    replyDue: describe(replyDue),
    transferBy: describe(filed + TRANSFER_DAYS * MS_PER_DAY),
    firstAppealBy: describe(firstAppealBy),
    appealAssumed: supplied === null,
    appealFiled: describe(appealFiled),
    faaDecisionDue: describe(faaDecisionDue),
    faaExtendedDue: describe(faaExtendedDue),
    secondAppealBy: describe(secondAppealBy),
    replyWindowText: lifeLiberty
      ? `${LIFE_LIBERTY_HOURS} hours (life and liberty proviso to Section 7(1))`
      : `${REPLY_DAYS} days (Section 7(1))`,
    maxPenaltyDays: Math.floor(PENALTY_CAP_INR / PENALTY_PER_DAY_INR),
  };
}

/**
 * Draft the RTI application.
 *
 * @param {object} input
 * @param {string} input.applicantName
 * @param {string} input.address
 * @param {string} input.phone
 * @param {string} input.email
 * @param {string} input.passportOffice   Regional Passport Office addressed.
 * @param {string} input.fileNumber       File / ARN number on the receipt.
 * @param {string} input.applicationDate  yyyy-mm-dd the passport application was made.
 * @param {string} input.applicationType  Fresh, re-issue, tatkal and so on.
 * @param {string} input.stageId          One of STUCK_STAGES ids.
 * @param {string[]} input.queryIds       Ticked OPTIONAL_QUERIES ids.
 * @param {string} input.filedDate        yyyy-mm-dd the RTI is filed.
 * @param {boolean} [input.isBpl]         Below poverty line - no fee.
 * @param {boolean} [input.lifeLiberty]   Life or liberty case.
 * @param {string} [input.lifeLibertyReason]
 * @param {boolean} [input.wantsCertified] Ask for certified copies.
 * @returns {{application:string, subject:string, queryCount:number,
 *            feeLine:string, timeline:object} | {error:string}}
 */
export function buildPassportRti({
  applicantName,
  address,
  phone,
  email,
  passportOffice,
  fileNumber,
  applicationDate,
  applicationType,
  stageId,
  queryIds = [],
  filedDate,
  isBpl = false,
  lifeLiberty = false,
  lifeLibertyReason = "",
  wantsCertified = true,
}) {
  const name = clean(applicantName);
  const addr = clean(address);
  const tel = clean(phone);
  const mail = clean(email);
  const office = clean(passportOffice);
  const file = clean(fileNumber);
  const type = clean(applicationType) || "passport";
  const reason = clean(lifeLibertyReason);

  if (!name) return { error: "Enter the applicant's name." };
  if (!addr) return { error: "Enter a postal address - the reply is sent there." };
  if (!office) return { error: "Enter the Regional Passport Office the application was made to." };
  if (!file) return { error: "Enter the file or ARN number printed on your passport receipt." };
  if ([name, tel, mail, office, file, type].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }
  if (addr.length > 400) return { error: "Keep the address under 400 characters." };

  const applicationLong = formatIsoLong(applicationDate);
  if (!applicationLong) {
    return { error: "Enter a valid date for when the passport application was submitted." };
  }

  const stage = STUCK_STAGES.find((item) => item.id === stageId);
  if (!stage) return { error: "Choose where the passport application appears to be stuck." };

  if (lifeLiberty && !reason) {
    return {
      error: "State the life or liberty ground - the 48-hour proviso to Section 7(1) only applies if the ground is set out.",
    };
  }

  const timeline = computeRtiTimeline({ filedDate, lifeLiberty });
  if (timeline.error) return { error: timeline.error };

  const filedLong = formatIsoLong(filedDate);

  const chosen = OPTIONAL_QUERIES.filter((query) => queryIds.includes(query.id));
  if (chosen.length === 0) {
    return { error: "Tick at least one question - an RTI with no query cannot be answered." };
  }

  const copyWord = wantsCertified ? "certified copies" : "copies";

  const queries = [
    `The present stage of my ${type} application bearing file number ${file}, submitted on ${applicationLong}, stated in plain words along with the date it reached that stage.`,
    ...chosen.map((query) => query.text),
  ];

  const feeLine = isBpl
    ? "Fee: not payable. I am a person below the poverty line and I am exempt from the application fee under Section 7(5) of the Act. A copy of my BPL card is enclosed."
    : `Fee: Rs ${APPLICATION_FEE_INR} paid as the application fee prescribed by Rule 3 of the Right to Information Rules 2012. Proof of payment is enclosed.`;

  const lifeLibertyBlock = lifeLiberty
    ? `\nThis request concerns the life or liberty of a person. ${reason} The information is therefore to be provided within ${LIFE_LIBERTY_HOURS} hours under the proviso to Section 7(1) of the Act.\n`
    : "";

  const application = [
    "APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005",
    "",
    `Date: ${filedLong}`,
    "",
    "To,",
    "The Central Public Information Officer",
    office,
    "Ministry of External Affairs, Government of India",
    "",
    `Subject: Information on the status and movement of ${type} application file number ${file} dated ${applicationLong}`,
    "",
    "Sir / Madam,",
    "",
    `I, ${name}, a citizen of India, seek the following information under Section 6(1) of the Right to Information Act, 2005, in respect of my own ${type} application bearing file number ${file}, submitted on ${applicationLong}. The particular concern is ${stage.focus}.`,
    lifeLibertyBlock,
    "Information sought:",
    ...queries.map((query, index) => `${index + 1}. ${query}`),
    "",
    `Please supply ${copyWord} of the documents asked for. If any part of the information is held to be exempt, please specify the exact clause of Section 8 or Section 9 relied on, the reason it applies to my own file, and sever and supply the remainder as Section 10(1) requires.`,
    "",
    `If any part of this information is held by another public authority - in particular the police authority that conducts verification - please transfer that part to it within five days as Section 6(3) of the Act requires, and inform me of the transfer.`,
    "",
    `I am not required to give any reason for seeking this information, as Section 6(2) of the Act provides. ${feeLine}`,
    "",
    `Please note that the information is due within ${timeline.replyWindowText}, that is on or before ${timeline.replyDue.long}. If the deadline is not met, the information becomes free of charge under Section 7(6), and Section 20(1) provides for a penalty of Rs ${PENALTY_PER_DAY_INR} for each day of delay up to Rs ${PENALTY_CAP_INR}.`,
    "",
    "Yours faithfully,",
    "",
    name,
    addr,
    tel ? `Phone: ${tel}` : null,
    mail ? `Email: ${mail}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    application,
    subject: `Information on the status and movement of ${type} application file number ${file} dated ${applicationLong}`,
    queryCount: queries.length,
    feeLine,
    timeline,
  };
}
