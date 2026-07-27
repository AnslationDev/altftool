/**
 * Sandpaper grit sequencing.
 *
 * Sanding is not "make it smooth". Every grit does exactly one job: replace
 * the scratch pattern of the grit before it with a finer one. Skip too far
 * and the finer paper cannot reach the bottom of the previous scratches, so
 * you polish the ridges and leave the valleys — invisible on bare wood,
 * glaringly obvious the moment stain or an oil finish goes on.
 *
 * The step rule used here is the one that produces the sequences woodworkers
 * actually use: move on when the abrasive particle size drops by no more than
 * a factor of 1.65, and never skip more than one grade in the standard
 * series. From P80 that gives 80 - 120 - 180 - 220, which is the classic
 * progression, arrived at from the particle sizes rather than copied.
 *
 * Two grit standards are in circulation and they are not the same above about
 * P220:
 *   FEPA (European, the "P" prefix), standard FEPA 43-1/43-2
 *   CAMI (North American, ANSI B74.18), plain numbers
 * Both are defined by average abrasive particle diameter in micrometres, so
 * the conversion here is done by matching micron sizes rather than by a
 * hand-copied lookup table. CAMI 400 is roughly P800, which is why an
 * imported "400 grit" can behave nothing like the one in your drawer.
 */

/** Maximum drop in particle size between consecutive steps. */
export const MAX_STEP_RATIO = 1.65;

/** Maximum grades that may be skipped between steps. */
export const MAX_SKIP = 1;

/** FEPA P-grades with average particle diameter in micrometres. */
export const FEPA_GRITS = [
  { grade: "P40", micron: 425 },
  { grade: "P60", micron: 269 },
  { grade: "P80", micron: 201 },
  { grade: "P100", micron: 162 },
  { grade: "P120", micron: 125 },
  { grade: "P150", micron: 100 },
  { grade: "P180", micron: 82 },
  { grade: "P220", micron: 68 },
  { grade: "P240", micron: 58.5 },
  { grade: "P280", micron: 52.2 },
  { grade: "P320", micron: 46.2 },
  { grade: "P400", micron: 35 },
  { grade: "P500", micron: 30.2 },
  { grade: "P600", micron: 25.8 },
  { grade: "P800", micron: 21.8 },
  { grade: "P1000", micron: 18.3 },
  { grade: "P1200", micron: 15.3 },
  { grade: "P1500", micron: 12.6 },
  { grade: "P2000", micron: 10.3 },
  { grade: "P2500", micron: 8.4 },
];

/** CAMI grades (ANSI B74.18) with average particle diameter in micrometres. */
export const CAMI_GRITS = [
  { grade: "40", micron: 412 },
  { grade: "50", micron: 348 },
  { grade: "60", micron: 268 },
  { grade: "80", micron: 190 },
  { grade: "100", micron: 141 },
  { grade: "120", micron: 116 },
  { grade: "150", micron: 93 },
  { grade: "180", micron: 78 },
  { grade: "220", micron: 66 },
  { grade: "240", micron: 53.5 },
  { grade: "280", micron: 45.8 },
  { grade: "320", micron: 36.5 },
  { grade: "360", micron: 30.2 },
  { grade: "400", micron: 23.6 },
  { grade: "500", micron: 19 },
  { grade: "600", micron: 16 },
  { grade: "800", micron: 12.6 },
  { grade: "1000", micron: 9.2 },
  { grade: "1200", micron: 6.5 },
  { grade: "1500", micron: 5 },
];

/** Where the work starts, by the condition of the surface. */
export const START_TASKS = [
  { id: "level", label: "Levelling deep damage or uneven joints", start: "P40" },
  { id: "strip", label: "Stripping paint, varnish or a failed finish", start: "P60" },
  { id: "rough-sawn", label: "Rough-sawn or reclaimed timber", start: "P60" },
  { id: "rust", label: "Removing rust or mill scale from steel", start: "P60" },
  { id: "planed", label: "Planed or machined timber", start: "P120" },
  { id: "board", label: "Sheet goods — MDF, ply, chipboard", start: "P120" },
  { id: "filler", label: "Filler, plaster or drywall compound", start: "P120" },
  { id: "scuff", label: "Scuffing a sound finish before recoating", start: "P220" },
  { id: "between", label: "De-nibbing between coats", start: "P320" },
  { id: "clearcoat", label: "Flatting a defect in automotive clear coat", start: "P1500" },
];

