/**
 * Street food budget planner.
 *
 * The model is a straightforward but complete trip food budget, built the way
 * a traveller actually eats: a repeating daily routine of cheap street meals
 * and sit-down café meals, plus snacks and drinks, plus a small number of
 * deliberate splurge meals spread over the trip.
 *
 * The one piece of arithmetic people usually get wrong is the splurge meal. A
 * nice dinner does not add its full price to the budget, because it replaces a
 * meal you would otherwise have paid for. Only the difference is new money:
 *
 *     uplift = nice meals x (nice meal price - average routine meal price) x people
 *
 * Getting that wrong is what makes hand-written food budgets overshoot by 20%
 * or more on a long trip.
 *
 * The reverse calculation answers the question people actually ask — given a
 * fixed budget, how many nice meals fit? — by solving the same equation for the
 * number of nice meals.
 *
 * Pure functions: no clock, no network, no DOM. Currency is a formatting
 * concern handled by the caller.
 */

/**
 * Default planning buffer. This is a budgeting convention, not a measured
 * statistic: it covers the tea you did not plan, the day the cheap place was
 * shut, and price differences between what you read online and what you pay.
 */
export const DEFAULT_CONTINGENCY_PCT = 15;

export const MAX_DAYS = 365;
export const MAX_PEOPLE = 20;
export const MAX_MEALS_PER_DAY = 6;
export const MAX_ITEMS_PER_DAY = 12;
export const MAX_PRICE = 1_000_000;
export const MAX_CONTINGENCY_PCT = 100;

/** Currencies with a sensible locale for grouping digits. */
export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "THB", locale: "en-US", label: "Thai baht" },
  { code: "VND", locale: "vi-VN", label: "Vietnamese dong" },
  { code: "IDR", locale: "id-ID", label: "Indonesian rupiah" },
  { code: "MXN", locale: "es-MX", label: "Mexican peso" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "en-IE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "JPY", locale: "ja-JP", label: "Japanese yen" },
];

/**
 * A rough guide to how the daily total usually splits when people eat mostly
 * street food. Used only to comment on a plan, never inside the arithmetic.
 */
export const TYPICAL_SHARES = [
  { id: "meals", label: "Sit-down and street meals", low: 55, high: 75 },
  { id: "snacks", label: "Snacks, chai and fruit", low: 10, high: 20 },
  { id: "drinks", label: "Water, juice and soft drinks", low: 5, high: 15 },
  { id: "splurge", label: "Splurge meals", low: 5, high: 25 },
];

function invalidNumber(value) {
  return !Number.isFinite(value);
}

/**
 * @param {object} input
 * @param {number} input.days              nights of eating on the trip
 * @param {number} input.people            travellers sharing the budget
 * @param {number} input.streetMeals       street-food meals in a typical day
 * @param {number} input.streetPrice       price of one street meal, per head
 * @param {number} input.cafeMeals         café / casual sit-down meals in a typical day
 * @param {number} input.cafePrice         price of one café meal, per head
 * @param {number} input.snacksPerDay      snacks or chai stops in a typical day
 * @param {number} input.snackPrice        price of one snack, per head
 * @param {number} input.drinksPerDay      bottled water and drinks in a typical day
 * @param {number} input.drinkPrice        price of one drink, per head
 * @param {number} input.niceMeals         splurge meals over the whole trip
 * @param {number} input.nicePrice         price of one splurge meal, per head
 * @param {number} input.contingencyPct    planning buffer
 * @param {number} input.budget            total food budget for everyone, 0 to skip the comparison
 */
