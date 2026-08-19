/**
 * Marriage registration — document checklist and statutory date maths (India).
 *
 * Statutory backbone:
 *  - Hindu Marriage Act, 1955, s.5(iii) and the Prohibition of Child Marriage
 *    Act, 2006: the bridegroom must have completed 21 years and the bride 18
 *    years at the time of the marriage.
 *  - Hindu Marriage Act, 1955, s.8: state governments make rules for
 *    registering a Hindu marriage that has ALREADY been solemnised.
 *  - Special Marriage Act, 1954:
 *      s.4(c) — male 21, female 18;
 *      s.5 — notice of intended marriage to the Marriage Officer of a district
 *            in which at least one party has resided for not less than 30 days
 *            immediately preceding the notice;
 *      s.6 — the notice is published and entered in the Marriage Notice Book;
 *      s.7 — objections may be made within 30 days of publication;
 *      s.12 — the marriage is solemnised in the presence of THREE witnesses;
 *      s.14 — if the marriage is not solemnised within THREE CALENDAR MONTHS
 *             of the notice, a fresh notice is required.
 *  - Indian Christian Marriage Act, 1872; Parsi Marriage and Divorce Act, 1936;
 *    and, for Muslim marriages, the nikahnama read with the state's compulsory
 *    registration of marriages rules.
 *  - Seema v. Ashwani Kumar (2006) 2 SCC 578: the Supreme Court directed states
 *    to make registration of all marriages compulsory.
 *
 * All functions are pure; today's date is always an argument.
 */

/** Hindu Marriage Act s.5(iii) / Special Marriage Act s.4(c) — minimum age for the groom. */
export const MIN_AGE_GROOM = 21;

/** Hindu Marriage Act s.5(iii) / Special Marriage Act s.4(c) — minimum age for the bride. */
export const MIN_AGE_BRIDE = 18;

/** Special Marriage Act s.5 — residence in the district before giving notice. */
export const SMA_RESIDENCE_DAYS = 30;

/** Special Marriage Act s.7 — window for objections after publication. */
export const SMA_OBJECTION_DAYS = 30;

/** Special Marriage Act s.14 — calendar months within which the marriage must be solemnised. */
export const SMA_SOLEMNISE_MONTHS = 3;

/** Special Marriage Act s.12 — witnesses required at solemnisation. */
export const SMA_WITNESSES = 3;

/** Most state rules under HMA s.8 ask for two or three witnesses at registration. */
export const HMA_WITNESSES = 3;

export const MARRIAGE_ACTS = [
  {
    key: "hindu",
    label: "Hindu Marriage Act, 1955 (Hindu, Buddhist, Jain or Sikh parties)",
    alreadySolemnised: true,
    witnesses: HMA_WITNESSES,
    note: "Registers a marriage that has already been solemnised by religious ceremony.",
  },
  {
    key: "special",
    label: "Special Marriage Act, 1954 (any faith, inter-faith or civil marriage)",
    alreadySolemnised: false,
    witnesses: SMA_WITNESSES,
    note: "A civil marriage: notice first, a 30-day objection window, then solemnisation.",
  },
  {
    key: "christian",
    label: "Indian Christian Marriage Act, 1872",
    alreadySolemnised: true,
    witnesses: 2,
    note: "The marriage is solemnised and registered by a licensed minister or Marriage Registrar.",
  },
  {
    key: "parsi",
    label: "Parsi Marriage and Divorce Act, 1936",
    alreadySolemnised: true,
    witnesses: 2,
    note: "Solemnised by a priest in the presence of two Parsi witnesses and then registered.",
  },
  {
    key: "muslim",
    label: "Nikahnama with state registration rules",
    alreadySolemnised: true,
    witnesses: 2,
    note: "The nikahnama evidences the marriage; registration follows the state's own rules.",
  },
];

export const MARITAL_HISTORY = [
  { key: "never", label: "Never married" },
  { key: "divorced", label: "Divorced" },
  { key: "widowed", label: "Widowed" },
];

