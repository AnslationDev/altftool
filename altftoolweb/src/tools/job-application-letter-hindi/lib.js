/**
 * Hindi job application letter (नौकरी हेतु आवेदन पत्र) builder.
 *
 * Format: the standard औपचारिक पत्र (formal letter) layout taught for Hindi
 * board examinations and used in Indian government and private applications —
 * सेवा में / addressee and address / दिनांक / विषय / महोदय / body opening with
 * "सविनय निवेदन है कि" / the request paragraph opening with "अतः" / सधन्यवाद /
 * भवदीय or भवदीया / name, address and contact / संलग्न list of enclosures.
 *
 * Age relaxation figures are the standard upper-age relaxations applied to
 * direct recruitment to central government posts, as set out in the Department
 * of Personnel and Training's instructions:
 *   - Other Backward Classes (non-creamy layer): 3 years
 *   - Scheduled Castes and Scheduled Tribes: 5 years
 *   - Persons with benchmark disabilities: 10 years, which is cumulative with
 *     the OBC or SC/ST relaxation, giving 13 and 15 years respectively
 *   - Ex-servicemen: the length of military service rendered, plus 3 years
 * Relaxation applies only where the recruitment rules and the advertisement
 * provide for it, and several state and private recruitments use different
 * figures. Always confirm against the advertisement. Informational only.
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

/** Completed years, months and days between two dates. */
export function ageBreakdown(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to || to.getTime() < from.getTime()) return null;

  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();

  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days, totalDays: Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) };
}

/* -------------------------------------------------------- Hindi numerals */

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** Convert every ASCII digit in a string or number to a Devanagari digit. */
export function toDevanagariDigits(value) {
  return String(value ?? "").replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}

export const HINDI_MONTHS = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितम्बर",
  "अक्टूबर",
  "नवम्बर",
  "दिसम्बर",
];

/** Render an ISO date as "२८ जुलाई २०२६". */
export function formatHindiDate(isoDate, useDevanagariDigits = true) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  const day = date.getUTCDate();
  const month = HINDI_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const text = `${day} ${month} ${year}`;
  return useDevanagariDigits ? toDevanagariDigits(text) : text;
}

/** Render years and months as "३ वर्ष ५ माह". */
export function formatHindiDuration(years, months, useDevanagariDigits = true) {
  const y = Math.max(0, Math.round(Number(years) || 0));
  const m = Math.max(0, Math.round(Number(months) || 0));
  const parts = [];
  if (y > 0) parts.push(`${y} वर्ष`);
  if (m > 0 || y === 0) parts.push(`${m} माह`);
  const text = parts.join(" ");
  return useDevanagariDigits ? toDevanagariDigits(text) : text;
}

/* ------------------------------------------------------------- categories */

/** DoPT upper-age relaxation for direct recruitment, in years. */
export const CATEGORIES = [
  { id: "ur", label: "अनारक्षित / सामान्य (UR)", english: "Unreserved", relaxationYears: 0 },
  { id: "ews", label: "आर्थिक रूप से कमजोर वर्ग (EWS)", english: "EWS", relaxationYears: 0 },
  { id: "obc", label: "अन्य पिछड़ा वर्ग (OBC, non-creamy layer)", english: "OBC", relaxationYears: 3 },
  { id: "sc", label: "अनुसूचित जाति (SC)", english: "SC", relaxationYears: 5 },
  { id: "st", label: "अनुसूचित जनजाति (ST)", english: "ST", relaxationYears: 5 },
  { id: "pwd-ur", label: "दिव्यांगजन — सामान्य (PwBD, UR)", english: "PwBD (UR)", relaxationYears: 10 },
  { id: "pwd-obc", label: "दिव्यांगजन — OBC (PwBD, OBC)", english: "PwBD (OBC)", relaxationYears: 13 },
  { id: "pwd-sc-st", label: "दिव्यांगजन — SC/ST (PwBD, SC/ST)", english: "PwBD (SC/ST)", relaxationYears: 15 },
  { id: "ex-serviceman", label: "भूतपूर्व सैनिक (Ex-serviceman)", english: "Ex-serviceman", relaxationYears: null, usesServiceYears: true },
];

export function categoryById(id) {
  return CATEGORIES.find((item) => item.id === id) || CATEGORIES[0];
}

/** Ex-servicemen: military service rendered plus three years. */
export const EX_SERVICEMAN_EXTRA_YEARS = 3;

export const MIN_AGE_FLOOR = 14;
export const MAX_AGE_CEILING = 70;
export const MAX_SERVICE_YEARS = 40;

