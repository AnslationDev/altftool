/**
 * Nitrogen versus compressed air: does the claimed pressure retention pay for
 * the filling charge?
 *
 * The physical claim behind nitrogen filling is real but narrow. Ordinary air
 * is already about 78% nitrogen; a nitrogen fill raises that to roughly 95-99%.
 * Oxygen molecules permeate butyl inner liners several times faster than
 * nitrogen molecules, so a nitrogen-filled tyre loses pressure more slowly.
 * Nothing else about the tyre changes: a nitrogen-filled tyre still needs
 * checking, still gets punctures and still ages.
 *
 * The money therefore comes from ONE mechanism — spending less time
 * under-inflated between checks — which shows up as fuel burn and tread life.
 */

/**
 * Typical loss through the liner, bead and valve for a healthy tyre on
 * compressed air. Tyre industry guidance and vehicle handbooks both put normal
 * seepage at roughly 1-2 psi per month.
 */
export const DEFAULT_AIR_LOSS_PSI_PER_MONTH = 1.5;

/**
 * Nitrogen's share of that loss. Oxygen diffuses through butyl roughly three to
 * four times faster than nitrogen, so a high-purity nitrogen fill loses about a
 * third as much pressure per month. Kept as a named factor so you can change it.
 */
export const NITROGEN_LOSS_FACTOR = 1 / 3;

/**
 * Fuel economy penalty per psi of under-inflation across all tyres. The US
 * Department of Energy's fueleconomy.gov figure is about 0.2% of fuel economy
 * per 1 psi drop in the average pressure of all four tyres.
 */
export const FUEL_PENALTY_PER_PSI = 0.002;

/**
 * Tread life lost per 1% of under-inflation. Tyre makers commonly report that a
 * tyre run 20% under-inflated loses of the order of 20-30% of its tread life;
 * 1.0 is the conservative end of that range.
 */
export const TREAD_LOSS_PER_PERCENT_UNDER = 1.0;

/** Months in a year, used to turn a check interval into events per year. */
export const MONTHS_PER_YEAR = 12;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const finite = (value) => Number.isFinite(value);

/**
 * Average pressure deficit over one check cycle.
 *
 * Pressure falls roughly linearly between top-ups, so the tyre spends the cycle
 * averaging half of the total drop: deficit = lossRate x months / 2.
 */
export function averageDeficitPsi(lossPsiPerMonth, monthsBetweenChecks) {
  if (!finite(lossPsiPerMonth) || !finite(monthsBetweenChecks)) return NaN;
  if (lossPsiPerMonth < 0 || monthsBetweenChecks <= 0) return NaN;
  return (lossPsiPerMonth * monthsBetweenChecks) / 2;
}

function buildScenario({
  label,
  lossPsiPerMonth,
  monthsBetweenChecks,
  targetPsi,
  annualKm,
  kmPerLitre,
  fuelPricePerLitre,
  setCost,
  baseLifeKm,
  treadLossPerPercent,
  fillCostPerTyre,
  tyres,
}) {
  const deficit = averageDeficitPsi(lossPsiPerMonth, monthsBetweenChecks);
  const clampedDeficit = Math.min(deficit, targetPsi);
  const percentUnder = (clampedDeficit / targetPsi) * 100;

  const fuelPenaltyFraction = clampedDeficit * FUEL_PENALTY_PER_PSI;
  const annualLitres = annualKm / kmPerLitre;
  const baselineFuelCost = annualLitres * fuelPricePerLitre;
  const extraFuelCost = baselineFuelCost * fuelPenaltyFraction;

  const treadLossPercent = Math.min(percentUnder * treadLossPerPercent, 90);
  const effectiveLifeKm = baseLifeKm * (1 - treadLossPercent / 100);
  const annualTyreCost = (setCost / effectiveLifeKm) * annualKm;

  const eventsPerYear = MONTHS_PER_YEAR / monthsBetweenChecks;
  const annualServiceCost = fillCostPerTyre * tyres * eventsPerYear;

  return {
    label,
    lossPsiPerMonth: round(lossPsiPerMonth, 2),
    avgDeficitPsi: round(clampedDeficit, 2),
    percentUnder: round(percentUnder, 2),
    fuelPenaltyPercent: round(fuelPenaltyFraction * 100, 3),
    baselineFuelCost: round(baselineFuelCost, 0),
    extraFuelCost: round(extraFuelCost, 0),
    treadLossPercent: round(treadLossPercent, 2),
    effectiveLifeKm: Math.round(effectiveLifeKm),
    annualTyreCost: round(annualTyreCost, 0),
    eventsPerYear: round(eventsPerYear, 2),
    annualServiceCost: round(annualServiceCost, 0),
    totalAnnualCost: round(extraFuelCost + annualTyreCost + annualServiceCost, 0),
    rawExtraFuelCost: extraFuelCost,
    rawAnnualTyreCost: annualTyreCost,
    rawAnnualServiceCost: annualServiceCost,
    rawTotal: extraFuelCost + annualTyreCost + annualServiceCost,
  };
}

/**
 * Compare running a set of tyres on compressed air against running them on
 * nitrogen, over one year.
 *
 * @param {object} input
 * @param {number} input.targetPsi placard cold pressure
 * @param {number} input.monthsBetweenChecks how often you actually top up
 * @param {number} input.airLossPsiPerMonth measured or assumed seepage on air
 * @param {number} input.nitrogenLossFactor fraction of the air loss rate
 * @param {number} input.annualKm distance covered per year
 * @param {number} input.kmPerLitre real-world fuel economy
 * @param {number} input.fuelPricePerLitre pump price
 * @param {number} input.setCost fitted cost of one set of tyres
 * @param {number} input.baseLifeKm tread life at correct pressure
 * @param {number} input.tyres tyres on the vehicle
 * @param {number} input.nitrogenFillCostPerTyre charge per tyre per fill or top-up
 * @param {number} input.airFillCostPerTyre charge per tyre for an air top-up (usually 0)
 * @param {number} [input.treadLossPerPercent] tread life lost per 1% under-inflation
 */
