import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPronunciation,
  primaryStressIndex,
  splitSyllables,
  toIpa,
  toRespelling,
  toSyllables,
} from "./pronounce.js";

/*
 * The pronunciation rules are the part of AltF Lexicon most likely to be wrong
 * and the part a reader notices first, so they are pinned here against real
 * ARPAbet strings from the CMU Pronouncing Dictionary.
 *
 * Where printed dictionaries disagree with each other the expectation follows
 * the majority and says so in a comment — those cases are marked so a future
 * change can tell "we broke it" from "we picked the other convention".
 */

const CMU = {
  serendipity: "S EH2 R AH0 N D IH1 P IH0 T IY0",
  algorithm: "AE1 L G ER0 IH2 DH AH0 M",
  beautiful: "B Y UW1 T AH0 F AH0 L",
  information: "IH2 N F ER0 M EY1 SH AH0 N",
  science: "S AY1 AH0 N S",
  candle: "K AE1 N D AH0 L",
  athlete: "AE1 TH L IY2 T",
  university: "Y UW2 N AH0 V ER1 S AH0 T IY0",
  little: "L IH1 T AH0 L",
  table: "T EY1 B AH0 L",
  hungry: "HH AH1 NG G R IY0",
  boxes: "B AA1 K S AH0 Z",
  running: "R AH1 N IH0 NG",
  quiet: "K W AY1 AH0 T",
  water: "W AO1 T ER0",
  better: "B EH1 T ER0",
  open: "OW1 P AH0 N",
  happy: "HH AE1 P IY0",
  city: "S IH1 T IY0",
  father: "F AA1 DH ER0",
  elephant: "EH1 L AH0 F AH0 N T",
  banana: "B AH0 N AE1 N AH0",
  october: "AA0 K T OW1 B ER0",
  remember: "R IH0 M EH1 M B ER0",
  lexicon: "L EH1 K S IH0 K AA2 N",
  purple: "P ER1 P AH0 L",
  wonderful: "W AH1 N D ER0 F AH0 L",
  light: "L AY1 T",
  eye: "AY1",
  colonel: "K ER1 N AH0 L",
  hmm: "HH M",
};

test("toSyllables splits by maximal onset", () => {
  const syllables = toSyllables(CMU.serendipity);
  assert.equal(syllables.length, 5);

  // "N D" between two vowels: "ND" is not a legal English onset, so N closes
  // the syllable behind it and only D travels forward. Getting this wrong is
  // what produces /ˌsɛɹəˈndɪpɪti/ — a stress mark on an impossible cluster.
  assert.deepEqual(
    syllables.map((syllable) => syllable.phonemes.join(" ")),
    ["S EH2", "R AH0 N", "D IH1", "P IH0", "T IY0"],
  );
});

test("toSyllables treats a stressed lax vowel as closing and an unstressed one as open", () => {
  const [first] = toSyllables(CMU.better);
  assert.equal(first.vowel, "EH");
  assert.equal(first.lax, true, "stressed EH closes its syllable");

  const banana = toSyllables(CMU.banana);
  assert.equal(banana[0].lax, false, "unstressed schwa does not close a syllable");
  assert.equal(banana[1].lax, true, "stressed AE does");
});

test("toSyllables returns nothing for a pronunciation with no vowel", () => {
  assert.deepEqual(toSyllables(CMU.hmm), []);
  assert.deepEqual(toSyllables(""), []);
  assert.deepEqual(toSyllables(undefined), []);
});

test("primaryStressIndex prefers primary, falls back to secondary", () => {
  assert.equal(primaryStressIndex(toSyllables(CMU.serendipity)), 2);
  assert.equal(primaryStressIndex(toSyllables(CMU.happy)), 0);
  assert.equal(primaryStressIndex(toSyllables(CMU.banana)), 1);
});

