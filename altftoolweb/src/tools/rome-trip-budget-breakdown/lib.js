/**
 * Rome trip budget breakdown, for a traveller paying from India.
 *
 * The bill splits into three parts that behave differently:
 *
 *   Paid in India, in rupees  -> return airfare, travel insurance, visa service charge
 *   An official fee in euro   -> the Schengen short-stay visa fee, collected at the mid rate
 *   Spent in Rome, in euro    -> room, food, transport, sights, shopping, city tax, cover charges
 *
 * Only the third block carries a forex markup, because that is the block paid on a card or with
 * changed cash. An Indian debit or credit card abroad typically costs 3–3.5% over the mid-market
 * rate plus GST on that fee; a prepaid forex card is loaded at roughly 1–2%.
 *
 *   days   = nights + 1                          (a 4-night trip is 5 days on the ground)
 *   rooms  = ceil(travellers / people per room)  (half a room cannot be booked)
 *
 *   stay       (EUR) = rooms x nights x room rate x season factor
 *   food       (EUR) = travellers x days x food per person per day
 *   transport  (EUR) = travellers x days x transport per person per day
 *   sights     (EUR) = travellers x days x sights per person per day
 *   shopping   (EUR) = travellers x shopping per person
 *   city tax   (EUR) = liable travellers x min(nights, 10) x nightly rate
 *   coperto    (EUR) = travellers x days x sit-down meals per day x cover charge
 *
 * Two Rome-specific lines are separated out because visitors routinely miss them:
 *
 *   1. The contributo di soggiorno — Rome's tourist tax. It is charged per person per night by
 *      accommodation category, is normally collected in cash at the property and not by the
 *      booking site, is capped at 10 consecutive nights, and exempts young children. The city
 *      sets and revises the rates, so they stay editable here.
 *   2. The coperto — the per-person cover charge an Italian restaurant adds for the table, bread
 *      and service. It has to be shown on the menu, and it is charged per person per sitting, so
 *      it scales with meals rather than with the size of the bill.
 */

/** Rome caps the tourist tax at this many consecutive nights at one property. */
export const CITY_TAX_MAX_NIGHTS = 10;

/** Rome exempts children below this age from the tourist tax. */
export const CITY_TAX_EXEMPT_AGE = 10;

/**
 * Nightly tourist-tax rates by accommodation category, in euro per person per night. Rome revises
 * these by council resolution, so treat them as starting values and confirm the rate on your
 * booking confirmation.
 */
export const LODGING_TYPES = [
  { value: "hostel", label: "Hostel or 1-star", cityTaxPerPersonPerNightEur: 4 },
  { value: "midhotel", label: "2–3 star hotel, B&B or apartment", cityTaxPerPersonPerNightEur: 6 },
  { value: "fourstar", label: "4-star hotel", cityTaxPerPersonPerNightEur: 7.5 },
  { value: "fivestar", label: "5-star hotel", cityTaxPerPersonPerNightEur: 10 },
];

/**
 * The Schengen short-stay visa fee, in euro, for an adult applicant. Children aged 6 to 11 pay a
 * reduced fee and under-6s are exempt; a VFS or outsourcing service charge is paid separately in
 * rupees. Fees are revised periodically — check the current consular schedule.
 */
export const SCHENGEN_ADULT_VISA_FEE_EUR = 90;
export const DEFAULT_VISA_SERVICE_INR = 2000;

/**
 * Starting rates in euro for Rome in an ordinary week. Airfare is a return economy fare from an
 * Indian metro, in rupees. Overwrite everything with real quotes.
 */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — hostel or cheap guesthouse, pizza al taglio, metro and walking",
    stayPerRoomPerNightEur: 60,
    foodPerPersonPerDayEur: 30,
    transportPerPersonPerDayEur: 6,
    sightsPerPersonPerDayEur: 15,
    shoppingPerPersonEur: 100,
    sitDownMealsPerDay: 1,
    returnFareInr: 45000,
    peoplePerRoom: 2,
    lodging: "hostel",
  },
  {
    value: "comfort",
    label: "Comfort — 3-star or central apartment, trattorias, metro plus the odd taxi",
    stayPerRoomPerNightEur: 160,
    foodPerPersonPerDayEur: 65,
    transportPerPersonPerDayEur: 10,
    sightsPerPersonPerDayEur: 35,
    shoppingPerPersonEur: 300,
    sitDownMealsPerDay: 2,
    returnFareInr: 60000,
    peoplePerRoom: 2,
    lodging: "midhotel",
  },
  {
    value: "premium",
    label: "Premium — 5-star near the centro storico, restaurants, private guides and cars",
    stayPerRoomPerNightEur: 400,
    foodPerPersonPerDayEur: 150,
    transportPerPersonPerDayEur: 40,
    sightsPerPersonPerDayEur: 90,
    shoppingPerPersonEur: 900,
    sitDownMealsPerDay: 2,
    returnFareInr: 110000,
    peoplePerRoom: 2,
    lodging: "fivestar",
  },
];

