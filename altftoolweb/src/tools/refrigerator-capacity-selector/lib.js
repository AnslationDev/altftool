/**
 * Refrigerator capacity sizing.
 *
 * There is no statutory rule for how many litres a household needs, so this
 * uses an explicit additive model calibrated against the capacity bands
 * retailers and BEE buying guides publish:
 *
 *   1-2 people   ->  150-250 L
 *   3-4 people   ->  250-400 L (double door)
 *   5+ / joint   ->  400-600 L and above
 *
 * The model is:
 *
 *   required = (BASE + ADULT x adults + CHILD x children)
 *              x cooking x shopping x diet x frozen
 *
 * BASE covers the door bins, condiments and staples that every household keeps
 * regardless of headcount. The multipliers each move the figure the way the
 * habit actually moves storage need: bulk shopping stores more at once, daily
 * market trips store less, frozen food eats disproportionate volume.
 *
 * Every constant is a stated assumption you can override by reading the
 * breakdown, not a measured national average.
 */

/** Fixed overhead: door shelves, condiments, staples, eggs, water bottles. */
export const BASE_LITRES = 60;

/** Storage one adult's weekly food occupies, calibrated to the 1-2 person band. */
export const LITRES_PER_ADULT = 55;

/** A child under about 12 stores roughly half an adult's food volume. */
export const LITRES_PER_CHILD = 30;

export const COOKING_STYLES = [
  { id: "light", label: "Mostly eat out or order in", factor: 0.85 },
  { id: "regular", label: "Regular home cooking", factor: 1.0 },
  { id: "heavy", label: "Heavy cooking, batch prep or frequent guests", factor: 1.2 },
];

export const SHOPPING_FREQUENCIES = [
  { id: "daily", label: "Daily fresh from the market", factor: 0.9 },
  { id: "twice", label: "Twice a week", factor: 1.0 },
  { id: "weekly", label: "Weekly", factor: 1.12 },
  { id: "bulk", label: "Fortnightly or monthly bulk buy", factor: 1.28 },
];

export const DIETS = [
  { id: "veg", label: "Vegetarian", factor: 1.0 },
  { id: "occasional", label: "Non-veg a few times a week", factor: 1.05 },
  { id: "daily", label: "Non-veg most days", factor: 1.1 },
];

export const FROZEN_USE = [
  { id: "low", label: "Rarely — ice and a few basics", factor: 1.0, freezerShare: 0.18 },
  { id: "medium", label: "Some frozen peas, ice cream, leftovers", factor: 1.06, freezerShare: 0.24 },
  { id: "high", label: "A lot — frozen meals, meat stock, bulk ice cream", factor: 1.14, freezerShare: 0.32 },
];

/** Gross capacities actually sold in India, in litres. */
export const STANDARD_SIZES = [
  45, 65, 80, 95, 120, 150, 190, 215, 240, 265, 292, 308, 340, 360, 407, 465, 500, 563, 653, 700,
];

/**
 * Format bands, keyed on the recommended gross litres. Boundaries follow how
 * the categories are actually stocked rather than any standard.
 */
export const FORMAT_BANDS = [
  { max: 120, type: "Mini / bar fridge", note: "Single shelf and a small chiller box — fine for one person or a second fridge." },
  { max: 250, type: "Single door direct cool", note: "Cheapest to buy and run, but the freezer needs manual defrosting." },
  { max: 450, type: "Double door frost free", note: "The mainstream family choice: separate freezer, no manual defrost." },
  { max: 600, type: "Triple door or small side-by-side", note: "Adds a dedicated vegetable drawer or a full-height freezer." },
  { max: Infinity, type: "Side-by-side or French door", note: "Needs about 900 mm of width plus door clearance — measure the kitchen first." },
];

export const MAX_ADULTS = 20;
export const MAX_CHILDREN = 20;

function pick(list, id) {
  return list.find((item) => item.id === id) ?? null;
}

/** Smallest catalogue size that meets the requirement, or null if none does. */
export function nextStandardSize(litres) {
  return STANDARD_SIZES.find((size) => size >= litres) ?? null;
}

export function formatFor(litres) {
  return FORMAT_BANDS.find((band) => litres <= band.max) ?? FORMAT_BANDS[FORMAT_BANDS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.adults
 * @param {number} input.children
 * @param {string} input.cooking   id from COOKING_STYLES
 * @param {string} input.shopping  id from SHOPPING_FREQUENCIES
 * @param {string} input.diet      id from DIETS
 * @param {string} input.frozen    id from FROZEN_USE
 * @returns {object} sizing breakdown or { error }.
 */
export function selectRefrigerator({ adults, children = 0, cooking, shopping, diet, frozen }) {
  const a = Number(adults);
  const c = Number(children);
  const cook = pick(COOKING_STYLES, cooking);
  const shop = pick(SHOPPING_FREQUENCIES, shopping);
  const food = pick(DIETS, diet);
  const freeze = pick(FROZEN_USE, frozen);

  if (!Number.isFinite(a) || !Number.isFinite(c)) {
    return { error: "Enter how many adults and children live in the home." };
  }
  if (!cook || !shop || !food || !freeze) {
    return { error: "Choose an option in every dropdown." };
  }
  if (a < 0 || c < 0) return { error: "Household counts cannot be negative." };
  if (!Number.isInteger(a) || !Number.isInteger(c)) {
    return { error: "Enter whole numbers of people." };
  }
  if (a + c < 1) return { error: "There has to be at least one person in the household." };
  if (a > MAX_ADULTS || c > MAX_CHILDREN) {
    return { error: `This sizing model covers up to ${MAX_ADULTS} adults and ${MAX_CHILDREN} children.` };
  }

  const peopleLitres = BASE_LITRES + LITRES_PER_ADULT * a + LITRES_PER_CHILD * c;
  const multiplier = cook.factor * shop.factor * food.factor * freeze.factor;
  const required = peopleLitres * multiplier;

  const largest = STANDARD_SIZES[STANDARD_SIZES.length - 1];
  const recommended = nextStandardSize(required);
  const unitsNeeded = recommended ? 1 : Math.ceil(required / largest);
  const chosen = recommended ?? largest;
  const band = formatFor(chosen);

  const freezerLitres = chosen * freeze.freezerShare;

  return {
    peopleLitres,
    multiplier,
    required,
    recommended: chosen,
    unitsNeeded,
    exceedsCatalogue: recommended === null,
    comfortableRange: [Math.round(required * 0.92), Math.round(required * 1.15)],
    type: band.type,
    typeNote: band.note,
    freezerLitres,
    freshLitres: chosen - freezerLitres,
    litresPerPerson: chosen / (a + c),
    factors: [
      ["Base allowance", `${BASE_LITRES} L`],
      [`Adults (${a} x ${LITRES_PER_ADULT} L)`, `${LITRES_PER_ADULT * a} L`],
      [`Children (${c} x ${LITRES_PER_CHILD} L)`, `${LITRES_PER_CHILD * c} L`],
      [cook.label, `x ${cook.factor}`],
      [shop.label, `x ${shop.factor}`],
      [food.label, `x ${food.factor}`],
      [freeze.label, `x ${freeze.factor}`],
    ],
  };
}
