/**
 * Creator business expense checklist for India — informational only.
 *
 * Everything below restates published provisions of the Income-tax Act, 1961,
 * the Income-tax Rules, 1962 and the CGST Act, 2017. It is NOT tax advice and
 * it does not account for your personal facts. Confirm with a chartered
 * accountant before filing.
 *
 * Two rules drive the arithmetic:
 *
 *  - Section 37(1): revenue expenditure laid out WHOLLY AND EXCLUSIVELY for the
 *    business or profession is allowable. Anything with private use has to be
 *    apportioned, so each line is multiplied by its business-use percentage.
 *
 *  - Section 32 read with Appendix I to the Income-tax Rules: capital assets are
 *    not deducted in full; they attract depreciation on the written-down value
 *    at the prescribed rate for their block of assets. Second proviso to
 *    s.32(1): an asset acquired AND put to use for less than 180 days in the
 *    year gets only half the normal rate in that first year.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Written-down-value depreciation rates, Income-tax Rules 1962, Appendix I. */
export const DEPRECIATION_RATES = {
  computers: 0.4, // Computers including computer software
  plantMachinery: 0.15, // General plant & machinery — cameras, lenses, lights, audio
  furniture: 0.1, // Furniture and fittings
  vehicles: 0.15, // Motor vehicles other than those used in a hiring business
};

/** Second proviso to s.32(1): under 180 days of use in year one halves the rate. */
export const HALF_YEAR_FACTOR = 0.5;

/** Published statutory thresholds, in rupees. */
export const THRESHOLDS = {
  /** s.40A(3): cash payment to one person in one day above this is disallowed. */
  cashPaymentPerDay: 10000,
  /** s.40A(3) proviso: higher ceiling for payments to transport operators. */
  cashPaymentTransport: 35000,
  /** s.44AB: tax audit for business turnover above this. */
  auditBusinessTurnover: 10000000,
  /** s.44AB proviso: raised ceiling when cash receipts AND payments are each <= 5%. */
  auditBusinessTurnoverDigital: 100000000,
  /** s.44AB(b): tax audit for a profession above this in gross receipts. */
  auditProfessionReceipts: 5000000,
  /** s.44ADA: presumptive scheme ceiling for specified professions. */
  presumptiveProfession: 5000000,
  /** s.44ADA proviso: raised ceiling when cash receipts are <= 5%. */
  presumptiveProfessionDigital: 7500000,
  /** s.44AD: presumptive scheme ceiling for eligible businesses. */
  presumptiveBusiness: 20000000,
  /** s.44AD proviso: raised ceiling when cash receipts are <= 5%. */
  presumptiveBusinessDigital: 30000000,
  /** s.44AA: books of account for an individual once turnover crosses this. */
  booksTurnover: 2500000,
  /** s.44AA: or once business income crosses this. */
  booksIncome: 250000,
  /** CGST s.22: registration threshold for a supplier of services. */
  gstServices: 2000000,
  /** CGST s.22: lower threshold for special category states. */
  gstServicesSpecialCategory: 1000000,
  /** s.194R: TDS on benefits or perquisites (free products, trips) above this a year. */
  benefitsInKind: 20000,
};

/** Deemed profit rates under s.44AD. */
export const PRESUMPTIVE_RATES = {
  /** s.44AD(1): 8% of turnover in the general case. */
  business: 0.08,
  /** s.44AD proviso: 6% on turnover received through banking channels. */
  businessDigital: 0.06,
  /** s.44ADA(1): 50% of gross receipts for a specified profession. */
  profession: 0.5,
};

/**
 * The checklist itself. `type: "capital"` lines are depreciated, not deducted.
 * `defaultBusinessUse` is a starting point only — use your own honest split.
 */
