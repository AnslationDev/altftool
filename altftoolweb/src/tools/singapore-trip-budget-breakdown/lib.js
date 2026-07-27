/**
 * Singapore trip budget breakdown, in Singapore dollars.
 *
 * Singapore has no per-night tourist tax, but it does have the "++" — the
 * convention that a quoted hotel or restaurant price is before a 10% service
 * charge and before GST, and that GST is calculated on the service-inclusive
 * amount, not on the bare price:
 *
 *     nett = price x (1 + service charge) x (1 + GST)
 *          = price x 1.10 x 1.09
 *          = price x 1.199
 *
 * GST rose from 8% to 9% on 1 January 2024, which is the rate used here. A
 * price advertised as "nett" already contains both, which is why this module
 * takes a flag for it: applying the stack to a nett price is the single most
 * common Singapore budgeting mistake. Hawker centres and food courts quote
 * nett; full-service restaurants and hotel bars quote ++.
 *
 * Retail prices in shops must be displayed GST-inclusive. Visitors can claim
 * the GST back on goods taken out of the country under the eTRS scheme,
 * subject to a minimum spend, so this module also reports the GST sitting
 * inside a shopping figure — the part that is in principle reclaimable, before
 * the refund agent's handling fee.
 *
 * The rest works like any city budget:
 *
 *   Flights     = travellers x return fare per person   (one-off)
 *   Stay        = rooms x nights x nightly rate x season (rooms, not people)
 *   Food        = travellers x days x food per day       (days, not nights)
 *   Transport   = travellers x days x transport per day
 *   Activities  = travellers x days x activities per day
 *   Attractions = travellers x one-off ticket budget
 *   Shopping    = travellers x one-off shopping budget
 *   Contingency = contingency % of everything above
 *
 * A trip of N nights spans N + 1 days on the ground.
 * Rooms = ceil(travellers / people per room).
 *
 * The dollar figures in TIERS are planning starting points to overwrite with
 * real quotes. The percentages and the refund threshold are the published rules.
 */

/** Service charge quoted separately by hotels and full-service restaurants. */
export const SERVICE_CHARGE_RATE = 0.1;

/** Singapore GST. Raised from 8% to 9% on 1 January 2024. */
export const GST_RATE = 0.09;

/**
 * The "++" multiplier: service charge first, then GST on the
 * service-inclusive amount. 1.10 x 1.09 = 1.199.
 */
export const NETT_MULTIPLIER = (1 + SERVICE_CHARGE_RATE) * (1 + GST_RATE);

/**
 * Minimum spend to claim a GST refund on goods taken out of Singapore under
 * the electronic Tourist Refund Scheme.
 */
export const TOURIST_REFUND_MIN_SGD = 100;

