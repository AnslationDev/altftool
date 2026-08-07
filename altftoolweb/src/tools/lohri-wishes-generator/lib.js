/**
 * Lohri Wishes Generator — data + pure logic.
 *
 * No React, no DOM, no Date.now(): the countdown takes the reference date as an
 * argument so every function is pure and testable. Invalid input returns
 * { error } rather than NaN.
 */

/**
 * Lohri is a solar-calendar festival, so unlike most Hindu festivals it does not
 * move around the Gregorian year: it is observed on 13 January, the eve of
 * Makar Sankranti / Maghi on 14 January. It marks the end of peak winter and the
 * rabi season, when sugarcane and mustard are harvested and wheat is standing.
 */
export const LOHRI_MONTH = 1;
export const LOHRI_DAY = 13;

export const FESTIVAL_FACTS = {
  date: "13 January",
  nextDay: "Makar Sankranti / Maghi on 14 January",
  season: "end of the rabi harvest and the coldest stretch of winter",
  /** Thrown into the bonfire and shared as prasad. */
  prasad: ["Til (sesame)", "Gur (jaggery)", "Gajak", "Rewri", "Moongphali (peanuts)", "Phuliyan (popcorn)"],
  folkFigure: "Dulla Bhatti, the 16th-century Punjabi folk hero remembered in the Lohri songs",
};

export const LANGUAGES = [
  { id: "punjabiGurmukhi", label: "Punjabi (Gurmukhi)", native: "ਪੰਜਾਬੀ" },
  { id: "punjabiRoman", label: "Punjabi (Roman)", native: "Punjabi" },
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
  { id: "english", label: "English", native: "English" },
];

export const OCCASIONS = [
  { id: "family", label: "Family & elders" },
  { id: "friends", label: "Friends" },
  { id: "newborn", label: "Baby's first Lohri" },
  { id: "newlywed", label: "First Lohri after marriage" },
  { id: "work", label: "Colleagues & clients" },
  { id: "caption", label: "Status / caption" },
];

export const SALUTATIONS = {
  punjabiGurmukhi: "ਪਿਆਰੇ {name},",
  punjabiRoman: "Pyare {name},",
  hindi: "प्रिय {name},",
  english: "Dear {name},",
};

