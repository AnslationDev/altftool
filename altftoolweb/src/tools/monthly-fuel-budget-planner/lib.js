/**
 * Household fuel budget across several vehicles.
 *
 * Each vehicle contributes, per month:
 *   units  = monthly_km / efficiency          (litres for petrol/diesel, kg for CNG)
 *   cost   = units x unit_price
 * and the fleet total is the sum. The fleet cost per km is the total cost over
 * the total distance, which is a fuel-weighted average and is the right number
 * to use when asking "how many kilometres must I drop to fit the budget?":
 *   km_to_trim = overspend / fleet_cost_per_km
 *
 * CNG is metered in kilograms, not litres, so efficiency for a CNG vehicle is
 * km per kg and the price is per kg. Mixing the two units in one total is fine
 * because only the money is added up, never the units themselves.
 */

/** Fuel types this planner understands, with the unit each is sold in. */
export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol", unit: "litre", unitShort: "l" },
  { id: "diesel", label: "Diesel", unit: "litre", unitShort: "l" },
  { id: "cng", label: "CNG", unit: "kilogram", unitShort: "kg" },
];

/** Months in a year, for the annual projection. */
export const MONTHS_PER_YEAR = 12;

/** Sanity ceiling on monthly distance for one vehicle, km. */
export const MAX_MONTHLY_KM = 20000;

/** Sanity ceiling on efficiency, km per litre or km per kg. */
export const MAX_EFFICIENCY = 200;

/** Most vehicles the planner will budget for at once. */
export const MAX_VEHICLES = 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {Array<{name: string, fuel: string, monthlyKm: number, efficiency: number, unitPrice: number}>} input.vehicles
 * @param {number} [input.budget] the monthly cap you want to stay inside; 0 means no cap
 * @returns {object} per-vehicle and fleet figures, or { error }
 */
export function planFuelBudget({ vehicles = [], budget = 0 }) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return { error: "Add at least one vehicle to budget for." };
  }
  if (vehicles.length > MAX_VEHICLES) {
    return { error: `This planner handles up to ${MAX_VEHICLES} vehicles.` };
  }
  if (!isNum(budget) || budget < 0) {
    return { error: "Monthly budget cannot be negative." };
  }

  const rows = [];
  for (let i = 0; i < vehicles.length; i += 1) {
    const vehicle = vehicles[i];
    const label = vehicle.name?.trim() || `Vehicle ${i + 1}`;
    if (![vehicle.monthlyKm, vehicle.efficiency, vehicle.unitPrice].every(isNum)) {
      return { error: `Fill in every figure for ${label}.` };
    }
    if (vehicle.monthlyKm < 0) return { error: `Monthly distance for ${label} cannot be negative.` };
    if (vehicle.monthlyKm > MAX_MONTHLY_KM) {
      return { error: `${label}: more than ${MAX_MONTHLY_KM} km a month is out of range.` };
    }
    if (vehicle.efficiency <= 0) {
      return { error: `${label}: mileage must be greater than zero.` };
    }
    if (vehicle.efficiency > MAX_EFFICIENCY) {
      return { error: `${label}: mileage above ${MAX_EFFICIENCY} is not realistic.` };
    }
    if (vehicle.unitPrice <= 0) {
      return { error: `${label}: fuel price must be greater than zero.` };
    }

    const fuel = FUEL_TYPES.find((entry) => entry.id === vehicle.fuel) ?? FUEL_TYPES[0];
    const units = vehicle.monthlyKm / vehicle.efficiency;
    const cost = units * vehicle.unitPrice;

    rows.push({
      name: label,
      fuel: fuel.id,
      fuelLabel: fuel.label,
      unitShort: fuel.unitShort,
      monthlyKm: vehicle.monthlyKm,
      efficiency: vehicle.efficiency,
      unitPrice: vehicle.unitPrice,
      units,
      cost,
      costPerKm: vehicle.monthlyKm > 0 ? cost / vehicle.monthlyKm : vehicle.unitPrice / vehicle.efficiency,
      yearlyCost: cost * MONTHS_PER_YEAR,
    });
  }

  const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalKm = rows.reduce((sum, row) => sum + row.monthlyKm, 0);
  if (totalKm <= 0) {
    return { error: "At least one vehicle must cover some distance in the month." };
  }

  const fleetCostPerKm = totalCost / totalKm;
  const budgetSet = budget > 0;
  const difference = budgetSet ? budget - totalCost : 0;
  const overspend = budgetSet && difference < 0 ? -difference : 0;

  return {
    rows: rows.map((row) => ({
      ...row,
      shareOfSpend: totalCost > 0 ? row.cost / totalCost : 0,
      shareOfDistance: row.monthlyKm / totalKm,
    })),
    totalCost,
    totalKm,
    yearlyCost: totalCost * MONTHS_PER_YEAR,
    fleetCostPerKm,
    budgetSet,
    budget,
    difference,
    overspend,
    withinBudget: budgetSet ? totalCost <= budget : true,
    kmToTrim: overspend > 0 ? overspend / fleetCostPerKm : 0,
    shareToTrim: overspend > 0 && totalCost > 0 ? overspend / totalCost : 0,
    costliestVehicle: rows.reduce((a, b) => (b.cost > a.cost ? b : a)).name,
  };
}

/**
 * How much a target improvement in mileage would save the whole fleet, in
 * percent terms applied to every vehicle equally (for example, correct tyre
 * pressure and a serviced air filter).
 */
export function savingsFromEfficiencyGain({ totalCost, gainPct }) {
  if (!isNum(totalCost) || totalCost < 0) return { error: "Fix the vehicle inputs first." };
  if (!isNum(gainPct) || gainPct <= -100 || gainPct > 100) {
    return { error: "Efficiency change must be between -100% and 100%." };
  }
  // A g% gain in km/l cuts fuel used to 1 / (1 + g) of the original.
  const factor = 1 / (1 + gainPct / 100);
  const newCost = totalCost * factor;
  return {
    newMonthlyCost: newCost,
    monthlySaving: totalCost - newCost,
    yearlySaving: (totalCost - newCost) * MONTHS_PER_YEAR,
  };
}
