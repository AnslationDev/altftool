/**
 * Blister strip run-out and reorder tracker.
 *
 * Pure supply arithmetic on the tablets you can physically count:
 *
 *   tablets on hand   = full strips x tablets per strip + loose tablets
 *   tablets per day   = tablets per dose x doses per day
 *   full days covered = floor(tablets on hand / tablets per day)
 *   last covered day  = count date + (full days covered - 1)
 *   run-out date      = count date + full days covered
 *   reorder date      = run-out date - (supply lead time + safety buffer)
 *
 * The count date is treated as day 1 of the remaining supply, i.e. today's
 * doses are still to be taken out of the tablets you counted. A leftover
 * smaller than one day's requirement is reported separately rather than
 * rounded up, because a part day of tablets is not a day of cover.
 *
 * Packs to order are whole packs, because pharmacies dispense whole packs:
 *   packs = ceil(days you want covered x tablets per day / tablets per pack)
 *
 * All dates are arguments, so the function is pure and reproducible.
 */

/** Default number of days between placing an order and having it in hand. */
export const DEFAULT_LEAD_DAYS = 3;

/** Default safety buffer kept on top of the lead time. */
export const DEFAULT_BUFFER_DAYS = 2;

/** A supply this short is treated as urgent rather than merely due. */
export const CRITICAL_DAYS = 7;

/** Refuses counts beyond this, which almost always means a typo. */
export const MAX_TABLETS = 100000;

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
 * @param {number} input.fullStrips       Unopened strips left.
 * @param {number} input.tabletsPerStrip  Tablets on one full strip.
 * @param {number} input.looseTablets     Tablets left on part-used strips.
 * @param {number} input.tabletsPerDose   Tablets taken each time.
 * @param {number} input.dosesPerDay      Doses taken each day.
 * @param {string} input.countDate        Date of the count, "YYYY-MM-DD".
 * @param {number} [input.leadDays]       Days between ordering and receiving.
 * @param {number} [input.bufferDays]     Extra safety days before the run-out.
 * @param {number} [input.coverDays]      Days of cover the next order should give.
 * @returns {object} tracker or { error }
 */
export function trackRefill({
  fullStrips = 0,
  tabletsPerStrip = 10,
  looseTablets = 0,
  tabletsPerDose = 1,
  dosesPerDay = 1,
  countDate,
  leadDays = DEFAULT_LEAD_DAYS,
  bufferDays = DEFAULT_BUFFER_DAYS,
  coverDays = 30,
}) {
  const numbers = {
    fullStrips,
    tabletsPerStrip,
    looseTablets,
    tabletsPerDose,
    dosesPerDay,
    leadDays,
    bufferDays,
    coverDays,
  };
  const badKey = Object.keys(numbers).find(
    (key) => typeof numbers[key] !== "number" || !Number.isFinite(numbers[key]),
  );
  if (badKey) return { error: "Enter valid numbers in every field." };

  if (fullStrips < 0 || looseTablets < 0) {
    return { error: "Tablet counts cannot be negative." };
  }
  if (tabletsPerStrip <= 0) return { error: "A strip must hold at least one tablet." };
  if (tabletsPerDose <= 0) return { error: "Tablets per dose must be greater than zero." };
  if (dosesPerDay <= 0) return { error: "Doses per day must be greater than zero." };
  if (leadDays < 0 || bufferDays < 0) {
    return { error: "Lead time and buffer cannot be negative." };
  }
  if (coverDays <= 0) return { error: "The next order must cover at least one day." };

  const start = parseIsoDate(countDate);
  if (!start) return { error: "Enter the date you counted the tablets as a valid date." };

  const tabletsOnHand = fullStrips * tabletsPerStrip + looseTablets;
  if (tabletsOnHand > MAX_TABLETS) {
    return { error: `That works out to more than ${MAX_TABLETS} tablets — check the strip count.` };
  }

  const tabletsPerDay = tabletsPerDose * dosesPerDay;
  const fullDays = Math.floor(tabletsOnHand / tabletsPerDay);
  const leftoverTablets = tabletsOnHand - fullDays * tabletsPerDay;

  const runOut = addDays(start, fullDays);
  const lastCovered = fullDays > 0 ? addDays(start, fullDays - 1) : null;
  const reorderOffset = fullDays - (leadDays + bufferDays);
  const reorder = addDays(start, reorderOffset);

  const tabletsForNextOrder = coverDays * tabletsPerDay;
  const packsToOrder = Math.ceil(tabletsForNextOrder / tabletsPerStrip);

  let status = "ok";
  if (fullDays === 0) status = "out";
  else if (reorderOffset <= 0) status = "order-now";
  else if (fullDays <= CRITICAL_DAYS) status = "low";

  return {
    tabletsOnHand,
    tabletsPerDay,
    fullDays,
    leftoverTablets,
    partialDay: leftoverTablets > 0,
    countDateIso: toIso(start),
    lastCoveredIso: lastCovered ? toIso(lastCovered) : null,
    runOutIso: toIso(runOut),
    reorderIso: toIso(reorder),
    daysUntilReorder: reorderOffset,
    leadDays,
    bufferDays,
    status,
    coverDays,
    tabletsForNextOrder,
    packsToOrder,
    tabletsInNextOrder: packsToOrder * tabletsPerStrip,
    strips: fullStrips,
    tabletsPerStrip,
  };
}

/** Whole strips needed to cover a given number of days at a given daily use. */
export function stripsForDays(days, tabletsPerDay, tabletsPerStrip) {
  if (
    !Number.isFinite(days) ||
    !Number.isFinite(tabletsPerDay) ||
    !Number.isFinite(tabletsPerStrip) ||
    days <= 0 ||
    tabletsPerDay <= 0 ||
    tabletsPerStrip <= 0
  ) {
    return { error: "Days, daily use and strip size must all be greater than zero." };
  }
  const tablets = days * tabletsPerDay;
  return { tablets, strips: Math.ceil(tablets / tabletsPerStrip) };
}
