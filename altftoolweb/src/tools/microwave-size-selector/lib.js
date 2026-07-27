/**
 * Microwave capacity and type selection.
 *
 * Litres on a microwave is the cavity volume. Two separate things decide how
 * many you need, and the answer is whichever is larger:
 *
 * 1. How much food goes in at once:
 *
 *      litres = BASE[type] + PER_PERSON x people + baking allowance
 *
 *    BASE differs by type because a grill element and especially a convection
 *    fan and rack steal usable height, so the same plate needs a bigger cavity.
 *    PER_PERSON is one more plated portion of cavity volume per head.
 *
 * 2. Whether your largest dish physically turns. The turntable must clear the
 *    dish with a little room, so:
 *
 *      minimum turntable diameter = dish diameter + TURNTABLE_CLEARANCE_MM
 *
 *    Turntable diameters step up with capacity, so a wide thali or casserole
 *    can force a bigger microwave than the volume maths alone suggests.
 *
 * The constants are calibrated against the capacity bands retailers publish
 * (roughly 20 L for one or two people reheating, 25 L for four, 30 L and up
 * once convection baking is involved) — they are stated assumptions, not
 * measured averages.
 */

/** Cavity overhead by type, in litres, before any people are counted. */
export const TYPE_BASE_LITRES = {
  solo: 12,
  grill: 14,
  convection: 18,
};

/** One more plated portion of cavity volume per person. */
export const PER_PERSON_LITRES = 3;

/** Extra litres for a 25 cm cake tin on a rack, or a whole chicken. */
export const BAKING_ALLOWANCE_LITRES = 6;

/** Free space the turntable needs around the dish so it can rotate. */
export const TURNTABLE_CLEARANCE_MM = 20;

export const USAGES = [
  {
    id: "reheat",
    label: "Reheat, defrost and warm milk only",
    type: "solo",
    typeLabel: "Solo",
    note: "A solo microwave heats with microwaves alone. Cheapest to buy and run, but it cannot brown or bake.",
    outputWatts: "700-800 W",
  },
  {
    id: "grill",
    label: "Reheating plus grilling, kebabs and toast",
    type: "grill",
    typeLabel: "Grill",
    note: "A grill model adds a heating element on top for browning. It still cannot bake a cake properly.",
    outputWatts: "800-900 W plus a 1,000-1,200 W grill element",
  },
  {
    id: "convection",
    label: "Full cooking — baking, roasting and grilling",
    type: "convection",
    typeLabel: "Convection",
    note: "A convection model adds a fan and heater, so it works as a small oven as well as a microwave.",
    outputWatts: "800-900 W microwave plus up to 2,000 W convection heat",
  },
];

/**
 * Capacities sold, with the turntable diameter typically fitted to each.
 * Check the exact plate size in the model's specification before buying.
 */
export const CAPACITIES = [
  { litres: 17, turntableMm: 245 },
  { litres: 20, turntableMm: 255 },
  { litres: 23, turntableMm: 270 },
  { litres: 25, turntableMm: 288 },
  { litres: 28, turntableMm: 315 },
  { litres: 30, turntableMm: 315 },
  { litres: 32, turntableMm: 345 },
  { litres: 36, turntableMm: 345 },
  { litres: 38, turntableMm: 360 },
  { litres: 42, turntableMm: 360 },
];

export const MAX_PEOPLE = 20;
export const MIN_DISH_CM = 10;
export const MAX_DISH_CM = 45;

/** Smallest capacity of at least `litres`, or null if none is large enough. */
export function capacityForVolume(litres) {
  return CAPACITIES.find((c) => c.litres >= litres - 1e-9) ?? null;
}

/** Smallest capacity whose turntable clears a dish of `dishCm`, or null. */
export function capacityForDish(dishCm) {
  const needMm = Number(dishCm) * 10 + TURNTABLE_CLEARANCE_MM;
  if (!Number.isFinite(needMm)) return null;
  return CAPACITIES.find((c) => c.turntableMm >= needMm) ?? null;
}

/** Widest dish, in cm, that a turntable of `turntableMm` can rotate. */
export function largestDishCm(turntableMm) {
  const mm = Number(turntableMm);
  if (!Number.isFinite(mm) || mm <= TURNTABLE_CLEARANCE_MM) return null;
  return (mm - TURNTABLE_CLEARANCE_MM) / 10;
}

/**
 * @param {object} input
 * @param {number} input.people        People the microwave serves.
 * @param {string} input.usage         id from USAGES.
 * @param {boolean} [input.bakes]      Whether full cakes or whole birds go in.
 * @param {number} [input.dishCm]      Diameter of the largest dish used.
 * @returns {object} sizing breakdown or { error }.
 */
export function selectMicrowave({ people, usage = "reheat", bakes = false, dishCm = 25 }) {
  const count = Number(people);
  const dish = Number(dishCm);
  const use = USAGES.find((u) => u.id === usage);

  if (!Number.isFinite(count) || !Number.isFinite(dish)) {
    return { error: "Enter valid numbers for people and dish size." };
  }
  if (!use) return { error: "Choose what you will use the microwave for." };
  if (!Number.isInteger(count)) return { error: "Enter a whole number of people." };
  if (count < 1) return { error: "The microwave has to serve at least one person." };
  if (count > MAX_PEOPLE) return { error: `This model covers up to ${MAX_PEOPLE} people.` };
  if (dish < MIN_DISH_CM || dish > MAX_DISH_CM) {
    return { error: `Dish diameter should be between ${MIN_DISH_CM} and ${MAX_DISH_CM} cm.` };
  }

  const base = TYPE_BASE_LITRES[use.type];
  const bakingLitres = bakes ? BAKING_ALLOWANCE_LITRES : 0;
  const requiredLitres = base + PER_PERSON_LITRES * count + bakingLitres;

  const byVolume = capacityForVolume(requiredLitres);
  const byDish = capacityForDish(dish);
  const largest = CAPACITIES[CAPACITIES.length - 1];

  const volumeChoice = byVolume ?? largest;
  const dishChoice = byDish ?? largest;
  const chosen = volumeChoice.litres >= dishChoice.litres ? volumeChoice : dishChoice;

  const dishDrivesSize = byDish !== null && byDish.litres > volumeChoice.litres;
  const dishFits = byDish !== null;
  const volumeExceedsCatalogue = byVolume === null;

  return {
    requiredLitres,
    base,
    peopleLitres: PER_PERSON_LITRES * count,
    bakingLitres,
    recommended: chosen.litres,
    turntableMm: chosen.turntableMm,
    dishNeedsMm: dish * 10 + TURNTABLE_CLEARANCE_MM,
    dishDrivesSize,
    dishFits,
    volumeExceedsCatalogue,
    type: use.typeLabel,
    typeNote: use.note,
    outputWatts: use.outputWatts,
    spareTurntableMm: chosen.turntableMm - (dish * 10 + TURNTABLE_CLEARANCE_MM),
    people: count,
  };
}
