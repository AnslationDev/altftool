/**
 * Key signature reference and quiz generator.
 *
 * Source of the rules: standard Western common-practice notation / circle of fifths.
 * Accidentals are always written in a fixed order in the signature:
 *   sharps  F C G D A E B   (each a fifth above the previous)
 *   flats   B E A D G C F   (the sharp order reversed)
 * A key signature can carry at most 7 accidentals, which is why the tables below
 * are 8 entries long (0 through 7).
 */

/** Maximum number of accidentals a conventional key signature can hold. */
export const MAX_ACCIDENTALS = 7;

/** Order in which sharps appear in a signature: F C G D A E B. */
export const SHARP_ORDER = ["F♯", "C♯", "G♯", "D♯", "A♯", "E♯", "B♯"];

/** Order in which flats appear in a signature: B E A D G C F. */
export const FLAT_ORDER = ["B♭", "E♭", "A♭", "D♭", "G♭", "C♭", "F♭"];

/** Major key for n sharps, index 0..7 (0 sharps = C major). */
export const MAJOR_BY_SHARPS = ["C", "G", "D", "A", "E", "B", "F♯", "C♯"];

/** Relative minor for n sharps, index 0..7 (0 sharps = A minor). */
export const MINOR_BY_SHARPS = ["A", "E", "B", "F♯", "C♯", "G♯", "D♯", "A♯"];

/** Major key for n flats, index 0..7 (0 flats = C major). */
export const MAJOR_BY_FLATS = ["C", "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭"];

/** Relative minor for n flats, index 0..7 (0 flats = A minor). */
export const MINOR_BY_FLATS = ["A", "D", "G", "C", "F", "B♭", "E♭", "A♭"];

/** Mnemonic for the sharp order. */
export const SHARP_MNEMONIC = "Father Charles Goes Down And Ends Battle";

/** Mnemonic for the flat order (the sharp mnemonic read backwards). */
export const FLAT_MNEMONIC = "Battle Ends And Down Goes Charles' Father";

const SIGNATURE_TYPES = ["sharp", "flat", "none"];
const MODES = ["major", "minor"];

/**
 * Accidentals printed in a signature, in written order.
 * @param {{count:number,type:string}} input
 * @returns {string[]} e.g. ["F♯","C♯"] — empty array for an invalid request
 */
export function accidentalsFor({ count, type } = {}) {
  const n = Math.trunc(Number(count));
  if (!Number.isFinite(n) || n <= 0 || n > MAX_ACCIDENTALS) return [];
  if (type === "sharp") return SHARP_ORDER.slice(0, n);
  if (type === "flat") return FLAT_ORDER.slice(0, n);
  return [];
}

/**
 * Look up the major and minor key that share a key signature.
 * @param {{count:number,type:"sharp"|"flat"|"none"}} input
 * @returns {object} { count, type, accidentals, major, minor, rule } or { error }
 */
export function keysForSignature({ count, type } = {}) {
  if (!SIGNATURE_TYPES.includes(type)) {
    return { error: "Choose sharps, flats, or no accidentals." };
  }
  const raw = Number(count);
  if (!Number.isFinite(raw)) {
    return { error: "Enter how many accidentals are in the signature." };
  }
  const n = Math.trunc(raw);
  if (n < 0) return { error: "A key signature cannot have a negative number of accidentals." };
  if (n > MAX_ACCIDENTALS) {
    return { error: `A key signature holds at most ${MAX_ACCIDENTALS} accidentals.` };
  }

  const effectiveType = n === 0 ? "none" : type === "none" ? "sharp" : type;
  if (n === 0 || effectiveType === "none") {
    return {
      count: 0,
      type: "none",
      accidentals: [],
      major: "C",
      minor: "A",
      rule: "An empty key signature is C major or its relative minor, A minor.",
    };
  }

  const accidentals = accidentalsFor({ count: n, type: effectiveType });
  if (effectiveType === "sharp") {
    const last = accidentals[accidentals.length - 1];
    return {
      count: n,
      type: "sharp",
      accidentals,
      major: MAJOR_BY_SHARPS[n],
      minor: MINOR_BY_SHARPS[n],
      rule: `The last sharp is ${last}. The major key sits one semitone above the last sharp, so it is ${MAJOR_BY_SHARPS[n]} major; its relative minor is ${MINOR_BY_SHARPS[n]} minor.`,
    };
  }

  const rule =
    n === 1
      ? "One flat (B♭) is the one signature you memorise: F major, or D minor."
      : `With two or more flats the second-to-last flat names the key, and here that is ${accidentals[n - 2]} — so ${MAJOR_BY_FLATS[n]} major, or ${MINOR_BY_FLATS[n]} minor.`;

  return {
    count: n,
    type: "flat",
    accidentals,
    major: MAJOR_BY_FLATS[n],
    minor: MINOR_BY_FLATS[n],
    rule,
  };
}

/**
 * Reverse lookup: the signature belonging to a named key.
 * @param {{key:string,mode:"major"|"minor"}} input
 * @returns {object} { key, mode, count, type, accidentals } or { error }
 */