/* --------------------------------------------------------------- posts */

export const POST_TYPES = [
  {
    id: "government",
    label: "सरकारी विभाग / कार्यालय",
    addressee: "श्रीमान् कार्यालय अध्यक्ष महोदय",
    closing:
      "मैं आपको विश्वास {assure} कि चयन होने पर मैं अपने कर्तव्यों का निर्वहन पूर्ण निष्ठा, अनुशासन एवं परिश्रम के साथ {do}।",
  },
  {
    id: "private",
    label: "निजी कंपनी",
    addressee: "श्रीमान् मानव संसाधन प्रबंधक महोदय",
    closing:
      "मुझे विश्वास है कि मेरी योग्यता एवं अनुभव आपकी संस्था के लिए उपयोगी सिद्ध होंगे, और जो भी कार्य सौंपा जाएगा उसे मैं पूरी लगन से पूरा {do}।",
  },
  {
    id: "school",
    label: "विद्यालय / महाविद्यालय",
    addressee: "श्रीमान् प्रधानाचार्य महोदय",
    closing:
      "मैं विश्वास {assure} कि विद्यार्थियों के सर्वांगीण विकास हेतु मैं पूर्ण समर्पण के साथ कार्य {do}।",
  },
  {
    id: "bank",
    label: "बैंक",
    addressee: "श्रीमान् शाखा प्रबंधक महोदय",
    closing:
      "मैं आपको विश्वास {assure} कि बैंक द्वारा सौंपे गए दायित्वों का निर्वहन मैं पूर्ण ईमानदारी एवं सतर्कता से {do}।",
  },
  {
    id: "hospital",
    label: "अस्पताल / स्वास्थ्य संस्थान",
    addressee: "श्रीमान् चिकित्सा अधीक्षक महोदय",
    closing:
      "मैं विश्वास {assure} कि रोगियों की सेवा में मैं पूर्ण संवेदनशीलता एवं निष्ठा के साथ कार्य {do}।",
  },
];

export function postTypeById(id) {
  return POST_TYPES.find((item) => item.id === id) || POST_TYPES[0];
}

/* ------------------------------------------------------------- gender */

export const GENDERS = {
  male: {
    id: "male",
    label: "पुरुष",
    wants: "चाहता हूँ",
    resident: "निवासी",
    signOff: "भवदीय",
    assure: "दिलाता हूँ",
    do: "करूँगा",
    child: "पुत्र",
    doing: "कर रहा हूँ",
    applicant: "आवेदक",
  },
  female: {
    id: "female",
    label: "महिला",
    wants: "चाहती हूँ",
    resident: "निवासिनी",
    signOff: "भवदीया",
    assure: "दिलाती हूँ",
    do: "करूँगी",
    child: "पुत्री",
    doing: "कर रही हूँ",
    applicant: "आवेदिका",
  },
  other: {
    id: "other",
    label: "अन्य / नहीं बताना चाहते",
    wants: "चाहता/चाहती हूँ",
    resident: "निवासी",
    signOff: "भवदीय/भवदीया",
    assure: "दिलाता/दिलाती हूँ",
    do: "करूँगा/करूँगी",
    child: "पुत्र/पुत्री",
    doing: "कर रहा/रही हूँ",
    applicant: "आवेदक/आवेदिका",
  },
};

export function genderById(id) {
  return GENDERS[id] || GENDERS.other;
}

/* --------------------------------------------------------------- eligibility */

/**
 * Work out the applicant's age on the cut-off date, the upper age limit after
 * relaxation, and whether they are within it.
 * Pure: every date and figure is an argument.
 */
