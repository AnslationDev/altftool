/**
 * USA dress code planner.
 *
 * The United States has no national dress code and very little clothing law. What it
 * has instead is (a) six climates that behave nothing like each other, and (b) posted
 * house rules at specific places — courthouse security, Las Vegas nightclub doors,
 * a shrinking handful of jacket-required dining rooms, and cathedral requests for
 * covered shoulders.
 *
 * So this planner is region-first: pick the part of the country, then the month, then
 * the venues. Climate figures are NOAA 1991–2020 U.S. Climate Normals for one
 * representative station per region.
 */

/* ------------------------------------------------------------------ climate */

/** Month names, index-aligned with every region's months array. */
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Each region carries 12 months of normals from its representative NOAA station.
 * avgHighC / avgLowC in degrees Celsius, rainMm mean monthly precipitation,
 * rainyDays mean days with measurable precipitation.
 */
export const REGIONS = [
  {
    id: "northeast",
    label: "Northeast (New York, Boston, Philadelphia)",
    station: "New York Central Park",
    months: [
      { month: "January", avgHighC: 4.4, avgLowC: -2.4, rainMm: 90, rainyDays: 9 },
      { month: "February", avgHighC: 6.1, avgLowC: -1.4, rainMm: 79, rainyDays: 9 },
      { month: "March", avgHighC: 10.4, avgLowC: 2.2, rainMm: 108, rainyDays: 10 },
      { month: "April", avgHighC: 16.6, avgLowC: 7.6, rainMm: 105, rainyDays: 11 },
      { month: "May", avgHighC: 21.9, avgLowC: 13.1, rainMm: 101, rainyDays: 11 },
      { month: "June", avgHighC: 26.5, avgLowC: 18.5, rainMm: 112, rainyDays: 11 },
      { month: "July", avgHighC: 29.4, avgLowC: 21.6, rainMm: 118, rainyDays: 11 },
      { month: "August", avgHighC: 28.5, avgLowC: 21.0, rainMm: 116, rainyDays: 10 },
      { month: "September", avgHighC: 24.7, avgLowC: 17.2, rainMm: 109, rainyDays: 8 },
      { month: "October", avgHighC: 18.4, avgLowC: 11.0, rainMm: 106, rainyDays: 9 },
      { month: "November", avgHighC: 12.6, avgLowC: 5.9, rainMm: 91, rainyDays: 9 },
      { month: "December", avgHighC: 7.2, avgLowC: 1.1, rainMm: 105, rainyDays: 10 },
    ],
  },
  {
    id: "south-florida",
    label: "South Florida and the Gulf (Miami, New Orleans)",
    station: "Miami International",
    months: [
      { month: "January", avgHighC: 25.6, avgLowC: 17.2, rainMm: 41, rainyDays: 7 },
      { month: "February", avgHighC: 26.7, avgLowC: 18.3, rainMm: 56, rainyDays: 6 },
      { month: "March", avgHighC: 27.8, avgLowC: 19.9, rainMm: 78, rainyDays: 6 },
      { month: "April", avgHighC: 29.1, avgLowC: 21.6, rainMm: 84, rainyDays: 6 },
      { month: "May", avgHighC: 30.6, avgLowC: 23.7, rainMm: 168, rainyDays: 10 },
      { month: "June", avgHighC: 31.7, avgLowC: 25.0, rainMm: 245, rainyDays: 15 },
      { month: "July", avgHighC: 32.4, avgLowC: 25.7, rainMm: 173, rainyDays: 16 },
      { month: "August", avgHighC: 32.4, avgLowC: 25.8, rainMm: 236, rainyDays: 18 },
      { month: "September", avgHighC: 31.5, avgLowC: 25.2, rainMm: 260, rainyDays: 17 },
      { month: "October", avgHighC: 29.7, avgLowC: 23.4, rainMm: 165, rainyDays: 13 },
      { month: "November", avgHighC: 27.8, avgLowC: 20.9, rainMm: 84, rainyDays: 8 },
      { month: "December", avgHighC: 26.2, avgLowC: 18.6, rainMm: 55, rainyDays: 7 },
    ],
  },
  {
    id: "southwest",
    label: "Southwest desert (Phoenix, Las Vegas, Tucson)",
    station: "Phoenix Sky Harbor",
    months: [
      { month: "January", avgHighC: 19.7, avgLowC: 7.5, rainMm: 22, rainyDays: 4 },
      { month: "February", avgHighC: 21.9, avgLowC: 9.1, rainMm: 24, rainyDays: 4 },
      { month: "March", avgHighC: 25.6, avgLowC: 11.9, rainMm: 26, rainyDays: 4 },
      { month: "April", avgHighC: 30.6, avgLowC: 15.6, rainMm: 8, rainyDays: 2 },
      { month: "May", avgHighC: 35.6, avgLowC: 20.7, rainMm: 3, rainyDays: 1 },
      { month: "June", avgHighC: 40.6, avgLowC: 25.8, rainMm: 1, rainyDays: 1 },
      { month: "July", avgHighC: 41.4, avgLowC: 29.2, rainMm: 27, rainyDays: 4 },
      { month: "August", avgHighC: 40.4, avgLowC: 28.7, rainMm: 25, rainyDays: 5 },
      { month: "September", avgHighC: 38.2, avgLowC: 25.3, rainMm: 18, rainyDays: 3 },
      { month: "October", avgHighC: 31.6, avgLowC: 18.7, rainMm: 20, rainyDays: 3 },
      { month: "November", avgHighC: 24.3, avgLowC: 12.0, rainMm: 16, rainyDays: 3 },
      { month: "December", avgHighC: 19.4, avgLowC: 7.9, rainMm: 25, rainyDays: 4 },
    ],
  },
  {
    id: "california",
    label: "Coastal California (San Francisco, coastal LA)",
    station: "San Francisco Downtown",
    months: [
      { month: "January", avgHighC: 14.0, avgLowC: 8.0, rainMm: 113, rainyDays: 11 },
      { month: "February", avgHighC: 15.4, avgLowC: 9.1, rainMm: 113, rainyDays: 11 },
      { month: "March", avgHighC: 16.4, avgLowC: 9.7, rainMm: 79, rainyDays: 10 },
      { month: "April", avgHighC: 17.3, avgLowC: 10.1, rainMm: 38, rainyDays: 6 },
      { month: "May", avgHighC: 18.3, avgLowC: 11.2, rainMm: 15, rainyDays: 3 },
      { month: "June", avgHighC: 19.7, avgLowC: 12.4, rainMm: 4, rainyDays: 1 },
      { month: "July", avgHighC: 19.5, avgLowC: 13.0, rainMm: 1, rainyDays: 1 },
      { month: "August", avgHighC: 20.1, avgLowC: 13.6, rainMm: 2, rainyDays: 1 },
      { month: "September", avgHighC: 21.4, avgLowC: 13.5, rainMm: 3, rainyDays: 1 },
      { month: "October", avgHighC: 20.4, avgLowC: 12.6, rainMm: 27, rainyDays: 4 },
      { month: "November", avgHighC: 17.0, avgLowC: 10.3, rainMm: 68, rainyDays: 8 },
      { month: "December", avgHighC: 13.9, avgLowC: 8.1, rainMm: 111, rainyDays: 11 },
    ],
  },
  {
    id: "midwest",
    label: "Midwest and Great Lakes (Chicago, Minneapolis, Detroit)",
    station: "Chicago O'Hare",
    months: [
      { month: "January", avgHighC: 0.6, avgLowC: -7.6, rainMm: 51, rainyDays: 10 },
      { month: "February", avgHighC: 2.6, avgLowC: -6.2, rainMm: 49, rainyDays: 9 },
      { month: "March", avgHighC: 8.9, avgLowC: -0.6, rainMm: 60, rainyDays: 11 },
      { month: "April", avgHighC: 15.6, avgLowC: 4.9, rainMm: 94, rainyDays: 12 },
      { month: "May", avgHighC: 21.5, avgLowC: 10.9, rainMm: 111, rainyDays: 11 },
      { month: "June", avgHighC: 27.0, avgLowC: 16.7, rainMm: 105, rainyDays: 10 },
      { month: "July", avgHighC: 29.0, avgLowC: 19.4, rainMm: 96, rainyDays: 9 },
      { month: "August", avgHighC: 28.0, avgLowC: 18.7, rainMm: 108, rainyDays: 9 },
      { month: "September", avgHighC: 24.4, avgLowC: 14.4, rainMm: 84, rainyDays: 8 },
      { month: "October", avgHighC: 17.1, avgLowC: 7.8, rainMm: 86, rainyDays: 9 },
      { month: "November", avgHighC: 9.4, avgLowC: 1.5, rainMm: 76, rainyDays: 9 },
      { month: "December", avgHighC: 2.9, avgLowC: -4.4, rainMm: 60, rainyDays: 10 },
    ],
  },
  {
    id: "pacific-northwest",
    label: "Pacific Northwest (Seattle, Portland)",
    station: "Seattle-Tacoma",
    months: [
      { month: "January", avgHighC: 8.3, avgLowC: 3.3, rainMm: 142, rainyDays: 19 },
      { month: "February", avgHighC: 9.7, avgLowC: 3.6, rainMm: 96, rainyDays: 15 },
      { month: "March", avgHighC: 12.2, avgLowC: 4.7, rainMm: 96, rainyDays: 17 },
      { month: "April", avgHighC: 15.1, avgLowC: 6.5, rainMm: 71, rainyDays: 14 },
      { month: "May", avgHighC: 18.7, avgLowC: 9.6, rainMm: 50, rainyDays: 11 },
      { month: "June", avgHighC: 21.7, avgLowC: 12.2, rainMm: 41, rainyDays: 9 },
      { month: "July", avgHighC: 25.6, avgLowC: 14.4, rainMm: 19, rainyDays: 5 },
      { month: "August", avgHighC: 25.7, avgLowC: 14.6, rainMm: 26, rainyDays: 5 },
      { month: "September", avgHighC: 22.2, avgLowC: 12.2, rainMm: 40, rainyDays: 8 },
      { month: "October", avgHighC: 15.9, avgLowC: 8.9, rainMm: 100, rainyDays: 14 },
      { month: "November", avgHighC: 10.9, avgLowC: 5.4, rainMm: 176, rainyDays: 19 },
      { month: "December", avgHighC: 7.9, avgLowC: 3.1, rainMm: 152, rainyDays: 19 },
    ],
  },
];