export const TEMPLATES = {
  punjabiGurmukhi: [
    {
      text: "ਲੋਹੜੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਅੱਗ ਦਾ ਨਿੱਘ ਤੇ ਗੁੜ ਦੀ ਮਿਠਾਸ ਤੁਹਾਡੇ ਘਰ ਸਦਾ ਬਣੀ ਰਹੇ.",
      tags: ["family", "work"],
    },
    { text: "ਨਵੀਂ ਫ਼ਸਲ, ਨਵੀਂ ਉਮੀਦ, ਨਵਾਂ ਚਾਅ — ਲੋਹੜੀ ਮੁਬਾਰਕ ਹੋਵੇ ਜੀ!", tags: ["family", "friends"] },
    {
      text: "ਤਿਲ, ਗੁੜ, ਗਜਕ ਤੇ ਰਿਓੜੀਆਂ — ਅੱਜ ਡਾਈਟ ਬੰਦ, ਬੱਸ ਭੰਗੜਾ ਚਾਲੂ. ਲੋਹੜੀ ਮੁਬਾਰਕ!",
      tags: ["friends", "caption"],
    },
    { text: "ਅੱਗ ਬਾਲੋ, ਗਿੱਧਾ ਪਾਓ, ਢੋਲ ਵਜਾਓ — ਲੋਹੜੀ ਦੀਆਂ ਵਧਾਈਆਂ!", tags: ["friends", "caption"] },
    {
      text: "ਘਰ ਦੇ ਨਿੱਕੇ ਜਿਹੇ ਮਹਿਮਾਨ ਦੀ ਪਹਿਲੀ ਲੋਹੜੀ ਮੁਬਾਰਕ! ਰੱਬ ਇਸ ਨੂੰ ਲੰਮੀ ਉਮਰ ਤੇ ਖ਼ੁਸ਼ੀਆਂ ਬਖ਼ਸ਼ੇ.",
      tags: ["newborn"],
    },
    {
      text: "ਪਹਿਲੀ ਲੋਹੜੀ ਦੀਆਂ ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ! ਨਿੱਕੀ ਜਿਹੀ ਜਾਨ ਨਾਲ ਘਰ ਦੀ ਰੌਣਕ ਦੁੱਗਣੀ ਹੋ ਗਈ.",
      tags: ["newborn", "family"],
    },
    {
      text: "ਵਿਆਹ ਤੋਂ ਬਾਅਦ ਪਹਿਲੀ ਲੋਹੜੀ ਮੁਬਾਰਕ! ਤੁਹਾਡੀ ਜੋੜੀ ਸਦਾ ਸਲਾਮਤ ਰਹੇ.",
      tags: ["newlywed"],
    },
    {
      text: "ਨਵੀਂ ਜੋੜੀ ਦੀ ਪਹਿਲੀ ਲੋਹੜੀ — ਅੱਗ ਵਾਂਗ ਨਿੱਘ ਤੇ ਗੁੜ ਵਾਂਗ ਮਿਠਾਸ ਸਦਾ ਬਣੀ ਰਹੇ.",
      tags: ["newlywed", "family"],
    },
    {
      text: "ਲੋਹੜੀ ਦੇ ਸ਼ੁਭ ਮੌਕੇ ਉੱਤੇ ਤੁਹਾਨੂੰ ਤੇ ਤੁਹਾਡੀ ਸਾਰੀ ਟੀਮ ਨੂੰ ਵਧਾਈਆਂ. ਨਵਾਂ ਸਾਲ ਤਰੱਕੀ ਲਿਆਵੇ.",
      tags: ["work"],
    },
    { text: "ਅੱਗ, ਢੋਲ ਤੇ ਗੁੜ ਦੀ ਮਿਠਾਸ. ਲੋਹੜੀ ਮੁਬਾਰਕ! #ਲੋਹੜੀ", tags: ["caption"] },
  ],
  punjabiRoman: [
    {
      text: "Lohri diyan lakh lakh vadhaiyan! Agg da niggh te gur di mithas tuhade ghar sada bani rahe.",
      tags: ["family", "work"],
    },
    { text: "Navi fasal, navi umeed, nava chaa - Lohri mubarak hove ji!", tags: ["family", "friends"] },
    {
      text: "Til, gur, gajak te reoriyan - aj diet band, bas bhangra chalu. Lohri mubarak!",
      tags: ["friends", "caption"],
    },
    { text: "Agg balo, gidha pao, dhol vajao - Lohri diyan vadhaiyan!", tags: ["friends", "caption"] },
    {
      text: "Ghar de nikke jehe mehmaan di pehli Lohri mubarak! Rabb ohnu lammi umar te khushiyan bakhshe.",
      tags: ["newborn"],
    },
    {
      text: "Pehli Lohri diyan bahut bahut vadhaiyan! Nikki jehi jaan naal ghar di raunak duggni ho gayi.",
      tags: ["newborn", "family"],
    },
    { text: "Viah ton baad pehli Lohri mubarak! Tuhadi jodi sada salamat rahe.", tags: ["newlywed"] },
    {
      text: "Navi jodi di pehli Lohri - agg vangu niggh te gur vangu mithas sada bani rahe.",
      tags: ["newlywed", "family"],
    },
    {
      text: "Lohri de shubh mauke te tuhanu te tuhadi saari team nu vadhaiyan. Nava saal tarakki liaave.",
      tags: ["work"],
    },
    { text: "Agg, dhol te gur di mithas. Lohri mubarak! #Lohri", tags: ["caption"] },
  ],
  hindi: [
    {
      text: "लोहड़ी की हार्दिक शुभकामनाएँ! आग की गर्माहट और गुड़ की मिठास आपके घर में हमेशा बनी रहे.",
      tags: ["family", "work"],
    },
    { text: "नई फ़सल, नई उम्मीद, नया उत्साह — लोहड़ी मुबारक हो!", tags: ["family", "friends"] },
    {
      text: "तिल, गुड़, गजक और रेवड़ी — आज डाइट बंद, सिर्फ़ भांगड़ा चालू. लोहड़ी मुबारक!",
      tags: ["friends", "caption"],
    },
    { text: "आग जलाओ, गिद्दा डालो, ढोल बजाओ — लोहड़ी की शुभकामनाएँ!", tags: ["friends", "caption"] },
    {
      text: "घर के नन्हे मेहमान की पहली लोहड़ी मुबारक! उसे लंबी उम्र और ढेर सारी ख़ुशियाँ मिलें.",
      tags: ["newborn"],
    },
    {
      text: "पहली लोहड़ी की बहुत बहुत बधाई! नन्ही सी जान से घर की रौनक दोगुनी हो गई.",
      tags: ["newborn", "family"],
    },
    { text: "शादी के बाद की पहली लोहड़ी मुबारक! आपकी जोड़ी हमेशा सलामत रहे.", tags: ["newlywed"] },
    {
      text: "नई जोड़ी की पहली लोहड़ी — आग जैसी गर्माहट और गुड़ जैसी मिठास हमेशा बनी रहे.",
      tags: ["newlywed", "family"],
    },
    {
      text: "लोहड़ी के शुभ अवसर पर आपको और आपकी पूरी टीम को शुभकामनाएँ. नया साल तरक्की लाए.",
      tags: ["work"],
    },
    { text: "आग, ढोल और गुड़ की मिठास. लोहड़ी मुबारक! #लोहड़ी", tags: ["caption"] },
  ],
  english: [
    {
      text: "Happy Lohri! May the warmth of the bonfire and the sweetness of gur stay in your home all year.",
      tags: ["family", "work"],
    },
    {
      text: "New harvest, new hope, new energy. Wishing you and your family a very happy Lohri.",
      tags: ["family", "friends"],
    },
    {
      text: "Til, gur, gajak and rewri - the diet is off, the bhangra is on. Happy Lohri!",
      tags: ["friends", "caption"],
    },
    {
      text: "Light the fire, take a round for luck, and let the dhol do the rest. Happy Lohri!",
      tags: ["friends", "caption"],
    },
    {
      text: "Congratulations on the little one's first Lohri. May the year ahead be as warm as tonight's fire.",
      tags: ["newborn"],
    },
    {
      text: "Happy first Lohri to your baby. One small arrival, twice the noise in the house - enjoy every bit of it.",
      tags: ["newborn", "family"],
    },
    {
      text: "Happy first Lohri as a married couple. May every winter after this one be just as warm.",
      tags: ["newlywed"],
    },
    {
      text: "Your first Lohri together - warmth like the fire, sweetness like the gur, for many years to come.",
      tags: ["newlywed", "family"],
    },
    {
      text: "Warm Lohri wishes to you and your team. May the harvest season bring a strong year of growth.",
      tags: ["work"],
    },
    { text: "Bonfire, dhol and a pocket full of rewri. Happy Lohri. #Lohri", tags: ["caption"] },
  ],
};

