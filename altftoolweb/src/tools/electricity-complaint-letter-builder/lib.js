/**
 * Electricity complaint letter builder (India).
 *
 * Statutory rules referenced:
 *  - Electricity Act, 2003, s.42(5): every distribution licensee must establish
 *    a forum for the redressal of consumer grievances, in accordance with the
 *    guidelines specified by the State Electricity Regulatory Commission.
 *  - Electricity Act, 2003, s.42(6): a consumer aggrieved by non-redressal of a
 *    grievance may make a representation to the Ombudsman appointed or
 *    designated by the State Commission.
 *  - Electricity Act, 2003, s.43(1): a distribution licensee must, on
 *    application by an owner or occupier of any premises, give supply within
 *    one month after receipt of the application.
 *  - Electricity Act, 2003, s.56(1): where a person neglects to pay a charge
 *    for electricity, the licensee may cut off supply after giving not less
 *    than fifteen clear days' notice in writing.
 *  - Electricity Act, 2003, s.56(2): no sum due from a consumer is recoverable
 *    after the period of two years from the date when it first became due,
 *    unless it has been shown continuously as recoverable as arrear of charges
 *    for electricity supplied, and the licensee shall not cut off supply on
 *    that ground.
 *  - Electricity Act, 2003, s.57: the State Commission specifies standards of
 *    performance for a licensee, and a licensee that fails to meet them is
 *    liable to pay compensation to the affected person as determined by the
 *    Commission.
 *  - Electricity (Rights of Consumers) Rules, 2020: these prescribe maximum
 *    timelines for a new connection and for grievance redressal. The day
 *    counts differ by state notification and have been amended, so confirm the
 *    figure applicable to you with your State Commission before quoting it.
 *
 * Informational only, not legal advice.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

export function addYearsISO(isoDate, years) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(years)) return null;
  const y = date.getUTCFullYear() + Math.round(years);
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/* --------------------------------------------------------------- constants */

/** Electricity Act, 2003, s.56(1) — clear days of written notice before cut-off. */
export const SEC_56_NOTICE_CLEAR_DAYS = 15;
/** Electricity Act, 2003, s.56(2) — bar on recovering a sum after two years. */
export const SEC_56_LIMITATION_YEARS = 2;
/** Electricity Act, 2003, s.43(1) — supply within one month of application. */
export const SEC_43_SUPPLY_MONTHS = 1;
/** Sanity bounds so a typo cannot produce an absurd bill. */
export const MAX_METER_READING = 100_000_000;
export const MAX_TARIFF_PER_UNIT = 100;
export const MAX_MULTIPLYING_FACTOR = 1000;

export const COMPLAINT_TYPES = [
  {
    id: "inflated-bill",
    label: "Bill is far higher than usual",
    addressee: "The Assistant Engineer (Billing)",
    ask: "revise the bill after verifying the meter reading, and issue a corrected bill",
    needsReadings: true,
    statutes: ["s.42(5)"],
  },
  {
    id: "faulty-meter",
    label: "Meter is faulty, stuck or running fast",
    addressee: "The Assistant Engineer (Metering)",
    ask: "test the meter in my presence, replace it if it is found defective, and revise the bills raised on its readings",
    needsReadings: true,
    statutes: ["s.42(5)", "s.57"],
  },
  {
    id: "no-bill",
    label: "Bill not received / provisional bills",
    addressee: "The Assistant Engineer (Billing)",
    ask: "take an actual meter reading and issue a proper bill in place of the provisional one",
    needsReadings: true,
    statutes: ["s.42(5)"],
  },
  {
    id: "wrong-tariff",
    label: "Wrong tariff category applied",
    addressee: "The Executive Engineer",
    ask: "correct the tariff category recorded against my connection and refund the excess recovered",
    needsReadings: false,
    statutes: ["s.42(5)"],
  },
  {
    id: "old-arrears",
    label: "Old arrears from an earlier period",
    addressee: "The Executive Engineer",
    ask: "withdraw the arrear demand, which is barred by limitation, and issue a fresh bill for the current period alone",
    needsReadings: false,
    statutes: ["s.56(2)"],
  },
  {
    id: "disconnection-threat",
    label: "Disconnection notice despite payment or a pending dispute",
    addressee: "The Executive Engineer",
    ask: "withdraw the disconnection notice until the dispute is decided, and record my payment against the connection",
    needsReadings: false,
    statutes: ["s.56(1)", "s.42(5)"],
  },
  {
    id: "outages",
    label: "Frequent power cuts or low voltage",
    addressee: "The Executive Engineer (Operation and Maintenance)",
    ask: "restore a stable supply at the declared voltage and pay the compensation payable under the standards of performance",
    needsReadings: false,
    statutes: ["s.57"],
  },
  {
    id: "infrastructure",
    label: "Damaged pole, sagging wire or transformer fault",
    addressee: "The Executive Engineer (Operation and Maintenance)",
    ask: "attend to the unsafe installation immediately, as it is a danger to life and property",
    needsReadings: false,
    statutes: ["s.57"],
  },
  {
    id: "new-connection-delay",
    label: "Delay in a new connection",
    addressee: "The Executive Engineer",
    ask: "release the connection applied for and confirm the date of energisation",
    needsReadings: false,
    statutes: ["s.43(1)", "s.57"],
  },
  {
    id: "name-change-delay",
    label: "Delay in name or address change",
    addressee: "The Assistant Engineer (Commercial)",
    ask: "complete the change of name and address in the consumer record and issue the next bill correctly",
    needsReadings: false,
    statutes: ["s.42(5)"],
  },
];

