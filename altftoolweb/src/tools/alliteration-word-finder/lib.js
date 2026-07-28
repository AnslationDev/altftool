/**
 * Alliteration finder.
 *
 * Alliteration is the repetition of the initial consonant SOUND, not the initial letter, so
 * "phone" alliterates with "fire" and "knight" with "night", while "city" does not alliterate
 * with "cold". This module converts the spelling of a word's onset into phoneme tokens using
 * ordinary English orthography rules, then searches a curated word bank for the same sound.
 *
 * Rules applied (standard English spelling-to-sound conventions):
 *  - Digraphs: ph -> /f/, sh -> /sh/, th -> /th/, ch -> /ch/, gh -> /g/, rh -> /r/, qu -> /kw/,
 *    wh -> /w/ (but /h/ in who, whom, whose, whole).
 *  - Silent-letter onsets: kn-, gn-, pn-, mn- -> /n/; wr- -> /r/; ps- -> /s/.
 *  - Soft c before e, i or y -> /s/; otherwise /k/. Soft g before e, i or y -> /j/, with the
 *    usual hard-g exceptions (get, give, girl, gift, gear, geese, geyser, gecko, gild, gimmick).
 *  - Word-initial x -> /z/ (xylophone), word-initial y -> /y/.
 *  - Irregulars kept in a lookup: one/once -> /w/, honest/hour/heir/honour -> a vowel onset,
 *    use/unicorn/uniform/eulogy -> /y/, choir -> /kw/, chef/chic/chandelier -> /sh/,
 *    chorus/character/chemistry/chrome/chaos -> /k/.
 *  - Vowel-initial words are treated as a single "vowel" onset, which is how vowel alliteration
 *    (also called assonance at the head of a word) is conventionally scanned.
 *
 * Pure module: no DOM, no React, no randomness that is not seeded by an argument.
 */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Hard-g words that break the "g before e/i/y is soft" rule. */
const HARD_G_EXCEPTIONS = new Set([
  "get",
  "gets",
  "getting",
  "give",
  "given",
  "gives",
  "girl",
  "gift",
  "gear",
  "geese",
  "geyser",
  "gecko",
  "gild",
  "gilt",
  "gimmick",
  "giggle",
  "gig",
  "girth",
  "gizmo",
]);

/** ch spelled words that are not /ch/. */
const CH_AS_K = new Set([
  "chorus",
  "choral",
  "character",
  "characters",
  "chemistry",
  "chemical",
  "chrome",
  "chromatic",
  "chaos",
  "chaotic",
  "chord",
  "choreography",
  "christmas",
  "chronicle",
  "chlorine",
  "echo",
]);

const CH_AS_SH = new Set([
  "chef",
  "chic",
  "chandelier",
  "champagne",
  "chalet",
  "charade",
  "chauffeur",
  "chiffon",
  "machine",
]);

/** wh words pronounced with /h/. */
const WH_AS_H = new Set(["who", "whom", "whose", "whole", "wholly", "wholesome", "whoever"]);

/** Words whose spelling hides the real onset. Values are phoneme token arrays. */
const IRREGULAR_ONSETS = {
  one: ["w"],
  once: ["w"],
  honest: ["vowel"],
  honestly: ["vowel"],
  honour: ["vowel"],
  honor: ["vowel"],
  honorary: ["vowel"],
  hour: ["vowel"],
  hourly: ["vowel"],
  heir: ["vowel"],
  heiress: ["vowel"],
  herb: ["vowel"],
  use: ["y"],
  used: ["y"],
  useful: ["y"],
  useless: ["y"],
  user: ["y"],
  unicorn: ["y"],
  uniform: ["y"],
  universe: ["y"],
  university: ["y"],
  unique: ["y"],
  union: ["y"],
  unit: ["y"],
  unite: ["y"],
  united: ["y"],
  utensil: ["y"],
  ukulele: ["y"],
  eulogy: ["y"],
  euphoria: ["y"],
  euro: ["y"],
  eureka: ["y"],
  ewe: ["y"],
  choir: ["kw"],
  colonel: ["k"],
};

