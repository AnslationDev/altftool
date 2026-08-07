/**
 * Notice to vacate — date arithmetic.
 *
 * Statutory backbone (India):
 *  - Transfer of Property Act, 1882, s.106(1): absent a contract to the
 *    contrary, a lease for agricultural or manufacturing purposes is deemed
 *    year to year and terminable by SIX MONTHS' notice; a lease for any other
 *    purpose is deemed month to month and terminable by FIFTEEN DAYS' notice.
 *  - TPA s.106(2) (inserted by Act 3 of 2003): the notice period "shall
 *    commence from the date of receipt of notice" — not the date it was posted.
 *  - TPA s.106(4): the notice must be in writing, signed, and either sent by
 *    post to the party, tendered or delivered personally, or affixed to a
 *    conspicuous part of the property.
 *  - General Clauses Act, 1897, s.9: where a period is reckoned "from" a day,
 *    that first day is excluded. So day 1 of the notice is the day after
 *    receipt, and the period ends on receipt-date + period.
 *  - General Clauses Act, 1897, s.3(35): "month" means a month reckoned
 *    according to the British calendar, so months are added calendar-wise and
 *    clamped to the last day of a short month.
 *  - Model Tenancy Act, 2021, s.22(2): a tenant who does not hand over on the
 *    due date owes compensation of twice the monthly rent for two months and
 *    four times the monthly rent thereafter (in states that have adopted it).
 *
 * Every function here is pure: today's date is always passed in.
 */

/** TPA s.106(1) minimum for a month-to-month lease (any non-agricultural, non-manufacturing purpose). */
export const STATUTORY_NOTICE_OTHER_DAYS = 15;

/** TPA s.106(1) minimum for a year-to-year agricultural or manufacturing lease. */
export const STATUTORY_NOTICE_AGRI_MONTHS = 6;

/** Model Tenancy Act, 2021 s.22(2) — first two months of overstay. */
export const OVERSTAY_MULTIPLIER_FIRST = 2;

/** Model Tenancy Act, 2021 s.22(2) — every month of overstay after the first two. */
export const OVERSTAY_MULTIPLIER_LATER = 4;

/** Model Tenancy Act, 2021 s.22(2) — the multiplier steps up after this many months. */
export const OVERSTAY_STEP_MONTHS = 2;

export const LEASE_PURPOSES = [
  {
    key: "other",
    label: "Residential, shop or office (any purpose except farming or manufacturing)",
    statutory: { value: STATUTORY_NOTICE_OTHER_DAYS, unit: "days" },
    note: "Deemed month-to-month under TPA s.106(1); 15 days' notice is the statutory floor.",
  },
  {
    key: "agriManufacturing",
    label: "Agricultural or manufacturing use",
    statutory: { value: STATUTORY_NOTICE_AGRI_MONTHS, unit: "months" },
    note: "Deemed year-to-year under TPA s.106(1); six months' notice is the statutory floor.",
  },
];

/**
 * Days added to the dispatch date to reach the presumed date of receipt.
 * Zero where receipt is contemporaneous with service. Postal figures reflect
 * the ordinary-course-of-post presumption under s.27 of the General Clauses
 * Act, 1897 — if you hold the actual acknowledgement, use "Known receipt date".
 */
export const SERVICE_MODES = [
  { key: "hand", label: "Delivered by hand against acknowledgement", days: 0 },
  { key: "knownReceipt", label: "Known receipt date (enter it below)", days: 0 },
  { key: "registeredAd", label: "Registered post with acknowledgement due", days: 3 },
  { key: "speedPost", label: "Speed post", days: 3 },
  { key: "courier", label: "Private courier", days: 2 },
  { key: "email", label: "Email with a delivery receipt", days: 0 },
  { key: "affixation", label: "Affixed on a conspicuous part of the property", days: 0 },
];

export const NOTICE_PRESETS = [
  { key: "tpa15", label: "15 days (TPA s.106 default)", value: 15, unit: "days" },
  { key: "m1", label: "1 month", value: 1, unit: "months" },
  { key: "m2", label: "2 months", value: 2, unit: "months" },
  { key: "m3", label: "3 months", value: 3, unit: "months" },
  { key: "m6", label: "6 months (TPA s.106 farming/manufacturing)", value: 6, unit: "months" },
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAY_MS = 86400000;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) => {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
};

