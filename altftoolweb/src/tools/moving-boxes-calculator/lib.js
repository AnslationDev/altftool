/**
 * Moving carton estimator.
 *
 * Carton dimensions and capacities are the standard moving-industry sizes sold
 * by removal companies worldwide (the same set U-Haul, Pickfords and Indian
 * packers stock). Cubic feet below are computed from the stated inside
 * dimensions: cu ft = (L x W x H in inches) / 1728.
 *
 *   small     16   x 12   x 12    = 2304  in^3 = 1.33 -> sold as 1.5 cu ft
 *   medium    18   x 18   x 16    = 5184  in^3 = 3.0  cu ft
 *   large     18   x 18   x 24    = 7776  in^3 = 4.5  cu ft
 *   extra-lg  24   x 20   x 21.5  = 10320 in^3 = 6.0  cu ft
 *   dish      18   x 18   x 28    = 9072  in^3 = 5.25 cu ft
 *   wardrobe  24   x 21   x 48    = 24192 in^3 = 14.0 cu ft
 *
 * The room mixes are the packing allowances removal firms use when they survey
 * a home: a fully packed bedroom runs to roughly 10 cartons, a kitchen to
 * 15-25 depending on size. Item-driven inputs (books, hanging clothes) override
 * guesswork with the two capacities every packer quotes:
 *   - one small book carton holds about 2 linear feet of shelved books
 *     (the limit is weight, not space: books run ~10 kg per linear foot)
 *   - one wardrobe carton holds about 2 linear feet of hanging rail
 *
 * Nothing here is a legal or insurance standard; it is a planning estimate.
 */

/** Cubic feet to cubic metres. 1 ft = 0.3048 m, so 1 cu ft = 0.3048^3. */
export const CUFT_TO_M3 = 0.028316846592;

/** Standard moving carton range. cuft is the sold/nominal capacity. */
export const CARTON_TYPES = [
  {
    id: "small",
    name: "Small carton (book box)",
    inches: '16" x 12" x 12"',
    cuft: 1.5,
    maxKg: 20,
    use: "Books, tools, tinned food, anything dense",
  },
  {
    id: "medium",
    name: "Medium carton",
    inches: '18" x 18" x 16"',
    cuft: 3.0,
    maxKg: 23,
    use: "Pans, toys, files, small appliances",
  },
  {
    id: "large",
    name: "Large carton",
    inches: '18" x 18" x 24"',
    cuft: 4.5,
    maxKg: 23,
    use: "Folded clothes, linen, cushions, lampshades",
  },
  {
    id: "xl",
    name: "Extra-large carton",
    inches: '24" x 20" x 21.5"',
    cuft: 6.0,
    maxKg: 23,
    use: "Duvets, pillows, light bulky items only",
  },
  {
    id: "dish",
    name: "Dish barrel (double wall)",
    inches: '18" x 18" x 28"',
    cuft: 5.25,
    maxKg: 23,
    use: "Crockery, glassware, ceramics",
  },
  {
    id: "wardrobe",
    name: "Wardrobe carton (with rail)",
    inches: '24" x 21" x 48"',
    cuft: 14.0,
    maxKg: 30,
    use: "Clothes that travel on their hangers",
  },
];

const CARTON_BY_ID = Object.fromEntries(CARTON_TYPES.map((carton) => [carton.id, carton]));

const emptyMix = () => ({ small: 0, medium: 0, large: 0, xl: 0, dish: 0, wardrobe: 0 });

/** Packing allowance for one fully packed bedroom (excludes hanging clothes). */
export const PER_BEDROOM = { small: 2, medium: 4, large: 3, xl: 1 };

/** Packing allowance for one living, dining or family room. */
export const PER_LIVING_ROOM = { small: 3, medium: 4, large: 3, xl: 1 };

/** Personal effects that follow each occupant rather than a room. */
export const PER_OCCUPANT = { small: 2, medium: 2 };