export const NATIONALITIES = [
  { key: "indian", label: "Indian citizen" },
  { key: "oci", label: "OCI or PIO card holder" },
  { key: "foreign", label: "Foreign national" },
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/** Parse "YYYY-MM-DD"; null when it is not a real calendar date. */
export function parseISODate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const utc = ({ year, month, day }) => Date.UTC(year, month - 1, day);
const iso = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Add whole days to an ISO date. */
export function addDays(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const shifted = new Date(utc(parts) + Math.trunc(count) * DAY_MS);
  return iso({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

/** Add calendar months, clamping to the last day of a short month. */
export function addMonths(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const total = parts.year * 12 + (parts.month - 1) + Math.trunc(count);
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return iso({ year, month, day: Math.min(parts.day, daysInMonth(year, month)) });
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((utc(second) - utc(first)) / DAY_MS);
}

/** Completed years between a date of birth and a reference date. */
export function completedYears(birthDate, onDate) {
  const born = parseISODate(birthDate);
  const on = parseISODate(onDate);
  if (!born || !on) return null;
  if (utc(on) < utc(born)) return null;
  let years = on.year - born.year;
  if (on.month < born.month || (on.month === born.month && on.day < born.day)) years -= 1;
  return years;
}

/**
 * Special Marriage Act notice timeline.
 * @param {{noticeDate: string}} input
 */
export function computeSmaTimeline({ noticeDate } = {}) {
  if (!parseISODate(noticeDate)) return { error: "Enter a valid date for the notice of intended marriage." };
  const residenceQualifyingSince = addDays(noticeDate, -SMA_RESIDENCE_DAYS);
  const objectionPeriodEnds = addDays(noticeDate, SMA_OBJECTION_DAYS);
  const earliestSolemnisation = addDays(noticeDate, SMA_OBJECTION_DAYS + 1);
  const lastDateToSolemnise = addMonths(noticeDate, SMA_SOLEMNISE_MONTHS);
  return {
    noticeDate,
    residenceQualifyingSince,
    objectionPeriodEnds,
    earliestSolemnisation,
    lastDateToSolemnise,
    windowDays: diffDays(earliestSolemnisation, lastDateToSolemnise),
  };
}

/**
 * Age eligibility for both parties on the marriage date.
 * @param {{groomBirthDate: string, brideBirthDate: string, marriageDate: string}} input
 */
export function checkAgeEligibility({ groomBirthDate, brideBirthDate, marriageDate } = {}) {
  if (!parseISODate(marriageDate)) return { error: "Enter a valid marriage date." };
  const groomAge = completedYears(groomBirthDate, marriageDate);
  const brideAge = completedYears(brideBirthDate, marriageDate);
  if (groomAge === null) return { error: "Enter a valid date of birth for the groom, before the marriage date." };
  if (brideAge === null) return { error: "Enter a valid date of birth for the bride, before the marriage date." };

  const groomEligibleFrom = addYearsToDate(groomBirthDate, MIN_AGE_GROOM);
  const brideEligibleFrom = addYearsToDate(brideBirthDate, MIN_AGE_BRIDE);

  return {
    groomAge,
    brideAge,
    groomEligible: groomAge >= MIN_AGE_GROOM,
    brideEligible: brideAge >= MIN_AGE_BRIDE,
    groomEligibleFrom,
    brideEligibleFrom,
    bothEligible: groomAge >= MIN_AGE_GROOM && brideAge >= MIN_AGE_BRIDE,
  };
}

function addYearsToDate(date, years) {
  const parts = parseISODate(date);
  if (!parts) return null;
  const year = parts.year + years;
  return iso({ year, month: parts.month, day: Math.min(parts.day, daysInMonth(year, parts.month)) });
}

/**
 * Build the grouped document checklist.
 *
 * @param {object} input
 * @param {string} input.act              Key from MARRIAGE_ACTS.
 * @param {string} input.groomNationality Key from NATIONALITIES.
 * @param {string} input.brideNationality Key from NATIONALITIES.
 * @param {string} input.groomHistory     Key from MARITAL_HISTORY.
 * @param {string} input.brideHistory     Key from MARITAL_HISTORY.
 * @param {boolean} [input.marriedAbroad] The ceremony took place outside India.
 * @param {boolean} [input.tatkal]        Applying under a state's same-day / tatkal scheme.
 */
export function buildChecklist({
  act = "hindu",
  groomNationality = "indian",
  brideNationality = "indian",
  groomHistory = "never",
  brideHistory = "never",
  marriedAbroad = false,
  tatkal = false,
} = {}) {
  const chosen = MARRIAGE_ACTS.find((item) => item.key === act);
  if (!chosen) return { error: "Choose the law the marriage is registered under." };

  const groomNat = NATIONALITIES.find((item) => item.key === groomNationality);
  const brideNat = NATIONALITIES.find((item) => item.key === brideNationality);
  if (!groomNat || !brideNat) return { error: "Choose the nationality of both parties." };

  const groomPast = MARITAL_HISTORY.find((item) => item.key === groomHistory);
  const bridePast = MARITAL_HISTORY.find((item) => item.key === brideHistory);
  if (!groomPast || !bridePast) return { error: "Choose the marital history of both parties." };

  const groups = [];

  groups.push({
    title: "Application and fees",
    items: [
      chosen.key === "special"
        ? "Notice of intended marriage in the prescribed form, signed by both parties"
        : "Application form for registration, signed by both parties",
      "Receipt for the registration fee paid at the office or online",
      "Acknowledgement or appointment slip from the online portal, if your state uses one",
    ],
  });

  groups.push({
    title: "Proof of age",
    items: [
      "Birth certificate, or matriculation / school leaving certificate showing date of birth, for the groom",
      "Birth certificate, or matriculation / school leaving certificate showing date of birth, for the bride",
      "Passport is accepted as age proof in most states where no birth certificate exists",
    ],
  });

  groups.push({
    title: "Proof of identity and address",
    items: [
      "Aadhaar, passport, voter ID or driving licence for each party",
      "Address proof for each party — the registrar's jurisdiction depends on it",
      chosen.key === "special"
        ? `Proof that at least one party has resided in the district for ${SMA_RESIDENCE_DAYS} days before the notice — ration card, electricity bill, rent agreement with police intimation, or a residence certificate`
        : "Address proof for the place where the marriage was solemnised, or of either party's residence",
      "PAN card for each party, where the state form asks for it",
    ],
  });

  groups.push({
    title: "Photographs",
    items: [
      "Two to four passport-size photographs of each party, as your state form specifies",
      "One joint photograph of the couple",
      chosen.alreadySolemnised ? "Photographs of the marriage ceremony" : null,
    ].filter(Boolean),
  });

  if (chosen.alreadySolemnised) {
    groups.push({
      title: "Proof that the marriage took place",
      items: [
        chosen.key === "hindu"
          ? "Certificate from the priest or the temple / gurudwara where the ceremony was performed"
          : null,
        chosen.key === "christian" ? "Church marriage certificate signed by the minister" : null,
        chosen.key === "parsi" ? "Certificate signed by the officiating priest and two Parsi witnesses" : null,
        chosen.key === "muslim" ? "Original nikahnama with the signatures of the qazi and the witnesses" : null,
        "Marriage invitation card, if one was printed",
        "Affidavit by both parties stating the date, place and manner of the marriage",
      ].filter(Boolean),
    });
  }

  groups.push({
    title: "Affidavits and declarations",
    items: [
      "Joint affidavit of date and place of birth, present marital status and nationality",
      "Declaration that the parties are not within the degrees of prohibited relationship",
      chosen.key === "special"
        ? "Declaration in the Third Schedule to the Special Marriage Act, signed before the Marriage Officer"
        : null,
      "Declaration that neither party has a spouse living at the time of the marriage",
    ].filter(Boolean),
  });

  const historyItems = [];
  if (groomHistory === "divorced" || brideHistory === "divorced") {
    historyItems.push(
      "Certified copy of the decree of divorce, with proof that no appeal is pending",
    );
  }
  if (groomHistory === "widowed" || brideHistory === "widowed") {
    historyItems.push("Death certificate of the deceased spouse");
  }
  if (historyItems.length) {
    groups.push({ title: "If either party was married before", items: historyItems });
  }

  const foreignItems = [];
  if (groomNationality !== "indian" || brideNationality !== "indian") {
    foreignItems.push(
      "Valid passport with a valid visa for the foreign national, with copies of every stamped page",
      "No impediment certificate or single status certificate from the embassy or high commission of the foreign national's country",
      "Proof of stay in India for the period the state requires before the notice",
      "OCI or PIO card, where applicable",
    );
  }
  if (marriedAbroad) {
    foreignItems.push(
      "Marriage certificate issued abroad, apostilled or attested by the Indian mission in that country",
      "Certified translation into English or the state language, if the certificate is in another language",
    );
  }
  if (foreignItems.length) {
    groups.push({ title: "Foreign national or marriage abroad", items: foreignItems });
  }

  groups.push({
    title: "Witnesses",
    items: [
      chosen.key === "hindu"
        ? `Typically ${chosen.witnesses} witnesses (some states ask for two) must attend in person on the day of ${chosen.alreadySolemnised ? "registration" : "solemnisation"}`
        : `${chosen.witnesses} witnesses must attend in person on the day of ${chosen.alreadySolemnised ? "registration" : "solemnisation"}`,
      "Identity proof and address proof for each witness",
      "One passport-size photograph of each witness, where the state form asks for it",
      "Witnesses should be adults who attended the marriage or know both parties",
    ],
  });

  if (tatkal) {
    groups.push({
      title: "Same-day / tatkal scheme",
      items: [
        "Confirm your state actually runs a tatkal scheme — several do not",
        "Higher prescribed fee, payable at the time of the appointment",
        "Every document must be complete on the day; nothing can be filed later",
      ],
    });
  }

  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  return {
    act: chosen,
    groups,
    totalItems,
    witnesses: chosen.witnesses,
    requiresNotice: chosen.key === "special",
    warnings: [
      chosen.key === "special"
        ? `Under section 14, if the marriage is not solemnised within ${SMA_SOLEMNISE_MONTHS} calendar months of the notice, a fresh notice must be given.`
        : null,
      groomNationality !== "indian" || brideNationality !== "indian"
        ? "State rules for a foreign party vary widely — confirm the required period of stay in India with the Marriage Officer before booking an appointment."
        : null,
      "Carry originals and one self-attested photocopy of everything; the registrar returns the originals after verification.",
    ].filter(Boolean),
  };
}
