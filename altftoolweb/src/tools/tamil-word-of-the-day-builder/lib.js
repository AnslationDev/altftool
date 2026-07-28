/**
 * Tamil word of the day.
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
export const LANGUAGE = "Tamil";

/** Writing system the headword is printed in. */
export const SCRIPT = "Tamil";

/**
 * The curated deck. One full rotation takes WORDS.length days, after which the
 * cycle repeats — long enough that a daily learner sees a month of new words.
 * Each entry: w = headword, r = romanisation, m = meaning, pos = part of
 * speech, ex = example sentence, exr = example in roman, exm = English gloss,
 * note = usage or etymology note.
 */
export const WORDS = [
  {
    "w": "அன்பு",
    "r": "anbu",
    "m": "love, affection",
    "pos": "noun",
    "ex": "அன்பு எல்லாவற்றையும் வெல்லும்.",
    "exr": "anbu ellāvaṭṟaiyum vellum.",
    "exm": "Love conquers everything.",
    "note": "The central virtue word of Tamil ethical literature; அன்பன்/அன்பு with a name is a common sign-off in letters."
  },
  {
    "w": "நன்றி",
    "r": "naṉṟi",
    "m": "thanks, gratitude",
    "pos": "noun",
    "ex": "உங்கள் உதவிக்கு நன்றி.",
    "exr": "uṅgaḷ udhavikku naṉṟi.",
    "exm": "Thank you for your help.",
    "note": "Also means 'a good deed done'; the Thirukkural devotes a whole chapter to not forgetting நன்றி."
  },
  {
    "w": "அமைதி",
    "r": "amaidhi",
    "m": "peace, calm, quiet",
    "pos": "noun",
    "ex": "கடற்கரையில் அமைதி நிலவியது.",
    "exr": "kaḍaṟkaraiyil amaidhi nilaviyadhu.",
    "exm": "Calm prevailed on the seashore.",
    "note": "Used both for silence in a room and for peace between people or countries."
  },
  {
    "w": "முயற்சி",
    "r": "muyaṟci",
    "m": "effort, sustained attempt",
    "pos": "noun",
    "ex": "முயற்சி இல்லாமல் வெற்றி இல்லை.",
    "exr": "muyaṟci illāmal veṭṟi illai.",
    "exm": "There is no victory without effort.",
    "note": "The Thirukkural couplet 'முயற்சி திருவினையாக்கும்' holds that effort creates wealth."
  },
  {
    "w": "நம்பிக்கை",
    "r": "nambikkai",
    "m": "trust; also hope",
    "pos": "noun",
    "ex": "அவர் மீது எனக்கு நம்பிக்கை உண்டு.",
    "exr": "avar mīdhu enakku nambikkai uṇḍu.",
    "exm": "I have trust in him.",
    "note": "One word covers both trust and hope — the sense is fixed by the sentence around it."
  },
  {
    "w": "பொறுமை",
    "r": "poṟumai",
    "m": "patience, forbearance",
    "pos": "noun",
    "ex": "பொறுமையுடன் காத்திருக்க வேண்டும்.",
    "exr": "poṟumaiyuḍan kāttirukka vēṇḍum.",
    "exm": "One must wait with patience.",
    "note": "From பொறு, to bear — patience framed as bearing rather than waiting."
  },
  {
    "w": "உண்மை",
    "r": "uṇmai",
    "m": "truth",
    "pos": "noun",
    "ex": "உண்மை ஒருநாள் வெளிவரும்.",
    "exr": "uṇmai orunāḷ veḷivarum.",
    "exm": "The truth will come out one day.",
    "note": "From உள், to exist — literally 'that which is'."
  },
  {
    "w": "கனவு",
    "r": "kanavu",
    "m": "dream, both while asleep and as an ambition",
    "pos": "noun",
    "ex": "அவளுடைய கனவு மருத்துவர் ஆவது.",
    "exr": "avaḷuḍaiya kanavu maruthuvar āvadhu.",
    "exm": "Her dream is to become a doctor.",
    "note": "Its pair is நனவு (nanavu), the waking state."
  },
  {
    "w": "மகிழ்ச்சி",
    "r": "magizhchi",
    "m": "happiness, gladness",
    "pos": "noun",
    "ex": "இந்த செய்தி எனக்கு மகிழ்ச்சி அளித்தது.",
    "exr": "indha seydhi enakku magizhchi aḷitthadhu.",
    "exm": "This news gave me happiness.",
    "note": "The zh here is the retroflex ழ, a sound distinctive to Tamil and Malayalam."
  },
  {
    "w": "துணிவு",
    "r": "thuṇivu",
    "m": "boldness, the nerve to act",
    "pos": "noun",
    "ex": "துணிவுடன் உண்மையைச் சொன்னார்.",
    "exr": "thuṇivuḍan uṇmaiyai-c connār.",
    "exm": "He told the truth boldly.",
    "note": "Distinct from தைரியம் (courage in the face of fear); துணிவு is decisiveness."
  },
  {
    "w": "கல்வி",
    "r": "kalvi",
    "m": "education, learning",
    "pos": "noun",
    "ex": "கல்வி ஒருவனுக்கு சிறந்த செல்வம்.",
    "exr": "kalvi oruvanukku ciṟandha celvam.",
    "exm": "Education is a person's finest wealth.",
    "note": "The Thirukkural treats கல்வி as the one form of wealth that cannot be taken away."
  },
  {
    "w": "உழைப்பு",
    "r": "uzhaippu",
    "m": "labour, hard work",
    "pos": "noun",
    "ex": "உழைப்பே உயர்வுக்கு வழி.",
    "exr": "uzhaippē uyarvukku vazhi.",
    "exm": "Labour is the road to rising.",
    "note": "உழு originally means to plough — the word carries the sense of physical toil."
  },
  {
    "w": "இனிமை",
    "r": "inimai",
    "m": "sweetness, pleasantness",
    "pos": "noun",
    "ex": "அவர் பேச்சில் இனிமை இருந்தது.",
    "exr": "avar pēccil inimai irundhadhu.",
    "exm": "There was sweetness in his speech.",
    "note": "Used mostly of speech, music and manner rather than of taste."
  },
  {
    "w": "நட்பு",
    "r": "naṭpu",
    "m": "friendship",
    "pos": "noun",
    "ex": "நல்ல நட்பு வாழ்நாள் முழுவதும் நீடிக்கும்.",
    "exr": "nalla naṭpu vāzhnāḷ muzhuvadhum nīḍikkum.",
    "exm": "A good friendship lasts a lifetime.",
    "note": "Classical Tamil poetics discusses நட்பு at length, including how to test it before trusting it."
  },
  {
    "w": "அறிவு",
    "r": "aṟivu",
    "m": "knowledge, intelligence",
    "pos": "noun",
    "ex": "அறிவு செல்வத்தை விட மேலானது.",
    "exr": "aṟivu celvaththai viḍa mēlānadhu.",
    "exm": "Knowledge is above wealth.",
    "note": "From அறி, to know. அறிவியல் (aṟiviyal) is the modern Tamil word for science."
  },
  {
    "w": "பணிவு",
    "r": "paṇivu",
    "m": "humility, deference",
    "pos": "noun",
    "ex": "பணிவு மனிதனை உயர்த்தும்.",
    "exr": "paṇivu manidhanai uyarththum.",
    "exm": "Humility raises a person.",
    "note": "From பணி, to bow or to serve — the same root gives பணி, work or duty."
  },
  {
    "w": "விடியல்",
    "r": "viḍiyal",
    "m": "dawn, daybreak; also a new beginning",
    "pos": "noun",
    "ex": "விடியலுக்குப் பின் இருள் நீங்கும்.",
    "exr": "viḍiyalukkup pin iruḷ nīṅgum.",
    "exm": "After dawn the darkness lifts.",
    "note": "Very common as a political and cinematic metaphor for change."
  },
  {
    "w": "தெளிவு",
    "r": "theḷivu",
    "m": "clarity, of thought or of liquid",
    "pos": "noun",
    "ex": "அவரது விளக்கத்தில் தெளிவு இருந்தது.",
    "exr": "avaradhu viḷakkaththil theḷivu irundhadhu.",
    "exm": "There was clarity in his explanation.",
    "note": "The same word describes water that has settled and become clear."
  },
  {
    "w": "ஆர்வம்",
    "r": "ārvam",
    "m": "keen interest, enthusiasm",
    "pos": "noun",
    "ex": "அவனுக்குக் கணிதத்தில் ஆர்வம் அதிகம்.",
    "exr": "avanukku-k gaṇidhaththil ārvam adhigam.",
    "exm": "He has a great interest in mathematics.",
    "note": "Takes the locative -இல் for the subject of the interest."
  },
  {
    "w": "கருணை",
    "r": "karuṇai",
    "m": "compassion, mercy",
    "pos": "noun",
    "ex": "விலங்குகளிடம் கருணை காட்டுங்கள்.",
    "exr": "vilaṅgugaḷiḍam karuṇai kāṭṭuṅgaḷ.",
    "exm": "Show compassion to animals.",
    "note": "A Sanskrit-derived word fully naturalised in Tamil; அருள் (aruḷ) is the older Tamil equivalent."
  },
  {
    "w": "வளர்ச்சி",
    "r": "vaḷarcci",
    "m": "growth, development",
    "pos": "noun",
    "ex": "நகரத்தின் வளர்ச்சி வேகமாக உள்ளது.",
    "exr": "nagaraththin vaḷarcci vēgamāga uḷḷadhu.",
    "exm": "The city's growth is rapid.",
    "note": "From வளர், to grow — used for children, plants and economies alike."
  },
  {
    "w": "இயற்கை",
    "r": "iyaṟkai",
    "m": "nature; also the natural state of a thing",
    "pos": "noun",
    "ex": "இயற்கையைப் பாதுகாப்பது நம் கடமை.",
    "exr": "iyaṟkaiyai-p pādhukāppadhu nam kaḍamai.",
    "exm": "Protecting nature is our duty.",
    "note": "Its counterpart செயற்கை (ceyaṟkai) means artificial or man-made."
  },
  {
    "w": "நினைவு",
    "r": "ninaivu",
    "m": "memory, remembrance",
    "pos": "noun",
    "ex": "பள்ளி நாட்களின் நினைவு இனிமையானது.",
    "exr": "paḷḷi nāṭkaḷin ninaivu inimaiyānadhu.",
    "exm": "The memory of school days is sweet.",
    "note": "நினைவு நாள் is a remembrance day or anniversary of a death."
  },
  {
    "w": "துயரம்",
    "r": "thuyaram",
    "m": "sorrow, grief",
    "pos": "noun",
    "ex": "அவரது துயரம் புரிந்தது.",
    "exr": "avaradhu thuyaram purindhadhu.",
    "exm": "His sorrow was understood.",
    "note": "Heavier than வருத்தம் (sadness, regret); துயரம் is used for bereavement."
  },
  {
    "w": "விருந்து",
    "r": "virundhu",
    "m": "a feast; hospitality offered to a guest",
    "pos": "noun",
    "ex": "விருந்தினருக்கு விருந்து அளித்தார்.",
    "exr": "virundhinarukku virundhu aḷiththār.",
    "exm": "He gave a feast for the guests.",
    "note": "விருந்தோம்பல், the duty of hosting guests, has its own chapter in the Thirukkural."
  },
  {
    "w": "திறமை",
    "r": "thiṟamai",
    "m": "skill, ability",
    "pos": "noun",
    "ex": "அவரது திறமை அனைவரையும் வியக்க வைத்தது.",
    "exr": "avaradhu thiṟamai anaivaraiyum viyakka vaiththadhu.",
    "exm": "His skill amazed everyone.",
    "note": "From திற, to open or to be capable — the sense is capacity, not training."
  },
  {
    "w": "விழிப்பு",
    "r": "vizhippu",
    "m": "wakefulness; public awareness",
    "pos": "noun",
    "ex": "சாலைப் பாதுகாப்பு குறித்த விழிப்பு அவசியம்.",
    "exr": "cālai-p pādhukāppu kuṟiththa vizhippu avaciyam.",
    "exm": "Awareness about road safety is essential.",
    "note": "விழிப்புணர்வு (vizhippuṇarvu) is the standard term in awareness campaigns."
  },
  {
    "w": "சுதந்திரம்",
    "r": "sudhandhiram",
    "m": "freedom, independence",
    "pos": "noun",
    "ex": "சுதந்திரம் நமது உரிமை.",
    "exr": "sudhandhiram namadhu urimai.",
    "exm": "Freedom is our right.",
    "note": "Used for national independence and personal liberty alike; உரிமை is 'right'."
  },
  {
    "w": "ஒற்றுமை",
    "r": "oṭṟumai",
    "m": "unity",
    "pos": "noun",
    "ex": "ஒற்றுமையே பலம்.",
    "exr": "oṭṟumaiyē balam.",
    "exm": "Unity itself is strength.",
    "note": "From ஒன்று, one. The -ē suffix in the example adds emphasis: 'unity alone'."
  },
  {
    "w": "பாசம்",
    "r": "pācam",
    "m": "attachment, familial affection",
    "pos": "noun",
    "ex": "தாய்க்கு குழந்தை மீது பாசம் அதிகம்.",
    "exr": "thāykku kuzhandhai mīdhu pācam adhigam.",
    "exm": "A mother has great affection for her child.",
    "note": "Warmer and more binding than அன்பு; பாசம் implies a tie you cannot easily cut."
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
