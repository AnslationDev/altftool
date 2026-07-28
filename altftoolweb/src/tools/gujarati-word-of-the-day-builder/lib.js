/**
 * Gujarati Word of the Day — data set plus pure date-rotation and streak logic.
 *
 * No React, no DOM and no Date.now(): every function that depends on "today"
 * takes the day as an ISO `YYYY-MM-DD` string, so the same input always gives
 * the same output.
 */

/** Milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

/**
 * Fixed anchor for the rotation: day 1 of the cycle is 1 January 2024 (UTC),
 * so a given calendar date shows the same word for every learner.
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
 * 40 high-frequency Gujarati words. `roman` uses the practical transliteration
 * common in Gujarati primers: macrons for long vowels, ṇ ṭ ḍ ḷ for retroflex
 * sounds, ṁ for the anusvara, and "chh" for the aspirated છ.
 */
export const WORDS = [
  {
    word: "નમસ્તે",
    roman: "namaste",
    meaning: "hello; a respectful greeting used on meeting and parting",
    pos: "interjection",
    category: "Greetings",
    exampleNative: "નમસ્તે, કેમ છો?",
    exampleRoman: "Namaste, kem chho?",
    exampleEnglish: "Hello, how are you?",
  },
  {
    word: "આભાર",
    roman: "ābhār",
    meaning: "thanks; gratitude",
    pos: "noun",
    category: "Greetings",
    exampleNative: "તમારી મદદ બદલ આભાર.",
    exampleRoman: "Tamārī madad badal ābhār.",
    exampleEnglish: "Thank you for your help.",
  },
  {
    word: "પાણી",
    roman: "pāṇī",
    meaning: "water",
    pos: "noun",
    category: "Daily life",
    exampleNative: "મને થોડું પાણી આપો.",
    exampleRoman: "Mane thoḍũ pāṇī āpo.",
    exampleEnglish: "Please give me a little water.",
  },
  {
    word: "જમવાનું",
    roman: "jamvānũ",
    meaning: "food; a cooked meal",
    pos: "noun",
    category: "Daily life",
    exampleNative: "જમવાનું તૈયાર છે.",
    exampleRoman: "Jamvānũ taiyār chhe.",
    exampleEnglish: "The food is ready.",
  },
  {
    word: "ઘર",
    roman: "ghar",
    meaning: "house; home",
    pos: "noun",
    category: "Daily life",
    exampleNative: "અમારું ઘર અહીં જ છે.",
    exampleRoman: "Amārũ ghar ahīṁ ja chhe.",
    exampleEnglish: "Our house is right here.",
  },
  {
    word: "પુસ્તક",
    roman: "pustak",
    meaning: "book",
    pos: "noun",
    category: "Daily life",
    exampleNative: "આ પુસ્તક બહુ સરસ છે.",
    exampleRoman: "Ā pustak bahu saras chhe.",
    exampleEnglish: "This book is very good.",
  },
  {
    word: "ઝાડ",
    roman: "jhāḍ",
    meaning: "tree",
    pos: "noun",
    category: "Nature",
    exampleNative: "ઝાડ નીચે છાંયો છે.",
    exampleRoman: "Jhāḍ nīche chhāṁyo chhe.",
    exampleEnglish: "There is shade under the tree.",
  },
  {
    word: "ફૂલ",
    roman: "phūl",
    meaning: "flower",
    pos: "noun",
    category: "Nature",
    exampleNative: "બગીચામાં ફૂલ ખીલ્યું છે.",
    exampleRoman: "Bagīchāmāṁ phūl khīlyũ chhe.",
    exampleEnglish: "A flower has bloomed in the garden.",
  },
  {
    word: "પ્રકાશ",
    roman: "prakāsh",
    meaning: "light",
    pos: "noun",
    category: "Nature",
    exampleNative: "ઓરડામાં પ્રકાશ ઓછો છે.",
    exampleRoman: "Oraḍāmāṁ prakāsh ochho chhe.",
    exampleEnglish: "There is little light in the room.",
  },
  {
    word: "અંધારું",
    roman: "andhārũ",
    meaning: "darkness",
    pos: "noun",
    category: "Nature",
    exampleNative: "બહાર અંધારું થઈ ગયું.",
    exampleRoman: "Bahār andhārũ thaī gayũ.",
    exampleEnglish: "It has become dark outside.",
  },
  {
    word: "મિત્રતા",
    roman: "mitratā",
    meaning: "friendship",
    pos: "noun",
    category: "Feelings",
    exampleNative: "અમારી મિત્રતા બહુ જૂની છે.",
    exampleRoman: "Amārī mitratā bahu jūnī chhe.",
    exampleEnglish: "Our friendship is a very old one.",
  },
  {
    word: "પ્રેમ",
    roman: "prem",
    meaning: "love; affection",
    pos: "noun",
    category: "Feelings",
    exampleNative: "માતાનો પ્રેમ અમૂલ્ય છે.",
    exampleRoman: "Mātāno prem amūlya chhe.",
    exampleEnglish: "A mother's love is priceless.",
  },
  {
    word: "આનંદ",
    roman: "ānand",
    meaning: "joy; delight",
    pos: "noun",
    category: "Feelings",
    exampleNative: "તમને મળીને આનંદ થયો.",
    exampleRoman: "Tamne maḷīne ānand thayo.",
    exampleEnglish: "It was a pleasure to meet you.",
  },
  {
    word: "દુઃખ",
    roman: "duḥkh",
    meaning: "sorrow; grief",
    pos: "noun",
    category: "Feelings",
    exampleNative: "આ સમાચાર સાંભળીને દુઃખ થયું.",
    exampleRoman: "Ā samāchār sāṁbhaḷīne duḥkh thayũ.",
    exampleEnglish: "Hearing this news made me sad.",
  },
  {
    word: "કામ",
    roman: "kām",
    meaning: "work; a task or job",
    pos: "noun",
    category: "Daily life",
    exampleNative: "હું હમણાં કામ પર જાઉં છું.",
    exampleRoman: "Huṁ hamaṇāṁ kām par jāũ chhuṁ.",
    exampleEnglish: "I am going to work now.",
  },
  {
    word: "સમય",
    roman: "samay",
    meaning: "time",
    pos: "noun",
    category: "Time",
    exampleNative: "અત્યારે સમય શું થયો છે?",
    exampleRoman: "Atyāre samay shũ thayo chhe?",
    exampleEnglish: "What is the time now?",
  },
  {
    word: "રસ્તો",
    roman: "rasto",
    meaning: "road; way",
    pos: "noun",
    category: "Daily life",
    exampleNative: "સ્ટેશનનો રસ્તો કયો છે?",
    exampleRoman: "Sṭeshanno rasto kayo chhe?",
    exampleEnglish: "Which is the road to the station?",
  },
  {
    word: "વરસાદ",
    roman: "varsād",
    meaning: "rain",
    pos: "noun",
    category: "Nature",
    exampleNative: "ગઈ કાલે રાત્રે વરસાદ પડ્યો.",
    exampleRoman: "Gaī kāle rātre varsād paḍyo.",
    exampleEnglish: "It rained last night.",
  },
  {
    word: "પવન",
    roman: "pavan",
    meaning: "wind; breeze",
    pos: "noun",
    category: "Nature",
    exampleNative: "આજે પવન જોરદાર છે.",
    exampleRoman: "Āje pavan jordār chhe.",
    exampleEnglish: "The wind is strong today.",
  },
  {
    word: "તડકો",
    roman: "taḍko",
    meaning: "sunshine; the heat of the sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "બપોરે તડકો વધારે હોય છે.",
    exampleRoman: "Bapore taḍko vadhāre hoy chhe.",
    exampleEnglish: "The sun is stronger in the afternoon.",
  },
  {
    word: "પક્ષી",
    roman: "pakṣī",
    meaning: "bird",
    pos: "noun",
    category: "Nature",
    exampleNative: "ઝાડ પર પક્ષી બેઠું છે.",
    exampleRoman: "Jhāḍ par pakṣī beṭhũ chhe.",
    exampleEnglish: "A bird is sitting on the tree.",
  },
  {
    word: "માછલી",
    roman: "māchhlī",
    meaning: "fish",
    pos: "noun",
    category: "Nature",
    exampleNative: "તળાવમાં માછલી તરે છે.",
    exampleRoman: "Taḷāvmāṁ māchhlī tare chhe.",
    exampleEnglish: "A fish is swimming in the pond.",
  },
  {
    word: "કૂતરો",
    roman: "kūtro",
    meaning: "dog",
    pos: "noun",
    category: "Nature",
    exampleNative: "કૂતરો ઘરની રખેવાળી કરે છે.",
    exampleRoman: "Kūtro gharnī rakhevāḷī kare chhe.",
    exampleEnglish: "The dog guards the house.",
  },
  {
    word: "ગાય",
    roman: "gāy",
    meaning: "cow",
    pos: "noun",
    category: "Nature",
    exampleNative: "ગાય દૂધ આપે છે.",
    exampleRoman: "Gāy dūdh āpe chhe.",
    exampleEnglish: "The cow gives milk.",
  },
  {
    word: "પર્વત",
    roman: "parvat",
    meaning: "mountain",
    pos: "noun",
    category: "Nature",
    exampleNative: "પર્વત પર મંદિર છે.",
    exampleRoman: "Parvat par mandir chhe.",
    exampleEnglish: "There is a temple on the mountain.",
  },
  {
    word: "નદી",
    roman: "nadī",
    meaning: "river",
    pos: "noun",
    category: "Nature",
    exampleNative: "નર્મદા ગુજરાતની મોટી નદી છે.",
    exampleRoman: "Narmadā Gujarātnī moṭī nadī chhe.",
    exampleEnglish: "The Narmada is Gujarat's largest river.",
  },
  {
    word: "દરિયો",
    roman: "dariyo",
    meaning: "sea",
    pos: "noun",
    category: "Nature",
    exampleNative: "દરિયાનાં મોજાં મોટાં છે.",
    exampleRoman: "Dariyānāṁ mojāṁ moṭāṁ chhe.",
    exampleEnglish: "The waves of the sea are big.",
  },
  {
    word: "તારો",
    roman: "tāro",
    meaning: "star",
    pos: "noun",
    category: "Nature",
    exampleNative: "રાત્રે આકાશમાં તારો ચમકે છે.",
    exampleRoman: "Rātre ākāshmāṁ tāro chamke chhe.",
    exampleEnglish: "A star shines in the sky at night.",
  },
  {
    word: "ચંદ્ર",
    roman: "chandra",
    meaning: "moon",
    pos: "noun",
    category: "Nature",
    exampleNative: "આજે ચંદ્ર પૂરો છે.",
    exampleRoman: "Āje chandra pūro chhe.",
    exampleEnglish: "The moon is full today.",
  },
  {
    word: "સૂરજ",
    roman: "sūraj",
    meaning: "sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "સૂરજ પૂર્વમાં ઊગે છે.",
    exampleRoman: "Sūraj pūrvamāṁ ūge chhe.",
    exampleEnglish: "The sun rises in the east.",
  },
  {
    word: "સવાર",
    roman: "savār",
    meaning: "morning",
    pos: "noun",
    category: "Time",
    exampleNative: "સવારે વહેલા ઊઠવું જોઈએ.",
    exampleRoman: "Savāre vahelā ūṭhvũ joīe.",
    exampleEnglish: "One should get up early in the morning.",
  },
  {
    word: "રાત",
    roman: "rāt",
    meaning: "night",
    pos: "noun",
    category: "Time",
    exampleNative: "રાત્રે વહેલા સૂઈ જાઓ.",
    exampleRoman: "Rātre vahelā sūī jāo.",
    exampleEnglish: "Go to sleep early at night.",
  },
  {
    word: "ગામ",
    roman: "gām",
    meaning: "village; one's native place",
    pos: "noun",
    category: "People",
    exampleNative: "મારું ગામ ભાવનગર પાસે છે.",
    exampleRoman: "Mārũ gām Bhāvnagar pāse chhe.",
    exampleEnglish: "My village is near Bhavnagar.",
  },
  {
    word: "ભાષા",
    roman: "bhāṣā",
    meaning: "language",
    pos: "noun",
    category: "People",
    exampleNative: "ગુજરાતી મારી માતૃભાષા છે.",
    exampleRoman: "Gujarātī mārī mātṛbhāṣā chhe.",
    exampleEnglish: "Gujarati is my mother tongue.",
  },
  {
    word: "ગીત",
    roman: "gīt",
    meaning: "song",
    pos: "noun",
    category: "People",
    exampleNative: "તે સરસ ગીત ગાય છે.",
    exampleRoman: "Te saras gīt gāy chhe.",
    exampleEnglish: "She sings a lovely song.",
  },
  {
    word: "વાર્તા",
    roman: "vārtā",
    meaning: "story; tale",
    pos: "noun",
    category: "People",
    exampleNative: "દાદીમાએ વાર્તા કહી.",
    exampleRoman: "Dādīmāe vārtā kahī.",
    exampleEnglish: "Grandmother told a story.",
  },
  {
    word: "શાળા",
    roman: "shāḷā",
    meaning: "school",
    pos: "noun",
    category: "Daily life",
    exampleNative: "બાળકો શાળાએ જાય છે.",
    exampleRoman: "Bāḷko shāḷāe jāy chhe.",
    exampleEnglish: "The children go to school.",
  },
  {
    word: "શિક્ષક",
    roman: "shikṣak",
    meaning: "teacher; the feminine form is શિક્ષિકા",
    pos: "noun",
    category: "People",
    exampleNative: "શિક્ષકનું સન્માન કરવું જોઈએ.",
    exampleRoman: "Shikṣaknũ sanmān karvũ joīe.",
    exampleEnglish: "One should respect the teacher.",
  },
  {
    word: "પૈસા",
    roman: "paisā",
    meaning: "money",
    pos: "noun (plural in use)",
    category: "Daily life",
    exampleNative: "પૈસા સાચવીને રાખો.",
    exampleRoman: "Paisā sāchvīne rākho.",
    exampleEnglish: "Keep the money carefully.",
  },
  {
    word: "તંદુરસ્તી",
    roman: "tandurastī",
    meaning: "health; physical well-being",
    pos: "noun",
    category: "Daily life",
    exampleNative: "તંદુરસ્તી એ જ સાચી સંપત્તિ છે.",
    exampleRoman: "Tandurastī e ja sāchī sampatti chhe.",
    exampleEnglish: "Health is the true wealth.",
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
