/**
 * Vacuum cleaner selector.
 *
 * Two different suction specifications are quoted by the industry and they are
 * NOT convertible into one another, so both targets are reported separately:
 *
 *  - Air watts (AW): suction power at the cleaning head, defined by ASTM F558
 *    as AW = 0.117254 x airflow(CFM) x sealed suction(inches of water).
 *    Corded uprights and canisters are specified this way.
 *  - Pascals (Pa): sealed (no-airflow) suction. Cordless stick vacuums are
 *    almost always marketed with this number instead.
 *
 * The air-watt and pascal targets below are the widely published minimums for
 * lifting embedded debris out of each carpet construction; deeper pile traps
 * more fibre and needs a higher figure. Hard floors need the least because the
 * debris sits on the surface and airflow, not sealed suction, does the work.
 */

/** 1 square metre = 10.7639 square feet (exact SI/imperial conversion). */
export const SQFT_PER_SQM = 10.7639;

/**
 * Flooring profiles.
 *  airWatts   - minimum suction at the head for that pile depth
 *  pascals    - equivalent published sealed-suction minimum for stick vacuums
 *  coverageRate - square metres cleaned per minute at a normal walking pass
 *                 (deeper pile forces slower, overlapping passes)
 */
export const FLOORING_PROFILES = {
  hard: {
    key: "hard",
    label: "Hard floors only (tile, wood, vinyl, laminate)",
    airWatts: 80,
    pascals: 8000,
    coverageRate: 3.5,
    carpetHeavy: false,
  },
  lowPile: {
    key: "lowPile",
    label: "Hard floors with area rugs or low-pile carpet",
    airWatts: 130,
    pascals: 12000,
    coverageRate: 3.0,
    carpetHeavy: false,
  },
  medPile: {
    key: "medPile",
    label: "Mostly medium-pile wall-to-wall carpet",
    airWatts: 170,
    pascals: 17000,
    coverageRate: 2.2,
    carpetHeavy: true,
  },
  highPile: {
    key: "highPile",
    label: "High-pile, shag or deep wool carpet",
    airWatts: 220,
    pascals: 22000,
    coverageRate: 1.8,
    carpetHeavy: true,
  },
};

/**
 * Pet load raises the suction target and the number of passes, because hair
 * weaves into pile and has to be lifted rather than swept. The factors below
 * are the conventional 15% / 30% uplifts used in appliance sizing guidance.
 */
export const PET_FACTORS = {
  none: { key: "none", label: "No pets", factor: 1.0 },
  one: { key: "one", label: "One shedding pet", factor: 1.15 },
  many: { key: "many", label: "Several pets or a heavy shedder", factor: 1.3 },
};

/** Sealed HEPA systems cost roughly 10% of suction in back-pressure. */
export const ALLERGY_SUCTION_UPLIFT = 1.1;

/**
 * Loose dust, fibre and hair recovered from a normally used home is about
 * 0.45 litres per 100 m2 per weekly pass. The bin is then sized so it does not
 * need emptying mid-clean.
 */
export const BIN_LITRES_PER_100_SQM = 0.45;

/** No practical vacuum ships with a smaller usable bin than this. */
export const MIN_BIN_LITRES = 0.4;

/** Spare capacity so the bin is never filled to the cyclone inlet. */
export const BIN_HEADROOM = 1.35;

/** Extra battery margin so you never stop mid-room. */
export const RUNTIME_MARGIN = 1.25;

/**
 * Typical real-world runtime of one cordless-stick battery on the standard
 * power setting with a motorised head fitted. Manufacturers' headline numbers
 * (often 60 minutes) are measured in eco mode with a non-powered tool.
 */
export const MINUTES_PER_BATTERY = 40;