/** Travel styles, as starting Singapore dollar figures for a normal week. */
export const TIERS = [
  {
    value: "budget",
    label: "Budget — hostel or 2-star, hawker centres, MRT only",
    stayPerRoomPerNight: 90,
    foodPerPersonPerDay: 30,
    transportPerPersonPerDay: 8,
    activitiesPerPersonPerDay: 15,
    returnFarePerPerson: 400,
    attractionsPerPerson: 80,
    shoppingPerPerson: 100,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 4-star hotel, a restaurant meal a day, some taxis",
    stayPerRoomPerNight: 250,
    foodPerPersonPerDay: 90,
    transportPerPersonPerDay: 25,
    activitiesPerPersonPerDay: 60,
    returnFarePerPerson: 750,
    attractionsPerPerson: 250,
    shoppingPerPerson: 300,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — 5-star hotel, restaurants, private transfers",
    stayPerRoomPerNight: 650,
    foodPerPersonPerDay: 220,
    transportPerPersonPerDay: 70,
    activitiesPerPersonPerDay: 150,
    returnFarePerPerson: 1800,
    attractionsPerPerson: 500,
    shoppingPerPerson: 900,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor applied to the room rate only. Singapore has no real weather
 * season — it is within one and a half degrees of the equator — so hotel
 * pricing is driven by events and school holidays instead.
 */
export const SEASON_MULTIPLIERS = [
  { value: "quiet", label: "Quiet weeks (Feb–Apr, Nov) — cheapest rooms", factor: 0.85 },
  { value: "normal", label: "Ordinary week", factor: 1 },
  { value: "holidays", label: "School holidays (Jun, Dec) and Chinese New Year", factor: 1.2 },
  { value: "event", label: "Grand Prix week or a major conference — surge", factor: 1.8 },
];

export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_MONEY = 1000000; // a million Singapore dollars is not a holiday budget
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASON_MULTIPLIERS.find((season) => season.value === value) ?? SEASON_MULTIPLIERS[1];
}

/**
 * Split a quoted price into its base, service charge and GST parts.
 * @param {number} quoted the number you were shown
 * @param {boolean} isNett true when that number already includes both
 * @returns {{error:string}|{base:number, serviceCharge:number, gst:number, total:number}}
 */
export function plusPlusBreakdown(quoted, isNett = false) {
  if (!isNum(quoted)) return { error: "Enter a number for the price." };
  if (quoted < 0) return { error: "Prices cannot be negative." };
  const base = isNett ? quoted / NETT_MULTIPLIER : quoted;
  const serviceCharge = base * SERVICE_CHARGE_RATE;
  const gst = (base + serviceCharge) * GST_RATE;
  return { base, serviceCharge, gst, total: base + serviceCharge + gst };
}

/**
 * GST sitting inside a GST-inclusive retail price — the amount that is in
 * principle reclaimable under the Tourist Refund Scheme, before the refund
 * agent's handling fee.
 * @returns {number|null} null for invalid input rather than NaN.
 */
export function gstInsideRetailPrice(inclusiveAmount) {
  if (!isNum(inclusiveAmount) || inclusiveAmount < 0) return null;
  return inclusiveAmount - inclusiveAmount / (1 + GST_RATE);
}

/**
 * @returns {{error:string}|object} full budget with per-line, per-person and per-day figures
 */
export function buildSingaporeBudget({
  travellers,
  nights,
  peoplePerRoom,
  quotedRoomRate,
  roomRateIsNett = false,
  foodPerPersonPerDay,
  foodIsMenuPrice = false,
  transportPerPersonPerDay,
  activitiesPerPersonPerDay,
  returnFarePerPerson,
  attractionsPerPerson = 0,
  shoppingPerPerson = 0,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCap = 0,
}) {
  const numbers = [
    travellers,
    nights,
    peoplePerRoom,
    quotedRoomRate,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    attractionsPerPerson,
    shoppingPerPerson,
    contingencyPct,
    seasonFactor,
    budgetCap,
  ];
  if (!numbers.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(travellers) || travellers < 1 || travellers > MAX_TRAVELLERS) {
    return { error: `Travellers must be a whole number from 1 to ${MAX_TRAVELLERS}.` };
  }
  if (!Number.isInteger(nights) || nights < 0 || nights > MAX_NIGHTS) {
    return { error: `Nights must be a whole number from 0 to ${MAX_NIGHTS}.` };
  }
  if (!Number.isInteger(peoplePerRoom) || peoplePerRoom < 1 || peoplePerRoom > 6) {
    return { error: "People per room must be a whole number from 1 to 6." };
  }
  const costFields = [
    quotedRoomRate,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    attractionsPerPerson,
    shoppingPerPerson,
    budgetCap,
  ];
  if (costFields.some((value) => value < 0)) return { error: "Costs cannot be negative." };
  if (costFields.some((value) => value > MAX_MONEY)) {
    return { error: "One of the amounts is unrealistically large — check the figures." };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (seasonFactor <= 0 || seasonFactor > 10) {
    return { error: "Season factor must be greater than 0 and at most 10." };
  }

  const days = nights + 1;
  const rooms = Math.ceil(travellers / peoplePerRoom);
  const seasonalRate = quotedRoomRate * seasonFactor;

  const night = plusPlusBreakdown(seasonalRate, roomRateIsNett);
  if (night.error) return { error: night.error };

  const roomNights = rooms * nights;
  const stayBase = night.base * roomNights;
  const stayService = night.serviceCharge * roomNights;
  const stayGst = night.gst * roomNights;
  const stayTotal = stayBase + stayService + stayGst;

  // A menu price at a full-service restaurant is a ++ price; a hawker centre
  // price is already nett.
  const foodPerPersonPerDayNett = foodIsMenuPrice
    ? foodPerPersonPerDay * NETT_MULTIPLIER
    : foodPerPersonPerDay;
  const food = travellers * days * foodPerPersonPerDayNett;
  const foodPlusPlusUplift = food - travellers * days * foodPerPersonPerDay;

  const flights = travellers * returnFarePerPerson;
  const transport = travellers * days * transportPerPersonPerDay;
  const activities = travellers * days * activitiesPerPersonPerDay;
  const attractions = travellers * attractionsPerPerson;
  const shopping = travellers * shoppingPerPerson;

  const subtotal = flights + stayTotal + food + transport + activities + attractions + shopping;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const gstInsideShopping = gstInsideRetailPrice(shopping) ?? 0;
  const refundEligible = shoppingPerPerson >= TOURIST_REFUND_MIN_SGD;

  const lines = [
    { key: "flights", label: "Flights to Singapore", amount: flights, note: `${travellers} x return fare` },
    { key: "stay", label: "Room, before ++", amount: stayBase, note: `${rooms} room(s) x ${nights} night(s)` },
    {
      key: "service",
      label: `Hotel service charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`,
      amount: stayService,
      note: "on the room rate",
    },
    {
      key: "gst",
      label: `GST on the room (${Math.round(GST_RATE * 100)}%)`,
      amount: stayGst,
      note: "on room plus service charge",
    },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    { key: "transport", label: "MRT, buses and taxis", amount: transport, note: `${travellers} x ${days} day(s)` },
    { key: "activities", label: "Daily activities", amount: activities, note: `${travellers} x ${days} day(s)` },
    { key: "attractions", label: "Attraction tickets", amount: attractions, note: "one-off, per person" },
    { key: "shopping", label: "Shopping", amount: shopping, note: "one-off, per person, GST inclusive" },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      amount: contingency,
      note: "buffer on everything above",
    },
  ].map((line) => ({
    ...line,
    perPerson: line.amount / travellers,
    share: total > 0 ? (line.amount / total) * 100 : 0,
  }));

  const perPerson = total / travellers;
  const perPersonPerDay = perPerson / days;
  const stayExtras = stayService + stayGst;

  const dailyVariable =
    travellers * (foodPerPersonPerDayNett + transportPerPersonPerDay + activitiesPerPersonPerDay);
  const nightlyRoomAllIn = rooms * night.total;
  const costOfOneMoreNight = (dailyVariable + nightlyRoomAllIn) * (1 + contingencyPct / 100);
  const fixedCosts = flights + attractions + shopping;

  let nightsAffordable = null;
  let budgetGap = null;
  if (budgetCap > 0) {
    budgetGap = budgetCap - total;
    const perNight = dailyVariable + nightlyRoomAllIn;
    const capBeforeBuffer = budgetCap / (1 + contingencyPct / 100);
    const headroom = capBeforeBuffer - fixedCosts - dailyVariable;
    nightsAffordable = perNight > 0 ? Math.max(0, Math.floor(headroom / perNight)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights is a stopover: no room line, and daily spends count for one day.");
  }
  if (nights > 0 && stayBase > 0) {
    notes.push(
      `The ++ adds ${Math.round(stayExtras)} SGD to a ${Math.round(stayBase)} SGD room line — a quoted rate becomes ${NETT_MULTIPLIER.toFixed(3)} times itself once the service charge and GST are applied.`,
    );
  }
  if (roomRateIsNett) {
    notes.push(
      "You told the tool the room rate is already nett, so it worked backwards to the base — the service and GST lines show what is inside your quoted number rather than being added to it.",
    );
  }
  if (foodIsMenuPrice && foodPlusPlusUplift > 0) {
    notes.push(
      `Your food figure was treated as a ++ menu price, which adds ${Math.round(foodPlusPlusUplift)} SGD across the trip. Hawker centres and food courts quote nett, so switch this off if that is where you will eat.`,
    );
  }
  if (shopping > 0) {
    notes.push(
      refundEligible
        ? `About ${Math.round(gstInsideShopping)} SGD of GST sits inside that shopping figure. Goods taken out of Singapore can be claimed back under the Tourist Refund Scheme above the ${TOURIST_REFUND_MIN_SGD} SGD minimum spend, less the refund agent's handling fee — so expect less than the full amount.`
        : `Shopping below the ${TOURIST_REFUND_MIN_SGD} SGD minimum spend does not qualify for a GST refund, so treat the whole figure as spent.`,
    );
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the sharing rate implies.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the base room at about ${Math.round(seasonalRate)} SGD a night. Singapore's weather barely changes, so it is events and school holidays that move hotel prices.`,
    );
  }
  if (budgetCap > 0 && budgetGap !== null && budgetGap < 0) {
    notes.push(`Over the cap. At the same daily spends, ${nightsAffordable} night(s) fits inside the ceiling.`);
  }

  return {
    travellers,
    nights,
    days,
    rooms,
    roomNights,
    seasonFactor,
    seasonalRate,
    roomRateIsNett,
    foodIsMenuPrice,
    perRoomNight: night,
    lines,
    flights,
    stayBase,
    stayService,
    stayGst,
    stayTotal,
    stayExtras,
    food,
    foodPlusPlusUplift,
    transport,
    activities,
    attractions,
    shopping,
    gstInsideShopping,
    refundEligible,
    subtotal,
    contingency,
    total,
    perPerson,
    perPersonPerDay,
    dailyVariable,
    nightlyRoomAllIn,
    costOfOneMoreNight,
    fixedCosts,
    budgetCap,
    budgetGap,
    nightsAffordable,
    notes,
  };
}
