/**
 * Potting mix quantities by pot volume and ratio.
 *
 * Gardeners describe a mix in PARTS ("two parts soil, one part compost, one part
 * coir"), not percentages, so that is what this works in: each component gets
 *
 *   litres = fill volume x (its parts / total parts)
 *
 * Pot volume is real geometry rather than the number moulded on the rim. A
 * tapered nursery pot is a truncated cone, so the correct formula is
 *
 *   V = (pi x h / 3) x (R^2 + R r + r^2)
 *
 * and using the top diameter alone overstates a 12-inch pot by nearly a third.
 */

/** Length units, expressed as metres per unit. */
export const LENGTH_UNITS = {
  cm: { id: "cm", label: "centimetres", toMetres: 0.01 },
  in: { id: "in", label: "inches", toMetres: 0.0254 },
};

export const LITRES_PER_M3 = 1000;

export const POT_SHAPES = {
  tapered: {
    id: "tapered",
    label: "Round pot (tapered)",
    fields: ["topDiameter", "bottomDiameter", "height"],
    note: "The usual nursery or terracotta pot, wider at the rim than the base.",
  },
  cylinder: {
    id: "cylinder",
    label: "Grow bag or straight-sided pot",
    fields: ["topDiameter", "height"],
    note: "Fabric grow bags and straight tubs, where top and base are the same width.",
  },
  rectangular: {
    id: "rectangular",
    label: "Rectangular trough or planter",
    fields: ["length", "width", "height"],
    note: "Window boxes, balcony troughs and square planters.",
  },
};

/**
 * Bulk densities in kg per cubic metre for moist material as supplied, used to
 * convert a litre order into the weight a shop will quote.
 */
export const COMPONENTS = {
  soil: { id: "soil", label: "Garden or red soil", short: "soil", densityKgPerM3: 1300, soldBy: "weight" },
  compost: { id: "compost", label: "Compost / vermicompost", short: "compost", densityKgPerM3: 700, soldBy: "weight" },
  cocopeat: { id: "cocopeat", label: "Cocopeat", short: "cocopeat", densityKgPerM3: 67, soldBy: "block" },
  perlite: { id: "perlite", label: "Perlite or vermiculite", short: "perlite", densityKgPerM3: 100, soldBy: "volume" },
  sand: { id: "sand", label: "Coarse river sand", short: "sand", densityKgPerM3: 1600, soldBy: "weight" },
};

/** A standard compressed cocopeat block: 5 kg expands to roughly 75 litres. */
export const COCOPEAT_BLOCK_KG = 5;
export const COCOPEAT_BLOCK_LITRES = 75;