/**
 * Season factor on the room rate only. Rome's spring and early-autumn shoulder months are the
 * busiest, August is hot and empties out, and deep winter is the cheapest apart from the holidays.
 */
export const SEASONS = [
  { value: "winter", label: "Low season (Nov–Mar, not holidays) — cheapest", factor: 0.75 },
  { value: "august", label: "August — hot, city half shut", factor: 1 },
  { value: "high", label: "High season (Apr–Jun, Sep–Oct)", factor: 1.35 },
  { value: "holiday", label: "Easter, Christmas or New Year week — surge", factor: 1.6 },
];

/** All-in cost over the mid-market rate, including GST on an Indian bank's cross-currency fee. */
export const PAYMENT_METHODS = [
  { value: "cash", label: "Euro cash bought in India", markupPercent: 1.5 },
  { value: "forexcard", label: "Prepaid forex card", markupPercent: 2 },
  { value: "card", label: "Indian debit or credit card abroad", markupPercent: 3.5 },
];

/** Rupees per 1 euro. A floating rate — replace it with the rate you are quoted. */
export const DEFAULT_INR_PER_EUR = 94;

/** A Roman restaurant's per-person cover charge, in euro. Must be printed on the menu. */
export const DEFAULT_COPERTO_EUR = 2.5;
export const DEFAULT_INSURANCE_INR = 2500;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_PEOPLE_PER_ROOM = 6;
const MAX_MEALS_PER_DAY = 6;
const MAX_LOCAL_AMOUNT = 1000000; // one million euro is not a holiday line item
const MAX_INR_AMOUNT = 100000000; // 10 crore
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

export function lodgingByValue(value) {
  return LODGING_TYPES.find((type) => type.value === value) ?? LODGING_TYPES[1];
}

/**
 * Rome tourist tax for one stay.
 *
 * @returns {{nightsCharged:number, liable:number, totalEur:number}}
 */
export function cityTaxForStay({ travellers, exemptTravellers, nights, ratePerPersonPerNightEur }) {
  const liable = Math.max(0, travellers - exemptTravellers);
  const nightsCharged = Math.min(nights, CITY_TAX_MAX_NIGHTS);
  return {
    liable,
    nightsCharged,
    totalEur: liable * nightsCharged * ratePerPersonPerNightEur,
  };
}

/**
 * @returns {{error:string}|object} the full budget, in euro and in rupees
 */
