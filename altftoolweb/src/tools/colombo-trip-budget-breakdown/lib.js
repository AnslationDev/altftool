/**
 * Colombo trip budget breakdown, for a traveller paying from India.
 *
 * The thing that breaks a Colombo budget is not the exchange rate, it is the bill footer. Hotel
 * and restaurant prices in Sri Lanka are commonly quoted "plus plus" — before the statutory
 * add-ons — and the add-ons compound rather than sum:
 *
 *   gross factor = (1 + service charge) x (1 + SSCL) x (1 + VAT)
 *
 * At the usual 10% service charge, the 2.5% Social Security Contribution Levy and the 18% VAT
 * that took effect on 1 January 2024, that factor is 1.10 x 1.025 x 1.18 = 1.3305 — about 33% on
 * top of the menu price, not the 30.5% you get by adding the three percentages together. Street
 * food, supermarkets and tuk-tuks quote inclusive prices, so the gross-up is applied only to the
 * room and restaurant lines, and only when you tell it the quotes were tax-exclusive.
 *
 * Everything else is the ordinary foreign-trip arithmetic:
 *
 *   days   = nights + 1                          (a 4-night trip is 5 days on the ground)
 *   rooms  = ceil(travellers / people per room)  (half a room cannot be booked)
 *
 *   stay       (LKR) = rooms x nights x room rate x season factor
 *   food       (LKR) = travellers x days x food per person per day
 *   add-ons    (LKR) = (stay + food) x (gross factor - 1)
 *   transport  (LKR) = travellers x days x transport per person per day
 *   activities (LKR) = travellers x days x activities per person per day
 *   shopping   (LKR) = travellers x shopping per person
 *
 *   on-ground (INR) = on-ground (LKR) x rate x (1 + forex markup)
 *   flights, ETA and insurance are paid in India, in rupees, and carry no markup.
 */

/**
 * Sri Lanka's statutory bill add-ons, in percent. VAT rose to 18% on 1 January 2024; the Social
 * Security Contribution Levy is charged on turnover and is usually passed through on the bill; the
 * service charge is a standard hospitality practice rather than a tax. All three are editable
 * because rates and practice change.
 */
export const SRI_LANKA_VAT_PERCENT = 18;
export const SRI_LANKA_SSCL_PERCENT = 2.5;
export const TYPICAL_SERVICE_CHARGE_PERCENT = 10;

/**
 * Starting rates in Sri Lankan rupees, quoted before the bill add-ons, for an ordinary week in
 * Colombo. Airfare is a return economy fare from India, in Indian rupees. Overwrite with quotes.
 */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — guesthouse, rice and curry, buses and shared tuk-tuks",
    stayPerRoomPerNightLkr: 6000,
    foodPerPersonPerDayLkr: 2500,
    transportPerPersonPerDayLkr: 1200,
    activitiesPerPersonPerDayLkr: 1500,
    shoppingPerPersonLkr: 6000,
    returnFareInr: 14000,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 4-star or serviced apartment, restaurants, PickMe rides",
    stayPerRoomPerNightLkr: 22000,
    foodPerPersonPerDayLkr: 6000,
    transportPerPersonPerDayLkr: 3000,
    activitiesPerPersonPerDayLkr: 4000,
    shoppingPerPersonLkr: 20000,
    returnFareInr: 22000,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — Galle Face or Colombo 7 five-star, fine dining, private car",
    stayPerRoomPerNightLkr: 60000,
    foodPerPersonPerDayLkr: 18000,
    transportPerPersonPerDayLkr: 9000,
    activitiesPerPersonPerDayLkr: 10000,
    shoppingPerPersonLkr: 60000,
    returnFareInr: 38000,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor on the room rate only. Colombo and the west coast are driest from December to
 * March, which is also when rates are highest; the southwest monsoon from May to September is the
 * cheap window.
 */
export const SEASONS = [
  { value: "monsoon", label: "Southwest monsoon (May–Sep) — cheapest", factor: 0.75 },
  { value: "inter", label: "Inter-monsoon (Apr, Oct–Nov) — baseline", factor: 1 },
  { value: "dry", label: "Dry season (Dec–Mar) — high season", factor: 1.3 },
  { value: "newyear", label: "Christmas and New Year week — surge", factor: 1.5 },
];

/** All-in cost over the mid-market rate, including GST on an Indian bank's cross-currency fee. */
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash changed in Colombo", markupPercent: 1 },
  { value: "forexcard", label: "Prepaid forex card", markupPercent: 2 },
  { value: "card", label: "Indian debit or credit card abroad", markupPercent: 3.5 },
];

/** Rupees per 1 Sri Lankan rupee. A floating rate — replace it with the rate you are quoted. */
export const DEFAULT_INR_PER_LKR = 0.29;

