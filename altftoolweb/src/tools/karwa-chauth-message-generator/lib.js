/**
 * Karwa Chauth message generator — pure logic, no React and no DOM.
 *
 * Calendar rule (fixed, not computed from the system clock):
 *  - Karwa Chauth falls on Chaturthi (the fourth day) of Krishna Paksha in the
 *    month of Kartik under the Purnimanta reckoning — the fourth day after the
 *    full moon — which is usually nine days before Diwali, in October or November.
 *  - "Karwa" is the earthen pot used in the puja; "chauth" means fourth.
 *  - The fast traditionally runs from before sunrise to moonrise and is broken
 *    after viewing the moon through a chhalni (sieve).
 * The generator itself takes no dates: it only assembles wording.
 */

/** Lunar position of the festival. */
export const TITHI = "Chaturthi of Krishna Paksha, Kartik (Purnimanta)";
/** Typical gap before Diwali in the same lunar cycle. */
export const DAYS_BEFORE_DIWALI = 9;

export const HASHTAGS = "#KarwaChauth #KarvaChauth";
export const MAX_COUNT = 8;
export const MAX_NAME_LENGTH = 40;

export const FORMATS = [
  { id: "wish", label: "Wish message" },
  { id: "caption", label: "Short caption" },
];

export const RELATIONSHIPS = [
  { id: "wife", label: "For your wife" },
  { id: "husband", label: "For your husband" },
  { id: "other", label: "For a friend or family member" },
];

/** The order of the day, as commonly observed. */
export const RITUAL_STEPS = [
  {
    step: "Sargi",
    when: "Before sunrise",
    detail:
      "A pre-dawn meal — traditionally sent by the mother-in-law — of fruit, sweets, dry fruit and something to drink, eaten before the fast starts.",
  },
  {
    step: "Nirjala fast",
    when: "Sunrise to moonrise",
    detail:
      "The strict form of the fast is nirjala, without food or water. Many people keep a lighter version; anyone pregnant, unwell or on medication should take medical advice first.",
  },
  {
    step: "Katha and puja",
    when: "Late afternoon or early evening",
    detail:
      "Women gather in a circle, the Karwa Chauth katha is read, and the earthen karwa and decorated thali are passed around.",
  },
  {
    step: "Moon sighting",
    when: "At moonrise",
    detail:
      "The moon is viewed through a chhalni (sieve), and the spouse is then looked at through the same sieve.",
  },
  {
    step: "Breaking the fast",
    when: "Immediately after",
    detail: "The spouse offers the first sip of water and the first bite of food.",
  },
];

/**
 * Wording pools per language. Greetings and closings are relationship-neutral;
 * bodies are written separately for each relationship.
 */
