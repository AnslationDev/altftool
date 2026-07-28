/**
 * Hindi word of the day.
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
export const LANGUAGE = "Hindi";

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
    "w": "अनुराग",
    "r": "anurāg",
    "m": "deep affection, love for something one is devoted to",
    "pos": "noun (masculine)",
    "ex": "उसके मन में देश के लिए गहरा अनुराग है।",
    "exr": "uske man mein desh ke liye gahrā anurāg hai.",
    "exm": "He has a deep affection for his country.",
    "note": "From Sanskrit anu + rāga (colour, passion) — literally 'being coloured by'. More literary than प्यार."
  },
  {
    "w": "आकांक्षा",
    "r": "ākāṅkṣā",
    "m": "aspiration, a considered longing",
    "pos": "noun (feminine)",
    "ex": "उसकी आकांक्षा डॉक्टर बनने की है।",
    "exr": "uskī ākāṅkṣā ḍāktar banne kī hai.",
    "exm": "Her aspiration is to become a doctor.",
    "note": "A tatsama word borrowed unchanged from Sanskrit; standard in essays and formal writing."
  },
  {
    "w": "उत्कर्ष",
    "r": "utkarṣ",
    "m": "rise, advancement, flourishing",
    "pos": "noun (masculine)",
    "ex": "मेहनत से ही जीवन में उत्कर्ष होता है।",
    "exr": "mehnat se hī jīvan mein utkarṣ hotā hai.",
    "exm": "It is only through hard work that one rises in life.",
    "note": "Its opposite is अपकर्ष (apakarṣ), decline."
  },
  {
    "w": "कृतज्ञ",
    "r": "kṛtajña",
    "m": "grateful",
    "pos": "adjective",
    "ex": "मैं आपकी मदद के लिए कृतज्ञ हूँ।",
    "exr": "main āpkī madad ke liye kṛtajña hūṁ.",
    "exm": "I am grateful for your help.",
    "note": "Literally 'one who knows what was done for them'. The noun is कृतज्ञता, gratitude."
  },
  {
    "w": "सौहार्द",
    "r": "sauhārd",
    "m": "goodwill, cordial feeling between people or groups",
    "pos": "noun (masculine)",
    "ex": "दोनों देशों के बीच सौहार्द बना रहे।",
    "exr": "donoṁ deshoṁ ke bīch sauhārd banā rahe.",
    "exm": "May goodwill continue between the two countries.",
    "note": "Very common in news writing, especially in the phrase सांप्रदायिक सौहार्द, communal harmony."
  },
  {
    "w": "निर्भीक",
    "r": "nirbhīk",
    "m": "fearless",
    "pos": "adjective",
    "ex": "वह निर्भीक होकर सच बोलता है।",
    "exr": "vah nirbhīk hokar sach boltā hai.",
    "exm": "He speaks the truth fearlessly.",
    "note": "nir (without) + bhī (fear). निडर is the everyday spoken equivalent."
  },
  {
    "w": "विस्मय",
    "r": "vismay",
    "m": "astonishment, wonder",
    "pos": "noun (masculine)",
    "ex": "यह दृश्य देखकर मन विस्मय से भर गया।",
    "exr": "yah dṛśya dekhkar man vismay se bhar gayā.",
    "exm": "Seeing this sight, the mind filled with wonder.",
    "note": "The grammar term विस्मयादिबोधक (interjection) is built from this word."
  },
  {
    "w": "संयम",
    "r": "saṁyam",
    "m": "self-restraint, control over an impulse",
    "pos": "noun (masculine)",
    "ex": "क्रोध के समय संयम रखना कठिन है।",
    "exr": "krodh ke samay saṁyam rakhnā kaṭhin hai.",
    "exm": "It is hard to keep restraint when angry.",
    "note": "sam + yam (to hold back). Used for temper, spending and diet alike."
  },
  {
    "w": "अटल",
    "r": "aṭal",
    "m": "unshakeable, not to be moved",
    "pos": "adjective",
    "ex": "वह अपने निर्णय पर अटल रहा।",
    "exr": "vah apne nirṇay par aṭal rahā.",
    "exm": "He stood firm on his decision.",
    "note": "a (not) + ṭal (to shift aside); also common as a given name."
  },
  {
    "w": "प्रफुल्लित",
    "r": "praphullit",
    "m": "cheerful, beaming; in full bloom",
    "pos": "adjective",
    "ex": "बच्चों का चेहरा प्रफुल्लित था।",
    "exr": "bachchoṁ kā chehrā praphullit thā.",
    "exm": "The children's faces were beaming.",
    "note": "From phulla, blossomed — the image is a flower opening."
  },
  {
    "w": "निःस्वार्थ",
    "r": "niḥsvārth",
    "m": "selfless, with no self-interest",
    "pos": "adjective",
    "ex": "माँ का प्रेम निःस्वार्थ होता है।",
    "exr": "māṁ kā prem niḥsvārth hotā hai.",
    "exm": "A mother's love is selfless.",
    "note": "niḥ (without) + svārth (self-interest). Often written निस्वार्थ in ordinary text."
  },
  {
    "w": "उपेक्षा",
    "r": "upekṣā",
    "m": "neglect, deliberate disregard",
    "pos": "noun (feminine)",
    "ex": "अपने स्वास्थ्य की उपेक्षा मत करो।",
    "exr": "apne svāsthya kī upekṣā mat karo.",
    "exm": "Do not neglect your health.",
    "note": "Stronger than simply not noticing — it implies a choice not to attend to something."
  },
  {
    "w": "सजग",
    "r": "sajag",
    "m": "alert, watchful",
    "pos": "adjective",
    "ex": "नागरिकों को अपने अधिकारों के प्रति सजग रहना चाहिए।",
    "exr": "nāgrikoṁ ko apne adhikāroṁ ke prati sajag rahnā chāhiye.",
    "exm": "Citizens should stay alert to their rights.",
    "note": "sa + jag (awake). सतर्क (satark) is a close synonym with more sense of caution."
  },
  {
    "w": "विनम्र",
    "r": "vinamra",
    "m": "humble, courteous",
    "pos": "adjective",
    "ex": "सफलता के बाद भी वह विनम्र रहा।",
    "exr": "saphaltā ke bād bhī vah vinamra rahā.",
    "exm": "Even after success he remained humble.",
    "note": "From nam, to bow. The noun विनम्रता is standard in letters: 'विनम्र निवेदन'."
  },
  {
    "w": "आतुर",
    "r": "ātur",
    "m": "eager to the point of restlessness",
    "pos": "adjective",
    "ex": "वह मिलने के लिए आतुर था।",
    "exr": "vah milne ke liye ātur thā.",
    "exm": "He was impatient to meet.",
    "note": "Carries urgency, not just willingness — closer to 'anxious to' than 'happy to'."
  },
  {
    "w": "धैर्य",
    "r": "dhairya",
    "m": "patience, fortitude under strain",
    "pos": "noun (masculine)",
    "ex": "कठिन समय में धैर्य ही सहारा है।",
    "exr": "kaṭhin samay mein dhairya hī sahārā hai.",
    "exm": "In hard times patience is the only support.",
    "note": "From dhīra, steady. धीरज is the everyday spoken form of the same root."
  },
  {
    "w": "तटस्थ",
    "r": "taṭasth",
    "m": "neutral, impartial",
    "pos": "adjective",
    "ex": "न्यायाधीश को तटस्थ रहना चाहिए।",
    "exr": "nyāyādhīś ko taṭasth rahnā chāhiye.",
    "exm": "A judge must remain impartial.",
    "note": "Literally 'standing on the bank' — watching the river without entering it."
  },
  {
    "w": "मनोरम",
    "r": "manoram",
    "m": "delightful, pleasing to look at",
    "pos": "adjective",
    "ex": "पहाड़ों का दृश्य मनोरम था।",
    "exr": "pahāṛoṁ kā dṛśya manoram thā.",
    "exm": "The mountain view was delightful.",
    "note": "manaḥ (mind) + ram (to please) — that which gladdens the mind."
  },
  {
    "w": "संकल्प",
    "r": "saṁkalp",
    "m": "resolve, a stated intention",
    "pos": "noun (masculine)",
    "ex": "उसने पढ़ाई पूरी करने का संकल्प लिया।",
    "exr": "usne paṛhāī pūrī karne kā saṁkalp liyā.",
    "exm": "He resolved to finish his studies.",
    "note": "Also the formal declaration of intent spoken before a ritual."
  },
  {
    "w": "उदासीन",
    "r": "udāsīn",
    "m": "indifferent, detached from the outcome",
    "pos": "adjective",
    "ex": "वह राजनीति के प्रति उदासीन है।",
    "exr": "vah rājnīti ke prati udāsīn hai.",
    "exm": "He is indifferent to politics.",
    "note": "Not the same as उदास (sad), although the two look alike."
  },
  {
    "w": "प्रेरणा",
    "r": "preraṇā",
    "m": "inspiration, the impulse to act",
    "pos": "noun (feminine)",
    "ex": "उसकी कहानी हमारे लिए प्रेरणा है।",
    "exr": "uskī kahānī hamāre liye preraṇā hai.",
    "exm": "Her story is an inspiration to us.",
    "note": "The verb form is प्रेरित करना, to inspire or prompt someone."
  },
  {
    "w": "निपुण",
    "r": "nipuṇ",
    "m": "proficient, expert at something",
    "pos": "adjective",
    "ex": "वह गणित में निपुण है।",
    "exr": "vah gaṇit mein nipuṇ hai.",
    "exm": "He is proficient in mathematics.",
    "note": "Takes में for the field of skill: संगीत में निपुण, skilled in music."
  },
  {
    "w": "अनुशासन",
    "r": "anuśāsan",
    "m": "discipline",
    "pos": "noun (masculine)",
    "ex": "सेना में अनुशासन सबसे ऊपर है।",
    "exr": "senā mein anuśāsan sabse ūpar hai.",
    "exm": "In the army discipline comes first.",
    "note": "anu + śāsan (governance) — the sense is self-governance, not punishment."
  },
  {
    "w": "विरक्ति",
    "r": "virakti",
    "m": "detachment, loss of interest in something once enjoyed",
    "pos": "noun (feminine)",
    "ex": "उसे सांसारिक सुखों से विरक्ति हो गई।",
    "exr": "use sāṁsārik sukhoṁ se virakti ho gaī.",
    "exm": "He grew detached from worldly pleasures.",
    "note": "vi + rakti (attachment) — the exact opposite of अनुराग."
  },
  {
    "w": "सरोकार",
    "r": "sarokār",
    "m": "concern, a real stake in something",
    "pos": "noun (masculine)",
    "ex": "उसे समाज के मुद्दों से गहरा सरोकार है।",
    "exr": "use samāj ke muddoṁ se gahrā sarokār hai.",
    "exm": "He has a deep concern for social issues.",
    "note": "A staple of Hindi journalism, as in जनता से सरोकार, concern for the public."
  },
  {
    "w": "आश्वस्त",
    "r": "āśvast",
    "m": "reassured, put at ease",
    "pos": "adjective",
    "ex": "डॉक्टर की बात सुनकर वह आश्वस्त हो गया।",
    "exr": "ḍāktar kī bāt sunkar vah āśvast ho gayā.",
    "exm": "He felt reassured after hearing the doctor.",
    "note": "The related noun आश्वासन means an assurance or promise given to someone."
  },
  {
    "w": "अभिभूत",
    "r": "abhibhūt",
    "m": "overwhelmed by feeling",
    "pos": "adjective",
    "ex": "इतने प्यार से वह अभिभूत हो गई।",
    "exr": "itne pyār se vah abhibhūt ho gaī.",
    "exm": "She was overwhelmed by so much love.",
    "note": "Used for being moved, typically by kindness or welcome — not for being defeated."
  },
  {
    "w": "जिज्ञासा",
    "r": "jijñāsā",
    "m": "curiosity, the wish to know",
    "pos": "noun (feminine)",
    "ex": "बच्चों में सीखने की जिज्ञासा होती है।",
    "exr": "bachchoṁ mein sīkhne kī jijñāsā hotī hai.",
    "exm": "Children have a curiosity to learn.",
    "note": "A desiderative form of jñā, to know — literally 'the desire to know'."
  },
  {
    "w": "समर्पण",
    "r": "samarpaṇ",
    "m": "dedication; giving oneself over to something",
    "pos": "noun (masculine)",
    "ex": "उसने पूरे समर्पण से काम किया।",
    "exr": "usne pūre samarpaṇ se kām kiyā.",
    "exm": "He worked with total dedication.",
    "note": "sam + arpaṇ (offering). Used for devotion and for wholehearted work alike."
  },
  {
    "w": "सजीव",
    "r": "sajīv",
    "m": "living; vivid, lifelike",
    "pos": "adjective",
    "ex": "उसका वर्णन इतना सजीव था कि दृश्य आँखों के सामने आ गया।",
    "exr": "uskā varṇan itnā sajīv thā ki dṛśya āṁkhoṁ ke sāmne ā gayā.",
    "exm": "His description was so vivid that the scene appeared before our eyes.",
    "note": "sa (with) + jīva (life). Used both for living things and for vivid writing."
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
