/**
 * Indonesia dress code planner.
 *
 * Indonesia has the widest spread of clothing rules of any single destination in
 * Southeast Asia, because the rules are provincial rather than national:
 *
 *  - Balinese Hindu temples require a sarong and a sash (selendang) tied at the waist,
 *    plus covered shoulders. Major temples lend or hire both at the gate. Notices at
 *    temple entrances also ask menstruating women not to enter the inner courtyards.
 *  - Aceh is the one province applying Islamic criminal law under its Qanun Jinayat.
 *    Women are required to wear a headscarf and loose clothing in public and neither
 *    sex wears shorts; penalties include public caning.
 *  - Everywhere else is ordinary Muslim-majority modesty: shoulders and knees covered
 *    away from the beach, headscarf and shoes off in a mosque, swimwear on the sand only.
 *
 * The climate is equatorial and barely varies in temperature, so the packing maths is
 * driven by rain and by altitude. Figures are Jakarta monthly normals; Bali is drier,
 * and a pre-dawn volcano rim is nothing like either.
 */

/* ------------------------------------------------------------------ climate */

/** Jakarta monthly normals. Temperatures in °C, rainMm mean monthly rainfall. */
export const CLIMATE = [
  { month: "January", avgHighC: 31.9, avgLowC: 24.4, rainMm: 384, rainyDays: 20 },
  { month: "February", avgHighC: 31.9, avgLowC: 24.4, rainMm: 310, rainyDays: 18 },
  { month: "March", avgHighC: 32.6, avgLowC: 24.6, rainMm: 200, rainyDays: 14 },
  { month: "April", avgHighC: 33.2, avgLowC: 25.1, rainMm: 140, rainyDays: 11 },
  { month: "May", avgHighC: 33.4, avgLowC: 25.3, rainMm: 130, rainyDays: 9 },
  { month: "June", avgHighC: 33.0, avgLowC: 24.9, rainMm: 100, rainyDays: 7 },
  { month: "July", avgHighC: 33.0, avgLowC: 24.6, rainMm: 60, rainyDays: 5 },
  { month: "August", avgHighC: 33.4, avgLowC: 24.6, rainMm: 45, rainyDays: 4 },
  { month: "September", avgHighC: 33.8, avgLowC: 24.9, rainMm: 65, rainyDays: 5 },
  { month: "October", avgHighC: 33.6, avgLowC: 25.0, rainMm: 115, rainyDays: 9 },
  { month: "November", avgHighC: 33.0, avgLowC: 24.9, rainMm: 150, rainyDays: 13 },
  { month: "December", avgHighC: 32.5, avgLowC: 24.6, rainMm: 200, rainyDays: 16 },
];

/** Humidity stays high year round, so washing needs a second night to dry. */
export const DRY_BUFFER_DAYS = 2;

/** Above this mean daily maximum most travellers change tops once mid-day. */
export const HOT_DAY_THRESHOLD_C = 30;
/** Below this mean daily minimum an evening layer is worth its weight at sea level. */
export const COOL_NIGHT_THRESHOLD_C = 20;
/** Monthly rainfall at or above this makes a packable rain shell worth carrying. */
export const RAIN_GEAR_THRESHOLD_MM = 100;
/** Or this many wet days in the month, whichever triggers first. */
export const RAIN_GEAR_THRESHOLD_DAYS = 10;
/** Monthly rainfall at or above this is the wet-season peak, not ordinary rain. */
export const WET_SEASON_THRESHOLD_MM = 250;

export const TOPS_PER_DAY_HOT = 1.5;
export const TOPS_PER_DAY_MILD = 1;
export const BOTTOM_REWEAR_DAYS_HOT = 2;
export const BOTTOM_REWEAR_DAYS_MILD = 3;

/** Garuda Indonesia and Lion Air economy cabin baggage allowance, in kg. */
export const CABIN_BAG_LIMIT_KG = 7;

/* ------------------------------------------------------------------ venues */

/**
 * Flags: shoulders, knees, fullLength, sarongSash, headCover, shoesOff, sharia,
 * closedShoes, smart, layer, altitude, rashGuard, noBeachwear.
 */
