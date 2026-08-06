import assert from "node:assert/strict";
import test from "node:test";

import {
  POS_BY_KEY,
  bucketOf,
  commonnessBand,
  countSyllables,
  displayWord,
  editDistance,
  indefiniteArticle,
  inflectedForms,
  letterOf,
  normalizePos,
  parseGloss,
  posLabel,
  shortDefinition,
  slugifyWord,
} from "./words.js";

/* ------------------------------------------------------------------ *
 * Parts of speech
 * ------------------------------------------------------------------ */

test("adjective satellites are folded into adjectives", () => {
  // WordNet's `s` is a lexicographer's distinction, not a reader's.
  assert.equal(normalizePos("s"), "a");
  assert.equal(posLabel("s"), "adjective");
  assert.equal(posLabel("n"), "noun");
  assert.equal(posLabel("zzz"), "word", "an unknown tag degrades rather than throwing");
});

test("every part of speech carries the fields the UI reads", () => {
  for (const key of ["n", "v", "a", "r"]) {
    const meta = POS_BY_KEY[key];
    assert.ok(meta.label && meta.abbr && meta.cssVar && meta.blurb, `${key} is complete`);
    assert.ok(meta.cssVar.startsWith("--afl-"), "hues stay in the product namespace");
  }
});

/* ------------------------------------------------------------------ *
 * Slugs
 * ------------------------------------------------------------------ */

test("slugifyWord collapses every separator to one hyphen", () => {
  assert.equal(slugifyWord("serendipity"), "serendipity");
  assert.equal(slugifyWord("united_states"), "united-states");
  assert.equal(slugifyWord("jack-in-the-pulpit"), "jack-in-the-pulpit");
  assert.equal(slugifyWord("St. John's wort"), "st-johns-wort");
  assert.equal(slugifyWord("o'clock"), "oclock");
  assert.equal(slugifyWord("  spaced  out  "), "spaced-out");
  assert.equal(slugifyWord("—dash—"), "dash");
  assert.equal(slugifyWord("!!!"), "", "a slug with no usable characters is empty, not '-'");
});

test("slugifyWord strips curly apostrophes the same as straight ones", () => {
  assert.equal(slugifyWord("o’clock"), slugifyWord("o'clock"));
});

test("displayWord turns WordNet underscores back into spaces", () => {
  assert.equal(displayWord("united_states"), "united states");
  assert.equal(displayWord("cat"), "cat");
});

/* ------------------------------------------------------------------ *
 * Syllables
 * ------------------------------------------------------------------ */

/*
 * The spelling-only counter, used for the ~57% of entries the pronouncing
 * dictionary does not cover. It is a fallback, so the bar is "never absurd"
 * rather than "always right" — but these are the cases it must not get wrong.
 */
const SYLLABLE_COUNTS = [
  ["cat", 1],
  ["make", 1],
  ["baked", 1],
  ["strength", 1],
  ["rhythm", 1],
  ["candle", 2],
  ["wanted", 2],
  ["boxes", 2],
  ["running", 2],
  ["little", 2],
  ["hungry", 2],
  ["open", 2],
  ["table", 2],
  ["algorithm", 3],
  ["curious", 3],
  ["photography", 4],
  ["serendipity", 5],
  ["university", 5],
];

test("countSyllables handles silent e, -ed and -es", () => {
  for (const [word, expected] of SYLLABLE_COUNTS) {
    assert.equal(countSyllables(word), expected, `${word} counted as ${countSyllables(word)}`);
  }
});

test("countSyllables never returns zero for a real word", () => {
  for (const word of ["a", "I", "the", "cat", "rhythm"]) {
    assert.ok(countSyllables(word) >= 1, `${word} has at least one syllable`);
  }
  assert.equal(countSyllables(""), 0, "but an empty string has none");
});

/* ------------------------------------------------------------------ *
 * Glosses
 * ------------------------------------------------------------------ */

test("parseGloss separates the definition from its usage examples", () => {
  const parsed = parseGloss(
    'lasting a very short time; "the ephemeral joys of childhood"; "a passing fancy"',
  );
  assert.equal(parsed.definition, "lasting a very short time");
  assert.deepEqual(parsed.examples, ["the ephemeral joys of childhood", "a passing fancy"]);
});

test("parseGloss leaves a definition with no examples intact", () => {
  const parsed = parseGloss("good luck in making unexpected and fortunate discoveries");
  assert.equal(parsed.definition, "good luck in making unexpected and fortunate discoveries");
  assert.deepEqual(parsed.examples, []);
});

test("parseGloss keeps semicolons that are not example separators", () => {
  // A bare "; " inside the definition must not be mistaken for an example
  // boundary — only '; "' starts one.
  const parsed = parseGloss("a large flightless bird; native to Africa");
  assert.equal(parsed.definition, "a large flightless bird; native to Africa");
  assert.deepEqual(parsed.examples, []);
});

