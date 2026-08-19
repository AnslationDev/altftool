/**
 * Beach holiday packing list engine.
 *
 * Quantities are derived, not guessed. Three rules do most of the work:
 *
 * 1. LAUNDRY CYCLE — you never need more of a garment than one wash cycle plus
 *    the turnaround time, no matter how long the trip is:
 *      wearDays = laundry ? min(days, interval + TURNAROUND_DAYS) : days
 *      qty      = ceil(wearDays / wearsBeforeWash) + spare
 *
 * 2. SUNSCREEN DOSE — dermatology guidance is 2 mg of sunscreen per cm² of
 *    skin, which works out at about 30 ml (one shot glass, roughly 7 teaspoons)
 *    to cover an average adult body, reapplied every 2 hours and after
 *    swimming or towelling. Total = days x applications x dose.
 *
 * 3. CABIN LIQUIDS — the ICAO one-bag rule adopted by TSA, the EU and Indian
 *    security (BCAS) allows containers of at most 100 ml, all fitting in a
 *    single transparent resealable bag of at most 1 litre, one bag per
 *    passenger. Anything above that has to be checked in or bought on arrival.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Days between putting clothes in the wash and having them dry and folded. */
export const LAUNDRY_TURNAROUND_DAYS = 1;

/** Sunscreen needed to cover an average adult body at the 2 mg/cm² dose. */
export const SUNSCREEN_ML_FULL_BODY = 30;

/** Face, neck, arms and lower legs only — roughly half the full-body dose. */
export const SUNSCREEN_ML_EXPOSED_ONLY = 15;

/** Reapplication interval in hours recommended by dermatology bodies. */
export const SUNSCREEN_REAPPLY_HOURS = 2;

/** ICAO / TSA / BCAS cabin liquid limits, in millilitres. */
export const LIQUID_CONTAINER_MAX_ML = 100;
export const LIQUID_BAG_MAX_ML = 1000;

/** Typical cabin allowance in kilograms (7 kg is the standard Indian domestic
 * and common short-haul figure; always confirm with your airline). */
export const CABIN_ALLOWANCE_KG = 7;

/** Typical checked allowances in kilograms. */
export const CHECKED_ALLOWANCE_KG = { domestic: 15, international: 23 };

/** Above this daytime high, cotton tops are a one-wear item. */
export const HOT_DAY_C = 28;

/** Trip length guard rails. */
export const MIN_DAYS = 1;
export const MAX_DAYS = 90;
export const MAX_TRAVELLERS = 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * After-sun 100 ml bottles needed for the whole party, at roughly 10 ml a
 * person a day (shared, like insect repellent — not a perTraveller item).
 * Shared by the catalogue entry and the cabin-liquids audit so the two never
 * drift out of sync.
 * @param {number} days
 * @param {number} travellers
 * @returns {number}
 */
function afterSunBottles(days, travellers) {
  return Math.max(1, ceil((days * travellers * 10) / 100));
}

/**
 * Effective number of days a wardrobe must cover before laundry resets it.
 * @param {number} days
 * @param {number} laundryEveryDays 0 or less means no laundry on the trip
 * @returns {number}
 */
export function wearCycleDays(days, laundryEveryDays) {
  if (!isNum(laundryEveryDays) || laundryEveryDays <= 0) return days;
  return Math.min(days, laundryEveryDays + LAUNDRY_TURNAROUND_DAYS);
}

/**
 * Sunscreen required for the whole trip, in millilitres.
 * @param {{ days:number, beachHoursPerDay:number, travellers:number, swimming:boolean }} input
 * @returns {{ applicationsPerDay:number, dosePerApplicationMl:number, totalMl:number }}
 */
export function sunscreenNeed({ days, beachHoursPerDay, travellers, swimming }) {
  const applicationsPerDay = Math.max(
    1,
    ceil(beachHoursPerDay / SUNSCREEN_REAPPLY_HOURS),
  );
  const dosePerApplicationMl = swimming ? SUNSCREEN_ML_FULL_BODY : SUNSCREEN_ML_EXPOSED_ONLY;
  return {
    applicationsPerDay,
    dosePerApplicationMl,
    totalMl: days * applicationsPerDay * dosePerApplicationMl * travellers,
  };
}

/** Catalogue. `qty(ctx)` returns the count for one household; `perTraveller`
 * items are multiplied by the number of travellers afterwards. */
