/**
 * Sanskrit word of the day.
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
export const LANGUAGE = "Sanskrit";

/** Writing system the headword is printed in. */
export const SCRIPT = "Devanagari";

/**
 * The curated deck. One full rotation takes WORDS.length days, after which the
 * cycle repeats — long enough that a daily learner sees a month of new words.
 * Each entry: w = headword, r = romanisation, m = meaning, pos = part of
 * speech, ex = example sentence, exr = example in roman, exm = English gloss,
 * note = usage or etymology note.
 */
export const WORDS = [
  {
    "w": "सत्यम्",
    "r": "satyam",
    "m": "truth, that which really is",
    "pos": "noun (neuter)",
    "ex": "सत्यमेव जयते नानृतम्।",
    "exr": "satyam eva jayate nānṛtam.",
    "exm": "Truth alone triumphs, not falsehood.",
    "note": "Root: √as, to be, with the suffix -tya. The line is from the Muṇḍaka Upaniṣad (3.1.6) and is India's national motto."
  },
  {
    "w": "शान्तिः",
    "r": "śāntiḥ",
    "m": "peace, the stilling of disturbance",
    "pos": "noun (feminine)",
    "ex": "ॐ शान्तिः शान्तिः शान्तिः।",
    "exr": "oṁ śāntiḥ śāntiḥ śāntiḥ.",
    "exm": "Om, peace, peace, peace.",
    "note": "Root: √śam, to become quiet. The threefold repetition closes many Upaniṣadic recitations, invoking peace on three levels of disturbance."
  },
  {
    "w": "धर्मः",
    "r": "dharmaḥ",
    "m": "that which upholds — duty, moral order, law",
    "pos": "noun (masculine)",
    "ex": "धारणाद् धर्म इत्याहुः।",
    "exr": "dhāraṇād dharma ity āhuḥ.",
    "exm": "They call it dharma because it upholds.",
    "note": "Root: √dhṛ, to hold or support. The gloss quoted here is from the Mahābhārata and is the standard traditional etymology."
  },
  {
    "w": "विद्या",
    "r": "vidyā",
    "m": "knowledge, a branch of learning",
    "pos": "noun (feminine)",
    "ex": "विद्या ददाति विनयम्।",
    "exr": "vidyā dadāti vinayam.",
    "exm": "Knowledge gives humility.",
    "note": "Root: √vid, to know — the same root as English 'wit'. The line opens a much-quoted subhāṣita on what learning leads to."
  },
  {
    "w": "अहिंसा",
    "r": "ahiṁsā",
    "m": "non-injury, refusal to harm",
    "pos": "noun (feminine)",
    "ex": "अहिंसा परमो धर्मः।",
    "exr": "ahiṁsā paramo dharmaḥ.",
    "exm": "Non-violence is the highest duty.",
    "note": "a (not) + √hiṁs (to injure). The phrase appears in the Mahābhārata and became central to Gandhi's political vocabulary."
  },
  {
    "w": "गुरुः",
    "r": "guruḥ",
    "m": "teacher; literally 'heavy, weighty'",
    "pos": "noun (masculine)",
    "ex": "गुरुर्ब्रह्मा गुरुर्विष्णुः।",
    "exr": "gurur brahmā gurur viṣṇuḥ.",
    "exm": "The teacher is Brahmā, the teacher is Viṣṇu.",
    "note": "The literal sense survives in Sanskrit prosody, where a guru syllable is a heavy one. The verse is the opening of the traditional Guru Stotram."
  },
  {
    "w": "आनन्दः",
    "r": "ānandaḥ",
    "m": "bliss, deep joy",
    "pos": "noun (masculine)",
    "ex": "आनन्दाद्ध्येव खल्विमानि भूतानि जायन्ते।",
    "exr": "ānandād dhy eva khalv imāni bhūtāni jāyante.",
    "exm": "From bliss indeed all these beings are born.",
    "note": "ā + √nand, to rejoice. The line is from the Ānandavallī section of the Taittirīya Upaniṣad."
  },
  {
    "w": "करुणा",
    "r": "karuṇā",
    "m": "compassion, pity for another's suffering",
    "pos": "noun (feminine)",
    "ex": "करुणा सर्वभूतेषु सन्तोषो यस्य कस्यचित्।",
    "exr": "karuṇā sarvabhūteṣu santoṣo yasya kasyacit.",
    "exm": "Compassion towards all beings, contentment with whatever comes.",
    "note": "Also the name of one of the eight rasas of Bharata's Nāṭyaśāstra — karuṇa rasa, the sentiment of pathos."
  },
  {
    "w": "तपस्",
    "r": "tapas",
    "m": "disciplined austerity; literally 'heat'",
    "pos": "noun (neuter)",
    "ex": "तपसा ब्रह्म विजिज्ञासस्व।",
    "exr": "tapasā brahma vijijñāsasva.",
    "exm": "Seek to know Brahman through tapas.",
    "note": "Root: √tap, to burn or heat. In the Taittirīya Upaniṣad, Varuṇa gives this instruction to his son Bhṛgu."
  },
  {
    "w": "श्रद्धा",
    "r": "śraddhā",
    "m": "faith, trusting confidence",
    "pos": "noun (feminine)",
    "ex": "श्रद्धामयोऽयं पुरुषः।",
    "exr": "śraddhāmayo 'yaṁ puruṣaḥ.",
    "exm": "A person is made of their faith.",
    "note": "śrat (heart, trust) + √dhā (to place) — literally 'placing one's heart on'. Bhagavad Gītā 17.3."
  },
  {
    "w": "सन्तोषः",
    "r": "santoṣaḥ",
    "m": "contentment with what one has",
    "pos": "noun (masculine)",
    "ex": "सन्तोषादनुत्तमः सुखलाभः।",
    "exr": "santoṣād anuttamaḥ sukhalābhaḥ.",
    "exm": "From contentment comes unsurpassed happiness.",
    "note": "sam + √tuṣ, to be satisfied. Listed as the second niyama in Patañjali's Yoga Sūtra (2.32); the line quoted is 2.42."
  },
  {
    "w": "मौनम्",
    "r": "maunam",
    "m": "silence, especially chosen silence",
    "pos": "noun (neuter)",
    "ex": "मौनं सर्वार्थसाधनम्।",
    "exr": "maunaṁ sarvārthasādhanam.",
    "exm": "Silence accomplishes every purpose.",
    "note": "Derived from muni, a sage — silence as the sage's practice. The line is a widely quoted subhāṣita."
  },
  {
    "w": "उद्यमः",
    "r": "udyamaḥ",
    "m": "effort, enterprise, taking something up",
    "pos": "noun (masculine)",
    "ex": "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।",
    "exr": "udyamena hi sidhyanti kāryāṇi na manorathaiḥ.",
    "exm": "Tasks are accomplished by effort, not by wishing.",
    "note": "ud + √yam, to lift up or take up. The verse continues: sleeping lions do not find deer in their mouths."
  },
  {
    "w": "क्षमा",
    "r": "kṣamā",
    "m": "forgiveness; also patient endurance",
    "pos": "noun (feminine)",
    "ex": "क्षमा वीरस्य भूषणम्।",
    "exr": "kṣamā vīrasya bhūṣaṇam.",
    "exm": "Forgiveness is the ornament of the brave.",
    "note": "Root: √kṣam, to bear. The same word names the earth as the one who bears everything."
  },
  {
    "w": "विवेकः",
    "r": "vivekaḥ",
    "m": "discernment, telling one thing from another",
    "pos": "noun (masculine)",
    "ex": "विवेकेन कार्यमारभेत।",
    "exr": "vivekena kāryam ārabheta.",
    "exm": "One should begin a task with discernment.",
    "note": "vi + √vic, to separate. The Vivekacūḍāmaṇi, 'the crest-jewel of discrimination', is named for it."
  },
  {
    "w": "वैराग्यम्",
    "r": "vairāgyam",
    "m": "dispassion, freedom from craving",
    "pos": "noun (neuter)",
    "ex": "अभ्यासवैराग्याभ्यां तन्निरोधः।",
    "exr": "abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ.",
    "exm": "That stilling comes through practice and dispassion.",
    "note": "From vi + rāga, colouring or passion — literally 'de-colouring'. Yoga Sūtra 1.12."
  },
  {
    "w": "अभ्यासः",
    "r": "abhyāsaḥ",
    "m": "repeated practice",
    "pos": "noun (masculine)",
    "ex": "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते।",
    "exr": "abhyāsena tu kaunteya vairāgyeṇa ca gṛhyate.",
    "exm": "By practice and by dispassion, Arjuna, it is held.",
    "note": "abhi + √as, to sit at or apply oneself to. Bhagavad Gītā 6.35, Krishna's answer on the restless mind."
  },
  {
    "w": "समता",
    "r": "samatā",
    "m": "evenness of mind in success and failure",
    "pos": "noun (feminine)",
    "ex": "समत्वं योग उच्यते।",
    "exr": "samatvaṁ yoga ucyate.",
    "exm": "Evenness of mind is called yoga.",
    "note": "From sama, equal. Bhagavad Gītā 2.48 defines yoga itself by this quality."
  },
  {
    "w": "ऋतम्",
    "r": "ṛtam",
    "m": "cosmic order; truth as the way things rightly run",
    "pos": "noun (neuter)",
    "ex": "ऋतं च सत्यं चाभीद्धात् तपसोऽध्यजायत।",
    "exr": "ṛtaṁ ca satyaṁ cābhīddhāt tapaso 'dhyajāyata.",
    "exm": "Order and truth were born of blazing tapas.",
    "note": "A Vedic concept older than dharma; the line opens Ṛgveda 10.190. ṛta is order in the world, satya is truth in speech."
  },
  {
    "w": "ओजस्",
    "r": "ojas",
    "m": "vigour, vital strength",
    "pos": "noun (neuter)",
    "ex": "ओजसा सह वर्धताम्।",
    "exr": "ojasā saha vardhatām.",
    "exm": "May it grow together with vigour.",
    "note": "Cognate with Latin augeo and English 'augment'. In Āyurveda, ojas is the refined essence that sustains immunity."
  },
  {
    "w": "प्रज्ञा",
    "r": "prajñā",
    "m": "wisdom, insight that has become steady",
    "pos": "noun (feminine)",
    "ex": "प्रज्ञानं ब्रह्म।",
    "exr": "prajñānaṁ brahma.",
    "exm": "Consciousness is Brahman.",
    "note": "pra + √jñā, to know fully. This mahāvākya is from the Aitareya Upaniṣad (3.3) of the Ṛgveda."
  },
  {
    "w": "स्मृतिः",
    "r": "smṛtiḥ",
    "m": "memory; also the body of 'remembered' texts",
    "pos": "noun (feminine)",
    "ex": "स्मृतिलम्भे सम्यग्ज्ञानम्।",
    "exr": "smṛti-lambhe samyag-jñānam.",
    "exm": "When memory is regained, right knowledge follows.",
    "note": "Root: √smṛ, to remember. Smṛti texts are contrasted with śruti, that which was 'heard' and is held to be revealed."
  },
  {
    "w": "दानम्",
    "r": "dānam",
    "m": "giving, the act of a gift",
    "pos": "noun (neuter)",
    "ex": "दाम्यत दत्त दयध्वम्।",
    "exr": "dāmyata datta dayadhvam.",
    "exm": "Restrain yourselves, give, be compassionate.",
    "note": "Root: √dā, to give — cognate with Latin donum. The three commands are from Bṛhadāraṇyaka Upaniṣad 5.2, quoted by T. S. Eliot in The Waste Land."
  },
  {
    "w": "मैत्री",
    "r": "maitrī",
    "m": "friendliness, loving-kindness towards all",
    "pos": "noun (feminine)",
    "ex": "मैत्रीकरुणामुदितोपेक्षाणां भावनातः।",
    "exr": "maitrī-karuṇā-muditopekṣāṇāṁ bhāvanātaḥ.",
    "exm": "By cultivating friendliness, compassion, joy and equanimity.",
    "note": "From mitra, friend. Yoga Sūtra 1.33 names these four attitudes; Buddhism knows the same set as the brahmavihāras."
  },
  {
    "w": "मुदिता",
    "r": "muditā",
    "m": "gladness at another's good fortune",
    "pos": "noun (feminine)",
    "ex": "सुखिषु मुदिता भावनीया।",
    "exr": "sukhiṣu muditā bhāvanīyā.",
    "exm": "Towards the happy, gladness should be cultivated.",
    "note": "Root: √mud, to rejoice. Yoga Sūtra 1.33 prescribes it specifically as the antidote to envy."
  },
  {
    "w": "उपेक्षा",
    "r": "upekṣā",
    "m": "equanimity; looking on without being pulled in",
    "pos": "noun (feminine)",
    "ex": "अपुण्यवतामुपेक्षा।",
    "exr": "apuṇyavatām upekṣā.",
    "exm": "Towards the ill-behaved, equanimity.",
    "note": "upa + √īkṣ, to look near. In modern Hindi the same word has narrowed to mean neglect."
  },
  {
    "w": "निष्ठा",
    "r": "niṣṭhā",
    "m": "steadfast standing in something; firm commitment",
    "pos": "noun (feminine)",
    "ex": "लोकेऽस्मिन् द्विविधा निष्ठा।",
    "exr": "loke 'smin dvividhā niṣṭhā.",
    "exm": "In this world there are two kinds of steadfastness.",
    "note": "ni + √sthā, to stand firmly. Bhagavad Gītā 3.3 distinguishes the path of knowledge from the path of action."
  },
  {
    "w": "सङ्कल्पः",
    "r": "saṅkalpaḥ",
    "m": "resolve; a formally stated intention",
    "pos": "noun (masculine)",
    "ex": "सर्वे सङ्कल्पजाः कामाः।",
    "exr": "sarve saṅkalpajāḥ kāmāḥ.",
    "exm": "All desires are born of intention.",
    "note": "sam + √kḷp, to arrange. The saṅkalpa spoken before a ritual states who is doing what, and why."
  },
  {
    "w": "अमृतम्",
    "r": "amṛtam",
    "m": "the deathless; nectar of immortality",
    "pos": "noun (neuter)",
    "ex": "मृत्योर्मा अमृतं गमय।",
    "exr": "mṛtyor mā amṛtaṁ gamaya.",
    "exm": "Lead me from death to the deathless.",
    "note": "a (not) + mṛta (dead), from √mṛ — cognate with Greek ambrosia. Bṛhadāraṇyaka Upaniṣad 1.3.28."
  },
  {
    "w": "जिज्ञासा",
    "r": "jijñāsā",
    "m": "the desire to know",
    "pos": "noun (feminine)",
    "ex": "अथातो ब्रह्मजिज्ञासा।",
    "exr": "athāto brahma-jijñāsā.",
    "exm": "Now, therefore, the enquiry into Brahman.",
    "note": "A desiderative formed from √jñā, to know. This is the opening sūtra of Bādarāyaṇa's Brahma Sūtra."
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
