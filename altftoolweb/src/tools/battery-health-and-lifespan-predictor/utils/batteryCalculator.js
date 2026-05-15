import { deviceProfiles } from "./deviceProfiles";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ---------- MOBILE ----------
function calculateMobile(data, profile) {
  const age = Number(data.age || 12);
  const usage = Number(data.usage || 5);
  const heat = data.heat || "low";
  const usageStyle = data.usageStyle || "Moderate (social media, video)";
  const chargingFreqType = data.chargingFrequencyType || "Daily";
  const dailyFrequency = data.dailyFrequency || "Once";
  const weeklyFrequency = data.weeklyFrequency || "Once";
  const chargingStyle = data.chargingStyle || "Balanced (20-80%)";
  const fastCharging = data.fastChargingPercent || "Never";
  const drainBelow20 = data.drainBelow20 || "never";
  const overnightCharging = data.overnightCharging || "no";
  const capacity = Number(data.batteryCapacity || 4000);

  let health = 100;

  const ageDeg = age * 0.12;
  health -= ageDeg;

  let screenMultiplier = 0.3;
  if (usageStyle.includes("Light")) screenMultiplier = 0.2;
  else if (usageStyle.includes("Heavy")) screenMultiplier = 0.5;
  health -= usage * screenMultiplier * (4000 / capacity);

  let heatPenalty = 0;
  if (heat === "medium") heatPenalty = 1;
  if (heat === "high") heatPenalty = 3;
  health -= heatPenalty;

  let freqPenalty = 0;
  if (chargingFreqType === "Daily") {
    if (dailyFrequency === "Twice") freqPenalty = 1;
    else if (dailyFrequency === "Three times") freqPenalty = 2;
  } else if (chargingFreqType === "Weekly") {
    if (weeklyFrequency === "Twice") freqPenalty = 0.5;
    else if (weeklyFrequency === "3+ times") freqPenalty = 1;
  }
  health -= freqPenalty;

  let stylePenalty = 0;
  if (chargingStyle.includes("Full Cycle")) stylePenalty = 2;
  else if (chargingStyle.includes("Top-up")) stylePenalty = 0.5;
  health -= stylePenalty;

  let fastChargePenalty = 0;
  if (fastCharging === "Frequently") fastChargePenalty = 3;
  else if (fastCharging === "Occasionally") fastChargePenalty = 1;
  health -= fastChargePenalty;

  if (drainBelow20 === "rarely") health -= 0.5;
  if (drainBelow20 === "often") health -= 1.5;

  if (overnightCharging === "yes") health -= 0.8;

  health -= (age / profile.lifespanMonths) * 1.5;

  if (health < 40) health -= (40 - health) * 0.2;

  // Estimate cycles used
  const dailyChargeRate =
    chargingFreqType === "Daily"
      ? dailyFrequency === "Twice" ? 2 : dailyFrequency === "Three times" ? 3 : 1
      : chargingFreqType === "Weekly"
      ? weeklyFrequency === "Twice" ? 2/7 : weeklyFrequency === "3+ times" ? 4/7 : 1/7
      : 0.3; // irregular -> ~ 0.3 charges per day
  const cyclesUsed = Math.round(age * 30 * dailyChargeRate);

  health = clamp(health, 5, 100);
  const remainingCap = Math.round(capacity * (health / 100));

  return {
    health,
    remainingCapacity: remainingCap,
    cyclesUsed,
    breakdown: {
      age: ageDeg,
      screenTime: usage * screenMultiplier * (4000 / capacity),
      heat: heatPenalty,
      chargingFreq: freqPenalty,
      chargingStyle: stylePenalty,
      fastCharge: fastChargePenalty,
      drainBelow20: drainBelow20 === "rarely" ? 0.5 : drainBelow20 === "often" ? 1.5 : 0,
      overnight: overnightCharging === "yes" ? 0.8 : 0,
      lifespan: (age / profile.lifespanMonths) * 1.5,
    },
  };
}

