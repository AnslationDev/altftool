/**
 * Griha Pravesh (housewarming) invitation wording — pure text composition.
 *
 * Dates arrive as ISO "YYYY-MM-DD" and times as 24-hour "HH:MM", so nothing here
 * reads the clock and the same input always produces the same invitation.
 *
 * Calendar rules are implemented directly rather than through the Date object:
 *   - Gregorian leap year: divisible by 4, except centuries, unless divisible by 400.
 *   - Day of week: Zeller's congruence for the Gregorian calendar.
 * That avoids the timezone shift you get from new Date("2026-02-29").
 *
 * A griha pravesh muhurat is normally quoted as a window ("10:42 to 12:06"),
 * not a single instant, so an optional end time is supported.
 */

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
/** Free-text fields are capped so a pasted paragraph cannot break the layout. */
export const MAX_FIELD_LENGTH = 160;
/** The address block is longer because it holds flat, building and locality lines. */
export const MAX_ADDRESS_LENGTH = 300;

export const LANGUAGES = [
  { id: "en", label: "English", lang: "en" },
  { id: "hi", label: "Hindi (हिन्दी)", lang: "hi" },
  { id: "mr", label: "Marathi (मराठी)", lang: "mr" },
  { id: "gu", label: "Gujarati (ગુજરાતી)", lang: "gu" },
];

export const PUJAS = [
  {
    id: "vastu",
    label: "Vastu Shanti Puja",
    en: "Vastu Shanti Puja",
    hi: "वास्तु शांति पूजन",
    mr: "वास्तुशांती पूजन",
    gu: "વાસ્તુ શાંતિ પૂજન",
  },
  {
    id: "satyanarayan",
    label: "Satyanarayan Katha",
    en: "Satyanarayan Katha",
    hi: "सत्यनारायण कथा",
    mr: "सत्यनारायण पूजा",
    gu: "સત્યનારાયણ કથા",
  },
  {
    id: "havan",
    label: "Griha Pravesh Havan",
    en: "Griha Pravesh Havan",
    hi: "गृह प्रवेश हवन",
    mr: "गृहप्रवेश हवन",
    gu: "ગૃહ પ્રવેશ હવન",
  },
  {
    id: "ganesh",
    label: "Ganesh Puja",
    en: "Ganesh Puja",
    hi: "गणेश पूजन",
    mr: "गणेश पूजन",
    gu: "ગણેશ પૂજન",
  },
];

export const MEALS = [
  {
    id: "none",
    label: "No meal mentioned",
    en: "",
    hi: "",
    mr: "",
    gu: "",
  },
  {
    id: "lunch",
    label: "Lunch after the puja",
    en: "Lunch will be served after the puja.",
    hi: "पूजन के पश्चात भोजन की व्यवस्था है।",
    mr: "पूजेनंतर भोजनाची व्यवस्था आहे.",
    gu: "પૂજા બાદ ભોજનની વ્યવસ્થા છે.",
  },
  {
    id: "dinner",
    label: "Dinner after the puja",
    en: "Dinner will be served after the puja.",
    hi: "पूजन के पश्चात रात्रि भोजन की व्यवस्था है।",
    mr: "पूजेनंतर रात्रीच्या भोजनाची व्यवस्था आहे.",
    gu: "પૂજા બાદ રાત્રિભોજનની વ્યવસ્થા છે.",
  },
  {
    id: "tea",
    label: "Tea and refreshments",
    en: "Tea and refreshments will follow.",
    hi: "पूजन के पश्चात अल्पाहार की व्यवस्था है।",
    mr: "पूजेनंतर अल्पोपाहाराची व्यवस्था आहे.",
    gu: "પૂજા બાદ અલ્પાહારની વ્યવસ્થા છે.",
  },
];

export const STYLES = [
  { id: "traditional", label: "Traditional" },
  { id: "religious", label: "Religious" },
  { id: "modern", label: "Modern" },
  { id: "whatsapp", label: "Short (WhatsApp)" },
];

export const EVENT_NAME = {
  en: "Griha Pravesh (Housewarming)",
  hi: "गृह प्रवेश",
  mr: "गृहप्रवेश",
  gu: "ગૃહ પ્રવેશ",
};

