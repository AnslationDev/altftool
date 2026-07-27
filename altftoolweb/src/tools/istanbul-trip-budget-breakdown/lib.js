/**
 * Istanbul trip budget breakdown, for a traveller paying from India.
 *
 * Two things make Istanbul different from an ordinary foreign-trip budget:
 *
 * 1. THE LIRA MOVES. Turkish consumer prices have risen fast for years while the lira has fallen
 *    against other currencies. A quote you read today is therefore wrong twice over by the time
 *    you travel: menu prices are higher, and each lira costs fewer rupees. The two effects push in
 *    opposite directions, so this model applies both and reports only the net.
 *
 *      local price at travel      = today's price x (1 + monthly inflation)^months
 *      rupees per lira at travel  = today's rate  / (1 + monthly depreciation)^months
 *      drift factor               = (1 + i)^m / (1 + d)^m
 *
 *    When inflation and depreciation run at the same monthly pace the factor is 1 and the trip
 *    costs the same in rupees no matter when you go — which is roughly what "purchasing power
 *    parity" would predict, and roughly what Turkey has looked like in some years and not others.
 *
 * 2. TRANSPORT IS PRICED PER RIDE. Istanbul runs on the Istanbulkart: you buy the card once, then
 *    tap for each metro, tram, funicular, bus or ferry ride, with cheaper transfers inside a
 *    two-hour window. Budgeting a flat "transport per day" hides the fact that the bill is
 *    rides x fare, and that crossing the Bosphorus by public ferry costs one ride.
 *
 * Everything else is the ordinary arithmetic:
 *
 *   days  = nights + 1                          (a 4-night trip is 5 days on the ground)
 *   rooms = ceil(travellers / people per room)  (half a room cannot be booked)
 *
 *   stay      (TRY) = rooms x nights x room rate x season factor
 *   food      (TRY) = travellers x days x food per person per day
 *   transport (TRY) = travellers x [days x (rides per day x fare + taxi per day) + card cost]
 *   sights    (TRY) = travellers x days x sights per person per day
 *   shopping  (TRY) = travellers x shopping per person
 *
 *   effective rupees per lira = today's rate x (1 + forex markup) x drift factor
 */

/** Rupees per 1 Turkish lira. The lira is volatile — always replace this with today's rate. */
export const DEFAULT_INR_PER_TRY = 2;

/**
 * Default drift assumptions, in percent per month. Turkish annual consumer inflation has run well
 * into double digits for years while the lira has slid against major currencies at a broadly
 * similar pace. Both fields are assumptions, not forecasts — set them from the latest TurkStat
 * inflation print and the recent trend in the rupee-lira rate.
 */
export const DEFAULT_MONTHLY_INFLATION_PCT = 2.5;
export const DEFAULT_MONTHLY_DEPRECIATION_PCT = 2;

/** Istanbulkart figures, in lira. The card is bought once; every ride is then deducted from it. */
export const DEFAULT_CARD_COST_TRY = 130;
export const DEFAULT_FARE_PER_RIDE_TRY = 27;

/**
 * Starting rates in Turkish lira at today's prices, for an ordinary week. Airfare is a return
 * economy fare from an Indian metro, in rupees. Overwrite everything with real quotes.
 */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — hostel or pansiyon, lokanta food, all public transport",
    stayPerRoomPerNightTry: 900,
    foodPerPersonPerDayTry: 500,
    sightsPerPersonPerDayTry: 400,
    shoppingPerPersonTry: 2000,
    ridesPerPersonPerDay: 4,
    taxiPerPersonPerDayTry: 0,
    returnFareInr: 24000,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 4-star in Sultanahmet or Beyoğlu, restaurants, tram and ferry",
    stayPerRoomPerNightTry: 3000,
    foodPerPersonPerDayTry: 1400,
    sightsPerPersonPerDayTry: 1200,
    shoppingPerPersonTry: 6000,
    ridesPerPersonPerDay: 4,
    taxiPerPersonPerDayTry: 200,
    returnFareInr: 32000,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — Bosphorus 5-star, restaurants, private guide and car",
    stayPerRoomPerNightTry: 9000,
    foodPerPersonPerDayTry: 3500,
    sightsPerPersonPerDayTry: 3000,
    shoppingPerPersonTry: 18000,
    ridesPerPersonPerDay: 1,
    taxiPerPersonPerDayTry: 1500,
    returnFareInr: 60000,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor on the room rate only. Istanbul's shoulder months are the busiest and dearest,
 * high summer is hot and slightly softer, and winter is genuinely cheap apart from the New Year
 * and the Bayram holidays.
 */
