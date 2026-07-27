/**
 * Induction hob versus LPG cylinder: cost of the same amount of cooking.
 *
 * The only fair comparison is per unit of USEFUL heat that reaches the pot,
 * because the two appliances waste very different amounts:
 *
 *   useful kWh from 1 kg of LPG      = calorific value x burner efficiency
 *   useful kWh from 1 unit of power  = 1 kWh x hob efficiency
 *
 * Cost per useful kWh then makes the two directly comparable, and inverting the
 * equality gives the electricity tariff at which induction breaks even.
 */

/**
 * Net (lower) calorific value of commercial LPG, a propane-butane mix, in
 * megajoules per kilogram. The gross value is about 49.5 MJ/kg; the net value is
 * the one that matches burner efficiency measured to IS 4246.
 */
export const LPG_NET_CALORIFIC_MJ_PER_KG = 45.5;

/** 1 kWh = 3.6 MJ. */
export const MJ_PER_KWH = 3.6;

/** Energy content of 1 kg of LPG in kWh. */
export const LPG_KWH_PER_KG = LPG_NET_CALORIFIC_MJ_PER_KG / MJ_PER_KWH;

/** The Indian domestic LPG cylinder, in kilograms of gas. */
export const DOMESTIC_CYLINDER_KG = 14.2;

/**
 * IS 4246 sets a minimum thermal efficiency for domestic LPG cooking stoves
 * with open burners; 68% is the current floor, and real kitchens sit close to it
 * because pot size, flame spill and draught all cost efficiency.
 */
export const LPG_STOVE_EFFICIENCY_PERCENT = 68;

/**
 * An induction hob couples energy straight into the pan base, so almost nothing
 * escapes into the room. Measured efficiency is typically 84-90%.
 */
export const INDUCTION_EFFICIENCY_PERCENT = 85;

export const MONTHS_PER_YEAR = 12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Useful (in-the-pot) kWh delivered by one kilogram of LPG at a given burner efficiency. */
export function usefulKwhPerKgLpg(stoveEfficiencyPercent) {
  if (!isNum(stoveEfficiencyPercent) || stoveEfficiencyPercent <= 0) return 0;
  return LPG_KWH_PER_KG * (stoveEfficiencyPercent / 100);
}

/**
 * Compare the two. Returns { error } for input that cannot give a meaningful
 * answer.
 */
export function compareInductionVsLpg({
  cylinderKg = DOMESTIC_CYLINDER_KG,
  cylinderPrice = 900,
  daysPerCylinder = 30,
  lpgStoveEfficiencyPercent = LPG_STOVE_EFFICIENCY_PERCENT,
  inductionEfficiencyPercent = INDUCTION_EFFICIENCY_PERCENT,
  tariffPerKwh = 8,
} = {}) {
  const values = [
    cylinderKg,
    cylinderPrice,
    daysPerCylinder,
    lpgStoveEfficiencyPercent,
    inductionEfficiencyPercent,
    tariffPerKwh,
  ];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (values.some((value) => value < 0)) return { error: "None of these values can be negative." };

  if (cylinderKg <= 0) return { error: "Cylinder weight must be greater than zero." };
  if (cylinderKg > 100) return { error: "Domestic cylinders hold 5 kg to 19 kg of gas — check the weight." };
  if (cylinderPrice <= 0) return { error: "Cylinder price must be greater than zero." };
  if (daysPerCylinder <= 0) return { error: "Days per cylinder must be greater than zero." };
  if (daysPerCylinder > 365) return { error: "A cylinder lasting over a year means you barely cook on gas." };
  if (lpgStoveEfficiencyPercent <= 0 || lpgStoveEfficiencyPercent > 100) {
    return { error: "LPG burner efficiency should be between 1% and 100%." };
  }
  if (inductionEfficiencyPercent <= 0 || inductionEfficiencyPercent > 100) {
    return { error: "Induction hob efficiency should be between 1% and 100%." };
  }
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const lpgEff = lpgStoveEfficiencyPercent / 100;
  const indEff = inductionEfficiencyPercent / 100;

  const pricePerKgLpg = cylinderPrice / cylinderKg;
  const usefulKwhPerKg = LPG_KWH_PER_KG * lpgEff;
  const lpgCostPerUsefulKwh = usefulKwhPerKg > 0 ? pricePerKgLpg / usefulKwhPerKg : 0;
  const inductionCostPerUsefulKwh = tariffPerKwh / indEff;

  /** How much cooking the household actually does, from its own gas consumption. */
  const kgPerDay = cylinderKg / daysPerCylinder;
  const usefulKwhPerDay = kgPerDay * usefulKwhPerKg;
  const usefulKwhPerMonth = usefulKwhPerDay * 30;

  const lpgMonthlyCost = usefulKwhPerMonth * lpgCostPerUsefulKwh;
  const inductionMonthlyKwh = usefulKwhPerMonth / indEff;
  const inductionMonthlyCost = inductionMonthlyKwh * tariffPerKwh;

  const monthlyDifference = lpgMonthlyCost - inductionMonthlyCost;
  const cheaper = monthlyDifference > 0 ? "induction" : monthlyDifference < 0 ? "lpg" : "tie";

  /** Tariff at which the two cost exactly the same per useful kWh. */
  const breakEvenTariff = indEff * lpgCostPerUsefulKwh;
  /** Cylinder price at which the two cost exactly the same, at today's tariff. */
  const breakEvenCylinderPrice = inductionCostPerUsefulKwh * usefulKwhPerKg * cylinderKg;

  return {
    pricePerKgLpg,
    usefulKwhPerKg,
    lpgCostPerUsefulKwh,
    inductionCostPerUsefulKwh,
    kgPerDay,
    usefulKwhPerDay,
    usefulKwhPerMonth,
    lpgMonthlyCost,
    lpgAnnualCost: lpgMonthlyCost * MONTHS_PER_YEAR,
    cylindersPerYear: (365 / daysPerCylinder),
    inductionMonthlyKwh,
    inductionMonthlyCost,
    inductionAnnualCost: inductionMonthlyCost * MONTHS_PER_YEAR,
    inductionAnnualKwh: inductionMonthlyKwh * MONTHS_PER_YEAR,
    monthlyDifference,
    annualDifference: monthlyDifference * MONTHS_PER_YEAR,
    cheaper,
    breakEvenTariff,
    breakEvenCylinderPrice,
  };
}

/** Induction monthly cost across a range of tariffs, against a fixed LPG bill. */
export const TARIFF_SCENARIOS = [4, 5, 6, 7, 8, 10, 12];

export function buildTariffTable(input = {}) {
  const rows = [];
  for (const tariff of TARIFF_SCENARIOS) {
    const result = compareInductionVsLpg({ ...input, tariffPerKwh: tariff });
    if (result.error) return { error: result.error };
    rows.push({
      tariff,
      inductionMonthlyCost: result.inductionMonthlyCost,
      lpgMonthlyCost: result.lpgMonthlyCost,
      monthlyDifference: result.monthlyDifference,
      cheaper: result.cheaper,
    });
  }
  return { rows };
}