export const MONTH_NAMES = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  hi: [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ],
  mr: [
    "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
    "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
  ],
  gu: [
    "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
    "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર",
  ],
};

/** Index 0 = Sunday. */
export const WEEKDAY_NAMES = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  mr: ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  gu: ["રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર"],
};

/**
 * Indian languages name the part of the day instead of using am/pm:
 *   04:00-11:59 morning, 12:00-15:59 afternoon, 16:00-19:59 evening, 20:00-03:59 night.
 */
export const DAY_PARTS = {
  hi: { morning: "सुबह", afternoon: "दोपहर", evening: "शाम", night: "रात" },
  mr: { morning: "सकाळी", afternoon: "दुपारी", evening: "संध्याकाळी", night: "रात्री" },
  gu: { morning: "સવારે", afternoon: "બપોરે", evening: "સાંજે", night: "રાત્રે" },
};

/** The word for "o'clock" that follows the number. */
export const CLOCK_WORD = { hi: "बजे", mr: "वाजता", gu: "વાગ્યે" };

export const LABELS = {
  en: { date: "Date", muhurat: "Muhurat", venue: "Venue", rsvp: "RSVP", to: "to" },
  hi: { date: "दिनांक", muhurat: "मुहूर्त", venue: "स्थान", rsvp: "संपर्क", to: "से" },
  mr: { date: "दिनांक", muhurat: "मुहूर्त", venue: "स्थळ", rsvp: "संपर्क", to: "ते" },
  gu: { date: "તારીખ", muhurat: "મુહૂર્ત", venue: "સ્થળ", rsvp: "સંપર્ક", to: "થી" },
};

export const STYLE_TEXT = {
  en: {
    traditional: {
      opening: "With the blessings of the Almighty and our elders",
      closing: "Your presence will bless our new home.",
    },
    religious: {
      opening: "|| Shri Ganeshay Namah ||",
      closing: "Kindly grace the occasion and bless our new home.",
    },
    modern: { opening: "We have moved!", closing: "Come and see the new place." },
    whatsapp: { opening: "", closing: "Do join us." },
  },
  hi: {
    traditional: {
      opening: "ईश्वर एवं बड़ों के आशीर्वाद से",
      closing: "आपकी उपस्थिति हमारे नए घर के लिए आशीर्वाद होगी।",
    },
    religious: {
      opening: "॥ श्री गणेशाय नमः ॥",
      closing: "कृपया पधारकर हमारे नए गृह को आशीर्वाद प्रदान करें।",
    },
    modern: {
      opening: "हमने नया घर लिया है!",
      closing: "आइए, नया घर देखिए और आशीर्वाद दीजिए।",
    },
    whatsapp: { opening: "", closing: "आप सपरिवार सादर आमंत्रित हैं।" },
  },
  mr: {
    traditional: {
      opening: "ईश्वर व वडीलधाऱ्यांच्या आशीर्वादाने",
      closing: "आपल्या उपस्थितीने आमच्या नवीन वास्तूला आशीर्वाद लाभेल.",
    },
    religious: {
      opening: "॥ श्री गणेशाय नमः ॥",
      closing: "कृपया उपस्थित राहून आमच्या नवीन वास्तूस आशीर्वाद द्यावा.",
    },
    modern: {
      opening: "आम्ही नवीन घरात राहायला आलो आहोत!",
      closing: "या, नवीन वास्तू पाहा आणि आशीर्वाद द्या.",
    },
    whatsapp: { opening: "", closing: "आपण सहपरिवार सादर आमंत्रित आहात." },
  },
  gu: {
    traditional: {
      opening: "ઈશ્વર તથા વડીલોના આશીર્વાદથી",
      closing: "આપની ઉપસ્થિતિ અમારા નવા ઘર માટે આશીર્વાદરૂપ રહેશે.",
    },
    religious: {
      opening: "॥ શ્રી ગણેશાય નમઃ ॥",
      closing: "કૃપા કરીને પધારીને અમારા નવા ઘરને આશીર્વાદ આપશો.",
    },
    modern: {
      opening: "અમે નવા ઘરમાં રહેવા આવ્યા છીએ!",
      closing: "આવો, નવું ઘર જુઓ અને આશીર્વાદ આપો.",
    },
    whatsapp: { opening: "", closing: "આપ સહપરિવાર સાદર આમંત્રિત છો." },
  },
};

