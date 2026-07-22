export function calculateDailyScore(checkIn) {
  if (!checkIn) return 0;
  let score = 0;
  let factors = 0;

  if (checkIn.sleepHours != null) {
    const sleepScore = checkIn.sleepHours >= 7 && checkIn.sleepHours <= 9 ? 100 : checkIn.sleepHours >= 6 ? 70 : 40;
    score += sleepScore;
    factors++;
  }
  if (checkIn.waterIntake != null) {
    const waterScore = Math.min(100, (checkIn.waterIntake / 8) * 100);
    score += waterScore;
    factors++;
  }
  if (checkIn.mood != null) {
    score += (checkIn.mood / 5) * 100;
    factors++;
  }
  if (checkIn.energyLevel != null) {
    score += (checkIn.energyLevel / 5) * 100;
    factors++;
  }
  if (checkIn.exercise != null) {
    const exerciseScore = Math.min(100, (checkIn.exercise / 45) * 100);
    score += exerciseScore;
    factors++;
  }
  if (checkIn.meditation != null) {
    const meditationScore = Math.min(100, (checkIn.meditation / 20) * 100);
    score += meditationScore;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
}

export function calculateStreak(checkIns) {
  if (checkIns.length === 0) return 0;

  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (entryDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}

export function getWeeklyAverage(checkIns) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekData = checkIns.filter((c) => new Date(c.date) >= weekAgo);
  if (weekData.length === 0) return 0;

  const total = weekData.reduce((sum, c) => sum + calculateDailyScore(c), 0);
  return Math.round(total / weekData.length);
}

export function getMonthlyAverage(checkIns) {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const monthData = checkIns.filter((c) => new Date(c.date) >= monthAgo);
  if (monthData.length === 0) return 0;

  const total = monthData.reduce((sum, c) => sum + calculateDailyScore(c), 0);
  return Math.round(total / monthData.length);
}

export function getBestDay(checkIns) {
  if (checkIns.length === 0) return null;
  return checkIns.reduce((best, c) => {
    const score = calculateDailyScore(c);
    const bestScore = calculateDailyScore(best);
    return score > bestScore ? c : best;
  }, checkIns[0]);
}

export function getWorstDay(checkIns) {
  if (checkIns.length === 0) return null;
  return checkIns.reduce((worst, c) => {
    const score = calculateDailyScore(c);
    const worstScore = calculateDailyScore(worst);
    return score < worstScore ? c : worst;
  }, checkIns[0]);
}

export function generateInsights(checkIns) {
  if (checkIns.length < 3) {
    return {
      strengths: [],
      improvements: [],
      tips: ["Log at least 3 days to receive personalized insights."],
      trend: "insufficient",
    };
  }

  const recent = checkIns.slice(0, 7);
  const older = checkIns.slice(7, 14);

  const recentAvg = recent.reduce((s, c) => s + calculateDailyScore(c), 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((s, c) => s + calculateDailyScore(c), 0) / older.length : recentAvg;

  const trend = recentAvg > olderAvg + 5 ? "improving" : recentAvg < olderAvg - 5 ? "declining" : "stable";

  const avgSleep = recent.reduce((s, c) => s + (c.sleepHours || 0), 0) / recent.length;
  const avgWater = recent.reduce((s, c) => s + (c.waterIntake || 0), 0) / recent.length;
  const avgMood = recent.reduce((s, c) => s + (c.mood || 0), 0) / recent.length;
  const avgExercise = recent.reduce((s, c) => s + (c.exercise || 0), 0) / recent.length;
  const avgEnergy = recent.reduce((s, c) => s + (c.energyLevel || 0), 0) / recent.length;

  const strengths = [];
  const improvements = [];
  const tips = [];

  if (avgSleep >= 7) strengths.push("Good sleep habits");
  else improvements.push("Try to get 7-9 hours of sleep");

  if (avgWater >= 6) strengths.push("Well hydrated");
  else tips.push("Increase water intake to 8+ glasses daily");

  if (avgMood >= 4) strengths.push("Positive mood consistency");
  else if (avgMood < 3) improvements.push("Mood is trending low — consider stress management");

  if (avgExercise >= 30) strengths.push("Regular exercise");
  else tips.push("Aim for 30+ minutes of exercise daily");

  if (avgEnergy >= 4) strengths.push("High energy levels");
  else if (avgEnergy < 3) improvements.push("Energy is low — review sleep and nutrition");

  if (trend === "improving") tips.push("Your performance is improving! Keep it up.");
  else if (trend === "declining") tips.push("Performance is declining. Consider adjusting habits.");

  return { strengths, improvements, tips, trend };
}

export function getChartTimelineData(checkIns) {
  return [...checkIns]
    .reverse()
    .slice(-30)
    .map((c) => ({
      date: c.date,
      score: calculateDailyScore(c),
      sleep: c.sleepHours || 0,
      mood: c.mood || 0,
      energy: c.energyLevel || 0,
      exercise: c.exercise || 0,
    }));
}