/** Bathrooms, hallway, utility and cleaning gear — one allowance per home. */
export const BASE_HOME = { small: 2, medium: 2 };

/** A home office adds paperwork and electronics, mostly in small cartons. */
export const HOME_OFFICE = { small: 6, medium: 3, large: 1 };

/** Kitchen allowances by size. Dish barrels carry the breakables. */
export const KITCHEN_SIZES = [
  { id: "compact", label: "Compact / studio kitchen", mix: { dish: 2, small: 4, medium: 5, large: 2 } },
  { id: "standard", label: "Standard family kitchen", mix: { dish: 3, small: 6, medium: 7, large: 3 } },
  { id: "large", label: "Large kitchen with pantry", mix: { dish: 5, small: 8, medium: 9, large: 4 } },
];

/** How full people pack. Applied to the room and occupant allowances. */
export const DENSITY_LEVELS = [
  { id: "light", label: "Minimalist — decluttered before the move", factor: 0.75 },
  { id: "average", label: "Average household", factor: 1 },
  { id: "heavy", label: "Heavy — lots of belongings, nothing sold", factor: 1.35 },
];

/** One small carton holds about 2 linear feet of shelved books (weight-limited). */
export const BOOK_FEET_PER_SMALL_CARTON = 2;

/** One wardrobe carton takes about 2 linear feet of hanging rail. */
export const RAIL_FEET_PER_WARDROBE_CARTON = 2;

/**
 * Tape: an H-seal on an 18" carton uses the 18" centre seam plus two 18" side
 * flaps at each end = 3 x 18" x 2 ends = 108" = 2.74 m. A 50 m roll of 48 mm
 * tape therefore seals about 18 cartons.
 */
export const CARTONS_PER_TAPE_ROLL = 18;

/** Planning allowance: a dish barrel of crockery consumes roughly a 3 kg bundle of newsprint. */
export const PAPER_KG_PER_DISH_CARTON = 3;

/** Planning allowance: light void-fill and wrapping for every other carton. */
export const PAPER_KG_PER_OTHER_CARTON = 0.15;

/** Planning allowance: bubble wrap per dish barrel, plus a fixed run for screens, mirrors and lamps. */
export const BUBBLE_M_PER_DISH_CARTON = 6;
export const BUBBLE_M_BASE = 15;

/** One marker survives roughly 40 cartons of labelling; never quote fewer than two. */
export const CARTONS_PER_MARKER = 40;

const isCount = (value) => Number.isFinite(value) && value >= 0;

function addMix(target, mix, factor = 1) {
  for (const [id, count] of Object.entries(mix)) {
    target[id] += count * factor;
  }
  return target;
}

/**
 * Estimate the carton mix and packing supplies for a home move.
 *
 * @param {object} input
 * @param {number} input.bedrooms          Number of bedrooms to pack (0-20).
 * @param {number} input.livingRooms       Living / dining / family rooms (0-10).
 * @param {number} input.occupants         People living there (0-20).
 * @param {string} input.kitchenSize       One of KITCHEN_SIZES ids, or "none".
 * @param {boolean} input.homeOffice       Add a home-office allowance.
 * @param {number} input.bookShelfFeet     Linear feet of shelved books and media (0-500).
 * @param {number} input.hangingRailFeet   Linear feet of hanging clothes (0-200).
 * @param {string} input.density           One of DENSITY_LEVELS ids.
 * @returns {object} { byType, totalCartons, totalCuft, totalM3, supplies } or { error }.
 */
