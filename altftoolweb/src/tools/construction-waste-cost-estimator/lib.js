/**
 * Construction and demolition (C&D) debris removal cost, from volume and haul distance.
 *
 * Two facts drive the whole estimate.
 *
 * 1. BULKING. Material that is broken up occupies more space than it did in place. The ratio
 *    of loose volume to in-place volume is the bulking (swell) factor, and it is why a slab
 *    that measures 6 cubic metres fills far more than 6 cubic metres of truck.
 *
 *      loose volume = in-place volume x bulking factor
 *
 * 2. TRIPS ARE LIMITED BY WHICHEVER RUNS OUT FIRST — the tipper's body volume or its payload
 *    in tonnes. Light debris fills the body before it reaches the weight limit; concrete hits
 *    the weight limit with the body half empty.
 *
 *      trips = ceil( max( loose volume / body capacity , tonnes / payload ) )
 *
 * Everything after that is arithmetic: trip hire, distance charged on the round trip, tipping
 * fees usually charged per tonne at the processing facility, and the labour to load.
 *
 * Rates are inputs, not fixed prices — they vary by city, by contractor and with diesel.
 */

/**
 * Bulking factors and loose (as-loaded) bulk densities for common demolition materials.
 * Bulking factors for broken masonry and concrete sit in the 1.3-1.6 band and excavated soil
 * around 1.2-1.3; loose bulk density of rubble runs roughly 1.1-1.5 tonnes per cubic metre,
 * lower for mixed debris carrying timber, plaster and packaging.
 */
export const MATERIALS = [
  { value: "concrete", label: "Broken concrete / RCC slab", bulking: 1.5, looseDensity: 1.4 },
  { value: "brick", label: "Brick and block rubble", bulking: 1.4, looseDensity: 1.2 },
  { value: "mixed", label: "Mixed C&D debris (tiles, plaster, timber)", bulking: 1.35, looseDensity: 0.9 },
  { value: "plaster", label: "Plaster, mortar and screed", bulking: 1.3, looseDensity: 1.1 },
  { value: "soil", label: "Excavated soil", bulking: 1.25, looseDensity: 1.5 },
];

/** A common small tipper: body volume in cubic metres and legal payload in tonnes. */
export const DEFAULT_TRUCK_VOLUME_M3 = 3.5;
export const DEFAULT_TRUCK_PAYLOAD_T = 5;

/** Distance is charged both ways — out to the facility and back. */
export const ROUND_TRIP_MULTIPLIER = 2;

/** Sanity ceilings. */
export const MAX_VOLUME_M3 = 5000;
export const MAX_DISTANCE_KM = 500;

/**
 * In-place volume from a measured area and a demolition depth or slab thickness.
 * @returns {number} cubic metres, 0 for invalid input
 */
export function volumeFromArea(areaSqm, depthMm) {
  if (!Number.isFinite(areaSqm) || !Number.isFinite(depthMm)) return 0;
  if (areaSqm <= 0 || depthMm <= 0) return 0;
  return areaSqm * (depthMm / 1000);
}

/**
 * @returns {{error:string}|object} loose volume, tonnage, trips and the cost breakdown
 */
