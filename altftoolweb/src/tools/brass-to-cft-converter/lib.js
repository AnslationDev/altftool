/**
 * Brass <-> cft / cubic metre / tonne / truckload conversions.
 *
 * "Brass" is the volume unit used on Indian construction sites for loose
 * material such as sand, aggregate, murum and stone dust. One brass is
 * 100 cubic feet of loose material as it sits in the truck.
 *
 * The foot is defined as exactly 0.3048 m, so:
 *   1 cft   = 0.3048^3 m3            = 0.028316846592 m3
 *   1 brass = 100 cft                = 2.8316846592 m3
 *
 * Mass is volume x bulk density. Bulk density is the loose, as-delivered
 * density of the heap (IS 2386 Part 3 calls this "loose bulk density"), not
 * the specific gravity of the mineral, which is why sand comes out near
 * 1,600 kg/m3 rather than 2,650 kg/m3.
 */

/** 1 brass = 100 cubic feet of loose material (Indian site convention). */
export const CFT_PER_BRASS = 100;

/** 1 ft = 0.3048 m exactly (international foot), so 1 cft = 0.3048^3 m3. */
export const M3_PER_CFT = 0.028316846592;

/** Derived: 1 brass = 2.8316846592 m3. */
export const M3_PER_BRASS = CFT_PER_BRASS * M3_PER_CFT;

export const KG_PER_TONNE = 1000;

/**
 * Indicative loose bulk densities in kg/m3 for material delivered dry.
 * Ranges follow IS 2386 (Part 3) test values commonly reported for Indian
 * quarry and river material. Moist sand can read 10-20% heavier by volume
 * because of bulking, so weigh a sample when the invoice is by weight.
 */
export const MATERIALS = [
  { id: "river-sand", label: "River sand (dry, loose)", density: 1600 },
  { id: "m-sand", label: "M-sand / crushed sand", density: 1750 },
  { id: "stone-dust", label: "Stone dust / grit", density: 1750 },
  { id: "agg-10", label: "10 mm aggregate", density: 1550 },
  { id: "agg-20", label: "20 mm aggregate", density: 1500 },
  { id: "agg-40", label: "40 mm aggregate", density: 1450 },
  { id: "murum", label: "Murum / soil filling", density: 1600 },
  { id: "rubble", label: "Rubble / boulders", density: 1600 },
];

/** Tipper sizes quoted in brass by Indian aggregate suppliers. */
export const TRUCK_PRESETS = [
  { id: "tractor", label: "Tractor trolley", brass: 1 },
  { id: "tipper-2", label: "Small tipper (6-wheel)", brass: 2 },
  { id: "tipper-3", label: "Tipper (10-wheel)", brass: 3 },
  { id: "tipper-4", label: "Hyva 4 brass", brass: 4 },
  { id: "tipper-6", label: "Multi-axle 6 brass", brass: 6 },
];

export const UNITS = [
  { id: "brass", label: "Brass" },
  { id: "cft", label: "Cubic feet (cft)" },
  { id: "m3", label: "Cubic metres (m3)" },
  { id: "tonne", label: "Tonnes" },
];

export const MIN_DENSITY = 500;
export const MAX_DENSITY = 3000;

/** Convert any supported unit into cubic feet. Returns NaN for unknown units. */
export function toCft(value, unit, densityKgPerM3) {
  if (!Number.isFinite(value)) return Number.NaN;
  switch (unit) {
    case "brass":
      return value * CFT_PER_BRASS;
    case "cft":
      return value;
    case "m3":
      return value / M3_PER_CFT;
    case "tonne": {
      if (!(densityKgPerM3 > 0)) return Number.NaN;
      const cubicMetres = (value * KG_PER_TONNE) / densityKgPerM3;
      return cubicMetres / M3_PER_CFT;
    }
    default:
      return Number.NaN;
  }
}

/**
 * @param {object} input
 * @param {number} input.value            Quantity entered by the user.
 * @param {string} input.unit             One of brass | cft | m3 | tonne.
 * @param {number} input.densityKgPerM3   Loose bulk density of the material.
 * @param {number} input.truckBrass       Capacity of one truck, in brass.
 * @param {number} [input.ratePerBrass]   Optional delivered rate per brass.
 * @returns {object} breakdown or { error }.
 */
export function convertBrass({
  value,
  unit = "brass",
  densityKgPerM3,
  truckBrass,
  ratePerBrass = 0,
}) {
  const qty = Number(value);
  const density = Number(densityKgPerM3);
  const truck = Number(truckBrass);
  const rate = Number(ratePerBrass);

  if (![qty, density, truck, rate].every((n) => Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!UNITS.some((u) => u.id === unit)) {
    return { error: "Choose a unit to convert from." };
  }
  if (qty < 0) return { error: "Quantity cannot be negative." };
  if (density < MIN_DENSITY || density > MAX_DENSITY) {
    return {
      error: `Bulk density should be between ${MIN_DENSITY} and ${MAX_DENSITY} kg/m3 for construction material.`,
    };
  }
  if (!(truck > 0) || truck > 20) {
    return { error: "Truck capacity should be between 0.5 and 20 brass." };
  }
  if (rate < 0) return { error: "Rate per brass cannot be negative." };

  const cft = toCft(qty, unit, density);
  if (!Number.isFinite(cft)) {
    return { error: "That quantity could not be converted — check the unit and density." };
  }

  const brass = cft / CFT_PER_BRASS;
  const cubicMetres = cft * M3_PER_CFT;
  const kg = cubicMetres * density;
  const tonnes = kg / KG_PER_TONNE;
  const truckloads = brass / truck;

  return {
    brass,
    cft,
    cubicMetres,
    kg,
    tonnes,
    truckloads,
    fullTrucks: Math.max(0, Math.floor(truckloads + 1e-9)),
    trucksToOrder: Math.max(0, Math.ceil(truckloads - 1e-9)),
    tonnesPerBrass: M3_PER_BRASS * density * (1 / KG_PER_TONNE),
    cost: rate > 0 ? brass * rate : 0,
    density,
  };
}
