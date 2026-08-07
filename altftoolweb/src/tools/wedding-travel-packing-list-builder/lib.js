/**
 * Wedding travel packing list engine.
 *
 * A wedding trip is not sized by days, it is sized by events. The rules:
 *
 * 1. ONE OUTFIT PER EVENT — every function is photographed, so outfits do not
 *    repeat across events. Total outfits = events + one casual set per two
 *    days of downtime + one travel outfit.
 *
 * 2. SHOES BY TIER, NOT BY EVENT — footwear is chosen per dress-code tier
 *    (formal, daytime function, party/dancing) plus one comfortable pair, so
 *    six events still need at most four pairs. This is where most of the
 *    avoidable weight is.
 *
 * 3. WEIGHT AGAINST THE ALLOWANCE — formal Indian wear is heavy: a bridal-party
 *    lehenga or a sherwani runs 2 kg or more, a reception outfit around 1.8 kg,
 *    a saree nearer 800 g. Those figures are summed and checked against the
 *    checked-baggage allowance, with the standard escape hatch measured for
 *    you: wear the single heaviest outfit on the flight.
 *
 * Weights are typical planning figures for the garment plus its dupatta,
 * lining and basic jewellery, not measurements of a specific outfit.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Dress-code tiers, used to pick footwear without duplicating pairs. */
export const TIERS = {
  formal: "formal",
  daytime: "daytime",
  party: "party",
};

/** Typical event types with the outfit weight each implies, in grams. */
export const EVENT_TYPES = [
  {
    id: "mehendi",
    label: "Mehendi",
    tier: TIERS.daytime,
    outfitGrams: 700,
    note: "Daytime, seated on the floor — comfort beats structure, and sleeves get in the way",
  },
  {
    id: "haldi",
    label: "Haldi",
    tier: TIERS.daytime,
    outfitGrams: 600,
    note: "Turmeric stains permanently; wear something you are willing to lose",
  },
  {
    id: "sangeet",
    label: "Sangeet",
    tier: TIERS.party,
    outfitGrams: 1200,
    note: "Dancing for hours — pick something that moves and shoes you can stand in",
  },
  {
    id: "ceremony",
    label: "Wedding ceremony",
    tier: TIERS.formal,
    outfitGrams: 2200,
    note: "The heaviest outfit of the trip, and often the longest worn",
  },
  {
    id: "reception",
    label: "Reception",
    tier: TIERS.formal,
    outfitGrams: 1800,
  },
  {
    id: "cocktail",
    label: "Cocktail or after-party",
    tier: TIERS.party,
    outfitGrams: 900,
  },
  {
    id: "civil",
    label: "Registry or civil ceremony",
    tier: TIERS.formal,
    outfitGrams: 900,
  },
  {
    id: "brunch",
    label: "Farewell brunch",
    tier: TIERS.daytime,
    outfitGrams: 500,
  },
];

/** Outfit style multiplier applied to the event weights above. */
export const OUTFIT_STYLES = {
  heavyEthnic: { label: "Heavy ethnic (lehenga, sherwani, heavy silk)", factor: 1 },
  lightEthnic: { label: "Light ethnic (cotton saree, kurta sets)", factor: 0.55 },
  westernFormal: { label: "Western formal (suit, gown, cocktail dress)", factor: 0.8 },
};

/** Weight of one casual downtime outfit and one travel outfit, in grams. */
export const CASUAL_OUTFIT_G = 350;
export const TRAVEL_OUTFIT_G = 400;

/** One casual outfit per this many days of downtime. */
export const DAYS_PER_CASUAL_OUTFIT = 2;

/** Typical checked allowances in kilograms. */
export const CHECKED_ALLOWANCE_KG = { domestic: 15, international: 23 };

/** A garment bag earns its own weight once you carry this many formal outfits. */
export const GARMENT_BAG_THRESHOLD = 2;