export function signatureForKey({ key, mode } = {}) {
  if (!MODES.includes(mode)) return { error: "Mode must be major or minor." };
  const wanted = String(key || "").trim();
  if (!wanted) return { error: "Enter a key name, for example E♭." };

  const tables =
    mode === "major"
      ? [
          ["sharp", MAJOR_BY_SHARPS],
          ["flat", MAJOR_BY_FLATS],
        ]
      : [
          ["sharp", MINOR_BY_SHARPS],
          ["flat", MINOR_BY_FLATS],
        ];

  for (const [type, table] of tables) {
    const index = table.indexOf(wanted);
    if (index === 0) {
      return { key: wanted, mode, count: 0, type: "none", accidentals: [] };
    }
    if (index > 0) {
      return {
        key: wanted,
        mode,
        count: index,
        type,
        accidentals: accidentalsFor({ count: index, type }),
      };
    }
  }
  return { error: `${wanted} ${mode} is not a standard key signature.` };
}

/** Every signature from 7 flats through 7 sharps, in circle-of-fifths order. */
export function allSignatures() {
  const rows = [];
  for (let n = MAX_ACCIDENTALS; n >= 1; n -= 1) {
    rows.push(keysForSignature({ count: n, type: "flat" }));
  }
  rows.push(keysForSignature({ count: 0, type: "none" }));
  for (let n = 1; n <= MAX_ACCIDENTALS; n += 1) {
    rows.push(keysForSignature({ count: n, type: "sharp" }));
  }
  return rows;
}

/**
 * Deterministic 32-bit PRNG (mulberry32). Same seed always gives the same stream,
 * which keeps quiz generation pure and reproducible.
 */
export function makeRng(seed) {
  let state = Math.trunc(Number(seed)) >>> 0;
  if (!Number.isFinite(state)) state = 1;
  if (state === 0) state = 0x9e3779b9; // golden-ratio constant, avoids a degenerate all-zero state
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Number of answer choices offered per question. */
export const OPTIONS_PER_QUESTION = 4;

function optionPool(mode, type) {
  if (mode === "major") {
    return type === "flat" ? MAJOR_BY_FLATS : MAJOR_BY_SHARPS;
  }
  return type === "flat" ? MINOR_BY_FLATS : MINOR_BY_SHARPS;
}

/**
 * Build a reproducible quiz.
 * @param {{seed:number,questionCount:number,mode:"major"|"minor"|"both",useSharps:boolean,useFlats:boolean}} input
 * @returns {object} { questions } or { error }
 */
export function buildQuiz({
  seed = 1,
  questionCount = 8,
  mode = "major",
  useSharps = true,
  useFlats = true,
} = {}) {
  const total = Math.trunc(Number(questionCount));
  if (!Number.isFinite(total) || total < 1) {
    return { error: "Ask for at least one question." };
  }
  if (total > 30) return { error: "Keep the quiz to 30 questions or fewer." };
  if (!useSharps && !useFlats) {
    return { error: "Turn on sharp signatures, flat signatures, or both." };
  }
  if (!["major", "minor", "both"].includes(mode)) {
    return { error: "Ask for major keys, minor keys, or both." };
  }

  const rng = makeRng(seed);
  const bank = [];
  if (useSharps) {
    for (let n = 1; n <= MAX_ACCIDENTALS; n += 1) bank.push({ count: n, type: "sharp" });
  }
  if (useFlats) {
    for (let n = 1; n <= MAX_ACCIDENTALS; n += 1) bank.push({ count: n, type: "flat" });
  }
  bank.push({ count: 0, type: "none" });

  const questions = [];
  let pool = [];
  for (let i = 0; i < total; i += 1) {
    if (pool.length === 0) pool = shuffle(bank, rng);
    const pick = pool.pop();
    const info = keysForSignature(pick);
    const askMode = mode === "both" ? (rng() < 0.5 ? "major" : "minor") : mode;
    const answer = askMode === "major" ? info.major : info.minor;
    const table = optionPool(askMode, pick.type === "none" ? "sharp" : pick.type);
    const distractors = shuffle(
      table.filter((name) => name !== answer),
      rng,
    ).slice(0, OPTIONS_PER_QUESTION - 1);

    questions.push({
      id: `q${i + 1}`,
      index: i + 1,
      count: info.count,
      type: info.type,
      accidentals: info.accidentals,
      askMode,
      prompt:
        info.count === 0
          ? `No sharps and no flats — which ${askMode} key is it?`
          : `${info.count} ${info.type}${info.count === 1 ? "" : "s"} (${info.accidentals.join(" ")}) — which ${askMode} key is it?`,
      answer,
      rule: info.rule,
      options: shuffle([answer, ...distractors], rng),
    });
  }

  return { questions };
}

/**
 * Score a set of answers.
 * @param {{questions:object[],answers:object}} input answers is { [questionId]: choice }
 * @returns {object} { total, answered, correct, wrong, percent, results } or { error }
 */
export function gradeQuiz({ questions, answers } = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "There are no questions to score yet." };
  }
  const given = answers && typeof answers === "object" ? answers : {};
  let answered = 0;
  let correct = 0;

  const results = questions.map((question) => {
    const choice = given[question.id];
    const hasChoice = typeof choice === "string" && choice.length > 0;
    if (hasChoice) answered += 1;
    const isCorrect = hasChoice && choice === question.answer;
    if (isCorrect) correct += 1;
    return {
      id: question.id,
      given: hasChoice ? choice : null,
      answer: question.answer,
      correct: isCorrect,
      answeredFlag: hasChoice,
    };
  });

  const total = questions.length;
  return {
    total,
    answered,
    correct,
    wrong: answered - correct,
    percent: answered > 0 ? (correct / answered) * 100 : 0,
    scorePercent: (correct / total) * 100,
    results,
  };
}
