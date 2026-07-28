/**
 * Sibling name matching.
 *
 * A sibset works when the names sit in the same register — same cultural source,
 * similar rhythm, similar length — while still being easy to tell apart. The score
 * below is a transparent 100-point rubric over exactly those factors.
 */

/** Same cultural source keeps a sibset coherent; weighted highest. */
export const POINTS_SAME_ORIGIN = 25;
/** Equal syllable count is what makes two names sound like they belong together. */
export const POINTS_SYLLABLE_MATCH = 20;
/** Names distinct enough not to be confused across a room. */
export const POINTS_DISTINCT = 20;
/** Same final letter is a softer echo than a full rhyme. */
export const POINTS_SAME_ENDING = 15;
/** Same starting letter — a bonus, not a requirement, for a sibset. */
export const POINTS_SAME_INITIAL = 10;
/** Similar written length keeps the pair even on a form or a door. */
export const POINTS_LENGTH_BALANCE = 10;

/** Letter counts may differ by this much and still earn the balance points. */
export const LENGTH_BALANCE_TOLERANCE = 2;
/** Above this normalised similarity the names will be confused; distinctness scores zero. */
export const SIMILARITY_CONFUSING = 0.8;
/** Between this and SIMILARITY_CONFUSING the pair earns half the distinctness points. */
export const SIMILARITY_CLOSE = 0.6;

/** Longest sibling name string accepted. */
export const MAX_NAME_INPUT = 30;
/** Suggestion list bounds. */
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 50;
export const DEFAULT_LIMIT = 12;

export const MATCH_STYLES = ["any", "same-initial", "different-initial", "same-origin"];

