/**
 * Naming ceremony invitation wording — namkaran, christening, aqiqah, cradle.
 * Pure text composition plus calendar arithmetic. No I/O, no clock reads.
 *
 * Traditional timing, used for the suggested-day helper:
 *   - Namkaran sanskar is prescribed in the Grihya Sutras for the 11th or 12th
 *     day after birth; many communities also use the 10th, 16th or 21st day.
 *   - Aqiqah is Sunnah on the 7th day after birth, with the 14th and 21st day
 *     accepted as alternatives.
 *   - A cradle (palna) ceremony commonly follows on the 11th or 21st day.
 *   - Christening has no fixed day; it is usually held within the first months.
 * In every one of these counts the day of birth itself is day 1, so the "11th
 * day" is birth date + 10 days.
 *
 * Calendar maths uses the days-from-civil algorithm rather than the Date object,
 * so results never shift with the viewer's timezone.
 */

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
export const MAX_FIELD_LENGTH = 160;
/** A baby cannot be older than this and still be having a naming ceremony. */
export const MAX_DAYS_AFTER_BIRTH = 730;

export const LANGUAGES = [
  { id: "en", label: "English", lang: "en" },
  { id: "hi", label: "Hindi (हिन्दी)", lang: "hi" },
  { id: "hinglish", label: "Hinglish (Hindi in English letters)", lang: "hi-Latn" },
];

export const CEREMONIES = [
  {
    id: "namkaran",
    label: "Namkaran Sanskar",
    en: "Namkaran Sanskar (Naming Ceremony)",
    hi: "नामकरण संस्कार",
    hinglish: "Namkaran Sanskar",
    /** Days after birth traditionally used, day of birth counted as day 1. */
    traditionalDays: [11, 12, 16, 21],
  },
  {
    id: "cradle",
    label: "Cradle ceremony (Palna)",
    en: "Cradle Ceremony (Palna)",
    hi: "पालना एवं नामकरण समारोह",
    hinglish: "Palna (Cradle) Ceremony",
    traditionalDays: [11, 21],
  },
  {
    id: "aqiqah",
    label: "Aqiqah and naming",
    en: "Aqiqah and Naming",
    hi: "अकीका एवं नामकरण",
    hinglish: "Aqiqah aur Naamkaran",
    traditionalDays: [7, 14, 21],
  },
  {
    id: "christening",
    label: "Christening / Baptism",
    en: "Christening and Baptism",
    hi: "बपतिस्मा एवं नामकरण",
    hinglish: "Christening (Baptism)",
    traditionalDays: [],
  },
];

/** Opening line used by the "religious" style, matched to the ceremony. */
export const CEREMONY_BLESSING = {
  namkaran: {
    en: "|| Shri Ganeshay Namah ||",
    hi: "॥ श्री गणेशाय नमः ॥",
    hinglish: "|| Shri Ganeshay Namah ||",
  },
  cradle: {
    en: "|| Shri Ganeshay Namah ||",
    hi: "॥ श्री गणेशाय नमः ॥",
    hinglish: "|| Shri Ganeshay Namah ||",
  },
  aqiqah: {
    en: "Bismillah ir-Rahman ir-Rahim",
    hi: "बिस्मिल्लाह अर्-रहमान अर्-रहीम",
    hinglish: "Bismillah ir-Rahman ir-Rahim",
  },
  christening: {
    en: "In the name of the Father, the Son and the Holy Spirit",
    hi: "पिता, पुत्र और पवित्र आत्मा के नाम में",
    hinglish: "Pita, Putra aur Pavitra Atma ke naam mein",
  },
};

/**
 * The Hindi and Hinglish entries carry the possessive, because Hindi agrees in
 * gender: अपने पुत्र but अपनी पुत्री. English uses "their" in the template.
 */
export const CHILD_WORDS = [
  { id: "boy", label: "Boy", en: "son", hi: "अपने पुत्र", hinglish: "apne putra" },
  { id: "girl", label: "Girl", en: "daughter", hi: "अपनी पुत्री", hinglish: "apni putri" },
  { id: "unspecified", label: "Prefer not to say", en: "baby", hi: "अपने शिशु", hinglish: "apne shishu" },
];

