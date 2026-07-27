/**
 * Duplicate marksheet application drafter with affidavit checklist.
 *
 * Indian boards and universities issue a duplicate marksheet (often stamped
 * "DUPLICATE") on a written application supported by documents that depend on
 * WHY the original is unavailable:
 *  - Lost / stolen: a police complaint or FIR copy and a notarised affidavit on
 *    non-judicial stamp paper declaring the loss are the near-universal
 *    requirements (e.g. CBSE and most state boards/universities); some
 *    institutions additionally ask for a newspaper advertisement of the loss.
 *  - Damaged / partially destroyed: the damaged original must usually be
 *    surrendered with the application; an FIR is not required.
 *  - Destroyed in fire/flood: an affidavit describing the event; some offices
 *    accept a fire-brigade / disaster-authority report in place of an FIR.
 * Stamp-paper value and fees vary by state and institution, so this module
 * describes the requirement rather than fixing a rupee value.
 * Pure text assembly — no statutory rates involved.
 */

export const ADDRESSEE_OPTIONS = [
  { id: "coe", label: "The Controller of Examinations" },
  { id: "registrar", label: "The Registrar" },
  { id: "secretary-board", label: "The Secretary, Board of Examinations" },
  { id: "regional-officer", label: "The Regional Officer (Board regional office)" },
  { id: "principal", label: "The Principal" },
];

/**
 * Reasons and the supporting-document rules each one triggers.
 * requiresFir      — police complaint/FIR expected with the application.
 * surrenderOriginal — the damaged original must be enclosed/surrendered.
 */
export const REASON_OPTIONS = [
  {
    id: "lost",
    label: "Lost / misplaced",
    phrase: "the original marksheet has been lost/misplaced and could not be traced despite my best efforts",
    requiresFir: true,
    surrenderOriginal: false,
  },
  {
    id: "stolen",
    label: "Stolen (theft/burglary)",
    phrase: "the original marksheet was stolen along with my other belongings",
    requiresFir: true,
    surrenderOriginal: false,
  },
  {
    id: "damaged",
    label: "Damaged / defaced / torn",
    phrase: "the original marksheet has been badly damaged and is no longer legible or usable",
    requiresFir: false,
    surrenderOriginal: true,
  },
  {
    id: "destroyed",
    label: "Destroyed (fire / flood / natural calamity)",
    phrase: "the original marksheet was destroyed in a fire/flood and cannot be produced",
    requiresFir: false,
    surrenderOriginal: false,
  },
];

/** Documents asked for regardless of reason. */
export const BASE_CHECKLIST = [
  "Duplicate marksheet application in the prescribed form (or this letter where no form exists)",
  "Notarised affidavit on non-judicial stamp paper (value as prescribed by your state/institution) declaring the facts",
  "Self-attested copy of a government photo ID",
  "Photocopy of the marksheet, if any copy or scan survives",
  "Prescribed duplicate-marksheet fee (receipt / demand draft / online transaction ID)",
  "Passport-size photographs, if the institution's form asks for them",
];
export const FIR_CHECKLIST_ITEM =
  "Copy of the police complaint / FIR or the online Lost Article Report for the lost/stolen marksheet";
export const SURRENDER_CHECKLIST_ITEM =
  "The damaged original marksheet, to be surrendered with the application";
export const CALAMITY_CHECKLIST_ITEM =
  "Fire brigade / municipal / disaster-authority report of the incident, where available";
export const NEWSPAPER_NOTE =
  "Some boards and universities also ask for a newspaper advertisement announcing the loss — confirm with the office before printing one.";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format an ISO yyyy-mm-dd date as "26 July 2026"; null when not a real date. */
