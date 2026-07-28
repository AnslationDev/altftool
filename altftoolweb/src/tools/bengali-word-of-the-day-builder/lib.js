/**
 * Bengali word of the day.
 *
 * The deck rotates deterministically: the word shown on a given date is chosen
 * by the number of whole days between 1970-01-01 (the Unix epoch date) and that
 * date, modulo the size of the deck. Nothing here reads the clock — the caller
 * passes the date in, so the same date always produces the same word on every
 * device and in every timezone.
 */

/** Milliseconds in one day: 24 x 60 x 60 x 1000. */
export const MS_PER_DAY = 86400000;

/** Language this deck teaches, used in the copy-to-clipboard text. */
export const LANGUAGE = "Bengali";

/** Writing system the headword is printed in. */
export const SCRIPT = "Bengali";

/**
 * The curated deck. One full rotation takes WORDS.length days, after which the
 * cycle repeats — long enough that a daily learner sees a month of new words.
 * Each entry: w = headword, r = romanisation, m = meaning, pos = part of
 * speech, ex = example sentence, exr = example in roman, exm = English gloss,
 * note = usage or etymology note.
 */
export const WORDS = [
  {
    "w": "ভালোবাসা",
    "r": "bhalobasha",
    "m": "love",
    "pos": "noun",
    "ex": "মায়ের ভালোবাসার কোনো তুলনা নেই।",
    "exr": "mayer bhalobashar kono tulona nei.",
    "exm": "There is no comparison to a mother's love.",
    "note": "Literally 'to dwell well' (bhalo + basha) — the everyday Bengali word for love, in place of the Sanskritic প্রেম."
  },
  {
    "w": "আনন্দ",
    "r": "anondo",
    "m": "joy, delight",
    "pos": "noun",
    "ex": "খবরটা শুনে খুব আনন্দ হলো।",
    "exr": "khoborta shune khub anondo holo.",
    "exm": "Hearing the news brought great joy.",
    "note": "A Sanskrit loan used constantly in Bengali; আনন্দবাজার, 'the marketplace of joy', is a well-known newspaper name."
  },
  {
    "w": "শান্তি",
    "r": "shanti",
    "m": "peace, calm",
    "pos": "noun",
    "ex": "গ্রামে গিয়ে মনে শান্তি পেলাম।",
    "exr": "grame giye mone shanti pelam.",
    "exm": "Going to the village brought peace of mind.",
    "note": "শান্তিনিকেতন, Tagore's school, means 'the abode of peace'."
  },
  {
    "w": "বন্ধুত্ব",
    "r": "bondhutto",
    "m": "friendship",
    "pos": "noun",
    "ex": "তাদের বন্ধুত্ব বহু বছরের পুরোনো।",
    "exr": "tader bondhutto bohu bochorer purono.",
    "exm": "Their friendship is many years old.",
    "note": "From বন্ধু, friend, with the abstract suffix -ত্ব, which behaves like English '-ship'."
  },
  {
    "w": "স্বপ্ন",
    "r": "shopno",
    "m": "dream, both in sleep and as an ambition",
    "pos": "noun",
    "ex": "তার স্বপ্ন ছিল শিক্ষক হওয়ার।",
    "exr": "tar shopno chhilo shikkhok haoyar.",
    "exm": "His dream was to become a teacher.",
    "note": "The Bengali স্ব is pronounced 'sho' — spelling preserves the Sanskrit svapna while pronunciation has moved on."
  },
  {
    "w": "পরিশ্রম",
    "r": "porishrom",
    "m": "hard work, exertion",
    "pos": "noun",
    "ex": "পরিশ্রম ছাড়া সাফল্য আসে না।",
    "exr": "porishrom chhara shafollo ashe na.",
    "exm": "Success does not come without hard work.",
    "note": "পরিশ্রমী (porishromi) describes a hardworking person and is high praise in Bengali."
  },
  {
    "w": "ধৈর্য",
    "r": "dhoirjo",
    "m": "patience",
    "pos": "noun",
    "ex": "ধৈর্য ধরে অপেক্ষা করো।",
    "exr": "dhoirjo dhore opekkha koro.",
    "exm": "Wait patiently.",
    "note": "The idiom is ধৈর্য ধরা, 'to hold patience' — patience is something you grip, not something you have."
  },
  {
    "w": "কৃতজ্ঞতা",
    "r": "kritoggota",
    "m": "gratitude",
    "pos": "noun",
    "ex": "আপনার সাহায্যের জন্য কৃতজ্ঞতা জানাই।",
    "exr": "apnar shahajjer jonno kritoggota janai.",
    "exm": "I express gratitude for your help.",
    "note": "The conjunct জ্ঞ is pronounced 'ggo' in Bengali, not 'jña' as the spelling suggests."
  },
  {
    "w": "সাহস",
    "r": "shahosh",
    "m": "courage",
    "pos": "noun",
    "ex": "সত্য বলার সাহস সবার থাকে না।",
    "exr": "shotto bolar shahosh shobar thake na.",
    "exm": "Not everyone has the courage to speak the truth.",
    "note": "সাহসী (shahoshi) means brave; the verb phrase সাহস করা means to dare."
  },
  {
    "w": "বিস্ময়",
    "r": "bishmoy",
    "m": "astonishment, wonder",
    "pos": "noun",
    "ex": "দৃশ্যটি দেখে বিস্ময়ে থমকে গেলাম।",
    "exr": "drishyoti dekhe bishmoye thomke gelam.",
    "exm": "Seeing the sight, I stopped short in astonishment.",
    "note": "বিস্ময়বোধক চিহ্ন is the Bengali grammatical term for an exclamation mark."
  },
  {
    "w": "মায়া",
    "r": "maya",
    "m": "tender attachment to a person or place",
    "pos": "noun",
    "ex": "পুরোনো বাড়িটার প্রতি তার মায়া আছে।",
    "exr": "purono baritar proti tar maya achhe.",
    "exm": "She has an attachment to the old house.",
    "note": "In philosophy the same word means illusion, but in everyday Bengali it means affectionate attachment."
  },
  {
    "w": "অভিমান",
    "r": "obhiman",
    "m": "hurt pride towards someone you love; a loving sulk",
    "pos": "noun",
    "ex": "ছোট বোনের অভিমান ভাঙাতে অনেক সময় লাগল।",
    "exr": "chhoto boner obhiman bhangate onek shomoy laglo.",
    "exm": "It took a long time to coax my little sister out of her sulk.",
    "note": "Has no clean English equivalent — it is only felt towards people whose affection you take for granted."
  },
  {
    "w": "আকাঙ্ক্ষা",
    "r": "akangkha",
    "m": "aspiration, longing",
    "pos": "noun",
    "ex": "তার আকাঙ্ক্ষা অনেক বড়।",
    "exr": "tar akangkha onek boro.",
    "exm": "His aspirations are very large.",
    "note": "A Sanskrit tatsama word; the everyday alternative in speech is ইচ্ছা (ichchha), wish."
  },
  {
    "w": "নিষ্ঠা",
    "r": "nishtha",
    "m": "dedication, conscientious commitment",
    "pos": "noun",
    "ex": "সে নিষ্ঠার সঙ্গে কাজ করে।",
    "exr": "she nishthar shonge kaj kore.",
    "exm": "He works with dedication.",
    "note": "নিষ্ঠাবান describes someone reliably devoted to their duty."
  },
  {
    "w": "সরলতা",
    "r": "shorolota",
    "m": "simplicity, guilelessness",
    "pos": "noun",
    "ex": "তার কথার সরলতা মন ছুঁয়ে যায়।",
    "exr": "tar kothar shorolota mon chhuye jay.",
    "exm": "The simplicity of his words is touching.",
    "note": "সরল also means 'straight' in geometry — a straight line is সরলরেখা."
  },
  {
    "w": "উৎসাহ",
    "r": "utshaho",
    "m": "enthusiasm, drive",
    "pos": "noun",
    "ex": "ছেলেমেয়েরা উৎসাহে ভরপুর।",
    "exr": "chhelemeyera utshahe bhorpur.",
    "exm": "The children are full of enthusiasm.",
    "note": "উৎসাহ দেওয়া means to encourage — literally 'to give enthusiasm'."
  },
  {
    "w": "স্মৃতি",
    "r": "smriti",
    "m": "memory",
    "pos": "noun",
    "ex": "ছোটবেলার স্মৃতি আজও মনে পড়ে।",
    "exr": "chhotobelar smriti ajo mone pore.",
    "exm": "Childhood memories still come to mind.",
    "note": "মনে পড়া, 'to fall into the mind', is the ordinary Bengali way of saying 'to remember'."
  },
  {
    "w": "আশ্রয়",
    "r": "ashroy",
    "m": "shelter, refuge",
    "pos": "noun",
    "ex": "বৃষ্টিতে গাছের নিচে আশ্রয় নিলাম।",
    "exr": "brishtite gachher niche ashroy nilam.",
    "exm": "I took shelter under a tree in the rain.",
    "note": "Used for physical shelter and for protection given to a person in difficulty."
  },
  {
    "w": "বিনয়",
    "r": "binoy",
    "m": "humility, modesty of manner",
    "pos": "noun",
    "ex": "বিদ্যা বিনয় দেয়।",
    "exr": "bidya binoy dey.",
    "exm": "Learning gives humility.",
    "note": "Also a common Bengali given name, as in the freedom fighter Binoy Basu."
  },
  {
    "w": "কৌতূহল",
    "r": "koutuhol",
    "m": "curiosity",
    "pos": "noun",
    "ex": "শিশুদের কৌতূহল স্বাভাবিক।",
    "exr": "shishuder koutuhol shabhabik.",
    "exm": "Curiosity in children is natural.",
    "note": "কৌতূহলী means curious; the word suggests lively interest rather than nosiness."
  },
  {
    "w": "নির্ভরতা",
    "r": "nirbhorota",
    "m": "dependence, reliance on someone",
    "pos": "noun",
    "ex": "অন্যের ওপর অতিরিক্ত নির্ভরতা ভালো নয়।",
    "exr": "onyer opor otirikto nirbhorota bhalo noy.",
    "exm": "Excessive dependence on others is not good.",
    "note": "নির্ভরযোগ্য means dependable — the same root seen from the other side."
  },
  {
    "w": "প্রেরণা",
    "r": "prerona",
    "m": "inspiration",
    "pos": "noun",
    "ex": "তাঁর জীবন আমাদের প্রেরণা।",
    "exr": "tãr jibon amader prerona.",
    "exm": "His life is an inspiration to us.",
    "note": "তাঁর with candrabindu is the honorific 'his/her', distinct from ordinary তার."
  },
  {
    "w": "সহানুভূতি",
    "r": "shohanubhuti",
    "m": "sympathy, fellow feeling",
    "pos": "noun",
    "ex": "রোগীর প্রতি সহানুভূতি দেখাও।",
    "exr": "rogir proti shohanubhuti dekhao.",
    "exm": "Show sympathy towards the patient.",
    "note": "saha (with) + anubhūti (feeling) — literally 'feeling along with'."
  },
  {
    "w": "একাকিত্ব",
    "r": "ekakitto",
    "m": "aloneness, solitude",
    "pos": "noun",
    "ex": "শহরে একাকিত্ব বেড়েই চলেছে।",
    "exr": "shohore ekakitto bereii cholechhe.",
    "exm": "Loneliness keeps increasing in the city.",
    "note": "From এক, one. Bengali also uses নিঃসঙ্গতা for the painful sense of being without company."
  },
  {
    "w": "আত্মবিশ্বাস",
    "r": "attobishash",
    "m": "self-confidence",
    "pos": "noun",
    "ex": "আত্মবিশ্বাস থাকলে ভয় কমে।",
    "exr": "attobishash thakle bhoy kome.",
    "exm": "Fear lessens when there is self-confidence.",
    "note": "আত্ম (self) + বিশ্বাস (belief); আত্ম- prefixes many Bengali abstract nouns."
  },
  {
    "w": "মমতা",
    "r": "momota",
    "m": "tenderness, motherly affection",
    "pos": "noun",
    "ex": "তাঁর কণ্ঠে মমতা ঝরে পড়ে।",
    "exr": "tãr konthe momota jhore pore.",
    "exm": "Tenderness spills from her voice.",
    "note": "From mama, 'mine' — the warmth that comes from treating someone as one's own."
  },
  {
    "w": "উদারতা",
    "r": "udarota",
    "m": "generosity, broadness of spirit",
    "pos": "noun",
    "ex": "তাঁর উদারতা সবাই জানে।",
    "exr": "tãr udarota shobai jane.",
    "exm": "Everyone knows his generosity.",
    "note": "উদার also describes an open, liberal outlook, not only open-handedness with money."
  },
  {
    "w": "প্রত্যাশা",
    "r": "prottasha",
    "m": "expectation",
    "pos": "noun",
    "ex": "অতিরিক্ত প্রত্যাশা কষ্ট দেয়।",
    "exr": "otirikto prottasha koshto dey.",
    "exm": "Excessive expectation brings pain.",
    "note": "Distinct from আশা (hope): প্রত্যাশা is what you believe is owed to you."
  },
  {
    "w": "নীরবতা",
    "r": "nirobota",
    "m": "silence",
    "pos": "noun",
    "ex": "ঘরের নীরবতা ভেঙে গেল।",
    "exr": "ghorer nirobota bhenge gelo.",
    "exm": "The silence of the room was broken.",
    "note": "নীরব is literally 'without sound' (niḥ + rava)."
  },
  {
    "w": "সংগ্রাম",
    "r": "shongram",
    "m": "struggle, sustained fight",
    "pos": "noun",
    "ex": "জীবন এক দীর্ঘ সংগ্রাম।",
    "exr": "jibon ek dirgho shongram.",
    "exm": "Life is a long struggle.",
    "note": "Carries a political charge in Bengali, from its use across the independence and language movements."
  }
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True only for a real calendar date written as YYYY-MM-DD. */
export function isValidISODate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return false;
  const [year, month, day] = iso.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const stamp = Date.UTC(year, month - 1, day);
  const back = new Date(stamp);
  return (
    back.getUTCFullYear() === year &&
    back.getUTCMonth() === month - 1 &&
    back.getUTCDate() === day
  );
}