/** Human labels for each onset phoneme token. */
export const SOUND_LABELS = {
  b: "/b/ as in bell",
  ch: "/ch/ as in chapel",
  d: "/d/ as in dawn",
  f: "/f/ as in fire, phone",
  g: "/g/ as in garden, ghost",
  h: "/h/ as in harbour, whole",
  j: "/j/ as in jungle, gem",
  k: "/k/ as in castle, kite, chorus",
  kw: "/kw/ as in quiet",
  l: "/l/ as in lantern",
  m: "/m/ as in moon",
  n: "/n/ as in night, knife, gnome",
  p: "/p/ as in path",
  r: "/r/ as in river, write, rhythm",
  s: "/s/ as in sea, city, psalm",
  sh: "/sh/ as in shadow, chef",
  t: "/t/ as in tower",
  th: "/th/ as in thunder",
  v: "/v/ as in valley",
  w: "/w/ as in wind, whale, one",
  y: "/y/ as in yellow, unicorn",
  z: "/z/ as in zenith, xylophone",
  vowel: "vowel onset as in apple, echo, hour",
};

export const PART_OF_SPEECH_LABELS = {
  adj: "Adjectives",
  noun: "Nouns",
  verb: "Verbs",
  adv: "Adverbs",
};

/**
 * Curated word bank. Words are stored as plain spellings; every sound grouping in this tool is
 * derived by running onsetTokens() over these entries, so the bank never hard-codes a sound.
 */
export const WORD_BANK = {
  adj: `bold bright brave bitter bleak brittle blazing
cold clever calm crisp curious crimson crooked keen kindly
silent silver soft subtle sudden solemn steady stormy certain civil sacred scarlet
fierce frail fresh faint fearless fragrant frozen phantom
near new noble numb knotted gnarled
rough restless ripe radiant regal wrinkled
happy hollow hungry hushed hardy humble whole
ancient eager idle open endless empty ashen honest amber icy
useful unique united young yellow
wild weary warm wide wistful
gentle generous gigantic jagged joyful jolly
golden grim green gaunt ghostly grand gleaming
cheerful charming chilly
sharp shy shallow shining sheer
thin thick thirsty thorny thundering
tender tall tired tangled tranquil
dark distant deep dusty daring dizzy
mellow mighty misty mournful marble
pale proud patient placid precious
lonely lush long luminous lively
vivid vast velvet violet
zealous
quiet quick quaint`,
  noun: `bell bridge breeze blossom bear beacon bone brook
castle candle crown cliff canyon comet key kite kitchen cavern chorus character
sea star storm sand cellar city circle psalm science stone stream summit
forest flame feather fountain phone photograph phase pharaoh fern
night nest noise needle knife knee knot knight gnome
river rain ridge rhythm wren wrist wreath wrench road
harbour hill hearth home hawk heron hour heir
apple autumn echo island umbrella oak ivy ember orchard
unicorn uniform universe eulogy yard year yarn yew
wind water willow wave whale wheel whisper one wolf
giant gem giraffe jungle journey jewel judge jasmine
garden glass ghost grove guitar gate gull
chapel chimney cherry child chain chef
shadow shore ship shell shimmer shepherd
thunder thorn thread throne thistle
tower tide temple trail tunnel
dawn dream desert drum door dune
moon mountain meadow mirror morning marsh
path prairie pearl palace pine plain
lantern lake ledge lily light lark
valley violin voice vine village
zenith zephyr zone xylophone
quarry queen quill quest`,
  verb: `build break blaze bind bloom bend
carve climb catch keep kindle crawl
sing sail settle cease circle scatter stumble stand
fall forge flicker fade phrase float
nudge name note knit know kneel gnaw
run rise roam wrap write wrestle wring
hold hunt hover heal hurry
answer enter imagine offer echo argue
use unite yield yearn yawn
wander wait whistle weave whirl
gesture jump join journey judge
gather glide grow guard gaze
chase chant chatter cherish
shatter shiver shine shelter
think thrive throw thank
turn travel tremble touch
dance drift dive dwell
melt march murmur mend
paint pass pour pull
linger leap learn lull
vanish visit vault
zoom
quiver question quit`,
  adv: `boldly briefly barely
calmly quietly quickly
softly silently surely steadily
fiercely faintly freely
nearly nightly
rapidly rarely
hardly happily
eagerly openly
wildly warmly
gently joyfully
gladly gravely
cheerfully
sharply shyly
thoroughly
tenderly truly
deeply dimly
mostly merrily
patiently proudly
lightly lazily
vividly`,
};

