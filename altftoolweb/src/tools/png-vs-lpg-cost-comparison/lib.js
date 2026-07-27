/**
 * Piped natural gas (PNG) versus cylinder LPG, compared on equal energy.
 *
 * The two fuels are sold in different units — PNG by volume in standard cubic
 * metres (SCM), LPG by mass in kilograms — so comparing the headline prices is
 * meaningless. The only fair comparison converts both to the heat they deliver
 * into the pan:
 *
 *   useful energy = quantity x calorific value x burner efficiency
 *
 * Equate the useful energy of the two fuels and you get the quantity of one
 * that replaces the other, which is what makes the monthly bills comparable.
 *
 * Calorific values are gross (higher heating value), the basis city gas
 * distributors quote on the bill. Both defaults are editable because the exact
 * figure varies by supplier and by gas composition — your PNG bill states the
 * GCV actually billed.
 */

/** Gross calorific value of LPG, MJ/kg. About 11,850 kcal/kg. */
export const LPG_GCV_MJ_PER_KG = 49.6;

/** Gross calorific value of domestic PNG, MJ/SCM. About 9,500 kcal/SCM. */
export const PNG_GCV_MJ_PER_SCM = 39.75;

/** Net LPG content of a standard Indian domestic cylinder, in kg. */
export const DOMESTIC_CYLINDER_KG = 14.2;

/**
 * Minimum thermal efficiency required of a domestic gas stove by IS 4246.
 * Used as the default for both fuels, since the same stove design is sold for
 * either with only the jets changed.
 */
export const DEFAULT_STOVE_EFFICIENCY_PCT = 68;

/** Megajoules in a kilowatt-hour. */
export const MJ_PER_KWH = 3.6;

/** Kilocalories in a megajoule (1 kcal = 4.184 kJ). */
export const KCAL_PER_MJ = 1000 / 4.184;

export const MONTHS_PER_YEAR = 12;

const MAX_GCV = 200;
const MAX_PRICE = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * SCM of PNG that delivers the same useful heat as one kilogram of LPG.
 * Purely a ratio of calorific values and efficiencies.
 */
export function scmPerKgLpg({
  lpgGcv = LPG_GCV_MJ_PER_KG,
  pngGcv = PNG_GCV_MJ_PER_SCM,
  lpgEfficiencyPct = DEFAULT_STOVE_EFFICIENCY_PCT,
  pngEfficiencyPct = DEFAULT_STOVE_EFFICIENCY_PCT,
} = {}) {
  if (![lpgGcv, pngGcv, lpgEfficiencyPct, pngEfficiencyPct].every(isNum)) return null;
  if (pngGcv <= 0 || pngEfficiencyPct <= 0 || lpgGcv <= 0 || lpgEfficiencyPct <= 0) return null;
  return (lpgGcv * lpgEfficiencyPct) / (pngGcv * pngEfficiencyPct);
}

/**
 * @param {object} input
 * @param {"lpg"|"png"} input.basis     Which fuel your known usage is in.
 * @param {number} input.amount         kg of LPG a month, or SCM of PNG a month.
 * @param {number} input.cylinderPrice  Price of one LPG cylinder.
 * @param {number} input.cylinderKg     Net LPG weight of that cylinder.
 * @param {number} input.pngRatePerScm  PNG rate per SCM.
 * @param {number} [input.pngFixedMonthly] PNG fixed/meter charge a month.
 * @param {number} [input.pngConnectionCost] One-time PNG connection or deposit.
 * @param {number} [input.lpgGcv]       Gross calorific value of LPG, MJ/kg.
 * @param {number} [input.pngGcv]       Gross calorific value of PNG, MJ/SCM.
 * @param {number} [input.lpgEfficiencyPct]
 * @param {number} [input.pngEfficiencyPct]
 */
