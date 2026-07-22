import { SKILL_THRESHOLDS } from "../constants";

export function calculateAccuracy(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

export function calculateAverageTime(answers) {
  if (answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
  return Math.round(total / answers.length * 10) / 10;
}

export function calculateScore(correct, streak, difficulty) {
  const multiplier = { beginner: 1, easy: 1.5, medium: 2, hard: 3, expert: 5 };
  const m = multiplier[difficulty] || 1;
  const streakBonus = Math.min(streak, 10) * 0.5;
  return Math.round(correct * 10 * m + streakBonus * 10);
}

export function getSkillLevel(accuracy) {
  if (accuracy >= SKILL_THRESHOLDS.expert) return { level: "Expert", color: "rose", emoji: "🏆" };
  if (accuracy >= SKILL_THRESHOLDS.hard) return { level: "Hard", color: "orange", emoji: "🔥" };
  if (accuracy >= SKILL_THRESHOLDS.medium) return { level: "Medium", color: "amber", emoji: "⭐" };
  if (accuracy >= SKILL_THRESHOLDS.easy) return { level: "Easy", color: "blue", emoji: "📘" };
  return { level: "Beginner", color: "emerald", emoji: "🌱" };
}

export function getWeakTopics(answers) {
  const topicStats = {};
  answers.forEach((a) => {
    const type = a.type || "mixed";
    if (!topicStats[type]) topicStats[type] = { correct: 0, total: 0 };
    topicStats[type].total++;
    if (a.correct) topicStats[type].correct++;
  });
  return Object.entries(topicStats)
    .filter(([, s]) => s.total > 0)
    .map(([topic, s]) => ({
      topic,
      accuracy: calculateAccuracy(s.correct, s.total),
      total: s.total,
      correct: s.correct,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getPerformanceReport(answers, difficulty) {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const accuracy = calculateAccuracy(correct, total);
  const avgTime = calculateAverageTime(answers);
  const skill = getSkillLevel(accuracy);
  const topics = getWeakTopics(answers);
  const weakTopics = topics.filter((t) => t.accuracy < 70);
  const strongTopics = topics.filter((t) => t.accuracy >= 80);
  const score = calculateScore(correct, 0, difficulty);

  return {
    totalScore: score,
    accuracy,
    correctCount: correct,
    incorrectCount: total - correct,
    averageTime: avgTime,
    skillLevel: skill,
    weakTopics: weakTopics.map((t) => t.topic),
    strongTopics: strongTopics.map((t) => t.topic),
    topicBreakdown: topics,
    totalTime: answers.reduce((s, a) => s + (a.timeTaken || 0), 0),
  };
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function exportToCSV(answers, report) {
  const header = "Question,Your Answer,Correct Answer,Correct,Time (s),Type,Difficulty\n";
  const rows = answers
    .map(
      (a) =>
        `"${a.question}","${a.userAnswer}","${a.displayAnswer || a.answer}",${a.correct ? "Yes" : "No"},${(a.timeTaken || 0).toFixed(1)},"${a.type || ""}","${a.difficulty || ""}"`
    )
    .join("\n");
  const summary = `\n\nSummary\nAccuracy,${report.accuracy}%\nScore,${report.totalScore}\nSkill Level,${report.skillLevel.level}\nAverage Time,${report.averageTime}s`;
  const blob = new Blob([header + rows + summary], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mental-math-report-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToPDF(report) {
  const content = [
    "MENTAL MATH TRAINER - PERFORMANCE REPORT",
    "=========================================",
    "",
    `Score: ${report.totalScore}`,
    `Accuracy: ${report.accuracy}%`,
    `Correct: ${report.correctCount} / ${report.correctCount + report.incorrectCount}`,
    `Average Time: ${report.averageTime}s per question`,
    `Skill Level: ${report.skillLevel.level}`,
    `Total Time: ${formatTime(report.totalTime)}`,
    "",
    "Topic Breakdown:",
    ...report.topicBreakdown.map(
      (t) => `  ${t.topic}: ${t.accuracy}% (${t.correct}/${t.total})`
    ),
    "",
    "Weak Areas:",
    ...(report.weakTopics.length > 0 ? report.weakTopics.map((t) => `  - ${t}`) : ["  None"]),
    "",
    "Strong Areas:",
    ...(report.strongTopics.length > 0 ? report.strongTopics.map((t) => `  - ${t}`) : ["  None"]),
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mental-math-report-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