test("parseGloss survives empty and missing input", () => {
  assert.deepEqual(parseGloss(""), { definition: "", examples: [] });
  assert.deepEqual(parseGloss(undefined), { definition: "", examples: [] });
});

test("shortDefinition cuts on a word boundary and leaves no dangling punctuation", () => {
  const long =
    "a precise rule or set of rules specifying how to solve some problem, especially one that a computer can carry out";

  const short = shortDefinition(long, 40);
  assert.ok(short.length <= 41, "stays within the budget plus the ellipsis");
  assert.ok(short.endsWith("…"));
  assert.ok(!/[,;:.\s]…$/.test(short), "no dangling comma before the ellipsis");
  assert.ok(!short.slice(0, -1).endsWith(" "), "no trailing space before the ellipsis");

  assert.equal(shortDefinition("short one", 40), "short one", "short input is returned unchanged");
  assert.equal(shortDefinition("", 40), "");
});

test("indefiniteArticle is derived, not authored", () => {
  assert.equal(indefiniteArticle("noun"), "a");
  assert.equal(indefiniteArticle("adjective"), "an");
  assert.equal(indefiniteArticle("adverb"), "an");
  assert.equal(indefiniteArticle("verb"), "a");
});

/* ------------------------------------------------------------------ *
 * Letters and buckets
 * ------------------------------------------------------------------ */

test("letterOf files anything non-alphabetic under 0", () => {
  assert.equal(letterOf("serendipity"), "s");
  assert.equal(letterOf("Zebra"), "z");
  assert.equal(letterOf("3d-printer"), "0");
  assert.equal(letterOf(""), "0");
});

test("bucketOf uses two characters, escalating to three for dense prefixes", () => {
  const split = new Set(["co", "un"]);

  assert.equal(bucketOf("cat", split), "ca");
  assert.equal(bucketOf("computer", split), "com", "a split prefix goes one deeper");
  assert.equal(bucketOf("under", split), "und");
  assert.equal(bucketOf("zebra", split), "ze");
});

test("bucketOf pads short slugs so every bucket name is a fixed width", () => {
  assert.equal(bucketOf("a", new Set()), "a_");
  assert.equal(bucketOf("an", new Set(["an"])), "an_");
});

test("bucketOf accepts an array as well as a Set", () => {
  // The generator holds a Set, the manifest ships an array; both must work or
  // a word page reads the wrong file and 404s.
  assert.equal(bucketOf("computer", ["co"]), "com");
  assert.equal(bucketOf("computer", new Set(["co"])), "com");
  assert.equal(bucketOf("computer", undefined), "co");
});

test("bucketOf ignores hyphens, so a slug and its bucket cannot disagree", () => {
  assert.equal(bucketOf("x-ray", new Set()), "xr");
});

/* ------------------------------------------------------------------ *
 * Spelling distance
 * ------------------------------------------------------------------ */

test("editDistance counts a transposition as one edit, not two", () => {
  // This is the whole reason for Damerau over plain Levenshtein: "recieve" is
  // one slip of the fingers from "receive", and scoring it 2 ranks the word the
  // reader meant below words they did not.
  assert.equal(editDistance("recieve", "receive"), 1);
  assert.equal(editDistance("teh", "the"), 1);
});

test("editDistance handles insertion, deletion and substitution", () => {
  assert.equal(editDistance("cat", "cat"), 0);
  assert.equal(editDistance("cat", "cats"), 1, "insertion");
  assert.equal(editDistance("cats", "cat"), 1, "deletion");
  assert.equal(editDistance("cat", "cot"), 1, "substitution");
  assert.equal(editDistance("embarass", "embarrass"), 1);
  assert.equal(editDistance("occassion", "occasion"), 1);
});

test("editDistance stops early rather than computing a distance nobody wants", () => {
  // Anything past the budget only has to be reported as "too far", and the
  // early exit is what makes this affordable across a whole letter index.
  assert.ok(editDistance("cat", "elephant", 2) > 2);
  assert.ok(editDistance("aaaa", "bbbb", 2) > 2);
  assert.equal(editDistance("cat", "cart", 0), 1, "over budget by one is reported as max + 1");
});

test("editDistance is symmetric", () => {
  for (const [a, b] of [
    ["seperate", "separate"],
    ["definately", "definitely"],
    ["cat", "cats"],
  ]) {
    assert.equal(editDistance(a, b), editDistance(b, a), `${a} / ${b}`);
  }
});

/* ------------------------------------------------------------------ *
 * Commonness
 * ------------------------------------------------------------------ */