export const VENUES = [
  {
    id: "bali-temple",
    label: "Balinese temples (Besakih, Uluwatu, Tirta Empul)",
    flags: ["shoulders", "knees", "sarongSash"],
    rule:
      "A sarong plus a sash tied at the waist is required, not optional, and shoulders must be covered. Notices at the entrance ask menstruating women not to enter the inner courtyards, and at Tirta Empul you change into a wet sarong for the purification pools.",
    fix: "Major temples lend or hire a sarong and sash at the gate, but owning your own is cheap and faster.",
  },
  {
    id: "borobudur",
    label: "Borobudur and Prambanan",
    flags: ["shoulders", "knees", "closedShoes", "sarongSash"],
    rule:
      "Visitors are issued a batik sarong to wear on site, and access to the upper terraces of Borobudur is limited, guided, and requires the site's own upanat sandals to protect the stone.",
    fix: "Wear something the issued sarong sits over comfortably, and expect to change footwear.",
  },
  {
    id: "mosque",
    label: "Mosques (Istiqlal, Jakarta and nationwide)",
    flags: ["shoulders", "knees", "fullLength", "headCover", "shoesOff"],
    rule:
      "Long sleeves, ankle-length clothing and a headscarf for women, shoes off at the door. Istiqlal, the largest mosque in Southeast Asia, runs visitor tours and lends robes at the entrance.",
    fix: "A long scarf covers hair at a mosque and shoulders at a temple, so one item does both jobs.",
  },
  {
    id: "aceh",
    label: "Aceh province",
    flags: ["shoulders", "knees", "fullLength", "headCover", "sharia"],
    rule:
      "Aceh applies Islamic criminal law under its Qanun Jinayat. Women are required to wear a headscarf and loose clothing in public, neither sex wears shorts, and enforcement patrols do stop people. Penalties include public caning.",
    fix: "Loose full-length clothing and a headscarf, worn from the moment you land.",
  },
  {
    id: "beach",
    label: "Bali, Lombok and Gili beaches",
    flags: ["noBeachwear", "rashGuard"],
    rule:
      "Swimwear is for the sand and the water. Bali's 2023 circular on tourist conduct requires appropriate attire at sacred sites and reiterated that beachwear does not belong in villages, temples or restaurants.",
    fix: "A sarong doubles as a cover-up, a towel and a temple garment.",
  },
  {
    id: "diving",
    label: "Diving, snorkelling and boat days",
    flags: ["rashGuard"],
    rule:
      "Equatorial UV through shallow water burns shoulders and the backs of the legs in under an hour, and boat decks are hot metal and wet fibreglass.",
    fix: "A long-sleeve rash guard removes both the burn and the need for repeated sunscreen over reefs.",
  },
  {
    id: "volcano",
    label: "Volcano sunrise hikes (Bromo, Ijen, Batur, Rinjani)",
    flags: ["altitude", "closedShoes", "layer"],
    rule:
      "A 2 a.m. start at 2,300 to 3,700 m is genuinely cold — single-figure Celsius with wind — even though the coast was 33°C the previous afternoon. Ijen adds sulphur gas, and guides supply masks for the crater.",
    fix: "A fleece and a wind shell in the day bag, plus closed shoes with grip on volcanic scree.",
  },
  {
    id: "business",
    label: "Business meetings in Jakarta",
    flags: ["smart", "closedShoes"],
    rule:
      "A long-sleeved batik shirt counts as formal business dress in Indonesia and is worn to meetings, weddings and government offices — it is smarter than a plain shirt, not more casual.",
    fix: "Buy one batik shirt on arrival; it is the single most useful garment for the trip.",
  },
  {
    id: "mall",
    label: "Malls, cinemas and long bus rides",
    flags: ["layer"],
    rule:
      "No dress code, but Jakarta malls and long-distance buses are cooled hard, and a soaked t-shirt turns unpleasant fast once you step inside.",
    fix: "A dry layer in the day bag.",
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
  "Sarong (kain)": 180,
  "Temple sash (selendang)": 60,
  "Long scarf or headscarf": 90,
  "Packable rain shell": 250,
  "Fleece or warm layer": 400,
  "Batik shirt": 260,
  "Smart trousers": 380,
  "Closed shoes with grip": 700,
  "Sandals or flip-flops": 330,
  Swimwear: 120,
  "Long-sleeve rash guard": 200,
  "Sun hat": 90,
  "Dry bag": 150,
};

const HAS = (list, flag) => list.includes(flag);

const toInt = (value) => {
  /* Number('') and Number(null) are both 0, which would silently read as a valid
     month or a zero-day trip, so blank input is rejected before coercion. */
  if (value === null || value === undefined || String(value).trim() === "") return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

/* ------------------------------------------------------------------ planner */

/**
 * Build an Indonesia packing and dress-code plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex       0 = January … 11 = December
 * @param {number} input.tripDays         nights on the ground, 1–90
 * @param {string[]} input.venueIds       ids from VENUES on the itinerary
 * @param {number} input.laundryEveryDays how often laundry gets done, 1–30
 * @param {boolean} input.needsHeadCoverOption traveller will be asked to cover their hair
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
    return { error: "Plan trips of 90 days or fewer — visa-free and visa-on-arrival stays are shorter than that anyway." };
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
  const wetSeasonPeak = climate.rainMm >= WET_SEASON_THRESHOLD_MM;

  const cycleDays = Math.min(days, laundry >= days ? days : laundry + DRY_BUFFER_DAYS);

  const topsPerDay = hot ? TOPS_PER_DAY_HOT : TOPS_PER_DAY_MILD;
  const bottomRewear = hot ? BOTTOM_REWEAR_DAYS_HOT : BOTTOM_REWEAR_DAYS_MILD;

  const sharia = HAS(flags, "sharia");
  const needsShoulders = HAS(flags, "shoulders");
  const needsKnees = HAS(flags, "knees");
  const needsFullLength = HAS(flags, "fullLength");
  const needsSarongSash = HAS(flags, "sarongSash");
  const needsHead = sharia || (HAS(flags, "headCover") && needsHeadCoverOption);
  const needsClosed = HAS(flags, "closedShoes");
  const needsSmart = HAS(flags, "smart");
  const altitude = HAS(flags, "altitude");
  const needsRashGuard = HAS(flags, "rashGuard");
  const needsSwim = HAS(flags, "noBeachwear") || needsRashGuard;
  const needsLayer = HAS(flags, "layer") || altitude || coolNights;
  const shoesOff = HAS(flags, "shoesOff") || needsSarongSash;

  const totalTops = Math.ceil(cycleDays * topsPerDay);
  /* Under Aceh's rules every top must have sleeves, so nothing short-sleeved is packed. */
  const modestTops = sharia
    ? totalTops
    : needsShoulders
      ? Math.max(2, Math.ceil(totalTops / 3))
      : 0;
  const casualTops = Math.max(0, totalTops - modestTops);

  const totalBottoms = Math.max(2, Math.ceil(cycleDays / bottomRewear));
  const longBottoms = sharia
    ? totalBottoms
    : needsFullLength
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
    sharia ? "Aceh requires loose, covered clothing in public" : "Shoulders covered at temples and mosques",
  );
  add(
    "Lightweight full-length trousers",
    longBottoms,
    sharia ? "Shorts are not worn in Aceh by either sex" : "Ankle or below-knee cover for religious sites",
  );
  add("Shorts or short skirt", shortBottoms, "Beach towns and everyday heat");
  add("Underwear", cycleDays + 1, "One a day plus a spare");
  add(
    "Socks",
    needsClosed ? cycleDays + 1 : Math.ceil(cycleDays / 2),
    needsClosed ? "Volcano scree and site footwear rules" : "Mostly sandal weather",
  );
  add("Sarong (kain)", needsSarongSash || needsSwim ? 1 : 0, "Temple garment, beach cover-up and towel in one");
  add("Temple sash (selendang)", needsSarongSash ? 1 : 0, "Required at Balinese temples, worn tied at the waist");
  add("Long scarf or headscarf", needsHead ? 1 : 0, sharia ? "Required in public in Aceh" : "Hair covering for mosque visits");
  add(
    "Packable rain shell",
    wet ? 1 : 0,
    `${climate.month} averages ${climate.rainMm} mm over ${climate.rainyDays} wet days`,
  );
  add(
    "Fleece or warm layer",
    altitude ? 1 : needsLayer ? 1 : 0,
    altitude ? "Volcano rims sit in single-figure Celsius before dawn" : "Malls and long buses are cooled hard",
  );
  add("Batik shirt", needsSmart ? 1 : 0, "Formal business and wedding wear in Indonesia");
  add("Smart trousers", needsSmart ? 1 : 0, "Jakarta meeting rooms");
  add("Closed shoes with grip", needsClosed ? 1 : 0, "Volcanic scree, wet stone and temple terraces");
  add("Sandals or flip-flops", 1, shoesOff ? "Slip-ons save time at every shoes-off entrance" : "Everyday heat");
  add("Swimwear", needsSwim ? 1 : 0, "Water only — not the walk back through the village");
  add("Long-sleeve rash guard", needsRashGuard ? 1 : 0, "Equatorial UV through shallow water burns in under an hour");
  add("Sun hat", 1, `Mean daily maximum ${climate.avgHighC}°C on the equator`);
  add("Dry bag", wet || needsSwim ? 1 : 0, "Boat spray and tropical downpours reach everything in a day pack");

  const totalItems = packing.reduce((sum, row) => sum + row.qty, 0);
  const totalGrams = packing.reduce((sum, row) => sum + row.grams, 0);
  const totalKg = totalGrams / 1000;

  const requirements = [];
  if (sharia) {
    requirements.push("Aceh: headscarf and loose full-length clothing in public, for everyone, from arrival");
  }
  if (needsSarongSash) requirements.push("Sarong plus a sash tied at the waist at Balinese temples");
  if (needsShoulders) requirements.push("Shoulders covered at religious sites");
  if (needsFullLength) requirements.push("Ankle-length trousers or skirt inside mosques");
  else if (needsKnees) requirements.push("Hem below the knee");
  if (needsHead) requirements.push("Hair covered");
  if (shoesOff) requirements.push("Shoes come off at the door — slip-ons save time");
  if (needsClosed) requirements.push("Closed shoes with grip");
  if (HAS(flags, "noBeachwear")) requirements.push("Swimwear stays at the beach — Bali's tourist-conduct circular is explicit about it");
  if (needsSmart) requirements.push("A long-sleeved batik shirt is formal wear, not casual wear");
  if (altitude) requirements.push("A warm layer for pre-dawn volcano starts");

  const warnings = [];
  if (totalKg > CABIN_BAG_LIMIT_KG) {
    warnings.push(
      `Estimated ${totalKg.toFixed(1)} kg of clothing — over the ${CABIN_BAG_LIMIT_KG} kg cabin allowance Garuda and Lion Air apply on domestic legs, which are unavoidable in an archipelago of this size. Laundry is cheap and fast almost everywhere.`,
    );
  }
  if (wetSeasonPeak) {
    warnings.push(
      `${climate.month} is the wet-season peak in Jakarta at ${climate.rainMm} mm across about ${climate.rainyDays} days. Rain arrives as an intense afternoon downpour, and low-lying Jakarta streets flood — quick-dry fabrics and a dry bag matter more than an umbrella.`,
    );
  }
  if (altitude) {
    warnings.push(
      "A volcano sunrise means leaving at around 2 a.m. and standing still at altitude in the wind. Coastal Indonesia gives no sense of how cold that is; take a fleece and a wind shell even in the dry season.",
    );
  }
  if (sharia) {
    warnings.push(
      "Aceh's dress rules are enforced by patrols and apply to visitors as well as residents. This is general travel information, not legal advice — check current provincial guidance before travelling.",
    );
  }

  return {
    climate,
    cycleDays,
    hot,
    wet,
    wetSeasonPeak,
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