export function planFoodBudget(input) {
  const {
    days,
    people,
    streetMeals,
    streetPrice,
    cafeMeals,
    cafePrice,
    snacksPerDay,
    snackPrice,
    drinksPerDay,
    drinkPrice,
    niceMeals,
    nicePrice,
    contingencyPct = DEFAULT_CONTINGENCY_PCT,
    budget = 0,
  } = input || {};

  const values = {
    days: Number(days),
    people: Number(people),
    streetMeals: Number(streetMeals),
    streetPrice: Number(streetPrice),
    cafeMeals: Number(cafeMeals),
    cafePrice: Number(cafePrice),
    snacksPerDay: Number(snacksPerDay),
    snackPrice: Number(snackPrice),
    drinksPerDay: Number(drinksPerDay),
    drinkPrice: Number(drinkPrice),
    niceMeals: Number(niceMeals),
    nicePrice: Number(nicePrice),
    contingencyPct: Number(contingencyPct),
    budget: Number(budget),
  };

  if (Object.values(values).some(invalidNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (!Number.isInteger(values.days) || values.days < 1 || values.days > MAX_DAYS) {
    return { error: `Days must be a whole number between 1 and ${MAX_DAYS}.` };
  }
  if (!Number.isInteger(values.people) || values.people < 1 || values.people > MAX_PEOPLE) {
    return { error: `Travellers must be a whole number between 1 and ${MAX_PEOPLE}.` };
  }
  if (
    [values.streetMeals, values.cafeMeals].some(
      (count) => !Number.isInteger(count) || count < 0 || count > MAX_MEALS_PER_DAY,
    )
  ) {
    return { error: `Meals per day must be whole numbers between 0 and ${MAX_MEALS_PER_DAY}.` };
  }
  const mealsPerDay = values.streetMeals + values.cafeMeals;
  if (mealsPerDay < 1) {
    return { error: "A day needs at least one meal — set street or café meals above zero." };
  }
  if (
    [values.snacksPerDay, values.drinksPerDay].some(
      (count) => !Number.isInteger(count) || count < 0 || count > MAX_ITEMS_PER_DAY,
    )
  ) {
    return { error: `Snacks and drinks per day must be whole numbers between 0 and ${MAX_ITEMS_PER_DAY}.` };
  }
  const prices = [values.streetPrice, values.cafePrice, values.snackPrice, values.drinkPrice, values.nicePrice];
  if (prices.some((price) => price < 0 || price > MAX_PRICE)) {
    return { error: `Prices must be between 0 and ${MAX_PRICE.toLocaleString("en-US")}.` };
  }
  if (!Number.isInteger(values.niceMeals) || values.niceMeals < 0) {
    return { error: "Splurge meals must be a whole number of zero or more." };
  }
  if (values.niceMeals > values.days) {
    return { error: "You cannot eat more splurge meals than there are days on the trip." };
  }
  if (values.contingencyPct < 0 || values.contingencyPct > MAX_CONTINGENCY_PCT) {
    return { error: `The buffer must be between 0% and ${MAX_CONTINGENCY_PCT}%.` };
  }
  if (values.budget < 0 || values.budget > MAX_PRICE * 100) {
    return { error: "The budget must be zero or more." };
  }

  const mealCostPerHeadPerDay = values.streetMeals * values.streetPrice + values.cafeMeals * values.cafePrice;
  const snackCostPerHeadPerDay = values.snacksPerDay * values.snackPrice;
  const drinkCostPerHeadPerDay = values.drinksPerDay * values.drinkPrice;
  const routinePerHeadPerDay = mealCostPerHeadPerDay + snackCostPerHeadPerDay + drinkCostPerHeadPerDay;

  // A splurge meal replaces a routine meal, so only the difference is new money.
  const averageRoutineMealPrice = mealCostPerHeadPerDay / mealsPerDay;
  const upliftPerNiceMealPerHead = values.nicePrice - averageRoutineMealPrice;

  const routineTotal = routinePerHeadPerDay * values.days * values.people;
  const spurgeUplift = upliftPerNiceMealPerHead * values.niceMeals * values.people;
  const subtotal = routineTotal + spurgeUplift;
  const buffer = subtotal * (values.contingencyPct / 100);
  const grandTotal = subtotal + buffer;

  const perDay = grandTotal / values.days;
  const perPersonPerDay = perDay / values.people;

  // Reverse solve: how many splurge meals fit inside the stated budget?
  let niceMealsAffordable = null;
  let budgetGap = null;
  if (values.budget > 0) {
    // `|| 0` collapses a negative zero so an exactly-on-budget plan never
    // renders as "-0".
    budgetGap = (values.budget - grandTotal) || 0;
    const spendable = values.budget / (1 + values.contingencyPct / 100);
    if (upliftPerNiceMealPerHead <= 0) {
      // A "splurge" no dearer than the routine meal it replaces never costs more.
      niceMealsAffordable = spendable >= routineTotal ? values.days : 0;
    } else {
      const headroom = spendable - routineTotal;
      const perMeal = upliftPerNiceMealPerHead * values.people;
      niceMealsAffordable = Math.max(0, Math.min(values.days, Math.floor(headroom / perMeal)));
    }
  }

  const splurgeTotalCost = values.nicePrice * values.niceMeals * values.people;
  const componentTotals = [
    { id: "meals", label: "Sit-down and street meals", amount: mealCostPerHeadPerDay * values.days * values.people - averageRoutineMealPrice * values.niceMeals * values.people },
    { id: "snacks", label: "Snacks, chai and fruit", amount: snackCostPerHeadPerDay * values.days * values.people },
    { id: "drinks", label: "Water, juice and soft drinks", amount: drinkCostPerHeadPerDay * values.days * values.people },
    { id: "splurge", label: "Splurge meals", amount: splurgeTotalCost },
    { id: "buffer", label: `Planning buffer (${values.contingencyPct}%)`, amount: buffer },
  ].map((row) => ({ ...row, share: grandTotal > 0 ? (row.amount / grandTotal) * 100 : 0 }));

  const notes = [];
  if (upliftPerNiceMealPerHead <= 0) {
    notes.push("Your splurge meal is no dearer than an average routine meal, so it adds nothing to the budget. Either the splurge price is too low or the café price is too high.");
  }
  if (values.drinksPerDay === 0) {
    notes.push("No drinks budgeted. In hot climates bottled water alone is usually the third largest food line of the day.");
  }
  if (values.contingencyPct < 10) {
    notes.push("A buffer under 10% leaves nothing for the day the cheap place is shut or a price you read online was out of date.");
  }
  const mealShare = componentTotals.find((row) => row.id === "meals");
  if (mealShare && mealShare.share > 80) {
    notes.push("Over 80% of the budget is main meals. Most street-food trips end up spending more on snacks and drinks than planned.");
  }

  return {
    mealsPerDay,
    routinePerHeadPerDay,
    mealCostPerHeadPerDay,
    snackCostPerHeadPerDay,
    drinkCostPerHeadPerDay,
    averageRoutineMealPrice,
    upliftPerNiceMealPerHead,
    routineTotal,
    spurgeUplift,
    subtotal,
    buffer,
    grandTotal,
    perDay,
    perPersonPerDay,
    budgetGap,
    niceMealsAffordable,
    componentTotals,
    notes,
    days: values.days,
    people: values.people,
    niceMeals: values.niceMeals,
  };
}

/** Number formatter for a chosen currency, with no fractional units for high-denomination currencies. */
export function currencyFormatter(code) {
  const entry = CURRENCIES.find((item) => item.code === code) || CURRENCIES[0];
  const zeroDecimal = ["INR", "VND", "IDR", "JPY"].includes(entry.code);
  return new Intl.NumberFormat(entry.locale, {
    style: "currency",
    currency: entry.code,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  });
}

/** Clipboard summary. */
export function formatBudgetText(plan, format) {
  if (!plan || plan.error) return "";
  const lines = [
    "Street food budget plan",
    `${plan.days} days, ${plan.people} traveller${plan.people === 1 ? "" : "s"}, ${plan.niceMeals} splurge meal${plan.niceMeals === 1 ? "" : "s"}`,
    `Total food budget: ${format(plan.grandTotal)}`,
    `Per day (whole group): ${format(plan.perDay)}`,
    `Per person per day: ${format(plan.perPersonPerDay)}`,
    "",
    `Routine eating: ${format(plan.routineTotal)}`,
    `Splurge uplift over routine meals: ${format(plan.spurgeUplift)}`,
    `Planning buffer: ${format(plan.buffer)}`,
  ];
  if (plan.budgetGap !== null) {
    lines.push(
      plan.budgetGap >= 0
        ? `Under budget by ${format(plan.budgetGap)}`
        : `Over budget by ${format(Math.abs(plan.budgetGap))}`,
      `Splurge meals that fit the budget: ${plan.niceMealsAffordable}`,
    );
  }
  return lines.join("\n");
}
