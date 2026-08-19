/**
 * Short modern Indian baby names, with a spelling-ease score.
 *
 * The score models the specific traps of romanised Indian names: doubled vowels
 * that are optional (Aarav / Arav), aspirated consonant digraphs that get dropped
 * (Siddharth / Sidharth), doubled consonants, y standing in for a vowel, and sheer
 * length. Each of those is a real, observable source of misspelling, and each is
 * reported individually so the number is never a black box.
 */

/** Everyone starts at 100 and loses points for each ambiguity found. */
export const BASE_SCORE = 100;
/** A name this long or shorter carries no length penalty. */
export const IDEAL_MAX_LETTERS = 5;
/** Points lost per letter beyond IDEAL_MAX_LETTERS. */
export const PENALTY_PER_EXTRA_LETTER = 6;
/** Doubled vowels are usually optional in transliteration, so both spellings circulate. */
export const PENALTY_DOUBLE_VOWEL = 12;
/** Aspirated digraphs (bh, dh, gh, jh, kh, ph, th) are routinely written without the h. */
export const PENALTY_ASPIRATE = 8;
/** Doubled consonants are equally routinely reduced to one. */
export const PENALTY_DOUBLE_CONSONANT = 8;
/** A y doing a vowel's job invites an i spelling instead. */
export const PENALTY_VOWEL_Y = 6;

export const DOUBLE_VOWELS = ["aa", "ee", "ii", "oo", "uu"];
export const ASPIRATE_DIGRAPHS = ["bh", "dh", "gh", "jh", "kh", "ph", "th"];
export const DOUBLE_CONSONANTS = ["dd", "tt", "nn", "ll", "ss", "rr", "mm", "kk", "pp", "gg", "bb"];

/** Score bands for the plain-language verdict. */
export const EASE_BANDS = [
  [85, "Very easy to spell"],
  [70, "Easy to spell"],
  [50, "Some spelling ambiguity"],
  [0, "Often misspelt"],
];

/** Length bounds of this library — it is a short-names list by definition. */
export const MIN_LETTERS = 2;
export const MAX_LETTERS = 6;