test("toIpa transcribes with stress marks in the right places", () => {
  assert.equal(toIpa(CMU.serendipity), "ˌsɛɹənˈdɪpɪti");
  assert.equal(toIpa(CMU.beautiful), "ˈbjutəfəl");
  assert.equal(toIpa(CMU.information), "ˌɪnfɚˈmeɪʃən");
  assert.equal(toIpa(CMU.light), "ˈlaɪt");
});

test("toIpa distinguishes the stressed and unstressed forms of ER and AH", () => {
  // ER is ɝ when stressed and ɚ when not; AH is ʌ when stressed and ə when not.
  assert.ok(toIpa(CMU.water).includes("ɚ"), "unstressed ER is ɚ");
  assert.ok(toIpa(CMU.colonel).includes("ɝ"), "stressed ER is ɝ");
  assert.ok(toIpa(CMU.banana).startsWith("bə"), "unstressed AH is ə");
});

test("toRespelling uppercases the stressed syllable and regroups for reading", () => {
  // Regrouped so the respelling agrees with the syllable line: a stressed lax
  // vowel that would otherwise sit open takes its consonant back. Without it
  // this reads "ser-uhn-DI-pi-tee" while the page above says "ser-en-DIP-i-ty".
  assert.equal(toRespelling(CMU.serendipity), "ser-uhn-DIP-i-tee");
  assert.equal(toRespelling(CMU.better), "BET-ur");
  assert.equal(toRespelling(CMU.city), "SIT-ee");
});

test("toRespelling does not over-close a syllable that already has a coda", () => {
  // "algorithm" already ends its first syllable in L. Pulling the G back too
  // gives "ALG-ur-ith-uhm".
  assert.equal(toRespelling(CMU.algorithm), "AL-gur-ith-uhm");
  assert.equal(toRespelling(CMU.information), "in-fur-MAY-shuhn");
});

test("toRespelling writes /aɪ/ as ahy, never eye", () => {
  // "eye" would turn light (L AY T) into "leyet".
  assert.equal(toRespelling(CMU.light), "lahyt");
  assert.equal(toRespelling(CMU.eye), "ahy");
});

test("toRespelling drops the h from eh when a consonant follows in the syllable", () => {
  assert.equal(toRespelling(CMU.lexicon), "LEK-si-kahn");
  assert.equal(toRespelling(CMU.remember), "ri-MEM-bur");
});

/*
 * The spelling-side splitter, against printed hyphenation.
 *
 * `variant: true` marks the four cases where printed dictionaries disagree
 * with each other — Merriam-Webster writes "com·put·er" and "pho·tog·ra·phy"
 * where others write "com·pu·ter" and "pho·to·gra·phy". Those assertions pin
 * OUR convention rather than claiming the other is wrong.
 */
const HYPHENATION = [
  ["serendipity", "ser·en·dip·i·ty"],
  ["algorithm", "al·go·rithm"],
  ["beautiful", "beau·ti·ful"],
  ["information", "in·for·ma·tion"],
  ["science", "sci·ence"],
  ["candle", "can·dle"],
  ["athlete", "ath·lete"],
  ["university", "u·ni·ver·si·ty"],
  ["little", "lit·tle"],
  ["table", "ta·ble"],
  ["hungry", "hun·gry"],
  ["boxes", "box·es"],
  ["running", "run·ning"],
  ["quiet", "qui·et"],
  ["water", "wa·ter"],
  ["better", "bet·ter"],
  ["open", "o·pen"],
  ["happy", "hap·py"],
  ["city", "cit·y"],
  ["father", "fa·ther"],
  ["elephant", "el·e·phant"],
  ["banana", "ba·nan·a"],
  ["october", "oc·to·ber"],
  ["remember", "re·mem·ber"],
  ["lexicon", "lex·i·con"],
  ["purple", "pur·ple"],
  ["wonderful", "won·der·ful"],
];

