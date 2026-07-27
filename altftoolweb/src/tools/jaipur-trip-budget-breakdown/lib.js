/**
 * Jaipur trip budget breakdown.
 *
 * Six lines, each with its own multiplier:
 *
 *   Stay          = rooms x nights x room rate            (rooms, not travellers)
 *   Food          = travellers x days x food per day      (days, not nights)
 *   Local transport = travellers x days x transport per day
 *   Activities    = travellers x days x activities per day
 *   Travel in/out = travellers x return fare per person   (one-off)
 *   Tickets & extras = travellers x (monument tickets + shopping)  (one-off)
 *   Contingency   = contingency % of everything above
 *
 * A trip of N nights spans N + 1 days on the ground, so daily spends are charged for nights + 1
 * days while the room is charged for nights. Rooms = ceil(travellers / people per room).
 *
 * Monument entry in Jaipur is a real, published, two-price system: Rajasthan's Archaeology and
 * Museums department charges Indian nationals one fee and foreign nationals a higher one, and
 * sells a composite ticket that bundles the main sites for two days. Those published fees are in
 * MONUMENT_TICKETS and are summed separately from the daily activities line so you are not paying
 * for the same fort twice.
 *
 * Tier figures are planning reference points in Indian rupees for a normal winter week — starting
 * values the user overwrites with real quotes.
 */

export const TIERS = [
  {
    value: "backpacker",
    label: "Backpacker — hostel dorm, dhaba food, shared autos",
    stayPerRoomPerNight: 1000,
    foodPerPersonPerDay: 600,
    transportPerPersonPerDay: 400,
    activitiesPerPersonPerDay: 300,
    returnFarePerPerson: 5000,
    peoplePerRoom: 2,
  },
  {
    value: "comfort",
    label: "Comfort — 3-star or boutique guesthouse, cabs, guided forts",
    stayPerRoomPerNight: 3000,
    foodPerPersonPerDay: 1300,
    transportPerPersonPerDay: 800,
    activitiesPerPersonPerDay: 700,
    returnFarePerPerson: 8000,
    peoplePerRoom: 2,
  },
  {
    value: "premium",
    label: "Premium — heritage haveli or palace hotel, private car and guide",
    stayPerRoomPerNight: 9000,
    foodPerPersonPerDay: 3000,
    transportPerPersonPerDay: 1800,
    activitiesPerPersonPerDay: 2000,
    returnFarePerPerson: 13000,
    peoplePerRoom: 2,
  },
];

/**
 * Season factor applied to the room rate only. Jaipur's peak is the cool October-to-March window
 * and the Literature Festival week in late January; April to June is furnace-hot and hotels
 * discount hard to fill rooms.
 */
export const SEASON_MULTIPLIERS = [
  { value: "summer", label: "Summer (Apr–Jun) — 40°C+, cheapest rooms", factor: 0.65 },
  { value: "monsoon", label: "Monsoon (Jul–Sep) — quiet, green forts", factor: 0.8 },
  { value: "winter", label: "Winter (Oct–Mar) — peak season", factor: 1 },
  { value: "festival", label: "Literature Festival / Diwali week — surge", factor: 1.8 },
];

/**
 * Published Rajasthan monument entry fees, in INR per person. The state runs a two-tier fee —
 * Indian national vs foreign national — and sells a composite ticket valid two days across the
 * archaeology-department sites. City Palace is privately run by the royal trust and is not part
 * of the composite ticket, which is why it is listed separately.
 */
export const MONUMENT_TICKETS = [
  { value: "composite", label: "Composite ticket (8 sites, valid 2 days)", indian: 300, foreign: 1000, inComposite: false },
  { value: "amber", label: "Amber Fort", indian: 100, foreign: 500, inComposite: true },
  { value: "hawa-mahal", label: "Hawa Mahal", indian: 50, foreign: 200, inComposite: true },
  { value: "jantar-mantar", label: "Jantar Mantar", indian: 50, foreign: 200, inComposite: true },
  { value: "albert-hall", label: "Albert Hall Museum", indian: 40, foreign: 300, inComposite: true },
  { value: "nahargarh", label: "Nahargarh Fort", indian: 50, foreign: 200, inComposite: true },
  { value: "city-palace", label: "City Palace (privately run)", indian: 500, foreign: 1000, inComposite: false },
];

