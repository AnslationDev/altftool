/**
 * Travel fund planner.
 *
 * Step 1 — build the trip budget from per-person and per-night components:
 *
 *     flights        = flightPerPerson * travellers
 *     stay           = stayPerNight * nights
 *     dailySpend     = dailyPerPerson * travellers * nights
 *     visa/insurance = perPerson * travellers
 *     baseBudget     = flights + stay + dailySpend + activities + visa + insurance + misc
 *
 * Step 2 — forex loading. Card networks and banks add a markup to the interbank rate, and
 * the markup applies only to the share of the trip actually paid in foreign currency:
 *
 *     forexCost = baseBudget * foreignSharePct * markupPct
 *
 * Step 3 — contingency. A buffer on top of everything, because flight changes, medical
 * costs and a weak rupee do not respect a spreadsheet:
 *
 *     contingency = (baseBudget + forexCost) * contingencyPct
 *
 * Step 4 — TCS. Section 206C(1G) of the Income-tax Act requires tax to be collected at
 * source on overseas spending. From FY 2025-26 the per-PAN, per-financial-year threshold
 * is ₹10 lakh (raised from ₹7 lakh by the Finance Act 2025):
 *
 *   - Overseas tour programme package bought from a tour operator: 5% on the aggregate up
 *     to ₹10 lakh in the financial year and 20% on the excess.
 *   - Other LRS remittances that are not for education or medical treatment: nil up to
 *     ₹10 lakh in the financial year, 20% on the excess.
 *   - Spending abroad on an international debit or credit card is outside this tool's
 *     scope; check the position that applies to you.
 *
 * TCS is not a cost — it is a prepayment of income tax that is credited against your
 * liability or refunded — but it is cash you must have on the day, so it is included in
 * the amount to fund and reported separately.
 *
 * Step 5 — back-solve the monthly saving. Existing savings compound to the trip date and
 * the remainder comes from an ordinary annuity:
 *
 *     C = (need - existing*(1+i)^n) * i / ((1+i)^n - 1)      (i > 0)
 */

/** Section 206C(1G) threshold per PAN per financial year, FY 2025-26 onwards (₹). */
export const LRS_TCS_THRESHOLD = 1000000;
/** TCS on an overseas tour programme package, on the amount up to the threshold. */
export const TOUR_PACKAGE_TCS_LOW_RATE = 5;
/** TCS on an overseas tour programme package, on the amount above the threshold. */
export const TOUR_PACKAGE_TCS_HIGH_RATE = 20;
/** TCS on other LRS remittances (non-education, non-medical) above the threshold. */
export const OTHER_LRS_TCS_RATE = 20;

export const TCS_MODES = [
  { id: "none", label: "Domestic trip — no TCS" },
  { id: "tour-package", label: "Overseas tour package from an operator" },
  { id: "lrs-other", label: "Other overseas remittance under LRS" },
];

export const MAX_TRAVELLERS = 30;
export const MAX_NIGHTS = 365;
export const MAX_MONTHS = 120;
export const MAX_RATE_PCT = 25;
export const MAX_MARKUP_PCT = 10;
export const MAX_CONTINGENCY_PCT = 50;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * TCS payable on an overseas amount, given how much of the financial-year threshold has
 * already been used by earlier remittances.
 */
export function tcsOnOverseasSpend(amount, mode, alreadyRemitted = 0) {
  if (!(amount > 0) || mode === "none") return { tcs: 0, lowSlab: 0, highSlab: 0 };
  const used = Math.max(0, alreadyRemitted);
  const remaining = Math.max(0, LRS_TCS_THRESHOLD - used);
  const lowSlab = Math.min(amount, remaining);
  const highSlab = Math.max(0, amount - remaining);

  if (mode === "tour-package") {
    return {
      tcs: (lowSlab * TOUR_PACKAGE_TCS_LOW_RATE) / 100 + (highSlab * TOUR_PACKAGE_TCS_HIGH_RATE) / 100,
      lowSlab,
      highSlab,
    };
  }
  if (mode === "lrs-other") {
    return { tcs: (highSlab * OTHER_LRS_TCS_RATE) / 100, lowSlab, highSlab };
  }
  return { tcs: 0, lowSlab: 0, highSlab: 0 };
}

/**
 * @param {object} input
 * @param {number|string} input.travellers How many people are going.
 * @param {number|string} input.nights Nights away.
 * @param {number|string} [input.flightPerPerson] Return airfare per person.
 * @param {number|string} [input.stayPerNight] Total accommodation cost per night.
 * @param {number|string} [input.dailyPerPerson] Food and local spend per person per day.
 * @param {number|string} [input.activities] Tours, tickets and experiences, total.
 * @param {number|string} [input.visaPerPerson] Visa and processing fees per person.
 * @param {number|string} [input.insurancePerPerson] Travel insurance per person.
 * @param {number|string} [input.misc] Shopping, gifts and anything else, total.
 * @param {number|string} [input.foreignSharePct] Share of the budget paid in foreign currency.
 * @param {number|string} [input.forexMarkupPct] Markup over the interbank rate on that share.
 * @param {number|string} [input.contingencyPct] Buffer on top of the budget.
 * @param {string} [input.tcsMode] One of TCS_MODES ids.
 * @param {number|string} [input.alreadyRemitted] Overseas spend already made this financial year.
 * @param {number|string} [input.monthsToTrip] Months until departure.
 * @param {number|string} [input.existingSavings] Amount already set aside for the trip.
 * @param {number|string} [input.expectedReturn] Return on those savings, % per year.
 */
