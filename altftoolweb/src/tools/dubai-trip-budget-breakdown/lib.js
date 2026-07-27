/**
 * Dubai trip budget breakdown, in UAE dirhams.
 *
 * Dubai is the city where the advertised room rate is least like the amount on
 * the final bill, because four separate charges are stacked on it. This module
 * reproduces the way a Dubai hotel folio is actually itemised:
 *
 *   1. Base room rate                                  (what the site quoted)
 *   2. + municipality fee, 10% of the room rate        (Dubai hotel fee)
 *   3. + service charge, 10% of the room rate          (charged by the hotel)
 *   4. + VAT at 5% on the sum of the three above       (UAE VAT, since 2018)
 *   5. + Tourism Dirham, a flat amount per ROOM per NIGHT set by the
 *      property's classification — not a percentage, and not per person.
 *
 * So a room quoted "exclusive" costs base x 1.20 x 1.05, plus the Tourism
 * Dirham for each room-night. Many booking sites now quote a rate that already
 * contains steps 2 to 4, which is why this module takes a flag for it: adding
 * the stack twice is the single most common Dubai budgeting mistake.
 *
 * The rest of the trip works like any other city budget:
 *
 *   Flights     = travellers x return fare per person   (one-off)
 *   Food        = travellers x days x food per day      (days, not nights)
 *   Transport   = travellers x days x transport per day
 *   Activities  = travellers x days x activities per day
 *   Attractions = travellers x one-off ticket budget
 *   Contingency = contingency % of everything above
 *
 * A trip of N nights spans N + 1 days on the ground.
 * Rooms = ceil(travellers / people per room).
 *
 * Dirham figures in TIERS are planning starting points to overwrite with real
 * quotes. The percentages and the Tourism Dirham bands are the published rules.
 */

/** Dubai municipality fee levied on hotel room revenue. */
export const MUNICIPALITY_FEE_RATE = 0.1;

/** Service charge hotels add to the room rate. */
export const SERVICE_CHARGE_RATE = 0.1;

/** UAE value added tax, in force since 1 January 2018. */
export const VAT_RATE = 0.05;

/** The dirham has been pegged to the US dollar at 3.6725 AED since 1997. */
export const AED_PER_USD_PEG = 3.6725;

/**
 * Tourism Dirham: a flat fee per occupied room per night, set by the
 * property's classification. These are the published bands.
 */
export const PROPERTY_CLASSES = [
  { value: "five-star", label: "5-star hotel", tourismDirhamPerRoomPerNight: 20 },
  { value: "four-star", label: "4-star hotel", tourismDirhamPerRoomPerNight: 15 },
  { value: "three-star", label: "3-star hotel", tourismDirhamPerRoomPerNight: 10 },
  { value: "budget-hotel", label: "1 or 2-star hotel", tourismDirhamPerRoomPerNight: 7 },
  { value: "deluxe-apartment", label: "Deluxe hotel apartment", tourismDirhamPerRoomPerNight: 15 },
  { value: "standard-apartment", label: "Standard hotel apartment", tourismDirhamPerRoomPerNight: 10 },
];

/** Travel styles, as starting dirham figures for a normal week. */
export const TIERS = [
  {
    value: "budget",
    label: "Budget — 3-star or apartment, metro, food courts and free beaches",
    stayPerRoomPerNight: 250,
    foodPerPersonPerDay: 120,
    transportPerPersonPerDay: 30,
    activitiesPerPersonPerDay: 60,
    returnFarePerPerson: 1200,
    attractionsPerPerson: 300,
    peoplePerRoom: 2,
    propertyClass: "three-star",
  },
  {
    value: "comfort",
    label: "Comfort — 4-star beach or downtown hotel, taxis, a paid attraction most days",
    stayPerRoomPerNight: 600,
    foodPerPersonPerDay: 280,
    transportPerPersonPerDay: 90,
    activitiesPerPersonPerDay: 180,
    returnFarePerPerson: 2200,
    attractionsPerPerson: 700,
    peoplePerRoom: 2,
    propertyClass: "four-star",
  },
  {
    value: "premium",
    label: "Premium — 5-star resort, restaurants, private transfers and desert safari",
    stayPerRoomPerNight: 1600,
    foodPerPersonPerDay: 650,
    transportPerPersonPerDay: 250,
    activitiesPerPersonPerDay: 450,
    returnFarePerPerson: 4500,
    attractionsPerPerson: 1500,
    peoplePerRoom: 2,
    propertyClass: "five-star",
  },
];

