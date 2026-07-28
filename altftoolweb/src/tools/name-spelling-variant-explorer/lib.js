/**
 * Roman spelling variants of Indian names.
 *
 * Indian names have no single official romanisation, so the same name appears in
 * several spellings on passports, degree certificates and bank records. Each rule
 * below is a real, documented alternation between two ways of writing the same
 * sound. Variants are generated breadth-first, one substitution at a time, so the
 * spellings that differ from your input by a single swap come first.
 */

/** Bounds on the input name. */
export const MIN_NAME_LETTERS = 2;
export const MAX_NAME_LETTERS = 20;
/** How many substitutions deep the search may go. */
export const MIN_DEPTH = 1;
export const MAX_DEPTH = 3;
/** Hard cap on generated spellings, so a long name cannot produce thousands. */
export const MAX_VARIANTS = 60;

/**
 * Each rule is a pair of interchangeable spellings for one sound.
 * Both directions are tried, one occurrence at a time.
 */
export const VARIANT_RULES = [
  { id: "long-a", a: "aa", b: "a", note: "A long a is written aa or a — Aarav and Arav are the same name." },
  { id: "long-i", a: "ee", b: "i", note: "A long i is written ee or i — Meera and Mira, Ravee and Ravi." },
  { id: "long-i-ea", a: "ee", b: "ea", note: "Some records use ea for the same long i — Meera and Meara." },
  { id: "long-u", a: "oo", b: "u", note: "A long u is written oo or u — Anoop and Anup." },
  { id: "ksha", a: "ksh", b: "x", note: "The ksh cluster is often shortened to x — Lakshmi and Laxmi." },
  { id: "sha", a: "sh", b: "s", note: "Tamil and older South Indian records write sh as s — Shashi and Sasi." },
  { id: "aspirate-k", a: "kh", b: "k", note: "Aspirated k loses its h in casual spelling — Nikhil and Nikil." },
  { id: "aspirate-g", a: "gh", b: "g", note: "Aspirated g loses its h — Meghna and Megna." },
  { id: "aspirate-b", a: "bh", b: "b", note: "Aspirated b loses its h — Bhavya and Bavya." },
  { id: "aspirate-d", a: "dh", b: "d", note: "Aspirated d loses its h — Sudhir and Sudir." },
  { id: "aspirate-t", a: "th", b: "t", note: "Aspirated t loses its h — Parth and Part, Sneha spellings vary the same way." },
  { id: "aspirate-p", a: "ph", b: "f", note: "ph and f record the same sound in Persian-derived names — Phiroz and Firoz." },
  { id: "semivowel-y", a: "y", b: "i", note: "y and i both write the same glide — Priya and Pria, Satya and Satia." },
  { id: "v-w", a: "v", b: "w", note: "v and w are interchanged in many older records — Vinod and Winod." },
  { id: "v-b", a: "v", b: "b", note: "Bengali and Odia write v as b — Vijay and Bijoy, Vishnu and Bishnu." },
  { id: "ri-ru", a: "ri", b: "ru", note: "Marathi and Odia render the vowel ri as ru — Krishna and Krushna." },
  { id: "z-j", a: "z", b: "j", note: "Persian and Urdu z appears as j in older Indian records — Zafar and Jafar." },
  { id: "ai-ay", a: "ai", b: "ay", note: "The diphthong is written ai or ay — Jai and Jay." },
  { id: "au-ou", a: "au", b: "ou", note: "The diphthong is written au or ou — Gaurav and Gourav." },
  // Reduction only: real records drop a doubled consonant far more often than they add one.
  { id: "double-d", a: "dd", b: "d", oneWay: true, note: "Doubled consonants are often reduced — Riddhi and Ridhi." },
  { id: "double-t", a: "tt", b: "t", oneWay: true, note: "Doubled consonants are often reduced — Chittra and Chitra." },
  { id: "double-n", a: "nn", b: "n", oneWay: true, note: "Doubled consonants are often reduced — Kannan and Kanan." },
  { id: "double-l", a: "ll", b: "l", oneWay: true, note: "Doubled consonants are often reduced — Malli and Mali." },
  { id: "double-s", a: "ss", b: "s", oneWay: true, note: "Doubled consonants are often reduced — Prassad and Prasad." },
];

/** The trailing schwa is written or dropped depending on the tradition. */
export const FINAL_A_RULE = {
  id: "final-a",
  note: "The final short a is written in Sanskritic spellings and dropped in Hindi ones — Rama and Ram.",
};

/**
 * Steps used to reduce any spelling to one canonical key, so two spellings of the
 * same name compare equal. Deliberately conservative: only alternations that
 * cannot merge two genuinely different names are applied.
 */
export const CANONICAL_STEPS = [
  [/ksh/g, "x", "ksh and x are one cluster"],
  [/ph/g, "f", "ph and f are one sound"],
  [/(kh|gh|bh|dh|th|jh)/g, (match) => match[0], "drop the h that marks aspiration"],
  [/ee|ea/g, "i", "long i spellings"],
  [/oo|uu/g, "u", "long u spellings"],
  [/aa/g, "a", "long a spellings"],
  [/sh/g, "s", "sh and s"],
  [/y/g, "i", "y as a vowel"],
  [/w/g, "v", "w and v"],
  [/ay/g, "ai", "ay and ai"],
  [/ou/g, "au", "ou and au"],
  // Doubled letters collapse last, so the long-vowel rules above see them first.
  [/([a-z])\1/g, "$1", "collapse doubled letters"],
  [/a$/g, "", "final short a"],
];