export function complaintTypeById(id) {
  return COMPLAINT_TYPES.find((item) => item.id === id) || COMPLAINT_TYPES[0];
}

export const STATUTE_TEXT = {
  "s.42(5)":
    "Section 42(5) of the Electricity Act, 2003 requires every distribution licensee to establish a forum for the redressal of consumer grievances, and I am placing this complaint before that forum.",
  "s.42(6)":
    "If the grievance is not redressed, section 42(6) of the Electricity Act, 2003 entitles me to make a representation to the Ombudsman appointed by the State Electricity Regulatory Commission.",
  "s.43(1)":
    "Section 43(1) of the Electricity Act, 2003 requires a distribution licensee to give supply within one month after receipt of an application from the owner or occupier of the premises.",
  "s.56(1)":
    "Section 56(1) of the Electricity Act, 2003 permits supply to be cut off only after not less than fifteen clear days' notice in writing.",
  "s.56(2)":
    "Section 56(2) of the Electricity Act, 2003 bars recovery of any sum due from a consumer after two years from the date it first became due, unless it has been shown continuously as recoverable as an arrear of charges for electricity supplied, and forbids cutting off supply on that ground.",
  "s.57":
    "Section 57 of the Electricity Act, 2003 makes a licensee that fails to meet the standards of performance specified by the State Commission liable to pay compensation to the affected person, as determined by the Commission.",
};

