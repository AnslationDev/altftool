/**
 * Security Question Answer Generator — deterministic generation and strength maths.
 *
 * Pure module: no React, no DOM, no clock reads, no Math.random() inside the maths.
 * Every draw comes from a seeded PRNG, so the same seed always yields the same answers.
 *
 * Why false answers at all: NIST SP 800-63B (Digital Identity Guidelines, Authentication
 * and Lifecycle Management) states that verifiers SHALL NOT prompt subscribers to use
 * knowledge-based authentication — "what was your first pet" is not a secret, it is a
 * researchable fact. Where a service still forces the question, the accepted mitigation
 * is to treat the answer as a second password and store it in a password manager.
 *
 * Entropy here is measured the standard way, log2 of the number of equally likely
 * outcomes, and it assumes the attacker knows this word list (Kerckhoffs's principle).
 */

/**
 * Alphanumeric charset for the high-entropy style, minus the characters people
 * mis-read or mis-dictate: lowercase l, uppercase I and O, and the digits 0 and 1.
 * 25 lowercase + 24 uppercase + 8 digits = 57 symbols.
 */
export const RANDOM_CHARSET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ADJECTIVES = [
  "amber", "ancient", "brisk", "bronze", "candid", "chalky", "cheerful", "civic",
  "coastal", "copper", "crimson", "curious", "dapper", "distant", "drowsy", "eager",
  "eastern", "electric", "elegant", "faded", "fearless", "flinty", "fluent", "foggy",
  "gentle", "gilded", "glassy", "granite", "hushed", "hazel", "honest", "humble",
  "idle", "ivory", "jagged", "jolly", "keen", "lanky", "lilac", "lucid",
  "marble", "mellow", "mighty", "misty", "modest", "nimble", "northern", "olive",
  "opal", "patient", "polar", "quiet", "rapid", "restless", "rustic", "sable",
  "silver", "solemn", "spry", "stormy", "sunlit", "tidy", "velvet", "wandering",
];

export const NOUNS = [
  "anchor", "atlas", "badger", "beacon", "bellows", "bison", "bramble", "cactus",
  "canyon", "cedar", "chimney", "cinder", "compass", "cottage", "crane", "cricket",
  "dolphin", "domino", "ember", "falcon", "fennel", "ferry", "fiddle", "flint",
  "garland", "glacier", "granary", "harbour", "heron", "hollow", "ibis", "jetty",
  "kettle", "kingfisher", "lantern", "ledger", "lighthouse", "lupin", "magpie", "mallet",
  "marrow", "meadow", "mitten", "monsoon", "nutmeg", "orchard", "otter", "paddle",
  "pantry", "pelican", "pepper", "pewter", "piston", "quarry", "quill", "raven",
  "rhubarb", "saddle", "sextant", "shutter", "sparrow", "spindle", "stirrup", "sycamore",
  "tabby", "tandem", "teapot", "thistle", "thimble", "tulip", "turbine", "typhoon",
  "umbrella", "valley", "walnut", "whistle", "willow", "windmill", "yarrow", "zither",
];

export const PLACES = [
  "Ashfield", "Bellhaven", "Brackenmoor", "Calderby", "Cliffwood", "Dunmarsh",
  "Eastgate", "Fernwick", "Glenholm", "Harrowfen", "Highcombe", "Inglewood",
  "Kirkstead", "Larkmere", "Lowfell", "Marchbank", "Millgate", "Netherby",
  "Oakhurst", "Pinecross", "Quarryhill", "Ravensford", "Redmarsh", "Sandbeck",
  "Selby Row", "Stonegate", "Thornbury", "Uplands", "Vale End", "Westmere",
  "Wyndham", "Yarrowdale",
];

/** Sentence templates. Each one is a separate equally likely outcome, so it adds entropy. */
export const SENTENCE_TEMPLATES = [
  ({ adjective, noun, place }) => `the ${adjective} ${noun} from ${place}`,
  ({ adjective, noun, place }) => `a ${adjective} ${noun} left in ${place}`,
  ({ adjective, noun, place }) => `${place} and the ${adjective} ${noun}`,
  ({ adjective, noun, place }) => `my ${adjective} ${noun}, bought in ${place}`,
];

export const WORD_POOL = [...ADJECTIVES, ...NOUNS, ...PLACES];

