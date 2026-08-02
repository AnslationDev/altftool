/**
 * Gram panchayat application letter builder (India).
 *
 * Framework and rules referenced:
 *  - Constitution of India, Part IX (Articles 243 to 243-O), inserted by the
 *    Constitution (Seventy-third Amendment) Act, 1992, constitutes panchayats at
 *    the village, intermediate and district level. Article 243A constitutes the
 *    Gram Sabha, and Article 243G with the Eleventh Schedule lists the
 *    twenty-nine subjects a state may devolve to panchayats — among them
 *    drinking water, rural roads, rural electrification, sanitation, housing,
 *    health and poverty alleviation.
 *  - Right to Information Act, 2005, s.6: an application is made to the Public
 *    Information Officer. s.7(1): the PIO shall provide the information or
 *    reject the request within thirty days of receipt, except that where the
 *    information sought concerns the life or liberty of a person it must be
 *    provided within forty-eight hours. s.19(1): a first appeal lies within
 *    thirty days to an officer senior in rank to the PIO.
 *  - Mahatma Gandhi National Rural Employment Guarantee Act, 2005: an
 *    applicant who has applied for work is entitled to be given employment
 *    within fifteen days of the application, failing which a daily unemployment
 *    allowance is payable; wages are payable within a fortnight of the date on
 *    which the work was done.
 *  - Registration of Births and Deaths Act, 1969: an event must be reported
 *    within twenty-one days. Section 13(1) allows registration after that and
 *    within thirty days on payment of a late fee; s.13(2) allows registration
 *    after thirty days and within one year with the written permission of the
 *    prescribed authority, an affidavit and a late fee; s.13(3) allows
 *    registration after one year only on the order of a magistrate of the first
 *    class or a Presidency Magistrate, and on payment of a late fee.
 *
 * Panchayat powers, forms and fees are fixed by each state's Panchayati Raj Act
 * and rules, so treat everything other than the central statutes above as a
 * drafting convention. Informational only, not legal advice.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

export function addYearsISO(isoDate, years) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(years)) return null;
  const y = date.getUTCFullYear() + Math.round(years);
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* --------------------------------------------------------------- constants */

/** RTI Act, 2005, s.7(1) — ordinary reply period. */
export const RTI_REPLY_DAYS = 30;
/** RTI Act, 2005, s.7(1) proviso — life or liberty of a person. */
export const RTI_LIFE_LIBERTY_HOURS = 48;
/** RTI Act, 2005, s.19(1) — first appeal window. */
export const RTI_FIRST_APPEAL_DAYS = 30;
/** MGNREGA, 2005 — employment to be given within fifteen days of application. */
export const MGNREGA_WORK_DAYS = 15;
/** Registration of Births and Deaths Act, 1969 — report within twenty-one days. */
export const REGISTRATION_NORMAL_DAYS = 21;
/** s.13(1) — late fee band. */
export const REGISTRATION_LATE_FEE_DAYS = 30;
/** s.13(2) — permission and affidavit band runs to one year. */
export const REGISTRATION_AFFIDAVIT_YEARS = 1;
/** Sanity bound so a typo cannot produce an absurd result. */
export const MAX_EVENT_AGE_DAYS = 40_000;

export const REGISTRATION_BANDS = {
  NORMAL: "normal",
  LATE_FEE: "late-fee",
  AFFIDAVIT: "affidavit",
  MAGISTRATE: "magistrate",
};

export const REGISTRATION_BAND_TEXT = {
  [REGISTRATION_BANDS.NORMAL]:
    "Within twenty-one days of the event, so it can be registered in the ordinary course with no late fee.",
  [REGISTRATION_BANDS.LATE_FEE]:
    "Between twenty-one and thirty days, so section 13(1) of the Registration of Births and Deaths Act, 1969 applies and a late fee is payable.",
  [REGISTRATION_BANDS.AFFIDAVIT]:
    "Between thirty days and one year, so section 13(2) applies — the written permission of the prescribed authority, an affidavit and a late fee are needed.",
  [REGISTRATION_BANDS.MAGISTRATE]:
    "More than one year after the event, so section 13(3) applies — registration is only on the order of a magistrate of the first class or a Presidency Magistrate, with a late fee.",
};

/* ---------------------------------------------------------- application types */