export const MAX_MESSAGES = 8;

/** Earliest and latest year the date helpers will accept. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per concatenated part.
 * Gurmukhi and Devanagari force UCS-2 at 70 and 67 respectively.
 */
export const SMS_LIMITS = {
  gsm7: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

const GSM7_SAFE = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅå_ÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const GSM7_EXTENDED = /[\^{}\\[\]~|€]/g;

export function countSmsSegments(text) {
  const body = typeof text === "string" ? text : "";
  const isGsm = GSM7_SAFE.test(body.replace(GSM7_EXTENDED, ""));
  const limits = isGsm ? SMS_LIMITS.gsm7 : SMS_LIMITS.ucs2;
  const units = isGsm
    ? [...body].length + (body.match(GSM7_EXTENDED) || []).length
    : [...body].length;
  const segments =
    units === 0 ? 1 : units <= limits.single ? 1 : Math.ceil(units / limits.concatenated);
  return { encoding: isGsm ? "GSM-7" : "UCS-2", units, segments };
}

/** ISO date for Lohri in a given Gregorian year. */
export function lohriDateFor(year) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  return {
    year: y,
    isoDate: `${String(y).padStart(4, "0")}-${String(LOHRI_MONTH).padStart(2, "0")}-${String(
      LOHRI_DAY,
    ).padStart(2, "0")}`,
  };
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Milliseconds in a day — used only for whole-day differences in UTC. */
const MS_PER_DAY = 86400000;

/**
 * Days from a reference date to the next Lohri (13 January), inclusive of the
 * same-day case which returns 0. The reference date is an argument, so this
 * function is pure.
 *
 * @param {string} fromIsoDate "YYYY-MM-DD"
 */
export function daysUntilLohri(fromIsoDate) {
  const match = ISO_DATE.exec(String(fromIsoDate == null ? "" : fromIsoDate).trim());
  if (!match) return { error: "Enter the reference date as YYYY-MM-DD." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { error: "That is not a real calendar date." };
  }
  const from = Date.UTC(year, month - 1, day);
  // Reject dates that rolled over, e.g. 2026-02-31.
  const check = new Date(from);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return { error: "That is not a real calendar date." };
  }

  let targetYear = year;
  let target = Date.UTC(targetYear, LOHRI_MONTH - 1, LOHRI_DAY);
  if (target < from) {
    targetYear += 1;
    target = Date.UTC(targetYear, LOHRI_MONTH - 1, LOHRI_DAY);
  }

  // The rollover above can push targetYear one past MAX_YEAR; re-validate via
  // lohriDateFor so that case surfaces the existing range error instead of an
  // undefined lohriDate.
  const targetLohri = lohriDateFor(targetYear);
  if (targetLohri.error) return targetLohri;

  return {
    fromDate: `${match[1]}-${match[2]}-${match[3]}`,
    lohriYear: targetYear,
    lohriDate: targetLohri.isoDate,
    daysAway: Math.round((target - from) / MS_PER_DAY),
  };
}

