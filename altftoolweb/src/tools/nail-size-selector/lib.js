/**
 * Nail size selection.
 *
 * The size of a nail is decided by how far it has to reach into the piece
 * underneath, not by how thick the piece on top is. The National Design
 * Specification for Wood Construction (NDS) sets that out directly: a nail
 * needs at least 6 diameters of penetration into the main member to carry any
 * lateral design value at all, and 10 diameters to carry the full value. That
 * single rule is what this tool solves, by walking the standard nail table
 * and returning the first size whose penetration clears 10 x its own
 * diameter.
 *
 * The familiar carpenter's version — "the nail should be three times as long
 * as the board you are fastening" — is the same idea with the arithmetic done
 * in advance for thin stock. It is reported alongside for comparison, and it
 * over-specifies badly once the top piece is framing lumber.
 *
 * Penny sizes: for 2d to 10d, length in inches = (d + 2) / 4. Above 10d the
 * series stops following the formula and the tabulated lengths take over.
 *
 * Prescriptive fastening schedules for framing come from IRC Table
 * R602.3(1); a working subset is included for reference.
 */

export const MM_PER_INCH = 25.4;

/** NDS penetration into the main member, expressed in nail diameters. */
export const MIN_PENETRATION_DIAMETERS = 6;
export const FULL_PENETRATION_DIAMETERS = 10;

/** The carpenter's rule of thumb: total length = 3 x thickness fastened. */
export const RULE_OF_THUMB_MULTIPLE = 3;

/** Trim nails should reach at least 3/4 inch (19 mm) into the framing. */
export const TRIM_MIN_PENETRATION_IN = 0.75;

/**
 * Penny length formula, valid 2d to 10d: length (inches) = (d + 2) / 4.
 * Returns null outside that range, where the series is tabulated instead.
 */
export function pennyLengthInches(penny) {
  if (!Number.isFinite(penny) || penny < 2 || penny > 10) return null;
  return (penny + 2) / 4;
}

/**
 * Standard common nails: length in inches, wire gauge, shank diameter in
 * inches. `stocked` marks the sizes a merchant actually keeps — 5d, 7d and 9d
 * are in the penny series but are rarely sold, so the selector skips them
 * rather than recommending something you cannot buy.
 */
export const COMMON_NAILS = [
  { penny: "2d", d: 2, lengthIn: 1.0, gauge: 15, diaIn: 0.072, stocked: true },
  { penny: "3d", d: 3, lengthIn: 1.25, gauge: 14, diaIn: 0.08, stocked: true },
  { penny: "4d", d: 4, lengthIn: 1.5, gauge: 12.5, diaIn: 0.099, stocked: true },
  { penny: "5d", d: 5, lengthIn: 1.75, gauge: 12.5, diaIn: 0.099, stocked: false },
  { penny: "6d", d: 6, lengthIn: 2.0, gauge: 11.5, diaIn: 0.113, stocked: true },
  { penny: "8d", d: 8, lengthIn: 2.5, gauge: 10.25, diaIn: 0.131, stocked: true },
  { penny: "10d", d: 10, lengthIn: 3.0, gauge: 9, diaIn: 0.148, stocked: true },
  { penny: "12d", d: 12, lengthIn: 3.25, gauge: 9, diaIn: 0.148, stocked: true },
  { penny: "16d", d: 16, lengthIn: 3.5, gauge: 8, diaIn: 0.162, stocked: true },
  { penny: "20d", d: 20, lengthIn: 4.0, gauge: 6, diaIn: 0.192, stocked: true },
  { penny: "30d", d: 30, lengthIn: 4.5, gauge: 5, diaIn: 0.207, stocked: true },
  { penny: "40d", d: 40, lengthIn: 5.0, gauge: 4, diaIn: 0.225, stocked: true },
  { penny: "60d", d: 60, lengthIn: 6.0, gauge: 2, diaIn: 0.263, stocked: true },
];

/**
 * Prescriptive minimum for wood structural panel sheathing, IRC Table
 * R602.3(1): 6d common up to 1/2 inch, 8d common from 19/32 to 1 inch.
 */
export function sheathingMinimumPenny(panelThicknessIn) {
  if (!Number.isFinite(panelThicknessIn) || panelThicknessIn <= 0) return null;
  if (panelThicknessIn <= 0.5) return "6d";
  if (panelThicknessIn <= 1.0) return "8d";
  return "10d";
}

/** How far a nail may show through the far face before it counts, mm. */
export const PROTRUSION_TOLERANCE_MM = 1.5;

/**
 * Box nails share the penny lengths but use thinner wire, which is why they
 * split thin or dry stock less and hold less.
 */
export const BOX_NAIL_DIAMETERS_IN = {
  "6d": 0.099,
  "8d": 0.113,
  "10d": 0.128,
  "16d": 0.135,
  "20d": 0.148,
};

