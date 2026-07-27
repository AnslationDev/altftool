/**
 * Paris trip budget breakdown, in euros.
 *
 * Seven lines, each with its own multiplier:
 *
 *   Flights / rail  = travellers x return fare per person        (one-off)
 *   Stay            = rooms x nights x nightly rate x season      (rooms, not travellers)
 *   Taxe de sejour  = taxable guests x nights x municipal rate x surtaxes
 *   Food            = travellers x days x food per day            (days, not nights)
 *   Transport       = travellers x days x transport per day
 *   Activities      = travellers x days x activities per day
 *   Museums/passes  = travellers x one-off attractions budget
 *   Contingency     = contingency % of everything above
 *
 * A trip of N nights spans N + 1 days on the ground, so daily spends are
 * charged for nights + 1 days while the room is charged for nights.
 * Rooms = ceil(travellers / people per room).
 *
 * WHAT IS ACTUALLY A RULE HERE, not a guess:
 *
 *  - France's taxe de sejour is charged per person per night, not per room,
 *    and is collected by the hotel on top of the advertised room price. The
 *    municipal rate depends on the accommodation category.
 *  - Guests under 18 are exempt from the taxe de sejour under the French
 *    general tax code, which is why this module counts adults and minors
 *    separately.
 *  - Two surtaxes sit on top of the municipal rate: a departmental additional
 *    tax of 10%, and — in Ile-de-France, which includes Paris — a regional
 *    additional tax of 15% that funds the Grand Paris transport works. Both
 *    are percentages of the municipal rate, so the guest pays the municipal
 *    rate x 1.25.
 *  - Restaurant and hotel prices displayed in France are TTC: VAT and service
 *    are already inside the number on the menu, so no tip or tax is added
 *    afterwards.
 *
 * The euro figures in TIERS and CATEGORIES are planning starting points you
 * overwrite with real quotes and with the rate printed on your booking. Paris
 * republishes its taxe de sejour schedule, so always check the confirmation.
 */

/** Departmental additional tax on top of the municipal taxe de sejour rate. */
export const DEPARTMENTAL_SURTAX = 0.1;

/** Ile-de-France regional additional tax funding the Grand Paris transport works. */
export const REGIONAL_SURTAX = 0.15;

/** Combined multiplier applied to the municipal rate: 1 + 10% + 15%. */
export const TOURIST_TAX_MULTIPLIER = 1 + DEPARTMENTAL_SURTAX + REGIONAL_SURTAX;

/** Age below which a guest is exempt from the French taxe de sejour. */
export const TOURIST_TAX_EXEMPT_UNDER_AGE = 18;

/**
 * Accommodation categories and a starting municipal taxe de sejour rate per
 * adult per night. Overwrite the rate with the figure on your booking — the
 * schedule is republished and the surtaxes are added on top of whatever it is.
 */
export const CATEGORIES = [
  { value: "unrated", label: "Hostel or unrated accommodation", municipalRateEur: 1 },
  { value: "two-star", label: "1 or 2-star hotel", municipalRateEur: 1.5 },
  { value: "three-star", label: "3-star hotel", municipalRateEur: 3 },
  { value: "four-star", label: "4-star hotel", municipalRateEur: 5 },
  { value: "five-star", label: "5-star hotel", municipalRateEur: 8 },
];

/** Travel styles, as starting euro figures for a normal week. */
export const TIERS = [
  {
    value: "budget",
    label: "Budget — hostel or small hotel, bakery lunches, metro only",
    stayPerRoomPerNight: 90,
    foodPerPersonPerDay: 35,
    transportPerPersonPerDay: 9,
    activitiesPerPersonPerDay: 12,
    returnFarePerPerson: 180,
    attractionsPerPerson: 60,
    peoplePerRoom: 2,
    category: "unrated",
  },
  {
    value: "comfort",
    label: "Comfort — 3-star hotel or apartment, one sit-down meal a day",
    stayPerRoomPerNight: 180,
    foodPerPersonPerDay: 70,
    transportPerPersonPerDay: 12,
    activitiesPerPersonPerDay: 25,
    returnFarePerPerson: 300,
    attractionsPerPerson: 100,
    peoplePerRoom: 2,
    category: "three-star",
  },
  {
    value: "premium",
    label: "Premium — 4 or 5-star hotel, restaurants, taxis and guided visits",
    stayPerRoomPerNight: 420,
    foodPerPersonPerDay: 150,
    transportPerPersonPerDay: 35,
    activitiesPerPersonPerDay: 60,
    returnFarePerPerson: 550,
    attractionsPerPerson: 200,
    peoplePerRoom: 2,
    category: "five-star",
  },
];

