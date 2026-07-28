/**
 * Gender-neutral names and a portability score.
 *
 * "Works across cultures" is treated as four measurable things: the name is
 * already used in several traditions, it is short, it contains no sound English
 * or Romance speakers routinely mangle (aspirated digraphs, three-consonant
 * runs), and it ends in a sound that exists in most languages. Each is scored
 * separately so nothing is hidden inside the total.
 */

/** Each tradition a name is already used in earns this, up to MAX_TRADITION_POINTS. */
export const POINTS_PER_TRADITION = 5;
export const MAX_TRADITION_POINTS = 25;
/** A name of this length or shorter survives forms and introductions best. */
export const PORTABLE_MAX_LETTERS = 6;
export const POINTS_SHORT = 20;
/** Aspirated digraphs (bh, dh, gh, jh, kh, ph, th, zh) are mispronounced outside their own language. */
export const POINTS_NO_ASPIRATE = 20;
export const ASPIRATE_DIGRAPHS = ["bh", "dh", "gh", "jh", "kh", "ph", "th", "zh"];
/** Three or more consonants in a row is the classic stumbling block for a new speaker. */
export const POINTS_SIMPLE_CLUSTERS = 20;
export const MAX_CONSONANT_RUN = 2;
/** Endings in a vowel or in n, r, l, y exist in nearly every language. */
export const POINTS_FRIENDLY_ENDING = 15;
export const FRIENDLY_ENDINGS = ["a", "e", "i", "o", "u", "n", "r", "l", "y"];

/** Score bands for the plain-language verdict. */
export const PORTABILITY_BANDS = [
  [85, "Travels everywhere"],
  [65, "Travels well"],
  [45, "Needs explaining abroad"],
  [0, "Tied to one language"],
];