export function estimateBoxes({
  bedrooms = 0,
  livingRooms = 0,
  occupants = 0,
  kitchenSize = "standard",
  homeOffice = false,
  bookShelfFeet = 0,
  hangingRailFeet = 0,
  density = "average",
} = {}) {
  const numbers = { bedrooms, livingRooms, occupants, bookShelfFeet, hangingRailFeet };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isCount(Number(value))) {
      return { error: `Enter a number of 0 or more for ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
    }
  }

  const beds = Math.floor(Number(bedrooms));
  const living = Math.floor(Number(livingRooms));
  const people = Math.floor(Number(occupants));
  const bookFeet = Number(bookShelfFeet);
  const railFeet = Number(hangingRailFeet);

  if (beds > 20 || living > 10) return { error: "That is more rooms than this estimate covers — split the home into sections." };
  if (people > 20) return { error: "Enter up to 20 occupants; beyond that, estimate room by room instead." };
  if (bookFeet > 500) return { error: "Enter up to 500 linear feet of books — larger collections need a specialist quote." };
  if (railFeet > 200) return { error: "Enter up to 200 linear feet of hanging rail." };

  const densityLevel = DENSITY_LEVELS.find((level) => level.id === density);
  if (!densityLevel) return { error: "Choose how heavily the home is packed." };

  const kitchen = kitchenSize === "none" ? null : KITCHEN_SIZES.find((size) => size.id === kitchenSize);
  if (kitchenSize !== "none" && !kitchen) return { error: "Choose a kitchen size, or select no kitchen." };

  const hasSomething = beds > 0 || living > 0 || people > 0 || Boolean(kitchen) || homeOffice || bookFeet > 0 || railFeet > 0;
  if (!hasSomething) {
    return { error: "Add at least one room, occupant or item to estimate cartons for." };
  }

  const raw = emptyMix();
  addMix(raw, PER_BEDROOM, beds);
  addMix(raw, PER_LIVING_ROOM, living);
  addMix(raw, PER_OCCUPANT, people);
  addMix(raw, BASE_HOME, 1);
  if (homeOffice) addMix(raw, HOME_OFFICE, 1);
  if (kitchen) addMix(raw, kitchen.mix, 1);

  // Density scales the household allowance, then item-driven counts are added
  // on top: those are measured, so they are not guessed at a second time.
  const scaled = emptyMix();
  for (const id of Object.keys(scaled)) {
    scaled[id] = raw[id] * densityLevel.factor;
  }
  scaled.small += bookFeet / BOOK_FEET_PER_SMALL_CARTON;
  scaled.wardrobe += railFeet / RAIL_FEET_PER_WARDROBE_CARTON;

  const byType = CARTON_TYPES.map((carton) => {
    const count = Math.ceil(scaled[carton.id] - 1e-9);
    return {
      ...carton,
      count: count > 0 ? count : 0,
      cuftTotal: (count > 0 ? count : 0) * carton.cuft,
    };
  }).filter((carton) => carton.count > 0);

  const totalCartons = byType.reduce((sum, carton) => sum + carton.count, 0);
  const totalCuft = byType.reduce((sum, carton) => sum + carton.cuftTotal, 0);
  const dishCount = byType.find((carton) => carton.id === "dish")?.count ?? 0;
  const otherCount = totalCartons - dishCount;

  const supplies = {
    tapeRolls: Math.max(1, Math.ceil(totalCartons / CARTONS_PER_TAPE_ROLL)),
    paperKg:
      Math.round((dishCount * PAPER_KG_PER_DISH_CARTON + otherCount * PAPER_KG_PER_OTHER_CARTON) * 10) / 10,
    bubbleWrapMetres: Math.ceil(dishCount * BUBBLE_M_PER_DISH_CARTON + BUBBLE_M_BASE),
    markers: Math.max(2, Math.ceil(totalCartons / CARTONS_PER_MARKER)),
  };

  return {
    byType,
    totalCartons,
    totalCuft: Math.round(totalCuft * 10) / 10,
    totalM3: Math.round(totalCuft * CUFT_TO_M3 * 100) / 100,
    heaviestSafeKg: CARTON_BY_ID.medium.maxKg,
    densityLabel: densityLevel.label,
    supplies,
  };
}