/**
 * Season factor applied to the room rate only. Paris is cheapest in the deep
 * winter weeks outside the holidays, dearest in summer, at Christmas and
 * whenever a large trade fair or sporting event takes over the city.
 */
export const SEASON_MULTIPLIERS = [
  { value: "low", label: "Low (mid-Jan to Mar, mid-Nov) — cheapest rooms", factor: 0.8 },
  { value: "shoulder", label: "Shoulder (Apr–May, Sep–Oct)", factor: 1 },
  { value: "high", label: "High (Jun–Aug, Christmas week)", factor: 1.25 },
  { value: "event", label: "Major trade fair or event week — surge", factor: 1.6 },
];

export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_MONEY = 1000000; // one million euros is not a city break
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASON_MULTIPLIERS.find((season) => season.value === value) ?? SEASON_MULTIPLIERS[1];
}

export function categoryByValue(value) {
  return CATEGORIES.find((category) => category.value === value) ?? CATEGORIES[2];
}

/**
 * Taxe de sejour actually payable: municipal rate, plus the 10% departmental
 * and 15% regional additional taxes, charged per taxable adult per night.
 * Under-18s are exempt, so they are excluded from `adults`.
 * @returns {{error:string}|{perAdultPerNight:number, total:number, surtaxPart:number}}
 */
export function computeTouristTax({ adults, nights, municipalRateEur }) {
  if (![adults, nights, municipalRateEur].every(isNum)) {
    return { error: "Enter a number for adults, nights and the municipal rate." };
  }
  if (adults < 0 || nights < 0) return { error: "Adults and nights cannot be negative." };
  if (municipalRateEur < 0) return { error: "The municipal taxe de séjour rate cannot be negative." };

  const perAdultPerNight = municipalRateEur * TOURIST_TAX_MULTIPLIER;
  const total = perAdultPerNight * adults * nights;
  return {
    perAdultPerNight,
    total,
    surtaxPart: total - municipalRateEur * adults * nights,
  };
}

/**
 * @returns {{error:string}|object} full budget with per-line, per-person and per-day figures
 */
