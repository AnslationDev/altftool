/**
 * Punjabi Akhaan (ਅਖਾਣ) Explorer — data and pure helpers.
 *
 * An akhaan is a proverb: a complete, self-standing sentence carrying inherited
 * village wisdom, as opposed to a muhavara, which is a fixed phrase needing a
 * sentence built around it. Text is given in Gurmukhi with a Roman
 * transliteration, the literal image, the working meaning and an English match.
 */

export const THEMES = [
  { id: "wisdom", label: "Wisdom & judgement" },
  { id: "words", label: "Speech & speaking up" },
  { id: "character", label: "Character & hypocrisy" },
  { id: "money", label: "Money & scarcity" },
  { id: "folly", label: "Folly & self-harm" },
  { id: "family", label: "Family & loyalty" },
  { id: "caution", label: "Caution & suspicion" },
  { id: "consequence", label: "Consequences" },
];

export const PROVERBS = [
  {
    id: "nachna-na-jane",
    punjabi: "ਨੱਚਣਾ ਨਾ ਜਾਣੇ, ਵਿਹੜਾ ਟੇਢਾ",
    roman: "Nacchṇā nā jāṇe, vihṛā ṭeḍhā",
    literal: "She does not know how to dance, so the courtyard is crooked.",
    meaning:
      "Blaming surroundings for a failure that comes from your own lack of skill. The most-quoted Punjabi line about excuses.",
    english: "A bad workman blames his tools.",
    theme: "folly",
  },
  {
    id: "gur-dittian",
    punjabi: "ਗੁੜ ਦਿੱਤਿਆਂ ਮਰੇ ਤਾਂ ਜ਼ਹਿਰ ਕਿਉਂ ਦੇਣਾ",
    roman: "Guṛ dittiāṁ mare tāṁ zahir kiuṁ dēṇā",
    literal: "If jaggery will do the killing, why bother with poison?",
    meaning:
      "Use the gentlest method that works instead of reaching straight for force. Common advice before a confrontation.",
    english: "You catch more flies with honey than with vinegar.",
    theme: "wisdom",
  },
  {
    id: "annha-vande",
    punjabi: "ਅੰਨ੍ਹਾ ਵੰਡੇ ਰਿਓੜੀਆਂ, ਮੁੜ ਮੁੜ ਆਪਣਿਆਂ ਨੂੰ",
    roman: "Annhā vaṇḍe riuṛīāṁ, muṛ muṛ āpaṇiāṁ nū",
    literal:
      "A blind man distributing sweets keeps handing them back to his own people.",
    meaning:
      "Favouritism dressed up as a fair distribution. Used about appointments, contracts and prize-giving.",
    english: "Blood is thicker than water — and it shows in the sharing.",
    theme: "character",
  },
  {
    id: "duron-pahar",
    punjabi: "ਦੂਰੋਂ ਪਹਾੜ ਸੁਹਾਵਣੇ",
    roman: "Dūroṁ pahāṛ suhāvaṇe",
    literal: "Mountains look pleasant from a distance.",
    meaning:
      "Anything seen from far away hides its difficulty. Applied to other people's jobs, marriages and cities.",
    english: "Distant hills look green.",
    theme: "wisdom",
  },
  {
    id: "jihra-bole",
    punjabi: "ਜਿਹੜਾ ਬੋਲੇ ਸੋ ਕੁੰਡਾ ਖੋਲ੍ਹੇ",
    roman: "Jihṛā bole so kuṇḍā kholhe",
    literal: "Whoever speaks up is the one who opens the latch.",
    meaning:
      "Raise an issue and you will be handed the job of fixing it. Half warning, half joke, used in meetings and at home.",
    english: "He who suggests it, does it.",
    theme: "words",
  },
  {
    id: "apni-gali",
    punjabi: "ਆਪਣੀ ਗਲੀ ਵਿੱਚ ਕੁੱਤਾ ਵੀ ਸ਼ੇਰ ਹੁੰਦਾ ਹੈ",
    roman: "Āpaṇī galī vicc kuttā vī śer hundā hai",
    literal: "In its own street, even a dog is a lion.",
    meaning:
      "Confidence comes from home turf, not from real strength. Said about people who are bold only on familiar ground.",
    english: "Every dog is a lion at home.",
    theme: "character",
  },
  {
    id: "nau-sau-chuhe",
    punjabi: "ਨੌਂ ਸੌ ਚੂਹੇ ਖਾ ਕੇ ਬਿੱਲੀ ਹੱਜ ਨੂੰ ਚੱਲੀ",
    roman: "Nauṁ sau cūhe khā ke billī hajj nū callī",
    literal: "Having eaten nine hundred mice, the cat set off for Hajj.",
    meaning:
      "Late, showy piety from someone with a long record of doing the opposite.",
    english: "The devil turned monk when he grew old.",
    theme: "character",
  },
  {
    id: "jinni-chadar",
    punjabi: "ਜਿੰਨੀ ਚਾਦਰ ਹੋਵੇ ਓਨੇ ਹੀ ਪੈਰ ਪਸਾਰੀਏ",
    roman: "Jinnī cādar hove one hī pair pasārīe",
    literal: "Stretch your feet only as far as the sheet reaches.",
    meaning:
      "Live and spend within your actual income. The standard Punjabi caution against loans taken for show.",
    english: "Cut your coat according to your cloth.",
    theme: "money",
  },
  {
    id: "hath-kangan",
    punjabi: "ਹੱਥ ਕੰਗਣ ਨੂੰ ਆਰਸੀ ਕੀ, ਪੜ੍ਹੇ ਲਿਖੇ ਨੂੰ ਫ਼ਾਰਸੀ ਕੀ",
    roman: "Hath kaṅgaṇ nū ārsī kī, paṛhe likhe nū fārsī kī",
    literal:
      "What need of a mirror for the bangle on your wrist, or of Persian for the educated?",
    meaning:
      "Something plain to see needs no proof, and real ability needs no certificate.",
    english: "The proof of the pudding is in the eating.",
    theme: "wisdom",
  },
  {
    id: "ik-anaar",
    punjabi: "ਇੱਕ ਅਨਾਰ ਸੌ ਬੀਮਾਰ",
    roman: "Ik anār sau bīmār",
    literal: "One pomegranate, a hundred sick people.",
    meaning:
      "Far more claimants than there is supply. Used about job openings, seats and scarce goods.",
    english: "Too many mouths for one loaf.",
    theme: "money",
  },
  {
    id: "daal-vich-kala",
    punjabi: "ਦਾਲ ਵਿੱਚ ਕੁਝ ਕਾਲਾ ਹੈ",
    roman: "Dāl vicc kujh kālā hai",
    literal: "There is something black in the lentils.",
    meaning:
      "Something about this arrangement is not honest, even if you cannot yet name it.",
    english: "There is something fishy about it.",
    theme: "caution",
  },
  {
    id: "ooth-de-munh",
    punjabi: "ਊਠ ਦੇ ਮੂੰਹ ਵਿੱਚ ਜੀਰਾ",
    roman: "Ūṭh de mūṁh vicc jīrā",
    literal: "A cumin seed in a camel's mouth.",
    meaning:
      "An amount so small against the need that it makes no difference at all — of money, food or staff.",
    english: "A drop in the bucket.",
    theme: "money",
  },
  {
    id: "akal-vaddi",
    punjabi: "ਅਕਲ ਵੱਡੀ ਕਿ ਮੱਝ",
    roman: "Akal vaḍḍī ki majjh",
    literal: "Which is bigger — intelligence, or the buffalo?",
    meaning:
      "A rhetorical question insisting that brains matter more than bulk, position or noise.",
    english: "Brain over brawn.",
    theme: "wisdom",
  },
  {
    id: "giddar-di-maut",
    punjabi: "ਗਿੱਦੜ ਦੀ ਮੌਤ ਆਵੇ ਤਾਂ ਸ਼ਹਿਰ ਵੱਲ ਭੱਜੇ",
    roman: "Giddaṛ dī maut āve tāṁ śahir vall bhajje",
    literal: "When the jackal's death approaches, it runs towards the town.",
    meaning:
      "People walk straight into danger just before their downfall. Said of a reckless, out-of-character decision.",
    english: "Whom the gods would destroy, they first make mad.",
    theme: "folly",
  },
  {
    id: "putt-kaputt",
    punjabi: "ਪੁੱਤ ਕਪੁੱਤ ਹੋ ਸਕਦਾ ਹੈ, ਮਾਂ ਕੁਮਾਤਾ ਨਹੀਂ",
    roman: "Putt kaputt ho sakdā hai, māṁ kumātā nahīṁ",
    literal: "A son may turn out unworthy, but a mother never turns unmotherly.",
    meaning:
      "A mother's loyalty survives what her child does. Quoted in family reconciliations.",
    english: "A mother's love never ages.",
    theme: "family",
  },
  {
    id: "jis-di-kothi",
    punjabi: "ਜਿਸ ਦੀ ਕੋਠੀ ਦਾਣੇ, ਉਸ ਦੇ ਕਮਲੇ ਵੀ ਸਿਆਣੇ",
    roman: "Jis dī koṭhī dāṇe, us de kamle vī siāṇe",
    literal: "In the house with grain in store, even the fools are called wise.",
    meaning:
      "Wealth buys a reputation for good sense. A sharp comment on how status shapes opinion.",
    english: "A rich man's joke is always funny.",
    theme: "money",
  },
  {
    id: "vehm-da-ilaj",
    punjabi: "ਵਹਿਮ ਦਾ ਇਲਾਜ ਹਕੀਮ ਲੁਕਮਾਨ ਕੋਲ ਵੀ ਨਹੀਂ",
    roman: "Vahim dā ilāj hakīm Luqmān kol vī nahīṁ",
    literal: "Even the physician Luqman has no cure for suspicion.",
    meaning:
      "Once someone has decided to distrust you, no amount of evidence settles it. Luqman is the proverbial master healer.",
    english: "There is no medicine for a suspicious mind.",
    theme: "caution",
  },
  {
    id: "sau-siane",
    punjabi: "ਸੌ ਸਿਆਣੇ, ਇੱਕ ਮੱਤ",
    roman: "Sau siāṇe, ik matt",
    literal: "A hundred wise people, one opinion.",
    meaning:
      "Genuinely sensible people tend to arrive at the same conclusion — so a lone contrarian view deserves scrutiny.",
    english: "Great minds think alike.",
    theme: "wisdom",
  },
  {
    id: "chor-di-dahri",
    punjabi: "ਚੋਰ ਦੀ ਦਾੜ੍ਹੀ ਵਿੱਚ ਤਿਣਕਾ",
    roman: "Cor dī dāṛhī vicc tiṇkā",
    literal: "A straw caught in the thief's beard.",
    meaning:
      "The guilty person reacts to a general remark and exposes himself.",
    english: "A guilty conscience needs no accuser.",
    theme: "character",
  },
  {
    id: "dudh-da-sarhia",
    punjabi: "ਦੁੱਧ ਦਾ ਸੜਿਆ ਲੱਸੀ ਵੀ ਫੂਕ ਫੂਕ ਕੇ ਪੀਂਦਾ ਹੈ",
    roman: "Duddh dā saṛiā lassī vī phūk phūk ke pīṁdā hai",
    literal: "One burnt by hot milk blows on buttermilk before drinking it.",
    meaning:
      "A bad experience makes people over-careful even where there is no risk.",
    english: "Once bitten, twice shy.",
    theme: "caution",
  },
  {
    id: "jiho-jiha-des",
    punjabi: "ਜਿਹੋ ਜਿਹਾ ਦੇਸ, ਓਹੋ ਜਿਹਾ ਭੇਸ",
    roman: "Jiho jihā des, oho jihā bhes",
    literal: "As the country is, so should your dress be.",
    meaning:
      "Fit in with local custom rather than insisting on your own habits. Common advice to travellers and migrants.",
    english: "When in Rome, do as the Romans do.",
    theme: "wisdom",
  },
  {
    id: "kallh-da-bhulia",
    punjabi: "ਕੱਲ੍ਹ ਦਾ ਭੁੱਲਿਆ ਜੇ ਅੱਜ ਘਰ ਆ ਜਾਵੇ, ਉਹਨੂੰ ਭੁੱਲਿਆ ਨਹੀਂ ਕਹੀਦਾ",
    roman: "Kallh dā bhulliā je ajj ghar ā jāve, uhnū bhulliā nahīṁ kahīdā",
    literal:
      "If the one who lost his way yesterday comes home today, he should not be called lost.",
    meaning:
      "Someone who corrects a mistake deserves to be received, not labelled by the mistake.",
    english: "It is never too late to mend.",
    theme: "wisdom",
  },
  {
    id: "mittha-harap",
    punjabi: "ਮਿੱਠਾ ਮਿੱਠਾ ਹੜੱਪ, ਕੌੜਾ ਕੌੜਾ ਥੂ",
    roman: "Miṭṭhā miṭṭhā haṛapp, kauṛā kauṛā thū",
    literal: "Swallow whatever is sweet, spit out whatever is bitter.",
    meaning:
      "Taking only the convenient part of an agreement or a duty and refusing the rest.",
    english: "You cannot have your cake and eat it too.",
    theme: "character",
  },
  {
    id: "jo-bije",
    punjabi: "ਜੋ ਬੀਜੇਗਾ, ਸੋ ਵੱਢੇਗਾ",
    roman: "Jo bījegā, so vaḍḍhegā",
    literal: "Whatever he sows, that is what he will cut.",
    meaning:
      "Actions decide outcomes; the harvest matches the seed. Used about study, business and how you treat people.",
    english: "As you sow, so shall you reap.",
    theme: "consequence",
  },
];

