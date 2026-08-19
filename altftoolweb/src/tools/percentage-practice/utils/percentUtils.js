function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roundClean(val) {
  return Math.round(val * 100) / 100;
}

const DIFFICULTY_CONFIG = {
  beginner: { numRange: [10, 100], pctChoices: [5, 10, 20, 25, 50] },
  easy: { numRange: [20, 200], pctChoices: [10, 15, 20, 25, 30, 50, 75] },
  medium: { numRange: [50, 500], pctChoices: [5, 12.5, 15, 20, 25, 30, 33.33, 40, 50, 60, 75] },
  hard: { numRange: [100, 2000], pctChoices: [7.5, 12.5, 15, 17.5, 22.5, 27.5, 33.33, 37.5, 45, 55, 62.5, 72.5] },
  expert: { numRange: [200, 10000], pctChoices: [3.5, 7.5, 12.5, 13.75, 17.5, 22.5, 27.5, 33.33, 37.5, 42.5, 55, 62.5, 72.5, 87.5] },
};

function getConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
}

/** A handful of "nice" price-tag values spread across a difficulty's numeric range. */
function priceLadder(cfg) {
  const [lo, hi] = cfg.numRange;
  const steps = 6;
  const prices = [];
  for (let i = 1; i <= steps; i += 1) {
    const raw = lo + ((hi - lo) * i) / steps;
    prices.push(Math.max(lo, Math.round(raw) - 1));
  }
  return prices;
}

function generateFindPercent(difficulty) {
  const cfg = getConfig(difficulty);
  const pct = pickRandom(cfg.pctChoices);
  const num = randInt(cfg.numRange[0], cfg.numRange[1]);
  const answer = roundClean((pct / 100) * num);
  const product = roundClean(pct * num);

  return {
    type: "find-percent",
    question: `What is ${pct}% of ${num}?`,
    answer,
    unit: "",
    explanation: `${pct}% of ${num} = (${pct}/100) × ${num} = ${answer}`,
    steps: [
      `Write as a fraction: ${pct}/100 × ${num}`,
      `Calculate: ${pct} × ${num} = ${product}`,
      `Divide by 100: ${product} / 100 = ${answer}`,
    ],
  };
}

function generateFindNumber(difficulty) {
  const cfg = getConfig(difficulty);
  const pct = pickRandom(cfg.pctChoices);
  // Pick the unknown number X within the difficulty's own range first, then derive the
  // clue (Y = pct% of X) from it — this keeps X from ballooning far outside numRange
  // for small percentages, which happened when X was derived from Y instead.
  const answer = randInt(cfg.numRange[0], cfg.numRange[1]);
  const result = roundClean((pct / 100) * answer);

  return {
    type: "find-number",
    question: `${pct}% of what number is ${result}?`,
    answer,
    unit: "",
    explanation: `If ${pct}% of X = ${result}, then X = ${result} / (${pct}/100) = ${answer}`,
    steps: [
      `Set up equation: ${pct}% × X = ${result}`,
      `Convert: (${pct}/100) × X = ${result}`,
      `Solve: X = ${result} × 100 / ${pct} = ${answer}`,
    ],
  };
}

function generateFindWhatPercent(difficulty) {
  const cfg = getConfig(difficulty);
  const num2 = randInt(cfg.numRange[0], cfg.numRange[1]);
  const pctChoices = cfg.pctChoices;
  const pct = pickRandom(pctChoices);
  const num1 = roundClean((pct / 100) * num2);

  return {
    type: "find-what-percent",
    question: `What percentage is ${num1} of ${num2}?`,
    answer: roundClean(pct),
    unit: "%",
    explanation: `(${num1} / ${num2}) × 100 = ${pct}%`,
    steps: [
      `Formula: (part / whole) × 100`,
      `Calculate: (${num1} / ${num2}) × 100`,
      `= ${roundClean(num1 / num2)} × 100 = ${pct}%`,
    ],
  };
}

function generateIncrease(difficulty) {
  const cfg = getConfig(difficulty);
  const pct = pickRandom(cfg.pctChoices);
  const original = randInt(cfg.numRange[0], cfg.numRange[1]);
  const increase = roundClean((pct / 100) * original);
  const answer = roundClean(original + increase);

  return {
    type: "increase",
    question: `Increase ${original} by ${pct}%. What is the result?`,
    answer,
    unit: "",
    explanation: `${original} + (${pct}% × ${original}) = ${original} + ${increase} = ${answer}`,
    steps: [
      `Calculate increase: ${pct}% × ${original} = ${increase}`,
      `Add to original: ${original} + ${increase} = ${answer}`,
    ],
  };
}