const CATALOG = [
  // --- Clothing -----------------------------------------------------------
  {
    id: "tops",
    group: "Clothing",
    name: "T-shirts / light tops",
    gramsEach: 150,
    perTraveller: true,
    qty: (c) => ceil(c.wearDays / (c.hot ? 1 : 2)) + 1,
    note: (c) => (c.hot ? "One wear each above 28 °C, plus one spare" : "Two wears each, plus one spare"),
  },
  {
    id: "shorts",
    group: "Clothing",
    name: "Shorts / light skirts",
    gramsEach: 220,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.wearDays / 2), 2, 5),
    note: () => "Two wears each between washes",
  },
  {
    id: "underwear",
    group: "Clothing",
    name: "Underwear",
    gramsEach: 40,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
    note: () => "One per day plus one spare",
  },
  {
    id: "socks",
    group: "Clothing",
    name: "Socks",
    gramsEach: 50,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.wearDays / 3), 2, 6),
    note: () => "Sandals most days, so far fewer than a city trip",
  },
  {
    id: "evening-outfit",
    group: "Clothing",
    name: "Evening / dinner outfit",
    gramsEach: 320,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.days / 3), 1, 3),
    note: () => "One per three nights, re-worn between",
  },
  {
    id: "cover-up",
    group: "Clothing",
    name: "Cover-up or linen shirt",
    gramsEach: 250,
    perTraveller: true,
    qty: (c) => (c.days > 7 ? 2 : 1),
    note: () => "Goes over swimwear for lunch and for the walk back",
  },
  {
    id: "sleepwear",
    group: "Clothing",
    name: "Sleepwear",
    gramsEach: 240,
    perTraveller: true,
    qty: (c) => (c.wearDays > 5 ? 2 : 1),
  },
  {
    id: "sun-hat",
    group: "Clothing",
    name: "Wide-brim sun hat",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
    note: () => "A brim of 7 cm or more shades the ears and neck, not just the face",
  },
  {
    id: "sunglasses",
    group: "Clothing",
    name: "Sunglasses (UV400)",
    gramsEach: 30,
    perTraveller: true,
    qty: () => 1,
    note: () => "UV400 blocks both UVA and UVB; a dark tint without it is worse than none",
  },

  // --- Beach & water ------------------------------------------------------
  {
    id: "swimwear",
    group: "Beach & water",
    name: "Swimwear",
    gramsEach: 150,
    perTraveller: true,
    qty: (c) => (c.days === 1 ? (c.swimsPerDay >= 2 ? 2 : 1) : clamp(1 + c.swimsPerDay, 2, 4)),
    note: (c) =>
      c.days === 1 && c.swimsPerDay < 2
        ? "One is enough for a single short trip"
        : "At least two so one can dry while the other is worn",
  },
  {
    id: "rash-guard",
    group: "Beach & water",
    name: "UPF 50+ rash guard",
    gramsEach: 180,
    perTraveller: true,
    include: (c) => c.beachHoursPerDay >= 3,
    qty: () => 1,
    note: () => "Covers the back and shoulders, where reapplication is hardest",
  },
  {
    id: "beach-towel",
    group: "Beach & water",
    name: "Quick-dry beach towel",
    gramsEach: 300,
    perTraveller: true,
    include: (c) => !c.resortTowels,
    qty: () => 1,
  },
  {
    id: "flip-flops",
    group: "Beach & water",
    name: "Flip-flops or slides",
    gramsEach: 300,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "water-shoes",
    group: "Beach & water",
    name: "Water shoes",
    gramsEach: 350,
    perTraveller: true,
    include: (c) => c.rockyShore,
    qty: () => 1,
    note: () => "Rock, coral and sea urchins are the usual reason a beach day ends early",
  },
  {
    id: "dry-bag",
    group: "Beach & water",
    name: "Dry bag / waterproof phone pouch",
    gramsEach: 90,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 4),
  },
  {
    id: "beach-bag",
    group: "Beach & water",
    name: "Sand-shedding beach bag",
    gramsEach: 350,
    perTraveller: false,
    qty: () => 1,
  },
  {
    id: "snorkel",
    group: "Beach & water",
    name: "Mask and snorkel",
    gramsEach: 400,
    perTraveller: true,
    include: (c) => c.snorkelling,
    qty: () => 1,
  },

  // --- Sun & toiletries ---------------------------------------------------
  {
    id: "sunscreen",
    group: "Sun & toiletries",
    name: "Broad-spectrum sunscreen SPF 50+",
    unit: "bottle",
    gramsEach: 0, // weight comes from the computed millilitres instead
    perTraveller: false,
    qty: (c) => ceil(c.sunscreenMl / c.sunscreenBottleMl),
    note: (c) =>
      `${c.sunscreenMl} ml in total — ${c.sunscreenApplicationsPerDay} applications a day at ${c.sunscreenDoseMl} ml each`,
    grams: (c) => ceil(c.sunscreenMl * 1.05), // sunscreen is a little denser than water
  },
  {
    id: "lip-balm",
    group: "Sun & toiletries",
    name: "Lip balm SPF 30+",
    gramsEach: 12,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "after-sun",
    group: "Sun & toiletries",
    name: "After-sun aloe gel (100 ml)",
    gramsEach: 115,
    perTraveller: false,
    qty: (c) => afterSunBottles(c.days, c.travellers),
    note: () => "About 10 ml a person a day to soothe sun-warmed skin",
  },
  {
    id: "repellent",
    group: "Sun & toiletries",
    name: "Insect repellent (100 ml)",
    gramsEach: 115,
    perTraveller: false,
    include: (c) => c.mosquitoes,
    qty: (c) => Math.max(1, ceil((c.days * c.travellers * 10) / 100)),
    note: () => "About 10 ml a person a day for exposed skin at dusk",
  },
  {
    id: "wash-kit",
    group: "Sun & toiletries",
    name: "Wash kit (shampoo, soap, brush, paste)",
    gramsEach: 600,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 5),
  },

  // --- Health & safety ----------------------------------------------------
  {
    id: "ors",
    group: "Health & safety",
    name: "Oral rehydration salt sachets",
    gramsEach: 25,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.days / 2), 2, 14),
    note: () => "Heat plus salt water dehydrates faster than people expect",
  },
  {
    id: "first-aid",
    group: "Health & safety",
    name: "Small first-aid kit (plasters, antiseptic, painkillers)",
    gramsEach: 250,
    perTraveller: false,
    qty: () => 1,
  },
  {
    id: "motion-sickness",
    group: "Health & safety",
    name: "Motion-sickness tablets",
    gramsEach: 20,
    perTraveller: false,
    include: (c) => c.boatTrips,
    qty: () => 1,
  },

  // --- Tech & documents ---------------------------------------------------
  {
    id: "charger",
    group: "Tech & documents",
    name: "Phone charger and cable",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "power-bank",
    group: "Tech & documents",
    name: "Power bank (cabin bag only, never checked)",
    gramsEach: 230,
    perTraveller: false,
    qty: () => 1,
    note: () => "Lithium power banks must travel in the cabin under airline dangerous-goods rules",
  },
  {
    id: "adapter",
    group: "Tech & documents",
    name: "Travel plug adapter",
    gramsEach: 90,
    perTraveller: false,
    include: (c) => c.international,
    qty: () => 1,
  },
  {
    id: "documents",
    group: "Tech & documents",
    name: "ID, tickets, insurance and card copies",
    gramsEach: 60,
    perTraveller: true,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "Clothing",
  "Beach & water",
  "Sun & toiletries",
  "Health & safety",
  "Tech & documents",
];

