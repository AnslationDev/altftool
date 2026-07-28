/**
 * Braille Dot Chart Trainer — cell data, transliteration and quiz logic.
 *
 * The braille cell is six raised dots in two columns of three. Dots are numbered
 * down the left column 1, 2, 3 and down the right column 4, 5, 6. Every printed
 * braille character is one of the 64 possible on/off combinations of those dots.
 *
 * Alphabet structure (Louis Braille's original three "lines"):
 *   Line 1 — a to j use only the top four dots (1, 2, 4, 5).
 *   Line 2 — k to t repeat line 1 with dot 3 added.
 *   Line 3 — u, v, x, y, z repeat line 1 with dots 3 and 6 added.
 *   w (dots 2-4-5-6) sits outside the pattern; it was added later because the
 *   original French alphabet had no w.
 *
 * Transliteration here is uncontracted (grade 1) English braille. Contracted
 * grade 2 braille, which abbreviates common words and letter groups, is a much
 * larger system and is not attempted.
 *
 * Pure module: no React, no DOM, no Date.now().
 */

/** Dot numbers laid out as they sit in the cell. */
export const DOT_LAYOUT = [
  { dot: 1, column: "left", row: 1 },
  { dot: 4, column: "right", row: 1 },
  { dot: 2, column: "left", row: 2 },
  { dot: 5, column: "right", row: 2 },
  { dot: 3, column: "left", row: 3 },
  { dot: 6, column: "right", row: 3 },
];

/** Base code point of the Unicode Braille Patterns block. */
export const BRAILLE_BLOCK_START = 0x2800;

/** Total distinct patterns in a six-dot cell, including the blank cell. */
export const CELL_COMBINATIONS = 64;

/** Uncontracted letters a-z. */
export const BRAILLE_LETTERS = {
  a: [1],
  b: [1, 2],
  c: [1, 4],
  d: [1, 4, 5],
  e: [1, 5],
  f: [1, 2, 4],
  g: [1, 2, 4, 5],
  h: [1, 2, 5],
  i: [2, 4],
  j: [2, 4, 5],
  k: [1, 3],
  l: [1, 2, 3],
  m: [1, 3, 4],
  n: [1, 3, 4, 5],
  o: [1, 3, 5],
  p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5],
  r: [1, 2, 3, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  u: [1, 3, 6],
  v: [1, 2, 3, 6],
  w: [2, 4, 5, 6],
  x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
};

/**
 * Digits reuse the line-1 letters: 1-9 are a-i and 0 is j.
 * They are only read as digits when a number sign comes first.
 */
export const BRAILLE_DIGITS = {
  1: BRAILLE_LETTERS.a,
  2: BRAILLE_LETTERS.b,
  3: BRAILLE_LETTERS.c,
  4: BRAILLE_LETTERS.d,
  5: BRAILLE_LETTERS.e,
  6: BRAILLE_LETTERS.f,
  7: BRAILLE_LETTERS.g,
  8: BRAILLE_LETTERS.h,
  9: BRAILLE_LETTERS.i,
  0: BRAILLE_LETTERS.j,
};

/**
 * Punctuation whose dot pattern is the same in Unified English Braille and in
 * English Braille American Edition. Marks that differ between the two systems
 * (quotation marks, brackets) are deliberately left out.
 */
export const BRAILLE_PUNCTUATION = {
  ",": [2],
  ";": [2, 3],
  ":": [2, 5],
  ".": [2, 5, 6],
  "?": [2, 3, 6],
  "!": [2, 3, 5],
  "'": [3],
  "-": [3, 6],
};

/** Indicator cells that change how the cells after them are read. */
export const BRAILLE_INDICATORS = {
  capital: { dots: [6], name: "Capital letter indicator", note: "Placed before a letter to capitalise it." },
  number: { dots: [3, 4, 5, 6], name: "Number sign", note: "Placed before a run of digits; the line-1 letters a-j then read as 1-9 and 0." },
  letter: { dots: [5, 6], name: "Grade 1 (letter) indicator", note: "Cancels the number sign so a following a-j reads as a letter again." },
  space: { dots: [], name: "Blank cell", note: "A cell with no raised dots marks a space between words." },
};