export function planTravelFund({
  travellers = 1,
  nights = 1,
  flightPerPerson = 0,
  stayPerNight = 0,
  dailyPerPerson = 0,
  activities = 0,
  visaPerPerson = 0,
  insurancePerPerson = 0,
  misc = 0,
  foreignSharePct = 0,
  forexMarkupPct = 0,
  contingencyPct = 10,
  tcsMode = "none",
  alreadyRemitted = 0,
  monthsToTrip = 12,
  existingSavings = 0,
  expectedReturn = 0,
} = {}) {
  const people = toNumber(travellers);
  const stayNights = toNumber(nights);
  const flight = toNumber(flightPerPerson);
  const stay = toNumber(stayPerNight);
  const daily = toNumber(dailyPerPerson);
  const tours = toNumber(activities);
  const visa = toNumber(visaPerPerson);
  const insurance = toNumber(insurancePerPerson);
  const other = toNumber(misc);
  const foreignShare = toNumber(foreignSharePct);
  const markup = toNumber(forexMarkupPct);
  const buffer = toNumber(contingencyPct);
  const remitted = toNumber(alreadyRemitted);
  const months = toNumber(monthsToTrip);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(expectedReturn);

  const numbers = [
    people, stayNights, flight, stay, daily, tours, visa, insurance, other,
    foreignShare, markup, buffer, remitted, months, existing, returnPct,
  ];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Costs, rates and counts cannot be negative." };
  }
  if (!(people >= 1) || people > MAX_TRAVELLERS) {
    return { error: `Travellers should be between 1 and ${MAX_TRAVELLERS}.` };
  }
  if (!(stayNights >= 1) || stayNights > MAX_NIGHTS) {
    return { error: `Nights should be between 1 and ${MAX_NIGHTS}.` };
  }
  if (foreignShare > 100) return { error: "The foreign-currency share cannot exceed 100%." };
  if (markup > MAX_MARKUP_PCT) return { error: `A forex markup above ${MAX_MARKUP_PCT}% is not realistic.` };
  if (buffer > MAX_CONTINGENCY_PCT) {
    return { error: `A contingency above ${MAX_CONTINGENCY_PCT}% is not a budget, it is a guess.` };
  }
  if (!(months >= 1) || months > MAX_MONTHS) {
    return { error: `Months until the trip should be between 1 and ${MAX_MONTHS}.` };
  }
  if (returnPct > MAX_RATE_PCT) {
    return { error: `An assumed return above ${MAX_RATE_PCT}% a year is not realistic for a short goal.` };
  }
  if (!TCS_MODES.some((entry) => entry.id === tcsMode)) {
    return { error: "Choose how the overseas payment is being made." };
  }

  const wholeTravellers = Math.round(people);
  const wholeNights = Math.round(stayNights);
  const wholeMonths = Math.round(months);

  const lines = [
    { label: "Flights", amount: flight * wholeTravellers },
    { label: "Accommodation", amount: stay * wholeNights },
    { label: "Food & local spend", amount: daily * wholeTravellers * wholeNights },
    { label: "Activities & tickets", amount: tours },
    { label: "Visa & processing", amount: visa * wholeTravellers },
    { label: "Travel insurance", amount: insurance * wholeTravellers },
    { label: "Shopping & extras", amount: other },
  ];

  const baseBudget = lines.reduce((sum, line) => sum + line.amount, 0);
  if (!(baseBudget > 0)) {
    return { error: "Every cost is zero — fill in at least one part of the trip budget." };
  }

  const foreignPortion = (baseBudget * foreignShare) / 100;
  const forexCost = (foreignPortion * markup) / 100;
  const contingency = ((baseBudget + forexCost) * buffer) / 100;

  const overseasSpend = tcsMode === "none" ? 0 : foreignPortion + forexCost;
  const { tcs, lowSlab, highSlab } = tcsOnOverseasSpend(overseasSpend, tcsMode, remitted);

  const totalNeeded = baseBudget + forexCost + contingency + tcs;

  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, wholeMonths);
  const existingFuture = existing * growthFactor;
  const gap = Math.max(0, totalNeeded - existingFuture);

  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / wholeMonths : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  const perPerson = totalNeeded / wholeTravellers;
  const perDay = totalNeeded / wholeNights;

  return {
    travellers: wholeTravellers,
    nights: wholeNights,
    months: wholeMonths,
    lines: lines
      .filter((line) => line.amount > 0)
      .map((line) => ({
        label: line.label,
        amount: round0(line.amount),
        sharePct: round2((line.amount / baseBudget) * 100),
      })),
    baseBudget: round0(baseBudget),
    foreignPortion: round0(foreignPortion),
    forexCost: round0(forexCost),
    contingency: round0(contingency),
    tcs: round0(tcs),
    tcsLowSlab: round0(lowSlab),
    tcsHighSlab: round0(highSlab),
    tcsMode,
    totalNeeded: round0(totalNeeded),
    perPerson: round0(perPerson),
    perDay: round0(perDay),
    existingFuture: round0(existingFuture),
    gap: round0(gap),
    monthlySaving: round0(monthlySaving),
    totalContributed: round0(monthlySaving * wholeMonths),
    growthEarned: round0(Math.max(0, gap - monthlySaving * wholeMonths)),
    fullyFunded: gap <= 0,
  };
}
