/**
 * Migration Certificate Request Generator.
 *
 * A migration certificate is the document an examining body — a university,
 * a state board, CBSE or CISCE — issues to confirm that it has no objection to
 * a student leaving its rolls and enrolling with another body. The receiving
 * institution asks for it at admission; without it, admission is normally kept
 * provisional and the student is given a deadline to produce it.
 *
 * The rules this module encodes are the procedural ones the issuing bodies
 * publish, not statute:
 *
 *  - A migration certificate is issued only after the final result of the last
 *    examination taken with that body is declared. Nothing is issued mid-course
 *    without a formal discontinuation approval, so a request made before the
 *    result is flagged.
 *  - CBSE issues the migration certificate to the school along with the Class X
 *    or Class XII marksheet and passing certificate; a student who has lost it
 *    applies for a DUPLICATE, which requires an affidavit on non-judicial stamp
 *    paper and a higher fee. CISCE follows the same pattern.
 *  - Universities issue on application in the prescribed form after the student
 *    clears no-dues from the library, hostel, department and accounts section.
 *  - A duplicate copy universally requires: an affidavit sworn before a notary
 *    or first-class magistrate stating the loss, and in many universities a
 *    police non-traceable report or a lost-and-found newspaper notice.
 *  - Fees are set by each body's own notification and revised often, so every
 *    amount here is an input, never a hardcoded figure.
 *
 * Processing time is expressed in WORKING days because registry and examination
 * sections count it that way. Sunday is always a non-working day; Saturday is
 * non-working when the office keeps a five-day week.
 *
 * Pure module: no React, no DOM, no clock reads. Dates are passed in as
 * yyyy-mm-dd strings.
 *
 * Informational only. Confirm the current form, fee and processing time on the
 * issuing body's own examination or registry page before you pay anything.
 */

const MS_PER_DAY = 86400000;

/** Longest processing window this tool will plan for, in working days. */
const MAX_PROCESSING_DAYS = 180;

/** Free-text field cap, so a pasted essay cannot land in the letter body. */
const MAX_FIELD = 120;

/** Largest fee component this tool will accept, in rupees. */
const MAX_FEE = 100000;

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

/**
 * The bodies that issue migration certificates in India, and how each one
 * routes the request.
 */
export const ISSUERS = [
  {
    id: "university",
    label: "University or autonomous college",
    addressee: "The Registrar (Examinations)",
    routedThroughSchool: false,
    needsNoDues: true,
    note: "Universities issue on the prescribed migration form after no-dues clearance from the library, hostel, department and accounts section.",
  },
  {
    id: "state-board",
    label: "State board of secondary education",
    addressee: "The Secretary",
    routedThroughSchool: true,
    needsNoDues: false,
    note: "State boards accept the application through the head of the school you last studied in, forwarded with the school's seal.",
  },
  {
    id: "cbse",
    label: "CBSE",
    addressee: "The Regional Officer",
    routedThroughSchool: true,
    needsNoDues: false,
    note: "CBSE issues the migration certificate once with the marksheet and passing certificate; a replacement is applied for as a duplicate, countersigned by the school.",
  },
  {
    id: "cisce",
    label: "CISCE (ICSE / ISC)",
    addressee: "The Chief Executive and Secretary",
    routedThroughSchool: true,
    needsNoDues: false,
    note: "CISCE routes migration and duplicate requests through the head of the affiliated school.",
  },
];

/** Original issue versus a replacement for a lost or damaged certificate. */
export const REQUEST_TYPES = [
  {
    id: "original",
    label: "First issue (never issued to me before)",
    needsAffidavit: false,
  },
  {
    id: "duplicate",
    label: "Duplicate (original lost, damaged or destroyed)",
    needsAffidavit: true,
  },
];

/**
 * How the certificate comes back, and the transit allowance in CALENDAR days
 * that each mode adds on top of the office's processing time.
 * These are ordinary-course transit times, not a guarantee.
 */
export const DELIVERY_MODES = [
  { id: "counter", label: "Collect in person from the counter", transitDays: 0 },
  { id: "speed-post", label: "Speed post to my address", transitDays: 5 },
  { id: "registered-post", label: "Registered post to my address", transitDays: 8 },
  { id: "courier", label: "Courier (self-arranged)", transitDays: 3 },
];

