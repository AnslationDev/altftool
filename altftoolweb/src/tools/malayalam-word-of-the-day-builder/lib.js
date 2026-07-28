/**
 * Malayalam Word of the Day — data set plus pure date-rotation and streak logic.
 *
 * No React, no DOM and no Date.now(): anything that depends on "today" takes
 * the day as an ISO `YYYY-MM-DD` string, so the same input always produces the
 * same output.
 */

/** Milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

/**
 * Fixed anchor for the rotation: day 1 of the cycle is 1 January 2024 (UTC).
 * A fixed UTC anchor means every learner sees the same word on a given date.
 */
export const ROTATION_ANCHOR = "2024-01-01";

/** Topic buckets used by the browse/filter list. */
export const CATEGORIES = [
  "Greetings",
  "Daily life",
  "Nature",
  "People",
  "Feelings",
  "Time",
];

/**
 * 40 high-frequency Malayalam words. `roman` follows the ISO 15919 style used
 * in Malayalam grammars: long vowels ā ī ū ē ō, retroflex ṭ ḍ ṇ ḷ ḻ, ṟ for the
 * hard alveolar r, ṁ for anusvara and r̥ for the vocalic r.
 */
export const WORDS = [
  {
    word: "നമസ്കാരം",
    roman: "namaskāraṁ",
    meaning: "hello; a respectful greeting on meeting or parting",
    pos: "noun / interjection",
    category: "Greetings",
    exampleNative: "നമസ്കാരം, സുഖമാണോ?",
    exampleRoman: "Namaskāraṁ, sukhamāṇō?",
    exampleEnglish: "Hello, are you well?",
  },
  {
    word: "നന്ദി",
    roman: "nandi",
    meaning: "thanks; gratitude",
    pos: "noun",
    category: "Greetings",
    exampleNative: "സഹായത്തിന് നന്ദി.",
    exampleRoman: "Sahāyattinu nandi.",
    exampleEnglish: "Thank you for the help.",
  },
  {
    word: "വെള്ളം",
    roman: "veḷḷaṁ",
    meaning: "water",
    pos: "noun",
    category: "Daily life",
    exampleNative: "എനിക്ക് കുറച്ച് വെള്ളം തരൂ.",
    exampleRoman: "Enikku kuṟaccu veḷḷaṁ tarū.",
    exampleEnglish: "Give me a little water.",
  },
  {
    word: "ഭക്ഷണം",
    roman: "bhakṣaṇaṁ",
    meaning: "food; a meal",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ഭക്ഷണം കഴിച്ചോ?",
    exampleRoman: "Bhakṣaṇaṁ kaḻiccō?",
    exampleEnglish: "Have you eaten?",
  },
  {
    word: "വീട്",
    roman: "vīṭu",
    meaning: "house; home",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ഞങ്ങളുടെ വീട് ഇവിടെയാണ്.",
    exampleRoman: "Ñaṅṅaḷuṭe vīṭu iviṭeyāṇu.",
    exampleEnglish: "Our house is here.",
  },
  {
    word: "പുസ്തകം",
    roman: "pustakaṁ",
    meaning: "book",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ഈ പുസ്തകം വളരെ നല്ലതാണ്.",
    exampleRoman: "Ī pustakaṁ vaḷare nallatāṇu.",
    exampleEnglish: "This book is very good.",
  },
  {
    word: "മരം",
    roman: "maraṁ",
    meaning: "tree; also wood as a material",
    pos: "noun",
    category: "Nature",
    exampleNative: "മരത്തിന്റെ ചുവട്ടിൽ തണലുണ്ട്.",
    exampleRoman: "Marattinṟe cuvaṭṭil taṇaluṇṭu.",
    exampleEnglish: "There is shade at the foot of the tree.",
  },
  {
    word: "പൂവ്",
    roman: "pūvu",
    meaning: "flower",
    pos: "noun",
    category: "Nature",
    exampleNative: "പൂന്തോട്ടത്തിൽ പൂവ് വിരിഞ്ഞു.",
    exampleRoman: "Pūntōṭṭattil pūvu viriññu.",
    exampleEnglish: "A flower bloomed in the garden.",
  },
  {
    word: "വെളിച്ചം",
    roman: "veḷiccaṁ",
    meaning: "light",
    pos: "noun",
    category: "Nature",
    exampleNative: "മുറിയിൽ വെളിച്ചം കുറവാണ്.",
    exampleRoman: "Muṟiyil veḷiccaṁ kuṟavāṇu.",
    exampleEnglish: "There is little light in the room.",
  },
  {
    word: "ഇരുട്ട്",
    roman: "iruṭṭu",
    meaning: "darkness",
    pos: "noun",
    category: "Nature",
    exampleNative: "പുറത്ത് ഇരുട്ടായി.",
    exampleRoman: "Puṟattu iruṭṭāyi.",
    exampleEnglish: "It has grown dark outside.",
  },
  {
    word: "സൗഹൃദം",
    roman: "sauhr̥daṁ",
    meaning: "friendship",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ഞങ്ങളുടെ സൗഹൃദം പഴയതാണ്.",
    exampleRoman: "Ñaṅṅaḷuṭe sauhr̥daṁ paḻayatāṇu.",
    exampleEnglish: "Our friendship is an old one.",
  },
  {
    word: "സ്നേഹം",
    roman: "snēhaṁ",
    meaning: "love; affection",
    pos: "noun",
    category: "Feelings",
    exampleNative: "അമ്മയുടെ സ്നേഹം വിലമതിക്കാനാവാത്തതാണ്.",
    exampleRoman: "Ammayuṭe snēhaṁ vilamatikkānāvāttatāṇu.",
    exampleEnglish: "A mother's love is beyond price.",
  },
  {
    word: "സന്തോഷം",
    roman: "santōṣaṁ",
    meaning: "happiness; gladness",
    pos: "noun",
    category: "Feelings",
    exampleNative: "നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.",
    exampleRoman: "Niṅṅaḷe kaṇṭatil santōṣaṁ.",
    exampleEnglish: "Glad to have met you.",
  },
  {
    word: "ദുഃഖം",
    roman: "duḥkhaṁ",
    meaning: "sorrow; grief",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ആ വാർത്ത കേട്ട് ദുഃഖം തോന്നി.",
    exampleRoman: "Ā vārtta kēṭṭu duḥkhaṁ tōnni.",
    exampleEnglish: "Hearing that news made me sad.",
  },
  {
    word: "ജോലി",
    roman: "jōli",
    meaning: "work; a job",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ഞാൻ ഇപ്പോൾ ജോലിക്ക് പോകുന്നു.",
    exampleRoman: "Ñān ippōḷ jōlikku pōkunnu.",
    exampleEnglish: "I am leaving for work now.",
  },
  {
    word: "സമയം",
    roman: "samayaṁ",
    meaning: "time",
    pos: "noun",
    category: "Time",
    exampleNative: "ഇപ്പോൾ സമയം എത്രയായി?",
    exampleRoman: "Ippōḷ samayaṁ etrayāyi?",
    exampleEnglish: "What is the time now?",
  },
  {
    word: "വഴി",
    roman: "vaḻi",
    meaning: "way; road; route",
    pos: "noun",
    category: "Daily life",
    exampleNative: "സ്റ്റേഷനിലേക്കുള്ള വഴി ഏതാണ്?",
    exampleRoman: "Sṭēṣanilēkkuḷḷa vaḻi ētāṇu?",
    exampleEnglish: "Which is the way to the station?",
  },
  {
    word: "മഴ",
    roman: "maḻa",
    meaning: "rain",
    pos: "noun",
    category: "Nature",
    exampleNative: "ഇന്നലെ രാത്രി മഴ പെയ്തു.",
    exampleRoman: "Innale rātri maḻa peytu.",
    exampleEnglish: "It rained last night.",
  },
  {
    word: "കാറ്റ്",
    roman: "kāṟṟu",
    meaning: "wind; breeze",
    pos: "noun",
    category: "Nature",
    exampleNative: "ഇന്ന് കാറ്റ് ശക്തമാണ്.",
    exampleRoman: "Innu kāṟṟu śaktamāṇu.",
    exampleEnglish: "The wind is strong today.",
  },
  {
    word: "വെയിൽ",
    roman: "veyil",
    meaning: "sunshine; the heat of the sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "ഉച്ചയ്ക്ക് വെയിൽ കൂടുതലാണ്.",
    exampleRoman: "Uccaykku veyil kūṭutalāṇu.",
    exampleEnglish: "The sun is harsher at midday.",
  },
  {
    word: "പക്ഷി",
    roman: "pakṣi",
    meaning: "bird",
    pos: "noun",
    category: "Nature",
    exampleNative: "മരത്തിൽ ഒരു പക്ഷി ഇരിക്കുന്നു.",
    exampleRoman: "Marattil oru pakṣi irikkunnu.",
    exampleEnglish: "A bird is perched on the tree.",
  },
  {
    word: "മീൻ",
    roman: "mīn",
    meaning: "fish",
    pos: "noun",
    category: "Nature",
    exampleNative: "കുളത്തിൽ മീൻ നീന്തുന്നു.",
    exampleRoman: "Kuḷattil mīn nīntunnu.",
    exampleEnglish: "A fish is swimming in the pond.",
  },
  {
    word: "നായ",
    roman: "nāya",
    meaning: "dog",
    pos: "noun",
    category: "Nature",
    exampleNative: "നായ വീട് കാക്കുന്നു.",
    exampleRoman: "Nāya vīṭu kākkunnu.",
    exampleEnglish: "The dog guards the house.",
  },
  {
    word: "പശു",
    roman: "paśu",
    meaning: "cow",
    pos: "noun",
    category: "Nature",
    exampleNative: "പശു പാൽ തരുന്നു.",
    exampleRoman: "Paśu pāl tarunnu.",
    exampleEnglish: "The cow gives milk.",
  },
  {
    word: "മല",
    roman: "mala",
    meaning: "hill; mountain",
    pos: "noun",
    category: "Nature",
    exampleNative: "മലയുടെ മുകളിൽ ഒരു ക്ഷേത്രമുണ്ട്.",
    exampleRoman: "Malayuṭe mukaḷil oru kṣētramuṇṭu.",
    exampleEnglish: "There is a temple on top of the hill.",
  },
  {
    word: "പുഴ",
    roman: "puḻa",
    meaning: "river",
    pos: "noun",
    category: "Nature",
    exampleNative: "പെരിയാർ കേരളത്തിലെ വലിയ പുഴയാണ്.",
    exampleRoman: "Periyār Kēraḷattile valiya puḻayāṇu.",
    exampleEnglish: "The Periyar is a large river in Kerala.",
  },
  {
    word: "കടൽ",
    roman: "kaṭal",
    meaning: "sea; ocean",
    pos: "noun",
    category: "Nature",
    exampleNative: "കടലിലെ തിരമാലകൾ വലുതാണ്.",
    exampleRoman: "Kaṭalile tiramālakaḷ valutāṇu.",
    exampleEnglish: "The waves in the sea are big.",
  },
  {
    word: "നക്ഷത്രം",
    roman: "nakṣatraṁ",
    meaning: "star; also a lunar mansion in the traditional calendar",
    pos: "noun",
    category: "Nature",
    exampleNative: "രാത്രി ആകാശത്ത് നക്ഷത്രം തിളങ്ങുന്നു.",
    exampleRoman: "Rātri ākāśattu nakṣatraṁ tiḷaṅṅunnu.",
    exampleEnglish: "Stars shine in the night sky.",
  },
  {
    word: "ചന്ദ്രൻ",
    roman: "candran",
    meaning: "the moon",
    pos: "noun",
    category: "Nature",
    exampleNative: "ഇന്ന് ചന്ദ്രൻ പൂർണ്ണമാണ്.",
    exampleRoman: "Innu candran pūrṇṇamāṇu.",
    exampleEnglish: "The moon is full today.",
  },
  {
    word: "സൂര്യൻ",
    roman: "sūryan",
    meaning: "the sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "സൂര്യൻ കിഴക്ക് ഉദിക്കുന്നു.",
    exampleRoman: "Sūryan kiḻakku udikkunnu.",
    exampleEnglish: "The sun rises in the east.",
  },
  {
    word: "രാവിലെ",
    roman: "rāvile",
    meaning: "morning; in the morning",
    pos: "noun / adverb",
    category: "Time",
    exampleNative: "രാവിലെ നേരത്തെ എഴുന്നേൽക്കണം.",
    exampleRoman: "Rāvile nēratte eḻunnēlkkaṇaṁ.",
    exampleEnglish: "One should get up early in the morning.",
  },
  {
    word: "രാത്രി",
    roman: "rātri",
    meaning: "night",
    pos: "noun",
    category: "Time",
    exampleNative: "രാത്രി നേരത്തെ ഉറങ്ങുക.",
    exampleRoman: "Rātri nēratte uṟaṅṅuka.",
    exampleEnglish: "Sleep early at night.",
  },
  {
    word: "നാട്",
    roman: "nāṭu",
    meaning: "one's native place; a country or region",
    pos: "noun",
    category: "People",
    exampleNative: "എന്റെ നാട് തൃശ്ശൂരാണ്.",
    exampleRoman: "Enṟe nāṭu Tr̥śśūrāṇu.",
    exampleEnglish: "My home town is Thrissur.",
  },
  {
    word: "ഭാഷ",
    roman: "bhāṣa",
    meaning: "language",
    pos: "noun",
    category: "People",
    exampleNative: "മലയാളം എന്റെ മാതൃഭാഷയാണ്.",
    exampleRoman: "Malayāḷaṁ enṟe mātr̥bhāṣayāṇu.",
    exampleEnglish: "Malayalam is my mother tongue.",
  },
  {
    word: "പാട്ട്",
    roman: "pāṭṭu",
    meaning: "song",
    pos: "noun",
    category: "People",
    exampleNative: "അവൾ നന്നായി പാട്ട് പാടുന്നു.",
    exampleRoman: "Avaḷ nannāyi pāṭṭu pāṭunnu.",
    exampleEnglish: "She sings a song well.",
  },
  {
    word: "കഥ",
    roman: "katha",
    meaning: "story; tale",
    pos: "noun",
    category: "People",
    exampleNative: "മുത്തശ്ശി ഒരു കഥ പറഞ്ഞു.",
    exampleRoman: "Muttaśśi oru katha paṟaññu.",
    exampleEnglish: "Grandmother told a story.",
  },
  {
    word: "വിദ്യാലയം",
    roman: "vidyālayaṁ",
    meaning: "school",
    pos: "noun",
    category: "Daily life",
    exampleNative: "കുട്ടികൾ വിദ്യാലയത്തിലേക്ക് പോകുന്നു.",
    exampleRoman: "Kuṭṭikaḷ vidyālayattilēkku pōkunnu.",
    exampleEnglish: "The children are going to school.",
  },
  {
    word: "അധ്യാപകൻ",
    roman: "adhyāpakan",
    meaning: "teacher (male); the feminine form is അധ്യാപിക",
    pos: "noun",
    category: "People",
    exampleNative: "അധ്യാപകനെ ബഹുമാനിക്കണം.",
    exampleRoman: "Adhyāpakane bahumānikkaṇaṁ.",
    exampleEnglish: "One should respect the teacher.",
  },
  {
    word: "പണം",
    roman: "paṇaṁ",
    meaning: "money",
    pos: "noun",
    category: "Daily life",
    exampleNative: "പണം സൂക്ഷിച്ച് വയ്ക്കുക.",
    exampleRoman: "Paṇaṁ sūkṣiccu vaykkuka.",
    exampleEnglish: "Keep the money safely.",
  },
  {
    word: "ആരോഗ്യം",
    roman: "ārōgyaṁ",
    meaning: "health; freedom from illness",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ആരോഗ്യമാണ് ഏറ്റവും വലിയ സമ്പത്ത്.",
    exampleRoman: "Ārōgyamāṇu ēṟṟavuṁ valiya sampattu.",
    exampleEnglish: "Health is the greatest wealth.",
  },
];

