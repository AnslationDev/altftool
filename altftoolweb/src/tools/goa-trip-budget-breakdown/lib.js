/**
 * Goa trip budget breakdown.
 *
 * The arithmetic is deliberately plain and auditable — a trip budget is a sum of six lines, each
 * driven by a different multiplier, and the usual mistakes are multiplying a room rate by people
 * instead of rooms, or a nightly rate by days instead of nights.
 *
 *   Stay          = rooms x nights x room rate            (rooms, not travellers)
 *   Food          = travellers x days x food per day      (days, not nights)
 *   Local transport = travellers x days x transport per day
 *   Activities    = travellers x days x activities per day
 *   Travel in/out = travellers x return fare per person   (one-off)
 *   Fees & extras = travellers x (entry fees + shopping)  (one-off)
 *   Contingency   = contingency % of everything above
 *
 * Day/night relationship: a trip of N nights spans N + 1 calendar days on the ground, so daily
 * spends are charged for nights + 1 days while the room is charged for nights. Rooms are
 * ceil(travellers / people per room) because half a room cannot be booked.
 *
 * The tier figures below are planning reference points for Goa in Indian rupees, gathered from
 * typical shoulder-season pricing; they are starting values that the user overwrites with real
 * quotes. Goa pricing swings hard by season — see SEASON_MULTIPLIERS — so the season factor is
 * applied to stay only, which is the line that actually moves.
 */

/** Nightly room rate, and per-person daily spends, in INR. Editable planning defaults. */
export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — hostel dorm, thali food, shared scooter",
    stayPerRoomPerNight: 1200,
    foodPerPersonPerDay: 700,
    transportPerPersonPerDay: 450,
    activitiesPerPersonPerDay: 400,
    returnFarePerPerson: 6500,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 3-star or good Airbnb, mix of shacks and cafes",
    stayPerRoomPerNight: 3500,
    foodPerPersonPerDay: 1500,
    transportPerPersonPerDay: 800,
    activitiesPerPersonPerDay: 1000,
    returnFarePerPerson: 9500,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — beach resort, restaurants, private cab",
    stayPerRoomPerNight: 9000,
    foodPerPersonPerDay: 3200,
    transportPerPersonPerDay: 2000,
    activitiesPerPersonPerDay: 2500,
    returnFarePerPerson: 14000,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor applied to the room rate only. Goa hotel rates roughly double over Christmas and
 * New Year and fall away in the monsoon; flights and food move far less, so the factor is not
 * applied to them.
 */
export const SEASON_MULTIPLIERS = [
  { value: "monsoon", label: "Monsoon (Jun–Sep) — cheapest", factor: 0.6 },
  { value: "shoulder", label: "Shoulder (Oct, Feb–May) — baseline", factor: 1 },
  { value: "peak", label: "Peak (Nov–Jan) — busy", factor: 1.5 },
  { value: "newyear", label: "Christmas & New Year week — surge", factor: 2.2 },
];

/** Goa charges no entry permit; beach club and water-sport entry sits in activities. */
export const DEFAULT_ENTRY_FEES_PER_PERSON = 0;
export const DEFAULT_SHOPPING_PER_PERSON = 2500;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_MONEY = 100000000; // 10 crore — anything above this is not a holiday budget
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASON_MULTIPLIERS.find((season) => season.value === value) ?? SEASON_MULTIPLIERS[1];
}

/**
 * @returns {{error:string}|object} full budget with per-line, per-person and per-day figures
 */