/** Gun-driven trim nails, by wire gauge. */
export const TRIM_NAILS = [
  {
    gauge: "23 ga pin",
    diaIn: 0.025,
    maxTrimIn: 0.25,
    use: "Holding a mitre while the glue sets. Effectively headless, leaves almost no hole, and carries almost no load on its own.",
  },
  {
    gauge: "18 ga brad",
    diaIn: 0.0475,
    maxTrimIn: 0.5,
    use: "Shoe moulding, beading, small cover strips and thin panel edges. The default trim nail for light work.",
  },
  {
    gauge: "16 ga finish",
    diaIn: 0.0625,
    maxTrimIn: 0.75,
    use: "Skirting, architrave, casing and window boards. Holds real weight and the head still fills easily.",
  },
  {
    gauge: "15 ga finish",
    diaIn: 0.072,
    maxTrimIn: 1.25,
    use: "Door jambs, heavy mouldings and anything structural-ish in trim. Angled magazines reach into corners.",
  },
];

/** A working subset of IRC Table R602.3(1), the prescriptive fastening schedule. */
export const IRC_SCHEDULE = [
  ["Stud to sole plate, toe nail", "4 × 8d common, or 3 × 16d"],
  ["Top plate to stud, end nail", "2 × 16d common"],
  ["Double studs, face nail", "10d common at 600 mm (24 in) o.c."],
  ["Double top plates, face nail", "10d common at 600 mm (24 in) o.c."],
  ["Sole plate to joist or blocking", "16d common at 400 mm (16 in) o.c."],
  ["Ceiling joist to plate, toe nail", "3 × 8d common"],
  ["Rafter to plate, toe nail", "3 × 8d common"],
  ["Built-up header, two pieces", "16d common at 400 mm (16 in) o.c. along each edge"],
  ["Sheathing 13 mm (1/2 in) or less", "6d common, 150 mm edges / 300 mm field"],
  ["Sheathing 15–25 mm (19/32–1 in)", "8d common, 150 mm edges / 300 mm field"],
];

/** Standard sheathing nailing pattern, in millimetres. */
export const SHEATHING_EDGE_SPACING_MM = 150;
export const SHEATHING_FIELD_SPACING_MM = 300;

