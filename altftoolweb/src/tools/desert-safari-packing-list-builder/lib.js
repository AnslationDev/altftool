/**
 * Desert safari packing list engine.
 *
 * Deserts break two assumptions people pack on: that a hot place stays hot,
 * and that water can be topped up along the way. Three rules drive the list.
 *
 * 1. DIURNAL SWING — dry air and clear skies let the ground radiate heat away
 *    after sunset, so desert night minima commonly sit 15-25 °C below the day
 *    maximum. nightLowC = dayHighC - swingC, and the layer set is chosen from
 *    that low, not from the daytime figure.
 *
 * 2. WATER — fluid loss in heat is driven by hours of exposure, not by thirst.
 *    Heat-stress guidance from occupational-safety bodies is roughly a cup
 *    (about 240 ml) every 15-20 minutes while active in heat, which is
 *    0.7-1 litre an hour, on top of ordinary daily intake. This tool uses
 *    litresPerDay = BASE + hoursOutdoors x PER_HOUR, capped at a safety ceiling
 *    because drinking far beyond sweat losses risks hyponatraemia.
 *    Water is also the heaviest thing you carry: 1 litre weighs 1 kg.
 *
 * 3. SLEEPING BAG RATING — under ISO 23537 a bag's "comfort" rating is the
 *    temperature at which an average adult sleeps without feeling cold. Pick a
 *    bag whose comfort rating is at or below the expected night low, with a
 *    margin, rather than one rated exactly at it.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Typical clear-sky desert day-to-night temperature drop, in Celsius. */
export const DEFAULT_DIURNAL_SWING_C = 18;

/** Baseline daily fluid intake in the shade, litres per adult. */
export const WATER_BASE_L_PER_DAY = 1.5;

/** Additional litres per hour of activity in desert heat. */
export const WATER_L_PER_HOUR_HEAT = 0.75;

/** Safety ceiling on planned intake, litres per person per day. Sustained
 * intake far above sweat losses dilutes blood sodium (hyponatraemia). */
export const WATER_MAX_L_PER_DAY = 12;

/** Water weighs 1 kg per litre — the single biggest line in a desert load. */
export const WATER_KG_PER_L = 1;

/** One electrolyte or ORS sachet per this many hours of heavy sweating. */
export const HOURS_PER_ELECTROLYTE_SACHET = 4;

/** Sunscreen dose at 2 mg/cm²: about 30 ml for a whole adult body, and about
 * half that when only face, neck, hands and forearms are exposed. */
export const SUNSCREEN_ML_EXPOSED = 15;
export const SUNSCREEN_REAPPLY_HOURS = 2;

/** Night-low thresholds that trigger extra layers, in Celsius. */
export const NIGHT_MILD_C = 15;
export const NIGHT_COLD_C = 5;

/** Choose a bag rated this many degrees below the expected low. */
export const SLEEPING_BAG_MARGIN_C = 5;

/** Days between putting clothes in the wash and having them dry. */
export const LAUNDRY_TURNAROUND_DAYS = 1;

export const MIN_DAYS = 1;
export const MAX_DAYS = 60;
export const MAX_TRAVELLERS = 12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round1 = (value) => Math.round(value * 10) / 10;

/** @returns {number} days of clothing a wardrobe must cover */
export function wearCycleDays(days, laundryEveryDays) {
  if (!isNum(laundryEveryDays) || laundryEveryDays <= 0) return days;
  return Math.min(days, laundryEveryDays + LAUNDRY_TURNAROUND_DAYS);
}

/**
 * Drinking water for the trip.
 * @param {{days:number, travellers:number, hoursOutdoorsPerDay:number}} input
 * @returns {{ litresPerPersonPerDay:number, litresTotal:number, weightKg:number, cappedAtCeiling:boolean }}
 */
export function waterPlan({ days, travellers, hoursOutdoorsPerDay }) {
  const raw = WATER_BASE_L_PER_DAY + hoursOutdoorsPerDay * WATER_L_PER_HOUR_HEAT;
  const perDay = Math.min(raw, WATER_MAX_L_PER_DAY);
  const litresTotal = round1(perDay * days * travellers);
  return {
    litresPerPersonPerDay: round1(perDay),
    litresTotal,
    weightKg: round1(litresTotal * WATER_KG_PER_L),
    cappedAtCeiling: raw > WATER_MAX_L_PER_DAY,
  };
}

