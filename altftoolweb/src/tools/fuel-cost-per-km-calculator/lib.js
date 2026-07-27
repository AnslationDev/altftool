/**
 * True running cost per kilometre.
 *
 * Fuel cost per km = price of one unit of fuel / distance that unit covers.
 *   Petrol and diesel  : rupees per litre / kilometres per litre
 *   CNG                : rupees per kilogram / kilometres per kilogram
 *   Electric           : rupees per kWh / kilometres per kWh
 *
 * Fuel is only part of the cost of a kilometre. The standing costs — servicing,
 * insurance, road tax and the value the vehicle loses each year — are spread
 * over the distance actually driven:
 *   standing cost per km = annual standing costs / kilometres driven a year
 *   total cost per km    = fuel cost per km + standing cost per km
 *
 * The default annual depreciation of 15% mirrors the written-down-value rate
 * for a motor car in Appendix I to the Income-tax Rules, 1962; change it if the
 * model you drive holds value better or worse.
 */

export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol", unit: "litre", priceLabel: "Price per litre", efficiencyLabel: "Mileage (km per litre)" },
  { id: "diesel", label: "Diesel", unit: "litre", priceLabel: "Price per litre", efficiencyLabel: "Mileage (km per litre)" },
  { id: "cng", label: "CNG", unit: "kg", priceLabel: "Price per kilogram", efficiencyLabel: "Mileage (km per kg)" },
  { id: "electric", label: "Electric", unit: "kWh", priceLabel: "Tariff per unit (kWh)", efficiencyLabel: "Efficiency (km per kWh)" },
];

/** Default annual depreciation, matching the 15% income tax block for a motor car. */
export const DEFAULT_DEPRECIATION_PERCENT = 15;

export const MONTHS_IN_YEAR = 12;

export function fuelTypeById(id) {
  return FUEL_TYPES.find((type) => type.id === id) || FUEL_TYPES[0];
}

/** Cost of the fuel burnt in one kilometre. */
export function fuelCostPerKm(pricePerUnit, efficiency) {
  if (![pricePerUnit, efficiency].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return { error: "Enter a valid fuel price and mileage." };
  }
  if (pricePerUnit < 0) return { error: "Fuel price cannot be negative." };
  if (efficiency <= 0) return { error: "Mileage must be greater than zero." };
  return { costPerKm: pricePerUnit / efficiency };
}

/**
 * Full running cost.
 *
 * @param {object} input
 * @param {number} input.pricePerUnit        Price of a litre / kg / kWh, INR.
 * @param {number} input.efficiency          km per litre / kg / kWh.
 * @param {number} input.monthlyKm           Distance driven in a month.
 * @param {number} input.annualService       Servicing and consumables a year, INR.
 * @param {number} input.annualInsurance     Insurance premium a year, INR.
 * @param {number} input.annualOther         Road tax, parking, FASTag and the rest, INR.
 * @param {number} input.vehicleValue        Current value of the vehicle, INR.
 * @param {number} input.depreciationPercent Value lost a year, %.
 * @param {number} input.tripKm              A trip you want costed.
 */
export function runningCost({
  pricePerUnit,
  efficiency,
  monthlyKm,
  annualService = 0,
  annualInsurance = 0,
  annualOther = 0,
  vehicleValue = 0,
  depreciationPercent = DEFAULT_DEPRECIATION_PERCENT,
  tripKm = 0,
}) {
  const nums = [
    pricePerUnit,
    efficiency,
    monthlyKm,
    annualService,
    annualInsurance,
    annualOther,
    vehicleValue,
    depreciationPercent,
    tripKm,
  ];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  const fuel = fuelCostPerKm(pricePerUnit, efficiency);
  if (fuel.error) return fuel;
  if (monthlyKm <= 0) return { error: "Enter the distance you drive in a month." };
  if ([annualService, annualInsurance, annualOther, vehicleValue, tripKm].some((n) => n < 0)) {
    return { error: "Costs and distances cannot be negative." };
  }
  if (depreciationPercent < 0 || depreciationPercent > 100) {
    return { error: "Depreciation should be between 0% and 100% a year." };
  }

  const annualKm = monthlyKm * MONTHS_IN_YEAR;
  const annualDepreciation = (vehicleValue * depreciationPercent) / 100;
  const annualStanding = annualService + annualInsurance + annualOther + annualDepreciation;
  const standingPerKm = annualStanding / annualKm;
  const totalPerKm = fuel.costPerKm + standingPerKm;

  const unitsPerMonth = monthlyKm / efficiency;

  return {
    fuelPerKm: fuel.costPerKm,
    standingPerKm,
    totalPerKm,
    annualKm,
    annualDepreciation,
    annualStanding,
    monthlyFuel: fuel.costPerKm * monthlyKm,
    annualFuel: fuel.costPerKm * annualKm,
    monthlyTotal: totalPerKm * monthlyKm,
    annualTotal: totalPerKm * annualKm,
    unitsPerMonth,
    unitsPerYear: unitsPerMonth * MONTHS_IN_YEAR,
    tripFuelCost: fuel.costPerKm * tripKm,
    tripTotalCost: totalPerKm * tripKm,
    fuelShareOfTotal: totalPerKm > 0 ? (fuel.costPerKm / totalPerKm) * 100 : 0,
  };
}

/**
 * Compare the fuel cost of the vehicle you have with an alternative, and find
 * how many kilometres it takes to earn back a conversion or price premium.
 *
 * @param {number} currentPerKm    Current fuel cost per km, INR.
 * @param {number} altPricePerUnit Alternative fuel price per unit, INR.
 * @param {number} altEfficiency   Alternative efficiency, km per unit.
 * @param {number} monthlyKm       Distance driven a month.
 * @param {number} conversionCost  Kit cost or price premium to recover, INR.
 */
export function compareFuel(currentPerKm, altPricePerUnit, altEfficiency, monthlyKm, conversionCost = 0) {
  const alt = fuelCostPerKm(altPricePerUnit, altEfficiency);
  if (alt.error) return alt;
  if (![currentPerKm, monthlyKm, conversionCost].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return { error: "Enter valid numbers to compare fuels." };
  }
  if (monthlyKm <= 0) return { error: "Enter the distance you drive in a month." };
  if (conversionCost < 0) return { error: "Conversion cost cannot be negative." };

  const savingPerKm = currentPerKm - alt.costPerKm;
  const monthlySaving = savingPerKm * monthlyKm;
  const annualSaving = monthlySaving * MONTHS_IN_YEAR;

  if (savingPerKm <= 0) {
    return {
      altPerKm: alt.costPerKm,
      savingPerKm,
      monthlySaving,
      annualSaving,
      breakEvenKm: null,
      breakEvenMonths: null,
      cheaper: false,
    };
  }

  return {
    altPerKm: alt.costPerKm,
    savingPerKm,
    monthlySaving,
    annualSaving,
    breakEvenKm: conversionCost > 0 ? conversionCost / savingPerKm : 0,
    breakEvenMonths: conversionCost > 0 ? conversionCost / monthlySaving : 0,
    cheaper: true,
  };
}
