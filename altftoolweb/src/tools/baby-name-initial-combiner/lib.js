/**
 * Blend two names into new name candidates.
 *
 * Everything here is deterministic: the same two names always produce the same
 * list, in the same order. Blends are built by splitting each name into
 * consonant-plus-vowel chunks (an approximation of syllables) and splicing the
 * pieces, then filtering the results through a pronounceability test.
 */

/** Blends shorter or longer than this are unusable as given names. */
export const MIN_BLEND_LETTERS = 3;
export const MAX_BLEND_LETTERS = 10;
/** Longest source name accepted. */
export const MAX_SOURCE_LETTERS = 20;

/** Pronounceability starts here and loses points for each awkward feature. */
export const BASE_PRONOUNCE = 100;
/** Three or more consonants in a row is the main thing that makes a blend unsayable. */
export const MAX_CONSONANT_RUN = 2;
export const PENALTY_CONSONANT_RUN = 30;
/** Three or more vowels in a row reads as a typo. */
export const MAX_VOWEL_RUN = 2;
export const PENALTY_VOWEL_RUN = 20;
/** A name starting with two or more consonants is harder across languages. */
export const PENALTY_HARD_ONSET = 10;
/** Blends outside the comfortable 4-8 letter window lose points. */
export const COMFORTABLE_MIN = 4;
export const COMFORTABLE_MAX = 8;
export const PENALTY_PER_LETTER_OUTSIDE = 8;

/** Final score = this much pronounceability, the rest parental balance. */
export const PRONOUNCE_WEIGHT = 0.6;
export const BALANCE_WEIGHT = 0.4;

/** Optional endings the tool can append when one is requested. */
export const ENDINGS = ["", "a", "i", "an", "ya", "ika", "esh", "ie"];

export const VOWELS = "aeiou";

