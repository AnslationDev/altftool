/**
 * Onam greeting composer and ten-day schedule builder.
 *
 * Festival facts used here:
 *  - Onam is the Malayalam harvest festival kept in Chingam, the first month of the Kollam era
 *    calendar, which falls across August and September in the Gregorian calendar.
 *  - It runs ten days, named after the nakshatra of each day: Atham, Chithira, Chodhi, Vishakam,
 *    Anizham, Thriketa, Moolam, Pooradam, Uthradam and Thiruvonam. Thiruvonam is the main day.
 *  - The pookkalam is started on Atham and grows a ring a day; Uthradam, the day before
 *    Thiruvonam, is the big shopping and preparation day; the Onam sadya is served on
 *    Thiruvonam on a banana leaf.
 *  - The festival marks the annual homecoming of King Mahabali.
 *
 * The Gregorian date of Thiruvonam is fixed by the nakshatra, so it is taken as an input rather
 * than guessed: give the tool the Thiruvonam date from a panchangam and it dates the other nine
 * days by simple offsets.
 *
 * Message length is scored with the SMS rules in 3GPP TS 23.038: GSM-7 text gets 160 characters
 * single and 153 per part; Malayalam script forces UCS-2, giving 70 single and 67 per part.
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

/** The ten days, with the offset in days from Thiruvonam. */
export const ONAM_DAYS = [
  { day: 1, name: "Atham", malayalam: "അത്തം", offset: -9, note: "The pookkalam is laid for the first time." },
  { day: 2, name: "Chithira", malayalam: "ചിത്തിര", offset: -8, note: "A second ring is added to the pookkalam." },
  { day: 3, name: "Chodhi", malayalam: "ചോതി", offset: -7, note: "Shopping for new clothes begins." },
  { day: 4, name: "Vishakam", malayalam: "വിശാഖം", offset: -6, note: "Sadya preparations and market days start." },
  { day: 5, name: "Anizham", malayalam: "അനിഴം", offset: -5, note: "Vallamkali snake-boat races in the backwaters." },
  { day: 6, name: "Thriketa", malayalam: "തൃക്കേട്ട", offset: -4, note: "Families begin travelling home." },
  { day: 7, name: "Moolam", malayalam: "മൂലം", offset: -3, note: "Smaller sadyas are served in temples." },
  { day: 8, name: "Pooradam", malayalam: "പൂരാടം", offset: -2, note: "Clay figures of Mahabali are set in the courtyard." },
  { day: 9, name: "Uthradam", malayalam: "ഉത്രാടം", offset: -1, note: "First Onam — the big preparation and shopping day." },
  { day: 10, name: "Thiruvonam", malayalam: "തിരുവോണം", offset: 0, note: "The main day: sadya on a banana leaf and Mahabali's homecoming." },
];

export const RELATIONSHIPS = [
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
  { id: "colleagues", label: "Colleagues and team" },
  { id: "clients", label: "Clients and business contacts" },
  { id: "teachers", label: "Teachers and mentors" },
  { id: "neighbours", label: "Neighbours" },
];

export const TONES = [
  { id: "warm", label: "Warm — everyday, affectionate" },
  { id: "respectful", label: "Respectful — formal 'thankal' address" },
  { id: "short", label: "Short — status, caption, gift tag" },
];

export const EMOJI = "🌼🛶";

/** The short greeting does not change with the relationship, so it is shared. */
export const SHORT_MESSAGE = {
  malayalam: "ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ!",
  roman: "Hridayam niranja Onashamsakal!",
  english: "Heartfelt Onam wishes!",
};

