/**
 * Bengali Probad Explorer — proverb bank plus pure browse, daily-pick and quiz logic.
 *
 * A probad (প্রবাদ) is a complete traditional saying quoted unchanged; a
 * probochon or bagdhara is the phrase-level idiom that has to be fitted into a
 * sentence. Each entry keeps the literal translation apart from the real sense.
 *
 * No React, no DOM, no Date.now(): the daily pick takes an ISO date argument and
 * the quiz shuffle is seeded, so identical inputs always give identical output.
 */

/** Topic buckets used by the browse filter. */
export const THEMES = [
  "Effort and patience",
  "Learning and wisdom",
  "Speech and truth",
  "Nature and animals",
  "People and relationships",
  "Caution and moderation",
];

/**
 * 30 widely quoted Bengali probad. `roman` follows the pronunciation-based
 * scheme used in Bengali primers, where the inherent vowel is written ô, ā marks
 * the long a, and ã / ĩ / õ mark nasalised vowels (chandrabindu).
 */
export const PROVERBS = [
  {
    proverb: "অতি লোভে তাঁতি নষ্ট",
    roman: "oti lobhe tãti nôshto",
    literal: "Excessive greed ruins the weaver.",
    figurative: "Reaching for more than your share destroys what you already had.",
    banglaGloss: "অতিরিক্ত লোভ সর্বনাশ ডেকে আনে।",
    equivalent: "Greed is the root of all evil.",
    theme: "Caution and moderation",
  },
  {
    proverb: "অল্প বিদ্যা ভয়ংকরী",
    roman: "ôlpo biddyā bhôyongkorī",
    literal: "A small amount of learning is a terrible thing.",
    figurative: "Half-knowledge is more dangerous than no knowledge at all.",
    banglaGloss: "সামান্য জ্ঞান বিপদের কারণ হয়।",
    equivalent: "A little learning is a dangerous thing.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "আগে দর্শনধারী পরে গুণবিচারী",
    roman: "āge dôrshondhārī pôre guṇbichārī",
    literal: "Appearance is taken in first, quality judged afterwards.",
    figurative: "People react to how something looks before they assess what it is worth.",
    banglaGloss: "আগে বাইরের রূপ দেখা হয়, পরে গুণ বিচার করা হয়।",
    equivalent: "First impressions count.",
    theme: "People and relationships",
  },
  {
    proverb: "আপনি বাঁচলে বাপের নাম",
    roman: "āponi bãchle bāper nām",
    literal: "Only if you survive can you speak your father's name.",
    figurative: "Self-preservation comes before every other obligation.",
    banglaGloss: "আগে নিজে বাঁচা, পরে অন্য কথা।",
    equivalent: "Self-preservation is the first law of nature.",
    theme: "People and relationships",
  },
  {
    proverb: "ইচ্ছা থাকলে উপায় হয়",
    roman: "ichchhā thākle upāy hôy",
    literal: "If the wish exists, a way appears.",
    figurative: "Genuine determination finds a route through.",
    banglaGloss: "দৃঢ় ইচ্ছা থাকলে পথ বেরোয়।",
    equivalent: "Where there is a will, there is a way.",
    theme: "Effort and patience",
  },
  {
    proverb: "উঠন্তি মুলো পত্তনেই চেনা যায়",
    roman: "uṭhonti mulo pôttonei chenā jāy",
    literal: "A sprouting radish is recognised at the seedling stage.",
    figurative: "What someone will become shows in how they begin.",
    banglaGloss: "শুরু দেখেই ভবিষ্যৎ বোঝা যায়।",
    equivalent: "The child is father of the man.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "এক হাতে তালি বাজে না",
    roman: "ek hāte tāli bāje nā",
    literal: "One hand cannot clap.",
    figurative: "A quarrel is never entirely one person's doing.",
    banglaGloss: "ঝগড়া একজনের দোষে হয় না।",
    equivalent: "It takes two to make a quarrel.",
    theme: "People and relationships",
  },
  {
    proverb: "কাঁটা দিয়ে কাঁটা তোলা",
    roman: "kãṭā diye kãṭā tolā",
    literal: "Pulling out a thorn with another thorn.",
    figurative: "Using one problem or rival to deal with another.",
    banglaGloss: "এক সমস্যার সমাধান আরেক সমস্যা দিয়ে করা।",
    equivalent: "Fight fire with fire.",
    theme: "Caution and moderation",
  },
  {
    proverb: "কানা ছেলের নাম পদ্মলোচন",
    roman: "kānā chheler nām pôdmolochon",
    literal: "The blind boy is named Lotus-Eyed.",
    figurative: "A grand name attached to something that has none of the quality.",
    banglaGloss: "গুণ নেই অথচ নাম বড়।",
    equivalent: "",
    theme: "Speech and truth",
  },
  {
    proverb: "গাছে কাঁঠাল গোঁফে তেল",
    roman: "gāchhe kãṭhāl gõphe tel",
    literal: "The jackfruit is still on the tree and the oil is already on the moustache.",
    figurative: "Celebrating a result long before it is anywhere near certain.",
    banglaGloss: "ফল পাওয়ার আগেই আনন্দে মাতা।",
    equivalent: "Do not count your chickens before they hatch.",
    theme: "Caution and moderation",
  },
  {
    proverb: "গোদের উপর বিষফোঁড়া",
    roman: "goder upor bishphõṛā",
    literal: "A poisonous boil on top of a swollen leg.",
    figurative: "A new trouble landing on someone already suffering.",
    banglaGloss: "এক বিপদের ওপর আরেক বিপদ।",
    equivalent: "To add insult to injury.",
    theme: "Caution and moderation",
  },
  {
    proverb: "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    roman: "ghôr poṛā goru sĩdure megh dekhle ḍorāy",
    literal: "A cow whose shed burnt down is frightened even by a red cloud.",
    figurative: "Someone badly hurt once becomes afraid of anything that resembles it.",
    banglaGloss: "একবার ঠকলে বারবার সাবধান হয়।",
    equivalent: "Once bitten, twice shy.",
    theme: "Nature and animals",
  },
  {
    proverb: "চোরে চোরে মাসতুতো ভাই",
    roman: "chore chore māstuto bhāi",
    literal: "Thieves are cousins to one another.",
    figurative: "People of the same bad character recognise and back each other.",
    banglaGloss: "একই স্বভাবের লোক একজোট হয়।",
    equivalent: "Birds of a feather flock together.",
    theme: "People and relationships",
  },
  {
    proverb: "ছেড়ে দে মা কেঁদে বাঁচি",
    roman: "chheṛe de mā kẽde bãchi",
    literal: "Let me go, mother, so I can weep and survive.",
    figurative: "A plea to be released from something one cannot cope with.",
    banglaGloss: "দয়া করে ছেড়ে দেওয়ার আকুতি।",
    equivalent: "",
    theme: "Speech and truth",
  },
  {
    proverb: "জলে কুমির ডাঙায় বাঘ",
    roman: "jôle kumir ḍāṅgāy bāgh",
    literal: "A crocodile in the water and a tiger on the land.",
    figurative: "Danger waiting on every side, whichever way you move.",
    banglaGloss: "চারদিকেই বিপদ।",
    equivalent: "Between the devil and the deep blue sea.",
    theme: "Nature and animals",
  },
  {
    proverb: "ঝিকে মেরে বউকে শেখানো",
    roman: "jhike mere bouke shekhāno",
    literal: "Beating the maid to teach the daughter-in-law.",
    figurative: "Rebuking one person so that a second one takes the message.",
    banglaGloss: "একজনকে বকে অন্যজনকে শিক্ষা দেওয়া।",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "ঠেলার নাম বাবাজি",
    roman: "ṭhelār nām bābāji",
    literal: "Under a shove, everyone turns respectful.",
    figurative: "Pressure makes people cooperate where persuasion did not.",
    banglaGloss: "চাপে পড়লে সবাই বাধ্য হয়।",
    equivalent: "Needs must when the devil drives.",
    theme: "People and relationships",
  },
  {
    proverb: "নাচতে না জানলে উঠোন বাঁকা",
    roman: "nāchte nā jānle uṭhon bãkā",
    literal: "If you cannot dance, the courtyard is crooked.",
    figurative: "Blaming the conditions for one's own lack of skill.",
    banglaGloss: "নিজের অক্ষমতা ঢাকতে অন্যের দোষ দেওয়া।",
    equivalent: "A bad workman blames his tools.",
    theme: "Speech and truth",
  },
  {
    proverb: "নদীর একূল ভাঙে ওকূল গড়ে",
    roman: "nôdīr ekūl bhāṅge okūl gôṛe",
    literal: "One bank of the river erodes while the other builds up.",
    figurative: "What one person loses is exactly what another gains.",
    banglaGloss: "একজনের ক্ষতি অন্যজনের লাভ।",
    equivalent: "One man's loss is another man's gain.",
    theme: "Nature and animals",
  },
  {
    proverb: "পাকা ধানে মই দেওয়া",
    roman: "pākā dhāne moi deoyā",
    literal: "Running a harrow over ripe paddy.",
    figurative: "Destroying work at the very moment it was about to pay off.",
    banglaGloss: "প্রায় শেষ হওয়া কাজ নষ্ট করে দেওয়া।",
    equivalent: "",
    theme: "Effort and patience",
  },
  {
    proverb: "বজ্র আঁটুনি ফসকা গেরো",
    roman: "bôjro ãṭuni phôskā gero",
    literal: "A thunderous tightening with a knot that slips.",
    figurative: "Elaborate precautions that fail at the one point that mattered.",
    banglaGloss: "বাইরে কড়াকড়ি, ভেতরে ফাঁক।",
    equivalent: "",
    theme: "Effort and patience",
  },
  {
    proverb: "বসতে পেলে শুতে চায়",
    roman: "bôste pele shute chāy",
    literal: "Given a place to sit, they want to lie down.",
    figurative: "A small concession is immediately treated as an entitlement to more.",
    banglaGloss: "একটু সুযোগ পেলেই বেশি দাবি করা।",
    equivalent: "Give an inch and they will take a mile.",
    theme: "People and relationships",
  },
  {
    proverb: "যেমন কর্ম তেমন ফল",
    roman: "jemon kôrmo temon phôl",
    literal: "As the deed, so the fruit.",
    figurative: "The outcome you get matches the work you actually put in.",
    banglaGloss: "যেমন কাজ করবে তেমন ফল পাবে।",
    equivalent: "As you sow, so shall you reap.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "যত গর্জে তত বর্ষে না",
    roman: "jôto gôrje tôto bôrshe nā",
    literal: "It does not rain as much as it thunders.",
    figurative: "The people making the most noise deliver the least.",
    banglaGloss: "যারা বেশি বড়াই করে তারা কাজ কম করে।",
    equivalent: "Barking dogs seldom bite.",
    theme: "Speech and truth",
  },
  {
    proverb: "রাখে হরি মারে কে",
    roman: "rākhe hôri māre ke",
    literal: "If Hari protects, who can kill?",
    figurative: "Said of a narrow escape that felt like providence.",
    banglaGloss: "ভগবান রক্ষা করলে কেউ ক্ষতি করতে পারে না।",
    equivalent: "",
    theme: "Learning and wisdom",
  },
  {
    proverb: "লোভে পাপ পাপে মৃত্যু",
    roman: "lobhe pāp pāpe mṛtyu",
    literal: "Greed leads to sin, and sin to death.",
    figurative: "Greed starts a chain that ends in ruin.",
    banglaGloss: "লোভ পাপের দিকে, পাপ ধ্বংসের দিকে নিয়ে যায়।",
    equivalent: "The wages of sin is death.",
    theme: "Caution and moderation",
  },
  {
    proverb: "শাক দিয়ে মাছ ঢাকা",
    roman: "shāk diye māchh ḍhākā",
    literal: "Covering the fish with leafy greens.",
    figurative: "A flimsy cover-up that anyone can see through.",
    banglaGloss: "বড় দোষ সামান্য অজুহাতে ঢাকার চেষ্টা।",
    equivalent: "You cannot hide the sun with a sieve.",
    theme: "Speech and truth",
  },
  {
    proverb: "সবুরে মেওয়া ফলে",
    roman: "sôbure mewā phôle",
    literal: "Patience makes the sweet fruit ripen.",
    figurative: "Waiting properly is what lets a good result arrive.",
    banglaGloss: "ধৈর্য ধরলে ভালো ফল মেলে।",
    equivalent: "Patience is bitter, but its fruit is sweet.",
    theme: "Effort and patience",
  },
  {
    proverb: "হাতি ঘোড়া গেল তল, মশা বলে কত জল",
    roman: "hāti ghoṛā gelo tôl, môshā bôle kôto jôl",
    literal: "Elephants and horses have sunk, and the mosquito asks how deep the water is.",
    figurative: "The least experienced person talking biggest in front of those who know.",
    banglaGloss: "অভিজ্ঞদের সামনে অনভিজ্ঞের বড় কথা।",
    equivalent: "",
    theme: "Nature and animals",
  },
  {
    proverb: "উলুবনে মুক্তা ছড়ানো",
    roman: "ulubône muktā chhôṛāno",
    literal: "Scattering pearls in a reed bed.",
    figurative: "Offering something valuable where nobody can appreciate it.",
    banglaGloss: "অপাত্রে মূল্যবান জিনিস দেওয়া।",
    equivalent: "Casting pearls before swine.",
    theme: "Nature and animals",
  },
];