export const APPLICATION_TYPES = [
  {
    id: "road-repair",
    label: "Village road or street repair",
    addressee: "The Sarpanch",
    ask: "sanction the repair of the road described above from the panchayat's works budget, and place it before the Gram Sabha if a resolution is needed",
    subject: "Application for repair of the village road",
    deadlineDays: null,
    escalation: "the Block Development Officer and then the Panchayat Samiti",
    docs: ["Photographs of the damaged stretch", "Names and signatures of other residents affected"],
    needsEventDate: false,
    basis: "Entry 13 of the Eleventh Schedule to the Constitution places roads, culverts, bridges and waterways within the panchayat's subjects.",
  },
  {
    id: "street-light",
    label: "Street light installation or repair",
    addressee: "The Sarpanch",
    ask: "sanction the installation or repair of street lights at the location described above",
    subject: "Application for street lighting",
    deadlineDays: null,
    escalation: "the Block Development Officer",
    docs: ["Photographs of the unlit stretch", "A sketch or landmark description of the pole locations"],
    needsEventDate: false,
    basis: "Entry 14 of the Eleventh Schedule places rural electrification, including the distribution of electricity, within the panchayat's subjects.",
  },
  {
    id: "drinking-water",
    label: "Drinking water, handpump or borewell",
    addressee: "The Sarpanch",
    ask: "sanction the repair of the existing source, or a new source, so that the households named below have a reliable supply of drinking water",
    subject: "Application for drinking water supply",
    deadlineDays: null,
    escalation: "the Block Development Officer and the Public Health Engineering department",
    docs: ["Number of households affected", "Photographs of the defunct source"],
    needsEventDate: false,
    basis: "Entry 11 of the Eleventh Schedule places drinking water within the panchayat's subjects.",
  },
  {
    id: "drainage-sanitation",
    label: "Drainage, garbage or sanitation",
    addressee: "The Sarpanch",
    ask: "have the drain cleared and a regular cleaning schedule fixed for this ward",
    subject: "Application regarding drainage and sanitation",
    deadlineDays: null,
    escalation: "the Block Development Officer",
    docs: ["Photographs of the blocked drain or garbage point", "Dates on which the problem was reported earlier"],
    needsEventDate: false,
    basis: "Entry 23 of the Eleventh Schedule places health and sanitation within the panchayat's subjects.",
  },
  {
    id: "birth-certificate",
    label: "Birth certificate / birth registration",
    addressee: "The Registrar of Births and Deaths (Gram Panchayat)",
    ask: "register the birth and issue the birth certificate",
    subject: "Application for registration of birth and issue of certificate",
    deadlineDays: null,
    escalation: "the District Registrar of Births and Deaths",
    docs: ["Hospital discharge summary or the notification of birth", "Aadhaar or identity proof of both parents", "Proof of residence"],
    needsEventDate: true,
    eventLabel: "Date of birth",
    registration: true,
    basis: "The Registration of Births and Deaths Act, 1969 makes the panchayat the registrar for the village in most states.",
  },
  {
    id: "death-certificate",
    label: "Death certificate / death registration",
    addressee: "The Registrar of Births and Deaths (Gram Panchayat)",
    ask: "register the death and issue the death certificate",
    subject: "Application for registration of death and issue of certificate",
    deadlineDays: null,
    escalation: "the District Registrar of Births and Deaths",
    docs: ["Medical certificate of cause of death or cremation receipt", "Identity proof of the deceased", "Identity proof of the applicant"],
    needsEventDate: true,
    eventLabel: "Date of death",
    registration: true,
    basis: "The Registration of Births and Deaths Act, 1969 makes the panchayat the registrar for the village in most states.",
  },
  {
    id: "residence-certificate",
    label: "Residence certificate recommendation",
    addressee: "The Sarpanch",
    ask: "issue a residence certificate, or a recommendation to the tehsildar, confirming that I have resided in this village at the address given above",
    subject: "Application for a residence certificate / recommendation",
    deadlineDays: null,
    escalation: "the Tehsildar",
    docs: ["Ration card or electoral photo identity card", "Aadhaar", "Proof of residence such as a tax receipt or electricity bill"],
    needsEventDate: false,
    basis: "Residence and domicile certificates are issued under state revenue rules, with the panchayat's report or recommendation.",
  },
  {
    id: "income-certificate",
    label: "Income certificate recommendation",
    addressee: "The Sarpanch",
    ask: "issue the panchayat's report on my family's annual income so that the tehsildar can process my income certificate application",
    subject: "Application for a report in support of an income certificate",
    deadlineDays: null,
    escalation: "the Tehsildar",
    docs: ["Ration card", "Aadhaar", "Land records or salary details, whichever apply"],
    needsEventDate: false,
    basis: "Income certificates are issued by the revenue authority under state rules, usually on the panchayat's report.",
  },
  {
    id: "mgnrega-job-card",
    label: "MGNREGA job card",
    addressee: "The Gram Panchayat",
    ask: "register my household and issue a job card under the Mahatma Gandhi National Rural Employment Guarantee Act, 2005",
    subject: "Application for registration and issue of a job card under MGNREGA",
    deadlineDays: MGNREGA_WORK_DAYS,
    deadlineBasis: "MGNREGA registration and job card issue",
    escalation: "the Programme Officer at the block and then the District Programme Coordinator",
    docs: ["Photographs of every adult member of the household", "Aadhaar of each adult member", "Proof of residence in the gram panchayat"],
    needsEventDate: false,
    basis: "Every adult member of a rural household willing to do unskilled manual work is entitled to registration and a job card under MGNREGA.",
  },
  {
    id: "mgnrega-work",
    label: "MGNREGA demand for work",
    addressee: "The Gram Panchayat",
    ask: "provide work under MGNREGA against the demand recorded below, and give me a dated receipt of this application",
    subject: "Written demand for employment under MGNREGA",
    deadlineDays: MGNREGA_WORK_DAYS,
    deadlineBasis: "employment within fifteen days of the demand under MGNREGA",
    escalation: "the Programme Officer at the block and then the District Programme Coordinator",
    docs: ["Job card number and a copy of the job card", "Names of the household members seeking work"],
    needsEventDate: false,
    basis: "An applicant is entitled to employment within fifteen days of applying, failing which a daily unemployment allowance is payable.",
  },
  {
    id: "housing-scheme",
    label: "Rural housing scheme inclusion",
    addressee: "The Sarpanch",
    ask: "place my name before the Gram Sabha for inclusion in the rural housing list and forward the case to the block office",
    subject: "Application for inclusion in the rural housing list",
    deadlineDays: null,
    escalation: "the Block Development Officer",
    docs: ["Ration card and Aadhaar", "Photographs of the present dwelling", "Any earlier application or survey reference number"],
    needsEventDate: false,
    basis: "Entry 10 of the Eleventh Schedule places rural housing within the panchayat's subjects; selection is through the Gram Sabha.",
  },
  {
    id: "toilet-assistance",
    label: "Household toilet construction assistance",
    addressee: "The Sarpanch",
    ask: "sanction the household toilet assistance available under the sanitation programme and confirm the instalment schedule",
    subject: "Application for household toilet construction assistance",
    deadlineDays: null,
    escalation: "the Block Development Officer",
    docs: ["Aadhaar and bank account details of the beneficiary", "Photograph of the site"],
    needsEventDate: false,
    basis: "Entry 23 of the Eleventh Schedule places health and sanitation, including sanitation and conservancy, within the panchayat's subjects.",
  },
  {
    id: "construction-noc",
    label: "No objection certificate for construction",
    addressee: "The Sarpanch",
    ask: "issue a no objection certificate for the construction described above, after such inspection as the panchayat requires",
    subject: "Application for a no objection certificate for construction",
    deadlineDays: null,
    escalation: "the Block Development Officer",
    docs: ["Copy of the land record or sale deed", "Site plan and building plan", "Latest property tax receipt"],
    needsEventDate: false,
    basis: "Building permission in a village area is granted by the panchayat under the state Panchayati Raj Act and its building rules.",
  },
  {
    id: "rti",
    label: "RTI application to the panchayat",
    addressee: "The Public Information Officer, Gram Panchayat",
    ask: "furnish the information listed below under the Right to Information Act, 2005",
    subject: "Application under section 6 of the Right to Information Act, 2005",
    deadlineDays: RTI_REPLY_DAYS,
    deadlineBasis: "reply under section 7(1) of the RTI Act, 2005",
    escalation: "the First Appellate Authority and then the State Information Commission",
    docs: ["Proof of payment of the application fee prescribed by the state", "Below poverty line certificate, if you are claiming fee exemption"],
    needsEventDate: false,
    rti: true,
    basis: "Section 7(1) of the RTI Act, 2005 requires the Public Information Officer to provide the information or reject the request within thirty days.",
  },
];