export function compareNitrogenVsAir({
  targetPsi,
  monthsBetweenChecks,
  airLossPsiPerMonth = DEFAULT_AIR_LOSS_PSI_PER_MONTH,
  nitrogenLossFactor = NITROGEN_LOSS_FACTOR,
  annualKm,
  kmPerLitre,
  fuelPricePerLitre,
  setCost,
  baseLifeKm,
  tyres = 4,
  nitrogenFillCostPerTyre,
  airFillCostPerTyre = 0,
  treadLossPerPercent = TREAD_LOSS_PER_PERCENT_UNDER,
} = {}) {
  const numbers = {
    targetPsi,
    monthsBetweenChecks,
    airLossPsiPerMonth,
    nitrogenLossFactor,
    annualKm,
    kmPerLitre,
    fuelPricePerLitre,
    setCost,
    baseLifeKm,
    tyres,
    nitrogenFillCostPerTyre,
    airFillCostPerTyre,
    treadLossPerPercent,
  };
  if (Object.values(numbers).some((value) => !finite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (targetPsi <= 0) return { error: "Target pressure must be greater than zero." };
  if (monthsBetweenChecks <= 0 || monthsBetweenChecks > 24) {
    return { error: "Check interval must be between 0 and 24 months." };
  }
  if (airLossPsiPerMonth < 0) return { error: "Pressure loss cannot be negative." };
  if (nitrogenLossFactor < 0 || nitrogenLossFactor > 1) {
    return { error: "Nitrogen loss factor must be between 0 and 1 — nitrogen cannot leak faster than air." };
  }
  if (annualKm <= 0) return { error: "Annual distance must be greater than zero." };
  if (kmPerLitre <= 0) return { error: "Fuel economy must be greater than zero km per litre." };
  if (fuelPricePerLitre < 0) return { error: "Fuel price cannot be negative." };
  if (setCost <= 0) return { error: "Cost of a set of tyres must be greater than zero." };
  if (baseLifeKm <= 0) return { error: "Tread life must be greater than zero kilometres." };
  if (!Number.isInteger(tyres) || tyres < 1 || tyres > 12) {
    return { error: "Number of tyres must be a whole number between 1 and 12." };
  }
  if (nitrogenFillCostPerTyre < 0 || airFillCostPerTyre < 0) {
    return { error: "Filling charges cannot be negative." };
  }
  if (treadLossPerPercent < 0 || treadLossPerPercent > 5) {
    return { error: "Tread-life sensitivity must be between 0 and 5% of life per 1% under-inflation." };
  }

  const shared = {
    monthsBetweenChecks,
    targetPsi,
    annualKm,
    kmPerLitre,
    fuelPricePerLitre,
    setCost,
    baseLifeKm,
    treadLossPerPercent,
    tyres,
  };

  const air = buildScenario({
    ...shared,
    label: "Compressed air",
    lossPsiPerMonth: airLossPsiPerMonth,
    fillCostPerTyre: airFillCostPerTyre,
  });
  const nitrogen = buildScenario({
    ...shared,
    label: "Nitrogen",
    lossPsiPerMonth: airLossPsiPerMonth * nitrogenLossFactor,
    fillCostPerTyre: nitrogenFillCostPerTyre,
  });

  const netAnnualSaving = air.rawTotal - nitrogen.rawTotal;
  const eventsPerYear = MONTHS_PER_YEAR / monthsBetweenChecks;

  /**
   * The highest per-tyre nitrogen charge that still leaves you level: take
   * everything nitrogen saves in fuel and tread, subtract what air costs to top
   * up, and spread it across the fills you would pay for in a year.
   */
  const savingBeforeService =
    air.rawExtraFuelCost + air.rawAnnualTyreCost + air.rawAnnualServiceCost -
    nitrogen.rawExtraFuelCost - nitrogen.rawAnnualTyreCost;
  const breakEvenFillCostPerTyre = savingBeforeService / (tyres * eventsPerYear);

  const notes = [];
  if (air.avgDeficitPsi >= targetPsi * 0.5) {
    notes.push("At this check interval the tyres spend the cycle far below the placard pressure. Checking more often is free and beats any gas you fill them with.");
  }
  if (monthsBetweenChecks <= 1) {
    notes.push("If you genuinely check monthly, the retention advantage of nitrogen has almost nothing left to act on — the deficits in both columns are tiny.");
  }
  if (netAnnualSaving <= 0) {
    notes.push(`At this price nitrogen does not pay for itself. It would need to cost ${Math.max(0, Math.round(breakEvenFillCostPerTyre))} per tyre per fill or less to break even.`);
  }

  return {
    air,
    nitrogen,
    tyres,
    eventsPerYear: round(eventsPerYear, 2),
    netAnnualSaving: round(netAnnualSaving, 0),
    nitrogenWins: netAnnualSaving > 0,
    breakEvenFillCostPerTyre: round(breakEvenFillCostPerTyre, 0),
    savingOverFiveYears: round(netAnnualSaving * 5, 0),
    deficitReductionPsi: round(air.avgDeficitPsi - nitrogen.avgDeficitPsi, 2),
    notes,
  };
}
