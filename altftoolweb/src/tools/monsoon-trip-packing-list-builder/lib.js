/**
 * Monsoon trip packing list engine.
 *
 * Monsoon packing fails for one reason: nothing dries. Two rules drive the
 * whole list.
 *
 * 1. DRYING TIME — evaporation is driven by the vapour-pressure deficit
 *    between wet fabric and the surrounding air, which falls away as relative
 *    humidity rises. Modelled here as a simple proportionality:
 *      dryingHours = referenceHours / max(FLOOR, 1 - RH/100)
 *    where referenceHours is how long that fabric takes in dry moving air.
 *    At 85% humidity the multiplier is about 6.7x, at 95% it is capped at 10x.
 *    If a garment cannot dry inside one overnight window, washing it mid-trip
 *    buys you nothing, so the laundry credit is withdrawn and you have to pack
 *    for the full trip length.
 *
 * 2. RAINFALL BAND — gear steps up with the India Meteorological Department's
 *    24-hour rainfall classification: very light 0.1-2.4 mm, light 2.5-15.5 mm,
 *    moderate 15.6-64.4 mm, heavy 64.5-115.5 mm, very heavy 115.6-204.4 mm and
 *    extremely heavy at 204.5 mm and above. An umbrella is enough in the light
 *    band; from moderate upward you need a shell, and from heavy upward you
 *    need a second pair of shoes because the first will not dry overnight.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Hours to dry in dry, moving air at around 25 °C — the reference condition. */
export const REFERENCE_DRY_HOURS = {
  quickDry: 0.75,
  cotton: 2,
  denim: 5,
  footwear: 20,
};

/** Floor on (1 - RH/100) so saturated air gives a large but finite multiplier. */
export const EVAPORATION_FLOOR = 0.1;

/** A single overnight window in which a washed garment has to be dry. */
export const OVERNIGHT_DRYING_HOURS = 12;

/** IMD 24-hour rainfall classification, in millimetres. */
export const RAINFALL_BANDS = [
  { id: "none", label: "No rain", minMm: 0, maxMm: 0.09 },
  { id: "very-light", label: "Very light rain", minMm: 0.1, maxMm: 2.4 },
  { id: "light", label: "Light rain", minMm: 2.5, maxMm: 15.5 },
  { id: "moderate", label: "Moderate rain", minMm: 15.6, maxMm: 64.4 },
  { id: "heavy", label: "Heavy rain", minMm: 64.5, maxMm: 115.5 },
  { id: "very-heavy", label: "Very heavy rain", minMm: 115.6, maxMm: 204.4 },
  { id: "extremely-heavy", label: "Extremely heavy rain", minMm: 204.5, maxMm: Infinity },
];

/** Rank used for gear thresholds; higher means wetter. */
const BAND_RANK = {
  none: 0,
  "very-light": 1,
  light: 2,
  moderate: 3,
  heavy: 4,
  "very-heavy": 5,
  "extremely-heavy": 6,
};

/** Days between wash and wear when drying actually works. */
export const LAUNDRY_TURNAROUND_DAYS = 1;

export const MIN_DAYS = 1;
export const MAX_DAYS = 60;
export const MAX_TRAVELLERS = 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Drying time for a fabric at a given relative humidity.
 * @param {"quickDry"|"cotton"|"denim"|"footwear"} fabric
 * @param {number} humidityPercent
 * @returns {{ hours:number, multiplier:number } | { error:string }}
 */
export function dryingHours(fabric, humidityPercent) {
  const reference = REFERENCE_DRY_HOURS[fabric];
  if (!isNum(reference)) return { error: "Unknown fabric." };
  if (!isNum(humidityPercent) || humidityPercent < 0 || humidityPercent > 100) {
    return { error: "Enter a relative humidity between 0% and 100%." };
  }
  const multiplier = 1 / Math.max(EVAPORATION_FLOOR, 1 - humidityPercent / 100);
  return { hours: round1(reference * multiplier), multiplier: round1(multiplier) };
}

/**
 * IMD rainfall band for a 24-hour total.
 * @param {number} mm
 * @returns {{ id:string, label:string, rank:number } | { error:string }}
 */
export function classifyRainfall(mm) {
  if (!isNum(mm) || mm < 0) return { error: "Enter daily rainfall in millimetres." };
  const band = RAINFALL_BANDS.find((entry) => mm >= entry.minMm && mm <= entry.maxMm);
  const chosen = band || RAINFALL_BANDS[RAINFALL_BANDS.length - 1];
  return { id: chosen.id, label: chosen.label, rank: BAND_RANK[chosen.id] };
}

