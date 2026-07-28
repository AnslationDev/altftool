/**
 * Urdu word of the day.
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
export const LANGUAGE = "Urdu";

/** Writing system the headword is printed in. */
export const SCRIPT = "Nastaliq";

/**
 * The curated deck. One full rotation takes WORDS.length days, after which the
 * cycle repeats — long enough that a daily learner sees a month of new words.
 * Each entry: w = headword, r = romanisation, m = meaning, pos = part of
 * speech, ex = example sentence, exr = example in roman, exm = English gloss,
 * note = usage or etymology note.
 */
export const WORDS = [
  {
    "w": "محبت",
    "r": "mohabbat",
    "m": "love, affection",
    "pos": "noun (feminine)",
    "ex": "ماں کی محبت بے مثال ہوتی ہے۔",
    "exr": "maañ kī mohabbat be-misāl hotī hai.",
    "exm": "A mother's love is without equal.",
    "note": "From Arabic ḥubb, love. The everyday word for love in both Urdu prose and film dialogue."
  },
  {
    "w": "خلوص",
    "r": "khulūs",
    "m": "sincerity, purity of intention",
    "pos": "noun (masculine)",
    "ex": "اس نے خلوص کے ساتھ میری مدد کی۔",
    "exr": "us ne khulūs ke sāth merī madad kī.",
    "exm": "He helped me with genuine sincerity.",
    "note": "Same Arabic root as ikhlāṣ; the phrase خلوصِ دل means 'sincerity of heart'."
  },
  {
    "w": "حوصلہ",
    "r": "hausla",
    "m": "courage; also morale, capacity to bear something",
    "pos": "noun (masculine)",
    "ex": "مشکل وقت میں حوصلہ نہیں ہارنا چاہیے۔",
    "exr": "mushkil waqt mein hausla nahīñ hārnā chāhiye.",
    "exm": "One should not lose heart in difficult times.",
    "note": "حوصلہ افزائی (hausla-afzāī) means encouragement — literally 'increasing someone's courage'."
  },
  {
    "w": "تشکر",
    "r": "tashakkur",
    "m": "the expressing of thanks",
    "pos": "noun (masculine)",
    "ex": "میں آپ کا تہہِ دل سے تشکر ادا کرتا ہوں۔",
    "exr": "maiñ āp kā tah-e-dil se tashakkur adā kartā hūñ.",
    "exm": "I thank you from the bottom of my heart.",
    "note": "More formal than شکریہ (shukriya); used in speeches and written notes."
  },
  {
    "w": "مسرت",
    "r": "masarrat",
    "m": "joy, gladness",
    "pos": "noun (feminine)",
    "ex": "یہ خبر سن کر مجھے بہت مسرت ہوئی۔",
    "exr": "yih khabar sun kar mujhe bahut masarrat huī.",
    "exm": "I was delighted to hear this news.",
    "note": "Formal register — invitation cards often read باعثِ مسرت, 'a cause of joy'."
  },
  {
    "w": "سکون",
    "r": "sukūn",
    "m": "peace, stillness of mind",
    "pos": "noun (masculine)",
    "ex": "سمندر کے کنارے بیٹھ کر سکون ملتا ہے۔",
    "exr": "samundar ke kināre baiṭh kar sukūn miltā hai.",
    "exm": "Sitting by the sea brings a sense of peace.",
    "note": "In Urdu grammar the same word names the sukūn diacritic, which marks a consonant with no vowel."
  },
  {
    "w": "اعتماد",
    "r": "e'timād",
    "m": "trust, confidence placed in someone",
    "pos": "noun (masculine)",
    "ex": "رشتوں کی بنیاد اعتماد پر ہوتی ہے۔",
    "exr": "rishtoñ kī buniyād e'timād par hotī hai.",
    "exm": "Relationships are built on trust.",
    "note": "خود اعتمادی (khud-e'timādī) is self-confidence."
  },
  {
    "w": "صبر",
    "r": "sabr",
    "m": "patience, endurance",
    "pos": "noun (masculine)",
    "ex": "صبر کا پھل میٹھا ہوتا ہے۔",
    "exr": "sabr kā phal mīṭhā hotā hai.",
    "exm": "The fruit of patience is sweet.",
    "note": "That sentence is a proverb in daily use; صبر implies bearing hardship, not merely waiting."
  },
  {
    "w": "عاجزی",
    "r": "'ājizī",
    "m": "humility, self-effacement",
    "pos": "noun (feminine)",
    "ex": "بڑے لوگوں میں عاجزی ہوتی ہے۔",
    "exr": "baṛe logoñ meñ 'ājizī hotī hai.",
    "exm": "Truly great people carry humility.",
    "note": "From 'ājiz, powerless — humility framed as knowing one's own limits."
  },
  {
    "w": "دلچسپی",
    "r": "dilchaspī",
    "m": "interest in something",
    "pos": "noun (feminine)",
    "ex": "مجھے کتابیں پڑھنے میں دلچسپی ہے۔",
    "exr": "mujhe kitābeñ paṛhne meñ dilchaspī hai.",
    "exm": "I have an interest in reading books.",
    "note": "From Persian dil (heart) + chaspīdan (to stick) — what the heart sticks to."
  },
  {
    "w": "مہربانی",
    "r": "meharbānī",
    "m": "kindness, a favour done",
    "pos": "noun (feminine)",
    "ex": "آپ کی مہربانی کا شکریہ۔",
    "exr": "āp kī meharbānī kā shukriya.",
    "exm": "Thank you for your kindness.",
    "note": "براہِ مہربانی (barā-e-meharbānī) is the standard polite 'please'."
  },
  {
    "w": "آرزو",
    "r": "ārzū",
    "m": "wish, a long-held desire",
    "pos": "noun (feminine)",
    "ex": "اس کی آرزو تھی کہ وہ استاد بنے۔",
    "exr": "us kī ārzū thī ki wuh ustād bane.",
    "exm": "It was his wish to become a teacher.",
    "note": "A Persian loan; a staple of ghazal vocabulary and also a common given name."
  },
  {
    "w": "حیرت",
    "r": "hairat",
    "m": "astonishment",
    "pos": "noun (feminine)",
    "ex": "یہ منظر دیکھ کر مجھے حیرت ہوئی۔",
    "exr": "yih manzar dekh kar mujhe hairat huī.",
    "exm": "I was astonished to see this scene.",
    "note": "حیرت انگیز (hairat-angez) means astonishing, and is used the way English uses 'remarkable'."
  },
  {
    "w": "وفا",
    "r": "wafā",
    "m": "faithfulness, keeping one's word",
    "pos": "noun (feminine)",
    "ex": "دوستی میں وفا سب سے اہم ہے۔",
    "exr": "dostī meñ wafā sab se aham hai.",
    "exm": "In friendship, loyalty matters most.",
    "note": "Its opposite بے وفا (be-wafā), unfaithful, is one of the most-used words in Urdu poetry."
  },
  {
    "w": "تنہائی",
    "r": "tanhāī",
    "m": "solitude; also loneliness, depending on context",
    "pos": "noun (feminine)",
    "ex": "تنہائی میں وہ اپنی کتابیں پڑھتا ہے۔",
    "exr": "tanhāī meñ wuh apnī kitābeñ paṛhtā hai.",
    "exm": "In solitude he reads his books.",
    "note": "From Persian tanhā, alone. Urdu leaves the chosen/unchosen distinction to context."
  },
  {
    "w": "شفقت",
    "r": "shafqat",
    "m": "tender affection, especially from an elder to a younger person",
    "pos": "noun (feminine)",
    "ex": "استاد نے شفقت سے سمجھایا۔",
    "exr": "ustād ne shafqat se samjhāyā.",
    "exm": "The teacher explained with kindness.",
    "note": "Not interchangeable with محبت: shafqat flows downward, from the protective to the protected."
  },
  {
    "w": "جستجو",
    "r": "justujū",
    "m": "search, an active quest",
    "pos": "noun (feminine)",
    "ex": "علم کی جستجو کبھی ختم نہیں ہوتی۔",
    "exr": "'ilm kī justujū kabhī khatm nahīñ hotī.",
    "exm": "The search for knowledge never ends.",
    "note": "Persian origin; implies sustained seeking rather than a single act of looking."
  },
  {
    "w": "انکسار",
    "r": "inkisār",
    "m": "modesty, the lowering of oneself",
    "pos": "noun (masculine)",
    "ex": "اس کے انکسار نے سب کا دل جیت لیا۔",
    "exr": "us ke inkisār ne sab kā dil jīt liyā.",
    "exm": "His modesty won everyone over.",
    "note": "From the Arabic root k-s-r, to break — the image is of breaking one's own pride."
  },
  {
    "w": "بردباری",
    "r": "burdbārī",
    "m": "forbearance, keeping calm under provocation",
    "pos": "noun (feminine)",
    "ex": "بحث میں بردباری سے کام لیں۔",
    "exr": "bahs meñ burdbārī se kām leñ.",
    "exm": "Use forbearance in an argument.",
    "note": "Persian: the sense is of carrying a load without complaint."
  },
  {
    "w": "ہمت",
    "r": "himmat",
    "m": "resolve, the nerve to attempt something",
    "pos": "noun (feminine)",
    "ex": "اس نے ہمت نہیں ہاری۔",
    "exr": "us ne himmat nahīñ hārī.",
    "exm": "He did not lose his nerve.",
    "note": "ہمت کرنا means to dare; distinct from حوصلہ, which is closer to morale."
  },
  {
    "w": "روشنی",
    "r": "roshnī",
    "m": "light",
    "pos": "noun (feminine)",
    "ex": "چراغ کی روشنی کمرے میں پھیل گئی۔",
    "exr": "chirāgh kī roshnī kamre meñ phail gaī.",
    "exm": "The lamp's light spread through the room.",
    "note": "Also used figuratively: کسی بات کی روشنی میں, 'in the light of something'."
  },
  {
    "w": "خواہش",
    "r": "khwāhish",
    "m": "desire, want",
    "pos": "noun (feminine)",
    "ex": "میری خواہش ہے کہ سب خوش رہیں۔",
    "exr": "merī khwāhish hai ki sab khush raheñ.",
    "exm": "It is my wish that everyone stays happy.",
    "note": "Persian; plainer and more everyday than آرزو, which is more poetic."
  },
  {
    "w": "قناعت",
    "r": "qanā'at",
    "m": "contentment with what one has",
    "pos": "noun (feminine)",
    "ex": "قناعت سب سے بڑی دولت ہے۔",
    "exr": "qanā'at sab se baṛī daulat hai.",
    "exm": "Contentment is the greatest wealth.",
    "note": "A moral virtue in classical Urdu and Persian ethics, distinct from mere satisfaction."
  },
  {
    "w": "مروت",
    "r": "murawwat",
    "m": "considerate decency towards others",
    "pos": "noun (feminine)",
    "ex": "پڑوسیوں کے ساتھ مروت سے پیش آئیں۔",
    "exr": "paṛosiyoñ ke sāth murawwat se pesh āeñ.",
    "exm": "Behave considerately with your neighbours.",
    "note": "Carries a social obligation — the courtesy you owe people, not merely feel."
  },
  {
    "w": "ذوق",
    "r": "zauq",
    "m": "refined taste, relish for something",
    "pos": "noun (masculine)",
    "ex": "انہیں شاعری کا اچھا ذوق ہے۔",
    "exr": "unheñ shā'irī kā achchhā zauq hai.",
    "exm": "They have a fine taste in poetry.",
    "note": "Also the pen-name of the nineteenth-century Delhi poet Shaikh Ibrahim Zauq."
  },
  {
    "w": "فراست",
    "r": "firāsat",
    "m": "sagacity, quick insight into people or situations",
    "pos": "noun (feminine)",
    "ex": "اس نے فراست سے مسئلہ حل کیا۔",
    "exr": "us ne firāsat se mas'ala hal kiyā.",
    "exm": "He solved the problem with shrewd insight.",
    "note": "Implies reading a situation correctly at speed, not accumulated learning."
  },
  {
    "w": "یقین",
    "r": "yaqīn",
    "m": "certainty, firm conviction",
    "pos": "noun (masculine)",
    "ex": "مجھے اپنی محنت پر یقین ہے۔",
    "exr": "mujhe apnī mehnat par yaqīn hai.",
    "exm": "I have faith in my own effort.",
    "note": "Stronger than بھروسہ (trust): yaqīn is knowledge you do not doubt."
  },
  {
    "w": "تلافی",
    "r": "talāfī",
    "m": "making amends, compensating for a loss",
    "pos": "noun (feminine)",
    "ex": "اس نے اپنی غلطی کی تلافی کی۔",
    "exr": "us ne apnī ghaltī kī talāfī kī.",
    "exm": "He made amends for his mistake.",
    "note": "Used for both moral repair and financial compensation."
  },
  {
    "w": "مشاہدہ",
    "r": "mushāhida",
    "m": "observation, watching closely",
    "pos": "noun (masculine)",
    "ex": "سائنس مشاہدے سے شروع ہوتی ہے۔",
    "exr": "sāins mushāhide se shurū' hotī hai.",
    "exm": "Science begins with observation.",
    "note": "The standard Urdu term in scientific writing for observation as a method."
  },
  {
    "w": "سرگوشی",
    "r": "sargoshī",
    "m": "a whisper",
    "pos": "noun (feminine)",
    "ex": "اس نے کان میں سرگوشی کی۔",
    "exr": "us ne kān meñ sargoshī kī.",
    "exm": "He whispered in my ear.",
    "note": "Persian sar (head) + gosh (ear) — speech carried from head to ear."
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