export const LANGUAGES = [
  {
    id: "hi",
    label: "Hindi",
    native: "हिन्दी",
    greetings: [
      "{name}, करवा चौथ की हार्दिक शुभकामनाएं!",
      "{name}, करवा चौथ के इस पावन व्रत की ढेर सारी शुभकामनाएं।",
      "करवा चौथ मुबारक, {name}!",
    ],
    closings: [
      "चंद्रमा की तरह आपका जीवन भी उज्ज्वल रहे।",
      "आपका दिन मंगलमय हो।",
      "व्रत सफल हो और शाम सुहानी।",
    ],
    captions: [
      "चाँद का इंतज़ार, और उससे भी लंबा इंतज़ार खाने का।",
      "मेहँदी, थाली और छलनी से दिखता चाँद — करवा चौथ।",
    ],
    bodies: {
      wife: [
        "आज का व्रत सिर्फ़ एक परंपरा नहीं, साथ बिताए हर साल का शुक्रिया है।",
        "आप पूरा दिन बिना पानी के निकाल लेती हैं, और मैं चाय के बिना एक घंटा नहीं।",
      ],
      husband: [
        "हर साल यह व्रत थोड़ा आसान लगता है, क्योंकि इंतज़ार के अंत में आप होते हैं।",
        "चाँद निकलने तक का इंतज़ार लंबा है, पर छलनी से आपका चेहरा देखना उसे सार्थक बना देता है।",
      ],
      other: [
        "आपका व्रत सफल हो, चाँद जल्दी निकले और थाली भर के मिठाइयाँ मिलें।",
        "यह करवा चौथ आपके परिवार में सुख, सेहत और अपनापन लेकर आए।",
      ],
    },
  },
  {
    id: "pa",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    greetings: [
      "{name}, ਕਰਵਾ ਚੌਥ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ!",
      "{name}, ਕਰਵਾ ਚੌਥ ਦੇ ਵਰਤ ਦੀਆਂ ਦਿਲੋਂ ਮੁਬਾਰਕਾਂ।",
      "ਕਰਵਾ ਚੌਥ ਮੁਬਾਰਕ, {name}!",
    ],
    closings: [
      "ਚੰਨ ਵਾਂਗ ਤੁਹਾਡੀ ਜ਼ਿੰਦਗੀ ਵੀ ਚਮਕਦੀ ਰਹੇ।",
      "ਤੁਹਾਡਾ ਦਿਨ ਸ਼ੁਭ ਰਹੇ।",
      "ਵਰਤ ਸਫਲ ਹੋਵੇ ਤੇ ਸ਼ਾਮ ਸੋਹਣੀ।",
    ],
    captions: [
      "ਚੰਨ ਦੀ ਉਡੀਕ, ਤੇ ਉਸ ਤੋਂ ਵੀ ਲੰਬੀ ਰੋਟੀ ਦੀ।",
      "ਮਹਿੰਦੀ, ਥਾਲੀ ਤੇ ਛਾਨਣੀ ਵਿੱਚੋਂ ਦਿਸਦਾ ਚੰਨ — ਕਰਵਾ ਚੌਥ।",
    ],
    bodies: {
      wife: [
        "ਸਵੇਰ ਦੀ ਸਰਗੀ ਤੋਂ ਚੰਨ ਚੜ੍ਹਨ ਤੱਕ — ਇਹ ਸਾਰਾ ਦਿਨ ਤੁਹਾਡੇ ਸਬਰ ਦਾ ਸਬੂਤ ਹੈ।",
        "ਤੁਸੀਂ ਸਾਰਾ ਦਿਨ ਬਿਨਾਂ ਪਾਣੀ ਲੰਘਾ ਲੈਂਦੇ ਹੋ, ਤੇ ਮੈਂ ਚਾਹ ਬਿਨਾਂ ਇੱਕ ਘੰਟਾ ਵੀ ਨਹੀਂ।",
      ],
      husband: [
        "ਚੰਨ ਦੀ ਉਡੀਕ ਲੰਬੀ ਹੈ, ਪਰ ਛਾਨਣੀ ਵਿੱਚੋਂ ਤੁਹਾਡਾ ਚਿਹਰਾ ਵੇਖਣਾ ਸਭ ਸੌਖਾ ਕਰ ਦਿੰਦਾ ਹੈ।",
        "ਹਰ ਸਾਲ ਇਹ ਵਰਤ ਸੌਖਾ ਲੱਗਦਾ ਹੈ, ਕਿਉਂਕਿ ਅਖ਼ੀਰ ਵਿੱਚ ਤੁਸੀਂ ਹੁੰਦੇ ਹੋ।",
      ],
      other: [
        "ਤੁਹਾਡਾ ਵਰਤ ਸਫਲ ਹੋਵੇ, ਚੰਨ ਛੇਤੀ ਚੜ੍ਹੇ ਤੇ ਥਾਲੀ ਮਿਠਾਈਆਂ ਨਾਲ ਭਰੀ ਰਹੇ।",
        "ਇਹ ਕਰਵਾ ਚੌਥ ਤੁਹਾਡੇ ਘਰ ਸੁੱਖ, ਸਿਹਤ ਤੇ ਅਪਣੱਤ ਲੈ ਕੇ ਆਵੇ।",
      ],
    },
  },
  {
    id: "en",
    label: "English",
    native: "English",
    greetings: [
      "Happy Karwa Chauth, {name}!",
      "{name}, wishing you an easy fast and an early moonrise this Karwa Chauth.",
      "Karwa Chauth wishes to you, {name}.",
    ],
    closings: [
      "May the moon turn up on time tonight.",
      "Warm wishes for the evening puja.",
      "Have a lovely Karwa Chauth.",
    ],
    captions: [
      "Waiting for the moon, and waiting even harder for dinner.",
      "Mehndi, thali, and a moon seen through a sieve.",
    ],
    bodies: {
      wife: [
        "A whole day without food or water, and you still hold the house together better than anyone I know.",
        "The fast is the tradition; the thank-you underneath it is entirely mine.",
      ],
      husband: [
        "The wait until moonrise is long, but seeing you through the sieve makes the whole day worth it.",
        "Another year, another Karwa Chauth, and I would still get up for the sargi.",
      ],
      other: [
        "May your fast pass easily, the moon rise early, and the thali come back full.",
        "Wishing your family health, quiet and a very good dinner once the moon is out.",
      ],
    },
  },
];

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