/** Length of the rotation — the deck repeats after this many days. */
export const CYCLE_LENGTH = WORDS.length;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse `YYYY-MM-DD` to a UTC timestamp; null if it is not a real date. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = ISO_DATE.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  // Rejects impossible dates such as 2025-02-30, which Date.UTC would roll over.
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** Format a UTC timestamp back to `YYYY-MM-DD`. */
export function toIsoDate(ms) {
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Whole days from `fromIso` to `toIso`; null if either date is invalid. */
export function daysBetween(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Shift an ISO date by a whole number of days. */
export function addDays(iso, days) {
  const ms = parseIsoDate(iso);
  if (ms === null || !Number.isInteger(days)) return null;
  return toIsoDate(ms + days * MS_PER_DAY);
}

/**
 * Deterministic index into WORDS for a calendar date. A true modulo keeps
 * dates before the anchor inside the deck instead of returning a negative.
 */
export function wordIndexForDate(isoDate) {
  const offset = daysBetween(ROTATION_ANCHOR, isoDate);
  if (offset === null) return null;
  return ((offset % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
}

/** The full card for a given calendar date. */
export function wordForDate(isoDate) {
  const index = wordIndexForDate(isoDate);
  if (index === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  return {
    date: isoDate.trim(),
    index,
    dayNumber: index + 1,
    cycleLength: CYCLE_LENGTH,
    ...WORDS[index],
  };
}

/** The next `count` cards from `startIso` inclusive, capped at the deck size. */
export function upcomingWords(startIso, count) {
  if (!Number.isInteger(count) || count < 1) {
    return { error: "Preview length must be a whole number of days, at least 1." };
  }
  const start = parseIsoDate(startIso);
  if (start === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  const days = Math.min(count, CYCLE_LENGTH);
  const cards = [];
  for (let i = 0; i < days; i += 1) {
    cards.push(wordForDate(toIsoDate(start + i * MS_PER_DAY)));
  }
  return { cards, truncated: count > CYCLE_LENGTH };
}

/** Case-insensitive search across script, transliteration and meaning. */
export function filterWords({ category = "All", query = "" } = {}) {
  const needle = String(query).trim().toLowerCase();
  return WORDS.map((entry, index) => ({ ...entry, index, dayNumber: index + 1 })).filter(
    (entry) => {
      if (category !== "All" && entry.category !== category) return false;
      if (!needle) return true;
      return (
        entry.word.includes(needle) ||
        entry.roman.toLowerCase().includes(needle) ||
        entry.meaning.toLowerCase().includes(needle)
      );
    },
  );
}

/**
 * Revision streak from the ISO dates the learner marked as studied.
 * A streak that ran up to yesterday is still alive, because today is not over.
 */
export function computeStreak({ studiedDates = [], todayIso } = {}) {
  if (parseIsoDate(todayIso) === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  if (!Array.isArray(studiedDates)) {
    return { error: "Studied days must be a list of dates." };
  }

  const valid = [];
  for (const raw of studiedDates) {
    const ms = parseIsoDate(raw);
    if (ms !== null) valid.push(ms);
  }
  const unique = Array.from(new Set(valid)).sort((a, b) => a - b);

  if (unique.length === 0) {
    return { current: 0, longest: 0, total: 0, studiedToday: false, lastStudied: null };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i] - unique[i - 1] === MS_PER_DAY) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  const today = parseIsoDate(todayIso);
  const last = unique[unique.length - 1];
  const gap = Math.round((today - last) / MS_PER_DAY);

  let current = 0;
  if (gap === 0 || gap === 1) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      if (unique[i] - unique[i - 1] === MS_PER_DAY) current += 1;
      else break;
    }
  }

  return {
    current,
    longest,
    total: unique.length,
    studiedToday: gap === 0,
    lastStudied: toIsoDate(last),
  };
}