const BANK_WORDS = Object.fromEntries(
  Object.entries(WORD_BANK).map(([pos, blob]) => [pos, blob.split(/\s+/).filter(Boolean)]),
);

/** Strip everything that is not a letter and lowercase. */
export function normalizeWord(raw) {
  if (typeof raw !== "string") return "";
  const first = raw.trim().split(/\s+/)[0] || "";
  return first.toLowerCase().replace(/[^a-z]/g, "");
}

function isSoftFollower(letter) {
  return letter === "e" || letter === "i" || letter === "y";
}

/**
 * Convert the onset of a word into phoneme tokens, e.g.
 *   "street" -> ["s", "t", "r"], "phone" -> ["f"], "knight" -> ["n"], "apple" -> ["vowel"].
 * Returns [] for input with no letters.
 */
export function onsetTokens(raw) {
  const word = normalizeWord(raw);
  if (!word) return [];
  if (IRREGULAR_ONSETS[word]) return [...IRREGULAR_ONSETS[word]];

  const tokens = [];
  let i = 0;
  let guard = 0;

  while (i < word.length && guard < 6) {
    guard += 1;
    const a = word[i];
    const b = word[i + 1] || "";
    const pair = a + b;

    if (VOWELS.has(a)) break;
    if (a === "y" && i > 0) break; // y acts as the vowel here, e.g. rhythm

    // Silent-letter onsets only apply at the very start of the word.
    if (i === 0 && (pair === "kn" || pair === "gn" || pair === "pn" || pair === "mn")) {
      tokens.push("n");
      i += 2;
      continue;
    }
    if (i === 0 && pair === "wr") {
      tokens.push("r");
      i += 2;
      continue;
    }
    if (i === 0 && pair === "ps") {
      tokens.push("s");
      i += 2;
      continue;
    }
    if (pair === "ph") {
      tokens.push("f");
      i += 2;
      continue;
    }
    if (pair === "sh") {
      tokens.push("sh");
      i += 2;
      continue;
    }
    if (pair === "th") {
      tokens.push("th");
      i += 2;
      continue;
    }
    if (pair === "gh") {
      tokens.push("g");
      i += 2;
      continue;
    }
    if (pair === "rh") {
      tokens.push("r");
      i += 2;
      continue;
    }
    if (pair === "ch") {
      if (CH_AS_K.has(word)) tokens.push("k");
      else if (CH_AS_SH.has(word)) tokens.push("sh");
      else tokens.push("ch");
      i += 2;
      continue;
    }
    if (pair === "wh") {
      tokens.push(WH_AS_H.has(word) ? "h" : "w");
      i += 2;
      continue;
    }
    if (pair === "qu") {
      tokens.push("kw");
      i += 2;
      continue;
    }
    if (a === "c") {
      // "sc" before e/i/y is a single /s/, as in science; otherwise c is /k/ or soft /s/.
      if (tokens[tokens.length - 1] === "s" && isSoftFollower(b)) {
        i += 1;
        continue;
      }
      tokens.push(isSoftFollower(b) ? "s" : "k");
      i += 1;
      continue;
    }
    if (a === "g") {
      const soft = isSoftFollower(b) && !HARD_G_EXCEPTIONS.has(word);
      tokens.push(soft ? "j" : "g");
      i += 1;
      continue;
    }
    if (a === "x") {
      tokens.push("z");
      i += 1;
      continue;
    }
    if (a === "y") {
      tokens.push("y");
      i += 1;
      continue;
    }
    if (a === "q") {
      tokens.push("kw");
      i += 1;
      continue;
    }
    tokens.push(a);
    i += 1;
  }

  if (tokens.length === 0) tokens.push("vowel");
  return tokens;
}

/** The single sound that carries the alliteration. */
export function initialSound(raw) {
  const tokens = onsetTokens(raw);
  return tokens.length > 0 ? tokens[0] : "";
}

