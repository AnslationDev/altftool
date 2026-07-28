/**
 * Hindu baby name finder — pure logic, no React and no DOM.
 *
 * Two data sets live here:
 *  1. NAKSHATRA_PADAS — the traditional namakaran chart. The zodiac's 360° is
 *     divided into 27 nakshatras of 13°20' each, and every nakshatra into four
 *     padas of 3°20'. Each pada carries a starting syllable for the child's
 *     name. Astrologers and regional traditions differ on a few syllables; this
 *     is the commonly published chart.
 *  2. NAMES — names with the Sanskrit source word, the meaning and the deity or
 *     figure the name is associated with, where there is one.
 *
 * Nothing here reads the clock: the nakshatra is supplied by the caller.
 */

/** A nakshatra spans 13°20' of the zodiac; each of its four padas spans 3°20'. */
export const NAKSHATRA_SPAN_DEGREES = 13 + 20 / 60;
export const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;
export const PADA_COUNT = 4;

/** [nakshatra name, [pada 1, pada 2, pada 3, pada 4]] */
export const NAKSHATRA_PADAS = [
  ["Ashwini", ["Chu", "Che", "Cho", "La"]],
  ["Bharani", ["Li", "Lu", "Le", "Lo"]],
  ["Krittika", ["A", "I", "U", "E"]],
  ["Rohini", ["O", "Va", "Vi", "Vu"]],
  ["Mrigashira", ["Ve", "Vo", "Ka", "Ki"]],
  ["Ardra", ["Ku", "Gha", "Nga", "Chha"]],
  ["Punarvasu", ["Ke", "Ko", "Ha", "Hi"]],
  ["Pushya", ["Hu", "He", "Ho", "Da"]],
  ["Ashlesha", ["Di", "Du", "De", "Do"]],
  ["Magha", ["Ma", "Mi", "Mu", "Me"]],
  ["Purva Phalguni", ["Mo", "Ta", "Ti", "Tu"]],
  ["Uttara Phalguni", ["Te", "To", "Pa", "Pi"]],
  ["Hasta", ["Pu", "Sha", "Na", "Tha"]],
  ["Chitra", ["Pe", "Po", "Ra", "Ri"]],
  ["Swati", ["Ru", "Re", "Ro", "Ta"]],
  ["Vishakha", ["Ti", "Tu", "Te", "To"]],
  ["Anuradha", ["Na", "Ni", "Nu", "Ne"]],
  ["Jyeshtha", ["No", "Ya", "Yi", "Yu"]],
  ["Mula", ["Ye", "Yo", "Bha", "Bhi"]],
  ["Purva Ashadha", ["Bhu", "Dha", "Pha", "Dha"]],
  ["Uttara Ashadha", ["Bhe", "Bho", "Ja", "Ji"]],
  ["Shravana", ["Ju", "Je", "Jo", "Gha"]],
  ["Dhanishta", ["Ga", "Gi", "Gu", "Ge"]],
  ["Shatabhisha", ["Go", "Sa", "Si", "Su"]],
  ["Purva Bhadrapada", ["Se", "So", "Da", "Di"]],
  ["Uttara Bhadrapada", ["Du", "Tha", "Jha", "Tra"]],
  ["Revati", ["De", "Do", "Cha", "Chi"]],
];

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
];

