export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

export const methodLoadFactor = (method) => {
  if (method === "POST" || method === "PUT") return 1.5;
  if (method === "DELETE") return 1.2;
  return 1;
};

export const asPercent = (value) => `${formatNumber(value, 1)}%`;

export const riskTone = (value) => {
  if (value < 35) return "Low";
  if (value < 70) return "Moderate";
  return "High";
};

export const pickBottleneck = ({ cpuUsage, ramUsagePercent, loadRatio, dbType, cacheEnabled }) => {
  if (cpuUsage > 88) return "CPU saturation";
  if (ramUsagePercent > 88) return "Memory pressure";
  if (!cacheEnabled && loadRatio > 0.9) return "Cache miss overhead";
  if (dbType === "MongoDB" && loadRatio > 0.8) return "Query planner contention";
  if (dbType === "Postgres" && loadRatio > 0.8) return "Connection pooling limit";
  if (loadRatio > 0.7) return "Network queue buildup";
  return "Balanced";
};

export const makeReportText = ({ config, traffic, mode, blackFridayMode, metrics }) => {
  return [
    "API Stress Estimator Report",
    "===========================",
    `Endpoint: ${config.endpoint}`,
    `Method: ${config.method}`,
    `Runtime: ${config.runtime}`,
    `Hosting: ${config.hostingType}`,
    `Traffic: ${traffic} req/sec (${mode}${blackFridayMode ? ", Black Friday mode" : ""})`,
    "",
    `Estimated Response Time: ${formatNumber(metrics.responseTime, 0)} ms`,
    `CPU Usage: ${formatNumber(metrics.cpuUsage, 1)}%`,
    `RAM Usage: ${formatNumber(metrics.ramUsagePercent, 1)}%`,
    `Error Rate: ${formatNumber(metrics.errorRate, 2)}%`,
    `Timeout Risk: ${metrics.timeoutRisk} (${formatNumber(metrics.timeoutRiskScore, 1)})`,
    `Crash Probability: ${formatNumber(metrics.crashProbability, 1)}%`,
    `Safe Traffic Limit: ${formatNumber(metrics.safeTrafficLimit, 0)} req/sec`,
    `Bottleneck: ${metrics.bottleneckCause}`,
    `API Health Score: ${formatNumber(metrics.healthScore, 0)}/100`,
  ].join("\n");
};
