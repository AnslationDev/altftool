// Deterministic PRNG (mulberry32) so the Daily Challenge can be seeded from
// today's date and produce byte-identical questions for every user/session
// on the same calendar day. Regular (non-daily) question generation keeps
// using Math.random via the default rng argument.
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplifyFraction(n, d) {
  if (d === 0) return { n, d };
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

const DIFFICULTY_RANGES = {
  beginner: { min: 1, max: 9 },
  easy: { min: 10, max: 50 },
  medium: { min: 10, max: 999 },
  hard: { min: 100, max: 9999 },
  expert: { min: 1000, max: 99999 },
};

function getRange(difficulty) {
  return DIFFICULTY_RANGES[difficulty] || DIFFICULTY_RANGES.easy;
}

function generateAddition(difficulty, rng = Math.random) {
  const r = getRange(difficulty);
  const a = randInt(r.min, r.max, rng);
  const b = randInt(r.min, r.max, rng);
  return { question: `${a} + ${b}`, answer: a + b, operands: [a, b] };
}

function generateSubtraction(difficulty, rng = Math.random) {
  const r = getRange(difficulty);
  let a = randInt(r.min, r.max, rng);
  let b = randInt(r.min, r.max, rng);
  if (difficulty === "beginner" || difficulty === "easy") {
    if (b > a) [a, b] = [b, a];
  }
  return { question: `${a} − ${b}`, answer: a - b, operands: [a, b] };
}

function generateMultiplication(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 9],
    easy: [2, 12],
    medium: [5, 25],
    hard: [10, 50],
    expert: [12, 99],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const a = randInt(min, max, rng);
  const b = randInt(min, max, rng);
  return { question: `${a} × ${b}`, answer: a * b, operands: [a, b] };
}

function generateDivision(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 9],
    easy: [2, 12],
    medium: [5, 25],
    hard: [10, 50],
    expert: [12, 99],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const b = randInt(min, max, rng);
  const quotient = randInt(min, max, rng);
  const a = b * quotient;
  return { question: `${a} ÷ ${b}`, answer: quotient, operands: [a, b] };
}

function generateSquares(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 5],
    easy: [1, 10],
    medium: [1, 20],
    hard: [10, 30],
    expert: [10, 50],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const n = randInt(min, max, rng);
  return { question: `${n}² = ?`, answer: n * n, operands: [n] };
}

function generateSquareRoots(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 4],
    easy: [1, 9],
    medium: [1, 15],
    hard: [5, 25],
    expert: [10, 40],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const n = randInt(min, max, rng);
  const square = n * n;
  return { question: `√${square} = ?`, answer: n, operands: [square] };
}

function generateCubes(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 3],
    easy: [1, 5],
    medium: [1, 10],
    hard: [5, 15],
    expert: [5, 20],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const n = randInt(min, max, rng);
  return { question: `${n}³ = ?`, answer: n * n * n, operands: [n] };
}

function generatePercentages(difficulty, rng = Math.random) {
  const ranges = {
    beginner: { pct: [10, 50], num: [10, 50] },
    easy: { pct: [5, 75], num: [20, 200] },
    medium: { pct: [1, 99], num: [50, 500] },
    hard: { pct: [1, 99], num: [100, 2000] },
    expert: { pct: [1, 99], num: [500, 10000] },
  };
  const cfg = ranges[difficulty] || ranges.easy;
  const pct = randInt(cfg.pct[0], cfg.pct[1], rng);
  const num = randInt(cfg.num[0], cfg.num[1], rng);
  const answer = (pct * num) / 100;
  const rounded = Math.round(answer * 100) / 100;
  return { question: `${pct}% of ${num}`, answer: rounded, operands: [pct, num] };
}

function generateFractions(difficulty, rng = Math.random) {
  const smallNums = [2, 3, 4, 5, 6, 8, 10];
  const d1 = pickRandom(smallNums, rng);
  const n1 = randInt(1, d1 - 1, rng);
  const d2 = pickRandom(smallNums, rng);
  const n2 = randInt(1, d2 - 1, rng);
  const ops = ["+", "−"];
  const op = pickRandom(ops, rng);
  let rn, rd;
  if (op === "+") {
    rn = n1 * d2 + n2 * d1;
    rd = d1 * d2;
  } else {
    rn = n1 * d2 - n2 * d1;
    rd = d1 * d2;
  }
  const s = simplifyFraction(rn, rd);
  const displayAnswer = s.d === 1 ? `${s.n}` : `${s.n}/${s.d}`;
  return {
    question: `${n1}/${d1} ${op} ${n2}/${d2}`,
    answer: rn / rd,
    displayAnswer,
    operands: [n1, d1, n2, d2],
  };
}

