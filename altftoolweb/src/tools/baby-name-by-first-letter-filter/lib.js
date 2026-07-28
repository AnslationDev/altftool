/**
 * Baby name filter — pure logic, no React and no DOM.
 *
 * NAMES is a hand-checked list of well-attested names with the origin language
 * and the meaning that is consistently given for that name. Names whose meaning
 * is genuinely disputed are left out rather than guessed at.
 *
 * Row format: [name, gender, origin, meaning]
 *   gender: "boy" | "girl" | "unisex"
 */

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
  { id: "unisex", label: "Unisex" },
];

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Bounds for the letter-count filter. */
export const MIN_LETTERS = 2;
export const MAX_LETTERS = 12;

const ROWS = [
  ["Aarav", "boy", "Sanskrit", "Peaceful, wise"],
  ["Aditi", "girl", "Sanskrit", "Boundless, free; mother of the gods"],
  ["Aditya", "boy", "Sanskrit", "The sun"],
  ["Advait", "boy", "Sanskrit", "Non-dual, without a second"],
  ["Aisha", "girl", "Arabic", "Living, alive"],
  ["Akash", "boy", "Sanskrit", "Sky"],
  ["Alexander", "boy", "Greek", "Defender of people"],
  ["Ali", "boy", "Arabic", "Exalted, high"],
  ["Amara", "girl", "Sanskrit", "Immortal"],
  ["Amelia", "girl", "Germanic", "Industrious, hard-working"],
  ["Amit", "boy", "Sanskrit", "Boundless, immeasurable"],
  ["Anand", "boy", "Sanskrit", "Bliss, joy"],
  ["Ananya", "girl", "Sanskrit", "Matchless, without equal"],
  ["Anjali", "girl", "Sanskrit", "Offering made with folded hands"],
  ["Arjun", "boy", "Sanskrit", "Bright, shining white"],
  ["Arnav", "boy", "Sanskrit", "Ocean"],
  ["Aryan", "boy", "Sanskrit", "Noble"],
  ["Avani", "girl", "Sanskrit", "The earth"],
  ["Benjamin", "boy", "Hebrew", "Son of the right hand"],
  ["Bhavna", "girl", "Sanskrit", "Feeling, sentiment"],
  ["Bilal", "boy", "Arabic", "Moisture, water; the first muezzin"],
  ["Bodhi", "unisex", "Sanskrit", "Awakening, enlightenment"],
  ["Brinda", "girl", "Sanskrit", "Basil (tulsi); a group"],
  ["Bruno", "boy", "Germanic", "Brown"],
  ["Caleb", "boy", "Hebrew", "Whole-hearted, faithful"],
  ["Charu", "girl", "Sanskrit", "Beautiful, graceful"],
  ["Chirag", "boy", "Persian", "Lamp, light"],
  ["Chloe", "girl", "Greek", "Green shoot, new growth"],
  ["Clara", "girl", "Latin", "Bright, clear"],
  ["Daniel", "boy", "Hebrew", "God is my judge"],
  ["Dara", "unisex", "Persian", "Wealthy, possessing"],
  ["Deepak", "boy", "Sanskrit", "Lamp"],
  ["Devika", "girl", "Sanskrit", "Little goddess"],
  ["Dhruv", "boy", "Sanskrit", "Constant, unshakeable; the pole star"],
  ["Diya", "girl", "Sanskrit", "Lamp, light"],
  ["Eli", "boy", "Hebrew", "Ascended, elevated"],
  ["Elena", "girl", "Greek", "Bright, shining light"],
  ["Emil", "boy", "Latin", "Rival, eager"],
  ["Esha", "girl", "Sanskrit", "Desire, wish"],
  ["Ethan", "boy", "Hebrew", "Firm, enduring"],
  ["Eva", "girl", "Hebrew", "Life"],
  ["Faiz", "boy", "Arabic", "Abundance, bounty"],
  ["Farah", "girl", "Arabic", "Joy, gladness"],
  ["Felix", "boy", "Latin", "Fortunate, lucky"],
  ["Fiona", "girl", "Gaelic", "Fair, white"],
  ["Gauri", "girl", "Sanskrit", "Fair; a name of Parvati"],
  ["Gautam", "boy", "Sanskrit", "The best of light; clan name of the Buddha"],
  ["Grace", "girl", "Latin", "Grace, favour"],
  ["Gurdeep", "unisex", "Punjabi", "Lamp of the guru"],
  ["Hana", "girl", "Arabic", "Happiness, bliss"],
  ["Hari", "boy", "Sanskrit", "A name of Vishnu; also lion, green"],
  ["Hassan", "boy", "Arabic", "Handsome, good"],
  ["Hazel", "girl", "English", "The hazel tree"],
  ["Henry", "boy", "Germanic", "Ruler of the household"],
  ["Ira", "girl", "Sanskrit", "The earth; speech"],
  ["Isaac", "boy", "Hebrew", "He will laugh"],
  ["Isha", "girl", "Sanskrit", "One who protects; a name of Durga"],
  ["Ishaan", "boy", "Sanskrit", "The sun; a name of Shiva"],
  ["Ivan", "boy", "Slavic", "God is gracious"],
  ["Jai", "boy", "Sanskrit", "Victory"],
  ["Jasmine", "girl", "Persian", "The jasmine flower"],
  ["Jaya", "girl", "Sanskrit", "Victory"],
  ["Jonah", "boy", "Hebrew", "Dove"],
  ["Julia", "girl", "Latin", "Youthful; of the Julian family"],
  ["Kabir", "boy", "Arabic", "Great; also the 15th-century poet-saint"],
  ["Kavya", "girl", "Sanskrit", "Poetry"],
  ["Keya", "girl", "Sanskrit", "The kewda flower"],
  ["Kiran", "unisex", "Sanskrit", "Ray of light"],
  ["Krishna", "boy", "Sanskrit", "Dark, dark blue"],
  ["Laila", "girl", "Arabic", "Night"],
  ["Lakshmi", "girl", "Sanskrit", "Good fortune; goddess of prosperity"],
  ["Leo", "boy", "Latin", "Lion"],
  ["Liam", "boy", "Irish", "Resolute protector"],
  ["Lila", "girl", "Sanskrit", "Divine play"],
  ["Luca", "boy", "Latin", "Light; from Lucania"],
  ["Maya", "girl", "Sanskrit", "Illusion; the creative power of the world"],
  ["Meera", "girl", "Sanskrit", "Ocean, boundary; the poet-saint Mirabai"],
  ["Mihir", "boy", "Sanskrit", "The sun"],
  ["Mohammed", "boy", "Arabic", "Praised, praiseworthy"],
  ["Mira", "girl", "Sanskrit", "Ocean, boundary"],
  ["Mohan", "boy", "Sanskrit", "Charming, bewitching"],
  ["Naina", "girl", "Sanskrit", "Eyes"],
  ["Naveen", "boy", "Sanskrit", "New, fresh"],
  ["Neha", "girl", "Sanskrit", "Rain, affection"],
  ["Nikhil", "boy", "Sanskrit", "Complete, whole"],
  ["Nina", "girl", "Spanish", "Little girl"],
  ["Noah", "boy", "Hebrew", "Rest, comfort"],
  ["Nora", "girl", "Latin", "Honour"],
  ["Olivia", "girl", "Latin", "Olive tree"],
  ["Omar", "boy", "Arabic", "Flourishing, long-lived"],
  ["Oscar", "boy", "Irish", "Deer lover"],
  ["Ojas", "boy", "Sanskrit", "Vitality, lustre"],
  ["Pari", "girl", "Persian", "Fairy"],
  ["Parth", "boy", "Sanskrit", "Son of Pritha; an epithet of Arjuna"],
  ["Pooja", "girl", "Sanskrit", "Worship, offering"],
  ["Pranav", "boy", "Sanskrit", "The sacred syllable Om"],
  ["Priya", "girl", "Sanskrit", "Beloved"],
  ["Qasim", "boy", "Arabic", "One who divides or distributes"],
  ["Quinn", "unisex", "Irish", "Descendant of Conn; counsel"],
  ["Radha", "girl", "Sanskrit", "Prosperity, success"],
  ["Rahul", "boy", "Sanskrit", "Able, efficient; son of the Buddha"],
  ["Rania", "girl", "Arabic", "Gazing, contemplating"],
  ["Ravi", "boy", "Sanskrit", "The sun"],
  ["Riya", "girl", "Sanskrit", "Singer; a stream"],
  ["Rohan", "boy", "Sanskrit", "Ascending, growing"],
  ["Ruhi", "girl", "Persian", "Spiritual, of the soul"],
  ["Sahil", "boy", "Arabic", "Shore, coast"],
  ["Samaira", "girl", "Sanskrit", "Enchanting"],
  ["Sanjay", "boy", "Sanskrit", "Triumphant, completely victorious"],
  ["Sara", "girl", "Hebrew", "Princess, noblewoman"],
  ["Shreya", "girl", "Sanskrit", "Auspicious, better"],
  ["Siddharth", "boy", "Sanskrit", "One who has achieved his aim"],
  ["Simran", "girl", "Punjabi", "Remembrance of God, meditation"],
  ["Sofia", "girl", "Greek", "Wisdom"],
  ["Tanvi", "girl", "Sanskrit", "Slender, delicate"],
  ["Tara", "girl", "Sanskrit", "Star"],
  ["Tariq", "boy", "Arabic", "One who knocks at the door; the morning star"],
  ["Theo", "boy", "Greek", "Gift of God"],
  ["Trisha", "girl", "Sanskrit", "Thirst, desire"],
  ["Udit", "boy", "Sanskrit", "Risen, grown"],
  ["Uma", "girl", "Sanskrit", "A name of Parvati"],
  ["Umar", "boy", "Arabic", "Flourishing, long-lived"],
  ["Uday", "boy", "Sanskrit", "Rising, sunrise"],
  ["Vaani", "girl", "Sanskrit", "Speech, voice"],
  ["Varun", "boy", "Sanskrit", "God of the waters"],
  ["Vedant", "boy", "Sanskrit", "The end of the Vedas; Vedanta philosophy"],
  ["Veer", "boy", "Sanskrit", "Brave, heroic"],
  ["Vidya", "girl", "Sanskrit", "Knowledge, learning"],
  ["Vivaan", "boy", "Sanskrit", "Full of life"],
  ["Wasim", "boy", "Arabic", "Handsome, graceful"],
  ["William", "boy", "Germanic", "Resolute protector"],
  ["Xavier", "boy", "Basque", "The new house"],
  ["Yash", "boy", "Sanskrit", "Fame, glory"],
  ["Yasmin", "girl", "Persian", "Jasmine flower"],
  ["Yuvan", "boy", "Sanskrit", "Young, youthful"],
  ["Zain", "boy", "Arabic", "Beauty, grace"],
  ["Zara", "girl", "Arabic", "Blooming flower; radiance"],
  ["Zoya", "girl", "Greek", "Life"],
];