// ---------- LAPTOP ----------
function calculateLaptop(data, profile) {
  const age = Number(data.age || 12);
  const usage = Number(data.usage || 5);
  const heat = data.heat || "cool";
  const workload = data.workload || "Moderate";
  const plugged = data.pluggedRatio || "Mostly plugged in";
  const cyclesPerWeekStr = data.chargeCyclesPerWeek || "1-2 times a week";
  const thermalThrottling = data.thermalThrottling || "rare";
  const gamingRender = data.gamingRender || "no";

  let cyclesPerWeek;
  if (cyclesPerWeekStr === "Less than once a week") cyclesPerWeek = 0.5;
  else if (cyclesPerWeekStr === "1-2 times a week") cyclesPerWeek = 1.5;
  else if (cyclesPerWeekStr === "3-4 times a week") cyclesPerWeek = 3.5;
  else if (cyclesPerWeekStr === "5-7 times a week") cyclesPerWeek = 6;
  else if (cyclesPerWeekStr === "Multiple times a day") cyclesPerWeek = 14;
  else cyclesPerWeek = 1.5;

  let health = 100;
  const ageDeg = age * 0.25;
  health -= ageDeg;
  health -= usage * 0.8;

  if (heat === "warm") health -= 3;
  if (heat === "hot") health -= 8;

  let workloadPenalty = 0;
  if (workload === "Heavy") workloadPenalty = 10;
  else if (workload === "Moderate") workloadPenalty = 4;

  if (plugged === "Always plugged in") {
    workloadPenalty *= 0.4;
  } else if (plugged === "Mostly plugged in") {
    workloadPenalty *= 0.7;
  } else if (plugged === "Mostly on battery") {
    workloadPenalty *= 1.2;
  }
  health -= workloadPenalty;

  if (plugged === "Always plugged in") health -= 8;
  else if (plugged === "Mostly plugged in") health -= 4;
  else if (plugged === "Sometimes on battery") health -= 2;

  const totalCycles = cyclesPerWeek * age * 4.3;
  health -= totalCycles * 0.02;

  if (thermalThrottling === "occasional") health -= 2;
  if (thermalThrottling === "frequent") health -= 5;

  if (gamingRender === "light") health -= 2;
  if (gamingRender === "heavy") health -= 5;

  health = clamp(health, 5, 100);
  return {
    health,
    remainingCapacity: null,
    cyclesUsed: Math.round(totalCycles),
    breakdown: {
      age: ageDeg,
      usage: usage * 0.8,
      heat: heat === "warm" ? 3 : heat === "hot" ? 8 : 0,
      workload: workloadPenalty,
      plugged: plugged === "Always plugged in" ? 8 : plugged === "Mostly plugged in" ? 4 : plugged === "Sometimes on battery" ? 2 : 0,
      cycles: totalCycles * 0.02,
      throttling: thermalThrottling === "occasional" ? 2 : thermalThrottling === "frequent" ? 5 : 0,
      gaming: gamingRender === "light" ? 2 : gamingRender === "heavy" ? 5 : 0,
    },
  };
}