export const SEASONS = [
  { value: "winter", label: "Winter (Nov–Mar, not holidays) — cheapest", factor: 0.75 },
  { value: "summer", label: "High summer (Jul–Aug) — hot", factor: 1.15 },
  { value: "shoulder", label: "Shoulder (Apr–Jun, Sep–Oct) — busiest", factor: 1.35 },
  { value: "holiday", label: "New Year or Bayram week — surge", factor: 1.5 },
];

/** All-in cost over the mid-market rate, including GST on an Indian bank's cross-currency fee. */
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash changed at an Istanbul döviz booth", markupPercent: 1 },
  { value: "forexcard", label: "Prepaid forex card", markupPercent: 2 },
  { value: "card", label: "Indian debit or credit card abroad", markupPercent: 3.5 },
];

export const DEFAULT_VISA_FEE_INR = 4000;
export const DEFAULT_INSURANCE_INR = 1200;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_PEOPLE_PER_ROOM = 6;
const MAX_RIDES_PER_DAY = 20;
const MAX_MONTHS_AHEAD = 36;
const MAX_MONTHLY_RATE_PCT = 20;
const MAX_LOCAL_AMOUNT = 100000000;
const MAX_INR_AMOUNT = 100000000;
const MAX_CONTINGENCY_PCT = 100;
const MAX_MARKUP_PCT = 30;
const MIN_FX_RATE = 0.0001;
const MAX_FX_RATE = 10000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASONS.find((season) => season.value === value) ?? SEASONS[1];
}

export function paymentByValue(value) {
  return PAYMENT_METHODS.find((method) => method.value === value) ?? PAYMENT_METHODS[1];
}

/**
 * Net effect on the rupee cost of a lira-priced basket bought `months` from now.
 *
 * @returns {{factor:number, priceIndex:number, rateIndex:number, netAnnualPct:number}}
 */
export function liraDriftFactor({ months, monthlyInflationPct, monthlyDepreciationPct }) {
  const priceIndex = Math.pow(1 + monthlyInflationPct / 100, months);
  const rateIndex = Math.pow(1 + monthlyDepreciationPct / 100, months);
  const factor = priceIndex / rateIndex;
  const monthlyNet = (1 + monthlyInflationPct / 100) / (1 + monthlyDepreciationPct / 100) - 1;
  return {
    factor,
    priceIndex,
    rateIndex,
    netAnnualPct: (Math.pow(1 + monthlyNet, 12) - 1) * 100,
  };
}

/**
 * @returns {{error:string}|object} the full budget, in lira and in rupees
 */