function generateDecrease(difficulty) {
  const cfg = getConfig(difficulty);
  const pct = pickRandom(cfg.pctChoices.filter((p) => p < 100));
  const original = randInt(cfg.numRange[0], cfg.numRange[1]);
  const decrease = roundClean((pct / 100) * original);
  const answer = roundClean(original - decrease);

  return {
    type: "decrease",
    question: `Decrease ${original} by ${pct}%. What is the result?`,
    answer,
    unit: "",
    explanation: `${original} - (${pct}% × ${original}) = ${original} - ${decrease} = ${answer}`,
    steps: [
      `Calculate decrease: ${pct}% × ${original} = ${decrease}`,
      `Subtract from original: ${original} - ${decrease} = ${answer}`,
    ],
  };
}

function generateDiscount(difficulty) {
  const cfg = getConfig(difficulty);
  const prices =
    difficulty === "beginner"
      ? [20, 50, 80, 100]
      : difficulty === "easy"
        ? [50, 100, 150, 200, 250]
        : priceLadder(cfg);
  const original = pickRandom(prices);
  const pct = pickRandom(cfg.pctChoices.filter((p) => p < 100));
  const saving = roundClean((pct / 100) * original);
  const answer = roundClean(original - saving);

  return {
    type: "discount",
    question: `A product costs $${original} with a ${pct}% discount. What is the sale price?`,
    answer,
    unit: "$",
    explanation: `$${original} - (${pct}% × $${original}) = $${original} - $${saving} = $${answer}`,
    steps: [
      `Calculate discount: ${pct}% × $${original} = $${saving}`,
      `Subtract from original: $${original} - $${saving} = $${answer}`,
    ],
  };
}

function generateOriginal(difficulty) {
  const cfg = getConfig(difficulty);
  const prices =
    difficulty === "beginner"
      ? [50, 80, 100, 120]
      : difficulty === "easy"
        ? [80, 120, 150, 200, 250]
        : priceLadder(cfg);
  const original = pickRandom(prices);
  const pct = pickRandom(cfg.pctChoices.filter((p) => p < 100));
  const salePrice = roundClean(original - (pct / 100) * original);

  return {
    type: "original",
    question: `After a ${pct}% discount, the price is $${salePrice}. What was the original price?`,
    answer: original,
    unit: "$",
    explanation: `Original = $${salePrice} / (1 - ${pct}/100) = $${salePrice} / ${roundClean(1 - pct / 100)} ≈ $${original}`,
    steps: [
      `Formula: Original = Sale Price / (1 - discount%/100)`,
      `Calculate: 1 - ${pct}/100 = ${roundClean(1 - pct / 100)}`,
      `$${salePrice} / ${roundClean(1 - pct / 100)} ≈ $${original}`,
    ],
  };
}

const GENERATORS = {
  "find-percent": generateFindPercent,
  "find-number": generateFindNumber,
  "find-what-percent": generateFindWhatPercent,
  increase: generateIncrease,
  decrease: generateDecrease,
  discount: generateDiscount,
  original: generateOriginal,
};

const MIXED_TYPES = ["find-percent", "find-number", "find-what-percent", "increase", "decrease", "discount", "original"];

export function generateQuestion(type, difficulty) {
  if (type === "mixed") {
    return generateQuestion(pickRandom(MIXED_TYPES), difficulty);
  }
  const generator = GENERATORS[type] || GENERATORS["find-percent"];
  return generator(difficulty);
}

export function checkAnswer(userAnswer, correctAnswer) {
  const num = parseFloat(userAnswer);
  if (isNaN(num)) return false;
  if (Math.abs(correctAnswer) < 0.01) return Math.abs(num) < 0.01;
  return Math.abs(num - correctAnswer) / Math.abs(correctAnswer) < 0.005;
}

export function formatAnswer(answer, unit) {
  if (unit === "$") return `$${answer}`;
  if (unit === "%") return `${answer}%`;
  return String(answer);
}
