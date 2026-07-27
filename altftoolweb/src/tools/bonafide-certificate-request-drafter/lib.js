/**
 * Bonafide certificate request letter drafter.
 *
 * A bonafide certificate is issued by an Indian school/college/university certifying
 * that the named person is (or was) a genuine — "bona fide" — student of that
 * institution. Institutions issue it only on a written application to the head of
 * the institution (Principal / Registrar / Dean), and the application is expected
 * to state: full name, class/course and section/branch, roll or enrolment number,
 * academic year, and the specific purpose for which the certificate is required.
 * This module assembles that application in the standard formal-letter layout used
 * in Indian institutions (from-block, date, to-block, subject, salutation, body,
 * closing). It is plain text assembly — no statutory rates are involved.
 */

/** Addressees conventionally empowered to issue a bonafide certificate. */
export const ADDRESSEE_OPTIONS = [
  { id: "principal", label: "The Principal", salutation: "Respected Sir/Madam" },
  { id: "registrar", label: "The Registrar", salutation: "Respected Sir/Madam" },
  { id: "dean", label: "The Dean (Academics)", salutation: "Respected Sir/Madam" },
  { id: "headmaster", label: "The Headmaster/Headmistress", salutation: "Respected Sir/Madam" },
  { id: "director", label: "The Director", salutation: "Respected Sir/Madam" },
];

/**
 * Common purposes institutions accept on bonafide applications. The phrase is what
 * goes into the letter body; the note reminds the applicant of any attachment the
 * receiving authority usually asks for alongside the certificate.
 */
export const PURPOSE_OPTIONS = [
  {
    id: "passport",
    label: "Passport application",
    phrase: "applying for a passport",
    note: "Passport Seva accepts a bonafide certificate as proof of student status for the non-ECR category.",
  },
  {
    id: "bank-account",
    label: "Opening a student bank account",
    phrase: "opening a student bank account",
    note: "Most banks accept a bonafide certificate as address/identity support for minor or student accounts.",
  },
  {
    id: "education-loan",
    label: "Education loan",
    phrase: "applying for an education loan",
    note: "Lenders usually also want the fee structure and admission letter along with the bonafide certificate.",
  },
  {
    id: "scholarship",
    label: "Scholarship application",
    phrase: "applying for a scholarship",
    note: "State and NSP scholarship portals ask for a current-year bonafide certificate.",
  },
  {
    id: "concession",
    label: "Bus / railway concession",
    phrase: "obtaining a travel concession pass",
    note: "Railway student concessions require the certificate to state the home station and institution station.",
  },
  {
    id: "visa",
    label: "Visa / study abroad",
    phrase: "submitting with a visa application",
    note: "Embassies generally want the certificate on institution letterhead with a recent issue date.",
  },
  {
    id: "internship",
    label: "Internship application",
    phrase: "applying for an internship",
    note: "Companies use the bonafide certificate to confirm you are a currently enrolled student.",
  },
  {
    id: "hostel",
    label: "Hostel / PG accommodation",
    phrase: "securing hostel or paying-guest accommodation",
    note: "Landlords and hostels use it to verify enrolment before signing an agreement.",
  },
  {
    id: "other",
    label: "Other (type your own purpose)",
    phrase: "",
    note: "State the purpose precisely — institutions mention the purpose on the certificate itself.",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format an ISO yyyy-mm-dd date as "26 July 2026" for the letter head. */
export function formatLetterDate(isoDate) {
  if (typeof isoDate !== "string" || !DATE_PATTERN.test(isoDate)) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Round-trip through Date.UTC to reject impossible calendar dates like 30 February.
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

const clean = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

/**
 * Build the bonafide certificate request letter.
 *
 * @param {object} input
 * @param {string} input.studentName     Full name as on institution records.
 * @param {string} input.parentName     Father's/mother's/guardian's name (optional, common in school format).
 * @param {string} input.rollNumber      Roll / enrolment / registration number.
 * @param {string} input.course          Class or course with branch, e.g. "B.Tech CSE".
 * @param {string} input.yearOrSemester  Current year/semester or section, e.g. "3rd year (Semester V)".
 * @param {string} input.institutionName Name of the school/college.
 * @param {string} input.institutionCity City/address line for the to-block (optional).
 * @param {string} input.addresseeId     One of ADDRESSEE_OPTIONS ids.
 * @param {string} input.purposeId       One of PURPOSE_OPTIONS ids.
 * @param {string} input.customPurpose   Free-text purpose when purposeId === "other".
 * @param {string} input.letterDate      ISO date to print on the letter.
 * @param {string} input.contact         Phone/email to include under the signature (optional).
 * @returns {{letter: string, subject: string, purposeNote: string}|{error: string}}
 */
export function buildBonafideRequest({
  studentName,
  parentName = "",
  rollNumber,
  course,
  yearOrSemester = "",
  institutionName,
  institutionCity = "",
  addresseeId,
  purposeId,
  customPurpose = "",
  letterDate,
  contact = "",
}) {
  const name = clean(studentName);
  const roll = clean(rollNumber);
  const courseName = clean(course);
  const institution = clean(institutionName);

  if (!name) return { error: "Enter the student's full name as it appears on institution records." };
  if (!roll) return { error: "Enter the roll, enrolment or registration number." };
  if (!courseName) return { error: "Enter the class or course (for example, B.Com or Class 10-B)." };
  if (!institution) return { error: "Enter the name of the school or college." };

  const addressee = ADDRESSEE_OPTIONS.find((option) => option.id === addresseeId);
  if (!addressee) return { error: "Choose whom the letter is addressed to." };

  const purpose = PURPOSE_OPTIONS.find((option) => option.id === purposeId);
  if (!purpose) return { error: "Choose the purpose of the certificate." };

  const purposePhrase = purpose.id === "other" ? clean(customPurpose) : purpose.phrase;
  if (!purposePhrase) return { error: "Type the purpose for which you need the certificate." };

  const dateText = formatLetterDate(letterDate);
  if (!dateText) return { error: "Pick a valid letter date." };

  const guardian = clean(parentName);
  const stage = clean(yearOrSemester);
  const city = clean(institutionCity);
  const contactLine = clean(contact);

  const subject = "Request for issue of a bonafide certificate";

  const identityClause = guardian
    ? `I, ${name}, son/daughter of ${guardian},`
    : `I, ${name},`;
  const stageClause = stage ? `, currently in ${stage}` : "";

  const toBlock = [addressee.label, institution, city].filter(Boolean).join("\n");

  const letter = [
    `To,`,
    toBlock,
    ``,
    `Date: ${dateText}`,
    ``,
    `Subject: ${subject}`,
    ``,
    `${addressee.salutation},`,
    ``,
    `${identityClause} am a student of ${courseName}${stageClause} at ${institution}, bearing roll/enrolment number ${roll}.`,
    ``,
    `I kindly request you to issue me a bonafide certificate, as I require it for ${purposePhrase}. I would be grateful if the certificate could mention my name, course and roll number as per the institution's records.`,
    ``,
    `I shall be highly obliged for your kind consideration. Kindly let me know if any fee is payable or any further document is required from my side.`,
    ``,
    `Thanking you,`,
    ``,
    `Yours obediently,`,
    name,
    `Roll/Enrolment No.: ${roll}`,
    `${courseName}${stage ? `, ${stage}` : ""}`,
    contactLine ? `Contact: ${contactLine}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { letter, subject, purposeNote: purpose.note };
}
