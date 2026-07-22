function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDivisionQuestion(type, difficulty) {
  const ranges = {
    beginner: { divisor: [1, 10], quotient: [1, 10] },
    easy: { divisor: [2, 12], quotient: [1, 15] },
    medium: { divisor: [5, 25], quotient: [1, 20] },
    hard: { divisor: [10, 50], quotient: [2, 30] },
    expert: { divisor: [12, 99], quotient: [5, 50] },
  };

  const r = ranges[difficulty] || ranges.easy;

  if (type === "basic" || (type === "mixed" && Math.random() < 0.3)) {
    const divisor = randInt(r.divisor[0], r.divisor[1]);
    const quotient = randInt(r.quotient[0], r.quotient[1]);
    const dividend = divisor * quotient;
    return {
      dividend,
      divisor,
      quotient,
      remainder: 0,
      type: "basic",
      display: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      decimalAnswer: quotient,
    };
  }

  if (type === "remainder" || (type === "mixed" && Math.random() < 0.25)) {
    const divisor = randInt(Math.max(2, r.divisor[0]), r.divisor[1]);
    const quotient = randInt(r.quotient[0], r.quotient[1]);
    const remainder = randInt(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      dividend,
      divisor,
      quotient,
      remainder,
      type: "remainder",
      display: `${dividend} ÷ ${divisor} = ? R ?`,
      answer: `${quotient} R ${remainder}`,
      decimalAnswer: quotient + remainder / divisor,
    };
  }

  if (type === "decimal" || (type === "mixed" && Math.random() < 0.2)) {
    const divisor = randInt(Math.max(2, r.divisor[0]), Math.min(r.divisor[1], 20));
    const dividend = randInt(10, 200);
    const decimal = Math.round((dividend / divisor) * 100) / 100;
    return {
      dividend,
      divisor,
      quotient: null,
      remainder: 0,
      type: "decimal",
      display: `${dividend} ÷ ${divisor} = ?`,
      answer: decimal,
      decimalAnswer: decimal,
    };
  }

  if (type === "large" || (type === "mixed" && Math.random() < 0.15)) {
    const divisor = randInt(10, 50);
    const quotient = randInt(10, 99);
    const dividend = divisor * quotient;
    return {
      dividend,
      divisor,
      quotient,
      remainder: 0,
      type: "large",
      display: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      decimalAnswer: quotient,
    };
  }

  // Default: long division
  const divisor = randInt(r.divisor[0], r.divisor[1]);
  const quotient = randInt(r.quotient[0], r.quotient[1]);
  const dividend = divisor * quotient;
  return {
    dividend,
    divisor,
    quotient,
    remainder: 0,
    type: "long",
    display: `${dividend} ÷ ${divisor} = ?`,
    answer: quotient,
    decimalAnswer: quotient,
  };
}

export function checkDivisionAnswer(userAnswer, question) {
  const trimmed = userAnswer.trim();

  if (question.type === "remainder") {
    const parts = trimmed.split(/[Rr,]+/).map((s) => s.trim());
    if (parts.length === 2) {
      const q = parseFloat(parts[0]);
      const rem = parseFloat(parts[1]);
      return q === question.quotient && rem === question.remainder;
    }
    const num = parseFloat(trimmed);
    return !isNaN(num) && num === question.quotient;
  }

  if (question.type === "decimal") {
    const num = parseFloat(trimmed);
    if (isNaN(num)) return false;
    return Math.abs(num - question.decimalAnswer) < 0.01;
  }

  const num = parseFloat(trimmed);
  if (isNaN(num)) return false;
  return num === question.quotient;
}

export function generateStepByStepSolution(question) {
  const steps = [];
  const { dividend, divisor, type } = question;

  if (type === "basic" || type === "long" || type === "large") {
    const quotient = Math.floor(dividend / divisor);
    steps.push(`Step 1: Divide ${dividend} by ${divisor}`);
    steps.push(`Step 2: ${divisor} × ${quotient} = ${divisor * quotient}`);
    if (divisor * quotient === dividend) {
      steps.push(`Step 3: ${dividend} − ${divisor * quotient} = 0`);
      steps.push(`Result: ${dividend} ÷ ${divisor} = ${quotient}`);
    } else {
      steps.push(`Step 3: ${dividend} − ${divisor * quotient} = ${dividend - divisor * quotient}`);
      steps.push(`Result: ${dividend} ÷ ${divisor} = ${quotient} R ${dividend - divisor * quotient}`);
    }
  } else if (type === "remainder") {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend - divisor * quotient;
    steps.push(`Step 1: How many times does ${divisor} go into ${dividend}?`);
    steps.push(`Step 2: ${divisor} × ${quotient} = ${divisor * quotient} (closest without going over)`);
    steps.push(`Step 3: ${dividend} − ${divisor * quotient} = ${remainder}`);
    steps.push(`Step 4: Since ${remainder} < ${divisor}, we stop`);
    steps.push(`Result: ${dividend} ÷ ${divisor} = ${quotient} R ${remainder}`);
  } else if (type === "decimal") {
    const answer = Math.round((dividend / divisor) * 100) / 100;
    steps.push(`Step 1: Divide ${dividend} by ${divisor}`);
    steps.push(`Step 2: ${divisor} goes into ${dividend} approximately ${Math.floor(dividend / divisor)} times`);
    steps.push(`Step 3: Continue dividing to get decimal places`);
    steps.push(`Result: ${dividend} ÷ ${divisor} ≈ ${answer}`);
  }

  return steps;
}
