import questions from "../constants/questions";
import { TOTAL_QUESTIONS } from "../constants/quizConfig";

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateQuiz({ category = "all", difficulty = "medium" } = {}) {
  let pool = [...questions];

  if (category && category !== "all") {
    pool = pool.filter((q) => q.category === category);
  }

  if (difficulty && difficulty !== "all") {
    const diffOrder = ["easy", "medium", "hard", "expert"];
    const diffIdx = diffOrder.indexOf(difficulty);
    pool = pool.filter((q) => {
      const qIdx = diffOrder.indexOf(q.difficulty);
      return qIdx <= diffIdx + 1;
    });
  }

  if (pool.length < TOTAL_QUESTIONS) {
    pool = [...questions];
    if (category && category !== "all") {
      pool = pool.filter((q) => q.category === category);
    }
  }

  const selected = shuffleArray(pool).slice(0, TOTAL_QUESTIONS);
  return selected.map((q, i) => ({
    ...q,
    order: i + 1,
    selectedOption: null,
    isAnswered: false,
    isSkipped: false,
    responseTime: null,
  }));
}

export function calculateScore(quizQuestions) {
  let correct = 0;
  let wrong = 0;
  let totalTime = 0;
  let answeredCount = 0;

  quizQuestions.forEach((q) => {
    if (q.isAnswered) {
      answeredCount++;
      totalTime += q.responseTime || 0;
      if (q.selectedOption === q.correctIndex) {
        correct++;
      } else {
        wrong++;
      }
    }
  });

  const accuracy = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;
  const avgResponseTime = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;

  return { correct, wrong, accuracy, avgResponseTime, answeredCount };
}

export function estimateCognitiveRating(accuracy, avgResponseTime) {
  let baseScore = accuracy;
  if (avgResponseTime < 5000) baseScore = Math.min(100, baseScore + 5);
  else if (avgResponseTime > 15000) baseScore = Math.max(0, baseScore - 5);

  if (baseScore >= 90) return { rating: "Exceptional", range: "130+", tone: "good" };
  if (baseScore >= 80) return { rating: "Above Average", range: "115-130", tone: "good" };
  if (baseScore >= 65) return { rating: "Average", range: "100-115", tone: "default" };
  if (baseScore >= 50) return { rating: "Below Average", range: "85-100", tone: "warn" };
  return { rating: "Needs Practice", range: "Below 85", tone: "warn" };
}

export function getCategoryBreakdown(quizQuestions) {
  const breakdown = {};
  quizQuestions.forEach((q) => {
    if (!breakdown[q.category]) {
      breakdown[q.category] = { total: 0, correct: 0, wrong: 0, totalTime: 0 };
    }
    breakdown[q.category].total++;
    if (q.isAnswered) {
      breakdown[q.category].totalTime += q.responseTime || 0;
      if (q.selectedOption === q.correctIndex) {
        breakdown[q.category].correct++;
      } else {
        breakdown[q.category].wrong++;
      }
    }
  });

  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    ...data,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    avgTime: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
  }));
}