/** Placeholders: {hosts} {puja} */
export const INVITE_LINES = {
  en: "{hosts} warmly invite you and your family to the {puja} on the occasion of the Griha Pravesh of our new home.",
  hi: "{hosts} आपको सपरिवार अपने नए गृह के गृह प्रवेश एवं {puja} के शुभ अवसर पर सादर आमंत्रित करते हैं।",
  mr: "{hosts} आपणास सहपरिवार आमच्या नवीन वास्तूच्या गृहप्रवेश व {puja} या शुभप्रसंगी सादर आमंत्रित करत आहेत.",
  gu: "{hosts} આપને સહપરિવાર અમારા નવા ઘરના ગૃહ પ્રવેશ તથા {puja} ના શુભ પ્રસંગે સાદર આમંત્રણ આપે છે.",
};

/** Gregorian leap year: divisible by 4, not by 100, unless also by 400. */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

/**
 * Zeller's congruence, Gregorian form. Returns 0 = Sunday .. 6 = Saturday.
 * Zeller's own h is 0 = Saturday, hence the shift by 6.
 */
export function dayOfWeek(year, month, day) {
  let y = year;
  let m = month;
  if (m < 3) {
    m += 12;
    y -= 1;
  }
  const K = y % 100;
  const J = Math.floor(y / 100);
  const h =
    (day + Math.floor((13 * (m + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
  return (h + 6) % 7;
}

export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return { error: "Pick the griha pravesh date." };
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (month < 1 || month > 12) return { error: "Month must be between 01 and 12." };
  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    return { error: `That month has only ${maxDay} days in ${year}.` };
  }
  return { year, month, day, weekday: dayOfWeek(year, month, day) };
}

export function parseTime(hhmm, what = "time") {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!match) return { error: `Pick the muhurat ${what}.` };
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23) return { error: "Hour must be between 00 and 23." };
  if (minute < 0 || minute > 59) return { error: "Minutes must be between 00 and 59." };
  return { hour, minute, minutes: hour * 60 + minute };
}

export function formatDate({ year, month, day, weekday }, language) {
  return `${WEEKDAY_NAMES[language][weekday]}, ${day} ${MONTH_NAMES[language][month - 1]} ${year}`;
}

/**
 * @param {{hour:number,minute:number}} time
 * @param {string} language
 * @param {boolean} bare  When true the trailing "o'clock" word is dropped, which
 *                        is how the first half of a range is written in Indian
 *                        languages ("सकाळी 10:42 ते दुपारी 12:06 वाजता").
 */
export function formatTime({ hour, minute }, language, bare = false) {
  const mm = String(minute).padStart(2, "0");
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  if (language === "en") {
    return `${h12}:${mm} ${hour < 12 ? "AM" : "PM"}`;
  }
  let part = "night";
  if (hour >= 4 && hour < 12) part = "morning";
  else if (hour >= 12 && hour < 16) part = "afternoon";
  else if (hour >= 16 && hour < 20) part = "evening";
  const head = `${DAY_PARTS[language][part]} ${h12}:${mm}`;
  return bare ? head : `${head} ${CLOCK_WORD[language]}`;
}

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/** Keep address line breaks but trim each line and drop empty ones. */
function cleanAddress(value) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Build the griha pravesh invitation wording.
 *
 * @param {object} input
 * @param {string} input.hostNames    e.g. "Sharma Family"
 * @param {string} input.address      New home address, line breaks allowed
 * @param {string} input.date         ISO "YYYY-MM-DD"
 * @param {string} input.muhuratStart 24-hour "HH:MM"
 * @param {string} input.muhuratEnd   Optional 24-hour "HH:MM" closing the window
 * @param {string} input.puja         One of PUJAS[].id
 * @param {string} input.meal         One of MEALS[].id
 * @param {string} input.language     One of LANGUAGES[].id
 * @param {string} input.style        One of STYLES[].id
 * @param {string} input.rsvp         Optional contact line
 * @returns {{text:string, dateText:string, muhuratText:string, weekdayName:string, eventName:string, windowMinutes:number|null, lang:string}|{error:string}}
 */
