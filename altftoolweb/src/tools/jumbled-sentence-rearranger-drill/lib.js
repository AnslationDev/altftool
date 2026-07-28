/**
 * Jumbled Sentence Rearranger Drill — sentence bank plus pure puzzle logic.
 *
 * No React, no DOM, no randomness from the environment: the scramble is driven
 * by a seeded generator so the same (id, round) always produces the same jumble
 * and results are reproducible for a whole class.
 */

/** Difficulty bands, ordered from shortest to longest sentences. */
export const LEVELS = ["Easy", "Medium", "Hard"];

/**
 * The sentence bank. `note` states the grammar rule that fixes the word order,
 * so a wrong attempt can be explained rather than just marked incorrect.
 */
export const SENTENCES = [
  {
    id: "e1",
    level: "Easy",
    sentence: "She reads a book every night.",
    hint: "Start with the person doing the action.",
    note: "English is a subject-verb-object language: subject (She), verb (reads), object (a book). A time phrase such as 'every night' normally sits at the end.",
  },
  {
    id: "e2",
    level: "Easy",
    sentence: "The children are playing in the garden.",
    hint: "The verb has two parts here.",
    note: "The present continuous is formed with be + the -ing form: are + playing. A place phrase follows the verb.",
  },
  {
    id: "e3",
    level: "Easy",
    sentence: "My brother works at a bank.",
    hint: "Look at which verb form carries an -s.",
    note: "In the present simple, a third-person singular subject takes -s on the verb: he/she/it works.",
  },
  {
    id: "e4",
    level: "Easy",
    sentence: "We do not eat meat on Tuesdays.",
    hint: "Negation needs a helper verb.",
    note: "Present-simple negatives use do/does + not before the base form of the verb, so the main verb stays as 'eat', not 'eats'.",
  },
  {
    id: "e5",
    level: "Easy",
    sentence: "There is a cat under the table.",
    hint: "Two words open this sentence.",
    note: "'There is' / 'there are' introduces existence. The real subject follows the verb, and the prepositional phrase comes last.",
  },
  {
    id: "e6",
    level: "Easy",
    sentence: "He always drinks coffee in the morning.",
    hint: "One word must sit next to the verb.",
    note: "Adverbs of frequency — always, usually, often, never — come before the main verb but after the verb 'be'.",
  },
  {
    id: "e7",
    level: "Easy",
    sentence: "Please close the door quietly.",
    hint: "No subject is needed.",
    note: "An imperative drops the subject and begins with the base verb. An adverb of manner such as 'quietly' usually follows the object.",
  },
  {
    id: "e8",
    level: "Easy",
    sentence: "They have lived here since 2019.",
    hint: "Which tense pairs with 'since'?",
    note: "The present perfect (have/has + past participle) is used with 'since' plus a starting point in time.",
  },
  {
    id: "m1",
    level: "Medium",
    sentence: "I have never seen such a beautiful sunset.",
    hint: "One adverb belongs inside the verb phrase.",
    note: "In a perfect tense, 'never' sits between the auxiliary and the past participle: have never seen.",
  },
  {
    id: "m2",
    level: "Medium",
    sentence: "The letter was written by my grandfather.",
    hint: "The doer is not the subject here.",
    note: "The passive is be + past participle, and the agent, when named, follows 'by'.",
  },
  {
    id: "m3",
    level: "Medium",
    sentence: "She asked me where I had put the keys.",
    hint: "The second half is not a question any more.",
    note: "A reported question uses statement word order — subject before verb — and no question mark.",
  },
  {
    id: "m4",
    level: "Medium",
    sentence: "If it rains tomorrow, we will cancel the picnic.",
    hint: "One clause takes 'will', the other does not.",
    note: "First conditional: 'if' + present simple in the condition clause, 'will' + base verb in the result clause.",
  },
  {
    id: "m5",
    level: "Medium",
    sentence: "Neither the manager nor the clerks were available.",
    hint: "Which subject sits closest to the verb?",
    note: "With 'neither ... nor', the verb agrees with the nearer subject. 'clerks' is plural, so the verb is 'were'.",
  },
  {
    id: "m6",
    level: "Medium",
    sentence: "He bought a beautiful old wooden table.",
    hint: "Three describing words must line up in a fixed order.",
    note: "English adjective order runs opinion, size, age, shape, colour, origin, material, purpose — hence beautiful (opinion), old (age), wooden (material).",
  },
  {
    id: "m7",
    level: "Medium",
    sentence: "The train had already left when we reached the station.",
    hint: "One past action happened before the other.",
    note: "The past perfect (had + past participle) marks the earlier of two past events; the later event stays in the past simple.",
  },
  {
    id: "m8",
    level: "Medium",
    sentence: "You should have told me about the meeting earlier.",
    hint: "Three words form the verb group.",
    note: "'should have' + past participle criticises or regrets something that did not happen in the past.",
  },
  {
    id: "h1",
    level: "Hard",
    sentence: "Not only did she win the race but she also broke the record.",
    hint: "The first clause is inverted.",
    note: "When 'not only' opens a sentence, the clause inverts to auxiliary + subject (did she win). The matching half takes 'but ... also'.",
  },
  {
    id: "h2",
    level: "Hard",
    sentence: "Rarely have I encountered a problem this difficult.",
    hint: "The auxiliary jumps in front of the subject.",
    note: "A negative or limiting adverb in front position — rarely, seldom, never, hardly — forces subject-auxiliary inversion.",
  },
  {
    id: "h3",
    level: "Hard",
    sentence: "The book that I borrowed from the library is due tomorrow.",
    hint: "Keep the describing clause next to its noun.",
    note: "A relative clause must sit immediately after the noun it modifies; the main verb of the sentence ('is due') comes after that clause closes.",
  },
  {
    id: "h4",
    level: "Hard",
    sentence: "Having finished her homework, she went out to play.",
    hint: "The opening phrase describes the earlier action.",
    note: "A perfect participle clause (having + past participle) shows the action that happened first, and its subject must be the same as the main clause subject.",
  },
  {
    id: "h5",
    level: "Hard",
    sentence: "It was in 1947 that India gained independence.",
    hint: "The sentence is built to spotlight one detail.",
    note: "A cleft sentence uses 'it was ... that' to put focus on one element — here the year rather than the event.",
  },
  {
    id: "h6",
    level: "Hard",
    sentence: "He speaks English more fluently than his sister does.",
    hint: "Long adverbs do not take an ending.",
    note: "Adverbs of two or more syllables form the comparative with 'more', not '-er', and the comparison is closed with 'than'.",
  },
  {
    id: "h7",
    level: "Hard",
    sentence: "The committee has decided to postpone the annual meeting.",
    hint: "Treat the group as one body.",
    note: "A collective noun acting as a single unit takes a singular verb in American usage and in most Indian exam keys; British usage also allows 'the committee have decided' when the members act individually.",
  },
  {
    id: "h8",
    level: "Hard",
    sentence: "No sooner had the bell rung than the students rushed out.",
    hint: "'than', not 'when', closes this pattern.",
    note: "'No sooner ... than' inverts the auxiliary and subject in the first clause (had the bell rung) and is always completed with 'than'.",
  },
];

