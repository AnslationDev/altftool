/**
 * Yearly savings from downsizing a household's vehicles — swapping a large car for a
 * smaller one, or dropping from two vehicles to one.
 *
 * Total cost of ownership per vehicle per year is:
 *   fuel + insurance + maintenance + parking + depreciation
 * where fuel = (km per year / fuel economy) x fuel price, and depreciation is charged as a
 * percentage of the vehicle's CURRENT market value rather than its original price, because
 * a car loses value on what it is worth today.
 *
 * Downsizing is compared honestly: trips that no longer have a vehicle have to go somewhere,
 * so an extra cab/auto/public-transport line is added to the "after" side, and the one-time
 * cash swing (replacement price minus sale proceeds) is amortised into a payback period.
 */

/**
 * Typical annual loss in market value for a car past its first year, as a share of what it
 * is worth today. Insurance depreciation grids (used to set Insured Declared Value) fall in
 * a similar band: about 20% off ex-showroom in year 1-2 and 10 percentage points more each
 * year after, which works out near 10-15% of current value per year.
 */
export const DEFAULT_DEPRECIATION_PCT = 12;

/**
 * Combustion CO2 released per unit of fuel burnt. These are the standard well-known
 * tank-to-wheel factors: burning a litre of petrol releases about 2.31 kg of CO2, a litre of
 * diesel about 2.68 kg, and a kilogram of CNG about 2.75 kg.
 */
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol (per litre)", unit: "L", co2PerUnit: 2.31 },
  { value: "diesel", label: "Diesel (per litre)", unit: "L", co2PerUnit: 2.68 },
  { value: "cng", label: "CNG (per kg)", unit: "kg", co2PerUnit: 2.75 },
];

export const MONTHS_PER_YEAR = 12;
/** Horizon used for the long-run figure. */
export const PROJECTION_YEARS = 5;

/** Guard rails so a stray keystroke cannot produce nonsense. */
export const MAX_KM_PER_YEAR = 200000;

/**
 * Annual running and holding cost of one vehicle.
 * @returns {{error:string}|object}
 */
export function vehicleAnnualCost({
  label,
  kmPerYear,
  economy,
  fuelPrice,
  insurance = 0,
  maintenance = 0,
  parking = 0,
  marketValue = 0,
  depreciationPct = DEFAULT_DEPRECIATION_PCT,
}) {
  const numbers = [
    kmPerYear,
    economy,
    fuelPrice,
    insurance,
    maintenance,
    parking,
    marketValue,
    depreciationPct,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: `Enter a valid number in every ${label} field.` };
  }
  if (kmPerYear < 0) return { error: `${label}: distance per year cannot be negative.` };
  if (kmPerYear > MAX_KM_PER_YEAR) {
    return { error: `${label}: distance per year must be ${MAX_KM_PER_YEAR} km or less.` };
  }
  if (!(economy > 0)) {
    return { error: `${label}: fuel economy must be greater than zero.` };
  }
  if (fuelPrice < 0) return { error: `${label}: fuel price cannot be negative.` };
  if (insurance < 0 || maintenance < 0 || parking < 0 || marketValue < 0) {
    return { error: `${label}: costs and values cannot be negative.` };
  }
  if (depreciationPct < 0 || depreciationPct > 100) {
    return { error: `${label}: depreciation must be between 0% and 100% per year.` };
  }

  const fuelUnits = kmPerYear / economy;
  const fuel = fuelUnits * fuelPrice;
  const depreciation = marketValue * (depreciationPct / 100);
  const total = fuel + insurance + maintenance + parking + depreciation;

  return { label, fuelUnits, fuel, insurance, maintenance, parking, depreciation, total };
}

/**
 * @returns {{error:string}|object} the before/after comparison and payback
 */