export function buildInvitation({
  hostNames = "",
  address = "",
  date = "",
  muhuratStart = "",
  muhuratEnd = "",
  puja = "vastu",
  meal = "lunch",
  language = "en",
  style = "traditional",
  rsvp = "",
} = {}) {
  const languageDef = findById(LANGUAGES, language);
  const pujaDef = findById(PUJAS, puja);
  const mealDef = findById(MEALS, meal);
  const styleDef = findById(STYLES, style);

  if (!languageDef) return { error: "Choose a language." };
  if (!pujaDef) return { error: "Choose the puja being performed." };
  if (!mealDef) return { error: "Choose whether a meal is being served." };
  if (!styleDef) return { error: "Choose a wording style." };

  const hosts = cleanText(hostNames);
  const addressText = cleanAddress(address);
  const contact = cleanText(rsvp);

  if (!hosts) return { error: "Enter the inviting family's name, e.g. Sharma Family." };
  if (!addressText) return { error: "Enter the address of the new home." };
  if (hosts.length > MAX_FIELD_LENGTH) {
    return { error: `Keep the family name under ${MAX_FIELD_LENGTH} characters.` };
  }
  if (contact.length > MAX_FIELD_LENGTH) {
    return { error: `Keep the RSVP line under ${MAX_FIELD_LENGTH} characters.` };
  }
  if (addressText.length > MAX_ADDRESS_LENGTH) {
    return { error: `Keep the address under ${MAX_ADDRESS_LENGTH} characters.` };
  }

  const parsedDate = parseIsoDate(date);
  if (parsedDate.error) return { error: parsedDate.error };

  const start = parseTime(muhuratStart, "start time");
  if (start.error) return { error: start.error };

  let end = null;
  if (String(muhuratEnd || "").trim() !== "") {
    end = parseTime(muhuratEnd, "end time");
    if (end.error) return { error: end.error };
    if (end.minutes <= start.minutes) {
      return { error: "The muhurat end time must be later on the same day than the start time." };
    }
  }

  const labels = LABELS[language];
  const dateText = formatDate(parsedDate, language);
  const muhuratText = end
    ? `${formatTime(start, language, true)} ${labels.to} ${formatTime(end, language)}`
    : formatTime(start, language);

  const inviteLine = INVITE_LINES[language]
    .replace("{hosts}", hosts)
    .replace("{puja}", pujaDef[language]);
  const { opening, closing } = STYLE_TEXT[language][style];
  const mealLine = mealDef[language];
  const rsvpLine = contact ? `${labels.rsvp}: ${contact}` : "";

  let lines;
  if (style === "whatsapp") {
    lines = [
      inviteLine,
      `${labels.date}: ${dateText}  |  ${labels.muhurat}: ${muhuratText}`,
      `${labels.venue}: ${addressText.split("\n").join(", ")}`,
    ];
    if (mealLine) lines.push(mealLine);
    lines.push(closing);
    if (rsvpLine) lines.push(rsvpLine);
  } else {
    lines = [
      opening,
      "",
      EVENT_NAME[language],
      "",
      inviteLine,
      "",
      `${labels.date}: ${dateText}`,
      `${labels.muhurat}: ${muhuratText}`,
      "",
      `${labels.venue}:`,
      addressText,
      "",
    ];
    if (mealLine) lines.push(mealLine, "");
    lines.push(closing);
    if (rsvpLine) lines.push(rsvpLine);
  }

  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    text,
    dateText,
    muhuratText,
    weekdayName: WEEKDAY_NAMES[language][parsedDate.weekday],
    eventName: EVENT_NAME[language],
    pujaName: pujaDef[language],
    windowMinutes: end ? end.minutes - start.minutes : null,
    lang: languageDef.lang,
  };
}
