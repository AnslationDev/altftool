/*
 * AltF Lexicon — pronunciation
 *
 * Turns a CMU Pronouncing Dictionary entry (ARPAbet with stress digits) into
 * the three things a word page shows: IPA, a readable respelling, and the
 * syllable line with its stress mark.
 *
 * All of it runs at build time and is stored in the corpus, so the site ships
 * no pronunciation code and no phoneme tables to the browser. The functions
 * live in @altftool/core rather than in the generator script because they are
 * pure, they are the part most likely to be wrong, and they are therefore the
 * part that has to be unit-testable.
 */

import { countSyllables } from "./words.js";

/* ------------------------------------------------------------------ *
 * ARPAbet
 * ------------------------------------------------------------------ */

/** The 15 ARPAbet vowels. Everything else is a consonant. */
const VOWEL_PHONEMES = new Set([
  "AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER",
  "EY", "IH", "IY", "OW", "OY", "UH", "UW",
]);

/*
 * Lax ("checked") vowels cannot end a syllable in English, so the following
 * consonant is pulled back to close it: BET-ter, HAP-py, BOX-es. Tense
 * ("free") vowels can, so the consonant travels forward: WA-ter, O-pen,
 * TA-ble. This single distinction is what separates dictionary-style
 * hyphenation from the naive vowel-counting every other implementation uses,
 * and CMUdict is what makes it knowable rather than guessable.
 */
const LAX_VOWELS = new Set(["AE", "EH", "IH", "UH", "AH"]);

const ARPA_TO_IPA = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔ", AW: "aʊ", AY: "aɪ",
  B: "b", CH: "tʃ", D: "d", DH: "ð", EH: "ɛ", ER: "ɝ",
  EY: "eɪ", F: "f", G: "ɡ", HH: "h", IH: "ɪ", IY: "i",
  JH: "dʒ", K: "k", L: "l", M: "m", N: "n", NG: "ŋ",
  OW: "oʊ", OY: "ɔɪ", P: "p", R: "ɹ", S: "s", SH: "ʃ",
  T: "t", TH: "θ", UH: "ʊ", UW: "u", V: "v", W: "w",
  Y: "j", Z: "z", ZH: "ʒ",
};

/*
 * Respelling is for readers who do not read IPA, which is most of them. The
 * mapping is deliberately plain English spelling rather than a second notation
 * to learn: "uh" not "ə", "oh" not "oʊ".
 */
/*
 * `AY` is the one that has to be a compromise. "eye" is the clearest rendering
 * of /aɪ/ standing alone, but it turns "light" (L AY T) into "leyet". "ahy" is
 * the convention published dictionaries settled on for exactly this reason —
 * it survives an onset and a coda on either side and cannot be misread as the
 * /eɪ/ of "rain".
 */
const ARPA_TO_RESPELL = {
  AA: "ah", AE: "a", AH: "uh", AO: "aw", AW: "ow", AY: "ahy",
  B: "b", CH: "ch", D: "d", DH: "th", EH: "eh", ER: "ur",
  EY: "ay", F: "f", G: "g", HH: "h", IH: "i", IY: "ee",
  JH: "j", K: "k", L: "l", M: "m", N: "n", NG: "ng",
  OW: "oh", OY: "oy", P: "p", R: "r", S: "s", SH: "sh",
  T: "t", TH: "th", UH: "uu", UW: "oo", V: "v", W: "w",
  Y: "y", Z: "z", ZH: "zh",
};

const stripStress = (phoneme) => phoneme.replace(/\d/g, "");
const stressOf = (phoneme) => {
  const match = phoneme.match(/(\d)$/);
  return match ? Number(match[1]) : -1;
};

/*
 * Consonant clusters that can legally begin an English syllable, as ARPAbet
 * pairs and triples. A single consonant is always a legal onset, so only the
 * multi-phoneme cases need listing.
 */
const LEGAL_PHONEME_ONSETS = new Set([
  "P L", "P R", "P Y", "B L", "B R", "B Y", "T R", "T W", "T Y",
  "D R", "D W", "K L", "K R", "K W", "K Y", "G L", "G R", "G W",
  "F L", "F R", "F Y", "TH R", "TH W", "SH R", "S P", "S T", "S K",
  "S L", "S M", "S N", "S W", "S F", "HH Y", "V Y", "M Y", "N Y", "L Y",
  "S P L", "S P R", "S T R", "S K R", "S K W", "S P Y", "S K Y", "S T Y",
]);

