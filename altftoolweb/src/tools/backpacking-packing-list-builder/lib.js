/**
 * Backpacking packing list engine.
 *
 * A backpacking list is a weight budget, not a wish list. Everything here is
 * derived from four rules:
 *
 * 1. THE 20% RULE — the widely used carrying guideline is that a loaded pack
 *    should sit at or below 20% of the hiker's body weight (10-15% for an
 *    unconditioned walker or a day pack). targetKg = bodyWeightKg x 0.20.
 *
 * 2. BASE WEIGHT vs CONSUMABLES — base weight is everything that does not get
 *    eaten, drunk or burned. Food, water and fuel are counted separately
 *    because they shrink as you walk, and because they are the only part of
 *    the load resupply can reset.
 *
 * 3. FOOD BY CALORIE DENSITY — backpacking food is planned by energy, then
 *    converted to grams at a target density. The long-standing rule of thumb
 *    is 125 kcal per ounce, which is 4.4 kcal per gram, so a 3,000 kcal day
 *    weighs about 680 g. Anything less dense than that is mostly water.
 *
 * 4. SLEEP SYSTEM BY NIGHT LOW — under ISO 23537 a bag's "comfort" rating is
 *    the temperature at which an average adult sleeps without feeling cold,
 *    so pick a comfort rating at or below the expected low with a margin.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Loaded-pack ceiling as a share of body weight. */
export const PACK_WEIGHT_RATIO = 0.2;

/** A gentler ceiling for an unconditioned walker or a heavy first trip. */
export const CONSERVATIVE_PACK_RATIO = 0.15;

/** Target energy density of backpacking food: 125 kcal per ounce = 4.4 kcal/g. */
export const FOOD_KCAL_PER_GRAM = 4.4;

/** Default daily energy for a moderate day under load. */
export const DEFAULT_KCAL_PER_DAY = 3000;

/** Water weighs 1 kg per litre. */
export const WATER_KG_PER_L = 1;

/** Gas canister burn rate for two hot meals and a hot drink a day, grams. */
export const FUEL_G_PER_PERSON_PER_DAY = 60;

/** Sleeping-bag margin below the expected night low, in Celsius. */
export const SLEEPING_BAG_MARGIN_C = 5;

/** Night-low thresholds, in Celsius, that change the sleep and layer system. */
export const NIGHT_MILD_C = 15;
export const NIGHT_COLD_C = 5;
export const NIGHT_FREEZING_C = 0;

/** Sleeping bag weights by class, in grams (three-season synthetic figures). */
export const BAG_WEIGHT_G = { warm: 800, cool: 1100, cold: 1500, freezing: 1900 };

export const MIN_NIGHTS = 1;
export const MAX_NIGHTS = 40;
export const MIN_BODY_WEIGHT_KG = 30;
export const MAX_BODY_WEIGHT_KG = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Food weight for a stretch between resupplies.
 * @param {{ foodDays:number, kcalPerDay:number }} input
 * @returns {{ totalKcal:number, gramsPerDay:number, totalGrams:number }}
 */
export function foodPlan({ foodDays, kcalPerDay }) {
  const gramsPerDay = ceil(kcalPerDay / FOOD_KCAL_PER_GRAM);
  return {
    totalKcal: kcalPerDay * foodDays,
    gramsPerDay,
    totalGrams: gramsPerDay * foodDays,
  };
}

/**
 * Sleep system class from the expected night low.
 * @param {number} nightLowC
 * @returns {{ band:"warm"|"cool"|"cold"|"freezing", bagComfortC:number, bagGrams:number }}
 */
export function sleepSystem(nightLowC) {
  const band =
    nightLowC < NIGHT_FREEZING_C
      ? "freezing"
      : nightLowC < NIGHT_COLD_C
        ? "cold"
        : nightLowC < NIGHT_MILD_C
          ? "cool"
          : "warm";
  return {
    band,
    bagComfortC: round1(nightLowC - SLEEPING_BAG_MARGIN_C),
    bagGrams: BAG_WEIGHT_G[band],
  };
}