export function assessEligibility({
  dobISO,
  cutoffDateISO,
  minAge,
  maxAge,
  categoryId,
  serviceYears,
  lastDateISO,
  letterDateISO,
}) {
  if (!parseISODate(dobISO)) return { error: "जन्म तिथि सही प्रारूप में भरें / Enter a valid date of birth." };
  if (!parseISODate(cutoffDateISO)) return { error: "आयु गणना की तिथि सही भरें / Enter a valid age reckoning date." };

  const age = ageBreakdown(dobISO, cutoffDateISO);
  if (!age) return { error: "जन्म तिथि आयु गणना की तिथि के बाद की है / The date of birth is after the age reckoning date." };
  if (age.years > 120) return { error: "जन्म तिथि जाँच लें / Check the date of birth — that age is not realistic." };

  const min = Number(minAge);
  const max = Number(maxAge);
  if (!Number.isFinite(min) || min < MIN_AGE_FLOOR || min > MAX_AGE_CEILING) {
    return { error: `न्यूनतम आयु ${MIN_AGE_FLOOR} से ${MAX_AGE_CEILING} वर्ष के बीच होनी चाहिए / Minimum age must be between ${MIN_AGE_FLOOR} and ${MAX_AGE_CEILING}.` };
  }
  if (!Number.isFinite(max) || max < MIN_AGE_FLOOR || max > MAX_AGE_CEILING) {
    return { error: `अधिकतम आयु ${MIN_AGE_FLOOR} से ${MAX_AGE_CEILING} वर्ष के बीच होनी चाहिए / Maximum age must be between ${MIN_AGE_FLOOR} and ${MAX_AGE_CEILING}.` };
  }
  if (max < min) {
    return { error: "अधिकतम आयु न्यूनतम आयु से कम नहीं हो सकती / The upper age limit cannot be below the lower one." };
  }

  const category = categoryById(categoryId);
  let relaxationYears;
  if (category.usesServiceYears) {
    const service = Number(serviceYears);
    if (!Number.isFinite(service) || service < 0 || service > MAX_SERVICE_YEARS) {
      return { error: `सैन्य सेवा के वर्ष 0 से ${MAX_SERVICE_YEARS} के बीच भरें / Military service must be between 0 and ${MAX_SERVICE_YEARS} years.` };
    }
    relaxationYears = service + EX_SERVICEMAN_EXTRA_YEARS;
  } else {
    relaxationYears = category.relaxationYears;
  }

  const effectiveMaxAge = max + relaxationYears;
  const overageOnISO = addYearsISO(dobISO, effectiveMaxAge);
  const eligibleFromISO = addYearsISO(dobISO, min);

  const daysToOverage = daysBetweenISO(cutoffDateISO, overageOnISO);
  const meetsMinimum = daysBetweenISO(eligibleFromISO, cutoffDateISO) >= 0;
  const withinUpperLimit = daysToOverage >= 0;

  let daysLeftToApply = null;
  if (parseISODate(lastDateISO) && parseISODate(letterDateISO)) {
    daysLeftToApply = daysBetweenISO(letterDateISO, lastDateISO);
  }

  return {
    age,
    category,
    relaxationYears,
    effectiveMaxAge,
    minAge: min,
    maxAge: max,
    overageOnISO,
    eligibleFromISO,
    daysToOverage,
    meetsMinimum,
    withinUpperLimit,
    eligible: meetsMinimum && withinUpperLimit,
    daysLeftToApply,
    applicationClosed: daysLeftToApply !== null && daysLeftToApply < 0,
  };
}

