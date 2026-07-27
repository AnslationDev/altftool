/**
 * Tyre cost per kilometre.
 *
 * The whole comparison rests on one identity: the money a set of tyres costs
 * you per kilometre is the fitted price of the set divided by the distance the
 * set actually lasts. A cheap tyre with a short life can easily cost more per
 * kilometre than an expensive long-life tyre, which is why sticker price alone
 * is the wrong basis for the decision.
 */

/** Passenger cars run four tyres; two-wheelers two. Used as the default only. */
export const DEFAULT_TYRES_PER_SET = 4;

/** Sanity ceiling for tyres on one vehicle (a twin-axle LCV can reach this). */
export const MAX_TYRES_PER_SET = 12;

/** Comparisons are quoted per 10,000 km as well as per km. */
export const REFERENCE_DISTANCE_KM = 10000;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const finite = (value) => Number.isFinite(value);

/**
 * Fitted cost of one set and the resulting cost per kilometre.
 *
 * setCost   = pricePerTyre x tyresPerSet + fitting/balancing/valve/disposal cost
 * costPerKm = setCost / lifeKm
 */
export function computeSetCost({ pricePerTyre, tyresPerSet, fittingCost = 0, lifeKm }) {
  if (!finite(pricePerTyre) || !finite(lifeKm) || !finite(tyresPerSet) || !finite(fittingCost)) {
    return { error: "Enter valid numbers for price, tyre count, fitting cost and expected life." };
  }
  if (pricePerTyre <= 0) return { error: "Price per tyre must be greater than zero." };
  if (fittingCost < 0) return { error: "Fitting cost cannot be negative." };
  if (!Number.isInteger(tyresPerSet) || tyresPerSet < 1 || tyresPerSet > MAX_TYRES_PER_SET) {
    return { error: `Tyres per set must be a whole number between 1 and ${MAX_TYRES_PER_SET}.` };
  }
  if (lifeKm <= 0) return { error: "Expected tyre life must be greater than zero kilometres." };

  const setCost = pricePerTyre * tyresPerSet + fittingCost;
  return { setCost, costPerKm: setCost / lifeKm };
}

/**
 * Fuel cost per kilometre. Included because a tyre's rolling resistance shows
 * up in the fuel bill, and on high-mileage vehicles that difference can be
 * larger than the tyre price difference itself.
 *
 * fuelCostPerKm = fuelPricePerLitre / kmPerLitre
 */
export function fuelCostPerKm(fuelPricePerLitre, kmPerLitre) {
  if (!finite(fuelPricePerLitre) || !finite(kmPerLitre)) return 0;
  if (fuelPricePerLitre <= 0 || kmPerLitre <= 0) return 0;
  return fuelPricePerLitre / kmPerLitre;
}

function buildOption(option, shared) {
  const base = computeSetCost({
    pricePerTyre: option.pricePerTyre,
    tyresPerSet: shared.tyresPerSet,
    fittingCost: option.fittingCost,
    lifeKm: option.lifeKm,
  });
  if (base.error) return { error: `${option.name}: ${base.error}` };

  const fuelPerKm = fuelCostPerKm(shared.fuelPricePerLitre, option.kmPerLitre);
  const totalPerKm = base.costPerKm + fuelPerKm;
  const setsNeeded = shared.ownershipKm / option.lifeKm;

  return {
    name: option.name,
    setCost: round(base.setCost, 2),
    tyreCostPerKm: round(base.costPerKm, 4),
    fuelCostPerKm: round(fuelPerKm, 4),
    totalCostPerKm: round(totalPerKm, 4),
    costPerReferenceDistance: round(base.costPerKm * REFERENCE_DISTANCE_KM, 2),
    totalPerReferenceDistance: round(totalPerKm * REFERENCE_DISTANCE_KM, 2),
    setsOverOwnership: round(setsNeeded, 2),
    tyreSpendOverOwnership: round(base.costPerKm * shared.ownershipKm, 2),
    fuelSpendOverOwnership: round(fuelPerKm * shared.ownershipKm, 2),
    totalSpendOverOwnership: round(totalPerKm * shared.ownershipKm, 2),
    lifeKm: option.lifeKm,
    rawTyreCostPerKm: base.costPerKm,
    rawSetCost: base.setCost,
    rawTotalPerKm: totalPerKm,
  };
}

/**
 * Compare two tyre choices on cost per kilometre.
 *
 * @param {object} input
 * @param {{name:string, pricePerTyre:number, lifeKm:number, fittingCost:number, kmPerLitre:number}} input.optionA
 * @param {{name:string, pricePerTyre:number, lifeKm:number, fittingCost:number, kmPerLitre:number}} input.optionB
 * @param {number} input.tyresPerSet
 * @param {number} input.ownershipKm distance you plan to cover on this vehicle
 * @param {number} [input.fuelPricePerLitre] enables the rolling-resistance comparison
 */
export function compareTyreCostPerKm({
  optionA,
  optionB,
  tyresPerSet = DEFAULT_TYRES_PER_SET,
  ownershipKm,
  fuelPricePerLitre = 0,
} = {}) {
  if (!optionA || !optionB) return { error: "Both tyre options are required." };
  if (!finite(ownershipKm) || ownershipKm <= 0) {
    return { error: "Planned distance must be greater than zero kilometres." };
  }
  if (ownershipKm > 2000000) {
    return { error: "Planned distance above 2,000,000 km is outside a realistic ownership horizon." };
  }
  if (!finite(fuelPricePerLitre) || fuelPricePerLitre < 0) {
    return { error: "Fuel price cannot be negative." };
  }

  const shared = { tyresPerSet, ownershipKm, fuelPricePerLitre };
  const a = buildOption(optionA, shared);
  if (a.error) return { error: a.error };
  const b = buildOption(optionB, shared);
  if (b.error) return { error: b.error };

  const perKmGap = a.rawTotalPerKm - b.rawTotalPerKm;
  const cheaper = perKmGap === 0 ? null : perKmGap > 0 ? b : a;
  const costlier = cheaper === a ? b : a;

  /**
   * Life the costlier-per-km set would have to reach for its tyre cost per km
   * to equal the winner's: lifeNeeded = setCost(costlier) / costPerKm(cheaper).
   */
  const breakEvenLifeKm =
    cheaper && cheaper.rawTyreCostPerKm > 0
      ? costlier.rawSetCost / cheaper.rawTyreCostPerKm
      : null;

  return {
    a,
    b,
    tyresPerSet,
    ownershipKm,
    cheaperName: cheaper ? cheaper.name : null,
    tie: cheaper === null,
    savingPerKm: round(Math.abs(perKmGap), 4),
    savingOverOwnership: round(Math.abs(perKmGap) * ownershipKm, 2),
    savingPerReferenceDistance: round(Math.abs(perKmGap) * REFERENCE_DISTANCE_KM, 2),
    breakEvenLifeKm: breakEvenLifeKm === null ? null : Math.round(breakEvenLifeKm),
    breakEvenForName: costlier ? costlier.name : null,
    referenceDistanceKm: REFERENCE_DISTANCE_KM,
  };
}
