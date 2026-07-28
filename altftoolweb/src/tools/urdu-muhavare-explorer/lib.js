/**
 * Urdu Muhavare Explorer — idiom bank plus pure browse, daily-pick and quiz logic.
 *
 * A muhavara (محاورہ) is a fixed phrase whose meaning cannot be read off its
 * words and which is inflected to fit the sentence it enters. That is what
 * distinguishes it from a zarb-ul-misl (ضرب المثل), a complete proverb quoted
 * unchanged. Every entry below is a muhavara.
 *
 * No React, no DOM, no Date.now(): the daily pick takes an ISO date argument
 * and the quiz shuffle is seeded, so the same inputs always give the same output.
 */

/** Topic buckets used by the browse filter. */
export const THEMES = [
  "Body",
  "Animals and birds",
  "Food and home",
  "Deceit and flattery",
  "Struggle and hardship",
  "Fear and escape",
];

/** Register bands: where the idiom is most often met. */
export const REGISTERS = ["Everyday speech", "School Urdu", "Literary and exam"];

/**
 * 30 well-known Urdu muhavare. `roman` uses the standard Roman Urdu scheme with
 * macrons for long vowels, ̃ for nasalisation, and ʿ for the letter ain.
 */
export const IDIOMS = [
  {
    idiom: "آستین کا سانپ",
    roman: "āstīn kā sā̃p",
    literal: "a snake in the sleeve",
    meaningUr: "اپنوں میں چھپا ہوا دشمن",
    meaningEn: "a treacherous person hiding among one's own people",
    exampleUr: "جسے میں دوست سمجھتا رہا، وہی آستین کا سانپ نکلا۔",
    exampleEn: "The one I took for a friend turned out to be the traitor.",
    theme: "Animals and birds",
    register: "Literary and exam",
  },
  {
    idiom: "اپنے منہ میاں مٹھو بننا",
    roman: "apne mũh miyā̃ miṭṭhū bannā",
    literal: "to become Mister Parrot by one's own mouth",
    meaningUr: "اپنی تعریف آپ کرنا",
    meaningEn: "to blow one's own trumpet",
    exampleUr: "ہر بات میں اپنی تعریف کرکے وہ اپنے منہ میاں مٹھو بنتا رہتا ہے۔",
    exampleEn: "He is forever praising himself in every conversation.",
    theme: "Deceit and flattery",
    register: "Everyday speech",
  },
  {
    idiom: "سبز باغ دکھانا",
    roman: "sabz bāgh dikhānā",
    literal: "to show green gardens",
    meaningUr: "جھوٹی امیدیں دلانا",
    meaningEn: "to hold out false hopes in order to mislead",
    exampleUr: "ایجنٹ نے نوکری کے سبز باغ دکھا کر اس سے رقم لے لی۔",
    exampleEn: "The agent took his money after dangling the promise of a job.",
    theme: "Deceit and flattery",
    register: "Literary and exam",
  },
  {
    idiom: "تلوے چاٹنا",
    roman: "talwe chāṭnā",
    literal: "to lick the soles of the feet",
    meaningUr: "خوشامد کرنا",
    meaningEn: "to flatter someone servilely",
    exampleUr: "ترقی کے لیے وہ افسروں کے تلوے چاٹتا رہا۔",
    exampleEn: "He kept fawning on the officers to get promoted.",
    theme: "Deceit and flattery",
    register: "Everyday speech",
  },
  {
    idiom: "جلتی پر تیل ڈالنا",
    roman: "jaltī par tel ḍālnā",
    literal: "to pour oil on what is already burning",
    meaningUr: "جھگڑا اور بڑھا دینا",
    meaningEn: "to add fuel to the fire",
    exampleUr: "جھگڑا ہو رہا تھا اور اس نے جلتی پر تیل ڈال دیا۔",
    exampleEn: "A quarrel was under way and he only made it worse.",
    theme: "Struggle and hardship",
    register: "Everyday speech",
  },
  {
    idiom: "سر آنکھوں پر بٹھانا",
    roman: "sar ānkhõ par biṭhānā",
    literal: "to seat someone on one's head and eyes",
    meaningUr: "بہت عزت دینا",
    meaningEn: "to welcome or honour someone greatly",
    exampleUr: "مہمانوں کو ہم نے سر آنکھوں پر بٹھایا۔",
    exampleEn: "We received our guests with the greatest honour.",
    theme: "Body",
    register: "School Urdu",
  },
  {
    idiom: "ناکوں چنے چبوانا",
    roman: "nākõ chane chabvānā",
    literal: "to make someone chew grams through the nose",
    meaningUr: "سخت پریشان کر دینا",
    meaningEn: "to give someone an extremely hard time",
    exampleUr: "چھوٹی ٹیم نے بڑی ٹیم کو ناکوں چنے چبوا دیے۔",
    exampleEn: "The smaller team put the favourites through the wringer.",
    theme: "Struggle and hardship",
    register: "Literary and exam",
  },
  {
    idiom: "گرگٹ کی طرح رنگ بدلنا",
    roman: "girgiṭ kī tarah rang badalnā",
    literal: "to change colour like a chameleon",
    meaningUr: "بار بار موقف بدلنا",
    meaningEn: "to keep switching sides or opinions",
    exampleUr: "وہ گرگٹ کی طرح رنگ بدلتا ہے، اس پر بھروسہ مت کرو۔",
    exampleEn: "He changes his position constantly — do not rely on him.",
    theme: "Animals and birds",
    register: "Everyday speech",
  },
  {
    idiom: "منہ میں پانی بھر آنا",
    roman: "mũh mẽ pānī bhar ānā",
    literal: "for water to fill the mouth",
    meaningUr: "کھانے کی خواہش شدت سے ہونا",
    meaningEn: "for one's mouth to water",
    exampleUr: "بریانی کی خوشبو سے منہ میں پانی بھر آیا۔",
    exampleEn: "The smell of the biryani made my mouth water.",
    theme: "Food and home",
    register: "Everyday speech",
  },
  {
    idiom: "آٹے دال کا بھاؤ معلوم ہونا",
    roman: "āṭe dāl kā bhāo maʿlūm honā",
    literal: "to learn the price of flour and lentils",
    meaningUr: "زندگی کی سختیوں کا اندازہ ہونا",
    meaningEn: "to discover how hard real life is",
    exampleUr: "گھر چلاتے ہی اسے آٹے دال کا بھاؤ معلوم ہو گیا۔",
    exampleEn: "Once he had to run a household he learnt what life really costs.",
    theme: "Food and home",
    register: "School Urdu",
  },
  {
    idiom: "کان کھڑے ہونا",
    roman: "kān khaṛe honā",
    literal: "for the ears to stand up",
    meaningUr: "چوکنا ہو جانا",
    meaningEn: "to become suddenly alert or wary",
    exampleUr: "یہ خبر سن کر سب کے کان کھڑے ہو گئے۔",
    exampleEn: "That news put everyone on the alert.",
    theme: "Body",
    register: "Everyday speech",
  },
  {
    idiom: "ہوا ہو جانا",
    roman: "hawā ho jānā",
    literal: "to turn into air",
    meaningUr: "غائب ہو جانا",
    meaningEn: "to vanish without a trace",
    exampleUr: "پولیس کو دیکھتے ہی چور ہوا ہو گئے۔",
    exampleEn: "The thieves vanished the moment they saw the police.",
    theme: "Fear and escape",
    register: "Everyday speech",
  },
  {
    idiom: "پاپڑ بیلنا",
    roman: "pāpaṛ belnā",
    literal: "to roll out papads",
    meaningUr: "بہت محنت اور تکلیف اٹھانا",
    meaningEn: "to go through a great deal of trouble to achieve something",
    exampleUr: "یہ نوکری پانے کے لیے اسے بہت پاپڑ بیلنے پڑے۔",
    exampleEn: "He had to move heaven and earth to land this job.",
    theme: "Struggle and hardship",
    register: "Everyday speech",
  },
  {
    idiom: "بھیگی بلی بننا",
    roman: "bhīgī billī bannā",
    literal: "to become a drenched cat",
    meaningUr: "ڈر کر دب جانا",
    meaningEn: "to turn meek and submissive out of fear",
    exampleUr: "استاد کے سامنے وہ بھیگی بلی بن گیا۔",
    exampleEn: "In front of the teacher he became completely meek.",
    theme: "Animals and birds",
    register: "School Urdu",
  },
  {
    idiom: "ہاتھ پاؤں پھول جانا",
    roman: "hāth pā̃ō phūl jānā",
    literal: "for the hands and feet to swell",
    meaningUr: "گھبرا جانا",
    meaningEn: "to be paralysed by panic",
    exampleUr: "امتحان کا پرچہ دیکھتے ہی اس کے ہاتھ پاؤں پھول گئے۔",
    exampleEn: "One look at the question paper and he froze in panic.",
    theme: "Fear and escape",
    register: "School Urdu",
  },
  {
    idiom: "دانت کھٹے کرنا",
    roman: "dānt khaṭṭe karnā",
    literal: "to make someone's teeth sour",
    meaningUr: "بری طرح شکست دینا",
    meaningEn: "to defeat someone soundly",
    exampleUr: "ہماری فوج نے دشمن کے دانت کھٹے کر دیے۔",
    exampleEn: "Our army routed the enemy completely.",
    theme: "Body",
    register: "Literary and exam",
  },
  {
    idiom: "نانی یاد آنا",
    roman: "nānī yād ānā",
    literal: "to be reminded of one's maternal grandmother",
    meaningUr: "سخت مشکل میں پڑ جانا",
    meaningEn: "to be reduced to desperate straits by difficulty",
    exampleUr: "پہاڑ چڑھتے ہوئے اسے نانی یاد آ گئی۔",
    exampleEn: "The climb up the hill nearly finished him.",
    theme: "Struggle and hardship",
    register: "Everyday speech",
  },
  {
    idiom: "چراغ لے کر ڈھونڈنا",
    roman: "chirāgh le kar ḍhū̃ḍhnā",
    literal: "to search with a lamp in hand",
    meaningUr: "بہت تلاش کرنے پر بھی نہ ملنا",
    meaningEn: "to search everywhere for something now almost impossible to find",
    exampleUr: "ایسا ایماندار آدمی اب چراغ لے کر ڈھونڈنے سے بھی نہیں ملتا۔",
    exampleEn: "An honest man like that is not to be found however hard you look.",
    theme: "Struggle and hardship",
    register: "Literary and exam",
  },
  {
    idiom: "ٹال مٹول کرنا",
    roman: "ṭāl maṭol karnā",
    literal: "to keep pushing aside",
    meaningUr: "بہانے بنا کر ٹالتے رہنا",
    meaningEn: "to fob someone off with excuses; to procrastinate",
    exampleUr: "وہ ادائیگی میں ہفتوں سے ٹال مٹول کر رہا ہے۔",
    exampleEn: "He has been putting off the payment for weeks.",
    theme: "Deceit and flattery",
    register: "Everyday speech",
  },
  {
    idiom: "چکنا گھڑا ہونا",
    roman: "chiknā ghaṛā honā",
    literal: "to be a glazed pot",
    meaningUr: "بے شرم، جس پر نصیحت کا اثر نہ ہو",
    meaningEn: "to be so shameless that advice slides right off",
    exampleUr: "اسے سمجھانا بےکار ہے، وہ تو چکنا گھڑا ہے۔",
    exampleEn: "There is no point advising him — nothing sticks.",
    theme: "Food and home",
    register: "Literary and exam",
  },
  {
    idiom: "منہ توڑ جواب دینا",
    roman: "mũh toṛ jawāb denā",
    literal: "to give a mouth-breaking reply",
    meaningUr: "زوردار اور فیصلہ کن جواب دینا",
    meaningEn: "to give a crushing reply",
    exampleUr: "الزام لگانے والوں کو اس نے منہ توڑ جواب دیا۔",
    exampleEn: "He gave his accusers a crushing answer.",
    theme: "Body",
    register: "School Urdu",
  },
  {
    idiom: "کھری کھری سنانا",
    roman: "kharī kharī sunānā",
    literal: "to say the plain and pure things",
    meaningUr: "منہ پر سچی اور سخت بات کہنا",
    meaningEn: "to tell someone home truths to their face",
    exampleUr: "دیر سے آنے پر باس نے اسے کھری کھری سنائیں۔",
    exampleEn: "The boss gave him some plain speaking for arriving late.",
    theme: "Deceit and flattery",
    register: "Everyday speech",
  },
  {
    idiom: "آنکھوں میں دھول جھونکنا",
    roman: "ānkhõ mẽ dhūl jhõknā",
    literal: "to throw dust in the eyes",
    meaningUr: "دھوکہ دینا",
    meaningEn: "to deceive someone openly and get away with it",
    exampleUr: "جعلی کاغذات دکھا کر اس نے سب کی آنکھوں میں دھول جھونکی۔",
    exampleEn: "He fooled everyone by producing forged papers.",
    theme: "Deceit and flattery",
    register: "Literary and exam",
  },
  {
    idiom: "بال بال بچنا",
    roman: "bāl bāl bachnā",
    literal: "to be saved hair by hair",
    meaningUr: "بڑی مشکل سے بچ جانا",
    meaningEn: "to have a very narrow escape",
    exampleUr: "حادثے میں وہ بال بال بچ گیا۔",
    exampleEn: "He escaped the accident by a hair's breadth.",
    theme: "Fear and escape",
    register: "Everyday speech",
  },
  {
    idiom: "دن دونی رات چوگنی ترقی کرنا",
    roman: "din dūnī rāt chaugunī taraqqī karnā",
    literal: "to grow double by day and fourfold by night",
    meaningUr: "بہت تیزی سے ترقی کرنا",
    meaningEn: "to prosper extremely fast",
    exampleUr: "اس کا کاروبار دن دونی رات چوگنی ترقی کر رہا ہے۔",
    exampleEn: "His business is growing by leaps and bounds.",
    theme: "Struggle and hardship",
    register: "Literary and exam",
  },
  {
    idiom: "عید کا چاند ہونا",
    roman: "ʿīd kā chā̃d honā",
    literal: "to be the Eid moon",
    meaningUr: "بہت کم دکھائی دینا",
    meaningEn: "to be seen very rarely",
    exampleUr: "تم تو عید کا چاند ہو گئے ہو، کہاں رہتے ہو؟",
    exampleEn: "You have become a rare sight — where do you keep yourself?",
    theme: "Fear and escape",
    register: "Everyday speech",
  },
  {
    idiom: "لوہے کے چنے چبانا",
    roman: "lohe ke chane chabānā",
    literal: "to chew grams made of iron",
    meaningUr: "نہایت مشکل کام کرنا",
    meaningEn: "to take on an extremely tough job",
    exampleUr: "یہ امتحان پاس کرنا لوہے کے چنے چبانے کے برابر ہے۔",
    exampleEn: "Passing this exam is like chewing iron.",
    theme: "Struggle and hardship",
    register: "Literary and exam",
  },
  {
    idiom: "ٹیڑھی کھیر",
    roman: "ṭeṛhī khīr",
    literal: "crooked kheer",
    meaningUr: "بہت دشوار کام",
    meaningEn: "a task far harder than it looks",
    exampleUr: "یہ مسئلہ حل کرنا ٹیڑھی کھیر ثابت ہوا۔",
    exampleEn: "Solving this problem proved to be a very tough business.",
    theme: "Food and home",
    register: "School Urdu",
  },
  {
    idiom: "کان بھرنا",
    roman: "kān bharnā",
    literal: "to fill someone's ears",
    meaningUr: "چغلی کر کے بدگمان کرنا",
    meaningEn: "to poison someone's mind against another by tale-bearing",
    exampleUr: "اس نے صاحب کے کان بھر کر مجھے نوکری سے نکلوا دیا۔",
    exampleEn: "He turned the boss against me and had me dismissed.",
    theme: "Body",
    register: "School Urdu",
  },
  {
    idiom: "سر دھننا",
    roman: "sar dhunnā",
    literal: "to beat one's own head",
    meaningUr: "پچھتانا",
    meaningEn: "to regret bitterly once the chance has gone",
    exampleUr: "موقع گنوا کر اب سر دھننے سے کیا فائدہ۔",
    exampleEn: "What good is regret now that the chance is lost?",
    theme: "Body",
    register: "Literary and exam",
  },
];

