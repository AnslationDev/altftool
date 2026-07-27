/**
 * Germany dress code planner.
 *
 * Germany is casual almost everywhere and strict in three specific places, which is
 * exactly where visitors get it wrong:
 *
 *  - Saunas are textile-free. Swimwear is not worn in a German sauna cabin; you sit
 *    on a towel, naked, in mixed company. Bringing a swimsuit is the mistake, not the
 *    solution.
 *  - Cathedrals such as the Kölner Dom are working churches and ask for covered
 *    shoulders and knees, hats off and silence.
 *  - Section 86a of the Strafgesetzbuch prohibits displaying the symbols of
 *    unconstitutional organisations, and that includes wearing them on clothing.
 *
 * Everything else is weather. Climate figures are Deutscher Wetterdienst 1991–2020
 * normals for Berlin; the Alpine south is colder and snowier, the Rhineland milder.
 */

/* ------------------------------------------------------------------ climate */

/** Berlin monthly normals, Deutscher Wetterdienst 1991–2020 reference period. */
export const CLIMATE = [
  { month: "January", avgHighC: 3.3, avgLowC: -1.3, rainMm: 43, rainyDays: 10 },
  { month: "February", avgHighC: 4.9, avgLowC: -0.9, rainMm: 34, rainyDays: 8 },
  { month: "March", avgHighC: 9.2, avgLowC: 1.4, rainMm: 38, rainyDays: 8 },
  { month: "April", avgHighC: 15.0, avgLowC: 4.5, rainMm: 30, rainyDays: 7 },
  { month: "May", avgHighC: 19.4, avgLowC: 8.9, rainMm: 51, rainyDays: 8 },
  { month: "June", avgHighC: 22.7, avgLowC: 12.1, rainMm: 66, rainyDays: 8 },
  { month: "July", avgHighC: 24.8, avgLowC: 14.2, rainMm: 74, rainyDays: 9 },
  { month: "August", avgHighC: 24.4, avgLowC: 14.0, rainMm: 62, rainyDays: 8 },
  { month: "September", avgHighC: 19.4, avgLowC: 10.3, rainMm: 47, rainyDays: 8 },
  { month: "October", avgHighC: 13.5, avgLowC: 6.4, rainMm: 41, rainyDays: 9 },
  { month: "November", avgHighC: 7.6, avgLowC: 2.8, rainMm: 45, rainyDays: 10 },
  { month: "December", avgHighC: 4.4, avgLowC: 0.0, rainMm: 51, rainyDays: 11 },
];

/** Central heating dries washing fast; one spare night is enough. */
export const DRY_BUFFER_DAYS = 1;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 24;
/** Below this mean daily maximum a proper winter coat, not a jacket, is needed. */
export const COAT_THRESHOLD_C = 12;
/** At or below this mean daily minimum, thermals, hat and gloves earn their weight. */
export const FREEZING_NIGHT_THRESHOLD_C = 2;
/** Below this mean daily minimum an evening layer is needed even in summer. */
export const COOL_NIGHT_THRESHOLD_C = 15;
/** Wet days in the month at or above this makes a rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_DAYS = 8;

export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/** Lufthansa economy cabin baggage allowance, in kg. */
export const CABIN_BAG_LIMIT_KG = 8;

/* ------------------------------------------------------------------ venues */

/**
 * Flags: shoulders, knees, hatOff, headCover, closedShoes, smart, formal,
 * textileFree, tracht, warmBoots, layer.
 */
