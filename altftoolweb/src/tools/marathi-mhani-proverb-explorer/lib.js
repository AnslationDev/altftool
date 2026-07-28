/**
 * Marathi Mhani Explorer — proverb bank plus pure browse, daily-pick and quiz logic.
 *
 * A mhan (म्हण) is a complete traditional saying quoted unchanged, unlike a
 * vakprachar (वाक्प्रचार), which is a phrase-level idiom bent to fit its sentence.
 * Each entry keeps the literal translation apart from the figurative sense.
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
 * 30 widely quoted Marathi mhani. `roman` uses the practical Devanagari
 * transliteration common in Marathi primers: macrons for long vowels, ṭ ḍ ṇ ḷ ṣ
 * for the retroflex series, and ch for च.
 */
export const PROVERBS = [
  {
    proverb: "अति तेथे माती",
    roman: "ati tethe mātī",
    literal: "Where there is excess, there is dust.",
    figurative: "Anything overdone ends in ruin.",
    marathiGloss: "कोणत्याही गोष्टीचा अतिरेक नुकसानकारक असतो.",
    equivalent: "Too much of anything is good for nothing.",
    theme: "Caution and moderation",
  },
  {
    proverb: "अंथरूण पाहून पाय पसरावे",
    roman: "antharūṇ pāhūn pāy pasarāve",
    literal: "Stretch your legs only as far as the bedding allows.",
    figurative: "Spend and commit only within what you actually have.",
    marathiGloss: "आपल्या ऐपतीप्रमाणे खर्च करावा.",
    equivalent: "Cut your coat according to your cloth.",
    theme: "Caution and moderation",
  },
  {
    proverb: "आग रामेश्वरी, बंब सोमेश्वरी",
    roman: "āg rāmeśvarī, bamb somēśvarī",
    literal: "The fire is at Rameshwar and the fire engine at Someshwar.",
    figurative: "Effort or help sent to entirely the wrong place.",
    marathiGloss: "मदत चुकीच्या ठिकाणी पोहोचणे.",
    equivalent: "Barking up the wrong tree.",
    theme: "Effort and patience",
  },
  {
    proverb: "आधीच उल्हास, त्यात फाल्गुन मास",
    roman: "ādhīch ulhās, tyāt phālgun mās",
    literal: "Idle to begin with, and then the month of Phalgun on top.",
    figurative: "A lazy person handed a ready-made excuse to do even less.",
    marathiGloss: "आळशी माणसाला आणखी एक निमित्त मिळणे.",
    equivalent: "",
    theme: "Effort and patience",
  },
  {
    proverb: "उतावळा नवरा, गुडघ्याला बाशिंग",
    roman: "utāvaḷā navarā, guḍaghyālā bāśiṅg",
    literal: "The impatient bridegroom ties the wedding band to his knee.",
    figurative: "Rushing makes a person do something absurd.",
    marathiGloss: "घाईगडबडीत मूर्खपणा करणे.",
    equivalent: "Haste makes waste.",
    theme: "Caution and moderation",
  },
  {
    proverb: "उथळ पाण्याला खळखळाट फार",
    roman: "uthaḷ pāṇyālā khaḷakhaḷāṭ phār",
    literal: "Shallow water makes a great deal of noise.",
    figurative: "The people who know least talk the loudest.",
    marathiGloss: "ज्ञान थोडे असणारे जास्त बडबड करतात.",
    equivalent: "Empty vessels make the most noise.",
    theme: "Speech and truth",
  },
  {
    proverb: "एक ना धड, भाराभर चिंध्या",
    roman: "ek nā dhaḍ, bhārābhar chindhyā",
    literal: "Not one whole cloth, but a bundle of rags.",
    figurative: "Starting many things and finishing none of them.",
    marathiGloss: "अनेक कामे अर्धवट करणे.",
    equivalent: "Jack of all trades, master of none.",
    theme: "Effort and patience",
  },
  {
    proverb: "कर नाही त्याला डर कशाला",
    roman: "kar nāhī tyālā ḍar kaśālā",
    literal: "Why should the one who has done nothing be afraid?",
    figurative: "An innocent person has no reason to fear an inquiry.",
    marathiGloss: "निर्दोष माणसाला भीती नसते.",
    equivalent: "A clear conscience fears no accusation.",
    theme: "Speech and truth",
  },
  {
    proverb: "काखेत कळसा, गावाला वळसा",
    roman: "kākhet kaḷasā, gāvālā vaḷasā",
    literal: "The pot is under your arm and you go round the village looking for it.",
    figurative: "Hunting far and wide for what you already have.",
    marathiGloss: "जवळची वस्तू शोधण्यासाठी दूर फिरणे.",
    equivalent: "Looking for the spectacles sitting on your own nose.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "गर्जेल तो पडेल काय",
    roman: "garjel to paḍel kāy",
    literal: "Will the cloud that thunders actually rain?",
    figurative: "The loudest boasters are the least likely to act.",
    marathiGloss: "बडबड करणारे प्रत्यक्षात काही करत नाहीत.",
    equivalent: "Barking dogs seldom bite.",
    theme: "Speech and truth",
  },
  {
    proverb: "गाढवाला गुळाची चव काय",
    roman: "gāḍhavālā guḷāchī chav kāy",
    literal: "What does a donkey know of the taste of jaggery?",
    figurative: "Someone without discernment cannot value what is good.",
    marathiGloss: "योग्यता नसलेल्याला चांगल्याची किंमत कळत नाही.",
    equivalent: "Casting pearls before swine.",
    theme: "Nature and animals",
  },
  {
    proverb: "चोराच्या उलट्या बोंबा",
    roman: "chorāchyā ulṭyā bombā",
    literal: "The thief raises the loudest alarm.",
    figurative: "The guilty party accuses everyone else first.",
    marathiGloss: "दोषी माणूसच जास्त आरडाओरडा करतो.",
    equivalent: "The guilty dog barks the loudest.",
    theme: "Speech and truth",
  },
  {
    proverb: "जित्याची खोड मेल्याशिवाय जात नाही",
    roman: "jityāchī khoḍ melyāśivāy jāt nāhī",
    literal: "A living man's bad habit does not leave him until he dies.",
    figurative: "An ingrained nature is almost impossible to reform.",
    marathiGloss: "मूळ स्वभाव कधीच बदलत नाही.",
    equivalent: "A leopard cannot change its spots.",
    theme: "Nature and animals",
  },
  {
    proverb: "दिव्याखाली अंधार",
    roman: "divyākhālī andhār",
    literal: "Darkness right under the lamp.",
    figurative: "The fault sits closest to the one who is meant to prevent it.",
    marathiGloss: "जवळच्या ठिकाणीच दोष असणे.",
    equivalent: "The cobbler's children go barefoot.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "दुरून डोंगर साजरे",
    roman: "durūn ḍoṅgar sājare",
    literal: "Mountains look beautiful from a distance.",
    figurative: "Things look attractive until you get close enough to see the work.",
    marathiGloss: "दुरून गोष्टी चांगल्या वाटतात.",
    equivalent: "Distance lends enchantment to the view.",
    theme: "Caution and moderation",
  },
  {
    proverb: "नाचता येईना अंगण वाकडे",
    roman: "nāchtā yeīnā aṅgaṇ vākaḍe",
    literal: "Cannot dance, so the courtyard is crooked.",
    figurative: "Blaming the conditions for one's own lack of skill.",
    marathiGloss: "स्वतःचा दोष लपवण्यासाठी दुसऱ्याला दोष देणे.",
    equivalent: "A bad workman blames his tools.",
    theme: "Speech and truth",
  },
  {
    proverb: "नावडतीचे मीठ अळणी",
    roman: "nāvaḍatīche mīṭh aḷaṇī",
    literal: "The disliked one's salt tastes of nothing.",
    figurative: "Once someone is disliked, nothing they do is judged fairly.",
    marathiGloss: "आवडत नसलेल्याचे काहीही चांगले वाटत नाही.",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "पळसाला पाने तीनच",
    roman: "paḷasālā pāne tīnach",
    literal: "The palas tree has only three leaves.",
    figurative: "The situation is exactly the same wherever you go.",
    marathiGloss: "सगळीकडे परिस्थिती सारखीच असते.",
    equivalent: "It is the same story everywhere.",
    theme: "Nature and animals",
  },
  {
    proverb: "बुडत्याला काडीचा आधार",
    roman: "buḍatyālā kāḍīchā ādhār",
    literal: "For a drowning man, even a twig is support.",
    figurative: "In real trouble even the smallest help feels enormous.",
    marathiGloss: "संकटात लहानसा आधारही मोठा वाटतो.",
    equivalent: "A drowning man will clutch at a straw.",
    theme: "Caution and moderation",
  },
  {
    proverb: "मऊ सापडले म्हणून कोपराने खणू नये",
    roman: "maū sāpaḍale mhaṇūn koprāne khaṇū naye",
    literal: "Do not dig with your elbow just because the ground turned out soft.",
    figurative: "Do not take advantage of someone simply because they are gentle.",
    marathiGloss: "कोणाच्या मऊपणाचा गैरफायदा घेऊ नये.",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "रात्र थोडी सोंगे फार",
    roman: "rātra thoḍī soṅge phār",
    literal: "The night is short and the acts to perform are many.",
    figurative: "Far too much to get through in the time available.",
    marathiGloss: "वेळ कमी आणि कामे खूप.",
    equivalent: "Too much to do and too little time.",
    theme: "Effort and patience",
  },
  {
    proverb: "वासरात लंगडी गाय शहाणी",
    roman: "vāsarāt laṅgaḍī gāy śahāṇī",
    literal: "Among calves, even a lame cow counts as wise.",
    figurative: "Modest ability looks impressive among people who have none.",
    marathiGloss: "अडाण्यांमध्ये थोडे जाणणाराही शहाणा ठरतो.",
    equivalent: "In the land of the blind, the one-eyed man is king.",
    theme: "Nature and animals",
  },
  {
    proverb: "शितावरून भाताची परीक्षा",
    roman: "śitāvarūn bhātāchī parīkṣā",
    literal: "The whole rice is judged from a single grain.",
    figurative: "One sample is enough to tell you what the rest is like.",
    marathiGloss: "एका नमुन्यावरून संपूर्णाची परीक्षा होते.",
    equivalent: "The proof of the pudding is in the eating.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "हातच्या काकणाला आरसा कशाला",
    roman: "hātachyā kākaṇālā ārasā kaśālā",
    literal: "Why hold up a mirror to the bangle on your own wrist?",
    figurative: "Something plainly visible needs no proof.",
    marathiGloss: "उघड गोष्टीला पुराव्याची गरज नसते.",
    equivalent: "",
    theme: "Learning and wisdom",
  },
  {
    proverb: "आपला तो बाब्या, दुसऱ्याचं ते कारटं",
    roman: "āpalā to bābyā, dusaṟyāchaṁ te kāraṭaṁ",
    literal: "Our own is a darling child; someone else's is a brat.",
    figurative: "People judge their own by one standard and others by another.",
    marathiGloss: "स्वतःचे ते चांगले, दुसऱ्याचे ते वाईट.",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "असंगाशी संग आणि प्राणाशी गाठ",
    roman: "asaṅgāśī saṅg āṇi prāṇāśī gāṭh",
    literal: "Keep bad company and you stake your life on it.",
    figurative: "Bad company eventually costs far more than it seemed to.",
    marathiGloss: "वाईट संगतीमुळे मोठे नुकसान होते.",
    equivalent: "Bad company corrupts good character.",
    theme: "People and relationships",
  },
  {
    proverb: "तोंड दाबून बुक्क्यांचा मार",
    roman: "toṇḍ dābūn bukkyāṅchā mār",
    literal: "Beaten with fists while the mouth is held shut.",
    figurative: "Suffering an injustice with no way even to protest about it.",
    marathiGloss: "अन्याय सहन करावा लागणे, तक्रारही करता येत नाही.",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "कुऱ्हाडीचा दांडा गोतास काळ",
    roman: "kuṟhāḍīchā dāṇḍā gotās kāḷ",
    literal: "The axe handle becomes death to its own kin, the tree.",
    figurative: "One's own people turn out to be the cause of the damage.",
    marathiGloss: "आपल्याच माणसामुळे नुकसान होणे.",
    equivalent: "",
    theme: "People and relationships",
  },
  {
    proverb: "पी हळद हो गोरी",
    roman: "pī haḷad ho gorī",
    literal: "Drink turmeric and turn fair at once.",
    figurative: "Expecting a result the moment the effort has been made.",
    marathiGloss: "लगेच फळाची अपेक्षा करणे.",
    equivalent: "Rome was not built in a day.",
    theme: "Effort and patience",
  },
  {
    proverb: "चार दिवस सासूचे, चार दिवस सुनेचे",
    roman: "chār divas sāsūche, chār divas sunēche",
    literal: "Four days belong to the mother-in-law and four to the daughter-in-law.",
    figurative: "Nobody holds the upper hand for ever; everyone's turn comes.",
    marathiGloss: "प्रत्येकाची वेळ येते.",
    equivalent: "Every dog has its day.",
    theme: "People and relationships",
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
      entry.marathiGloss.includes(needle)
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
    marathiGloss: entry.marathiGloss,
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