/** Row format: [name, gender, sanskrit root (IAST), meaning, deity or figure] */
const ROWS = [
  ["Aadhya", "girl", "ādyā", "The first, the beginning", "Durga"],
  ["Aarav", "boy", "ārava", "Peaceful sound; calm", ""],
  ["Aditi", "girl", "aditi", "Boundless, free", "Aditi, mother of the Adityas"],
  ["Aditya", "boy", "āditya", "Son of Aditi; the sun", "Surya"],
  ["Advait", "boy", "advaita", "Non-dual, without a second", ""],
  ["Akhil", "boy", "akhila", "Complete, entire", ""],
  ["Amrita", "girl", "amṛta", "Nectar of immortality", ""],
  ["Anand", "boy", "ānanda", "Bliss, deep joy", ""],
  ["Ananya", "girl", "ananya", "Matchless, without equal", ""],
  ["Anika", "girl", "anīkā", "Splendour; an army", "Durga"],
  ["Anjali", "girl", "añjali", "Offering with folded palms", ""],
  ["Ankita", "girl", "aṅkitā", "Marked, distinguished", ""],
  ["Arjun", "boy", "arjuna", "Bright, shining white", "Arjuna of the Mahabharata"],
  ["Arnav", "boy", "arṇava", "Ocean", ""],
  ["Arushi", "girl", "aruṣī", "First ray of the sun; red", "Usha"],
  ["Aryan", "boy", "ārya", "Noble", ""],
  ["Ashwin", "boy", "aśvin", "Horseman; the divine twin physicians", "Ashwini Kumaras"],
  ["Avani", "girl", "avanī", "The earth", "Bhudevi"],
  ["Ayush", "boy", "āyus", "Long life", ""],
  ["Bhavya", "girl", "bhavya", "Grand, splendid", ""],
  ["Bhavesh", "boy", "bhaveśa", "Lord of the world", "Shiva"],
  ["Bhuvan", "boy", "bhuvana", "The world, a realm", ""],
  ["Chandan", "boy", "candana", "Sandalwood", ""],
  ["Chandni", "girl", "candrikā", "Moonlight", ""],
  ["Charu", "girl", "cāru", "Beautiful, pleasing", ""],
  ["Chetan", "boy", "cetana", "Consciousness, awareness", ""],
  ["Damini", "girl", "dāminī", "Lightning", ""],
  ["Darshan", "boy", "darśana", "Sight, vision of the divine", ""],
  ["Deepak", "boy", "dīpaka", "Lamp", ""],
  ["Deepika", "girl", "dīpikā", "Little lamp", ""],
  ["Devansh", "boy", "devāṃśa", "Part of the divine", ""],
  ["Devika", "girl", "devikā", "Little goddess", ""],
  ["Dhruv", "boy", "dhruva", "Fixed, unshakeable; the pole star", "Dhruva, the devotee of Vishnu"],
  ["Divya", "girl", "divya", "Divine, brilliant", ""],
  ["Esha", "girl", "eṣā", "Desire, wish", ""],
  ["Gauri", "girl", "gaurī", "Fair one", "Parvati"],
  ["Gautam", "boy", "gautama", "Of the Gotama lineage", "Gautama Buddha"],
  ["Girish", "boy", "giriśa", "Lord of the mountain", "Shiva"],
  ["Gopal", "boy", "gopāla", "Protector of cows", "Krishna"],
  ["Hari", "boy", "hari", "Tawny, green; a name of Vishnu", "Vishnu"],
  ["Harsh", "boy", "harṣa", "Joy, delight", ""],
  ["Hemant", "boy", "hemanta", "Early winter", ""],
  ["Indira", "girl", "indirā", "Beauty, splendour", "Lakshmi"],
  ["Ishaan", "boy", "īśāna", "Ruler; the north-east direction", "Shiva"],
  ["Isha", "girl", "īśā", "One who rules", "Durga"],
  ["Jagat", "boy", "jagat", "The world, all that moves", ""],
  ["Janaki", "girl", "jānakī", "Daughter of Janaka", "Sita"],
  ["Jaya", "girl", "jayā", "Victory", "Durga"],
  ["Kalyani", "girl", "kalyāṇī", "Auspicious, bringing welfare", "Parvati"],
  ["Kartik", "boy", "kārttika", "Of the month Kartika", "Kartikeya"],
  ["Kavya", "girl", "kāvya", "Poetry", ""],
  ["Keshav", "boy", "keśava", "One with beautiful hair", "Krishna"],
  ["Kiran", "girl", "kiraṇa", "Ray of light", ""],
  ["Krishna", "boy", "kṛṣṇa", "Dark, dark blue", "Krishna"],
  ["Lakshmi", "girl", "lakṣmī", "Good fortune, prosperity", "Lakshmi"],
  ["Lalita", "girl", "lalitā", "Playful, charming", "Lalita Tripurasundari"],
  ["Madhav", "boy", "mādhava", "Of the springtime; of Madhu's line", "Krishna"],
  ["Mahesh", "boy", "maheśa", "Great lord", "Shiva"],
  ["Maitri", "girl", "maitrī", "Friendliness, loving-kindness", ""],
  ["Manas", "boy", "manas", "Mind", ""],
  ["Manjari", "girl", "mañjarī", "A blossom cluster", ""],
  ["Meera", "girl", "mīrā", "Boundary, ocean", "Mirabai, devotee of Krishna"],
  ["Mihir", "boy", "mihira", "The sun", "Surya"],
  ["Mohan", "boy", "mohana", "Charming, enchanting", "Krishna"],
  ["Mridula", "girl", "mṛdulā", "Soft, gentle", ""],
  ["Naina", "girl", "nayana", "Eyes", ""],
  ["Nandini", "girl", "nandinī", "Delighting, joyful", ""],
  ["Narayan", "boy", "nārāyaṇa", "Resting on the waters", "Vishnu"],
  ["Naveen", "boy", "navīna", "New, fresh", ""],
  ["Neha", "girl", "sneha", "Affection", ""],
  ["Nikhil", "boy", "nikhila", "Whole, complete", ""],
  ["Nirmal", "boy", "nirmala", "Spotless, pure", ""],
  ["Nitya", "girl", "nitya", "Eternal, constant", ""],
  ["Ojas", "boy", "ojas", "Vitality, vigour", ""],
  ["Omkar", "boy", "oṃkāra", "The syllable Om", "Shiva"],
  ["Padma", "girl", "padma", "Lotus", "Lakshmi"],
  ["Pallavi", "girl", "pallavī", "New leaves, sprouting", ""],
  ["Parth", "boy", "pārtha", "Son of Pritha", "Arjuna"],
  ["Pooja", "girl", "pūjā", "Worship, offering", ""],
  ["Prakash", "boy", "prakāśa", "Light, brightness", ""],
  ["Pranav", "boy", "praṇava", "The sacred syllable Om", ""],
  ["Preeti", "girl", "prīti", "Love, pleasure", ""],
  ["Priya", "girl", "priyā", "Beloved", ""],
  ["Radha", "girl", "rādhā", "Prosperity, success", "Radha, consort of Krishna"],
  ["Raghav", "boy", "rāghava", "Of the Raghu dynasty", "Rama"],
  ["Rajiv", "boy", "rājīva", "Blue lotus", ""],
  ["Rama", "boy", "rāma", "Pleasing, delightful", "Rama"],
  ["Ravi", "boy", "ravi", "The sun", "Surya"],
  ["Rekha", "girl", "rekhā", "A line, a streak", ""],
  ["Riddhi", "girl", "ṛddhi", "Prosperity, growth", "Riddhi, consort of Ganesha"],
  ["Rohan", "boy", "rohaṇa", "Ascending, growing", ""],
  ["Rohini", "girl", "rohiṇī", "Red one; the fourth nakshatra", "Rohini, consort of Chandra"],
  ["Rudra", "boy", "rudra", "The howler, the fierce one", "Shiva"],
  ["Sanjay", "boy", "sañjaya", "Completely victorious", "Sanjaya of the Mahabharata"],
  ["Saraswati", "girl", "sarasvatī", "Flowing one; goddess of learning", "Saraswati"],
  ["Sarika", "girl", "sārikā", "The myna bird", ""],
  ["Shanti", "girl", "śānti", "Peace", ""],
  ["Sharda", "girl", "śāradā", "Of the autumn; a name of Saraswati", "Saraswati"],
  ["Shivani", "girl", "śivānī", "Consort of Shiva", "Parvati"],
  ["Shreya", "girl", "śreyā", "Auspicious, more excellent", ""],
  ["Shyam", "boy", "śyāma", "Dark, dusky", "Krishna"],
  ["Siddharth", "boy", "siddhārtha", "One whose aim is accomplished", "Gautama Buddha"],
  ["Sita", "girl", "sītā", "Furrow", "Sita"],
  ["Smita", "girl", "smitā", "Smiling", ""],
  ["Sneha", "girl", "sneha", "Affection, tenderness", ""],
  ["Sudha", "girl", "sudhā", "Nectar", ""],
  ["Sumitra", "girl", "sumitrā", "Good friend", "Sumitra of the Ramayana"],
  ["Suresh", "boy", "sureśa", "Lord of the gods", "Indra"],
  ["Swara", "girl", "svara", "Musical note, voice", ""],
  ["Tanvi", "girl", "tanvī", "Slender, delicate", ""],
  ["Tara", "girl", "tārā", "Star", "Tara"],
  ["Tejas", "boy", "tejas", "Radiance, brilliance", ""],
  ["Trisha", "girl", "tṛṣā", "Thirst, longing", ""],
  ["Uday", "boy", "udaya", "Rising, sunrise", ""],
  ["Uma", "girl", "umā", "A name of Parvati", "Parvati"],
  ["Upendra", "boy", "upendra", "Younger brother of Indra", "Vishnu"],
  ["Urmila", "girl", "ūrmilā", "Enchanting; wave-like", "Urmila of the Ramayana"],
  ["Vaani", "girl", "vāṇī", "Speech, voice", "Saraswati"],
  ["Vaibhav", "boy", "vaibhava", "Grandeur, prosperity", ""],
  ["Varun", "boy", "varuṇa", "God of the waters", "Varuna"],
  ["Vedant", "boy", "vedānta", "The end of the Vedas", ""],
  ["Veer", "boy", "vīra", "Brave, heroic", ""],
  ["Vidya", "girl", "vidyā", "Knowledge, learning", "Saraswati"],
  ["Vihaan", "boy", "vihāna", "Dawn, first light", ""],
  ["Vikram", "boy", "vikrama", "Valour, a stride", "Vishnu (Trivikrama)"],
  ["Vinay", "boy", "vinaya", "Modesty, good conduct", ""],
  ["Vishal", "boy", "viśāla", "Vast, spacious", ""],
  ["Vivaan", "boy", "vivāna", "Full of life", ""],
  ["Yamini", "girl", "yāminī", "Night", ""],
  ["Yash", "boy", "yaśas", "Fame, glory", ""],
  ["Yogesh", "boy", "yogeśa", "Lord of yoga", "Shiva"],
];