export const DEFAULT_SHOPPING_PER_PERSON = 3000;
export const DEFAULT_CONTINGENCY_PCT = 10;

const MAX_TRAVELLERS = 40;
const MAX_NIGHTS = 90;
const MAX_MONEY = 100000000; // 10 crore — not a holiday budget
const MAX_CONTINGENCY_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function tierByValue(value) {
  return TIERS.find((tier) => tier.value === value) ?? TIERS[1];
}

export function seasonByValue(value) {
  return SEASON_MULTIPLIERS.find((season) => season.value === value) ?? SEASON_MULTIPLIERS[2];
}

/**
 * Sum monument entry for one person. If the composite ticket is selected, the sites it already
 * covers are not charged again.
 * @returns {{total:number, charged:Array, coveredByComposite:Array}}
 */
export function sumMonumentTickets(selectedValues = [], nationality = "indian") {
  const key = nationality === "foreign" ? "foreign" : "indian";
  const selected = MONUMENT_TICKETS.filter((site) => selectedValues.includes(site.value));
  const hasComposite = selected.some((site) => site.value === "composite");
  const charged = [];
  const coveredByComposite = [];
  for (const site of selected) {
    if (hasComposite && site.inComposite) coveredByComposite.push(site);
    else charged.push(site);
  }
  return {
    total: charged.reduce((sum, site) => sum + site[key], 0),
    charged,
    coveredByComposite,
    nationality: key,
  };
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
  ticketsPerPerson = 0,
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
    ticketsPerPerson,
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
    ticketsPerPerson,
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
  const seasonalRoomRate = stayPerRoomPerNight * seasonFactor;

  const stay = rooms * nights * seasonalRoomRate;
  const food = travellers * days * foodPerPersonPerDay;
  const transport = travellers * days * transportPerPersonPerDay;
  const activities = travellers * days * activitiesPerPersonPerDay;
  const travel = travellers * returnFarePerPerson;
  const tickets = travellers * ticketsPerPerson;
  const shopping = travellers * shoppingPerPerson;

  const subtotal = stay + food + transport + activities + travel + tickets + shopping;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const lines = [
    { key: "travel", label: "Travel to and from Jaipur", amount: travel, note: `${travellers} x return fare` },
    { key: "stay", label: "Stay", amount: stay, note: `${rooms} room(s) x ${nights} night(s)` },
    { key: "food", label: "Food and drink", amount: food, note: `${travellers} x ${days} day(s)` },
    { key: "transport", label: "Autos, cabs and fuel", amount: transport, note: `${travellers} x ${days} day(s)` },
    { key: "activities", label: "Guides and activities", amount: activities, note: `${travellers} x ${days} day(s)` },
    { key: "tickets", label: "Monument entry tickets", amount: tickets, note: "published fees, per person" },
    { key: "shopping", label: "Shopping and souvenirs", amount: shopping, note: "one-off, per person" },
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
  const costOfOneMoreNight = (dailyVariable + nightlyRoom) * (1 + contingencyPct / 100);
  const fixedCosts = travel + tickets + shopping;

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
    notes.push("Zero nights is a day trip: no room cost, and daily spends are counted for one day.");
  }
  if (travellers % peoplePerRoom !== 0) {
    notes.push(
      `${travellers} travellers at ${peoplePerRoom} per room needs ${rooms} rooms, so one room is not full and the stay line costs more per head than the sharing rate implies.`,
    );
  }
  if (seasonFactor > 1) {
    notes.push(
      `Season factor ${seasonFactor}x puts the room at about ₹${Math.round(seasonalRoomRate)} a night. Jaipur reprices hardest over the Literature Festival and Diwali.`,
    );
  }
  if (budgetCap > 0 && budgetGap !== null && budgetGap < 0) {
    notes.push(
      `Over the cap. At the same daily spends, ${nightsAffordable} night(s) fits inside the ceiling.`,
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
    tickets,
    shopping,
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