export const NAME_LIBRARY = [
  // ---- Sanskrit, boys ----
  { name: "Aarav", gender: "boy", origin: "Sanskrit", meaning: "Peaceful, calm" },
  { name: "Advait", gender: "boy", origin: "Sanskrit", meaning: "Non-dual, one without a second" },
  { name: "Aditya", gender: "boy", origin: "Sanskrit", meaning: "The sun" },
  { name: "Akash", gender: "boy", origin: "Sanskrit", meaning: "Sky, open space" },
  { name: "Anand", gender: "boy", origin: "Sanskrit", meaning: "Bliss, deep joy" },
  { name: "Ansh", gender: "boy", origin: "Sanskrit", meaning: "Portion, part of a whole" },
  { name: "Arjun", gender: "boy", origin: "Sanskrit", meaning: "Bright, clear, white" },
  { name: "Arnav", gender: "boy", origin: "Sanskrit", meaning: "Ocean" },
  { name: "Aryan", gender: "boy", origin: "Sanskrit", meaning: "Noble" },
  { name: "Atharv", gender: "boy", origin: "Sanskrit", meaning: "Name of the fourth Veda" },
  { name: "Dev", gender: "boy", origin: "Sanskrit", meaning: "God, divine being" },
  { name: "Dhruv", gender: "boy", origin: "Sanskrit", meaning: "The pole star; constant" },
  { name: "Gaurav", gender: "boy", origin: "Sanskrit", meaning: "Pride, honour" },
  { name: "Harsh", gender: "boy", origin: "Sanskrit", meaning: "Joy, delight" },
  { name: "Ishaan", gender: "boy", origin: "Sanskrit", meaning: "The sun; lord of the north-east" },
  { name: "Kartik", gender: "boy", origin: "Sanskrit", meaning: "Named for the month Kartika" },
  { name: "Laksh", gender: "boy", origin: "Sanskrit", meaning: "Aim, target" },
  { name: "Madhav", gender: "boy", origin: "Sanskrit", meaning: "Of the springtime; Krishna" },
  { name: "Manav", gender: "boy", origin: "Sanskrit", meaning: "Human being" },
  { name: "Mihir", gender: "boy", origin: "Sanskrit", meaning: "The sun" },
  { name: "Neel", gender: "boy", origin: "Sanskrit", meaning: "Blue, sapphire" },
  { name: "Nikhil", gender: "boy", origin: "Sanskrit", meaning: "Complete, whole" },
  { name: "Pranav", gender: "boy", origin: "Sanskrit", meaning: "The syllable Om" },
  { name: "Reyansh", gender: "boy", origin: "Sanskrit", meaning: "Ray of light" },
  { name: "Rishi", gender: "boy", origin: "Sanskrit", meaning: "Sage, seer" },
  { name: "Rohan", gender: "boy", origin: "Sanskrit", meaning: "Ascending, growing" },
  { name: "Rudra", gender: "boy", origin: "Sanskrit", meaning: "The fierce one; Shiva" },
  { name: "Sarthak", gender: "boy", origin: "Sanskrit", meaning: "Meaningful, worthwhile" },
  { name: "Shaurya", gender: "boy", origin: "Sanskrit", meaning: "Valour, bravery" },
  { name: "Shiv", gender: "boy", origin: "Sanskrit", meaning: "Auspicious" },
  { name: "Tanay", gender: "boy", origin: "Sanskrit", meaning: "Son" },
  { name: "Tejas", gender: "boy", origin: "Sanskrit", meaning: "Radiance, brilliance" },
  { name: "Ved", gender: "boy", origin: "Sanskrit", meaning: "Knowledge, sacred text" },
  { name: "Vihaan", gender: "boy", origin: "Sanskrit", meaning: "Dawn, first light" },
  { name: "Vivaan", gender: "boy", origin: "Sanskrit", meaning: "Full of life" },
  { name: "Yash", gender: "boy", origin: "Sanskrit", meaning: "Fame, glory" },
  { name: "Yuvan", gender: "boy", origin: "Sanskrit", meaning: "Youthful, healthy" },

  // ---- Sanskrit, girls ----
  { name: "Aadya", gender: "girl", origin: "Sanskrit", meaning: "The first; the beginning" },
  { name: "Aanya", gender: "girl", origin: "Sanskrit", meaning: "Inexhaustible" },
  { name: "Aarohi", gender: "girl", origin: "Sanskrit", meaning: "The ascending musical scale" },
  { name: "Ahana", gender: "girl", origin: "Sanskrit", meaning: "Inner light; dawn" },
  { name: "Amara", gender: "girl", origin: "Sanskrit", meaning: "Immortal, undying" },
  { name: "Ananya", gender: "girl", origin: "Sanskrit", meaning: "Unlike any other" },
  { name: "Anika", gender: "girl", origin: "Sanskrit", meaning: "Grace, brilliance" },
  { name: "Anjali", gender: "girl", origin: "Sanskrit", meaning: "Offering with joined palms" },
  { name: "Anvi", gender: "girl", origin: "Sanskrit", meaning: "One of the earth" },
  { name: "Avani", gender: "girl", origin: "Sanskrit", meaning: "The earth" },
  { name: "Bhavya", gender: "girl", origin: "Sanskrit", meaning: "Grand, splendid" },
  { name: "Charvi", gender: "girl", origin: "Sanskrit", meaning: "Beautiful" },
  { name: "Diya", gender: "girl", origin: "Sanskrit", meaning: "Lamp" },
  { name: "Esha", gender: "girl", origin: "Sanskrit", meaning: "Desire, wish" },
  { name: "Gauri", gender: "girl", origin: "Sanskrit", meaning: "Fair one; Parvati" },
  { name: "Ira", gender: "girl", origin: "Sanskrit", meaning: "The earth; Saraswati" },
  { name: "Isha", gender: "girl", origin: "Sanskrit", meaning: "Goddess, ruler" },
  { name: "Ishita", gender: "girl", origin: "Sanskrit", meaning: "Mastery, greatness" },
  { name: "Kavya", gender: "girl", origin: "Sanskrit", meaning: "Poetry" },
  { name: "Lavanya", gender: "girl", origin: "Sanskrit", meaning: "Grace, beauty" },
  { name: "Maya", gender: "girl", origin: "Sanskrit", meaning: "Illusion; creative power" },
  { name: "Meera", gender: "girl", origin: "Sanskrit", meaning: "Devotee; the saint-poet Meera" },
  { name: "Naina", gender: "girl", origin: "Sanskrit", meaning: "Eyes" },
  { name: "Navya", gender: "girl", origin: "Sanskrit", meaning: "New, young" },
  { name: "Nitya", gender: "girl", origin: "Sanskrit", meaning: "Eternal, constant" },
  { name: "Prisha", gender: "girl", origin: "Sanskrit", meaning: "Beloved, gift of God" },
  { name: "Riya", gender: "girl", origin: "Sanskrit", meaning: "Singer; graceful" },
  { name: "Saanvi", gender: "girl", origin: "Sanskrit", meaning: "An epithet of Lakshmi" },
  { name: "Shreya", gender: "girl", origin: "Sanskrit", meaning: "Auspicious, most excellent" },
  { name: "Tanvi", gender: "girl", origin: "Sanskrit", meaning: "Slender, delicate" },
  { name: "Tara", gender: "girl", origin: "Sanskrit", meaning: "Star" },
  { name: "Trisha", gender: "girl", origin: "Sanskrit", meaning: "Thirst, longing" },
  { name: "Vaani", gender: "girl", origin: "Sanskrit", meaning: "Speech; Saraswati" },
  { name: "Vanya", gender: "girl", origin: "Sanskrit", meaning: "Of the forest" },
  { name: "Yashvi", gender: "girl", origin: "Sanskrit", meaning: "Successful, glorious" },

  // ---- Tamil ----
  { name: "Arun", gender: "boy", origin: "Tamil", meaning: "Dawn, the reddish glow of sunrise" },
  { name: "Ezhil", gender: "unisex", origin: "Tamil", meaning: "Beauty" },
  { name: "Kani", gender: "unisex", origin: "Tamil", meaning: "Fruit; sweetness" },
  { name: "Malar", gender: "girl", origin: "Tamil", meaning: "Flower" },
  { name: "Mathi", gender: "unisex", origin: "Tamil", meaning: "Moon; intellect" },
  { name: "Nila", gender: "girl", origin: "Tamil", meaning: "Moon, moonlight" },
  { name: "Selvan", gender: "boy", origin: "Tamil", meaning: "Wealthy, prosperous one" },
  { name: "Thamarai", gender: "girl", origin: "Tamil", meaning: "Lotus" },
  { name: "Thendral", gender: "girl", origin: "Tamil", meaning: "Gentle southern breeze" },
  { name: "Vetri", gender: "boy", origin: "Tamil", meaning: "Victory" },
  { name: "Amudha", gender: "girl", origin: "Tamil", meaning: "Nectar, ambrosia" },
  { name: "Kavin", gender: "boy", origin: "Tamil", meaning: "Beauty, handsomeness" },

  // ---- Arabic and Urdu ----
  { name: "Aisha", gender: "girl", origin: "Arabic", meaning: "Alive, living" },
  { name: "Aliya", gender: "girl", origin: "Arabic", meaning: "Exalted, sublime" },
  { name: "Amina", gender: "girl", origin: "Arabic", meaning: "Trustworthy, secure" },
  { name: "Ayaan", gender: "boy", origin: "Arabic", meaning: "Gift of God; time, era" },
  { name: "Bilal", gender: "boy", origin: "Arabic", meaning: "Moisture, water" },
  { name: "Farhan", gender: "boy", origin: "Arabic", meaning: "Happy, joyful" },
  { name: "Hamza", gender: "boy", origin: "Arabic", meaning: "Lion; steadfast" },
  { name: "Hana", gender: "girl", origin: "Arabic", meaning: "Happiness, contentment" },
  { name: "Ibrahim", gender: "boy", origin: "Arabic", meaning: "Father of many" },
  { name: "Imran", gender: "boy", origin: "Arabic", meaning: "Prosperity, long life" },
  { name: "Iqra", gender: "girl", origin: "Arabic", meaning: "Read, recite" },
  { name: "Kabir", gender: "boy", origin: "Arabic", meaning: "Great, mighty" },
  { name: "Mariam", gender: "girl", origin: "Arabic", meaning: "The Arabic form of Mary" },
  { name: "Noor", gender: "unisex", origin: "Arabic", meaning: "Light" },
  { name: "Rayyan", gender: "boy", origin: "Arabic", meaning: "A gate of paradise; well-watered" },
  { name: "Rehan", gender: "boy", origin: "Arabic", meaning: "Sweet basil; fragrance" },
  { name: "Saif", gender: "boy", origin: "Arabic", meaning: "Sword" },
  { name: "Sana", gender: "girl", origin: "Arabic", meaning: "Radiance, brilliance" },
  { name: "Yusuf", gender: "boy", origin: "Arabic", meaning: "God increases" },
  { name: "Zain", gender: "boy", origin: "Arabic", meaning: "Beauty, grace" },
  { name: "Zara", gender: "girl", origin: "Arabic", meaning: "Blooming flower" },
  { name: "Zoya", gender: "girl", origin: "Arabic", meaning: "Loving, alive" },

  // ---- Punjabi and Sikh ----
  { name: "Amrit", gender: "unisex", origin: "Punjabi", meaning: "Nectar of immortality" },
  { name: "Arjan", gender: "boy", origin: "Punjabi", meaning: "Earning, acquiring; Guru Arjan" },
  { name: "Ekam", gender: "unisex", origin: "Punjabi", meaning: "One, oneness" },
  { name: "Gurleen", gender: "girl", origin: "Punjabi", meaning: "Absorbed in the Guru" },
  { name: "Harleen", gender: "girl", origin: "Punjabi", meaning: "Absorbed in God" },
  { name: "Jasleen", gender: "girl", origin: "Punjabi", meaning: "Absorbed in praise" },
  { name: "Manpreet", gender: "unisex", origin: "Punjabi", meaning: "Loving mind" },
  { name: "Navjot", gender: "unisex", origin: "Punjabi", meaning: "New light" },
  { name: "Sahib", gender: "boy", origin: "Punjabi", meaning: "Lord, master" },
  { name: "Simran", gender: "girl", origin: "Punjabi", meaning: "Remembrance, meditation" },

  // ---- Hebrew and biblical ----
  { name: "Aaron", gender: "boy", origin: "Hebrew", meaning: "Mountain of strength" },
  { name: "Adam", gender: "boy", origin: "Hebrew", meaning: "Earth, man" },
  { name: "Benjamin", gender: "boy", origin: "Hebrew", meaning: "Son of the right hand" },
  { name: "Daniel", gender: "boy", origin: "Hebrew", meaning: "God is my judge" },
  { name: "David", gender: "boy", origin: "Hebrew", meaning: "Beloved" },
  { name: "Elijah", gender: "boy", origin: "Hebrew", meaning: "The Lord is my God" },
  { name: "Ethan", gender: "boy", origin: "Hebrew", meaning: "Firm, enduring" },
  { name: "Hannah", gender: "girl", origin: "Hebrew", meaning: "Grace, favour" },
  { name: "Isaac", gender: "boy", origin: "Hebrew", meaning: "He will laugh" },
  { name: "Jacob", gender: "boy", origin: "Hebrew", meaning: "Supplanter, one who follows" },
  { name: "Leah", gender: "girl", origin: "Hebrew", meaning: "Weary; delicate" },
  { name: "Miriam", gender: "girl", origin: "Hebrew", meaning: "Wished-for child" },
  { name: "Naomi", gender: "girl", origin: "Hebrew", meaning: "Pleasantness" },
  { name: "Noah", gender: "boy", origin: "Hebrew", meaning: "Rest, comfort" },
  { name: "Rachel", gender: "girl", origin: "Hebrew", meaning: "Ewe, gentle one" },
  { name: "Samuel", gender: "boy", origin: "Hebrew", meaning: "God has heard" },
  { name: "Sarah", gender: "girl", origin: "Hebrew", meaning: "Princess, noblewoman" },
  { name: "Seth", gender: "boy", origin: "Hebrew", meaning: "Appointed, placed" },

  // ---- English ----
  { name: "Amelia", gender: "girl", origin: "English", meaning: "Industrious, striving" },
  { name: "Ava", gender: "girl", origin: "English", meaning: "Life; bird" },
  { name: "Charlotte", gender: "girl", origin: "English", meaning: "Free woman" },
  { name: "Ella", gender: "girl", origin: "English", meaning: "Other, foreign; fairy maiden" },
  { name: "Emma", gender: "girl", origin: "English", meaning: "Whole, universal" },
  { name: "George", gender: "boy", origin: "English", meaning: "Farmer, earth-worker" },
  { name: "Grace", gender: "girl", origin: "English", meaning: "Grace, blessing" },
  { name: "Harper", gender: "girl", origin: "English", meaning: "Harp player" },
  { name: "Henry", gender: "boy", origin: "English", meaning: "Ruler of the household" },
  { name: "Isla", gender: "girl", origin: "English", meaning: "Island; from the river Islay" },
  { name: "Jack", gender: "boy", origin: "English", meaning: "God is gracious" },
  { name: "James", gender: "boy", origin: "English", meaning: "Supplanter" },
  { name: "Lily", gender: "girl", origin: "English", meaning: "The lily flower; purity" },
  { name: "Oliver", gender: "boy", origin: "English", meaning: "Olive tree; peace" },
  { name: "Oscar", gender: "boy", origin: "English", meaning: "Deer lover; divine spear" },
  { name: "Rose", gender: "girl", origin: "English", meaning: "The rose flower" },
  { name: "Ruby", gender: "girl", origin: "English", meaning: "Red gemstone" },
  { name: "William", gender: "boy", origin: "English", meaning: "Resolute protector" },

  // ---- Latin and Greek ----
  { name: "Alexander", gender: "boy", origin: "Latin", meaning: "Defender of people" },
  { name: "Aurora", gender: "girl", origin: "Latin", meaning: "Dawn" },
  { name: "Chloe", gender: "girl", origin: "Latin", meaning: "Green shoot, new growth" },
  { name: "Clara", gender: "girl", origin: "Latin", meaning: "Clear, bright" },
  { name: "Felix", gender: "boy", origin: "Latin", meaning: "Fortunate, happy" },
  { name: "Iris", gender: "girl", origin: "Latin", meaning: "Rainbow" },
  { name: "Julia", gender: "girl", origin: "Latin", meaning: "Youthful" },
  { name: "Leo", gender: "boy", origin: "Latin", meaning: "Lion" },
  { name: "Luna", gender: "girl", origin: "Latin", meaning: "Moon" },
  { name: "Marcus", gender: "boy", origin: "Latin", meaning: "Dedicated to Mars" },
  { name: "Nova", gender: "girl", origin: "Latin", meaning: "New; a new star" },
  { name: "Sophia", gender: "girl", origin: "Latin", meaning: "Wisdom" },
  { name: "Stella", gender: "girl", origin: "Latin", meaning: "Star" },
  { name: "Victor", gender: "boy", origin: "Latin", meaning: "Conqueror" },

  // ---- Persian ----
  { name: "Darius", gender: "boy", origin: "Persian", meaning: "Possessing goodness" },
  { name: "Pari", gender: "girl", origin: "Persian", meaning: "Fairy, winged spirit" },
  { name: "Roshni", gender: "girl", origin: "Persian", meaning: "Light, brightness" },
  { name: "Yasmin", gender: "girl", origin: "Persian", meaning: "Jasmine flower" },
];

