/**
 * Experience Letter Format Builder — tenure maths and HR document composition.
 *
 * Three different documents get confused with one another, and an employer is
 * often asked for the wrong one:
 *  - Experience certificate: confirms the role held, the period of service and
 *    (optionally) conduct. It is what a future employer asks for.
 *  - Relieving letter: confirms the employee has been relieved on a stated date
 *    and that dues and company property are settled. A new employer normally
 *    wants this before a joining date is confirmed.
 *  - Service certificate: a bare factual record of employment. Several state
 *    Shops and Establishments Acts require an employer to issue one when an
 *    employee leaves, so it is the minimum an employer should be willing to give.
 *
 * Tenure is calculated as a calendar difference in years, months and days —
 * borrowing from the previous month's real length, not a fixed 30 — because that
 * is how service periods are read on a certificate.
 *
 * Pure module: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Days in a given month, honouring leap years. */
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, stamp };
}

/** Format an ISO date as "15 June 2019". */
export function formatLongDate(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

/** The three documents this builder produces. */
export const DOCUMENT_TYPES = [
  {
    id: "experience",
    label: "Experience certificate",
    title: "TO WHOMSOEVER IT MAY CONCERN",
    purpose: "Confirms the role held and the period of service, for a future employer.",
    needsConduct: true,
    needsDues: false,
  },
  {
    id: "relieving",
    label: "Relieving letter",
    title: "RELIEVING LETTER",
    purpose: "Confirms the employee has been relieved on a stated date and that dues are settled.",
    needsConduct: false,
    needsDues: true,
  },
  {
    id: "service",
    label: "Service certificate",
    title: "SERVICE CERTIFICATE",
    purpose: "A bare factual record of employment — the minimum an employer should issue on exit.",
    needsConduct: false,
    needsDues: false,
  },
];

/** Optional conduct wording, from neutral to warm. */
export const CONDUCT_LEVELS = [
  { id: "none", label: "No conduct comment", sentence: "" },
  { id: "neutral", label: "Neutral", sentence: "During this period, conduct and performance were found to be satisfactory." },
  { id: "good", label: "Positive", sentence: "During this period, we found {pronoun} to be sincere, hardworking and dependable." },
  { id: "strong", label: "Strong endorsement", sentence: "During this period, {pronoun} consistently delivered strong work and was well regarded by colleagues and clients alike." },
];

/** Pronoun sets so the letter reads correctly whoever it is about. */
export const PRONOUN_SETS = [
  { id: "he", label: "He / him", subject: "he", object: "him", possessive: "his", title: "Mr." },
  { id: "she", label: "She / her", subject: "she", object: "her", possessive: "her", title: "Ms." },
  { id: "they", label: "They / them", subject: "they", object: "them", possessive: "their", title: "" },
];

/**
 * Calendar tenure between two dates.
 * Years, months and days are worked out by borrowing from the real length of the
 * preceding month, so 31 January to 1 March is 1 month and 1 day, not 29 days.
 */
export function computeTenure({ joiningDate, lastWorkingDay } = {}) {
  const start = parseIsoDate(joiningDate);
  const end = parseIsoDate(lastWorkingDay);
  if (!start) return { error: "Enter a valid joining date." };
  if (!end) return { error: "Enter a valid last working day." };
  if (end.stamp < start.stamp) return { error: "The last working day cannot be before the joining date." };

  let years = end.year - start.year;
  let months = end.month - start.month;
  let days = end.day - start.day;

  if (days < 0) {
    months -= 1;
    // Borrow the real number of days from the month before the end date.
    const borrowMonth = end.month - 1 === 0 ? 12 : end.month - 1;
    const borrowYear = end.month - 1 === 0 ? end.year - 1 : end.year;
    const borrowLength = daysInMonth(borrowYear, borrowMonth);
    // If the joining day-of-month does not exist in the borrowed month — the
    // 31st borrowed from February, say — the month completes on its last day.
    const effectiveStartDay = Math.min(start.day, borrowLength);
    days = end.day + borrowLength - effectiveStartDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((end.stamp - start.stamp) / MS_PER_DAY) + 1;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (parts.length === 0) parts.push("0 days");

  return {
    years,
    months,
    days,
    totalDays,
    totalMonths: years * 12 + months,
    label: parts.join(", "),
  };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** Compose the chosen HR document. */
export function buildExperienceLetter({
  documentTypeId = "experience",
  companyName = "",
  companyAddress = "",
  referenceNumber = "",
  issueDate = "",
  employeeName = "",
  pronounId = "they",
  employeeId = "",
  designation = "",
  previousDesignations = "",
  department = "",
  joiningDate = "",
  lastWorkingDay = "",
  conductId = "neutral",
  duesSettled = true,
  propertyReturned = true,
  reasonForLeaving = "",
  signatoryName = "",
  signatoryDesignation = "",
} = {}) {
  const documentType = DOCUMENT_TYPES.find((entry) => entry.id === documentTypeId);
  if (!documentType) return { error: "Choose which document you are issuing." };

  const pronoun = PRONOUN_SETS.find((entry) => entry.id === pronounId) ?? PRONOUN_SETS[2];
  const conduct = CONDUCT_LEVELS.find((entry) => entry.id === conductId);
  if (!conduct) return { error: "Choose a conduct wording option." };

  const company = clean(companyName);
  if (!company) return { error: "Enter the company name." };

  const name = clean(employeeName);
  if (!name) return { error: "Enter the employee's name." };

  const role = clean(designation);
  if (!role) return { error: "Enter the employee's designation." };

  const tenure = computeTenure({ joiningDate, lastWorkingDay });
  if (tenure.error) return { error: tenure.error };

  const issued = clean(issueDate) || lastWorkingDay;
  const issuedLong = formatLongDate(issued);
  if (!issuedLong) return { error: "Enter a valid date of issue." };

  const joinedLong = formatLongDate(joiningDate);
  const leftLong = formatLongDate(lastWorkingDay);

  const empId = clean(employeeId);
  const dept = clean(department);
  const ref = clean(referenceNumber);
  const prior = clean(previousDesignations);
  const reason = clean(reasonForLeaving);
  const signatory = clean(signatoryName);
  const signatoryRole = clean(signatoryDesignation);
  const address = clean(companyAddress);

  const nameWithTitle = pronoun.title ? `${pronoun.title} ${name}` : name;

  const paragraphs = [];

  paragraphs.push(
    `This is to certify that ${nameWithTitle}${empId ? ` (Employee ID: ${empId})` : ""} was employed with ${company} from ${joinedLong} to ${leftLong}, a total period of ${tenure.label}.`,
  );

  paragraphs.push(
    `At the time of leaving, ${pronoun.subject} held the position of ${role}${dept ? ` in the ${dept} department` : ""}.${
      prior ? ` Earlier positions held during this period: ${prior}.` : ""
    }`,
  );

  if (documentType.needsConduct && conduct.sentence) {
    paragraphs.push(conduct.sentence.replace("{pronoun}", pronoun.object));
  }

  if (documentType.id === "relieving") {
    paragraphs.push(
      `${nameWithTitle} has been relieved from ${pronoun.possessive} duties with effect from the close of business on ${leftLong}${
        reason ? `, following ${reason}` : ""
      }.`,
    );
    const settlement = [];
    if (duesSettled) settlement.push("all dues payable by and to the company have been settled");
    if (propertyReturned) settlement.push("company property and access have been returned");
    if (settlement.length) {
      paragraphs.push(`As on the date of this letter, ${settlement.join(" and ")}.`);
    }
  } else if (reason) {
    paragraphs.push(`${nameWithTitle} left the organisation following ${reason}.`);
  }

  paragraphs.push(
    documentType.id === "service"
      ? "This certificate is issued on request for the employee's record."
      : `We wish ${pronoun.object} every success in ${pronoun.possessive} future endeavours.`,
  );

  const header = [company];
  if (address) header.push(address);

  const meta = [];
  if (ref) meta.push(`Ref: ${ref}`);
  meta.push(`Date: ${issuedLong}`);

  const signature = ["For " + company, "", signatory || "[Authorised signatory name]", signatoryRole || "[Designation]", "(Signature and company seal)"];

  const letter = [
    header.join("\n"),
    "",
    meta.join("\n"),
    "",
    documentType.title,
    "",
    paragraphs.join("\n\n"),
    "",
    signature.join("\n"),
  ].join("\n");

  const checklist = [
    { item: "Printed on company letterhead", done: Boolean(address) },
    { item: "Reference number for the HR file", done: Boolean(ref) },
    { item: "Date of issue", done: Boolean(issuedLong) },
    { item: "Employee name and ID", done: Boolean(empId) },
    { item: "Designation at the time of leaving", done: Boolean(role) },
    { item: "Exact period of service with both dates", done: Boolean(joinedLong && leftLong) },
    { item: "Tenure stated in years and months", done: true },
    {
      item: documentType.id === "relieving" ? "Dues and property confirmed" : "Conduct or purpose stated",
      done: documentType.id === "relieving" ? Boolean(duesSettled && propertyReturned) : Boolean(conduct.sentence) || documentType.id === "service",
    },
    { item: "Authorised signatory named", done: Boolean(signatory && signatoryRole) },
  ];

  return {
    letter,
    documentType,
    tenure,
    wordCount: letter.split(/\s+/).filter(Boolean).length,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
  };
}
