/**
 * Gujarati Kahevat (કહેવત) Explorer — data and pure helpers.
 *
 * A kahevat is a complete proverbial sentence carrying folk wisdom, distinct
 * from a rudhiprayog (idiomatic phrase) which only works inside a sentence.
 * Each entry gives the Gujarati text, a Roman transliteration, the literal
 * image, how the saying is actually used, and the nearest English proverb.
 */

export const THEMES = [
  { id: "wisdom", label: "Wisdom & judgement" },
  { id: "words", label: "Speech & expression" },
  { id: "work", label: "Work & willpower" },
  { id: "money", label: "Money & thrift" },
  { id: "greed", label: "Greed & gullibility" },
  { id: "character", label: "Character & pride" },
  { id: "unity", label: "Unity & community" },
  { id: "family", label: "Family & household" },
  { id: "folly", label: "Folly & blame" },
  { id: "consequence", label: "Consequences" },
];

export const PROVERBS = [
  {
    id: "nach-na-jane",
    gujarati: "નાચ ન જાણે આંગણું વાંકું",
    roman: "Nāch na jāṇe āṅgaṇuṁ vāṅkuṁ",
    literal: "The one who cannot dance says the courtyard is crooked.",
    meaning:
      "Blaming circumstances for a failure that is really about your own lack of skill. The Gujarati go-to line for excuses.",
    english: "A bad workman blames his tools.",
    theme: "folly",
  },
  {
    id: "bole-tena-bor",
    gujarati: "બોલે તેના બોર વેચાય",
    roman: "Bole tenā bor vecāy",
    literal: "Only the one who calls out sells his jujube berries.",
    meaning:
      "You have to speak up and ask if you want business, a raise or help. Quoted to encourage people who wait to be noticed.",
    english: "The squeaky wheel gets the grease.",
    theme: "words",
  },
  {
    id: "jhaja-hath",
    gujarati: "ઝાઝા હાથ રળિયામણા",
    roman: "Jhājhā hāth raḷiyāmaṇā",
    literal: "Many hands make the work handsome.",
    meaning:
      "A job shared out is finished faster and more pleasantly. Used when organising family functions and community work.",
    english: "Many hands make light work.",
    theme: "unity",
  },
  {
    id: "adhuro-ghado",
    gujarati: "અધૂરો ઘડો છલકાય ઘણો",
    roman: "Adhūro ghaḍo chalkāy ghaṇo",
    literal: "A half-filled pot sloshes the most.",
    meaning:
      "Half-knowledge shows off loudest, while genuine expertise stays quiet. Aimed at people who talk over those who know better.",
    english: "Empty vessels make the most noise.",
    theme: "character",
  },
  {
    id: "samp-tyan-jamp",
    gujarati: "સંપ ત્યાં જંપ",
    roman: "Samp tyāṁ jamp",
    literal: "Where there is unity, there is rest.",
    meaning:
      "Peace of mind follows agreement. Repeated in families and cooperatives whenever a split is brewing.",
    english: "United we stand, divided we fall.",
    theme: "unity",
  },
  {
    id: "jevo-desh",
    gujarati: "જેવો દેશ તેવો વેશ",
    roman: "Jevo deś tevo veś",
    literal: "As is the country, so should be the dress.",
    meaning:
      "Adapt your manner and appearance to where you are. Used for travel, migration and new workplaces.",
    english: "When in Rome, do as the Romans do.",
    theme: "wisdom",
  },
  {
    id: "aap-saman-bal",
    gujarati: "આપ સમાન બળ નહીં, મેઘ સમાન જળ નહીં",
    roman: "Āp samān baḷ nahīṁ, megh samān jaḷ nahīṁ",
    literal: "There is no strength like your own, no water like rain.",
    meaning:
      "Self-reliance beats borrowed help just as rain beats any other source of water. Quoted to someone waiting on others to act.",
    english: "Self-help is the best help.",
    theme: "character",
  },
  {
    id: "vavo-tevu-lano",
    gujarati: "વાવો તેવું લણો",
    roman: "Vāvo tevuṁ laṇo",
    literal: "You harvest whatever you sowed.",
    meaning:
      "Results match the effort and intent that went in. Used about study, farming and how people are treated.",
    english: "As you sow, so shall you reap.",
    theme: "consequence",
  },
  {
    id: "durthi-dungar",
    gujarati: "દૂરથી ડુંગર રળિયામણા",
    roman: "Dūrthī ḍuṅgar raḷiyāmaṇā",
    literal: "Hills look beautiful from far away.",
    meaning:
      "Distance hides difficulty — other people's jobs, cities and lives look better than they are up close.",
    english: "The grass is always greener on the other side.",
    theme: "wisdom",
  },
  {
    id: "utavale-amba",
    gujarati: "ઉતાવળે આંબા ન પાકે",
    roman: "Utāvaḷe āṁbā na pāke",
    literal: "Mangoes do not ripen in a hurry.",
    meaning:
      "Good outcomes need their own time and cannot be forced. Said to students, founders and impatient parents alike.",
    english: "Rome was not built in a day.",
    theme: "wisdom",
  },
  {
    id: "gam-hoy-tyan",
    gujarati: "ગામ હોય ત્યાં ઉકરડો હોય",
    roman: "Gām hoy tyāṁ ukaraḍo hoy",
    literal: "Where there is a village there is also a rubbish heap.",
    meaning:
      "No community or institution is free of some ugliness; expecting perfection is naive.",
    english: "Every family has a black sheep.",
    theme: "wisdom",
  },
  {
    id: "chhash-leva",
    gujarati: "છાશ લેવા જવું અને દોણી સંતાડવી",
    roman: "Chāsh levā javuṁ ane doṇī santāḍvī",
    literal: "Going to fetch buttermilk while hiding the pot.",
    meaning:
      "Wanting a favour but being too proud or shy to ask plainly, so nobody can help you.",
    english: "He who is ashamed to ask is ashamed to learn.",
    theme: "folly",
  },
  {
    id: "gharna-chhokra",
    gujarati: "ઘરના છોકરા ઘંટી ચાટે ને ઉપાધ્યાયને આટો",
    roman: "Gharnā chokrā ghaṇṭī chāṭe ne upādhyāyne āṭo",
    literal:
      "The children of the house lick the grindstone while the priest is given the flour.",
    meaning:
      "Neglecting your own people while being generous to outsiders for show or status.",
    english: "Charity begins at home.",
    theme: "family",
  },
  {
    id: "ek-sandhe",
    gujarati: "એક સાંધે ત્યાં તેર તૂટે",
    roman: "Ek sāṁdhe tyāṁ ter tūṭe",
    literal: "Mend one place and thirteen others tear.",
    meaning:
      "The treadmill of a stretched budget, where fixing one shortfall opens several more.",
    english: "Robbing Peter to pay Paul.",
    theme: "money",
  },
  {
    id: "man-hoy-to-malve",
    gujarati: "મન હોય તો માળવે જવાય",
    roman: "Man hoy to Māḷve javāy",
    literal: "If the mind is willing, one can reach Malwa.",
    meaning:
      "Genuine intent finds a way, even for a long or difficult journey. Malwa stands for a far-off destination.",
    english: "Where there's a will, there's a way.",
    theme: "work",
  },
  {
    id: "chetata-nar",
    gujarati: "ચેતતા નર સદા સુખી",
    roman: "Chetatā nar sadā sukhī",
    literal: "The alert person is always happy.",
    meaning:
      "Foresight and preparation prevent the trouble that catches careless people. Common in safety and financial advice.",
    english: "Forewarned is forearmed.",
    theme: "wisdom",
  },
  {
    id: "pahelu-sukh",
    gujarati: "પહેલું સુખ તે જાતે નર્યા",
    roman: "Pahéluṁ sukh te jāte naryā",
    literal: "The first happiness is being healthy yourself.",
    meaning:
      "Health ranks above wealth, family and status because nothing else can be enjoyed without it.",
    english: "Health is wealth.",
    theme: "wisdom",
  },
  {
    id: "bhens-agal",
    gujarati: "ભેંસ આગળ ભાગવત",
    roman: "Bheṁs āgaḷ Bhāgvat",
    literal: "Reciting the Bhagavat before a buffalo.",
    meaning:
      "Offering something refined to an audience with no interest in it — wasted eloquence.",
    english: "Casting pearls before swine.",
    theme: "folly",
  },
  {
    id: "na-mama-karta",
    gujarati: "ના મામા કરતાં કાણો મામો સારો",
    roman: "Nā māmā kartāṁ kāṇo māmo sāro",
    literal: "A one-eyed uncle is better than no uncle at all.",
    meaning:
      "An imperfect option still beats having nothing. Quoted when someone rejects a workable offer while waiting for a perfect one.",
    english: "Half a loaf is better than no bread.",
    theme: "wisdom",
  },
  {
    id: "jyan-na-pahoche-ravi",
    gujarati: "જ્યાં ન પહોંચે રવિ, ત્યાં પહોંચે કવિ",
    roman: "Jyāṁ na pahoṁche ravi, tyāṁ pahoṁche kavi",
    literal: "Where the sun cannot reach, the poet reaches.",
    meaning:
      "Imagination goes where nothing physical can. Used in praise of writers and of creative thinking.",
    english: "The pen is mightier than the sword.",
    theme: "words",
  },
  {
    id: "lobhiya-hoy",
    gujarati: "લોભિયા હોય ત્યાં ધુતારા ભૂખે ન મરે",
    roman: "Lobhiyā hoy tyāṁ dhutārā bhūkhe na mare",
    literal: "Where there are greedy people, swindlers never go hungry.",
    meaning:
      "Frauds survive because greed supplies them with willing victims. The standard Gujarati warning about get-rich-quick schemes.",
    english: "A fool and his money are soon parted.",
    theme: "greed",
  },
  {
    id: "hathna-karya",
    gujarati: "હાથના કર્યા હૈયે વાગ્યાં",
    roman: "Hāthnā karyā haiye vāgyāṁ",
    literal: "What the hands did came back and struck the heart.",
    meaning:
      "A self-inflicted wound — the trouble you are in now is the direct result of your own earlier choice.",
    english: "You have made your bed, now lie in it.",
    theme: "consequence",
  },
  {
    id: "sangharyo-sap",
    gujarati: "સંઘર્યો સાપ પણ કામ આવે",
    roman: "Saṅgharyo sāp paṇ kām āve",
    literal: "Even a snake you kept aside comes in useful one day.",
    meaning:
      "Do not throw things — or contacts — away too quickly; the most unlikely one may be needed later.",
    english: "Keep a thing seven years and you will find a use for it.",
    theme: "money",
  },
  {
    id: "padana-vanke",
    gujarati: "પાડાના વાંકે પખાલીને ડામ",
    roman: "Pāḍānā vāṁke pakhālīne ḍām",
    literal: "Branding the water-carrier for the buffalo's mistake.",
    meaning:
      "Punishing the wrong person because the real culprit cannot be touched.",
    english: "The innocent pay for the guilty.",
    theme: "folly",
  },
  {
    id: "biladina-gale-ghant",
    gujarati: "બિલાડીના ગળે ઘંટ કોણ બાંધે",
    roman: "Bilāḍīnā gaḷe ghaṇṭ koṇ bāṁdhe",
    literal: "Who will tie the bell around the cat's neck?",
    meaning:
      "Everyone agrees on the plan, but nobody is willing to take the risk of carrying it out.",
    english: "Who will bell the cat?",
    theme: "wisdom",
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
      proverb.gujarati,
      proverb.roman,
      proverb.literal,
      proverb.meaning,
      proverb.english,
    ].join(" ")
  );
}

/** Free-text plus theme filter. Every query token must appear (AND search). */
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

/** Deterministic kahevat of the day for an ISO date (YYYY-MM-DD). Pure. */
export function proverbOfTheDay(isoDate) {
  const text = String(isoDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { error: "Pick a date as YYYY-MM-DD to see the kahevat of the day." };
  }
  const stamp = Date.parse(`${text}T00:00:00Z`);
  if (!Number.isFinite(stamp)) {
    return { error: "That is not a real calendar date." };
  }
  const dayNumber = Math.floor(stamp / MS_PER_DAY);
  const index = ((dayNumber % PROVERBS.length) + PROVERBS.length) % PROVERBS.length;
  return { proverb: PROVERBS[index], index, date: text };
}