export const MESSAGES = {
  family: {
    warm: {
      malayalam: "ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ! ഈ ഓണം നമ്മുടെ വീട്ടിൽ സ്നേഹവും സമൃദ്ധിയും നിറയ്ക്കട്ടെ.",
      roman: "Hridayam niranja Onashamsakal! Ee Onam nammude veettil snehavum samruddhiyum niraykkatte.",
      english: "Heartfelt Onam wishes! May this Onam fill our home with love and plenty.",
    },
    respectful: {
      malayalam: "താങ്കൾക്കും കുടുംബത്തിനും ഹൃദയംഗമമായ ഓണാശംസകൾ.",
      roman: "Thankalkkum kudumbathinum hridayangamamaya Onashamsakal.",
      english: "Warm Onam greetings to you and your family.",
    },
  },
  friends: {
    warm: {
      malayalam: "ഓണാശംസകൾ! സദ്യയും പൂക്കളവും ചിരിയും നിറഞ്ഞ ഒരു ഓണം ആശംസിക്കുന്നു.",
      roman: "Onashamsakal! Sadyayum pookkalavum chiriyum niranja oru Onam aashamsikkunnu.",
      english: "Happy Onam! Wishing you a day full of sadya, pookkalam and laughter.",
    },
    respectful: {
      malayalam: "താങ്കൾക്ക് ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ. ഈ ഓണം സന്തോഷത്തിന്റേതാകട്ടെ.",
      roman: "Thankalkku hridayam niranja Onashamsakal. Ee Onam santhoshathintethaakatte.",
      english: "Heartfelt Onam wishes to you. May this Onam be a happy one.",
    },
  },
  colleagues: {
    warm: {
      malayalam: "ഓണാശംസകൾ! ഈ ഓണം നിങ്ങൾക്ക് വിശ്രമവും പുതിയ ഊർജവും നൽകട്ടെ.",
      roman: "Onashamsakal! Ee Onam ningalkku vishramavum puthiya oorjavum nalkatte.",
      english: "Happy Onam! May the break bring you rest and fresh energy.",
    },
    respectful: {
      malayalam: "ടീമിലെ എല്ലാവർക്കും ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ.",
      roman: "Teamile ellavarkkum hridayam niranja Onashamsakal.",
      english: "Heartfelt Onam wishes to everyone on the team.",
    },
  },
  clients: {
    warm: {
      malayalam: "ഓണാശംസകൾ! ഈ വർഷം താങ്കളുടെ ബിസിനസ്സിന് സമൃദ്ധി നൽകട്ടെ.",
      roman: "Onashamsakal! Ee varsham thankalude businessinu samruddhi nalkatte.",
      english: "Happy Onam! May the year ahead bring prosperity to your business.",
    },
    respectful: {
      malayalam: "താങ്കൾക്കും കുടുംബത്തിനും ഹൃദയംഗമമായ ഓണാശംസകൾ. ഈ വർഷം സമൃദ്ധിയുടേതാകട്ടെ.",
      roman: "Thankalkkum kudumbathinum hridayangamamaya Onashamsakal. Ee varsham samruddhiyudethaakatte.",
      english: "Warm Onam greetings to you and your family. May this year be a prosperous one.",
    },
  },
  teachers: {
    warm: {
      malayalam: "ഗുരുവിന് ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ. താങ്കളുടെ വീട്ടിൽ ഐശ്വര്യം നിറയട്ടെ.",
      roman: "Guruvinu hridayam niranja Onashamsakal. Thankalude veettil aishwaryam nirayatte.",
      english: "Heartfelt Onam wishes to my teacher. May your home be filled with prosperity.",
    },
    respectful: {
      malayalam: "താങ്കൾക്ക് ആദരവോടെ ഓണാശംസകൾ. നന്ദിയോടെ ഓർക്കുന്നു.",
      roman: "Thankalkku aadaravode Onashamsakal. Nandiyode orkkunnu.",
      english: "Respectful Onam greetings to you, remembered with gratitude.",
    },
  },
  neighbours: {
    warm: {
      malayalam: "ഓണാശംസകൾ! ഈ ഓണത്തിന് പൂക്കളവും സദ്യയും ഒരുമിച്ച് ആഘോഷിക്കാം.",
      roman: "Onashamsakal! Ee Onathinu pookkalavum sadyayum orumichu aaghoshikkam.",
      english: "Happy Onam! Let us lay the pookkalam and share the sadya together this year.",
    },
    respectful: {
      malayalam: "താങ്കൾക്കും വീട്ടുകാർക്കും ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ.",
      roman: "Thankalkkum veettukaarkkum hridayam niranja Onashamsakal.",
      english: "Heartfelt Onam wishes to you and everyone at home.",
    },
  },
};