export const NEUTRAL_NAMES = [
  // ---- South Asian ----
  { name: "Kiran", traditions: ["Hindi", "Punjabi", "Nepali"], meaning: "A ray of light", note: "Common for any gender across North India and Nepal." },
  { name: "Arya", traditions: ["Sanskrit", "Persian", "English"], meaning: "Noble", note: "A boy's name in Iran, increasingly a girl's name in English-speaking countries." },
  { name: "Amrit", traditions: ["Sanskrit", "Punjabi"], meaning: "Nectar of immortality" },
  { name: "Aman", traditions: ["Hindi", "Arabic", "Swahili"], meaning: "Peace, safety" },
  { name: "Anmol", traditions: ["Hindi", "Punjabi"], meaning: "Priceless" },
  { name: "Ekam", traditions: ["Punjabi"], meaning: "One, oneness" },
  { name: "Nayan", traditions: ["Sanskrit", "Bengali"], meaning: "Eye" },
  { name: "Jyoti", traditions: ["Sanskrit", "Hindi", "Nepali"], meaning: "Light, flame" },
  { name: "Harpreet", traditions: ["Punjabi"], meaning: "Love of God" },
  { name: "Manpreet", traditions: ["Punjabi"], meaning: "Loving mind" },
  { name: "Gurpreet", traditions: ["Punjabi"], meaning: "Love of the Guru" },
  { name: "Navjot", traditions: ["Punjabi"], meaning: "New light" },
  { name: "Anbu", traditions: ["Tamil"], meaning: "Love, kindness" },
  { name: "Inba", traditions: ["Tamil"], meaning: "Joy" },
  { name: "Ezhil", traditions: ["Tamil"], meaning: "Beauty" },
  { name: "Mathi", traditions: ["Tamil"], meaning: "Moon; intellect" },
  { name: "Amit", traditions: ["Sanskrit", "Hebrew"], meaning: "Boundless in Sanskrit; friend in Hebrew", note: "A boy's name in India, used for any gender in Israel." },

  // ---- Middle Eastern ----
  { name: "Noor", traditions: ["Arabic", "Urdu", "Persian", "Turkish"], meaning: "Light" },
  { name: "Amal", traditions: ["Arabic", "Hebrew"], meaning: "Hope in Arabic; work, labour in Hebrew", note: "Usually feminine in Arabic, masculine in Hebrew." },
  { name: "Ihsan", traditions: ["Arabic", "Turkish"], meaning: "Excellence, doing what is beautiful" },
  { name: "Sama", traditions: ["Arabic"], meaning: "Sky, heavens" },
  { name: "Rida", traditions: ["Arabic", "Urdu"], meaning: "Contentment, acceptance" },
  { name: "Sahar", traditions: ["Arabic", "Persian", "Hebrew"], meaning: "Dawn" },

  // ---- Hebrew ----
  { name: "Ariel", traditions: ["Hebrew", "English", "Spanish"], meaning: "Lion of God", note: "Masculine in Israel, largely feminine in English after 1989." },
  { name: "Shai", traditions: ["Hebrew"], meaning: "Gift" },
  { name: "Or", traditions: ["Hebrew"], meaning: "Light" },
  { name: "Lior", traditions: ["Hebrew"], meaning: "My light" },
  { name: "Noa", traditions: ["Hebrew", "Dutch", "Spanish"], meaning: "Motion, movement", note: "A biblical woman's name; not the same name as Noah." },
  { name: "Adi", traditions: ["Hebrew", "Sanskrit"], meaning: "Ornament, jewel in Hebrew; first, beginning in Sanskrit" },

  // ---- European ----
  { name: "Alex", traditions: ["Greek", "English", "Spanish", "Russian", "German"], meaning: "Defender of people" },
  { name: "Sam", traditions: ["Hebrew", "English", "Persian"], meaning: "Short for Samuel or Samantha; also a Persian hero's name" },
  { name: "Sasha", traditions: ["Russian", "English", "French"], meaning: "Short form of Alexander or Alexandra", note: "A boy's name in Russia, mostly a girl's name in English." },
  { name: "Nikita", traditions: ["Russian", "Greek", "Hindi"], meaning: "Unconquered", note: "Strongly masculine in Russia, feminine in India and the West." },
  { name: "Andrea", traditions: ["Italian", "English", "German"], meaning: "Manly, brave", note: "Masculine in Italy, feminine in English and German." },
  { name: "Simone", traditions: ["Italian", "French", "English"], meaning: "He has heard", note: "Masculine in Italy, feminine in France and English." },
  { name: "Jean", traditions: ["French", "English", "Scottish"], meaning: "God is gracious", note: "Masculine in France, feminine in English and Scots." },
  { name: "Nico", traditions: ["Greek", "Italian", "Spanish", "German"], meaning: "Victory of the people" },
  { name: "Robin", traditions: ["English", "French", "German", "Dutch"], meaning: "Bright fame; also the bird" },
  { name: "Charlie", traditions: ["English", "Irish"], meaning: "Free person" },
  { name: "Frankie", traditions: ["English", "Italian"], meaning: "Free; from France" },
  { name: "Toni", traditions: ["Italian", "German", "English"], meaning: "Short for Antonio or Antonia" },
  { name: "Valentin", traditions: ["Latin", "French", "Russian"], meaning: "Strong, healthy" },
  { name: "Rene", traditions: ["French", "Spanish"], meaning: "Reborn", note: "René is masculine, Renée feminine, in French." },
  { name: "Kim", traditions: ["English", "Korean", "Danish"], meaning: "Short for Kimberly; also a Korean surname" },
  { name: "Eli", traditions: ["Hebrew", "Spanish", "English"], meaning: "Ascended, my God" },
  { name: "Luca", traditions: ["Italian", "German", "Hungarian"], meaning: "From Lucania; light", note: "Masculine in Italy, feminine in Hungary." },

  // ---- Celtic ----
  { name: "Rowan", traditions: ["Irish", "Scottish", "English"], meaning: "Little red one; the rowan tree" },
  { name: "Quinn", traditions: ["Irish", "English"], meaning: "Descendant of Conn; wisdom, chief" },
  { name: "Casey", traditions: ["Irish", "English"], meaning: "Vigilant, watchful" },
  { name: "Riley", traditions: ["Irish", "English"], meaning: "Valiant; rye clearing" },
  { name: "Shannon", traditions: ["Irish", "English"], meaning: "Old and wise; the river Shannon" },
  { name: "Kerry", traditions: ["Irish", "English"], meaning: "From County Kerry" },
  { name: "Ellis", traditions: ["Welsh", "English"], meaning: "Benevolent; the Lord is my God" },
  { name: "Morgan", traditions: ["Welsh", "English"], meaning: "Sea-born, sea circle" },

  // ---- English place, surname and nature names ----
  { name: "Avery", traditions: ["English"], meaning: "Ruler of elves" },
  { name: "Jordan", traditions: ["Hebrew", "English", "Arabic"], meaning: "To descend, flow down; the river Jordan" },
  { name: "Taylor", traditions: ["English"], meaning: "Tailor" },
  { name: "Parker", traditions: ["English"], meaning: "Park keeper" },
  { name: "Logan", traditions: ["Scottish", "English"], meaning: "Little hollow" },
  { name: "Cameron", traditions: ["Scottish", "English"], meaning: "Crooked nose" },
  { name: "Hayden", traditions: ["English"], meaning: "Hay valley" },
  { name: "Emerson", traditions: ["English", "German"], meaning: "Son of Emery, brave and powerful" },
  { name: "Peyton", traditions: ["English"], meaning: "Fighting man's estate" },
  { name: "Reese", traditions: ["Welsh", "English"], meaning: "Ardour, enthusiasm" },
  { name: "Marley", traditions: ["English"], meaning: "Pleasant wood" },
  { name: "Tatum", traditions: ["English"], meaning: "Tate's homestead" },
  { name: "Finley", traditions: ["Scottish", "Irish"], meaning: "Fair-haired warrior" },
  { name: "Sage", traditions: ["English", "Latin"], meaning: "Wise one; the herb" },
  { name: "River", traditions: ["English"], meaning: "A flowing body of water" },
  { name: "Sky", traditions: ["English", "Norse"], meaning: "The sky; cloud" },
  { name: "Wren", traditions: ["English"], meaning: "The small brown bird" },
  { name: "Lark", traditions: ["English"], meaning: "The songbird; carefree" },
  { name: "Winter", traditions: ["English"], meaning: "The cold season" },
  { name: "Storm", traditions: ["English", "Norse", "Dutch"], meaning: "Tempest" },
  { name: "Rain", traditions: ["English"], meaning: "Falling water" },
  { name: "Ocean", traditions: ["English", "French"], meaning: "The sea" },
  { name: "Indigo", traditions: ["English", "Greek"], meaning: "The deep blue dye; from India" },
  { name: "Ash", traditions: ["English"], meaning: "The ash tree" },
  { name: "Reed", traditions: ["English"], meaning: "Red-haired; the marsh plant" },
  { name: "Aspen", traditions: ["English"], meaning: "The quaking aspen tree" },
  { name: "Phoenix", traditions: ["Greek", "English"], meaning: "The bird reborn from its own ashes" },
  { name: "Eden", traditions: ["Hebrew", "English"], meaning: "Delight, paradise" },
  { name: "Nova", traditions: ["Latin", "English"], meaning: "New; a star that suddenly brightens" },
  { name: "Micah", traditions: ["Hebrew", "English"], meaning: "Who is like God?" },
  { name: "Remy", traditions: ["French", "English"], meaning: "Oarsman; from Rheims" },
  { name: "Blake", traditions: ["English"], meaning: "Black or pale — the name means both" },
  { name: "Dakota", traditions: ["Dakota", "English"], meaning: "Friend, ally" },
  { name: "Oakley", traditions: ["English"], meaning: "Oak clearing" },
  { name: "Kendall", traditions: ["English"], meaning: "Valley of the river Kent" },
  { name: "Justice", traditions: ["English", "Latin"], meaning: "Fairness, the quality of being just" },

  // ---- East Asian and African ----
  { name: "Akira", traditions: ["Japanese"], meaning: "Bright, clear" },
  { name: "Haru", traditions: ["Japanese"], meaning: "Spring; sunlight" },
  { name: "Hikaru", traditions: ["Japanese"], meaning: "Light, radiance" },
  { name: "Aoi", traditions: ["Japanese"], meaning: "Blue; the hollyhock" },
  { name: "Yuki", traditions: ["Japanese"], meaning: "Snow; happiness" },
  { name: "Kai", traditions: ["Hawaiian", "Japanese", "Welsh", "Danish"], meaning: "Sea in Hawaiian; recovery in Japanese; keeper of the keys in Welsh" },
  { name: "Zuri", traditions: ["Swahili"], meaning: "Beautiful, good" },
  { name: "Amani", traditions: ["Swahili", "Arabic"], meaning: "Peace in Swahili; wishes, aspirations in Arabic" },
  { name: "Imani", traditions: ["Swahili", "Arabic"], meaning: "Faith" },
  { name: "Neema", traditions: ["Swahili", "Arabic"], meaning: "Grace, blessing" },
  { name: "Baraka", traditions: ["Swahili", "Arabic"], meaning: "Blessing" },
];