export const MIN_DAYS = 1;
export const MAX_DAYS = 30;
export const MAX_EVENTS_PER_TYPE = 5;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Outfit plan from the selected events.
 * @param {{ events:object, days:number, outfitStyle:string }} input
 * @returns {object | { error:string }}
 */
export function outfitPlan({ events, days, outfitStyle }) {
  const style = OUTFIT_STYLES[outfitStyle];
  if (!style) return { error: "Pick an outfit style." };
  if (!events || typeof events !== "object") return { error: "Choose at least one event." };

  const chosen = [];
  let eventCount = 0;
  let eventGrams = 0;
  let heaviestGrams = 0;
  const tiers = new Set();

  for (const type of EVENT_TYPES) {
    const raw = events[type.id];
    const count = isNum(raw) ? Math.round(raw) : 0;
    if (count < 0) return { error: "Event counts cannot be negative." };
    if (count > MAX_EVENTS_PER_TYPE) {
      return { error: `Up to ${MAX_EVENTS_PER_TYPE} of any one event type.` };
    }
    if (count === 0) continue;
    const each = Math.round(type.outfitGrams * style.factor);
    eventCount += count;
    eventGrams += each * count;
    heaviestGrams = Math.max(heaviestGrams, each);
    tiers.add(type.tier);
    chosen.push({ ...type, count, outfitGramsEach: each, outfitGramsTotal: each * count });
  }

  if (eventCount === 0) return { error: "Choose at least one event to build a list." };

  const casualOutfits = clamp(ceil(days / DAYS_PER_CASUAL_OUTFIT), 1, 8);
  const totalOutfits = eventCount + casualOutfits + 1;
  const totalGrams = eventGrams + casualOutfits * CASUAL_OUTFIT_G + TRAVEL_OUTFIT_G;

  return {
    chosen,
    eventCount,
    eventGrams,
    casualOutfits,
    totalOutfits,
    totalGrams,
    heaviestGrams,
    tiers: [...tiers],
    styleLabel: style.label,
  };
}

