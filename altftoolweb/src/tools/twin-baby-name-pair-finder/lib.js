/**
 * Twin name pairing: a deterministic compatibility score plus a curated pair library.
 *
 * The score is a transparent 100-point rubric over five phonetic and structural
 * factors. It is a naming-style aid, not a measurement of anything in the world.
 */

/** Same first letter — the alliterative pairing style (Ram & Rohan). */
export const POINTS_SAME_INITIAL = 20;
/** Same final two letters — the rhyming style (Rohan & Mohan). */
export const POINTS_RHYME = 20;
/** Equal syllable counts keep the two names balanced when called together. */
export const POINTS_SYLLABLE_MATCH = 20;
/** Letter counts within one of each other keep the pair visually even. */
export const POINTS_LENGTH_BALANCE = 15;
/** Names distinct enough that they will not be confused day to day. */
export const POINTS_DISTINCT = 25;

/** Letter counts may differ by at most this much to earn the balance points. */
export const LENGTH_BALANCE_TOLERANCE = 1;
/** Above this normalised similarity the pair earns no distinctness points at all. */
export const SIMILARITY_CONFUSING = 0.8;
/** Between this and SIMILARITY_CONFUSING the pair earns half the distinctness points. */
export const SIMILARITY_CLOSE = 0.6;

/** Score bands used for the plain-language verdict. */
export const VERDICT_BANDS = [
  [75, "Strong pair"],
  [55, "Good pair"],
  [35, "Loose pair"],
  [0, "Barely paired"],
];

/** Longest name string the scorer will accept. */
export const MAX_NAME_INPUT = 30;

export const PAIR_STYLES = ["sound", "meaning", "theme"];
export const GENDER_COMBOS = ["boy-boy", "girl-girl", "boy-girl"];