/** consumable: true means the item is eaten, drunk or burned on the walk. */
const CATALOG = [
  // --- The big three ------------------------------------------------------
  {
    id: "pack",
    group: "The big three",
    name: "Backpack (50-65 L) with rain cover",
    gramsEach: 1500,
    qty: () => 1,
  },
  {
    id: "shelter",
    group: "The big three",
    name: "Tent or tarp (your share)",
    grams: (c) => Math.round(2200 / c.tentSharedBy),
    qty: () => 1,
    note: (c) =>
      c.tentSharedBy > 1
        ? `A 2.2 kg tent split ${c.tentSharedBy} ways — one carries the fly, one the poles`
        : "A 2.2 kg solo-carried tent",
  },
  {
    id: "sleeping-bag",
    group: "The big three",
    name: "Sleeping bag",
    grams: (c) => c.bagGrams,
    qty: () => 1,
    note: (c) => `Comfort rating of about ${c.bagComfortC} °C or lower for a ${c.nightLowC} °C night`,
  },
  {
    id: "mat",
    group: "The big three",
    name: "Sleeping mat",
    grams: (c) => (c.band === "warm" ? 400 : 550),
    qty: () => 1,
    note: () => "Ground conduction, not air temperature, is what makes a cold night cold",
  },

  // --- Worn and carried clothing -----------------------------------------
  {
    id: "base-tops",
    group: "Clothing",
    name: "Merino or synthetic base tops",
    gramsEach: 160,
    qty: () => 2,
    note: () => "Wear one, carry one — cotton holds sweat and chills you on a break",
  },
  {
    id: "trousers",
    group: "Clothing",
    name: "Hiking trousers or shorts",
    gramsEach: 300,
    qty: (c) => (c.nights > 4 ? 2 : 1),
  },
  {
    id: "underwear",
    group: "Clothing",
    name: "Underwear",
    gramsEach: 45,
    qty: (c) => clamp(ceil(c.nights / 2) + 1, 2, 4),
    note: () => "Three is the usual ceiling: one on, one washed, one drying",
  },
  {
    id: "socks",
    group: "Clothing",
    name: "Hiking socks",
    gramsEach: 80,
    qty: (c) => clamp(ceil(c.nights / 2) + 1, 2, 4),
  },
  {
    id: "mid-layer",
    group: "Clothing",
    name: "Fleece or light insulated jacket",
    gramsEach: 400,
    include: (c) => c.band !== "warm",
    qty: () => 1,
  },
  {
    id: "down-jacket",
    group: "Clothing",
    name: "Down or synthetic puffy",
    gramsEach: 500,
    include: (c) => c.band === "cold" || c.band === "freezing",
    qty: () => 1,
    note: () => "For standing still at camp, which is when you actually get cold",
  },
  {
    id: "rain-shell",
    group: "Clothing",
    name: "Waterproof shell jacket",
    gramsEach: 380,
    include: (c) => c.rainExpected,
    qty: () => 1,
  },
  {
    id: "rain-trousers",
    group: "Clothing",
    name: "Waterproof over-trousers",
    gramsEach: 250,
    include: (c) => c.rainExpected && c.band !== "warm",
    qty: () => 1,
  },
  {
    id: "hat-gloves",
    group: "Clothing",
    name: "Warm hat and gloves",
    gramsEach: 140,
    include: (c) => c.band === "cold" || c.band === "freezing",
    qty: () => 1,
  },
  {
    id: "sun-hat",
    group: "Clothing",
    name: "Sun hat and sunglasses",
    gramsEach: 150,
    qty: () => 1,
  },
  {
    id: "camp-shoes",
    group: "Clothing",
    name: "Camp shoes or sandals",
    gramsEach: 300,
    include: (c) => c.nights >= 2,
    qty: () => 1,
  },

  // --- Kitchen ------------------------------------------------------------
  {
    id: "stove",
    group: "Kitchen",
    name: "Stove, pot, lighter and spoon",
    gramsEach: 500,
    include: (c) => c.cooking,
    qty: () => 1,
  },
  {
    id: "fuel",
    group: "Kitchen",
    name: "Gas canister",
    consumable: true,
    include: (c) => c.cooking,
    grams: (c) => c.fuelGrams + 100, // canister shell adds about 100 g
    qty: () => 1,
    note: (c) => `${c.fuelGrams} g of gas for ${c.foodDays} days of two hot meals plus a hot drink`,
  },
  {
    id: "food",
    group: "Kitchen",
    name: "Food",
    unit: "days",
    consumable: true,
    grams: (c) => c.foodGrams,
    qty: (c) => c.foodDays,
    note: (c) =>
      `${c.foodGramsPerDay} g a day at ${c.kcalPerDay} kcal — ${FOOD_KCAL_PER_GRAM} kcal per gram`,
  },
  {
    id: "water",
    group: "Kitchen",
    name: "Water carried between sources",
    unit: "litres",
    consumable: true,
    grams: (c) => Math.round(c.waterCapacityL * WATER_KG_PER_L * 1000),
    qty: (c) => c.waterCapacityL,
    note: () => "Every litre is a kilogram — carry to the next source, not for the whole day",
  },
  {
    id: "filter",
    group: "Kitchen",
    name: "Water filter or purification tablets",
    gramsEach: 100,
    qty: () => 1,
  },

  // --- Safety & navigation ------------------------------------------------
  {
    id: "headtorch",
    group: "Safety & navigation",
    name: "Head torch with spare cell",
    gramsEach: 120,
    qty: () => 1,
  },
  {
    id: "first-aid",
    group: "Safety & navigation",
    name: "First-aid and blister kit",
    gramsEach: 250,
    qty: () => 1,
  },
  {
    id: "map",
    group: "Safety & navigation",
    name: "Paper map and compass",
    gramsEach: 120,
    qty: () => 1,
    note: () => "The one navigation tool that does not run out of battery",
  },
  {
    id: "poles",
    group: "Safety & navigation",
    name: "Trekking poles",
    gramsEach: 500,
    include: (c) => c.trekkingPoles,
    qty: () => 1,
  },
  {
    id: "power-bank",
    group: "Safety & navigation",
    name: "Power bank and cable",
    gramsEach: 230,
    qty: () => 1,
  },
  {
    id: "repair",
    group: "Safety & navigation",
    name: "Repair kit (tape, cord, needle)",
    gramsEach: 90,
    qty: () => 1,
  },

  // --- Personal -----------------------------------------------------------
  {
    id: "toiletries",
    group: "Personal",
    name: "Toiletries and sunscreen",
    gramsEach: 300,
    qty: () => 1,
  },
  {
    id: "trowel",
    group: "Personal",
    name: "Trowel and waste bags",
    gramsEach: 60,
    qty: () => 1,
    note: () => "Leave-no-trace: bury waste 15-20 cm deep and at least 60 m from water",
  },
  {
    id: "towel",
    group: "Personal",
    name: "Micro-fibre towel",
    gramsEach: 90,
    qty: () => 1,
  },
  {
    id: "documents",
    group: "Personal",
    name: "ID, permits and emergency contacts",
    gramsEach: 60,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "The big three",
  "Clothing",
  "Kitchen",
  "Safety & navigation",
  "Personal",
];

/**
 * @param {object} input
 * @param {number} input.nights
 * @param {number} input.bodyWeightKg
 * @param {number} input.nightLowC
 * @param {number} input.resupplyEveryDays 0 = no resupply, carry everything
 * @param {number} input.waterCapacityL
 * @param {number} input.kcalPerDay
 * @param {number} input.tentSharedBy
 * @param {boolean} input.rainExpected
 * @param {boolean} input.cooking
 * @param {boolean} input.trekkingPoles
 * @returns {object | { error:string }}
 */
export function buildBackpackingList(input) {
  const {
    nights,
    bodyWeightKg,
    nightLowC = 8,
    resupplyEveryDays = 0,
    waterCapacityL = 2,
    kcalPerDay = DEFAULT_KCAL_PER_DAY,
    tentSharedBy = 2,
    rainExpected = true,
    cooking = true,
    trekkingPoles = true,
  } = input || {};

  if (!isNum(nights)) return { error: "Enter the number of nights out as a number." };
  if (nights < MIN_NIGHTS) return { error: "A backpacking trip is at least one night." };
  if (nights > MAX_NIGHTS) return { error: `Keep the trip under ${MAX_NIGHTS} nights.` };
  if (!isNum(bodyWeightKg)) return { error: "Enter your body weight in kilograms." };
  if (bodyWeightKg < MIN_BODY_WEIGHT_KG || bodyWeightKg > MAX_BODY_WEIGHT_KG) {
    return {
      error: `Enter a body weight between ${MIN_BODY_WEIGHT_KG} kg and ${MAX_BODY_WEIGHT_KG} kg.`,
    };
  }
  if (!isNum(nightLowC) || nightLowC < -40 || nightLowC > 40) {
    return { error: "Enter a night low between -40 °C and 40 °C." };
  }
  if (!isNum(resupplyEveryDays) || resupplyEveryDays < 0 || resupplyEveryDays > MAX_NIGHTS) {
    return { error: "Enter the resupply interval in days, or 0 to carry everything." };
  }
  if (!isNum(waterCapacityL) || waterCapacityL < 0 || waterCapacityL > 12) {
    return { error: "Enter between 0 and 12 litres of water capacity." };
  }
  if (!isNum(kcalPerDay) || kcalPerDay < 1000 || kcalPerDay > 8000) {
    return { error: "Enter a daily energy target between 1,000 and 8,000 kcal." };
  }
  if (!isNum(tentSharedBy) || tentSharedBy < 1 || tentSharedBy > 4) {
    return { error: "A tent can be shared between 1 and 4 people." };
  }

  const wholeNights = Math.round(nights);
  const carryDays =
    resupplyEveryDays > 0 ? Math.min(wholeNights + 1, Math.round(resupplyEveryDays)) : wholeNights + 1;
  const food = foodPlan({ foodDays: carryDays, kcalPerDay });
  const sleep = sleepSystem(nightLowC);
  const fuelGrams = cooking ? FUEL_G_PER_PERSON_PER_DAY * carryDays : 0;

  const ctx = {
    nights: wholeNights,
    bodyWeightKg,
    nightLowC,
    band: sleep.band,
    bagComfortC: sleep.bagComfortC,
    bagGrams: sleep.bagGrams,
    foodDays: carryDays,
    foodGrams: food.totalGrams,
    foodGramsPerDay: food.gramsPerDay,
    kcalPerDay,
    fuelGrams,
    waterCapacityL,
    tentSharedBy: Math.round(tentSharedBy),
    rainExpected,
    cooking,
    trekkingPoles,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let baseGrams = 0;
  let consumableGrams = 0;
  let totalItems = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const qty = Math.max(0, Math.round(item.qty(ctx)));
    if (qty === 0) continue;
    const grams = item.grams ? item.grams(ctx) : item.gramsEach * qty;
    totalItems += qty;
    if (item.consumable) consumableGrams += grams;
    else baseGrams += grams;
    byGroup.get(item.group).push({
      id: item.id,
      name: item.name,
      qty,
      unit: item.unit || "",
      grams,
      consumable: Boolean(item.consumable),
      note: item.note ? item.note(ctx) : "",
    });
  }

  const groups = GROUP_ORDER.map((name) => ({ name, items: byGroup.get(name) })).filter(
    (group) => group.items.length > 0,
  );

  const totalGrams = baseGrams + consumableGrams;
  const targetKg = round1(bodyWeightKg * PACK_WEIGHT_RATIO);
  const conservativeKg = round1(bodyWeightKg * CONSERVATIVE_PACK_RATIO);
  const totalKg = round1(totalGrams / 1000);
  const percentOfBodyWeight = round1((totalGrams / 1000 / bodyWeightKg) * 100);

  return {
    groups,
    totalItems,
    baseKg: round1(baseGrams / 1000),
    consumablesKg: round1(consumableGrams / 1000),
    totalKg,
    totalGrams,
    targetKg,
    conservativeKg,
    percentOfBodyWeight,
    overBy: round1(totalGrams / 1000 - targetKg),
    withinTarget: totalGrams / 1000 <= targetKg,
    foodDays: carryDays,
    foodGrams: food.totalGrams,
    foodGramsPerDay: food.gramsPerDay,
    foodKcal: food.totalKcal,
    fuelGrams,
    waterKg: round1(waterCapacityL * WATER_KG_PER_L),
    band: sleep.band,
    bagComfortC: sleep.bagComfortC,
    nights: wholeNights,
    bodyWeightKg,
  };
}
