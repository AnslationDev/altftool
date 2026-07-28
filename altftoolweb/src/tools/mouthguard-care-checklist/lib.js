/**
 * Mouthguard and night guard care logic.
 *
 * Pure module — no React, no DOM, no clock reads. Dates arrive as ISO strings.
 * Informational only: general appliance-care guidance. Fit, material and
 * replacement timing are decisions for the dentist who made the guard.
 */

const MS_PER_DAY = 86400000;

/* Thermoplastic guards distort in hot water. Rinse and clean in cold or lukewarm
   water only, and never leave a guard in a car, on a windowsill or in a
   dishwasher. */
export const MAX_SAFE_WATER_TEMP_C = 40;

/* Bacteria multiply in a guard that is boxed away damp, so it is air dried
   before it goes in the case. */
export const AIR_DRY_MINUTES = 30;

/**
 * Guard types with their typical service life. `baseLifeMonths` is the usual
 * upper end for that material under normal use; `minLifeMonths` is the floor
 * this tool will scale down to before it just says "get it checked".
 * `baselineUsePerWeek` is the usage the base life assumes.
 */
export const GUARD_TYPES = [
  {
    id: "custom-sports",
    label: "Custom-fitted sports mouthguard (dentist-made)",
    material: "Pressure-laminated EVA",
    baseLifeMonths: 12,
    minLifeMonths: 3,
    baselineUsePerWeek: 3,
    useUnit: "training or match sessions a week",
    kind: "sports",
    note: "The best-fitting and most protective option. Adults usually replace it each season; growing children often need one per season.",
  },
  {
    id: "boil-and-bite",
    label: "Boil-and-bite sports mouthguard",
    material: "Thermoplastic EVA",
    baseLifeMonths: 6,
    minLifeMonths: 2,
    baselineUsePerWeek: 3,
    useUnit: "training or match sessions a week",
    kind: "sports",
    note: "Thins quickly at the biting surfaces. Check the thickness over the back teeth every few weeks.",
  },
  {
    id: "stock",
    label: "Stock, ready-to-wear mouthguard",
    material: "Moulded rubber or PVC",
    baseLifeMonths: 3,
    minLifeMonths: 1,
    baselineUsePerWeek: 3,
    useUnit: "training or match sessions a week",
    kind: "sports",
    note: "The least protective option because it cannot be fitted. Treat it as a stopgap rather than season-long kit.",
  },
  {
    id: "hard-night",
    label: "Hard acrylic night guard / occlusal splint",
    material: "Rigid acrylic",
    baseLifeMonths: 48,
    minLifeMonths: 12,
    baselineUsePerWeek: 7,
    useUnit: "nights a week",
    kind: "night",
    note: "The longest-lasting night guard. Take it to every dental appointment so the fit and wear can be checked.",
  },
  {
    id: "dual-laminate-night",
    label: "Dual-laminate night guard (soft inside, hard outside)",
    material: "Soft liner with rigid shell",
    baseLifeMonths: 24,
    minLifeMonths: 6,
    baselineUsePerWeek: 7,
    useUnit: "nights a week",
    kind: "night",
    note: "A compromise between comfort and durability; the soft liner is what usually fails first.",
  },
  {
    id: "soft-night",
    label: "Soft night guard",
    material: "Flexible EVA",
    baseLifeMonths: 12,
    minLifeMonths: 3,
    baselineUsePerWeek: 7,
    useUnit: "nights a week",
    kind: "night",
    note: "Comfortable but chewed through fastest, especially by heavy grinders. Some people find soft guards actually increase clenching.",
  },
];

/**
 * Grinding intensity multiplier applied to night guards. Heavier bruxism wears
 * a guard through faster; these factors are this tool's planning assumption,
 * not a measured material standard.
 */
export const BRUXISM_LEVELS = [
  { id: "none", label: "No known grinding or clenching", factor: 1 },
  { id: "mild", label: "Mild — occasional clenching", factor: 0.9 },
  { id: "moderate", label: "Moderate — partner hears grinding, jaw aches some mornings", factor: 0.7 },
  { id: "severe", label: "Severe — daily jaw pain, visible wear facets, guard marks", factor: 0.5 },
];

/** Signs that mean replace now, whatever the calendar says. */
export const CONDITION_FLAGS = [
  { id: "crack", label: "Crack, split or a hole anywhere in the guard" },
  { id: "thin", label: "Worn thin or chewed through over the back teeth" },
  { id: "loose", label: "Rocks, drops out, or has to be held in" },
  { id: "tight", label: "Suddenly feels tight, or leaves sore spots on the gum" },
  { id: "odour", label: "Smell or taste that does not clear after a deep clean" },
  { id: "biofilm", label: "White chalky film or dark staining that will not brush off" },
  { id: "distorted", label: "Warped after hot water, a dishwasher, or being left in a car" },
  { id: "growth", label: "Wearer is a child or teenager whose teeth have moved since it was made" },
];