/** Office week patterns and which weekdays they treat as non-working. */
export const OFFICE_WEEKS = [
  { id: "six-day", label: "Six-day week (Sunday closed)", closedDays: [0] },
  { id: "five-day", label: "Five-day week (Saturday and Sunday closed)", closedDays: [0, 6] },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when it is not a
 * real calendar date (rejects 2026-02-30).
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

/** UTC-midnight timestamp -> "5 August 2026". */
export function formatStamp(stamp) {
  if (!isNum(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** UTC-midnight timestamp -> "yyyy-mm-dd". */
export function isoOf(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Add whole WORKING days to a date, skipping the office's closed weekdays.
 * Adding zero working days returns the same date even if it is a holiday,
 * because zero means "same day counter service".
 *
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} days Working days to add (>= 0).
 * @param {number[]} closedDays getUTCDay() values the office is shut.
 * @returns {number} UTC-midnight timestamp.
 */
export function addWorkingDays(stamp, days, closedDays) {
  const shut = new Set(Array.isArray(closedDays) ? closedDays : [0]);
  let cursor = stamp;
  let remaining = Math.max(0, Math.round(days));
  while (remaining > 0) {
    cursor += MS_PER_DAY;
    if (!shut.has(new Date(cursor).getUTCDay())) remaining -= 1;
  }
  return cursor;
}

/** Rupee amount check shared by every fee field. */
function readFee(value, fieldLabel) {
  const lower = fieldLabel.charAt(0).toLowerCase() + fieldLabel.slice(1);
  const amount = Number(value);
  if (!isNum(amount)) return { error: `Enter ${lower} as a number of rupees.` };
  if (amount < 0) return { error: `${fieldLabel} cannot be negative.` };
  if (amount > MAX_FEE) {
    return { error: `${fieldLabel} looks wrong — keep it under ${MAX_FEE.toLocaleString("en-IN")}.` };
  }
  return { amount };
}

/**
 * Build the document checklist for the request.
 *
 * @param {{issuer:object, requestType:object, delivery:object, resultDeclared:boolean}} context
 * @returns {Array<{id:string,label:string,detail:string,critical:boolean}>}
 */
function buildDocuments({ issuer, requestType, delivery, resultDeclared }) {
  const docs = [
    {
      id: "application",
      critical: true,
      label: "The signed application, on the body's prescribed form where one exists",
      detail:
        "Most registries reject a plain-paper letter when a numbered form is published. Print the form, fill it in ink and attach this letter as a covering note.",
    },
    {
      id: "marksheet",
      critical: true,
      label: "Self-attested copy of the final marksheet of the last examination passed",
      detail:
        "The certificate is issued against the last examination you cleared with this body, so the roll number and year on the marksheet drive the whole record search.",
    },
    {
      id: "passing-certificate",
      critical: false,
      label: "Self-attested copy of the provisional or passing certificate",
      detail: "Confirms the result was formally declared and not merely published online.",
    },
    {
      id: "photo-id",
      critical: true,
      label: "Self-attested copy of a government photo ID (Aadhaar, passport or voter ID)",
      detail:
        "The name on the ID must match the name on the marksheet. If it does not, carry the gazette notification or affidavit for the name change.",
    },
    {
      id: "fee-receipt",
      critical: true,
      label: "Fee receipt or the demand draft drawn in favour of the body",
      detail:
        "Registries do not begin the record search until the fee is realised. Write your roll number and mobile number on the reverse of a demand draft.",
    },
  ];

  if (issuer.needsNoDues) {
    docs.push({
      id: "no-dues",
      critical: true,
      label: "No-dues clearance from the library, hostel, department and accounts section",
      detail:
        "The registry will not release the certificate while any section still shows an outstanding book, deposit or fee against your roll number.",
    });
  }

  if (issuer.routedThroughSchool) {
    docs.push({
      id: "school-forwarding",
      critical: true,
      label: "Forwarding letter from the head of the school, with the school seal",
      detail:
        "This body accepts migration applications through the affiliated school, not directly from the candidate.",
    });
  }

  if (requestType.needsAffidavit) {
    docs.push(
      {
        id: "affidavit",
        critical: true,
        label:
          "Affidavit on non-judicial stamp paper, sworn before a notary or first-class magistrate, stating that the original is lost and undertaking to surrender it if found",
        detail:
          "A duplicate is never issued on a bare statement of loss. The affidavit must name the certificate, the roll number and the year of passing.",
      },
      {
        id: "loss-report",
        critical: false,
        label: "Police non-traceable report, or the newspaper notice of loss",
        detail:
          "Several universities insist on one of the two. Getting it in advance costs a day and saves a rejected file.",
      },
    );
  }

  if (delivery.transitDays > 0) {
    docs.push({
      id: "envelope",
      critical: true,
      label: "Self-addressed envelope with the postage or courier charge prepaid",
      detail:
        "Write the full address with the flat and tower number and a working mobile number — a failed delivery sends the certificate back to the registry.",
    });
  }

  if (!resultDeclared) {
    docs.push({
      id: "discontinuation",
      critical: true,
      label: "Written approval for discontinuation of the course from the head of the institution",
      detail:
        "Where the final result has not been declared, the certificate is issued only against a formal discontinuation, not on request.",
    });
  }

  return docs;
}

/**
 * Cost, timeline, checklist and letter for a migration certificate request.
 *
 * Total payable = base fee + duplicate surcharge + late fee + postage.
 * Ready date    = application date + processing WORKING days.
 * In hand by    = ready date + the delivery mode's calendar transit days.
 *
 * @param {object} input
 * @param {string} input.issuerId          One of ISSUERS ids.
 * @param {string} input.requestTypeId     One of REQUEST_TYPES ids.
 * @param {string} input.deliveryId        One of DELIVERY_MODES ids.
 * @param {string} input.officeWeekId      One of OFFICE_WEEKS ids.
 * @param {string} input.applicationDate   yyyy-mm-dd the application is submitted.
 * @param {string} input.admissionDeadline yyyy-mm-dd the receiving institution needs it by.
 * @param {boolean} input.resultDeclared   Has the final result been declared?
 * @param {number} input.processingDays    Working days the office quotes.
 * @param {number} input.baseFee           Prescribed fee, in rupees.
 * @param {number} input.duplicateFee      Extra charged for a duplicate, in rupees.
 * @param {number} input.lateFee           Late or tatkal charge, in rupees.
 * @param {number} input.postage           Postage or courier charge, in rupees.
 * @param {string} input.studentName
 * @param {string} input.rollNumber
 * @param {string} input.courseName
 * @param {string} input.passingYear
 * @param {string} input.institutionName   The body the letter is addressed to.
 * @param {string} input.receivingInstitution Where you are joining.
 * @param {string} input.contact           Phone or email for the registry to reach you.
 * @returns {object|{error:string}}
 */
export function buildMigrationRequest(input) {
  const issuer = ISSUERS.find((item) => item.id === input?.issuerId);
  if (!issuer) return { error: "Choose which body issued your last examination result." };

  const requestType = REQUEST_TYPES.find((item) => item.id === input?.requestTypeId);
  if (!requestType) return { error: "Choose whether this is a first issue or a duplicate." };

  const delivery = DELIVERY_MODES.find((item) => item.id === input?.deliveryId);
  if (!delivery) return { error: "Choose how the certificate should reach you." };

  const week = OFFICE_WEEKS.find((item) => item.id === input?.officeWeekId) || OFFICE_WEEKS[0];

  const applied = parseIsoDate(input?.applicationDate);
  if (applied === null) return { error: "Enter a valid date for when you submit the application." };

  const deadlineRaw = clean(input?.admissionDeadline);
  const deadline = deadlineRaw ? parseIsoDate(deadlineRaw) : null;
  if (deadlineRaw && deadline === null) {
    return { error: "Enter a valid admission deadline, or leave it blank." };
  }

  const processingDays = Number(input?.processingDays);
  if (!isNum(processingDays) || !Number.isInteger(processingDays)) {
    return { error: "Enter the quoted processing time as a whole number of working days." };
  }
  if (processingDays < 0) return { error: "Processing time cannot be negative." };
  if (processingDays > MAX_PROCESSING_DAYS) {
    return { error: `Processing time above ${MAX_PROCESSING_DAYS} working days is not realistic.` };
  }

  const base = readFee(input?.baseFee, "The prescribed fee");
  if (base.error) return { error: base.error };
  const dup = readFee(input?.duplicateFee, "The duplicate surcharge");
  if (dup.error) return { error: dup.error };
  const late = readFee(input?.lateFee, "The late or tatkal charge");
  if (late.error) return { error: late.error };
  const post = readFee(input?.postage, "The postage or courier charge");
  if (post.error) return { error: post.error };

  const name = clean(input?.studentName);
  const roll = clean(input?.rollNumber);
  const course = clean(input?.courseName);
  const year = clean(input?.passingYear);
  const body = clean(input?.institutionName);
  const receiving = clean(input?.receivingInstitution);
  const contact = clean(input?.contact);

  if (!name) return { error: "Enter your full name as printed on the marksheet." };
  if (!roll) return { error: "Enter the roll or enrolment number of the last examination." };
  if (!course) return { error: "Enter the course or class you completed." };
  if (!year) return { error: "Enter the year you passed the last examination." };
  if (!body) return { error: "Enter the name of the university or board you are writing to." };
  if ([name, roll, course, year, body, receiving, contact].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each text field under ${MAX_FIELD} characters.` };
  }
  if (!/^\d{4}(\s*[-–]\s*\d{2,4})?$/.test(year)) {
    return { error: "Enter the passing year as a four-digit year, e.g. 2025 or 2024-25." };
  }

  const resultDeclared = input?.resultDeclared !== false;

  // Duplicate surcharge only counts when a duplicate is actually being asked for.
  const duplicateApplied = requestType.needsAffidavit ? dup.amount : 0;
  // Postage only counts when the certificate is not collected at the counter.
  const postageApplied = delivery.transitDays > 0 ? post.amount : 0;
  const totalFee = base.amount + duplicateApplied + late.amount + postageApplied;

  const readyStamp = addWorkingDays(applied, processingDays, week.closedDays);
  const inHandStamp = readyStamp + delivery.transitDays * MS_PER_DAY;
  const calendarDays = Math.round((inHandStamp - applied) / MS_PER_DAY);

  const warnings = [];
  if (!resultDeclared) {
    warnings.push(
      "The final result has not been declared. Migration certificates are issued after the result of the last examination; before that you need written approval for discontinuation of the course.",
    );
  }
  if (deadline !== null) {
    if (deadline < applied) {
      warnings.push("The admission deadline is before the date you plan to apply.");
    } else if (inHandStamp > deadline) {
      const shortBy = Math.round((inHandStamp - deadline) / MS_PER_DAY);
      warnings.push(
        `On this timeline the certificate reaches you ${shortBy} day${shortBy === 1 ? "" : "s"} after the ${formatStamp(deadline)} deadline. Ask the receiving institution for a provisional-admission undertaking, and ask the registry about a tatkal or over-the-counter option.`,
      );
    }
  }
  if (requestType.needsAffidavit && duplicateApplied === 0) {
    warnings.push(
      "A duplicate almost always carries a higher fee than a first issue. Check the notified duplicate fee before you draw the demand draft.",
    );
  }
  if (delivery.id === "counter" && postageApplied === 0 && post.amount > 0) {
    warnings.push("Postage was ignored because you chose to collect the certificate in person.");
  }

  const documents = buildDocuments({ issuer, requestType, delivery, resultDeclared });

  const purposeLine = receiving
    ? `I have secured admission at ${receiving}, which requires the migration certificate to complete my enrolment.`
    : "The institution I am joining requires the migration certificate to complete my enrolment.";

  const dupLine = requestType.needsAffidavit
    ? "The certificate issued to me earlier has been lost and is not traceable. I therefore request a duplicate, and I enclose an affidavit sworn before a notary stating the loss and undertaking to surrender the original to the office should it be recovered."
    : "The certificate has not been issued to me previously.";

  const deliveryLine =
    delivery.transitDays > 0
      ? `I request that the certificate be despatched by ${delivery.label.toLowerCase().replace(" to my address", "")} to the address given below; a self-addressed envelope with postage prepaid is enclosed.`
      : "I will collect the certificate in person from the counter and will produce this application and my photo identity card at the time of collection.";

  const feeLine = `I am remitting the prescribed fee of Rs. ${totalFee.toLocaleString("en-IN")}${
    duplicateApplied > 0 || late.amount > 0 || postageApplied > 0
      ? " (inclusive of the applicable surcharge and despatch charge)"
      : ""
  }, and the receipt is enclosed.`;

  const letter = [
    `Date: ${formatStamp(applied)}`,
    "",
    "To,",
    issuer.addressee + ",",
    body + ",",
    "",
    `Subject: Application for ${requestType.needsAffidavit ? "a duplicate migration certificate" : "a migration certificate"} — ${course}, ${year}, Roll No. ${roll}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I, ${name}, completed ${course} from this ${issuer.id === "university" ? "University" : "Board"} and passed the final examination in ${year} under Roll No. ${roll}. ${purposeLine}`,
    "",
    `${dupLine} I therefore request that a migration certificate be issued to me at the earliest.`,
    "",
    feeLine,
    "",
    deliveryLine,
    "",
    "The documents enclosed with this application are:",
    ...documents.map((doc, index) => `${index + 1}. ${doc.label}`),
    "",
    "I request you to kindly process the application and oblige. I can be reached on the contact details given below for any clarification.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    name,
    `Roll No. ${roll}`,
    course + `, ${year}`,
    contact ? `Contact: ${contact}` : "Contact: ______________________",
    "Address: ______________________________________________",
  ].join("\n");

  return {
    issuerLabel: issuer.label,
    issuerNote: issuer.note,
    requestTypeLabel: requestType.label,
    deliveryLabel: delivery.label,
    weekLabel: week.label,
    fees: {
      base: base.amount,
      duplicate: duplicateApplied,
      late: late.amount,
      postage: postageApplied,
    },
    totalFee,
    processingDays,
    transitDays: delivery.transitDays,
    calendarDays,
    appliedIso: isoOf(applied),
    appliedLong: formatStamp(applied),
    readyIso: isoOf(readyStamp),
    readyLong: formatStamp(readyStamp),
    inHandIso: isoOf(inHandStamp),
    inHandLong: formatStamp(inHandStamp),
    deadlineLong: deadline === null ? "" : formatStamp(deadline),
    meetsDeadline: deadline === null ? null : inHandStamp <= deadline,
    documents,
    documentCount: documents.length,
    criticalCount: documents.filter((doc) => doc.critical).length,
    warnings,
    letter,
  };
}
