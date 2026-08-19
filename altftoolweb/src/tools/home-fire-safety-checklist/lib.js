/**
 * Home fire-safety audit.
 *
 * The item set follows long-established residential fire-safety practice as
 * published by fire services and NFPA:
 *
 *   - Smoke alarms: one inside every sleeping room, one outside each separate
 *     sleeping area, and at least one on every level of the home including a
 *     basement (NFPA 72 / NFPA public education guidance).
 *   - Alarms are tested monthly and the whole unit is replaced 10 years after
 *     its manufacture date, because the sensor degrades whatever the battery
 *     is doing.
 *   - Carbon monoxide alarms are fitted where there is any fuel-burning
 *     appliance or an attached garage, on every level and outside sleeping
 *     areas — CO is colourless and odourless, so an alarm is the only warning.
 *   - The "three-foot rule": keep anything that can burn at least 3 ft (about
 *     1 m) away from a heater, stove or open flame.
 *   - Escape planning: two ways out of every room, one outside meeting point,
 *     practised at least twice a year.
 *   - Closed bedroom doors at night measurably slow fire and smoke spread,
 *     which is the basis of the "close before you doze" advice from UL's Fire
 *     Safety Research Institute.
 *   - LPG in Indian homes: an ISI-marked rubber hose has a stamped expiry and
 *     is replaced on schedule, the regulator is turned off at night, and the
 *     cylinder always stands upright below the burner.
 *
 * Scoring is a weighted sum: critical = 3, important = 2, recommended = 1.
 * Any unchecked critical item caps the verdict regardless of the percentage,
 * because those are the failures that turn a fire into a fatality.
 *
 * Educational information only. It does not replace an inspection by your fire
 * service or a licensed electrician or gas fitter.
 */

export const WEIGHTS = { critical: 3, important: 2, recommended: 1 };

export const WEIGHT_LABELS = {
  critical: "Critical",
  important: "Important",
  recommended: "Recommended",
};

/** Band thresholds on the weighted percentage, once every critical item passes. */
export const SAFE_PERCENT = 90;
export const FAIR_PERCENT = 70;

/** Minimum clearance around any heat source, in metres (the 3-foot rule). */
export const HEAT_CLEARANCE_M = 1;

/** Replace a smoke alarm this many years after its date of manufacture. */
export const ALARM_LIFE_YEARS = 10;

/** One multi-purpose ABC extinguisher per level, plus one dedicated to the kitchen. */
export const KITCHEN_EXTINGUISHERS = 1;