// ---------- EV ----------
function calculateEV(data, profile) {
  const age = Number(data.age || 24);
  const dailyKm = Number(data.usage || 40);
  const heat = data.heat || "low";
  const drivingStyle = data.drivingStyle || "Normal (balanced driving)";
  const fastChargingUsage = data.fastChargingUsage || "Never";
  const chargingDepth = data.chargingDepth || "Always charge to 100%";
  const temperatureRange = data.temperatureRange || "Mild (10–25°C)";
  const regenBraking = data.regenBraking || "medium";
  const idleDaysStr = data.idleStorageDaysPerMonth || "0 days (never idle)";

  let avgIdleDaysPerMonth;
  if (idleDaysStr === "0 days (never idle)") avgIdleDaysPerMonth = 0;
  else if (idleDaysStr === "1–3 days") avgIdleDaysPerMonth = 2;
  else if (idleDaysStr === "4–7 days") avgIdleDaysPerMonth = 5.5;
  else if (idleDaysStr === "8–14 days") avgIdleDaysPerMonth = 11;
  else if (idleDaysStr === "15+ days") avgIdleDaysPerMonth = 20;
  else avgIdleDaysPerMonth = 0;

  const totalIdleDays = age * avgIdleDaysPerMonth;
  const idlePenalty = (totalIdleDays / 30) * 0.5;

  let health = 100;

  const ageDeg = age * 0.08;
  health -= ageDeg;

  const distanceStress = (dailyKm / 10) * 1.2;
  health -= distanceStress;

  let heatPenalty = 0;
  if (heat === "medium") heatPenalty = 2;
  if (heat === "high") heatPenalty = 6;
  health -= heatPenalty;

  if (drivingStyle.includes("Sport")) health -= 6;
  else if (drivingStyle.includes("Eco")) health += 1;

  let fastChargePenalty = 0;
  if (fastChargingUsage === "Almost always") fastChargePenalty = 8;
  else if (fastChargingUsage === "Frequently (weekly)") fastChargePenalty = 5;
  else if (fastChargingUsage === "Sometimes (a few times a month)") fastChargePenalty = 2;
  else if (fastChargingUsage === "Rarely (road trips only)") fastChargePenalty = 1;
  health -= fastChargePenalty;

  let depthPenalty = 0;
  if (chargingDepth.includes("Always charge to 100%")) depthPenalty = 4;
  else if (chargingDepth.includes("100% for long trips")) depthPenalty = 2;
  else if (chargingDepth.includes("Strictly keep between 20-80%")) depthPenalty = 0;
  else depthPenalty = 2;
  health -= depthPenalty;

  let tempPenalty = 0;
  if (temperatureRange === "Cold (below 10°C)") tempPenalty = 2;
  else if (temperatureRange === "Warm (25–35°C)") tempPenalty = 3;
  else if (temperatureRange === "Hot (above 35°C)") tempPenalty = 8;
  health -= tempPenalty;

  if (regenBraking === "high") health += 1;

  health -= idlePenalty;

  // Cycles used (rough: 1 cycle per ? km, here assume 1 cycle per 300 km)
  const totalKm = dailyKm * age * 30;
  const cyclesUsed = Math.round(totalKm / 300);

  health = clamp(health, 5, 100);
  const remainingCap = Math.round(Number(data.batteryCapacity || 60) * (health / 100));

  return {
    health,
    remainingCapacity: remainingCap,
    cyclesUsed,
    breakdown: {
      age: ageDeg,
      distance: distanceStress,
      heat: heatPenalty,
      driving: drivingStyle.includes("Sport") ? 6 : drivingStyle.includes("Eco") ? -1 : 0,
      fastCharging: fastChargePenalty,
      depth: depthPenalty,
      temperature: tempPenalty,
      regen: regenBraking === "high" ? -1 : 0,
      idle: idlePenalty,
    },
  };
}

// ---------- MISC ----------
function calculateMisc(data, profile) {
  const age = Number(data.age || 12);
  const usage = Number(data.usage || 3);
  const heat = data.heat || "normal";
  const cyclesPerWeekStr = data.chargeCyclesPerWeek || "1-2 times a week";
  const loadStability = data.loadStability || "stable";
  const cycleStability = data.cycleStability || "regular";
  const idleMonths = Number(data.storageIdleMonths || 0);
  const spikes = data.usageIntensitySpikes || "low";

  let cyclesPerWeek;
  if (cyclesPerWeekStr === "Less than once a week") cyclesPerWeek = 0.5;
  else if (cyclesPerWeekStr === "1-2 times a week") cyclesPerWeek = 1.5;
  else if (cyclesPerWeekStr === "3-4 times a week") cyclesPerWeek = 3.5;
  else if (cyclesPerWeekStr === "5-7 times a week") cyclesPerWeek = 6;
  else if (cyclesPerWeekStr === "Multiple times a day") cyclesPerWeek = 14;
  else cyclesPerWeek = 1.5;

  let health = 100;
  health -= age * 0.2;
  health -= usage * 1.5;
  if (heat === "normal") health -= 2;
  if (heat === "hot") health -= 6;
  const totalCycles = cyclesPerWeek * age * 4.3;
  health -= totalCycles * 0.04;
  if (loadStability === "moderate") health -= 5;
  if (loadStability === "unstable") health -= 12;
  if (cycleStability === "irregular") health -= 7;
  health -= idleMonths * 0.5;
  if (spikes === "medium") health -= 3;
  if (spikes === "high") health -= 8;

  health = clamp(health, 5, 100);
  return {
    health,
    remainingCapacity: null,
    cyclesUsed: Math.round(totalCycles),
    breakdown: {
      age: age * 0.2,
      usage: usage * 1.5,
      heat: heat === "normal" ? 2 : heat === "hot" ? 6 : 0,
      cycles: totalCycles * 0.04,
      loadStability: loadStability === "moderate" ? 5 : loadStability === "unstable" ? 12 : 0,
      cycleStability: cycleStability === "irregular" ? 7 : 0,
      idle: idleMonths * 0.5,
      spikes: spikes === "medium" ? 3 : spikes === "high" ? 8 : 0,
    },
  };
}