export const SHORT_NAMES = [
  // ---- boys ----
  { name: "Om", gender: "boy", origin: "Sanskrit", meaning: "The primordial sound" },
  { name: "Ved", gender: "boy", origin: "Sanskrit", meaning: "Sacred knowledge" },
  { name: "Dev", gender: "boy", origin: "Sanskrit", meaning: "God, divine" },
  { name: "Ram", gender: "boy", origin: "Sanskrit", meaning: "Pleasing, charming" },
  { name: "Jay", gender: "boy", origin: "Sanskrit", meaning: "Victory" },
  { name: "Vir", gender: "boy", origin: "Sanskrit", meaning: "Brave, a hero" },
  { name: "Yug", gender: "boy", origin: "Sanskrit", meaning: "An age, an era" },
  { name: "Hem", gender: "boy", origin: "Sanskrit", meaning: "Gold" },
  { name: "Nav", gender: "boy", origin: "Sanskrit", meaning: "New" },
  { name: "Prem", gender: "boy", origin: "Sanskrit", meaning: "Love, affection" },
  { name: "Vyom", gender: "boy", origin: "Sanskrit", meaning: "Sky, space" },
  { name: "Ansh", gender: "boy", origin: "Sanskrit", meaning: "A portion of a whole" },
  { name: "Neel", gender: "boy", origin: "Sanskrit", meaning: "Blue, sapphire" },
  { name: "Yash", gender: "boy", origin: "Sanskrit", meaning: "Fame, glory" },
  { name: "Shiv", gender: "boy", origin: "Sanskrit", meaning: "Auspicious" },
  { name: "Arav", gender: "boy", origin: "Sanskrit", meaning: "Peaceful, calm" },
  { name: "Anay", gender: "boy", origin: "Sanskrit", meaning: "Without a superior" },
  { name: "Avik", gender: "boy", origin: "Sanskrit", meaning: "Fearless, brave" },
  { name: "Aadi", gender: "boy", origin: "Sanskrit", meaning: "The first, the beginning" },
  { name: "Ayan", gender: "boy", origin: "Sanskrit", meaning: "Path, course" },
  { name: "Uday", gender: "boy", origin: "Sanskrit", meaning: "Sunrise, rising" },
  { name: "Vasu", gender: "boy", origin: "Sanskrit", meaning: "Wealth; a class of deities" },
  { name: "Ojas", gender: "boy", origin: "Sanskrit", meaning: "Vitality, vigour" },
  { name: "Rian", gender: "boy", origin: "Sanskrit", meaning: "Little king; a modern short form" },
  { name: "Arjun", gender: "boy", origin: "Sanskrit", meaning: "Bright, clear, white" },
  { name: "Aryan", gender: "boy", origin: "Sanskrit", meaning: "Noble" },
  { name: "Advik", gender: "boy", origin: "Sanskrit", meaning: "Unique" },
  { name: "Dhruv", gender: "boy", origin: "Sanskrit", meaning: "The pole star; steadfast" },
  { name: "Ishan", gender: "boy", origin: "Sanskrit", meaning: "The sun; lord of the north-east" },
  { name: "Krish", gender: "boy", origin: "Sanskrit", meaning: "Short form of Krishna" },
  { name: "Laksh", gender: "boy", origin: "Sanskrit", meaning: "Aim, target" },
  { name: "Manav", gender: "boy", origin: "Sanskrit", meaning: "Human being" },
  { name: "Mihir", gender: "boy", origin: "Sanskrit", meaning: "The sun" },
  { name: "Nakul", gender: "boy", origin: "Sanskrit", meaning: "The fourth Pandava" },
  { name: "Naman", gender: "boy", origin: "Sanskrit", meaning: "Salutation, bowing" },
  { name: "Nirav", gender: "boy", origin: "Sanskrit", meaning: "Quiet, silent" },
  { name: "Parth", gender: "boy", origin: "Sanskrit", meaning: "Son of Pritha; Arjuna" },
  { name: "Rudra", gender: "boy", origin: "Sanskrit", meaning: "The fierce one; Shiva" },
  { name: "Samar", gender: "boy", origin: "Sanskrit", meaning: "Battle, contest" },
  { name: "Soham", gender: "boy", origin: "Sanskrit", meaning: "I am that" },
  { name: "Tanay", gender: "boy", origin: "Sanskrit", meaning: "Son" },
  { name: "Tarun", gender: "boy", origin: "Sanskrit", meaning: "Young, youthful" },
  { name: "Tejas", gender: "boy", origin: "Sanskrit", meaning: "Radiance, brilliance" },
  { name: "Varun", gender: "boy", origin: "Sanskrit", meaning: "The deity of water" },
  { name: "Vinay", gender: "boy", origin: "Sanskrit", meaning: "Modesty, good conduct" },
  { name: "Viraj", gender: "boy", origin: "Sanskrit", meaning: "Resplendent, sovereign" },
  { name: "Vivan", gender: "boy", origin: "Sanskrit", meaning: "Full of life" },
  { name: "Vihan", gender: "boy", origin: "Sanskrit", meaning: "Dawn, first light" },
  { name: "Yuvan", gender: "boy", origin: "Sanskrit", meaning: "Youthful, healthy" },
  { name: "Arnav", gender: "boy", origin: "Sanskrit", meaning: "Ocean" },
  { name: "Rohan", gender: "boy", origin: "Sanskrit", meaning: "Ascending, growing" },
  { name: "Sahil", gender: "boy", origin: "Arabic", meaning: "Shore, riverbank; guide" },
  { name: "Rehan", gender: "boy", origin: "Arabic", meaning: "Sweet basil; fragrance" },
  { name: "Kabir", gender: "boy", origin: "Arabic", meaning: "Great, mighty" },
  { name: "Zain", gender: "boy", origin: "Arabic", meaning: "Beauty, grace" },
  { name: "Ayaan", gender: "boy", origin: "Arabic", meaning: "Gift of God; era" },
  { name: "Nihal", gender: "boy", origin: "Arabic", meaning: "Content, rejoicing" },
  { name: "Aman", gender: "unisex", origin: "Arabic", meaning: "Peace, safety" },
  { name: "Kiaan", gender: "boy", origin: "Persian", meaning: "King, grace of God" },
  { name: "Arjan", gender: "boy", origin: "Punjabi", meaning: "Earning; Guru Arjan" },
  { name: "Sahib", gender: "boy", origin: "Punjabi", meaning: "Lord, master" },
  { name: "Ekam", gender: "unisex", origin: "Punjabi", meaning: "One, oneness" },
  { name: "Arun", gender: "boy", origin: "Tamil", meaning: "The red glow of dawn" },
  { name: "Kavin", gender: "boy", origin: "Tamil", meaning: "Beauty, handsomeness" },
  { name: "Vetri", gender: "boy", origin: "Tamil", meaning: "Victory" },
  { name: "Mathi", gender: "unisex", origin: "Tamil", meaning: "Moon; intellect" },

  // ---- girls ----
  { name: "Ira", gender: "girl", origin: "Sanskrit", meaning: "The earth; Saraswati" },
  { name: "Ila", gender: "girl", origin: "Sanskrit", meaning: "The earth; speech" },
  { name: "Dia", gender: "girl", origin: "Sanskrit", meaning: "Lamp" },
  { name: "Diya", gender: "girl", origin: "Sanskrit", meaning: "Lamp" },
  { name: "Riya", gender: "girl", origin: "Sanskrit", meaning: "Singer; graceful" },
  { name: "Siya", gender: "girl", origin: "Sanskrit", meaning: "Sita" },
  { name: "Jiya", gender: "girl", origin: "Hindi", meaning: "Heart, life" },
  { name: "Isha", gender: "girl", origin: "Sanskrit", meaning: "Goddess, ruler" },
  { name: "Esha", gender: "girl", origin: "Sanskrit", meaning: "Desire, wish" },
  { name: "Mira", gender: "girl", origin: "Sanskrit", meaning: "Ocean; the saint-poet Meera" },
  { name: "Tara", gender: "girl", origin: "Sanskrit", meaning: "Star" },
  { name: "Maya", gender: "girl", origin: "Sanskrit", meaning: "Creative power; illusion" },
  { name: "Mahi", gender: "girl", origin: "Sanskrit", meaning: "The earth" },
  { name: "Anvi", gender: "girl", origin: "Sanskrit", meaning: "One of the earth" },
  { name: "Avni", gender: "girl", origin: "Sanskrit", meaning: "The earth" },
  { name: "Veda", gender: "girl", origin: "Sanskrit", meaning: "Sacred knowledge" },
  { name: "Vani", gender: "girl", origin: "Sanskrit", meaning: "Speech; Saraswati" },
  { name: "Neha", gender: "girl", origin: "Hindi", meaning: "Love, affection; rain" },
  { name: "Nila", gender: "girl", origin: "Tamil", meaning: "Moon, moonlight" },
  { name: "Rani", gender: "girl", origin: "Hindi", meaning: "Queen" },
  { name: "Reva", gender: "girl", origin: "Sanskrit", meaning: "The river Narmada" },
  { name: "Ruhi", gender: "girl", origin: "Persian", meaning: "Of the soul, spiritual" },
  { name: "Juhi", gender: "girl", origin: "Hindi", meaning: "A jasmine flower" },
  { name: "Keya", gender: "girl", origin: "Hindi", meaning: "The kewda monsoon flower" },
  { name: "Pihu", gender: "girl", origin: "Hindi", meaning: "The peacock's call" },
  { name: "Bela", gender: "girl", origin: "Hindi", meaning: "A jasmine flower; a moment in time" },
  { name: "Heer", gender: "girl", origin: "Punjabi", meaning: "Diamond; the heroine of Heer Ranjha" },
  { name: "Yami", gender: "girl", origin: "Sanskrit", meaning: "Night; sister of Yama" },
  { name: "Pari", gender: "girl", origin: "Persian", meaning: "Fairy, winged spirit" },
  { name: "Sara", gender: "girl", origin: "Arabic", meaning: "Princess, noblewoman" },
  { name: "Zara", gender: "girl", origin: "Arabic", meaning: "Blooming flower" },
  { name: "Zoya", gender: "girl", origin: "Arabic", meaning: "Loving, alive" },
  { name: "Hana", gender: "girl", origin: "Arabic", meaning: "Happiness, contentment" },
  { name: "Sana", gender: "girl", origin: "Arabic", meaning: "Radiance, brilliance" },
  { name: "Iqra", gender: "girl", origin: "Arabic", meaning: "Read, recite" },
  { name: "Aadya", gender: "girl", origin: "Sanskrit", meaning: "The first" },
  { name: "Aanya", gender: "girl", origin: "Sanskrit", meaning: "Inexhaustible" },
  { name: "Ahana", gender: "girl", origin: "Sanskrit", meaning: "Inner light; dawn" },
  { name: "Amara", gender: "girl", origin: "Sanskrit", meaning: "Immortal" },
  { name: "Anaya", gender: "girl", origin: "Sanskrit", meaning: "Caring, protected" },
  { name: "Anika", gender: "girl", origin: "Sanskrit", meaning: "Grace, brilliance" },
  { name: "Disha", gender: "girl", origin: "Sanskrit", meaning: "Direction" },
  { name: "Gauri", gender: "girl", origin: "Sanskrit", meaning: "Fair one; Parvati" },
  { name: "Kavya", gender: "girl", origin: "Sanskrit", meaning: "Poetry" },
  { name: "Naina", gender: "girl", origin: "Sanskrit", meaning: "Eyes" },
  { name: "Navya", gender: "girl", origin: "Sanskrit", meaning: "New, young" },
  { name: "Netra", gender: "girl", origin: "Sanskrit", meaning: "Eye" },
  { name: "Nidhi", gender: "girl", origin: "Sanskrit", meaning: "Treasure, store" },
  { name: "Nisha", gender: "girl", origin: "Sanskrit", meaning: "Night" },
  { name: "Nitya", gender: "girl", origin: "Sanskrit", meaning: "Eternal, constant" },
  { name: "Sneha", gender: "girl", origin: "Sanskrit", meaning: "Affection" },
  { name: "Tanvi", gender: "girl", origin: "Sanskrit", meaning: "Slender, delicate" },
  { name: "Vidya", gender: "girl", origin: "Sanskrit", meaning: "Knowledge, learning" },
  { name: "Meera", gender: "girl", origin: "Sanskrit", meaning: "Devotee; the saint-poet" },
  { name: "Kiara", gender: "girl", origin: "Persian", meaning: "Grace; also read as dark-haired" },
  { name: "Inaya", gender: "girl", origin: "Arabic", meaning: "Care, solicitude" },
  { name: "Aisha", gender: "girl", origin: "Arabic", meaning: "Alive, living" },
  { name: "Aliya", gender: "girl", origin: "Arabic", meaning: "Exalted, sublime" },
  { name: "Malar", gender: "girl", origin: "Tamil", meaning: "Flower" },
  { name: "Selvi", gender: "girl", origin: "Tamil", meaning: "Prosperous lady" },
  { name: "Ishita", gender: "girl", origin: "Sanskrit", meaning: "Mastery, greatness" },
  { name: "Prisha", gender: "girl", origin: "Sanskrit", meaning: "Beloved, a gift" },
  { name: "Bhavya", gender: "girl", origin: "Sanskrit", meaning: "Grand, splendid" },
  { name: "Charvi", gender: "girl", origin: "Sanskrit", meaning: "Beautiful" },
  { name: "Riddhi", gender: "girl", origin: "Sanskrit", meaning: "Prosperity" },
  { name: "Aarohi", gender: "girl", origin: "Sanskrit", meaning: "The ascending musical scale" },
  { name: "Saanvi", gender: "girl", origin: "Sanskrit", meaning: "An epithet of Lakshmi" },
  { name: "Shreya", gender: "girl", origin: "Sanskrit", meaning: "Auspicious, most excellent" },
  { name: "Trisha", gender: "girl", origin: "Sanskrit", meaning: "Thirst, longing" },
  { name: "Roshni", gender: "girl", origin: "Persian", meaning: "Light, brightness" },
  { name: "Ananya", gender: "girl", origin: "Sanskrit", meaning: "Unlike any other" },
  { name: "Anjali", gender: "girl", origin: "Sanskrit", meaning: "Offering with joined palms" },
  { name: "Simran", gender: "girl", origin: "Punjabi", meaning: "Remembrance, meditation" },

  // ---- unisex ----
  { name: "Arya", gender: "unisex", origin: "Sanskrit", meaning: "Noble" },
  { name: "Kiran", gender: "unisex", origin: "Sanskrit", meaning: "A ray of light" },
  { name: "Nayan", gender: "unisex", origin: "Sanskrit", meaning: "Eye" },
  { name: "Jyoti", gender: "unisex", origin: "Sanskrit", meaning: "Light, flame" },
  { name: "Amrit", gender: "unisex", origin: "Sanskrit", meaning: "Nectar of immortality" },
  { name: "Anmol", gender: "unisex", origin: "Hindi", meaning: "Priceless" },
  { name: "Noor", gender: "unisex", origin: "Arabic", meaning: "Light" },
  { name: "Ezhil", gender: "unisex", origin: "Tamil", meaning: "Beauty" },
  { name: "Kani", gender: "unisex", origin: "Tamil", meaning: "Fruit, sweetness" },
  { name: "Navjot", gender: "unisex", origin: "Punjabi", meaning: "New light" },
];