/**
 * Build the packing list.
 *
 * @param {object} input
 * @param {number} input.days trip length in nights on the coast
 * @param {number} input.travellers adults sharing one set of shared items
 * @param {number} input.laundryEveryDays 0 for no laundry
 * @param {number} input.highTempC daytime high in Celsius
 * @param {number} input.beachHoursPerDay hours of direct sun exposure
 * @param {number} input.swimsPerDay swim or shower-and-change cycles per day
 * @param {boolean} input.resortTowels hotel supplies beach towels
 * @param {boolean} input.rockyShore
 * @param {boolean} input.snorkelling
 * @param {boolean} input.boatTrips
 * @param {boolean} input.mosquitoes
 * @param {boolean} input.international
 * @param {"cabin"|"domestic"|"international"} input.bagPlan
 * @returns {object | { error: string }}
 */
export function buildBeachPackingList(input) {
  const {
    days,
    travellers,
    laundryEveryDays = 0,
    highTempC = 32,
    beachHoursPerDay = 4,
    swimsPerDay = 2,
    resortTowels = false,
    rockyShore = false,
    snorkelling = false,
    boatTrips = false,
    mosquitoes = true,
    international = false,
    bagPlan = "domestic",
  } = input || {};

  if (!isNum(days)) return { error: "Enter the trip length in days as a number." };
  // Validate against the ROUNDED value: the tool itself rounds days/travellers
  // to whole numbers below (wholeDays/people), so a fractional input one tick
  // above the cap (e.g. 90.4) must be judged by what it rounds to (90, valid),
  // not by the raw float, or the tool rejects inputs it would otherwise accept
  // happily once typed as whole numbers.
  const wholeDays = Math.round(days);
  if (wholeDays < MIN_DAYS) return { error: "A trip has to be at least one day long." };
  if (wholeDays > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };
  if (!isNum(travellers)) return { error: "Enter at least one traveller." };
  const people = Math.round(travellers);
  if (people < 1) return { error: "Enter at least one traveller." };
  if (people > MAX_TRAVELLERS) {
    return { error: `This list is sized for up to ${MAX_TRAVELLERS} travellers.` };
  }
  if (!isNum(highTempC) || highTempC < -20 || highTempC > 55) {
    return { error: "Enter a daytime high between -20 °C and 55 °C." };
  }
  if (!isNum(beachHoursPerDay) || beachHoursPerDay < 0 || beachHoursPerDay > 14) {
    return { error: "Enter between 0 and 14 hours a day in the sun." };
  }
  if (!isNum(swimsPerDay) || swimsPerDay < 0 || swimsPerDay > 6) {
    return { error: "Enter between 0 and 6 swims a day." };
  }
  if (!isNum(laundryEveryDays) || laundryEveryDays < 0 || laundryEveryDays > MAX_DAYS) {
    return { error: "Enter how many days between washes, or 0 for no laundry." };
  }

  const wholeLaundryEveryDays = Math.round(laundryEveryDays);
  const wearDays = wearCycleDays(wholeDays, wholeLaundryEveryDays);

  const sun = sunscreenNeed({
    days: wholeDays,
    beachHoursPerDay,
    travellers: people,
    swimming: swimsPerDay > 0,
  });

  const cabinOnly = bagPlan === "cabin";
  const sunscreenBottleMl = cabinOnly ? LIQUID_CONTAINER_MAX_ML : 200;

  const ctx = {
    days: wholeDays,
    travellers: people,
    wearDays,
    hot: highTempC >= HOT_DAY_C,
    highTempC,
    beachHoursPerDay,
    swimsPerDay,
    resortTowels,
    rockyShore,
    snorkelling,
    boatTrips,
    mosquitoes,
    international,
    cabinOnly,
    sunscreenMl: sun.totalMl,
    sunscreenDoseMl: sun.dosePerApplicationMl,
    sunscreenApplicationsPerDay: sun.applicationsPerDay,
    sunscreenBottleMl,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let totalItems = 0;
  let totalGrams = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const base = Math.max(0, Math.round(item.qty(ctx)));
    if (base === 0) continue;
    const qty = item.perTraveller ? base * people : base;
    const grams = item.grams ? item.grams(ctx) : item.gramsEach * qty;
    totalItems += qty;
    totalGrams += grams;
    byGroup.get(item.group).push({
      id: item.id,
      name: item.name,
      qty,
      unit: item.unit || "",
      grams,
      note: item.note ? item.note(ctx) : "",
    });
  }

  const groups = GROUP_ORDER.map((name) => ({ name, items: byGroup.get(name) })).filter(
    (group) => group.items.length > 0,
  );

  const allowanceKg = cabinOnly
    ? CABIN_ALLOWANCE_KG
    : bagPlan === "international"
      ? CHECKED_ALLOWANCE_KG.international
      : CHECKED_ALLOWANCE_KG.domestic;
  const totalKg = Math.round((totalGrams / 1000) * 10) / 10;
  const allowanceForParty = allowanceKg * people;

  // Cabin liquid audit: sunscreen plus after-sun plus repellent, all decanted.
  const afterSunMl = 100 * afterSunBottles(wholeDays, people);
  const repellentMl = mosquitoes ? 100 * Math.max(1, ceil((wholeDays * people * 10) / 100)) : 0;
  const liquidsMl = sun.totalMl + afterSunMl + repellentMl;
  const cabinLiquidCapacityMl = LIQUID_BAG_MAX_ML * people;

  return {
    groups,
    totalItems,
    totalGrams,
    totalKg,
    wearDays,
    days: wholeDays,
    travellers: people,
    sunscreenMl: sun.totalMl,
    sunscreenApplicationsPerDay: sun.applicationsPerDay,
    sunscreenDoseMl: sun.dosePerApplicationMl,
    sunscreenBottles: ceil(sun.totalMl / sunscreenBottleMl),
    sunscreenBottleMl,
    liquidsMl,
    cabinLiquidCapacityMl,
    liquidsFitCabin: liquidsMl <= cabinLiquidCapacityMl,
    bagPlan,
    allowanceKg,
    allowanceForParty,
    withinAllowance: totalGrams / 1000 <= allowanceForParty,
    // `|| 0` normalizes JS negative zero (e.g. rounding -0.04 to one decimal
    // place) back to +0. Without it, Object.is(spareKg, -0) is true, and
    // `-0 >= 0` is also true in JS — which would make a party a hair over
    // its allowance display as "-0 kg under" right next to the over-allowance
    // warning banner, a direct on-screen contradiction.
    spareKg: Math.round((allowanceForParty - totalGrams / 1000) * 10) / 10 || 0,
  };
}
