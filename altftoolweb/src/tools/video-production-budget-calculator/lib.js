/**
 * Video production budget build-up.
 *
 * The order of operations follows how production companies actually quote:
 *
 *   direct costs   = crew + gear + post + other line items
 *   contingency    = direct x contingency%
 *   fee base       = direct + contingency
 *   production fee = fee base x fee%
 *   pre-tax total  = fee base + production fee
 *   tax            = pre-tax total x tax%
 *   grand total    = pre-tax total + tax
 *
 * Contingency is applied before the fee because the fee is the company's margin
 * on everything it is responsible for delivering, including the buffer.
 */

/**
 * India levies GST at 18% on audio-visual / advertising production services
 * (SAC 9986x-9983x services fall in the 18% slab). Set it to 0 for an
 * out-of-scope or export invoice, or replace it with your local sales tax.
 */
export const GST_SERVICE_RATE_PCT = 18;

/** 10% is the conventional contingency on a straightforward commercial shoot. */
export const DEFAULT_CONTINGENCY_PCT = 10;

/** 15% is a common production-company / agency fee on top of direct costs. */
export const DEFAULT_PRODUCTION_FEE_PCT = 15;

/** Guard rails so a typo cannot produce a nonsense quote. */
export const MAX_PERCENT = 100;
export const MAX_LINE_ITEMS = 20;
export const MAX_DAYS = 365;

/** Starting crew roles for a small commercial shoot. Rates are your inputs, not ours. */
export const DEFAULT_CREW_ROLES = [
  "Director",
  "Director of photography",
  "Camera assistant",
  "Sound recordist",
  "Gaffer",
  "Producer",
  "Hair and makeup",
  "Production assistant",
];

/** Starting gear categories. */
export const DEFAULT_GEAR_ITEMS = [
  "Camera body + lenses",
  "Lighting kit",
  "Audio kit",
  "Grip / support",
  "Drone",
  "Monitors",
];

const num = (value) => Number(value);
const isMoney = (value) => Number.isFinite(value) && value >= 0;

/** Sum of dayRate x days x quantity for a list of hire lines. */
export function sumHireLines(lines) {
  let total = 0;
  for (const line of lines) {
    total += num(line.rate) * num(line.days) * num(line.quantity);
  }
  return total;
}

/**
 * @param {object} input
 * @param {Array}  input.crew   [{ label, rate (per day), days, quantity }]
 * @param {Array}  input.gear   [{ label, rate (per day), days, quantity }]
 * @param {number} input.postHours       editing / grading / mixing hours
 * @param {number} input.postHourlyRate
 * @param {Array}  input.other  [{ label, amount }] flat costs: travel, talent, music licence
 * @param {number} [input.contingencyPct]
 * @param {number} [input.productionFeePct]
 * @param {number} [input.taxPct]
 * @param {number} [input.finishedMinutes] runtime of the delivered cut
 * @param {number} [input.shootDays]
 * @returns {object} budget, or { error } when the input cannot produce a real quote
 */
export function computeVideoBudget({
  crew = [],
  gear = [],
  postHours = 0,
  postHourlyRate = 0,
  other = [],
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  productionFeePct = DEFAULT_PRODUCTION_FEE_PCT,
  taxPct = GST_SERVICE_RATE_PCT,
  finishedMinutes = 0,
  shootDays = 0,
} = {}) {
  if (!Array.isArray(crew) || !Array.isArray(gear) || !Array.isArray(other)) {
    return { error: "Crew, gear and other costs must each be a list of line items." };
  }
  if (crew.length > MAX_LINE_ITEMS || gear.length > MAX_LINE_ITEMS || other.length > MAX_LINE_ITEMS) {
    return { error: `Keep each section to ${MAX_LINE_ITEMS} line items or fewer.` };
  }

  for (const [name, lines] of [
    ["crew", crew],
    ["gear", gear],
  ]) {
    for (const line of lines) {
      const rate = num(line?.rate);
      const days = num(line?.days);
      const quantity = num(line?.quantity);
      if (!isMoney(rate)) return { error: `Every ${name} day rate must be zero or a positive amount.` };
      if (!Number.isFinite(days) || days < 0 || days > MAX_DAYS) {
        return { error: `Every ${name} line needs between 0 and ${MAX_DAYS} days.` };
      }
      if (!Number.isFinite(quantity) || quantity < 0 || quantity > 999) {
        return { error: `Every ${name} line needs a quantity between 0 and 999.` };
      }
    }
  }

  for (const line of other) {
    if (!isMoney(num(line?.amount))) {
      return { error: "Every other-cost amount must be zero or a positive number." };
    }
  }

  const hours = num(postHours);
  const hourly = num(postHourlyRate);
  if (!Number.isFinite(hours) || hours < 0 || hours > 10000) {
    return { error: "Post-production hours must be between 0 and 10,000." };
  }
  if (!isMoney(hourly)) return { error: "The post-production hourly rate cannot be negative." };

  const percents = { contingencyPct, productionFeePct, taxPct };
  for (const [key, value] of Object.entries(percents)) {
    const parsed = num(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_PERCENT) {
      return { error: `${key.replace("Pct", "")} must be a percentage between 0 and ${MAX_PERCENT}.` };
    }
  }

  const minutes = num(finishedMinutes);
  const days = num(shootDays);
  if (!Number.isFinite(minutes) || minutes < 0) return { error: "Finished runtime cannot be negative." };
  if (!Number.isFinite(days) || days < 0 || days > MAX_DAYS) {
    return { error: `Shoot days must be between 0 and ${MAX_DAYS}.` };
  }

  const crewTotal = sumHireLines(crew);
  const gearTotal = sumHireLines(gear);
  const postTotal = hours * hourly;
  const otherTotal = other.reduce((sum, line) => sum + num(line.amount), 0);

  const directTotal = crewTotal + gearTotal + postTotal + otherTotal;
  if (!(directTotal > 0)) {
    return { error: "Add at least one cost — every line is currently zero." };
  }

  const contingency = directTotal * (num(contingencyPct) / 100);
  const feeBase = directTotal + contingency;
  const productionFee = feeBase * (num(productionFeePct) / 100);
  const preTaxTotal = feeBase + productionFee;
  const tax = preTaxTotal * (num(taxPct) / 100);
  const grandTotal = preTaxTotal + tax;

  const share = (value) => (directTotal > 0 ? (value / directTotal) * 100 : 0);

  return {
    crewTotal,
    gearTotal,
    postTotal,
    otherTotal,
    directTotal,
    contingency,
    feeBase,
    productionFee,
    preTaxTotal,
    tax,
    grandTotal,
    shares: {
      crew: share(crewTotal),
      gear: share(gearTotal),
      post: share(postTotal),
      other: share(otherTotal),
    },
    costPerFinishedMinute: minutes > 0 ? grandTotal / minutes : null,
    costPerShootDay: days > 0 ? grandTotal / days : null,
    postHours: hours,
  };
}