/** Routine care tasks by cadence. */
export const CARE_ROUTINE = [
  {
    cadence: "Every time you take it out",
    tasks: [
      "Rinse under cold or lukewarm water straight away — hot water warps thermoplastic.",
      "Brush gently with a soft toothbrush kept for the guard and a little mild liquid soap. Skip abrasive toothpaste, which scratches the surface and gives bacteria somewhere to sit.",
      `Air dry fully — around ${AIR_DRY_MINUTES} minutes on a clean surface — before it goes in the case.`,
      "Store in a vented rigid case, away from pets, radiators, windowsills and car dashboards.",
    ],
  },
  {
    cadence: "Weekly",
    tasks: [
      "Deep clean by soaking in a denture or retainer cleaning tablet solution, or a 1:1 mix of white vinegar and water, then rinse thoroughly.",
      "Wash the case itself with soap and hot water and let it dry fully — the case is usually dirtier than the guard.",
      "Hold the guard to the light and check the thickness over the molars and the edges.",
    ],
  },
  {
    cadence: "Monthly",
    tasks: [
      "Check the fit: it should seat with light finger pressure and stay put without clenching.",
      "Photograph the guard so you can compare wear month to month.",
      "Replace the storage case if it is cracked, stained or the vents are blocked.",
    ],
  },
  {
    cadence: "At every dental appointment",
    tasks: [
      "Take the guard with you so the fit, the wear pattern and your bite can be checked together.",
      "Ask whether the wear facets suggest the guard is doing its job or the grinding has changed.",
    ],
  },
];

/** Things that damage a guard or the person wearing it. */
export const NEVER_DO = [
  "Never rinse or soak in hot water, put it in a dishwasher, or leave it in a car — heat permanently distorts the fit.",
  "Never use bleach, alcohol-based mouthwash or boiling sterilising fluid unless the maker specifically says so; they degrade the material and can leave residues.",
  "Never store it damp or wrapped in tissue — that is how the smell and the biofilm start.",
  "Never share a mouthguard, and never keep wearing one that is cracked; a broken edge can cut the gum and a hole stops it absorbing impact.",
  "Never try to reshape a custom guard yourself with hot water — take it back to the dentist.",
];

export const MIN_USE_PER_WEEK = 1;
export const MAX_USE_PER_WEEK = 14;

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, ms: probe.getTime() };
}

const pad = (n) => String(n).padStart(2, "0");

export function addMonthsIso(isoDate, months) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(months)) return null;
  const zeroBased = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return `${year}-${pad(month + 1)}-${pad(Math.min(date.day, daysInMonth))}`;
}

export function daysBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (!from || !to) return null;
  return Math.round((to.ms - from.ms) / MS_PER_DAY);
}

/**
 * Service life in whole months for a guard, scaled by how much it is used and,
 * for night guards, by grinding intensity. Never returns more than the type's
 * base life or less than its floor.
 */
export function serviceLifeMonths(guardType, usePerWeek, bruxismFactor) {
  if (!guardType) return null;
  if (!Number.isFinite(usePerWeek) || usePerWeek <= 0) return null;
  if (!Number.isFinite(bruxismFactor) || bruxismFactor <= 0) return null;
  const usageRatio = guardType.baselineUsePerWeek / usePerWeek;
  const factor = guardType.kind === "night" ? bruxismFactor : 1;
  const scaled = guardType.baseLifeMonths * usageRatio * factor;
  const clamped = Math.min(guardType.baseLifeMonths, Math.max(guardType.minLifeMonths, scaled));
  return Math.max(guardType.minLifeMonths, Math.round(clamped));
}

/**
 * Build the care plan.
 * @returns {{error: string}|object}
 */
