/**
 * South Korea dress code planner.
 *
 * Korea's clothing rules are almost all social rather than legal, and the ones that
 * catch visitors out are specific:
 *
 *  - Shoes come off constantly — temples, guesthouses, floor-seating restaurants and
 *    many fitting rooms — so socks and slip-on shoes matter more than they do anywhere
 *    in Europe.
 *  - Jjimjilbang bathing floors are gender-separated and fully nude. Swimwear is not
 *    worn in the baths; the shared sauna floors use the shirt and shorts the venue
 *    issues at the counter.
 *  - The four palaces in Seoul, including Gyeongbokgung and Changdeokgung, admit
 *    visitors free of charge when they are wearing hanbok that meets the published
 *    criteria.
 *
 * The rest is climate, and Seoul's is extreme at both ends: a January mean minimum
 * below freezing and an August that is hot and, during jangma, spectacularly wet.
 * Figures are Korea Meteorological Administration 1991–2020 normals for Seoul.
 */

/* ------------------------------------------------------------------ climate */

/** Seoul monthly normals, Korea Meteorological Administration 1991–2020. */
export const CLIMATE = [
  { month: "January", avgHighC: 2.1, avgLowC: -5.5, rainMm: 17, rainyDays: 6 },
  { month: "February", avgHighC: 5.1, avgLowC: -3.2, rainMm: 28, rainyDays: 5 },
  { month: "March", avgHighC: 11.0, avgLowC: 1.9, rainMm: 43, rainyDays: 7 },
  { month: "April", avgHighC: 17.9, avgLowC: 8.0, rainMm: 73, rainyDays: 8 },
  { month: "May", avgHighC: 23.5, avgLowC: 13.9, rainMm: 104, rainyDays: 9 },
  { month: "June", avgHighC: 27.2, avgLowC: 18.9, rainMm: 130, rainyDays: 10 },
  { month: "July", avgHighC: 29.0, avgLowC: 22.9, rainMm: 414, rainyDays: 16 },
  { month: "August", avgHighC: 30.0, avgLowC: 23.5, rainMm: 348, rainyDays: 14 },
  { month: "September", avgHighC: 26.2, avgLowC: 18.4, rainMm: 142, rainyDays: 9 },
  { month: "October", avgHighC: 20.0, avgLowC: 11.3, rainMm: 52, rainyDays: 6 },
  { month: "November", avgHighC: 11.6, avgLowC: 3.9, rainMm: 51, rainyDays: 8 },
  { month: "December", avgHighC: 4.2, avgLowC: -2.5, rainMm: 23, rainyDays: 7 },
];

/** Rooms are ondol-heated in winter and dehumidified in summer; one drying night. */
export const DRY_BUFFER_DAYS = 1;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 28;
/** Below this mean daily maximum a proper winter coat, not a jacket, is needed. */
export const COAT_THRESHOLD_C = 12;
/** At or below this mean daily minimum, thermals, hat and gloves earn their weight. */
export const FREEZING_NIGHT_THRESHOLD_C = 0;
/** Below this mean daily minimum an evening layer is needed even in summer. */
export const COOL_NIGHT_THRESHOLD_C = 16;
/** Wet days in the month at or above this makes a rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_DAYS = 9;
/** Monthly rainfall at or above this is the jangma monsoon, not ordinary rain. */
export const MONSOON_THRESHOLD_MM = 300;
/** Months when yellow dust and fine particulate episodes are most frequent (Mar–May). */
export const FINE_DUST_MONTHS = [2, 3, 4];

export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/** Korean Air and Asiana economy cabin baggage allowance, in kg. */
export const CABIN_BAG_LIMIT_KG = 10;

/* ------------------------------------------------------------------ venues */

/**
 * Flags: shoulders, knees, shoesOff, closedShoes, smart, formal, layer,
 * bathhouse, hanbok, sockCritical, warmBoots.
 */
