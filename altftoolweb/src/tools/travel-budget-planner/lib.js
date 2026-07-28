/**
 * Travel budget planning.
 *
 * The budget is built from three kinds of cost, which is how travel agents and
 * standard trip-cost worksheets separate them:
 *
 *   1. Per-person one-off costs   — long-haul travel, visa, insurance.
 *      total = rate x travellers
 *   2. Per-room per-night costs   — accommodation.
 *      rooms = ceil(travellers / occupancy per room)
 *      total = nightly rate x nights x rooms
 *   3. Per-person per-day costs   — food, local transport, activities.
 *      total = (food + local transport + activities) x travellers x days
 *
 *   days = nights + 1, because a trip with N overnight stays covers N + 1
 *   calendar days of eating and moving around (a 4-night trip is 5 days).
 *
 *   contingency = subtotal x contingency percentage
 *   grand total = subtotal + contingency
 *
 * Saving plan: monthly saving = (grand total - amount already saved) / months
 * left before departure.
 *
 * No exchange rates are built in — every figure is entered and reported in one
 * currency you choose, so nothing here can go stale.
 */

/** A trip needs at least one traveller. */
export const MIN_TRAVELLERS = 1;

/** Practical cap for a single planned group booking. */
export const MAX_TRAVELLERS = 40;

/** Practical cap on trip length (one year). */
export const MAX_NIGHTS = 365;

/**
 * Default contingency buffer. 10% is the buffer this tool starts with; it is a
 * user-adjustable slider, not a rule from any authority.
 */
export const DEFAULT_CONTINGENCY_PERCENT = 10;

/** Contingency above this is almost certainly a typo. */
export const MAX_CONTINGENCY_PERCENT = 100;

/** Currencies offered, with the locale used to format them. */
export const CURRENCIES = {
  INR: { label: "Indian Rupee (₹)", locale: "en-IN" },
  USD: { label: "US Dollar ($)", locale: "en-US" },
  EUR: { label: "Euro (€)", locale: "de-DE" },
  GBP: { label: "Pound Sterling (£)", locale: "en-GB" },
  AED: { label: "UAE Dirham (د.إ)", locale: "en-AE" },
  SGD: { label: "Singapore Dollar (S$)", locale: "en-SG" },
};

const round2 = (value) => Math.round(value * 100) / 100;

const num = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value === null || value === undefined) return 0;
  return null;
};

/**
 * Build the trip budget.
 *
 * @param {object} input  all money values in the same currency
 * @returns {object} budget breakdown, or { error } when the input is unusable.
 */