/** Strip to lowercase letters only. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function capitalise(word) {
  return word ? word[0].toUpperCase() + word.slice(1) : "";
}

/** Reduce a spelling to the key shared by all its variants. */
export function canonicalKey(name) {
  let key = normaliseName(name);
  CANONICAL_STEPS.forEach(([pattern, replacement]) => {
    key = key.replace(pattern, replacement);
  });
  return key;
}

/** Every one-substitution neighbour of a spelling, with the rule that produced each. */
export function neighbours(word) {
  const results = [];
  const push = (spelling, rule, description) => {
    if (spelling && spelling !== word) results.push({ spelling, rule, description });
  };

  VARIANT_RULES.forEach((rule) => {
    const directions = rule.oneWay ? [[rule.a, rule.b]] : [[rule.a, rule.b], [rule.b, rule.a]];
    directions.forEach(([from, to]) => {
      let index = word.indexOf(from);
      while (index !== -1) {
        push(
          word.slice(0, index) + to + word.slice(index + from.length),
          rule.id,
          `${from} → ${to}`,
        );
        index = word.indexOf(from, index + 1);
      }
    });
  });

  if (word.endsWith("a")) push(word.slice(0, -1), FINAL_A_RULE.id, "drop the final a");
  else if (!"aeiou".includes(word.slice(-1))) push(`${word}a`, FINAL_A_RULE.id, "add the final a");

  return results.filter((entry) => isPlausibleSpelling(entry.spelling));
}

/**
 * Reject strings no romanisation actually produces: three identical letters in a
 * row, a doubled h, or an h sandwiched between two consonants.
 */
export function isPlausibleSpelling(spelling) {
  if (/([a-z])\1\1/.test(spelling)) return false;
  if (/hh/.test(spelling)) return false;
  if (/h[bcdfgjklmnpqrstvwxz]h/.test(spelling)) return false;
  return true;
}

/**
 * Breadth-first search over spelling variants.
 * Returns { error } when the name is too short, too long or not alphabetic.
 */
export function exploreVariants({ name = "", maxDepth = 2 } = {}) {
  const start = normaliseName(name);
  if (!start) return { error: "Enter a name using letters." };
  if (start.length < MIN_NAME_LETTERS) {
    return { error: `A name needs at least ${MIN_NAME_LETTERS} letters.` };
  }
  if (start.length > MAX_NAME_LETTERS) {
    return { error: `Keep the name to ${MAX_NAME_LETTERS} letters or fewer.` };
  }

  const depth = Number(maxDepth);
  if (!Number.isInteger(depth) || depth < MIN_DEPTH || depth > MAX_DEPTH) {
    return { error: `Search depth must be between ${MIN_DEPTH} and ${MAX_DEPTH}.` };
  }

  const seen = new Map([[start, { spelling: start, depth: 0, rules: [], steps: [] }]]);
  let frontier = [start];
  let truncated = false;

  for (let level = 1; level <= depth && !truncated; level += 1) {
    const nextFrontier = [];
    for (const word of frontier) {
      const parent = seen.get(word);
      for (const move of neighbours(word)) {
        if (seen.has(move.spelling)) continue;
        if (move.spelling.length < MIN_NAME_LETTERS || move.spelling.length > MAX_NAME_LETTERS + 4) continue;
        seen.set(move.spelling, {
          spelling: move.spelling,
          depth: level,
          rules: [...parent.rules, move.rule],
          steps: [...parent.steps, move.description],
        });
        nextFrontier.push(move.spelling);
        if (seen.size > MAX_VARIANTS) {
          truncated = true;
          break;
        }
      }
      if (truncated) break;
    }
    frontier = nextFrontier;
  }

  const variants = Array.from(seen.values())
    .filter((entry) => entry.depth > 0)
    .sort((a, b) => a.depth - b.depth || a.spelling.localeCompare(b.spelling))
    .map((entry) => ({
      ...entry,
      display: capitalise(entry.spelling),
      letters: entry.spelling.length,
    }));

  const rulesUsed = new Set();
  variants.forEach((entry) => entry.rules.forEach((rule) => rulesUsed.add(rule)));

  return {
    original: capitalise(start),
    canonical: canonicalKey(start),
    variants,
    total: variants.length,
    truncated,
    depth,
    oneStep: variants.filter((entry) => entry.depth === 1).length,
    rulesApplied: VARIANT_RULES.filter((rule) => rulesUsed.has(rule.id)).concat(
      rulesUsed.has(FINAL_A_RULE.id) ? [{ ...FINAL_A_RULE, a: "…a", b: "…" }] : [],
    ),
  };
}

/**
 * Are two spellings the same name?
 * Returns { error } when either side is missing or non-alphabetic.
 */
export function sameName(first, second) {
  const a = normaliseName(first);
  const b = normaliseName(second);
  if (!a || !b) return { error: "Enter two spellings to compare them." };
  if (a.length > MAX_NAME_LETTERS || b.length > MAX_NAME_LETTERS) {
    return { error: `Keep each spelling to ${MAX_NAME_LETTERS} letters or fewer.` };
  }
  const keyA = canonicalKey(a);
  const keyB = canonicalKey(b);
  return {
    same: keyA === keyB,
    identical: a === b,
    keyA,
    keyB,
    first: capitalise(a),
    second: capitalise(b),
  };
}