export function buildParisBudget({
  adults,
  children = 0,
  nights,
  peoplePerRoom,
  stayPerRoomPerNight,
  municipalRateEur,
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
    adults,
    children,
    nights,
    peoplePerRoom,
    stayPerRoomPerNight,
    municipalRateEur,
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

  if (!Number.isInteger(adults) || adults < 1 || adults > MAX_TRAVELLERS) {
    return { error: `Adults must be a whole number from 1 to ${MAX_TRAVELLERS}.` };
  }
  if (!Number.isInteger(children) || children < 0 || children > MAX_TRAVELLERS) {
    return { error: `Under-18s must be a whole number from 0 to ${MAX_TRAVELLERS}.` };
  }
  const travellers = adults + children;
  if (travellers > MAX_TRAVELLERS) {
    return { error: `That is more than ${MAX_TRAVELLERS} people — split the party into two budgets.` };
  }
  if (!Number.isInteger(nights) || nights < 0 || nights > MAX_NIGHTS) {
    return { error: `Nights must be a whole number from 0 to ${MAX_NIGHTS}.` };
  }
  if (!Number.isInteger(peoplePerRoom) || peoplePerRoom < 1 || peoplePerRoom > 6) {
    return { error: "People per room must be a whole number from 1 to 6." };
  }
  const costFields = [
    stayPerRoomPerNight,
    municipalRateEur,
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
  const seasonalRoomRate = stayPerRoomPerNight * seasonFactor;

  const flights = travellers * returnFarePerPerson;
  const stay = rooms * nights * seasonalRoomRate;
  const tax = computeTouristTax({ adults, nights, municipalRateEur });
  if (tax.error) return { error: tax.error };
  const touristTax = tax.total;
  const food = travellers * days * foodPerPersonPerDay;
  const transport = travellers * days * transportPerPersonPerDay;
  const activities = travellers * days * activitiesPerPersonPerDay;
  const attractions = travellers * attractionsPerPerson;

  const subtotal = flights + stay + touristTax + food + transport + activities + attractions;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const lines = [
    { key: "flights", label: "Flights or rail to Paris", amount: flights, note: `${travellers} x return fare` },
    { key: "stay", label: "Accommodation", amount: stay, note: `${rooms} room(s) x ${nights} night(s)` },
    {
      key: "tax",
      label: "Taxe de séjour",
      amount: touristTax,
      note: `${adults} adult(s) x ${nights} night(s), under-${TOURIST_TAX_EXEMPT_UNDER_AGE}s exempt`,
    },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    { key: "transport", label: "Metro, RER and taxis", amount: transport, note: `${travellers} x ${days} day(s)` },
    { key: "activities", label: "Activities and daily sightseeing", amount: activities, note: `${travellers} x ${days} day(s)` },
    { key: "attractions", label: "Museum passes and ticketed sights", amount: attractions, note: "one-off, per person" },
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

  const dailyVariable =
    travellers * (foodPerPersonPerDay + transportPerPersonPerDay + activitiesPerPersonPerDay);
  const nightlyRoom = rooms * seasonalRoomRate;
  const nightlyTax = adults * tax.perAdultPerNight;
  const costOfOneMoreNight = (dailyVariable + nightlyRoom + nightlyTax) * (1 + contingencyPct / 100);
  const fixedCosts = flights + attractions;

  let nightsAffordable = null;
  let budgetGap = null;
  if (budgetCap > 0) {
    budgetGap = budgetCap - total;
    const perNight = dailyVariable + nightlyRoom + nightlyTax;
    const capBeforeBuffer = budgetCap / (1 + contingencyPct / 100);
    const headroom = capBeforeBuffer - fixedCosts - dailyVariable;
    nightsAffordable = perNight > 0 ? Math.max(0, Math.floor(headroom / perNight)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights is a day trip: no room and no taxe de séjour, and daily spends count for one day.");
  }
  if (children > 0 && nights > 0) {
    notes.push(
      `${children} guest(s) under ${TOURIST_TAX_EXEMPT_UNDER_AGE} are exempt from the taxe de séjour, which saves ${
        Math.round(children * nights * tax.perAdultPerNight * 100) / 100
      } € over the stay.`,
    );
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} people at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the sharing rate implies.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about ${Math.round(seasonalRoomRate)} € a night. Paris reprices hardest in high summer and during the big trade fairs.`,
    );
  }
  if (budgetCap > 0 && budgetGap !== null && budgetGap < 0) {
    notes.push(`Over the cap. At the same daily spends, ${nightsAffordable} night(s) fits inside the ceiling.`);
  }
  notes.push(
    "French menu and hotel prices are shown TTC — VAT and service are already inside them, so nothing is added at the till and a tip is optional.",
  );

  return {
    adults,
    children,
    travellers,
    nights,
    days,
    rooms,
    seasonFactor,
    seasonalRoomRate,
    touristTaxPerAdultPerNight: tax.perAdultPerNight,
    touristTaxSurtaxPart: tax.surtaxPart,
    lines,
    flights,
    stay,
    touristTax,
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
    nightlyRoom,
    costOfOneMoreNight,
    fixedCosts,
    budgetCap,
    budgetGap,
    nightsAffordable,
    notes,
  };
}