/** Ratios expressed in parts by volume. */
export const MIX_PRESETS = {
  general: {
    id: "general",
    label: "General potting mix",
    note: "The default for most flowering and foliage plants in pots.",
    parts: { soil: 2, compost: 1, cocopeat: 1, perlite: 0.5, sand: 0 },
  },
  vegetable: {
    id: "vegetable",
    label: "Container vegetables",
    note: "More compost for tomato, chilli, brinjal and leafy greens in grow bags.",
    parts: { soil: 1, compost: 1.5, cocopeat: 1, perlite: 0.5, sand: 0 },
  },
  seedling: {
    id: "seedling",
    label: "Seed starting mix",
    note: "Fine, light and low in nutrients so seedlings root easily; no garden soil, which carries damping-off fungi.",
    parts: { soil: 0, compost: 1, cocopeat: 3, perlite: 1, sand: 0 },
  },
  succulent: {
    id: "succulent",
    label: "Cactus and succulent",
    note: "Mostly grit so water drains through in seconds; these plants rot in a moisture-retentive mix.",
    parts: { soil: 1, compost: 0.5, cocopeat: 0.5, perlite: 1, sand: 2 },
  },
  indoor: {
    id: "indoor",
    label: "Indoor foliage",
    note: "Light and airy for monstera, pothos and philodendron, which dislike heavy wet soil around the roots.",
    parts: { soil: 0.5, compost: 1, cocopeat: 2, perlite: 1, sand: 0 },
  },
  custom: {
    id: "custom",
    label: "Custom ratio",
    note: "Set your own parts; any positive numbers work.",
    parts: { soil: 2, compost: 1, cocopeat: 1, perlite: 0.5, sand: 0 },
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
 * Volume in cubic metres of the filled part of one container.
 *
 * For a tapered pot the mix surface sits below the rim, so the radius at the
 * fill line is smaller than the rim radius. It is found by interpolating between
 * base and rim over the full height, and the frustum formula then runs between
 * the base radius and that fill-line radius.
 */
export function containerVolumeM3({
  shapeId,
  topDiameterM,
  bottomDiameterM,
  lengthM,
  widthM,
  fillHeightM,
  totalHeightM,
}) {
  if (!isNum(fillHeightM) || fillHeightM <= 0) return 0;
  if (shapeId === "rectangular") {
    if (!isNum(lengthM) || !isNum(widthM) || lengthM <= 0 || widthM <= 0) return 0;
    return lengthM * widthM * fillHeightM;
  }
  if (!isNum(topDiameterM) || topDiameterM <= 0) return 0;
  const rimRadius = topDiameterM / 2;
  if (shapeId === "cylinder") {
    return Math.PI * rimRadius * rimRadius * fillHeightM;
  }
  if (!isNum(bottomDiameterM) || bottomDiameterM <= 0) return 0;
  if (!isNum(totalHeightM) || totalHeightM <= 0) return 0;
  const bottomRadius = bottomDiameterM / 2;
  const fillRadius = bottomRadius + (rimRadius - bottomRadius) * (fillHeightM / totalHeightM);
  return (
    ((Math.PI * fillHeightM) / 3) *
    (fillRadius * fillRadius + fillRadius * bottomRadius + bottomRadius * bottomRadius)
  );
}

/**
 * Mix quantities for a batch of containers.
 * Returns { error } for input that cannot give a meaningful answer.
 */
export function computePottingMix({
  shapeId = "tapered",
  unitId = "cm",
  topDiameter = 30,
  bottomDiameter = 22,
  length = 60,
  width = 20,
  height = 28,
  headspace = 3,
  pots = 1,
  parts = MIX_PRESETS.general.parts,
  scoopLitres = 5,
} = {}) {
  if (!POT_SHAPES[shapeId]) return { error: "Choose a container shape." };
  if (!LENGTH_UNITS[unitId]) return { error: "Choose a measurement unit." };

  const values = [topDiameter, bottomDiameter, length, width, height, headspace, pots, scoopLitres];
  if (values.some((value) => !isNum(value))) return { error: "Enter valid numbers in every field." };
  if (values.some((value) => value < 0)) return { error: "None of these measurements can be negative." };

  if (pots <= 0) return { error: "You need at least one container." };
  if (pots > 1000) return { error: "More than 1000 containers is a nursery — check the count." };
  if (height <= 0) return { error: "Container height must be greater than zero." };
  if (scoopLitres <= 0) return { error: "Scoop size must be greater than zero." };

  const fillHeight = height - headspace;
  if (fillHeight <= 0) {
    return { error: "Headspace is as deep as the container — reduce it." };
  }

  const fillHeightM = toMetres(fillHeight, unitId);
  const totalHeightM = toMetres(height, unitId);
  const topDiameterM = toMetres(topDiameter, unitId);
  const bottomDiameterM = toMetres(bottomDiameter, unitId);
  const lengthM = toMetres(length, unitId);
  const widthM = toMetres(width, unitId);

  if (fillHeightM > 3 || topDiameterM > 5 || lengthM > 10) {
    return { error: "Those dimensions are larger than a planter — check the unit." };
  }

  const volumeM3 = containerVolumeM3({
    shapeId,
    topDiameterM,
    bottomDiameterM,
    lengthM,
    widthM,
    fillHeightM,
    totalHeightM,
  });
  if (!(volumeM3 > 0)) {
    return { error: "Enter every dimension for this shape as a number greater than zero." };
  }

  const partValues = {};
  let totalParts = 0;
  for (const key of Object.keys(COMPONENTS)) {
    const value = parts[key] ?? 0;
    if (!isNum(value) || value < 0) return { error: "Mix parts must be zero or more." };
    partValues[key] = value;
    totalParts += value;
  }
  if (totalParts <= 0) return { error: "Give at least one component a positive number of parts." };

  const litresPerPot = volumeM3 * LITRES_PER_M3;
  const totalLitres = litresPerPot * pots;

  const components = Object.values(COMPONENTS)
    .map((component) => {
      const share = partValues[component.id] / totalParts;
      const litres = totalLitres * share;
      const componentVolumeM3 = litres / LITRES_PER_M3;
      return {
        id: component.id,
        label: component.label,
        short: component.short,
        parts: partValues[component.id],
        percent: share * 100,
        soldBy: component.soldBy,
        litresPerPot: litresPerPot * share,
        litres,
        kilograms: componentVolumeM3 * component.densityKgPerM3,
        blocks: component.id === "cocopeat" ? litres / COCOPEAT_BLOCK_LITRES : null,
        scoops: litres / scoopLitres,
      };
    })
    .filter((component) => component.parts > 0);

  return {
    fillHeight,
    litresPerPot,
    totalLitres,
    totalParts,
    totalWeightKg: components.reduce((sum, component) => sum + component.kilograms, 0),
    totalScoops: totalLitres / scoopLitres,
    components,
    ratioText: components.map((component) => `${component.parts} ${component.short}`).join(" : "),
  };
}
