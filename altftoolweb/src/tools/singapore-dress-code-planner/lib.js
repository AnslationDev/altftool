/**
 * Singapore dress code planner.
 *
 * Singapore has no national dress law, but it has three things that decide what you
 * wear: house rules at places of worship (Masjid Sultan, Sri Mariamman, the Buddha
 * Tooth Relic Temple all lend robes or shawls and expect shoulders and knees covered),
 * door policies at Marina Bay and Clarke Quay venues, and a public-decency statute —
 * appearing nude in public, or in a private place where you can be seen from outside,
 * is an offence under the Miscellaneous Offences (Public Order and Nuisance) Act.
 *
 * Against that sits a climate that never changes much: hot, humid, and interrupted by
 * indoor air-conditioning set roughly 8°C below the street. Climate figures below are
 * Meteorological Service Singapore 1991–2020 normals for Changi.
 */

/* ------------------------------------------------------------------ climate */

/**
 * Singapore (Changi) monthly normals, Meteorological Service Singapore 1991–2020.
 * The two monsoon surges — the Northeast monsoon wet phase around November to January
 * and the Southwest monsoon Sumatra squalls mid-year — are what move the rainfall.
 */
export const CLIMATE = [
  { month: "January", avgHighC: 30.4, avgLowC: 23.9, rainMm: 234, rainyDays: 15 },
  { month: "February", avgHighC: 31.7, avgLowC: 24.3, rainMm: 113, rainyDays: 10 },
  { month: "March", avgHighC: 32.2, avgLowC: 24.7, rainMm: 170, rainyDays: 13 },
  { month: "April", avgHighC: 32.3, avgLowC: 25.2, rainMm: 155, rainyDays: 14 },
  { month: "May", avgHighC: 32.2, avgLowC: 25.6, rainMm: 154, rainyDays: 13 },
  { month: "June", avgHighC: 31.9, avgLowC: 25.5, rainMm: 136, rainyDays: 12 },
  { month: "July", avgHighC: 31.4, avgLowC: 25.2, rainMm: 149, rainyDays: 13 },
  { month: "August", avgHighC: 31.3, avgLowC: 25.1, rainMm: 174, rainyDays: 14 },
  { month: "September", avgHighC: 31.5, avgLowC: 24.9, rainMm: 156, rainyDays: 13 },
  { month: "October", avgHighC: 31.7, avgLowC: 24.7, rainMm: 156, rainyDays: 13 },
  { month: "November", avgHighC: 31.0, avgLowC: 24.3, rainMm: 258, rainyDays: 18 },
  { month: "December", avgHighC: 30.3, avgLowC: 23.9, rainMm: 319, rainyDays: 19 },
];

/** Relative humidity sits above 80% most nights, so washing needs two nights to dry. */
export const DRY_BUFFER_DAYS = 2;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 30;
/** Below this mean daily minimum an evening layer is worth its weight outdoors. */
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

/** Economy cabin-baggage allowance on most carriers out of Changi, in kg. */
export const CABIN_BAG_LIMIT_KG = 7;

/* ------------------------------------------------------------------ venues */

/**
 * Requirement flags a venue can raise:
 *  shoulders / knees / fullLength — how much skin must be covered
 *  closedShoes / shoesOff        — footwear expectations
 *  headCover                     — hair covered (women)
 *  sarong                        — a wrap solves it on the spot
 *  smart                         — evening door policy
 *  noSheer                       — see-through or clinging refused
 *  layer                         — a layer for hard indoor air-conditioning
 */
export const VENUES = [
  {
    id: "sultan-mosque",
    label: "Masjid Sultan and other mosques",
    flags: ["shoulders", "knees", "fullLength", "headCover", "shoesOff"],
    rule:
      "Shoulders, arms and legs covered to the ankle, and a headscarf for women inside the prayer hall. Shoes come off at the door and non-Muslim visitors stay out of the main hall during the five daily prayers and Friday congregational prayer.",
    fix: "Masjid Sultan lends full-length robes free at the visitor entrance, so a lapse is fixable at the door.",
  },
  {
    id: "hindu-temple",
    label: "Sri Mariamman and Hindu temples",
    flags: ["shoulders", "knees", "shoesOff", "sarong"],
    rule:
      "Shoulders and knees covered, shoes left on the rack outside, and no stepping over the threshold in footwear. Photography of the inner sanctum is usually not allowed.",
    fix: "A sarong or long scarf in the bag wraps over shorts in seconds.",
  },
  {
    id: "buddhist-temple",
    label: "Buddha Tooth Relic Temple, Kong Meng San",
    flags: ["shoulders", "knees", "sarong"],
    rule:
      "Shoulders and knees covered throughout; sleeveless tops, shorts and short skirts are asked to be covered before entering the halls.",
    fix: "Shawls are lent at the Buddha Tooth Relic Temple entrance.",
  },
  {
    id: "marina-bay",
    label: "Marina Bay clubs, rooftop bars, Clarke Quay",
    flags: ["smart", "closedShoes"],
    rule:
      "Door policies at the Marina Bay Sands and Clarke Quay venues run to smart casual: no slippers or sports sandals, no singlets for men, no beachwear, and closed shoes are the safe read.",
    fix: "One pair of light chinos, one collared shirt and one pair of closed shoes carries every night of the trip.",
  },
  {
    id: "fine-dining",
    label: "Fine dining and hotel restaurants",
    flags: ["smart"],
    rule:
      "Smart casual is the standard: collared shirt and long trousers. Jackets are rarely demanded in the heat, but shorts and flip-flops are refused at the top tier.",
    fix: "The same smart outfit doubles for the bars.",
  },
  {
    id: "mall-mrt",
    label: "Malls, MRT, cinemas and offices",
    flags: ["layer"],
    rule:
      "No dress code, but indoor spaces are commonly cooled to around 24°C, which is roughly 8°C below the street. Cinemas and long MRT rides are the coldest part of a Singapore day.",
    fix: "A packable long-sleeve layer lives in the day bag all trip.",
  },
  {
    id: "gardens",
    label: "Gardens by the Bay conservatories",
    flags: ["layer", "closedShoes"],
    rule:
      "The Cloud Forest and Flower Dome are chilled and misted — the Cloud Forest is deliberately kept in the low twenties Celsius with constant humidity, and its walkway floors are wet.",
    fix: "A layer plus shoes with grip, not smooth-soled sandals.",
  },
  {
    id: "sentosa",
    label: "Sentosa beaches and pools",
    flags: [],
    rule:
      "Swimwear on the sand and at the pool only. Public nudity is an offence in Singapore, and the statute reaches a private place where you can be seen from outside.",
    fix: "A cover-up for the walk back to the monorail.",
  },
  {
    id: "hawker",
    label: "Hawker centres and street eating",
    flags: [],
    rule:
      "Completely casual, mostly open-air and fan-cooled rather than air-conditioned, so expect to sweat through a top over a long lunch.",
    fix: "Breathable fabrics beat cotton jersey, which stays wet in this humidity.",
  },
];

