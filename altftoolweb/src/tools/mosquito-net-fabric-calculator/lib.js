/**
 * Mosquito net material for windows and doors: mesh off the roll, frame section, fixing tape
 * and the cost of the lot.
 *
 * Insect mesh is sold from a roll of fixed width, so the real question is not area but how the
 * openings are cut out of that roll. For each opening the mesh is cut with a hem allowance on
 * both dimensions, and it can be taken along the roll or turned 90 degrees across it:
 *
 *   panels needed   = ceil( (dimension across the roll) / roll width )
 *   running length  = panels x (the other dimension)
 *
 * The better orientation is the one needing FEWER panels — every extra panel is a joint in the
 * middle of the net, which is both ugly and a place insects get in — and length is only the
 * tie-breaker. Frame section and fixing tape follow the perimeter of each opening.
 *
 * Mesh specification matters as much as quantity: standard insect screen is woven at roughly
 * 16 to 18 strands per inch, giving an aperture near 1.2 mm, which stops mosquitoes. Finer
 * counts of 20 and above are needed to keep out midges and thrips, at the cost of airflow.
 */

/** Exact conversions. */
export const FT_TO_M = 0.3048;
export const INCHES_PER_FOOT = 12;

/** Hem and tuck allowance added to each dimension of every panel. */
export const DEFAULT_ALLOWANCE_INCHES = 3;

/**
 * Common roll widths for insect mesh. Fibreglass and polyester netting is normally sold in
 * 3 ft and 4 ft widths, and metric rolls at 1.2 m.
 */
export const ROLL_WIDTHS = [
  { value: "3", label: "3 ft roll", widthFt: 3 },
  { value: "4", label: "4 ft roll", widthFt: 4 },
  { value: "5", label: "5 ft roll", widthFt: 5 },
  { value: "1.2m", label: "1.2 m roll (3.94 ft)", widthFt: 1.2 / FT_TO_M },
];

/**
 * Mesh counts in strands per inch, with the approximate clear aperture each leaves.
 * 16 to 18 is the ordinary mosquito screen; finer counts stop smaller insects but cut airflow.
 */
export const MESH_GRADES = [
  { value: "16", label: "16 mesh — standard mosquito screen", strandsPerInch: 16, apertureMm: 1.2 },
  { value: "18", label: "18 x 16 mesh — standard insect screen", strandsPerInch: 18, apertureMm: 1.1 },
  { value: "20", label: "20 mesh — small flies and midges", strandsPerInch: 20, apertureMm: 0.9 },
  { value: "30", label: "30 mesh — thrips and sandflies", strandsPerInch: 30, apertureMm: 0.6 },
];

export const MAX_OPENING_FT = 40;
export const MAX_OPENINGS = 25;

/**
 * Cutting plan for one opening.
 * @returns {{orientation:string,panels:number,runningFeet:number,seams:number}}
 */
export function planMeshCut({ widthFt, heightFt, allowanceFt, rollWidthFt }) {
  const cutWidth = widthFt + allowanceFt;
  const cutHeight = heightFt + allowanceFt;

  // Upright: the opening's width lies across the roll, and length is drawn off it.
  const uprightPanels = Math.ceil(cutWidth / rollWidthFt);
  const uprightLength = uprightPanels * cutHeight;

  // Turned: the opening's height lies across the roll instead.
  const turnedPanels = Math.ceil(cutHeight / rollWidthFt);
  const turnedLength = turnedPanels * cutWidth;

  const preferTurned =
    turnedPanels < uprightPanels ||
    (turnedPanels === uprightPanels && turnedLength < uprightLength);

  const panels = preferTurned ? turnedPanels : uprightPanels;
  const runningFeet = preferTurned ? turnedLength : uprightLength;

  return {
    orientation: preferTurned ? "turned across the roll" : "upright along the roll",
    panels,
    runningFeet,
    seams: Math.max(0, panels - 1),
  };
}

/**
 * @returns {{error:string}|object} mesh, frame, tape quantities and the itemised cost
 */