/** Where the work stops, decided by what goes on afterwards. */
export const FINISHES = [
  {
    id: "paint",
    label: "Paint or primer",
    stop: "P150",
    why: "Paint needs a key. Sand past about P180 and the surface is too polished for the film to grip.",
  },
  {
    id: "stain-soft",
    label: "Stain on softwood",
    stop: "P150",
    why: "Softwood burnishes easily, and burnished patches refuse stain and show up as pale blotches.",
  },
  {
    id: "stain-hard",
    label: "Stain on hardwood",
    stop: "P180",
    why: "Dense grain takes less stain to begin with; going finer than P180 closes the pores and lightens the colour further.",
  },
  {
    id: "clear",
    label: "Varnish, lacquer or polyurethane",
    stop: "P220",
    why: "A film finish sits on top and fills fine scratches, so P220 is enough. Going finer wastes time and can impair adhesion.",
  },
  {
    id: "oil",
    label: "Oil or wax finish",
    stop: "P320",
    why: "An oil finish soaks in rather than building a film, so it hides nothing. Every scratch left at P220 will still be visible.",
  },
  {
    id: "between-coats",
    label: "Between coats of finish",
    stop: "P400",
    why: "You are knocking off dust nibs and raised grain, not removing material. Light pressure, and wipe clean before the next coat.",
  },
  {
    id: "metal-paint",
    label: "Metal, before priming",
    stop: "P120",
    why: "Primer on metal wants a mechanical key. Too smooth and it peels in sheets rather than flaking.",
  },
  {
    id: "metal-polish",
    label: "Metal, to a polish",
    stop: "P2000",
    why: "Beyond P2000 the work moves from abrasive paper to polishing compound on a mop.",
  },
  {
    id: "auto-polish",
    label: "Automotive clear coat, before compounding",
    stop: "P2500",
    why: "Wet sand only, with plenty of lubricant, then cut and polish. Clear coat is often under 50 microns thick.",
  },
];

