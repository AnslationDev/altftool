function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundClean(n) {
  return Math.round(n * 1000) / 1000;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyFrac(n, d) {
  if (d === 0) return { n, d };
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: sign * (Math.abs(n) / g), d: Math.abs(d) / g };
}

function formatFrac(n, d) {
  const s = simplifyFrac(n, d);
  if (s.d === 1) return String(s.n);
  return `${s.n}/${s.d}`;
}

// Beginner: x + a = b  →  x = b - a
function genBeginner() {
  const a = randInt(-10, 15);
  const x = randInt(-10, 15);
  const b = x + a;
  const answer = x;
  return {
    question: `x + ${a >= 0 ? a : `(${a})`} = ${b}`,
    answer,
    exact: String(answer),
    explanation: `x = ${b} - ${a} = ${answer}`,
    steps: [
      `Start: x + ${a} = ${b}`,
      `Subtract ${a} from both sides: x = ${b} - ${a}`,
      `Solution: x = ${answer}`,
    ],
    hint: "Subtract the constant from both sides.",
  };
}

// Easy: ax + b = c  →  x = (c - b) / a
function genEasy() {
  const a = randInt(2, 12);
  const x = randInt(-8, 10);
  const b = randInt(-10, 10);
  const c = a * x + b;
  return {
    question: `${a}x + ${b >= 0 ? b : `(${b})`} = ${c}`,
    answer: roundClean(x),
    exact: formatFrac(c - b, a),
    explanation: `${a}x = ${c} - ${b} = ${c - b}, x = ${c - b} / ${a} = ${roundClean(x)}`,
    steps: [
      `Start: ${a}x + ${b} = ${c}`,
      `Subtract ${b}: ${a}x = ${c - b}`,
      `Divide by ${a}: x = ${c - b} / ${a}`,
      `Solution: x = ${formatFrac(c - b, a)}`,
    ],
    hint: "Move the constant to the right, then divide by the coefficient.",
  };
}

// Medium: ax + b = cx + d  →  x = (d - b) / (a - c)
function genMedium() {
  const a = randInt(2, 10);
  let c = randInt(-5, 10);
  while (c === a) c = randInt(-5, 10);
  const x = randInt(-8, 8);
  const b = randInt(-10, 15);
  const d = (a - c) * x + b;
  const denom = a - c;
  return {
    question: `${a}x + ${b} = ${c}x + ${d >= 0 ? d : `(${d})`}`,
    answer: roundClean(x),
    exact: formatFrac(d - b, denom),
    explanation: `${a}x - ${c}x = ${d} - ${b}, ${denom}x = ${d - b}, x = ${formatFrac(d - b, denom)}`,
    steps: [
      `Start: ${a}x + ${b} = ${c}x + ${d}`,
      `Move x terms left: ${a}x - ${c}x = ${d} - ${b}`,
      `Simplify: ${denom}x = ${d - b}`,
      `Divide: x = ${formatFrac(d - b, denom)}`,
      `Solution: x = ${roundClean(x)}`,
    ],
    hint: "Collect x terms on one side, constants on the other.",
  };
}

// Hard: ax² + b = c  →  x = ±√((c-b)/a)
function genHard() {
  const a = randInt(1, 5);
  const inner = randInt(1, 9);
  const xSq = inner;
  const b = randInt(-10, 10);
  const c = a * xSq + b;
  const val = (c - b) / a;
  return {
    question: `${a}x² + ${b >= 0 ? b : `(${b})`} = ${c}`,
    answer: roundClean(Math.sqrt(val)),
    exact: `±√${val}`,
    type: "quadratic",
    explanation: `${a}x² = ${c} - ${b} = ${c - b}, x² = ${val}, x = ±${roundClean(Math.sqrt(val))}`,
    steps: [
      `Start: ${a}x² + ${b} = ${c}`,
      `Subtract ${b}: ${a}x² = ${c - b}`,
      `Divide by ${a}: x² = ${val}`,
      `Take square root: x = ±${roundClean(Math.sqrt(val))}`,
    ],
    hint: "Isolate x² first, then take the square root of both sides.",
  };
}

// Challenge: ax² + bx + c = 0 (real roots guaranteed)
function genChallenge() {
  const r1 = randInt(-8, 8);
  const r2 = randInt(-8, 8);
  const a = randInt(1, 5);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const discriminant = b * b - 4 * a * c;
  const sqrtD = Math.sqrt(discriminant);
  const x1 = roundClean((-b + sqrtD) / (2 * a));
  const x2 = roundClean((-b - sqrtD) / (2 * a));
  const sorted = [x1, x2].sort((a, b) => a - b);
  return {
    question: `${a}x² + ${b >= 0 ? b : `(${b})`}x + ${c >= 0 ? c : `(${c})`} = 0`,
    answer: sorted[0],
    answer2: sorted[1],
    type: "quadratic_two",
    exact: `${formatFrac(-b + sqrtD, 2 * a)}, ${formatFrac(-b - sqrtD, 2 * a)}`,
    explanation: `x = [${-b} ± √(${discriminant})] / ${2 * a} = ${sorted[0]}, ${sorted[1]}`,
    steps: [
      `Start: ${a}x² + ${b}x + ${c} = 0`,
      `Discriminant: Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
      `√Δ = ${roundClean(sqrtD)}`,
      `x₁ = (${-b} + ${roundClean(sqrtD)}) / ${2 * a} = ${sorted[0]}`,
      `x₂ = (${-b} - ${roundClean(sqrtD)}) / ${2 * a} = ${sorted[1]}`,
    ],
    hint: "Use the quadratic formula: x = (-b ± √Δ) / 2a",
  };
}

const GENERATORS = {
  beginner: genBeginner,
  easy: genEasy,
  medium: genMedium,
  hard: genHard,
  challenge: genChallenge,
};

export function generateEquation(difficulty) {
  const gen = GENERATORS[difficulty] || genEasy;
  return gen();
}

export function checkAnswer(userInput, question) {
  const num = parseFloat(userInput);
  if (isNaN(num)) return false;

  if (question.type === "quadratic_two") {
    const n2 = parseFloat(userInput.split(/[,;\s]+/).pop());
    if (isNaN(n2)) {
      return Math.abs(num - question.answer) < 0.05 || Math.abs(num - question.answer2) < 0.05;
    }
    return (
      (Math.abs(num - question.answer) < 0.05 && Math.abs(n2 - question.answer2) < 0.05) ||
      (Math.abs(num - question.answer2) < 0.05 && Math.abs(n2 - question.answer) < 0.05)
    );
  }

  return Math.abs(num - question.answer) < 0.05;
}

export function formatAnswer(answer, type) {
  if (type === "quadratic") return `±${answer}`;
  return String(answer);
}
