/**
 * Raised bed fill volume and mix quantities.
 *
 * The geometry is simple — length x width x fill depth — but three practical
 * corrections decide whether you order enough:
 *
 *  1. Fill depth is not bed height. You leave headspace at the rim so watering
 *     does not wash the mix over the side.
 *  2. A layer of coarse material at the bottom (logs, twigs, dry leaves) can
 *     take up a large share of a deep bed, and it is not mix you have to buy.
 *  3. A fresh mix settles. Compost and cocopeat lose volume as they compact and
 *     decompose, typically 10-20% in the first season.
 */

/** Length units, expressed as metres per unit. */
export const LENGTH_UNITS = {
  ft: { id: "ft", label: "feet", toMetres: 0.3048 },
  in: { id: "in", label: "inches", toMetres: 0.0254 },
  cm: { id: "cm", label: "centimetres", toMetres: 0.01 },
  m: { id: "m", label: "metres", toMetres: 1 },
};

export const LITRES_PER_M3 = 1000;
/** 1 cubic metre = 35.3147 cubic feet. */
export const CUBIC_FEET_PER_M3 = 35.3146667;

/**
 * Bulk densities in kg per cubic metre, for moist material as delivered.
 * These convert a volume order into the weight a supplier will actually quote.
 */
export const COMPONENTS = {
  soil: { id: "soil", label: "Garden or red soil", densityKgPerM3: 1300, soldBy: "weight" },
  compost: { id: "compost", label: "Compost / vermicompost", densityKgPerM3: 700, soldBy: "weight" },
  cocopeat: { id: "cocopeat", label: "Cocopeat", densityKgPerM3: 67, soldBy: "block" },
  perlite: { id: "perlite", label: "Perlite or vermiculite", densityKgPerM3: 100, soldBy: "volume" },
  sand: { id: "sand", label: "Coarse river sand", densityKgPerM3: 1600, soldBy: "weight" },
};

/** A standard compressed cocopeat block: 5 kg expands to roughly 75 litres. */
export const COCOPEAT_BLOCK_KG = 5;
export const COCOPEAT_BLOCK_LITRES = 75;

/**
 * Mix presets, as percentage of finished volume. Percentages in each preset add
 * to 100.
 */