/** Parse a "YYYY-MM-DD" string into {year, month, day}, or null if it is not a real date. */
export function parseISODate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const toISO = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const toUTC = ({ year, month, day }) => Date.UTC(year, month - 1, day);

const fromUTC = (ms) => {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

/** Add whole days to an ISO date string. */
export function addDays(iso, count) {
  const parts = parseISODate(iso);
  if (!parts || !Number.isFinite(count)) return null;
  return toISO(fromUTC(toUTC(parts) + Math.trunc(count) * DAY_MS));
}

/** Add calendar months (General Clauses Act s.3(35)), clamping to the last day of a short month. */
export function addMonths(iso, count) {
  const parts = parseISODate(iso);
  if (!parts || !Number.isFinite(count)) return null;
  const total = (parts.year * 12 + (parts.month - 1)) + Math.trunc(count);
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(parts.day, daysInMonth(year, month));
  return toISO({ year, month, day });
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((toUTC(second) - toUTC(first)) / DAY_MS);
}

/**
 * The last day of the tenancy month that ends on or after `iso`.
 * A tenancy month that begins on `rentDay` ends the day before `rentDay`;
 * when rent falls due on the 1st, it ends on the last day of the month.
 */
export function endOfTenancyMonthOnOrAfter(iso, rentDay) {
  const start = parseISODate(iso);
  if (!start) return null;
  if (!Number.isInteger(rentDay) || rentDay < 1 || rentDay > 31) return null;

  let year = start.year;
  let month = start.month;
  for (let step = 0; step < 24; step += 1) {
    const last = daysInMonth(year, month);
    const day = rentDay === 1 ? last : Math.min(rentDay - 1, last);
    const candidate = toISO({ year, month, day });
    if (toUTC({ year, month, day }) >= toUTC(start)) return candidate;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return null;
}

const addPeriod = (iso, value, unit) =>
  unit === "months" ? addMonths(iso, value) : addDays(iso, value);

/**
 * Compute the vacate and possession dates for a notice to quit.
 *
 * @param {object} input
 * @param {string} input.dispatchDate      ISO date the notice was sent/handed over.
 * @param {string} [input.receiptDate]     ISO date of actual receipt (used when serviceMode is "knownReceipt").
 * @param {string} input.serviceMode       Key from SERVICE_MODES.
 * @param {number} input.noticeValue       Length of the notice period.
 * @param {"days"|"months"} input.noticeUnit
 * @param {string} input.leasePurpose      Key from LEASE_PURPOSES.
 * @param {boolean} [input.alignToRentMonth] Push expiry to the end of a rent month.
 * @param {number} [input.rentDay]         Day of the month rent falls due (1-31).
 * @param {string} [input.todayDate]       ISO "today", supplied by the caller so the maths stays pure.
 */
export function computeVacateDate({
  dispatchDate,
  receiptDate,
  serviceMode = "hand",
  noticeValue,
  noticeUnit = "days",
  leasePurpose = "other",
  alignToRentMonth = false,
  rentDay = 1,
  todayDate = null,
} = {}) {
  const dispatch = parseISODate(dispatchDate);
  if (!dispatch) return { error: "Enter a valid notice dispatch date in the calendar." };

  const mode = SERVICE_MODES.find((item) => item.key === serviceMode);
  if (!mode) return { error: "Choose how the notice was served." };

  const purpose = LEASE_PURPOSES.find((item) => item.key === leasePurpose);
  if (!purpose) return { error: "Choose what the premises are used for." };

  const value = Number(noticeValue);
  if (!Number.isFinite(value)) return { error: "Enter the notice length as a number." };
  if (value <= 0) return { error: "The notice length must be greater than zero." };
  if (!Number.isInteger(value)) return { error: "The notice length must be a whole number." };
  if (noticeUnit !== "days" && noticeUnit !== "months") {
    return { error: "The notice length must be in days or months." };
  }
  if (noticeUnit === "days" && value > 3650) {
    return { error: "A notice period longer than 3650 days is not realistic." };
  }
  if (noticeUnit === "months" && value > 120) {
    return { error: "A notice period longer than 120 months is not realistic." };
  }

  let received;
  if (serviceMode === "knownReceipt") {
    const parsed = parseISODate(receiptDate);
    if (!parsed) return { error: "Enter the actual date the notice was received." };
    if (toUTC(parsed) < toUTC(dispatch)) {
      return { error: "The notice cannot be received before it was sent." };
    }
    received = toISO(parsed);
  } else {
    received = addDays(dispatchDate, mode.days);
  }

  // GCA s.9 — the day of receipt is excluded, so day 1 is the day after receipt.
  const noticeStart = addDays(received, 1);
  const plainExpiry = addPeriod(received, Math.trunc(value), noticeUnit);
  if (!plainExpiry) return { error: "The notice length produced an impossible date." };

  let expiry = plainExpiry;
  let alignedFrom = null;
  if (alignToRentMonth) {
    const day = Number(rentDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return { error: "Rent due day must be a whole number between 1 and 31." };
    }
    const aligned = endOfTenancyMonthOnOrAfter(plainExpiry, day);
    if (!aligned) return { error: "Could not align the notice to the end of a rent month." };
    if (aligned !== plainExpiry) alignedFrom = plainExpiry;
    expiry = aligned;
  }

  const possession = addDays(expiry, 1);
  const totalNoticeDays = diffDays(received, expiry);

  const statutoryExpiry = addPeriod(received, purpose.statutory.value, purpose.statutory.unit);
  const statutoryShortfallDays = diffDays(expiry, statutoryExpiry);
  const meetsStatutoryMinimum = statutoryShortfallDays <= 0;

  let daysRemaining = null;
  let status = null;
  if (todayDate) {
    const today = parseISODate(todayDate);
    if (today) {
      daysRemaining = diffDays(toISO(today), expiry);
      if (daysRemaining > 0) status = "running";
      else if (daysRemaining === 0) status = "expiresToday";
      else status = "expired";
    }
  }

  return {
    dispatchDate: toISO(dispatch),
    receiptDate: received,
    deemedServiceDays: serviceMode === "knownReceipt" ? diffDays(toISO(dispatch), received) : mode.days,
    serviceLabel: mode.label,
    noticeStartDate: noticeStart,
    vacateDate: expiry,
    possessionDate: possession,
    totalNoticeDays,
    alignedFrom,
    statutoryExpiry,
    statutoryLabel: `${purpose.statutory.value} ${purpose.statutory.unit}`,
    statutoryShortfallDays: Math.max(0, statutoryShortfallDays),
    meetsStatutoryMinimum,
    purposeNote: purpose.note,
    daysRemaining,
    status,
  };
}

/**
 * Compensation for staying on past the vacate date — Model Tenancy Act, 2021, s.22(2):
 * twice the monthly rent for the first two months, four times the monthly rent thereafter.
 * Applies only in states that have enacted the Model Tenancy Act.
 */
export function computeOverstayCompensation({ monthlyRent, monthsOverstayed } = {}) {
  const rent = Number(monthlyRent);
  const months = Number(monthsOverstayed);

  if (!Number.isFinite(rent)) return { error: "Enter the monthly rent as a number." };
  if (rent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (!Number.isFinite(months)) return { error: "Enter the overstay in months as a number." };
  if (months < 0) return { error: "Overstay months cannot be negative." };
  if (months > 120) return { error: "Cap the overstay at 120 months for this estimate." };

  const firstMonths = Math.min(months, OVERSTAY_STEP_MONTHS);
  const laterMonths = Math.max(0, months - OVERSTAY_STEP_MONTHS);
  const firstAmount = firstMonths * rent * OVERSTAY_MULTIPLIER_FIRST;
  const laterAmount = laterMonths * rent * OVERSTAY_MULTIPLIER_LATER;

  return {
    firstMonths,
    laterMonths,
    firstAmount: Math.round(firstAmount),
    laterAmount: Math.round(laterAmount),
    total: Math.round(firstAmount) + Math.round(laterAmount),
    normalRent: Math.round(months * rent),
  };
}