export function buildRomeBudget({
  travellers,
  nights,
  peoplePerRoom,
  stayPerRoomPerNightEur,
  foodPerPersonPerDayEur,
  transportPerPersonPerDayEur,
  sightsPerPersonPerDayEur,
  shoppingPerPersonEur,
  sitDownMealsPerDay,
  copertoPerPersonEur = DEFAULT_COPERTO_EUR,
  cityTaxPerPersonPerNightEur,
  cityTaxExemptTravellers = 0,
  returnFareInr,
  visaFeeEur = SCHENGEN_ADULT_VISA_FEE_EUR,
  visaServiceInr = DEFAULT_VISA_SERVICE_INR,
  insuranceInr = DEFAULT_INSURANCE_INR,
  inrPerEur = DEFAULT_INR_PER_EUR,
  markupPercent = 2,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCapInr = 0,
}) {
  const everything = [
    travellers,
    nights,
    peoplePerRoom,
    stayPerRoomPerNightEur,
    foodPerPersonPerDayEur,
    transportPerPersonPerDayEur,
    sightsPerPersonPerDayEur,
    shoppingPerPersonEur,
    sitDownMealsPerDay,
    copertoPerPersonEur,
    cityTaxPerPersonPerNightEur,
    cityTaxExemptTravellers,
    returnFareInr,
    visaFeeEur,
    visaServiceInr,
    insuranceInr,
    inrPerEur,
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
  if (
    !Number.isInteger(cityTaxExemptTravellers) ||
    cityTaxExemptTravellers < 0 ||
    cityTaxExemptTravellers > travellers
  ) {
    return { error: "Tourist-tax exempt travellers must be a whole number, and cannot exceed the group." };
  }
  if (sitDownMealsPerDay < 0 || sitDownMealsPerDay > MAX_MEALS_PER_DAY) {
    return { error: `Sit-down meals per day must be between 0 and ${MAX_MEALS_PER_DAY}.` };
  }

  const euroFields = [
    stayPerRoomPerNightEur,
    foodPerPersonPerDayEur,
    transportPerPersonPerDayEur,
    sightsPerPersonPerDayEur,
    shoppingPerPersonEur,
    copertoPerPersonEur,
    cityTaxPerPersonPerNightEur,
    visaFeeEur,
  ];
  const rupeeFields = [returnFareInr, visaServiceInr, insuranceInr, budgetCapInr];
  if ([...euroFields, ...rupeeFields].some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
  if (euroFields.some((value) => value > MAX_LOCAL_AMOUNT)) {
    return { error: "One of the euro amounts is unrealistically large — check the figures." };
  }
  if (rupeeFields.some((value) => value > MAX_INR_AMOUNT)) {
    return { error: "One of the rupee amounts is unrealistically large — check the figures." };
  }
  if (inrPerEur < MIN_FX_RATE || inrPerEur > MAX_FX_RATE) {
    return { error: "The exchange rate must be a positive number of rupees per euro." };
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
  const seasonalRoomRateEur = stayPerRoomPerNightEur * seasonFactor;

  const stayEur = rooms * nights * seasonalRoomRateEur;
  const foodEur = travellers * days * foodPerPersonPerDayEur;
  const transportEur = travellers * days * transportPerPersonPerDayEur;
  const sightsEur = travellers * days * sightsPerPersonPerDayEur;
  const shoppingEur = travellers * shoppingPerPersonEur;
  const copertoEur = travellers * days * sitDownMealsPerDay * copertoPerPersonEur;
  const cityTax = cityTaxForStay({
    travellers,
    exemptTravellers: cityTaxExemptTravellers,
    nights,
    ratePerPersonPerNightEur: cityTaxPerPersonPerNightEur,
  });
  const cityTaxEur = cityTax.totalEur;

  const onGroundEur =
    stayEur + foodEur + transportEur + sightsEur + shoppingEur + copertoEur + cityTaxEur;

  const markupFactor = 1 + markupPercent / 100;
  const effectiveRate = inrPerEur * markupFactor;
  const onGroundInrAtMid = onGroundEur * inrPerEur;
  const forexMarkupInr = onGroundInrAtMid * (markupPercent / 100);
  const onGroundInr = onGroundInrAtMid + forexMarkupInr;

  const flightsInr = travellers * returnFareInr;
  // The consular fee is collected in rupees at the official rate, so no forex markup applies.
  const visaInr = travellers * (visaFeeEur * inrPerEur + visaServiceInr);
  const insuranceTotalInr = travellers * insuranceInr;

  const subtotalInr = flightsInr + visaInr + insuranceTotalInr + onGroundInr;
  const contingencyInr = (subtotalInr * contingencyPct) / 100;
  const totalInr = subtotalInr + contingencyInr;

  const lines = [
    {
      key: "flights",
      label: "Return flights",
      eur: 0,
      inr: flightsInr,
      note: `${travellers} x return fare, booked in rupees`,
    },
    {
      key: "visa",
      label: "Schengen visa and service charge",
      eur: travellers * visaFeeEur,
      inr: visaInr,
      note: "consular fee plus outsourcing charge, per person",
    },
    {
      key: "insurance",
      label: "Travel insurance",
      eur: 0,
      inr: insuranceTotalInr,
      note: "Schengen applications require cover of at least €30,000",
    },
    {
      key: "stay",
      label: "Stay",
      eur: stayEur,
      inr: stayEur * effectiveRate,
      note: `${rooms} room(s) x ${nights} night(s)`,
    },
    {
      key: "citytax",
      label: "Rome tourist tax",
      eur: cityTaxEur,
      inr: cityTaxEur * effectiveRate,
      note: `${cityTax.liable} person(s) x ${cityTax.nightsCharged} night(s), usually cash at the property`,
    },
    {
      key: "food",
      label: "Food and drink",
      eur: foodEur,
      inr: foodEur * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "coperto",
      label: "Cover charges (coperto)",
      eur: copertoEur,
      inr: copertoEur * effectiveRate,
      note: `${sitDownMealsPerDay} sit-down meal(s) a day at €${copertoPerPersonEur} a head`,
    },
    {
      key: "transport",
      label: "Local transport",
      eur: transportEur,
      inr: transportEur * effectiveRate,
      note: `metro, bus and taxis — ${travellers} x ${days} day(s)`,
    },
    {
      key: "sights",
      label: "Sights and tickets",
      eur: sightsEur,
      inr: sightsEur * effectiveRate,
      note: `${travellers} x ${days} day(s)`,
    },
    {
      key: "shopping",
      label: "Shopping",
      eur: shoppingEur,
      inr: shoppingEur * effectiveRate,
      note: "one-off, per person",
    },
    {
      key: "contingency",
      label: `Contingency (${contingencyPct}%)`,
      eur: 0,
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
  const dailyOnGroundEur =
    travellers *
    (foodPerPersonPerDayEur +
      transportPerPersonPerDayEur +
      sightsPerPersonPerDayEur +
      sitDownMealsPerDay * copertoPerPersonEur);
  const nightlyRoomEur = rooms * seasonalRoomRateEur;
  const nightlyTaxEur =
    nights < CITY_TAX_MAX_NIGHTS ? cityTax.liable * cityTaxPerPersonPerNightEur : 0;
  const costOfOneMoreNightInr =
    (dailyOnGroundEur + nightlyRoomEur + nightlyTaxEur) * effectiveRate * (1 + contingencyPct / 100);
  const fixedInr = flightsInr + visaInr + insuranceTotalInr;

  // total(n) = (fixed + rate x [daily x (n+1) + (room + tax) x n + one-offs]) x (1 + c),
  // valid while n stays inside the 10-night tourist-tax cap. Solve for the largest whole n.
  let nightsAffordable = null;
  let budgetGapInr = null;
  if (budgetCapInr > 0) {
    budgetGapInr = budgetCapInr - totalInr;
    const oneOffOnGroundInr = shoppingEur * effectiveRate;
    const perNightInr =
      (nightlyRoomEur + cityTax.liable * cityTaxPerPersonPerNightEur) * effectiveRate;
    const capBeforeBuffer = budgetCapInr / (1 + contingencyPct / 100);
    const headroom =
      capBeforeBuffer - fixedInr - oneOffOnGroundInr - dailyOnGroundEur * effectiveRate;
    const perNightAll = perNightInr + dailyOnGroundEur * effectiveRate;
    nightsAffordable = perNightAll > 0 ? Math.max(0, Math.floor(headroom / perNightAll)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights is a day trip: no room and no tourist tax, and daily spends count for one day.");
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the shared rate suggests.`,
    );
  }
  if (nights > CITY_TAX_MAX_NIGHTS) {
    notes.push(
      `Rome charges the tourist tax for at most ${CITY_TAX_MAX_NIGHTS} consecutive nights at one property, so nights ${CITY_TAX_MAX_NIGHTS + 1} to ${nights} are free of it.`,
    );
  }
  if (cityTaxEur > 0) {
    notes.push(
      `The tourist tax adds €${cityTaxEur.toFixed(2)} on top of the room price and is normally collected at the property, not by the booking site. Children under ${CITY_TAX_EXEMPT_AGE} are exempt — count them in the exempt field.`,
    );
  }
  if (copertoEur > 0) {
    notes.push(
      `Cover charges add €${copertoEur.toFixed(2)} across the trip. The coperto has to be printed on the menu; eating standing at the bar avoids it, and so does a pizza al taglio counter.`,
    );
  }
  if (markupPercent >= 3) {
    notes.push(
      `A ${markupPercent}% markup adds about ₹${Math.round(forexMarkupInr)} to this trip. If a Rome card machine offers to bill you in rupees, decline — dynamic currency conversion is usually worse than your own bank's rate.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about €${Math.round(seasonalRoomRateEur)} a night.`,
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
    seasonalRoomRateEur,
    inrPerEur,
    markupPercent,
    effectiveRate,
    lines,
    stayEur,
    foodEur,
    transportEur,
    sightsEur,
    shoppingEur,
    copertoEur,
    cityTaxEur,
    cityTax,
    onGroundEur,
    onGroundEurPerPerson: onGroundEur / travellers,
    onGroundInr,
    forexMarkupInr,
    flightsInr,
    visaInr,
    insuranceTotalInr,
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
