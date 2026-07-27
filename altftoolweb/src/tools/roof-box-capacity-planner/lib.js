/**
 * Roof box capacity planning.
 *
 * Two independent ceilings decide what a roof box can carry, and the smaller one
 * always wins:
 *
 *   1. WEIGHT — the vehicle's *dynamic* roof load limit (the figure in the owner's
 *      manual, quoted while driving) must cover the crossbars, the empty box and
 *      the contents together:
 *          cargo allowance = min(roofLoadLimit - bars - emptyBox, boxMaxPayload)
 *
 *   2. VOLUME — a box's litre rating is its gross internal volume. Soft bags and
 *      rigid suitcases never tessellate perfectly, so only a fraction of it is
 *      usable:
 *          usable litres = gross litres x packing efficiency
 *
 * The planner also estimates the aerodynamic fuel penalty, because a loaded box
 * roughly doubles a hatchback's frontal drag contribution at highway speed.
 *
 * Nothing here is vehicle-specific: every limit is an input, because the dynamic
 * roof load varies from about 50 kg on a small hatchback to 100 kg on a large SUV
 * and only the manual is authoritative.
 */

/**
 * Share of a box's gross litre rating that real luggage actually occupies.
 * Rigid suitcases stack badly and leave corner voids; soft duffels compress and
 * fill better. 0.80 is the mid default used here.
 */
export const PACKING_EFFICIENCY = {
  rigid: 0.7, // hard-shell suitcases only
  mixed: 0.8, // the usual family mix of cases and soft bags
  soft: 0.9, // soft duffels and holdalls that mould to the shell
};

/**
 * Manufacturer-recommended maximum speed with a loaded roof box.
 * Thule, Yakima and Kamei all publish 130 km/h; several countries legislate lower.
 */
export const ROOF_BOX_SPEED_LIMIT_KMH = 130;

/**
 * Typical highway fuel-consumption increase with a loaded roof box fitted.
 * Independent road tests put the penalty between 10% and 25% at 100 km/h;
 * 0.15 is used as the working mid-point.
 */
export const ROOF_BOX_FUEL_PENALTY = 0.15;

/**
 * Typical packed volume and weight of common travel items.
 * Volumes follow airline-style bag sizing; weights are typical packed weights,
 * not maxima — override them with the "extra" fields when you have a scale.
 */
export const CARGO_ITEMS = [
  { id: "cabin", label: "Cabin bag", litres: 40, kg: 8 },
  { id: "medium", label: "Medium suitcase", litres: 70, kg: 15 },
  { id: "large", label: "Large suitcase", litres: 100, kg: 20 },
  { id: "duffel", label: "Duffel bag", litres: 60, kg: 10 },
  { id: "backpack", label: "Daypack", litres: 30, kg: 6 },
  { id: "bedding", label: "Bedding roll", litres: 25, kg: 3 },
  { id: "tent", label: "4-person tent", litres: 40, kg: 8 },
  { id: "cooler", label: "Cooler box (filled)", litres: 30, kg: 12 },
];

/** Guard rails so a stray keystroke cannot produce a nonsense plan. */
const MAX_ROOF_LOAD_KG = 500;
const MAX_BOX_VOLUME_L = 2000;
const MAX_ITEM_COUNT = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.roofLoadLimitKg  dynamic roof load from the owner's manual
 * @param {number} input.rackWeightKg     crossbars / roof rails that carry the box
 * @param {number} input.boxEmptyWeightKg empty weight of the roof box itself
 * @param {number} input.boxVolumeL       gross litre rating of the box
 * @param {number} input.boxMaxPayloadKg  maximum load the box maker allows inside
 * @param {object} input.itemCounts       { [CARGO_ITEMS id]: count }
 * @param {number} input.extraVolumeL     anything not in the item list, litres
 * @param {number} input.extraWeightKg    anything not in the item list, kg
 * @param {number} input.packingEfficiency 0-1 share of gross volume that is usable
 * @param {number} input.tripKm           optional trip distance for the fuel penalty
 * @param {number} input.baselineKmpl     optional fuel economy without the box
 * @param {number} input.fuelPrice        optional fuel price per litre
 */