/** Strip everything but letters and lowercase. */
export function normaliseName(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Split a name into chunks of "leading consonants + vowel group", trailing consonants joined on. */
export function splitChunks(name) {
  const clean = normaliseName(name);
  if (!clean) return [];
  const chunks = clean.match(/[^aeiou]*[aeiou]+/g) || [];
  const consumed = chunks.join("");
  const tail = clean.slice(consumed.length);
  if (!tail) return chunks;
  if (chunks.length === 0) return [tail];
  return [...chunks.slice(0, -1), chunks[chunks.length - 1] + tail];
}

/** Length of the longest run of consecutive consonants. */
export function longestRun(name, wantVowels) {
  const pattern = wantVowels ? /[aeiou]+/g : /[^aeiou]+/g;
  const runs = normaliseName(name).match(pattern);
  if (!runs) return 0;
  return runs.reduce((longest, run) => Math.max(longest, run.length), 0);
}

/** How easily a string can be said aloud, 0-100, with the reasons for each deduction. */
export function pronounceability(candidate) {
  const name = normaliseName(candidate);
  if (!name) return { score: 0, issues: ["empty"] };

  const issues = [];
  let score = BASE_PRONOUNCE;

  const consonantRun = longestRun(name, false);
  if (consonantRun > MAX_CONSONANT_RUN) {
    score -= PENALTY_CONSONANT_RUN;
    issues.push(`${consonantRun} consonants in a row`);
  }

  const vowelRun = longestRun(name, true);
  if (vowelRun > MAX_VOWEL_RUN) {
    score -= PENALTY_VOWEL_RUN;
    issues.push(`${vowelRun} vowels in a row`);
  }

  if (!VOWELS.split("").some((vowel) => name.includes(vowel))) {
    score = 0;
    issues.push("no vowel at all");
  }

  if (name.length >= 2 && !VOWELS.includes(name[0]) && !VOWELS.includes(name[1])) {
    score -= PENALTY_HARD_ONSET;
    issues.push("starts with two consonants");
  }

  let outside = 0;
  if (name.length < COMFORTABLE_MIN) outside = COMFORTABLE_MIN - name.length;
  else if (name.length > COMFORTABLE_MAX) outside = name.length - COMFORTABLE_MAX;
  if (outside > 0) {
    score -= outside * PENALTY_PER_LETTER_OUTSIDE;
    issues.push(`${name.length} letters`);
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

/** 100 when both parents contribute equally, falling to 0 when one contributes everything. */
export function balanceScore(partA, partB) {
  const total = partA.length + partB.length;
  if (total === 0) return 0;
  const share = partA.length / total;
  return Math.round(Math.max(0, 100 - Math.abs(0.5 - share) * 200));
}

function capitalise(word) {
  if (!word) return "";
  return word[0].toUpperCase() + word.slice(1);
}

/** The ten splicing rules, each returning [partFromA, partFromB] or null. */
const STRATEGIES = [
  {
    key: "head-tail",
    label: "First syllable of one, last syllable of the other",
    build: (a, b) => (a.chunks.length && b.chunks.length ? [a.chunks[0], b.chunks[b.chunks.length - 1]] : null),
  },
  {
    key: "tail-head",
    label: "Last syllable of one, first syllable of the other",
    build: (a, b) => (a.chunks.length && b.chunks.length ? [a.chunks[a.chunks.length - 1], b.chunks[0]] : null),
  },
  {
    key: "front-back",
    label: "Everything but the last syllable, plus the other's last syllable",
    build: (a, b) =>
      a.chunks.length > 1 && b.chunks.length
        ? [a.chunks.slice(0, -1).join(""), b.chunks[b.chunks.length - 1]]
        : null,
  },
  {
    key: "first-rest",
    label: "First syllable, plus everything after the other's first syllable",
    build: (a, b) =>
      a.chunks.length && b.chunks.length > 1 ? [a.chunks[0], b.chunks.slice(1).join("")] : null,
  },
  {
    key: "initial-rest",
    label: "One initial, plus the rest of the other name",
    build: (a, b) => (a.clean.length && b.chunks.length > 1 ? [a.clean[0], b.chunks.slice(1).join("")] : null),
  },
  {
    key: "two-two",
    label: "First two letters and the other's last two letters",
    build: (a, b) => (a.clean.length >= 2 && b.clean.length >= 2 ? [a.clean.slice(0, 2), b.clean.slice(-2)] : null),
  },
  {
    key: "onset-rime",
    label: "Opening consonants of one on the other's vowel body",
    build: (a, b) => {
      const onset = a.clean.match(/^[^aeiou]*/)[0];
      const rime = b.clean.replace(/^[^aeiou]*/, "");
      return onset && rime ? [onset, rime] : null;
    },
  },
  {
    key: "first-first",
    label: "The opening syllable of each name, back to back",
    build: (a, b) => (a.chunks.length && b.chunks.length ? [a.chunks[0], b.chunks[0]] : null),
  },
  {
    key: "last-last",
    label: "The closing syllable of each name, back to back",
    build: (a, b) =>
      a.chunks.length && b.chunks.length
        ? [a.chunks[a.chunks.length - 1], b.chunks[b.chunks.length - 1]]
        : null,
  },
  {
    key: "overlap",
    label: "Overlapped where the two names share letters",
    build: (a, b) => {
      const maxOverlap = Math.min(a.clean.length, b.clean.length) - 1;
      for (let size = maxOverlap; size >= 2; size -= 1) {
        if (a.clean.slice(-size) === b.clean.slice(0, size)) {
          return [a.clean, b.clean.slice(size)];
        }
      }
      return null;
    },
  },
];

/**
 * Blend two names into scored candidates.
 * Returns { error } when either name is missing, too long, or has no vowel.
 */
export function blendNames({ nameA = "", nameB = "", ending = "", minScore = 0 } = {}) {
  const cleanA = normaliseName(nameA);
  const cleanB = normaliseName(nameB);

  if (!cleanA || !cleanB) return { error: "Enter both names to blend them." };
  if (cleanA.length > MAX_SOURCE_LETTERS || cleanB.length > MAX_SOURCE_LETTERS) {
    return { error: `Each name must be ${MAX_SOURCE_LETTERS} letters or fewer.` };
  }
  if (!VOWELS.split("").some((v) => cleanA.includes(v)) || !VOWELS.split("").some((v) => cleanB.includes(v))) {
    return { error: "Both names need at least one vowel to be split into syllables." };
  }
  if (!ENDINGS.includes(String(ending))) return { error: "Unknown ending option." };

  const floor = Number(minScore);
  if (!Number.isFinite(floor) || floor < 0 || floor > 100) {
    return { error: "The minimum score must be between 0 and 100." };
  }

  const a = { clean: cleanA, chunks: splitChunks(cleanA) };
  const b = { clean: cleanB, chunks: splitChunks(cleanB) };

  const seen = new Set([cleanA, cleanB]);
  const candidates = [];

  STRATEGIES.forEach((strategy) => {
    [
      { first: a, second: b, order: "AB" },
      { first: b, second: a, order: "BA" },
    ].forEach(({ first, second, order }) => {
      const parts = strategy.build(first, second);
      if (!parts) return;
      let [partOne, partTwo] = parts;
      let raw = `${partOne}${partTwo}`;
      const suffix = String(ending);
      if (suffix && !raw.endsWith(suffix)) {
        // Drop a trailing vowel before adding a vowel-initial ending, to avoid a vowel pile-up.
        if (VOWELS.includes(suffix[0]) && VOWELS.includes(raw.slice(-1))) raw = raw.slice(0, -1);
        raw += suffix;
      }
      if (raw.length < MIN_BLEND_LETTERS || raw.length > MAX_BLEND_LETTERS) return;
      if (seen.has(raw)) return;
      seen.add(raw);

      const said = pronounceability(raw);
      // An unsayable blend (e.g. all-consonant, zero-vowel) must never be kept — the
      // weighted average could otherwise let a high balance score alone push it past
      // the floor even though pronounceability was forced to 0.
      if (said.score === 0) return;
      const balance = balanceScore(partOne, partTwo);
      const score = Math.round(said.score * PRONOUNCE_WEIGHT + balance * BALANCE_WEIGHT);

      candidates.push({
        name: capitalise(raw),
        raw,
        letters: raw.length,
        score,
        pronounce: said.score,
        balance,
        issues: said.issues,
        strategy: strategy.label,
        fromFirst: order === "AB" ? partOne : partTwo,
        fromSecond: order === "AB" ? partTwo : partOne,
        order,
      });
    });
  });

  const kept = candidates
    .filter((candidate) => candidate.score >= floor)
    .sort((x, y) => y.score - x.score || x.letters - y.letters || x.raw.localeCompare(y.raw));

  return {
    candidates: kept,
    total: kept.length,
    generated: candidates.length,
    chunksA: a.chunks,
    chunksB: b.chunks,
    initials: `${cleanA[0].toUpperCase()}${cleanB[0].toUpperCase()}`,
    best: kept.length ? kept[0] : null,
  };
}