export const MEALS = [
  { id: "none", label: "No meal mentioned", en: "", hi: "", hinglish: "" },
  {
    id: "lunch",
    label: "Lunch after the ceremony",
    en: "Lunch will be served after the ceremony.",
    hi: "समारोह के पश्चात भोजन की व्यवस्था है।",
    hinglish: "Samaroh ke pashchat bhojan ki vyavastha hai.",
  },
  {
    id: "dinner",
    label: "Dinner after the ceremony",
    en: "Dinner will be served after the ceremony.",
    hi: "समारोह के पश्चात रात्रि भोजन की व्यवस्था है।",
    hinglish: "Samaroh ke pashchat ratri bhojan ki vyavastha hai.",
  },
  {
    id: "tea",
    label: "Tea and refreshments",
    en: "Tea and refreshments will follow.",
    hi: "समारोह के पश्चात अल्पाहार की व्यवस्था है।",
    hinglish: "Samaroh ke pashchat alpahaar ki vyavastha hai.",
  },
];

export const STYLES = [
  { id: "traditional", label: "Traditional" },
  { id: "religious", label: "Religious" },
  { id: "modern", label: "Modern" },
  { id: "whatsapp", label: "Short (WhatsApp)" },
];

export const MONTH_NAMES = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  hi: [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ],
  hinglish: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

/** Index 0 = Sunday. */
export const WEEKDAY_NAMES = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  hinglish: ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"],
};

export const DAY_PARTS = {
  hi: { morning: "सुबह", afternoon: "दोपहर", evening: "शाम", night: "रात" },
  hinglish: { morning: "Subah", afternoon: "Dopahar", evening: "Shaam", night: "Raat" },
};

export const CLOCK_WORD = { hi: "बजे", hinglish: "baje" };

export const LABELS = {
  en: { date: "Date", time: "Time", venue: "Venue", rsvp: "RSVP" },
  hi: { date: "दिनांक", time: "समय", venue: "स्थान", rsvp: "संपर्क" },
  hinglish: { date: "Dinank", time: "Samay", venue: "Sthaan", rsvp: "Sampark" },
};

export const STYLE_TEXT = {
  en: {
    traditional: {
      opening: "With the blessings of the Almighty and our elders",
      closing: "Your presence and blessings will mean the world to us.",
    },
    modern: { opening: "Our little one has a name!", closing: "Come celebrate with us." },
    whatsapp: { opening: "", closing: "Do join us." },
    religiousClosing: "Kindly grace the occasion and bless our child.",
  },
  hi: {
    traditional: {
      opening: "ईश्वर एवं बड़ों के आशीर्वाद से",
      closing: "आपकी उपस्थिति और आशीर्वाद हमारे लिए अनमोल होंगे।",
    },
    modern: { opening: "हमारे नन्हे मेहमान का नाम रखा जा रहा है!", closing: "आइए, इस खुशी में शामिल हों।" },
    whatsapp: { opening: "", closing: "आप सपरिवार सादर आमंत्रित हैं।" },
    religiousClosing: "कृपया पधारकर हमारे शिशु को आशीर्वाद प्रदान करें।",
  },
  hinglish: {
    traditional: {
      opening: "Ishwar evam badon ke ashirwad se",
      closing: "Aapki upasthiti aur ashirwad hamare liye anmol honge.",
    },
    modern: {
      opening: "Hamare nanhe mehmaan ka naam rakha ja raha hai!",
      closing: "Aaiye, is khushi mein shamil hon.",
    },
    whatsapp: { opening: "", closing: "Aap saparivar sadar aamantrit hain." },
    religiousClosing: "Kripya padharkar hamare shishu ko ashirwad pradan karein.",
  },
};

/** Placeholders: {parents} {child} {name} {ceremony} */
export const INVITE_WITH_NAME = {
  en: "{parents} joyfully invite you and your family to the {ceremony} of their {child}, {name}.",
  hi: "{parents} आपको सपरिवार {child} {name} के {ceremony} में सादर आमंत्रित करते हैं।",
  hinglish: "{parents} aapko saparivar {child} {name} ke {ceremony} mein sadar aamantrit karte hain.",
};