/** Years and months of work experience between two dates. */
export function computeExperience({ startISO, endISO }) {
  if (!parseISODate(startISO) || !parseISODate(endISO)) return null;
  const span = ageBreakdown(startISO, endISO);
  if (!span) return { error: "अनुभव की प्रारंभ तिथि अंतिम तिथि के बाद है / The experience start date is after the end date." };
  return span;
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

const listToLines = (text) =>
  clean(text)
    .split("\n")
    .map((line) => clean(line))
    .filter(Boolean);

export function buildHindiJobApplication({
  applicantName,
  fatherName,
  applicantAddress,
  phone,
  email,
  genderId,
  postTypeId,
  addressee,
  organisationName,
  organisationAddress,
  postName,
  advertisementNumber,
  advertisementSource,
  vacancyCount,
  cutoffDateISO,
  letterDateISO,
  qualifications,
  experienceText,
  experience,
  enclosures,
  extraNote,
  useDevanagariDigits = true,
  eligibility,
}) {
  if (!eligibility || eligibility.error) {
    return { error: eligibility?.error || "पहले तिथियाँ ठीक करें / Fix the dates first." };
  }

  const gender = genderById(genderId);
  const post = postTypeById(postTypeId);
  const name = or(applicantName, "[आपका नाम]");
  const org = or(organisationName, "[संस्था का नाम]");
  const to = or(addressee, post.addressee);
  const postTitle = or(postName, "[पद का नाम]");
  const source = or(advertisementSource, "समाचार पत्र");
  const num = (value) => (useDevanagariDigits ? toDevanagariDigits(value) : String(value));
  const dateText = (iso) => formatHindiDate(iso, useDevanagariDigits);

  const vacancies = Number(vacancyCount);
  const vacancyPhrase =
    Number.isFinite(vacancies) && vacancies > 0
      ? `${num(Math.round(vacancies))} पद`
      : "कुछ पद";

  const qualificationLines = listToLines(qualifications);
  const enclosureLines = listToLines(enclosures);

  const ageLine = `दिनांक ${dateText(cutoffDateISO || letterDateISO)} तक मेरी आयु ${formatHindiDuration(eligibility.age.years, eligibility.age.months, useDevanagariDigits)} है। विज्ञापित अधिकतम आयु-सीमा ${num(eligibility.maxAge)} वर्ष है${
    eligibility.relaxationYears > 0
      ? `, तथा ${eligibility.category.label} श्रेणी हेतु ${num(eligibility.relaxationYears)} वर्ष की छूट सहित यह ${num(eligibility.effectiveMaxAge)} वर्ष हो जाती है`
      : ""
  }, अतः मैं ${eligibility.eligible ? "निर्धारित आयु-सीमा के भीतर हूँ" : `आयु-सीमा के संबंध में विभाग का मार्गदर्शन ${gender.wants}`}।`;

  const experienceLine = experience && !experience.error && (experience.years > 0 || experience.months > 0)
    ? `मुझे इस क्षेत्र में ${formatHindiDuration(experience.years, experience.months, useDevanagariDigits)} का कार्यानुभव है।${clean(experienceText) ? ` ${clean(experienceText)}` : ""}`
    : clean(experienceText);

  const lastDateLine =
    eligibility.daysLeftToApply !== null
      ? eligibility.applicationClosed
        ? `आवेदन की अंतिम तिथि निकल चुकी है; कृपया मार्गदर्शन करें कि क्या विलंब से आवेदन स्वीकार किया जा सकता है।`
        : `आवेदन की अंतिम तिथि से ${num(eligibility.daysLeftToApply)} दिन पूर्व यह आवेदन प्रस्तुत ${gender.doing}।`
      : "";

  const subject = `${postTitle} पद हेतु आवेदन${clean(advertisementNumber) ? ` (विज्ञापन संख्या ${clean(advertisementNumber)})` : ""}`;

  const body = [
    "सेवा में,",
    `${to},`,
    org,
    clean(organisationAddress),
    "",
    `दिनांक: ${dateText(letterDateISO)}`,
    "",
    `विषय: ${subject}।`,
    "",
    "महोदय/महोदया,",
    "",
    `सविनय निवेदन है कि मैं ${name}${clean(fatherName) ? `, ${gender.child} श्री ${clean(fatherName)}` : ""}, ${or(applicantAddress, "[आपका पता]")} का ${gender.resident} हूँ। मुझे ${source} के माध्यम से ज्ञात हुआ कि आपकी संस्था में ${postTitle} के ${vacancyPhrase} रिक्त हैं। मैं इस पद हेतु आवेदन करना ${gender.wants}।`,
    "",
    "मेरी शैक्षणिक योग्यता एवं विवरण इस प्रकार है:",
    ...(qualificationLines.length > 0
      ? qualificationLines.map((line, index) => `${num(index + 1)}. ${line}`)
      : ["१. [अपनी शैक्षणिक योग्यता यहाँ लिखें]"]),
    "",
    experienceLine,
    "",
    ageLine,
    lastDateLine,
    "",
    clean(extraNote),
    "",
    `अतः आपसे विनम्र निवेदन है कि उपर्युक्त पद हेतु मेरे आवेदन पर विचार करते हुए मुझे साक्षात्कार का अवसर प्रदान करने की कृपा करें। ${post.closing.replace("{do}", gender.do).replace("{assure}", gender.assure)}`,
    "",
    "सधन्यवाद।",
    "",
    `${gender.signOff},`,
    name,
    or(applicantAddress, "[आपका पता]"),
    clean(phone) ? `मोबाइल: ${clean(phone)}` : "मोबाइल: [मोबाइल नंबर]",
    clean(email) ? `ई-मेल: ${clean(email)}` : "ई-मेल: [ई-मेल पता]",
    "",
    "संलग्न:",
    ...(enclosureLines.length > 0
      ? enclosureLines.map((line, index) => `${num(index + 1)}. ${line}`)
      : ["१. शैक्षणिक प्रमाण-पत्रों की स्वप्रमाणित प्रतियाँ", "२. अनुभव प्रमाण-पत्र", "३. जाति एवं निवास प्रमाण-पत्र (यदि लागू हो)", "४. नवीनतम पासपोर्ट आकार का फोटो"]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    subject,
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    characterCount: body.length,
    post,
    gender,
  };
}
