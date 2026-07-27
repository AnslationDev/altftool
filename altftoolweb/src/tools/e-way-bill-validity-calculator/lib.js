/**
 * Validity of an e-way bill under Rule 138(10) of the Central Goods and Services Tax Rules, 2017.
 *
 * The rule gives one day of validity for the first block of distance and one more day for every
 * further block or part of a block:
 *
 *   - Cargo other than over dimensional cargo: 200 km per day. This figure was 100 km until
 *     Notification No. 94/2020-Central Tax doubled it with effect from 1 January 2021.
 *   - Over dimensional cargo, and multimodal shipment where at least one leg is by ship: 20 km
 *     per day.
 *
 * The Explanation to Rule 138(10) fixes how a day is counted: validity runs from the time the
 * e-way bill is generated, and each day expires at midnight of the day immediately following the
 * date of generation. So a one-day bill generated at any hour on 5 July stays valid until
 * midnight at the end of 6 July.
 */

/** Kilometres per day of validity. */
export const KM_PER_DAY_NORMAL = 200;
export const KM_PER_DAY_ODC = 20;

/** The kilometres-per-day figure that applied before 1 January 2021, kept for context. */
export const KM_PER_DAY_NORMAL_BEFORE_2021 = 100;

/**
 * Third proviso to Rule 138(10): where the goods cannot be transported within the validity
 * period, the transporter may update Part B and extend the validity within eight hours before
 * or eight hours after expiry.
 */
export const EXTENSION_WINDOW_HOURS = 8;

/** The e-way bill portal will not accept a distance beyond this many kilometres. */
export const MAX_DISTANCE_KM = 4000;

export const CARGO_TYPES = [
  {
    id: "normal",
    label: "Normal cargo",
    kmPerDay: KM_PER_DAY_NORMAL,
    note: "One day for the first 200 km and one more day for every further 200 km or part of it.",
  },
  {
    id: "odc",
    label: "Over dimensional cargo or a multimodal shipment with a leg by ship",
    kmPerDay: KM_PER_DAY_ODC,
    note: "One day for the first 20 km and one more day for every further 20 km or part of it.",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getCargoType(id) {
  return CARGO_TYPES.find((type) => type.id === id);
}

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

/** "6 July 2025", built without relying on the host locale. */
export function longDate(isoValue) {
  const date = parseIsoDate(isoValue);
  if (!date) return "";
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Days of validity for a distance. Rule 138(10): one day per block or part of a block. */
export function validityDaysForDistance(distanceKm, kmPerDay) {
  const distance = Number(distanceKm);
  const block = Number(kmPerDay);
  if (!Number.isFinite(distance) || distance <= 0) return null;
  if (!Number.isFinite(block) || block <= 0) return null;
  return Math.max(1, Math.ceil(distance / block));
}

/**
 * Full validity calculation for one e-way bill.
 *
 * @param {object} input
 * @param {number} input.distanceKm       Approximate distance to be covered.
 * @param {string} input.cargoTypeId      "normal" or "odc"
 * @param {string} input.generatedOn      Date of generation, yyyy-mm-dd.
 * @param {string} [input.today]          Reference date for the countdown, yyyy-mm-dd.
 * @returns {object} the validity, or { error }.
 */
export function computeEwayBillValidity({ distanceKm, cargoTypeId, generatedOn, today }) {
  const cargo = getCargoType(cargoTypeId);
  if (!cargo) return { error: "Choose whether the consignment is normal or over dimensional cargo." };

  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) return { error: "Enter the distance in kilometres as a number." };
  if (distance <= 0) return { error: "The distance must be more than zero kilometres." };
  if (distance > MAX_DISTANCE_KM) {
    return { error: `The e-way bill portal accepts distances up to ${MAX_DISTANCE_KM} km.` };
  }

  const generated = parseIsoDate(generatedOn);
  if (!generated) return { error: "Enter the generation date in yyyy-mm-dd form." };

  const validityDays = validityDaysForDistance(distance, cargo.kmPerDay);
  if (!validityDays) return { error: "The distance must be more than zero kilometres." };

  // The Explanation to Rule 138(10): each day expires at midnight of the day immediately
  // following the date of generation, so an n-day bill runs to the end of generation date + n.
  const lastValidDay = new Date(generated.getTime() + validityDays * MS_PER_DAY);
  const lastValidIso = toIso(lastValidDay);

  // Expiry is midnight at the end of lastValidDay, so the eight-hour window either side runs
  // from 16:00 on that date to 08:00 the next morning.
  const dayAfterExpiry = toIso(new Date(lastValidDay.getTime() + MS_PER_DAY));
  const extensionWindow = `16:00 on ${longDate(lastValidIso)} to 08:00 on ${longDate(dayAfterExpiry)}`;

  const reference = parseIsoDate(today);
  const daysRemaining = reference
    ? Math.round((lastValidDay.getTime() - reference.getTime()) / MS_PER_DAY)
    : null;

  let status = null;
  if (daysRemaining !== null) {
    if (daysRemaining < 0) status = "expired";
    else if (daysRemaining === 0) status = "expires-tonight";
    else status = "valid";
  }

  const fullBlocks = Math.floor(distance / cargo.kmPerDay);
  const remainderKm = Math.round((distance - fullBlocks * cargo.kmPerDay) * 100) / 100;

  return {
    cargoType: cargo.label,
    cargoTypeId: cargo.id,
    kmPerDay: cargo.kmPerDay,
    cargoNote: cargo.note,
    distanceKm: distance,
    validityDays,
    generatedOn: toIso(generated),
    lastValidDate: lastValidIso,
    expiryDescription: `Valid until midnight at the end of ${longDate(lastValidIso)}`,
    extensionWindowHours: EXTENSION_WINDOW_HOURS,
    extensionWindow,
    daysRemaining,
    status,
    fullBlocks,
    remainderKm,
    partBlockUsed: remainderKm > 0,
  };
}

/** A small reference table of distance to validity for the chosen cargo type. */
export function validityTable(cargoTypeId, rows = 6) {
  const cargo = getCargoType(cargoTypeId);
  if (!cargo) return [];
  const table = [];
  for (let day = 1; day <= rows; day += 1) {
    table.push({
      days: day,
      upToKm: day * cargo.kmPerDay,
      fromKm: (day - 1) * cargo.kmPerDay + 1,
    });
  }
  return table;
}
