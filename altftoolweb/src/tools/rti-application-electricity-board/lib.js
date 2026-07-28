/**
 * RTI application drafter for an electricity distribution licensee.
 *
 * Two bodies of law meet here, and the drafted application quotes both.
 *
 * Right to Information Act 2005 and RTI Rules 2012:
 *  - Section 6(1): application to the Public Information Officer of the public
 *    authority. A state-owned distribution company is a public authority under
 *    Section 2(h)(d)(i) because it is owned and controlled by the state. A
 *    PRIVATE licensee usually is not, and the route then is to ask the State
 *    Electricity Regulatory Commission or the state power department for the
 *    records they hold about that licensee. The drafter warns about this.
 *  - Section 6(2): no reason for the request need be given.
 *  - Section 6(3): transfer to the correct public authority within five days.
 *  - Section 7(1): reply within thirty days; forty-eight hours for life or
 *    liberty.
 *  - Section 7(5): no fee for a person below the poverty line.
 *  - Section 7(6): free information if the deadline is missed.
 *  - Section 10(1): exempt material must be severed and the rest supplied.
 *  - Section 19(1) and 19(3): first appeal in thirty days, second appeal in
 *    ninety days.
 *  - Section 20(1): penalty of Rs 250 per day up to Rs 25,000 on the PIO.
 *  - Rule 3, RTI Rules 2012: application fee Rs 10; Rule 4: Rs 2 per A-4 page.
 *
 * Electricity Act 2003, which gives the questions their teeth:
 *  - Section 43(1): a distribution licensee must supply electricity on
 *    application within ONE MONTH of receipt of the application, subject to
 *    the proviso allowing a longer period fixed by the Commission where mains
 *    have to be extended or a sub-station commissioned.
 *  - Section 43(3): a licensee that fails to supply within the specified
 *    period is liable to a penalty which may extend to ONE THOUSAND RUPEES for
 *    each day of default.
 *  - Section 55(1): no licensee shall supply electricity except through an
 *    installed correct meter.
 *  - Section 56(1): a licensee may disconnect for non-payment only after
 *    fifteen clear days' written notice.
 *  - Section 56(2): no sum due on account of electricity supplied is
 *    recoverable after TWO YEARS from the date it first became due, unless it
 *    has been shown continuously as recoverable arrear of charges.
 *  - Section 57: the Commission fixes standards of performance, and Section
 *    57(2) makes a licensee that fails to meet them liable to pay compensation
 *    to the affected person as determined by the Commission.
 *  - Section 42(5) and 42(6): every licensee must have a Consumer Grievance
 *    Redressal Forum, and a consumer may then approach the Electricity
 *    Ombudsman.
 *  - Section 126: provisional assessment for unauthorised use of electricity.
 *
 * Informational only; not legal advice.
 */

/** Section 7(1), RTI Act 2005. */
export const REPLY_DAYS = 30;
/** Section 6(3), RTI Act 2005. */
export const TRANSFER_DAYS = 5;
/** Section 19(1), RTI Act 2005. */
export const FIRST_APPEAL_DAYS = 30;
/** Section 19(6) - FAA decision window and its extension. */
export const FAA_DECISION_DAYS = 30;
export const FAA_EXTENDED_DAYS = 45;
/** Section 19(3), RTI Act 2005. */
export const SECOND_APPEAL_DAYS = 90;
/** Section 20(1), RTI Act 2005. */
export const PENALTY_PER_DAY_INR = 250;
export const PENALTY_CAP_INR = 25000;
/** Rule 3, RTI Rules 2012. */
export const APPLICATION_FEE_INR = 10;
/** Section 43(1), Electricity Act 2003 - supply within one month. */
export const SUPPLY_DAYS = 30;
/** Section 43(3), Electricity Act 2003 - up to Rs 1,000 per day of default. */
export const SUPPLY_PENALTY_PER_DAY_INR = 1000;
/** Section 56(2), Electricity Act 2003 - two-year bar on recovering arrears. */
export const ARREAR_BAR_YEARS = 2;
/** Section 56(1), Electricity Act 2003 - notice before disconnection. */
export const DISCONNECTION_NOTICE_DAYS = 15;

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