/**
 * Group a phoneme string into syllables by the maximal onset principle.
 *
 * Every consonant run between two vowels is split so the following syllable
 * takes the longest cluster that can legally start an English syllable, and
 * the rest closes the syllable behind it. Getting this wrong is visible
 * immediately: grouping onset-first turns serendipity into /ˌsɛɹəˈndɪpɪti/,
 * with a stress mark on a cluster no English syllable can begin with.
 *
 * Each syllable is `{ phonemes, vowel, stress, lax }`.
 */
export function toSyllables(pronunciation) {
  const phonemes = String(pronunciation || "").trim().split(/\s+/).filter(Boolean);
  if (phonemes.length === 0) return [];

  const vowelPositions = [];
  for (let i = 0; i < phonemes.length; i += 1) {
    if (VOWEL_PHONEMES.has(stripStress(phonemes[i]))) vowelPositions.push(i);
  }
  if (vowelPositions.length === 0) return [];

  // Syllable i spans [start, end); everything before the first vowel is that
  // syllable's onset, everything after the last vowel is the final coda.
  const bounds = [0];
  for (let i = 0; i < vowelPositions.length - 1; i += 1) {
    const runStart = vowelPositions[i] + 1;
    const runEnd = vowelPositions[i + 1];
    const runLength = runEnd - runStart;

    let onsetLength = runLength === 0 ? 0 : 1;
    for (const size of [3, 2]) {
      if (size > runLength) continue;
      const cluster = phonemes
        .slice(runEnd - size, runEnd)
        .map(stripStress)
        .join(" ");
      if (LEGAL_PHONEME_ONSETS.has(cluster)) {
        onsetLength = size;
        break;
      }
    }
    bounds.push(runEnd - onsetLength);
  }
  bounds.push(phonemes.length);

  return vowelPositions.map((vowelAt, i) => {
    const phoneme = phonemes[vowelAt];
    const bare = stripStress(phoneme);
    const stress = stressOf(phoneme);
    return {
      phonemes: phonemes.slice(bounds[i], bounds[i + 1]),
      vowel: bare,
      stress,
      /*
       * A vowel closes its syllable only when it is both lax and stressed:
       * BET-ter, HAP-py, BOX-es. Unstressed vowels reduce to schwa and give
       * the consonant up instead — which is the difference between the correct
       * "ser-en-dip-i-ty" and the wrong "ser-en-dip-it-y".
       */
      lax: stress > 0 && (LAX_VOWELS.has(bare) || bare === "AH"),
    };
  });
}

/** Index of the primary-stressed syllable, or the first secondary, or 0. */
export function primaryStressIndex(syllables) {
  const primary = syllables.findIndex((s) => s.stress === 1);
  if (primary !== -1) return primary;
  const secondary = syllables.findIndex((s) => s.stress === 2);
  return secondary !== -1 ? secondary : 0;
}

/** Broad IPA transcription with stress marks, e.g. /ˌsɛɹənˈdɪpɪti/. */
export function toIpa(pronunciation) {
  const syllables = toSyllables(pronunciation);
  if (syllables.length === 0) return "";

  return syllables
    .map((syllable) => {
      const mark = syllable.stress === 1 ? "ˈ" : syllable.stress === 2 ? "ˌ" : "";
      const body = syllable.phonemes
        .map((phoneme) => {
          const bare = stripStress(phoneme);
          // ER carries its own stress distinction in IPA: ɝ stressed, ɚ not.
          if (bare === "ER") return stressOf(phoneme) > 0 ? "ɝ" : "ɚ";
          if (bare === "AH") return stressOf(phoneme) === 0 ? "ə" : "ʌ";
          return ARPA_TO_IPA[bare] ?? "";
        })
        .join("");
      return mark + body;
    })
    .join("");
}