/** Normalised name records with a derived letter count. */
export const NAMES = ROWS.map(([name, gender, origin, meaning]) => ({
  name,
  gender,
  origin,
  meaning,
  letters: name.length,
  initial: name.charAt(0).toUpperCase(),
}));

/** Every origin present in the list, sorted. */
export const ORIGINS = Array.from(new Set(NAMES.map((n) => n.origin))).sort();

/** Count of names starting with each letter — used to grey out empty letters. */
export function countsByLetter(list = NAMES) {
  const counts = {};
  for (const letter of ALPHABET) counts[letter] = 0;
  for (const entry of list) {
    if (counts[entry.initial] !== undefined) counts[entry.initial] += 1;
  }
  return counts;
}

/**
 * Filter the name list.
 *
 * @param {object} options
 * @param {string} [options.letter]   a single A-Z letter, or "" / "any" for all
 * @param {string} [options.gender]   "any" | "boy" | "girl" | "unisex"
 * @param {string} [options.origin]   an exact origin, or "any"
 * @param {number} [options.minLetters]
 * @param {number} [options.maxLetters]
 * @param {string} [options.meaning]  case-insensitive substring of the meaning
 * @returns {{names: object[], total: number, matched: number}|{error: string}}
 */
export function filterNames({
  letter = "any",
  gender = "any",
  origin = "any",
  minLetters = MIN_LETTERS,
  maxLetters = MAX_LETTERS,
  meaning = "",
} = {}) {
  const min = Math.floor(Number(minLetters));
  const max = Math.floor(Number(maxLetters));
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { error: "Name length must be a number." };
  }
  if (min < MIN_LETTERS || max > MAX_LETTERS) {
    return { error: `Name length must be between ${MIN_LETTERS} and ${MAX_LETTERS} letters.` };
  }
  if (min > max) {
    return { error: "The shortest length cannot be greater than the longest." };
  }
  if (gender !== "any" && !GENDERS.some((g) => g.id === gender)) {
    return { error: "Choose a valid gender option." };
  }

  const wantedLetter = typeof letter === "string" ? letter.trim().toUpperCase() : "";
  const useLetter = wantedLetter.length === 1 && ALPHABET.includes(wantedLetter);
  if (wantedLetter && wantedLetter !== "ANY" && !useLetter) {
    return { error: "Pick a single letter from A to Z." };
  }

  const needle = typeof meaning === "string" ? meaning.trim().toLowerCase() : "";

  const names = NAMES.filter((entry) => {
    if (useLetter && entry.initial !== wantedLetter) return false;
    if (gender !== "any" && entry.gender !== gender) return false;
    if (origin !== "any" && entry.origin !== origin) return false;
    if (entry.letters < min || entry.letters > max) return false;
    if (needle && !entry.meaning.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return { names, total: NAMES.length, matched: names.length };
}
