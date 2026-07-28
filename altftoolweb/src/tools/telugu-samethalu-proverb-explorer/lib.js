/**
 * Telugu Samethalu Explorer — proverb bank plus pure browse, daily-pick and quiz logic.
 *
 * A sametha (సామెత) is a complete traditional saying quoted unchanged. Each entry
 * keeps the literal translation apart from the figurative sense, because in most
 * proverbs the two are deliberately far apart.
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
  "Power and wealth",
  "Caution and moderation",
];

/**
 * 30 widely quoted Telugu proverbs. `roman` follows the ISO 15919 style used in
 * Telugu grammars: ā ī ū ē ō for long vowels, ṭ ḍ ṇ ḷ ṣ ś for the retroflex and
 * sibilant series, and ṁ for the anusvara.
 */
export const PROVERBS = [
  {
    proverb: "అందని ద్రాక్ష పుల్లన",
    roman: "andani drākṣa pullana",
    literal: "Grapes out of reach are sour.",
    figurative: "People belittle whatever they cannot have.",
    teluguGloss: "అందుబాటులో లేనిదాన్ని తక్కువ చేసి మాట్లాడటం.",
    equivalent: "Sour grapes.",
    theme: "Speech and truth",
  },
  {
    proverb: "ఆకలి రుచి ఎరుగదు",
    roman: "ākali ruci erugadu",
    literal: "Hunger does not know taste.",
    figurative: "Real need removes fussiness about what is offered.",
    teluguGloss: "ఆకలిగా ఉన్నప్పుడు ఏదైనా రుచిగానే ఉంటుంది.",
    equivalent: "Hunger is the best sauce.",
    theme: "Caution and moderation",
  },
  {
    proverb: "అతి సర్వత్ర వర్జయేత్",
    roman: "ati sarvatra varjayēt",
    literal: "Excess is to be avoided in every case.",
    figurative: "Too much of anything, however good, does harm.",
    teluguGloss: "దేనిలోనైనా అతి పనికిరాదు.",
    equivalent: "Moderation in all things.",
    theme: "Caution and moderation",
  },
  {
    proverb: "కంచే చేను మేసినట్లు",
    roman: "kañcē cēnu mēsinaṭlu",
    literal: "As though the fence itself grazed the field.",
    figurative: "The very person set to guard something is the one destroying it.",
    teluguGloss: "కాపలా ఉన్నవాడే దొంగతనం చేయడం.",
    equivalent: "Setting the fox to guard the henhouse.",
    theme: "Power and wealth",
  },
  {
    proverb: "కాకి పిల్ల కాకికి ముద్దు",
    roman: "kāki pilla kākiki muddu",
    literal: "The crow's chick is dear to the crow.",
    figurative: "Every parent finds their own child beautiful.",
    teluguGloss: "తల్లికి తన బిడ్డ ఎప్పుడూ అందంగానే కనిపిస్తుంది.",
    equivalent: "Every mother thinks her own gosling a swan.",
    theme: "Nature and animals",
  },
  {
    proverb: "కోతికి కొబ్బరికాయ దొరికినట్లు",
    roman: "kōtiki kobbarikāya dorikinaṭlu",
    literal: "Like a monkey coming by a coconut.",
    figurative: "Something valuable landing with someone who cannot use it properly.",
    teluguGloss: "అర్హత లేనివారి చేతికి విలువైనది చిక్కడం.",
    equivalent: "Pearls before swine.",
    theme: "Nature and animals",
  },
  {
    proverb: "చెవిటి వాని ముందు శంఖం ఊదినట్టు",
    roman: "ceviṭi vāni mundu śaṅkhaṁ ūdinaṭṭu",
    literal: "Like blowing a conch in front of a deaf man.",
    figurative: "Advice given to someone who will not listen is wasted.",
    teluguGloss: "వినని వారికి చెప్పడం వృథా.",
    equivalent: "Talking to a brick wall.",
    theme: "Speech and truth",
  },
  {
    proverb: "దెయ్యాలు వేదాలు వల్లించినట్లు",
    roman: "deyyālu vēdālu vallincinaṭlu",
    literal: "Like demons reciting the Vedas.",
    figurative: "Wrongdoers quoting scripture to justify themselves.",
    teluguGloss: "చెడ్డవారు మంచి మాటలు చెప్పడం.",
    equivalent: "The devil can cite scripture for his purpose.",
    theme: "Speech and truth",
  },
  {
    proverb: "దూరపు కొండలు నునుపు",
    roman: "dūrapu koṇḍalu nunupu",
    literal: "Distant hills look smooth.",
    figurative: "Whatever is far away looks easier and better than it is.",
    teluguGloss: "దూరంగా ఉన్నవి బాగున్నట్లు కనిపిస్తాయి.",
    equivalent: "The grass is always greener on the other side.",
    theme: "Caution and moderation",
  },
  {
    proverb: "నక్కకు నాగలోకానికి ఉన్నంత దూరం",
    roman: "nakkaku nāgalōkāniki unnanta dūraṁ",
    literal: "As far apart as a jackal is from the world of serpents.",
    figurative: "Two things being compared are not remotely comparable.",
    teluguGloss: "పోలికే లేని అపారమైన తేడా.",
    equivalent: "Chalk and cheese.",
    theme: "Nature and animals",
  },
  {
    proverb: "పిట్ట కొంచెం కూత ఘనం",
    roman: "piṭṭa koñceṁ kūta ghanaṁ",
    literal: "The bird is small but its call is mighty.",
    figurative: "Someone small in stature can still have a big effect.",
    teluguGloss: "చిన్నవారైనా గొప్ప పని చేయగలరు.",
    equivalent: "Great things come in small packages.",
    theme: "Nature and animals",
  },
  {
    proverb: "పులిని చూసి నక్క వాత పెట్టుకున్నట్లు",
    roman: "pulini cūsi nakka vāta peṭṭukunnaṭlu",
    literal: "Like the jackal branding itself after seeing the tiger.",
    figurative: "Copying someone far above your means and coming to grief.",
    teluguGloss: "శక్తికి మించి అనుకరించడం.",
    equivalent: "",
    theme: "Nature and animals",
  },
  {
    proverb: "ముందు నుయ్యి వెనుక గొయ్యి",
    roman: "mundu nuyyi venuka goyyi",
    literal: "A well in front and a pit behind.",
    figurative: "Trapped between two equally bad choices.",
    teluguGloss: "రెండు వైపులా ప్రమాదం ఉన్న స్థితి.",
    equivalent: "Between the devil and the deep blue sea.",
    theme: "Caution and moderation",
  },
  {
    proverb: "మొక్కై వంగనిది మానై వంగునా",
    roman: "mokkai vaṅganidi mānai vaṅgunā",
    literal: "What would not bend as a sapling, will it bend as a tree?",
    figurative: "Habits have to be corrected while a person is young.",
    teluguGloss: "చిన్నప్పుడే అలవాట్లు దిద్దుకోవాలి.",
    equivalent: "As the twig is bent, so grows the tree.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "రాజు తలుచుకుంటే దెబ్బలకు కొదవా",
    roman: "rāju talucukuṇṭē debbalaku kodavā",
    literal: "If the king so decides, will there be any shortage of blows?",
    figurative: "Someone with power can always find the means to act.",
    teluguGloss: "అధికారం ఉన్నవాడు ఏదైనా చేయగలడు.",
    equivalent: "Might is right.",
    theme: "Power and wealth",
  },
  {
    proverb: "వాన రాకడ ప్రాణం పోకడ ఎవరికీ తెలియదు",
    roman: "vāna rākaḍa prāṇaṁ pōkaḍa evarikī teliyadu",
    literal: "Nobody knows when the rain will come or when life will leave.",
    figurative: "The most important things in life cannot be predicted.",
    teluguGloss: "వర్షం, మరణం ఎప్పుడు వస్తాయో ఎవరికీ తెలియదు.",
    equivalent: "",
    theme: "Learning and wisdom",
  },
  {
    proverb: "విద్య లేని వాడు వింత పశువు",
    roman: "vidya lēni vāḍu vinta paśuvu",
    literal: "A man without learning is a strange beast.",
    figurative: "Education is what separates a person from a mere animal.",
    teluguGloss: "చదువు లేనివాడు జంతువుతో సమానం.",
    equivalent: "From the Vemana Satakam.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "ఇంటి దొంగను ఈశ్వరుడైనా పట్టలేడు",
    roman: "iṇṭi doṅganu īśvaruḍainā paṭṭalēḍu",
    literal: "Not even God can catch the thief inside the house.",
    figurative: "Betrayal from within is the hardest kind to detect.",
    teluguGloss: "లోపల ఉన్న ద్రోహిని పట్టుకోవడం కష్టం.",
    equivalent: "",
    theme: "Power and wealth",
  },
  {
    proverb: "వేరొకరికి తవ్విన గోతిలో తానే పడ్డట్లు",
    roman: "vērokariki tavvina gōtilō tānē paḍḍaṭlu",
    literal: "Like falling into the pit one dug for somebody else.",
    figurative: "Harm planned for another rebounds on the planner.",
    teluguGloss: "ఇతరులకు కీడు తలపెడితే తనకే జరుగుతుంది.",
    equivalent: "He who digs a pit for others falls into it himself.",
    theme: "Caution and moderation",
  },
  {
    proverb: "ఒక్క దెబ్బకు రెండు పిట్టలు",
    roman: "okka debbaku reṇḍu piṭṭalu",
    literal: "Two birds with one blow.",
    figurative: "One action achieving two purposes at once.",
    teluguGloss: "ఒకే పనితో రెండు ప్రయోజనాలు.",
    equivalent: "To kill two birds with one stone.",
    theme: "Effort and patience",
  },
  {
    proverb: "కుక్క తోక పట్టుకుని గోదావరి ఈదినట్లు",
    roman: "kukka tōka paṭṭukuni gōdāvari īdinaṭlu",
    literal: "Like swimming the Godavari holding a dog's tail.",
    figurative: "Attempting something big with hopelessly inadequate support.",
    teluguGloss: "సరిపడని ఆధారంతో పెద్ద పని చేయబోవడం.",
    equivalent: "",
    theme: "Effort and patience",
  },
  {
    proverb: "తన కోపమే తన శత్రువు",
    roman: "tana kōpamē tana śatruvu",
    literal: "One's own anger is one's own enemy.",
    figurative: "Temper damages the person who loses it more than anyone else.",
    teluguGloss: "కోపమే మనిషికి అతిపెద్ద శత్రువు.",
    equivalent: "From the Sumati Satakam.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "తినగ తినగ వేము తియ్యనుండు",
    roman: "tinaga tinaga vēmu tiyyanuṇḍu",
    literal: "Eaten again and again, even neem becomes sweet.",
    figurative: "Repetition makes even a hard or bitter thing bearable.",
    teluguGloss: "అలవాటు చేసుకుంటే కష్టమైనదీ సులువవుతుంది.",
    equivalent: "Use makes master. (Vemana Satakam)",
    theme: "Effort and patience",
  },
  {
    proverb: "నిదానమే ప్రధానం",
    roman: "nidānamē pradhānaṁ",
    literal: "Deliberateness is the main thing.",
    figurative: "Doing something carefully beats doing it fast.",
    teluguGloss: "తొందరపడకుండా ఓపికగా చేయడమే మేలు.",
    equivalent: "Slow and steady wins the race.",
    theme: "Effort and patience",
  },
  {
    proverb: "పైన పటారం లోన లొటారం",
    roman: "paina paṭāraṁ lōna loṭāraṁ",
    literal: "Grand on the outside, hollow on the inside.",
    figurative: "An impressive appearance hiding nothing of substance.",
    teluguGloss: "పైకి గొప్పగా, లోపల డొల్లగా ఉండటం.",
    equivalent: "All that glitters is not gold.",
    theme: "Power and wealth",
  },
  {
    proverb: "ఆవు చేలో మేస్తే దూడ గట్టున మేస్తుందా",
    roman: "āvu cēlō mēstē dūḍa gaṭṭuna mēstundā",
    literal: "If the cow grazes in the field, will the calf graze on the bund?",
    figurative: "Children copy what their elders actually do.",
    teluguGloss: "పెద్దలు చేసినదే పిల్లలు నేర్చుకుంటారు.",
    equivalent: "Like father, like son.",
    theme: "Learning and wisdom",
  },
  {
    proverb: "కూసే గాడిద వచ్చి మేసే గాడిదను చెడగొట్టిందట",
    roman: "kūsē gāḍida vacci mēsē gāḍidanu ceḍagoṭṭindaṭa",
    literal: "The braying donkey came and spoiled the grazing donkey.",
    figurative: "Bad company ruins someone who was quietly getting on with life.",
    teluguGloss: "చెడు సహవాసం మంచివారినీ పాడు చేస్తుంది.",
    equivalent: "One rotten apple spoils the barrel.",
    theme: "Nature and animals",
  },
  {
    proverb: "చింత చచ్చినా పులుపు చావలేదు",
    roman: "cinta caccinā pulupu cāvalēdu",
    literal: "The tamarind tree died but its sourness did not.",
    figurative: "Fortune may go, but the old arrogance stays.",
    teluguGloss: "పరిస్థితి మారినా అహంకారం పోదు.",
    equivalent: "",
    theme: "Speech and truth",
  },
  {
    proverb: "ఉన్న మాట అంటే ఉలుకెక్కువ",
    roman: "unna māṭa aṇṭē ulukekkuva",
    literal: "Say the thing that is true and the sting is greater.",
    figurative: "People react hardest to an accusation that happens to be accurate.",
    teluguGloss: "నిజం చెబితే ఎక్కువ బాధ కలుగుతుంది.",
    equivalent: "The truth hurts.",
    theme: "Speech and truth",
  },
  {
    proverb: "గోరుచుట్టు మీద రోకటి పోటు",
    roman: "gōrucuṭṭu mīda rōkaṭi pōṭu",
    literal: "A pestle blow on top of a whitlow.",
    figurative: "A fresh blow landing on someone already suffering.",
    teluguGloss: "ఒక కష్టం మీద మరో కష్టం.",
    equivalent: "To add insult to injury.",
    theme: "Caution and moderation",
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
      entry.teluguGloss.includes(needle)
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
    teluguGloss: entry.teluguGloss,
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