/** Fallback address term when no name is supplied, in the chosen language. */
const FALLBACK_NAME = { hi: "आप", pa: "ਤੁਸੀਂ", en: "friend" };

/**
 * Build Karwa Chauth messages.
 *
 * @param {object} options
 * @param {string} [options.name]       recipient name, optional
 * @param {string} options.language     "hi" | "pa" | "en"
 * @param {string} options.relationship "wife" | "husband" | "other"
 * @param {string} options.format       "wish" | "caption"
 * @param {number} options.count        1..MAX_COUNT
 * @param {number} options.seed         integer seed — same seed, same output
 * @param {boolean} [options.hashtags]
 * @returns {{messages: string[], available: number, truncated: boolean}|{error: string}}
 */
export function generateMessages({
  name = "",
  language = "hi",
  relationship = "wife",
  format = "wish",
  count = 3,
  seed = 1,
  hashtags = false,
} = {}) {
  const lang = LANGUAGES.find((l) => l.id === language);
  if (!lang) return { error: "Choose a language." };
  if (!FORMATS.some((f) => f.id === format)) return { error: "Choose a message format." };
  if (!RELATIONSHIPS.some((r) => r.id === relationship)) {
    return { error: "Choose who the message is for." };
  }

  const wanted = Math.floor(Number(count));
  if (!Number.isFinite(wanted) || wanted < 1) return { error: "Ask for at least one message." };
  if (wanted > MAX_COUNT) return { error: `Ask for ${MAX_COUNT} messages or fewer in one go.` };

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.floor(Number(seed))) : 1;
  const rand = mulberry32(safeSeed + 1);

  const pools =
    format === "caption"
      ? [shuffle(lang.greetings, rand), shuffle(lang.captions, rand)]
      : [
          shuffle(lang.greetings, rand),
          shuffle(lang.bodies[relationship] ?? [], rand),
          shuffle(lang.closings, rand),
        ];

  if (pools.some((pool) => pool.length === 0)) {
    return { error: "No wording available for that combination yet." };
  }

  const available = pools.reduce((product, pool) => product * pool.length, 1);
  const total = Math.min(wanted, available);
  const who = cleanName(name) || FALLBACK_NAME[lang.id] || "friend";

  const messages = [];
  for (let i = 0; i < total; i += 1) {
    let remainder = i;
    const pieces = pools.map((pool) => {
      const line = pool[remainder % pool.length];
      remainder = Math.floor(remainder / pool.length);
      return line;
    });
    let text = capitalizeFirst(pieces.join(" ").replace(/\{name\}/g, who));
    if (hashtags) text = `${text} ${HASHTAGS}`;
    messages.push(text);
  }

  return { messages, available, truncated: messages.length < wanted };
}