export const EXPENSE_CATEGORIES = [
  {
    key: "cameraGear",
    label: "Cameras, lenses, lighting, audio gear",
    type: "capital",
    block: "plantMachinery",
    section: "s.32 — plant & machinery block",
    defaultBusinessUse: 100,
    note: "Capitalised, not written off in one year. Keep the invoice in the business name.",
  },
  {
    key: "computers",
    label: "Laptop, desktop, phone, drives, editing hardware",
    type: "capital",
    block: "computers",
    section: "s.32 — computers block",
    defaultBusinessUse: 80,
    note: "Computers and computer software sit in the 40% block. Phones used personally must be apportioned.",
  },
  {
    key: "furniture",
    label: "Studio furniture, shelving, acoustic panels",
    type: "capital",
    block: "furniture",
    section: "s.32 — furniture & fittings",
    defaultBusinessUse: 100,
    note: "Fitted studio furniture is a capital asset in the 10% block.",
  },
  {
    key: "software",
    label: "Editing, stock, cloud and AI subscriptions",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Recurring subscriptions are revenue expenditure even though software bought outright is capital.",
  },
  {
    key: "internet",
    label: "Internet and mobile bills",
    type: "revenue",
    section: "s.37(1) — apportioned",
    defaultBusinessUse: 60,
    note: "A shared home connection is a classic mixed-use cost. Only the business share is allowable.",
  },
  {
    key: "workspace",
    label: "Studio rent, home-office share, electricity",
    type: "revenue",
    section: "s.37(1) — apportioned",
    defaultBusinessUse: 30,
    note: "Apportion by floor area or hours of use and keep the working you used.",
  },
  {
    key: "travel",
    label: "Travel, fuel and stay for shoots",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Only trips with a genuine business purpose. Log dates, place and what was shot.",
  },
  {
    key: "freelancers",
    label: "Editors, designers, assistants, VAs",
    type: "revenue",
    section: "s.37(1); TDS under s.194C / s.194J",
    defaultBusinessUse: 100,
    note: "Deduct TDS where the thresholds apply, or the expense can be disallowed under s.40(a)(ia).",
  },
  {
    key: "props",
    label: "Props, sets and on-camera consumables",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Items that survive the shoot and get used personally are not wholly and exclusively for business.",
  },
  {
    key: "marketing",
    label: "Ads, promotions and platform boosts",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Foreign platform invoices may attract equalisation levy or reverse-charge GST — check separately.",
  },
  {
    key: "professional",
    label: "CA, legal, trademark and consultant fees",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Fees for setting up a new capital structure can be capital rather than revenue.",
  },
  {
    key: "bankFees",
    label: "Bank, payment gateway and FX conversion charges",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Charges on receiving foreign ad revenue are a business cost.",
  },
  {
    key: "insurance",
    label: "Equipment and liability insurance",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Insurance on business assets only; personal life or health cover is dealt with elsewhere.",
  },
  {
    key: "training",
    label: "Courses and training tied to the work",
    type: "revenue",
    section: "s.37(1)",
    defaultBusinessUse: 100,
    note: "Must upgrade skills used in the existing business, not qualify you for a new one.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Year-one deduction for a single checklist line.
 * Revenue: amount x businessUse.
 * Capital: amount x businessUse x rate, halved if used under 180 days.
 */
export function computeLine({ categoryKey, amount, businessUsePercent, usedUnder180Days = false }) {
  const category = EXPENSE_CATEGORIES.find((item) => item.key === categoryKey);
  if (!category) return { error: "Unknown expense category." };
  if (!isNum(amount) || !isNum(businessUsePercent)) {
    return { error: "Enter a number for the amount and the business-use share." };
  }
  if (amount < 0) return { error: "Amounts cannot be negative." };
  if (businessUsePercent < 0 || businessUsePercent > 100) {
    return { error: "Business use must be between 0% and 100%." };
  }

  const businessAmount = amount * (businessUsePercent / 100);

  if (category.type === "revenue") {
    return {
      key: category.key,
      label: category.label,
      type: "revenue",
      amount,
      businessAmount,
      deductionYearOne: businessAmount,
      carriedForward: 0,
      rate: null,
    };
  }

  const rate = DEPRECIATION_RATES[category.block];
  const applied = rate * (usedUnder180Days ? HALF_YEAR_FACTOR : 1);
  const depreciation = businessAmount * applied;

  return {
    key: category.key,
    label: category.label,
    type: "capital",
    amount,
    businessAmount,
    deductionYearOne: depreciation,
    carriedForward: businessAmount - depreciation,
    rate: applied,
  };
}

/** Totals across every selected line. */
export function computeDeductions(lines) {
  if (!Array.isArray(lines)) return { error: "Provide a list of expense lines." };

  const rows = [];
  for (const line of lines) {
    const row = computeLine(line);
    if (row.error) return { error: row.error };
    rows.push(row);
  }

  const revenueTotal = rows
    .filter((row) => row.type === "revenue")
    .reduce((sum, row) => sum + row.deductionYearOne, 0);
  const capitalSpend = rows
    .filter((row) => row.type === "capital")
    .reduce((sum, row) => sum + row.businessAmount, 0);
  const depreciationTotal = rows
    .filter((row) => row.type === "capital")
    .reduce((sum, row) => sum + row.deductionYearOne, 0);
  const carriedForward = rows.reduce((sum, row) => sum + row.carriedForward, 0);

  return {
    rows,
    revenueTotal,
    capitalSpend,
    depreciationTotal,
    totalYearOne: revenueTotal + depreciationTotal,
    carriedForward,
  };
}

/**
 * Flags a creator's turnover raises. Returns statements of published thresholds,
 * never a filing recommendation.
 */
export function checkCompliance({
  grossReceipts,
  isSpecifiedProfession = false,
  cashReceiptsSharePercent = 0,
  cashPaymentsSharePercent = 0,
  specialCategoryState = false,
}) {
  if (!isNum(grossReceipts) || !isNum(cashReceiptsSharePercent) || !isNum(cashPaymentsSharePercent)) {
    return { error: "Enter numbers for gross receipts and the cash shares." };
  }
  if (grossReceipts < 0) return { error: "Gross receipts cannot be negative." };
  if (
    cashReceiptsSharePercent < 0 ||
    cashReceiptsSharePercent > 100 ||
    cashPaymentsSharePercent < 0 ||
    cashPaymentsSharePercent > 100
  ) {
    return { error: "Cash shares must be between 0% and 100%." };
  }

  const mostlyDigitalReceipts = cashReceiptsSharePercent <= 5;
  const mostlyDigitalPayments = cashPaymentsSharePercent <= 5;

  const auditLimit = isSpecifiedProfession
    ? THRESHOLDS.auditProfessionReceipts
    : mostlyDigitalReceipts && mostlyDigitalPayments
      ? THRESHOLDS.auditBusinessTurnoverDigital
      : THRESHOLDS.auditBusinessTurnover;

  const presumptiveLimit = isSpecifiedProfession
    ? mostlyDigitalReceipts
      ? THRESHOLDS.presumptiveProfessionDigital
      : THRESHOLDS.presumptiveProfession
    : mostlyDigitalReceipts
      ? THRESHOLDS.presumptiveBusinessDigital
      : THRESHOLDS.presumptiveBusiness;

  const gstLimit = specialCategoryState
    ? THRESHOLDS.gstServicesSpecialCategory
    : THRESHOLDS.gstServices;

  const presumptiveRate = isSpecifiedProfession
    ? PRESUMPTIVE_RATES.profession
    : mostlyDigitalReceipts
      ? PRESUMPTIVE_RATES.businessDigital
      : PRESUMPTIVE_RATES.business;

  return {
    grossReceipts,
    auditLimit,
    auditThresholdCrossed: grossReceipts > auditLimit,
    presumptiveLimit,
    presumptiveAvailable: grossReceipts <= presumptiveLimit,
    presumptiveRate,
    presumptiveDeemedProfit: grossReceipts <= presumptiveLimit ? grossReceipts * presumptiveRate : null,
    gstLimit,
    gstThresholdCrossed: grossReceipts > gstLimit,
    booksLimit: THRESHOLDS.booksTurnover,
    booksRequiredOnTurnover: grossReceipts > THRESHOLDS.booksTurnover,
    section: isSpecifiedProfession ? "44ADA" : "44AD",
    mostlyDigitalReceipts,
    mostlyDigitalPayments,
  };
}