function generateDecimals(difficulty, rng = Math.random) {
  const ranges = {
    beginner: { a: [0.1, 5], b: [0.1, 5] },
    easy: { a: [0.1, 10], b: [0.1, 10] },
    medium: { a: [0.01, 50], b: [0.01, 50] },
    hard: { a: [0.01, 100], b: [0.01, 100] },
    expert: { a: [0.001, 500], b: [0.001, 500] },
  };
  const cfg = ranges[difficulty] || ranges.easy;
  const ops = ["+", "−", "×"];
  const op = pickRandom(ops, rng);
  let a, b, answer;
  if (op === "×") {
    a = Math.round((rng() * (cfg.a[1] - cfg.a[0]) + cfg.a[0]) * 10) / 10;
    b = Math.round((rng() * (cfg.b[1] - cfg.b[0]) + cfg.b[0]) * 10) / 10;
    answer = Math.round(a * b * 100) / 100;
  } else {
    a = Math.round((rng() * (cfg.a[1] - cfg.a[0]) + cfg.a[0]) * 10) / 10;
    b = Math.round((rng() * (cfg.b[1] - cfg.b[0]) + cfg.b[0]) * 10) / 10;
    answer = op === "+" ? Math.round((a + b) * 100) / 100 : Math.round((a - b) * 100) / 100;
  }
  return { question: `${a} ${op} ${b}`, answer, operands: [a, b] };
}

function generateRatios(difficulty, rng = Math.random) {
  const ranges = {
    beginner: [1, 5],
    easy: [1, 10],
    medium: [1, 20],
    hard: [2, 50],
    expert: [5, 100],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;
  const a = randInt(min, max, rng);
  const b = randInt(min, max, rng);
  const g = gcd(a, b);
  return {
    question: `Simplify ${a}:${b}`,
    answer: `${a / g}:${b / g}`,
    operands: [a, b],
  };
}

function generateAverage(difficulty, rng = Math.random) {
  const counts = { beginner: 2, easy: 3, medium: 4, hard: 5, expert: 6 };
  const count = counts[difficulty] || 3;
  const r = getRange(difficulty);
  const nums = Array.from({ length: count }, () => randInt(r.min, r.max, rng));
  const sum = nums.reduce((s, n) => s + n, 0);
  const avg = sum / count;
  const rounded = Math.round(avg * 100) / 100;
  return {
    question: `Average of ${nums.join(", ")}`,
    answer: rounded,
    operands: nums,
  };
}

function generateMixed(difficulty, rng = Math.random) {
  const generators = [generateAddition, generateSubtraction, generateMultiplication, generateDivision];
  return pickRandom(generators, rng)(difficulty, rng);
}

const GENERATORS = {
  addition: generateAddition,
  subtraction: generateSubtraction,
  multiplication: generateMultiplication,
  division: generateDivision,
  mixed: generateMixed,
  squares: generateSquares,
  "square-roots": generateSquareRoots,
  cubes: generateCubes,
  percentages: generatePercentages,
  fractions: generateFractions,
  decimals: generateDecimals,
  ratios: generateRatios,
  average: generateAverage,
};

export function generateQuestion(type, difficulty, rng = Math.random) {
  const generator = GENERATORS[type] || GENERATORS.addition;
  return generator(difficulty, rng);
}

export function generateDailyChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const types = ["addition", "subtraction", "multiplication", "division", "squares", "percentages"];
  // Seed a dedicated PRNG from today's date so the operand numbers (not just
  // the operation-type sequence) are deterministic across sessions/users.
  const rng = mulberry32(seed);
  const questions = [];
  for (let i = 0; i < 20; i++) {
    const type = types[(seed + i) % types.length];
    const difficulty = i < 5 ? "easy" : i < 12 ? "medium" : "hard";
    questions.push({ ...generateQuestion(type, difficulty, rng), type, difficulty });
  }
  return questions;
}

export function checkAnswer(userAnswer, correctAnswer) {
  if (typeof correctAnswer === "string") {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }
  const trimmed = String(userAnswer).trim();
  const fractionMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  const userNum = fractionMatch ? Number(fractionMatch[1]) / Number(fractionMatch[2]) : parseFloat(trimmed);
  if (isNaN(userNum)) return false;
  const diff = Math.abs(userNum - correctAnswer);
  if (Math.abs(correctAnswer) < 0.01) return diff < 0.01;
  return diff / Math.max(1, Math.abs(correctAnswer)) < 0.001;
}
