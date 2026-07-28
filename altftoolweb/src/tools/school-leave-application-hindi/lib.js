/**
 * Hindi School Leave Application (प्रार्थना पत्र) — format rules and composition.
 *
 * Layout follows the aupcharik patra (formal letter) format taught in Hindi
 * school syllabuses: सेवा में block, विषय line, संबोधन, body opening with
 * "सविनय निवेदन है कि", the request, धन्यवाद, and a signature block with
 * नाम / कक्षा / अनुक्रमांक / दिनांक.
 *
 * Hindi verbs and nouns agree with the writer's gender, so the letter changes
 * form throughout: छात्र / छात्रा, रहूँगा / रहूँगी, आज्ञाकारी शिष्य / शिष्या.
 * Getting this wrong is the single most common mistake in a handwritten
 * prarthna patra, so the agreement is driven from one setting.
 *
 * Pure module: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Longest leave span this generator will word. */
export const MAX_LEAVE_DAYS = 60;

/** Hindi month names in the order used with Gregorian dates. */
export const HINDI_MONTHS = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर",
];

/** Devanagari digits 0-9, used when the letter is written fully in Devanagari. */
export const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** Hindi cardinal numbers 1-30, enough for any school leave request. */
const HINDI_NUMBER_WORDS = [
  "", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
  "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
  "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
];

/** Gender agreement forms used across the letter. */
export const GENDERS = [
  {
    id: "male",
    label: "छात्र (male)",
    student: "छात्र",
    genitive: "का",
    futureVerb: "रहूँगा",
    politePossessive: "आपका",
    signOff: "आपका आज्ञाकारी शिष्य",
  },
  {
    id: "female",
    label: "छात्रा (female)",
    student: "छात्रा",
    genitive: "की",
    futureVerb: "रहूँगी",
    politePossessive: "आपकी",
    signOff: "आपकी आज्ञाकारी शिष्या",
  },
];

/** Who the application is addressed to. */
export const RECIPIENTS = [
  { id: "principal-m", label: "श्रीमान प्रधानाचार्य महोदय", salutation: "महोदय" },
  { id: "principal-f", label: "श्रीमती प्रधानाचार्या महोदया", salutation: "महोदया" },
  { id: "class-teacher", label: "श्रीमान कक्षाध्यापक महोदय", salutation: "महोदय" },
  { id: "headmaster", label: "श्रीमान प्रधानाध्यापक महोदय", salutation: "महोदय" },
];

/** Reasons, worded the way they appear in a school prarthna patra. */
export const REASONS = [
  {
    id: "fever",
    label: "बुखार / बीमारी",
    subjectPhrase: "बीमारी",
    sentence: "मुझे कल रात से तेज़ बुखार है और चिकित्सक ने मुझे कुछ दिन विश्राम करने की सलाह दी है",
    proof: "चिकित्सक का प्रमाण पत्र इस प्रार्थना पत्र के साथ संलग्न है।",
  },
  {
    id: "home",
    label: "आवश्यक घरेलू कार्य",
    subjectPhrase: "आवश्यक घरेलू कार्य",
    sentence: "मुझे एक आवश्यक घरेलू कार्य के कारण घर पर रहना आवश्यक है",
    proof: "",
  },
  {
    id: "marriage",
    label: "पारिवारिक विवाह समारोह",
    subjectPhrase: "पारिवारिक विवाह समारोह",
    sentence: "मेरे परिवार में विवाह समारोह है और मुझे परिवार के साथ सम्मिलित होना है",
    proof: "",
  },
  {
    id: "outstation",
    label: "नगर से बाहर जाना",
    subjectPhrase: "नगर से बाहर जाने",
    sentence: "मुझे परिवार के साथ एक आवश्यक कार्य से नगर से बाहर जाना है",
    proof: "",
  },
  {
    id: "checkup",
    label: "चिकित्सक से जाँच",
    subjectPhrase: "चिकित्सकीय जाँच",
    sentence: "मुझे चिकित्सक से निर्धारित जाँच के लिए अस्पताल जाना है",
    proof: "जाँच से संबंधित पर्ची संलग्न है।",
  },
  {
    id: "bereavement",
    label: "परिवार में शोक",
    subjectPhrase: "पारिवारिक शोक",
    sentence: "मेरे परिवार में शोक का अवसर है और घर पर मेरी उपस्थिति आवश्यक है",
    proof: "",
  },
  {
    id: "festival",
    label: "धार्मिक अनुष्ठान",
    subjectPhrase: "धार्मिक अनुष्ठान",
    sentence: "मेरे घर पर एक धार्मिक अनुष्ठान है जिसमें मेरा सम्मिलित होना आवश्यक है",
    proof: "",
  },
];

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

/** Convert Latin digits in a string to Devanagari digits. */
export function toDevanagariDigits(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}

/** Hindi cardinal word for 1-30; falls back to the numeral beyond that. */
export function hindiNumberWord(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) return "";
  if (number <= 30) return HINDI_NUMBER_WORDS[number];
  return String(number);
}

/** Format an ISO date as "३ अगस्त २०२६" or "3 अगस्त 2026". */
export function formatHindiDate(iso, { devanagariDigits = true } = {}) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  const plain = `${parts.day} ${HINDI_MONTHS[parts.month - 1]} ${parts.year}`;
  return devanagariDigits ? toDevanagariDigits(plain) : plain;
}

