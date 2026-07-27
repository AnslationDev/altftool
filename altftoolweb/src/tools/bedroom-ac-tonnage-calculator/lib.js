/**
 * Bedroom AC tonnage (cooling load) estimator.
 *
 * Method — rule-of-thumb residential cooling load, in BTU per hour:
 *
 *   envelope load = area x BASE_LOAD_BTU_PER_SQFT
 *                   x ceiling-height factor
 *                   x roof-exposure factor
 *                   x sun-exposure factor
 *                   x climate factor
 *   internal load = extra occupants x OCCUPANT_LOAD_BTU
 *                   + appliance watts x WATT_TO_BTU_PER_HOUR
 *   tonnage       = (envelope + internal) / BTU_PER_TON
 *
 * Sources of the constants are noted on each constant below. This is a sizing
 * estimate, not a substitute for a room-by-room Manual-J / ISHRAE load survey.
 */

/** Definition: one ton of refrigeration removes 12,000 BTU of heat per hour. */
export const BTU_PER_TON = 12000;

/** Definition: 1 watt = 3.412142 BTU per hour. */
export const WATT_TO_BTU_PER_HOUR = 3.412142;

/**
 * Base sensible+latent load for a bedroom with a 10 ft ceiling at Indian
 * summer design conditions (about 43 C outdoors, 25 C indoors), expressed per
 * square foot of floor area. 80 BTU/h per sq ft reproduces the widely published
 * Indian guideline of roughly 1 ton for a 120-150 sq ft bedroom.
 */
export const BASE_LOAD_BTU_PER_SQFT = 80;

/** The base figure assumes this ceiling height, in feet. */
export const REFERENCE_CEILING_FT = 10;

/**
 * Extra load per foot of ceiling above the 10 ft reference: more wall area and
 * more air volume to cool. 5% per foot is the usual field allowance.
 */
export const CEILING_UPLIFT_PER_FOOT = 0.05;

/** Sun-baked uninsulated RCC roof directly overhead adds about 15% (solar roof gain). */
export const TOP_FLOOR_UPLIFT = 0.15;

/** ENERGY STAR room-AC sizing guidance: heavily shaded -10%, very sunny +10%. */
export const SUN_EXPOSURE = [
  { id: "shaded", label: "Shaded / north facing, little direct sun", factor: 0.9 },
  { id: "average", label: "Average - some direct sun during the day", factor: 1.0 },
  { id: "sunny", label: "Very sunny - west or south wall, long afternoon sun", factor: 1.1 },
];

/**
 * Climate multiplier on the envelope load. The base figure is set for a hot
 * composite Indian summer; coastal/moderate cities need less, hot-dry desert
 * cities with 46-48 C design temperatures need more.
 */
export const CLIMATE_ZONES = [
  { id: "moderate", label: "Moderate / hill or coastal south (peak about 35-38 C)", factor: 0.9 },
  { id: "composite", label: "Hot composite - Delhi, Lucknow, Nagpur (peak about 43 C)", factor: 1.0 },
  { id: "hotdry", label: "Very hot dry - Rajasthan, Vidarbha (peak 46 C and above)", factor: 1.15 },
  { id: "humid", label: "Warm humid - Mumbai, Chennai, Kolkata (high latent load)", factor: 1.1 },
];

/**
 * ENERGY STAR room-AC guidance: add 600 BTU/h for every regular occupant
 * beyond the first two. Two sleeping adults are already inside the base figure.
 */
export const OCCUPANT_LOAD_BTU = 600;
export const OCCUPANTS_INCLUDED_IN_BASE = 2;

/** Mainstream split/window AC capacities sold in India, in tons. */
export const STANDARD_TONNAGES = [0.8, 1.0, 1.5, 2.0, 2.5];

/** Sanity bounds so a typo cannot produce a meaningless answer. */
export const MIN_AREA_SQFT = 20;
export const MAX_AREA_SQFT = 1000;
export const MIN_CEILING_FT = 7;
export const MAX_CEILING_FT = 20;
export const MAX_OCCUPANTS = 12;
export const MAX_APPLIANCE_WATTS = 5000;

/** Floor area a given tonnage covers at the base conditions (10 ft ceiling, no uplifts). */
export function coverageSqft(tons) {
  if (!Number.isFinite(tons) || tons <= 0) return 0;
  return (tons * BTU_PER_TON) / BASE_LOAD_BTU_PER_SQFT;
}