export const MIX_PRESETS = {
  balanced: {
    id: "balanced",
    label: "Balanced raised bed",
    note: "Holds structure and nutrition; the general-purpose choice for a first bed.",
    mix: { soil: 40, compost: 30, cocopeat: 20, perlite: 10, sand: 0 },
  },
  mels: {
    id: "mels",
    label: "Square-foot gardening mix",
    note: "Mel Bartholomew's one-third each of compost, coir and vermiculite; no soil at all, so it stays light and never compacts.",
    mix: { soil: 0, compost: 34, cocopeat: 33, perlite: 33, sand: 0 },
  },
  vegetable: {
    id: "vegetable",
    label: "Heavy-feeding vegetables",
    note: "More compost for tomatoes, brinjal, gourds and other hungry crops.",
    mix: { soil: 30, compost: 40, cocopeat: 20, perlite: 10, sand: 0 },
  },
  "free-draining": {
    id: "free-draining",
    label: "Free-draining / herbs and succulents",
    note: "Sand and perlite for plants that rot in a moisture-retentive mix.",
    mix: { soil: 35, compost: 20, cocopeat: 15, perlite: 15, sand: 15 },
  },
  custom: {
    id: "custom",
    label: "Custom mix",
    note: "Set your own percentages; they must add up to 100.",
    mix: { soil: 40, compost: 30, cocopeat: 20, perlite: 10, sand: 0 },
  },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a measurement in `unitId` to metres. */
export function toMetres(value, unitId) {
  const unit = LENGTH_UNITS[unitId];
  if (!unit || !isNum(value)) return NaN;
  return value * unit.toMetres;
}

/**
 * Fill volume and per-component quantities.
 * Returns { error } for input that cannot give a meaningful answer.
 */
export function computeRaisedBedFill({
  beds = 1,
  length = 8,
  width = 4,
  height = 1,
  headspace = 0.17,
  fillerDepth = 0,
  unitId = "ft",
  settlementPercent = 15,
  mix = MIX_PRESETS.balanced.mix,
} = {}) {
  if (!LENGTH_UNITS[unitId]) return { error: "Choose a measurement unit." };

  const values = [beds, length, width, height, headspace, fillerDepth, settlementPercent];
  if (values.some((value) => !isNum(value))) return { error: "Enter valid numbers in every field." };
  if (values.some((value) => value < 0)) return { error: "None of these measurements can be negative." };

  if (beds <= 0) return { error: "You need at least one bed." };
  if (beds > 200) return { error: "More than 200 beds is a farm — check the bed count." };
  if (length <= 0 || width <= 0 || height <= 0) {
    return { error: "Length, width and height must all be greater than zero." };
  }
  if (settlementPercent > 100) return { error: "Settling allowance should be between 0% and 100%." };

  const lengthM = toMetres(length, unitId);
  const widthM = toMetres(width, unitId);
  const heightM = toMetres(height, unitId);
  const headspaceM = toMetres(headspace, unitId);
  const fillerM = toMetres(fillerDepth, unitId);

  if (lengthM > 100 || widthM > 100 || heightM > 5) {
    return { error: "Those dimensions are far larger than a raised bed — check the unit." };
  }

  const fillDepthM = heightM - headspaceM - fillerM;
  if (fillDepthM <= 0) {
    return {
      error: "Headspace plus bottom filler leaves no room for mix — reduce one of them.",
    };
  }

  const mixPercentages = { ...mix };
  let totalPercent = 0;
  for (const key of Object.keys(COMPONENTS)) {
    const value = mixPercentages[key] ?? 0;
    if (!isNum(value) || value < 0) return { error: "Mix percentages must be zero or more." };
    totalPercent += value;
  }
  if (Math.abs(totalPercent - 100) > 0.5) {
    return { error: `Mix percentages add up to ${Math.round(totalPercent)}% — they must total 100%.` };
  }

  const bedAreaM2 = lengthM * widthM;
  const grossVolumeM3 = bedAreaM2 * heightM;
  const fillVolumeM3 = bedAreaM2 * fillDepthM;
  const fillerVolumeM3 = bedAreaM2 * fillerM;

  const settlementFactor = 1 + settlementPercent / 100;
  const orderVolumeM3PerBed = fillVolumeM3 * settlementFactor;
  const totalOrderM3 = orderVolumeM3PerBed * beds;

  const components = Object.values(COMPONENTS)
    .map((component) => {
      const share = (mixPercentages[component.id] ?? 0) / 100;
      const volumeM3 = totalOrderM3 * share;
      const litres = volumeM3 * LITRES_PER_M3;
      return {
        id: component.id,
        label: component.label,
        percent: mixPercentages[component.id] ?? 0,
        soldBy: component.soldBy,
        volumeM3,
        litres,
        cubicFeet: volumeM3 * CUBIC_FEET_PER_M3,
        kilograms: volumeM3 * component.densityKgPerM3,
        blocks: component.id === "cocopeat" ? litres / COCOPEAT_BLOCK_LITRES : null,
      };
    })
    .filter((component) => component.percent > 0);

  return {
    bedAreaM2,
    fillDepthM,
    grossVolumeM3PerBed: grossVolumeM3,
    fillVolumeM3PerBed: fillVolumeM3,
    fillerVolumeM3PerBed: fillerVolumeM3,
    fillerVolumeLitresTotal: fillerVolumeM3 * beds * LITRES_PER_M3,
    orderVolumeM3PerBed,
    totalOrderM3,
    totalOrderLitres: totalOrderM3 * LITRES_PER_M3,
    totalOrderCubicFeet: totalOrderM3 * CUBIC_FEET_PER_M3,
    totalWeightKg: components.reduce((sum, component) => sum + component.kilograms, 0),
    components,
    settlementExtraLitres: (totalOrderM3 - fillVolumeM3 * beds) * LITRES_PER_M3,
  };
}

/** Total cost when the user supplies rates; rates are optional and default to zero. */
export function costForComponents(components, rates = {}) {
  let total = 0;
  const lines = [];
  for (const component of components) {
    const rate = Number(rates[component.id]);
    if (!Number.isFinite(rate) || rate <= 0) {
      lines.push({ ...component, rate: 0, cost: 0 });
      continue;
    }
    let cost = 0;
    if (component.soldBy === "weight") cost = component.kilograms * rate;
    else if (component.soldBy === "block") cost = Math.ceil(component.blocks ?? 0) * rate;
    else cost = component.litres * rate;
    lines.push({ ...component, rate, cost });
    total += cost;
  }
  return { lines, total };
}