export const INVITE_WITHOUT_NAME = {
  en: "{parents} joyfully invite you and your family to the {ceremony} of their newborn {child}. The name will be announced at the ceremony.",
  hi: "{parents} आपको सपरिवार {child} के {ceremony} में सादर आमंत्रित करते हैं। नाम समारोह में घोषित किया जाएगा।",
  hinglish:
    "{parents} aapko saparivar {child} ke {ceremony} mein sadar aamantrit karte hain. Naam samaroh mein ghoshit kiya jayega.",
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
 * Days-from-civil (Howard Hinnant): serial day number for a Gregorian date,
 * with 1970-01-01 as day 0. Exact integer arithmetic, no timezone involved.
 */
export function daysFromCivil(year, month, day) {
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Inverse of daysFromCivil. */
export function civilFromDays(serial) {
  const z = serial + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp + (mp < 10 ? 3 : -9);
  return { year: y + (month <= 2 ? 1 : 0), month, day };
}

/** Day of week from the serial number. 1970-01-01 was a Thursday (index 4). */
export function weekdayFromSerial(serial) {
  return ((((serial + 4) % 7) + 7) % 7);
}

export function parseIsoDate(iso, what = "date") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return { error: `Pick the ${what}.` };
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
  const serial = daysFromCivil(year, month, day);
  return { year, month, day, serial, weekday: weekdayFromSerial(serial) };
}

export function parseTime(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!match) return { error: "Pick a start time for the ceremony." };
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23) return { error: "Hour must be between 00 and 23." };
  if (minute < 0 || minute > 59) return { error: "Minutes must be between 00 and 59." };
  return { hour, minute };
}

/**
 * Date of the Nth day after birth, counting the day of birth as day 1.
 * The 11th day therefore falls on birth date + 10 days.
 *
 * @param {string} birthIso  ISO "YYYY-MM-DD"
 * @param {number} dayNumber 1..MAX_DAYS_AFTER_BIRTH
 * @returns {{iso:string, year:number, month:number, day:number}|{error:string}}
 */
export function ceremonyDateForDay(birthIso, dayNumber) {
  const birth = parseIsoDate(birthIso, "date of birth");
  if (birth.error) return { error: birth.error };
  const n = Number(dayNumber);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_DAYS_AFTER_BIRTH) {
    return { error: `The day number must be a whole number between 1 and ${MAX_DAYS_AFTER_BIRTH}.` };
  }
  const target = civilFromDays(birth.serial + (n - 1));
  const iso = `${String(target.year).padStart(4, "0")}-${String(target.month).padStart(2, "0")}-${String(target.day).padStart(2, "0")}`;
  return { ...target, iso };
}

export function formatDate({ year, month, day, weekday }, language) {
  return `${WEEKDAY_NAMES[language][weekday]}, ${day} ${MONTH_NAMES[language][month - 1]} ${year}`;
}