/** Rated cooling output of a catalogue size, in BTU per hour. */
export function ratedBtu(tons) {
  if (!Number.isFinite(tons) || tons <= 0) return 0;
  return tons * BTU_PER_TON;
}

function lookup(list, id) {
  return list.find((item) => item.id === id) || null;
}

/** Smallest catalogue size that meets the load; null if the load exceeds the largest. */
export function recommendTonnage(tons) {
  if (!Number.isFinite(tons) || tons <= 0) return null;
  return STANDARD_TONNAGES.find((size) => size >= tons - 1e-9) ?? null;
}

/**
 * @param {object} input
 * @param {number} input.areaSqft        Floor area of the bedroom, sq ft.
 * @param {number} input.ceilingFt       Finished ceiling height, feet.
 * @param {boolean} input.topFloor       True if the roof above is exposed to the sun.
 * @param {string} input.sunExposure     One of SUN_EXPOSURE ids.
 * @param {string} input.climate         One of CLIMATE_ZONES ids.
 * @param {number} input.occupants       People who regularly sleep in the room.
 * @param {number} input.applianceWatts  Heat-producing electronics left running, watts.
 * @returns {object} breakdown or { error }.
 */
export function computeBedroomTonnage({
  areaSqft,
  ceilingFt = REFERENCE_CEILING_FT,
  topFloor = false,
  sunExposure = "average",
  climate = "composite",
  occupants = 2,
  applianceWatts = 0,
}) {
  const area = Number(areaSqft);
  const ceiling = Number(ceilingFt);
  const people = Number(occupants);
  const watts = Number(applianceWatts);

  if (![area, ceiling, people, watts].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (area < MIN_AREA_SQFT || area > MAX_AREA_SQFT) {
    return { error: `Floor area should be between ${MIN_AREA_SQFT} and ${MAX_AREA_SQFT} sq ft.` };
  }
  if (ceiling < MIN_CEILING_FT || ceiling > MAX_CEILING_FT) {
    return { error: `Ceiling height should be between ${MIN_CEILING_FT} and ${MAX_CEILING_FT} ft.` };
  }
  if (people < 1 || people > MAX_OCCUPANTS) {
    return { error: `Occupants should be between 1 and ${MAX_OCCUPANTS}.` };
  }
  if (watts < 0 || watts > MAX_APPLIANCE_WATTS) {
    return { error: `Appliance load should be between 0 and ${MAX_APPLIANCE_WATTS} W.` };
  }

  const sun = lookup(SUN_EXPOSURE, sunExposure);
  const zone = lookup(CLIMATE_ZONES, climate);
  if (!sun) return { error: "Choose a sun exposure option." };
  if (!zone) return { error: "Choose a climate zone." };

  const baseLoad = area * BASE_LOAD_BTU_PER_SQFT;
  const ceilingFactor = 1 + (ceiling - REFERENCE_CEILING_FT) * CEILING_UPLIFT_PER_FOOT;
  const roofFactor = topFloor ? 1 + TOP_FLOOR_UPLIFT : 1;

  const envelopeLoad = baseLoad * ceilingFactor * roofFactor * sun.factor * zone.factor;

  const extraPeople = Math.max(0, Math.round(people) - OCCUPANTS_INCLUDED_IN_BASE);
  const occupantLoad = extraPeople * OCCUPANT_LOAD_BTU;
  const applianceLoad = watts * WATT_TO_BTU_PER_HOUR;

  const totalBtu = envelopeLoad + occupantLoad + applianceLoad;
  const exactTons = totalBtu / BTU_PER_TON;
  const recommended = recommendTonnage(exactTons);
  const largest = STANDARD_TONNAGES[STANDARD_TONNAGES.length - 1];

  return {
    areaSqft: area,
    baseLoad,
    ceilingFactor,
    roofFactor,
    sunFactor: sun.factor,
    sunLabel: sun.label,
    climateFactor: zone.factor,
    climateLabel: zone.label,
    envelopeLoad,
    extraPeople,
    occupantLoad,
    applianceLoad,
    totalBtu,
    exactTons,
    recommendedTons: recommended,
    unitsNeeded: recommended ? 1 : Math.ceil(exactTons / largest),
    headroomPct: recommended ? ((recommended - exactTons) / exactTons) * 100 : 0,
    btuPerSqft: totalBtu / area,
  };
}
