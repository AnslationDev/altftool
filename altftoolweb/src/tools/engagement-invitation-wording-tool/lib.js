/**
 * Engagement / roka / sagai / tilak invitation wording — pure text composition.
 *
 * Dates are supplied as ISO "YYYY-MM-DD" strings and times as 24-hour "HH:MM",
 * so nothing here reads the clock and the same input always produces the same
 * invitation.
 *
 * Calendar rules implemented directly rather than via the Date object:
 *   - Gregorian leap year: divisible by 4, except centuries, unless divisible by 400.
 *   - Day of week: Zeller's congruence for the Gregorian calendar.
 * Using the raw rules avoids the timezone shifts you get from new Date("2026-02-29").
 */

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
/** Free-text fields are capped so a pasted paragraph cannot break the layout. */
export const MAX_FIELD_LENGTH = 120;

export const LANGUAGES = [
  { id: "en", label: "English", lang: "en" },
  { id: "hi", label: "Hindi (हिन्दी)", lang: "hi" },
  { id: "hinglish", label: "Hinglish (Hindi in English letters)", lang: "hi-Latn" },
];

export const CEREMONIES = [
  { id: "roka", label: "Roka", en: "Roka Ceremony", hi: "रोका समारोह", hinglish: "Roka Ceremony" },
  {
    id: "sagai",
    label: "Sagai / Ring ceremony",
    en: "Sagai (Ring Ceremony)",
    hi: "सगाई समारोह",
    hinglish: "Sagai (Ring Ceremony)",
  },
  {
    id: "engagement",
    label: "Engagement",
    en: "Engagement Ceremony",
    hi: "एंगेजमेंट समारोह",
    hinglish: "Engagement Ceremony",
  },
  { id: "tilak", label: "Tilak", en: "Tilak Ceremony", hi: "तिलक समारोह", hinglish: "Tilak Ceremony" },
];

