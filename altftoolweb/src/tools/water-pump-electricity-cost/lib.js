/**
 * Home water pump running cost.
 *
 * The horsepower stamped on a pump is SHAFT output, not what the motor pulls
 * from the meter. A single-phase induction motor of this size runs at roughly
 * 70-78% efficiency, so:
 *
 *   input kW = HP x 0.7457 / motor efficiency
 *
 * Runtime comes from the physical job — tank litres divided by the pump's flow
 * rate — rather than from a guess, and the hydraulic power actually delivered is
 * checked with the standard pump equation:
 *
 *   hydraulic kW = density x g x flow x head / 1000
 */

/** One mechanical horsepower in watts (the definition, 550 ft-lbf/s). */
export const WATTS_PER_HP = 745.7;

/** Standard gravity, m/s^2. */
export const GRAVITY = 9.81;

/** Density of water, kg per cubic metre. */
export const WATER_DENSITY_KG_PER_M3 = 1000;

export const MINUTES_PER_HOUR = 60;
export const LITRES_PER_M3 = 1000;
export const MONTHS_PER_YEAR = 12;

/**
 * Typical full-load efficiency of a small single-phase induction motor on a
 * domestic monoblock or self-priming pump. Three-phase and BEE star-rated pumps
 * do better; old rewound motors do considerably worse.
 */
export const TYPICAL_MOTOR_EFFICIENCY_PERCENT = 72;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Electrical power the motor draws, in kW. */
export function inputPowerKw(horsepower, motorEfficiencyPercent) {
  if (!isNum(horsepower) || !isNum(motorEfficiencyPercent)) return 0;
  if (horsepower <= 0 || motorEfficiencyPercent <= 0) return 0;
  return (horsepower * WATTS_PER_HP) / (motorEfficiencyPercent / 100) / 1000;
}

/**
 * Useful hydraulic power put into the water, in kW.
 * flowLpm is litres per minute, headMetres is total head (static lift plus
 * friction losses).
 */
export function hydraulicPowerKw(flowLpm, headMetres) {
  if (!isNum(flowLpm) || !isNum(headMetres)) return 0;
  if (flowLpm <= 0 || headMetres <= 0) return 0;
  const flowM3PerSecond = flowLpm / (LITRES_PER_M3 * MINUTES_PER_HOUR);
  return (WATER_DENSITY_KG_PER_M3 * GRAVITY * flowM3PerSecond * headMetres) / 1000;
}

/**
 * Full running cost. Returns { error } for input that cannot give a meaningful
 * answer.
 */
export function computePumpCost({
  horsepower = 1,
  motorEfficiencyPercent = TYPICAL_MOTOR_EFFICIENCY_PERCENT,
  flowLpm = 60,
  headMetres = 25,
  tankLitres = 1000,
  fillsPerDay = 2,
  daysPerMonth = 30,
  tariffPerKwh = 8,
} = {}) {
  const values = [
    horsepower,
    motorEfficiencyPercent,
    flowLpm,
    headMetres,
    tankLitres,
    fillsPerDay,
    daysPerMonth,
    tariffPerKwh,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Enter valid numbers in every field." };
  if (values.some((value) => value < 0)) return { error: "None of these values can be negative." };

  if (horsepower <= 0) return { error: "Pump rating must be greater than zero." };
  if (horsepower > 25) return { error: "Domestic pumps are 0.5 HP to 5 HP — check the rating." };
  if (motorEfficiencyPercent <= 0 || motorEfficiencyPercent > 100) {
    return { error: "Motor efficiency should be between 1% and 100%." };
  }
  if (flowLpm <= 0) return { error: "Flow rate must be greater than zero, or the pump never fills the tank." };
  if (flowLpm > 5000) return { error: "That flow rate is industrial — check the litres per minute." };
  if (headMetres > 300) return { error: "Total head above 300 m is beyond a domestic pump." };
  if (tankLitres <= 0) return { error: "Tank capacity must be greater than zero." };
  if (tankLitres > 100000) return { error: "Check the tank size — that is over one lakh litres." };
  if (fillsPerDay > 50) return { error: "More than 50 tank fills a day looks like a typo." };
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days used per month should be between 1 and 31." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const drawKw = inputPowerKw(horsepower, motorEfficiencyPercent);
  const minutesPerFill = tankLitres / flowLpm;
  const minutesPerDay = minutesPerFill * fillsPerDay;
  const hoursPerDay = minutesPerDay / MINUTES_PER_HOUR;

  if (hoursPerDay > 24) {
    return { error: "That much water needs more than 24 hours of pumping a day — check flow or fills." };
  }

  const litresPerDay = tankLitres * fillsPerDay;
  const kwhPerDay = drawKw * hoursPerDay;
  const costPerDay = kwhPerDay * tariffPerKwh;

  const hydraulicKw = hydraulicPowerKw(flowLpm, headMetres);
  const wireToWaterEfficiency = drawKw > 0 ? (hydraulicKw / drawKw) * 100 : 0;

  return {
    drawKw,
    drawWatts: drawKw * 1000,
    currentAmps: (drawKw * 1000) / 230,
    minutesPerFill,
    minutesPerDay,
    hoursPerDay,
    litresPerDay,
    litresPerMonth: litresPerDay * daysPerMonth,
    kwhPerFill: drawKw * (minutesPerFill / MINUTES_PER_HOUR),
    costPerFill: drawKw * (minutesPerFill / MINUTES_PER_HOUR) * tariffPerKwh,
    kwhPerDay,
    costPerDay,
    monthlyKwh: kwhPerDay * daysPerMonth,
    monthlyCost: costPerDay * daysPerMonth,
    annualKwh: kwhPerDay * daysPerMonth * MONTHS_PER_YEAR,
    annualCost: costPerDay * daysPerMonth * MONTHS_PER_YEAR,
    costPer1000Litres: litresPerDay > 0 ? (costPerDay / litresPerDay) * LITRES_PER_M3 : 0,
    hydraulicKw,
    wireToWaterEfficiency,
  };
}

/** Running cost across the common domestic pump ratings, same job. */
export const HP_SCENARIOS = [0.5, 0.75, 1, 1.5, 2, 3];

export function buildHpComparison(input = {}) {
  const rows = [];
  for (const hp of HP_SCENARIOS) {
    const result = computePumpCost({ ...input, horsepower: hp });
    if (result.error) continue;
    rows.push({
      hp,
      drawWatts: result.drawWatts,
      kwhPerDay: result.kwhPerDay,
      monthlyCost: result.monthlyCost,
    });
  }
  return { rows };
}