/* ------------------------------------------------------------- formatting */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatINR(value) {
  return INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function formatNumber(value) {
  return NUM.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* -------------------------------------------------------------- bill maths */

/**
 * Recompute the bill from the meter readings you can see on the meter and on
 * the bill: units = (current - previous) x multiplying factor, energy charge =
 * units x tariff, total = energy charge + fixed charge + other charges.
 * Slab tariffs and duties differ by state, so the tariff is taken as a single
 * average rate supplied by the caller.
 */
export function computeExpectedBill({
  previousReading,
  currentReading,
  multiplyingFactor,
  tariffPerUnit,
  fixedCharge,
  otherCharges,
}) {
  const prev = Number(previousReading);
  const curr = Number(currentReading);
  if (!Number.isFinite(prev) || prev < 0 || prev > MAX_METER_READING) {
    return { error: "Enter a valid previous meter reading." };
  }
  if (!Number.isFinite(curr) || curr < 0 || curr > MAX_METER_READING) {
    return { error: "Enter a valid current meter reading." };
  }
  if (curr < prev) {
    return { error: "The current reading is lower than the previous reading — check the figures, or say the meter was replaced or reset." };
  }

  const mf = Number(multiplyingFactor);
  if (!Number.isFinite(mf) || mf <= 0 || mf > MAX_MULTIPLYING_FACTOR) {
    return { error: `The multiplying factor must be greater than 0 and at most ${MAX_MULTIPLYING_FACTOR}. It is 1 on an ordinary domestic meter.` };
  }

  const tariff = Number(tariffPerUnit);
  if (!Number.isFinite(tariff) || tariff <= 0 || tariff > MAX_TARIFF_PER_UNIT) {
    return { error: `The average tariff must be greater than 0 and at most ${MAX_TARIFF_PER_UNIT} per unit.` };
  }

  const fixed = Number(fixedCharge);
  if (!Number.isFinite(fixed) || fixed < 0) return { error: "Fixed charges cannot be negative." };

  const other = Number(otherCharges);
  if (!Number.isFinite(other) || other < 0) return { error: "Other charges and duties cannot be negative." };

  const units = (curr - prev) * mf;
  const energyCharge = units * tariff;
  const total = energyCharge + fixed + other;

  return { units, energyCharge, fixedCharge: fixed, otherCharges: other, total, tariffPerUnit: tariff, multiplyingFactor: mf };
}

/* --------------------------------------------------------------- assessment */

/**
 * Put the complaint in its statutory context: how far the bill is off, whether
 * an arrear is beyond the two-year bar in section 56(2), and the earliest date
 * a disconnection notice under section 56(1) could take effect.
 */
export function assessComplaint({
  billedAmount,
  expectedBill,
  averageMonthlyUnits,
  letterDateISO,
  billDateISO,
  arrearFirstDueISO,
  disconnectionNoticeDateISO,
  complaintTypeId,
}) {
  if (!parseISODate(letterDateISO)) return { error: "Enter a valid date for the letter." };

  const type = complaintTypeById(complaintTypeId);

  let excessBilled = null;
  let excessPercent = null;
  let unitsVsAverage = null;
  if (expectedBill && !expectedBill.error) {
    const billed = Number(billedAmount);
    if (!Number.isFinite(billed) || billed < 0) {
      return { error: "Enter the amount the bill actually demands, as a number of zero or more." };
    }
    excessBilled = billed - expectedBill.total;
    excessPercent = expectedBill.total > 0 ? (excessBilled / expectedBill.total) * 100 : null;

    const avg = Number(averageMonthlyUnits);
    if (Number.isFinite(avg) && avg > 0) {
      unitsVsAverage = (expectedBill.units / avg) * 100;
    }
  }

  let arrear = null;
  if (parseISODate(arrearFirstDueISO)) {
    const barDateISO = addYearsISO(arrearFirstDueISO, SEC_56_LIMITATION_YEARS);
    const daysPastBar = daysBetweenISO(barDateISO, letterDateISO);
    if (daysBetweenISO(arrearFirstDueISO, letterDateISO) < 0) {
      return { error: "The arrear cannot have first become due after the date of this letter." };
    }
    arrear = {
      barDateISO,
      beyondTwoYears: daysPastBar > 0,
      daysPastBar: Math.max(0, daysPastBar),
      ageDays: daysBetweenISO(arrearFirstDueISO, letterDateISO),
    };
  }

  let disconnection = null;
  if (parseISODate(disconnectionNoticeDateISO)) {
    // "Fifteen clear days" excludes both the day the notice is given and the
    // day supply is cut off, so the earliest lawful date is notice + 16 days.
    const earliestISO = addDaysISO(disconnectionNoticeDateISO, SEC_56_NOTICE_CLEAR_DAYS + 1);
    disconnection = {
      earliestISO,
      daysLeft: Math.max(0, daysBetweenISO(letterDateISO, earliestISO)),
      alreadyPast: daysBetweenISO(earliestISO, letterDateISO) > 0,
    };
  }

  let billAgeDays = null;
  if (parseISODate(billDateISO)) {
    billAgeDays = daysBetweenISO(billDateISO, letterDateISO);
    if (billAgeDays < 0) return { error: "The bill is dated after the date of this letter." };
  }

  return {
    type,
    excessBilled,
    excessPercent,
    unitsVsAverage,
    arrear,
    disconnection,
    billAgeDays,
    statutes: type.statutes,
  };
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function buildElectricityComplaint({
  consumerName,
  consumerNumber,
  meterNumber,
  connectionAddress,
  discomName,
  subDivision,
  officeAddress,
  addressee,
  letterDateISO,
  billDateISO,
  billMonth,
  billedAmount,
  complaintTypeId,
  complaintDetail,
  earlierComplaintRef,
  earlierComplaintDateISO,
  arrearAmount,
  arrearFirstDueISO,
  disconnectionNoticeDateISO,
  phone,
  email,
  expectedBill,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the details before drafting the complaint." };
  }

  const type = complaintTypeById(complaintTypeId);
  const name = or(consumerName, "[Your name]");
  const consumer = or(consumerNumber, "[Consumer number]");
  const discom = or(discomName, "[Name of the distribution company]");
  const to = or(addressee, type.addressee);
  const premises = or(connectionAddress, "[Address of the connection]");

  const computedBlock =
    expectedBill && !expectedBill.error
      ? [
          "My own working from the meter readings:",
          `  Units consumed: ${formatNumber(expectedBill.units)} kWh`,
          `  Energy charge at ${formatINR(expectedBill.tariffPerUnit)} per unit: ${formatINR(expectedBill.energyCharge)}`,
          `  Fixed charges: ${formatINR(expectedBill.fixedCharge)}`,
          `  Other charges and duties: ${formatINR(expectedBill.otherCharges)}`,
          `  Total on my working: ${formatINR(expectedBill.total)}`,
          `  Amount actually demanded: ${formatINR(Number(billedAmount))}`,
          assessment.excessBilled !== null && assessment.excessBilled > 0
            ? `  Excess demanded: ${formatINR(assessment.excessBilled)}`
            : assessment.excessBilled !== null && assessment.excessBilled < 0
              ? `  Short-billed by: ${formatINR(Math.abs(assessment.excessBilled))}`
              : "  The demand matches my working.",
        ]
      : [];

  const averageLine =
    assessment.unitsVsAverage !== null
      ? `The consumption billed is ${formatNumber(assessment.unitsVsAverage)}% of my usual monthly consumption, and nothing at the premises has changed to explain that.`
      : "";

  const arrearLines = assessment.arrear
    ? [
        `The bill carries an arrear of ${formatINR(Number(arrearAmount) || 0)} stated to have first become due on ${formatLongDate(arrearFirstDueISO)}.`,
        assessment.arrear.beyondTwoYears
          ? `That is ${plural(assessment.arrear.ageDays, "day")} ago, and more than two years, so recovery of it is barred by section 56(2) of the Electricity Act, 2003 unless the sum has been shown continuously as recoverable as an arrear of charges for electricity supplied. Please produce the bills in which it was so shown, or withdraw the demand.`
          : `That is ${plural(assessment.arrear.ageDays, "day")} ago; the two-year period in section 56(2) of the Electricity Act, 2003 would run out on ${formatLongDate(assessment.arrear.barDateISO)}. I dispute the arrear and ask for the working behind it.`,
      ]
    : [];

  const disconnectionLines = assessment.disconnection
    ? [
        assessment.disconnection.alreadyPast
          ? `A disconnection notice dated ${formatLongDate(disconnectionNoticeDateISO)} has been served. The fifteen clear days required by section 56(1) of the Electricity Act, 2003 expired on ${formatLongDate(assessment.disconnection.earliestISO)}, but the underlying demand is disputed and I request that supply not be cut off while this complaint is pending.`
          : `A disconnection notice dated ${formatLongDate(disconnectionNoticeDateISO)} has been served. Counting the fifteen clear days required by section 56(1) of the Electricity Act, 2003, supply cannot be cut off before ${formatLongDate(assessment.disconnection.earliestISO)}, which is ${plural(assessment.disconnection.daysLeft, "day")} away. I request that no action be taken while this complaint is pending.`,
      ]
    : [];

  const earlierLine =
    clean(earlierComplaintRef) || parseISODate(earlierComplaintDateISO)
      ? `I had raised this earlier${clean(earlierComplaintRef) ? ` under complaint reference ${clean(earlierComplaintRef)}` : ""}${parseISODate(earlierComplaintDateISO) ? ` on ${formatLongDate(earlierComplaintDateISO)}` : ""}, and it has not been resolved.`
      : "";

  const statutoryLines = (assessment.statutes || []).map((key) => STATUTE_TEXT[key]).filter(Boolean);
  statutoryLines.push(STATUTE_TEXT["s.42(6)"]);

  const subject = `Complaint — ${type.label.toLowerCase()} — consumer no. ${consumer}${clean(billMonth) ? ` — bill for ${clean(billMonth)}` : ""}`;

  const body = [
    formatLongDate(letterDateISO),
    "",
    "To,",
    `${to},`,
    `${discom}${clean(subDivision) ? `, ${clean(subDivision)} Sub-Division` : ""}`,
    clean(officeAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${name}, the consumer of the electricity connection bearing consumer number ${consumer}${clean(meterNumber) ? ` and meter number ${clean(meterNumber)}` : ""} at ${premises}.`,
    "",
    clean(complaintDetail) || `I am writing to complain about the following: ${type.label.toLowerCase()}.`,
    earlierLine,
    "",
    ...(parseISODate(billDateISO)
      ? [`The bill in question is dated ${formatLongDate(billDateISO)}${clean(billMonth) ? ` for ${clean(billMonth)}` : ""}${assessment.billAgeDays !== null ? `, which is ${plural(assessment.billAgeDays, "day")} old` : ""}.`]
      : []),
    "",
    ...computedBlock,
    averageLine,
    "",
    ...arrearLines,
    "",
    ...disconnectionLines,
    "",
    `I therefore request you to ${type.ask}.`,
    "",
    ...statutoryLines,
    "",
    "Please register this complaint, give me the complaint number, and let me know the officer dealing with it. I am available for a joint meter reading or a site inspection at any time, and can produce the paid receipts for every earlier bill.",
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    name,
    `Consumer number: ${consumer}`,
    `Premises: ${premises}`,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length, type };
}
