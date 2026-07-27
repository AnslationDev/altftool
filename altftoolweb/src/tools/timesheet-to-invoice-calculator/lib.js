/**
 * Timesheet to invoice calculator — pure logic.
 *
 * Billing time has three separate stages and they are usually conflated:
 *
 *   1. Parse the logged time. Timesheets arrive as "7:30", "7.5", "7h 30m"
 *      or "450m"; all four mean the same 7.5 hours.
 *   2. Apply the billing increment. Professional-services contracts round each
 *      entry up to a minimum unit — 6 minutes (0.1 h) is the legal-profession
 *      standard, 15 minutes (0.25 h) the agency norm.
 *   3. Price it: base rate, overtime multiplier above a weekly threshold,
 *      discount, then tax on the taxable portion only.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const MINUTES_PER_HOUR = 60;

/** Billing increments in minutes. 6 minutes = 0.1 h is the traditional legal
 * unit; 15 and 30 minutes are common in agency and contractor work. */
export const BILLING_INCREMENTS = [
  { id: "exact", label: "Exact time, no rounding", minutes: 0 },
  { id: "6", label: "6 minutes (0.1 hour) — legal standard", minutes: 6 },
  { id: "10", label: "10 minutes", minutes: 10 },
  { id: "15", label: "15 minutes (0.25 hour)", minutes: 15 },
  { id: "30", label: "30 minutes", minutes: 30 },
  { id: "60", label: "Full hour", minutes: 60 },
];

export const ROUNDING_MODES = {
  up: { id: "up", label: "Round up to the next increment" },
  nearest: { id: "nearest", label: "Round to the nearest increment" },
  down: { id: "down", label: "Round down (never over-bill)" },
};

/** Guard rails so a typo cannot produce a plausible invoice. */
export const MAX_HOURS_PER_LINE = 10000;
export const MAX_RATE = 1000000;

/**
 * Parse a logged duration into decimal hours.
 *
 * Accepted forms: "7.5", "7:30", "7h30", "7h 30m", "90m", "1h".
 *
 * @param {string|number} raw
 * @returns {{ hours: number } | { error: string }}
 */
export function parseDuration(raw) {
  if (isNum(raw)) {
    if (raw < 0) return { error: "Time logged cannot be negative." };
    return { hours: raw };
  }
  const text = String(raw ?? "").trim().toLowerCase();
  if (!text) return { error: "Enter the time logged." };

  // "7:30" — hours and minutes
  const colon = text.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (colon) {
    const h = Number(colon[1]);
    const m = Number(colon[2]);
    if (m >= MINUTES_PER_HOUR) return { error: "Minutes must be under 60 in a h:mm entry." };
    return { hours: h + m / MINUTES_PER_HOUR };
  }

  // "7h 30m", "7h", "30m", "7h30"
  const hm = text.match(/^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in)?)?$/);
  if (hm && (hm[1] || hm[2])) {
    const h = hm[1] ? Number(hm[1]) : 0;
    const m = hm[2] ? Number(hm[2]) : 0;
    return { hours: h + m / MINUTES_PER_HOUR };
  }
  const hOnly = text.match(/^(\d+(?:\.\d+)?)\s*h\s*(\d{1,2})$/);
  if (hOnly) {
    const m = Number(hOnly[2]);
    if (m >= MINUTES_PER_HOUR) return { error: "Minutes must be under 60 in a h:mm entry." };
    return { hours: Number(hOnly[1]) + m / MINUTES_PER_HOUR };
  }

  // Plain decimal hours
  const decimal = text.match(/^\d+(?:\.\d+)?$/);
  if (decimal) return { hours: Number(text) };

  return { error: `"${raw}" is not a time we recognise — try 7.5, 7:30, 7h 30m or 450m.` };
}

/**
 * Apply a billing increment to a duration.
 *
 * @param {number} hours decimal hours
 * @param {number} incrementMinutes 0 for no rounding
 * @param {string} mode key of ROUNDING_MODES
 * @returns {{ hours: number } | { error: string }}
 */
export function roundHours(hours, incrementMinutes, mode = "up") {
  if (!isNum(hours) || hours < 0) return { error: "Time logged cannot be negative." };
  if (hours > MAX_HOURS_PER_LINE) return { error: "That is more hours than a single line can hold." };
  if (!isNum(incrementMinutes) || incrementMinutes < 0) return { error: "The billing increment is invalid." };
  if (incrementMinutes === 0) return { hours };
  if (!ROUNDING_MODES[mode]) return { error: "Choose a rounding rule." };

  const step = incrementMinutes / MINUTES_PER_HOUR;
  const units = hours / step;
  // Nudge by a hair so 30.000000000000004 units does not round up a whole step.
  const nudged = Math.abs(units - Math.round(units)) < 1e-9 ? Math.round(units) : units;
  const rounded =
    mode === "up" ? Math.ceil(nudged) : mode === "down" ? Math.floor(nudged) : Math.round(nudged);
  return { hours: rounded * step };
}