export function computeRoofBoxPlan({
  roofLoadLimitKg,
  rackWeightKg = 0,
  boxEmptyWeightKg,
  boxVolumeL,
  boxMaxPayloadKg,
  itemCounts = {},
  extraVolumeL = 0,
  extraWeightKg = 0,
  packingEfficiency = PACKING_EFFICIENCY.mixed,
  tripKm = 0,
  baselineKmpl = 0,
  fuelPrice = 0,
}) {
  const numbers = [
    roofLoadLimitKg,
    rackWeightKg,
    boxEmptyWeightKg,
    boxVolumeL,
    boxMaxPayloadKg,
    extraVolumeL,
    extraWeightKg,
    packingEfficiency,
    tripKm,
    baselineKmpl,
    fuelPrice,
  ];
  if (!numbers.every(isNum)) return { error: "Enter a valid number in every field." };
  if (roofLoadLimitKg <= 0) return { error: "Enter the dynamic roof load limit from your owner's manual (kg)." };
  if (roofLoadLimitKg > MAX_ROOF_LOAD_KG)
    return { error: `A roof load limit above ${MAX_ROOF_LOAD_KG} kg is not a passenger car — check the manual.` };
  if (rackWeightKg < 0 || boxEmptyWeightKg < 0 || extraWeightKg < 0 || extraVolumeL < 0)
    return { error: "Weights and volumes cannot be negative." };
  if (boxVolumeL <= 0) return { error: "Enter the roof box volume in litres." };
  if (boxVolumeL > MAX_BOX_VOLUME_L)
    return { error: `Enter a box volume of ${MAX_BOX_VOLUME_L} litres or less.` };
  if (boxMaxPayloadKg <= 0) return { error: "Enter the maximum load the box maker allows inside it (kg)." };
  if (packingEfficiency <= 0 || packingEfficiency > 1)
    return { error: "Packing efficiency must be between 0 and 1." };
  if (tripKm < 0 || baselineKmpl < 0 || fuelPrice < 0)
    return { error: "Trip distance, mileage and fuel price cannot be negative." };

  let cargoVolumeL = extraVolumeL;
  let cargoWeightKg = extraWeightKg;
  const lines = [];
  for (const item of CARGO_ITEMS) {
    const raw = itemCounts[item.id];
    const count = isNum(raw) ? Math.floor(raw) : 0;
    if (count < 0) return { error: "Item counts cannot be negative." };
    if (count > MAX_ITEM_COUNT)
      return { error: `More than ${MAX_ITEM_COUNT} of one item will not fit any roof box.` };
    if (count === 0) continue;
    const litres = count * item.litres;
    const kg = count * item.kg;
    cargoVolumeL += litres;
    cargoWeightKg += kg;
    lines.push({ id: item.id, label: item.label, count, litres, kg });
  }

  // --- weight side -------------------------------------------------------
  const fixedRoofWeightKg = rackWeightKg + boxEmptyWeightKg;
  const roofHeadroomKg = roofLoadLimitKg - fixedRoofWeightKg;
  if (roofHeadroomKg <= 0) {
    return {
      error:
        "The bars and the empty box already meet the roof load limit — this box cannot legally carry anything on this car.",
    };
  }
  const cargoAllowanceKg = Math.min(roofHeadroomKg, boxMaxPayloadKg);
  const weightLimitedBy = boxMaxPayloadKg < roofHeadroomKg ? "box payload rating" : "vehicle roof load limit";
  const totalRoofLoadKg = fixedRoofWeightKg + cargoWeightKg;
  const weightUsedPct = (cargoWeightKg / cargoAllowanceKg) * 100;
  const weightSpareKg = cargoAllowanceKg - cargoWeightKg;

  // --- volume side -------------------------------------------------------
  const usableVolumeL = boxVolumeL * packingEfficiency;
  const volumeUsedPct = (cargoVolumeL / usableVolumeL) * 100;
  const volumeSpareL = usableVolumeL - cargoVolumeL;

  // --- what actually stops you ------------------------------------------
  const overWeight = cargoWeightKg > cargoAllowanceKg;
  const overVolume = cargoVolumeL > usableVolumeL;
  let limitingFactor;
  if (overWeight && overVolume) limitingFactor = "both weight and volume";
  else if (overWeight) limitingFactor = "weight";
  else if (overVolume) limitingFactor = "volume";
  else limitingFactor = weightUsedPct >= volumeUsedPct ? "weight (closest ceiling)" : "volume (closest ceiling)";

  const fits = !overWeight && !overVolume;
  const fillPct = Math.max(weightUsedPct, volumeUsedPct);

  // Average density of what you are loading, kg per 100 litres. Roof boxes run
  // out of weight before volume above roughly 15 kg/100 L on a typical car.
  const cargoDensityKgPer100L = cargoVolumeL > 0 ? (cargoWeightKg / cargoVolumeL) * 100 : 0;

  // --- aerodynamic fuel penalty -----------------------------------------
  let fuel = null;
  if (tripKm > 0 && baselineKmpl > 0) {
    const baseLitres = tripKm / baselineKmpl;
    const extraLitres = baseLitres * ROOF_BOX_FUEL_PENALTY;
    fuel = {
      baseLitres,
      extraLitres,
      totalLitres: baseLitres + extraLitres,
      effectiveKmpl: baselineKmpl / (1 + ROOF_BOX_FUEL_PENALTY),
      extraCost: extraLitres * fuelPrice,
    };
  }

  const notes = [];
  if (overWeight) {
    notes.push(
      `Over the weight ceiling by ${(cargoWeightKg - cargoAllowanceKg).toFixed(1)} kg — the ${weightLimitedBy} allows ${cargoAllowanceKg.toFixed(1)} kg inside the box.`,
    );
  }
  if (overVolume) {
    notes.push(
      `Over the usable volume by ${Math.round(cargoVolumeL - usableVolumeL)} L — a ${boxVolumeL} L box realistically swallows ${Math.round(usableVolumeL)} L of packed bags.`,
    );
  }
  if (fits && weightSpareKg < 3) {
    notes.push("Almost no weight margin left. Move anything dense — books, tools, tinned food — into the cabin.");
  }
  if (fits && volumeSpareL >= 40) {
    notes.push(`About ${Math.round(volumeSpareL)} L spare. Fill it with bulky, light items so the box does not shift.`);
  }
  if (cargoDensityKgPer100L > 20) {
    notes.push(
      `At ${cargoDensityKgPer100L.toFixed(0)} kg per 100 L this load is dense for a roof box; heavy items belong low in the boot, not above the roofline.`,
    );
  }
  notes.push(
    `Keep to ${ROOF_BOX_SPEED_LIMIT_KMH} km/h or the lower legal limit — box makers void warranties above it, and the raised centre of gravity slows your emergency lane change.`,
  );

  return {
    cargoVolumeL,
    cargoWeightKg,
    lines,
    fixedRoofWeightKg,
    roofHeadroomKg,
    cargoAllowanceKg,
    weightLimitedBy,
    totalRoofLoadKg,
    weightUsedPct,
    weightSpareKg,
    usableVolumeL,
    volumeUsedPct,
    volumeSpareL,
    overWeight,
    overVolume,
    fits,
    fillPct,
    limitingFactor,
    cargoDensityKgPer100L,
    fuel,
    notes,
  };
}