/** The full onset cluster, e.g. "str" for street, used for strict cluster matching. */
export function onsetCluster(raw) {
  return onsetTokens(raw).join("-");
}

/** Do two words alliterate? strict=true also demands an identical onset cluster. */
export function wordsAlliterate(a, b, strict = false) {
  const soundA = initialSound(a);
  const soundB = initialSound(b);
  if (!soundA || !soundB) return false;
  if (soundA !== soundB) return false;
  if (!strict) return true;
  return onsetCluster(a) === onsetCluster(b);
}

/** Default number of matches returned per part of speech. */
export const DEFAULT_LIMIT = 24;

/**
 * Find bank words that alliterate with the seed.
 *
 * @param {object} input
 * @param {string} input.seed             The word to match against.
 * @param {boolean} [input.strict]        Require the same full onset cluster (st- with st-).
 * @param {string[]} [input.partsOfSpeech] Subset of ["adj","noun","verb","adv"].
 * @param {number} [input.limit]          Max words per part of speech.
 * @returns {object} result, or { error }.
 */
export function findAlliterativeWords({
  seed,
  strict = false,
  partsOfSpeech = ["adj", "noun", "verb", "adv"],
  limit = DEFAULT_LIMIT,
} = {}) {
  const word = normalizeWord(seed);
  if (!word) {
    return { error: "Type a word made of letters to find its starting sound." };
  }
  if (word.length > 30) {
    return { error: "That is longer than any English word — check the spelling." };
  }

  const requested = Array.isArray(partsOfSpeech) ? partsOfSpeech : [];
  const active = requested.filter((pos) => BANK_WORDS[pos]);
  if (active.length === 0) {
    return { error: "Pick at least one word type to search." };
  }

  const max = Number(limit);
  if (!Number.isFinite(max) || max < 1) {
    return { error: "The result limit must be at least 1." };
  }

  const sound = initialSound(word);
  const cluster = onsetCluster(word);

  const groups = [];
  let total = 0;
  for (const pos of active) {
    const matches = [];
    for (const candidate of BANK_WORDS[pos]) {
      if (candidate === word) continue;
      if (initialSound(candidate) !== sound) continue;
      if (strict && onsetCluster(candidate) !== cluster) continue;
      matches.push(candidate);
      if (matches.length >= Math.floor(max)) break;
    }
    total += matches.length;
    groups.push({ pos, label: PART_OF_SPEECH_LABELS[pos], words: matches });
  }

  return {
    seed: word,
    sound,
    soundLabel: SOUND_LABELS[sound] || `/${sound}/`,
    cluster,
    clusterLabel: cluster.split("-").join(""),
    strict,
    groups,
    total,
  };
}

const PHRASE_TEMPLATES = [
  ["the", "adj", "noun"],
  ["adj", "noun", "and", "adj2", "noun2"],
  ["verb", "the", "adj", "noun"],
  ["adv", "adj", "noun"],
];

/**
 * Build sample alliterative phrases from a result. `variant` is an integer the caller controls,
 * so the same variant always produces the same phrases.
 */
export function buildPhrases(result, variant = 0) {
  if (!result || result.error) return [];
  const pick = (pos, offset) => {
    const group = result.groups.find((item) => item.pos === pos);
    if (!group || group.words.length === 0) return null;
    const index = Math.abs(Math.floor(variant) + offset) % group.words.length;
    return group.words[index];
  };

  const phrases = [];
  for (let t = 0; t < PHRASE_TEMPLATES.length; t += 1) {
    const template = PHRASE_TEMPLATES[t];
    const parts = [];
    let usable = true;
    for (let s = 0; s < template.length; s += 1) {
      const slot = template[s];
      if (slot === "adj" || slot === "noun" || slot === "verb" || slot === "adv") {
        const word = pick(slot, t * 3 + s);
        if (!word) {
          usable = false;
          break;
        }
        parts.push(word);
      } else if (slot === "adj2" || slot === "noun2") {
        const word = pick(slot.slice(0, -1), t * 5 + s + 1);
        if (!word) {
          usable = false;
          break;
        }
        parts.push(word);
      } else {
        parts.push(slot);
      }
    }
    if (usable) phrases.push(parts.join(" "));
  }
  return phrases;
}
