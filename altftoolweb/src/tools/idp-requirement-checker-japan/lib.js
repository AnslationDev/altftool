/**
 * IDP requirement checker for Japan.
 *
 * Japan is the country where the permit format matters most, because it
 * recognises only one of them.
 *
 *  - Article 107-2 of the Road Traffic Act allows a visitor to drive on an
 *    International Driving Permit issued under the 1949 Geneva Convention on
 *    Road Traffic. Permits issued under the 1968 Vienna Convention, or the
 *    older 1926 Paris Convention, are NOT valid in Japan.
 *  - A short list of countries that are not 1949 Geneva parties is handled
 *    separately: a licence from Switzerland, Germany, France, Belgium, Monaco,
 *    Taiwan, Slovenia or Estonia may be used with an official Japanese
 *    translation prepared by the Japan Automobile Federation (JAF) or by that
 *    country's embassy or consulate in Japan. No permit is involved.
 *  - The permit or translation is valid for one year from the date of issue, or
 *    one year from the date you entered Japan, whichever ends first.
 *  - The re-entry loophole was closed: a person who has lived in Japan for
 *    three months or more, then leaves and returns within three months, does
 *    not get a fresh entry date. A short trip abroad no longer restarts the
 *    year.
 *  - Converting a foreign licence is the gaimen kirikae procedure. It requires
 *    proof that you stayed in the issuing country for at least three months
 *    after the licence was issued. Holders from a list of about thirty
 *    countries are exempt from the knowledge and practical tests; the United
 *    States, China, Brazil, Russia, India and Vietnam are not on that list.
 *  - Japan drives on the left. The ordinary car licence starts at 18. The
 *    breath-alcohol threshold is 0.15 mg per litre, among the strictest in the
 *    world, and supplying alcohol to a driver or riding with one is also an
 *    offence.
 *
 * Informational only, not legal advice. The recognised lists change - confirm
 * with JAF, the prefectural police or your embassy before you drive.
 */

export const COUNTRY_NAME = "Japan";
export const DRIVES_ON = "left";

/** Road Traffic Act Art. 107-2 recognises this convention and no other. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949"];

/** Permit or translation validity, and the entry-date window, both one year. */
export const VALIDITY_MONTHS = 12;

/** Absence shorter than this does not reset the entry date for a resident. */
export const REENTRY_RESET_MONTHS = 3;

/** Residence needed in the issuing country after the licence was issued, for gaimen kirikae. */
export const CONVERSION_RESIDENCE_MONTHS = 3;

/** Japanese ordinary car licence minimum age. */
export const MINIMUM_CAR_AGE = 18;
/** Japanese rental desks generally serve any licence holder; no age surcharge is usual. */
export const RENTAL_MIN_AGE = 18;

/** Road Traffic Act breath-alcohol threshold, milligrams per litre. */
export const BREATH_LIMIT_MG_PER_L = 0.15;

/** Countries whose licences Japan accepts with an official Japanese translation. */
export const TRANSLATION_LIST_COUNTRIES = [
  "Switzerland",
  "Germany",
  "France",
  "Belgium",
  "Monaco",
  "Taiwan",
  "Slovenia",
  "Estonia",
];

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * How Japan treats each family of issuing country.
 *  "domestic"    - a Japanese licence
 *  "geneva"      - 1949 Geneva party, so its IDP is recognised
 *  "translation" - on the special list, needs a JAF or embassy translation
 *  "vienna-only" - 1968 Vienna party not on the list, so no valid permit exists
 *  "none"        - neither convention and not on the list
 *
 * `conversionExempt` records whether the gaimen kirikae exemption from the
 * knowledge and practical tests applies.
 */