/** Strip everything but letters and lowercase. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Vowel clusters as a proxy for spoken syllables. */
export function estimateSyllables(name) {
  const groups = normaliseName(name).match(/[aeiouy]+/g);
  return groups ? groups.length : 0;
}

/** Levenshtein edit distance. */
export function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/** 0 = nothing in common, 1 = identical. */
export function similarity(a, b) {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - editDistance(a, b) / longest;
}

/** Distinct origins present in the library. */
export function availableOrigins() {
  return Array.from(new Set(NAME_LIBRARY.map((entry) => entry.origin))).sort();
}

/** Look a name up in the library, ignoring case and punctuation. */
export function findInLibrary(rawName) {
  const key = normaliseName(rawName);
  return NAME_LIBRARY.find((entry) => normaliseName(entry.name) === key) || null;
}

/**
 * Score one candidate name against a sibling profile, out of 100.
 * `siblingOrigin` may be null when the sibling name is not in the library — the
 * origin factor is then simply not awarded, and the caller says so.
 */
export function scoreAgainstSibling(sibling, candidate) {
  const a = normaliseName(sibling.name);
  const b = normaliseName(candidate.name);

  const sameOrigin = Boolean(sibling.origin) && sibling.origin === candidate.origin;
  const candidateSyllables = estimateSyllables(b);
  const syllableMatch = candidateSyllables === sibling.syllables;
  const sameEnding = a.slice(-1) === b.slice(-1);
  const sameInitial = a[0] === b[0];
  const lengthGap = Math.abs(a.length - b.length);
  const lengthBalanced = lengthGap <= LENGTH_BALANCE_TOLERANCE;
  const closeness = similarity(a, b);

  let distinctPoints = POINTS_DISTINCT;
  if (closeness > SIMILARITY_CONFUSING) distinctPoints = 0;
  else if (closeness > SIMILARITY_CLOSE) distinctPoints = Math.round(POINTS_DISTINCT / 2);

  const reasons = [];
  if (sameOrigin) reasons.push(`same ${candidate.origin} source`);
  if (syllableMatch) reasons.push(`both about ${candidateSyllables} syllable${candidateSyllables === 1 ? "" : "s"}`);
  if (sameEnding) reasons.push(`both end in "${b.slice(-1)}"`);
  if (sameInitial) reasons.push(`both start with "${b[0].toUpperCase()}"`);
  if (lengthBalanced) reasons.push(`${a.length} and ${b.length} letters`);
  if (distinctPoints === 0) reasons.push("too close in spelling to tell apart");

  const score =
    (sameOrigin ? POINTS_SAME_ORIGIN : 0) +
    (syllableMatch ? POINTS_SYLLABLE_MATCH : 0) +
    (sameEnding ? POINTS_SAME_ENDING : 0) +
    (sameInitial ? POINTS_SAME_INITIAL : 0) +
    (lengthBalanced ? POINTS_LENGTH_BALANCE : 0) +
    distinctPoints;

  return {
    ...candidate,
    score,
    syllables: candidateSyllables,
    letters: b.length,
    similarity: closeness,
    confusing: closeness > SIMILARITY_CONFUSING,
    reasons,
  };
}