/** Inclusive day count between two ISO dates. */
export function countLeaveDays({ from, to } = {}) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start) return { error: "अवकाश की पहली तारीख़ सही नहीं है। Enter a valid start date." };
  if (!end) return { error: "अवकाश की अंतिम तारीख़ सही नहीं है। Enter a valid end date." };
  if (end.stamp < start.stamp) {
    return { error: "अंतिम तारीख़ पहली तारीख़ से पहले नहीं हो सकती। The last day cannot be before the first day." };
  }
  const days = Math.round((end.stamp - start.stamp) / MS_PER_DAY) + 1;
  if (days > MAX_LEAVE_DAYS) {
    return { error: `यह प्रारूप अधिकतम ${MAX_LEAVE_DAYS} दिन तक के अवकाश के लिए है।` };
  }
  return { days, singleDay: days === 1 };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Compose the Hindi prarthna patra.
 * Returns { error } when a required field is missing or the dates do not work.
 */
export function buildHindiLeaveLetter({
  studentName = "",
  genderId = "male",
  className = "",
  rollNumber = "",
  schoolName = "",
  city = "",
  recipientId = "principal-m",
  reasonId = "fever",
  customReason = "",
  from = "",
  to = "",
  letterDate = "",
  attachProof = false,
  devanagariDigits = true,
} = {}) {
  const gender = GENDERS.find((entry) => entry.id === genderId);
  if (!gender) return { error: "छात्र या छात्रा चुनें। Choose छात्र or छात्रा." };

  const recipient = RECIPIENTS.find((entry) => entry.id === recipientId);
  if (!recipient) return { error: "पत्र किसे भेजना है, यह चुनें। Choose who the letter is addressed to." };

  const reason = REASONS.find((entry) => entry.id === reasonId);
  if (!reason) return { error: "अवकाश का कारण चुनें। Choose a reason for the leave." };

  const name = clean(studentName);
  if (!name) return { error: "छात्र/छात्रा का नाम लिखें। Enter the student's name." };

  const school = clean(schoolName);
  if (!school) return { error: "विद्यालय का नाम लिखें। Enter the school name." };

  const grade = clean(className);
  if (!grade) return { error: "कक्षा लिखें। Enter the class." };

  const period = countLeaveDays({ from, to });
  if (period.error) return { error: period.error };

  const dated = clean(letterDate) || from;
  const dateLine = formatHindiDate(dated, { devanagariDigits });
  if (!dateLine) return { error: "पत्र की तारीख़ सही नहीं है। Enter a valid letter date." };

  const fromLong = formatHindiDate(from, { devanagariDigits });
  const toLong = formatHindiDate(to, { devanagariDigits });
  const dayWord = hindiNumberWord(period.days);

  const periodPhrase = period.singleDay
    ? `दिनांक ${fromLong} को`
    : `दिनांक ${fromLong} से ${toLong} तक`;

  const reasonSentence = clean(customReason) || reason.sentence;
  const gradeText = devanagariDigits ? toDevanagariDigits(grade) : grade;
  const rollText = devanagariDigits ? toDevanagariDigits(clean(rollNumber)) : clean(rollNumber);
  const place = clean(city);

  const subject = `विषय: ${reason.subjectPhrase} के कारण अवकाश हेतु प्रार्थना पत्र।`;

  const addressLines = [recipient.label, school];
  if (place) addressLines.push(place);
  const header = ["सेवा में,"].concat(
    addressLines.map((line, position) => `    ${line}${position === addressLines.length - 1 ? "।" : ","}`),
  );

  const paragraphOne = `सविनय निवेदन है कि मैं ${name}, आपके विद्यालय की कक्षा ${gradeText} ${
    rollText ? `(अनुक्रमांक ${rollText}) ` : ""
  }${gender.genitive} ${gender.student} हूँ। ${reasonSentence}, इस कारण मैं ${periodPhrase} विद्यालय आने में असमर्थ हूँ।`;

  const paragraphTwo = `अतः आपसे विनम्र निवेदन है कि मुझे ${periodPhrase} ${dayWord} दिन का अवकाश प्रदान करने की कृपा करें। ${
    attachProof && reason.proof ? `${reason.proof} ` : ""
  }इसके लिए मैं ${gender.politePossessive} सदैव आभारी ${gender.futureVerb}।`;

  const signature = [
    `${gender.signOff},`,
    `नाम: ${name}`,
    `कक्षा: ${gradeText}`,
  ];
  if (rollText) signature.push(`अनुक्रमांक: ${rollText}`);
  signature.push(`दिनांक: ${dateLine}`);

  const letter = [
    header.join("\n"),
    "",
    subject,
    "",
    `${recipient.salutation},`,
    "",
    paragraphOne,
    "",
    paragraphTwo,
    "",
    "धन्यवाद।",
    "",
    signature.join("\n"),
  ].join("\n");

  const checklist = [
    { item: "सेवा में — पाने वाले का पद और विद्यालय", done: true },
    { item: "विषय पंक्ति", done: true },
    { item: "संबोधन (महोदय / महोदया)", done: true },
    { item: "सविनय निवेदन से आरंभ", done: true },
    { item: "अवकाश की दोनों तारीख़ें", done: Boolean(fromLong && toLong) },
    { item: "कारण एक वाक्य में", done: Boolean(reasonSentence) },
    { item: "अनुक्रमांक", done: Boolean(rollText) },
    { item: "संलग्न प्रमाण पत्र का उल्लेख", done: Boolean(attachProof && reason.proof) },
    { item: "लिंग के अनुसार क्रिया रूप (गा / गी)", done: true },
    { item: "हस्ताक्षर खंड — नाम, कक्षा, दिनांक", done: true },
  ];

  return {
    letter,
    subject,
    salutation: recipient.salutation,
    signOff: gender.signOff,
    days: period.days,
    dayWord,
    wordCount: letter.split(/\s+/).filter(Boolean).length,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
  };
}