/** Hotel and laundromat drying is machine drying — one spare night is plenty. */
export const DRY_BUFFER_DAYS = 1;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 27;
/** At or above this mean daily maximum, sun protection stops being optional. */
export const EXTREME_HEAT_THRESHOLD_C = 38;
/** Below this mean daily maximum a proper winter coat, not a jacket, is needed. */
export const COAT_THRESHOLD_C = 10;
/** At or below this mean daily minimum, thermals, hat and gloves earn their weight. */
export const FREEZING_NIGHT_THRESHOLD_C = 0;
/** Below this mean daily minimum an evening layer is needed even in summer. */
export const COOL_NIGHT_THRESHOLD_C = 15;
/** Wet days in the month at or above this makes a rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_DAYS = 9;

export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/**
 * US majors cap carry-on by dimensions (commonly 22 x 14 x 9 inches) rather than
 * weight, so this is a practical ceiling for a bag you carry through connections
 * rather than a published limit — and it is close to the weight limits foreign
 * carriers apply on the transatlantic leg.
 */
export const CABIN_BAG_LIMIT_KG = 10;

/* ------------------------------------------------------------------ venues */

/**
 * Flags: shoulders, knees, hatOff, closedShoes, sturdyShoes, smart, formal,
 * layer, sunKit, noBeachwear, noAthletic.
 */
