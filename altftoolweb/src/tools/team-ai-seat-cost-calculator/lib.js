/**
 * Team AI Seat Cost Calculator — pure arithmetic.
 *
 * Every rate is supplied by the caller; nothing about vendor pricing is assumed.
 * The comparison is between:
 *   seat model: seats x price per seat per month
 *   usage model: messages x (input tokens x input rate + output tokens x output rate)
 * Token prices are quoted per million tokens, which is how the major model APIs
 * publish them.
 */

/** Model APIs quote prices per million tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;
/** Typical billable working days in a month (about 261 working days / 12). */
export const DEFAULT_WORKING_DAYS = 21;
/** Months in a year, used for the annual view. */
export const MONTHS_PER_YEAR = 12;
/** Seat utilisation at or below this is treated as clear over-provisioning. */
export const LOW_UTILISATION_THRESHOLD = 0.6;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.seats            paid seats on the contract
 * @param {number} input.pricePerSeat     price per seat per month, before discount
 * @param {number} input.activeUsers      people who actually used it this month
 * @param {number} input.annualDiscountPct discount for paying annually, in percent
 * @param {number} input.messagesPerDay   messages per active user per working day
 * @param {number} input.inputTokens      average input tokens per message
 * @param {number} input.outputTokens     average output tokens per message
 * @param {number} input.inputPricePerM   API price per million input tokens
 * @param {number} input.outputPricePerM  API price per million output tokens
 * @param {number} input.workingDays      working days per month
 */
export function computeSeatCost({
  seats,
  pricePerSeat,
  activeUsers,
  annualDiscountPct = 0,
  messagesPerDay,
  inputTokens,
  outputTokens,
  inputPricePerM,
  outputPricePerM,
  workingDays = DEFAULT_WORKING_DAYS,
} = {}) {
  const numbers = {
    seats,
    pricePerSeat,
    activeUsers,
    annualDiscountPct,
    messagesPerDay,
    inputTokens,
    outputTokens,
    inputPricePerM,
    outputPricePerM,
    workingDays,
  };
  if (Object.values(numbers).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (seats < 1) return { error: "You need at least one seat to compare." };
  if (activeUsers < 0) return { error: "Active users cannot be negative." };
  if (activeUsers > seats) return { error: "Active users cannot exceed the number of paid seats." };
  if (pricePerSeat < 0) return { error: "Price per seat cannot be negative." };
  if (annualDiscountPct < 0 || annualDiscountPct >= 100) {
    return { error: "Annual discount must be between 0% and 99%." };
  }
  if (messagesPerDay < 0) return { error: "Messages per day cannot be negative." };
  if (inputTokens < 0 || outputTokens < 0) return { error: "Token counts cannot be negative." };
  if (inputPricePerM < 0 || outputPricePerM < 0) return { error: "Token prices cannot be negative." };
  if (workingDays < 1 || workingDays > 31) return { error: "Working days per month must be between 1 and 31." };

  const discountedSeatPrice = pricePerSeat * (1 - annualDiscountPct / 100);
  const monthlySeatCost = seats * discountedSeatPrice;
  const annualSeatCost = monthlySeatCost * MONTHS_PER_YEAR;

  const utilisation = seats > 0 ? activeUsers / seats : 0;
  const idleSeats = seats - activeUsers;
  const idleMonthlyCost = idleSeats * discountedSeatPrice;
  const idleAnnualCost = idleMonthlyCost * MONTHS_PER_YEAR;

  const costPerActiveUser = activeUsers > 0 ? monthlySeatCost / activeUsers : null;

  const messagesPerUserMonth = messagesPerDay * workingDays;
  const totalMessagesMonth = messagesPerUserMonth * activeUsers;
  const costPerSeatMessage =
    totalMessagesMonth > 0 ? monthlySeatCost / totalMessagesMonth : null;

  // Usage-based alternative.
  const costPerMessage =
    (inputTokens * inputPricePerM + outputTokens * outputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const apiMonthlyPerUser = costPerMessage * messagesPerUserMonth;
  const apiMonthlyTotal = apiMonthlyPerUser * activeUsers;
  const apiAnnualTotal = apiMonthlyTotal * MONTHS_PER_YEAR;

  // Messages per user per day at which usage pricing costs the same as one seat.
  const breakEvenMessagesPerDay =
    costPerMessage > 0 ? discountedSeatPrice / (costPerMessage * workingDays) : null;

  const rightSizedMonthlyCost = activeUsers * discountedSeatPrice;
  const rightSizingSaving = monthlySeatCost - rightSizedMonthlyCost;

  const seatVsApiMonthly = monthlySeatCost - apiMonthlyTotal;
  const cheaperModel =
    Math.abs(seatVsApiMonthly) < 0.005 ? "tie" : seatVsApiMonthly > 0 ? "usage" : "seats";

  const notes = [];
  if (utilisation <= LOW_UTILISATION_THRESHOLD) {
    notes.push(
      `Only ${Math.round(utilisation * 100)}% of seats were used. Cutting to ${activeUsers} seat${activeUsers === 1 ? "" : "s"} at renewal saves the idle spend without touching anyone's access.`,
    );
  }
  if (breakEvenMessagesPerDay !== null && messagesPerDay > 0) {
    notes.push(
      breakEvenMessagesPerDay > messagesPerDay
        ? `At ${round2(breakEvenMessagesPerDay)} messages a day the two models cost the same; your team averages ${messagesPerDay}, so usage pricing is currently cheaper per head.`
        : `The break-even is ${round2(breakEvenMessagesPerDay)} messages a day and your team averages ${messagesPerDay}, so the flat seat price is doing real work.`,
    );
  }
  if (activeUsers === 0) {
    notes.push("Nobody used it this month — every currency unit of the subscription is idle spend.");
  }

  return {
    discountedSeatPrice: round2(discountedSeatPrice),
    monthlySeatCost: round2(monthlySeatCost),
    annualSeatCost: round2(annualSeatCost),
    utilisationPct: Math.round(utilisation * 1000) / 10,
    idleSeats,
    idleMonthlyCost: round2(idleMonthlyCost),
    idleAnnualCost: round2(idleAnnualCost),
    costPerActiveUser: costPerActiveUser === null ? null : round2(costPerActiveUser),
    messagesPerUserMonth,
    totalMessagesMonth,
    costPerSeatMessage: costPerSeatMessage === null ? null : Math.round(costPerSeatMessage * 10000) / 10000,
    costPerMessage: Math.round(costPerMessage * 1000000) / 1000000,
    apiMonthlyPerUser: round2(apiMonthlyPerUser),
    apiMonthlyTotal: round2(apiMonthlyTotal),
    apiAnnualTotal: round2(apiAnnualTotal),
    breakEvenMessagesPerDay:
      breakEvenMessagesPerDay === null ? null : Math.round(breakEvenMessagesPerDay * 10) / 10,
    rightSizedMonthlyCost: round2(rightSizedMonthlyCost),
    rightSizingSaving: round2(rightSizingSaving),
    rightSizingAnnualSaving: round2(rightSizingSaving * MONTHS_PER_YEAR),
    seatVsApiMonthly: round2(seatVsApiMonthly),
    seatVsApiAnnual: round2(seatVsApiMonthly * MONTHS_PER_YEAR),
    cheaperModel,
    notes,
  };
}
