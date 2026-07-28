/**
 * Build a pronunciation card for a name.
 *
 * Three separate things are produced, because they solve different problems:
 *  1. Syllable breaks, from a consonant-plus-vowel split of the spelling.
 *  2. A plain-English respelling, using open/closed-syllable vowel rules. This is
 *     an approximation for English readers, not a phonetic transcription — the
 *     card always lets the owner override it with their own respelling.
 *  3. Letter-by-letter spelling in the ICAO/NATO phonetic alphabet, which is the
 *     international standard for spelling a word aloud over a phone line.
 */

/** The ICAO/NATO spelling alphabet, unchanged since the 1956 revision. */
export const NATO_ALPHABET = {
  a: "Alfa",
  b: "Bravo",
  c: "Charlie",
  d: "Delta",
  e: "Echo",
  f: "Foxtrot",
  g: "Golf",
  h: "Hotel",
  i: "India",
  j: "Juliett",
  k: "Kilo",
  l: "Lima",
  m: "Mike",
  n: "November",
  o: "Oscar",
  p: "Papa",
  q: "Quebec",
  r: "Romeo",
  s: "Sierra",
  t: "Tango",
  u: "Uniform",
  v: "Victor",
  w: "Whiskey",
  x: "X-ray",
  y: "Yankee",
  z: "Zulu",
};

/** Longest name string the builder accepts. */
export const MAX_NAME_LENGTH = 40;
/** A respelling adds hyphens and repeated vowels, so it is allowed twice the room. */
export const MAX_RESPELLING_LENGTH = 80;

/** Consonant clusters that carry a single sound, mapped to what an English reader should say. */
export const CONSONANT_SOUNDS = {
  bh: "b",
  ch: "ch",
  dh: "d",
  gh: "g",
  jh: "j",
  kh: "k",
  ph: "f",
  sh: "sh",
  th: "t",
  zh: "zh",
  ng: "ng",
  ny: "ny",
};

/** Vowel spellings that are long wherever they appear. */
export const LONG_VOWELS = {
  aa: "ah",
  ee: "ee",
  ii: "ee",
  oo: "oo",
  uu: "oo",
  ai: "eye",
  au: "ow",
  ei: "ay",
  ou: "oh",
  ia: "ee-uh",
};

/** A single vowel in an open syllable (no consonant closing it). */
export const OPEN_VOWELS = { a: "ah", e: "ay", i: "ee", o: "oh", u: "oo", y: "ee" };
/** The same vowel in a closed syllable is short. */
export const CLOSED_VOWELS = { a: "uh", e: "eh", i: "ih", o: "o", u: "uh", y: "ih" };

/** Spelling patterns English readers reliably get wrong, and what to say about them. */
export const PITFALL_RULES = [
  { pattern: /ph/, note: "\"ph\" is often read as an f — say whether it is an aspirated p or an f sound." },
  { pattern: /th/, note: "\"th\" is often read as in \"think\" — most Indian names use a t with a puff of air instead." },
  { pattern: /ch/, note: "\"ch\" can be read as k, sh or ch depending on the reader's first language." },
  { pattern: /kh|gh|bh|dh|jh/, note: "The h marks aspiration, not a separate sound; the consonant is said with a puff of air." },
  { pattern: /a$/, note: "A final a is a short uh sound, not \"ay\" — it is often dropped entirely by English speakers." },
  { pattern: /^[aeiou]{2}/, note: "The doubled opening vowel is one long sound, not two separate syllables." },
  { pattern: /j/, note: "\"j\" is said as in \"jam\" here; Spanish and German readers may default to an h or y sound." },
  { pattern: /[^aeiouy]{3}/, note: "Three consonants together — say which ones carry a light vowel between them." },
  { pattern: /^x|x/, note: "\"x\" may be read as z at the start of a word and as ks elsewhere." },
];

