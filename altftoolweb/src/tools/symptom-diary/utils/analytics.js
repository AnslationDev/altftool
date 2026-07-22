export const calculateStats = (logs) => {
  if (!logs || logs.length === 0) return null;

  const totalEntries = logs.length;

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = logs.filter(log => log.date === today).length;

  const avgSeverity = (logs.reduce((acc, log) => acc + Number(log.severity), 0) / totalEntries).toFixed(1);

  const symptomCounts = {};
  logs.forEach(log => {
    symptomCounts[log.symptom] = (symptomCounts[log.symptom] || 0) + 1;
  });

  const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    totalEntries,
    todayEntries,
    avgSeverity,
    topSymptom
  };
};

export const getChartData = (logs) => {
  if (!logs || logs.length === 0) return { severityTrend: [], categoryDistribution: [], triggerAnalysis: [], sleepTrend: [], severityDistribution: [], symptomDistribution: [] };

  // Severity Trend (last 7 days or last 10 entries)
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const severityTrend = sortedLogs.slice(-10).map(log => ({
    date: log.date.split("-").slice(1).join("/"),
    severity: Number(log.severity),
    symptom: log.symptom
  }));

  // Category Distribution
  const categoryCounts = {};
  logs.forEach(log => {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  // Trigger Analysis
  const triggerCounts = {};
  logs.forEach(log => {
    if (log.trigger && log.trigger !== "None") {
      triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
    }
  });
  const triggerAnalysis = Object.entries(triggerCounts).map(([name, value]) => ({ name, value }));

  // Sleep Trend
  const sleepTrend = sortedLogs.slice(-10).map(log => ({
    date: log.date.split("-").slice(1).join("/"),
    sleepQuality: Number(log.sleepQuality || 0),
    severity: Number(log.severity)
  }));

  // Severity Distribution
  const severityCounts = { Mild: 0, Moderate: 0, Severe: 0 };
  logs.forEach(log => {
    const s = Number(log.severity);
    if (s <= 3) severityCounts.Mild++;
    else if (s <= 7) severityCounts.Moderate++;
    else severityCounts.Severe++;
  });
  const severityDistribution = Object.entries(severityCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  // Symptom Distribution
  const symCounts = {};
  logs.forEach(log => {
    symCounts[log.symptom] = (symCounts[log.symptom] || 0) + 1;
  });
  const symptomDistribution = Object.entries(symCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  return {
    severityTrend,
    categoryDistribution,
    triggerAnalysis,
    sleepTrend,
    severityDistribution,
    symptomDistribution
  };
};

export const getSmartInsights = (logs) => {
  if (!logs || logs.length < 3) return ["Add more logs to see smart insights."];

  const insights = [];

  // Insight 1: Stress relationship
  const stressRelated = logs.filter(log => log.trigger === "Stress").length;
  if (stressRelated >= 3) {
    insights.push(`Stress-related symptoms appeared ${stressRelated} times. Consider relaxation techniques.`);
  }

  // Insight 2: Sleep quality relationship
  const poorSleepLogs = logs.filter(log => Number(log.sleepQuality) <= 4);
  if (poorSleepLogs.length >= 2) {
    const avgSeverityPoorSleep = poorSleepLogs.reduce((acc, log) => acc + Number(log.severity), 0) / poorSleepLogs.length;
    insights.push(`Symptoms tend to be more severe (${avgSeverityPoorSleep.toFixed(1)}) after poor sleep.`);
  }

  // Insight 3: Trend
  const latestSeverity = Number(logs[0].severity);
  const prevSeverity = Number(logs[1].severity);
  if (latestSeverity < prevSeverity) {
    insights.push("Your symptom severity is trending downwards. Keep it up!");
  } else if (latestSeverity > prevSeverity) {
    insights.push("Your latest symptom was more severe than the previous one. Monitor closely.");
  }

  return insights.slice(0, 3);
};
