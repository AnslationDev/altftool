/**
 * Appliance Warranty Tracker — date maths and status rules.
 *
 * Two clocks run on every Indian appliance: a comprehensive warranty covering the
 * whole unit (usually one or two years), and a much longer warranty on one key part
 * — the compressor on a fridge or AC, the motor on a washing machine or mixer.
 * An extended warranty, where bought, adds to the comprehensive clock and normally
 * has to be purchased before the original comprehensive cover lapses.
 *
 * Statutory reference: under Section 69 of the Consumer Protection Act, 2019, a
 * consumer complaint must be filed within two years of the cause of action.
 *
 * Pure module: no React, no DOM, no clock reads. "Today" is always passed in.
 */

/**
 * Typical Indian warranty terms in months. Brands differ — the tool lets each entry
 * be overridden, and the warranty card always wins over these defaults.
 */
export const APPLIANCE_TYPES = [
  { id: "fridge", label: "Refrigerator", comprehensiveMonths: 12, partMonths: 120, partName: "Compressor" },
  { id: "washer", label: "Washing machine", comprehensiveMonths: 24, partMonths: 120, partName: "Motor" },
  { id: "ac", label: "Air conditioner", comprehensiveMonths: 12, partMonths: 120, partName: "Compressor" },
  { id: "tv", label: "Television", comprehensiveMonths: 12, partMonths: 12, partName: "Panel" },
  { id: "microwave", label: "Microwave oven", comprehensiveMonths: 12, partMonths: 36, partName: "Magnetron" },
  { id: "chimney", label: "Kitchen chimney", comprehensiveMonths: 12, partMonths: 60, partName: "Motor" },
  { id: "purifier", label: "Water purifier", comprehensiveMonths: 12, partMonths: 12, partName: "Unit" },
  { id: "geyser", label: "Water heater / geyser", comprehensiveMonths: 24, partMonths: 60, partName: "Inner tank" },
  { id: "mixer", label: "Mixer grinder", comprehensiveMonths: 24, partMonths: 60, partName: "Motor" },
  { id: "dishwasher", label: "Dishwasher", comprehensiveMonths: 24, partMonths: 120, partName: "Motor" },
  { id: "inverter", label: "Inverter / UPS", comprehensiveMonths: 24, partMonths: 36, partName: "Battery" },
  { id: "laptop", label: "Laptop / computer", comprehensiveMonths: 12, partMonths: 12, partName: "Unit" },
  { id: "other", label: "Other appliance", comprehensiveMonths: 12, partMonths: 12, partName: "Unit" },
];

/** Limitation period for filing a consumer complaint, Consumer Protection Act 2019 s.69. */
export const CONSUMER_CLAIM_WINDOW_MONTHS = 24;

/** A warranty inside this many days of lapsing is flagged as expiring soon. */
export const EXPIRING_SOON_DAYS = 60;

/** Default AMC term in months. */
export const AMC_TERM_MONTHS = 12;

export const MAX_WARRANTY_MONTHS = 240;
export const MAX_PRICE_INR = 10000000;

const MS_PER_DAY = 86400000;
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

export function toIsoDate(stamp) {
  if (!isFiniteNumber(stamp)) return null;
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Add whole months to a UTC timestamp, clamping the day when the target month is
 * shorter — 31 Jan + 1 month lands on 28 (or 29) Feb, the convention used for
 * warranty periods.
 */
export function addMonths(stamp, months) {
  if (!isFiniteNumber(stamp) || !Number.isInteger(months)) return null;
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthStart = Date.UTC(year, month + months, 1);
  const target = new Date(targetMonthStart);
  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, daysInTargetMonth));
}