export function applicationTypeById(id) {
  return APPLICATION_TYPES.find((item) => item.id === id) || APPLICATION_TYPES[0];
}

/* --------------------------------------------------------------- assessment */

/**
 * Work out the reply deadline for the application, the registration band for a
 * birth or death, and the follow-up dates. Pure: all dates are arguments.
 */
export function assessApplication({ typeId, applicationDateISO, eventDateISO, lifeOrLiberty }) {
  if (!parseISODate(applicationDateISO)) return { error: "Enter a valid date for the application." };

  const type = applicationTypeById(typeId);

  let registration = null;
  if (type.registration) {
    if (!parseISODate(eventDateISO)) {
      return { error: `Enter a valid ${(type.eventLabel || "event date").toLowerCase()}.` };
    }
    const elapsed = daysBetweenISO(eventDateISO, applicationDateISO);
    if (elapsed < 0) return { error: "The event cannot be dated after the application." };
    if (elapsed > MAX_EVENT_AGE_DAYS) return { error: "That event date is too far in the past to be plausible — check it." };

    const oneYearISO = addYearsISO(eventDateISO, REGISTRATION_AFFIDAVIT_YEARS);
    const oneYearDays = daysBetweenISO(eventDateISO, oneYearISO);

    let band = REGISTRATION_BANDS.MAGISTRATE;
    if (elapsed <= REGISTRATION_NORMAL_DAYS) band = REGISTRATION_BANDS.NORMAL;
    else if (elapsed <= REGISTRATION_LATE_FEE_DAYS) band = REGISTRATION_BANDS.LATE_FEE;
    else if (elapsed <= oneYearDays) band = REGISTRATION_BANDS.AFFIDAVIT;

    registration = {
      elapsedDays: elapsed,
      band,
      bandText: REGISTRATION_BAND_TEXT[band],
      freeUntilISO: addDaysISO(eventDateISO, REGISTRATION_NORMAL_DAYS),
      needsAffidavit: band === REGISTRATION_BANDS.AFFIDAVIT,
      needsMagistrateOrder: band === REGISTRATION_BANDS.MAGISTRATE,
    };
  }

  let deadlineISO = null;
  let deadlineDays = null;
  let deadlineBasis = null;
  if (type.rti && lifeOrLiberty) {
    // 48 hours is two days for a date-only calculation.
    deadlineDays = 2;
    deadlineISO = addDaysISO(applicationDateISO, 2);
    deadlineBasis = `reply within ${RTI_LIFE_LIBERTY_HOURS} hours under the proviso to section 7(1), as the information concerns the life or liberty of a person`;
  } else if (Number.isFinite(type.deadlineDays) && type.deadlineDays !== null) {
    deadlineDays = type.deadlineDays;
    deadlineISO = addDaysISO(applicationDateISO, type.deadlineDays);
    deadlineBasis = type.deadlineBasis;
  }

  const appealByISO = type.rti && deadlineISO ? addDaysISO(deadlineISO, RTI_FIRST_APPEAL_DAYS) : null;
  // Drafting convention where no statute fixes a period: chase after a fortnight.
  const followUpISO = deadlineISO || addDaysISO(applicationDateISO, 15);

  return {
    type,
    registration,
    deadlineISO,
    deadlineDays,
    deadlineBasis,
    appealByISO,
    followUpISO,
    hasStatutoryDeadline: deadlineISO !== null,
  };
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function buildPanchayatApplication({
  applicantName,
  fatherOrHusbandName,
  houseNumber,
  wardNumber,
  villageName,
  panchayatName,
  blockName,
  districtName,
  stateName,
  addressee,
  typeId,
  applicationDateISO,
  eventDateISO,
  subjectDetail,
  requestDetail,
  jobCardNumber,
  rtiPoints,
  lifeOrLiberty,
  supportingSignatories,
  phone,
  aadhaarLastFour,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates before drafting the application." };
  }

  const type = applicationTypeById(typeId);
  const name = or(applicantName, "[Your full name]");
  const village = or(villageName, "[Village]");
  const panchayat = or(panchayatName, "[Gram Panchayat]");
  const block = or(blockName, "[Block]");
  const district = or(districtName, "[District]");
  const state = clean(stateName);
  const to = or(addressee, type.addressee);
  const ward = clean(wardNumber);

  const identity = [
    `Name: ${name}`,
    clean(fatherOrHusbandName) ? `Father's / husband's name: ${clean(fatherOrHusbandName)}` : "",
    clean(houseNumber) ? `House number: ${clean(houseNumber)}` : "",
    ward ? `Ward number: ${ward}` : "",
    `Village: ${village}`,
    `Gram Panchayat: ${panchayat}`,
    `Block: ${block}`,
    `District: ${district}${state ? `, ${state}` : ""}`,
    clean(phone) ? `Mobile: ${clean(phone)}` : "",
    clean(aadhaarLastFour) ? `Aadhaar (last four digits): ${clean(aadhaarLastFour).slice(-4)}` : "",
    (type.id === "mgnrega-work" || type.id === "mgnrega-job-card") && clean(jobCardNumber)
      ? `Job card number: ${clean(jobCardNumber)}`
      : "",
  ].filter(Boolean);

  const subject = `${type.subject}${clean(subjectDetail) ? ` — ${clean(subjectDetail)}` : ""}`;

  const registrationLines = assessment.registration
    ? [
        `The ${type.id === "death-certificate" ? "death" : "birth"} took place on ${formatLongDate(eventDateISO)}, which is ${plural(assessment.registration.elapsedDays, "day")} before this application.`,
        assessment.registration.bandText,
        assessment.registration.needsAffidavit
          ? "I am enclosing an affidavit and request the written permission of the prescribed authority so that the registration can be completed."
          : "",
        assessment.registration.needsMagistrateOrder
          ? "I understand an order of a magistrate of the first class will be required, and I request the panchayat to give me the certificate of non-availability of registration so that I can move the magistrate."
          : "",
      ].filter(Boolean)
    : [];

  const rtiLines =
    type.rti && clean(rtiPoints)
      ? [
          "Information sought:",
          ...clean(rtiPoints)
            .split("\n")
            .map((line) => clean(line))
            .filter(Boolean)
            .map((line, index) => `${index + 1}. ${line}`),
          "",
          `Please supply certified copies where a document is asked for. ${assessment.deadlineBasis ? `I am entitled to a ${assessment.deadlineBasis}.` : ""}`,
          lifeOrLiberty
            ? "This request concerns the life or liberty of a person, so the proviso to section 7(1) of the Right to Information Act, 2005 applies."
            : "",
        ].filter(Boolean)
      : [];

  const deadlineLine = assessment.hasStatutoryDeadline
    ? `Counting from the date of this application, the ${assessment.deadlineBasis} falls due on ${formatLongDate(assessment.deadlineISO)}.`
    : `No statute fixes a period for this request, so I request that it be taken up at the earliest. I will follow up after ${formatLongDate(assessment.followUpISO)} if I have not heard from the office.`;

  const escalationLine = `If the application is not disposed of, I will take it up with ${type.escalation}.`;

  const body = [
    formatLongDate(applicationDateISO),
    "",
    "To,",
    `${to},`,
    `${panchayat} Gram Panchayat,`,
    `Village ${village}, Block ${block}, District ${district}${state ? `, ${state}` : ""}`,
    "",
    `Subject: ${subject}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am a resident of ${village}${ward ? `, Ward No. ${ward}` : ""} within ${panchayat} Gram Panchayat. My particulars are given below.`,
    "",
    ...identity.map((line) => `  ${line}`),
    "",
    clean(requestDetail) || `I am writing with the following request: ${type.label.toLowerCase()}.`,
    "",
    ...registrationLines,
    ...(registrationLines.length ? [""] : []),
    ...rtiLines,
    ...(rtiLines.length ? [""] : []),
    `I therefore request you to ${type.ask}.`,
    "",
    type.basis,
    "",
    deadlineLine,
    "",
    "Documents enclosed:",
    ...type.docs.map((item, index) => `${index + 1}. ${item}`),
    "",
    clean(supportingSignatories)
      ? `This application is supported by the following residents of the village: ${clean(supportingSignatories)}.`
      : "",
    "",
    "Please issue a dated receipt for this application and note the reference number, so that I can follow it up.",
    "",
    escalationLine,
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    name,
    `${village}, ${panchayat} Gram Panchayat`,
    clean(phone) ? `Mobile: ${clean(phone)}` : "Mobile: [your mobile number]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length, type };
}