/**
 * Price one timesheet line.
 *
 * @param {object} input
 * @param {string|number} input.time as logged
 * @param {number} input.rate hourly rate
 * @param {number} input.incrementMinutes
 * @param {string} input.mode rounding mode
 * @param {boolean} [input.taxable]
 * @param {string} [input.description]
 * @returns {object} priced line, or { error }
 */
export function priceLine({ time, rate, incrementMinutes, mode, taxable = true, description = "" }) {
  const parsed = parseDuration(time);
  if (parsed.error) return { error: parsed.error };
  if (!isNum(rate) || rate < 0) return { error: "The hourly rate cannot be negative." };
  if (rate > MAX_RATE) return { error: "That hourly rate is implausibly large." };

  const rounded = roundHours(parsed.hours, incrementMinutes, mode);
  if (rounded.error) return { error: rounded.error };

  return {
    description,
    loggedHours: parsed.hours,
    billedHours: rounded.hours,
    roundingHours: rounded.hours - parsed.hours,
    rate,
    amount: rounded.hours * rate,
    taxable: Boolean(taxable),
  };
}

/**
 * Split billed hours into standard and overtime at a threshold.
 *
 * @param {number} billedHours
 * @param {number} thresholdHours hours before overtime starts; 0 disables it
 * @param {number} multiplier e.g. 1.5 for time-and-a-half
 * @param {number} rate base hourly rate
 * @returns {{ standardHours: number, overtimeHours: number, amount: number } | { error: string }}
 */
export function applyOvertime(billedHours, thresholdHours, multiplier, rate) {
  if (!isNum(billedHours) || billedHours < 0) return { error: "Billed hours cannot be negative." };
  if (!isNum(rate) || rate < 0) return { error: "The hourly rate cannot be negative." };
  if (!isNum(thresholdHours) || thresholdHours < 0) return { error: "The overtime threshold cannot be negative." };
  if (!isNum(multiplier) || multiplier < 1) return { error: "The overtime multiplier must be 1 or more." };
  if (thresholdHours === 0) {
    return { standardHours: billedHours, overtimeHours: 0, amount: billedHours * rate };
  }
  const standardHours = Math.min(billedHours, thresholdHours);
  const overtimeHours = Math.max(0, billedHours - thresholdHours);
  return {
    standardHours,
    overtimeHours,
    amount: standardHours * rate + overtimeHours * rate * multiplier,
  };
}

/**
 * Total an invoice from priced lines.
 *
 * Discount is applied to the whole subtotal and then shared pro rata across
 * taxable and non-taxable lines, so tax is charged on the discounted taxable
 * value — the treatment tax authorities expect.
 *
 * @param {object} input
 * @param {Array<object>} input.lines results of priceLine
 * @param {number} [input.discountPercent]
 * @param {number} [input.discountFlat]
 * @param {number} [input.taxPercent]
 * @param {number} [input.expenses] non-taxable pass-through expenses
 * @returns {object} invoice totals, or { error }
 */
export function computeInvoice({
  lines,
  discountPercent = 0,
  discountFlat = 0,
  taxPercent = 0,
  expenses = 0,
}) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { error: "Add at least one timesheet line." };
  }
  const bad = lines.find((line) => line && line.error);
  if (bad) return { error: bad.error };
  if (!isNum(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return { error: "The discount must be between 0% and 100%." };
  }
  if (!isNum(discountFlat) || discountFlat < 0) return { error: "The flat discount cannot be negative." };
  if (!isNum(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "The tax rate must be between 0% and 100%." };
  }
  if (!isNum(expenses) || expenses < 0) return { error: "Expenses cannot be negative." };

  const loggedHours = lines.reduce((sum, line) => sum + line.loggedHours, 0);
  const billedHours = lines.reduce((sum, line) => sum + line.billedHours, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const taxableSubtotal = lines.reduce((sum, line) => sum + (line.taxable ? line.amount : 0), 0);

  if (!(subtotal >= 0) || !Number.isFinite(subtotal)) {
    return { error: "Those figures do not add up to a usable invoice total." };
  }

  let discount = subtotal * (discountPercent / 100) + discountFlat;
  if (discount > subtotal) discount = subtotal;
  const discountFraction = subtotal > 0 ? discount / subtotal : 0;

  const netTaxable = taxableSubtotal * (1 - discountFraction);
  const tax = netTaxable * (taxPercent / 100);
  const netSubtotal = subtotal - discount;
  const total = netSubtotal + tax + expenses;

  return {
    loggedHours,
    billedHours,
    roundingHours: billedHours - loggedHours,
    subtotal,
    taxableSubtotal,
    discount,
    netSubtotal,
    netTaxable,
    tax,
    expenses,
    total,
    effectiveHourly: billedHours > 0 ? netSubtotal / billedHours : 0,
    lineCount: lines.length,
  };
}