export const VENUES = [
  {
    id: "cathedral",
    label: "Cathedrals and church services",
    flags: ["shoulders", "knees", "hatOff"],
    rule:
      "Practice varies enormously by denomination and region — many congregations are genuinely come-as-you-are — but landmark cathedrals such as St Patrick's in New York ask visitors to cover shoulders and avoid beachwear, and men remove hats inside.",
    fix: "A light layer over a sleeveless top is enough almost everywhere.",
  },
  {
    id: "courthouse",
    label: "Courthouses and government buildings",
    flags: ["knees", "closedShoes", "hatOff", "noAthletic"],
    rule:
      "Most US courthouses post a dress code at security: no shorts, no tank tops, no hats, no clothing with slogans, and judges can and do exclude people for it. Federal buildings add screening that is faster without a belt full of metal.",
    fix: "Long trousers, a collared shirt, closed shoes — the same outfit as a business meeting.",
  },
  {
    id: "fine-dining",
    label: "Fine dining and jacket-required rooms",
    flags: ["formal", "closedShoes"],
    rule:
      "A small number of dining rooms still require a jacket for men and a few refuse denim or trainers outright. Almost everywhere else 'business casual' means a collared shirt and long trousers.",
    fix: "One blazer packs flat and covers restaurants, theatre and any meeting.",
  },
  {
    id: "vegas-club",
    label: "Las Vegas and big-city nightclubs",
    flags: ["smart", "closedShoes", "noAthletic"],
    rule:
      "Door policies are the strictest dress rule most visitors meet in the US: no athletic wear, no sports jerseys, no shorts or sandals for men, usually no hats, and dress shoes expected. Doors turn people away nightly.",
    fix: "Dark trousers, a collared shirt and leather shoes clear almost every door.",
  },
  {
    id: "broadway",
    label: "Broadway, concerts and theatre",
    flags: ["smart"],
    rule:
      "No enforced code at all — jeans are common in the orchestra section. Opening nights and gala performances are the exception, and theatres run cold in summer.",
    fix: "Whatever you would wear to dinner, plus a layer for the air-conditioning.",
  },
  {
    id: "national-park",
    label: "National parks and hiking",
    flags: ["sturdyShoes", "layer", "sunKit"],
    rule:
      "Elevation changes the weather faster than the calendar does: a Grand Canyon rim can be 20°C colder than the river below on the same afternoon. Cotton is the actual hazard — it holds sweat and stops insulating.",
    fix: "Synthetic or wool base layer, fleece, shell, brimmed hat, and boots that are already broken in.",
  },
  {
    id: "beach",
    label: "Beaches and pools",
    flags: ["noBeachwear", "sunKit"],
    rule:
      "Swimwear stays at the beach or pool. Toplessness for women is prohibited in most municipalities regardless of state law, and many beach towns fine walking through commercial streets bare-chested or in swimwear.",
    fix: "A cover-up for the walk back.",
  },
  {
    id: "business",
    label: "Business meetings and conferences",
    flags: ["formal", "closedShoes"],
    rule:
      "Coastal tech runs genuinely casual while finance, law and much of the Midwest and South stay in suits. When the industry is unclear, the safe read is a blazer with no tie, which can be dressed either direction.",
    fix: "One blazer, one pair of dark trousers, one pair of leather shoes.",
  },
  {
    id: "theme-park",
    label: "Theme parks and stadium days",
    flags: ["sturdyShoes", "sunKit", "layer"],
    rule:
      "Ten to fifteen kilometres of walking on hot asphalt, then an air-conditioned indoor ride. Several parks also ban adult costumes and any clothing that drags on the ground for safety reasons.",
    fix: "Broken-in trainers, a hat, and a layer for the indoor sections.",
  },
];