/** Turn a list of dot numbers into the matching Unicode braille character. */
export function dotsToUnicode(dots) {
  if (!Array.isArray(dots)) return "";
  let bits = 0;
  dots.forEach((dot) => {
    const index = Number(dot);
    if (Number.isInteger(index) && index >= 1 && index <= 6) {
      bits |= 1 << (index - 1);
    }
  });
  return String.fromCodePoint(BRAILLE_BLOCK_START + bits);
}

/** Human-readable dot list, e.g. [1,3,4] becomes "1-3-4". */
export function dotsToLabel(dots) {
  if (!Array.isArray(dots) || dots.length === 0) return "no dots";
  return dots.slice().sort((a, b) => a - b).join("-");
}

/** Which of the three alphabet lines a letter belongs to. */
export function letterLine(letter) {
  const key = String(letter).toLowerCase();
  if (key === "w") return { line: 4, label: "Added later (outside the pattern)" };
  if ("abcdefghij".includes(key)) return { line: 1, label: "Line 1 — top four dots only" };
  if ("klmnopqrst".includes(key)) return { line: 2, label: "Line 2 — line 1 plus dot 3" };
  if ("uvxyz".includes(key)) return { line: 3, label: "Line 3 — line 1 plus dots 3 and 6" };
  return { line: 0, label: "Not a letter" };
}

/** Full reference chart: letters, digits, punctuation and indicators. */
export function buildChart() {
  const letters = Object.keys(BRAILLE_LETTERS).map((char) => ({
    char,
    dots: BRAILLE_LETTERS[char],
    label: dotsToLabel(BRAILLE_LETTERS[char]),
    unicode: dotsToUnicode(BRAILLE_LETTERS[char]),
    line: letterLine(char),
  }));
  const digits = Object.keys(BRAILLE_DIGITS).map((char) => ({
    char,
    dots: BRAILLE_DIGITS[char],
    label: dotsToLabel(BRAILLE_DIGITS[char]),
    unicode: dotsToUnicode(BRAILLE_DIGITS[char]),
  }));
  const punctuation = Object.keys(BRAILLE_PUNCTUATION).map((char) => ({
    char,
    dots: BRAILLE_PUNCTUATION[char],
    label: dotsToLabel(BRAILLE_PUNCTUATION[char]),
    unicode: dotsToUnicode(BRAILLE_PUNCTUATION[char]),
  }));
  const indicators = Object.keys(BRAILLE_INDICATORS).map((key) => ({
    key,
    ...BRAILLE_INDICATORS[key],
    label: dotsToLabel(BRAILLE_INDICATORS[key].dots),
    unicode: dotsToUnicode(BRAILLE_INDICATORS[key].dots),
  }));
  return { letters, digits, punctuation, indicators };
}

/**
 * Identify which character a pressed dot pattern represents.
 * A cell can mean more than one thing — the line-1 letters double as digits
 * after a number sign — so every match is returned.
 */
export function identifyCell(dots) {
  const pressed = Array.isArray(dots)
    ? dots.map((dot) => Number(dot)).filter((dot) => Number.isInteger(dot) && dot >= 1 && dot <= 6)
    : [];
  const key = dotsToUnicode(pressed);
  const matches = [];

  Object.keys(BRAILLE_LETTERS).forEach((char) => {
    if (dotsToUnicode(BRAILLE_LETTERS[char]) === key) {
      matches.push({ char, kind: "letter", note: letterLine(char).label });
    }
  });
  Object.keys(BRAILLE_DIGITS).forEach((char) => {
    if (dotsToUnicode(BRAILLE_DIGITS[char]) === key) {
      matches.push({ char, kind: "digit", note: "Reads as a digit only after a number sign." });
    }
  });
  Object.keys(BRAILLE_PUNCTUATION).forEach((char) => {
    if (dotsToUnicode(BRAILLE_PUNCTUATION[char]) === key) {
      matches.push({ char, kind: "punctuation", note: "Punctuation mark." });
    }
  });
  Object.keys(BRAILLE_INDICATORS).forEach((name) => {
    if (dotsToUnicode(BRAILLE_INDICATORS[name].dots) === key) {
      matches.push({ char: BRAILLE_INDICATORS[name].name, kind: "indicator", note: BRAILLE_INDICATORS[name].note });
    }
  });

  return {
    dots: pressed.slice().sort((a, b) => a - b),
    label: dotsToLabel(pressed),
    unicode: key,
    matches,
    unassigned: matches.length === 0,
  };
}