export const VENUES = [
  {
    id: "sauna",
    label: "Sauna, therme and spa",
    flags: ["textileFree"],
    rule:
      "German saunas are textile-free and usually mixed. Swimwear is not permitted inside the cabin for hygiene reasons — you go in naked and sit on your own towel so no skin touches the wood. Textile days exist at some houses but are the exception, and they are advertised.",
    fix: "Two towels (one to sit on, one to dry), a bathrobe and pool slippers. A swimsuit is only for the pool area, not the cabin.",
  },
  {
    id: "fkk",
    label: "FKK lakes, beaches and city parks",
    flags: [],
    rule:
      "Freikörperkultur areas are signposted FKK and nudity there is entirely normal and legal, including sections of Berlin parks and Baltic beaches. Outside those areas, ordinary public-decency expectations apply.",
    fix: "Read the sign, then follow whatever everyone else is doing.",
  },
  {
    id: "cathedral",
    label: "Cathedrals and churches (Kölner Dom, Frauenkirche)",
    flags: ["shoulders", "knees", "hatOff"],
    rule:
      "Working churches, not exhibits: shoulders and knees covered, hats off for men, phones silent. The Kölner Dom asks visitors to dress appropriately and closes sections during services.",
    fix: "A scarf over the shoulders and long trousers cover it.",
  },
  {
    id: "synagogue-mosque",
    label: "Synagogues and mosques",
    flags: ["shoulders", "knees", "headCover"],
    rule:
      "Men cover their heads in a synagogue — a kippah is provided at the door — and women cover hair in a mosque prayer hall. Security screening at Jewish sites in Germany is routine and involves showing ID.",
    fix: "Carry a scarf; head coverings are lent at the entrance.",
  },
  {
    id: "oktoberfest",
    label: "Oktoberfest, Volksfest and beer gardens",
    flags: ["tracht", "closedShoes"],
    rule:
      "Tracht — Dirndl or Lederhosen — is optional but worn by most locals in Bavaria. Tents are hot inside and the walk home is near freezing in late September, and beer garden benches destroy delicate shoes.",
    fix: "Layer under the Tracht, and wear shoes you can stand in for six hours on gravel.",
  },
  {
    id: "christmas-market",
    label: "Christmas markets",
    flags: ["warmBoots", "layer"],
    rule:
      "You stand still outdoors for hours near or below freezing, holding a hot drink. Standing still is what makes it cold — insulated boots and thermal socks matter more than a heavier coat.",
    fix: "Thermal base layer, insulated boots, hat and gloves. Nothing about it is a dress code, all of it is survival.",
  },
  {
    id: "opera",
    label: "Opera, Philharmonie and theatre",
    flags: ["smart", "closedShoes"],
    rule:
      "No enforced code and Berlin audiences dress noticeably down, but premieres, the Semperoper and Bayreuth still draw a dressed-up crowd.",
    fix: "Dark trousers and a decent shirt are never wrong.",
  },
  {
    id: "business",
    label: "Business meetings and conferences",
    flags: ["formal", "closedShoes"],
    rule:
      "German business dress stays conservative: dark suit, closed shoes, understatement. Punctuality is judged harder than tailoring, but casual dressing reads as unserious in finance and law.",
    fix: "One dark suit or blazer with matching shoes.",
  },
  {
    id: "alps",
    label: "Alps, Black Forest and hiking days",
    flags: ["closedShoes", "layer"],
    rule:
      "Mountain weather is not the city figures here — a summer Alpine day can run from 25°C in the valley to near zero with wind on a ridge, and huts require indoor slippers of their own.",
    fix: "Base layer, mid layer, shell, plus the hut slippers most Hütten expect you to bring.",
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
  "Light jacket": 500,
  "Packable rain shell": 250,
  Scarf: 150,
  "Hat and gloves": 170,
  "Insulated boots": 1100,
  "Smart jacket or blazer": 700,
  "Smart trousers": 380,
  "Leather or dress shoes": 800,
  "Walking shoes": 700,
  "Sauna towels (2)": 800,
  Bathrobe: 900,
  "Pool slippers": 250,
  Swimwear: 120,
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
 * Build a Germany packing and dress-code plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex       0 = January … 11 = December
 * @param {number} input.tripDays         nights on the ground, 1–90
 * @param {string[]} input.venueIds       ids from VENUES on the itinerary
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @param {boolean} input.needsHeadCoverOption traveller will cover their head at a religious site
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
  const freezingNights = climate.avgLowC <= FREEZING_NIGHT_THRESHOLD_C;
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
  const textileFree = HAS(flags, "textileFree");
  const needsBoots = HAS(flags, "warmBoots") || freezingNights;
  const needsHead = HAS(flags, "headCover") && needsHeadCoverOption;
  const needsScarf = needsShoulders || coldDays || needsHead;
  const needsLayer = HAS(flags, "layer") || coolNights;

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
  add("Trousers or jeans", longBottoms, "Everyday wear and the safe choice inside churches");
  add("Shorts or skirt", shortBottoms, `Warm enough at a ${climate.avgHighC}°C mean maximum`);
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add("Socks", cycleDays + 1, freezingNights ? "Wool weight — you will stand still outdoors" : "One pair a day");
  add(
    "Thermal base layer",
    freezingNights ? 2 : 0,
    `Night lows average ${climate.avgLowC}°C this month`,
  );
  add("Jumper or fleece", coldDays ? 2 : needsLayer ? 1 : 0, "Mid layer between shirt and coat");
  add("Insulated winter coat", coldDays ? 1 : 0, "Continental winter with wind off the plain");
  add("Light jacket", coldDays ? 0 : 1, "Evenings and showers");
  add(
    "Packable rain shell",
    wet && !coldDays ? 1 : 0,
    `${climate.month} averages rain on about ${climate.rainyDays} days`,
  );
  add("Scarf", needsScarf ? 1 : 0, needsHead ? "Head covering at religious sites" : "Warmth, and shoulder cover in churches");
  add("Hat and gloves", freezingNights ? 1 : 0, "Standing still outdoors is what makes it cold");
  add("Insulated boots", needsBoots ? 1 : 0, "Christmas markets and frozen pavements");
  add("Smart jacket or blazer", needsFormal ? 1 : 0, "German business dress stays conservative");
  add("Smart trousers", needsFormal || needsSmart ? 1 : 0, "Concerts, theatre and meetings");
  add("Leather or dress shoes", needsFormal ? 1 : 0, "Closed shoes with a suit");
  add("Walking shoes", needsBoots ? 0 : 1, needsClosed ? "Cobbles, gravel and long standing" : "Cities are walked");
  add("Sauna towels (2)", textileFree ? 1 : 0, "One to sit on, one to dry — no skin touches the wood");
  add("Bathrobe", textileFree ? 1 : 0, "Worn between cabins, not inside them");
  add("Pool slippers", textileFree ? 1 : 0, "Required on wet spa floors");
  add("Swimwear", textileFree ? 1 : 0, "For the pool area only — never inside the sauna cabin");

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (textileFree) requirements.push("Sauna cabins are textile-free — swimwear stays outside");
  if (needsShoulders) requirements.push("Shoulders and knees covered inside churches");
  if (HAS(flags, "hatOff")) requirements.push("Men remove hats inside churches");
  if (needsHead) requirements.push("Head covered at the synagogue or mosque — one is lent at the door");
  if (needsFormal) requirements.push("Dark suit or blazer with closed shoes for business");
  else if (needsSmart) requirements.push("Dark trousers and a decent shirt for concerts and theatre");
  if (needsBoots) requirements.push("Insulated boots — you will stand still outdoors for hours");
  if (HAS(flags, "tracht")) requirements.push("Tracht is optional but normal, and tents run hot while the walk home does not");
  requirements.push(
    "No clothing carrying the symbols of unconstitutional organisations — Section 86a of the Strafgesetzbuch makes displaying them a criminal offence",
  );

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg Lufthansa allows in the cabin. Wearing the coat and boots on the plane takes roughly two kilograms out of the bag, and most saunas rent towels and robes on site.`,
    );
  }
  if (freezingNights) {
    warnings.push(
      `${climate.month} averages ${climate.avgLowC}°C overnight in Berlin and the Alpine south runs colder. Layers beat one thick coat because indoor heating is aggressive.`,
    );
  }
  if (textileFree) {
    warnings.push(
      "Sauna etiquette is enforced socially, not by staff: no swimwear in the cabin, sit or lie entirely on your towel including under your feet, and shower before entering.",
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