export const TASKS = [
  {
    id: "framing",
    label: "Framing — face nailing timber to timber",
    note: "Sized on penetration into the receiving member, then checked against the prescriptive schedule.",
  },
  {
    id: "sheathing",
    label: "Sheathing — panels onto studs or rafters",
    note: "Panel thickness sets the nail; spacing is 150 mm on edges and 300 mm in the field.",
  },
  {
    id: "trim",
    label: "Trim — skirting, architrave, mouldings",
    note: "Gauge is chosen by how thick and how brittle the moulding is; 19 mm into the framing is the minimum reach.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_THICKNESS_IN = 12;

/**
 * Pick a nail.
 *
 * @param {object} input
 * @param {"framing"|"sheathing"|"trim"} input.task
 * @param {number} input.topThicknessMm  Thickness of the piece being fastened.
 * @param {number} input.baseThicknessMm Thickness of the member receiving the nail.
 * @param {number} [input.spacingMm]     Nail spacing along the run.
 * @param {number} [input.runLengthM]    Length of the run, for a nail count.
 * @param {number} [input.rows]          Rows or lines of nails.
 */
export function selectNail({
  task = "framing",
  topThicknessMm,
  baseThicknessMm,
  spacingMm = 150,
  runLengthM = 2.4,
  rows = 1,
} = {}) {
  if (!TASKS.some((entry) => entry.id === task)) {
    return { error: "Choose framing, sheathing or trim." };
  }
  if (![topThicknessMm, baseThicknessMm, spacingMm, runLengthM, rows].every(isNum)) {
    return { error: "Enter valid numbers for thicknesses, spacing and run length." };
  }
  if (topThicknessMm <= 0 || baseThicknessMm <= 0) {
    return { error: "Both thicknesses must be greater than zero." };
  }
  const topIn = topThicknessMm / MM_PER_INCH;
  const baseIn = baseThicknessMm / MM_PER_INCH;
  if (topIn > MAX_THICKNESS_IN || baseIn > MAX_THICKNESS_IN) {
    return { error: `Thickness above ${MAX_THICKNESS_IN} inches (${Math.round(MAX_THICKNESS_IN * MM_PER_INCH)} mm) is outside nail territory — that is a bolt or a screw job.` };
  }
  if (spacingMm <= 0) return { error: "Nail spacing must be greater than zero." };
  if (runLengthM <= 0) return { error: "Run length must be greater than zero." };
  if (rows < 1 || rows > 20) return { error: "Rows of nails should be between 1 and 20." };

  const ruleOfThumbIn = topIn * RULE_OF_THUMB_MULTIPLE;

  if (task === "trim") {
    const requiredLengthIn = topIn + TRIM_MIN_PENETRATION_IN;
    const gaugeChoice =
      TRIM_NAILS.find((entry) => topIn <= entry.maxTrimIn) ?? TRIM_NAILS[TRIM_NAILS.length - 1];
    // Trim nails are sold in 1/4 inch steps; round up to the next one.
    const trimLengthIn = Math.ceil(requiredLengthIn * 4) / 4;
    const penetrationIn = trimLengthIn - topIn;
    const nailsPerRow = Math.floor((runLengthM * 1000) / spacingMm) + 1;
    return {
      task,
      topThicknessMm,
      baseThicknessMm,
      trim: true,
      gaugeChoice,
      lengthIn: trimLengthIn,
      lengthMm: trimLengthIn * MM_PER_INCH,
      penetrationIn,
      penetrationMm: penetrationIn * MM_PER_INCH,
      penetrationDiameters: penetrationIn / gaugeChoice.diaIn,
      protrudes: penetrationIn > baseIn,
      ruleOfThumbIn,
      nailsPerRow,
      totalNails: nailsPerRow * Math.round(rows),
      spacingMm,
      headline: `${gaugeChoice.gauge}, ${trimLengthIn.toFixed(2).replace(/\.?0+$/, "")} in`,
      verdict: `${gaugeChoice.gauge} at ${Math.round(trimLengthIn * MM_PER_INCH)} mm reaches ${Math.round(penetrationIn * MM_PER_INCH)} mm into the framing, past the 19 mm minimum. ${gaugeChoice.use}`,
    };
  }

  // Framing and sheathing: walk the table for the first nail whose penetration
  // into the main member reaches 10 diameters.
  const candidates = COMMON_NAILS.filter((nail) => nail.stocked);
  let chosen = null;
  let minimumOnly = null;
  for (const nail of candidates) {
    const penetrationIn = nail.lengthIn - topIn;
    if (penetrationIn <= 0) continue;
    if (!minimumOnly && penetrationIn >= MIN_PENETRATION_DIAMETERS * nail.diaIn) {
      minimumOnly = nail;
    }
    if (penetrationIn >= FULL_PENETRATION_DIAMETERS * nail.diaIn) {
      chosen = nail;
      break;
    }
  }

  if (!chosen && !minimumOnly) {
    return {
      error: `No standard nail reaches far enough through ${Math.round(topThicknessMm)} mm of material. Use a structural screw or a bolt for a piece this thick.`,
    };
  }

  let nail = chosen ?? minimumOnly;
  let codeMinimum = null;

  // Sheathing has a prescriptive minimum that can be larger than the
  // penetration rule alone would give.
  if (task === "sheathing") {
    codeMinimum = sheathingMinimumPenny(topIn);
    const minNail = candidates.find((entry) => entry.penny === codeMinimum);
    if (minNail && minNail.lengthIn > nail.lengthIn) {
      nail = minNail;
      chosen = minNail;
    }
  }

  const penetrationIn = nail.lengthIn - topIn;
  const penetrationDiameters = penetrationIn / nail.diaIn;
  const protrusionMm = (penetrationIn - baseIn) * MM_PER_INCH;
  const protrudes = protrusionMm > PROTRUSION_TOLERANCE_MM;

  const effectiveSpacing =
    task === "sheathing" ? Math.min(spacingMm, SHEATHING_EDGE_SPACING_MM) : spacingMm;
  const nailsPerRow = Math.floor((runLengthM * 1000) / effectiveSpacing) + 1;

  const boxDiaIn = BOX_NAIL_DIAMETERS_IN[nail.penny] ?? null;

  let verdict;
  if (protrudes) {
    verdict = `A ${nail.penny} would come ${protrusionMm.toFixed(0)} mm out the far side of a ${Math.round(baseThicknessMm)} mm member. Drop a size, blunt the point and clench it over, or use a screw.`;
  } else if (!chosen) {
    verdict = `A ${nail.penny} penetrates ${penetrationDiameters.toFixed(1)} diameters — past the 6-diameter minimum but short of the 10 needed for the full lateral design value. Acceptable for non-structural work only.`;
  } else {
    verdict = `A ${nail.penny} (${nail.lengthIn} in, ${Math.round(nail.lengthIn * MM_PER_INCH)} mm) penetrates ${Math.round(penetrationIn * MM_PER_INCH)} mm, which is ${penetrationDiameters.toFixed(1)} shank diameters — over the 10 the NDS asks for full lateral value.`;
  }

  return {
    task,
    topThicknessMm,
    baseThicknessMm,
    trim: false,
    nail,
    boxDiaIn,
    lengthIn: nail.lengthIn,
    lengthMm: nail.lengthIn * MM_PER_INCH,
    penetrationIn,
    penetrationMm: penetrationIn * MM_PER_INCH,
    penetrationDiameters,
    meetsFullValue: Boolean(chosen),
    protrudes,
    protrusionMm,
    codeMinimum,
    ruleOfThumbIn,
    ruleOfThumbMm: ruleOfThumbIn * MM_PER_INCH,
    spacingMm: effectiveSpacing,
    nailsPerRow,
    totalNails: nailsPerRow * Math.round(rows),
    fieldSpacingMm: task === "sheathing" ? SHEATHING_FIELD_SPACING_MM : null,
    headline: `${nail.penny} — ${nail.lengthIn} in`,
    verdict,
  };
}
