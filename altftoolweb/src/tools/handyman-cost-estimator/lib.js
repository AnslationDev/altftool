/**
 * Handyman Cost Estimator.
 *
 * Pricing follows how independent tradespeople and home-service platforms bill in
 * India: a trade hourly rate applied to billable hours (with a one-hour minimum per
 * job line), one visit charge per trip, materials at cost plus a handling markup when
 * the tradesperson buys them, an urgency loading for same-day or out-of-hours work,
 * and 18% GST, the rate for household repair, installation and maintenance services.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** GST on household repair, installation and maintenance services. */
export const GST_RATE = 0.18;

/** Hourly rates in INR at the tier-1 non-metro baseline. */
export const TRADES = [
  { id: "electrician", label: "Electrician", hourlyInr: 350 },
  { id: "plumber", label: "Plumber", hourlyInr: 350 },
  { id: "carpenter", label: "Carpenter", hourlyInr: 400 },
  { id: "painter", label: "Painter", hourlyInr: 300 },
  { id: "general", label: "General handyman", hourlyInr: 300 },
];

/** City tier factors relative to the tier-1 non-metro baseline. */
export const CITY_TIERS = [
  { id: "metro", label: "Metro (Mumbai, Delhi NCR, Bengaluru)", factor: 1.2 },
  { id: "tier1", label: "Tier 1 (Pune, Hyderabad, Chennai, Kolkata)", factor: 1 },
  { id: "tier2", label: "Tier 2 city", factor: 0.85 },
  { id: "tier3", label: "Tier 3 / small town", factor: 0.72 },
];

/** Job catalogue with realistic hands-on hours for one unit of work. */
export const JOBS = [
  { id: "fan-install", label: "Ceiling fan install or replace", trade: "electrician", hours: 0.75, unit: "fan" },
  { id: "light-fixture", label: "Light fixture or chandelier fitting", trade: "electrician", hours: 1.5, unit: "fixture" },
  { id: "switchboard", label: "Switch, socket or switchboard replacement", trade: "electrician", hours: 0.5, unit: "board" },
  { id: "mcb", label: "MCB / distribution board work", trade: "electrician", hours: 1.5, unit: "board" },
  { id: "geyser-install", label: "Geyser installation", trade: "electrician", hours: 1.5, unit: "geyser" },
  { id: "tap", label: "Tap or mixer replacement", trade: "plumber", hours: 0.75, unit: "tap" },
  { id: "flush", label: "Flush tank repair", trade: "plumber", hours: 1, unit: "cistern" },
  { id: "drain", label: "Drain or sink unclogging", trade: "plumber", hours: 1, unit: "drain" },
  { id: "leak", label: "Concealed pipe leak trace and fix", trade: "plumber", hours: 3, unit: "leak" },
  { id: "tv-mount", label: "TV or wall shelf mounting", trade: "carpenter", hours: 1, unit: "mount" },
  { id: "door-lock", label: "Door lock replacement", trade: "carpenter", hours: 1, unit: "lock" },
  { id: "door-align", label: "Door alignment and hinge repair", trade: "carpenter", hours: 1, unit: "door" },
  { id: "curtain-rod", label: "Curtain rod fitting", trade: "carpenter", hours: 0.75, unit: "rod" },
  { id: "kitchen-hardware", label: "Modular kitchen hinge / channel repair", trade: "carpenter", hours: 1.5, unit: "unit" },
  { id: "flatpack", label: "Flat-pack furniture assembly", trade: "carpenter", hours: 2, unit: "item" },
  { id: "paint-touchup", label: "Putty and paint touch-up (per 100 sq ft)", trade: "painter", hours: 3, unit: "100 sq ft" },
  { id: "silicone", label: "Bathroom or kitchen silicone resealing", trade: "general", hours: 1.5, unit: "area" },
  { id: "wall-drill", label: "Wall drilling and anchor fixing", trade: "general", hours: 0.5, unit: "set" },
];

/** Urgency loading on labour. */
export const URGENCY_LEVELS = [
  { id: "standard", label: "Standard — booked a few days ahead", factor: 1 },
  { id: "same-day", label: "Same day", factor: 1.2 },
  { id: "after-hours", label: "Night, Sunday or public holiday", factor: 1.5 },
];

/** Every job line is billed at a one-hour minimum. */
export const MIN_BILLABLE_HOURS_PER_JOB = 1;
/** Visit / inspection charge in INR at the tier-1 baseline, charged once per trip. */
export const VISIT_CHARGE_INR = 150;
/** Handling markup when the tradesperson buys the materials. */
export const MATERIAL_MARKUP = 0.15;

export const MAX_QTY_PER_JOB = 50;
export const MAX_MATERIAL_INR = 500000;

