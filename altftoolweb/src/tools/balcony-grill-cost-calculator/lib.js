/**
 * Balcony and window grill cost, from the openings you measure.
 *
 * Fabricators quote grills two ways — per square foot of grill, or per kilogram of fabricated
 * steel — and the second only makes sense if you can work out the weight. That is what this
 * module does, from first principles rather than a rule of thumb:
 *
 *   mass per metre of a bar = cross-section area x density
 *     round bar  : (pi / 4) x d^2 (mm^2) x 1e-6 x density
 *     square bar : d^2 (mm^2) x 1e-6 x density
 *
 * (For mild steel this reproduces the familiar shortcut d^2 / 162 kg per metre for round bar.)
 *
 * The grill itself is a frame around the opening, vertical infill bars at a set spacing, and a
 * number of horizontal members:
 *
 *   vertical bars   = ceil(opening width / bar spacing) - 1
 *   clear gap       = (width - bars x bar thickness) / (bars + 1)
 *   steel weight    = frame perimeter x frame mass/m + total bar length x bar mass/m
 *
 * The clear gap matters for safety, not just cost: infill on a balcony guard is normally
 * required to leave no gap a small child can pass through, which is why 100 mm is the usual
 * maximum and why the gap is reported and flagged here.
 */

/** Densities in kg per cubic metre. */
export const MATERIALS = [
  { value: "ms", label: "Mild steel (MS)", density: 7850 },
  { value: "ss304", label: "Stainless steel 304", density: 7900 },
  { value: "aluminium", label: "Aluminium", density: 2700 },
];

export const BAR_SHAPES = [
  { value: "square", label: "Square bar" },
  { value: "round", label: "Round bar" },
];

/** Exact conversion: one foot is 304.8 mm. */
export const FT_TO_MM = 304.8;
export const MM_TO_M = 0.001;

/**
 * Mass per metre of an MS 25 x 25 x 3 mm angle, the common light grill frame section:
 * (25 + 25 - 3) x 3 = 141 mm^2 of steel, which at 7850 kg/m^3 is about 1.11 kg per metre.
 */
export const DEFAULT_FRAME_KG_PER_M = 1.11;

/**
 * Maximum clear gap between infill bars on a balcony guard. Guard-rail infill is specified so
 * that a small child cannot pass through or get a head trapped; 100 mm is the usual limit.
 */
export const MAX_SAFE_GAP_MM = 100;

/** Sanity ceilings. */
export const MAX_OPENING_FT = 40;
export const MAX_OPENINGS = 20;

/**
 * Mass per metre of a bar.
 * @param {"square"|"round"} shape
 * @param {number} sizeMm bar side or diameter in millimetres
 * @param {number} density kg per cubic metre
 * @returns {number} kg per metre, 0 for invalid input
 */
export function barMassPerMetre(shape, sizeMm, density) {
  if (!Number.isFinite(sizeMm) || !Number.isFinite(density)) return 0;
  if (sizeMm <= 0 || density <= 0) return 0;
  const areaMm2 = shape === "round" ? (Math.PI / 4) * sizeMm * sizeMm : sizeMm * sizeMm;
  return areaMm2 * 1e-6 * density;
}

/**
 * @returns {{error:string}|object} area, steel weight and the itemised cost
 */