/* ------------------------------------------------------------------ garments */

/** Approximate garment mass in grams, mid-range adult sizes. */
export const GARMENT_GRAMS = {
  "T-shirt or light top": 150,
  "Long-sleeve top or shirt": 220,
  "Trousers or jeans": 450,
  "Shorts or skirt": 240,
  Underwear: 40,
  Socks: 50,
  "Thermal base layer": 200,
  "Fleece or jumper": 400,
  "Insulated winter coat": 950,
  "Light jacket": 500,
  "Packable rain shell": 250,
  "Hat and gloves": 170,
  "Brimmed sun hat": 90,
  Sunglasses: 30,
  "Blazer or smart jacket": 700,
  "Smart trousers": 380,
  "Dress shoes": 800,
  "Walking shoes or trainers": 700,
  "Hiking boots": 1100,
  Swimwear: 120,
  "Cover-up": 200,
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
 * Build a USA packing and dress-code plan.
 *
 * @param {object} input
 * @param {string} input.regionId         id from REGIONS
 * @param {number} input.monthIndex       0 = January … 11 = December
 * @param {number} input.tripDays         nights on the ground, 1–90
 * @param {string[]} input.venueIds       ids from VENUES on the itinerary
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @returns {object} plan, or { error } for unusable input
 */
export function planWardrobe({
  regionId,
  monthIndex,
  tripDays,
  venueIds = [],
  laundryEveryDays,
} = {}) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) return { error: "Pick a region of the United States." };

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
    return { error: "Plan trips of 90 days or fewer — the Visa Waiver Program caps a stay at 90 days." };
  }
  if (!Number.isFinite(laundry) || laundry < 1) {
    return { error: "Laundry interval must be at least 1 day." };
  }
  if (laundry > 30) {
    return { error: "Laundry interval must be 30 days or fewer." };
  }

  const climate = region.months[m];
  const selected = VENUES.filter((v) => venueIds.includes(v.id));
  const flags = selected.flatMap((v) => v.flags);

  const hot = climate.avgHighC >= HOT_DAY_THRESHOLD_C;
  const extremeHeat = climate.avgHighC >= EXTREME_HEAT_THRESHOLD_C;
  const coldDays = climate.avgHighC < COAT_THRESHOLD_C;
  const freezingNights = climate.avgLowC <= FREEZING_NIGHT_THRESHOLD_C;
  const coolNights = climate.avgLowC < COOL_NIGHT_THRESHOLD_C;
  const wet = climate.rainyDays >= RAIN_GEAR_THRESHOLD_DAYS;

  const cycleDays = Math.min(days, laundry >= days ? days : laundry + DRY_BUFFER_DAYS);

  const topsPerDay = hot ? TOPS_PER_DAY_HOT : TOPS_PER_DAY_MILD;
  const bottomRewear = hot ? BOTTOM_REWEAR_DAYS_HOT : BOTTOM_REWEAR_DAYS_MILD;

  const needsShoulders = HAS(flags, "shoulders");
  const needsKnees = HAS(flags, "knees");
  const needsClosed = HAS(flags, "closedShoes");
  const needsSturdy = HAS(flags, "sturdyShoes");
  const needsSmart = HAS(flags, "smart");
  const needsFormal = HAS(flags, "formal");
  const needsSun = HAS(flags, "sunKit") || extremeHeat;
  const needsLayer = HAS(flags, "layer") || coolNights;
  const needsSwim = HAS(flags, "noBeachwear");

  const totalTops = Math.ceil(cycleDays * topsPerDay);
  const longTops = coldDays
    ? totalTops
    : needsShoulders || extremeHeat
      ? Math.max(1, Math.ceil(totalTops / 3))
      : coolNights
        ? 1
        : 0;
  const shortTops = Math.max(0, totalTops - longTops);

  const totalBottoms = Math.max(2, Math.ceil(cycleDays / bottomRewear));
  const wearShorts = climate.avgHighC >= 22 && !needsKnees;
  const shortBottoms = wearShorts ? 1 : 0;
  const longBottoms = Math.max(1, totalBottoms - shortBottoms);

  const packing = [];
  const add = (item, qty, why) => {
    if (qty > 0) packing.push({ item, qty, why, grams: (GARMENT_GRAMS[item] || 0) * qty });
  };

  add("T-shirt or light top", shortTops, `${topsPerDay} tops a day over a ${cycleDays}-day wash cycle`);
  add(
    "Long-sleeve top or shirt",
    longTops,
    coldDays
      ? `Mean daily maximum is only ${climate.avgHighC}°C`
      : extremeHeat
        ? "Loose long sleeves beat bare arms in desert sun"
        : "Covered shoulders and cold indoor air-conditioning",
  );
  add("Trousers or jeans", longBottoms, "Everyday wear, and required at courthouses and clubs");
  add("Shorts or skirt", shortBottoms, `Warm enough at a ${climate.avgHighC}°C mean maximum`);
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add("Socks", cycleDays + 1, needsSturdy ? "Wool or synthetic, never cotton, for walking days" : "One pair a day");
  add("Thermal base layer", freezingNights ? 2 : 0, `Night lows average ${climate.avgLowC}°C`);
  add("Fleece or jumper", coldDays ? 2 : needsLayer ? 1 : 0, "Mid layer, and US indoor air-conditioning is fierce");
  add("Insulated winter coat", coldDays ? 1 : 0, "Lake-effect and Northeast winters bite with the wind");
  add("Light jacket", coldDays ? 0 : 1, "Evenings, theatres and over-cooled interiors");
  add(
    "Packable rain shell",
    wet ? 1 : 0,
    `${region.station} averages rain on about ${climate.rainyDays} days in ${climate.month}`,
  );
  add("Hat and gloves", freezingNights ? 1 : 0, "Wind chill, not the thermometer, is what you feel");
  add("Brimmed sun hat", needsSun ? 1 : 0, extremeHeat ? `Mean daily maximum ${climate.avgHighC}°C` : "Parks, beaches and stadium days");
  add("Sunglasses", 1, "Useful in every region and every season here");
  add("Blazer or smart jacket", needsFormal ? 1 : 0, "Jacket-required rooms and business meetings");
  add("Smart trousers", needsFormal || needsSmart ? 1 : 0, "Club doors and theatre nights");
  add("Dress shoes", needsFormal || needsSmart ? 1 : 0, "No trainers past a Vegas door");
  add("Walking shoes or trainers", 1, "US cities and parks are walked in kilometres, not blocks");
  add("Hiking boots", needsSturdy ? 1 : 0, "Trail days and long asphalt days both punish thin soles");
  add("Swimwear", needsSwim ? 1 : 0, "Beach and hotel pool");
  add("Cover-up", needsSwim ? 1 : 0, "Many beach towns fine swimwear on commercial streets");

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (HAS(flags, "noAthletic")) requirements.push("No athletic wear, jerseys or slogan clothing at club doors and courthouse security");
  if (needsKnees) requirements.push("Long trousers — shorts are refused at courthouse security");
  if (needsShoulders) requirements.push("Shoulders covered in landmark cathedrals");
  if (HAS(flags, "hatOff")) requirements.push("Hats come off inside courthouses and churches");
  if (needsFormal) requirements.push("A jacket for the rooms that still require one");
  else if (needsSmart) requirements.push("Collared shirt, long trousers and dress shoes after dark");
  if (needsSturdy) requirements.push("Broken-in boots or trainers, and no cotton next to the skin on trail days");
  if (needsSun) requirements.push("Brimmed hat, sunglasses and covered arms in strong sun");
  if (HAS(flags, "noBeachwear")) requirements.push("Cover up before leaving the sand");
  if (needsLayer) requirements.push("A layer for indoor air-conditioning, which is set colder than most visitors expect");

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing. US majors cap carry-on by size rather than weight, but ${CABIN_BAG_LIMIT_KG} kg is about the practical ceiling for a bag you lift into an overhead bin, and foreign carriers on the transatlantic leg do weigh it.`,
    );
  }
  if (extremeHeat) {
    warnings.push(
      `${region.station} averages ${climate.avgHighC}°C in ${climate.month}. In desert heat, loose long sleeves and a brimmed hat keep you cooler than bare skin, and the danger is dehydration rather than sunburn alone.`,
    );
  }
  if (freezingNights) {
    warnings.push(
      `Night lows average ${climate.avgLowC}°C in ${climate.month}, and wind chill on open Midwest and Northeast streets runs well below the reading. Layers plus a windproof shell beat a single heavy coat.`,
    );
  }
  if (wet && region.id === "pacific-northwest") {
    warnings.push(
      `Seattle sees rain on about ${climate.rainyDays} days in ${climate.month}, but it is drizzle rather than downpour — locals use hooded shells and almost never umbrellas.`,
    );
  }

  return {
    region: { id: region.id, label: region.label, station: region.station },
    climate,
    cycleDays,
    hot,
    wet,
    coolNights,
    coldDays,
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