/** Size of the collection. */
export const TOTAL_PROVERBS = PROVERBS.length;

/** Number of choices in a quiz question. */
export const QUIZ_OPTIONS = 4;

/** Anchor for the proverb-of-the-day rotation: day 1 is 1 January 2024 (UTC). */
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

/** Case-insensitive browse across script, transliteration and all glosses. */
export function filterProverbs({ theme = "All", query = "" } = {}) {
  const needle = String(query).trim().toLowerCase();
  return PROVERBS.map((entry, index) => ({ ...entry, index })).filter((entry) => {
    if (theme !== "All" && entry.theme !== theme) return false;
    if (!needle) return true;
    return (
      entry.proverb.includes(needle) ||
      entry.roman.toLowerCase().includes(needle) ||
      entry.literal.toLowerCase().includes(needle) ||
      entry.figurative.toLowerCase().includes(needle) ||
      entry.equivalent.toLowerCase().includes(needle) ||
      entry.banglaGloss.includes(needle)
    );
  });
}

/** Deterministic proverb of the day for a calendar date. */
export function proverbOfTheDay(isoDate) {
  const start = parseIsoDate(ROTATION_ANCHOR);
  const target = parseIsoDate(isoDate);
  if (target === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  const offset = Math.round((target - start) / MS_PER_DAY);
  const index = ((offset % TOTAL_PROVERBS) + TOTAL_PROVERBS) % TOTAL_PROVERBS;
  return { date: isoDate.trim(), index, ...PROVERBS[index] };
}

/**
 * Build a four-option meaning question. `index` picks the proverb (wrapped into
 * range) and `round` re-seeds the option order.
 */
export function buildQuiz({ index = 0, round = 0, theme = "All" } = {}) {
  const pool = filterProverbs({ theme });
  if (pool.length < QUIZ_OPTIONS) {
    return { error: "Pick a wider theme — a quiz needs at least four proverbs." };
  }
  if (!Number.isFinite(index) || !Number.isFinite(round)) {
    return { error: "Question number and round must be whole numbers." };
  }

  const position = ((Math.trunc(index) % pool.length) + pool.length) % pool.length;
  const entry = pool[position];
  const rng = makeRng(hashSeed(`${entry.proverb}:${Math.trunc(round)}`));

  const distractorPool = pool.filter((item) => item.proverb !== entry.proverb);
  for (let i = distractorPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = distractorPool[i];
    distractorPool[i] = distractorPool[j];
    distractorPool[j] = swap;
  }

  const options = [entry.figurative].concat(
    distractorPool.slice(0, QUIZ_OPTIONS - 1).map((item) => item.figurative),
  );
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = options[i];
    options[i] = options[j];
    options[j] = swap;
  }

  return {
    proverb: entry.proverb,
    roman: entry.roman,
    literal: entry.literal,
    figurative: entry.figurative,
    banglaGloss: entry.banglaGloss,
    equivalent: entry.equivalent,
    theme: entry.theme,
    options,
    answerIndex: options.indexOf(entry.figurative),
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

/** How many proverbs sit in each theme — used for the browse summary. */
export function countsByTheme() {
  const counts = {};
  for (const theme of THEMES) counts[theme] = 0;
  for (const entry of PROVERBS) {
    counts[entry.theme] = (counts[entry.theme] || 0) + 1;
  }
  return counts;
}