/**
 * Readable respelling, e.g. "ser-uhn-DIP-i-tee". Stressed syllable uppercased.
 *
 * Regrouped for reading rather than for phonology. Maximal onset is right
 * about where a syllable *begins* — /ˌsɛɹənˈdɪpɪti/ — but printing that as
 * "seh-ruhn-DI-pi-tee" puts the stress on an open "DI" while the syllable line
 * above it reads "ser-en-DIP-i-ty". Two devices on the same page disagreeing
 * about the same word is worse than either being slightly non-standard, so a
 * stressed lax vowel takes the following consonant back into its own syllable.
 */
export function toRespelling(pronunciation) {
  const syllables = toSyllables(pronunciation);
  if (syllables.length === 0) return "";
  const stressAt = primaryStressIndex(syllables);

  const groups = syllables.map((syllable) => [...syllable.phonemes]);
  for (let i = 0; i < groups.length - 1; i += 1) {
    if (!syllables[i].lax) continue;
    // Only close a syllable that is currently open. "algorithm" already ends
    // its first syllable in L, and pulling the G back too gives "ALG-ur-...".
    const current = groups[i];
    if (!VOWEL_PHONEMES.has(stripStress(current[current.length - 1]))) continue;
    // Move at most one consonant, and never leave the next syllable without
    // an onset of its own.
    const next = groups[i + 1];
    const onsetLength = next.findIndex((phoneme) => VOWEL_PHONEMES.has(stripStress(phoneme)));
    if (onsetLength !== 1) continue;
    current.push(next.shift());
  }

  return groups
    .map((phonemes, index) => {
      const body = phonemes
        .map((phoneme, position) => {
          const bare = stripStress(phoneme);
          // "eh" needs its h only when nothing follows it in the syllable:
          // "beht" is harder to read than "bet", but a bare "e" at the end of
          // a syllable would be read as the name of the letter.
          if (bare === "EH" && position < phonemes.length - 1) return "e";
          return ARPA_TO_RESPELL[bare] ?? "";
        })
        .join("");
      return index === stressAt && groups.length > 1 ? body.toUpperCase() : body;
    })
    .filter(Boolean)
    .join("-");
}

/* ------------------------------------------------------------------ *
 * Spelling-side syllable splitting
 * ------------------------------------------------------------------ */

const SPELLING_VOWELS = "aeiouy";

/*
 * Consonant clusters that can legally begin an English syllable. Used for the
 * maximal-onset decision: given "hungry", the run "ngr" yields the onset "gr"
 * (legal) rather than "ngr" (not), giving "hun-gry".
 */
const LEGAL_ONSETS = new Set([
  "bl", "br", "ch", "cl", "cr", "dr", "dw", "fl", "fr", "gl", "gr", "gw",
  "kl", "kr", "kw", "ph", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn",
  "sp", "st", "sw", "th", "tr", "tw", "wh", "wr", "sch", "scr", "shr",
  "sph", "spl", "spr", "squ", "str", "thr",
]);

/** Nuclei in the spelling, as [startIndex, endIndex] pairs over the letters. */
function spellingNuclei(letters) {
  const nuclei = [];
  let current = null;

  for (let i = 0; i < letters.length; i += 1) {
    if (SPELLING_VOWELS.includes(letters[i])) {
      if (current && current.end === i - 1) {
        current.end = i;
      } else {
        current = { start: i, end: i };
        nuclei.push(current);
      }
    }
  }

  // A "qu" is an onset, not a nucleus — "quiet" is qui-et, never qu-iet.
  const withoutQu = nuclei.filter((nucleus, index) => {
    if (nucleus.start === 0) return true;
    const isU = letters[nucleus.start] === "u" && letters[nucleus.start - 1] === "q";
    if (!isU) return true;
    if (nucleus.end > nucleus.start) {
      nucleus.start += 1;
      return true;
    }
    // A bare "qu" nucleus is dropped, but never the last one standing.
    return index === nuclei.length - 1 && nuclei.length === 1;
  });

  /*
   * Terminal silent "e" is not a nucleus: "athlete" is ath-lete, and treating
   * its final e as a syllable is what turns "science" into "scien-ce". The
   * exception is a consonant + "le" ending, where the e carries the syllable
   * ("can-dle"), and a doubled or glided ending ("ee", "oe", "ye").
   */
  if (withoutQu.length > 1 && letters.endsWith("e")) {
    const last = withoutQu[withoutQu.length - 1];
    const isBareFinalE = last.start === last.end && last.start === letters.length - 1;
    const carries = /(le|ee|oe|ye|ie|ue)$/.test(letters);
    if (isBareFinalE && !carries) withoutQu.pop();
  }

  return withoutQu;
}

