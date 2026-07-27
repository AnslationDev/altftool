/**
 * Thailand dress code planner.
 *
 * Two independent rule sets are combined:
 *
 * 1. VENUE RULES — what a place actually refuses entry for. These are the published
 *    admission conditions of the sites themselves (Bureau of the Royal Household for
 *    the Grand Palace, the standing wat convention of covered shoulders and knees plus
 *    shoes off in the ordination hall, and Thailand's public-decency law for beaches).
 *    Each rule below carries the requirement flags it triggers.
 *
 * 2. CLIMATE — monthly normals for Bangkok used to decide fabric weight, how many tops
 *    a day, and whether rain gear earns its space. Figures are the Thai Meteorological
 *    Department 30-year normals for Bangkok Metropolis, rounded to one decimal.
 *
 * The packing maths is a laundry-cycle model: you never pack for the whole trip, you
 * pack for one wash cycle plus the days a garment takes to dry.
 */

/* ------------------------------------------------------------------ climate */

/**
 * Bangkok monthly normals (Thai Meteorological Department 30-year normals).
 * avgHighC / avgLowC in degrees Celsius, rainMm is mean monthly rainfall,
 * rainyDays is the mean number of days with measurable rain.
 */
export const CLIMATE = [
  { month: "January", avgHighC: 32.5, avgLowC: 22.6, rainMm: 13, rainyDays: 1 },
  { month: "February", avgHighC: 33.4, avgLowC: 24.4, rainMm: 20, rainyDays: 2 },
  { month: "March", avgHighC: 34.4, avgLowC: 25.9, rainMm: 43, rainyDays: 4 },
  { month: "April", avgHighC: 35.1, avgLowC: 26.9, rainMm: 88, rainyDays: 7 },
  { month: "May", avgHighC: 34.0, avgLowC: 26.3, rainMm: 194, rainyDays: 15 },
  { month: "June", avgHighC: 33.3, avgLowC: 26.1, rainMm: 166, rainyDays: 16 },
  { month: "July", avgHighC: 33.0, avgLowC: 25.8, rainMm: 172, rainyDays: 17 },
  { month: "August", avgHighC: 32.7, avgLowC: 25.6, rainMm: 208, rainyDays: 19 },
  { month: "September", avgHighC: 32.5, avgLowC: 25.3, rainMm: 345, rainyDays: 21 },
  { month: "October", avgHighC: 32.3, avgLowC: 24.9, rainMm: 285, rainyDays: 17 },
  { month: "November", avgHighC: 32.1, avgLowC: 23.6, rainMm: 51, rainyDays: 6 },
  { month: "December", avgHighC: 31.6, avgLowC: 21.6, rainMm: 8, rainyDays: 1 },
];

/** Thailand is humid year round, so washed cotton needs a second night to dry. */
export const DRY_BUFFER_DAYS = 2;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 30;
/** Below this mean daily minimum an evening layer is worth its weight. */
export const COOL_NIGHT_THRESHOLD_C = 18;
/** Monthly rainfall at or above this makes a packable rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_MM = 100;
/** Or this many wet days in the month, whichever triggers first. */
export const RAIN_GEAR_THRESHOLD_DAYS = 10;

/** Tops worn per day in heat vs. in mild weather. */
export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
/** Days a pair of bottoms is re-worn before washing. */
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/** Typical cabin-baggage allowance on Thai domestic and regional carriers, in kg. */
export const CABIN_BAG_LIMIT_KG = 7;

/* ------------------------------------------------------------------ venues */

/**
 * Requirement flags a venue can raise:
 *  shoulders   - upper arms must be covered
 *  knees       - hem must fall below the knee
 *  fullLength  - ankle-length trousers or skirt, not merely below the knee
 *  closedShoes - covered-toe footwear expected
 *  shoesOff    - shoes come off at the door
 *  headCover   - hair covered (women)
 *  sarong      - a sarong or wrap solves the cover-up on the spot
 *  smart       - collared shirt / no shorts / no flip-flops evening code
 *  noSheer     - see-through, ripped or clinging garments refused
 *  layer       - a light layer for heavy indoor air-conditioning
 */