export const STYLES = {
  passphrase: {
    id: "passphrase",
    label: "Memorable passphrase",
    hint: "Hyphenated words you can read down a phone line without spelling every letter.",
  },
  sentence: {
    id: "sentence",
    label: "Short false story",
    hint: "Reads like a real answer, so a support agent will not question it.",
  },
  random: {
    id: "random",
    label: "High-entropy string",
    hint: "Strongest option. Only use it where you can paste from a password manager.",
  },
};

export const MIN_WORDS = 2;
export const MAX_WORDS = 8;
export const MIN_LENGTH = 8;
export const MAX_LENGTH = 48;
export const MAX_COUNT = 12;
export const SEED_MAX = 2147483647;

/** Strength bands in bits of entropy. Boundaries are the usual password-strength buckets. */
export const STRENGTH_BANDS = [
  { id: "weak", label: "Weak", max: 30, note: "Fine only for a low-value account with rate limiting." },
  { id: "fair", label: "Fair", max: 45, note: "Comfortably beyond anything an acquaintance could guess." },
  { id: "strong", label: "Strong", max: 60, note: "Resists sustained automated guessing." },
  { id: "very-strong", label: "Very strong", max: Number.POSITIVE_INFINITY, note: "Overkill for a recovery answer, and that is fine." },
];

/**
 * Common security questions and how researchable the true answer is.
 * guessBits is the approximate entropy of an honest answer given a typical answer space —
 * e.g. favourite colour realistically has about a dozen common answers, so ~3.5 bits.
 */
export const COMMON_QUESTIONS = [
  {
    id: "maiden-name",
    text: "What is your mother's maiden name?",
    risk: "critical",
    guessBits: 12,
    why: "Marriage and birth records are public in most countries, and genealogy sites index them.",
  },
  {
    id: "first-school",
    text: "What was the name of your first school?",
    risk: "critical",
    guessBits: 8,
    why: "Usually deducible from your hometown, and often listed on your own social profiles.",
  },
  {
    id: "first-pet",
    text: "What was the name of your first pet?",
    risk: "critical",
    guessBits: 9,
    why: "Pet names are one of the most photographed and captioned things on social media.",
  },
  {
    id: "birth-city",
    text: "In what city were you born?",
    risk: "critical",
    guessBits: 11,
    why: "Appears on public records, professional profiles and most 'about me' pages.",
  },
  {
    id: "street-grew-up",
    text: "What street did you grow up on?",
    risk: "high",
    guessBits: 10,
    why: "Electoral rolls, old address history and data brokers all carry this.",
  },
  {
    id: "first-car",
    text: "What was the make of your first car?",
    risk: "high",
    guessBits: 5,
    why: "There are only a few dozen plausible makes, so it is guessable even without research.",
  },
  {
    id: "favourite-colour",
    text: "What is your favourite colour?",
    risk: "high",
    guessBits: 3.5,
    why: "About a dozen common answers — a guessing script clears the space in seconds.",
  },
  {
    id: "favourite-teacher",
    text: "What was your favourite teacher's name?",
    risk: "medium",
    guessBits: 9,
    why: "Harder to research, but school yearbooks and alumni groups are often public.",
  },
  {
    id: "favourite-film",
    text: "What is your favourite film?",
    risk: "medium",
    guessBits: 7,
    why: "Popularity is heavily skewed, and you have probably posted about it.",
  },
  {
    id: "first-job",
    text: "Where did you work at your first job?",
    risk: "medium",
    guessBits: 8,
    why: "Career profiles list employment history going back years.",
  },
];

export const RISK_LABELS = {
  critical: "Researchable in minutes",
  high: "Easy to find or guess",
  medium: "Findable with effort",
};