const CATALOG = [
  // --- Rain gear ----------------------------------------------------------
  {
    id: "umbrella",
    group: "Rain gear",
    name: "Compact wind-resistant umbrella",
    gramsEach: 350,
    perTraveller: true,
    qty: () => 1,
    note: () => "Useless in wind above about 40 km/h — the shell is what actually keeps you dry",
  },
  {
    id: "rain-jacket",
    group: "Rain gear",
    name: "Waterproof breathable shell jacket",
    gramsEach: 400,
    perTraveller: true,
    include: (c) => c.rainRank >= BAND_RANK.moderate,
    qty: () => 1,
    note: (c) => `${c.rainLabel} — an umbrella alone stops working at this level`,
  },
  {
    id: "poncho",
    group: "Rain gear",
    name: "Packable poncho (covers the backpack too)",
    gramsEach: 220,
    perTraveller: true,
    include: (c) => c.rainRank >= BAND_RANK.light,
    qty: () => 1,
  },
  {
    id: "rain-trousers",
    group: "Rain gear",
    name: "Waterproof over-trousers",
    gramsEach: 260,
    perTraveller: true,
    include: (c) => c.rainRank >= BAND_RANK.heavy,
    qty: () => 1,
  },
  {
    id: "pack-cover",
    group: "Rain gear",
    name: "Rain cover for the bag",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
  },

  // --- Clothing -----------------------------------------------------------
  {
    id: "quick-dry-tops",
    group: "Clothing",
    name: "Quick-dry tops",
    gramsEach: 150,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
    note: (c) =>
      `Dry in about ${c.quickDryHours} hours at ${c.humidityPercent}% humidity, against ${c.cottonHours} hours for cotton`,
  },
  {
    id: "cotton-tops",
    group: "Clothing",
    name: "Cotton tops (evenings only)",
    gramsEach: 170,
    perTraveller: true,
    include: (c) => !c.quickDryWardrobe,
    qty: () => 2,
    note: () => "Comfortable dry, miserable damp — keep these for indoors",
  },
  {
    id: "quick-dry-bottoms",
    group: "Clothing",
    name: "Quick-dry trousers or shorts",
    gramsEach: 260,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.wearDays / 2), 2, 5),
    note: () => "Skip denim entirely — it takes days to dry in monsoon air",
  },
  {
    id: "underwear",
    group: "Clothing",
    name: "Underwear",
    gramsEach: 40,
    perTraveller: true,
    qty: (c) => c.wearDays + 2,
    note: () => "Two spares, not one, because a damp change is worse than none",
  },
  {
    id: "socks",
    group: "Clothing",
    name: "Synthetic or merino socks",
    gramsEach: 55,
    perTraveller: true,
    qty: (c) => c.wearDays + 2,
    note: () => "Cotton socks plus wet shoes is how blisters and fungal infections start",
  },
  {
    id: "light-layer",
    group: "Clothing",
    name: "Light fleece or long-sleeve layer",
    gramsEach: 320,
    perTraveller: true,
    qty: () => 1,
    note: () => "Wet plus a breeze feels far colder than the thermometer suggests",
  },
  {
    id: "sleepwear",
    group: "Clothing",
    name: "Dry sleepwear kept in a sealed bag",
    gramsEach: 240,
    perTraveller: true,
    qty: () => 1,
    note: () => "One set that never leaves the dry bag is the difference between a good night and a bad one",
  },

  // --- Footwear & feet ----------------------------------------------------
  {
    id: "sandals",
    group: "Footwear & feet",
    name: "Grippy sandals or water shoes",
    gramsEach: 400,
    perTraveller: true,
    qty: () => 1,
    note: () => "Sandals dry; closed shoes do not. Wet marble and tile are the real hazard",
  },
  {
    id: "closed-shoes",
    group: "Footwear & feet",
    name: "Closed shoes",
    gramsEach: 750,
    perTraveller: true,
    qty: (c) => (c.rainRank >= BAND_RANK.heavy ? 2 : 1),
    note: (c) =>
      c.rainRank >= BAND_RANK.heavy
        ? `Soaked shoes need about ${c.footwearHours} hours to dry here, so one pair cannot cover consecutive days`
        : "One pair, worn on travel days",
    include: (c) => !c.sandalsOnly,
  },
  {
    id: "antifungal",
    group: "Footwear & feet",
    name: "Antifungal foot powder or cream",
    gramsEach: 90,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 5),
    note: () => "Days in wet footwear is the classic setup for athlete's foot",
  },
  {
    id: "newspaper",
    group: "Footwear & feet",
    name: "Newspaper or shoe-drying sachets",
    gramsEach: 60,
    perTraveller: false,
    qty: (c) => clamp(c.days, 2, 10),
    note: () => "Stuffed inside overnight, paper pulls water out of a shoe far faster than air does",
  },

  // --- Bag & electronics --------------------------------------------------
  {
    id: "dry-bags",
    group: "Bag & electronics",
    name: "Roll-top dry bags",
    gramsEach: 110,
    perTraveller: true,
    qty: (c) => (c.rainRank >= BAND_RANK.heavy ? 3 : 2),
    note: () => "One for documents and electronics, one for the dry set of clothes",
  },
  {
    id: "ziplocks",
    group: "Bag & electronics",
    name: "Zip-lock bags",
    gramsEach: 8,
    perTraveller: false,
    qty: (c) => clamp(c.days * 2, 6, 30),
  },
  {
    id: "silica",
    group: "Bag & electronics",
    name: "Silica gel sachets for the camera bag",
    gramsEach: 10,
    perTraveller: false,
    qty: (c) => clamp(c.days, 4, 20),
    note: () => "Condensation inside a lens does more damage than the rain outside it",
  },
  {
    id: "power-bank",
    group: "Bag & electronics",
    name: "Power bank in a sealed pouch",
    gramsEach: 240,
    perTraveller: false,
    qty: (c) => clamp(ceil(c.travellers / 2), 1, 5),
  },
  {
    id: "microfibre",
    group: "Bag & electronics",
    name: "Micro-fibre towel",
    gramsEach: 100,
    perTraveller: true,
    qty: () => 1,
  },

  // --- Health -------------------------------------------------------------
  {
    id: "repellent",
    group: "Health",
    name: "Mosquito repellent (100 ml)",
    gramsEach: 115,
    perTraveller: false,
    qty: (c) => clamp(ceil((c.days * c.travellers * 10) / 100), 1, 6),
    note: () =>
      "Standing water after rain is peak breeding conditions for dengue and chikungunya mosquitoes, which bite by day",
  },
  {
    id: "water-purification",
    group: "Health",
    name: "Water purification tablets or a filter bottle",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
    note: () => "Waterborne illness spikes when drains and supply lines flood",
  },
  {
    id: "ors",
    group: "Health",
    name: "Oral rehydration salt sachets",
    gramsEach: 25,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.days / 2), 2, 12),
  },
  {
    id: "first-aid",
    group: "Health",
    name: "First-aid kit with antiseptic and plasters",
    gramsEach: 280,
    perTraveller: false,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "Rain gear",
  "Clothing",
  "Footwear & feet",
  "Bag & electronics",
  "Health",
];