/**
 * Force the spelling nuclei to match a known syllable count.
 *
 * CMUdict knows the true count; the spelling only suggests it. Where the
 * spelling shows too many nuclei we merge the adjacent pair that sits closest
 * together (a vowel digraph read as two, like "beau"). Where it shows too few
 * we split the widest run (a hiatus written as one, like "sci-ence").
 */
function reconcile(nuclei, letters, targetCount) {
  const groups = nuclei.map((n) => ({ ...n }));
  if (!Number.isFinite(targetCount) || targetCount < 1) return groups;

  while (groups.length > targetCount && groups.length > 1) {
    let bestIndex = 0;
    let bestGap = Infinity;
    for (let i = 0; i < groups.length - 1; i += 1) {
      const gap = groups[i + 1].start - groups[i].end;
      if (gap < bestGap) {
        bestGap = gap;
        bestIndex = i;
      }
    }
    groups[bestIndex].end = groups[bestIndex + 1].end;
    groups.splice(bestIndex + 1, 1);
  }

  while (groups.length < targetCount) {
    let bestIndex = -1;
    let bestWidth = 1;
    for (let i = 0; i < groups.length; i += 1) {
      const width = groups[i].end - groups[i].start + 1;
      if (width > bestWidth) {
        bestWidth = width;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) break;
    const group = groups[bestIndex];
    const mid = group.start + Math.floor((group.end - group.start + 1) / 2);
    const tail = { start: mid, end: group.end };
    group.end = mid - 1;
    groups.splice(bestIndex + 1, 0, tail);
  }

  return groups;
}

/**
 * Split a word into printed syllables.
 *
 * `syllableInfo` is the CMUdict-derived `toSyllables()` output when we have it.
 * Without it the split still works — it just falls back to spelling nuclei for
 * the count and treats every vowel as tense.
 */
export function splitSyllables(word, syllableInfo) {
  const original = String(word);
  const letters = original.toLowerCase();

  // Map positions in the letters-only view back onto the original, which may
  // carry hyphens, apostrophes or spaces that must survive intact.
  const indexMap = [];
  let lettersOnly = "";
  for (let i = 0; i < letters.length; i += 1) {
    if (/[a-z]/.test(letters[i])) {
      indexMap.push(i);
      lettersOnly += letters[i];
    }
  }
  // A word with no letters has no syllables. Returning [original] here hands
  // callers a phantom one-syllable record built from an empty string.
  if (lettersOnly.length === 0) return [];
  if (lettersOnly.length < 3) return [original];

  const targetCount = syllableInfo?.length;
  const nuclei = reconcile(spellingNuclei(lettersOnly), lettersOnly, targetCount);
  if (nuclei.length <= 1) return [original];

  const cuts = [];
  for (let i = 0; i < nuclei.length - 1; i += 1) {
    const runStart = nuclei[i].end + 1;
    const runEnd = nuclei[i + 1].start;
    const runLength = runEnd - runStart;
    const lax = syllableInfo?.[i]?.lax ?? false;

    if (runLength <= 0) {
      cuts.push(runEnd);
      continue;
    }

    // "-Cle" endings take the preceding consonant with them in every printed
    // dictionary: can-dle, lit-tle, ta-ble, pur-ple. Outranks vowel quality.
    const isFinalPair = i === nuclei.length - 2;
    if (isFinalPair && lettersOnly.endsWith("le") && runLength >= 2) {
      cuts.push(Math.max(runStart, runEnd - 2));
      continue;
    }

    if (runLength === 1) {
      // One consonant: a stressed lax vowel keeps it (bet-ter), anything else
      // gives it up (wa-ter, ba-nana). "x" spells /ks/ and can never start a
      // syllable, so it always closes the one behind it (box-es).
      const isX = lettersOnly[runStart] === "x";
      cuts.push(lax || isX ? runStart + 1 : runStart);
      continue;
    }

    // Two or more: give the next syllable the longest legal onset it can take,
    // then pull one consonant back if a stressed lax vowel behind us would
    // otherwise be left open.
    let onsetLength = 0;
    for (const size of [3, 2]) {
      if (size > runLength) continue;
      if (LEGAL_ONSETS.has(lettersOnly.slice(runEnd - size, runEnd))) {
        onsetLength = size;
        break;
      }
    }
    if (onsetLength === 0) onsetLength = 1;
    if (lax && runLength - onsetLength === 0) onsetLength = Math.max(1, onsetLength - 1);

    cuts.push(runEnd - onsetLength);
  }

  const parts = [];
  let previous = 0;
  for (const cut of cuts) {
    const at = indexMap[cut];
    if (at === undefined || at <= previous) continue;
    parts.push(original.slice(previous, at));
    previous = at;
  }
  parts.push(original.slice(previous));

  return parts.filter(Boolean);
}

/**
 * The full pronunciation record stored on an entry.
 *
 * `src: "cmu"` means every field came from the pronouncing dictionary.
 * `src: "derived"` means the word is not in it — about 57% of the corpus,
 * because CMUdict is a speech-recognition resource weighted towards names and
 * common speech, while a dictionary is weighted towards the rare. Those
 * entries still get a syllable line from spelling rules, but no IPA and no
 * respelling, because a guessed phonetic transcription is worse than none.
 * The page labels the difference rather than hiding it.
 */
export function buildPronunciation(word, arpabet, pos) {
  if (arpabet) {
    const syllables = toSyllables(arpabet);
    if (syllables.length > 0) {
      const parts = splitSyllables(word, syllables);

      /*
       * The spelling cannot always be divided as many ways as the word is
       * spoken. "abc" is three syllables and one written vowel; "acme" is two
       * and one, once the silent e is discounted. Shipping the count anyway
       * gave a page reading "3 syllables" above a one-part syllable line, and a
       * stress index pointing past the end of the array.
       *
       * The count and the transcription are still true — they come from the
       * pronouncing dictionary — so they stay. The split is the part we cannot
       * do, so it is omitted rather than faked, and the page falls back to
       * showing the count and the IPA alone.
       */
      const divisible = parts.length === syllables.length;

      return {
        src: "cmu",
        ipa: toIpa(arpabet),
        respell: toRespelling(arpabet),
        parts: divisible ? parts : null,
        count: syllables.length,
        stress: divisible ? primaryStressIndex(syllables) : null,
      };
    }
  }

  // No recorded pronunciation: fall back to the spelling-rule count, which is
  // still a far better target than the raw number of vowel groups (that reads
  // "beautiful" as four syllables).
  const count = countSyllables(word);
  const parts = splitSyllables(word, new Array(count).fill({ lax: false }));
  if (parts.length === 0) return null;

  return {
    src: "derived",
    parts,
    // On this path the count IS the split — there is no separate authority to
    // disagree with it, so the two cannot drift apart.
    count: parts.length,
    stress: guessStress(parts, pos),
  };
}

/*
 * Stress for words with no recorded pronunciation.
 *
 * Two English rules carry most of the weight: suffixes that fix stress
 * relative to themselves (-ity and -ical pull it three from the end, -tion and
 * -ic two), and initial stress on two-syllable nouns against final stress on
 * two-syllable verbs — the "REcord / reCORD" pair.
 */
const ANTEPENULT_SUFFIXES = ["ity", "ical", "ify", "ogy", "ogist", "omy", "ular", "ative", "itude"];
const PENULT_SUFFIXES = ["tion", "sion", "ic", "ial", "ious", "eous", "uous", "ian", "ette", "esque", "ional"];

export function guessStress(parts, pos) {
  const count = parts.length;
  if (count <= 1) return 0;

  const whole = parts.join("").toLowerCase();
  for (const suffix of ANTEPENULT_SUFFIXES) {
    if (whole.endsWith(suffix)) return Math.max(0, count - 3);
  }
  for (const suffix of PENULT_SUFFIXES) {
    if (whole.endsWith(suffix)) return Math.max(0, count - 2);
  }
  if (count === 2) return pos === "v" ? 1 : 0;
  return Math.max(0, count - 3);
}