/** Keep letters, spaces, hyphens and apostrophes; drop everything else. */
export function cleanName(value) {
  return String(value == null ? "" : value)
    .replace(/[^A-Za-z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split one word into "leading consonants + vowel group (+ final consonants)" chunks. */
export function splitSyllables(word) {
  const clean = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [];
  const chunks = clean.match(/[^aeiou]*[aeiou]+/g) || [];
  const consumed = chunks.join("");
  const tail = clean.slice(consumed.length);
  if (!tail) return chunks;
  if (chunks.length === 0) return [tail];
  return [...chunks.slice(0, -1), chunks[chunks.length - 1] + tail];
}

function respellConsonants(cluster) {
  // A doubled consonant is one sound in English respelling, and collapsing it
  // first lets clusters like "ddh" fall through to the "dh" rule below.
  let rest = String(cluster).replace(/([a-z])\1/g, "$1");
  let out = "";
  while (rest.length) {
    const pair = rest.slice(0, 2);
    if (CONSONANT_SOUNDS[pair]) {
      out += CONSONANT_SOUNDS[pair];
      rest = rest.slice(2);
      continue;
    }
    out += rest[0];
    rest = rest.slice(1);
  }
  return out;
}

/** Respell one syllable for an English reader. `wordFinal` marks the last syllable of a word. */
export function respellSyllable(chunk, wordFinal) {
  const match = String(chunk).match(/^([^aeiou]*)([aeiou]*)([^aeiou]*)$/);
  if (!match) return chunk;
  const [, onset, vowels, coda] = match;

  let vowelSound;
  if (!vowels) vowelSound = "";
  else if (LONG_VOWELS[vowels]) vowelSound = LONG_VOWELS[vowels];
  else if (vowels.length > 1) vowelSound = LONG_VOWELS[vowels.slice(0, 2)] || `${OPEN_VOWELS[vowels[0]] || vowels[0]}-${OPEN_VOWELS[vowels[1]] || vowels[1]}`;
  else if (wordFinal && !coda && vowels === "a") vowelSound = "uh";
  else if (coda) vowelSound = CLOSED_VOWELS[vowels] || vowels;
  else vowelSound = OPEN_VOWELS[vowels] || vowels;

  return `${respellConsonants(onset)}${vowelSound}${respellConsonants(coda)}`;
}

/** Spell a name letter by letter in the NATO alphabet. */
export function spellOutNato(name) {
  return cleanName(name)
    .split("")
    .map((character) => {
      const lower = character.toLowerCase();
      if (NATO_ALPHABET[lower]) return NATO_ALPHABET[lower];
      if (character === " ") return "(space)";
      if (character === "-") return "(hyphen)";
      if (character === "'") return "(apostrophe)";
      return character;
    })
    .join(" - ");
}

/** Spelling traps present in this particular name. */
export function detectPitfalls(name) {
  const clean = cleanName(name).toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [];
  return PITFALL_RULES.filter((rule) => rule.pattern.test(clean)).map((rule) => rule.note);
}

/**
 * Build the whole card.
 * Returns { error } when the name is missing, too long, or has no letters.
 */
export function buildPronunciationCard({
  name = "",
  stressIndex = 0,
  customRespelling = "",
  rhymesWith = "",
} = {}) {
  const clean = cleanName(name);
  if (!clean) return { error: "Enter a name using letters, spaces, hyphens or apostrophes." };
  if (clean.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name to ${MAX_NAME_LENGTH} characters or fewer.` };
  }
  if (String(rhymesWith).length > MAX_NAME_LENGTH) {
    return { error: `Keep the "rhymes with" note to ${MAX_NAME_LENGTH} characters or fewer.` };
  }
  if (String(customRespelling).length > MAX_RESPELLING_LENGTH) {
    return { error: `Keep your own respelling to ${MAX_RESPELLING_LENGTH} characters or fewer.` };
  }

  // Hyphenated parts are separate words for syllable purposes.
  const words = clean.split(/[\s-]+/).filter(Boolean);
  const wordSyllables = words.map((word) => splitSyllables(word));
  const flatSyllables = wordSyllables.flat();

  if (flatSyllables.length === 0) {
    return { error: "That name has no letters to break into syllables." };
  }

  const stress = Number(stressIndex);
  if (!Number.isInteger(stress) || stress < 0 || stress >= flatSyllables.length) {
    return {
      error: `Choose a stressed syllable between 1 and ${flatSyllables.length}.`,
    };
  }

  let counter = 0;
  const respelledWords = wordSyllables.map((syllables) =>
    syllables.map((chunk, index) => {
      const piece = respellSyllable(chunk, index === syllables.length - 1);
      const stressed = counter === stress;
      counter += 1;
      return stressed ? piece.toUpperCase() : piece;
    }),
  );

  const autoRespelling = respelledWords.map((pieces) => pieces.join("-")).join(" ");
  const custom = String(customRespelling).trim();

  return {
    name: clean,
    words,
    wordSyllables,
    syllables: flatSyllables,
    syllableCount: flatSyllables.length,
    stressIndex: stress,
    stressedSyllable: flatSyllables[stress],
    autoRespelling,
    respelling: custom || autoRespelling,
    usingCustom: Boolean(custom),
    nato: spellOutNato(clean),
    initials: words.map((word) => word[0].toUpperCase()).join("."),
    letters: clean.replace(/[^A-Za-z]/g, "").length,
    pitfalls: detectPitfalls(clean),
    rhymesWith: String(rhymesWith).trim(),
  };
}

/** The card as shareable plain text, for an email signature or a chat message. */
export function cardToText(card) {
  if (!card || card.error) return "";
  const lines = [
    `How to say ${card.name}`,
    `Say it: ${card.respelling}`,
    `Syllables: ${card.wordSyllables.map((word) => word.join(" · ")).join("   ")}`,
    `Stress on: ${card.stressedSyllable} (syllable ${card.stressIndex + 1} of ${card.syllableCount})`,
  ];
  if (card.rhymesWith) lines.push(`Rhymes with: ${card.rhymesWith}`);
  lines.push(`Spelling it out: ${card.nato}`);
  if (card.pitfalls.length) {
    lines.push("", "Common mistakes:");
    card.pitfalls.forEach((note) => lines.push(`- ${note}`));
  }
  return lines.join("\n");
}