export const VENUES = [
  {
    id: "grand-palace",
    label: "Grand Palace & Wat Phra Kaew",
    flags: ["shoulders", "knees", "fullLength", "noSheer", "closedShoes", "shoesOff"],
    rule:
      "The strictest code in the country: shoulders covered, ankle-length trousers or skirt, nothing see-through, torn or skin-tight. Sleeveless tops, shorts, cropped tops and leggings worn as outerwear are turned away at the gate.",
    fix: "Wraps and trousers can be borrowed at the Wat Phra Kaew entrance against a refundable deposit, but the queue is long — arrive dressed.",
  },
  {
    id: "wat",
    label: "Everyday temples (Wat Pho, Doi Suthep, local wats)",
    flags: ["shoulders", "knees", "shoesOff", "sarong"],
    rule:
      "Shoulders and knees covered, shoes off before stepping into the ordination or image hall, and feet never pointed at a Buddha image. Women do not hand anything directly to a monk.",
    fix: "A light sarong in the day bag covers legs or shoulders in seconds and doubles as a beach towel.",
  },
  {
    id: "mosque",
    label: "Mosques (Bangkok, Krabi, the deep South)",
    flags: ["shoulders", "knees", "fullLength", "headCover", "shoesOff"],
    rule:
      "Long sleeves, ankle-length clothing and a headscarf for women; shoes off at the door. In Pattani, Yala and Narathiwat the everyday street norm is more covered than in Bangkok.",
    fix: "Most mosques used to visitors keep loan robes and scarves by the entrance.",
  },
  {
    id: "royal",
    label: "Royal sites, palaces and state occasions",
    flags: ["shoulders", "knees", "fullLength", "closedShoes", "noSheer"],
    rule:
      "Subdued colours, nothing casual, and no clothing or tattoo that treats a royal portrait or a Buddha image as decoration — Thailand takes both seriously and lese-majeste is a criminal offence.",
    fix: "Plain dark trousers and a plain shirt read as respectful anywhere in this bracket.",
  },
  {
    id: "beach",
    label: "Beaches and islands",
    flags: [],
    rule:
      "Swimwear belongs on the sand. Topless and nude sunbathing are illegal in Thailand, and walking into a shop, temple or restaurant in a bikini or bare chest causes real offence.",
    fix: "A cover-up or sarong pulled on for the walk back solves it.",
  },
  {
    id: "rooftop",
    label: "Rooftop bars and fine dining, Bangkok",
    flags: ["smart", "closedShoes"],
    rule:
      "Smart casual is enforced at the door: no shorts, no sleeveless tops for men, no flip-flops or sports sandals, no beachwear. Some rooftops also refuse sportswear and backpacks.",
    fix: "One pair of light chinos, one collared shirt and one pair of closed shoes covers every evening on the trip.",
  },
  {
    id: "mall",
    label: "Malls, BTS/MRT and cinemas",
    flags: ["layer"],
    rule:
      "No dress code, but the air-conditioning is set hard — cinemas and mall food halls routinely feel 10°C colder than the street.",
    fix: "A packable long-sleeve layer lives in the day bag all trip.",
  },
  {
    id: "market",
    label: "Night markets and street food",
    flags: ["closedShoes"],
    rule:
      "No code at all, but pavements are uneven, wet and shared with scooters. Open-toe sandals take a beating.",
    fix: "Quick-dry trainers or covered sandals you do not mind soaking.",
  },
];

/* ------------------------------------------------------------------ garments */

/**
 * Approximate garment mass in grams, used to estimate whether the pack clears a
 * 7 kg cabin allowance. Values are mid-range adult sizes in travel fabrics.
 */
export const GARMENT_GRAMS = {
  "Short-sleeve top": 150,
  "Long-sleeve shirt (temple-legal)": 220,
  "Lightweight full-length trousers": 330,
  "Shorts or short skirt": 240,
  "Below-knee skirt or dress": 280,
  Underwear: 40,
  Socks: 50,
  "Sarong / pha khao ma": 180,
  "Scarf or light shawl": 120,
  "Packable rain shell": 250,
  "Light evening layer": 300,
  "Collared shirt or smart top": 250,
  "Smart trousers": 380,
  "Closed shoes": 700,
  "Sandals or flip-flops": 330,
  Swimwear: 120,
  "Sun hat": 90,
};