/**
 * Season factor applied to the base room rate only. Dubai's pricing is the
 * inverse of Europe's: the cool November-to-March window is peak, and the
 * furnace months of June to August are when hotels discount hardest.
 */
export const SEASON_MULTIPLIERS = [
  { value: "summer", label: "Summer (Jun–Aug) — 45°C, cheapest rooms", factor: 0.55 },
  { value: "shoulder", label: "Shoulder (Apr–May, Sep–Oct)", factor: 0.8 },
  { value: "peak", label: "Peak (Nov–Mar) — the pleasant months", factor: 1 },
  { value: "event", label: "New Year, Eid or a major event week — surge", factor: 1.7 },
];

export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_MONEY = 5000000; // five million dirhams is not a holiday budget
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASON_MULTIPLIERS.find((season) => season.value === value) ?? SEASON_MULTIPLIERS[2];
}

export function propertyClassByValue(value) {
  return PROPERTY_CLASSES.find((item) => item.value === value) ?? PROPERTY_CLASSES[1];
}

/**
 * Turn a quoted nightly rate into what the hotel actually charges for one
 * room-night, itemised the way a Dubai folio is.
 * @param {object} input
 * @param {boolean} input.rateIncludesTaxes true when the quote already contains
 *   the municipality fee, service charge and VAT.
 * @returns {{error:string}|{base:number, municipalityFee:number, serviceCharge:number, vat:number, tourismDirham:number, total:number}}
 */
export function priceOneRoomNight({
  quotedRate,
  tourismDirhamPerRoomPerNight,
  rateIncludesTaxes = false,
}) {
  if (![quotedRate, tourismDirhamPerRoomPerNight].every(isNum)) {
    return { error: "Enter a number for the room rate and the Tourism Dirham." };
  }
  if (quotedRate < 0 || tourismDirhamPerRoomPerNight < 0) {
    return { error: "Room rate and Tourism Dirham cannot be negative." };
  }

  const stackMultiplier = (1 + MUNICIPALITY_FEE_RATE + SERVICE_CHARGE_RATE) * (1 + VAT_RATE);
  // When the quote is tax-inclusive, work backwards to the base rate so the
  // fee lines still show what is inside the number.
  const base = rateIncludesTaxes ? quotedRate / stackMultiplier : quotedRate;
  const municipalityFee = base * MUNICIPALITY_FEE_RATE;
  const serviceCharge = base * SERVICE_CHARGE_RATE;
  const vat = (base + municipalityFee + serviceCharge) * VAT_RATE;
  const total = base + municipalityFee + serviceCharge + vat + tourismDirhamPerRoomPerNight;

  return {
    base,
    municipalityFee,
    serviceCharge,
    vat,
    tourismDirham: tourismDirhamPerRoomPerNight,
    total,
  };
}

/**
 * @returns {{error:string}|object} full budget with per-line, per-person and per-day figures
 */
