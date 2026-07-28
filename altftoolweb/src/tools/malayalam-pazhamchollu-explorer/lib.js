/**
 * Malayalam Pazhamchollu (പഴഞ്ചൊല്ല്) Explorer — data and pure helpers.
 *
 * A pazhamchollu is an "old saying": a compact sentence carrying inherited
 * wisdom. Malayalam itself has a proverb about them — പതിരില്ലാത്ത പഴഞ്ചൊല്ലില്ല,
 * "there is no proverb without a grain of truth" — which is included below.
 *
 * Each entry carries the Malayalam text, a Roman transliteration, the literal
 * image, how speakers actually use it, and the closest English proverb.
 */

export const THEMES = [
  { id: "wisdom", label: "Wisdom & judgement" },
  { id: "folly", label: "Folly & wasted effort" },
  { id: "words", label: "Speech & promises" },
  { id: "character", label: "Character & habit" },
  { id: "family", label: "Family & unity" },
  { id: "consequence", label: "Consequences" },
  { id: "greed", label: "Greed & excess" },
  { id: "power", label: "Power & the weak" },
];

export const PROVERBS = [
  {
    id: "mullil-ila",
    malayalam: "മുള്ളിൽ ഇല വീണാലും ഇലയിൽ മുള്ള് വീണാലും ഇലയ്ക്കാണ് കേട്",
    roman: "Muḷḷil ila vīṇālum ilayil muḷḷu vīṇālum ilaykkāṇu kēṭu",
    literal:
      "Whether the leaf falls on the thorn or the thorn falls on the leaf, it is the leaf that is damaged.",
    meaning:
      "In an unequal contest the weaker side is hurt either way, regardless of who started it. Quoted about tenants, employees and small businesses in disputes with the powerful.",
    english: "Whether the knife falls on the melon or the melon on the knife, it is bad for the melon.",
    theme: "power",
  },
  {
    id: "aana-aasha",
    malayalam: "ആന കൊടുത്താലും ആശ കൊടുക്കരുത്",
    roman: "Āna koṭuttālum āśa koṭukkarutu",
    literal: "Even if you give away an elephant, never give hope.",
    meaning:
      "A promise you may not keep does more damage than refusing outright. Standard advice against stringing someone along.",
    english: "Better a bitter truth than a sweet lie.",
    theme: "words",
  },
  {
    id: "kaakka-thankunju",
    malayalam: "കാക്കയ്ക്കും തൻകുഞ്ഞ് പൊൻകുഞ്ഞ്",
    roman: "Kākkaykkuṁ tankuññu ponkuññu",
    literal: "Even to the crow, its own chick is a golden chick.",
    meaning:
      "Every parent sees their own child as beautiful and blameless. Used gently when someone cannot judge their own family fairly.",
    english: "The crow thinks her own bird fairest.",
    theme: "family",
  },
  {
    id: "adhikamayal",
    malayalam: "അധികമായാൽ അമൃതും വിഷം",
    roman: "Adhikamāyāl amr̥tuṁ viṣaṁ",
    literal: "In excess, even nectar is poison.",
    meaning:
      "Anything good becomes harmful past a point — food, praise, medicine or affection. One of the most quoted Malayalam sayings.",
    english: "Too much of a good thing is good for nothing.",
    theme: "greed",
  },
  {
    id: "orumayundenkil",
    malayalam: "ഒരുമയുണ്ടെങ്കിൽ ഉലക്കമേലും കിടക്കാം",
    roman: "Orumayuṇṭeṅkil ulakkamēluṁ kiṭakkāṁ",
    literal: "If there is unity, you can sleep even on a pestle.",
    meaning:
      "Where people get along, hardship and cramped conditions stop mattering. Common in family and workplace contexts.",
    english: "Union is strength.",
    theme: "family",
  },
  {
    id: "eliye-pedichu",
    malayalam: "എലിയെ പേടിച്ച് ഇല്ലം ചുടുക",
    roman: "Eliye pēṭiccu illaṁ cuṭuka",
    literal: "Burning down the house out of fear of the rat.",
    meaning:
      "A response so extreme it destroys the thing it was meant to protect. Used about panic decisions and over-corrections.",
    english: "Burn not your house to fright the mouse away.",
    theme: "folly",
  },
  {
    id: "veli-vilavu",
    malayalam: "വേലി തന്നെ വിളവ് തിന്നുക",
    roman: "Vēli tanne viḷavu tinnuka",
    literal: "The fence itself eating the crop.",
    meaning:
      "The person appointed to protect something is the one stealing it. The standard Malayalam phrase for insider corruption.",
    english: "Setting the fox to keep the geese.",
    theme: "character",
  },
  {
    id: "uppu-thinnavan",
    malayalam: "ഉപ്പ് തിന്നവൻ വെള്ളം കുടിക്കും",
    roman: "Uppu tinnavan veḷḷaṁ kuṭikkuṁ",
    literal: "He who ate the salt will drink the water.",
    meaning:
      "Whoever did the deed will face its consequence, sooner or later. Said when someone expects to escape the results of their own choices.",
    english: "As you make your bed, so you must lie in it.",
    theme: "consequence",
  },
  {
    id: "moothavar-chollum",
    malayalam: "മൂത്തവർ ചൊല്ലും മുതുനെല്ലിക്കയും ആദ്യം കയ്ക്കും പിന്നെ മധുരിക്കും",
    roman: "Mūttavar colluṁ mutunellikkayuṁ ādyaṁ kaykkuṁ pinne madhurikkuṁ",
    literal:
      "The words of elders and old gooseberry both taste bitter first and sweet afterwards.",
    meaning:
      "Advice that stings at the time proves useful later. Frequently quoted to children and new employees.",
    english: "Good advice is harsh but wholesome.",
    theme: "wisdom",
  },
  {
    id: "cheruppathile-sheelam",
    malayalam: "ചെറുപ്പത്തിലെ ശീലം മരണംവരെ",
    roman: "Ceruppattile śīlaṁ maraṇaṁvare",
    literal: "A habit formed in childhood lasts until death.",
    meaning:
      "Early habits, good or bad, are what stick. Used to argue for discipline while children are still young.",
    english: "What is learned in the cradle lasts till the grave.",
    theme: "character",
  },
  {
    id: "irikkunna-kompu",
    malayalam: "ഇരിക്കുന്ന കൊമ്പ് മുറിക്കരുത്",
    roman: "Irikkunna kompu murikkarutu",
    literal: "Do not cut the branch you are sitting on.",
    meaning:
      "Do not damage the person, job or arrangement that is currently supporting you.",
    english: "Don't bite the hand that feeds you.",
    theme: "folly",
  },
  {
    id: "kurangante-kaiyil",
    malayalam: "കുരങ്ങന്റെ കൈയിൽ പൂമാല",
    roman: "Kuraṅṅanṟe kaiyil pūmāla",
    literal: "A flower garland in a monkey's hand.",
    meaning:
      "Something valuable handed to someone with no idea of its worth, who will only ruin it.",
    english: "To cast pearls before swine.",
    theme: "folly",
  },
  {
    id: "chatta-kunju",
    malayalam: "ചത്ത കുഞ്ഞിന്റെ ജാതകം നോക്കുക",
    roman: "Catta kuññinṟe jātakaṁ nōkkuka",
    literal: "Reading the horoscope of a child who has already died.",
    meaning:
      "Analysing something after the outcome can no longer be changed. Aimed at pointless post-mortems and blame sessions.",
    english: "Crying over spilt milk.",
    theme: "folly",
  },
  {
    id: "angadiyil-thottathinu",
    malayalam: "അങ്ങാടിയിൽ തോറ്റതിന് അമ്മയോട്",
    roman: "Aṅṅāṭiyil tōṟṟatinu ammayōṭu",
    literal: "Venting on mother what you lost in the marketplace.",
    meaning:
      "Taking a defeat suffered outside out on the people at home who had nothing to do with it.",
    english: "Kicking the dog.",
    theme: "character",
  },
  {
    id: "patirillatha",
    malayalam: "പതിരില്ലാത്ത പഴഞ്ചൊല്ലില്ല",
    roman: "Patirillātta paḻañcollilla",
    literal: "There is no proverb that is entirely chaff.",
    meaning:
      "Every old saying carries at least some grain of truth. Often quoted to defend the relevance of proverbs themselves.",
    english: "There is no proverb which is not true.",
    theme: "wisdom",
  },
  {
    id: "karyam-kaanan",
    malayalam: "കാര്യം കാണാൻ കഴുതക്കാലും പിടിക്കും",
    roman: "Kāryaṁ kāṇān kaḻutakkāluṁ piṭikkuṁ",
    literal: "To get the job done, a man will even grab a donkey's leg.",
    meaning:
      "People will flatter and grovel to anyone useful, then drop them. Said about sudden, self-interested friendliness.",
    english: "Necessity has no law.",
    theme: "character",
  },
  {
    id: "thalaykku-meethe",
    malayalam: "തലയ്ക്കു മീതെ വെള്ളം പൊങ്ങിയാൽ ഒരു ജാണും ഒരു മുഴവും ഒരുപോലെ",
    roman: "Talaykku mīte veḷḷaṁ poṅṅiyāl oru jāṇuṁ oru muḻavuṁ orupōle",
    literal:
      "Once the water rises above your head, a span or a cubit makes no difference.",
    meaning:
      "Past a certain point, extra trouble stops mattering — you are already in over your head.",
    english: "As well be hanged for a sheep as for a lamb.",
    theme: "consequence",
  },
  {
    id: "patti-kuracchal",
    malayalam: "പട്ടി കുരച്ചാൽ ആകാശം ഇടിഞ്ഞു വീഴുമോ?",
    roman: "Paṭṭi kuraccāl ākāśaṁ iṭiññu vīḻumō?",
    literal: "Will the sky come crashing down because a dog barked?",
    meaning:
      "Idle criticism from unimportant quarters changes nothing. Used to tell someone to ignore gossip.",
    english: "The dogs bark, but the caravan moves on.",
    theme: "words",
  },
  {
    id: "pazhutha-ila",
    malayalam: "പഴുത്ത ഇല വീഴുമ്പോൾ പച്ചില ചിരിക്കുന്നു",
    roman: "Paḻutta ila vīḻumpōḷ paccila cirikkunnu",
    literal: "When the ripe leaf falls, the green leaf laughs.",
    meaning:
      "The young mock the old, forgetting that the same fate is waiting for them. A reminder about mortality and respect.",
    english: "Today me, tomorrow thee.",
    theme: "wisdom",
  },
  {
    id: "mulline-mullukondu",
    malayalam: "മുള്ളിനെ മുള്ളുകൊണ്ടെടുക്കണം",
    roman: "Muḷḷine muḷḷukoṇṭeṭukkaṇaṁ",
    literal: "A thorn has to be removed with a thorn.",
    meaning:
      "Some problems can only be solved using the same kind of means that created them.",
    english: "Fight fire with fire.",
    theme: "wisdom",
  },
  {
    id: "kadalil-kaayam",
    malayalam: "കടലിൽ കായം കലക്കിയ പോലെ",
    roman: "Kaṭalil kāyaṁ kalakkiya pōle",
    literal: "Like dissolving asafoetida in the sea.",
    meaning:
      "An effort or contribution so small against the scale of the problem that it leaves no trace at all.",
    english: "A drop in the ocean.",
    theme: "folly",
  },
  {
    id: "cheriya-meen",
    malayalam: "ചെറിയ മീനിനെ ഇട്ട് വലിയ മീനിനെ പിടിക്കുക",
    roman: "Ceriya mīnine iṭṭu valiya mīnine piṭikkuka",
    literal: "Putting out a small fish to catch a big fish.",
    meaning:
      "Giving up something minor deliberately in order to win something far larger. Used about negotiation and investment.",
    english: "Throw a sprat to catch a mackerel.",
    theme: "wisdom",
  },
  {
    id: "atyagraham",
    malayalam: "അത്യാഗ്രഹം ആപത്ത്",
    roman: "Atyāgrahaṁ āpattu",
    literal: "Excessive greed is calamity.",
    meaning:
      "Reaching for more than is reasonable is what causes ruin. The shortest and most repeated of the Malayalam warnings about greed.",
    english: "Grasp all, lose all.",
    theme: "greed",
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
      proverb.malayalam,
      proverb.roman,
      proverb.literal,
      proverb.meaning,
      proverb.english,
    ].join(" ")
  );
}

/**
 * Filter by free text (all tokens must match) and theme.
 * Unknown themes fall back to "all". Always returns a plain object.
 */
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

/** Group every proverb under its theme, in THEMES order. */
export function groupByTheme() {
  return THEMES.map((theme) => ({
    ...theme,
    proverbs: PROVERBS.filter((proverb) => proverb.theme === theme.id),
  }));
}

const MS_PER_DAY = 86400000;

/**
 * Deterministic proverb of the day for an ISO date (YYYY-MM-DD).
 * Pure — the date is always supplied by the caller.
 */
export function proverbOfTheDay(isoDate) {
  const text = String(isoDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { error: "Pick a date as YYYY-MM-DD to see the pazhamchollu of the day." };
  }
  const stamp = Date.parse(`${text}T00:00:00Z`);
  if (!Number.isFinite(stamp)) {
    return { error: "That is not a real calendar date." };
  }
  const dayNumber = Math.floor(stamp / MS_PER_DAY);
  const index = ((dayNumber % PROVERBS.length) + PROVERBS.length) % PROVERBS.length;
  return { proverb: PROVERBS[index], index, date: text };
}