export function planTravelBudget({
  travellers = 2,
  nights = 4,
  occupancyPerRoom = 2,
  flightPerPerson = 0,
  visaInsurancePerPerson = 0,
  nightlyRoomRate = 0,
  foodPerPersonPerDay = 0,
  localTransportPerPersonPerDay = 0,
  activitiesPerPersonPerDay = 0,
  shoppingAndMisc = 0,
  contingencyPercent = DEFAULT_CONTINGENCY_PERCENT,
  alreadySaved = 0,
  monthsToDeparture = 6,
}) {
  const people = num(travellers);
  const nightCount = num(nights);
  const occupancy = num(occupancyPerRoom);
  const contingencyPct = num(contingencyPercent);

  const money = {
    flightPerPerson: num(flightPerPerson),
    visaInsurancePerPerson: num(visaInsurancePerPerson),
    nightlyRoomRate: num(nightlyRoomRate),
    foodPerPersonPerDay: num(foodPerPersonPerDay),
    localTransportPerPersonPerDay: num(localTransportPerPersonPerDay),
    activitiesPerPersonPerDay: num(activitiesPerPersonPerDay),
    shoppingAndMisc: num(shoppingAndMisc),
    alreadySaved: num(alreadySaved),
  };

  if ([people, nightCount, occupancy, contingencyPct, ...Object.values(money)].some((v) => v === null)) {
    return { error: "Every field must be a number." };
  }
  if (!Number.isInteger(people) || people < MIN_TRAVELLERS) {
    return { error: `Enter at least ${MIN_TRAVELLERS} traveller.` };
  }
  if (people > MAX_TRAVELLERS) {
    return { error: `This planner handles up to ${MAX_TRAVELLERS} travellers.` };
  }
  if (nightCount < 0 || !Number.isInteger(nightCount)) {
    return { error: "Nights must be a whole number of 0 or more." };
  }
  if (nightCount > MAX_NIGHTS) {
    return { error: `Trip length is capped at ${MAX_NIGHTS} nights.` };
  }
  if (!Number.isInteger(occupancy) || occupancy < 1) {
    return { error: "Room occupancy must be at least 1 person per room." };
  }
  if (contingencyPct < 0 || contingencyPct > MAX_CONTINGENCY_PERCENT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PERCENT}%.` };
  }
  if (Object.values(money).some((v) => v < 0)) {
    return { error: "Costs cannot be negative." };
  }

  const days = nightCount + 1;
  const rooms = Math.ceil(people / occupancy);

  const travelTotal = money.flightPerPerson * people;
  const visaTotal = money.visaInsurancePerPerson * people;
  const stayTotal = money.nightlyRoomRate * nightCount * rooms;
  const dailyPerPerson =
    money.foodPerPersonPerDay +
    money.localTransportPerPersonPerDay +
    money.activitiesPerPersonPerDay;
  const foodTotal = money.foodPerPersonPerDay * people * days;
  const localTransportTotal = money.localTransportPerPersonPerDay * people * days;
  const activitiesTotal = money.activitiesPerPersonPerDay * people * days;
  const miscTotal = money.shoppingAndMisc;

  const subtotal =
    travelTotal + visaTotal + stayTotal + foodTotal + localTransportTotal + activitiesTotal + miscTotal;
  const contingency = (subtotal * contingencyPct) / 100;
  const total = subtotal + contingency;

  const remaining = Math.max(0, total - money.alreadySaved);
  const months = num(monthsToDeparture);
  const monthsValid = months !== null && Number.isInteger(months) && months > 0;
  const monthlySaving = monthsValid ? remaining / months : null;

  const categories = [
    { key: "travel", label: "Getting there", amount: travelTotal },
    { key: "visa", label: "Visa & insurance", amount: visaTotal },
    { key: "stay", label: `Accommodation (${rooms} room${rooms === 1 ? "" : "s"} x ${nightCount} night${nightCount === 1 ? "" : "s"})`, amount: stayTotal },
    { key: "food", label: "Food", amount: foodTotal },
    { key: "local", label: "Local transport", amount: localTransportTotal },
    { key: "activities", label: "Activities & entry fees", amount: activitiesTotal },
    { key: "misc", label: "Shopping & other one-offs", amount: miscTotal },
  ].map((row) => ({
    ...row,
    amount: round2(row.amount),
    share: subtotal > 0 ? round2((row.amount / subtotal) * 100) : 0,
  }));

  return {
    days,
    nights: nightCount,
    travellers: people,
    rooms,
    categories,
    subtotal: round2(subtotal),
    contingency: round2(contingency),
    contingencyPercent: contingencyPct,
    total: round2(total),
    perPerson: round2(total / people),
    perDay: round2(total / days),
    perPersonPerDay: round2(total / people / days),
    dailyPerPerson: round2(dailyPerPerson),
    alreadySaved: round2(money.alreadySaved),
    remaining: round2(remaining),
    monthsToDeparture: monthsValid ? months : null,
    monthlySaving: monthlySaving === null ? null : round2(monthlySaving),
    savingNote: monthsValid
      ? null
      : "Enter a whole number of months (1 or more) to see a monthly saving target.",
    fullyFunded: remaining === 0,
  };
}

/** Format an amount in the chosen currency, whole units. */
export function formatMoney(amount, currency = "INR") {
  const meta = CURRENCIES[currency] || CURRENCIES.INR;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