/**
 * How cold it gets after dark, and what that means for layers.
 * @returns {{ nightLowC:number, layer:"warm"|"cool"|"cold", sleepingBagComfortC:number }}
 */
export function nightPlan({ dayHighC, swingC }) {
  const nightLowC = round1(dayHighC - swingC);
  const layer = nightLowC < NIGHT_COLD_C ? "cold" : nightLowC < NIGHT_MILD_C ? "cool" : "warm";
  return {
    nightLowC,
    layer,
    sleepingBagComfortC: round1(nightLowC - SLEEPING_BAG_MARGIN_C),
  };
}

const CATALOG = [
  // --- Clothing & layers --------------------------------------------------
  {
    id: "long-sleeve",
    group: "Clothing & layers",
    name: "Loose long-sleeve shirts (cotton or linen)",
    gramsEach: 200,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
    note: () => "Covered skin stays cooler than bare skin in dry heat and needs no sunscreen",
  },
  {
    id: "trousers",
    group: "Clothing & layers",
    name: "Loose full-length trousers",
    gramsEach: 300,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.wearDays / 3), 2, 4),
    note: () => "Full length protects against sun, sand blast and thorny scrub",
  },
  {
    id: "underwear",
    group: "Clothing & layers",
    name: "Underwear",
    gramsEach: 40,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
  },
  {
    id: "socks",
    group: "Clothing & layers",
    name: "Socks (thicker than you think)",
    gramsEach: 60,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
    note: () => "Sand works into everything; a clean pair each day prevents blisters",
  },
  {
    id: "mid-layer",
    group: "Clothing & layers",
    name: "Fleece or mid-layer",
    gramsEach: 400,
    perTraveller: true,
    include: (c) => c.layer !== "warm",
    qty: () => 1,
    note: (c) => `Night low around ${c.nightLowC} °C`,
  },
  {
    id: "insulated-jacket",
    group: "Clothing & layers",
    name: "Insulated jacket",
    gramsEach: 700,
    perTraveller: true,
    include: (c) => c.layer === "cold",
    qty: () => 1,
    note: (c) => `Nights near ${c.nightLowC} °C need real insulation, not a hoodie`,
  },
  {
    id: "beanie-gloves",
    group: "Clothing & layers",
    name: "Beanie and light gloves",
    gramsEach: 130,
    perTraveller: true,
    include: (c) => c.layer === "cold",
    qty: () => 1,
  },
  {
    id: "sleepwear",
    group: "Clothing & layers",
    name: "Sleepwear",
    gramsEach: 250,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "closed-shoes",
    group: "Clothing & layers",
    name: "Closed walking shoes",
    gramsEach: 800,
    perTraveller: true,
    qty: () => 1,
    note: () => "Open sandals are no use on hot sand or around scorpions after dark",
  },
  {
    id: "camp-sandals",
    group: "Clothing & layers",
    name: "Sandals for camp",
    gramsEach: 350,
    perTraveller: true,
    qty: () => 1,
  },

  // --- Sun & dust ---------------------------------------------------------
  {
    id: "shemagh",
    group: "Sun & dust",
    name: "Shemagh / head-and-neck scarf",
    gramsEach: 180,
    perTraveller: true,
    qty: () => 1,
    note: () => "Shades the neck, and doubles as a dust filter when the wind picks up",
  },
  {
    id: "hat",
    group: "Sun & dust",
    name: "Wide-brim hat with a chin cord",
    gramsEach: 130,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "sunglasses",
    group: "Sun & dust",
    name: "Wraparound UV400 sunglasses",
    gramsEach: 35,
    perTraveller: true,
    qty: () => 1,
    note: () => "Wraparound frames keep blown sand out at the sides",
  },
  {
    id: "goggles",
    group: "Sun & dust",
    name: "Dust goggles",
    gramsEach: 120,
    perTraveller: true,
    include: (c) => c.duneBashing,
    qty: () => 1,
  },
  {
    id: "sunscreen",
    group: "Sun & dust",
    name: "Broad-spectrum sunscreen SPF 50+",
    unit: "bottle",
    perTraveller: false,
    qty: (c) => ceil(c.sunscreenMl / 200),
    grams: (c) => ceil(c.sunscreenMl * 1.05),
    note: (c) =>
      `${c.sunscreenMl} ml in total — ${c.sunscreenApplicationsPerDay} applications a day at ${SUNSCREEN_ML_EXPOSED} ml`,
  },
  {
    id: "lip-balm",
    group: "Sun & dust",
    name: "Lip balm SPF 30+",
    gramsEach: 12,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "moisturiser",
    group: "Sun & dust",
    name: "Heavy moisturiser (100 ml)",
    gramsEach: 115,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 6),
    note: () => "Desert humidity often sits under 20%; skin and nostrils crack quickly",
  },
  {
    id: "gaiters",
    group: "Sun & dust",
    name: "Sand gaiters",
    gramsEach: 200,
    perTraveller: true,
    include: (c) => c.duneWalking,
    qty: () => 1,
  },

  // --- Water & food -------------------------------------------------------
  {
    id: "water",
    group: "Water & food",
    name: "Drinking water",
    unit: "litre",
    perTraveller: false,
    qty: (c) => ceil(c.waterLitresTotal),
    grams: (c) => ceil(c.waterLitresTotal * WATER_KG_PER_L * 1000),
    note: (c) => `${c.waterPerPersonPerDay} litres per person per day at ${c.hoursOutdoorsPerDay} hours outdoors`,
  },
  {
    id: "bottle",
    group: "Water & food",
    name: "Insulated 1 litre bottle",
    gramsEach: 380,
    perTraveller: true,
    qty: () => 1,
    note: () => "Keeps a refill drinkable; plain plastic water hits body temperature within an hour",
  },
  {
    id: "electrolytes",
    group: "Water & food",
    name: "Electrolyte / ORS sachets",
    gramsEach: 25,
    perTraveller: true,
    qty: (c) => c.electrolyteSachetsPerPerson,
    note: () => "Water alone replaces the fluid but not the salt lost in sweat",
  },
  {
    id: "snacks",
    group: "Water & food",
    name: "Dates, nuts and salty snacks (100 g packs)",
    gramsEach: 105,
    perTraveller: true,
    qty: (c) => c.days,
  },

  // --- Camp & night -------------------------------------------------------
  {
    id: "sleeping-bag",
    group: "Camp & night",
    name: "Sleeping bag",
    gramsEach: 1400,
    perTraveller: true,
    include: (c) => c.campNights > 0,
    qty: () => 1,
    note: (c) =>
      `Choose an ISO 23537 comfort rating of about ${c.sleepingBagComfortC} °C or lower`,
  },
  {
    id: "sleeping-mat",
    group: "Camp & night",
    name: "Sleeping mat",
    gramsEach: 600,
    perTraveller: true,
    include: (c) => c.campNights > 0,
    qty: () => 1,
    note: () => "Sand pulls heat out of you faster than air does",
  },
  {
    id: "headtorch",
    group: "Camp & night",
    name: "Head torch with spare batteries",
    gramsEach: 150,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "liner",
    group: "Camp & night",
    name: "Sleeping bag liner or blanket",
    gramsEach: 400,
    perTraveller: true,
    include: (c) => c.campNights > 0 && c.nightLowC < 10,
    qty: () => 1,
    note: () => "A liner adds a few degrees for a fraction of the bulk of a warmer bag",
  },

  // --- Health & safety ----------------------------------------------------
  {
    id: "first-aid",
    group: "Health & safety",
    name: "First-aid kit with blister plasters and tweezers",
    gramsEach: 300,
    perTraveller: false,
    qty: () => 1,
  },
  {
    id: "eye-drops",
    group: "Health & safety",
    name: "Saline eye drops",
    gramsEach: 20,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 6),
  },
  {
    id: "motion-sickness",
    group: "Health & safety",
    name: "Motion-sickness tablets",
    gramsEach: 20,
    perTraveller: false,
    include: (c) => c.duneBashing,
    qty: () => 1,
    note: () => "Dune bashing is closer to a boat crossing than a drive",
  },

  // --- Tech & documents ---------------------------------------------------
  {
    id: "power-bank",
    group: "Tech & documents",
    name: "Power bank (cabin bag only, never checked)",
    gramsEach: 230,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 6),
    note: () => "Heat drains phone batteries fast; keep the bank in shade",
  },
  {
    id: "charger",
    group: "Tech & documents",
    name: "Charger and cable",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "ziplocks",
    group: "Tech & documents",
    name: "Zip-lock bags for cameras and phones",
    gramsEach: 10,
    perTraveller: false,
    qty: () => 6,
    note: () => "Fine sand ruins lenses and charging ports before it ruins anything else",
  },
  {
    id: "documents",
    group: "Tech & documents",
    name: "ID, permits, insurance and emergency contacts",
    gramsEach: 60,
    perTraveller: true,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "Clothing & layers",
  "Sun & dust",
  "Water & food",
  "Camp & night",
  "Health & safety",
  "Tech & documents",
];