/** Above this floor area a single-battery cordless stick stops being sensible. */
export const CORDLESS_AREA_LIMIT_SQM = 150;

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const TYPES = {
  upright: {
    key: "upright",
    label: "Corded upright with a motorised brush roll",
    why: "Unlimited runtime and the highest sustained suction on deep carpet, where a battery would fade before you finished.",
  },
  canister: {
    key: "canister",
    label: "Corded canister (cylinder) with a powered floor head",
    why: "Light wand for stairs and above-floor work, full suction all session, and it swaps between bare floor and carpet heads.",
  },
  cordless: {
    key: "cordless",
    label: "Cordless stick with a motorised brush roll",
    why: "Fast to pick up and carry between floors, and its runtime comfortably covers a home this size.",
    whyMultiBattery:
      "Fast to pick up and carry between floors, but a single charge does not comfortably cover a home this size — plan on swapping in spare battery packs to get through a full clean.",
  },
  robot: {
    key: "robot",
    label: "Robot vacuum",
    why: "Handles the daily maintenance pass on its own; it cannot replace a deep clean but it keeps the surface debris down.",
  },
  handheld: {
    key: "handheld",
    label: "Handheld or car vacuum",
    why: "Covers upholstery, stairs, car interiors and spills that a full-size machine is clumsy for.",
  },
};

/**
 * Deterministic machine choice. Returns { primary, secondary } type records.
 */
function pickTypes({ areaSqm, profile, storeys, preference, pets }) {
  const heavy = profile.carpetHeavy;
  const petHair = pets.key !== "none";

  let primary;
  if (preference === "robot") {
    primary = TYPES.robot;
  } else if (preference === "cordless") {
    primary = TYPES.cordless;
  } else if (preference === "corded") {
    primary = heavy ? TYPES.upright : TYPES.canister;
  } else if (areaSqm > CORDLESS_AREA_LIMIT_SQM && heavy) {
    primary = TYPES.upright;
  } else if (areaSqm > CORDLESS_AREA_LIMIT_SQM) {
    primary = TYPES.canister;
  } else if (storeys >= 2 || !heavy) {
    primary = TYPES.cordless;
  } else {
    primary = TYPES.canister;
  }

  let secondary;
  if (primary.key === "robot") {
    secondary = heavy || petHair ? TYPES.upright : TYPES.cordless;
  } else if (!heavy) {
    secondary = TYPES.robot;
  } else {
    secondary = TYPES.handheld;
  }

  return { primary, secondary };
}

/**
 * Recommend a vacuum specification.
 *
 * @param {object} input
 * @param {number|string} input.area        floor area to clean
 * @param {"sqm"|"sqft"} input.areaUnit     unit the area is given in
 * @param {string} input.flooring           key of FLOORING_PROFILES
 * @param {string} input.pets               key of PET_FACTORS
 * @param {boolean} input.allergies         someone in the home has allergies or asthma
 * @param {number|string} input.storeys     number of levels to clean (1-4)
 * @param {"any"|"cordless"|"corded"|"robot"} input.preference
 * @returns {object} recommendation, or { error } for invalid input
 */