export function formatLetterDate(isoDate) {
  if (typeof isoDate !== "string" || !DATE_PATTERN.test(isoDate)) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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
 * Build the duplicate marksheet application, the affidavit skeleton and the
 * reason-specific document checklist.
 * @returns {{letter: string, affidavit: string, checklist: string[], subject: string, newspaperNote: string}|{error: string}}
 */
export function buildDuplicateMarksheetRequest({
  applicantName,
  parentName = "",
  rollNumber,
  examName,
  yearOfExam,
  boardOrUniversity,
  officeCity = "",
  addresseeId,
  reasonId,
  firNumber = "",
  letterDate,
  contact = "",
}) {
  const name = clean(applicantName);
  const roll = clean(rollNumber);
  const exam = clean(examName);
  const board = clean(boardOrUniversity);

  if (!name) return { error: "Enter the applicant's full name as printed on the marksheet." };
  if (!roll) return { error: "Enter the roll / enrolment number on the marksheet." };
  if (!exam) return { error: "Enter the examination name, for example Class 12 (Senior Secondary) or B.Com Semester IV." };
  if (!board) return { error: "Enter the board or university that issued the marksheet." };

  const year = Number(yearOfExam);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return { error: "Enter a valid year of examination (for example 2019)." };
  }

  const addressee = ADDRESSEE_OPTIONS.find((option) => option.id === addresseeId);
  if (!addressee) return { error: "Choose whom the application is addressed to." };

  const reason = REASON_OPTIONS.find((option) => option.id === reasonId);
  if (!reason) return { error: "Choose why you need a duplicate marksheet." };

  const dateText = formatLetterDate(letterDate);
  if (!dateText) return { error: "Pick a valid letter date." };

  const fir = clean(firNumber);
  const guardian = clean(parentName);
  const contactLine = clean(contact);

  const subject = `Application for issue of a duplicate marksheet — ${exam}, ${year}`;

  const checklist = [...BASE_CHECKLIST];
  if (reason.requiresFir) checklist.push(FIR_CHECKLIST_ITEM);
  if (reason.surrenderOriginal) checklist.push(SURRENDER_CHECKLIST_ITEM);
  if (reason.id === "destroyed") checklist.push(CALAMITY_CHECKLIST_ITEM);

  const identityClause = guardian ? `I, ${name}, son/daughter of ${guardian},` : `I, ${name},`;
  const firClause = reason.requiresFir
    ? fir
      ? ` A police complaint has been lodged in this regard (complaint/FIR No. ${fir}), and a copy is enclosed.`
      : ` A police complaint regarding the loss has been lodged, and a copy is enclosed.`
    : "";
  const surrenderClause = reason.surrenderOriginal
    ? " I am surrendering the damaged original marksheet along with this application."
    : "";

  const toBlock = [addressee.label, board, clean(officeCity)].filter(Boolean).join("\n");

  const letter = [
    `To,`,
    toBlock,
    ``,
    `Date: ${dateText}`,
    ``,
    `Subject: ${subject}`,
    ``,
    `Respected Sir/Madam,`,
    ``,
    `${identityClause} appeared in the ${exam} examination conducted by ${board} in ${year} under roll/enrolment number ${roll}. I regret to inform you that ${reason.phrase}.${firClause}${surrenderClause}`,
    ``,
    `I therefore request you to kindly issue me a duplicate marksheet for the said examination. I have enclosed the notarised affidavit, the prescribed fee and the supporting documents listed below, and I undertake to return the duplicate if the original is later traced.`,
    ``,
    `Kindly inform me if any further document or fee is required, and the expected date of issue.`,
    ``,
    `Thanking you,`,
    ``,
    `Yours sincerely,`,
    name,
    `Roll/Enrolment No.: ${roll}`,
    `${exam}, ${year} — ${board}`,
    contactLine ? `Contact: ${contactLine}` : null,
    ``,
    `Enclosures:`,
    ...checklist.map((item, index) => `${index + 1}. ${item}`),
  ]
    .filter((line) => line !== null)
    .join("\n");

  const affidavit = [
    `AFFIDAVIT`,
    `(to be executed on non-judicial stamp paper of the value prescribed in your state and notarised)`,
    ``,
    `I, ${name}${guardian ? `, son/daughter of ${guardian}` : ""}, do hereby solemnly affirm and declare as under:`,
    ``,
    `1. That I appeared in the ${exam} examination conducted by ${board} in ${year} under roll/enrolment number ${roll} and was issued the original marksheet.`,
    `2. That ${reason.phrase}.`,
    reason.requiresFir
      ? `3. That a police complaint${fir ? ` (No. ${fir})` : ""} has been lodged regarding the loss, and the marksheet has not been traced to date.`
      : `3. That the original marksheet is not available with me for the reason stated above${reason.surrenderOriginal ? ", and the damaged original is being surrendered to the issuing authority" : ""}.`,
    `4. That the marksheet has not been pledged, sold or handed over to any person or institution, and no misuse of it by me is intended.`,
    `5. That I undertake to surrender the duplicate marksheet to the issuing authority if the original is found at any later date.`,
    ``,
    `I state that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed.`,
    ``,
    `Deponent: ${name}`,
    `Place: ____________`,
    `Date: ${dateText}`,
    ``,
    `(Signature of Deponent — to be signed before the Notary Public)`,
  ].join("\n");

  return { letter, affidavit, checklist, subject, newspaperNote: NEWSPAPER_NOTE };
}