export const HOST_SIDES = [
  { id: "bride", label: "Bride's family is inviting" },
  { id: "groom", label: "Groom's family is inviting" },
  { id: "both", label: "Both families are inviting" },
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

/**
 * Indian convention splits the day into four spoken parts rather than am/pm:
 *   04:00-11:59 subah, 12:00-15:59 dopahar, 16:00-19:59 shaam, 20:00-03:59 raat.
 */
export const DAY_PARTS = {
  hi: { morning: "सुबह", afternoon: "दोपहर", evening: "शाम", night: "रात" },
  hinglish: { morning: "Subah", afternoon: "Dopahar", evening: "Shaam", night: "Raat" },
};

export const LABELS = {
  en: { date: "Date", time: "Time", venue: "Venue", rsvp: "RSVP", and: "&" },
  hi: { date: "दिनांक", time: "समय", venue: "स्थान", rsvp: "संपर्क", and: "एवं" },
  hinglish: { date: "Dinank", time: "Samay", venue: "Sthaan", rsvp: "Sampark", and: "evam" },
};

export const STYLE_TEXT = {
  en: {
    traditional: {
      opening: "With the blessings of the Almighty and our elders",
      closing: "Your presence will make the occasion complete.",
    },
    religious: {
      opening: "|| Shri Ganeshay Namah ||",
      closing: "Kindly grace the occasion with your blessings.",
    },
    modern: {
      opening: "We have some happy news to share",
      closing: "Come celebrate with us.",
    },
    whatsapp: { opening: "", closing: "Please do join us." },
  },
  hi: {
    traditional: {
      opening: "ईश्वर एवं बड़ों के आशीर्वाद से",
      closing: "आपकी उपस्थिति हमारे लिए सौभाग्य की बात होगी।",
    },
    religious: {
      opening: "॥ श्री गणेशाय नमः ॥",
      closing: "कृपया पधारकर वर-वधू को आशीर्वाद प्रदान करें।",
    },
    modern: {
      opening: "हमारे घर में खुशी का अवसर है",
      closing: "आइए, इस खुशी में हमारे साथ शामिल हों।",
    },
    whatsapp: { opening: "", closing: "आप सपरिवार सादर आमंत्रित हैं।" },
  },
  hinglish: {
    traditional: {
      opening: "Ishwar evam badon ke ashirwad se",
      closing: "Aapki upasthiti hamare liye saubhagya ki baat hogi.",
    },
    religious: {
      opening: "|| Shri Ganeshay Namah ||",
      closing: "Kripya padharkar var-vadhu ko ashirwad pradan karein.",
    },
    modern: {
      opening: "Hamare ghar mein khushi ka avsar hai",
      closing: "Aaiye, is khushi mein hamare saath shamil hon.",
    },
    whatsapp: { opening: "", closing: "Aap saparivar sadar aamantrit hain." },
  },
};

/** Placeholders: {hosts} {ceremony} {bride} {groom} */
export const INVITE_LINES = {
  en: {
    bride: "{hosts} cordially invite you and your family to the {ceremony} of their daughter {bride} with {groom}.",
    groom: "{hosts} cordially invite you and your family to the {ceremony} of their son {groom} with {bride}.",
    both: "{hosts} cordially invite you and your family to the {ceremony} of {bride} and {groom}.",
  },
  hi: {
    bride: "{hosts} आपको सपरिवार अपनी सुपुत्री {bride} एवं {groom} के {ceremony} में सादर आमंत्रित करते हैं।",
    groom: "{hosts} आपको सपरिवार अपने सुपुत्र {groom} एवं {bride} के {ceremony} में सादर आमंत्रित करते हैं।",
    both: "{hosts} आपको सपरिवार {bride} एवं {groom} के {ceremony} में सादर आमंत्रित करते हैं।",
  },
  hinglish: {
    bride: "{hosts} aapko saparivar apni suputri {bride} evam {groom} ke {ceremony} mein sadar aamantrit karte hain.",
    groom: "{hosts} aapko saparivar apne suputra {groom} evam {bride} ke {ceremony} mein sadar aamantrit karte hain.",
    both: "{hosts} aapko saparivar {bride} evam {groom} ke {ceremony} mein sadar aamantrit karte hain.",
  },
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
 * Zeller's own h is 0 = Saturday, so the result is shifted by 6.
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

/** Parse and validate an ISO "YYYY-MM-DD" date without touching the Date object. */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return { error: "Pick a date for the ceremony." };
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

/** Parse and validate a 24-hour "HH:MM" time. */
export function parseTime(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!match) return { error: "Pick a start time for the ceremony." };
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23) return { error: "Hour must be between 00 and 23." };
  if (minute < 0 || minute > 59) return { error: "Minutes must be between 00 and 59." };
  return { hour, minute };
}

export function formatDate({ year, month, day, weekday }, language) {
  return `${WEEKDAY_NAMES[language][weekday]}, ${day} ${MONTH_NAMES[language][month - 1]} ${year}`;
}