/** Longest input the transliterator will process in one go. */
export const MAX_TEXT_LENGTH = 300;

/**
 * Transliterate text into uncontracted (grade 1) English braille cells.
 * Returns { error } for empty or over-long input.
 */
export function transliterate(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Type some text to see it in braille cells." };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { error: `Keep the text to ${MAX_TEXT_LENGTH} characters or fewer.` };
  }

  const cells = [];
  const unsupported = new Set();
  let inNumberRun = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const lower = char.toLowerCase();

    if (char === " " || char === "\n" || char === "\t") {
      inNumberRun = false;
      cells.push({ source: " ", dots: [], role: "space", note: "Blank cell — word space" });
      continue;
    }

    if (/[0-9]/.test(char)) {
      if (!inNumberRun) {
        cells.push({
          source: "#",
          dots: BRAILLE_INDICATORS.number.dots,
          role: "indicator",
          note: BRAILLE_INDICATORS.number.note,
        });
        inNumberRun = true;
      }
      cells.push({ source: char, dots: BRAILLE_DIGITS[char], role: "digit", note: `Digit ${char}` });
      continue;
    }

    if (/[a-z]/.test(lower)) {
      if (inNumberRun && "abcdefghij".includes(lower)) {
        cells.push({
          source: ";",
          dots: BRAILLE_INDICATORS.letter.dots,
          role: "indicator",
          note: BRAILLE_INDICATORS.letter.note,
        });
      }
      inNumberRun = false;
      if (char !== lower) {
        cells.push({
          source: "^",
          dots: BRAILLE_INDICATORS.capital.dots,
          role: "indicator",
          note: BRAILLE_INDICATORS.capital.note,
        });
      }
      cells.push({
        source: lower,
        dots: BRAILLE_LETTERS[lower],
        role: "letter",
        note: letterLine(lower).label,
      });
      continue;
    }

    if (BRAILLE_PUNCTUATION[char]) {
      inNumberRun = false;
      cells.push({
        source: char,
        dots: BRAILLE_PUNCTUATION[char],
        role: "punctuation",
        note: `Punctuation ${char}`,
      });
      continue;
    }

    unsupported.add(char);
  }

  if (cells.length === 0) {
    return { error: "None of those characters have an uncontracted braille cell here." };
  }

  const decorated = cells.map((cell, position) => ({
    ...cell,
    key: `${cell.source}-${position}`,
    label: dotsToLabel(cell.dots),
    unicode: dotsToUnicode(cell.dots),
  }));

  return {
    cells: decorated,
    braille: decorated.map((cell) => cell.unicode).join(""),
    cellCount: decorated.length,
    indicatorCount: decorated.filter((cell) => cell.role === "indicator").length,
    unsupported: Array.from(unsupported),
  };
}