export function buildDubaiBudget({
  travellers,
  nights,
  peoplePerRoom,
  quotedRoomRate,
  tourismDirhamPerRoomPerNight,
  rateIncludesTaxes = false,
  foodPerPersonPerDay,
  transportPerPersonPerDay,
  activitiesPerPersonPerDay,
  returnFarePerPerson,
  attractionsPerPerson = 0,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCap = 0,
}) {
  const numbers = [
    travellers,
    nights,
    peoplePerRoom,
    quotedRoomRate,
    tourismDirhamPerRoomPerNight,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    attractionsPerPerson,
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
    tourismDirhamPerRoomPerNight,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    attractionsPerPerson,
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

  const night = priceOneRoomNight({
    quotedRate: seasonalRate,
    tourismDirhamPerRoomPerNight,
    rateIncludesTaxes,
  });
  if (night.error) return { error: night.error };

  const roomNights = rooms * nights;
  const stayBase = night.base * roomNights;
  const municipalityFee = night.municipalityFee * roomNights;
  const serviceCharge = night.serviceCharge * roomNights;
  const vat = night.vat * roomNights;
  const tourismDirham = night.tourismDirham * roomNights;
  const stayTotal = stayBase + municipalityFee + serviceCharge + vat + tourismDirham;

  const flights = travellers * returnFarePerPerson;
  const food = travellers * days * foodPerPersonPerDay;
  const transport = travellers * days * transportPerPersonPerDay;
  const activities = travellers * days * activitiesPerPersonPerDay;
  const attractions = travellers * attractionsPerPerson;

  const subtotal = flights + stayTotal + food + transport + activities + attractions;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const lines = [
    { key: "flights", label: "Flights to Dubai", amount: flights, note: `${travellers} x return fare` },
    { key: "stay", label: "Room, before fees", amount: stayBase, note: `${rooms} room(s) x ${nights} night(s)` },
    {
      key: "municipality",
      label: `Municipality fee (${Math.round(MUNICIPALITY_FEE_RATE * 100)}%)`,
      amount: municipalityFee,
      note: "on the room rate",
    },
    {
      key: "service",
      label: `Service charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`,
      amount: serviceCharge,
      note: "on the room rate",
    },
    {
      key: "vat",
      label: `VAT (${Math.round(VAT_RATE * 100)}%)`,
      amount: vat,
      note: "on room plus both fees",
    },
    {
      key: "tourism",
      label: "Tourism Dirham",
      amount: tourismDirham,
      note: `${night.tourismDirham} AED per room per night`,
    },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    { key: "transport", label: "Metro, taxis and transfers", amount: transport, note: `${travellers} x ${days} day(s)` },
    { key: "activities", label: "Daily activities", amount: activities, note: `${travellers} x ${days} day(s)` },
    { key: "attractions", label: "Attraction tickets", amount: attractions, note: "one-off, per person" },
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
  const hotelExtrasTotal = municipalityFee + serviceCharge + vat + tourismDirham;
  const hotelExtrasPct = stayBase > 0 ? (hotelExtrasTotal / stayBase) * 100 : 0;

  const dailyVariable =
    travellers * (foodPerPersonPerDay + transportPerPersonPerDay + activitiesPerPersonPerDay);
  const nightlyRoomAllIn = rooms * night.total;
  const costOfOneMoreNight = (dailyVariable + nightlyRoomAllIn) * (1 + contingencyPct / 100);
  const fixedCosts = flights + attractions;

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
    notes.push("Zero nights is a stopover: no room and no Tourism Dirham, and daily spends count for one day.");
  }
  if (nights > 0 && stayBase > 0) {
    notes.push(
      `Fees add ${Math.round(hotelExtrasPct)}% to the quoted room line: ${Math.round(hotelExtrasTotal)} AED on top of ${Math.round(stayBase)} AED.`,
    );
  }
  if (rateIncludesTaxes) {
    notes.push(
      "You told the tool the quote already includes the fees, so it worked backwards to the base rate — the fee lines show what is inside your quoted number rather than being added to it.",
    );
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, and the Tourism Dirham is charged per room, so the extra room costs more than the sharing rate implies.`,
    );
  }
  if (seasonFactor < 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the base room at about ${Math.round(seasonalRate)} AED a night. Dubai discounts hardest in the summer heat, when much of the day is spent indoors.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the base room at about ${Math.round(seasonalRate)} AED a night. New Year week is the sharpest surge of the year.`,
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
    rateIncludesTaxes,
    perRoomNight: night,
    lines,
    flights,
    stayBase,
    municipalityFee,
    serviceCharge,
    vat,
    tourismDirham,
    stayTotal,
    hotelExtrasTotal,
    hotelExtrasPct,
    food,
    transport,
    activities,
    attractions,
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
