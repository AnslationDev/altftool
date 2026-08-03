/**
 * Jain baby name finder - pure data and filtering. No React, no DOM, no clocks.
 *
 * Every entry is anchored to something checkable in Jain tradition rather than
 * to a generic "meaning" list:
 *  - The 24 Tirthankaras of the present half-cycle, from Rishabhdev to Mahavir.
 *  - The Das Lakshana Dharma, the ten virtues observed during Paryushan /
 *    Das Lakshan: uttam kshama (forgiveness), mardav (humility), aarjav
 *    (straightforwardness), shauch (purity), satya (truth), sanyam (restraint),
 *    tap (austerity), tyag (renunciation), akinchanya (non-attachment) and
 *    brahmacharya (celibacy).
 *  - The four bhavanas: maitri, pramod, karunya and madhyastha.
 *  - The five entities saluted in the Navkar mantra: Arihant, Siddha, Acharya,
 *    Upadhyay and Sadhu.
 *  - Named figures from Jain history and the Agamas - Mahavir's parents
 *    Siddharth and Trishala, his chief disciple Gautam Swami, Chandanbala who
 *    headed his order of nuns, and Rishabhdev's children Bharat, Brahmi and
 *    Sundari.
 *
 * Syllable counts are stored with each entry rather than guessed from the
 * romanisation, because transliteration is not a reliable guide to how a name
 * is pronounced in Prakrit or Sanskrit.
 */

/** Tirthankaras in the present descending half-cycle (avasarpini). */
export const TIRTHANKARA_COUNT = 24;

/** Maximum number of names a single search may return. */
export const MAX_RESULTS = 60;

/** Minimum number of names a single search may return. */
export const MIN_RESULTS = 1;

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
];

export const CATEGORIES = [
  { id: "any", label: "Any source" },
  { id: "tirthankara", label: "Tirthankara names" },
  { id: "virtue", label: "Virtues and vows" },
  { id: "concept", label: "Doctrine and scripture" },
  { id: "figure", label: "Historical figures" },
  { id: "deity", label: "Attendant deities (yaksha and yakshi)" },
];

export const ORIGINS = [
  { id: "any", label: "Any" },
  { id: "Sanskrit", label: "Sanskrit" },
  { id: "Prakrit", label: "Prakrit" },
];