/** What the consumer's dispute is about, and the records that answer it. */
export const ISSUE_TOPICS = [
  {
    id: "new-connection",
    label: "New connection applied for but not released",
    intro:
      "the delay in releasing a new connection against my application, which Section 43(1) of the Electricity Act 2003 requires to be supplied within one month",
    queries: [
      "The date on which my application for a new connection was received, the registration or file number given to it, and the present stage of the application.",
      "A copy of the demand note or estimate issued against my application, along with the date it was issued and the date my payment was received.",
      "The reason recorded on the file for the connection not having been released within one month, as Section 43(1) of the Electricity Act 2003 requires.",
      "The name and designation of the officer with whom my file is presently pending, and the date it was marked to that officer.",
      "The number of new connection applications received at this sub-division in the same month as mine, and how many of them have been released, in numbers only.",
    ],
  },
  {
    id: "billing-dispute",
    label: "Disputed, inflated or estimated bill",
    intro:
      "a disputed bill raised on my connection and the basis on which it was computed",
    queries: [
      "A copy of the meter reading sheet or spot billing record for my connection for the disputed period, showing each reading taken, the date it was taken and the name of the meter reader.",
      "The calculation sheet showing how the disputed bill was arrived at, including the tariff category applied, the number of units billed, and every fixed charge, duty, surcharge and rounding applied.",
      "Whether the bill for the disputed period was raised on an actual reading or on an estimated or average basis, and if estimated, the office order or regulation permitting estimation and the basis of the estimate.",
      "A copy of every complaint or representation submitted by me on this bill, with the date each was received, the officer it was marked to, and the action recorded on it.",
      "The date on which the amount claimed as arrears first became due, so that the two-year bar in Section 56(2) of the Electricity Act 2003 can be checked.",
    ],
  },
  {
    id: "meter-records",
    label: "Meter accuracy, replacement or testing records",
    intro:
      "the meter installed on my connection, its testing history and its accuracy",
    queries: [
      "The make, serial number, capacity and date of installation of the meter presently installed on my connection, and of every meter installed on it in the last five years.",
      "A copy of the test report of my meter, including the date of the last accuracy test, the laboratory that carried it out, and the error percentage found.",
      "Where my meter was replaced, a copy of the meter change report showing the final reading of the removed meter, the initial reading of the new meter, and the reason for replacement.",
      "The procedure and the regulation under which a consumer may have the meter tested, the fee payable, and what happens to that fee if the meter is found defective.",
      "A copy of any report recording that my meter was found defective, stuck, burnt or fast, together with the action taken on that report.",
    ],
  },
  {
    id: "load-enhancement",
    label: "Load enhancement or tariff category change pending",
    intro:
      "an application to change the sanctioned load or the tariff category of my connection",
    queries: [
      "The date on which my application for load enhancement or change of tariff category was received and the file number given to it.",
      "The sanctioned load and tariff category recorded against my connection today, and the date on which each was last changed.",
      "The reason recorded for the application not having been decided, and the officer with whom it is pending.",
      "A copy of the regulation or tariff order that governs the category I have applied for, as it stood on the date of my application.",
    ],
  },
  {
    id: "outage-quality",
    label: "Repeated outages, low voltage or supply quality",
    intro:
      "the reliability and quality of supply on the feeder that serves my premises",
    queries: [
      "The interruption register or outage log for the feeder serving my premises for the period stated, showing the date, start time, restoration time and cause of each interruption.",
      "The standards of performance notified by the State Electricity Regulatory Commission for restoration of supply and for voltage variation, as applicable to my category of consumer.",
      "The compensation, if any, paid or payable under Section 57(2) of the Electricity Act 2003 for failure to meet those standards on this feeder.",
      "A copy of every complaint registered from my connection during the period stated, with the docket number, the time of registration and the time of attending.",
    ],
  },
  {
    id: "assessment-notice",
    label: "Assessment or penalty notice under Section 126",
    intro:
      "a provisional assessment or penalty notice served on my connection",
    queries: [
      "A copy of the inspection report on which the assessment against my connection is based, including the names and designations of the inspecting officers and the date and time of inspection.",
      "The calculation sheet of the provisional assessment, showing the assessed load, the period of assessment, the tariff applied and the multiplying factor used.",
      "A copy of the notice issued to me before the assessment order, the date of its despatch and the proof of its service.",
      "The name and designation of the assessing officer and the appellate authority to whom an appeal against the assessment lies, with the period allowed for that appeal.",
    ],
  },
];

