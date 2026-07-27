/**
 * Prescription refill schedule builder.
 *
 * Turns the three numbers written on a dispensing label — quantity dispensed,
 * how much is taken a day, and how many repeats are authorised — into the date
 * of every fill and the reminder date before it.
 *
 *   days supply per fill = floor(quantity dispensed / units taken per day)
 *   fill n date          = first fill date + (n - 1) x days supply
 *   fill n covers until  = fill n date + days supply - 1
 *   reminder for fill n  = fill n date - reminder lead days
 *   total fills          = 1 original + repeats authorised
 *
 * floor() is used deliberately: a quantity that does not divide evenly leaves
 * a part day of medicine, and a part day is not a day of cover. The remainder
 * is reported separately.
 *
 * Prescription validity is jurisdiction-specific. In the United States a
 * non-controlled prescription is generally valid for one year from the date it
 * was written, and Schedule III-V controlled substances for six months with at
 * most five refills; in the UK an NHS prescription is normally valid for six
 * months from the appropriate date, and in India there is no single statutory
 * expiry for a non-scheduled prescription. Because of that, the expiry date is
 * an input here rather than a rule baked into the code, and any fill that falls
 * after it is flagged.
 */

/** Longest schedule the builder will lay out (1 original + 23 repeats). */
export const MAX_FILLS = 24;

/** Default number of days before a fill to raise the reminder. */
export const DEFAULT_REMINDER_LEAD_DAYS = 5;

/** Common validity periods, offered as a convenience when setting an expiry. */
export const VALIDITY_REFERENCES = [
  { id: "us-standard", label: "United States, non-controlled: 1 year from the date written", days: 365 },
  { id: "us-schedule", label: "United States, Schedule III-V: 6 months, up to 5 refills", days: 182 },
  { id: "uk-nhs", label: "UK NHS prescription: 6 months from the appropriate date", days: 182 },
];

const MS_PER_DAY = 86400000;

function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

const toIso = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * MS_PER_DAY);

/**
 * @param {object} input
 * @param {number} input.quantityDispensed  Tablets, capsules or ml handed over each fill.
 * @param {number} input.unitsPerDay        Amount taken a day, same unit as the quantity.
 * @param {string} input.firstFillDate      Date of the first fill, "YYYY-MM-DD".
 * @param {number} input.repeats            Repeats authorised after the first fill.
 * @param {number} [input.reminderLeadDays] Days before each fill to be reminded.
 * @param {string} [input.expiryDate]       Date the prescription stops being valid.
 * @returns {object} schedule or { error }
 */
export function buildRefillSchedule({
  quantityDispensed,
  unitsPerDay,
  firstFillDate,
  repeats = 0,
  reminderLeadDays = DEFAULT_REMINDER_LEAD_DAYS,
  expiryDate = "",
}) {
  const numbers = { quantityDispensed, unitsPerDay, repeats, reminderLeadDays };
  const badKey = Object.keys(numbers).find(
    (key) => typeof numbers[key] !== "number" || !Number.isFinite(numbers[key]),
  );
  if (badKey) return { error: "Enter valid numbers in every field." };

  if (quantityDispensed <= 0) {
    return { error: "The quantity dispensed must be greater than zero." };
  }
  if (unitsPerDay <= 0) {
    return { error: "The amount taken per day must be greater than zero." };
  }
  if (quantityDispensed < unitsPerDay) {
    return { error: "The quantity dispensed is less than a single day's dose — check the units." };
  }
  if (repeats < 0) return { error: "Repeats authorised cannot be negative." };
  if (repeats + 1 > MAX_FILLS) {
    return { error: `This builder lays out up to ${MAX_FILLS} fills at a time.` };
  }
  if (reminderLeadDays < 0) return { error: "The reminder lead time cannot be negative." };

  const start = parseIsoDate(firstFillDate);
  if (!start) return { error: "Enter the first fill date as a valid calendar date." };

  const expiry = expiryDate ? parseIsoDate(expiryDate) : null;
  if (expiryDate && !expiry) {
    return { error: "Enter the prescription expiry as a valid calendar date, or leave it blank." };
  }
  if (expiry && expiry < start) {
    return { error: "The prescription expiry cannot be before the first fill date." };
  }

  const daysSupply = Math.floor(quantityDispensed / unitsPerDay);
  if (daysSupply < 1) {
    return { error: "That quantity does not cover a single full day at this dose." };
  }
  const remainderUnits = quantityDispensed - daysSupply * unitsPerDay;
  const totalFills = Math.floor(repeats) + 1;

  const fills = [];
  for (let index = 0; index < totalFills; index += 1) {
    const fillDate = addDays(start, index * daysSupply);
    const reminderDate = addDays(fillDate, -reminderLeadDays);
    fills.push({
      number: index + 1,
      isFirst: index === 0,
      fillIso: toIso(fillDate),
      coversUntilIso: toIso(addDays(fillDate, daysSupply - 1)),
      reminderIso: index === 0 ? null : toIso(reminderDate),
      afterExpiry: expiry ? fillDate > expiry : false,
    });
  }

  const lastFill = fills[fills.length - 1];
  const blockedFills = fills.filter((fill) => fill.afterExpiry);

  return {
    daysSupply,
    remainderUnits,
    hasRemainder: remainderUnits > 0,
    totalFills,
    repeats: Math.floor(repeats),
    fills,
    firstFillIso: toIso(start),
    lastFillIso: lastFill.fillIso,
    coveredUntilIso: lastFill.coversUntilIso,
    totalDaysCovered: daysSupply * totalFills,
    totalUnits: quantityDispensed * totalFills,
    reminderLeadDays,
    expiryIso: expiry ? toIso(expiry) : null,
    blockedFills: blockedFills.length,
    firstBlockedIso: blockedFills.length ? blockedFills[0].fillIso : null,
  };
}

/** Suggested expiry date for a common validity rule, from the date written. */
export function expiryFromRule(dateWrittenIso, ruleId) {
  const written = parseIsoDate(dateWrittenIso);
  const rule = VALIDITY_REFERENCES.find((item) => item.id === ruleId);
  if (!written || !rule) return { error: "Give a valid date written and a known validity rule." };
  return { expiryIso: toIso(addDays(written, rule.days)), label: rule.label, days: rule.days };
}
