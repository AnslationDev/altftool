/**
 * Rent or buy a tool: the comparison turns on how many days you will actually use it.
 *
 * Renting is a pure variable cost — you pay per day of hire plus whatever each trip to
 * collect and return the tool costs you. Buying is mostly fixed: the purchase price, the
 * servicing and storage it needs whether or not it runs, the capital tied up in it, less
 * whatever it resells for at the end.
 *
 *   rent total = usage days x day rate + trips x cost per trip
 *   buy total  = price + upkeep x years + storage x years + capital cost - resale value
 *
 * Setting the two equal gives the break-even usage:
 *
 *   break-even days = buy total / (day rate + trip cost / days per hire)
 *
 * Consumables (blades, discs, bits, fuel) are charged the same way under both options, so
 * they are included in both totals and cancel out of the break-even.
 */

/** Horizon default: three years is long enough to include one resale but short enough to trust. */
export const DEFAULT_HORIZON_YEARS = 3;

/**
 * Cost of the money tied up in an owned tool, charged on the AVERAGE capital committed —
 * the mean of purchase price and resale value — because the amount at stake falls as the
 * tool loses value. Default is a conservative deposit-style return, not a market forecast.
 */
export const DEFAULT_OPPORTUNITY_RATE_PCT = 6;

/** Guard rails against typos producing meaningless answers. */
export const MAX_HORIZON_YEARS = 30;
export const MAX_DAYS_PER_HIRE = 365;

/**
 * @returns {{error:string}|object} both totals, the winner and the break-even usage
 */
export function compareRentVsBuy({
  dayRate,
  daysPerHire,
  hiresPerYear,
  costPerTrip = 0,
  purchasePrice,
  upkeepPerYear = 0,
  storagePerYear = 0,
  resalePercent = 0,
  horizonYears = DEFAULT_HORIZON_YEARS,
  opportunityRatePct = DEFAULT_OPPORTUNITY_RATE_PCT,
  consumablesPerDay = 0,
}) {
  const numbers = [
    dayRate,
    daysPerHire,
    hiresPerYear,
    costPerTrip,
    purchasePrice,
    upkeepPerYear,
    storagePerYear,
    resalePercent,
    horizonYears,
    opportunityRatePct,
    consumablesPerDay,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (dayRate < 0 || costPerTrip < 0 || purchasePrice < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (upkeepPerYear < 0 || storagePerYear < 0 || consumablesPerDay < 0) {
    return { error: "Running costs cannot be negative." };
  }
  if (!(daysPerHire > 0) || daysPerHire > MAX_DAYS_PER_HIRE) {
    return { error: `Days per hire must be between 0 and ${MAX_DAYS_PER_HIRE}.` };
  }
  if (hiresPerYear < 0 || hiresPerYear > 365) {
    return { error: "Jobs per year must be between 0 and 365." };
  }
  if (!(horizonYears > 0) || horizonYears > MAX_HORIZON_YEARS) {
    return { error: `The horizon must be between 0 and ${MAX_HORIZON_YEARS} years.` };
  }
  if (resalePercent < 0 || resalePercent > 100) {
    return { error: "Resale value must be between 0% and 100% of the purchase price." };
  }
  if (opportunityRatePct < 0 || opportunityRatePct > 50) {
    return { error: "The return on capital must be between 0% and 50% per year." };
  }

  const trips = hiresPerYear * horizonYears;
  const usageDays = daysPerHire * trips;

  const consumables = consumablesPerDay * usageDays;

  const rentHireCost = usageDays * dayRate;
  const rentTripCost = trips * costPerTrip;
  const rentTotal = rentHireCost + rentTripCost + consumables;

  const resaleValue = purchasePrice * (resalePercent / 100);
  const upkeep = upkeepPerYear * horizonYears;
  const storage = storagePerYear * horizonYears;
  const averageCapital = (purchasePrice + resaleValue) / 2;
  const capitalCost = averageCapital * (opportunityRatePct / 100) * horizonYears;
  const buyTotal =
    purchasePrice + upkeep + storage + capitalCost - resaleValue + consumables;

  const difference = rentTotal - buyTotal;
  const cheaper = difference > 0 ? "buy" : difference < 0 ? "rent" : "either";
  const saving = Math.abs(difference);

  const rentPerUsageDay = usageDays > 0 ? rentTotal / usageDays : 0;
  const buyPerUsageDay = usageDays > 0 ? buyTotal / usageDays : 0;

  // Break-even: the usage at which the two totals meet. The rent side grows at the day rate
  // plus the share of a trip attributable to each day of that hire.
  const rentPerDayEffective = dayRate + costPerTrip / daysPerHire;
  const buyFixed = purchasePrice + upkeep + storage + capitalCost - resaleValue;
  let breakEvenDays = null;
  let breakEvenYears = null;
  if (rentPerDayEffective > 0 && buyFixed > 0) {
    breakEvenDays = buyFixed / rentPerDayEffective;
    const daysPerYear = daysPerHire * hiresPerYear;
    breakEvenYears = daysPerYear > 0 ? breakEvenDays / daysPerYear : null;
  }

  const notes = [];
  if (rentPerDayEffective === 0) {
    notes.push(
      "With a zero day rate and no trip cost there is nothing to break even against — borrowing free always wins on cost.",
    );
  }
  if (buyFixed <= 0 && rentPerDayEffective > 0) {
    notes.push(
      "Buying costs nothing net over this horizon — the resale value covers the price and upkeep — so ownership wins from the first day of use.",
    );
  }
  if (breakEvenDays !== null && usageDays > 0 && breakEvenDays > usageDays) {
    notes.push(
      `You would need about ${breakEvenDays.toFixed(1)} days of use to justify buying, against the ${usageDays.toFixed(1)} days you expect. Renting stays cheaper until the work roughly ${(breakEvenDays / usageDays).toFixed(1)}x's.`,
    );
  }
  if (breakEvenYears !== null && breakEvenYears > horizonYears && breakEvenYears <= MAX_HORIZON_YEARS) {
    notes.push(
      `At this rate of work the purchase pays back in about ${breakEvenYears.toFixed(1)} years — longer than the ${horizonYears}-year horizon you set, and likely longer than the tool's useful life for occasional DIY use.`,
    );
  }
  if (resalePercent === 0 && purchasePrice > 0) {
    notes.push(
      "No resale value was assumed. Power tools in working order usually fetch something second-hand, which shifts the comparison towards buying.",
    );
  }
  if (hiresPerYear > 0 && daysPerHire >= 7) {
    notes.push(
      "Hires of a week or more are usually quoted at a discounted weekly or monthly rate rather than seven times the day rate — check the rental card and enter the effective per-day figure.",
    );
  }
  if (hiresPerYear === 0) {
    notes.push("With no jobs planned there is no usage to compare — set how often you expect to need it.");
  }

  return {
    trips,
    usageDays,
    rentHireCost,
    rentTripCost,
    consumables,
    rentTotal,
    purchasePrice,
    upkeep,
    storage,
    capitalCost,
    resaleValue,
    buyFixed,
    buyTotal,
    difference,
    cheaper,
    saving,
    rentPerUsageDay,
    buyPerUsageDay,
    rentPerDayEffective,
    breakEvenDays,
    breakEvenYears,
    notes,
  };
}