/**
 * @param {object} input
 * @returns {object | { error:string }}
 */
export function buildMonsoonPackingList(input) {
  const {
    days,
    travellers,
    humidityPercent = 88,
    rainfallMmPerDay = 40,
    laundryEveryDays = 3,
    quickDryWardrobe = true,
    sandalsOnly = false,
  } = input || {};

  if (!isNum(days)) return { error: "Enter the trip length in days as a number." };
  if (days < MIN_DAYS) return { error: "A trip has to be at least one day long." };
  if (days > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };
  if (!isNum(travellers) || travellers < 1) return { error: "Enter at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `This list is sized for up to ${MAX_TRAVELLERS} travellers.` };
  }
  if (!isNum(humidityPercent) || humidityPercent < 0 || humidityPercent > 100) {
    return { error: "Enter a relative humidity between 0% and 100%." };
  }
  if (!isNum(rainfallMmPerDay) || rainfallMmPerDay < 0 || rainfallMmPerDay > 1000) {
    return { error: "Enter daily rainfall between 0 mm and 1000 mm." };
  }
  if (!isNum(laundryEveryDays) || laundryEveryDays < 0 || laundryEveryDays > MAX_DAYS) {
    return { error: "Enter how many days between washes, or 0 for no laundry." };
  }

  const wholeDays = Math.round(days);
  const people = Math.round(travellers);

  const quickDry = dryingHours("quickDry", humidityPercent);
  const cotton = dryingHours("cotton", humidityPercent);
  const denim = dryingHours("denim", humidityPercent);
  const shoes = dryingHours("footwear", humidityPercent);

  const wardrobeDryHours = quickDryWardrobe ? quickDry.hours : cotton.hours;
  const laundryViable = laundryEveryDays > 0 && wardrobeDryHours <= OVERNIGHT_DRYING_HOURS;
  const wearDays = laundryViable
    ? Math.min(wholeDays, Math.round(laundryEveryDays) + LAUNDRY_TURNAROUND_DAYS)
    : wholeDays;

  const rain = classifyRainfall(rainfallMmPerDay);

  const ctx = {
    days: wholeDays,
    travellers: people,
    wearDays,
    humidityPercent,
    quickDryHours: quickDry.hours,
    cottonHours: cotton.hours,
    denimHours: denim.hours,
    footwearHours: shoes.hours,
    quickDryWardrobe,
    sandalsOnly,
    rainRank: rain.rank,
    rainLabel: rain.label,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let totalItems = 0;
  let totalGrams = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const base = Math.max(0, Math.round(item.qty(ctx)));
    if (base === 0) continue;
    const qty = item.perTraveller ? base * people : base;
    const grams = item.gramsEach * qty;
    totalItems += qty;
    totalGrams += grams;
    byGroup.get(item.group).push({
      id: item.id,
      name: item.name,
      qty,
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
    wearDays,
    laundryViable,
    laundryEveryDays,
    humidityPercent,
    dryingMultiplier: quickDry.multiplier,
    quickDryHours: quickDry.hours,
    cottonHours: cotton.hours,
    denimHours: denim.hours,
    footwearHours: shoes.hours,
    rainBand: rain.label,
    rainRank: rain.rank,
    rainfallMmPerDay,
    shellNeeded: rain.rank >= BAND_RANK.moderate,
    secondShoesNeeded: rain.rank >= BAND_RANK.heavy,
    severeWeather: rain.rank >= BAND_RANK["very-heavy"],
    days: wholeDays,
    travellers: people,
  };
}