export const CATEGORIES = [
  {
    id: "detection",
    title: "Detection and alarms",
    note: "An alarm buys the minutes an escape needs.",
    items: [
      {
        id: "alarmCoverage",
        weight: "critical",
        label: "A smoke alarm inside every bedroom, outside each sleeping area, and on every level",
      },
      { id: "alarmTest", weight: "critical", label: "Alarms are tested monthly with the test button" },
      {
        id: "alarmAge",
        weight: "critical",
        label: `No alarm is more than ${ALARM_LIFE_YEARS} years old, counted from the manufacture date printed on the back`,
      },
      { id: "alarmBattery", weight: "important", label: "Batteries are replaced on schedule, and no alarm has been disconnected to stop nuisance beeping" },
      {
        id: "coAlarm",
        weight: "critical",
        label: "Carbon monoxide alarms are fitted on every level and outside sleeping areas",
        when: "fuelAppliance",
      },
      { id: "interlink", weight: "recommended", label: "Alarms are interlinked, so one sounding sets off the rest" },
    ],
  },
  {
    id: "escape",
    title: "Escape planning",
    note: "Every household member should be able to do this in the dark.",
    items: [
      { id: "twoWays", weight: "critical", label: "Every room has two ways out, and the second one actually opens" },
      { id: "keysReachable", weight: "critical", label: "Grille and gate keys hang beside the door they open, never in a drawer" },
      { id: "meetingPoint", weight: "important", label: "There is one agreed meeting point outside the building" },
      { id: "drill", weight: "important", label: "The escape plan has been practised in the last six months" },
      { id: "clearRoutes", weight: "important", label: "Corridors, stairs and balcony exits are clear of stored goods" },
      { id: "closeDoors", weight: "recommended", label: "Bedroom doors are closed at night" },
      { id: "kidsBriefed", weight: "important", label: "Children know the plan and that they must never hide from a fire", when: "hasKids" },
    ],
  },
  {
    id: "kitchen",
    title: "Cooking",
    note: "Cooking is the single largest cause of home fires.",
    items: [
      { id: "unattended", weight: "critical", label: "Frying and high-heat cooking are never left unattended" },
      { id: "panFire", weight: "critical", label: "Everyone knows to smother a pan fire — lid or damp cloth, never water" },
      { id: "clearance", weight: "important", label: `Cloths, packaging and plastics stay at least ${HEAT_CLEARANCE_M} m from the burners` },
      { id: "hoodClean", weight: "important", label: "The extractor hood and filter are degreased regularly" },
      { id: "sleeves", weight: "recommended", label: "Loose sleeves and dupattas are tied back while cooking" },
    ],
  },
  {
    id: "lpg",
    title: "LPG and gas",
    // Shown for either bottled LPG (cylinder) or piped natural gas (PNG) —
    // see the "gasCooking" flag computed in auditFireSafety(). The three
    // cylinder-only items below carry their own `when: "lpgCylinder"` so a
    // piped-gas home is never shown checks it can never satisfy.
    when: "gasCooking",
    note: "The hose and the regulator are where most domestic gas incidents start.",
    items: [
      { id: "hose", weight: "critical", label: "An ISI-marked gas hose is fitted and replaced before its stamped expiry" },
      { id: "regulatorOff", weight: "critical", label: "The regulator knob is turned off at the cylinder every night", when: "lpgCylinder" },
      { id: "upright", weight: "critical", label: "The cylinder stands upright, on the floor, never above or beside the burner", when: "lpgCylinder" },
      { id: "ventilation", weight: "important", label: "The kitchen has a window or vent that is kept open while cooking" },
      { id: "leakCheck", weight: "important", label: "Joints are checked for leaks with soap solution, never a flame" },
      { id: "noStorage", weight: "recommended", label: "Spare cylinders are not stored in a bedroom, basement or stairwell", when: "lpgCylinder" },
    ],
  },
  {
    id: "electrical",
    title: "Electrical",
    items: [
      { id: "rcd", weight: "critical", label: "The distribution board has a working RCCB/ELCB and it is tested periodically" },
      { id: "noDaisy", weight: "critical", label: "No power strip is plugged into another power strip, and heaters run straight from a wall socket" },
      { id: "noCordsUnderRugs", weight: "important", label: "No extension cord runs under a rug, through a doorway or as permanent wiring" },
      { id: "damagedCords", weight: "important", label: "Frayed cords, warm plugs and scorched sockets have been repaired, not taped" },
      { id: "chargingSurface", weight: "important", label: "Phones, laptops and e-bike batteries charge on a hard surface, never on a bed or sofa" },
      { id: "inverter", weight: "recommended", label: "Inverter and battery banks are ventilated and away from escape routes" },
    ],
  },
  {
    id: "heat",
    title: "Heating, flames and flammables",
    items: [
      { id: "heaterClearance", weight: "critical", label: `Everything that can burn stays at least ${HEAT_CLEARANCE_M} m from heaters and open flames` },
      { id: "candles", weight: "important", label: "Candles and diyas sit on a stable non-combustible base and are never left burning in an empty room" },
      { id: "smoking", weight: "important", label: "Nobody smokes indoors, and ash is doused before it goes in a bin" },
      { id: "chimney", weight: "important", label: "The chimney or flue is swept and inspected annually", when: "fireplace" },
      { id: "dryerLint", weight: "important", label: "The dryer lint filter is cleared after every load and the vent duct annually", when: "dryer" },
      { id: "flammables", weight: "critical", label: "Petrol, thinners, paints and aerosols are stored outside the living area, away from heat" },
    ],
  },
  {
    id: "equipment",
    title: "Equipment and readiness",
    items: [
      { id: "extinguisher", weight: "critical", label: "At least one multi-purpose ABC extinguisher per level, within its service date" },
      { id: "extinguisherTraining", weight: "important", label: "At least two people in the home have been shown how to use it" },
      { id: "fireBlanket", weight: "important", label: "A fire blanket is mounted within reach of the kitchen, but not above the hob" },
      { id: "emergencyNumber", weight: "important", label: "The fire service number and the building's emergency contact are saved and posted" },
      { id: "documents", weight: "recommended", label: "Copies of key documents are stored off-site or in the cloud" },
      { id: "insurance", weight: "recommended", label: "Home contents insurance is current and the sum insured is realistic" },
    ],
  },
];

const isCount = (value) => Number.isFinite(value) && value >= 0;
const isWholeCount = (value) => isCount(value) && Number.isInteger(value);