/** Sentence-final punctuation the drill strips off before scrambling. */
const TERMINATORS = [".", "?", "!"];

/** 32-bit FNV-1a hash — turns a puzzle id into a numeric seed. */
export function hashSeed(text) {
  let hash = 0x811c9dc5;
  const value = String(text);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * mulberry32 — a small, fast, fully deterministic PRNG.
 * Returns a function producing values in [0, 1).
 */
export function makeRng(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Split a sentence into words plus its closing punctuation. */
export function splitSentence(sentence) {
  const text = String(sentence || "").trim();
  if (!text) return { error: "Enter a sentence with at least two words." };
  let body = text;
  let terminator = "";
  const last = body.slice(-1);
  if (TERMINATORS.includes(last)) {
    terminator = last;
    body = body.slice(0, -1).trim();
  }
  const words = body.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return { error: "Enter a sentence with at least two words." };
  }
  return { words, terminator };
}

/**
 * Deterministic Fisher-Yates shuffle. If the shuffle happens to reproduce the
 * original order, the list is rotated by one so the puzzle is never pre-solved.
 */
export function scrambleWords(words, seed) {
  if (!Array.isArray(words) || words.length === 0) return [];
  const rng = makeRng(seed);
  const out = words.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  if (out.length > 1 && out.join(" ") === words.join(" ")) {
    out.push(out.shift());
  }
  return out;
}

/** Lower-case only the first word, used when the capital letter is a giveaway. */
function maskFirstCapital(words) {
  if (words.length === 0) return words;
  const [first, ...rest] = words;
  return [first.charAt(0).toLowerCase() + first.slice(1), ...rest];
}

/** All sentences at a level; "All" returns the full bank. */
export function sentencesForLevel(level = "All") {
  if (level === "All") return SENTENCES.slice();
  return SENTENCES.filter((item) => item.level === level);
}

/**
 * Build one puzzle.
 * `index` is wrapped into range, so a session can just keep incrementing it.
 * `round` re-seeds the scramble, giving a fresh jumble of the same sentence.
 */
export function buildPuzzle({ index = 0, level = "All", round = 0, maskCase = true } = {}) {
  const pool = sentencesForLevel(level);
  if (pool.length === 0) {
    return { error: "No sentences are available at that difficulty." };
  }
  if (!Number.isFinite(index) || !Number.isFinite(round)) {
    return { error: "Question number and round must be whole numbers." };
  }
  const position = ((Math.trunc(index) % pool.length) + pool.length) % pool.length;
  const entry = pool[position];

  const parts = splitSentence(entry.sentence);
  if (parts.error) return { error: parts.error };

  const answerWords = maskCase ? maskFirstCapital(parts.words) : parts.words;
  const seed = hashSeed(`${entry.id}:${Math.trunc(round)}`);

  return {
    id: entry.id,
    level: entry.level,
    sentence: entry.sentence,
    note: entry.note,
    hint: entry.hint,
    terminator: parts.terminator,
    answerWords,
    chips: scrambleWords(answerWords, seed),
    position,
    poolSize: pool.length,
  };
}

/**
 * Compare an attempt with the answer.
 * Matching is case-insensitive so a capital letter never decides the mark;
 * duplicate words in a different slot still count if the sentence reads the same.
 */
export function checkAttempt({ attemptWords = [], answerWords = [] } = {}) {
  if (!Array.isArray(attemptWords) || !Array.isArray(answerWords)) {
    return { error: "Both the attempt and the answer must be lists of words." };
  }
  if (answerWords.length === 0) {
    return { error: "This puzzle has no answer to check against." };
  }
  if (attemptWords.length === 0) {
    return {
      correct: false,
      complete: false,
      firstWrongIndex: 0,
      correctCount: 0,
      total: answerWords.length,
      accuracyPct: 0,
    };
  }

  const normalise = (word) => String(word).toLowerCase();
  const expected = answerWords.map(normalise);
  const given = attemptWords.map(normalise);

  let firstWrongIndex = -1;
  let correctCount = 0;
  for (let i = 0; i < expected.length; i += 1) {
    if (i < given.length && given[i] === expected[i]) {
      correctCount += 1;
    } else if (firstWrongIndex === -1) {
      firstWrongIndex = i;
    }
  }

  const complete = given.length === expected.length;
  const correct = complete && given.join(" ") === expected.join(" ");

  return {
    correct,
    complete,
    firstWrongIndex: correct ? -1 : firstWrongIndex,
    correctCount,
    total: expected.length,
    accuracyPct: Math.round((correctCount / expected.length) * 100),
  };
}

/** Session tally. Guards the divide-by-zero on the very first question. */
export function sessionScore({ attempted = 0, correct = 0 } = {}) {
  const tried = Number(attempted);
  const right = Number(correct);
  if (!Number.isFinite(tried) || !Number.isFinite(right) || tried < 0 || right < 0) {
    return { error: "Scores must be zero or a positive whole number." };
  }
  if (right > tried) {
    return { error: "Correct answers cannot exceed the number attempted." };
  }
  if (tried === 0) {
    return { attempted: 0, correct: 0, wrong: 0, accuracyPct: 0 };
  }
  return {
    attempted: tried,
    correct: right,
    wrong: tried - right,
    accuracyPct: Math.round((right / tried) * 100),
  };
}
