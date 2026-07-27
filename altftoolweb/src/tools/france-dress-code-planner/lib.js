/**
 * France dress code planner.
 *
 * France has almost no religious dress requirement in law, and one prohibition that
 * does bind everyone: Law n° 2010-1192 makes concealing the face in a public space an
 * offence, punishable by a fine of up to €150 and a citizenship course. Beyond that the
 * rules are venue rules — cathedrals ask for covered shoulders and no beachwear,
 * municipal by-laws in Riviera communes fine people for walking through town in swim
 * kit, and virtually every public swimming pool refuses loose swim shorts on hygiene
 * grounds and requires a fitted brief or jammer.
 *
 * The wardrobe maths is therefore driven mostly by the weather, which in France swings
 * around 18°C between January and August. Climate figures are Météo-France 1991–2020
 * normals for Paris-Montsouris; the Riviera runs warmer and the Alps far colder.
 */

/* ------------------------------------------------------------------ climate */

/** Paris-Montsouris monthly normals, Météo-France 1991–2020 reference period. */
export const CLIMATE = [
  { month: "January", avgHighC: 7.6, avgLowC: 3.0, rainMm: 48, rainyDays: 10 },
  { month: "February", avgHighC: 8.8, avgLowC: 3.0, rainMm: 41, rainyDays: 9 },
  { month: "March", avgHighC: 13.0, avgLowC: 5.3, rainMm: 45, rainyDays: 10 },
  { month: "April", avgHighC: 16.9, avgLowC: 7.3, rainMm: 43, rainyDays: 9 },
  { month: "May", avgHighC: 20.5, avgLowC: 10.9, rainMm: 66, rainyDays: 10 },
  { month: "June", avgHighC: 23.9, avgLowC: 13.8, rainMm: 55, rainyDays: 8 },
  { month: "July", avgHighC: 26.1, avgLowC: 15.8, rainMm: 63, rainyDays: 8 },
  { month: "August", avgHighC: 26.0, avgLowC: 15.7, rainMm: 57, rainyDays: 7 },
  { month: "September", avgHighC: 22.0, avgLowC: 12.5, rainMm: 47, rainyDays: 8 },
  { month: "October", avgHighC: 17.0, avgLowC: 9.8, rainMm: 66, rainyDays: 11 },
  { month: "November", avgHighC: 11.5, avgLowC: 6.0, rainMm: 58, rainyDays: 11 },
  { month: "December", avgHighC: 8.3, avgLowC: 3.6, rainMm: 62, rainyDays: 11 },
];

/** Air is dry indoors in the heating season, so one spare drying night is enough. */
export const DRY_BUFFER_DAYS = 1;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 26;
/** Below this mean daily maximum a proper coat, not a jacket, is needed. */
export const COAT_THRESHOLD_C = 12;
/** Below this mean daily minimum hat, gloves and a base layer earn their weight. */
export const FREEZING_NIGHT_THRESHOLD_C = 4;
/** Below this mean daily minimum an evening layer is needed even in summer. */
export const COOL_NIGHT_THRESHOLD_C = 16;
/** Wet days in the month at or above this makes a rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_DAYS = 9;

export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/** Air France economy cabin allowance: cabin bag plus accessory, 12 kg combined. */
export const CABIN_BAG_LIMIT_KG = 12;

/** Fine for concealing the face in a public space under Law n° 2010-1192, in euro. */
export const FACE_COVERING_FINE_EUR = 150;

/* ------------------------------------------------------------------ venues */

/**
 * Flags: shoulders, knees, closedShoes, hatOff, smart, formal, swimBrief,
 * layer (indoor or evening layer), noBeachwear, noFaceCover.
 */