/** Whole days from a to b (negative when b is in the past). */
export function daysBetween(a, b) {
  if (!isFiniteNumber(a) || !isFiniteNumber(b)) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Status of one appliance on a given day.
 *
 * @param {object} item
 * @param {string} item.name
 * @param {string} item.type            APPLIANCE_TYPES id
 * @param {string} item.purchaseIso     YYYY-MM-DD
 * @param {number} item.priceInr
 * @param {number} item.comprehensiveMonths  overrides the type default
 * @param {number} item.partMonths           overrides the type default
 * @param {number} item.extendedMonths       extra comprehensive cover bought
 * @param {number} item.amcAnnualInr         annual maintenance contract cost, 0 if none
 * @param {string} todayIso
 * @returns {object} status, or { error }
 */
export function computeApplianceStatus(item = {}, todayIso = "") {
  const today = parseIsoDate(todayIso);
  if (today === null) return { error: "Today's date must be a real date in YYYY-MM-DD form." };

  const type = APPLIANCE_TYPES.find((entry) => entry.id === item.type) ??
    APPLIANCE_TYPES[APPLIANCE_TYPES.length - 1];

  const purchase = parseIsoDate(item.purchaseIso);
  if (purchase === null) return { error: "Enter a purchase date in YYYY-MM-DD form." };
  if (purchase > today) return { error: "Purchase date cannot be in the future." };

  const pick = (value, fallback) =>
    isFiniteNumber(value) && value >= 0 && Number.isInteger(value) ? value : fallback;

  const comprehensiveMonths = pick(item.comprehensiveMonths, type.comprehensiveMonths);
  const partMonths = pick(item.partMonths, type.partMonths);
  const extendedMonths = pick(item.extendedMonths, 0);

  if (comprehensiveMonths > MAX_WARRANTY_MONTHS || partMonths > MAX_WARRANTY_MONTHS || extendedMonths > MAX_WARRANTY_MONTHS) {
    return { error: `Warranty terms longer than ${MAX_WARRANTY_MONTHS} months are not realistic.` };
  }

  const priceInr = isFiniteNumber(item.priceInr) && item.priceInr >= 0 ? item.priceInr : 0;
  if (priceInr > MAX_PRICE_INR) return { error: "Purchase price looks like a typo." };

  const amcAnnualInr = isFiniteNumber(item.amcAnnualInr) && item.amcAnnualInr >= 0 ? item.amcAnnualInr : 0;
  if (amcAnnualInr > MAX_PRICE_INR) return { error: "AMC cost looks like a typo." };

  const baseEnd = addMonths(purchase, comprehensiveMonths);
  const comprehensiveEnd = addMonths(purchase, comprehensiveMonths + extendedMonths);
  const partEnd = addMonths(purchase, partMonths);

  const daysToComprehensive = daysBetween(today, comprehensiveEnd);
  const daysToPart = daysBetween(today, partEnd);
  const ageDays = daysBetween(purchase, today);

  const statusOf = (days) => {
    if (days < 0) return "expired";
    if (days <= EXPIRING_SOON_DAYS) return "expiring";
    return "active";
  };

  const comprehensiveStatus = statusOf(daysToComprehensive);
  const partStatus = partMonths > 0 ? statusOf(daysToPart) : "expired";

  // An extended warranty normally has to be bought before the original cover lapses.
  const extendedWindowOpen = extendedMonths === 0 && daysBetween(today, baseEnd) >= 0;

  const amcStart = comprehensiveEnd;
  const amcRenewalDates = [];
  if (amcAnnualInr > 0) {
    let cursor = amcStart;
    for (let n = 0; n < 3; n += 1) {
      cursor = addMonths(cursor, n === 0 ? 0 : AMC_TERM_MONTHS);
      amcRenewalDates.push(toIsoDate(cursor));
    }
  }

  return {
    name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : type.label,
    typeLabel: type.label,
    partName: type.partName,
    purchaseIso: toIsoDate(purchase),
    priceInr,
    ageDays,
    ageYears: Math.round((ageDays / 365.25) * 10) / 10,
    comprehensiveMonths,
    extendedMonths,
    partMonths,
    baseWarrantyEndIso: toIsoDate(baseEnd),
    comprehensiveEndIso: toIsoDate(comprehensiveEnd),
    partEndIso: partMonths > 0 ? toIsoDate(partEnd) : null,
    daysToComprehensive,
    daysToPart,
    comprehensiveStatus,
    partStatus,
    extendedWindowOpen,
    amcAnnualInr,
    amcStartIso: amcAnnualInr > 0 ? toIsoDate(amcStart) : null,
    amcRenewalDates,
    claimDeadlineIso: toIsoDate(addMonths(today, CONSUMER_CLAIM_WINDOW_MONTHS)),
  };
}

/**
 * Roll a list of appliances into a portfolio view.
 * Invalid entries are returned in `invalid` rather than throwing.
 */
export function summariseAppliances(items = [], todayIso = "") {
  if (!Array.isArray(items)) return { error: "Appliance list must be an array." };
  if (parseIsoDate(todayIso) === null) {
    return { error: "Today's date must be a real date in YYYY-MM-DD form." };
  }

  const rows = [];
  const invalid = [];

  for (const item of items) {
    const status = computeApplianceStatus(item, todayIso);
    if (status.error) invalid.push({ id: item?.id ?? null, error: status.error });
    else rows.push({ ...status, id: item.id });
  }

  rows.sort((a, b) => a.daysToComprehensive - b.daysToComprehensive);

  const counts = { active: 0, expiring: 0, expired: 0 };
  for (const row of rows) counts[row.comprehensiveStatus] += 1;

  const totalValue = rows.reduce((sum, row) => sum + row.priceInr, 0);
  const annualAmc = rows.reduce((sum, row) => sum + row.amcAnnualInr, 0);

  const upcoming = rows.filter((row) => row.daysToComprehensive >= 0);

  return {
    rows,
    invalid,
    counts,
    total: rows.length,
    totalValue,
    annualAmc,
    amcAsShareOfValue: totalValue > 0 ? Math.round((annualAmc / totalValue) * 1000) / 10 : 0,
    nextExpiry: upcoming.length > 0 ? upcoming[0] : null,
    outOfWarrantyValue: rows
      .filter((row) => row.comprehensiveStatus === "expired")
      .reduce((sum, row) => sum + row.priceInr, 0),
  };
}