export function formatTime({ hour, minute }, language) {
  const mm = String(minute).padStart(2, "0");
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  if (language === "en") return `${h12}:${mm} ${hour < 12 ? "AM" : "PM"}`;
  let part = "night";
  if (hour >= 4 && hour < 12) part = "morning";
  else if (hour >= 12 && hour < 16) part = "afternoon";
  else if (hour >= 16 && hour < 20) part = "evening";
  return `${DAY_PARTS[language][part]} ${h12}:${mm} ${CLOCK_WORD[language]}`;
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

/**
 * Build the naming ceremony invitation wording.
 *
 * @param {object} input
 * @param {string} input.parents     e.g. "Rohan & Meera Sharma"
 * @param {string} input.babyName    Optional; omit to keep the name a surprise
 * @param {string} input.childGender One of CHILD_WORDS[].id
 * @param {string} input.ceremony    One of CEREMONIES[].id
 * @param {string} input.birthDate   Optional ISO "YYYY-MM-DD"; enables the day count
 * @param {string} input.date        Ceremony date, ISO "YYYY-MM-DD"
 * @param {string} input.time        24-hour "HH:MM"
 * @param {string} input.venue
 * @param {string} input.city
 * @param {string} input.meal        One of MEALS[].id
 * @param {string} input.language    One of LANGUAGES[].id
 * @param {string} input.style       One of STYLES[].id
 * @param {string} input.rsvp        Optional contact line
 * @returns {{text:string, dateText:string, timeText:string, weekdayName:string, ceremonyName:string, dayAfterBirth:number|null, lang:string}|{error:string}}
 */
export function buildInvitation({
  parents = "",
  babyName = "",
  childGender = "unspecified",
  ceremony = "namkaran",
  birthDate = "",
  date = "",
  time = "",
  venue = "",
  city = "",
  meal = "lunch",
  language = "en",
  style = "traditional",
  rsvp = "",
} = {}) {
  const ceremonyDef = findById(CEREMONIES, ceremony);
  const childDef = findById(CHILD_WORDS, childGender);
  const languageDef = findById(LANGUAGES, language);
  const mealDef = findById(MEALS, meal);
  const styleDef = findById(STYLES, style);

  if (!ceremonyDef) return { error: "Choose a ceremony type." };
  if (!childDef) return { error: "Choose whether the baby is a boy or a girl." };
  if (!languageDef) return { error: "Choose a language." };
  if (!mealDef) return { error: "Choose whether a meal is being served." };
  if (!styleDef) return { error: "Choose a wording style." };

  const parentNames = cleanText(parents);
  const baby = cleanText(babyName);
  const place = cleanText(venue);
  const town = cleanText(city);
  const contact = cleanText(rsvp);

  if (!parentNames) return { error: "Enter the parents' names." };
  if (!place) return { error: "Enter the venue." };

  for (const [label, value] of [
    ["parents' names", parentNames],
    ["baby's name", baby],
    ["venue", place],
    ["city", town],
    ["RSVP line", contact],
  ]) {
    if (value.length > MAX_FIELD_LENGTH) {
      return { error: `Keep the ${label} under ${MAX_FIELD_LENGTH} characters.` };
    }
  }

  const parsedDate = parseIsoDate(date, "ceremony date");
  if (parsedDate.error) return { error: parsedDate.error };
  const parsedTime = parseTime(time);
  if (parsedTime.error) return { error: parsedTime.error };

  let dayAfterBirth = null;
  if (String(birthDate || "").trim() !== "") {
    const birth = parseIsoDate(birthDate, "date of birth");
    if (birth.error) return { error: birth.error };
    if (parsedDate.serial < birth.serial) {
      return { error: "The ceremony date cannot be earlier than the date of birth." };
    }
    // Day of birth counts as day 1, so add one to the elapsed-day difference.
    dayAfterBirth = parsedDate.serial - birth.serial + 1;
    if (dayAfterBirth > MAX_DAYS_AFTER_BIRTH) {
      return { error: `The ceremony date is more than ${MAX_DAYS_AFTER_BIRTH} days after the birth date.` };
    }
  }

  const labels = LABELS[language];
  const dateText = formatDate(parsedDate, language);
  const timeText = formatTime(parsedTime, language);
  const venueText = town ? `${place}, ${town}` : place;
  const ceremonyName = ceremonyDef[language];

  const template = baby ? INVITE_WITH_NAME[language] : INVITE_WITHOUT_NAME[language];
  const inviteLine = template
    .replace("{parents}", parentNames)
    .replace("{child}", childDef[language])
    .replace("{name}", baby)
    .replace("{ceremony}", ceremonyName);

  const styleText = STYLE_TEXT[language];
  const opening =
    style === "religious" ? CEREMONY_BLESSING[ceremony][language] : styleText[style].opening;
  const closing =
    style === "religious" ? styleText.religiousClosing : styleText[style].closing;
  const mealLine = mealDef[language];
  const rsvpLine = contact ? `${labels.rsvp}: ${contact}` : "";

  let lines;
  if (style === "whatsapp") {
    lines = [
      inviteLine,
      `${labels.date}: ${dateText}  |  ${labels.time}: ${timeText}`,
      `${labels.venue}: ${venueText}`,
    ];
    if (mealLine) lines.push(mealLine);
    lines.push(closing);
    if (rsvpLine) lines.push(rsvpLine);
  } else {
    lines = [
      opening,
      "",
      ceremonyName,
      "",
      inviteLine,
      "",
      `${labels.date}: ${dateText}`,
      `${labels.time}: ${timeText}`,
      "",
      `${labels.venue}: ${venueText}`,
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
    timeText,
    weekdayName: WEEKDAY_NAMES[language][parsedDate.weekday],
    ceremonyName,
    traditionalDays: ceremonyDef.traditionalDays,
    dayAfterBirth,
    lang: languageDef.lang,
  };
}
