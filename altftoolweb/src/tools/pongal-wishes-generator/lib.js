/**
 * Pongal greeting composer and four-day schedule builder.
 *
 * Festival facts used here:
 *  - Pongal is the Tamil harvest festival that opens the month of Thai, when the sun moves into
 *    Makara. Thai 1 falls on 14 or 15 January in the Gregorian calendar.
 *  - The festival runs four days in order: Bhogi (the last day of Margazhi), Thai Pongal (the
 *    main day, when the pot of new rice and milk is allowed to boil over to the shout of
 *    "Pongalo Pongal"), Maattu Pongal (thanks to the cattle) and Kaanum Pongal (visiting).
 *  - The traditional line "Thai pirandhaal vazhi pirakkum" — when Thai is born, a way is born —
 *    is the phrase most often used on the main day.
 *
 * Message length is scored with the SMS rules in 3GPP TS 23.038: GSM-7 text gets 160 characters
 * single and 153 per concatenated part; Tamil script forces UCS-2, which gives 70 single and 67
 * per part.
 *
 * Pure module: no DOM, no React, no clock reads.
 */

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";
const GSM7_BASIC_SET = new Set([...GSM7_BASIC]);
const GSM7_EXTENDED_SET = new Set([...GSM7_EXTENDED]);

export const SMS_GSM7_SINGLE = 160;
export const SMS_GSM7_CONCAT = 153;
export const SMS_UCS2_SINGLE = 70;
export const SMS_UCS2_CONCAT = 67;

