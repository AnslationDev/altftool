/**
 * Tamil Palamozhi Explorer — proverb bank plus pure browse, daily-pick and quiz logic.
 *
 * A palamozhi (பழமொழி) is a complete traditional saying quoted unchanged, unlike
 * a phrase-level idiom. Each entry separates the literal translation from the
 * figurative sense, because in most proverbs those two are deliberately far apart.
 *
 * No React, no DOM, no Date.now(): the daily pick takes an ISO date argument and
 * the quiz shuffle is seeded, so identical inputs always give identical output.
 */

/** Topic buckets used by the browse filter. */
export const THEMES = [
  "Effort and persistence",
  "Learning and wisdom",
  "Speech and conduct",
  "Nature and animals",
  "Food and home",
  "Caution and moderation",
];

/**
 * 30 widely quoted Tamil proverbs. `roman` follows the ISO 15919 style used in
 * Tamil grammars: ā ī ū ē ō for long vowels, ṭ ḍ ṇ ḷ ḻ ṟ ṉ for the retroflex and
 * alveolar series, and c for the letter ச.
 */
export const PROVERBS = [
  {
    proverb: "அகத்தின் அழகு முகத்தில் தெரியும்",
    roman: "akattiṉ aḻaku mukattil teriyum",
    literal: "The beauty of the inner self shows on the face.",
    figurative: "Character cannot be hidden; it shows in how a person looks and behaves.",
    tamilGloss: "மனத்தின் தூய்மை முகத்தில் வெளிப்படும்.",
    equivalent: "The face is the index of the mind.",
    theme: "Speech and conduct",
  },
  {
    proverb: "ஆபத்துக்கு பாவம் இல்லை",
    roman: "āpattukku pāvam illai",
    literal: "There is no sin in an emergency.",
    figurative: "What is done to survive a crisis should not be judged by ordinary rules.",
    tamilGloss: "நெருக்கடியில் செய்யும் செயலுக்குக் குற்றம் இல்லை.",
    equivalent: "Necessity knows no law.",
    theme: "Caution and moderation",
  },
  {
    proverb: "ஆழம் தெரியாமல் காலை விடாதே",
    roman: "āḻam teriyāmal kālai viṭātē",
    literal: "Do not put your foot in without knowing the depth.",
    figurative: "Do not commit to something before you understand what it involves.",
    tamilGloss: "தெரியாத விஷயத்தில் அவசரமாக இறங்காதே.",
    equivalent: "Look before you leap.",
    theme: "Caution and moderation",
  },
  {
    proverb: "அடி மேல் அடி அடித்தால் அம்மியும் நகரும்",
    roman: "aṭi mēl aṭi aṭittāl ammiyum nakarum",
    literal: "Struck blow upon blow, even a grinding stone will move.",
    figurative: "Repeated effort shifts even the most immovable obstacle.",
    tamilGloss: "தொடர் முயற்சியால் கடினமானதும் நகரும்.",
    equivalent: "Constant dripping wears away the stone.",
    theme: "Effort and persistence",
  },
  {
    proverb: "ஆனை வரும் பின்னே மணி ஓசை வரும் முன்னே",
    roman: "āṉai varum piṉṉē maṇi ōcai varum muṉṉē",
    literal: "The elephant comes behind; the sound of its bell comes ahead.",
    figurative: "Big events announce themselves before they arrive.",
    tamilGloss: "நிகழ்வுக்கு முன்பே அறிகுறி தெரியும்.",
    equivalent: "Coming events cast their shadows before.",
    theme: "Nature and animals",
  },
  {
    proverb: "அளவுக்கு மிஞ்சினால் அமிர்தமும் நஞ்சு",
    roman: "aḷavukku miñciṉāl amirtamum nañcu",
    literal: "Beyond measure, even nectar is poison.",
    figurative: "Anything taken past its proper limit becomes harmful.",
    tamilGloss: "எதுவும் அளவுக்கு மீறினால் தீங்கு தரும்.",
    equivalent: "Too much of anything is good for nothing.",
    theme: "Caution and moderation",
  },
  {
    proverb: "ஆடத் தெரியாதவள் தெரு கோணல் என்றாளாம்",
    roman: "āṭat teriyātavaḷ teru kōṇal eṉṟāḷām",
    literal: "The woman who could not dance said the street was crooked.",
    figurative: "People blame their surroundings for a failure that is their own.",
    tamilGloss: "தன் குறையை மறைக்கப் பிறரைக் குறை கூறுதல்.",
    equivalent: "A bad workman blames his tools.",
    theme: "Speech and conduct",
  },
  {
    proverb: "உண்டி கொடுத்தோர் உயிர் கொடுத்தோரே",
    roman: "uṇṭi koṭuttōr uyir koṭuttōrē",
    literal: "Those who gave food are those who gave life.",
    figurative: "Feeding someone in need is the highest form of help there is.",
    tamilGloss: "உணவு அளிப்பவர் உயிர் அளிப்பவருக்கு நிகர்.",
    equivalent: "",
    theme: "Food and home",
  },
  {
    proverb: "ஊரோடு ஒத்து வாழ்",
    roman: "ūrōṭu ottu vāḻ",
    literal: "Live in agreement with your town.",
    figurative: "Fit in with the community you live among instead of standing apart.",
    tamilGloss: "சமூகத்தோடு இணைந்து வாழ்.",
    equivalent: "When in Rome, do as the Romans do.",
    theme: "Speech and conduct",
  },
  {
    proverb: "ஊசி போல புகுந்து உலக்கை போல வளர்வான்",
    roman: "ūci pōla pukuntu ulakkai pōla vaḷarvāṉ",
    literal: "He enters like a needle and grows like a pestle.",
    figurative: "Someone who arrives small and harmless and ends up taking over.",
    tamilGloss: "சிறியவனாக நுழைந்து பெரிதாக ஆதிக்கம் செலுத்துவான்.",
    equivalent: "Give him an inch and he will take a mile.",
    theme: "Caution and moderation",
  },
  {
    proverb: "உப்பு இட்டவரை உள்ளளவும் நினை",
    roman: "uppu iṭṭavarai uḷḷaḷavum niṉai",
    literal: "Remember the one who gave you salt for as long as you live.",
    figurative: "Never forget someone who fed or helped you when you needed it.",
    tamilGloss: "உதவி செய்தவரை வாழ்நாள் முழுவதும் நினைவில் கொள்.",
    equivalent: "",
    theme: "Food and home",
  },
  {
    proverb: "எறும்பு ஊரக் கல்லும் தேயும்",
    roman: "eṟumpu ūrak kallum tēyum",
    literal: "Even stone wears down where ants keep crawling.",
    figurative: "Small effort repeated long enough achieves what force cannot.",
    tamilGloss: "சிறு முயற்சியும் தொடர்ந்தால் பெரிய பலன் தரும்.",
    equivalent: "Little strokes fell great oaks.",
    theme: "Effort and persistence",
  },
  {
    proverb: "கற்றது கைமண் அளவு, கல்லாதது உலகளவு",
    roman: "kaṟṟatu kaimaṇ aḷavu, kallātatu ulakaḷavu",
    literal: "What is learnt is a handful of earth; what is unlearnt is the size of the world.",
    figurative: "However much you know, what you do not know is vastly larger.",
    tamilGloss: "கற்றது சிறிது; கற்காதது மிகப் பெரிது.",
    equivalent: "The more you learn, the more you realise you do not know.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "கடுகு சிறுத்தாலும் காரம் குறையாது",
    roman: "kaṭuku ciṟuttālum kāram kuṟaiyātu",
    literal: "Though the mustard seed is small, its pungency is not less.",
    figurative: "Size is no measure of capability.",
    tamilGloss: "சிறியவராயினும் ஆற்றல் குறையாது.",
    equivalent: "Small but mighty.",
    theme: "Nature and animals",
  },
  {
    proverb: "குரங்கு கையில் பூமாலை",
    roman: "kuraṅku kaiyil pūmālai",
    literal: "A flower garland in a monkey's hand.",
    figurative: "Something valuable placed with someone who cannot appreciate it.",
    tamilGloss: "தகுதியற்றவர் கையில் சிறந்த பொருள்.",
    equivalent: "Pearls before swine.",
    theme: "Nature and animals",
  },
  {
    proverb: "கூழுக்கும் ஆசை மீசைக்கும் ஆசை",
    roman: "kūḻukkum ācai mīcaikkum ācai",
    literal: "Wanting the gruel and wanting the moustache clean too.",
    figurative: "You cannot have two things that rule each other out.",
    tamilGloss: "இரண்டையும் ஒரே நேரத்தில் பெற முடியாது.",
    equivalent: "You cannot have your cake and eat it too.",
    theme: "Food and home",
  },
  {
    proverb: "சிறு துரும்பும் பல் குத்த உதவும்",
    roman: "ciṟu turumpum pal kutta utavum",
    literal: "Even a small twig is useful for picking the teeth.",
    figurative: "Nothing is so small that it can never be of use.",
    tamilGloss: "சிறியதும் ஒரு நேரத்தில் பயன்படும்.",
    equivalent: "Every little helps.",
    theme: "Effort and persistence",
  },
  {
    proverb: "சூரியனைப் பார்த்து நாய் குரைத்தது போல",
    roman: "cūriyaṉaip pārttu nāy kuraittatu pōla",
    literal: "Like a dog barking at the sun.",
    figurative: "Abuse from a small person does nothing to a great one.",
    tamilGloss: "பெரியவரை சிறியவர் இகழ்வது வீண்.",
    equivalent: "The moon does not heed the barking of dogs.",
    theme: "Nature and animals",
  },
  {
    proverb: "தாய் போல பிள்ளை, நூல் போல சேலை",
    roman: "tāy pōla piḷḷai, nūl pōla cēlai",
    literal: "As the mother, so the child; as the thread, so the sari.",
    figurative: "The product always reflects the quality of what it came from.",
    tamilGloss: "மூலம் எப்படியோ விளைவும் அப்படியே.",
    equivalent: "Like mother, like daughter.",
    theme: "Food and home",
  },
  {
    proverb: "தலை இருக்க வால் ஆடலாமா?",
    roman: "talai irukka vāl āṭalāmā?",
    literal: "Should the tail wag while the head is still there?",
    figurative: "Juniors should not act over the heads of their elders.",
    tamilGloss: "பெரியவர் இருக்கும்போது சிறியவர் முந்தக்கூடாது.",
    equivalent: "",
    theme: "Speech and conduct",
  },
  {
    proverb: "நாய் வாலை நிமிர்த்த முடியாது",
    roman: "nāy vālai nimirtta muṭiyātu",
    literal: "A dog's tail cannot be straightened.",
    figurative: "An ingrained nature will not be reformed by advice.",
    tamilGloss: "இயல்பான குணத்தை மாற்ற முடியாது.",
    equivalent: "A leopard cannot change its spots.",
    theme: "Nature and animals",
  },
  {
    proverb: "நிழலின் அருமை வெயிலில் தெரியும்",
    roman: "niḻaliṉ arumai veyilil teriyum",
    literal: "The worth of shade is known in the sun.",
    figurative: "You learn the value of something only when you are without it.",
    tamilGloss: "ஒன்றின் அருமை அது இல்லாதபோதே தெரியும்.",
    equivalent: "You never miss the water till the well runs dry.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "நெருப்பில்லாமல் புகையாது",
    roman: "neruppillāmal pukaiyātu",
    literal: "Without fire there is no smoke.",
    figurative: "A rumour usually has some real cause behind it.",
    tamilGloss: "காரணம் இல்லாமல் விளைவு இல்லை.",
    equivalent: "There is no smoke without fire.",
    theme: "Caution and moderation",
  },
  {
    proverb: "பசி வந்தால் பத்தும் பறந்து போகும்",
    roman: "paci vantāl pattum paṟantu pōkum",
    literal: "When hunger arrives, all ten fly away.",
    figurative: "Hunger drives out shame, judgement and every other refinement.",
    tamilGloss: "பசி வந்தால் அறிவும் நாணமும் மறையும்.",
    equivalent: "A hungry man is an angry man.",
    theme: "Food and home",
  },
  {
    proverb: "பழகப் பழக பாலும் புளிக்கும்",
    roman: "paḻakap paḻaka pālum puḷikkum",
    literal: "With enough familiarity, even milk turns sour.",
    figurative: "Too much closeness wears away respect.",
    tamilGloss: "அளவுக்கு மீறிய நெருக்கம் மதிப்பைக் குறைக்கும்.",
    equivalent: "Familiarity breeds contempt.",
    theme: "Speech and conduct",
  },
  {
    proverb: "முயற்சி திருவினையாக்கும்",
    roman: "muyaṟci tiruviṉaiyākkum",
    literal: "Effort turns into fortune.",
    figurative: "Sustained effort is what actually produces wealth and success.",
    tamilGloss: "முயற்சி செல்வத்தையும் வெற்றியையும் தரும்.",
    equivalent: "Fortune favours the diligent. (Tirukkural 616)",
    theme: "Effort and persistence",
  },
  {
    proverb: "யானைக்கும் அடி சறுக்கும்",
    roman: "yāṉaikkum aṭi caṟukkum",
    literal: "Even an elephant's foot slips.",
    figurative: "Even the most capable people make mistakes.",
    tamilGloss: "பெரியவர்களும் தவறு செய்யலாம்.",
    equivalent: "Even Homer nods.",
    theme: "Nature and animals",
  },
  {
    proverb: "ஒரு பானை சோற்றுக்கு ஒரு சோறு பதம்",
    roman: "oru pāṉai cōṟṟukku oru cōṟu patam",
    literal: "One grain is the test for a whole pot of rice.",
    figurative: "A single sample tells you what the whole batch is like.",
    tamilGloss: "ஒரு மாதிரியே முழுமையை உணர்த்தும்.",
    equivalent: "The proof of the pudding is in the eating.",
    theme: "Food and home",
  },
  {
    proverb: "வாய் நல்லதானால் ஊர் நல்லது",
    roman: "vāy nallatāṉāl ūr nallatu",
    literal: "If your mouth is good, the whole town is good.",
    figurative: "Speak well of people and the world treats you well in return.",
    tamilGloss: "இனிய பேச்சு அனைவரையும் நண்பராக்கும்.",
    equivalent: "A soft answer turns away wrath.",
    theme: "Speech and conduct",
  },
  {
    proverb: "இளமையில் கல்",
    roman: "iḷamaiyil kal",
    literal: "Learn while young.",
    figurative: "Learning taken up early lasts, because young minds absorb it best.",
    tamilGloss: "சிறு வயதிலேயே கற்றுக்கொள்.",
    equivalent: "Learn young, learn fair.",
    theme: "Learning and wisdom",
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
      entry.tamilGloss.includes(needle)
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
    tamilGloss: entry.tamilGloss,
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