export const JAIN_NAMES = [
  // --- Tirthankara names ---
  { name: "Rishabh", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Bull; the best of a kind", note: "Rishabhdev, the first Tirthankara; the bull is his emblem." },
  { name: "Adinath", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "The first lord", note: "Another name for Rishabhdev, the first Tirthankara." },
  { name: "Ajit", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Unconquered", note: "Ajitnath, the second Tirthankara." },
  { name: "Sambhav", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Origin; that which is possible", note: "Sambhavnath, the third Tirthankara." },
  { name: "Abhinandan", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 4, meaning: "Rejoicing, glad welcome", note: "Abhinandannath, the fourth Tirthankara." },
  { name: "Sumati", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Good understanding", note: "Sumatinath, the fifth Tirthankara." },
  { name: "Padmaprabh", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Radiant as a lotus", note: "The sixth Tirthankara, said to have had a lotus-red complexion." },
  { name: "Suparshva", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Well-formed at the sides", note: "Suparshvanath, the seventh Tirthankara." },
  { name: "Chandraprabh", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Bright as the moon", note: "The eighth Tirthankara; the crescent moon is his emblem." },
  { name: "Pushpadant", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Flower-toothed", note: "The ninth Tirthankara, also called Suvidhinath." },
  { name: "Suvidhi", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Of right procedure", note: "The alternative name of the ninth Tirthankara." },
  { name: "Shital", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Cool, calm", note: "Shitalnath, the tenth Tirthankara." },
  { name: "Shreyans", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Most auspicious", note: "Shreyansnath, the eleventh Tirthankara." },
  { name: "Vimal", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Stainless, pure", note: "Vimalnath, the thirteenth Tirthankara." },
  { name: "Anant", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Endless, infinite", note: "Anantnath, the fourteenth Tirthankara." },
  { name: "Dharm", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 1, meaning: "Righteous conduct", note: "Dharmanath, the fifteenth Tirthankara." },
  { name: "Shanti", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Peace", note: "Shantinath, the sixteenth Tirthankara." },
  { name: "Kunthu", gender: "boy", origin: "Prakrit", category: "tirthankara", syllables: 2, meaning: "Name of the seventeenth Jina", note: "Kunthunath, the seventeenth Tirthankara." },
  { name: "Malli", gender: "girl", origin: "Prakrit", category: "tirthankara", syllables: 2, meaning: "Jasmine", note: "Mallinath, the nineteenth Tirthankara, held by the Shvetambara tradition to have been born a woman." },
  { name: "Munisuvrat", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 4, meaning: "The sage of excellent vows", note: "The twentieth Tirthankara." },
  { name: "Nami", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "One who bows", note: "Naminath, the twenty-first Tirthankara." },
  { name: "Nemi", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Rim of a wheel", note: "Neminath, the twenty-second Tirthankara, a cousin of Krishna in Jain accounts." },
  { name: "Parshva", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 2, meaning: "Side; one who is near", note: "Parshvanath, the twenty-third Tirthankara, shown with a serpent hood." },
  { name: "Vardhaman", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Ever-increasing", note: "The birth name of Mahavir, the twenty-fourth Tirthankara." },
  { name: "Mahavir", gender: "boy", origin: "Sanskrit", category: "tirthankara", syllables: 3, meaning: "Great hero", note: "The twenty-fourth and last Tirthankara of this half-cycle." },

  // --- Virtues and vows ---
  { name: "Kshama", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Forgiveness", note: "Uttam kshama, the first of the ten dharmas, and the theme of Kshamavani." },
  { name: "Mardav", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Gentleness, absence of pride", note: "The second of the ten dharmas." },
  { name: "Aarjav", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Straightforwardness", note: "The third of the ten dharmas." },
  { name: "Satya", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Truth", note: "The fifth of the ten dharmas and the second of the five vows." },
  { name: "Sanyam", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Self-restraint", note: "The sixth of the ten dharmas." },
  { name: "Tap", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 1, meaning: "Austerity", note: "The seventh of the ten dharmas." },
  { name: "Tyag", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 1, meaning: "Renunciation, giving", note: "The eighth of the ten dharmas." },
  { name: "Ahimsa", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 3, meaning: "Non-violence", note: "The first and central vow of Jain practice." },
  { name: "Maitri", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Friendliness towards all beings", note: "The first of the four bhavanas." },
  { name: "Pramoda", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 3, meaning: "Delight in the virtue of others", note: "The second of the four bhavanas." },
  { name: "Karuna", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 3, meaning: "Compassion for the suffering", note: "The third of the four bhavanas, karunya." },
  { name: "Vinay", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Humility, reverence", note: "One of the six essential duties of a Jain householder." },
  { name: "Vivek", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Discernment", note: "The faculty of telling the soul apart from what is not the soul." },
  { name: "Abhay", gender: "boy", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Fearlessness", note: "Abhaydaan, the gift of fearlessness to other beings, is the highest form of giving." },
  { name: "Samta", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 2, meaning: "Equanimity", note: "The state cultivated in samayik, the practice of sitting in equanimity." },
  { name: "Suvrata", gender: "girl", origin: "Sanskrit", category: "virtue", syllables: 3, meaning: "One of good vows", note: "The feminine form of the epithet carried by the twentieth Tirthankara." },

  // --- Doctrine and scripture ---
  { name: "Arihant", gender: "boy", origin: "Prakrit", category: "concept", syllables: 3, meaning: "One who has destroyed the inner enemies", note: "The first of the five saluted in the Navkar mantra." },
  { name: "Jinesh", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Lord of the Jinas", note: "Jina means conqueror - the root the word Jain comes from." },
  { name: "Jinendra", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 3, meaning: "Chief among the Jinas", note: "A title used for a Tirthankara." },
  { name: "Jinal", gender: "girl", origin: "Prakrit", category: "concept", syllables: 2, meaning: "Devoted to the Jina", note: "A widely used modern Jain name built on the root jina." },
  { name: "Bhavya", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "One capable of liberation", note: "A technical Jain term for a soul that can attain moksha." },
  { name: "Samyak", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Right, correct", note: "From samyak darshan, samyak gyan and samyak charitra - the three jewels." },
  { name: "Anekant", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 3, meaning: "Many-sidedness", note: "Anekantavada, the Jain doctrine that truth has many aspects." },
  { name: "Keval", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Absolute, unaided", note: "From kevalgyan, the omniscience attained on the destruction of karma." },
  { name: "Nirvan", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Liberation", note: "The final release of the soul from the cycle of rebirth." },
  { name: "Nirja", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Shedding of karma", note: "From nirjara, the wearing away of accumulated karma." },
  { name: "Chetan", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Consciousness", note: "The defining quality of the jiva, the living soul, in Jain metaphysics." },
  { name: "Tirth", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 1, meaning: "A ford, a crossing place", note: "A Tirthankara is a ford-maker who builds the crossing over the ocean of rebirth." },
  { name: "Shruti", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "That which is heard", note: "The Jain Agamas are shrut, the heard teaching passed down orally." },
  { name: "Vandana", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 3, meaning: "Reverent salutation", note: "One of the six avashyaka, the essential daily duties." },
  { name: "Siddhi", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Accomplishment, perfection", note: "The state of the siddha, the liberated soul, second in the Navkar mantra." },
  { name: "Riddhi", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Spiritual attainment", note: "Commonly paired with Siddhi in Jain families." },
  { name: "Shraddha", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Faith", note: "Samyak shraddha, right faith, is the first of the three jewels." },
  { name: "Nishtha", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Steadfastness", note: "Constancy in vow and practice." },
  { name: "Nirmal", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Spotless", note: "Describes the soul once karmic matter has been shed." },
  { name: "Prashant", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Tranquil", note: "The composure sought in meditation and in the Tirthankara image." },
  { name: "Amrit", gender: "boy", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Deathless", note: "The immortality of the liberated soul." },
  { name: "Amruta", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 3, meaning: "Nectar of immortality", note: "The feminine form of amrit." },
  { name: "Shubhra", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 2, meaning: "Bright, white", note: "White is the colour of the highest lesya, the purest state of mind." },
  { name: "Anagha", gender: "girl", origin: "Sanskrit", category: "concept", syllables: 3, meaning: "Faultless, without sin", note: "Free of the karmic blemish that binds the soul." },

  // --- Historical figures ---
  { name: "Siddharth", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "One whose purpose is accomplished", note: "The father of Mahavir, ruler of the Jnatrika clan at Kundagrama." },
  { name: "Trishala", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Name of Mahavir's mother", note: "Trishala, also called Priyakarini, mother of the twenty-fourth Tirthankara." },
  { name: "Gautam", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 2, meaning: "Of the Gotama lineage", note: "Gautam Swami, the first ganadhar and chief disciple of Mahavir." },
  { name: "Sudharma", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Of good dharma", note: "Sudharma Swami, the fifth ganadhar, through whom the monastic lineage continues." },
  { name: "Bharat", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 2, meaning: "One who is nurtured", note: "The eldest son of Rishabhdev and the first chakravartin in Jain tradition." },
  { name: "Bahubali", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 4, meaning: "Strong of arm", note: "The son of Rishabhdev who renounced a won kingdom; the Shravanabelagola monolith depicts him." },
  { name: "Brahmi", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 2, meaning: "Of sacred learning", note: "A daughter of Rishabhdev; the Brahmi script is named after her in Jain accounts." },
  { name: "Sundari", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Beautiful one", note: "A daughter of Rishabhdev, taught arithmetic while Brahmi was taught letters." },
  { name: "Marudevi", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 4, meaning: "Name of Rishabhdev's mother", note: "Held in Jain tradition to be the first soul of this half-cycle to attain liberation." },
  { name: "Chandana", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Sandalwood", note: "Chandanbala, who headed Mahavir's order of nuns." },
  { name: "Yashoda", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Giver of fame", note: "The wife of Mahavir in the Shvetambara account." },
  { name: "Priyadarshana", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 5, meaning: "Pleasing to behold", note: "The daughter of Mahavir in the Shvetambara account." },
  { name: "Rajul", gender: "girl", origin: "Prakrit", category: "figure", syllables: 2, meaning: "Short form of Rajimati", note: "The princess betrothed to Neminath who became a nun after he renounced the world." },
  { name: "Rajimati", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 4, meaning: "Of royal wisdom", note: "The fuller form of Rajul." },
  { name: "Revati", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Prosperous", note: "A laywoman remembered in the Agamas for her service to Mahavir." },
  { name: "Sulasa", gender: "girl", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Well-disposed", note: "A devout laywoman praised in the Jain canon for the firmness of her faith." },
  { name: "Hemchandra", gender: "boy", origin: "Sanskrit", category: "figure", syllables: 3, meaning: "Golden moon", note: "Acharya Hemchandra, the twelfth-century Jain scholar, grammarian and poet." },

  // --- Attendant deities ---
  { name: "Padmavati", gender: "girl", origin: "Sanskrit", category: "deity", syllables: 4, meaning: "She of the lotus", note: "The yakshi who attends Parshvanath, the twenty-third Tirthankara." },
  { name: "Chakreshwari", gender: "girl", origin: "Sanskrit", category: "deity", syllables: 4, meaning: "Mistress of the discus", note: "The yakshi who attends Rishabhdev." },
  { name: "Ambika", gender: "girl", origin: "Sanskrit", category: "deity", syllables: 3, meaning: "Little mother", note: "The yakshi who attends Neminath, usually shown with a mango bough." },
  { name: "Dharanendra", gender: "boy", origin: "Sanskrit", category: "deity", syllables: 4, meaning: "Lord of the earth-serpents", note: "The yaksha who sheltered Parshvanath with his hood." },
];

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

const normalise = (value) =>
  clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const byId = (list, id) => list.find((item) => item.id === id) || null;

/** Deterministic 32-bit mixer used to rotate the result order. */
function mix(seed, salt) {
  let h = (Math.trunc(seed) ^ (salt * 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** The distinct first letters present in the whole list, in alphabetical order. */
export function availableInitials(names = JAIN_NAMES) {
  const set = new Set(names.map((entry) => entry.name.charAt(0).toUpperCase()));
  return Array.from(set).sort();
}

/** Highest syllable count in the list, used to bound the syllable filter. */
export function maxSyllables(names = JAIN_NAMES) {
  return names.reduce((max, entry) => (entry.syllables > max ? entry.syllables : max), 0);
}

/**
 * Filter the name list.
 *
 * @param {object} input
 * @param {string} [input.gender]        "any" | "boy" | "girl".
 * @param {string} [input.category]      One of CATEGORIES ids.
 * @param {string} [input.origin]        One of ORIGINS ids.
 * @param {string} [input.letter]        A single A-Z letter, or "" for all.
 * @param {number|string} [input.syllables] Exact syllable count, or "" for all.
 * @param {string} [input.query]         Free text matched against name, meaning and note.
 * @param {number} [input.limit]         How many names to return, 1 to 60.
 * @param {number} [input.seed]          Rotates the alphabetical order deterministically.
 * @returns {{error:string}|object}
 */
export function findJainNames(input) {
  const data = input && typeof input === "object" ? input : {};

  const gender = byId(GENDERS, data.gender || "any");
  if (!gender) return { error: "Choose a gender filter, or Any." };

  const category = byId(CATEGORIES, data.category || "any");
  if (!category) return { error: "Choose a source of names, or Any." };

  const origin = byId(ORIGINS, data.origin || "any");
  if (!origin) return { error: "Choose Sanskrit, Prakrit, or Any." };

  const letterRaw = clean(data.letter).toUpperCase();
  if (letterRaw && !/^[A-Z]$/.test(letterRaw)) {
    return { error: "The starting letter must be a single letter from A to Z." };
  }

  const syllablesRaw = data.syllables;
  let syllables = 0;
  if (syllablesRaw !== "" && syllablesRaw != null) {
    const value = Number(syllablesRaw);
    if (!Number.isFinite(value)) return { error: "Syllable count must be a whole number." };
    syllables = Math.round(value);
    const ceiling = maxSyllables();
    if (syllables < 1 || syllables > ceiling) {
      return { error: `Syllable count must be between 1 and ${ceiling}.` };
    }
  }

  const query = normalise(data.query);
  if (query.length > 40) return { error: "Search text is too long - keep it under 40 characters." };

  const limitRaw = data.limit == null || data.limit === "" ? 12 : Number(data.limit);
  if (!Number.isFinite(limitRaw)) return { error: "Number of results must be a whole number." };
  const limit = Math.round(limitRaw);
  if (limit < MIN_RESULTS || limit > MAX_RESULTS) {
    return { error: `Show between ${MIN_RESULTS} and ${MAX_RESULTS} names at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 0 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const matched = JAIN_NAMES.filter((entry) => {
    if (gender.id !== "any" && entry.gender !== gender.id) return false;
    if (category.id !== "any" && entry.category !== category.id) return false;
    if (origin.id !== "any" && entry.origin !== origin.id) return false;
    if (letterRaw && entry.name.charAt(0).toUpperCase() !== letterRaw) return false;
    if (syllables && entry.syllables !== syllables) return false;
    if (query) {
      const haystack = normalise(`${entry.name} ${entry.meaning} ${entry.note}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = matched
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  // Rotating a stable alphabetical list keeps the shuffle reproducible and
  // still shows every match if the user keeps pressing shuffle.
  const offset = sorted.length === 0 ? 0 : mix(seed, 1) % sorted.length;
  const rotated = sorted.slice(offset).concat(sorted.slice(0, offset));
  const names = rotated.slice(0, limit);

  const byGender = { boy: 0, girl: 0 };
  matched.forEach((entry) => {
    byGender[entry.gender] += 1;
  });

  return {
    names,
    matchedCount: matched.length,
    totalCount: JAIN_NAMES.length,
    shownCount: names.length,
    byGender,
    gender,
    category,
    origin,
    letter: letterRaw,
    syllables,
    seed,
    limit,
  };
}