export const VENUES = [
  {
    id: "temple",
    label: "Buddhist temples and templestay",
    flags: ["shoulders", "knees", "shoesOff", "sockCritical"],
    rule:
      "Shoulders and knees covered, shoes off before the Dharma hall, and no shorts or sleeveless tops inside. Templestay programmes issue their own loose uniform for the duration, so pack for the journey rather than the stay.",
    fix: "Long light trousers and a sleeved top handle every temple in the country.",
  },
  {
    id: "jjimjilbang",
    label: "Jjimjilbang and public bathhouses",
    flags: ["bathhouse", "sockCritical"],
    rule:
      "The bathing floors are gender-separated and fully nude — swimwear is not worn in the baths and wearing it marks you out immediately. The shared sauna and rest floors use the shirt and shorts issued at the counter. Shower thoroughly before entering any pool, and tattoos are still refused at some older establishments.",
    fix: "Bring nothing but toiletries and a hair tie; everything else is issued or rented.",
  },
  {
    id: "palace-hanbok",
    label: "Palaces in hanbok (Gyeongbokgung, Changdeokgung)",
    flags: ["hanbok", "closedShoes"],
    rule:
      "All four Seoul palaces and Jongmyo admit visitors wearing hanbok free of charge. The published criteria require a proper jeogori with sleeves worn with a full chima or baji — a modernised outfit that drops the jeogori or the skirt volume can be refused.",
    fix: "Rental shops cluster around Gyeongbokgung station and hire by the hour, including the hairpiece.",
  },
  {
    id: "floor-dining",
    label: "Floor-seating restaurants and guesthouses",
    flags: ["shoesOff", "sockCritical"],
    rule:
      "Shoes come off at the step and you sit cross-legged on a heated ondol floor. Socks with holes are the classic traveller humiliation here, and boots that take two minutes to lace hold up a whole table.",
    fix: "Slip-on shoes and socks you would be happy to display.",
  },
  {
    id: "clubs",
    label: "Clubs and bars (Itaewon, Hongdae, Gangnam)",
    flags: ["smart", "closedShoes"],
    rule:
      "Gangnam doors run the strictest policy — smart shoes, no flip-flops, no sportswear — while Hongdae is dressed down. Korean nightlife dressing is generally sharper than European equivalents.",
    fix: "One pair of clean dark shoes and a decent shirt.",
  },
  {
    id: "business",
    label: "Business meetings and conferences",
    flags: ["formal", "closedShoes"],
    rule:
      "Korean business dress stays conservative: dark suit, plain shirt, polished shoes. Expect to remove shoes at some corporate dining rooms and to hand and receive business cards with both hands.",
    fix: "One dark suit, and shoes that come off without sitting down.",
  },
  {
    id: "hiking",
    label: "Hiking (Bukhansan, Seoraksan, Jeju)",
    flags: ["closedShoes", "layer"],
    rule:
      "Hiking is a national pastime and the trails are busy, well marked and steep. Korean hikers dress in full technical kit; you will not be judged for less, but granite slabs after rain are genuinely slippery in smooth soles.",
    fix: "Grippy shoes and a wind layer — ridges are far colder than the city figures below.",
  },
  {
    id: "ski",
    label: "Ski resorts (Pyeongchang, Gangwon)",
    flags: ["warmBoots", "layer"],
    rule:
      "Gangwon province runs several degrees colder than Seoul with strong wind on the lifts. Rental covers skis, boots and outerwear, but not base layers or gloves.",
    fix: "Bring your own thermal base layer, gloves and neck warmer; rent the rest.",
  },
  {
    id: "shopping",
    label: "Myeongdong, Dongdaemun and mall days",
    flags: ["layer"],
    rule:
      "No dress code, but underground shopping streets and department stores are heated hard in winter and chilled hard in summer, and Dongdaemun's night markets run until dawn.",
    fix: "A layer you can carry rather than a coat you cannot take off.",
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
  "Good socks (no holes)": 50,
  "Thermal base layer": 200,
  "Fleece or jumper": 400,
  "Padded winter coat": 1000,
  "Light jacket": 500,
  "Packable rain shell": 250,
  "Waterproof shoes or boots": 900,
  "Scarf or neck warmer": 150,
  "Hat and gloves": 170,
  "Smart shirt": 250,
  "Smart trousers": 380,
  "Dress shoes": 800,
  "Slip-on walking shoes": 650,
  "KF94 masks (pack)": 60,
  "Compact umbrella": 300,
  "Hair tie and toiletries pouch": 200,
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
 * Build a South Korea packing and dress-code plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex       0 = January … 11 = December
 * @param {number} input.tripDays         nights on the ground, 1–90
 * @param {string[]} input.venueIds       ids from VENUES on the itinerary
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @param {boolean} input.needsHeadCoverOption traveller wants a scarf listed regardless
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
    return { error: "Plan trips of 90 days or fewer — K-ETA visa-free entry is capped at 90 days." };
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
  const coldDays = climate.avgHighC < COAT_THRESHOLD_C;
  const freezingNights = climate.avgLowC <= FREEZING_NIGHT_THRESHOLD_C;
  const coolNights = climate.avgLowC < COOL_NIGHT_THRESHOLD_C;
  const wet = climate.rainyDays >= RAIN_GEAR_THRESHOLD_DAYS;
  const monsoon = climate.rainMm >= MONSOON_THRESHOLD_MM;
  const dustSeason = FINE_DUST_MONTHS.includes(m);

  const cycleDays = Math.min(days, laundry >= days ? days : laundry + DRY_BUFFER_DAYS);

  const topsPerDay = hot ? TOPS_PER_DAY_HOT : TOPS_PER_DAY_MILD;
  const bottomRewear = hot ? BOTTOM_REWEAR_DAYS_HOT : BOTTOM_REWEAR_DAYS_MILD;

  const needsShoulders = HAS(flags, "shoulders");
  const needsKnees = HAS(flags, "knees");
  const needsClosed = HAS(flags, "closedShoes");
  const needsSmart = HAS(flags, "smart");
  const needsFormal = HAS(flags, "formal");
  const shoesOff = HAS(flags, "shoesOff");
  const bathhouse = HAS(flags, "bathhouse");
  const sockCritical = HAS(flags, "sockCritical");
  const needsBoots = HAS(flags, "warmBoots") || freezingNights;
  const needsLayer = HAS(flags, "layer") || coolNights;
  const needsScarf = coldDays || needsHeadCoverOption;

  const totalTops = Math.ceil(cycleDays * topsPerDay);
  const longTops = coldDays
    ? totalTops
    : needsShoulders
      ? Math.max(1, Math.ceil(totalTops / 3))
      : coolNights
        ? 1
        : 0;
  const shortTops = Math.max(0, totalTops - longTops);

  const totalBottoms = Math.max(2, Math.ceil(cycleDays / bottomRewear));
  const wearShorts = climate.avgHighC >= 22 && !needsKnees;
  const shortBottoms = wearShorts ? 1 : 0;
  const longBottoms = Math.max(1, totalBottoms - shortBottoms);

  /* Shoes come off many times a day, so socks are consumed faster than elsewhere. */
  const sockCount = sockCritical ? cycleDays + 2 : cycleDays + 1;

  const packing = [];
  const add = (item, qty, why) => {
    if (qty > 0) packing.push({ item, qty, why, grams: (GARMENT_GRAMS[item] || 0) * qty });
  };

  add("T-shirt or light top", shortTops, `${topsPerDay} tops a day over a ${cycleDays}-day wash cycle`);
  add(
    "Long-sleeve top or shirt",
    longTops,
    coldDays ? `Mean daily maximum is only ${climate.avgHighC}°C` : "Covered shoulders for temples",
  );
  add("Trousers or jeans", longBottoms, "Temple-legal and the default everywhere else");
  add("Shorts or skirt", shortBottoms, `Warm enough at a ${climate.avgHighC}°C mean maximum`);
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add(
    "Good socks (no holes)",
    sockCount,
    sockCritical ? "Shoes come off at temples, guesthouses and floor-seating tables" : "One pair a day",
  );
  add("Thermal base layer", freezingNights ? 2 : 0, `Night lows average ${climate.avgLowC}°C in Seoul`);
  add("Fleece or jumper", coldDays ? 2 : needsLayer ? 1 : 0, "Mid layer, and heated interiors run hot");
  add("Padded winter coat", coldDays ? 1 : 0, "Continental winter with wind straight off the peninsula");
  add("Light jacket", coldDays ? 0 : 1, "Evenings and over-cooled shops");
  add(
    "Packable rain shell",
    wet ? 1 : 0,
    monsoon
      ? `Jangma: ${climate.month} averages ${climate.rainMm} mm`
      : `${climate.month} averages rain on about ${climate.rainyDays} days`,
  );
  add("Waterproof shoes or boots", monsoon || needsBoots ? 1 : 0, monsoon ? "Streets flood during jangma downpours" : "Ice and snow underfoot");
  add("Compact umbrella", wet ? 1 : 0, "Convenience-store umbrellas are cheap but flimsy");
  add(
    "Scarf or neck warmer",
    needsScarf ? 1 : 0,
    coldDays ? "Wind chill is the difference between cold and unbearable" : "Included at your request",
  );
  add("Hat and gloves", freezingNights ? 1 : 0, "Below-freezing nights are normal this month");
  add("Smart shirt", needsSmart || needsFormal ? 1 : 0, "Korean nightlife and offices dress sharply");
  add("Smart trousers", needsSmart || needsFormal ? 1 : 0, "Gangnam doors and meeting rooms");
  add(
    "Dress shoes",
    needsFormal || needsSmart ? 1 : 0,
    needsFormal ? "Polished shoes, ideally without laces" : "Clean dark shoes for Gangnam doors",
  );
  add("Slip-on walking shoes", 1, shoesOff ? "You will take these off a dozen times a day" : "Cities are walked");
  add("KF94 masks (pack)", dustSeason ? 1 : 0, "Spring yellow dust and fine particulate episodes; KF94 filters at least 94% of 0.4 µm particles");
  add("Hair tie and toiletries pouch", bathhouse ? 1 : 0, "Everything else at a jjimjilbang is issued or rented");

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (needsShoulders) requirements.push("Shoulders and knees covered inside temple halls");
  if (shoesOff) requirements.push("Shoes off at temples, guesthouses and floor-seating restaurants");
  if (sockCritical) requirements.push("Intact, presentable socks — they are on display constantly");
  if (bathhouse) requirements.push("Bathing floors are nude and gender-separated; swimwear stays out of the baths");
  if (HAS(flags, "hanbok")) requirements.push("Hanbok with a sleeved jeogori and a full chima or baji earns free palace entry");
  if (needsFormal) requirements.push("Dark suit and polished shoes for business");
  else if (needsSmart) requirements.push("Smart shoes and a decent shirt for Gangnam doors");
  if (needsBoots) requirements.push("Waterproof, grippy footwear");
  if (needsLayer) requirements.push("A carryable layer — interiors are heated or chilled hard");
  if (needsClosed && !needsFormal && !needsSmart) {
    requirements.push("Closed-toe shoes — sandals or flip-flops won't do here");
  }

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg Korean Air and Asiana allow in the cabin. Wearing the coat on the plane takes about a kilogram out of the bag, and same-day laundry is easy to find in Seoul.`,
    );
  }
  if (monsoon) {
    warnings.push(
      `${climate.month} is jangma season: ${climate.rainMm} mm across about ${climate.rainyDays} wet days, delivered in a handful of very heavy days rather than steady drizzle. Waterproof shoes matter more than a waterproof coat.`,
    );
  }
  if (freezingNights) {
    warnings.push(
      `Seoul averages ${climate.avgLowC}°C overnight in ${climate.month}. Koreans solve this with a long padded coat over thermals rather than a heavy wool coat, because the wind is the problem.`,
    );
  }
  if (dustSeason) {
    warnings.push(
      "Spring brings yellow dust and fine particulate episodes. Air quality is broadcast daily and KF94 masks are sold in every convenience store, so there is no need to carry a large supply.",
    );
  }

  return {
    climate,
    cycleDays,
    hot,
    wet,
    coolNights,
    coldDays,
    monsoon,
    dustSeason,
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
