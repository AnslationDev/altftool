/**
 * Independence Day message generator — pure logic, no React and no DOM.
 *
 * Fixed anchors used here:
 *  - India became independent on 15 August 1947; that was the 1st Independence Day.
 *  - Therefore the Independence Day number for a year = year - 1946.
 *  - The tricolour was adopted by the Constituent Assembly on 22 July 1947.
 * Nothing reads the system clock; the year is always supplied by the caller.
 */

export const INDEPENDENCE_DAY_DATE = "15 August";
/** Year of the first Independence Day. */
export const FIRST_INDEPENDENCE_DAY_YEAR = 1947;
/** Date the Constituent Assembly adopted the national flag. */
export const FLAG_ADOPTED = "22 July 1947";

export const MIN_YEAR = FIRST_INDEPENDENCE_DAY_YEAR;
export const MAX_YEAR = 2200;
export const MAX_COUNT = 8;
export const MAX_NAME_LENGTH = 40;

export const HASHTAGS = "#IndependenceDay #15August #JaiHind";

export const FORMATS = [
  { id: "wish", label: "Wish message" },
  { id: "caption", label: "Short caption" },
  { id: "slogan", label: "Slogan card" },
];

export const TONES = [
  { id: "patriotic", label: "Patriotic" },
  { id: "formal", label: "Formal" },
  { id: "warm", label: "Warm & simple" },
];

/**
 * Greeting and sign-off lines in each language, written in the native script.
 * `label` is the English name, `native` the endonym.
 */
export const LANGUAGES = [
  {
    id: "en",
    label: "English",
    native: "English",
    greetings: ["Happy Independence Day, {name}!", "{name}, a very happy {ordinal} Independence Day to you."],
    signoffs: ["Jai Hind.", "Happy 15 August!"],
  },
  {
    id: "hi",
    label: "Hindi",
    native: "हिन्दी",
    greetings: [
      "{name}, स्वतंत्रता दिवस की हार्दिक शुभकामनाएं!",
      "{name} जी, {n}वें स्वतंत्रता दिवस की हार्दिक बधाई।",
    ],
    signoffs: ["जय हिन्द।", "वंदे मातरम्।"],
  },
  {
    id: "mr",
    label: "Marathi",
    native: "मराठी",
    greetings: [
      "{name}, स्वातंत्र्य दिनाच्या हार्दिक शुभेच्छा!",
      "{name}, {n}व्या स्वातंत्र्य दिनाच्या मनःपूर्वक शुभेच्छा.",
    ],
    signoffs: ["जय हिंद.", "वंदे मातरम्."],
  },
  {
    id: "bn",
    label: "Bengali",
    native: "বাংলা",
    greetings: [
      "{name}, স্বাধীনতা দিবসের আন্তরিক শুভেচ্ছা!",
      "{name}, {n}তম স্বাধীনতা দিবসের শুভেচ্ছা রইল।",
    ],
    signoffs: ["জয় হিন্দ।", "বন্দে মাতরম্।"],
  },
  {
    id: "gu",
    label: "Gujarati",
    native: "ગુજરાતી",
    greetings: [
      "{name}, સ્વતંત્રતા દિવસની હાર્દિક શુભેચ્છા!",
      "{name}, {n}મા સ્વતંત્રતા દિવસની ખૂબ ખૂબ શુભકામનાઓ.",
    ],
    signoffs: ["જય હિંદ.", "વંદે માતરમ્."],
  },
  {
    id: "pa",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    greetings: [
      "{name}, ਆਜ਼ਾਦੀ ਦਿਹਾੜੇ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ!",
      "{name}, {n}ਵੇਂ ਆਜ਼ਾਦੀ ਦਿਹਾੜੇ ਦੀਆਂ ਦਿਲੋਂ ਮੁਬਾਰਕਾਂ।",
    ],
    signoffs: ["ਜੈ ਹਿੰਦ।", "ਵੰਦੇ ਮਾਤਰਮ।"],
  },
  {
    id: "ta",
    label: "Tamil",
    native: "தமிழ்",
    greetings: [
      "{name}, சுதந்திர தின நல்வாழ்த்துக்கள்!",
      "{name}, {n}ஆவது சுதந்திர தினத்தின் இனிய வாழ்த்துக்கள்.",
    ],
    signoffs: ["ஜெய் ஹிந்த்.", "வந்தே மாதரம்."],
  },
  {
    id: "te",
    label: "Telugu",
    native: "తెలుగు",
    greetings: [
      "{name}, స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు!",
      "{name}, {n}వ స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు.",
    ],
    signoffs: ["జై హింద్.", "వందే మాతరం."],
  },
  {
    id: "kn",
    label: "Kannada",
    native: "ಕನ್ನಡ",
    greetings: [
      "{name}, ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆಯ ಶುಭಾಶಯಗಳು!",
      "{name}, {n}ನೇ ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆಯ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು.",
    ],
    signoffs: ["ಜೈ ಹಿಂದ್.", "ವಂದೇ ಮಾತರಂ."],
  },
  {
    id: "ml",
    label: "Malayalam",
    native: "മലയാളം",
    greetings: [
      "{name}, സ്വാതന്ത്ര്യ ദിനാശംസകൾ!",
      "{name}, {n}-ാം സ്വാതന്ത്ര്യ ദിനത്തിന്റെ ഹൃദയംഗമമായ ആശംസകൾ.",
    ],
    signoffs: ["ജയ് ഹിന്ദ്.", "വന്ദേ മാതരം."],
  },
  {
    id: "ur",
    label: "Urdu",
    native: "اردو",
    greetings: ["{name}, یومِ آزادی مبارک ہو!", "{name}, {n}ویں یومِ آزادی کی دلی مبارکباد۔"],
    signoffs: ["جے ہند۔", "وندے ماترم۔"],
  },
];