/** Strip everything but letters and lowercase. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Length of the longest run of consecutive consonants (y counts as a vowel here). */
export function longestConsonantRun(name) {
  const runs = normaliseName(name).match(/[^aeiouy]+/g);
  if (!runs) return 0;
  return runs.reduce((longest, run) => Math.max(longest, run.length), 0);
}

/**
 * Score how well a name travels between languages, out of 100.
 * `traditions` is the list of naming traditions the name is already used in.
 * Returns { error } for an empty or non-alphabetic name.
 */
export function portabilityScore(rawName, traditions = []) {
  const name = normaliseName(rawName);
  if (!name) return { error: "Enter a name made of letters to score it." };

  const traditionCount = Array.isArray(traditions) ? traditions.length : 0;
  const traditionPoints = Math.min(MAX_TRADITION_POINTS, traditionCount * POINTS_PER_TRADITION);
  const isShort = name.length <= PORTABLE_MAX_LETTERS;
  const aspirate = ASPIRATE_DIGRAPHS.find((pair) => name.includes(pair)) || null;
  const run = longestConsonantRun(name);
  const simpleClusters = run <= MAX_CONSONANT_RUN;
  const ending = name.slice(-1);
  const friendlyEnding = FRIENDLY_ENDINGS.includes(ending);

  const factors = [
    {
      key: "traditions",
      label: "Already used in several traditions",
      earned: traditionPoints,
      max: MAX_TRADITION_POINTS,
      note:
        traditionCount > 0
          ? `Used in ${traditionCount} tradition${traditionCount === 1 ? "" : "s"}.`
          : "No traditions recorded for this name.",
    },
    {
      key: "length",
      label: `${PORTABLE_MAX_LETTERS} letters or fewer`,
      earned: isShort ? POINTS_SHORT : 0,
      max: POINTS_SHORT,
      note: `${name.length} letters.`,
    },
    {
      key: "aspirate",
      label: "No aspirated digraph",
      earned: aspirate ? 0 : POINTS_NO_ASPIRATE,
      max: POINTS_NO_ASPIRATE,
      note: aspirate ? `Contains "${aspirate}", which shifts sound between languages.` : "Nothing to mispronounce.",
    },
    {
      key: "clusters",
      label: "No long consonant run",
      earned: simpleClusters ? POINTS_SIMPLE_CLUSTERS : 0,
      max: POINTS_SIMPLE_CLUSTERS,
      note: `Longest consonant run is ${run}.`,
    },
    {
      key: "ending",
      label: "Ends in a widely shared sound",
      earned: friendlyEnding ? POINTS_FRIENDLY_ENDING : 0,
      max: POINTS_FRIENDLY_ENDING,
      note: friendlyEnding ? `Ends in "${ending}".` : `Ends in "${ending}", which not every language uses finally.`,
    },
  ];

  const score = factors.reduce((sum, factor) => sum + factor.earned, 0);
  const band = PORTABILITY_BANDS.find(([floor]) => score >= floor)[1];

  return { score, band, factors, letters: name.length, traditionCount };
}