/** Whole days from 1970-01-01 to the given date. Negative before the epoch. */
export function daysSinceEpoch(iso) {
  if (!isValidISODate(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

/** Shifts an ISO date by whole days. Returns null on invalid input. */
export function addDays(iso, delta) {
  const days = daysSinceEpoch(iso);
  const step = Number(delta);
  if (days === null || !Number.isFinite(step)) return null;
  const shifted = new Date((days + Math.trunc(step)) * MS_PER_DAY);
  return shifted.toISOString().slice(0, 10);
}

/** Signed whole days from `fromISO` to `toISO`, or null if either is invalid. */
export function daysBetween(fromISO, toISO) {
  const a = daysSinceEpoch(fromISO);
  const b = daysSinceEpoch(toISO);
  if (a === null || b === null) return null;
  return b - a;
}

/**
 * The word for a calendar date.
 * @param {string} iso date as YYYY-MM-DD
 * @returns {{index:number, dayNumber:number, total:number, word:object, date:string}|{error:string}}
 */
export function wordForDate(iso) {
  const days = daysSinceEpoch(iso);
  if (days === null) return { error: "Pick a real calendar date in YYYY-MM-DD form." };
  if (WORDS.length === 0) return { error: "The word list is empty." };
  // JavaScript's % keeps the sign of the dividend, so normalise for dates
  // before 1970 to stay inside the deck.
  const index = ((days % WORDS.length) + WORDS.length) % WORDS.length;
  return {
    date: iso,
    index,
    dayNumber: index + 1,
    total: WORDS.length,
    word: WORDS[index],
  };
}

/** The next `days` entries starting from (and including) the given date. */
export function upcomingWords(iso, days = 7) {
  const span = Number(days);
  if (!Number.isFinite(span) || span < 1 || span > 60) {
    return { error: "Preview between 1 and 60 days." };
  }
  const start = daysSinceEpoch(iso);
  if (start === null) return { error: "Pick a real calendar date in YYYY-MM-DD form." };

  const list = [];
  for (let offset = 0; offset < Math.floor(span); offset += 1) {
    const date = addDays(iso, offset);
    const entry = wordForDate(date);
    if (entry.error) return entry;
    list.push(entry);
  }
  return { list };
}

/**
 * Streak arithmetic, kept pure so the component only has to store the result.
 *
 * Rules: studying on the next calendar day extends the streak by one; studying
 * again on the same day changes nothing; a gap of two or more days restarts the
 * streak at one.
 *
 * @param {object} state
 * @param {string|null} state.lastStudiedISO  last date marked studied, or null
 * @param {number} state.currentStreak        streak before this study session
 * @param {number} state.longestStreak        best streak so far
 * @param {string} state.todayISO             the date being marked studied
 */
export function updateStreak(state = {}) {
  const {
    lastStudiedISO = null,
    currentStreak = 0,
    longestStreak = 0,
    todayISO,
  } = state;

  if (!isValidISODate(todayISO)) {
    return { error: "Pick a real calendar date in YYYY-MM-DD form." };
  }

  const safeCurrent = Number.isFinite(Number(currentStreak))
    ? Math.max(0, Math.floor(Number(currentStreak)))
    : 0;
  const safeLongest = Number.isFinite(Number(longestStreak))
    ? Math.max(0, Math.floor(Number(longestStreak)))
    : 0;

  if (lastStudiedISO === null || !isValidISODate(lastStudiedISO)) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, safeLongest),
      lastStudiedISO: todayISO,
      changed: true,
      status: "started",
      message: "Streak started. Come back tomorrow to make it two.",
    };
  }

  const gap = daysBetween(lastStudiedISO, todayISO);

  if (gap === 0) {
    return {
      currentStreak: Math.max(1, safeCurrent),
      longestStreak: Math.max(safeLongest, Math.max(1, safeCurrent)),
      lastStudiedISO,
      changed: false,
      status: "already",
      message: "Already marked for this date.",
    };
  }

  if (gap < 0) {
    return {
      error: "That date is before the last day you marked studied.",
    };
  }

  if (gap === 1) {
    const next = safeCurrent + 1;
    return {
      currentStreak: next,
      longestStreak: Math.max(safeLongest, next),
      lastStudiedISO: todayISO,
      changed: true,
      status: "extended",
      message: `Streak extended to ${next} day${next === 1 ? "" : "s"}.`,
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(safeLongest, 1),
    lastStudiedISO: todayISO,
    changed: true,
    status: "reset",
    message: `${gap - 1} day${gap - 1 === 1 ? "" : "s"} missed — streak restarted at 1.`,
  };
}

/** Case-insensitive search across headword, romanisation and meaning. */
export function searchWords(query) {
  const needle = String(query == null ? "" : query).trim().toLowerCase();
  if (!needle) return WORDS.map((word, index) => ({ word, index }));
  return WORDS.map((word, index) => ({ word, index })).filter(({ word }) =>
    [word.w, word.r, word.m, word.pos, word.note].some(
      (field) => typeof field === "string" && field.toLowerCase().includes(needle),
    ),
  );
}

/** Plain-text version of a day's card, for the clipboard. */
export function wordToText(entry) {
  if (!entry || entry.error || !entry.word) return "";
  const { word } = entry;
  return [
    `${LANGUAGE} word of the day — ${entry.date}`,
    "",
    `${word.w} (${word.r})`,
    `${word.pos}: ${word.m}`,
    "",
    word.ex,
    word.exr,
    word.exm,
    "",
    word.note,
  ].join("\n");
}