export const TWIN_PAIRS = [
  // boy-boy
  { a: "Ram", b: "Lakshman", combo: "boy-boy", style: "theme", origin: "Sanskrit", why: "The brothers of the Ramayana: 'pleasing' and 'bearing auspicious marks'." },
  { a: "Luv", b: "Kush", combo: "boy-boy", style: "theme", origin: "Sanskrit", why: "The twin sons of Rama and Sita — the best-known twin pair in Indian tradition." },
  { a: "Nakul", b: "Sahadev", combo: "boy-boy", style: "theme", origin: "Sanskrit", why: "The actual twins among the five Pandavas, sons of the Ashvin twins." },
  { a: "Hari", b: "Hara", combo: "boy-boy", style: "theme", origin: "Sanskrit", why: "Epithets of Vishnu and Shiva, paired in the Harihara form." },
  { a: "Aditya", b: "Surya", combo: "boy-boy", style: "meaning", origin: "Sanskrit", why: "Two classical names of the sun." },
  { a: "Ravi", b: "Chandra", combo: "boy-boy", style: "meaning", origin: "Sanskrit", why: "Sun and moon — the pair used for day and night imagery." },
  { a: "Akash", b: "Prithvi", combo: "boy-boy", style: "meaning", origin: "Sanskrit", why: "Sky and earth, two of the five elements." },
  { a: "Jay", b: "Vijay", combo: "boy-boy", style: "meaning", origin: "Sanskrit", why: "Both mean victory; Jaya and Vijaya are Vishnu's gatekeepers." },
  { a: "Rohan", b: "Mohan", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "Perfect rhyme: 'ascending' and 'charming'." },
  { a: "Vihaan", b: "Vivaan", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "Matched V-initial and syllable count: 'dawn' and 'full of life'." },
  { a: "Aarav", b: "Aayan", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "Both open on a long aa: 'peaceful' and 'gift of God'." },
  { a: "Yash", b: "Yuvan", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "Shared Y-initial: 'glory' and 'youthful'." },
  { a: "Dev", b: "Deep", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "Short and matched: 'god' and 'lamp'." },
  { a: "Advait", b: "Advik", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "'Non-dual' and 'unique' — closely matched, so say them aloud first." },
  { a: "Arjun", b: "Karan", combo: "boy-boy", style: "theme", origin: "Sanskrit", why: "The two great archers of the Mahabharata: 'bright' and 'the generous one'." },
  { a: "Jacob", b: "Joshua", combo: "boy-boy", style: "sound", origin: "Hebrew", why: "Shared J-initial: 'supplanter' and 'the Lord is salvation'." },
  { a: "Ethan", b: "Evan", combo: "boy-boy", style: "sound", origin: "Hebrew", why: "'Firm, enduring' and the Welsh form of John, 'God is gracious'." },
  { a: "Oliver", b: "Oscar", combo: "boy-boy", style: "sound", origin: "English", why: "Matched O-initial with different endings, so they stay distinct." },
  { a: "Leo", b: "Felix", combo: "boy-boy", style: "meaning", origin: "Latin", why: "'Lion' and 'fortunate, happy' — two upbeat Latin classics." },
  { a: "Milan", b: "Manan", combo: "boy-boy", style: "sound", origin: "Sanskrit", why: "'Union, meeting' and 'reflection, thought'." },

  // girl-girl
  { a: "Riddhi", b: "Siddhi", combo: "girl-girl", style: "theme", origin: "Sanskrit", why: "Ganesha's two consorts: 'prosperity' and 'accomplishment'." },
  { a: "Ganga", b: "Yamuna", combo: "girl-girl", style: "theme", origin: "Sanskrit", why: "The two rivers that meet at Prayag." },
  { a: "Radha", b: "Meera", combo: "girl-girl", style: "theme", origin: "Sanskrit", why: "The two great devotees of Krishna." },
  { a: "Lakshmi", b: "Saraswati", combo: "girl-girl", style: "theme", origin: "Sanskrit", why: "Wealth and learning — the classic complementary pair." },
  { a: "Usha", b: "Nisha", combo: "girl-girl", style: "meaning", origin: "Sanskrit", why: "Dawn and night, and they rhyme." },
  { a: "Jyoti", b: "Deepti", combo: "girl-girl", style: "meaning", origin: "Sanskrit", why: "'Light' and 'radiance', with matching -ti endings." },
  { a: "Roshni", b: "Chandni", combo: "girl-girl", style: "meaning", origin: "Hindi/Urdu", why: "'Light' and 'moonlight' — rhyming and complementary." },
  { a: "Sneha", b: "Prema", combo: "girl-girl", style: "meaning", origin: "Sanskrit", why: "'Affection' and 'love', two shades of the same idea." },
  { a: "Kavya", b: "Kavita", combo: "girl-girl", style: "meaning", origin: "Sanskrit", why: "'Poetry' and 'a poem' — matched in root and initial." },
  { a: "Nitya", b: "Satya", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "Rhyming -tya endings: 'eternal' and 'truth'." },
  { a: "Ira", b: "Isha", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "Short, I-initial: 'earth, Saraswati' and 'goddess'." },
  { a: "Anika", b: "Anaya", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "Matched three-syllable rhythm: 'grace' and 'caring'." },
  { a: "Zara", b: "Zoya", combo: "girl-girl", style: "sound", origin: "Arabic", why: "Z-initial and two syllables each: 'blooming' and 'loving, alive'." },
  { a: "Aanya", b: "Aarya", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "'Inexhaustible' and 'noble' — very close, so test them aloud." },
  { a: "Emma", b: "Ella", combo: "girl-girl", style: "sound", origin: "English", why: "'Whole, universal' and 'other, foreign' — matched length and rhythm." },
  { a: "Lily", b: "Rose", combo: "girl-girl", style: "theme", origin: "English", why: "Two flower names of the same era and register." },
  { a: "Grace", b: "Faith", combo: "girl-girl", style: "theme", origin: "English", why: "Virtue names, matched in length and single syllable." },
  { a: "Mia", b: "Ava", combo: "girl-girl", style: "sound", origin: "Latin", why: "Three letters, two syllables, different consonants — balanced and distinct." },
  { a: "Amrita", b: "Anjali", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "'Nectar of immortality' and 'offering with joined palms'." },
  { a: "Tara", b: "Trisha", combo: "girl-girl", style: "sound", origin: "Sanskrit", why: "'Star' and 'thirst, desire' — shared T-initial, different shape." },

  // boy-girl
  { a: "Ram", b: "Sita", combo: "boy-girl", style: "theme", origin: "Sanskrit", why: "The central couple of the Ramayana." },
  { a: "Krishna", b: "Radha", combo: "boy-girl", style: "theme", origin: "Sanskrit", why: "The most-invoked devotional pair in Indian tradition." },
  { a: "Shiv", b: "Parvati", combo: "boy-girl", style: "theme", origin: "Sanskrit", why: "'Auspicious' and 'daughter of the mountain'." },
  { a: "Surya", b: "Chandni", combo: "boy-girl", style: "meaning", origin: "Sanskrit", why: "Sun and moonlight." },
  { a: "Arnav", b: "Anvi", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Ocean' and 'one of the earth' — A-initial, different lengths." },
  { a: "Vivaan", b: "Vanya", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Full of life' and 'of the forest'." },
  { a: "Aarav", b: "Aarohi", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Peaceful' and 'the ascending musical scale'." },
  { a: "Ishaan", b: "Ishita", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'The sun, lord of the north-east' and 'mastery, greatness'." },
  { a: "Reyansh", b: "Riya", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Ray of light' and 'singer, graceful'." },
  { a: "Kabir", b: "Kiara", combo: "boy-girl", style: "sound", origin: "Hindi/Urdu", why: "'Great' and 'dark-haired' — K-initial, clearly different endings." },
  { a: "Ayaan", b: "Aisha", combo: "boy-girl", style: "sound", origin: "Arabic", why: "'Gift of God' and 'alive, living'." },
  { a: "Rudra", b: "Riya", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'The fierce one, Shiva' and 'graceful singer'." },
  { a: "Vihaan", b: "Vaani", combo: "boy-girl", style: "meaning", origin: "Sanskrit", why: "'Dawn' and 'speech, Saraswati' — the start of the day and its first word." },
  { a: "Noah", b: "Naomi", combo: "boy-girl", style: "sound", origin: "Hebrew", why: "'Rest, comfort' and 'pleasantness'." },
  { a: "Leo", b: "Luna", combo: "boy-girl", style: "theme", origin: "Latin", why: "'Lion' and 'moon' — a constellation-and-sky pairing." },
  { a: "Ethan", b: "Emma", combo: "boy-girl", style: "sound", origin: "Hebrew", why: "Matched E-initial and two syllables each." },
  { a: "Jack", b: "Jill", combo: "boy-girl", style: "theme", origin: "English", why: "The nursery-rhyme pair; short, matched and instantly recognised." },
  { a: "Aryan", b: "Anika", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Noble' and 'grace' — A-initial with distinct endings." },
  { a: "Neel", b: "Naina", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'Blue, sapphire' and 'eyes'." },
  { a: "Dhruv", b: "Diya", combo: "boy-girl", style: "sound", origin: "Sanskrit", why: "'The pole star, constant' and 'lamp'." },
];

/** Strip everything but letters and lowercase, so spacing and punctuation do not affect the score. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Vowel clusters as a proxy for spoken syllables in a romanised name. */
export function estimateSyllables(name) {
  const groups = normaliseName(name).match(/[aeiouy]+/g);
  return groups ? groups.length : 0;
}

/** Classic Levenshtein edit distance between two normalised strings. */
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

/**
 * Score two names as a twin pair out of 100.
 * Returns { error } when either name is missing, too long or non-alphabetic.
 */
export function scorePair(rawA, rawB) {
  const a = normaliseName(rawA);
  const b = normaliseName(rawB);

  if (!a || !b) return { error: "Enter both names to score the pair." };
  if (String(rawA).length > MAX_NAME_INPUT || String(rawB).length > MAX_NAME_INPUT) {
    return { error: `Each name must be ${MAX_NAME_INPUT} characters or fewer.` };
  }
  if (a === b) return { error: "The two names are the same — enter two different names." };

  const sameInitial = a[0] === b[0];
  const rhymes = a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2);
  const syllablesA = estimateSyllables(a);
  const syllablesB = estimateSyllables(b);
  const syllableMatch = syllablesA === syllablesB;
  const lengthGap = Math.abs(a.length - b.length);
  const lengthBalanced = lengthGap <= LENGTH_BALANCE_TOLERANCE;
  const closeness = similarity(a, b);

  let distinctPoints = POINTS_DISTINCT;
  let distinctNote = "Clearly different names — no day-to-day mix-ups.";
  if (closeness > SIMILARITY_CONFUSING) {
    distinctPoints = 0;
    distinctNote = "Almost the same word — likely to be confused by teachers and relatives.";
  } else if (closeness > SIMILARITY_CLOSE) {
    distinctPoints = Math.round(POINTS_DISTINCT / 2);
    distinctNote = "Quite close in spelling — say them aloud together before deciding.";
  }

  const factors = [
    {
      key: "initial",
      label: "Same starting letter",
      earned: sameInitial ? POINTS_SAME_INITIAL : 0,
      max: POINTS_SAME_INITIAL,
      note: sameInitial
        ? `Both begin with "${a[0].toUpperCase()}" — an alliterative pair.`
        : "Different initials, so the pair reads as complementary rather than matched.",
    },
    {
      key: "rhyme",
      label: "Rhyming ending",
      earned: rhymes ? POINTS_RHYME : 0,
      max: POINTS_RHYME,
      note: rhymes ? `Both end in "-${a.slice(-2)}".` : "Endings differ, which keeps each name its own.",
    },
    {
      key: "syllables",
      label: "Syllable balance",
      earned: syllableMatch ? POINTS_SYLLABLE_MATCH : 0,
      max: POINTS_SYLLABLE_MATCH,
      note: syllableMatch
        ? `Both are about ${syllablesA} syllable${syllablesA === 1 ? "" : "s"}.`
        : `About ${syllablesA} and ${syllablesB} syllables — one name will feel longer when called.`,
    },
    {
      key: "length",
      label: "Length balance",
      earned: lengthBalanced ? POINTS_LENGTH_BALANCE : 0,
      max: POINTS_LENGTH_BALANCE,
      note: lengthBalanced
        ? `${a.length} and ${b.length} letters — visually even on a form or a cake.`
        : `${a.length} and ${b.length} letters — a gap of ${lengthGap}.`,
    },
    {
      key: "distinct",
      label: "Distinctness",
      earned: distinctPoints,
      max: POINTS_DISTINCT,
      note: distinctNote,
    },
  ];

  const score = factors.reduce((sum, factor) => sum + factor.earned, 0);
  const verdict = VERDICT_BANDS.find(([floor]) => score >= floor)[1];

  return {
    score,
    verdict,
    factors,
    similarity: closeness,
    confusing: closeness > SIMILARITY_CONFUSING,
    syllablesA,
    syllablesB,
    nameA: String(rawA).trim(),
    nameB: String(rawB).trim(),
  };
}

/** Filter the curated pair library. Returns { error } for unknown filter values. */
export function filterPairs({ combo = "any", style = "any", origin = "any" } = {}) {
  if (combo !== "any" && !GENDER_COMBOS.includes(combo)) return { error: "Unknown twin combination." };
  if (style !== "any" && !PAIR_STYLES.includes(style)) return { error: "Unknown pairing style." };

  const origins = availableOrigins();
  if (origin !== "any" && !origins.includes(origin)) return { error: "Unknown origin filter." };

  const pairs = TWIN_PAIRS.filter((pair) => {
    if (combo !== "any" && pair.combo !== combo) return false;
    if (style !== "any" && pair.style !== style) return false;
    if (origin !== "any" && pair.origin !== origin) return false;
    return true;
  }).map((pair) => ({ ...pair, score: scorePair(pair.a, pair.b).score }));

  return { pairs, total: pairs.length, libraryTotal: TWIN_PAIRS.length };
}

/** Distinct origins present in the pair library. */
export function availableOrigins() {
  return Array.from(new Set(TWIN_PAIRS.map((pair) => pair.origin))).sort();
}