export const MAX_NAME_LENGTH = 40;

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/** "YYYY-MM-DD" -> UTC timestamp, or null when the date does not exist. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
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

/**
 * The ten days of Onam. Pass the Thiruvonam date to get calendar dates as well as offsets.
 * @param {string} [thiruvonamIso] "YYYY-MM-DD" from a panchangam; blank returns offsets only.
 * @returns {object} schedule, or { error } when a date is supplied but unusable.
 */
export function computeOnamSchedule(thiruvonamIso = "") {
  const raw = typeof thiruvonamIso === "string" ? thiruvonamIso.trim() : "";
  let stamp = null;
  if (raw) {
    stamp = parseIsoDate(raw);
    if (stamp === null) return { error: "Enter the Thiruvonam date as YYYY-MM-DD." };
  }

  const schedule = ONAM_DAYS.map((entry) => {
    if (stamp === null) {
      return { ...entry, date: "", weekday: "" };
    }
    const dayStamp = stamp + entry.offset * MS_PER_DAY;
    const date = new Date(dayStamp);
    return {
      ...entry,
      date: date.toISOString().slice(0, 10),
      weekday: WEEKDAYS[date.getUTCDay()],
    };
  });

  return {
    dated: stamp !== null,
    thiruvonam: stamp === null ? "" : schedule[schedule.length - 1].date,
    atham: stamp === null ? "" : schedule[0].date,
    totalDays: ONAM_DAYS.length,
    schedule,
  };
}

/**
 * Compose one Onam greeting.
 * @returns {object} greeting, or { error }.
 */
export function buildOnamWish({
  relationship = "family",
  tone = "warm",
  includeMalayalam = true,
  includeRoman = true,
  includeEnglish = false,
  recipient = "",
  sender = "",
  includeEmoji = false,
} = {}) {
  const relationshipEntry = RELATIONSHIPS.find((item) => item.id === relationship);
  if (!relationshipEntry) return { error: "Choose who the greeting is for." };
  const toneEntry = TONES.find((item) => item.id === tone);
  if (!toneEntry) return { error: "Choose a warm, respectful or short tone." };

  const message = tone === "short" ? SHORT_MESSAGE : MESSAGES[relationship]?.[tone];
  if (!message) return { error: "That combination is not available yet." };

  if (!includeMalayalam && !includeRoman && !includeEnglish) {
    return { error: "Keep at least one of Malayalam, transliteration or English switched on." };
  }

  const to = cleanName(recipient);
  const from = cleanName(sender);

  const lines = [];
  if (to) lines.push(`${to},`);
  if (includeMalayalam) lines.push(includeEmoji ? `${message.malayalam} ${EMOJI}` : message.malayalam);
  if (includeRoman) lines.push(includeMalayalam ? `(${message.roman})` : message.roman);
  if (includeEnglish) lines.push(message.english);
  // A hyphen keeps an English-only greeting inside the GSM-7 alphabet; an em dash would not.
  if (from) lines.push(`- ${from}`);

  const text = lines.join("\n");

  return {
    text,
    lines,
    relationship: relationshipEntry.id,
    relationshipLabel: relationshipEntry.label,
    tone,
    toneLabel: toneEntry.label,
    malayalam: message.malayalam,
    roman: message.roman,
    english: message.english,
    characters: [...text].length,
    words: text.split(/\s+/).filter(Boolean).length,
    sms: analyzeSms(text),
  };
}

/** One greeting per tone for the chosen relationship. */
export function buildOnamWishSet(options = {}) {
  const results = [];
  for (const tone of TONES) {
    const wish = buildOnamWish({ ...options, tone: tone.id });
    if (!wish.error) results.push(wish);
  }
  return results;
}
