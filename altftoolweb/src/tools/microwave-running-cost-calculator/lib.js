/**
 * Microwave oven running cost.
 *
 * The number printed on the front of a microwave (700 W, 800 W, 900 W) is the
 * COOKING OUTPUT power, not what the oven draws from the socket. The magnetron
 * and its high-voltage transformer are roughly 65% efficient, so an 800 W oven
 * pulls about 1230 W from the wall. Grill and convection modes use plain
 * resistive elements, where the rated wattage IS the draw.
 *
 * Two further details matter and are modelled here:
 *  - a power level below 100% does not reduce the draw, it switches the
 *    magnetron on and off, so energy scales with the percentage;
 *  - a convection element cycles on a thermostat once the cavity is up to
 *    temperature, so only the preheat runs at full duty.
 */

/**
 * Magnetron plus transformer efficiency on a domestic oven: output power
 * divided by input power. An 800 W oven typically measures 1200-1250 W input.
 */
export const MAGNETRON_EFFICIENCY = 0.65;

/** Minutes in an hour, watts in a kilowatt. */
export const MINUTES_PER_HOUR = 60;
export const WATTS_PER_KW = 1000;
export const HOURS_PER_DAY = 24;
export const MONTHS_PER_YEAR = 12;

export const MODES = {
  solo: {
    id: "solo",
    label: "Solo microwave",
    powerLabel: "Rated microwave output power (W)",
    defaultPowerW: 800,
    /** Rated figure is cooking OUTPUT, so divide by magnetron efficiency to get the draw. */
    ratedIsOutput: true,
    /** Magnetron runs continuously while on. */
    dutyCycle: 1,
    supportsPreheat: false,
    note: "The wattage on the door is cooking output. An 800 W oven draws roughly 1230 W from the socket.",
  },
  grill: {
    id: "grill",
    label: "Grill (quartz element)",
    powerLabel: "Rated grill element power (W)",
    defaultPowerW: 1100,
    ratedIsOutput: false,
    /** A grill element runs almost continuously, with a small thermostat cut-out. */
    dutyCycle: 0.95,
    supportsPreheat: false,
    note: "A resistive grill element draws its full rated wattage the whole time it glows.",
  },
  convection: {
    id: "convection",
    label: "Convection (baking)",
    powerLabel: "Rated convection element power (W)",
    defaultPowerW: 1400,
    ratedIsOutput: false,
    /** After preheat the thermostat cycles the element; roughly 60% on-time. */
    dutyCycle: 0.6,
    supportsPreheat: true,
    note: "Preheat runs the element flat out; after that the thermostat cycles it roughly 60% of the time.",
  },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Power actually drawn from the socket, in watts. */
export function inputPowerWatts(ratedPowerW, modeId) {
  const mode = MODES[modeId];
  if (!mode || !isNum(ratedPowerW) || ratedPowerW <= 0) return 0;
  return mode.ratedIsOutput ? ratedPowerW / MAGNETRON_EFFICIENCY : ratedPowerW;
}

/**
 * Energy for one run, in kWh.
 * Preheat minutes always run at full duty; cooking minutes run at the mode's
 * duty cycle scaled by the selected power level.
 */
export function energyPerRunKwh({
  ratedPowerW,
  modeId,
  cookMinutes,
  preheatMinutes = 0,
  powerLevelPercent = 100,
}) {
  const mode = MODES[modeId];
  if (!mode) return 0;
  const watts = inputPowerWatts(ratedPowerW, modeId);
  if (watts <= 0) return 0;
  if (!isNum(cookMinutes) || cookMinutes < 0) return 0;
  const preheat = mode.supportsPreheat && isNum(preheatMinutes) && preheatMinutes > 0 ? preheatMinutes : 0;
  const level = isNum(powerLevelPercent) ? Math.min(100, Math.max(0, powerLevelPercent)) / 100 : 1;
  const effectiveHours =
    preheat / MINUTES_PER_HOUR + (cookMinutes / MINUTES_PER_HOUR) * mode.dutyCycle * level;
  return (watts / WATTS_PER_KW) * effectiveHours;
}

/**
 * Full running cost. Returns { error } for input that cannot give a meaningful
 * number.
 */
export function computeMicrowaveCost({
  modeId = "solo",
  ratedPowerW = 800,
  powerLevelPercent = 100,
  cookMinutes = 4,
  preheatMinutes = 0,
  usesPerDay = 3,
  standbyWatts = 3,
  daysPerMonth = 30,
  tariffPerKwh = 8,
} = {}) {
  const mode = MODES[modeId];
  if (!mode) return { error: "Choose a cooking mode from the list." };

  const values = [
    ratedPowerW,
    powerLevelPercent,
    cookMinutes,
    preheatMinutes,
    usesPerDay,
    standbyWatts,
    daysPerMonth,
    tariffPerKwh,
  ];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (values.some((value) => value < 0)) return { error: "None of these values can be negative." };

  if (ratedPowerW <= 0) return { error: "Rated power must be greater than zero." };
  if (ratedPowerW > 5000) return { error: "Domestic microwaves are rated 600 W to 2000 W — check the power." };
  if (powerLevelPercent <= 0 || powerLevelPercent > 100) {
    return { error: "Power level should be between 1% and 100%." };
  }
  if (cookMinutes > 240) return { error: "A single run longer than four hours looks like a typo." };
  if (usesPerDay > 100) return { error: "More than 100 runs a day is a commercial kitchen, not a home oven." };
  if (standbyWatts > 50) return { error: "Standby draw on a microwave is 1 W to 5 W — check that figure." };
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days used per month should be between 1 and 31." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const drawWatts = inputPowerWatts(ratedPowerW, modeId);
  const runKwh = energyPerRunKwh({
    ratedPowerW,
    modeId,
    cookMinutes,
    preheatMinutes,
    powerLevelPercent,
  });

  const cookingKwhPerDay = runKwh * usesPerDay;
  /** Standby runs every hour of every day, whether or not you cook. */
  const standbyKwhPerDay = (standbyWatts / WATTS_PER_KW) * HOURS_PER_DAY;
  const kwhPerDay = cookingKwhPerDay + standbyKwhPerDay;

  const costPerRun = runKwh * tariffPerKwh;
  const costPerDay = kwhPerDay * tariffPerKwh;
  const monthlyKwh = kwhPerDay * daysPerMonth;
  const standbyAnnualKwh = standbyKwhPerDay * daysPerMonth * MONTHS_PER_YEAR;

  return {
    modeLabel: mode.label,
    modeNote: mode.note,
    drawWatts,
    runKwh,
    costPerRun,
    cookingKwhPerDay,
    standbyKwhPerDay,
    kwhPerDay,
    costPerDay,
    monthlyKwh,
    monthlyCost: costPerDay * daysPerMonth,
    annualKwh: monthlyKwh * MONTHS_PER_YEAR,
    annualCost: costPerDay * daysPerMonth * MONTHS_PER_YEAR,
    standbyAnnualKwh,
    standbyAnnualCost: standbyAnnualKwh * tariffPerKwh,
    standbyShare: kwhPerDay > 0 ? (standbyKwhPerDay / kwhPerDay) * 100 : 0,
  };
}

/** Common kitchen jobs, so the per-meal figure is easy to sanity check. */
export const COMMON_TASKS = [
  { id: "reheat-plate", label: "Reheat a plate of food", modeId: "solo", cookMinutes: 2, preheatMinutes: 0 },
  { id: "warm-milk", label: "Warm a glass of milk", modeId: "solo", cookMinutes: 1.5, preheatMinutes: 0 },
  { id: "defrost", label: "Defrost 500 g at 30% power", modeId: "solo", cookMinutes: 8, preheatMinutes: 0, powerLevelPercent: 30 },
  { id: "cook-rice", label: "Cook rice or dal", modeId: "solo", cookMinutes: 15, preheatMinutes: 0 },
  { id: "grill-paneer", label: "Grill paneer or toast", modeId: "grill", cookMinutes: 10, preheatMinutes: 0 },
  { id: "bake-cake", label: "Bake a cake", modeId: "convection", cookMinutes: 25, preheatMinutes: 8 },
];

export function buildTaskTable({ ratedPowerW, grillPowerW, convectionPowerW, tariffPerKwh }) {
  const powerFor = (modeId) => {
    if (modeId === "grill") return grillPowerW;
    if (modeId === "convection") return convectionPowerW;
    return ratedPowerW;
  };
  const rows = [];
  for (const task of COMMON_TASKS) {
    const kwh = energyPerRunKwh({
      ratedPowerW: powerFor(task.modeId),
      modeId: task.modeId,
      cookMinutes: task.cookMinutes,
      preheatMinutes: task.preheatMinutes,
      powerLevelPercent: task.powerLevelPercent ?? 100,
    });
    const cost = isNum(tariffPerKwh) && tariffPerKwh > 0 ? kwh * tariffPerKwh : 0;
    rows.push({ ...task, kwh, cost });
  }
  return rows;
}