export function comparePngLpg({
  basis = "lpg",
  amount,
  cylinderPrice,
  cylinderKg = DOMESTIC_CYLINDER_KG,
  pngRatePerScm,
  pngFixedMonthly = 0,
  pngConnectionCost = 0,
  lpgGcv = LPG_GCV_MJ_PER_KG,
  pngGcv = PNG_GCV_MJ_PER_SCM,
  lpgEfficiencyPct = DEFAULT_STOVE_EFFICIENCY_PCT,
  pngEfficiencyPct = DEFAULT_STOVE_EFFICIENCY_PCT,
}) {
  if (basis !== "lpg" && basis !== "png") {
    return { error: "Choose whether your known usage is in LPG kilograms or PNG cubic metres." };
  }
  const numbers = [
    amount,
    cylinderPrice,
    cylinderKg,
    pngRatePerScm,
    pngFixedMonthly,
    pngConnectionCost,
    lpgGcv,
    pngGcv,
    lpgEfficiencyPct,
    pngEfficiencyPct,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (amount <= 0) {
    return { error: "Enter how much gas you use in a month." };
  }
  if (cylinderKg <= 0) {
    return { error: "Cylinder weight must be greater than zero." };
  }
  if (cylinderPrice < 0 || pngRatePerScm < 0 || pngFixedMonthly < 0 || pngConnectionCost < 0) {
    return { error: "Prices and charges cannot be negative." };
  }
  if (cylinderPrice > MAX_PRICE || pngConnectionCost > MAX_PRICE) {
    return { error: "That price looks like a typo — check the cylinder and connection cost." };
  }
  if (lpgGcv <= 0 || lpgGcv > MAX_GCV || pngGcv <= 0 || pngGcv > MAX_GCV) {
    return { error: `Calorific values should be between 0 and ${MAX_GCV} MJ.` };
  }
  if (
    lpgEfficiencyPct <= 0 ||
    lpgEfficiencyPct > 100 ||
    pngEfficiencyPct <= 0 ||
    pngEfficiencyPct > 100
  ) {
    return { error: "Burner efficiency must be between 1% and 100%." };
  }

  const lpgEff = lpgEfficiencyPct / 100;
  const pngEff = pngEfficiencyPct / 100;

  // Pin the comparison to a fixed quantity of useful heat delivered to the pan.
  let lpgKgPerMonth;
  let pngScmPerMonth;
  let usefulMj;

  if (basis === "lpg") {
    lpgKgPerMonth = amount;
    usefulMj = lpgKgPerMonth * lpgGcv * lpgEff;
    pngScmPerMonth = usefulMj / (pngGcv * pngEff);
  } else {
    pngScmPerMonth = amount;
    usefulMj = pngScmPerMonth * pngGcv * pngEff;
    lpgKgPerMonth = usefulMj / (lpgGcv * lpgEff);
  }

  const usefulKwh = usefulMj / MJ_PER_KWH;
  const usefulKcal = usefulMj * KCAL_PER_MJ;

  const lpgPricePerKg = cylinderPrice / cylinderKg;
  const lpgMonthlyCost = lpgKgPerMonth * lpgPricePerKg;
  const cylindersPerMonth = lpgKgPerMonth / cylinderKg;

  const pngGasCost = pngScmPerMonth * pngRatePerScm;
  const pngMonthlyCost = pngGasCost + pngFixedMonthly;

  const monthlySaving = lpgMonthlyCost - pngMonthlyCost;
  const annualSaving = monthlySaving * MONTHS_PER_YEAR;
  const cheaper = monthlySaving > 0 ? "png" : monthlySaving < 0 ? "lpg" : "equal";
  const savingPct = lpgMonthlyCost > 0 ? (monthlySaving / lpgMonthlyCost) * 100 : 0;

  const connectionPaybackMonths =
    monthlySaving > 0 && pngConnectionCost > 0 ? pngConnectionCost / monthlySaving : null;

  const lpgCostPerKwh = usefulKwh > 0 ? lpgMonthlyCost / usefulKwh : null;
  const pngCostPerKwh = usefulKwh > 0 ? pngMonthlyCost / usefulKwh : null;

  const equivalence = scmPerKgLpg({ lpgGcv, pngGcv, lpgEfficiencyPct, pngEfficiencyPct });

  let verdict;
  if (cheaper === "equal") {
    verdict = "The two work out to exactly the same monthly bill for this amount of cooking.";
  } else if (cheaper === "png") {
    verdict = `Piped gas costs ${Math.abs(savingPct).toFixed(1)}% less a month for the same heat in the pan.`;
    if (connectionPaybackMonths !== null) {
      verdict += ` The one-time connection cost is recovered in about ${connectionPaybackMonths.toFixed(0)} months.`;
    }
  } else {
    verdict = `Cylinder LPG works out ${Math.abs(savingPct).toFixed(1)}% cheaper a month once the PNG fixed charge is counted.`;
  }

  return {
    basis,
    lpgKgPerMonth,
    pngScmPerMonth,
    cylindersPerMonth,
    usefulMj,
    usefulKwh,
    usefulKcal,
    lpgPricePerKg,
    lpgMonthlyCost,
    lpgAnnualCost: lpgMonthlyCost * MONTHS_PER_YEAR,
    pngGasCost,
    pngFixedMonthly,
    pngMonthlyCost,
    pngAnnualCost: pngMonthlyCost * MONTHS_PER_YEAR,
    monthlySaving,
    annualSaving,
    savingPct,
    cheaper,
    connectionPaybackMonths,
    pngConnectionCost,
    lpgCostPerKwh,
    pngCostPerKwh,
    equivalence,
    verdict,
  };
}