/** Strip everything but letters and lowercase. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function countOccurrences(text, needles) {
  return needles.reduce((total, needle) => {
    let index = text.indexOf(needle);
    let count = 0;
    while (index !== -1) {
      count += 1;
      index = text.indexOf(needle, index + needle.length);
    }
    return total + count;
  }, 0);
}

/**
 * How likely is this name to be spelled right first time?
 * Returns { error } for an empty or non-alphabetic name.
 */
export function spellingEase(rawName) {
  const name = normaliseName(rawName);
  if (!name) return { error: "Enter a name made of letters to score it." };

  const extraLetters = Math.max(0, name.length - IDEAL_MAX_LETTERS);
  const doubleVowels = countOccurrences(name, DOUBLE_VOWELS);
  const aspirates = countOccurrences(name, ASPIRATE_DIGRAPHS);
  const doubleConsonants = countOccurrences(name, DOUBLE_CONSONANTS);
  const vowelY = name.slice(1).includes("y") ? 1 : 0;

  const deductions = [
    {
      key: "length",
      label: `${extraLetters} letter${extraLetters === 1 ? "" : "s"} over ${IDEAL_MAX_LETTERS}`,
      points: extraLetters * PENALTY_PER_EXTRA_LETTER,
    },
    {
      key: "doubleVowel",
      label: `${doubleVowels} doubled vowel${doubleVowels === 1 ? "" : "s"} (often written singly)`,
      points: doubleVowels * PENALTY_DOUBLE_VOWEL,
    },
    {
      key: "aspirate",
      label: `${aspirates} aspirated digraph${aspirates === 1 ? "" : "s"} (the h is often dropped)`,
      points: aspirates * PENALTY_ASPIRATE,
    },
    {
      key: "doubleConsonant",
      label: `${doubleConsonants} doubled consonant${doubleConsonants === 1 ? "" : "s"}`,
      points: doubleConsonants * PENALTY_DOUBLE_CONSONANT,
    },
    {
      key: "vowelY",
      // points===0 items are filtered out below, so the falsy case never
      // reaches the UI — the label only needs to cover the truthy case.
      label: "a y standing in for a vowel",
      points: vowelY * PENALTY_VOWEL_Y,
    },
  ].filter((item) => item.points > 0);

  const lost = deductions.reduce((sum, item) => sum + item.points, 0);
  const score = Math.max(0, BASE_SCORE - lost);
  const band = EASE_BANDS.find(([floor]) => score >= floor)[1];

  return { score, band, deductions, letters: name.length };
}