/** English body lines by tone — used under the native greeting line. */
export const BODIES = [
  {
    tone: "patriotic",
    text: "On 15 August 1947 the flag went up on a country that had spent ninety years fighting for the right to raise it.",
  },
  {
    tone: "patriotic",
    text: "Freedom was not a gift; it was paid for, and the least any of us can do is use it well.",
  },
  {
    tone: "formal",
    text: "Wishing you and your family a proud and peaceful Independence Day as the nation completes {years} years of freedom.",
  },
  {
    tone: "formal",
    text: "The tricolour adopted on 22 July 1947 still stands for the same three things: courage, peace and growth.",
  },
  {
    tone: "warm",
    text: "Flags on the balcony, sweets after the flag hoisting, and a holiday that everyone actually agrees on.",
  },
  {
    tone: "warm",
    text: "Here is to a long weekend, a good breakfast and a country that never stops surprising you.",
  },
];

/** Short English taglines for the caption format. */
export const TAGLINES = [
  { tone: "patriotic", text: "{ordinal} Independence Day. Free since 15 August 1947." },
  { tone: "patriotic", text: "Three colours, one promise, and {years} years of keeping it." },
  { tone: "formal", text: "Commemorating {ordinal} Independence Day of India, 15 August." },
  { tone: "formal", text: "15 August 1947 — the day the republic began its own story." },
  { tone: "warm", text: "Tricolour up, chai in hand. Happy Independence Day." },
  { tone: "warm", text: "Happy 15 August from our home to yours." },
];

/**
 * Freedom-movement slogans with their meaning and the person or text they are
 * attributed to. Short historical slogans, each credited to its source.
 */
export const SLOGANS = [
  {
    slogan: "Jai Hind",
    meaning: "Victory to India",
    source: "Popularised by Subhas Chandra Bose and the Indian National Army in the 1940s",
  },
  {
    slogan: "Inquilab Zindabad",
    meaning: "Long live the revolution",
    source: "Coined by the poet Hasrat Mohani and made famous by Bhagat Singh and the HSRA in 1929",
  },
  {
    slogan: "Vande Mataram",
    meaning: "I bow to thee, Mother",
    source: "From Bankim Chandra Chattopadhyay's 1882 novel Anandamath",
  },
  {
    slogan: "Satyameva Jayate",
    meaning: "Truth alone triumphs",
    source: "From the Mundaka Upanishad; adopted as India's national motto on 26 January 1950",
  },
  {
    slogan: "Do or Die",
    meaning: "Karo ya maro — act decisively or perish",
    source: "Mahatma Gandhi, Quit India speech, 8 August 1942",
  },
  {
    slogan: "Swaraj is my birthright and I shall have it",
    meaning: "Self-rule is a right, not a concession",
    source: "Bal Gangadhar Tilak, 1916",
  },
  {
    slogan: "Give me blood, and I shall give you freedom",
    meaning: "Freedom demands personal sacrifice",
    source: "Subhas Chandra Bose, addressing the Indian National Army in Burma, 4 July 1944",
  },
  {
    slogan: "Purna Swaraj",
    meaning: "Complete independence",
    source: "Declared by the Indian National Congress on 26 January 1930",
  },
];

