/**
 * University transcript request letter drafter.
 *
 * An academic transcript is the university's consolidated, attested record of all
 * semesters/years, courses and grades. Indian universities issue transcripts from
 * the Controller of Examinations / Registrar (Academic) office on a written
 * application that must state: full name as on records, enrolment/registration
 * number, programme and specialisation, period of study, year of passing, the
 * number of sets required, and how the transcripts are to be delivered (collected
 * in person, posted, emailed as digital copies, or sent directly to an evaluation
 * agency such as WES which requires sealed envelopes or direct electronic
 * transmission). This module assembles that application plus the enclosure
 * checklist the transcript cell typically asks for. Pure text assembly.
 */

/** Practical bounds so a typo cannot ask for a thousand sets. */
export const MIN_COPIES = 1;
export const MAX_COPIES = 20;

export const ADDRESSEE_OPTIONS = [
  { id: "coe", label: "The Controller of Examinations" },
  { id: "registrar", label: "The Registrar" },
  { id: "registrar-academic", label: "The Registrar (Academic)" },
  { id: "principal", label: "The Principal" },
  { id: "transcript-cell", label: "The In-charge, Transcript Cell" },
];

/**
 * Delivery modes universities commonly offer. WES and similar Educational
 * Credential Assessment (ECA) agencies require transcripts either in
 * university-sealed envelopes or transmitted directly by the university.
 */
export const DELIVERY_OPTIONS = [
  {
    id: "in-person",
    label: "I will collect in person",
    clause: "I will collect the transcripts in person from the university office",
    needsAddress: false,
  },
  {
    id: "post",
    label: "Post/courier to my address",
    clause: "kindly dispatch the transcripts by post/courier to the address given below",
    needsAddress: true,
  },
  {
    id: "email",
    label: "Digital copies by email",
    clause: "kindly send digitally signed/scanned copies of the transcripts to my email address given below",
    needsAddress: true,
  },
  {
    id: "agency",
    label: "Send directly to an evaluation agency (WES / IQAS / ECE etc.)",
    clause: "kindly send the transcripts in sealed and signed envelopes directly to the evaluation agency at the address/portal given below, quoting my reference number",
    needsAddress: true,
  },
];

export const PURPOSE_OPTIONS = [
  {
    id: "wes",
    label: "Credential evaluation (WES / ECA for Canada, USA)",
    phrase: "credential evaluation by an educational credential assessment agency",
    note: "WES requires the transcript sent by the university in a sealed envelope or via its official document portal, with your WES reference number written on the envelope/form.",
  },
  {
    id: "admission-abroad",
    label: "Admission to a foreign university",
    phrase: "admission to a university abroad",
    note: "Many foreign universities want one sealed transcript per application, so count your applications before choosing the number of sets.",
  },
  {
    id: "higher-study-india",
    label: "Higher studies in India",
    phrase: "admission to a higher-study programme in India",
    note: "Indian institutions usually accept attested transcript copies; confirm whether they want sealed originals.",
  },
  {
    id: "employment",
    label: "Employment / background verification",
    phrase: "employment and background verification",
    note: "Employers' verification agencies often accept digital transcripts; ask whether a sealed hard copy is required.",
  },
  {
    id: "immigration",
    label: "Immigration / PR file",
    phrase: "an immigration application",
    note: "Immigration files usually rely on the ECA report rather than the raw transcript, but keep one extra sealed set for your records.",
  },
  { id: "other", label: "Other (type your own purpose)", phrase: "", note: "State the purpose precisely so the office issues the correct format." },
];

/**
 * Enclosures transcript cells commonly require with the application. Which ones
 * apply depends on the delivery mode chosen.
 */
export const BASE_ENCLOSURES = [
  "Self-attested copies of all semester/year marksheets",
  "Copy of the degree/provisional certificate",
  "Copy of a government photo ID",
  "Proof of payment of the transcript fee (receipt/transaction ID)",
];
export const AGENCY_ENCLOSURE =
  "Evaluation agency request form / reference number (e.g. WES Academic Records Request Form)";
export const POST_ENCLOSURE = "Self-addressed envelope or courier charges, if the university requires it";

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
 * Build the transcript request letter and enclosure checklist.
 * @returns {{letter: string, subject: string, enclosures: string[], purposeNote: string}|{error: string}}
 */
