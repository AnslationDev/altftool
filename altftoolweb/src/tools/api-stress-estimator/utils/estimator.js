import { clamp, methodLoadFactor, pickBottleneck } from "./helpers";

const runtimeFactorMap = {
  "Node.js": 1,
  Python: 1.12,
  Go: 0.82,
  Java: 0.9,
};

const dbFactorMap = {
  Postgres: 1,
  MySQL: 1.04,
  MongoDB: 1.1,
  Redis: 0.74,
};

const hostingFactorMap = {
  VPS: 1.06,
  Serverless: 1.14,
  Kubernetes: 0.93,
  Dedicated: 0.86,
};

const modeFactorMap = {
  "Constant Traffic": 1,
  "Sudden Spike": 1.34,
  "Gradual Growth": 1.14,
  "Random Burst": 1.25,
};

const singlePointEstimate = (config, traffic, mode, blackFridayMode) => {
  const methodFactor = methodLoadFactor(config.method);
  const runtimeFactor = runtimeFactorMap[config.runtime] ?? 1;
  const dbFactor = dbFactorMap[config.dbType] ?? 1;
  const hostingFactor = hostingFactorMap[config.hostingType] ?? 1;
  const cacheFactor = config.cacheEnabled ? 0.78 : 1.12;
  const modeFactor = modeFactorMap[mode] ?? 1;

  const trafficMultiplier = blackFridayMode ? 1.42 : 1;
  const effectiveRps = traffic * modeFactor * trafficMultiplier;

  const capacityBoost =
    (config.cacheEnabled ? 1.2 : 0.94) *
    (config.hostingType === "Dedicated" ? 1.16 : 1) *
    (config.runtime === "Go" ? 1.18 : config.runtime === "Python" ? 0.9 : 1);
  const capacity = Math.max(config.cpuCores * 250 * capacityBoost, 100);
  const loadRatio = effectiveRps / capacity;

  const cpuUsage = clamp(loadRatio * 100 * methodFactor * runtimeFactor * hostingFactor, 2, 100);

  const ramUsedMb =
    config.concurrentUsers * 5 +
    effectiveRps * (0.42 * methodFactor) +
    (config.cacheEnabled ? effectiveRps * 0.12 : effectiveRps * 0.28);
  const ramUsagePercent = clamp((ramUsedMb / (config.ramGb * 1024)) * 100, 3, 100);

  const coldStartPenalty =
    config.hostingType === "Serverless" ? (mode === "Sudden Spike" || mode === "Random Burst" ? 220 : 90) : 0;
  const responseTime =
    config.baseResponseTime * Math.pow(1 + loadRatio, 2) * methodFactor * dbFactor * cacheFactor + coldStartPenalty;

  const errorRate = clamp(
    Math.max(0, (cpuUsage - 85) * 1.08) + Math.max(0, (ramUsagePercent - 90) * 0.66) + Math.max(0, loadRatio - 1) * 12,
    0,
    99
  );

  const timeoutRisk = clamp(responseTime / 25 + errorRate * 0.5 + Math.max(0, cpuUsage - 90) * 0.5, 0, 100);
  const crashProbability = clamp(
    Math.max(0, cpuUsage - 95) * 3.2 +
      Math.max(0, ramUsagePercent - 90) * 2.1 +
      errorRate * 0.65 +
      (mode === "Sudden Spike" ? 9 : 0),
    0,
    100
  );

  return {
    effectiveRps,
    capacity,
    loadRatio,
    cpuUsage,
    ramUsagePercent,
    responseTime,
    errorRate,
    timeoutRisk,
    crashProbability,
  };
};

export const estimateApiStress = (config, traffic, mode, blackFridayMode) => {
  const base = singlePointEstimate(config, traffic, mode, blackFridayMode);

  const safeFromCpu = (config.cpuCores * 250 * (config.cacheEnabled ? 1.2 : 0.94)) / (methodLoadFactor(config.method) * 1.02);
  const safeFromRam =
    ((config.ramGb * 1024 - config.concurrentUsers * 5) / (0.42 * methodLoadFactor(config.method) + (config.cacheEnabled ? 0.12 : 0.28))) *
    0.84;
  const safeTrafficLimit = clamp(Math.min(safeFromCpu, safeFromRam), 90, 12000);

  const bottleneckCause = pickBottleneck({
    cpuUsage: base.cpuUsage,
    ramUsagePercent: base.ramUsagePercent,
    loadRatio: base.loadRatio,
    dbType: config.dbType,
    cacheEnabled: config.cacheEnabled,
  });

  const healthScore = clamp(
    100 -
      base.cpuUsage * 0.23 -
      base.ramUsagePercent * 0.16 -
      base.errorRate * 0.75 -
      base.timeoutRisk * 0.24 -
      base.crashProbability * 0.34 +
      (config.cacheEnabled ? 6 : 0),
    0,
    100
  );

  const suggestions = [];
  if (base.cpuUsage > 82) suggestions.push("Upgrade CPU cores or move burst traffic to autoscaling nodes.");
  if (!config.cacheEnabled) suggestions.push("Enable Redis cache to reduce repeated compute and DB pressure.");
  if (config.dbType !== "Redis" && base.loadRatio > 0.75) suggestions.push("Optimize database indexes and connection pooling strategy.");
  if (base.responseTime > 800) suggestions.push("Reduce payload size and enable compression for faster transfer.");
  if (config.hostingType === "Serverless" && (mode === "Sudden Spike" || blackFridayMode)) {
    suggestions.push("Pre-warm serverless instances before campaigns to avoid cold starts.");
  }
  if (!suggestions.length) suggestions.push("Current configuration is stable for the selected traffic profile.");

  const chartData = Array.from({ length: 16 }, (_, index) => {
    const req = 100 + index * 650;
    const point = singlePointEstimate(config, req, mode, blackFridayMode);
    return {
      req,
      rps: req,
      latency: Math.round(point.responseTime),
      cpu: Number(point.cpuUsage.toFixed(2)),
      ram: Number(point.ramUsagePercent.toFixed(2)),
      error: Number(point.errorRate.toFixed(2)),
      errorRate: Number(point.errorRate.toFixed(2)),
      safe: req <= safeTrafficLimit ? 1 : 0,
    };
  });

  // Map raw timeoutRisk number (0-100) -> friendly label for UI
  const timeoutLabel =
    base.timeoutRisk > 70 ? "High" : base.timeoutRisk > 35 ? "Medium" : "Low";

  return {
    ...base,
    // Aliases for UI components
    ramUsage: base.ramUsagePercent,
    bottleneck: bottleneckCause,
    timeoutRiskScore: base.timeoutRisk,
    timeoutRisk: timeoutLabel,
    bottleneckCause,
    safeTrafficLimit,
    healthScore,
    suggestions,
    chartData,
  };
};

export const upgradedConfig = (config) => ({
  ...config,
  cpuCores: Math.min(config.cpuCores + 2, 64),
  ramGb: Math.min(config.ramGb + 8, 256),
  cacheEnabled: true,
  hostingType: config.hostingType === "VPS" ? "Kubernetes" : "Dedicated",
});