/** Material-specific floors and cautions. */
export const MATERIALS = [
  {
    id: "softwood",
    label: "Softwood",
    coarsestGrade: "P40",
    caution: "Sand with the grain. Cross-grain scratches in softwood are deep and show through stain permanently.",
  },
  {
    id: "hardwood",
    label: "Hardwood",
    coarsestGrade: "P40",
    caution: "Raise the grain with a damp cloth after the last cut, let it dry, then knock it back — otherwise the first coat does it for you.",
  },
  {
    id: "veneer",
    label: "Veneered board",
    coarsestGrade: "P150",
    caution: "Modern veneer is often 0.6 mm or less. Never use a belt sander and never start below P150; edges and corners go through first.",
  },
  {
    id: "mdf",
    label: "MDF or particleboard",
    coarsestGrade: "P120",
    caution: "Cut edges drink finish and fluff up. Seal the edges before the faces, and wear a mask — MDF dust is fine and resinous.",
  },
  {
    id: "plywood",
    label: "Plywood",
    coarsestGrade: "P120",
    caution: "The face ply is thin. Sand it like veneer, not like solid timber.",
  },
  {
    id: "plaster",
    label: "Plaster, filler or drywall",
    coarsestGrade: "P80",
    caution: "Use a light touch and a sanding pole; dig in and you cut through into the paper facing, which cannot be filled back flat.",
  },
  {
    id: "metal",
    label: "Steel or aluminium",
    coarsestGrade: "P40",
    caution: "Use wet-and-dry with lubricant above P400. Aluminium loads paper quickly, so change it before it starts burnishing.",
  },
  {
    id: "clearcoat",
    label: "Automotive clear coat",
    coarsestGrade: "P1000",
    caution: "Wet sand only. Factory clear coat is typically 40 to 50 microns thick, so a few passes too many go straight through to the base.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_AREA_M2 = 2000;

/** Index of a grade in a grit list, or -1. */
function indexOfGrade(list, grade) {
  return list.findIndex((entry) => entry.grade === grade);
}

/** Nearest grade in the other standard, matched on average particle size. */
export function convertGrit(grade, from = "fepa") {
  const source = from === "fepa" ? FEPA_GRITS : CAMI_GRITS;
  const target = from === "fepa" ? CAMI_GRITS : FEPA_GRITS;
  const entry = source.find((item) => item.grade === String(grade));
  if (!entry) return { error: `${grade} is not a recognised ${from === "fepa" ? "FEPA" : "CAMI"} grade.` };
  let best = target[0];
  for (const candidate of target) {
    if (Math.abs(candidate.micron - entry.micron) < Math.abs(best.micron - entry.micron)) {
      best = candidate;
    }
  }
  return {
    from: entry,
    to: best,
    micronDifference: best.micron - entry.micron,
    identical: Math.abs(best.micron - entry.micron) / entry.micron <= 0.05,
  };
}

/**
 * Build the grit sequence from a start grade to a stop grade.
 * Steps forward by the largest jump that keeps the particle-size ratio at or
 * under MAX_STEP_RATIO and skips no more than MAX_SKIP grades.
 */
export function buildGritSequence(startGrade, stopGrade) {
  const startIndex = indexOfGrade(FEPA_GRITS, startGrade);
  const stopIndex = indexOfGrade(FEPA_GRITS, stopGrade);
  if (startIndex < 0 || stopIndex < 0) return { error: "Unknown grit grade." };
  if (stopIndex < startIndex) {
    return {
      error: `${stopGrade} is coarser than the ${startGrade} you would start with — the finish you have chosen does not need this much preparation. Start at ${stopGrade} instead.`,
    };
  }

  const sequence = [FEPA_GRITS[startIndex]];
  let current = startIndex;
  let guard = 0;
  while (current < stopIndex && guard < FEPA_GRITS.length) {
    guard += 1;
    let next = current + 1;
    for (let candidate = Math.min(current + 1 + MAX_SKIP, stopIndex); candidate > current; candidate -= 1) {
      const ratio = FEPA_GRITS[current].micron / FEPA_GRITS[candidate].micron;
      if (ratio <= MAX_STEP_RATIO) {
        next = candidate;
        break;
      }
    }
    current = Math.min(next, stopIndex);
    sequence.push(FEPA_GRITS[current]);
  }
  return { sequence };
}

/**
 * Plan a sanding job.
 *
 * @param {object} input
 * @param {string} input.material   Id from MATERIALS.
 * @param {string} input.task       Id from START_TASKS.
 * @param {string} input.finish     Id from FINISHES.
 * @param {number} input.areaM2     Surface area to sand.
 * @param {number} [input.minutesPerM2PerPass] Working rate, one grit, one pass.
 * @param {number} [input.m2PerSheet]          Area one sheet or disc lasts.
 */
export function planSanding({
  material = "softwood",
  task = "planed",
  finish = "clear",
  areaM2,
  minutesPerM2PerPass = 6,
  m2PerSheet = 4,
} = {}) {
  const materialSpec = MATERIALS.find((entry) => entry.id === material);
  const taskSpec = START_TASKS.find((entry) => entry.id === task);
  const finishSpec = FINISHES.find((entry) => entry.id === finish);
  if (!materialSpec) return { error: "Choose the material you are sanding." };
  if (!taskSpec) return { error: "Choose the condition the surface is in." };
  if (!finishSpec) return { error: "Choose what goes on afterwards." };
  if (![areaM2, minutesPerM2PerPass, m2PerSheet].every(isNum)) {
    return { error: "Enter valid numbers for area, working rate and sheet coverage." };
  }
  if (areaM2 <= 0) return { error: "Area must be greater than zero." };
  if (areaM2 > MAX_AREA_M2) {
    return { error: `An area of ${MAX_AREA_M2} m² or more is a machine-hire job, not a sheet-of-paper one.` };
  }
  if (minutesPerM2PerPass <= 0) return { error: "Working rate must be greater than zero minutes per m²." };
  if (m2PerSheet <= 0) return { error: "Sheet coverage must be greater than zero m²." };

  // The material floor can override a task that would start too coarse.
  const taskIndex = indexOfGrade(FEPA_GRITS, taskSpec.start);
  const floorIndex = indexOfGrade(FEPA_GRITS, materialSpec.coarsestGrade);
  const startIndex = Math.max(taskIndex, floorIndex);
  const startGrade = FEPA_GRITS[startIndex].grade;
  const floorApplied = startIndex > taskIndex;

  const built = buildGritSequence(startGrade, finishSpec.stop);
  if (built.error) return { error: built.error };

  const sequence = built.sequence.map((entry) => {
    const converted = convertGrit(entry.grade, "fepa");
    return {
      ...entry,
      cami: converted.error ? null : converted.to.grade,
      camiMicron: converted.error ? null : converted.to.micron,
    };
  });

  const steps = sequence.length;
  const totalMinutes = steps * areaM2 * minutesPerM2PerPass;
  const sheetsPerGrit = Math.ceil(areaM2 / m2PerSheet);
  const totalSheets = sheetsPerGrit * steps;
  const coarsestMicron = sequence[0].micron;
  const finestMicron = sequence[steps - 1].micron;

  const verdict = floorApplied
    ? `${materialSpec.label} will not survive ${taskSpec.start}, so the sequence starts at ${startGrade} instead. ${steps} grits, about ${Math.round(totalMinutes)} minutes of sanding.`
    : `${steps} grits from ${startGrade} to ${finishSpec.stop}, about ${Math.round(totalMinutes)} minutes of sanding over ${areaM2} m². ${finishSpec.why}`;

  return {
    material: materialSpec,
    task: taskSpec,
    finish: finishSpec,
    startGrade,
    floorApplied,
    sequence,
    steps,
    areaM2,
    minutesPerM2PerPass,
    totalMinutes,
    sheetsPerGrit,
    totalSheets,
    coarsestMicron,
    finestMicron,
    reductionFactor: coarsestMicron / finestMicron,
    verdict,
  };
}