export function buildMouthguardPlan(input = {}) {
  const typeId = clean(input.guardType) || "custom-sports";
  const guardType = GUARD_TYPES.find((entry) => entry.id === typeId);
  if (!guardType) {
    return { error: `Choose a guard type: ${GUARD_TYPES.map((g) => g.id).join(", ")}.` };
  }

  const bruxismId = clean(input.bruxism) || "none";
  const bruxism = BRUXISM_LEVELS.find((entry) => entry.id === bruxismId);
  if (!bruxism) {
    return { error: `Grinding level must be one of ${BRUXISM_LEVELS.map((b) => b.id).join(", ")}.` };
  }

  const usePerWeek = Number(input.usePerWeek);
  if (!Number.isFinite(usePerWeek)) {
    return { error: "Enter how often the guard is worn as a number per week." };
  }
  if (usePerWeek < MIN_USE_PER_WEEK || usePerWeek > MAX_USE_PER_WEEK) {
    return { error: `Wear frequency must be between ${MIN_USE_PER_WEEK} and ${MAX_USE_PER_WEEK} times a week.` };
  }
  if (guardType.kind === "night" && usePerWeek > 7) {
    return { error: "A night guard cannot be worn more than 7 nights a week." };
  }

  const startDate = clean(input.startDate);
  const today = clean(input.today);
  if (!parseIsoDate(startDate)) {
    return { error: "Enter the date you started using this guard, in YYYY-MM-DD form." };
  }
  if (!parseIsoDate(today)) {
    return { error: "Today's date must be a real date in YYYY-MM-DD form." };
  }
  const ageDays = daysBetween(startDate, today);
  if (ageDays === null || ageDays < 0) {
    return { error: "The start date is in the future. Check both dates." };
  }
  if (ageDays > 365 * 20) {
    return { error: "That start date is more than 20 years ago. Re-check it." };
  }

  const flagIds = Array.isArray(input.conditionFlags) ? input.conditionFlags.filter((id) => typeof id === "string") : [];
  const flags = CONDITION_FLAGS.filter((flag) => flagIds.includes(flag.id));

  const lifeMonths = serviceLifeMonths(guardType, usePerWeek, bruxism.factor);
  if (lifeMonths === null) {
    return { error: "Could not work out a service life from those inputs." };
  }

  const replaceBy = addMonthsIso(startDate, lifeMonths);
  const daysUntilReplace = daysBetween(today, replaceBy);
  const pastDate = daysUntilReplace !== null && daysUntilReplace < 0;
  const replaceNow = flags.length > 0 || pastDate;
  const ageMonths = ageDays / 30.4375; // mean month length in days
  const lifeUsedPercent = lifeMonths > 0 ? Math.min(100, Math.round((ageMonths / lifeMonths) * 100)) : 100;

  const warnings = [];
  if (flags.length > 0) {
    warnings.push(
      `${flags.length} condition problem${flags.length > 1 ? "s" : ""} ticked. Replace the guard now rather than waiting for the date — a cracked or thinned guard does not absorb impact and a loose one can come out mid-contact.`,
    );
  }
  if (pastDate && flags.length === 0) {
    warnings.push(`The guard is ${Math.abs(daysUntilReplace)} days past its expected service life for this level of use.`);
  }
  if (guardType.id === "stock") {
    warnings.push("Stock guards cannot be fitted to your teeth, so they move and are the least protective option. A boil-and-bite is a step up; a dentist-made guard is a large step up.");
  }
  if (guardType.kind === "night" && bruxism.id === "severe") {
    warnings.push("Severe grinding chews through guards and is often linked to jaw pain, headaches and disturbed sleep. Ask a dentist about the cause rather than only replacing the guard more often.");
  }
  if (flagIds.includes("growth")) {
    warnings.push("A guard made before the teeth moved no longer fits the arch it is meant to protect. Children and teenagers usually need a new guard each season.");
  }
  if (guardType.kind === "sports" && usePerWeek >= 5) {
    warnings.push("Five or more sessions a week wears a guard through quickly. Many players keep a spare so a damaged guard never means playing without one.");
  }

  const summaryText = [
    "Mouthguard care plan",
    `Guard: ${guardType.label} (${guardType.material})`,
    `Worn: ${usePerWeek} ${guardType.useUnit}`,
    guardType.kind === "night" ? `Grinding: ${bruxism.label}` : "",
    `Started: ${startDate}`,
    `Expected service life: ${lifeMonths} months`,
    `Replace by: ${replaceBy}${replaceNow ? " — or now, see the flags" : ""}`,
    "",
    ...CARE_ROUTINE.flatMap((block) => [block.cadence.toUpperCase(), ...block.tasks.map((task) => `  - ${task}`), ""]),
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    guardType,
    bruxism,
    usePerWeek,
    startDate,
    today,
    ageDays,
    ageMonths,
    lifeMonths,
    baseLifeMonths: guardType.baseLifeMonths,
    minLifeMonths: guardType.minLifeMonths,
    replaceBy,
    daysUntilReplace,
    pastDate,
    replaceNow,
    lifeUsedPercent,
    flags,
    careRoutine: CARE_ROUTINE,
    neverDo: NEVER_DO,
    maxSafeWaterTempC: MAX_SAFE_WATER_TEMP_C,
    summaryText,
    warnings,
  };
}