/**
 * Rank library names against an existing sibling's name.
 * Returns { error } for unusable input.
 */
export function suggestSiblingNames({
  siblingName = "",
  gender = "any",
  style = "any",
  limit = DEFAULT_LIMIT,
} = {}) {
  const raw = String(siblingName);
  const key = normaliseName(raw);

  if (!key) return { error: "Enter the older child's name to find matching sibling names." };
  if (raw.length > MAX_NAME_INPUT) {
    return { error: `The sibling name must be ${MAX_NAME_INPUT} characters or fewer.` };
  }
  if (!["any", "boy", "girl"].includes(gender)) return { error: "Unknown gender filter." };
  if (!MATCH_STYLES.includes(style)) return { error: "Unknown match style." };

  const count = Number(limit);
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < MIN_LIMIT || count > MAX_LIMIT) {
    return { error: `Ask for between ${MIN_LIMIT} and ${MAX_LIMIT} suggestions.` };
  }

  const known = findInLibrary(raw);
  const sibling = {
    name: raw.trim(),
    origin: known ? known.origin : null,
    meaning: known ? known.meaning : null,
    knownName: Boolean(known),
    syllables: estimateSyllables(key),
    letters: key.length,
    initial: key[0].toUpperCase(),
    ending: key.slice(-1),
  };

  if (style === "same-origin" && !sibling.origin) {
    return {
      error:
        "That name is not in the library yet, so we cannot match it by origin. Pick a different match style.",
    };
  }

  const pool = NAME_LIBRARY.filter((entry) => {
    if (normaliseName(entry.name) === key) return false;
    if (gender !== "any" && entry.gender !== gender && entry.gender !== "unisex") return false;
    if (style === "same-initial" && normaliseName(entry.name)[0] !== key[0]) return false;
    if (style === "different-initial" && normaliseName(entry.name)[0] === key[0]) return false;
    if (style === "same-origin" && entry.origin !== sibling.origin) return false;
    return true;
  });

  const scored = pool
    .map((entry) => scoreAgainstSibling(sibling, entry))
    .filter((entry) => !entry.confusing)
    .sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));

  return {
    sibling,
    matches: scored.slice(0, count),
    matched: scored.length,
    libraryTotal: NAME_LIBRARY.length,
    bestScore: scored.length ? scored[0].score : 0,
  };
}