export function buildIstanbulBudget({
  travellers,
  nights,
  peoplePerRoom,
  stayPerRoomPerNightTry,
  foodPerPersonPerDayTry,
  sightsPerPersonPerDayTry,
  shoppingPerPersonTry,
  ridesPerPersonPerDay,
  farePerRideTry = DEFAULT_FARE_PER_RIDE_TRY,
  cardCostTry = DEFAULT_CARD_COST_TRY,
  taxiPerPersonPerDayTry = 0,
  returnFareInr,
  visaFeeInr = DEFAULT_VISA_FEE_INR,
  insuranceInr = DEFAULT_INSURANCE_INR,
  inrPerTry = DEFAULT_INR_PER_TRY,
  monthsUntilTravel = 0,
  monthlyInflationPct = DEFAULT_MONTHLY_INFLATION_PCT,
  monthlyDepreciationPct = DEFAULT_MONTHLY_DEPRECIATION_PCT,
  markupPercent = 2,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCapInr = 0,
}) {
  const everything = [
    travellers,
    nights,
    peoplePerRoom,
    stayPerRoomPerNightTry,
    foodPerPersonPerDayTry,
    sightsPerPersonPerDayTry,
    shoppingPerPersonTry,
    ridesPerPersonPerDay,
    farePerRideTry,
    cardCostTry,
    taxiPerPersonPerDayTry,
    returnFareInr,
    visaFeeInr,
    insuranceInr,
    inrPerTry,
    monthsUntilTravel,
    monthlyInflationPct,
    monthlyDepreciationPct,
    markupPercent,
    contingencyPct,
    seasonFactor,
    budgetCapInr,
  ];
  if (!everything.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(travellers) || travellers < 1 || travellers > MAX_TRAVELLERS) {
    return { error: `Travellers must be a whole number from 1 to ${MAX_TRAVELLERS}.` };
  }
  if (!Number.isInteger(nights) || nights < 0 || nights > MAX_NIGHTS) {
    return { error: `Nights must be a whole number from 0 to ${MAX_NIGHTS}.` };
  }
  if (!Number.isInteger(peoplePerRoom) || peoplePerRoom < 1 || peoplePerRoom > MAX_PEOPLE_PER_ROOM) {
    return { error: `People per room must be a whole number from 1 to ${MAX_PEOPLE_PER_ROOM}.` };
  }
  if (ridesPerPersonPerDay < 0 || ridesPerPersonPerDay > MAX_RIDES_PER_DAY) {
    return { error: `Rides per person per day must be between 0 and ${MAX_RIDES_PER_DAY}.` };
  }
  if (monthsUntilTravel < 0 || monthsUntilTravel > MAX_MONTHS_AHEAD) {
    return { error: `Months until travel must be between 0 and ${MAX_MONTHS_AHEAD}.` };
  }
  if (
    monthlyInflationPct < 0 ||
    monthlyInflationPct > MAX_MONTHLY_RATE_PCT ||
    monthlyDepreciationPct < 0 ||
    monthlyDepreciationPct > MAX_MONTHLY_RATE_PCT
  ) {
    return { error: `Monthly inflation and depreciation must each be between 0% and ${MAX_MONTHLY_RATE_PCT}%.` };
  }

  const liraFields = [
    stayPerRoomPerNightTry,
    foodPerPersonPerDayTry,
    sightsPerPersonPerDayTry,
    shoppingPerPersonTry,
    farePerRideTry,
    cardCostTry,
    taxiPerPersonPerDayTry,
  ];
  const rupeeFields = [returnFareInr, visaFeeInr, insuranceInr, budgetCapInr];
  if ([...liraFields, ...rupeeFields].some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
  if (liraFields.some((value) => value > MAX_LOCAL_AMOUNT)) {
    return { error: "One of the lira amounts is unrealistically large — check the figures." };
  }
  if (rupeeFields.some((value) => value > MAX_INR_AMOUNT)) {
    return { error: "One of the rupee amounts is unrealistically large — check the figures." };
  }
  if (inrPerTry < MIN_FX_RATE || inrPerTry > MAX_FX_RATE) {
    return { error: "The exchange rate must be a positive number of rupees per lira." };
  }
  if (markupPercent < 0 || markupPercent > MAX_MARKUP_PCT) {
    return { error: `Forex markup must be between 0% and ${MAX_MARKUP_PCT}%.` };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (seasonFactor <= 0 || seasonFactor > 10) {
    return { error: "Season factor must be greater than 0 and at most 10." };
  }

  const days = nights + 1;
  const rooms = Math.ceil(travellers / peoplePerRoom);
  const seasonalRoomRateTry = stayPerRoomPerNightTry * seasonFactor;

  const stayTry = rooms * nights * seasonalRoomRateTry;
  const foodTry = travellers * days * foodPerPersonPerDayTry;
  const ridesTry = travellers * days * ridesPerPersonPerDay * farePerRideTry;
  const taxiTry = travellers * days * taxiPerPersonPerDayTry;
  const cardTry = travellers * cardCostTry;
  const transportTry = ridesTry + taxiTry + cardTry;
  const sightsTry = travellers * days * sightsPerPersonPerDayTry;
  const shoppingTry = travellers * shoppingPerPersonTry;
  const onGroundTry = stayTry + foodTry + transportTry + sightsTry + shoppingTry;

  const drift = liraDriftFactor({
    months: monthsUntilTravel,
    monthlyInflationPct,
    monthlyDepreciationPct,
  });
  // The drift expressed the way it reads on screen: the percentage change in rupee terms.
  drift.percent = (drift.factor - 1) * 100;

  const markupFactor = 1 + markupPercent / 100;
  const effectiveRate = inrPerTry * markupFactor * drift.factor;
  const onGroundInrToday = onGroundTry * inrPerTry;
  const onGroundInr = onGroundTry * effectiveRate;
  const forexMarkupInr = onGroundTry * inrPerTry * drift.factor * (markupPercent / 100);
  const driftCostInr = onGroundTry * inrPerTry * (drift.factor - 1);

  const flightsInr = travellers * returnFareInr;
  const entryInr = travellers * (visaFeeInr + insuranceInr);

  const subtotalInr = flightsInr + entryInr + onGroundInr;
  const contingencyInr = (subtotalInr * contingencyPct) / 100;
  const totalInr = subtotalInr + contingencyInr;

  const lines = [
    {
      key: "flights",
      label: "Return flights",
      lira: 0,
      inr: flightsInr,
      note: `${travellers} x return fare, booked in rupees`,
    },
    {
      key: "entry",
      label: "e-Visa and insurance",
      lira: 0,
      inr: entryInr,
      note: "one-off, per person",
    },
    {
      key: "stay",
      label: "Stay",
      lira: stayTry,
      inr: stayTry * effectiveRate,
      note: `${rooms} room(s) x ${nights} night(s)`,
    },
    {
      key: "food",
      label: "Food and drink",
      lira: foodTry,
      inr: foodTry * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "transport",
      label: "Transport",
      lira: transportTry,
      inr: transportTry * effectiveRate,
      note: `${ridesPerPersonPerDay} Istanbulkart ride(s) a day plus taxis, and ${travellers} card(s)`,
    },
    {
      key: "sights",
      label: "Sights and tickets",
      lira: sightsTry,
      inr: sightsTry * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "shopping",
      label: "Shopping and the bazaars",
      lira: shoppingTry,
      inr: shoppingTry * effectiveRate,
      note: "one-off, per person",
    },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      lira: 0,
      inr: contingencyInr,
      note: "buffer on everything above",
    },
  ].map((line) => ({
    ...line,
    perPersonInr: line.inr / travellers,
    share: totalInr > 0 ? (line.inr / totalInr) * 100 : 0,
  }));

  const perPersonInr = totalInr / travellers;
  const perPersonPerDayInr = perPersonInr / days;
  const dailyOnGroundTry =
    travellers *
    (foodPerPersonPerDayTry +
      sightsPerPersonPerDayTry +
      ridesPerPersonPerDay * farePerRideTry +
      taxiPerPersonPerDayTry);
  const nightlyRoomTry = rooms * seasonalRoomRateTry;
  const costOfOneMoreNightInr =
    (dailyOnGroundTry + nightlyRoomTry) * effectiveRate * (1 + contingencyPct / 100);
  const fixedInr = flightsInr + entryInr;

  // total(n) = (fixed + rate x [daily x (n+1) + room x n + one-offs]) x (1 + c).
  // Solve total(n) <= cap for the largest whole n.
  let nightsAffordable = null;
  let budgetGapInr = null;
  if (budgetCapInr > 0) {
    budgetGapInr = budgetCapInr - totalInr;
    const oneOffOnGroundInr = (shoppingTry + cardTry) * effectiveRate;
    const perNightInr = (dailyOnGroundTry + nightlyRoomTry) * effectiveRate;
    const capBeforeBuffer = budgetCapInr / (1 + contingencyPct / 100);
    const headroom =
      capBeforeBuffer - fixedInr - oneOffOnGroundInr - dailyOnGroundTry * effectiveRate;
    nightsAffordable = perNightInr > 0 ? Math.max(0, Math.floor(headroom / perNightInr)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights is a layover day trip: no room cost, and daily spends count for one day.");
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the shared rate suggests.`,
    );
  }
  if (monthsUntilTravel > 0) {
    const direction = drift.factor > 1 ? "more" : "less";
    notes.push(
      `Over ${monthsUntilTravel} month(s), lira prices rise about ${Math.round((drift.priceIndex - 1) * 100)}% while the lira loses about ${Math.round((1 - 1 / drift.rateIndex) * 100)}% against the rupee, so the same basket costs roughly ${Math.abs(Math.round((drift.factor - 1) * 100))}% ${direction} in rupees. Book the room now and pay for food later, or the reverse, depending on which way you think that goes.`,
    );
  }
  if (ridesPerPersonPerDay >= 4) {
    notes.push(
      `At ${ridesPerPersonPerDay} rides a day the Istanbulkart pays for itself quickly. Transfers made within two hours of the first tap are discounted, and one card can be tapped for several people.`,
    );
  }
  if (markupPercent >= 3) {
    notes.push(
      `A ${markupPercent}% markup adds about ₹${Math.round(forexMarkupInr)} to this trip. Döviz booths in Istanbul are competitive; if a card machine offers to bill you in rupees, decline.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about ₺${Math.round(seasonalRoomRateTry)} a night at today's prices.`,
    );
  }
  if (budgetCapInr > 0 && budgetGapInr !== null && budgetGapInr < 0) {
    notes.push(
      `The plan is over the cap. ${nightsAffordable} night(s) at the same daily spends brings it back inside.`,
    );
  }

  return {
    travellers,
    nights,
    days,
    rooms,
    seasonFactor,
    seasonalRoomRateTry,
    inrPerTry,
    markupPercent,
    effectiveRate,
    drift,
    lines,
    stayTry,
    foodTry,
    transportTry,
    ridesTry,
    taxiTry,
    cardTry,
    istanbulkartTry: ridesTry + cardTry,
    sightsTry,
    shoppingTry,
    onGroundTry,
    onGroundTryPerPerson: onGroundTry / travellers,
    onGroundInr,
    onGroundInrToday,
    forexMarkupInr,
    driftCostInr,
    flightsInr,
    entryInr,
    subtotalInr,
    contingencyInr,
    totalInr,
    perPersonInr,
    perPersonPerDayInr,
    fixedInr,
    costOfOneMoreNightInr,
    budgetCapInr,
    budgetGapInr,
    nightsAffordable,
    notes,
  };
}