/** Deterministic 32-bit PRNG (Mulberry32). */
function mulberry32(seedValue) {
  let a = seedValue >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

function normaliseSeed(seed) {
  const value = Number(seed);
  if (!Number.isFinite(value)) return 1;
  return Math.abs(Math.trunc(value)) % 4294967296 || 1;
}

/** Quiz modes. */
export const QUIZ_MODES = [
  { id: "cell-to-letter", label: "See the cell, name the letter" },
  { id: "dots-to-letter", label: "See the dot numbers, name the letter" },
  { id: "letter-to-dots", label: "See the letter, press the dots" },
];

export const MAX_QUIZ_LENGTH = 26;
export const DEFAULT_QUIZ_LENGTH = 10;

/** Build a deterministic quiz round over the 26 letters. */
export function buildQuiz({ mode = "cell-to-letter", count = DEFAULT_QUIZ_LENGTH, seed = 1 } = {}) {
  if (!QUIZ_MODES.some((entry) => entry.id === mode)) {
    return { error: "Choose one of the listed quiz modes." };
  }
  const requested = Number(count);
  if (!Number.isFinite(requested) || requested < 1) {
    return { error: "Ask for at least one question." };
  }
  if (requested > MAX_QUIZ_LENGTH) {
    return { error: `The quiz covers 26 letters, so a round cannot be longer than ${MAX_QUIZ_LENGTH} questions.` };
  }

  const rand = mulberry32(normaliseSeed(seed));
  const alphabet = Object.keys(BRAILLE_LETTERS);
  const chosen = shuffle(alphabet, rand).slice(0, Math.floor(requested));

  const questions = chosen.map((char) => {
    const dots = BRAILLE_LETTERS[char];
    const base = {
      char,
      dots,
      label: dotsToLabel(dots),
      unicode: dotsToUnicode(dots),
      line: letterLine(char),
      mode,
    };
    if (mode === "letter-to-dots") return { ...base, options: null, answerIndex: -1 };

    const distractors = shuffle(alphabet.filter((other) => other !== char), rand).slice(0, 3);
    const options = shuffle(distractors.concat(char), rand);
    return { ...base, options, answerIndex: options.indexOf(char) };
  });

  return { mode, questions, total: questions.length };
}

/** Grade a multiple-choice answer. */
export function gradeChoice(question, choiceIndex) {
  if (!question || !Array.isArray(question.options)) {
    return { error: "That question has no options to choose from." };
  }
  const choice = Number(choiceIndex);
  if (!Number.isInteger(choice) || choice < 0 || choice >= question.options.length) {
    return { error: "Pick an option before checking." };
  }
  return {
    isCorrect: choice === question.answerIndex,
    chosen: question.options[choice],
    answer: question.char,
    hint: `${question.char.toUpperCase()} is dots ${question.label}. ${question.line.label}.`,
  };
}

/** Grade a set of pressed dots against the target cell. */
export function gradeDots(question, pressedDots) {
  if (!question || !Array.isArray(question.dots)) {
    return { error: "That question has no target cell." };
  }
  if (!Array.isArray(pressedDots)) {
    return { error: "Press at least one dot before checking." };
  }
  const pressed = pressedDots
    .map((dot) => Number(dot))
    .filter((dot) => Number.isInteger(dot) && dot >= 1 && dot <= 6);
  if (pressed.length === 0) {
    return { error: "Press at least one dot before checking." };
  }
  const target = new Set(question.dots);
  const chosen = new Set(pressed);
  const missing = question.dots.filter((dot) => !chosen.has(dot));
  const extra = pressed.filter((dot) => !target.has(dot)).sort((a, b) => a - b);
  return {
    isCorrect: missing.length === 0 && extra.length === 0,
    missing,
    extra,
    answer: question.char,
    hint: `${question.char.toUpperCase()} is dots ${question.label}. ${question.line.label}.`,
  };
}

/** Score bands for a finished round. */
export const SCORE_BANDS = [
  { min: 90, band: "Excellent", message: "You can read the cell straight off." },
  { min: 70, band: "Solid", message: "Good recall. Drill the letters you missed." },
  { min: 40, band: "Getting there", message: "Work line by line: a-j first, then add dot 3, then dots 3 and 6." },
  { min: 0, band: "Just starting", message: "Learn a-j first — every other letter is built from those ten shapes." },
];

/** Turn a raw score into a percentage and band. */
export function summarizeScore({ correct = 0, total = 0 } = {}) {
  const right = Number(correct);
  const all = Number(total);
  if (!Number.isFinite(right) || !Number.isFinite(all)) {
    return { error: "Scores must be numbers." };
  }
  if (all <= 0) return { error: "Answer at least one question to see a score." };
  if (right < 0 || right > all) {
    return { error: "The number correct cannot be negative or larger than the number attempted." };
  }
  const percent = Math.round((right / all) * 100);
  const found = SCORE_BANDS.find((entry) => percent >= entry.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
  return { correct: right, total: all, incorrect: all - right, percent, band: found.band, message: found.message };
}