/** Size of the collection. */
export const TOTAL_IDIOMS = IDIOMS.length;

/** Number of choices in a quiz question. */
export const QUIZ_OPTIONS = 4;

/** Anchor for the idiom-of-the-day rotation: day 1 is 1 January 2024 (UTC). */
export const ROTATION_ANCHOR = "2024-01-01";

/** Milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

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
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** 32-bit FNV-1a hash — turns any label into a numeric seed. */
export function hashSeed(text) {
  let hash = 0x811c9dc5;
  const value = String(text);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** mulberry32 — small deterministic PRNG returning values in [0, 1). */
export function makeRng(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Case-insensitive browse across script, transliteration and both meanings. */
export function filterIdioms({ theme = "All", register = "All", query = "" } = {}) {
  const needle = String(query).trim().toLowerCase();
  return IDIOMS.map((entry, index) => ({ ...entry, index })).filter((entry) => {
    if (theme !== "All" && entry.theme !== theme) return false;
    if (register !== "All" && entry.register !== register) return false;
    if (!needle) return true;
    return (
      entry.idiom.includes(needle) ||
      entry.roman.toLowerCase().includes(needle) ||
      entry.meaningEn.toLowerCase().includes(needle) ||
      entry.meaningUr.includes(needle) ||
      entry.literal.toLowerCase().includes(needle)
    );
  });
}

/** Deterministic idiom of the day for a calendar date. */
export function idiomOfTheDay(isoDate) {
  const start = parseIsoDate(ROTATION_ANCHOR);
  const target = parseIsoDate(isoDate);
  if (target === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  const offset = Math.round((target - start) / MS_PER_DAY);
  const index = ((offset % TOTAL_IDIOMS) + TOTAL_IDIOMS) % TOTAL_IDIOMS;
  return { date: isoDate.trim(), index, ...IDIOMS[index] };
}

/**
 * Build a four-option meaning question. `index` selects the idiom (wrapped into
 * range) and `round` re-seeds the option order.
 */
export function buildQuiz({ index = 0, round = 0, theme = "All", register = "All" } = {}) {
  const pool = filterIdioms({ theme, register });
  if (pool.length < QUIZ_OPTIONS) {
    return { error: "Pick a wider filter — a quiz needs at least four idioms." };
  }
  if (!Number.isFinite(index) || !Number.isFinite(round)) {
    return { error: "Question number and round must be whole numbers." };
  }

  const position = ((Math.trunc(index) % pool.length) + pool.length) % pool.length;
  const entry = pool[position];
  const rng = makeRng(hashSeed(`${entry.idiom}:${Math.trunc(round)}`));

  const distractorPool = pool.filter((item) => item.idiom !== entry.idiom);
  for (let i = distractorPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = distractorPool[i];
    distractorPool[i] = distractorPool[j];
    distractorPool[j] = swap;
  }

  const options = [entry.meaningEn].concat(
    distractorPool.slice(0, QUIZ_OPTIONS - 1).map((item) => item.meaningEn),
  );
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = options[i];
    options[i] = options[j];
    options[j] = swap;
  }

  return {
    idiom: entry.idiom,
    roman: entry.roman,
    literal: entry.literal,
    meaningUr: entry.meaningUr,
    meaningEn: entry.meaningEn,
    exampleUr: entry.exampleUr,
    exampleEn: entry.exampleEn,
    theme: entry.theme,
    register: entry.register,
    options,
    answerIndex: options.indexOf(entry.meaningEn),
    position,
    poolSize: pool.length,
  };
}

/** Mark one quiz answer. */
export function checkQuiz({ selectedIndex, answerIndex } = {}) {
  if (!Number.isInteger(answerIndex) || answerIndex < 0) {
    return { error: "This question has no answer key." };
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0) {
    return { error: "Choose one of the four meanings first." };
  }
  return { correct: selectedIndex === answerIndex, answerIndex };
}

/** Quiz tally, guarding the divide-by-zero before the first answer. */
export function quizScore({ attempted = 0, correct = 0 } = {}) {
  const tried = Number(attempted);
  const right = Number(correct);
  if (!Number.isFinite(tried) || !Number.isFinite(right) || tried < 0 || right < 0) {
    return { error: "Scores must be zero or a positive whole number." };
  }
  if (right > tried) {
    return { error: "Correct answers cannot exceed the number attempted." };
  }
  if (tried === 0) {
    return { attempted: 0, correct: 0, wrong: 0, accuracyPct: 0 };
  }
  return {
    attempted: tried,
    correct: right,
    wrong: tried - right,
    accuracyPct: Math.round((right / tried) * 100),
  };
}

/** How many idioms sit in each theme — used for the browse summary. */
export function countsByTheme() {
  const counts = {};
  for (const theme of THEMES) counts[theme] = 0;
  for (const entry of IDIOMS) {
    counts[entry.theme] = (counts[entry.theme] || 0) + 1;
  }
  return counts;
}