export function buildTripBudget({
  travellers,
  nights,
  peoplePerRoom,
  stayPerRoomPerNight,
  foodPerPersonPerDay,
  transportPerPersonPerDay,
  activitiesPerPersonPerDay,
  returnFarePerPerson,
  entryFeesPerPerson = DEFAULT_ENTRY_FEES_PER_PERSON,
  shoppingPerPerson = DEFAULT_SHOPPING_PER_PERSON,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  seasonFactor = 1,
  budgetCap = 0,
}) {
  const numbers = [
    travellers,
    nights,
    peoplePerRoom,
    stayPerRoomPerNight,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    entryFeesPerPerson,
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
    stayPerRoomPerNight,
    foodPerPersonPerDay,
    transportPerPersonPerDay,
    activitiesPerPersonPerDay,
    returnFarePerPerson,
    entryFeesPerPerson,
    shoppingPerPerson,
    budgetCap,
  ];
  if (costFields.some((value) => value < 0)) {
    return { error: "Costs cannot be negative." };
  }
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

  const stay = rooms * nights * seasonalRoomRate;
  const food = travellers * days * foodPerPersonPerDay;
  const transport = travellers * days * transportPerPersonPerDay;
  const activities = travellers * days * activitiesPerPersonPerDay;
  const travel = travellers * returnFarePerPerson;
  const extras = travellers * (entryFeesPerPerson + shoppingPerPerson);

  const subtotal = stay + food + transport + activities + travel + extras;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const lines = [
    { key: "travel", label: "Flights or trains (return)", amount: travel, note: `${travellers} x return fare` },
    { key: "stay", label: "Stay", amount: stay, note: `${rooms} room(s) x ${nights} night(s)` },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    { key: "transport", label: "Local transport", amount: transport, note: `${travellers} x ${days} day(s)` },
    { key: "activities", label: "Activities and entry", amount: activities, note: `${travellers} x ${days} day(s)` },
    { key: "extras", label: "Fees and shopping", amount: extras, note: "one-off, per person" },
    { key: "contingency", label: `Contingency (${contingencyPct}%)`, amount: contingency, note: "buffer on everything above" },
  ].map((line) => ({
    ...line,
    perPerson: line.amount / travellers,
    share: total > 0 ? (line.amount / total) * 100 : 0,
  }));

  const perPerson = total / travellers;
  const perPersonPerDay = perPerson / days;

  // Nightly and daily marginal cost, used to answer "what does one more night cost?" and to
  // solve the budget cap for a number of nights.
  const dailyVariable = travellers * (foodPerPersonPerDay + transportPerPersonPerDay + activitiesPerPersonPerDay);
  const nightlyRoom = rooms * seasonalRoomRate;
  const costOfOneMoreNight = (dailyVariable + nightlyRoom) * (1 + contingencyPct / 100);
  const fixedCosts = travel + extras;

  // total(n) = (fixed + dailyVariable * (n + 1) + nightlyRoom * n) * (1 + c)
  // Solve total(n) <= cap for the largest whole n.
  let nightsAffordable = null;
  let budgetGap = null;
  if (budgetCap > 0) {
    budgetGap = budgetCap - total;
    const perNight = dailyVariable + nightlyRoom;
    const capBeforeBuffer = budgetCap / (1 + contingencyPct / 100);
    const headroom = capBeforeBuffer - fixedCosts - dailyVariable;
    nightsAffordable = perNight > 0 ? Math.max(0, Math.floor(headroom / perNight)) : null;
    if (headroom < 0) nightsAffordable = 0;
  }

  const notes = [];
  if (nights === 0) {
    notes.push("Zero nights means a day trip: no room cost, and daily spends are counted for one day.");
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full — the room line is higher per head than the shared rate suggests.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x lifts the room rate to about ₹${Math.round(seasonalRoomRate)} a night. Goa hotels reprice hardest over Christmas and New Year.`,
    );
  }
  if (budgetCap > 0 && budgetGap !== null && budgetGap < 0) {
    notes.push(
      `The plan is over the cap. Dropping to ${nightsAffordable} night(s) at the same daily spends brings it back inside.`,
    );
  }

  return {
    travellers,
    nights,
    days,
    rooms,
    seasonFactor,
    seasonalRoomRate,
    lines,
    stay,
    food,
    transport,
    activities,
    travel,
    extras,
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