export function computeDownsizingSavings({
  primary,
  second,
  keepSecond = false,
  replacement,
  extraTransportPerYear = 0,
  replacementPrice = 0,
  saleProceeds = 0,
  fuelType = "petrol",
}) {
  if (
    typeof extraTransportPerYear !== "number" ||
    !Number.isFinite(extraTransportPerYear) ||
    typeof replacementPrice !== "number" ||
    !Number.isFinite(replacementPrice) ||
    typeof saleProceeds !== "number" ||
    !Number.isFinite(saleProceeds)
  ) {
    return { error: "Enter a valid number for the switching costs and added travel spend." };
  }
  if (extraTransportPerYear < 0) {
    return { error: "Added cab or transit spend cannot be negative." };
  }
  if (replacementPrice < 0 || saleProceeds < 0) {
    return { error: "Replacement price and sale proceeds cannot be negative." };
  }

  const fuel = FUEL_TYPES.find((f) => f.value === fuelType) ?? FUEL_TYPES[0];

  const primaryCost = vehicleAnnualCost({ ...primary, label: "Current main vehicle" });
  if (primaryCost.error) return { error: primaryCost.error };

  let secondCost = null;
  if (keepSecond) {
    secondCost = vehicleAnnualCost({ ...second, label: "Second vehicle" });
    if (secondCost.error) return { error: secondCost.error };
  }

  const replacementCost = vehicleAnnualCost({ ...replacement, label: "Vehicle after downsizing" });
  if (replacementCost.error) return { error: replacementCost.error };

  const beforeTotal = primaryCost.total + (secondCost ? secondCost.total : 0);
  const afterVehicleTotal = replacementCost.total;
  const afterTotal = afterVehicleTotal + extraTransportPerYear;

  const annualSavings = beforeTotal - afterTotal;
  const monthlySavings = annualSavings / MONTHS_PER_YEAR;

  const beforeUnits = primaryCost.fuelUnits + (secondCost ? secondCost.fuelUnits : 0);
  const afterUnits = replacementCost.fuelUnits;
  const unitsSaved = beforeUnits - afterUnits;
  const co2SavedKg = unitsSaved * fuel.co2PerUnit;
  const unitsIncreased = unitsSaved < 0;

  const netSwitchCost = replacementPrice - saleProceeds;
  let paybackMonths = null;
  if (netSwitchCost > 0 && annualSavings > 0) {
    paybackMonths = (netSwitchCost / annualSavings) * MONTHS_PER_YEAR;
  }

  const projectionSavings = annualSavings * PROJECTION_YEARS - netSwitchCost;

  const beforeKm = primary.kmPerYear + (keepSecond ? second.kmPerYear : 0);
  const costPerKmBefore = beforeKm > 0 ? beforeTotal / beforeKm : 0;
  const costPerKmAfter = replacement.kmPerYear > 0 ? afterTotal / replacement.kmPerYear : 0;

  const notes = [];
  if (annualSavings <= 0) {
    notes.push(
      "Downsizing does not save money on these numbers. The usual cause is a replacement bought at a high price — depreciation on a newer, smaller car can exceed the fuel and insurance it saves.",
    );
  }
  if (extraTransportPerYear === 0 && keepSecond) {
    notes.push(
      "No added cab or transit spend was entered. Dropping a vehicle almost always pushes some trips onto paid travel — leaving that at zero flatters the saving.",
    );
  }
  if (replacement.kmPerYear < beforeKm * 0.9) {
    notes.push(
      "The remaining vehicle is set to cover noticeably fewer kilometres than the household drives today. If those trips still have to happen, add them here or to the cab spend.",
    );
  }
  if (unitsSaved < 0) {
    notes.push(
      "The replacement uses more fuel per year than what it is replacing, so fuel use and CO2 go up even though money is saved. The figures below show that increase, not a reduction.",
    );
  }
  if (netSwitchCost < 0) {
    notes.push(
      "Selling raises more cash than the replacement costs, so the switch pays for itself on day one — the payback period does not apply.",
    );
  }
  if (paybackMonths !== null && paybackMonths > 60) {
    notes.push(
      "Payback takes more than five years. Over that horizon the replacement itself will need major service work, so treat the long-run figure as indicative.",
    );
  }

  return {
    fuelUnitLabel: fuel.unit,
    co2PerUnit: fuel.co2PerUnit,
    primaryCost,
    secondCost,
    replacementCost,
    beforeTotal,
    afterVehicleTotal,
    extraTransportPerYear,
    afterTotal,
    annualSavings,
    monthlySavings,
    beforeUnits,
    afterUnits,
    unitsSaved,
    co2SavedKg,
    unitsIncreased,
    netSwitchCost,
    paybackMonths,
    projectionYears: PROJECTION_YEARS,
    projectionSavings,
    costPerKmBefore,
    costPerKmAfter,
    notes,
  };
}
