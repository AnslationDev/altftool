/**
 * Kannada Word of the Day — data set plus pure date-rotation and streak logic.
 *
 * No React, no DOM, no Date.now(): every function that depends on "today"
 * takes the day as an ISO `YYYY-MM-DD` string argument, so the same input
 * always produces the same output.
 */

/** Milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

/**
 * Fixed anchor for the rotation. Day 1 of the cycle is 1 January 2024 (UTC).
 * Using a fixed UTC anchor means every learner in every timezone sees the same
 * word on the same calendar date.
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
 * 40 high-frequency Kannada words. `roman` uses the ISO 15919 style
 * transliteration commonly seen in Kannada textbooks (ā ī ū ē ō, ṭ ḍ ṇ ḷ ṣ ś ṛ).
 */
export const WORDS = [
  {
    word: "ನಮಸ್ಕಾರ",
    roman: "namaskāra",
    meaning: "hello; a respectful greeting used on meeting and on parting",
    pos: "noun / interjection",
    category: "Greetings",
    exampleNative: "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಾ?",
    exampleRoman: "Namaskāra, hēgiddīrā?",
    exampleEnglish: "Hello, how are you?",
  },
  {
    word: "ಧನ್ಯವಾದ",
    roman: "dhanyavāda",
    meaning: "thank you; thanks",
    pos: "noun",
    category: "Greetings",
    exampleNative: "ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ಧನ್ಯವಾದ.",
    exampleRoman: "Nimma sahāyakke dhanyavāda.",
    exampleEnglish: "Thank you for your help.",
  },
  {
    word: "ನೀರು",
    roman: "nīru",
    meaning: "water",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ನನಗೆ ಸ್ವಲ್ಪ ನೀರು ಕೊಡಿ.",
    exampleRoman: "Nanage svalpa nīru koḍi.",
    exampleEnglish: "Please give me some water.",
  },
  {
    word: "ಊಟ",
    roman: "ūṭa",
    meaning: "a meal, especially lunch or dinner",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ಊಟ ಆಯಿತಾ?",
    exampleRoman: "Ūṭa āyitā?",
    exampleEnglish: "Have you eaten?",
  },
  {
    word: "ಮನೆ",
    roman: "mane",
    meaning: "house; home",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ನಮ್ಮ ಮನೆ ಇಲ್ಲಿಯೇ ಇದೆ.",
    exampleRoman: "Namma mane illiyē ide.",
    exampleEnglish: "Our house is right here.",
  },
  {
    word: "ಪುಸ್ತಕ",
    roman: "pustaka",
    meaning: "book",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ಈ ಪುಸ್ತಕ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ.",
    exampleRoman: "Ī pustaka tumbā cennāgide.",
    exampleEnglish: "This book is very good.",
  },
  {
    word: "ಮರ",
    roman: "mara",
    meaning: "tree; also timber or wood",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಮರದ ಕೆಳಗೆ ನೆರಳಿದೆ.",
    exampleRoman: "Marada keḷage neraḷide.",
    exampleEnglish: "There is shade under the tree.",
  },
  {
    word: "ಹೂವು",
    roman: "hūvu",
    meaning: "flower",
    pos: "noun",
    category: "Nature",
    exampleNative: "ತೋಟದಲ್ಲಿ ಹೂವು ಅರಳಿದೆ.",
    exampleRoman: "Tōṭadalli hūvu araḷide.",
    exampleEnglish: "A flower has bloomed in the garden.",
  },
  {
    word: "ಬೆಳಕು",
    roman: "beḷaku",
    meaning: "light",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಕೋಣೆಯಲ್ಲಿ ಬೆಳಕು ಕಡಿಮೆ ಇದೆ.",
    exampleRoman: "Kōṇeyalli beḷaku kaḍime ide.",
    exampleEnglish: "There is not much light in the room.",
  },
  {
    word: "ಕತ್ತಲೆ",
    roman: "kattale",
    meaning: "darkness",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಹೊರಗೆ ಕತ್ತಲೆ ಆಯಿತು.",
    exampleRoman: "Horage kattale āyitu.",
    exampleEnglish: "It has become dark outside.",
  },
  {
    word: "ಸ್ನೇಹ",
    roman: "snēha",
    meaning: "friendship; affection",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ನಮ್ಮ ಸ್ನೇಹ ಬಹಳ ಹಳೆಯದು.",
    exampleRoman: "Namma snēha bahaḷa haḷeyadu.",
    exampleEnglish: "Our friendship is very old.",
  },
  {
    word: "ಪ್ರೀತಿ",
    roman: "prīti",
    meaning: "love; fondness",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ಅಮ್ಮನ ಪ್ರೀತಿ ಅಮೂಲ್ಯ.",
    exampleRoman: "Ammana prīti amūlya.",
    exampleEnglish: "A mother's love is priceless.",
  },
  {
    word: "ಸಂತೋಷ",
    roman: "santōṣa",
    meaning: "happiness; gladness",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ನಿಮ್ಮನ್ನು ನೋಡಿ ಸಂತೋಷವಾಯಿತು.",
    exampleRoman: "Nimmannu nōḍi santōṣavāyitu.",
    exampleEnglish: "It was a pleasure to see you.",
  },
  {
    word: "ದುಃಖ",
    roman: "duḥkha",
    meaning: "sorrow; grief",
    pos: "noun",
    category: "Feelings",
    exampleNative: "ಅವನ ಮಾತು ಕೇಳಿ ದುಃಖವಾಯಿತು.",
    exampleRoman: "Avana mātu kēḷi duḥkhavāyitu.",
    exampleEnglish: "Hearing his words made me sad.",
  },
  {
    word: "ಕೆಲಸ",
    roman: "kelasa",
    meaning: "work; a job or task",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ನಾನು ಈಗ ಕೆಲಸಕ್ಕೆ ಹೋಗುತ್ತೇನೆ.",
    exampleRoman: "Nānu īga kelasakke hōguttēne.",
    exampleEnglish: "I am going to work now.",
  },
  {
    word: "ಸಮಯ",
    roman: "samaya",
    meaning: "time",
    pos: "noun",
    category: "Time",
    exampleNative: "ಈಗ ಸಮಯ ಎಷ್ಟು?",
    exampleRoman: "Īga samaya eṣṭu?",
    exampleEnglish: "What is the time now?",
  },
  {
    word: "ದಾರಿ",
    roman: "dāri",
    meaning: "way; road; route",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ನಿಲ್ದಾಣಕ್ಕೆ ದಾರಿ ಯಾವುದು?",
    exampleRoman: "Nildāṇakke dāri yāvudu?",
    exampleEnglish: "Which is the way to the station?",
  },
  {
    word: "ಮಳೆ",
    roman: "maḷe",
    meaning: "rain",
    pos: "noun",
    category: "Nature",
    exampleNative: "ನಿನ್ನೆ ರಾತ್ರಿ ಮಳೆ ಬಂತು.",
    exampleRoman: "Ninne rātri maḷe bantu.",
    exampleEnglish: "It rained last night.",
  },
  {
    word: "ಗಾಳಿ",
    roman: "gāḷi",
    meaning: "wind; air",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಇಂದು ಗಾಳಿ ಜೋರಾಗಿದೆ.",
    exampleRoman: "Indu gāḷi jōrāgide.",
    exampleEnglish: "The wind is strong today.",
  },
  {
    word: "ಬಿಸಿಲು",
    roman: "bisilu",
    meaning: "sunshine; the heat of the sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಮಧ್ಯಾಹ್ನ ಬಿಸಿಲು ಹೆಚ್ಚು.",
    exampleRoman: "Madhyāhna bisilu heccu.",
    exampleEnglish: "The sun is harsh at midday.",
  },
  {
    word: "ಹಕ್ಕಿ",
    roman: "hakki",
    meaning: "bird",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಮರದ ಮೇಲೆ ಹಕ್ಕಿ ಕುಳಿತಿದೆ.",
    exampleRoman: "Marada mēle hakki kuḷitide.",
    exampleEnglish: "A bird is sitting on the tree.",
  },
  {
    word: "ಮೀನು",
    roman: "mīnu",
    meaning: "fish",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಕೆರೆಯಲ್ಲಿ ಮೀನು ಈಜುತ್ತಿದೆ.",
    exampleRoman: "Kereyalli mīnu ījuttide.",
    exampleEnglish: "A fish is swimming in the pond.",
  },
  {
    word: "ನಾಯಿ",
    roman: "nāyi",
    meaning: "dog",
    pos: "noun",
    category: "Nature",
    exampleNative: "ನಾಯಿ ಮನೆ ಕಾಯುತ್ತದೆ.",
    exampleRoman: "Nāyi mane kāyuttade.",
    exampleEnglish: "The dog guards the house.",
  },
  {
    word: "ಹಸು",
    roman: "hasu",
    meaning: "cow",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಹಸು ಹಾಲು ಕೊಡುತ್ತದೆ.",
    exampleRoman: "Hasu hālu koḍuttade.",
    exampleEnglish: "The cow gives milk.",
  },
  {
    word: "ಬೆಟ್ಟ",
    roman: "beṭṭa",
    meaning: "hill; mountain",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಬೆಟ್ಟದ ಮೇಲೆ ದೇವಸ್ಥಾನ ಇದೆ.",
    exampleRoman: "Beṭṭada mēle dēvasthāna ide.",
    exampleEnglish: "There is a temple on the hill.",
  },
  {
    word: "ನದಿ",
    roman: "nadi",
    meaning: "river",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಕಾವೇರಿ ನದಿ ಕರ್ನಾಟಕದಲ್ಲಿ ಹರಿಯುತ್ತದೆ.",
    exampleRoman: "Kāvēri nadi Karnāṭakadalli hariyuttade.",
    exampleEnglish: "The Kaveri river flows through Karnataka.",
  },
  {
    word: "ಕಡಲು",
    roman: "kaḍalu",
    meaning: "sea; ocean",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಕಡಲಿನ ಅಲೆಗಳು ದೊಡ್ಡವು.",
    exampleRoman: "Kaḍalina alegaḷu doḍḍavu.",
    exampleEnglish: "The waves of the sea are big.",
  },
  {
    word: "ನಕ್ಷತ್ರ",
    roman: "nakṣatra",
    meaning: "star; also a lunar mansion in the traditional calendar",
    pos: "noun",
    category: "Nature",
    exampleNative: "ರಾತ್ರಿ ಆಕಾಶದಲ್ಲಿ ನಕ್ಷತ್ರ ಹೊಳೆಯುತ್ತದೆ.",
    exampleRoman: "Rātri ākāśadalli nakṣatra hoḷeyuttade.",
    exampleEnglish: "Stars shine in the night sky.",
  },
  {
    word: "ಚಂದ್ರ",
    roman: "candra",
    meaning: "moon",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಇಂದು ಚಂದ್ರ ಪೂರ್ಣವಾಗಿದೆ.",
    exampleRoman: "Indu candra pūrṇavāgide.",
    exampleEnglish: "The moon is full today.",
  },
  {
    word: "ಸೂರ್ಯ",
    roman: "sūrya",
    meaning: "sun",
    pos: "noun",
    category: "Nature",
    exampleNative: "ಸೂರ್ಯ ಪೂರ್ವದಲ್ಲಿ ಹುಟ್ಟುತ್ತಾನೆ.",
    exampleRoman: "Sūrya pūrvadalli huṭṭuttāne.",
    exampleEnglish: "The sun rises in the east.",
  },
  {
    word: "ಬೆಳಗ್ಗೆ",
    roman: "beḷagge",
    meaning: "morning; in the morning",
    pos: "noun / adverb",
    category: "Time",
    exampleNative: "ಬೆಳಗ್ಗೆ ಬೇಗ ಏಳಬೇಕು.",
    exampleRoman: "Beḷagge bēga ēḷabēku.",
    exampleEnglish: "One should get up early in the morning.",
  },
  {
    word: "ರಾತ್ರಿ",
    roman: "rātri",
    meaning: "night",
    pos: "noun",
    category: "Time",
    exampleNative: "ರಾತ್ರಿ ಬೇಗ ಮಲಗಿ.",
    exampleRoman: "Rātri bēga malagi.",
    exampleEnglish: "Go to bed early at night.",
  },
  {
    word: "ಊರು",
    roman: "ūru",
    meaning: "town or village; one's native place",
    pos: "noun",
    category: "People",
    exampleNative: "ನನ್ನ ಊರು ಮೈಸೂರು.",
    exampleRoman: "Nanna ūru Maisūru.",
    exampleEnglish: "My hometown is Mysuru.",
  },
  {
    word: "ಭಾಷೆ",
    roman: "bhāṣe",
    meaning: "language; also a promise given in speech",
    pos: "noun",
    category: "People",
    exampleNative: "ಕನ್ನಡ ನನ್ನ ಮಾತೃಭಾಷೆ.",
    exampleRoman: "Kannaḍa nanna mātṛbhāṣe.",
    exampleEnglish: "Kannada is my mother tongue.",
  },
  {
    word: "ಹಾಡು",
    roman: "hāḍu",
    meaning: "song; also the verb 'to sing'",
    pos: "noun / verb",
    category: "People",
    exampleNative: "ಅವಳು ಚೆನ್ನಾಗಿ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.",
    exampleRoman: "Avaḷu cennāgi hāḍu hāḍuttāḷe.",
    exampleEnglish: "She sings a song well.",
  },
  {
    word: "ಕಥೆ",
    roman: "kathe",
    meaning: "story; tale",
    pos: "noun",
    category: "People",
    exampleNative: "ಅಜ್ಜಿ ಕಥೆ ಹೇಳಿದರು.",
    exampleRoman: "Ajji kathe hēḷidaru.",
    exampleEnglish: "Grandmother told a story.",
  },
  {
    word: "ಶಾಲೆ",
    roman: "śāle",
    meaning: "school",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ಮಕ್ಕಳು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾರೆ.",
    exampleRoman: "Makkaḷu śālege hōguttāre.",
    exampleEnglish: "The children go to school.",
  },
  {
    word: "ಗುರು",
    roman: "guru",
    meaning: "teacher; a guide or mentor",
    pos: "noun",
    category: "People",
    exampleNative: "ಗುರುವಿಗೆ ಗೌರವ ಕೊಡಬೇಕು.",
    exampleRoman: "Guruvige gaurava koḍabēku.",
    exampleEnglish: "One must show respect to the teacher.",
  },
  {
    word: "ಹಣ",
    roman: "haṇa",
    meaning: "money",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ಹಣ ಜೋಪಾನವಾಗಿ ಇಡಿ.",
    exampleRoman: "Haṇa jōpānavāgi iḍi.",
    exampleEnglish: "Keep the money safely.",
  },
  {
    word: "ಆರೋಗ್ಯ",
    roman: "ārōgya",
    meaning: "health; freedom from illness",
    pos: "noun",
    category: "Daily life",
    exampleNative: "ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ.",
    exampleRoman: "Ārōgyavē bhāgya.",
    exampleEnglish: "Health itself is fortune.",
  },
];

/** Length of the rotation — the deck repeats after this many days. */
export const CYCLE_LENGTH = WORDS.length;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a `YYYY-MM-DD` string to a UTC timestamp.
 * Returns null for anything that is not a real calendar date.
 */
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
 * Deterministic index into WORDS for a calendar date.
 * Uses a true modulo so dates before the anchor still land inside the deck.
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

/**
 * The next `count` cards starting from `startIso` (inclusive).
 * Capped at the deck length so the preview never repeats itself.
 */
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
 * Revision streak from a list of ISO dates the learner marked as studied.
 * `current` counts back from today, but a streak that ran up to yesterday is
 * still alive because today is not over yet.
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