/** Score a message the way a mobile network does. */
export function analyzeSms(text) {
  const value = typeof text === "string" ? text : "";
  let septets = 0;
  let gsm = true;
  for (const char of value) {
    if (GSM7_BASIC_SET.has(char)) septets += 1;
    else if (GSM7_EXTENDED_SET.has(char)) septets += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (gsm) {
    const segments = septets <= SMS_GSM7_SINGLE ? 1 : Math.ceil(septets / SMS_GSM7_CONCAT);
    const perSegment = segments === 1 ? SMS_GSM7_SINGLE : SMS_GSM7_CONCAT;
    return {
      encoding: "GSM-7",
      units: septets,
      segments: Math.max(1, segments),
      perSegment,
      remaining: Math.max(0, perSegment * Math.max(1, segments) - septets),
    };
  }
  const units = value.length;
  const segments = units <= SMS_UCS2_SINGLE ? 1 : Math.ceil(units / SMS_UCS2_CONCAT);
  const perSegment = segments === 1 ? SMS_UCS2_SINGLE : SMS_UCS2_CONCAT;
  return {
    encoding: "UCS-2",
    units,
    segments: Math.max(1, segments),
    perSegment,
    remaining: Math.max(0, perSegment * Math.max(1, segments) - units),
  };
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function isoAndWeekday(stamp) {
  const date = new Date(stamp);
  return { date: date.toISOString().slice(0, 10), weekday: WEEKDAYS[date.getUTCDay()] };
}

/** Thai 1 lands on one of these two Gregorian dates. */
export const THAI_POSSIBLE_DAYS = [14, 15];

export const DAYS = [
  {
    id: "bhogi",
    label: "Bhogi",
    tamilLabel: "போகி",
    offset: -1,
    about: "Last day of Margazhi. Old things are cleared out and a bonfire is lit at dawn.",
  },
  {
    id: "thai",
    label: "Thai Pongal",
    tamilLabel: "தைப்பொங்கல்",
    offset: 0,
    about:
      "The main day. New rice and milk are boiled in a fresh pot until they spill over, to the shout of Pongalo Pongal.",
  },
  {
    id: "maattu",
    label: "Maattu Pongal",
    tamilLabel: "மாட்டுப் பொங்கல்",
    offset: 1,
    about: "Thanks to the cattle that work the land; the day of decorated horns and, in some districts, jallikattu.",
  },
  {
    id: "kaanum",
    label: "Kaanum Pongal",
    tamilLabel: "காணும் பொங்கல்",
    offset: 2,
    about: "The visiting day, spent calling on relatives and heading out with the family.",
  },
];

export const TONES = [
  { id: "traditional", label: "Traditional — proverb and old phrasing" },
  { id: "warm", label: "Warm — family and friends" },
  { id: "formal", label: "Formal — elders, clients, notices" },
  { id: "short", label: "Short — status and captions" },
];

export const EMOJI = "🌾🪔";

/** Greeting text by day and tone, in Tamil, Roman transliteration and English. */
export const MESSAGES = {
  bhogi: {
    traditional: {
      tamil: "போகிப் பண்டிகை நல்வாழ்த்துக்கள்! பழையன கழிந்து புதியன புகுக.",
      roman: "Bhogi pandigai nalvazhthukkal! Pazhaiyana kazhindhu pudhiyana puguga.",
      english: "Happy Bhogi! May the old make way for the new.",
    },
    warm: {
      tamil: "இனிய போகி வாழ்த்துக்கள்! பழையவை போகட்டும், புதிய மகிழ்ச்சி வரட்டும்.",
      roman: "Iniya Bhogi vazhthukkal! Pazhaiyavai pogattum, pudhiya magizhchi varattum.",
      english: "Happy Bhogi! Let the old go and the new joy come in.",
    },
    formal: {
      tamil: "தங்களுக்கும் தங்கள் குடும்பத்தினருக்கும் இனிய போகி நல்வாழ்த்துக்கள்.",
      roman: "Thangalukkum thangal kudumbathinarukkum iniya Bhogi nalvazhthukkal.",
      english: "Warm Bhogi greetings to you and your family.",
    },
    short: {
      tamil: "இனிய போகி நல்வாழ்த்துக்கள்!",
      roman: "Iniya Bhogi nalvazhthukkal!",
      english: "Happy Bhogi!",
    },
  },
  thai: {
    traditional: {
      tamil: "பொங்கலோ பொங்கல்! தை பிறந்தால் வழி பிறக்கும். இனிய தைப்பொங்கல் நல்வாழ்த்துக்கள்!",
      roman: "Pongalo Pongal! Thai pirandhaal vazhi pirakkum. Iniya Thai Pongal nalvazhthukkal!",
      english: "Pongalo Pongal! When Thai is born, a way is born. Happy Thai Pongal!",
    },
    warm: {
      tamil: "இனிய பொங்கல் நல்வாழ்த்துக்கள்! பால் பொங்குவது போல் உங்கள் வாழ்விலும் மகிழ்ச்சி பொங்கட்டும்.",
      roman:
        "Iniya Pongal nalvazhthukkal! Paal ponguvadhu pol ungal vazhvilum magizhchi pongattum.",
      english: "Happy Pongal! May joy rise and spill over in your life the way the milk does in the pot.",
    },
    formal: {
      tamil: "தங்களுக்கும் தங்கள் குடும்பத்தினருக்கும் இனிய தைப்பொங்கல் நல்வாழ்த்துக்கள்.",
      roman: "Thangalukkum thangal kudumbathinarukkum iniya Thai Pongal nalvazhthukkal.",
      english: "Warm Thai Pongal greetings to you and your family.",
    },
    short: {
      tamil: "இனிய பொங்கல் நல்வாழ்த்துக்கள்!",
      roman: "Iniya Pongal nalvazhthukkal!",
      english: "Happy Pongal!",
    },
  },
  maattu: {
    traditional: {
      tamil: "இனிய மாட்டுப் பொங்கல் வாழ்த்துக்கள்! உழவுக்கும் தொழிலுக்கும் வந்தனை செய்வோம்.",
      roman: "Iniya Maattu Pongal vazhthukkal! Uzhavukkum thozhilukkum vandhanai seivom.",
      english: "Happy Maattu Pongal! Let us salute the plough and the work of the hands.",
    },
    warm: {
      tamil: "இனிய மாட்டுப் பொங்கல் வாழ்த்துக்கள்! நம் வாழ்வுக்கு உழைக்கும் அனைவருக்கும் நன்றி.",
      roman: "Iniya Maattu Pongal vazhthukkal! Nam vazhvukku uzhaikkum anaivarukkum nandri.",
      english: "Happy Maattu Pongal! Thanks to every creature and every hand that works for our table.",
    },
    formal: {
      tamil: "தங்களுக்கும் தங்கள் குடும்பத்தினருக்கும் இனிய மாட்டுப் பொங்கல் வாழ்த்துக்கள்.",
      roman: "Thangalukkum thangal kudumbathinarukkum iniya Maattu Pongal vazhthukkal.",
      english: "Warm Maattu Pongal greetings to you and your family.",
    },
    short: {
      tamil: "இனிய மாட்டுப் பொங்கல் வாழ்த்துக்கள்!",
      roman: "Iniya Maattu Pongal vazhthukkal!",
      english: "Happy Maattu Pongal!",
    },
  },
  kaanum: {
    traditional: {
      tamil: "இனிய காணும் பொங்கல் வாழ்த்துக்கள்! உறவுகளைக் காண்பதே இந்நாளின் சிறப்பு.",
      roman: "Iniya Kaanum Pongal vazhthukkal! Uravugalai kaanbadhe innaalin sirappu.",
      english: "Happy Kaanum Pongal! The whole point of the day is going to see your people.",
    },
    warm: {
      tamil: "இனிய காணும் பொங்கல் வாழ்த்துக்கள்! இன்று அனைவரையும் சந்தித்து மகிழுங்கள்.",
      roman: "Iniya Kaanum Pongal vazhthukkal! Indru anaivaraiyum sandhithu magizhungal.",
      english: "Happy Kaanum Pongal! Go and meet everyone today.",
    },
    formal: {
      tamil: "தங்களுக்கும் தங்கள் குடும்பத்தினருக்கும் இனிய காணும் பொங்கல் வாழ்த்துக்கள்.",
      roman: "Thangalukkum thangal kudumbathinarukkum iniya Kaanum Pongal vazhthukkal.",
      english: "Warm Kaanum Pongal greetings to you and your family.",
    },
    short: {
      tamil: "இனிய காணும் பொங்கல் வாழ்த்துக்கள்!",
      roman: "Iniya Kaanum Pongal vazhthukkal!",
      english: "Happy Kaanum Pongal!",
    },
  },
};

export const MAX_NAME_LENGTH = 40;

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * The four dates of Pongal for a year, given which January date Thai Pongal falls on.
 * @returns {object} schedule, or { error }.
 */
export function computePongalSchedule({ year, thaiPongalDay = 14 } = {}) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1900 || y > 2200) {
    return { error: "Enter a year between 1900 and 2200." };
  }
  const day = Number(thaiPongalDay);
  if (!THAI_POSSIBLE_DAYS.includes(day)) {
    return { error: "Thai Pongal falls on 14 or 15 January — pick one." };
  }

  const main = Date.UTC(y, 0, day);
  const schedule = DAYS.map((entry) => {
    const stamp = main + entry.offset * MS_PER_DAY;
    const { date, weekday } = isoAndWeekday(stamp);
    return {
      id: entry.id,
      label: entry.label,
      tamilLabel: entry.tamilLabel,
      about: entry.about,
      date,
      weekday,
    };
  });

  return { year: y, thaiPongalDay: day, schedule };
}