export function estimateWasteRemoval({
  inPlaceVolumeM3,
  materialKey = "mixed",
  bulkingOverride = null,
  densityOverride = null,
  truckVolumeM3 = DEFAULT_TRUCK_VOLUME_M3,
  truckPayloadT = DEFAULT_TRUCK_PAYLOAD_T,
  hirePerTrip = 0,
  distanceKm = 0,
  ratePerKm = 0,
  tippingFeePerTonne = 0,
  loaders = 0,
  loadingDays = 0,
  wagePerDay = 0,
  permitFee = 0,
}) {
  const numbers = [
    inPlaceVolumeM3,
    truckVolumeM3,
    truckPayloadT,
    hirePerTrip,
    distanceKm,
    ratePerKm,
    tippingFeePerTonne,
    loaders,
    loadingDays,
    wagePerDay,
    permitFee,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (!(inPlaceVolumeM3 > 0)) {
    return { error: "Enter the debris volume in place — it must be greater than zero." };
  }
  if (inPlaceVolumeM3 > MAX_VOLUME_M3) {
    return { error: `Volume must be ${MAX_VOLUME_M3} cubic metres or less.` };
  }
  if (!(truckVolumeM3 > 0) || !(truckPayloadT > 0)) {
    return { error: "Truck body volume and payload must both be greater than zero." };
  }
  if (distanceKm < 0 || distanceKm > MAX_DISTANCE_KM) {
    return { error: `Haul distance must be between 0 and ${MAX_DISTANCE_KM} km.` };
  }
  if (
    hirePerTrip < 0 ||
    ratePerKm < 0 ||
    tippingFeePerTonne < 0 ||
    wagePerDay < 0 ||
    permitFee < 0
  ) {
    return { error: "Rates and fees cannot be negative." };
  }
  if (loaders < 0 || loadingDays < 0) {
    return { error: "Labour figures cannot be negative." };
  }

  const material = MATERIALS.find((m) => m.value === materialKey) ?? MATERIALS[2];
  const bulking = Number.isFinite(bulkingOverride) && bulkingOverride > 0 ? bulkingOverride : material.bulking;
  const density = Number.isFinite(densityOverride) && densityOverride > 0 ? densityOverride : material.looseDensity;

  const looseVolumeM3 = inPlaceVolumeM3 * bulking;
  const tonnes = looseVolumeM3 * density;

  const tripsByVolume = looseVolumeM3 / truckVolumeM3;
  const tripsByWeight = tonnes / truckPayloadT;
  const limitingFactor = tripsByWeight > tripsByVolume ? "payload weight" : "body volume";
  const trips = Math.ceil(Math.max(tripsByVolume, tripsByWeight));

  const hireCost = trips * hirePerTrip;
  const distanceCost = trips * distanceKm * ROUND_TRIP_MULTIPLIER * ratePerKm;
  const tippingCost = tonnes * tippingFeePerTonne;
  const labourCost = loaders * loadingDays * wagePerDay;

  const items = [
    [`Trip hire (${trips} trip${trips === 1 ? "" : "s"})`, hireCost],
    [`Distance (${(trips * distanceKm * ROUND_TRIP_MULTIPLIER).toFixed(0)} km round trips)`, distanceCost],
    [`Tipping fee (${tonnes.toFixed(2)} t)`, tippingCost],
    [`Loading labour (${loaders} x ${loadingDays} days)`, labourCost],
    ["Permit or society charge", permitFee],
  ];
  const total = items.reduce((sum, [, value]) => sum + value, 0);

  const costPerInPlaceM3 = total / inPlaceVolumeM3;
  const costPerTonne = tonnes > 0 ? total / tonnes : 0;
  const costPerTrip = trips > 0 ? total / trips : 0;
  const spareCapacityPct =
    trips > 0
      ? (1 - Math.max(tripsByVolume, tripsByWeight) / trips) * 100
      : 0;

  const notes = [];
  notes.push(
    `${inPlaceVolumeM3.toFixed(2)} m³ in place becomes ${looseVolumeM3.toFixed(2)} m³ once broken up — a bulking factor of ${bulking}. Book truck capacity against the loose figure, not the measured one.`,
  );
  notes.push(
    `Trips are capped by ${limitingFactor} on this load: ${tripsByVolume.toFixed(2)} truckloads by volume against ${tripsByWeight.toFixed(2)} by weight.`,
  );
  if (spareCapacityPct > 40) {
    notes.push(
      `The last trip runs about ${spareCapacityPct.toFixed(0)}% empty. Combining it with another job, or hiring one larger vehicle, usually costs less than a near-empty run.`,
    );
  }
  if (tippingFeePerTonne === 0) {
    notes.push(
      "No tipping fee was entered. C&D waste must go to an authorised processing facility, which normally charges by weight — fly-tipping on vacant land attracts penalties from the local body.",
    );
  }
  if (materialKey === "concrete" && tippingFeePerTonne > 0) {
    notes.push(
      "Clean concrete and brick rubble is the most recyclable fraction and some facilities accept it at a reduced rate, or free, when it is segregated from plaster, timber and packaging.",
    );
  }

  return {
    material,
    bulking,
    density,
    inPlaceVolumeM3,
    looseVolumeM3,
    tonnes,
    tripsByVolume,
    tripsByWeight,
    limitingFactor,
    trips,
    hireCost,
    distanceCost,
    tippingCost,
    labourCost,
    permitFee,
    items,
    total,
    costPerInPlaceM3,
    costPerTonne,
    costPerTrip,
    spareCapacityPct,
    notes,
  };
}