export function recommendVacuum({
  area,
  areaUnit = "sqm",
  flooring = "lowPile",
  pets = "none",
  allergies = false,
  storeys = 1,
  preference = "any",
}) {
  const rawArea = Number(String(area).replace(/,/g, "").trim());
  const levels = Number(storeys);

  if (!Number.isFinite(rawArea)) return { error: "Enter the floor area as a number." };
  if (rawArea <= 0) return { error: "Floor area must be greater than zero." };
  if (!Number.isInteger(levels) || levels < 1 || levels > 4) {
    return { error: "Number of levels must be a whole number between 1 and 4." };
  }
  if (areaUnit !== "sqm" && areaUnit !== "sqft") {
    return { error: "Area unit must be square metres or square feet." };
  }

  const areaSqm = areaUnit === "sqft" ? rawArea / SQFT_PER_SQM : rawArea;
  if (areaSqm > 2000) {
    return { error: "Above 2,000 m² this is a commercial job — size a commercial machine instead." };
  }

  const profile = FLOORING_PROFILES[flooring];
  if (!profile) return { error: "Choose one of the listed flooring types." };

  const pet = PET_FACTORS[pets];
  if (!pet) return { error: "Choose one of the listed pet options." };

  const allergyFactor = allergies ? ALLERGY_SUCTION_UPLIFT : 1;

  // Suction targets are shopping thresholds, so they are quoted at the
  // granularity spec sheets actually use: 5 AW and 500 Pa.
  const airWatts = Math.round((profile.airWatts * pet.factor * allergyFactor) / 5) * 5;
  const pascals = Math.round((profile.pascals * pet.factor * allergyFactor) / 500) * 500;

  // More hair means more overlapping passes over the same square metres.
  // Times are rounded up: they are "allow at least this long" figures.
  const cleaningMinutes = Math.ceil((areaSqm / profile.coverageRate) * pet.factor);
  const runtimeMinutes = Math.ceil(cleaningMinutes * RUNTIME_MARGIN);
  const batteries = Math.max(1, Math.ceil(runtimeMinutes / MINUTES_PER_BATTERY));

  const binLitres = round(
    Math.max(
      MIN_BIN_LITRES,
      ((areaSqm / 100) * BIN_LITRES_PER_100_SQM * pet.factor) * BIN_HEADROOM,
    ),
    1,
  );

  // Reach needed from one socket to cover a typical room on that floor.
  const areaPerFloor = areaSqm / levels;
  const reachMetres = round(Math.sqrt(areaPerFloor) * 0.75 + 2, 1);

  const { primary: primaryType, secondary } = pickTypes({
    areaSqm,
    profile,
    storeys: levels,
    preference,
    pets: pet,
  });

  // The static "comfortably covers" rationale is only true when a single
  // charge actually gets through the clean; once more than one battery pack
  // is needed, say so instead of contradicting the runtime/battery figures
  // shown alongside it.
  const primary =
    primaryType.key === "cordless" && batteries > 1
      ? { ...primaryType, why: primaryType.whyMultiBattery }
      : primaryType;

  // Runtime per level, used to decide whether "clean one level per charge"
  // is an honest alternative to buying spare batteries.
  const runtimeMinutesPerLevel = runtimeMinutes / levels;
  const oneChargePerLevelFits = runtimeMinutesPerLevel <= MINUTES_PER_BATTERY;

  const filtration = allergies
    ? "Sealed system with a washable H13 HEPA filter (H13 traps 99.95% of 0.3 µm particles per EN 1822)"
    : "Standard multi-stage filtration; a HEPA cartridge is optional";

  const notes = [];
  if (pet.key !== "none") {
    notes.push(
      "Ask for an anti-tangle or self-clearing brush roll — pet hair wrapping the bar is what actually kills carpet pick-up.",
    );
  }
  if (profile.carpetHeavy) {
    notes.push(
      "On carpet the motorised brush roll matters as much as the suction figure; a suction-only head will leave embedded grit behind.",
    );
  } else {
    notes.push(
      "On hard floors look for a soft-roller or dual-roller head so it picks up fine dust as well as large debris.",
    );
  }
  if (primary.key === "cordless" && batteries > 1) {
    notes.push(
      oneChargePerLevelFits
        ? `A single battery gives about ${MINUTES_PER_BATTERY} real minutes on standard power, so budget for ${batteries} batteries or clean one level per charge.`
        : `A single battery gives about ${MINUTES_PER_BATTERY} real minutes on standard power — even one level takes longer than that here, so spare battery packs (not a one-level-per-charge routine) are what actually gets you through a full clean.`,
    );
  }
  if (primary.key === "cordless" && areaSqm > CORDLESS_AREA_LIMIT_SQM) {
    notes.push(
      "At this floor area a corded machine is usually less frustrating than swapping batteries mid-clean.",
    );
  }
  if (levels >= 2) {
    notes.push("For stairs, weight matters more than power — under 4 kg in the hand is the practical limit.");
  }
  if (allergies) {
    notes.push(
      "Bagged machines empty far more cleanly than bin-and-cyclone models, which matters if emptying triggers symptoms.",
    );
  }

  return {
    areaSqm: round(areaSqm, 1),
    areaPerFloor: round(areaPerFloor, 1),
    flooringLabel: profile.label,
    petLabel: pet.label,
    primary,
    secondary,
    airWatts,
    pascals,
    binLitres,
    filtration,
    cleaningMinutes,
    runtimeMinutes,
    batteries,
    reachMetres,
    notes,
  };
}