/** Questions worth adding to almost any electricity RTI. */
export const COMMON_QUERIES = [
  {
    id: "sop",
    label: "Applicable standards of performance",
    text: "A copy of the Standards of Performance regulations notified by the State Electricity Regulatory Commission that apply to my complaint, as they stood on the date of my complaint.",
  },
  {
    id: "cgrf",
    label: "Consumer Grievance Redressal Forum details",
    text: "The name, designation, address, phone number and email of the Consumer Grievance Redressal Forum constituted under Section 42(5) of the Electricity Act 2003 for my area, and of the Electricity Ombudsman under Section 42(6).",
  },
  {
    id: "pio-list",
    label: "PIO and appellate authority for this office",
    text: "The name and designation of the Public Information Officer and of the First Appellate Authority for this office, as required to be published under Section 4(1)(b) of the Right to Information Act 2005.",
  },
  {
    id: "ledger",
    label: "Full consumer ledger",
    text: "A copy of the consumer ledger for my connection for the period stated, showing every bill raised, every payment credited, every adjustment made and the running balance.",
  },
  {
    id: "compensation-paid",
    label: "Compensation already paid under Section 57(2)",
    text: "The total compensation paid by this office under Section 57(2) of the Electricity Act 2003 in the last financial year for failure to meet the notified standards of performance, in numbers only.",
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

  const replyDays = lifeLiberty ? 2 : REPLY_DAYS;
  const replyDue = filed + replyDays * MS_PER_DAY;
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
 * How far past the Section 43(1) one-month supply deadline a connection is.
 *
 * The penalty figure returned is the statutory CEILING under Section 43(3) -
 * up to Rs 1,000 for each day of default - not an amount the consumer is
 * entitled to. Only the appropriate Commission can impose it.
 *
 * @param {object} input
 * @param {string} input.applicationDate yyyy-mm-dd the connection was applied for.
 * @param {string} input.asOnDate        yyyy-mm-dd the position is checked on.
 * @param {number} [input.permittedDays] Period allowed, 30 unless the Commission fixed more.
 * @returns {{dueBy:{iso:string,long:string}, elapsedDays:number, delayDays:number,
 *            withinTime:boolean, indicativePenaltyCeiling:number} | {error:string}}
 */
export function computeConnectionDelay({ applicationDate, asOnDate, permittedDays = SUPPLY_DAYS }) {
  const applied = parseIsoDate(applicationDate);
  if (applied === null) return { error: "Enter a valid connection application date." };
  const asOn = parseIsoDate(asOnDate);
  if (asOn === null) return { error: "Enter a valid date to check the position on." };

  const permitted = Number(permittedDays);
  if (!Number.isInteger(permitted) || permitted < 1 || permitted > 365) {
    return { error: "The permitted supply period must be a whole number of days from 1 to 365." };
  }
  if (asOn < applied) {
    return { error: "The date you are checking on falls before the application date." };
  }

  const dueStamp = applied + permitted * MS_PER_DAY;
  const elapsedDays = Math.round((asOn - applied) / MS_PER_DAY);
  const delayDays = Math.max(0, Math.round((asOn - dueStamp) / MS_PER_DAY));

  return {
    dueBy: describe(dueStamp),
    elapsedDays,
    delayDays,
    withinTime: delayDays === 0,
    indicativePenaltyCeiling: delayDays * SUPPLY_PENALTY_PER_DAY_INR,
  };
}

/**
 * Whether an arrear demand crosses the two-year bar in Section 56(2).
 *
 * The bar does not apply where the sum has been shown continuously as a
 * recoverable arrear of charges, so the result is a prompt to check that, not
 * a conclusion.
 *
 * @param {object} input
 * @param {string} input.dueSinceDate yyyy-mm-dd the sum first became due.
 * @param {string} input.demandDate   yyyy-mm-dd the demand was raised.
 * @returns {{daysSinceDue:number, barLineCrossed:boolean,
 *            barDate:{iso:string,long:string}} | {error:string}}
 */
export function computeArrearBar({ dueSinceDate, demandDate }) {
  const due = parseIsoDate(dueSinceDate);
  if (due === null) return { error: "Enter a valid date on which the amount first became due." };
  const demand = parseIsoDate(demandDate);
  if (demand === null) return { error: "Enter a valid date on which the demand was raised." };
  if (demand < due) {
    return { error: "The demand date falls before the date the amount first became due." };
  }

  const barStamp = Date.UTC(
    new Date(due).getUTCFullYear() + ARREAR_BAR_YEARS,
    new Date(due).getUTCMonth(),
    new Date(due).getUTCDate(),
  );

  return {
    daysSinceDue: Math.round((demand - due) / MS_PER_DAY),
    barLineCrossed: demand > barStamp,
    barDate: describe(barStamp),
  };
}

/**
 * Draft the RTI application to the distribution licensee.
 *
 * @param {object} input
 * @param {string} input.applicantName
 * @param {string} input.address
 * @param {string} input.phone
 * @param {string} input.email
 * @param {string} input.utilityName       Name of the discom / board office.
 * @param {string} input.officeAddress     Sub-division or circle addressed.
 * @param {string} input.consumerNumber
 * @param {string} input.topicId           One of ISSUE_TOPICS ids.
 * @param {string} input.periodFrom        yyyy-mm-dd start of the period asked about.
 * @param {string} input.periodTo          yyyy-mm-dd end of that period.
 * @param {string[]} input.commonQueryIds  Ticked COMMON_QUERIES ids.
 * @param {string} input.filedDate         yyyy-mm-dd the RTI is filed.
 * @param {boolean} [input.isBpl]
 * @param {boolean} [input.isPrivateLicensee] Licensee is privately owned.
 * @param {boolean} [input.wantsInspection]   Ask to inspect the records first.
 * @returns {{application:string, subject:string, queryCount:number,
 *            timeline:object, routeNote:string} | {error:string}}
 */
export function buildElectricityRti({
  applicantName,
  address,
  phone,
  email,
  utilityName,
  officeAddress,
  consumerNumber,
  topicId,
  periodFrom,
  periodTo,
  commonQueryIds = [],
  filedDate,
  isBpl = false,
  isPrivateLicensee = false,
  wantsInspection = false,
}) {
  const name = clean(applicantName);
  const addr = clean(address);
  const tel = clean(phone);
  const mail = clean(email);
  const utility = clean(utilityName);
  const office = clean(officeAddress);
  const consumer = clean(consumerNumber);

  if (!name) return { error: "Enter the applicant's name." };
  if (!addr) return { error: "Enter a postal address - the reply is sent there." };
  if (!utility) return { error: "Enter the name of the electricity distribution company or board." };
  if (!consumer) return { error: "Enter the consumer number or the connection application number." };
  if ([name, tel, mail, utility, office, consumer].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }
  if (addr.length > 400) return { error: "Keep the address under 400 characters." };

  const topic = ISSUE_TOPICS.find((item) => item.id === topicId);
  if (!topic) return { error: "Choose what the dispute is about." };

  const fromLong = formatIsoLong(periodFrom);
  const toLong = formatIsoLong(periodTo);
  if (!fromLong || !toLong) {
    return { error: "Enter a valid period the records are asked for, in yyyy-mm-dd form." };
  }
  if (parseIsoDate(periodTo) < parseIsoDate(periodFrom)) {
    return { error: "The end of the period falls before its start." };
  }

  const timeline = computeRtiTimeline({ filedDate });
  if (timeline.error) return { error: timeline.error };
  const filedLong = formatIsoLong(filedDate);

  const extras = COMMON_QUERIES.filter((query) => commonQueryIds.includes(query.id));
  const queries = [...topic.queries, ...extras.map((query) => query.text)];

  const feeLine = isBpl
    ? "Fee: not payable. I am a person below the poverty line and am exempt under Section 7(5) of the Act; a copy of my BPL card is enclosed."
    : `Fee: Rs ${APPLICATION_FEE_INR} paid as the application fee prescribed by Rule 3 of the Right to Information Rules 2012, with proof of payment enclosed.`;

  const routeNote = isPrivateLicensee
    ? "This licensee is privately owned. A private distribution licensee is often held not to be a public authority under Section 2(h) of the RTI Act. Address the same questions to the State Electricity Regulatory Commission and to the state power department, which hold licence conditions, standards-of-performance filings and compliance reports about the licensee, and file a parallel complaint with the Consumer Grievance Redressal Forum under Section 42(5) of the Electricity Act 2003."
    : "A state-owned distribution company is a public authority under Section 2(h) of the RTI Act, so this application can be filed directly with its Public Information Officer.";

  const inspectionLine = wantsInspection
    ? `\nI would first like to inspect the relevant records under Section 2(j)(i) of the Act. Please fix a date and time for inspection at your office; inspection is free for the first hour and Rs 5 for each subsequent hour under Rule 4 of the RTI Rules 2012. I will identify the pages to be copied at the inspection.\n`
    : "";

  const application = [
      "APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005",
      "",
      `Date: ${filedLong}`,
      "",
      "To,",
      "The Public Information Officer",
      utility,
      ...(office ? [office] : []),
      "",
      `Subject: Information regarding ${topic.label.toLowerCase()} on consumer number ${consumer} for the period ${fromLong} to ${toLong}`,
      "",
      "Sir / Madam,",
      "",
      `I, ${name}, a citizen of India, seek the following information under Section 6(1) of the Right to Information Act, 2005 in respect of my own connection bearing consumer number ${consumer}. The subject of this application is ${topic.intro}. Unless a query says otherwise, the information is sought for the period ${fromLong} to ${toLong}.`,
      "",
      "Information sought:",
      ...queries.map((query, index) => `${index + 1}. ${query}`),
      inspectionLine || "",
      `If any part of the information is treated as exempt, please state the exact clause of Section 8 or Section 9 relied on and supply the remainder after severance, as Section 10(1) of the Act requires. If any part is held by another public authority, please transfer that part within five days under Section 6(3) and inform me.`,
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
      `Consumer number: ${consumer}`,
    ].join("\n");

  return {
    application,
    subject: `Information regarding ${topic.label.toLowerCase()} on consumer number ${consumer} for the period ${fromLong} to ${toLong}`,
    queryCount: queries.length,
    timeline,
    routeNote,
  };
}
