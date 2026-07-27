/**
 * Washing machine capacity sizing, built from garment weights rather than a
 * lookup table of "family of four = 7 kg".
 *
 * A machine's rated capacity is the maximum weight of DRY laundry it is
 * designed to wash in one cycle. So the sizing chain is:
 *
 *   weekly laundry weight  ->  weight per wash  ->  drum size
 *
 *   weight per wash = weekly weight / washes per week
 *   drum size       = weight per wash / FILL_FACTOR
 *
 * FILL_FACTOR exists because a drum packed to its rated kilo does not tumble.
 * Manufacturers ask for roughly a hand's width of space above the load, which
 * is about 85% of the rated capacity for a normal cotton wash.
 *
 * The per-person weekly figures come from typical dry garment weights and a
 * realistic wear pattern (tops washed after one wear, bottoms after two):
 *
 *   7 tops x 0.20 kg          = 1.40 kg
 *   3 bottoms x 0.55 kg       = 1.65 kg
 *   7 innerwear sets x 0.15   = 1.05 kg
 *   1.5 bath towels x 0.40    = 0.60 kg
 *                               ------
 *                               4.70 kg per adult per week
 *
 * Children change more often but their garments are lighter, which nets out
 * slightly below an adult.
 */

/** Typical dry weights, in kilograms, of common items. */
export const GARMENT_WEIGHTS_KG = {
  shirt: 0.2,
  tshirt: 0.18,
  trousers: 0.45,
  jeans: 0.7,
  innerwearSet: 0.15,
  bathTowel: 0.4,
  singleSheet: 0.5,
  doubleSheet: 0.8,
  pillowCover: 0.1,
  doubleQuilt: 3.0,
};

/** Derived from the wear pattern documented above. */
export const ADULT_WEEKLY_KG = 4.7;

/** Children under about 12: more changes, lighter garments. */
export const CHILD_WEEKLY_KG = 3.4;

/** One weekly changeover per bed: double sheet plus two pillow covers. */
export const BED_WEEKLY_KG =
  GARMENT_WEIGHTS_KG.doubleSheet + 2 * GARMENT_WEIGHTS_KG.pillowCover;

/** Usable share of rated capacity — leave room for the load to tumble. */
export const FILL_FACTOR = 0.85;

/**
 * A double quilt or blanket is light but bulky; it needs drum volume rather
 * than drum weight, and manufacturers generally rate 8 kg and above as the
 * point where a double quilt fits.
 */
export const MIN_KG_FOR_DOUBLE_QUILT = 8;

/** Rated capacities commonly sold, in kg. */
export const STANDARD_CAPACITIES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

export const MAX_PEOPLE = 20;
export const MAX_BEDS = 20;
export const MAX_WASHES_PER_WEEK = 21;

export const MACHINE_TYPES = [
  {
    id: "front",
    label: "Front load",
    note: "Best wash quality and lowest water use; the rated kg is realistic because the drum tumbles the load.",
  },
  {
    id: "topfa",
    label: "Top load fully automatic",
    note: "Faster cycles and easier to load; the impeller needs slightly more free space, so do not fill to the brim.",
  },
  {
    id: "semi",
    label: "Semi automatic twin tub",
    note: "The rated kg is the wash tub only — the spin tub is usually 20-30% smaller, so wash in two batches.",
  },
];

/** Smallest catalogue capacity that meets the requirement, or null. */
export function nextCapacity(kg) {
  return STANDARD_CAPACITIES.find((size) => size >= kg - 1e-9) ?? null;
}

/**
 * @param {object} input
 * @param {number} input.adults
 * @param {number} input.children
 * @param {number} input.beds              Beds whose linen is washed weekly.
 * @param {number} input.washesPerWeek
 * @param {number} [input.extraKgPerWeek]  Curtains, uniforms, sports kit etc.
 * @param {boolean} [input.washesQuilts]   Whether double quilts go in the machine.
 * @returns {object} sizing breakdown or { error }.
 */
export function selectWasher({
  adults,
  children = 0,
  beds = 1,
  washesPerWeek,
  extraKgPerWeek = 0,
  washesQuilts = false,
}) {
  const a = Number(adults);
  const c = Number(children);
  const b = Number(beds);
  const w = Number(washesPerWeek);
  const extra = Number(extraKgPerWeek);

  if (![a, c, b, w, extra].every((n) => Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (a < 0 || c < 0 || b < 0 || extra < 0) return { error: "Values cannot be negative." };
  if (!Number.isInteger(a) || !Number.isInteger(c) || !Number.isInteger(b)) {
    return { error: "Enter whole numbers of people and beds." };
  }
  if (a + c < 1) return { error: "There has to be at least one person in the household." };
  if (a > MAX_PEOPLE || c > MAX_PEOPLE || b > MAX_BEDS) {
    return { error: `This model covers up to ${MAX_PEOPLE} people and ${MAX_BEDS} beds.` };
  }
  if (!(w > 0)) return { error: "You need at least one wash a week." };
  if (w > MAX_WASHES_PER_WEEK) {
    return { error: `More than ${MAX_WASHES_PER_WEEK} washes a week is beyond this model.` };
  }
  if (extra > 100) return { error: "Extra laundry above 100 kg a week is beyond this model." };

  const peopleKg = ADULT_WEEKLY_KG * a + CHILD_WEEKLY_KG * c;
  const linenKg = BED_WEEKLY_KG * b;
  const weeklyKg = peopleKg + linenKg + extra;

  const perLoadKg = weeklyKg / w;
  let requiredKg = perLoadKg / FILL_FACTOR;

  const quiltDrivesSize = washesQuilts && requiredKg < MIN_KG_FOR_DOUBLE_QUILT;
  if (quiltDrivesSize) requiredKg = MIN_KG_FOR_DOUBLE_QUILT;

  const largest = STANDARD_CAPACITIES[STANDARD_CAPACITIES.length - 1];
  const match = nextCapacity(requiredKg);
  const recommended = match ?? largest;
  const exceedsCatalogue = match === null;

  // If even the largest drum cannot take the per-load weight, more washes are needed.
  const washesNeeded = exceedsCatalogue
    ? Math.ceil(weeklyKg / (largest * FILL_FACTOR))
    : Math.ceil(w);

  const usableKg = recommended * FILL_FACTOR;

  return {
    peopleKg,
    linenKg,
    extraKg: extra,
    weeklyKg,
    perLoadKg,
    requiredKg,
    recommended,
    exceedsCatalogue,
    washesNeeded,
    usableKg,
    headroomPct: perLoadKg > 0 ? ((usableKg - perLoadKg) / perLoadKg) * 100 : 0,
    quiltDrivesSize,
    shirtsPerLoad: usableKg / GARMENT_WEIGHTS_KG.shirt,
    jeansPerLoad: usableKg / GARMENT_WEIGHTS_KG.jeans,
    towelsPerLoad: usableKg / GARMENT_WEIGHTS_KG.bathTowel,
  };
}
