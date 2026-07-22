export const calculateStats = (subjects) => {
  if (!subjects || subjects.length === 0) return null;

  const totalObtained = subjects.reduce((sum, sub) => sum + (parseFloat(sub.obtained) || 0), 0);
  const totalMax = subjects.reduce((sum, sub) => sum + (parseFloat(sub.total) || 0), 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const average = subjects.length > 0 ? totalObtained / subjects.length : 0;

  let highest = subjects[0];
  let lowest = subjects[0];

  subjects.forEach((sub) => {
    const subPerc = (parseFloat(sub.obtained) / parseFloat(sub.total)) * 100;
    const highPerc = (parseFloat(highest.obtained) / parseFloat(highest.total)) * 100;
    const lowPerc = (parseFloat(lowest.obtained) / parseFloat(lowest.total)) * 100;

    if (subPerc > highPerc) highest = sub;
    if (subPerc < lowPerc) lowest = sub;
  });

  return {
    totalObtained,
    totalMax,
    percentage: percentage.toFixed(2),
    average: average.toFixed(2),
    highestSubject: highest.name || "N/A",
    lowestSubject: lowest.name || "N/A",
    passStatus: percentage >= 40 ? "Pass" : "Fail",
    grade: getGrade(percentage),
    rank: getRankEstimation(percentage),
  };
};

export const getGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 40) return "D";
  return "Fail";
};

export const getRankEstimation = (percentage) => {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 75) return "Above Average";
  if (percentage >= 50) return "Average";
  return "Needs Improvement";
};

export const getInsights = (stats, subjects) => {
  const insights = [];

  if (stats.percentage >= 90) {
    insights.push({
      type: "success",
      title: "Outstanding Performance!",
      message: "You have achieved an exceptional score. Keep up this incredible momentum!",
    });
  } else if (stats.percentage >= 75) {
    insights.push({
      type: "info",
      title: "Great Job!",
      message: "Your performance is strong. A little more focus on weaker areas can push you to the top tier.",
    });
  }

  if (stats.highestSubject && stats.highestSubject !== "N/A") {
    insights.push({
      type: "highlight",
      title: `Strongest: ${stats.highestSubject}`,
      message: `Your mastery in ${stats.highestSubject} is impressive. You could mentor others in this subject!`,
    });
  }

  if (stats.lowestSubject && stats.lowestSubject !== "N/A" && stats.percentage < 95) {
    insights.push({
      type: "warning",
      title: `Improvement Needed: ${stats.lowestSubject}`,
      message: `Focus more on ${stats.lowestSubject} numerical practice and conceptual understanding to boost your overall grade.`,
    });
  }

  const recommendations = [
    "Create a dedicated revision schedule for weaker subjects.",
    "Solve previous year question papers to understand exam patterns.",
    "Take regular mock tests to improve time management.",
    "Discuss complex topics with teachers or study groups.",
  ];

  return {
    insights,
    recommendations: recommendations.slice(0, 3),
    motivation: getMotivation(stats.percentage),
  };
};

const getMotivation = (percentage) => {
  if (percentage >= 90) return "Outstanding Performance!";
  if (percentage >= 80) return "You're Improving Consistently!";
  if (percentage >= 60) return "Keep Practicing!";
  return "Don't give up, persistence is key!";
};
