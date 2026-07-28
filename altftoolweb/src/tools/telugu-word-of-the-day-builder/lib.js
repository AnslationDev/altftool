/**
 * Telugu word of the day.
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
export const LANGUAGE = "Telugu";

/** Writing system the headword is printed in. */
export const SCRIPT = "Telugu";

/**
 * The curated deck. One full rotation takes WORDS.length days, after which the
 * cycle repeats — long enough that a daily learner sees a month of new words.
 * Each entry: w = headword, r = romanisation, m = meaning, pos = part of
 * speech, ex = example sentence, exr = example in roman, exm = English gloss,
 * note = usage or etymology note.
 */
export const WORDS = [
  {
    "w": "ప్రేమ",
    "r": "prema",
    "m": "love",
    "pos": "noun",
    "ex": "అమ్మ ప్రేమకు సాటి లేదు.",
    "exr": "amma premaku sāṭi lēdu.",
    "exm": "There is no match for a mother's love.",
    "note": "సాటి లేదు, 'there is no equal', is a fixed Telugu idiom for something beyond comparison."
  },
  {
    "w": "ఆనందం",
    "r": "ānandaṁ",
    "m": "joy, happiness",
    "pos": "noun",
    "ex": "ఈ వార్త విని చాలా ఆనందం కలిగింది.",
    "exr": "ī vārta vini chālā ānandaṁ kaligindi.",
    "exm": "Hearing this news brought great joy.",
    "note": "కలగడం, 'to arise', is the usual verb with feelings in Telugu — joy happens to you."
  },
  {
    "w": "స్నేహం",
    "r": "snēhaṁ",
    "m": "friendship",
    "pos": "noun",
    "ex": "మంచి స్నేహం జీవితాంతం ఉంటుంది.",
    "exr": "manchi snēhaṁ jīvitāntaṁ uṇṭundi.",
    "exm": "A good friendship lasts a lifetime.",
    "note": "The Sanskrit root means oil or smoothness — friendship as what makes things run without friction."
  },
  {
    "w": "కృతజ్ఞత",
    "r": "kr̥tajñata",
    "m": "gratitude",
    "pos": "noun",
    "ex": "మీ సహాయానికి కృతజ్ఞతలు.",
    "exr": "mī sahāyāniki kr̥tajñatalu.",
    "exm": "Thanks for your help.",
    "note": "Usually said in the plural, కృతజ్ఞతలు, much as English says 'thanks' rather than 'thank'."
  },
  {
    "w": "ధైర్యం",
    "r": "dhairyaṁ",
    "m": "courage",
    "pos": "noun",
    "ex": "కష్ట సమయంలో ధైర్యం కోల్పోవద్దు.",
    "exr": "kaṣṭa samayaṁlō dhairyaṁ kōlpōvaddu.",
    "exm": "Do not lose courage in hard times.",
    "note": "ధైర్యం చెప్పడం, 'to speak courage', means to reassure someone."
  },
  {
    "w": "ఓర్పు",
    "r": "ōrpu",
    "m": "patience, forbearance",
    "pos": "noun",
    "ex": "ఓర్పుతో ఎదురు చూడాలి.",
    "exr": "ōrputō eduru chūḍāli.",
    "exm": "One must wait with patience.",
    "note": "A native Telugu word rather than a Sanskrit loan, from ఓర్చు, to bear."
  },
  {
    "w": "నమ్మకం",
    "r": "nammakaṁ",
    "m": "trust, belief",
    "pos": "noun",
    "ex": "సంబంధాలకు నమ్మకమే పునాది.",
    "exr": "sambandhālaku nammakamē punādi.",
    "exm": "Trust is the very foundation of relationships.",
    "note": "The -ఏ suffix in నమ్మకమే adds emphasis: 'trust and nothing else'."
  },
  {
    "w": "కల",
    "r": "kala",
    "m": "dream",
    "pos": "noun",
    "ex": "డాక్టర్ కావాలన్నది ఆమె కల.",
    "exr": "ḍākṭar kāvālannadi āme kala.",
    "exm": "To become a doctor is her dream.",
    "note": "Covers both dreams in sleep and life ambitions, as English 'dream' does."
  },
  {
    "w": "పట్టుదల",
    "r": "paṭṭudala",
    "m": "determination, persistence",
    "pos": "noun",
    "ex": "పట్టుదలతో చదివితే విజయం ఖాయం.",
    "exr": "paṭṭudalatō chadivitē vijayaṁ khāyaṁ.",
    "exm": "If you study with determination, success is certain.",
    "note": "From పట్టు, grip — determination imagined as holding on and not letting go."
  },
  {
    "w": "వినయం",
    "r": "vinayaṁ",
    "m": "humility, well-mannered modesty",
    "pos": "noun",
    "ex": "విద్య వినయాన్ని ఇస్తుంది.",
    "exr": "vidya vinayānni istundi.",
    "exm": "Education gives humility.",
    "note": "వినయ విధేయుడు, 'humble and obedient', is the traditional sign-off in a formal Telugu letter."
  },
  {
    "w": "ఆశ",
    "r": "āśa",
    "m": "hope; also desire",
    "pos": "noun",
    "ex": "ఆశే మనిషిని నడిపిస్తుంది.",
    "exr": "āśē maniṣini naḍipistundi.",
    "exm": "It is hope that drives a person on.",
    "note": "Context decides between hope and craving; ఆశపడు means to covet."
  },
  {
    "w": "జ్ఞాపకం",
    "r": "jñāpakaṁ",
    "m": "memory, a remembered thing",
    "pos": "noun",
    "ex": "చిన్ననాటి జ్ఞాపకాలు తీపి గుర్తులు.",
    "exr": "chinnanāṭi jñāpakālu tīpi gurtulu.",
    "exm": "Childhood memories are sweet recollections.",
    "note": "జ్ఞాపకం ఉంచుకో means 'keep it in mind', used as a mild warning as well as a reminder."
  },
  {
    "w": "దయ",
    "r": "daya",
    "m": "compassion, mercy",
    "pos": "noun",
    "ex": "జంతువుల పట్ల దయ చూపండి.",
    "exr": "jantuvula paṭla daya chūpaṇḍi.",
    "exm": "Show compassion towards animals.",
    "note": "దయచేసి, literally 'having done kindness', is the standard Telugu word for 'please'."
  },
  {
    "w": "ఉత్సాహం",
    "r": "utsāhaṁ",
    "m": "enthusiasm, spirited energy",
    "pos": "noun",
    "ex": "పిల్లలు ఉత్సాహంగా పాల్గొన్నారు.",
    "exr": "pillalu utsāhaṁgā pālgonnāru.",
    "exm": "The children participated enthusiastically.",
    "note": "The -గా suffix turns the noun into an adverb, as English '-ly' does."
  },
  {
    "w": "నిజం",
    "r": "nijaṁ",
    "m": "truth",
    "pos": "noun",
    "ex": "నిజం ఎప్పటికైనా బయటపడుతుంది.",
    "exr": "nijaṁ eppaṭikainā bayaṭapaḍutundi.",
    "exm": "The truth comes out sooner or later.",
    "note": "నిజంగా means 'really' and is one of the most-used words in spoken Telugu."
  },
  {
    "w": "శాంతి",
    "r": "śānti",
    "m": "peace, calm",
    "pos": "noun",
    "ex": "మనసుకు శాంతి కావాలి.",
    "exr": "manasuku śānti kāvāli.",
    "exm": "The mind needs peace.",
    "note": "Used for inner calm and for peace between people or nations alike."
  },
  {
    "w": "అభిమానం",
    "r": "abhimānaṁ",
    "m": "fond regard, devoted admiration",
    "pos": "noun",
    "ex": "అభిమానులు ఆయనను ఎంతో గౌరవిస్తారు.",
    "exr": "abhimānulu āyananu entō gauravistāru.",
    "exm": "His admirers hold him in great respect.",
    "note": "అభిమాని is the standard Telugu word for a fan — of a film star, a cricketer or a writer."
  },
  {
    "w": "బాధ్యత",
    "r": "bādhyata",
    "m": "responsibility, obligation",
    "pos": "noun",
    "ex": "ప్రతి పౌరుడికి బాధ్యత ఉంది.",
    "exr": "prati pauruḍiki bādhyata undi.",
    "exm": "Every citizen has a responsibility.",
    "note": "బాధ్యుడు means the person answerable for something."
  },
  {
    "w": "గౌరవం",
    "r": "gauravaṁ",
    "m": "respect, honour",
    "pos": "noun",
    "ex": "పెద్దలను గౌరవించాలి.",
    "exr": "peddalanu gauravinchāli.",
    "exm": "One should respect elders.",
    "note": "From Sanskrit guru, weighty — respect as the weight you grant someone."
  },
  {
    "w": "ఆత్మవిశ్వాసం",
    "r": "ātmaviśvāsaṁ",
    "m": "self-confidence",
    "pos": "noun",
    "ex": "ఆత్మవిశ్వాసం ఉంటే భయం ఉండదు.",
    "exr": "ātmaviśvāsaṁ uṇṭē bhayaṁ uṇḍadu.",
    "exm": "If there is self-confidence, there is no fear.",
    "note": "ātma (self) + viśvāsa (belief); the same compound works across most Indian languages."
  },
  {
    "w": "సహనం",
    "r": "sahanaṁ",
    "m": "tolerance, the capacity to bear",
    "pos": "noun",
    "ex": "సహనం గొప్ప గుణం.",
    "exr": "sahanaṁ goppa guṇaṁ.",
    "exm": "Tolerance is a great quality.",
    "note": "Close to ఓర్పు but more often used of tolerating people and views rather than waiting."
  },
  {
    "w": "ఏకాగ్రత",
    "r": "ēkāgrata",
    "m": "concentration, focused attention",
    "pos": "noun",
    "ex": "చదువుకు ఏకాగ్రత ముఖ్యం.",
    "exr": "chaduvuku ēkāgrata mukhyaṁ.",
    "exm": "Concentration is essential for study.",
    "note": "eka (one) + agra (tip, point) — attention brought to a single point."
  },
  {
    "w": "మమకారం",
    "r": "mamakāraṁ",
    "m": "attachment born of treating something as one's own",
    "pos": "noun",
    "ex": "పాత ఇంటిపై ఆమెకు మమకారం.",
    "exr": "pāta iṇṭipai āmeku mamakāraṁ.",
    "exm": "She has an attachment to the old house.",
    "note": "From mama, 'mine' — literally the making of something into 'mine'."
  },
  {
    "w": "కుతూహలం",
    "r": "kutūhalaṁ",
    "m": "curiosity",
    "pos": "noun",
    "ex": "పిల్లల్లో కుతూహలం సహజం.",
    "exr": "pillallō kutūhalaṁ sahajaṁ.",
    "exm": "Curiosity in children is natural.",
    "note": "సహజం means natural or innate, and pairs with this word constantly."
  },
  {
    "w": "త్యాగం",
    "r": "tyāgaṁ",
    "m": "sacrifice, giving something up for another",
    "pos": "noun",
    "ex": "తల్లిదండ్రుల త్యాగం మరువరాదు.",
    "exr": "tallidaṇḍrula tyāgaṁ maruvarādu.",
    "exm": "One should not forget the sacrifice of one's parents.",
    "note": "Root: √tyaj, to abandon. Also the name of the composer Tyagaraja, 'king of renunciation'."
  },
  {
    "w": "నిశ్శబ్దం",
    "r": "niśśabdaṁ",
    "m": "silence, absence of sound",
    "pos": "noun",
    "ex": "గదిలో నిశ్శబ్దం అలముకుంది.",
    "exr": "gadilō niśśabdaṁ alamukundi.",
    "exm": "Silence settled over the room.",
    "note": "niḥ (without) + śabda (sound); the doubled శ్శ marks the assimilated sandhi."
  },
  {
    "w": "సంతోషం",
    "r": "santōṣaṁ",
    "m": "happiness, contentment",
    "pos": "noun",
    "ex": "చిన్న విషయాల్లోనే సంతోషం ఉంది.",
    "exr": "chinna viṣayāllōnē santōṣaṁ undi.",
    "exm": "Happiness lies in small things.",
    "note": "Slightly quieter than ఆనందం — santōṣaṁ is being pleased, ānandaṁ is delight."
  },
  {
    "w": "అవగాహన",
    "r": "avagāhana",
    "m": "understanding, informed awareness",
    "pos": "noun",
    "ex": "ఈ విషయంపై అవగాహన అవసరం.",
    "exr": "ī viṣayaṁpai avagāhana avasaraṁ.",
    "exm": "Awareness about this subject is necessary.",
    "note": "The standard term in Telugu public-awareness campaigns: అవగాహన సదస్సు, an awareness meeting."
  },
  {
    "w": "వినోదం",
    "r": "vinōdaṁ",
    "m": "entertainment, diversion",
    "pos": "noun",
    "ex": "సినిమా మంచి వినోదాన్ని ఇచ్చింది.",
    "exr": "sinimā manchi vinōdānni ichchindi.",
    "exm": "The film provided good entertainment.",
    "note": "వినోద పన్ను is the Telugu term for entertainment tax."
  },
  {
    "w": "కృషి",
    "r": "kr̥ṣi",
    "m": "sustained effort; also agriculture",
    "pos": "noun",
    "ex": "ఆయన కృషి వల్లే ఈ విజయం సాధ్యమైంది.",
    "exr": "āyana kr̥ṣi vallē ī vijayaṁ sādhyamaindi.",
    "exm": "This success was possible only because of his effort.",
    "note": "The literal sense is ploughing, from √kṛṣ — effort pictured as tilling the ground."
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