test("commonnessBand maps frequency rank to a band", () => {
  assert.equal(commonnessBand({ frequencyRank: 1 }), 5);
  assert.equal(commonnessBand({ frequencyRank: 2000 }), 5);
  assert.equal(commonnessBand({ frequencyRank: 2001 }), 4);
  assert.equal(commonnessBand({ frequencyRank: 8000 }), 4);
  assert.equal(commonnessBand({ frequencyRank: 25000 }), 3);
  assert.equal(commonnessBand({ frequencyRank: 70000 }), 2);
  assert.equal(commonnessBand({ frequencyRank: 200000 }), 1);
});

test("commonnessBand falls back to polysemy when there is no frequency rank", () => {
  const common = commonnessBand({ senseCount: 20, tagCount: 40, length: 4 });
  const rare = commonnessBand({ senseCount: 1, tagCount: 0, length: 16 });

  assert.ok(common > rare, "a word stretched to many meanings is a common word");
  assert.ok(common >= 1 && common <= 5);
  assert.ok(rare >= 1 && rare <= 5);
});

test("commonnessBand ignores a nonsensical rank rather than trusting it", () => {
  assert.equal(
    commonnessBand({ frequencyRank: 0, senseCount: 1 }),
    commonnessBand({ senseCount: 1 }),
    "rank 0 is not a real rank",
  );
});

/* ------------------------------------------------------------------ *
 * Inflected forms
 * ------------------------------------------------------------------ */

const entry = (overrides) => ({ w: "cat", s: "cat", p: ["n"], c: 4, ns: 1, sy: 1, ...overrides });

test("inflectedForms prefers a recorded irregular over the rule", () => {
  const forms = inflectedForms(entry({ w: "mouse", s: "mouse" }), [{ form: "mice", pos: "n" }]);
  const plural = forms.find((form) => form.label === "plural");

  assert.equal(plural.form, "mice");
  assert.equal(plural.certainty, "irregular");
});

test("inflectedForms marks rule-derived forms so the page can say so", () => {
  const forms = inflectedForms(entry(), []);
  const plural = forms.find((form) => form.label === "plural");

  assert.equal(plural.form, "cats");
  assert.equal(plural.certainty, "regular");
});

test("inflectedForms applies the spelling rules for plurals", () => {
  const plural = (word) =>
    inflectedForms(entry({ w: word, s: word }), []).find((form) => form.label === "plural").form;

  assert.equal(plural("box"), "boxes", "sibilant takes -es");
  assert.equal(plural("baby"), "babies", "consonant + y takes -ies");
  assert.equal(plural("knife"), "knives", "-fe takes -ves");
  assert.equal(plural("hero"), "heroes", "consonant + o takes -es");
  assert.equal(plural("radio"), "radios", "vowel + o just takes -s");
});

test("inflectedForms knows the nouns whose plural does not change", () => {
  const forms = inflectedForms(entry({ w: "sheep", s: "sheep" }), []);
  const plural = forms.find((form) => form.label === "plural");

  // The exception lists only record forms that DIFFER, so an invariant plural
  // is invisible to them and the rule would produce "sheeps".
  assert.equal(plural.form, "sheep");
  assert.equal(plural.certainty, "irregular");
});

test("inflectedForms only offers comparatives for short, primarily-adjectival words", () => {
  const short = inflectedForms(entry({ w: "light", s: "light", p: ["a", "n"], sy: 1 }), []);
  assert.ok(short.some((form) => form.form === "lighter"));
  assert.ok(short.some((form) => form.form === "lightest"));

  // "beautifuller" is a plain error.
  const long = inflectedForms(entry({ w: "beautiful", s: "beautiful", p: ["a"], sy: 3 }), []);
  assert.equal(long.length, 0);

  // "go" is an adjective only incidentally ("all systems go") and takes none.
  const incidental = inflectedForms(entry({ w: "go", s: "go", p: ["v", "n", "a"], sy: 1 }), []);
  assert.ok(!incidental.some((form) => form.form === "goer"));
});

test("inflectedForms labels recorded verb forms by shape", () => {
  const forms = inflectedForms(
    entry({ w: "swim", s: "swim", p: ["v"], sy: 1 }),
    [
      { form: "swam", pos: "v" },
      { form: "swimming", pos: "v" },
    ],
  );

  assert.equal(forms.find((form) => form.form === "swam").label, "past tense or participle");
  assert.equal(forms.find((form) => form.form === "swimming").label, "present participle");
});

test("inflectedForms returns nothing for phrases and non-alphabetic entries", () => {
  assert.deepEqual(inflectedForms(entry({ w: "united states", ph: true }), []), []);
  assert.deepEqual(inflectedForms(entry({ w: "x-ray", s: "x-ray" }), []), []);
  assert.deepEqual(inflectedForms(null, []), []);
});