/**
 * Minimum detection and suppression equipment for a home.
 *
 * Smoke alarms: one per bedroom, plus at least one per level, which covers both
 * "outside each sleeping area" and "on every level" for a normal layout.
 *
 * @param {object} input
 * @param {number} input.bedrooms
 * @param {number} input.levels
 * @param {boolean} input.fuelAppliance  Any fuel-burning appliance or attached garage.
 * @returns {object} counts, or { error }.
 */
export function equipmentNeeded({ bedrooms = 0, levels = 1, fuelAppliance = false } = {}) {
  const beds = Number(bedrooms);
  const floors = Number(levels);
  if (!isCount(beds) || !isCount(floors)) return { error: "Enter 0 or more bedrooms and levels." };
  if (!isWholeCount(beds) || !isWholeCount(floors)) {
    return { error: "Bedrooms and levels must be whole numbers — a fractional count cannot be used to size equipment." };
  }
  if (beds > 20) return { error: "Enter up to 20 bedrooms." };
  if (floors < 1) return { error: "A home has at least one level." };
  if (floors > 10) return { error: "Enter up to 10 levels." };

  return {
    smokeAlarms: beds + floors,
    coAlarms: fuelAppliance ? floors : 0,
    extinguishers: floors + KITCHEN_EXTINGUISHERS,
    fireBlankets: 1,
  };
}

/**
 * Score the audit.
 *
 * @param {object} input
 * @param {string[]} input.checked   Ids of items that pass.
 * @param {object} input.home        { bedrooms, levels, lpgCylinder, pipedGas, fuelAppliance, fireplace, dryer, hasKids }
 * @returns {object} score, verdict and equipment, or { error }.
 */
export function auditFireSafety({ checked = [], home = {} } = {}) {
  const equipment = equipmentNeeded({
    bedrooms: home.bedrooms,
    levels: home.levels,
    fuelAppliance: Boolean(home.fuelAppliance),
  });
  if (equipment.error) return { error: equipment.error };

  // Bottled LPG (cylinder) and piped natural gas (PNG) share most of the "LPG
  // and gas" section, but a PNG home has no cylinder to check — gasCooking
  // gates the whole section, while the raw lpgCylinder flag (used by item-level
  // `when`) further narrows the handful of cylinder-only items within it.
  const gasHome = { ...home, gasCooking: Boolean(home.lpgCylinder) || Boolean(home.pipedGas) };

  const done = new Set(Array.isArray(checked) ? checked.filter((id) => typeof id === "string") : []);

  let score = 0;
  let maxScore = 0;
  const missingCritical = [];

  const byCategory = CATEGORIES.filter((category) => !category.when || gasHome[category.when]).map(
    (category) => {
      const items = category.items.filter((item) => !item.when || gasHome[item.when]);
      let catScore = 0;
      let catMax = 0;
      let catDone = 0;
      for (const item of items) {
        const weight = WEIGHTS[item.weight];
        catMax += weight;
        if (done.has(item.id)) {
          catScore += weight;
          catDone += 1;
        } else if (item.weight === "critical") {
          missingCritical.push({ id: item.id, category: category.title, label: item.label });
        }
      }
      score += catScore;
      maxScore += catMax;
      return {
        id: category.id,
        title: category.title,
        note: category.note ?? "",
        items,
        score: catScore,
        max: catMax,
        done: catDone,
        total: items.length,
      };
    },
  );

  // maxScore is always positive: the unconditional categories always survive.
  const percent = Math.round((score / maxScore) * 100);

  let level;
  let verdict;
  if (missingCritical.length > 0) {
    level = "unsafe";
    verdict = `${missingCritical.length} critical gap${missingCritical.length === 1 ? "" : "s"} — fix these before anything else on the list.`;
  } else if (percent >= SAFE_PERCENT) {
    level = "good";
    verdict = "Strong: every critical control is in place and coverage is high. Keep testing alarms monthly.";
  } else if (percent >= FAIR_PERCENT) {
    level = "fair";
    verdict = "Reasonable: the critical controls hold, but several important habits and checks are still missing.";
  } else {
    level = "weak";
    verdict = "Thin: no critical gaps, but most of the everyday safeguards are not in place yet.";
  }

  const totalItems = byCategory.reduce((sum, category) => sum + category.total, 0);

  return {
    byCategory,
    score,
    maxScore,
    percent,
    level,
    verdict,
    missingCritical,
    checkedCount: byCategory.reduce((sum, category) => sum + category.done, 0),
    totalItems,
    equipment,
  };
}