export const NAMES = ROWS.map(([name, gender, root, meaning, deity]) => ({
  name,
  gender,
  root,
  meaning,
  deity,
  initial: name.charAt(0).toUpperCase(),
}));

/** Every deity or figure referenced, sorted. */
export const DEITIES = Array.from(
  new Set(NAMES.map((n) => n.deity).filter(Boolean)),
).sort();

/** Nakshatra names, for a dropdown. */
export const NAKSHATRAS = NAKSHATRA_PADAS.map(([name]) => name);

/**
 * Syllables suggested for a nakshatra, optionally narrowed to one pada.
 *
 * @param {string} nakshatra  a name from NAKSHATRAS
 * @param {number|string} pada  1-4, or "any" for all four
 * @returns {{syllables: string[], nakshatra: string, pada: string}|{error: string}}
 */
export function syllablesFor(nakshatra, pada = "any") {
  const row = NAKSHATRA_PADAS.find(([name]) => name === nakshatra);
  if (!row) return { error: "Choose a nakshatra from the list." };
  const [name, syllables] = row;

  if (pada === "any" || pada === "" || pada === null || pada === undefined) {
    return { syllables: syllables.slice(), nakshatra: name, pada: "All four padas" };
  }

  const index = Math.floor(Number(pada));
  if (!Number.isFinite(index) || index < 1 || index > PADA_COUNT) {
    return { error: `Pada must be 1 to ${PADA_COUNT}, or left as all four.` };
  }
  return { syllables: [syllables[index - 1]], nakshatra: name, pada: `Pada ${index}` };
}