export function estimateMosquitoNet({
  openings,
  allowanceInches = DEFAULT_ALLOWANCE_INCHES,
  rollWidthFt,
  meshGrade = "16",
  meshRatePerFoot = 0,
  frameRatePerFoot = 0,
  tapeRatePerFoot = 0,
  stiffenersPerOpening = 0,
  hardwarePerOpening = 0,
  labourPerOpening = 0,
}) {
  if (!Array.isArray(openings) || openings.length === 0) {
    return { error: "Add at least one window or door to measure." };
  }
  if (openings.length > MAX_OPENINGS) {
    return { error: `Measure up to ${MAX_OPENINGS} openings at a time.` };
  }
  const scalars = [
    allowanceInches,
    rollWidthFt,
    meshRatePerFoot,
    frameRatePerFoot,
    tapeRatePerFoot,
    stiffenersPerOpening,
    hardwarePerOpening,
    labourPerOpening,
  ];
  if (scalars.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (scalars.some((v) => v < 0)) {
    return { error: "Sizes and rates cannot be negative." };
  }
  if (!(rollWidthFt > 0) || rollWidthFt > 20) {
    return { error: "Roll width must be between 0 and 20 feet." };
  }
  if (allowanceInches > 24) {
    return { error: "Hem allowance must be 24 inches or less." };
  }
  if (!Number.isInteger(stiffenersPerOpening) || stiffenersPerOpening > 10) {
    return { error: "Stiffener bars must be a whole number, 10 or fewer." };
  }

  const mesh = MESH_GRADES.find((m) => m.value === meshGrade) ?? MESH_GRADES[0];
  const allowanceFt = allowanceInches / INCHES_PER_FOOT;

  const detail = [];
  let totalMeshFeet = 0;
  let totalFrameFeet = 0;
  let totalTapeFeet = 0;
  let totalAreaSqft = 0;
  let totalUnits = 0;
  let totalSeams = 0;

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

    const cut = planMeshCut({ widthFt, heightFt, allowanceFt, rollWidthFt });
    const perimeterFt = 2 * (widthFt + heightFt);
    const stiffenerFt = stiffenersPerOpening * widthFt;
    const frameFt = perimeterFt + stiffenerFt;
    const areaSqft = widthFt * heightFt;

    detail.push({
      index: i + 1,
      widthFt,
      heightFt,
      quantity,
      areaSqft,
      areaTotalSqft: areaSqft * quantity,
      orientation: cut.orientation,
      panels: cut.panels,
      seams: cut.seams,
      meshFeetEach: cut.runningFeet,
      meshFeetTotal: cut.runningFeet * quantity,
      perimeterFt,
      frameFtEach: frameFt,
      frameFtTotal: frameFt * quantity,
    });

    totalMeshFeet += cut.runningFeet * quantity;
    totalFrameFeet += frameFt * quantity;
    totalTapeFeet += perimeterFt * quantity;
    totalAreaSqft += areaSqft * quantity;
    totalUnits += quantity;
    totalSeams += cut.seams * quantity;
  }

  const totalMeshMetres = totalMeshFeet * FT_TO_M;
  const meshCost = totalMeshFeet * meshRatePerFoot;
  const frameCost = totalFrameFeet * frameRatePerFoot;
  const tapeCost = totalTapeFeet * tapeRatePerFoot;
  const hardwareCost = totalUnits * hardwarePerOpening;
  const labourCost = totalUnits * labourPerOpening;

  const items = [
    [`Mesh (${totalMeshFeet.toFixed(2)} running ft)`, meshCost],
    [`Frame section (${totalFrameFeet.toFixed(2)} ft)`, frameCost],
    [`Fixing tape or magnetic strip (${totalTapeFeet.toFixed(2)} ft)`, tapeCost],
    [`Hardware (${totalUnits} opening${totalUnits === 1 ? "" : "s"})`, hardwareCost],
    [`Fitting labour (${totalUnits} opening${totalUnits === 1 ? "" : "s"})`, labourCost],
  ];
  const total = items.reduce((sum, [, value]) => sum + value, 0);

  const costPerSqft = totalAreaSqft > 0 ? total / totalAreaSqft : 0;
  const costPerOpening = totalUnits > 0 ? total / totalUnits : 0;
  const meshUtilisationPct =
    totalMeshFeet > 0 ? (totalAreaSqft / (totalMeshFeet * rollWidthFt)) * 100 : 0;

  const notes = [];
  notes.push(
    `${totalMeshFeet.toFixed(2)} running feet (${totalMeshMetres.toFixed(2)} m) off a ${rollWidthFt.toFixed(2)} ft roll covers ${totalAreaSqft.toFixed(1)} sq ft of opening — about ${meshUtilisationPct.toFixed(0)}% of the mesh bought ends up over an opening, the rest going to hems and offcuts.`,
  );
  if (totalSeams > 0) {
    notes.push(
      `${totalSeams} joint${totalSeams === 1 ? "" : "s"} will be needed because some openings are wider than the roll in both directions. A wider roll usually costs less than seaming, and a seam is where insects find their way in.`,
    );
  }
  notes.push(
    `${mesh.label} leaves an aperture around ${mesh.apertureMm} mm. Anything at 16 mesh or finer stops mosquitoes; going finer than that trades airflow for keeping out smaller insects.`,
  );
  if (allowanceInches < 2) {
    notes.push(
      "A hem allowance under 2 inches leaves little to grip. Velcro and magnetic fixings need a folded edge to hold, and mesh cut exactly to size will pull free at the corners.",
    );
  }
  if (stiffenersPerOpening === 0) {
    const tallOpenings = detail.filter((d) => d.heightFt >= 6).length;
    if (tallOpenings > 0) {
      notes.push(
        `${tallOpenings} opening${tallOpenings === 1 ? " is" : "s are"} 6 ft or taller with no stiffener bar. A door-height net without a mid rail sags and bows away from the frame.`,
      );
    }
  }

  return {
    mesh,
    rollWidthFt,
    allowanceFt,
    detail,
    totalMeshFeet,
    totalMeshMetres,
    totalFrameFeet,
    totalTapeFeet,
    totalAreaSqft,
    totalUnits,
    totalSeams,
    meshCost,
    frameCost,
    tapeCost,
    hardwareCost,
    labourCost,
    items,
    total,
    costPerSqft,
    costPerOpening,
    meshUtilisationPct,
    notes,
  };
}
