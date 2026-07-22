import { STREAK_THRESHOLDS } from "../constants";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentTier(streak) {
  let tier = STREAK_THRESHOLDS[0];
  for (const t of STREAK_THRESHOLDS) {
    if (streak >= t.streak) tier = t;
  }
  return tier;
}

export function generateProblem(operations, streak) {
  const tier = getCurrentTier(streak);
  const op = operations[randInt(0, operations.length - 1)];
  const max = tier.numberMax;
  let a, b, answer, question;

  switch (op) {
    case "add": {
      a = randInt(1, max);
      b = randInt(1, max);
      answer = a + b;
      question = `${a} + ${b}`;
      break;
    }
    case "sub": {
      a = randInt(1, max);
      b = randInt(1, Math.min(a, max));
      answer = a - b;
      question = `${a} − ${b}`;
      break;
    }
    case "mul": {
      const mMax = Math.min(max, 30);
      a = randInt(2, mMax);
      b = randInt(2, Math.min(mMax, 20));
      answer = a * b;
      question = `${a} × ${b}`;
      break;
    }
    case "div": {
      const dMax = Math.min(max, 30);
      b = randInt(2, dMax);
      answer = randInt(1, Math.min(dMax, 20));
      a = b * answer;
      question = `${a} ÷ ${b}`;
      break;
    }
    default: {
      a = randInt(1, 20);
      b = randInt(1, 20);
      answer = a + b;
      question = `${a} + ${b}`;
    }
  }

  return { question, answer, operation: op, tier: tier.label };
}

export function checkAnswer(userInput, problem) {
  const num = parseFloat(userInput);
  if (isNaN(num)) return false;
  return Math.abs(num - problem.answer) < 0.01;
}

export function calculateScore(timeTaken, streak, isCorrect) {
  if (!isCorrect) return 0;
  const speedBonus = Math.max(0, Math.round((3 - timeTaken) * 10));
  const streakBonus = Math.min(streak, 50) * 2;
  return 10 + speedBonus + streakBonus;
}

export function getHighScores() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("math-speed-highscores") || "[]");
  } catch {
    return [];
  }
}

export function saveHighScore(score, streak, time, operations) {
  if (typeof window === "undefined") return;
  const scores = getHighScores();
  scores.push({
    score,
    streak,
    time,
    operations: operations.join("+"),
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("math-speed-highscores", JSON.stringify(scores.slice(0, 10)));
}