/** Distinct origins present in the library. */
export function availableOrigins() {
  return Array.from(new Set(SHORT_NAMES.map((entry) => entry.origin))).sort();
}

/** Distinct first letters present in the library. */
export function availableLetters() {
  return Array.from(new Set(SHORT_NAMES.map((entry) => entry.name[0].toUpperCase()))).sort();
}

/**
 * Filter and rank the short-name library.
 * Returns { error } when a filter value is unusable.
 */
export function filterShortNames({
  gender = "any",
  origin = "any",
  letters = "any",
  startsWith = "",
  minEase = 0,
} = {}) {
  if (!["any", "boy", "girl", "unisex"].includes(gender)) return { error: "Unknown gender filter." };
  if (origin !== "any" && !availableOrigins().includes(origin)) return { error: "Unknown origin filter." };

  const letter = String(startsWith || "").trim();
  if (letter.length > 1) return { error: "Pick a single starting letter, or leave it on Any." };

  let exactLength = null;
  if (letters !== "any" && letters !== "") {
    const parsed = Number(letters);
    if (!Number.isInteger(parsed) || parsed < MIN_LETTERS || parsed > MAX_LETTERS) {
      return { error: `Choose a letter count between ${MIN_LETTERS} and ${MAX_LETTERS}, or Any.` };
    }
    exactLength = parsed;
  }

  const floor = Number(minEase);
  if (!Number.isFinite(floor) || floor < 0 || floor > 100) {
    return { error: "The minimum spelling-ease score must be between 0 and 100." };
  }

  const lowerLetter = letter.toLowerCase();

  const names = SHORT_NAMES.map((entry) => {
    const ease = spellingEase(entry.name);
    return { ...entry, ease: ease.score, easeBand: ease.band, letters: entry.name.length };
  }).filter((entry) => {
    if (gender !== "any" && entry.gender !== gender && entry.gender !== "unisex") return false;
    if (origin !== "any" && entry.origin !== origin) return false;
    if (exactLength !== null && entry.letters !== exactLength) return false;
    if (lowerLetter && entry.name[0].toLowerCase() !== lowerLetter) return false;
    if (entry.ease < floor) return false;
    return true;
  }).sort((a, b) => b.ease - a.ease || a.letters - b.letters || a.name.localeCompare(b.name));

  return {
    names,
    total: names.length,
    libraryTotal: SHORT_NAMES.length,
    averageEase: names.length
      ? Math.round(names.reduce((sum, entry) => sum + entry.ease, 0) / names.length)
      : 0,
    shortest: names.reduce((best, entry) => (best === null || entry.letters < best.letters ? entry : best), null),
  };
}