/** mulberry32 — small, fast, well-distributed 32-bit PRNG. Deterministic for a given seed. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derive the next seed from the current one. Pure, so the UI never needs its own maths. */
export function nextSeed(seed) {
  const base = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  return (Math.imul(base ^ (base >>> 13), 1103515245) >>> 1) % SEED_MAX || 1;
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

function bandFor(bits) {
  return STRENGTH_BANDS.find((band) => bits < band.max) || STRENGTH_BANDS[STRENGTH_BANDS.length - 1];
}

/** Human-readable count of possible outcomes for a given entropy in bits. */
export function combinationsLabel(bits) {
  if (!Number.isFinite(bits) || bits <= 0) return "1";
  const log10 = (bits * Math.LN2) / Math.LN10;
  if (log10 < 15) {
    return Math.round(Math.pow(10, log10)).toLocaleString("en-US");
  }
  const exponent = Math.floor(log10);
  const mantissa = Math.pow(10, log10 - exponent);
  return `${mantissa.toFixed(1)} x 10^${exponent}`;
}

/**
 * Generate false security-question answers.
 *
 * @param {object} input
 * @param {number} input.seed       any integer; the same seed always gives the same answers
 * @param {string} input.style      one of STYLES
 * @param {number} input.wordCount  words per answer for the passphrase style
 * @param {number} input.length     characters for the random style
 * @param {number} input.count      how many answers to produce
 * @returns {object} { answers, entropyBits, ... } or { error }
 */
export function generateAnswers({ seed, style, wordCount, length, count } = {}) {
  const styleDef = STYLES[style];
  if (!styleDef) return { error: "Choose one of the three answer styles." };

  const seedValue = Number(seed);
  if (!Number.isFinite(seedValue)) return { error: "The seed must be a number." };

  const howMany = Math.trunc(Number(count));
  if (!Number.isFinite(howMany) || howMany < 1) return { error: "Ask for at least one answer." };
  if (howMany > MAX_COUNT) return { error: `Ask for ${MAX_COUNT} answers or fewer at a time.` };

  const words = Math.trunc(Number(wordCount));
  const chars = Math.trunc(Number(length));

  if (style === "passphrase") {
    if (!Number.isFinite(words) || words < MIN_WORDS || words > MAX_WORDS) {
      return { error: `Use between ${MIN_WORDS} and ${MAX_WORDS} words per answer.` };
    }
  }
  if (style === "random") {
    if (!Number.isFinite(chars) || chars < MIN_LENGTH || chars > MAX_LENGTH) {
      return { error: `Use between ${MIN_LENGTH} and ${MAX_LENGTH} characters.` };
    }
  }

  const rng = mulberry32(Math.abs(Math.trunc(seedValue)) + 1);
  const answers = [];
  let entropyBits = 0;
  let recipe = "";

  if (style === "passphrase") {
    entropyBits = words * Math.log2(WORD_POOL.length);
    recipe = `${words} words drawn from a ${WORD_POOL.length}-word list`;
    for (let i = 0; i < howMany; i += 1) {
      const parts = [];
      for (let w = 0; w < words; w += 1) parts.push(pick(rng, WORD_POOL));
      answers.push(parts.join("-"));
    }
  } else if (style === "sentence") {
    entropyBits =
      Math.log2(ADJECTIVES.length) +
      Math.log2(NOUNS.length) +
      Math.log2(PLACES.length) +
      Math.log2(SENTENCE_TEMPLATES.length);
    recipe = `1 adjective (${ADJECTIVES.length}) + 1 noun (${NOUNS.length}) + 1 place (${PLACES.length}) + 1 of ${SENTENCE_TEMPLATES.length} sentence shapes`;
    for (let i = 0; i < howMany; i += 1) {
      const template = pick(rng, SENTENCE_TEMPLATES);
      answers.push(
        template({
          adjective: pick(rng, ADJECTIVES),
          noun: pick(rng, NOUNS),
          place: pick(rng, PLACES),
        }),
      );
    }
  } else {
    entropyBits = chars * Math.log2(RANDOM_CHARSET.length);
    recipe = `${chars} characters from a ${RANDOM_CHARSET.length}-symbol alphabet`;
    for (let i = 0; i < howMany; i += 1) {
      let out = "";
      for (let c = 0; c < chars; c += 1) out += pick(rng, RANDOM_CHARSET);
      answers.push(out);
    }
  }

  const band = bandFor(entropyBits);

  return {
    answers,
    styleId: styleDef.id,
    styleLabel: styleDef.label,
    entropyBits: Math.round(entropyBits * 10) / 10,
    bandId: band.id,
    bandLabel: band.label,
    bandNote: band.note,
    recipe,
    combinations: combinationsLabel(entropyBits),
  };
}

/**
 * How much better is a generated answer than the honest one?
 * @returns {object} { question, honestBits, generatedBits, timesHarder } or { error }
 */
export function compareToHonestAnswer({ questionId, generatedBits } = {}) {
  const question = COMMON_QUESTIONS.find((item) => item.id === questionId);
  if (!question) return { error: "Pick a question from the list." };
  const bits = Number(generatedBits);
  if (!Number.isFinite(bits) || bits <= 0) {
    return { error: "Generate an answer first." };
  }
  const delta = bits - question.guessBits;
  return {
    question,
    honestBits: question.guessBits,
    generatedBits: Math.round(bits * 10) / 10,
    extraBits: Math.round(delta * 10) / 10,
    timesHarder: delta > 0 ? combinationsLabel(delta) : "1",
  };
}
