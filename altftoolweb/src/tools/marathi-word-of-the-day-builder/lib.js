/**
 * Marathi word of the day.
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
export const LANGUAGE = "Marathi";

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
    "w": "प्रेम",
    "r": "prem",
    "m": "love",
    "pos": "noun (neuter)",
    "ex": "आईचं प्रेम निःस्वार्थ असतं.",
    "exr": "āīchaṁ prem niḥsvārth asataṁ.",
    "exm": "A mother's love is selfless.",
    "note": "Marathi keeps the Sanskrit neuter gender here, so it takes -चं and असतं rather than the masculine forms."
  },
  {
    "w": "आनंद",
    "r": "ānand",
    "m": "joy, gladness",
    "pos": "noun (masculine)",
    "ex": "ही बातमी ऐकून खूप आनंद झाला.",
    "exr": "hī bātmī aikūn khūp ānand jhālā.",
    "exm": "Hearing this news brought great joy.",
    "note": "आनंद होणे, 'for joy to happen', is the normal construction — joy arrives rather than being had."
  },
  {
    "w": "मेहनत",
    "r": "mehnat",
    "m": "hard work, toil",
    "pos": "noun (feminine)",
    "ex": "मेहनतीशिवाय यश मिळत नाही.",
    "exr": "mehnatīshivāy yash miḷat nāhī.",
    "exm": "Success is not had without hard work.",
    "note": "A Persian loan shared with Hindi and Urdu; the Sanskritic alternative is परिश्रम."
  },
  {
    "w": "जिद्द",
    "r": "jidd",
    "m": "grit, stubborn determination",
    "pos": "noun (feminine)",
    "ex": "तिच्या जिद्दीमुळेच ती इथवर पोहोचली.",
    "exr": "tichyā jiddīmuḷech tī ithavar pohochlī.",
    "exm": "It is because of her grit that she got this far.",
    "note": "Admiring in Marathi in a way its Urdu source ضد (obstinacy) often is not."
  },
  {
    "w": "आपुलकी",
    "r": "āpulkī",
    "m": "warm sense of belonging towards someone",
    "pos": "noun (feminine)",
    "ex": "गावाकडे लोकांमध्ये आपुलकी असते.",
    "exr": "gāvākaḍe lokāṁmadhye āpulkī asate.",
    "exm": "In the villages people have a warmth towards one another.",
    "note": "From आपला, 'one's own' — the feeling of counting someone as your own."
  },
  {
    "w": "धीर",
    "r": "dhīr",
    "m": "the steadiness to hold on; patience under strain",
    "pos": "noun (masculine)",
    "ex": "कठीण प्रसंगी धीर सोडू नये.",
    "exr": "kaṭhiṇ prasaṅgī dhīr soḍū naye.",
    "exm": "One should not let go of one's nerve in a hard moment.",
    "note": "धीर देणे means to console someone — literally 'to give steadiness'."
  },
  {
    "w": "कृतज्ञता",
    "r": "kṛtajñatā",
    "m": "gratitude",
    "pos": "noun (feminine)",
    "ex": "तुमच्या मदतीबद्दल कृतज्ञता व्यक्त करतो.",
    "exr": "tumchyā madatībaddal kṛtajñatā vyakta karto.",
    "exm": "I express gratitude for your help.",
    "note": "The formal register; in speech Marathi speakers usually just say धन्यवाद."
  },
  {
    "w": "निष्ठा",
    "r": "niṣṭhā",
    "m": "loyalty, steadfast commitment",
    "pos": "noun (feminine)",
    "ex": "त्याने निष्ठेने काम केलं.",
    "exr": "tyāne niṣṭhene kām kelaṁ.",
    "exm": "He worked with dedication.",
    "note": "The instrumental निष्ठेने shows the typical Marathi -ने ending on a feminine noun."
  },
  {
    "w": "सहनशीलता",
    "r": "sahanshīltā",
    "m": "tolerance, capacity to endure",
    "pos": "noun (feminine)",
    "ex": "सहनशीलता हा मोठा गुण आहे.",
    "exr": "sahanshīltā hā moṭhā guṇ āhe.",
    "exm": "Tolerance is a great quality.",
    "note": "From सहन करणे, to bear or endure something."
  },
  {
    "w": "उत्साह",
    "r": "utsāh",
    "m": "enthusiasm",
    "pos": "noun (masculine)",
    "ex": "मुलं उत्साहानं सहभागी झाली.",
    "exr": "mulaṁ utsāhānaṁ sahabhāgī jhālī.",
    "exm": "The children took part enthusiastically.",
    "note": "The related word उत्सव, festival, comes from the same root — a festival is enthusiasm made public."
  },
  {
    "w": "आठवण",
    "r": "āṭhavaṇ",
    "m": "memory, remembrance of something",
    "pos": "noun (feminine)",
    "ex": "लहानपणीच्या आठवणी गोड असतात.",
    "exr": "lahānpaṇīchyā āṭhavaṇī goḍ asatāt.",
    "exm": "Childhood memories are sweet.",
    "note": "A native Marathi word, not a Sanskrit loan; आठवणे means 'to come to mind'."
  },
  {
    "w": "समाधान",
    "r": "samādhān",
    "m": "contentment, satisfaction",
    "pos": "noun (neuter)",
    "ex": "थोडक्यात समाधान मानावं.",
    "exr": "thoḍakyāt samādhān mānāvaṁ.",
    "exm": "One should be content with little.",
    "note": "समाधानी describes a person who is settled and content rather than merely pleased."
  },
  {
    "w": "धाडस",
    "r": "dhāḍas",
    "m": "daring, the nerve to act",
    "pos": "noun (neuter)",
    "ex": "त्याने धाडस दाखवून मुलाला वाचवलं.",
    "exr": "tyāne dhāḍas dākhavūn mulālā vāchavlaṁ.",
    "exm": "He showed daring and saved the child.",
    "note": "धाडसी means bold; distinct from धैर्य, which is endurance rather than daring."
  },
  {
    "w": "सलोखा",
    "r": "salokhā",
    "m": "harmony, amicable relations",
    "pos": "noun (masculine)",
    "ex": "शेजाऱ्यांशी सलोखा ठेवावा.",
    "exr": "shejāṟyāṁshī salokhā ṭhevāvā.",
    "exm": "One should keep good relations with neighbours.",
    "note": "Common in Marathi news writing about communal and neighbourly peace."
  },
  {
    "w": "नम्रता",
    "r": "namratā",
    "m": "humility, politeness of bearing",
    "pos": "noun (feminine)",
    "ex": "यश मिळाल्यावरही त्याने नम्रता सोडली नाही.",
    "exr": "yash miḷālyāvarahī tyāne namratā soḍlī nāhī.",
    "exm": "Even after success he did not give up his humility.",
    "note": "From नम्, to bow — the same root as नमस्कार."
  },
  {
    "w": "जिव्हाळा",
    "r": "jivhāḷā",
    "m": "deep, warm fondness for someone or something",
    "pos": "noun (masculine)",
    "ex": "त्यांना पुस्तकांविषयी जिव्हाळा आहे.",
    "exr": "tyāṁnā pustakāṁviṣayī jivhāḷā āhe.",
    "exm": "They have a deep fondness for books.",
    "note": "A distinctly Marathi word with no exact Hindi equivalent; the ळ is the retroflex l typical of Marathi."
  },
  {
    "w": "कुतूहल",
    "r": "kutūhal",
    "m": "curiosity",
    "pos": "noun (neuter)",
    "ex": "मुलांमध्ये शिकण्याचं कुतूहल असतं.",
    "exr": "mulāṁmadhye shikaṇyāchaṁ kutūhal asataṁ.",
    "exm": "Children have a curiosity about learning.",
    "note": "Takes the -चं neuter possessive in the example because कुतूहल itself is neuter."
  },
  {
    "w": "एकाग्रता",
    "r": "ekāgratā",
    "m": "concentration, single-pointed attention",
    "pos": "noun (feminine)",
    "ex": "अभ्यासासाठी एकाग्रता आवश्यक आहे.",
    "exr": "abhyāsāsāṭhī ekāgratā āvashyak āhe.",
    "exm": "Concentration is necessary for study.",
    "note": "eka (one) + agra (point) — literally 'one-pointedness'."
  },
  {
    "w": "संयम",
    "r": "saṁyam",
    "m": "restraint, self-control",
    "pos": "noun (masculine)",
    "ex": "रागाच्या वेळी संयम ठेवा.",
    "exr": "rāgāchyā veḷī saṁyam ṭhevā.",
    "exm": "Keep restraint when angry.",
    "note": "संयम ठेवणे, 'to keep restraint', is the standard collocation."
  },
  {
    "w": "सहवास",
    "r": "sahavās",
    "m": "company, the effect of being around someone",
    "pos": "noun (masculine)",
    "ex": "चांगल्या माणसांचा सहवास लाभदायक असतो.",
    "exr": "chāṅglyā māṇsāṁchā sahavās lābhdāyak asato.",
    "exm": "The company of good people is beneficial.",
    "note": "saha (together) + vāsa (dwelling) — the word implies influence, not just proximity."
  },
  {
    "w": "प्रामाणिकपणा",
    "r": "prāmāṇikpaṇā",
    "m": "honesty, integrity",
    "pos": "noun (masculine)",
    "ex": "व्यवसायात प्रामाणिकपणा टिकतो.",
    "exr": "vyavasāyāt prāmāṇikpaṇā ṭikto.",
    "exm": "In business, honesty endures.",
    "note": "The suffix -पणा turns an adjective into an abstract noun, as English '-ness' does."
  },
  {
    "w": "ओढ",
    "r": "oḍh",
    "m": "a pull towards something; yearning",
    "pos": "noun (feminine)",
    "ex": "गावाकडची ओढ कधीच संपत नाही.",
    "exr": "gāvākaḍchī oḍh kadhīch sampat nāhī.",
    "exm": "The pull towards one's village never ends.",
    "note": "From ओढणे, to pull — the feeling is described as a physical tug."
  },
  {
    "w": "विसावा",
    "r": "visāvā",
    "m": "rest, a pause taken mid-effort",
    "pos": "noun (masculine)",
    "ex": "दुपारी झाडाखाली विसावा घेतला.",
    "exr": "dupārī jhāḍākhālī visāvā ghetlā.",
    "exm": "We rested under a tree in the afternoon.",
    "note": "विसावा घेणे is to take a breather; the word suggests a short halt, not sleep."
  },
  {
    "w": "आदर",
    "r": "ādar",
    "m": "respect",
    "pos": "noun (masculine)",
    "ex": "मोठ्यांचा आदर करावा.",
    "exr": "moṭhyāṁchā ādar karāvā.",
    "exm": "One should respect one's elders.",
    "note": "आदरणीय, 'respected', is the standard opening address in a formal Marathi letter."
  },
  {
    "w": "निरागस",
    "r": "nirāgas",
    "m": "innocent, without guile",
    "pos": "adjective",
    "ex": "बाळाचं निरागस हसू मन जिंकतं.",
    "exr": "bāḷāchaṁ nirāgas hasū man jiṅktaṁ.",
    "exm": "A baby's innocent smile wins the heart.",
    "note": "nir (without) + āgas (fault) — innocence as the absence of wrongdoing."
  },
  {
    "w": "संघर्ष",
    "r": "saṅgharṣ",
    "m": "struggle",
    "pos": "noun (masculine)",
    "ex": "त्याच्या यशामागे मोठा संघर्ष आहे.",
    "exr": "tyāchyā yashāmāge moṭhā saṅgharṣ āhe.",
    "exm": "There is a great struggle behind his success.",
    "note": "Literally 'rubbing together' (sam + gharṣa), from which the sense of friction and conflict comes."
  },
  {
    "w": "आशा",
    "r": "āshā",
    "m": "hope",
    "pos": "noun (feminine)",
    "ex": "उद्याची आशा माणसाला जगवते.",
    "exr": "udyāchī āshā māṇsālā jagavte.",
    "exm": "The hope of tomorrow keeps a person alive.",
    "note": "Also one of the most common Marathi given names."
  },
  {
    "w": "चिकाटी",
    "r": "chikāṭī",
    "m": "perseverance, sticking with a task",
    "pos": "noun (feminine)",
    "ex": "चिकाटीने प्रयत्न केल्यास यश मिळते.",
    "exr": "chikāṭīne prayatna kelyās yash miḷate.",
    "exm": "If you try with perseverance, success follows.",
    "note": "Related to चिकट, sticky — perseverance pictured as refusing to come unstuck."
  },
  {
    "w": "माया",
    "r": "māyā",
    "m": "affection, tender attachment",
    "pos": "noun (feminine)",
    "ex": "आजीची माया वेगळीच असते.",
    "exr": "ājīchī māyā vegaḷīch asate.",
    "exm": "A grandmother's affection is something else entirely.",
    "note": "In everyday Marathi this is affection, not the philosophical 'illusion' sense of the same Sanskrit word."
  },
  {
    "w": "कौतुक",
    "r": "kautuk",
    "m": "appreciative praise, admiring delight",
    "pos": "noun (neuter)",
    "ex": "शिक्षकांनी तिचं कौतुक केलं.",
    "exr": "shikṣakāṁnī tichaṁ kautuk kelaṁ.",
    "exm": "The teachers praised her.",
    "note": "कौतुक करणे is warmer than simply praising — it carries pride in the person."
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