const TRADE_BY_ID = new Map(TRADES.map((trade) => [trade.id, trade]));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {Record<string, number>} input.quantities  job id -> units of work
 * @param {string} input.cityTier
 * @param {string} input.urgency
 * @param {number} input.materialCost  what the parts cost, INR
 * @param {boolean} input.handymanBuysMaterial
 * @param {boolean} input.waiveVisitCharge  visit fee dropped because the job proceeds
 * @param {boolean} input.includeGst
 * @returns {object} quote, or { error }
 */
export function estimateHandymanJob({
  quantities = {},
  cityTier = "tier1",
  urgency = "standard",
  materialCost = 0,
  handymanBuysMaterial = true,
  waiveVisitCharge = true,
  includeGst = true,
} = {}) {
  const tier = CITY_TIERS.find((entry) => entry.id === cityTier);
  if (!tier) return { error: "Choose your city tier." };

  const urgencyLevel = URGENCY_LEVELS.find((entry) => entry.id === urgency);
  if (!urgencyLevel) return { error: "Choose how urgently you need the work done." };

  if (!isFiniteNumber(materialCost)) return { error: "Enter the material cost, or 0 if there is none." };
  if (materialCost < 0) return { error: "Material cost cannot be negative." };
  if (materialCost > MAX_MATERIAL_INR) {
    return { error: `Material above ${MAX_MATERIAL_INR} rupees belongs in a contractor quote, not a handyman visit.` };
  }

  const rows = [];
  let labourBeforeUrgency = 0;
  let rawHours = 0;
  let billableHours = 0;

  for (const job of JOBS) {
    const raw = quantities[job.id];
    const qty = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isFiniteNumber(qty)) return { error: `Enter a quantity for "${job.label}", or leave it blank.` };
    if (qty < 0) return { error: "Job quantities cannot be negative." };
    if (qty > MAX_QTY_PER_JOB) {
      return { error: `More than ${MAX_QTY_PER_JOB} of one job is a contract, not a handyman call.` };
    }
    if (qty === 0) continue;

    const trade = TRADE_BY_ID.get(job.trade);
    const hours = qty * job.hours;
    const billed = Math.max(hours, MIN_BILLABLE_HOURS_PER_JOB);
    const rate = trade.hourlyInr * tier.factor;
    const amount = billed * rate;

    rawHours += hours;
    billableHours += billed;
    labourBeforeUrgency += amount;

    rows.push({
      id: job.id,
      label: job.label,
      unit: job.unit,
      tradeLabel: trade.label,
      qty,
      hours: round2(hours),
      billedHours: round2(billed),
      minimumApplied: billed > hours,
      hourlyRate: Math.round(rate),
      amount: Math.round(amount),
    });
  }

  if (rows.length === 0) return { error: "Add at least one job to price." };

  const labour = labourBeforeUrgency * urgencyLevel.factor;
  const urgencyExtra = labour - labourBeforeUrgency;
  const visitCharge = waiveVisitCharge ? 0 : VISIT_CHARGE_INR * tier.factor;

  const materialMarkup = handymanBuysMaterial ? materialCost * MATERIAL_MARKUP : 0;
  const materialTotal = materialCost + materialMarkup;

  const subtotal = labour + visitCharge + materialTotal;
  const gstAmount = includeGst ? subtotal * GST_RATE : 0;
  const total = subtotal + gstAmount;

  const byTrade = TRADES.map((trade) => {
    const tradeRows = rows.filter((row) => row.tradeLabel === trade.label);
    return {
      id: trade.id,
      label: trade.label,
      jobs: tradeRows.length,
      hours: round2(tradeRows.reduce((sum, row) => sum + row.billedHours, 0)),
      amount: Math.round(tradeRows.reduce((sum, row) => sum + row.amount, 0)),
    };
  }).filter((entry) => entry.jobs > 0);

  return {
    rows,
    byTrade,
    tierLabel: tier.label,
    urgencyLabel: urgencyLevel.label,
    rawHours: round2(rawHours),
    billableHours: round2(billableHours),
    minimumHoursAdded: round2(billableHours - rawHours),
    labourBeforeUrgency: Math.round(labourBeforeUrgency),
    urgencyFactor: urgencyLevel.factor,
    urgencyExtra: Math.round(urgencyExtra),
    labour: Math.round(labour),
    visitCharge: Math.round(visitCharge),
    materialCost: Math.round(materialCost),
    materialMarkup: Math.round(materialMarkup),
    materialTotal: Math.round(materialTotal),
    subtotal: Math.round(subtotal),
    gstRate: includeGst ? GST_RATE : 0,
    gstAmount: Math.round(gstAmount),
    total: Math.round(total),
    effectiveHourly: billableHours > 0 ? Math.round(total / billableHours) : 0,
    tradesNeeded: byTrade.length,
  };
}