/**
 * Find Hindu names.
 *
 * Matching by syllable is done on the romanised spelling, so "Chu" matches
 * Chudamani but not a Devanagari spelling; treat it as a starting point.
 *
 * @param {object} options
 * @param {string} [options.mode]      "letter" | "nakshatra"
 * @param {string} [options.letter]    a single letter, or "any"
 * @param {string} [options.nakshatra] required when mode is "nakshatra"
 * @param {number|string} [options.pada]
 * @param {string} [options.gender]    "any" | "boy" | "girl"
 * @param {string} [options.deity]     an exact deity, or "any"
 * @param {string} [options.meaning]   substring of the meaning
 * @returns {{names: object[], matched: number, total: number, syllables: string[], padaLabel: string}|{error: string}}
 */
export function findNames({
  mode = "letter",
  letter = "any",
  nakshatra = "",
  pada = "any",
  gender = "any",
  deity = "any",
  meaning = "",
} = {}) {
  if (mode !== "letter" && mode !== "nakshatra") {
    return { error: "Choose whether to search by letter or by nakshatra." };
  }
  if (gender !== "any" && !GENDERS.some((g) => g.id === gender)) {
    return { error: "Choose a valid gender option." };
  }

  let syllables = [];
  let padaLabel = "";

  if (mode === "nakshatra") {
    const found = syllablesFor(nakshatra, pada);
    if (found.error) return { error: found.error };
    syllables = found.syllables;
    padaLabel = found.pada;
  }

  const wantedLetter = typeof letter === "string" ? letter.trim().toUpperCase() : "";
  const useLetter = mode === "letter" && wantedLetter.length === 1 && /^[A-Z]$/.test(wantedLetter);
  if (mode === "letter" && wantedLetter && wantedLetter !== "ANY" && !useLetter) {
    return { error: "Pick a single letter from A to Z." };
  }

  const needle = typeof meaning === "string" ? meaning.trim().toLowerCase() : "";
  const lowerSyllables = syllables.map((s) => s.toLowerCase());

  const names = NAMES.filter((entry) => {
    if (useLetter && entry.initial !== wantedLetter) return false;
    if (mode === "nakshatra") {
      const lower = entry.name.toLowerCase();
      if (!lowerSyllables.some((s) => lower.startsWith(s))) return false;
    }
    if (gender !== "any" && entry.gender !== gender) return false;
    if (deity !== "any" && entry.deity !== deity) return false;
    if (needle && !entry.meaning.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    names,
    matched: names.length,
    total: NAMES.length,
    syllables,
    padaLabel,
  };
}