/**
 * @param {object} input
 * @returns {object | { error: string }}
 */
export function buildDesertPackingList(input) {
  const {
    days,
    travellers,
    dayHighC = 42,
    swingC = DEFAULT_DIURNAL_SWING_C,
    hoursOutdoorsPerDay = 6,
    campNights = 1,
    laundryEveryDays = 0,
    duneBashing = true,
    duneWalking = true,
  } = input || {};

  if (!isNum(days)) return { error: "Enter the trip length in days as a number." };
  if (days < MIN_DAYS) return { error: "A trip has to be at least one day long." };
  if (days > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };
  if (!isNum(travellers) || travellers < 1) return { error: "Enter at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `This list is sized for up to ${MAX_TRAVELLERS} travellers.` };
  }
  if (!isNum(dayHighC) || dayHighC < 0 || dayHighC > 60) {
    return { error: "Enter a daytime high between 0 °C and 60 °C." };
  }
  if (!isNum(swingC) || swingC < 0 || swingC > 40) {
    return { error: "Enter a day-to-night temperature drop between 0 °C and 40 °C." };
  }
  if (!isNum(hoursOutdoorsPerDay) || hoursOutdoorsPerDay < 0 || hoursOutdoorsPerDay > 16) {
    return { error: "Enter between 0 and 16 hours outdoors a day." };
  }
  if (!isNum(campNights) || campNights < 0 || campNights > days) {
    return { error: "Camp nights cannot be negative or exceed the trip length." };
  }
  if (!isNum(laundryEveryDays) || laundryEveryDays < 0 || laundryEveryDays > MAX_DAYS) {
    return { error: "Enter how many days between washes, or 0 for no laundry." };
  }

  const wholeDays = Math.round(days);
  const people = Math.round(travellers);
  const nights = Math.round(campNights);
  const wearDays = wearCycleDays(wholeDays, laundryEveryDays);
  const water = waterPlan({ days: wholeDays, travellers: people, hoursOutdoorsPerDay });
  const night = nightPlan({ dayHighC, swingC });

  const sunscreenApplicationsPerDay = Math.max(
    1,
    ceil(hoursOutdoorsPerDay / SUNSCREEN_REAPPLY_HOURS),
  );
  const sunscreenMl = wholeDays * sunscreenApplicationsPerDay * SUNSCREEN_ML_EXPOSED * people;
  const electrolyteSachetsPerPerson =
    wholeDays * Math.max(1, ceil(hoursOutdoorsPerDay / HOURS_PER_ELECTROLYTE_SACHET));

  const ctx = {
    days: wholeDays,
    travellers: people,
    wearDays,
    campNights: nights,
    hoursOutdoorsPerDay,
    dayHighC,
    swingC,
    nightLowC: night.nightLowC,
    layer: night.layer,
    sleepingBagComfortC: night.sleepingBagComfortC,
    waterLitresTotal: water.litresTotal,
    waterPerPersonPerDay: water.litresPerPersonPerDay,
    sunscreenMl,
    sunscreenApplicationsPerDay,
    electrolyteSachetsPerPerson,
    duneBashing,
    duneWalking,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let totalItems = 0;
  let totalGrams = 0;
  let gearGrams = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const base = Math.max(0, Math.round(item.qty(ctx)));
    if (base === 0) continue;
    const qty = item.perTraveller ? base * people : base;
    const grams = item.grams ? item.grams(ctx) : item.gramsEach * qty;
    totalItems += qty;
    totalGrams += grams;
    if (item.id !== "water") gearGrams += grams;
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

  return {
    groups,
    totalItems,
    totalGrams,
    totalKg: round1(totalGrams / 1000),
    gearKg: round1(gearGrams / 1000),
    waterLitresTotal: water.litresTotal,
    waterPerPersonPerDay: water.litresPerPersonPerDay,
    waterWeightKg: water.weightKg,
    waterCapped: water.cappedAtCeiling,
    nightLowC: night.nightLowC,
    layer: night.layer,
    sleepingBagComfortC: night.sleepingBagComfortC,
    sunscreenMl,
    sunscreenApplicationsPerDay,
    electrolyteSachetsPerPerson,
    wearDays,
    days: wholeDays,
    travellers: people,
    campNights: nights,
  };
}