export function buildTranscriptRequest({
  studentName,
  enrollmentNumber,
  program,
  specialization = "",
  studyFrom,
  studyTo,
  yearOfPassing,
  copies,
  addresseeId,
  universityName,
  universityCity = "",
  deliveryId,
  deliveryAddress = "",
  purposeId,
  customPurpose = "",
  letterDate,
  contact = "",
}) {
  const name = clean(studentName);
  const enrolment = clean(enrollmentNumber);
  const programName = clean(program);
  const university = clean(universityName);

  if (!name) return { error: "Enter your full name as it appears on university records." };
  if (!enrolment) return { error: "Enter your enrolment / registration number." };
  if (!programName) return { error: "Enter the programme, for example B.Sc Physics or MBA." };
  if (!university) return { error: "Enter the university or college name." };

  const from = Number(studyFrom);
  const to = Number(studyTo);
  if (!Number.isInteger(from) || from < 1900 || from > 2100) {
    return { error: "Enter a valid start year of study (for example 2018)." };
  }
  if (!Number.isInteger(to) || to < 1900 || to > 2100) {
    return { error: "Enter a valid end year of study (for example 2022)." };
  }
  if (to < from) return { error: "The end year of study cannot be before the start year." };

  const passYear = Number(yearOfPassing);
  if (!Number.isInteger(passYear) || passYear < 1900 || passYear > 2100) {
    return { error: "Enter a valid year of passing." };
  }
  if (passYear < to) return { error: "The year of passing cannot be before the end year of study." };

  const sets = Number(copies);
  if (!Number.isInteger(sets) || sets < MIN_COPIES) {
    return { error: `Number of transcript sets must be a whole number of at least ${MIN_COPIES}.` };
  }
  if (sets > MAX_COPIES) {
    return { error: `Universities rarely issue more than ${MAX_COPIES} sets at once — enter ${MAX_COPIES} or fewer.` };
  }

  const addressee = ADDRESSEE_OPTIONS.find((option) => option.id === addresseeId);
  if (!addressee) return { error: "Choose whom the letter is addressed to." };

  const delivery = DELIVERY_OPTIONS.find((option) => option.id === deliveryId);
  if (!delivery) return { error: "Choose how the transcripts should be delivered." };

  const address = clean(deliveryAddress);
  if (delivery.needsAddress && !address) {
    return { error: "Enter the delivery address / email / agency reference for the chosen delivery mode." };
  }

  const purpose = PURPOSE_OPTIONS.find((option) => option.id === purposeId);
  if (!purpose) return { error: "Choose the purpose of the transcripts." };
  const purposePhrase = purpose.id === "other" ? clean(customPurpose) : purpose.phrase;
  if (!purposePhrase) return { error: "Type the purpose for which you need the transcripts." };

  const dateText = formatLetterDate(letterDate);
  if (!dateText) return { error: "Pick a valid letter date." };

  const spec = clean(specialization);
  const contactLine = clean(contact);

  const subject = `Request for issue of ${sets} set${sets === 1 ? "" : "s"} of official academic transcripts`;

  const programClause = spec ? `${programName} (${spec})` : programName;
  const toBlock = [addressee.label, university, clean(universityCity)].filter(Boolean).join("\n");

  const enclosures = [...BASE_ENCLOSURES];
  if (delivery.id === "agency") enclosures.push(AGENCY_ENCLOSURE);
  if (delivery.id === "post") enclosures.push(POST_ENCLOSURE);

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
    `I, ${name}, completed the ${programClause} programme at your esteemed institution during ${from}–${to}, passing in ${passYear}. My enrolment/registration number is ${enrolment}.`,
    ``,
    `I kindly request you to issue ${sets} official transcript set${sets === 1 ? "" : "s"} covering all semesters/years of the programme, as I require them for ${purposePhrase}. ${delivery.id === "in-person" ? `${delivery.clause}.` : `In respect of delivery, ${delivery.clause}.`}`,
    delivery.needsAddress ? `` : null,
    delivery.needsAddress ? `Delivery details: ${address}` : null,
    ``,
    `I have enclosed the supporting documents listed below and have paid the prescribed transcript fee. Kindly let me know if any further document or payment is required, and the expected date by which the transcripts will be ready.`,
    ``,
    `Thanking you,`,
    ``,
    `Yours sincerely,`,
    name,
    `Enrolment/Registration No.: ${enrolment}`,
    `${programClause}, ${from}–${to} (passed ${passYear})`,
    contactLine ? `Contact: ${contactLine}` : null,
    ``,
    `Enclosures:`,
    ...enclosures.map((item, index) => `${index + 1}. ${item}`),
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { letter, subject, enclosures, purposeNote: purpose.note };
}