const HAS = (list, flag) => list.includes(flag);

const toInt = (value) => {
  /* Number('') and Number(null) are both 0, which would silently read as a valid
     month or a zero-day trip, so blank input is rejected before coercion. */
  if (value === null || value === undefined || String(value).trim() === '') return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

/* ------------------------------------------------------------------ planner */

/**
 * Build a Thailand packing and dress-code plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex     0 = January … 11 = December
 * @param {number} input.tripDays       nights on the ground, 1–90
 * @param {string[]} input.venueIds     ids from VENUES the traveller expects to visit
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @param {boolean} input.needsHeadCoverOption  traveller will be asked to cover hair
 * @returns {object} plan, or { error } for unusable input
 */
export function planWardrobe({
  monthIndex,
  tripDays,
  venueIds = [],
  laundryEveryDays,
  needsHeadCoverOption = false,
} = {}) {
  const m = toInt(monthIndex);
  const days = toInt(tripDays);
  const laundry = toInt(laundryEveryDays);

  if (!Number.isFinite(m) || m < 0 || m > 11) {
    return { error: "Pick a month of travel." };
  }
  if (!Number.isFinite(days) || days < 1) {
    return { error: "Trip length must be at least 1 day." };
  }
  if (days > 90) {
    return { error: "Plan trips of 90 days or fewer — a visa run resets the packing list anyway." };
  }
  if (!Number.isFinite(laundry) || laundry < 1) {
    return { error: "Laundry interval must be at least 1 day." };
  }
  if (laundry > 30) {
    return { error: "Laundry interval must be 30 days or fewer." };
  }

  const climate = CLIMATE[m];
  const selected = VENUES.filter((v) => venueIds.includes(v.id));
  const flags = selected.flatMap((v) => v.flags);

  const hot = climate.avgHighC >= HOT_DAY_THRESHOLD_C;
  const coolNights = climate.avgLowC < COOL_NIGHT_THRESHOLD_C;
  const wet =
    climate.rainMm >= RAIN_GEAR_THRESHOLD_MM || climate.rainyDays >= RAIN_GEAR_THRESHOLD_DAYS;

  /* Laundry-cycle model: pack for one cycle plus drying time, capped at the trip. */
  const cycleDays = Math.min(days, laundry >= days ? days : laundry + DRY_BUFFER_DAYS);

  const topsPerDay = hot ? TOPS_PER_DAY_HOT : TOPS_PER_DAY_MILD;
  const bottomRewear = hot ? BOTTOM_REWEAR_DAYS_HOT : BOTTOM_REWEAR_DAYS_MILD;

  const needsShoulders = HAS(flags, "shoulders");
  const needsKnees = HAS(flags, "knees");
  const needsFullLength = HAS(flags, "fullLength");
  const needsClosed = HAS(flags, "closedShoes");
  const needsHead = HAS(flags, "headCover") && needsHeadCoverOption;
  const needsSarong = HAS(flags, "sarong") || needsShoulders || needsKnees;
  const needsSmart = HAS(flags, "smart");
  const needsLayer = HAS(flags, "layer") || coolNights;
  const shoesOff = HAS(flags, "shoesOff");

  const totalTops = Math.ceil(cycleDays * topsPerDay);
  /* At least a third of the tops must be temple-legal when covered venues are on the list. */
  const modestTops = needsShoulders ? Math.max(2, Math.ceil(totalTops / 3)) : 0;
  const casualTops = Math.max(0, totalTops - modestTops);

  const totalBottoms = Math.max(2, Math.ceil(cycleDays / bottomRewear));
  const longBottoms = needsFullLength
    ? Math.max(2, Math.ceil(totalBottoms / 2))
    : needsKnees
      ? 1
      : 0;
  const shortBottoms = Math.max(0, totalBottoms - longBottoms);

  const packing = [];
  const add = (item, qty, why) => {
    if (qty > 0) packing.push({ item, qty, why, grams: (GARMENT_GRAMS[item] || 0) * qty });
  };

  add("Short-sleeve top", casualTops, `${topsPerDay} tops a day over a ${cycleDays}-day wash cycle`);
  add(
    "Long-sleeve shirt (temple-legal)",
    modestTops,
    "Shoulders must be covered at the sites you picked",
  );
  add(
    "Lightweight full-length trousers",
    longBottoms,
    needsFullLength
      ? "Ankle length is required at the Grand Palace and comparable sites"
      : "Below-knee cover for temples",
  );
  add("Shorts or short skirt", shortBottoms, "Everyday wear outside religious sites");
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add(
    "Socks",
    needsClosed || coolNights ? cycleDays + 1 : Math.ceil(cycleDays / 2),
    needsClosed ? "Closed shoes are expected at some venues" : "Sandal weather most of the time",
  );
  add(
    "Sarong / pha khao ma",
    needsSarong ? 1 : 0,
    "Instant legs-or-shoulders cover-up, also a towel and a bus blanket",
  );
  add("Scarf or light shawl", needsHead ? 1 : 0, "Head covering for mosque visits");
  add(
    "Packable rain shell",
    wet ? 1 : 0,
    `${climate.month} averages ${climate.rainMm} mm over ${climate.rainyDays} wet days`,
  );
  add(
    "Light evening layer",
    needsLayer ? 1 : 0,
    coolNights
      ? `Nights average ${climate.avgLowC}°C`
      : "Mall, cinema and long-distance bus air-conditioning",
  );
  add("Collared shirt or smart top", needsSmart ? 1 : 0, "Rooftop and fine-dining door policy");
  add("Smart trousers", needsSmart ? 1 : 0, "No shorts after dark at smart venues");
  add("Closed shoes", needsClosed ? 1 : 0, "Grand Palace, smart venues and wet market pavements");
  add("Sandals or flip-flops", 1, shoesOff ? "Slip-on shoes save time at every temple door" : "Everyday heat");
  add("Swimwear", 1, "Beach and hotel pool only");
  add("Sun hat", 1, `Mean daily maximum ${climate.avgHighC}°C`);

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (needsShoulders) requirements.push("Shoulders covered — no vest tops, no spaghetti straps");
  if (needsFullLength) requirements.push("Ankle-length trousers or skirt at the strictest sites");
  else if (needsKnees) requirements.push("Hem below the knee");
  if (HAS(flags, "noSheer")) requirements.push("Nothing see-through, ripped or skin-tight");
  if (needsClosed) requirements.push("Covered-toe shoes");
  if (shoesOff) requirements.push("Shoes come off at the door — slip-ons save time");
  if (needsHead) requirements.push("Hair covered inside mosques");
  if (needsSmart) requirements.push("Smart casual after dark: no shorts, no flip-flops");
  if (needsLayer) requirements.push("A layer for indoor air-conditioning");

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg cabin allowance most Thai domestic carriers enforce. Laundry in Thailand is cheap; shortening the wash cycle cuts the load fastest.`,
    );
  }
  if (wet) {
    warnings.push(
      `${climate.month} is a wet month in Bangkok (${climate.rainMm} mm, ${climate.rainyDays} wet days). Quick-dry synthetics beat cotton, and streets flood ankle-deep after a downpour.`,
    );
  }
  if (climate.avgHighC >= 34) {
    warnings.push(
      `${climate.month} is peak heat (mean maximum ${climate.avgHighC}°C). Loose long sleeves are cooler in direct sun than bare arms and solve the temple rule at the same time.`,
    );
  }

  return {
    climate,
    cycleDays,
    hot,
    wet,
    coolNights,
    topsPerDay,
    packing,
    totalItems,
    totalKg,
    requirements,
    warnings,
    venues: selected.map((v) => ({ id: v.id, label: v.label, rule: v.rule, fix: v.fix })),
  };
}

export default planWardrobe;
