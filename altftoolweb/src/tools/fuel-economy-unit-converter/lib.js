/**
 * Fuel economy unit conversion.
 *
 * Two families of unit are in use and they run in opposite directions:
 *   - DISTANCE PER VOLUME (km/l, mpg): bigger is better.
 *   - VOLUME PER DISTANCE (l/100 km): smaller is better.
 * Converting between the families is a reciprocal, which is why 10 km/l is 10 l/100 km
 * but 20 km/l is 5 l/100 km rather than 20.
 *
 *     l/100 km = 100 / (km/l)
 *     mpg (US)       = (km/l) x LITRES_PER_US_GALLON / KM_PER_MILE
 *     mpg (imperial) = (km/l) x LITRES_PER_IMPERIAL_GALLON / KM_PER_MILE
 *
 * All three factors below are exact definitions, not measurements, so the derived
 * constants (the familiar 235.215 and 282.481) are exact too.
 */

/** 1 mile = 1760 yd x 0.9144 m (1959 international yard and pound agreement). */
export const KM_PER_MILE = 1.609344;

/** US liquid gallon = 231 cubic inches, and 1 inch = 2.54 cm exactly. */
export const LITRES_PER_US_GALLON = 3.785411784;

/** Imperial gallon, fixed at 4.54609 litres by the UK Weights and Measures Act 1985. */
export const LITRES_PER_IMPERIAL_GALLON = 4.54609;

/** km/l -> US mpg. 3.785411784 / 1.609344 = 2.35214583... */
export const KMPL_TO_MPG_US = LITRES_PER_US_GALLON / KM_PER_MILE;

/** km/l -> imperial mpg. 4.54609 / 1.609344 = 2.82481... */
export const KMPL_TO_MPG_IMPERIAL = LITRES_PER_IMPERIAL_GALLON / KM_PER_MILE;

/** The familiar reciprocal constants: l/100 km = CONSTANT / mpg. */
export const MPG_US_L100KM_CONSTANT = 100 * KMPL_TO_MPG_US; // 235.2145833...
export const MPG_IMPERIAL_L100KM_CONSTANT = 100 * KMPL_TO_MPG_IMPERIAL; // 282.4809...

export const UNITS = [
  { key: "kmpl", label: "Kilometres per litre (km/l)", short: "km/l", betterWhen: "higher" },
  { key: "l100km", label: "Litres per 100 km (l/100 km)", short: "l/100 km", betterWhen: "lower" },
  { key: "mpgus", label: "Miles per US gallon (mpg US)", short: "mpg (US)", betterWhen: "higher" },
  { key: "mpgimp", label: "Miles per imperial gallon (mpg UK)", short: "mpg (imp)", betterWhen: "higher" },
];

/** Above this the figure is not a petrol or diesel car's economy; catches typos. */
export const MAX_KMPL = 500;

/** Familiar reference points, stated in km/l, for a sense of scale. */
export const REFERENCE_ECONOMY = [
  { kmpl: 6, what: "Large petrol SUV in city traffic" },
  { kmpl: 10, what: "Mid-size petrol hatchback, mixed driving" },
  { kmpl: 15, what: "Small petrol hatchback on the highway" },
  { kmpl: 20, what: "Efficient small diesel on the highway" },
  { kmpl: 25, what: "Petrol-hybrid compact, city cycle" },
  { kmpl: 45, what: "125 cc commuter motorcycle" },
];

const positive = (value) => Number.isFinite(value) && value > 0;

/**
 * Convert one fuel economy figure into every other unit.
 *
 * @param {object} input
 * @param {number} input.value the number as entered
 * @param {"kmpl"|"l100km"|"mpgus"|"mpgimp"} input.unit the unit it was entered in
 * @returns {{error:string}|{kmpl:number,l100km:number,mpgUs:number,mpgImperial:number,milesPerLitre:number,unit:string}}
 */
export function convertFuelEconomy({ value, unit = "kmpl" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter the fuel economy as a number." };
  if (amount <= 0) return { error: "Fuel economy must be greater than zero." };

  let kmpl;
  if (unit === "kmpl") kmpl = amount;
  else if (unit === "l100km") kmpl = 100 / amount;
  else if (unit === "mpgus") kmpl = amount / KMPL_TO_MPG_US;
  else if (unit === "mpgimp") kmpl = amount / KMPL_TO_MPG_IMPERIAL;
  else return { error: "Pick a unit to convert from." };

  if (!positive(kmpl)) return { error: "That figure does not convert to a usable economy." };
  if (kmpl > MAX_KMPL) {
    return { error: `Over ${MAX_KMPL} km/l is not a road vehicle's economy — check the number and the unit.` };
  }

  return {
    unit,
    kmpl,
    l100km: 100 / kmpl,
    mpgUs: kmpl * KMPL_TO_MPG_US,
    mpgImperial: kmpl * KMPL_TO_MPG_IMPERIAL,
    milesPerLitre: kmpl / KM_PER_MILE,
  };
}

/**
 * Fuel a trip needs at a given economy.
 *
 * @returns {{error:string}|{litres:number,usGallons:number,imperialGallons:number,distanceKm:number}}
 */
export function tripFuel({ kmpl, distanceKm }) {
  const economy = Number(kmpl);
  const distance = Number(distanceKm);
  if (!positive(economy)) return { error: "Fuel economy must be greater than zero." };
  if (!Number.isFinite(distance) || distance < 0) return { error: "Enter the trip distance as a positive number." };

  const litres = distance / economy;
  return {
    distanceKm: distance,
    litres,
    usGallons: litres / LITRES_PER_US_GALLON,
    imperialGallons: litres / LITRES_PER_IMPERIAL_GALLON,
  };
}