/**
 * Compose one Pongal greeting.
 *
 * @param {object} input
 * @param {string} input.day        One of DAYS ids.
 * @param {string} input.tone       One of TONES ids.
 * @param {boolean} [input.includeTamil]
 * @param {boolean} [input.includeRoman]
 * @param {boolean} [input.includeEnglish]
 * @param {string} [input.recipient]
 * @param {string} [input.sender]
 * @param {boolean} [input.includeEmoji]
 * @returns {object} greeting, or { error }.
 */
export function buildPongalWish({
  day = "thai",
  tone = "traditional",
  includeTamil = true,
  includeRoman = true,
  includeEnglish = false,
  recipient = "",
  sender = "",
  includeEmoji = false,
} = {}) {
  const dayEntry = DAYS.find((item) => item.id === day);
  if (!dayEntry) return { error: "Choose one of the four days of Pongal." };
  const toneEntry = TONES.find((item) => item.id === tone);
  if (!toneEntry) return { error: "Choose one of the four tones." };

  const message = MESSAGES[day]?.[tone];
  if (!message) return { error: "That combination is not available yet." };

  if (!includeTamil && !includeRoman && !includeEnglish) {
    return { error: "Keep at least one of Tamil, transliteration or English switched on." };
  }

  const to = cleanName(recipient);
  const from = cleanName(sender);

  const lines = [];
  if (to) lines.push(`${to},`);
  if (includeTamil) lines.push(includeEmoji ? `${message.tamil} ${EMOJI}` : message.tamil);
  if (includeRoman) lines.push(includeTamil ? `(${message.roman})` : message.roman);
  if (includeEnglish) lines.push(message.english);
  // A hyphen keeps an English-only greeting inside the GSM-7 alphabet; an em dash would not.
  if (from) lines.push(`- ${from}`);

  const text = lines.join("\n");

  return {
    text,
    lines,
    day: dayEntry.id,
    dayLabel: dayEntry.label,
    dayTamil: dayEntry.tamilLabel,
    dayAbout: dayEntry.about,
    tone,
    toneLabel: toneEntry.label,
    tamil: message.tamil,
    roman: message.roman,
    english: message.english,
    characters: [...text].length,
    words: text.split(/\s+/).filter(Boolean).length,
    sms: analyzeSms(text),
  };
}

/** One greeting per tone for the chosen day. */
export function buildPongalWishSet(options = {}) {
  const results = [];
  for (const tone of TONES) {
    const wish = buildPongalWish({ ...options, tone: tone.id });
    if (!wish.error) results.push(wish);
  }
  return results;
}