test("splitSyllables matches printed hyphenation", () => {
  for (const [word, expected] of HYPHENATION) {
    const parts = splitSyllables(word, toSyllables(CMU[word]));
    assert.equal(parts.join("·"), expected, `${word} split as ${parts.join("·")}`);
  }
});

test("splitSyllables honours the -Cle ending", () => {
  // Every printed dictionary takes the preceding consonant into the final
  // syllable: can-dle, lit-tle, ta-ble, pur-ple.
  for (const word of ["candle", "little", "table", "purple"]) {
    const parts = splitSyllables(word, toSyllables(CMU[word]));
    assert.ok(parts[parts.length - 1].endsWith("le"), `${word} -> ${parts.join("·")}`);
    assert.ok(parts[parts.length - 1].length >= 3, `${word} keeps a consonant with the "le"`);
  }
});

test("splitSyllables leaves very short words whole", () => {
  assert.deepEqual(splitSyllables("cat", toSyllables("K AE1 T")), ["cat"]);
  assert.deepEqual(splitSyllables("a", undefined), ["a"]);
});

test("splitSyllables preserves hyphens and spaces in the original", () => {
  const parts = splitSyllables("well-being", toSyllables("W EH1 L B IY1 IH0 NG"));
  assert.equal(parts.join(""), "well-being", "no characters lost or added");
});

test("buildPronunciation reports its source and withholds IPA when guessing", () => {
  const recorded = buildPronunciation("serendipity", CMU.serendipity, "n");
  assert.equal(recorded.src, "cmu");
  assert.equal(recorded.count, 5);
  assert.equal(recorded.stress, 2);
  assert.ok(recorded.ipa);
  assert.ok(recorded.respell);

  const derived = buildPronunciation("abstemiously", undefined, "r");
  assert.equal(derived.src, "derived");
  assert.equal(derived.ipa, undefined, "a guessed transcription is worse than none");
  assert.equal(derived.respell, undefined);
  assert.ok(derived.parts.length > 1, "but the syllable line is still produced");
  assert.equal(typeof derived.stress, "number");
});

test("buildPronunciation returns null when there is nothing to work from", () => {
  assert.equal(buildPronunciation("", undefined, "n"), null);
});

test("buildPronunciation withholds the split when the spelling cannot carry it", () => {
  /*
   * "abc" is three syllables and one written vowel; "acme" is two and one once
   * the silent e is discounted. The count and the transcription are still true
   * — they come from the pronouncing dictionary — but the division is not
   * something the spelling can express, and shipping it anyway produced a
   * one-part syllable line under a "3 syllables" heading with a stress index
   * pointing past the end of the array.
   */
  const abc = buildPronunciation("abc", "EY1 B IY2 S IY2", "n");
  assert.equal(abc.count, 3, "the count comes from the phonemes and stands");
  assert.equal(abc.parts, null, "the split is withheld, not faked");
  assert.equal(abc.stress, null);
  assert.ok(abc.ipa, "the transcription still ships");
  assert.ok(abc.respell);

  const acme = buildPronunciation("acme", "AE1 K M IY0", "n");
  assert.equal(acme.count, 2);
  assert.equal(acme.parts, null);
});

test("buildPronunciation never returns a stress index outside its own parts", () => {
  // The invariant the 67 broken entries violated.
  for (const [word, arpabet] of [
    ["serendipity", "S EH2 R AH0 N D IH1 P IH0 T IY0"],
    ["water", "W AO1 T ER0"],
    ["abc", "EY1 B IY2 S IY2"],
    ["cat", "K AE1 T"],
  ]) {
    const built = buildPronunciation(word, arpabet, "n");
    if (!built?.parts) continue;
    assert.ok(
      built.stress >= 0 && built.stress < built.parts.length,
      `${word}: stress ${built.stress} outside 0..${built.parts.length - 1}`,
    );
    assert.equal(built.parts.length, built.count, `${word}: parts disagree with count`);
  }
});