/** Distinct traditions present in the library. */
export function availableTraditions() {
  const set = new Set();
  NEUTRAL_NAMES.forEach((entry) => entry.traditions.forEach((tradition) => set.add(tradition)));
  return Array.from(set).sort();
}

/**
 * Filter and rank the gender-neutral name library.
 * Returns { error } when a filter value is unusable.
 */
export function filterNeutralNames({
  tradition = "any",
  maxLetters = 20,
  minScore = 0,
  withNote = false,
  query = "",
} = {}) {
  if (tradition !== "any" && !availableTraditions().includes(tradition)) {
    return { error: "Unknown tradition filter." };
  }

  const cap = Number(maxLetters);
  if (!Number.isFinite(cap) || cap < 2 || cap > 20) {
    return { error: "Maximum length must be between 2 and 20 letters." };
  }

  const floor = Number(minScore);
  if (!Number.isFinite(floor) || floor < 0 || floor > 100) {
    return { error: "The minimum portability score must be between 0 and 100." };
  }

  const text = String(query || "").trim().toLowerCase();
  if (text.length > 40) return { error: "Keep the search under 40 characters." };

  const names = NEUTRAL_NAMES.map((entry) => {
    const scored = portabilityScore(entry.name, entry.traditions);
    return {
      ...entry,
      score: scored.score,
      band: scored.band,
      factors: scored.factors,
      letters: entry.name.length,
    };
  }).filter((entry) => {
    if (tradition !== "any" && !entry.traditions.includes(tradition)) return false;
    if (entry.letters > cap) return false;
    if (entry.score < floor) return false;
    if (withNote && !entry.note) return false;
    if (text) {
      const haystack = `${entry.name} ${entry.meaning} ${entry.note || ""} ${entry.traditions.join(" ")}`.toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    names,
    total: names.length,
    libraryTotal: NEUTRAL_NAMES.length,
    averageScore: names.length
      ? Math.round(names.reduce((sum, entry) => sum + entry.score, 0) / names.length)
      : 0,
    best: names.length ? names[0] : null,
  };
}