export const LICENCE_ORIGINS = [
  {
    id: "japan",
    label: "Japan",
    rule: "domestic",
    conversionExempt: true,
    note: "A Japanese licence needs nothing else. The IDP JAF issues to Japanese licence holders is for driving abroad.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    rule: "geneva",
    conversionExempt: true,
    note: "Both are 1949 Geneva parties, so the permit issued at home is the format Japan recognises. Both also drive on the left, so the roads feel familiar.",
  },
  {
    id: "usa",
    label: "United States",
    rule: "geneva",
    conversionExempt: false,
    note: "The United States is a 1949 Geneva party, so a AAA or AATA permit is valid in Japan. It is not on Japan's conversion exemption list, however, so a resident must sit the Japanese knowledge and practical tests.",
  },
  {
    id: "canada",
    label: "Canada",
    rule: "geneva",
    conversionExempt: true,
    note: "Canada is a 1949 Geneva party and appears on Japan's conversion exemption list, so a resident converts without the practical test.",
  },
  {
    id: "australia-nz",
    label: "Australia or New Zealand",
    rule: "geneva",
    conversionExempt: true,
    note: "Both are 1949 Geneva parties, both are on the conversion exemption list, and both already drive on the left.",
  },
  {
    id: "korea",
    label: "South Korea",
    rule: "geneva",
    conversionExempt: true,
    note: "Korea is a 1949 Geneva party and on the exemption list, so both the permit and a later conversion are straightforward.",
  },
  {
    id: "india-sea",
    label: "India, Thailand, Singapore, Malaysia or the Philippines",
    rule: "geneva",
    conversionExempt: false,
    note: "All are 1949 Geneva parties, so the permit works for visiting. None is on Japan's conversion exemption list, so a resident sits the full tests.",
  },
  {
    id: "italy-spain",
    label: "Italy, Spain, the Netherlands or another 1949 Geneva EU state",
    rule: "geneva",
    conversionExempt: true,
    note: "These states are 1949 Geneva parties as well as Vienna ones, so make sure the booklet you are handed cites 1949 - some authorities issue the 1968 format by default.",
  },
  {
    id: "translation-list",
    label: "Switzerland, Germany, France, Belgium, Monaco, Taiwan, Slovenia or Estonia",
    rule: "translation",
    conversionExempt: true,
    note: "These countries are handled outside the permit system entirely. Japan accepts the licence with an official Japanese translation from JAF or from that country's embassy or consulate in Japan.",
  },
  {
    id: "vienna-only",
    label: "A state that joined only the 1968 Vienna Convention (Russia, Ukraine, Kazakhstan, Vietnam and others)",
    rule: "vienna-only",
    conversionExempt: false,
    note: "Japan never joined the 1968 Vienna Convention, so a permit issued under it has no standing here regardless of how official the booklet looks.",
  },
  {
    id: "china",
    label: "China",
    rule: "none",
    conversionExempt: false,
    note: "China belongs to neither road-traffic convention and is not on Japan's translation list, so no Chinese permit or translation lets you drive. Conversion through gaimen kirikae is the only route.",
  },
  {
    id: "no-convention",
    label: "Another state in neither convention and not on Japan's translation list",
    rule: "none",
    conversionExempt: false,
    note: "No document issued at home will make this licence usable in Japan. Converting to a Japanese licence is the only lawful route.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No permit or translation" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "paris-1926", label: "1926 Paris Convention IDP" },
  { id: "jaf-translation", label: "Official Japanese translation from JAF or an embassy" },
  { id: "japanese-licence", label: "A Japanese driving licence" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Visiting - holiday or business trip" },
  { id: "residence", label: "Living in Japan on a residence status" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  "not-valid": { label: "Your permit is not valid in Japan", tone: "danger" },
  required: { label: "1949 Geneva IDP required", tone: "danger" },
  "translation-required": { label: "Japanese translation required", tone: "danger" },
  satisfied: { label: "Recognised - you are covered", tone: "success" },
  "not-required": { label: "No permit needed", tone: "success" },
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD string to a UTC timestamp, or null if it is not a real date. */
export function parseISODate(value) {
  const match = DATE_PATTERN.exec(String(value ?? "").trim());
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

export function toISODate(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Calendar-correct month arithmetic, clamped to the end of a short month. */
export function addMonthsISO(iso, months) {
  const stamp = parseISODate(iso);
  if (stamp === null) return null;
  const start = new Date(stamp);
  const target = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 1));
  const lastDayOfTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(start.getUTCDate(), lastDayOfTarget));
  return toISODate(target.getTime());
}

export function daysBetweenISO(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/** The earlier of two ISO dates; either may be null. */
export function earlierISO(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  return parseISODate(a) <= parseISODate(b) ? a : b;
}

/**
 * Decide whether the permit you hold is recognised in Japan, and date the
 * window it gives you.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin    id from LICENCE_ORIGINS
 * @param {string} input.idpHeld          id from IDP_HELD_OPTIONS
 * @param {string} input.entryDate        YYYY-MM-DD, date you entered Japan
 * @param {string} [input.idpIssueDate]   YYYY-MM-DD, date the permit was issued
 * @param {string} [input.departureDate]  YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears         driver's age in whole years
 * @param {string} input.stayPurpose      id from STAY_PURPOSES
 * @returns {object} verdict object, or { error }
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  entryDate,
  idpIssueDate,
  departureDate,
  ageYears,
  stayPurpose,
} = {}) {
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit or translation you already hold." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether you are visiting or living in Japan." };

  const entry = parseISODate(entryDate);
  if (entry === null) return { error: "Enter a valid entry date as year, month and day." };

  let issueStamp = null;
  if (idpIssueDate) {
    issueStamp = parseISODate(idpIssueDate);
    if (issueStamp === null) {
      return { error: "Enter a valid permit issue date, or leave it empty." };
    }
  }

  let stayDays = null;
  if (departureDate) {
    const departure = parseISODate(departureDate);
    if (departure === null) return { error: "Enter a valid departure date, or leave it empty." };
    stayDays = Math.round((departure - entry) / MS_PER_DAY);
    if (stayDays < 0) return { error: "The departure date cannot fall before the entry date." };
    if (stayDays > MAX_STAY_DAYS) {
      return { error: "Enter a stay of ten years or less - beyond that you are simply resident." };
    }
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter your age in whole years." };
  if (age < 14 || age > 110) return { error: "Enter an age between 14 and 110 years." };

  const hasGeneva = idpHeld === "geneva-1949";
  const hasJapaneseTranslation = idpHeld === "jaf-translation";
  const hasJapaneseLicence = idpHeld === "japanese-licence";

  let verdict;
  let reason;

  if (age < MINIMUM_CAR_AGE) {
    verdict = "not-permitted";
    reason = `The ordinary car licence starts at ${MINIMUM_CAR_AGE} in Japan, and a foreign licence issued earlier does not lower that. At ${age} you cannot drive a car in ${COUNTRY_NAME}.`;
  } else if (origin.rule === "domestic" || hasJapaneseLicence) {
    verdict = "not-required";
    reason =
      "A Japanese licence is all you need. The International Driving Permit JAF issues against a Japanese licence is for driving abroad, not here.";
  } else if (origin.rule === "translation") {
    verdict = hasJapaneseTranslation ? "satisfied" : "translation-required";
    reason = hasJapaneseTranslation
      ? "Your country is handled outside the permit system: Japan accepts the licence itself with an official Japanese translation, which is what you hold. Carry both, and note the translation is valid for one year."
      : `Japan does not use the permit system for licences from ${TRANSLATION_LIST_COUNTRIES.join(", ")}. Instead it accepts the licence with an official Japanese translation prepared by JAF or by your country's embassy or consulate in Japan. An International Driving Permit will not substitute.`;
  } else if (origin.rule === "vienna-only") {
    verdict = "not-valid";
    reason =
      "Article 107-2 of the Road Traffic Act recognises only permits issued under the 1949 Geneva Convention, and your country joined only the 1968 Vienna Convention. No permit it issues will work in Japan. The lawful routes are a Japanese licence through gaimen kirikae, or not driving.";
  } else if (origin.rule === "none") {
    verdict = "not-valid";
    reason =
      "Your country belongs to neither road-traffic convention and is not on Japan's translation list, so no permit or translation issued at home will let you drive here. Converting to a Japanese licence through gaimen kirikae is the only route.";
  } else if (hasGeneva) {
    verdict = "satisfied";
    reason =
      "You hold the 1949 Geneva permit, which is the only format Article 107-2 recognises. Carry it with the original licence and your passport - the permit is not a licence on its own, and Japanese police check all three.";
  } else if (idpHeld === "vienna-1968" || idpHeld === "paris-1926") {
    verdict = "not-valid";
    reason =
      "Japan recognises only the 1949 Geneva format. A 1968 Vienna or 1926 Paris permit is refused at the hire desk and does not make you a licensed driver at a police stop. Your country does issue the Geneva format - ask for it specifically before you travel.";
  } else {
    verdict = "required";
    reason =
      "Your country is a 1949 Geneva party, so the permit it issues is recognised in Japan - but you have to obtain it at home before you travel. No Japanese body can issue one against a foreign licence, and rental companies will not release a car without it.";
  }

  const covered = verdict === "satisfied" || verdict === "not-required";

  const entryWindowEnd = addMonthsISO(entryDate, VALIDITY_MONTHS);
  const permitWindowEnd = idpIssueDate ? addMonthsISO(idpIssueDate, VALIDITY_MONTHS) : null;
  const windowEndDate = covered && origin.rule !== "domestic" && !hasJapaneseLicence
    ? earlierISO(entryWindowEnd, permitWindowEnd)
    : null;
  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(entryDate, windowEndDate);

  let windowLabel;
  if (origin.rule === "domestic" || hasJapaneseLicence) {
    windowLabel = "No limit - you hold a Japanese licence";
  } else if (!covered) {
    windowLabel = "Not applicable - you are not covered to drive";
  } else if (permitWindowEnd && permitWindowEnd === windowEndDate && permitWindowEnd !== entryWindowEnd) {
    windowLabel = `${VALIDITY_MONTHS} months from the permit issue date, which expires first`;
  } else {
    windowLabel = `${VALIDITY_MONTHS} months from your entry into Japan`;
  }

  const warnings = [];

  if (covered && origin.rule !== "domestic" && !hasJapaneseLicence) {
    warnings.push(
      `Two clocks run at once: one year from the date the permit or translation was issued, and one year from the date you entered Japan. Whichever ends first is your real expiry${windowEndDate ? `, which here is ${windowEndDate}` : ""}.`,
    );
  }
  if (purpose.id === "residence") {
    warnings.push(
      `Leaving Japan briefly no longer restarts the year. If you have been in Japan for ${REENTRY_RESET_MONTHS} months or more and go abroad for less than ${REENTRY_RESET_MONTHS} months, the return is not treated as a new entry - the visa run that used to reset the clock was closed off.`,
    );
    if (origin.conversionExempt) {
      warnings.push(
        "Your country is on Japan's conversion exemption list, so gaimen kirikae means paperwork, an eyesight check and a short aptitude interview rather than the knowledge and practical tests.",
      );
    } else {
      warnings.push(
        "Your country is not on Japan's conversion exemption list, so gaimen kirikae includes the knowledge test and the practical driving test at a licence centre. The practical test is notoriously exacting and many applicants need more than one attempt.",
      );
    }
    warnings.push(
      `Gaimen kirikae also requires proof that you stayed in the issuing country for at least ${CONVERSION_RESIDENCE_MONTHS} months after the licence was issued. Bring passport stamps or a residence record that shows it.`,
    );
  }
  if (stayDays !== null && stayDays > 365 && covered) {
    warnings.push(
      `A ${stayDays}-day stay runs past the one-year window, so plan the conversion to a Japanese licence during the trip rather than at the end of it.`,
    );
  }
  if (verdict === "not-valid" || verdict === "required" || verdict === "translation-required") {
    warnings.push(
      "Driving without a document Japan recognises is unlicensed driving, not a paperwork slip. It voids the rental insurance, which is the part that matters if anyone is hurt.",
    );
  }
  warnings.push(
    `Japan drives on the left. The breath-alcohol threshold is ${BREATH_LIMIT_MG_PER_L} mg per litre, among the strictest anywhere, and the law also punishes anyone who supplies the alcohol, lends the car or rides as a passenger knowing the driver has been drinking.`,
  );
  warnings.push(
    "Expressways are tolled and mostly cashless in practice. Ask the rental company for an ETC card, and expect motorway tolls to add up quickly on a long drive.",
  );

  const checklist = [
    "Your original national driving licence - no permit or translation is valid on its own",
    "Passport, showing the entry stamp that dates your one-year window",
    "The rental agreement and insurance documents",
    "The vehicle inspection certificate (shakensho), which lives in the car",
  ];
  if (verdict === "satisfied" && hasGeneva) {
    checklist.unshift("Your 1949 Geneva International Driving Permit, issued at home before travel");
  }
  if (verdict === "satisfied" && hasJapaneseTranslation) {
    checklist.unshift("Your official Japanese translation from JAF or your embassy");
  }
  if (verdict === "required") {
    checklist.unshift("A 1949 Geneva International Driving Permit, obtained at home before travel");
  }
  if (verdict === "translation-required") {
    checklist.unshift("An official Japanese translation from JAF or your embassy in Japan");
  }

  return {
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    tone: VERDICTS[verdict].tone,
    reason,
    country: COUNTRY_NAME,
    drivesOn: DRIVES_ON,
    originLabel: origin.label,
    originNote: origin.note,
    conversionExempt: origin.conversionExempt,
    idpLabel: idp.label,
    acceptedFormats: "1949 Geneva only",
    minimumAge: MINIMUM_CAR_AGE,
    ageOk: age >= MINIMUM_CAR_AGE,
    breathLimit: BREATH_LIMIT_MG_PER_L,
    covered,
    stayDays,
    windowLabel,
    windowEndDate,
    entryWindowEnd,
    permitWindowEnd,
    daysRemaining,
    warnings,
    checklist,
    legalBasis:
      "Road Traffic Act (Japan) Article 107-2; 1949 Geneva Convention on Road Traffic",
  };
}