const CATALOG = [
  // --- Footwear -----------------------------------------------------------
  {
    id: "formal-shoes",
    group: "Footwear",
    name: "Formal shoes or heels",
    gramsEach: 700,
    include: (c) => c.tiers.includes(TIERS.formal),
    qty: () => 1,
    note: () => "One pair covers every formal-tier event, however many there are",
  },
  {
    id: "party-flats",
    group: "Footwear",
    name: "Flats or block heels for dancing",
    gramsEach: 450,
    include: (c) => c.tiers.includes(TIERS.party),
    qty: () => 1,
    note: () => "Whatever you wear in, this is what you leave in",
  },
  {
    id: "ethnic-sandals",
    group: "Footwear",
    name: "Juttis, kolhapuris or dressy sandals",
    gramsEach: 400,
    include: (c) => c.tiers.includes(TIERS.daytime),
    qty: () => 1,
  },
  {
    id: "comfort-shoes",
    group: "Footwear",
    name: "Comfortable everyday shoes",
    gramsEach: 600,
    qty: () => 1,
  },

  // --- Garment care -------------------------------------------------------
  {
    id: "garment-bag",
    group: "Garment care",
    name: "Garment bag",
    gramsEach: 500,
    include: (c) => c.formalOutfits >= GARMENT_BAG_THRESHOLD,
    qty: () => 1,
    note: (c) => `${c.formalOutfits} formal outfits — folding them is how they arrive creased`,
  },
  {
    id: "steamer",
    group: "Garment care",
    name: "Travel steamer or wrinkle-release spray",
    gramsEach: 450,
    qty: () => 1,
    note: () => "Hotel irons are shared and often unavailable an hour before a function",
  },
  {
    id: "tissue-paper",
    group: "Garment care",
    name: "Tissue paper for folding embroidery",
    gramsEach: 60,
    qty: () => 1,
    note: () => "Layered between folds it stops zari and sequins snagging the fabric beneath",
  },
  {
    id: "sewing-kit",
    group: "Garment care",
    name: "Mini sewing kit and safety pins",
    gramsEach: 80,
    qty: () => 1,
  },
  {
    id: "stain-pen",
    group: "Garment care",
    name: "Stain-removal pen",
    gramsEach: 30,
    qty: () => 1,
  },
  {
    id: "shoe-bags",
    group: "Garment care",
    name: "Shoe bags",
    gramsEach: 30,
    qty: (c) => c.shoePairs,
  },

  // --- Accessories --------------------------------------------------------
  {
    id: "jewellery",
    group: "Accessories",
    name: "Jewellery sets (one per formal or party event)",
    gramsEach: 220,
    include: (c) => c.dressUpEvents > 0,
    qty: (c) => clamp(c.dressUpEvents, 1, 6),
    note: () => "Carry these in hand baggage — checked bags are not insured for jewellery",
  },
  {
    id: "clutch",
    group: "Accessories",
    name: "Clutch or small evening bag",
    gramsEach: 250,
    qty: () => 1,
  },
  {
    id: "shapewear",
    group: "Accessories",
    name: "Shapewear, petticoats or dress socks",
    gramsEach: 150,
    qty: (c) => clamp(ceil(c.eventCount / 2), 1, 4),
  },
  {
    id: "wrap",
    group: "Accessories",
    name: "Shawl or wrap",
    gramsEach: 300,
    qty: () => 1,
    note: () => "Banquet halls and outdoor tents both run cold after dark",
  },

  // --- Grooming & survival ------------------------------------------------
  {
    id: "grooming-kit",
    group: "Grooming & survival",
    name: "Grooming and make-up kit",
    gramsEach: 900,
    qty: () => 1,
  },
  {
    id: "blister-plasters",
    group: "Grooming & survival",
    name: "Blister plasters and gel inserts",
    gramsEach: 40,
    qty: () => 1,
    note: () => "New formal shoes plus a long function is the most reliable injury of the trip",
  },
  {
    id: "painkillers",
    group: "Grooming & survival",
    name: "Painkillers, antacid and rehydration sachets",
    gramsEach: 90,
    qty: () => 1,
  },
  {
    id: "deodorant",
    group: "Grooming & survival",
    name: "Deodorant and dress shields",
    gramsEach: 120,
    qty: () => 1,
  },
  {
    id: "power-bank",
    group: "Grooming & survival",
    name: "Power bank (cabin bag only)",
    gramsEach: 230,
    qty: () => 1,
  },

  // --- Documents & gifts --------------------------------------------------
  {
    id: "gift",
    group: "Documents & gifts",
    name: "Gift or envelope",
    gramsEach: 250,
    qty: () => 1,
  },
  {
    id: "invitation",
    group: "Documents & gifts",
    name: "Invitation, venue addresses and the schedule",
    gramsEach: 40,
    qty: () => 1,
    note: () => "Save the timings offline; venue Wi-Fi and mobile data both fail at scale",
  },
  {
    id: "documents",
    group: "Documents & gifts",
    name: "ID, tickets and hotel confirmations",
    gramsEach: 60,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "Footwear",
  "Garment care",
  "Accessories",
  "Grooming & survival",
  "Documents & gifts",
];

/**
 * @param {object} input
 * @param {object} input.events map of event type id -> count
 * @param {number} input.days
 * @param {string} input.outfitStyle
 * @param {"domestic"|"international"} input.bagPlan
 * @param {boolean} input.wearHeaviestOnTravel
 * @returns {object | { error:string }}
 */
export function buildWeddingPackingList(input) {
  const {
    events,
    days,
    outfitStyle = "heavyEthnic",
    bagPlan = "domestic",
    wearHeaviestOnTravel = false,
  } = input || {};

  if (!isNum(days)) return { error: "Enter the trip length in days as a number." };
  if (days < MIN_DAYS) return { error: "A trip has to be at least one day long." };
  if (days > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };

  const plan = outfitPlan({ events, days: Math.round(days), outfitStyle });
  if (plan.error) return { error: plan.error };

  const formalOutfits = plan.chosen
    .filter((event) => event.tier === TIERS.formal)
    .reduce((total, event) => total + event.count, 0);
  const dressUpEvents = plan.chosen
    .filter((event) => event.tier === TIERS.formal || event.tier === TIERS.party)
    .reduce((total, event) => total + event.count, 0);

  const shoePairs =
    1 +
    (plan.tiers.includes(TIERS.formal) ? 1 : 0) +
    (plan.tiers.includes(TIERS.party) ? 1 : 0) +
    (plan.tiers.includes(TIERS.daytime) ? 1 : 0);

  const ctx = {
    days: Math.round(days),
    tiers: plan.tiers,
    eventCount: plan.eventCount,
    formalOutfits,
    dressUpEvents,
    shoePairs,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let extrasItems = 0;
  let extrasGrams = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const qty = Math.max(0, Math.round(item.qty(ctx)));
    if (qty === 0) continue;
    const grams = item.gramsEach * qty;
    extrasItems += qty;
    extrasGrams += grams;
    byGroup.get(item.group).push({
      id: item.id,
      name: item.name,
      qty,
      grams,
      note: item.note ? item.note(ctx) : "",
    });
  }

  const outfitItems = plan.chosen.map((event) => ({
    id: `outfit-${event.id}`,
    name: `${event.label} outfit`,
    qty: event.count,
    grams: event.outfitGramsTotal,
    note: event.note || "",
  }));
  outfitItems.push({
    id: "outfit-casual",
    name: "Casual downtime outfits",
    qty: plan.casualOutfits,
    grams: plan.casualOutfits * CASUAL_OUTFIT_G,
    note: `One per ${DAYS_PER_CASUAL_OUTFIT} days of the trip`,
  });
  outfitItems.push({
    id: "outfit-travel",
    name: "Travel outfit",
    qty: 1,
    grams: TRAVEL_OUTFIT_G,
    note: "Worn on the way there and back",
  });

  const groups = [{ name: "Outfits", items: outfitItems }].concat(
    GROUP_ORDER.map((name) => ({ name, items: byGroup.get(name) })).filter(
      (group) => group.items.length > 0,
    ),
  );

  const allowanceKg =
    bagPlan === "international" ? CHECKED_ALLOWANCE_KG.international : CHECKED_ALLOWANCE_KG.domestic;

  // Every displayed weight below is derived from the SAME rounded figures
  // that appear in the breakdown, so outfitKg + extrasKg always equals
  // totalKg exactly, and allowanceKg - packedKg always equals spareKg
  // exactly — rounding the raw unrounded totals independently let those
  // sums drift apart by up to 0.1 kg.
  const outfitKg = round1(plan.totalGrams / 1000);
  const extrasKg = round1(extrasGrams / 1000);
  // Adding the two already-rounded parts directly (rather than rounding
  // the raw unrounded gram total separately) means this is the exact same
  // value a caller gets back by re-adding outfitKg + extrasKg themselves.
  const totalKg = outfitKg + extrasKg;
  const heaviestOutfitKg = round1(plan.heaviestGrams / 1000);
  const packedKg = wearHeaviestOnTravel
    ? Math.max(0, totalKg - heaviestOutfitKg)
    : totalKg;

  return {
    groups,
    events: plan.chosen,
    styleLabel: plan.styleLabel,
    eventCount: plan.eventCount,
    totalOutfits: plan.totalOutfits,
    casualOutfits: plan.casualOutfits,
    formalOutfits,
    shoePairs,
    totalItems: plan.totalOutfits + extrasItems,
    outfitKg,
    extrasKg,
    totalKg,
    packedKg,
    heaviestOutfitKg,
    allowanceKg,
    withinAllowance: packedKg <= allowanceKg,
    // Derived directly from allowanceKg and packedKg (both already settled
    // above) rather than rounded independently, so allowanceKg - packedKg
    // always equals spareKg exactly.
    spareKg: allowanceKg - packedKg,
    bagPlan,
    days: Math.round(days),
  };
}
