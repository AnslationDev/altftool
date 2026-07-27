/**
 * PUC (Pollution Under Control) renewal planning.
 *
 * Validity rule: Rule 115(7) of the Central Motor Vehicles Rules, 1989 — a PUC
 * certificate issued for a newly registered vehicle is valid for one year from
 * the date of first registration; every certificate after that is valid for six
 * months.
 *
 * All dates are "YYYY-MM-DD" strings handled in UTC; the reference date is an
 * argument, so nothing here reads the clock.
 */

const MS_PER_DAY = 86400000;

/** Rule 115(7), CMVR 1989. */
export const FIRST_CERTIFICATE_MONTHS = 12;
export const RENEWAL_MONTHS = 6;

/** Penalty for driving without a valid PUC — s.190(2), Motor Vehicles Act, 1988. */
export const NO_PUC_PENALTY_INR = 10000;

/**
 * Indicative test charges seen at authorised PUC centres, by vehicle category.
 * The fee is notified state by state and is displayed at the centre, so treat
 * these as starting values and replace them with the amount you actually pay.
 */
export const VEHICLE_CATEGORIES = [
  { id: "two-wheeler", label: "Two-wheeler (petrol)", fee: 80 },
  { id: "three-wheeler", label: "Three-wheeler / auto", fee: 90 },
  { id: "car-petrol", label: "Car — petrol, CNG or LPG", fee: 110 },
  { id: "car-diesel", label: "Car — diesel", fee: 140 },
  { id: "heavy-diesel", label: "Goods or passenger vehicle — diesel", fee: 150 },
];

/** Status bands by days remaining. */
export const STATUS_BANDS = [
  { id: "expired", label: "Expired", max: -1 },
  { id: "critical", label: "Test this week", max: 7 },
  { id: "due", label: "Book the test", max: 30 },
  { id: "ok", label: "In date", max: Infinity },
];

const categoryById = new Map(VEHICLE_CATEGORIES.map((cat) => [cat.id, cat]));

export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year) return NaN;
  if (probe.getUTCMonth() !== month - 1) return NaN;
  if (probe.getUTCDate() !== day) return NaN;
  return stamp;
}

export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add whole months, clamping to the last valid day of the target month. */
export function addMonths(isoDate, months) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(months)) return "";
  const base = new Date(stamp);
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + Math.trunc(months);
  const day = base.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toIsoDate(Date.UTC(year, month, Math.min(day, lastDay)));
}

export function addDays(isoDate, days) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return "";
  return toIsoDate(stamp + Math.trunc(days) * MS_PER_DAY);
}

function bandFor(daysLeft) {
  for (const band of STATUS_BANDS) {
    if (daysLeft <= band.max) return band;
  }
  return STATUS_BANDS[STATUS_BANDS.length - 1];
}

/**
 * Plan the PUC cycle for one vehicle.
 *
 * @param {object} input
 * @param {string} input.issueDate       date printed on the current certificate
 * @param {boolean} input.isFirstCertificate  true only for the certificate issued with a new vehicle
 * @param {string} input.today           reference date, "YYYY-MM-DD"
 * @param {string} input.categoryId      key from VEHICLE_CATEGORIES
 * @param {number} [input.fee]           actual test fee; falls back to the category value
 * @param {number} [input.bufferDays]    how many days early you want to test
 * @param {number} [input.horizonYears]  planning horizon for the cost projection
 */
export function planPuc({
  issueDate,
  isFirstCertificate = false,
  today,
  categoryId = "car-petrol",
  fee,
  bufferDays = 10,
  horizonYears = 5,
} = {}) {
  const category = categoryById.get(categoryId);
  if (!category) return { error: "Choose a vehicle category from the list." };
  if (!Number.isFinite(parseDate(today))) {
    return { error: "Reference date must be a real calendar date." };
  }
  if (!Number.isFinite(parseDate(issueDate))) {
    return { error: "Enter the issue date printed on the certificate." };
  }
  if (daysBetween(today, issueDate) > 0) {
    return { error: "The certificate issue date cannot be in the future." };
  }
  const testFee = Number.isFinite(fee) ? fee : category.fee;
  if (!(testFee >= 0)) return { error: "Test fee cannot be negative." };
  if (!Number.isFinite(bufferDays) || bufferDays < 0 || bufferDays > 180) {
    return { error: "Book-ahead buffer should be between 0 and 180 days." };
  }
  if (!Number.isFinite(horizonYears) || horizonYears <= 0 || horizonYears > 20) {
    return { error: "Planning horizon should be between 1 and 20 years." };
  }

  const validityMonths = isFirstCertificate ? FIRST_CERTIFICATE_MONTHS : RENEWAL_MONTHS;
  const expiryDate = addMonths(issueDate, validityMonths);
  const daysLeft = daysBetween(today, expiryDate);
  const band = bandFor(daysLeft);
  const bookFrom = addDays(expiryDate, -Math.trunc(bufferDays));
  const daysUntilBooking = daysBetween(today, bookFrom);

  // Future cycle: every certificate after the current one lasts six months.
  const horizonEnd = addMonths(today, Math.round(horizonYears * 12));
  const schedule = [];
  let cursor = expiryDate;
  while (schedule.length < 40) {
    const nextExpiry = addMonths(cursor, RENEWAL_MONTHS);
    schedule.push({
      testOn: cursor,
      validUntil: nextExpiry,
      bookFrom: addDays(cursor, -Math.trunc(bufferDays)),
      fee: testFee,
    });
    if (daysBetween(cursor, horizonEnd) <= 0) break;
    cursor = nextExpiry;
  }
  const withinHorizon = schedule.filter((row) => daysBetween(row.testOn, horizonEnd) >= 0);

  const testsPerYear = 12 / RENEWAL_MONTHS;
  const annualCost = testFee * testsPerYear;
  const horizonCost = withinHorizon.length * testFee;

  return {
    categoryLabel: category.label,
    validityMonths,
    issueDate,
    expiryDate,
    daysLeft,
    status: band.id,
    statusLabel: band.label,
    bookFrom,
    daysUntilBooking,
    testFee,
    testsPerYear,
    annualCost,
    horizonYears,
    horizonTests: withinHorizon.length,
    horizonCost,
    schedule: withinHorizon.slice(0, 12),
    penaltyExposure: daysLeft < 0 ? NO_PUC_PENALTY_INR : 0,
  };
}

/** Cost of running several vehicles on the same six-month cycle. */
export function fleetAnnualCost(vehicleCount, feePerTest) {
  if (!Number.isFinite(vehicleCount) || vehicleCount < 0) {
    return { error: "Vehicle count must be zero or more." };
  }
  if (!Number.isFinite(feePerTest) || feePerTest < 0) {
    return { error: "Fee per test must be zero or more." };
  }
  return { annual: vehicleCount * feePerTest * (12 / RENEWAL_MONTHS) };
}