/** English ordinal suffix: 1st, 2nd, 3rd, 11th, 21st ... */
export function ordinalSuffix(n) {
  const value = Math.abs(Math.floor(Number(n)));
  if (!Number.isFinite(value)) return "th";
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Which Independence Day a year marks.
 * 1947 was the 1st, so ordinal = year - 1946. Years completed = ordinal - 1.
 */
export function independenceDayOrdinal(year) {
  const y = Math.floor(Number(year));
  if (!Number.isFinite(y)) return { error: "Enter a four-digit year." };
  if (y < MIN_YEAR) {
    return { error: `India became independent in ${FIRST_INDEPENDENCE_DAY_YEAR}, so pick ${MIN_YEAR} or later.` };
  }
  if (y > MAX_YEAR) return { error: `Pick a year up to ${MAX_YEAR}.` };
  const ordinal = y - (FIRST_INDEPENDENCE_DAY_YEAR - 1);
  return {
    year: y,
    ordinal,
    label: `${ordinal}${ordinalSuffix(ordinal)}`,
    yearsCompleted: ordinal - 1,
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Uppercase the first character. A no-op for scripts without letter case. */
export function capitalizeFirst(text) {
  if (typeof text !== "string" || text.length === 0) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function cleanName(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * Build Independence Day messages.
 *
 * @param {object} options
 * @param {string} [options.name]     recipient name, optional
 * @param {number} options.year       e.g. 2026
 * @param {string} options.language   a LANGUAGES id (ignored for the slogan format)
 * @param {string} options.format     "wish" | "caption" | "slogan"
 * @param {string} options.tone       one of TONES
 * @param {number} options.count      1..MAX_COUNT
 * @param {number} options.seed       integer seed — same seed, same output
 * @param {boolean} [options.hashtags]
 * @returns {{messages: string[], ordinalLabel: string, yearsCompleted: number, available: number, truncated: boolean}|{error: string}}
 */
export function generateMessages({
  name = "",
  year = FIRST_INDEPENDENCE_DAY_YEAR,
  language = "en",
  format = "wish",
  tone = "patriotic",
  count = 3,
  seed = 1,
  hashtags = false,
} = {}) {
  if (!FORMATS.some((f) => f.id === format)) return { error: "Choose a message format." };
  if (!TONES.some((t) => t.id === tone)) return { error: "Choose a tone." };

  const lang = LANGUAGES.find((l) => l.id === language);
  if (!lang && format !== "slogan") return { error: "Choose a language." };

  const id = independenceDayOrdinal(year);
  if (id.error) return { error: id.error };

  const wanted = Math.floor(Number(count));
  if (!Number.isFinite(wanted) || wanted < 1) return { error: "Ask for at least one message." };
  if (wanted > MAX_COUNT) return { error: `Ask for ${MAX_COUNT} messages or fewer in one go.` };

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.floor(Number(seed))) : 1;
  const rand = mulberry32(safeSeed + 1);
  const who = cleanName(name) || "friend";

  const fill = (text) =>
    text
      .replace(/\{name\}/g, who)
      .replace(/\{ordinal\}/g, id.label)
      .replace(/\{years\}/g, String(id.yearsCompleted))
      .replace(/\{n\}/g, String(id.ordinal));

  let pools;
  if (format === "slogan") {
    pools = [shuffle(SLOGANS, rand)];
  } else if (format === "caption") {
    pools = [
      shuffle(lang.greetings.map((text) => ({ text })), rand),
      shuffle(TAGLINES.filter((t) => t.tone === tone), rand),
    ];
  } else {
    pools = [
      shuffle(lang.greetings.map((text) => ({ text })), rand),
      shuffle(BODIES.filter((b) => b.tone === tone), rand),
      shuffle(lang.signoffs.map((text) => ({ text })), rand),
    ];
  }

  if (pools.some((pool) => pool.length === 0)) {
    return { error: "No wording available for that combination yet." };
  }

  const available = pools.reduce((product, pool) => product * pool.length, 1);
  const total = Math.min(wanted, available);
  const messages = [];

  for (let i = 0; i < total; i += 1) {
    let remainder = i;
    const picked = pools.map((pool) => {
      const item = pool[remainder % pool.length];
      remainder = Math.floor(remainder / pool.length);
      return item;
    });

    let text;
    if (format === "slogan") {
      const s = picked[0];
      text = `${s.slogan} — ${s.meaning}. ${s.source}.`;
    } else {
      text = capitalizeFirst(picked.map((item) => fill(item.text)).join(" "));
    }
    if (hashtags) text = `${text} ${HASHTAGS}`;
    messages.push(text);
  }

  return {
    messages,
    ordinal: id.ordinal,
    ordinalLabel: id.label,
    yearsCompleted: id.yearsCompleted,
    year: id.year,
    available,
    truncated: messages.length < wanted,
  };
}