/** mulberry32 — deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function cleanName(raw) {
  return String(raw == null ? "" : raw)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Build the personalised Lohri greetings.
 *
 * @param {object} options
 * @param {string} options.language  LANGUAGES[].id
 * @param {string} options.occasion  OCCASIONS[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]   1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  language,
  occasion,
  recipientName = "",
  senderName = "",
  count = 3,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[language];
  if (!bank) return { error: "Pick a language from the list." };
  if (!OCCASIONS.some((item) => item.id === occasion)) {
    return { error: "Pick the occasion the message is for." };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_MESSAGES) {
    return { error: `Ask for ${MAX_MESSAGES} messages or fewer in one go.` };
  }

  const pool = bank.filter((item) => item.tags.includes(occasion));
  if (pool.length === 0) {
    return { error: "No wording in this language fits that occasion yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + 1);
  const picked = shuffle(pool, rng).slice(0, Math.min(Math.trunc(wanted), pool.length));

  const name = cleanName(recipientName);
  const sender = cleanName(senderName);
  const salutation = SALUTATIONS[language];

  const messages = picked.map((item, index) => {
    const parts = [];
    if (name) parts.push(salutation.replace("{name}", name));
    parts.push(item.text);
    if (sender) parts.push(`- ${sender}`);
    const text = parts.join("\n");
    const sms = countSmsSegments(text);
    return {
      id: `${language}-${occasion}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    language,
    occasion,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}