// ---------- FORECAST ----------
function forecast(data, profile, monthsAhead) {
  const futureData = { ...data, age: Number(data.age) + monthsAhead };
  switch (profile.category) {
    case "mobile": return calculateMobile(futureData, profile).health;
    case "laptop": return calculateLaptop(futureData, profile).health;
    case "ev": return calculateEV(futureData, profile).health;
    default: return calculateMisc(futureData, profile).health;
  }
}

// ---------- MAIN EXPORT ----------
export function calculateBatteryHealth(data) {
  const device = data.device || "phone";
  const profile = deviceProfiles[device] || deviceProfiles.phone;

  let resultCore;
  switch (profile.category) {
    case "mobile": resultCore = calculateMobile(data, profile); break;
    case "laptop": resultCore = calculateLaptop(data, profile); break;
    case "ev": resultCore = calculateEV(data, profile); break;
    default: resultCore = calculateMisc(data, profile);
  }

  const health = resultCore.health;
  let condition;
  if (health >= 80) condition = "Good";
  else if (health >= 60) condition = "Fair";
  else condition = "Poor";

  let usageScore = 100;
  usageScore -= (Number(data.age) || 0) * 0.1;
  usageScore -= (Number(data.usage) || 0) * 1.5;
  if (data.heat === "high" || data.heat === "hot") usageScore -= 10;

  if (profile.category === "mobile") {
    if (data.fastChargingPercent === "Frequently") usageScore -= 5;
    else if (data.fastChargingPercent === "Occasionally") usageScore -= 2;
    if (data.usageStyle?.includes("Heavy")) usageScore -= 8;
    if (data.chargingStyle?.includes("Full Cycle")) usageScore -= 6;
    if (data.drainBelow20 === "often") usageScore -= 4;
    if (data.overnightCharging === "yes") usageScore -= 2;
  } else if (profile.category === "laptop") {
    const plugged = data.pluggedRatio || "Mostly plugged in";
    if (data.workload === "Heavy") {
      if (plugged === "Always plugged in") usageScore -= 4;
      else if (plugged === "Mostly plugged in") usageScore -= 7;
      else if (plugged === "Mostly on battery") usageScore -= 12;
      else usageScore -= 10;
    }
    if (plugged === "Always plugged in") usageScore -= 8;
    else if (plugged === "Mostly plugged in") usageScore -= 4;
    if (data.gamingRender === "heavy") usageScore -= 5;
  } else if (profile.category === "ev") {
    const fastChargeStr = data.fastChargingUsage || "Never";
    if (fastChargeStr === "Almost always") usageScore -= 10;
    else if (fastChargeStr === "Frequently (weekly)") usageScore -= 6;
    else if (fastChargeStr === "Sometimes (a few times a month)") usageScore -= 3;
    if (data.drivingStyle?.includes("Sport")) usageScore -= 8;
    const depth = data.chargingDepth || "Always charge to 100%";
    if (depth.includes("Always charge to 100%")) usageScore -= 6;
    else if (depth.includes("100% for long trips")) usageScore -= 3;
  } else if (profile.category === "misc") {
    if (data.loadStability === "unstable") usageScore -= 15;
    if (data.cycleStability === "irregular") usageScore -= 10;
  }
  usageScore = clamp(usageScore, 0, 100);

  const monthsLeft = Math.max(0, profile.lifespanMonths - (Number(data.age) || 0));

  const chartData = [0, 3, 6, 12].map((offset) => ({
    name: offset === 0 ? "Now" : `${offset}M`,
    value: forecast(data, profile, offset),
  }));

  const optimisedData = {
    ...data,
    heat: "low",
    usageStyle: "Light (browsing, calls)",
    chargingFrequencyType: "Daily",
    dailyFrequency: "Once",
    chargingStyle: "Balanced (20-80%)",
    fastChargingPercent: "Never",
    drainBelow20: "never",
    overnightCharging: "no",
    workload: "Light",
    pluggedRatio: "Mostly on battery",
    chargeCyclesPerWeek: "Less than once a week",
    thermalThrottling: "rare",
    gamingRender: "no",
    drivingStyle: "Eco (gentle acceleration, low speeds)",
    fastChargingUsage: "Never",
    chargingDepth: "Strictly keep between 20-80%",
    temperatureRange: "Mild (10–25°C)",
    regenBraking: "high",
    idleStorageDaysPerMonth: "0 days (never idle)",
    loadStability: "stable",
    cycleStability: "regular",
    storageIdleMonths: 0,
    usageIntensitySpikes: "low",
  };
  const optimizedChart = [0, 3, 6, 12].map((offset) => ({
    name: offset === 0 ? "Now" : `${offset}M`,
    value: forecast(optimisedData, profile, offset),
  }));

  const tips = [];
  if (profile.category === "mobile") {
    if (data.heat === "high") tips.push("Avoid high heat; it degrades battery faster.");
    if (data.fastChargingPercent === "Frequently") tips.push("Reduce fast charging to preserve long‑term health.");
    if (data.drainBelow20 === "often") tips.push("Try not to let the battery drop below 20% frequently.");
    if (data.overnightCharging === "yes") tips.push("Overnight charging can cause slight stress; consider unplugging when full.");
  } else if (profile.category === "laptop") {
    const plugged = data.pluggedRatio || "Mostly plugged in";
    if (plugged === "Always plugged in") tips.push("Unplug when fully charged occasionally to avoid high SoC stress.");
    if (data.workload === "Heavy" && plugged === "Mostly on battery")
      tips.push("Heavy work on battery generates extra heat & stress – consider staying plugged in for demanding tasks.");
    if (data.gamingRender === "heavy") tips.push("Heavy gaming increases heat; use a cooling pad.");
  } else if (profile.category === "ev") {
    if (data.fastChargingUsage === "Almost always" || data.fastChargingUsage === "Frequently (weekly)")
      tips.push("Limit fast charging to long trips; slow charging is gentler.");
    if (data.chargingDepth?.includes("Always charge to 100%"))
      tips.push("Charging only to 80% for daily use can extend life.");
    if (data.temperatureRange === "Hot (above 35°C)")
      tips.push("High temperatures accelerate battery ageing; park in shade if possible.");
    if (data.idleStorageDaysPerMonth && data.idleStorageDaysPerMonth !== "0 days (never idle)")
      tips.push("Even short idle periods can cause calendar aging; try to use the vehicle regularly.");
  } else {
    if (data.loadStability === "unstable") tips.push("Stabilise the load to avoid voltage stress.");
    if (data.cycleStability === "irregular") tips.push("Try to keep charge/discharge patterns consistent.");
  }
  if (tips.length === 0) tips.push("Your current habits are battery‑friendly!");

  const cyclesUsed = resultCore.cyclesUsed || 0;
  const cycleLifespan = profile.cycleLifespan || 500;
  const remainingCycles = Math.max(0, cycleLifespan - cyclesUsed);

  return {
    health,
    condition,
    usageScore,
    monthsLeft,
    chartData,
    optimizedChart,
    device,
    remainingCapacity: resultCore.remainingCapacity,
    breakdown: resultCore.breakdown,
    tips,
    cyclesUsed,
    cycleLifespan,
    remainingCycles,
  };
}