/**
 * Baisakhi (Vaisakhi) greeting composer.
 *
 * Festival facts used here:
 *  - Vaisakhi is the first day of the month of Vaisakh and falls on 13 or 14 April in the
 *    Gregorian calendar. In Punjab it is the spring harvest festival, when the wheat is cut.
 *  - On Vaisakhi in 1699, Guru Gobind Singh founded the Khalsa at Anandpur Sahib and initiated
 *    the Panj Pyare, the five beloved ones. The day is therefore also Khalsa Sajna Diwas, and
 *    the anniversary number for any year is simply that year minus 1699.
 *  - The traditional greeting is "ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ"; the Sikh salutation is
 *    "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ".
 *
 * Message length is scored with the SMS rules in 3GPP TS 23.038: GSM-7 text gets 160 characters
 * single and 153 per part; Gurmukhi script forces UCS-2, giving 70 single and 67 per part.
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

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** The Khalsa was founded on Vaisakhi in this year at Anandpur Sahib. */
export const KHALSA_FOUNDING_YEAR = 1699;

/** Number of the Panj Pyare initiated that day. */
export const PANJ_PYARE_COUNT = 5;

/** Vaisakhi lands on one of these two Gregorian dates. */
export const VAISAKHI_POSSIBLE_DAYS = [13, 14];

export const TONES = [
  { id: "khalsa", label: "Khalsa Sajna Diwas — Sikh salutation" },
  { id: "harvest", label: "Harvest and family — warm" },
  { id: "formal", label: "Formal — clients, notices, elders" },
  { id: "short", label: "Short — status, caption, card" },
];

export const EMOJI = "🌾🥁";

export const MESSAGES = {
  khalsa: {
    gurmukhi:
      "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ। ਖਾਲਸਾ ਸਾਜਨਾ ਦਿਵਸ ਅਤੇ ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ।",
    roman:
      "Waheguru ji ka Khalsa, Waheguru ji ki Fateh. Khalsa Sajna Diwas ate Vaisakhi diyan lakh lakh vadhaiyan.",
    english:
      "Waheguru ji ka Khalsa, Waheguru ji ki Fateh. Warmest wishes on Vaisakhi and on the founding of the Khalsa.",
  },
  harvest: {
    gurmukhi: "ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਨਵੀਂ ਫ਼ਸਲ ਵਾਂਗ ਤੁਹਾਡੇ ਘਰ ਖੁਸ਼ੀਆਂ ਦੀ ਬਹਾਰ ਆਵੇ।",
    roman: "Vaisakhi diyan lakh lakh vadhaiyan! Navin fasal vaang tuhade ghar khushiyan di bahaar aave.",
    english: "Happy Vaisakhi! May your home fill with joy the way the fields fill with the new harvest.",
  },
  formal: {
    gurmukhi: "ਤੁਹਾਨੂੰ ਅਤੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਵਿਸਾਖੀ ਦੀਆਂ ਦਿਲੋਂ ਵਧਾਈਆਂ।",
    roman: "Tuhanu ate tuhade parivaar nu Vaisakhi diyan dilon vadhaiyan.",
    english: "Heartfelt Vaisakhi greetings to you and your family.",
  },
  short: {
    gurmukhi: "ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ!",
    roman: "Vaisakhi diyan lakh lakh vadhaiyan!",
    english: "Happy Vaisakhi!",
  },
};

export const MAX_NAME_LENGTH = 40;

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * Vaisakhi date and Khalsa anniversary for a year.
 * @returns {object} details, or { error }.
 */
export function computeVaisakhiDetails({ year, vaisakhiDay = 14 } = {}) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < KHALSA_FOUNDING_YEAR || y > 2200) {
    return { error: `Enter a year between ${KHALSA_FOUNDING_YEAR} and 2200.` };
  }
  const day = Number(vaisakhiDay);
  if (!VAISAKHI_POSSIBLE_DAYS.includes(day)) {
    return { error: "Vaisakhi falls on 13 or 14 April — pick one." };
  }

  const stamp = Date.UTC(y, 3, day);
  const date = new Date(stamp);

  return {
    year: y,
    date: date.toISOString().slice(0, 10),
    weekday: WEEKDAYS[date.getUTCDay()],
    khalsaAnniversary: y - KHALSA_FOUNDING_YEAR,
    khalsaFoundingYear: KHALSA_FOUNDING_YEAR,
    panjPyare: PANJ_PYARE_COUNT,
  };
}

/**
 * Compose one Baisakhi greeting.
 * @returns {object} greeting, or { error }.
 */
export function buildBaisakhiWish({
  tone = "harvest",
  includeGurmukhi = true,
  includeRoman = true,
  includeEnglish = false,
  recipient = "",
  sender = "",
  includeEmoji = false,
} = {}) {
  const toneEntry = TONES.find((item) => item.id === tone);
  if (!toneEntry) return { error: "Choose one of the four greeting styles." };

  const message = MESSAGES[tone];
  if (!message) return { error: "That greeting style is not available yet." };

  if (!includeGurmukhi && !includeRoman && !includeEnglish) {
    return { error: "Keep at least one of Gurmukhi, Roman or English switched on." };
  }

  const to = cleanName(recipient);
  const from = cleanName(sender);

  const lines = [];
  if (to) lines.push(`${to},`);
  if (includeGurmukhi) lines.push(includeEmoji ? `${message.gurmukhi} ${EMOJI}` : message.gurmukhi);
  if (includeRoman) lines.push(includeGurmukhi ? `(${message.roman})` : message.roman);
  if (includeEnglish) lines.push(message.english);
  // A hyphen keeps an English-only greeting inside the GSM-7 alphabet; an em dash would not.
  if (from) lines.push(`- ${from}`);

  const text = lines.join("\n");

  return {
    text,
    lines,
    tone,
    toneLabel: toneEntry.label,
    gurmukhi: message.gurmukhi,
    roman: message.roman,
    english: message.english,
    characters: [...text].length,
    words: text.split(/\s+/).filter(Boolean).length,
    sms: analyzeSms(text),
  };
}

/** One greeting per style, for side-by-side comparison. */
export function buildBaisakhiWishSet(options = {}) {
  const results = [];
  for (const tone of TONES) {
    const wish = buildBaisakhiWish({ ...options, tone: tone.id });
    if (!wish.error) results.push(wish);
  }
  return results;
}