/** Sri Lanka's ETA fee for Indian visitors has changed repeatedly — keep this editable. */
export const DEFAULT_ETA_FEE_INR = 3000;
export const DEFAULT_INSURANCE_INR = 900;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_PEOPLE_PER_ROOM = 6;
const MAX_LOCAL_AMOUNT = 1000000000; // a billion rupees is not a holiday line item
const MAX_INR_AMOUNT = 100000000; // 10 crore
const MAX_CONTINGENCY_PCT = 100;
const MAX_MARKUP_PCT = 30;
const MAX_ADD_ON_PCT = 100;
const MIN_FX_RATE = 0.000001;
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
 * The compounding multiplier applied to a tax-exclusive Sri Lankan hospitality bill.
 * Service charge first, then SSCL, then VAT on the running total.
 *
 * @returns {number} 1.3305 at 10% / 2.5% / 18%
 */
export function billGrossFactor({ servicePercent, ssclPercent, vatPercent }) {
  return (1 + servicePercent / 100) * (1 + ssclPercent / 100) * (1 + vatPercent / 100);
}

/**
 * @returns {{error:string}|object} the full budget, in Sri Lankan and Indian rupees
 */
export function buildColomboBudget({
  travellers,
  nights,
  peoplePerRoom,
  stayPerRoomPerNightLkr,
  foodPerPersonPerDayLkr,
  transportPerPersonPerDayLkr,
  activitiesPerPersonPerDayLkr,
  shoppingPerPersonLkr,
  returnFareInr,
  etaFeeInr = DEFAULT_ETA_FEE_INR,
  insuranceInr = DEFAULT_INSURANCE_INR,
  inrPerLkr = DEFAULT_INR_PER_LKR,
  markupPercent = 2,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  pricesExcludeTaxes = true,
  servicePercent = TYPICAL_SERVICE_CHARGE_PERCENT,
  ssclPercent = SRI_LANKA_SSCL_PERCENT,
  vatPercent = SRI_LANKA_VAT_PERCENT,
  budgetCapInr = 0,
}) {
  const everything = [
    travellers,
    nights,
    peoplePerRoom,
    stayPerRoomPerNightLkr,
    foodPerPersonPerDayLkr,
    transportPerPersonPerDayLkr,
    activitiesPerPersonPerDayLkr,
    shoppingPerPersonLkr,
    returnFareInr,
    etaFeeInr,
    insuranceInr,
    inrPerLkr,
    markupPercent,
    contingencyPct,
    seasonFactor,
    servicePercent,
    ssclPercent,
    vatPercent,
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

  const lkrFields = [
    stayPerRoomPerNightLkr,
    foodPerPersonPerDayLkr,
    transportPerPersonPerDayLkr,
    activitiesPerPersonPerDayLkr,
    shoppingPerPersonLkr,
  ];
  const inrFields = [returnFareInr, etaFeeInr, insuranceInr, budgetCapInr];
  if ([...lkrFields, ...inrFields].some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
  if (lkrFields.some((value) => value > MAX_LOCAL_AMOUNT)) {
    return { error: "One of the Sri Lankan rupee amounts is unrealistically large — check the figures." };
  }
  if (inrFields.some((value) => value > MAX_INR_AMOUNT)) {
    return { error: "One of the Indian rupee amounts is unrealistically large — check the figures." };
  }
  if (inrPerLkr < MIN_FX_RATE || inrPerLkr > MAX_FX_RATE) {
    return { error: "The exchange rate must be a positive number of Indian rupees per Sri Lankan rupee." };
  }
  if (
    servicePercent < 0 ||
    servicePercent > MAX_ADD_ON_PCT ||
    ssclPercent < 0 ||
    ssclPercent > MAX_ADD_ON_PCT ||
    vatPercent < 0 ||
    vatPercent > MAX_ADD_ON_PCT
  ) {
    return { error: `Service charge, SSCL and VAT must each be between 0% and ${MAX_ADD_ON_PCT}%.` };
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
  const seasonalRoomRateLkr = stayPerRoomPerNightLkr * seasonFactor;

  const grossFactor = pricesExcludeTaxes
    ? billGrossFactor({ servicePercent, ssclPercent, vatPercent })
    : 1;

  const stayNetLkr = rooms * nights * seasonalRoomRateLkr;
  const foodNetLkr = travellers * days * foodPerPersonPerDayLkr;
  const addOnsLkr = (stayNetLkr + foodNetLkr) * (grossFactor - 1);
  const transportLkr = travellers * days * transportPerPersonPerDayLkr;
  const activitiesLkr = travellers * days * activitiesPerPersonPerDayLkr;
  const shoppingLkr = travellers * shoppingPerPersonLkr;
  const onGroundLkr =
    stayNetLkr + foodNetLkr + addOnsLkr + transportLkr + activitiesLkr + shoppingLkr;

  const markupFactor = 1 + markupPercent / 100;
  const effectiveRate = inrPerLkr * markupFactor;
  const onGroundInrAtMid = onGroundLkr * inrPerLkr;
  const forexMarkupInr = onGroundInrAtMid * (markupPercent / 100);
  const onGroundInr = onGroundInrAtMid + forexMarkupInr;

  const flightsInr = travellers * returnFareInr;
  const entryInr = travellers * (etaFeeInr + insuranceInr);

  const subtotalInr = flightsInr + entryInr + onGroundInr;
  const contingencyInr = (subtotalInr * contingencyPct) / 100;
  const totalInr = subtotalInr + contingencyInr;

  const lines = [
    {
      key: "flights",
      label: "Return flights",
      lkr: 0,
      inr: flightsInr,
      note: `${travellers} x return fare, booked in rupees`,
    },
    {
      key: "entry",
      label: "ETA and insurance",
      lkr: 0,
      inr: entryInr,
      note: "one-off, per person",
    },
    {
      key: "stay",
      label: "Stay (before add-ons)",
      lkr: stayNetLkr,
      inr: stayNetLkr * effectiveRate,
      note: `${rooms} room(s) x ${nights} night(s)`,
    },
    {
      key: "food",
      label: "Food and drink (before add-ons)",
      lkr: foodNetLkr,
      inr: foodNetLkr * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "addons",
      label: "Service charge, SSCL and VAT",
      lkr: addOnsLkr,
      inr: addOnsLkr * effectiveRate,
      note: pricesExcludeTaxes
        ? `${servicePercent}% then ${ssclPercent}% then ${vatPercent}%, compounded on stay and food`
        : "prices entered are already inclusive",
    },
    {
      key: "transport",
      label: "Local transport",
      lkr: transportLkr,
      inr: transportLkr * effectiveRate,
      note: `tuk-tuks, PickMe and trains — ${travellers} x ${days} day(s)`,
    },
    {
      key: "activities",
      label: "Activities and entry tickets",
      lkr: activitiesLkr,
      inr: activitiesLkr * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "shopping",
      label: "Shopping",
      lkr: shoppingLkr,
      inr: shoppingLkr * effectiveRate,
      note: "one-off, per person",
    },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      lkr: 0,
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
  const dailyOnGroundLkr =
    travellers *
    (foodPerPersonPerDayLkr * grossFactor +
      transportPerPersonPerDayLkr +
      activitiesPerPersonPerDayLkr);
  const nightlyRoomLkr = rooms * seasonalRoomRateLkr * grossFactor;
  const costOfOneMoreNightInr =
    (dailyOnGroundLkr + nightlyRoomLkr) * effectiveRate * (1 + contingencyPct / 100);
  const fixedInr = flightsInr + entryInr;

  // total(n) = (fixed + rate x [daily x (n+1) + room x n + shopping]) x (1 + c).
  // Solve total(n) <= cap for the largest whole n.
  let nightsAffordable = null;
  let budgetGapInr = null;
  if (budgetCapInr > 0) {
    budgetGapInr = budgetCapInr - totalInr;
    const oneOffOnGroundInr = shoppingLkr * effectiveRate;
    const perNightInr = (dailyOnGroundLkr + nightlyRoomLkr) * effectiveRate;
    const capBeforeBuffer = budgetCapInr / (1 + contingencyPct / 100);
    const headroom =
      capBeforeBuffer - fixedInr - oneOffOnGroundInr - dailyOnGroundLkr * effectiveRate;
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
  if (pricesExcludeTaxes) {
    notes.push(
      `The add-ons multiply rather than add: ${servicePercent}% service, then ${ssclPercent}% SSCL, then ${vatPercent}% VAT works out at ${((grossFactor - 1) * 100).toFixed(2)}% on top of the quoted price, not ${(servicePercent + ssclPercent + vatPercent).toFixed(1)}%. That is ${Math.round(addOnsLkr)} Sri Lankan rupees on this trip.`,
    );
  } else {
    notes.push(
      "Prices are being treated as tax-inclusive. Hotel and restaurant rates in Sri Lanka are often quoted before service charge and taxes — check whether your quote says \"nett\" or \"++\".",
    );
  }
  if (markupPercent >= 3) {
    notes.push(
      `A ${markupPercent}% markup adds about ₹${Math.round(forexMarkupInr)} to this trip. Bank counters in Colombo generally beat the airport, and if a card machine offers to bill you in Indian rupees, decline.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about ${Math.round(seasonalRoomRateLkr)} Sri Lankan rupees a night before add-ons.`,
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
    seasonalRoomRateLkr,
    inrPerLkr,
    markupPercent,
    effectiveRate,
    grossFactor,
    grossUpPercent: (grossFactor - 1) * 100,
    lines,
    stayNetLkr,
    foodNetLkr,
    addOnsLkr,
    transportLkr,
    activitiesLkr,
    shoppingLkr,
    onGroundLkr,
    onGroundLkrPerPerson: onGroundLkr / travellers,
    onGroundInr,
    forexMarkupInr,
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