/* ------------------------------------------------------------------ garments */

/** Approximate garment mass in grams, mid-range adult sizes in travel fabrics. */
export const GARMENT_GRAMS = {
  "Short-sleeve top": 150,
  "Long-sleeve shirt (temple-legal)": 220,
  "Lightweight full-length trousers": 330,
  "Shorts or short skirt": 240,
  Underwear: 40,
  Socks: 50,
  "Sarong or long scarf": 180,
  "Headscarf": 90,
  "Packable rain shell": 250,
  "Light indoor layer": 300,
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
 * Build a Singapore packing and dress-code plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex       0 = January … 11 = December
 * @param {number} input.tripDays         nights on the ground, 1–90
 * @param {string[]} input.venueIds       ids from VENUES on the itinerary
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @param {boolean} input.needsHeadCoverOption traveller will be asked to cover hair
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
    return { error: "Plan trips of 90 days or fewer." };
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
    "Shoulders covered for the places of worship you picked",
  );
  add(
    "Lightweight full-length trousers",
    longBottoms,
    needsFullLength ? "Ankle length is expected inside mosques" : "Knee cover for temple visits",
  );
  add("Shorts or short skirt", shortBottoms, "Everyday wear in the humidity");
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add(
    "Socks",
    needsClosed || coolNights ? cycleDays + 1 : Math.ceil(cycleDays / 2),
    needsClosed ? "Closed shoes are expected at some venues" : "Sandal weather most of the time",
  );
  add("Sarong or long scarf", needsSarong ? 1 : 0, "Covers shoulders or legs on the spot");
  add("Headscarf", needsHead ? 1 : 0, "Hair covering inside the prayer hall");
  add(
    "Packable rain shell",
    wet ? 1 : 0,
    `${climate.month} averages ${climate.rainMm} mm over ${climate.rainyDays} wet days`,
  );
  add(
    "Light indoor layer",
    needsLayer ? 1 : 0,
    "Malls, cinemas and the Cloud Forest run far colder than the street",
  );
  add("Collared shirt or smart top", needsSmart ? 1 : 0, "Marina Bay and fine-dining door policy");
  add("Smart trousers", needsSmart ? 1 : 0, "No shorts at the smart venues after dark");
  add("Closed shoes", needsClosed ? 1 : 0, "Club doors and wet conservatory walkways");
  add(
    "Sandals or flip-flops",
    1,
    shoesOff ? "Slip-ons save time at every shoes-off entrance" : "Everyday heat",
  );
  add("Swimwear", 1, "Sentosa and hotel pools only");
  add("Sun hat", 1, `Mean daily maximum ${climate.avgHighC}°C with equatorial sun`);

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (needsShoulders) requirements.push("Shoulders covered — no singlets or spaghetti straps");
  if (needsFullLength) requirements.push("Ankle-length trousers or skirt inside mosques");
  else if (needsKnees) requirements.push("Hem below the knee");
  if (HAS(flags, "noSheer")) requirements.push("Nothing see-through or clinging");
  if (needsClosed) requirements.push("Covered-toe shoes");
  if (shoesOff) requirements.push("Shoes come off at the door — slip-ons save time");
  if (needsHead) requirements.push("Hair covered in the prayer hall");
  if (needsSmart) requirements.push("Smart casual after dark: no slippers, no singlets");
  if (needsLayer) requirements.push("A layer for indoor air-conditioning");

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg economy cabin allowance most carriers out of Changi apply. Laundrettes are everywhere in the HDB heartlands; a shorter wash cycle cuts the load fastest.`,
    );
  }
  if (wet) {
    warnings.push(
      `${climate.month} averages ${climate.rainMm} mm across about ${climate.rainyDays} wet days. Singapore rain arrives as short violent squalls rather than drizzle, so a compact shell beats an umbrella in the wind.`,
    );
  }
  if (climate.avgLowC >= 25) {
    warnings.push(
      `Night lows only fall to about ${climate.avgLowC}°C this month and humidity stays above 80%, so cotton jersey does not dry between wears — synthetics or linen wash and dry overnight.`,
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