export function formatTime({ hour, minute }, language) {
  const mm = String(minute).padStart(2, "0");
  if (language === "en") {
    const suffix = hour < 12 ? "AM" : "PM";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}:${mm} ${suffix}`;
  }
  let part = "night";
  if (hour >= 4 && hour < 12) part = "morning";
  else if (hour >= 12 && hour < 16) part = "afternoon";
  else if (hour >= 16 && hour < 20) part = "evening";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const word = DAY_PARTS[language][part];
  return language === "hi" ? `${word} ${h12}:${mm} बजे` : `${word} ${h12}:${mm} baje`;
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
 * Build the invitation wording.
 *
 * @param {object} input
 * @param {string} input.ceremony   One of CEREMONIES[].id
 * @param {string} input.hostSide   One of HOST_SIDES[].id
 * @param {string} input.hostNames  e.g. "Mr. & Mrs. Sharma"
 * @param {string} input.brideName
 * @param {string} input.groomName
 * @param {string} input.date       ISO "YYYY-MM-DD"
 * @param {string} input.time       24-hour "HH:MM"
 * @param {string} input.venue
 * @param {string} input.city
 * @param {string} input.rsvp       Optional phone or contact line
 * @param {string} input.language   One of LANGUAGES[].id
 * @param {string} input.style      One of STYLES[].id
 * @returns {{text:string, dateText:string, timeText:string, weekdayName:string, lang:string, lineCount:number}|{error:string}}
 */
export function buildInvitation({
  ceremony = "engagement",
  hostSide = "both",
  hostNames = "",
  brideName = "",
  groomName = "",
  date = "",
  time = "",
  venue = "",
  city = "",
  rsvp = "",
  language = "en",
  style = "traditional",
} = {}) {
  const ceremonyDef = findById(CEREMONIES, ceremony);
  const sideDef = findById(HOST_SIDES, hostSide);
  const languageDef = findById(LANGUAGES, language);
  const styleDef = findById(STYLES, style);

  if (!ceremonyDef) return { error: "Choose a ceremony type." };
  if (!sideDef) return { error: "Choose which family is inviting." };
  if (!languageDef) return { error: "Choose a language." };
  if (!styleDef) return { error: "Choose a wording style." };

  const hosts = cleanText(hostNames);
  const bride = cleanText(brideName);
  const groom = cleanText(groomName);
  const place = cleanText(venue);
  const town = cleanText(city);
  const contact = cleanText(rsvp);

  if (!bride) return { error: "Enter the bride's name." };
  if (!groom) return { error: "Enter the groom's name." };
  if (!hosts) return { error: "Enter the inviting family's name, e.g. Mr. & Mrs. Sharma." };
  if (!place) return { error: "Enter the venue." };

  for (const [label, value] of [
    ["family name", hosts],
    ["bride's name", bride],
    ["groom's name", groom],
    ["venue", place],
    ["city", town],
    ["RSVP line", contact],
  ]) {
    if (value.length > MAX_FIELD_LENGTH) {
      return { error: `Keep the ${label} under ${MAX_FIELD_LENGTH} characters.` };
    }
  }

  const parsedDate = parseIsoDate(date);
  if (parsedDate.error) return { error: parsedDate.error };
  const parsedTime = parseTime(time);
  if (parsedTime.error) return { error: parsedTime.error };

  const labels = LABELS[language];
  const dateText = formatDate(parsedDate, language);
  const timeText = formatTime(parsedTime, language);
  const venueText = town ? `${place}, ${town}` : place;
  const ceremonyName = ceremonyDef[language];

  const inviteLine = INVITE_LINES[language][hostSide]
    .replace("{hosts}", hosts)
    .replace("{ceremony}", ceremonyName)
    .replace("{bride}", bride)
    .replace("{groom}", groom);

  const { opening, closing } = STYLE_TEXT[language][style];
  const coupleLine = `${bride}  ${labels.and}  ${groom}`;
  const rsvpLine = contact ? `${labels.rsvp}: ${contact}` : "";

  let lines;
  if (style === "whatsapp") {
    lines = [
      inviteLine,
      `${labels.date}: ${dateText}  |  ${labels.time}: ${timeText}`,
      `${labels.venue}: ${venueText}`,
      closing,
    ];
    if (rsvpLine) lines.push(rsvpLine);
  } else {
    lines = [
      opening,
      "",
      inviteLine,
      "",
      coupleLine,
      "",
      `${labels.date}: ${dateText}`,
      `${labels.time}: ${timeText}`,
      "",
      `${labels.venue}: ${venueText}`,
      "",
      closing,
    ];
    if (rsvpLine) lines.push(rsvpLine);
  }

  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    text,
    dateText,
    timeText,
    weekdayName: WEEKDAY_NAMES[language][parsedDate.weekday],
    ceremonyName,
    lang: languageDef.lang,
    lineCount: text.split("\n").length,
  };
}