export function estimateGrillCost({
  openings,
  materialKey = "ms",
  barShape = "square",
  barSizeMm,
  barSpacingMm,
  horizontalMembers = 2,
  frameKgPerM = DEFAULT_FRAME_KG_PER_M,
  pricingMode = "weight",
  ratePerKg = 0,
  ratePerSqft = 0,
  paintRatePerSqft = 0,
  installPerOpening = 0,
  openablePanels = 0,
  openablePanelRate = 0,
}) {
  if (!Array.isArray(openings) || openings.length === 0) {
    return { error: "Add at least one opening to measure." };
  }
  if (openings.length > MAX_OPENINGS) {
    return { error: `Measure up to ${MAX_OPENINGS} openings at a time.` };
  }
  const scalars = [
    barSizeMm,
    barSpacingMm,
    horizontalMembers,
    frameKgPerM,
    ratePerKg,
    ratePerSqft,
    paintRatePerSqft,
    installPerOpening,
    openablePanels,
    openablePanelRate,
  ];
  if (scalars.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (scalars.some((v) => v < 0)) {
    return { error: "Sizes and rates cannot be negative." };
  }
  if (!(barSizeMm > 0) || barSizeMm > 100) {
    return { error: "Bar size must be between 0 and 100 mm." };
  }
  if (!(barSpacingMm > 0) || barSpacingMm > 1000) {
    return { error: "Bar spacing must be between 0 and 1000 mm." };
  }
  if (barSpacingMm <= barSizeMm) {
    return { error: "Bar spacing must be larger than the bar itself." };
  }
  if (!Number.isInteger(horizontalMembers) || horizontalMembers > 20) {
    return { error: "Horizontal members must be a whole number, 20 or fewer." };
  }
  if (!Number.isInteger(openablePanels) || openablePanels > 20) {
    return { error: "Openable panels must be a whole number, 20 or fewer." };
  }

  const material = MATERIALS.find((m) => m.value === materialKey) ?? MATERIALS[0];
  const barKgPerM = barMassPerMetre(barShape, barSizeMm, material.density);

  const detail = [];
  let totalAreaSqft = 0;
  let totalWeightKg = 0;
  let totalUnits = 0;
  let minClearGapMm = Infinity;

  for (let i = 0; i < openings.length; i += 1) {
    const opening = openings[i] ?? {};
    const widthFt = typeof opening.widthFt === "number" ? opening.widthFt : NaN;
    const heightFt = typeof opening.heightFt === "number" ? opening.heightFt : NaN;
    const quantity = typeof opening.quantity === "number" ? opening.quantity : NaN;
    if (![widthFt, heightFt, quantity].every((v) => Number.isFinite(v))) {
      return { error: `Opening ${i + 1} needs a width, a height and a quantity.` };
    }
    if (!(widthFt > 0) || !(heightFt > 0)) {
      return { error: `Opening ${i + 1} must have a width and height greater than zero.` };
    }
    if (widthFt > MAX_OPENING_FT || heightFt > MAX_OPENING_FT) {
      return { error: `Opening ${i + 1} must be ${MAX_OPENING_FT} feet or less on each side.` };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return { error: `Opening ${i + 1} needs a whole quantity between 1 and 100.` };
    }

    const widthMm = widthFt * FT_TO_MM;
    const heightMm = heightFt * FT_TO_MM;
    const areaSqft = widthFt * heightFt;

    const barCount = Math.max(0, Math.ceil(widthMm / barSpacingMm) - 1);
    const clearGapMm =
      barCount > 0 ? (widthMm - barCount * barSizeMm) / (barCount + 1) : widthMm;

    const verticalLengthM = barCount * heightMm * MM_TO_M;
    const horizontalLengthM = horizontalMembers * widthMm * MM_TO_M;
    const framePerimeterM = 2 * (widthMm + heightMm) * MM_TO_M;

    const weightPerUnit =
      (verticalLengthM + horizontalLengthM) * barKgPerM + framePerimeterM * frameKgPerM;

    detail.push({
      index: i + 1,
      widthFt,
      heightFt,
      quantity,
      areaSqft,
      areaTotalSqft: areaSqft * quantity,
      barCount,
      clearGapMm,
      framePerimeterM,
      barLengthM: verticalLengthM + horizontalLengthM,
      weightPerUnit,
      weightTotal: weightPerUnit * quantity,
    });

    totalAreaSqft += areaSqft * quantity;
    totalWeightKg += weightPerUnit * quantity;
    totalUnits += quantity;
    if (clearGapMm < minClearGapMm) minClearGapMm = clearGapMm;
  }

  const steelCost =
    pricingMode === "area" ? totalAreaSqft * ratePerSqft : totalWeightKg * ratePerKg;
  const paintCost = totalAreaSqft * paintRatePerSqft;
  const installCost = totalUnits * installPerOpening;
  const openableCost = openablePanels * openablePanelRate;

  const items = [
    [
      pricingMode === "area"
        ? `Grill priced by area (${totalAreaSqft.toFixed(1)} sq ft)`
        : `Grill priced by weight (${totalWeightKg.toFixed(1)} kg)`,
      steelCost,
    ],
    [`Primer and paint (${totalAreaSqft.toFixed(1)} sq ft)`, paintCost],
    [`Openable panels (${openablePanels})`, openableCost],
    [`Installation (${totalUnits} opening${totalUnits === 1 ? "" : "s"})`, installCost],
  ];
  const total = items.reduce((sum, [, value]) => sum + value, 0);

  const costPerSqft = totalAreaSqft > 0 ? total / totalAreaSqft : 0;
  const costPerKg = totalWeightKg > 0 ? total / totalWeightKg : 0;
  const kgPerSqft = totalAreaSqft > 0 ? totalWeightKg / totalAreaSqft : 0;

  const maxGapMm = detail.reduce((max, d) => Math.max(max, d.clearGapMm), 0);

  const notes = [];
  notes.push(
    `${barSizeMm} mm ${barShape} bar in ${material.label.toLowerCase()} weighs ${barKgPerM.toFixed(3)} kg per metre, so this job carries about ${totalWeightKg.toFixed(1)} kg of metal — roughly ${kgPerSqft.toFixed(2)} kg per square foot of grill.`,
  );
  if (maxGapMm > MAX_SAFE_GAP_MM) {
    notes.push(
      `The widest clear gap works out at ${maxGapMm.toFixed(0)} mm, above the ${MAX_SAFE_GAP_MM} mm normally allowed on a balcony guard. Tighten the spacing before ordering — a gap a small child can pass through is a fall risk regardless of the cost saved.`,
    );
  } else {
    notes.push(
      `Clear gaps come out between ${minClearGapMm.toFixed(0)} mm and ${maxGapMm.toFixed(0)} mm, inside the ${MAX_SAFE_GAP_MM} mm usually required for balcony infill.`,
    );
  }
  if (pricingMode === "weight" && ratePerKg > 0) {
    notes.push(
      `At ${ratePerKg} per kg the steel works out at ${(steelCost / Math.max(totalAreaSqft, 1e-9)).toFixed(0)} per square foot — compare that against any per-square-foot quote you have been given for the same bar size and spacing.`,
    );
  }
  if (materialKey === "ms" && paintRatePerSqft === 0) {
    notes.push(
      "Mild steel needs a primer and finish coat or it will rust, especially on an exposed balcony. Budget for it rather than discovering it as an extra.",
    );
  }
  if (materialKey === "aluminium") {
    notes.push(
      "Aluminium is about a third the weight of steel for the same section, so a per-kilogram rate looks cheap on total weight but the rate per kilogram is much higher. Compare aluminium quotes per square foot instead.",
    );
  }

  return {
    material,
    barKgPerM,
    detail,
    totalAreaSqft,
    totalWeightKg,
    totalUnits,
    minClearGapMm: Number.isFinite(minClearGapMm) ? minClearGapMm : 0,
    maxGapMm,
    steelCost,
    paintCost,
    openableCost,
    installCost,
    items,
    total,
    costPerSqft,
    costPerKg,
    kgPerSqft,
    notes,
  };
}
