/**
 * Remaining driving range from a fuel gauge reading.
 *
 *   fuel in tank      = tank capacity * gauge fraction
 *   usable fuel       = fuel in tank - the reserve you want to arrive with
 *   real-world mileage= rated mileage * condition factor
 *   safe range        = usable fuel * real-world mileage
 *   range to dry      = fuel in tank * real-world mileage
 *
 * Every step is a straight multiplication; the only judgement calls are the
 * condition factor and the reserve, and both are inputs so they can be set from
 * the driver's own trip-computer history rather than assumed.
 */

/** Common gauge positions, as the fraction of tank capacity each represents. */
export const GAUGE_POSITIONS = [
  { id: "full", label: "Full", fraction: 1 },
  { id: "three-quarter", label: "3/4", fraction: 0.75 },
  { id: "half", label: "1/2", fraction: 0.5 },
  { id: "quarter", label: "1/4", fraction: 0.25 },
  { id: "eighth", label: "1/8 (light usually on)", fraction: 0.125 },
  { id: "empty", label: "E (needle on empty)", fraction: 0 },
];

/**
 * Rule-of-thumb multipliers on the rated (ARAI-style, steady-cycle) mileage.
 * These are starting points only — override the factor with your own trip
 * computer average, which is always more accurate for your car.
 */
export const CONDITION_PRESETS = [
  { id: "city", label: "City stop-go", factor: 0.8 },
  { id: "mixed", label: "Mixed driving", factor: 1 },
  { id: "highway", label: "Steady highway", factor: 1.1 },
  { id: "loaded-ac", label: "Full load with AC", factor: 0.75 },
];

/**
 * Fuel warning lights in most passenger cars come on with roughly 10-15% of the
 * tank left. 12% is used as the default "keep this much" reserve suggestion.
 */
export const TYPICAL_WARNING_LIGHT_FRACTION = 0.12;

/**
 * A sensible reserve to hold back: the fuel still in the tank when the warning
 * light comes on, rounded to the nearest tenth of a litre.
 * @returns {number|null} null when the capacity is not a usable number
 */
export function suggestedReserveLitres(tankLitres) {
  if (typeof tankLitres !== "number" || !Number.isFinite(tankLitres) || tankLitres <= 0) {
    return null;
  }
  return Math.round(tankLitres * TYPICAL_WARNING_LIGHT_FRACTION * 10) / 10;
}

const MAX_TANK_LITRES = 1000;
const MAX_KMPL = 200;

/**
 * @returns {{error:string}|object}
 */
export function estimateRange({
  tankLitres,
  gaugePercent,
  mileageKmpl,
  conditionFactor = 1,
  reserveLitres = 0,
  tripDistanceKm = 0,
  fuelPricePerLitre = 0,
  averageSpeedKmph = 0,
}) {
  const numbers = [
    tankLitres,
    gaugePercent,
    mileageKmpl,
    conditionFactor,
    reserveLitres,
    tripDistanceKm,
    fuelPricePerLitre,
    averageSpeedKmph,
  ];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number in every field." };
  }
  if (tankLitres <= 0) return { error: "Tank capacity must be greater than zero." };
  if (tankLitres > MAX_TANK_LITRES) {
    return { error: `Tank capacity must be ${MAX_TANK_LITRES} litres or less.` };
  }
  if (gaugePercent < 0 || gaugePercent > 100) {
    return { error: "Gauge reading must be between 0% and 100% of the tank." };
  }
  if (mileageKmpl <= 0) return { error: "Mileage must be greater than zero km per litre." };
  if (mileageKmpl > MAX_KMPL) {
    return { error: `Mileage above ${MAX_KMPL} km/l is outside the range this tool handles.` };
  }
  if (conditionFactor < 0.3 || conditionFactor > 1.5) {
    return { error: "Condition factor should be between 0.3 and 1.5 of the rated mileage." };
  }
  if (reserveLitres < 0) return { error: "Reserve cannot be negative." };
  if (reserveLitres > tankLitres) {
    return { error: "The reserve you want to keep is larger than the whole tank." };
  }
  if (tripDistanceKm < 0) return { error: "Trip distance cannot be negative." };
  if (fuelPricePerLitre < 0) return { error: "Fuel price cannot be negative." };
  if (averageSpeedKmph < 0 || averageSpeedKmph > 200) {
    return { error: "Average speed should be between 0 and 200 km/h." };
  }

  const fuelInTank = tankLitres * (gaugePercent / 100);
  const effectiveKmpl = mileageKmpl * conditionFactor;
  const usableFuel = Math.max(0, fuelInTank - reserveLitres);

  const safeRangeKm = usableFuel * effectiveKmpl;
  const rangeToDryKm = fuelInTank * effectiveKmpl;

  const tripFuelNeeded = tripDistanceKm / effectiveKmpl;
  const shortfallLitres = Math.max(0, tripFuelNeeded - usableFuel);
  const litresToFillTank = tankLitres - fuelInTank;

  return {
    fuelInTank,
    usableFuel,
    effectiveKmpl,
    safeRangeKm,
    rangeToDryKm,
    intoReserve: fuelInTank <= reserveLitres,
    litresToFillTank,
    costToFillTank: litresToFillTank * fuelPricePerLitre,
    tripFuelNeeded,
    canMakeTrip: tripDistanceKm === 0 ? null : tripFuelNeeded <= usableFuel,
    shortfallLitres,
    shortfallCost: shortfallLitres * fuelPricePerLitre,
    tripCost: tripFuelNeeded * fuelPricePerLitre,
    hoursOfDriving: averageSpeedKmph > 0 ? safeRangeKm / averageSpeedKmph : null,
  };
}