const THEME_IDS = new Set(THEMES.map((t) => t.id));

function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[.,!?;:'"()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(proverb) {
  return normalise(
    [
      proverb.punjabi,
      proverb.roman,
      proverb.literal,
      proverb.meaning,
      proverb.english,
    ].join(" ")
  );
}

/** Free-text plus theme filter; every query token must match. */
export function searchProverbs({ query = "", theme = "all" } = {}) {
  const safeTheme = theme === "all" || THEME_IDS.has(theme) ? theme : "all";
  const tokens = normalise(query).split(" ").filter(Boolean);

  const results = PROVERBS.filter((proverb) => {
    if (safeTheme !== "all" && proverb.theme !== safeTheme) return false;
    if (tokens.length === 0) return true;
    const hay = haystack(proverb);
    return tokens.every((token) => hay.includes(token));
  });

  return {
    results,
    total: PROVERBS.length,
    matched: results.length,
    query: String(query ?? ""),
    theme: safeTheme,
  };
}

export function themeCounts() {
  const counts = {};
  for (const { id } of THEMES) counts[id] = 0;
  for (const proverb of PROVERBS) {
    if (counts[proverb.theme] === undefined) counts[proverb.theme] = 0;
    counts[proverb.theme] += 1;
  }
  return counts;
}

export function getProverbById(id) {
  return PROVERBS.find((proverb) => proverb.id === id) ?? null;
}

const MS_PER_DAY = 86400000;

/** Deterministic akhaan of the day for an ISO date (YYYY-MM-DD). Pure. */
export function proverbOfTheDay(isoDate) {
  const text = String(isoDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { error: "Pick a date as YYYY-MM-DD to see the akhaan of the day." };
  }
  const stamp = Date.parse(`${text}T00:00:00Z`);
  if (!Number.isFinite(stamp)) {
    return { error: "That is not a real calendar date." };
  }
  const dayNumber = Math.floor(stamp / MS_PER_DAY);
  const index = ((dayNumber % PROVERBS.length) + PROVERBS.length) % PROVERBS.length;
  return { proverb: PROVERBS[index], index, date: text };
}