export const VENUES = [
  {
    id: "cathedral",
    label: "Cathedrals and basilicas (Notre-Dame, Sacré-Cœur, Chartres)",
    flags: ["shoulders", "knees", "hatOff", "noBeachwear"],
    rule:
      "Working churches, not museums: shoulders covered, no bare midriff, no beachwear, and men remove hats inside. Sacré-Cœur posts the request for decent dress and silence at the door and stewards do turn people away.",
    fix: "A light scarf over the shoulders satisfies every French church on this list.",
  },
  {
    id: "abbey",
    label: "Abbeys and monasteries (Mont-Saint-Michel, Sénanque)",
    flags: ["shoulders", "knees", "closedShoes"],
    rule:
      "Same covering expectation as a cathedral, plus long stone stair climbs and worn, slippery steps that punish smooth-soled sandals.",
    fix: "Shoes with grip and a scarf handle both problems.",
  },
  {
    id: "michelin",
    label: "Michelin-starred and grande-table restaurants",
    flags: ["formal", "closedShoes"],
    rule:
      "Sportswear, trainers, shorts and beach sandals are refused at the top tier, and a handful of houses still ask men for a jacket. Reservation confirmations usually state the code — read it.",
    fix: "One jacket, one pair of dark trousers and leather shoes cover every formal night.",
  },
  {
    id: "bistro",
    label: "Bistros, brasseries and city dining",
    flags: ["smart"],
    rule:
      "No code, but Parisian dressing runs plainer and darker than most visitors expect. Athletic wear outside the gym reads as odd rather than forbidden.",
    fix: "Dark denim and a plain jumper is the local default.",
  },
  {
    id: "opera",
    label: "Opéra Garnier, theatres and concerts",
    flags: ["smart", "closedShoes"],
    rule:
      "No enforced dress code since the 1980s, but the audience dresses up for premieres and galas, and shorts feel wrong in the Garnier grand staircase.",
    fix: "The same smart outfit used for dinner.",
  },
  {
    id: "pool",
    label: "Public swimming pools",
    flags: ["swimBrief"],
    rule:
      "Loose swim shorts are banned in essentially every French municipal pool for hygiene reasons — men need fitted briefs or jammers. Swim caps are compulsory at many pools, and some require plastic overshoes on the poolside.",
    fix: "Briefs and a cap cost a few euros in any French supermarket if you arrive without them.",
  },
  {
    id: "riviera",
    label: "Riviera beaches and coastal towns",
    flags: ["noBeachwear"],
    rule:
      "Topless sunbathing is legal on the beach, but a number of coastal communes fine people for walking through town bare-chested or in swimwear under municipal by-laws.",
    fix: "A t-shirt and shorts pulled on for the walk off the sand.",
  },
  {
    id: "alps",
    label: "Alps, Pyrenees and winter mountain days",
    flags: ["closedShoes", "layer"],
    rule:
      "Mountain weather is a different climate from the city figures here — expect sub-zero mornings, strong UV off snow and a 15°C swing in a single day.",
    fix: "Base layer, mid layer, shell — and sunglasses, which matter more at altitude than a coat.",
  },
  {
    id: "museum",
    label: "Museums and galleries (Louvre, Orsay, Versailles)",
    flags: ["closedShoes", "layer"],
    rule:
      "No dress rule, but a Louvre day is several kilometres of hard floor, and large bags and rigid backpacks must go into the cloakroom.",
    fix: "Comfortable shoes and a soft day bag that collapses.",
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
  "Jumper or fleece": 400,
  "Insulated winter coat": 950,
  "Light jacket or trench": 500,
  "Packable rain shell": 250,
  "Scarf or pashmina": 150,
  "Hat and gloves": 170,
  "Smart jacket or blazer": 700,
  "Smart trousers": 380,
  "Leather or dress shoes": 800,
  "Walking shoes": 700,
  "Swim briefs or jammers": 90,
  "Swim cap": 30,
  Sunglasses: 30,
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
 * Build a France packing and dress-code plan.
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
    return { error: "Plan trips of 90 days or fewer — a Schengen stay is capped at 90 anyway." };
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
  const freezingNights = climate.avgLowC < FREEZING_NIGHT_THRESHOLD_C;
  const coolNights = climate.avgLowC < COOL_NIGHT_THRESHOLD_C;
  const wet = climate.rainyDays >= RAIN_GEAR_THRESHOLD_DAYS;

  const cycleDays = Math.min(days, laundry >= days ? days : laundry + DRY_BUFFER_DAYS);

  const topsPerDay = hot ? TOPS_PER_DAY_HOT : TOPS_PER_DAY_MILD;
  const bottomRewear = hot ? BOTTOM_REWEAR_DAYS_HOT : BOTTOM_REWEAR_DAYS_MILD;

  const needsShoulders = HAS(flags, "shoulders");
  const needsKnees = HAS(flags, "knees");
  const needsClosed = HAS(flags, "closedShoes");
  const needsSmart = HAS(flags, "smart");
  const needsFormal = HAS(flags, "formal");
  const needsSwimBrief = HAS(flags, "swimBrief");
  const needsScarf = needsShoulders || needsHeadCoverOption || coldDays;
  const needsLayer = HAS(flags, "layer") || coolNights;

  const totalTops = Math.ceil(cycleDays * topsPerDay);
  /* In cold months most tops are long-sleeved; in heat most are short-sleeved. */
  const longTops = coldDays
    ? totalTops
    : needsShoulders
      ? Math.max(1, Math.ceil(totalTops / 3))
      : coolNights
        ? 1
        : 0;
  const shortTops = Math.max(0, totalTops - longTops);

  const totalBottoms = Math.max(2, Math.ceil(cycleDays / bottomRewear));
  /* Shorts only make sense when the mean maximum clears the coat threshold comfortably. */
  const wearShorts = climate.avgHighC >= 20 && !needsKnees;
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
    coldDays ? `Mean daily maximum is only ${climate.avgHighC}°C` : "Covered shoulders for churches",
  );
  add("Trousers or jeans", longBottoms, "Everyday wear, and the safe choice inside churches");
  add("Shorts or skirt", shortBottoms, `Warm enough at a ${climate.avgHighC}°C mean maximum`);
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add("Socks", cycleDays + 1, coldDays ? "Wool weight in the cold months" : "One pair a day");
  add(
    "Thermal base layer",
    freezingNights ? 2 : 0,
    `Nights average ${climate.avgLowC}°C — a base layer beats a thicker coat`,
  );
  add("Jumper or fleece", coldDays ? 2 : needsLayer ? 1 : 0, "Mid layer between shirt and coat");
  add("Insulated winter coat", coldDays ? 1 : 0, "Damp cold, not dry cold — wind cuts through wool");
  add("Light jacket or trench", coldDays ? 0 : 1, "Evenings and showers in the shoulder seasons");
  add(
    "Packable rain shell",
    wet && !coldDays ? 1 : 0,
    `${climate.month} averages rain on about ${climate.rainyDays} days`,
  );
  add("Scarf or pashmina", needsScarf ? 1 : 0, needsShoulders ? "Covers shoulders in churches" : "Warmth and the local look");
  add("Hat and gloves", freezingNights ? 1 : 0, "Below-freezing mornings are normal this month");
  add("Smart jacket or blazer", needsFormal ? 1 : 0, "Some grandes tables still ask men for a jacket");
  add("Smart trousers", needsFormal || needsSmart ? 1 : 0, "Evening dressing runs plain and dark");
  add("Leather or dress shoes", needsFormal ? 1 : 0, "Trainers are refused at the top restaurants");
  add("Walking shoes", 1, needsClosed ? "Cobbles, abbey stairs and museum floors" : "Cities are walked, not driven");
  add("Swim briefs or jammers", needsSwimBrief ? 1 : 0, "Loose swim shorts are banned in French public pools");
  add("Swim cap", needsSwimBrief ? 1 : 0, "Compulsory at many municipal pools");
  add("Sunglasses", 1, "Low winter sun and snow glare are both worse than summer haze");

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (needsShoulders) requirements.push("Shoulders covered inside churches — a scarf is enough");
  if (needsKnees) requirements.push("Knees covered, and no beachwear inside a church");
  if (HAS(flags, "hatOff")) requirements.push("Men remove hats inside churches");
  if (needsFormal) requirements.push("Jacket and leather shoes for the formal tables");
  else if (needsSmart) requirements.push("Plain, dark smart casual for evenings out");
  if (needsSwimBrief) requirements.push("Fitted swim briefs and a cap for public pools");
  if (HAS(flags, "noBeachwear")) requirements.push("Cover up before leaving the sand — some communes fine bare chests in town");
  if (needsClosed) requirements.push("Shoes with grip for cobbles and worn stone stairs");
  requirements.push(
    `Faces stay uncovered in public spaces — Law n° 2010-1192 carries a fine of up to €${FACE_COVERING_FINE_EUR}`,
  );

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg Air France counts for a cabin bag plus accessory. Winter coats are the single heaviest item; wearing it on the plane removes about a kilogram from the bag.`,
    );
  }
  if (freezingNights) {
    warnings.push(
      `${climate.month} averages ${climate.avgLowC}°C overnight in Paris, and French cold is damp — a wind-resistant shell over layers works better than one thick coat.`,
    );
  }
  if (climate.avgHighC >= 26) {
    warnings.push(
      `${climate.month} peaks around ${climate.avgHighC}°C on average and heatwaves push far past it. Most older French buildings and many hotel rooms have no air-conditioning at all.`,
    );
  }

  return {
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
