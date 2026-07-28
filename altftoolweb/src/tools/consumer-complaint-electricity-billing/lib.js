/**
 * Electricity billing complaint helper.
 *
 * Statutory references used below (India):
 *  - Electricity Act, 2003 s.42(5): every distribution licensee must set up a
 *    Consumer Grievance Redressal Forum (CGRF) for consumer complaints.
 *  - Electricity Act, 2003 s.42(6): a consumer not satisfied by the CGRF may
 *    represent the grievance to the Electricity Ombudsman appointed by the
 *    State Electricity Regulatory Commission.
 *  - Electricity Act, 2003 s.57: SERCs notify Standards of Performance (SoP)
 *    with time limits and compensation for licensee lapses.
 *  - Electricity (Rights of Consumers) Rules, 2020: consumers may ask the
 *    licensee to test the meter; a meter found defective requires the bill to
 *    be revised for the affected period.
 *  - Consumer Protection Act, 2019 (pecuniary limits as revised by the
 *    notification of 20 December 2021): District Commission up to Rs 50 lakh.
 *
 * No arithmetic here depends on the clock; all dates are passed in.
 */

/** Typical SERC Standards-of-Performance window for a billing complaint.
 *  7 days is the most common figure across state SoP regulations, but the
 *  exact limit is set state by state — the UI says so. */
export const BILLING_COMPLAINT_TARGET_DAYS = 7;

/** Electricity Act, 2003 s.42(5) — CGRF. */
export const CGRF_SECTION = "Section 42(5) of the Electricity Act, 2003";

/** Electricity Act, 2003 s.42(6) — Electricity Ombudsman appeal. */
export const OMBUDSMAN_SECTION = "Section 42(6) of the Electricity Act, 2003";

/** Consumer Protection Act, 2019 — District Commission ceiling in rupees,
 *  as revised by the Central Government notification dated 20-12-2021. */
export const DISTRICT_COMMISSION_LIMIT_INR = 5000000;

/** A billed-vs-metered gap under this share is treated as rounding / meter
 *  reading lag rather than an overcharge worth disputing. */
export const MINOR_GAP_PCT = 5;

/** Above this share the gap is large enough that most SERC formats expect a
 *  written billing dispute with a meter-testing request. */
export const SIGNIFICANT_GAP_PCT = 15;

/** Above this share the bill is treated as a severe anomaly (typical of an
 *  estimated / average bill raised without an actual meter reading). */
export const SEVERE_GAP_PCT = 50;

export const COMPLAINT_TYPES = [
  {
    id: "inflated",
    label: "Bill far higher than usual consumption",
    line: "the amount billed is grossly out of line with my established consumption pattern",
  },
  {
    id: "estimated",
    label: "Bill raised on estimate / average, no actual reading",
    line: "the bill has been raised on an estimated or average basis without an actual meter reading being taken",
  },
  {
    id: "faulty-meter",
    label: "Meter appears faulty, stuck or running fast",
    line: "the meter appears to be defective and is not recording consumption correctly",
  },
  {
    id: "wrong-tariff",
    label: "Wrong tariff category or sanctioned load applied",
    line: "the bill has been raised under an incorrect tariff category / sanctioned load",
  },
  {
    id: "arrears",
    label: "Unexplained arrears or old dues added",
    line: "an unexplained arrear has been added to the current bill without any prior intimation or break-up",
  },
  {
    id: "double-billing",
    label: "Payment already made but shown as unpaid",
    line: "a payment already made by me has not been credited and is still shown as outstanding",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const round2 = (value) => Math.round(value * 100) / 100;

const MS_PER_DAY = 86400000;

/** Parse a YYYY-MM-DD string as a UTC date. Returns null when unusable. */
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

/** Add whole days to a YYYY-MM-DD string and return a YYYY-MM-DD string. */
export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(days)) return null;
  const next = new Date(date.getTime() + Math.round(days) * MS_PER_DAY);
  return next.toISOString().slice(0, 10);
}

/** Long-form date for the letter body, e.g. "14 August 2026". */
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

/**
 * Compare what the meter shows against what was billed.
 *
 * @returns {object} either { error } or the full comparison.
 */
export function computeBillingDiscrepancy({
  previousReading,
  currentReading,
  billedUnits,
  billAmount,
  averageUnits = 0,
  averageAmount = 0,
  meterMultiplier = 1,
}) {
  const values = {
    previousReading,
    currentReading,
    billedUnits,
    billAmount,
    averageUnits,
    averageAmount,
    meterMultiplier,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
    if (value < 0) return { error: "Readings, units and amounts cannot be negative." };
  }
  if (!(meterMultiplier > 0)) return { error: "Meter multiplier (MF) must be greater than zero." };
  if (currentReading < previousReading) {
    return {
      error:
        "Current reading is lower than the previous reading. Check the figures, or note that the meter was replaced or has rolled over.",
    };
  }
  if (!(billAmount > 0)) return { error: "Bill amount must be greater than zero." };
  if (!(billedUnits > 0)) return { error: "Billed units must be greater than zero." };

  const meteredUnits = round2((currentReading - previousReading) * meterMultiplier);
  const unitGap = round2(billedUnits - meteredUnits);
  const unitGapPct = meteredUnits > 0 ? round2((unitGap / meteredUnits) * 100) : null;

  const ratePerUnit = round2(billAmount / billedUnits);
  const fairAmount = round2(meteredUnits * ratePerUnit);
  const overcharge = round2(billAmount - fairAmount);

  const vsAverageUnitsPct =
    averageUnits > 0 ? round2(((billedUnits - averageUnits) / averageUnits) * 100) : null;
  const vsAverageAmountPct =
    averageAmount > 0 ? round2(((billAmount - averageAmount) / averageAmount) * 100) : null;

  const gapMagnitude = unitGapPct === null ? 0 : Math.abs(unitGapPct);
  const averageMagnitude = vsAverageAmountPct === null ? 0 : Math.max(0, vsAverageAmountPct);
  const worst = Math.max(gapMagnitude, averageMagnitude);

  let severity = "none";
  if (worst >= SEVERE_GAP_PCT) severity = "severe";
  else if (worst >= SIGNIFICANT_GAP_PCT) severity = "significant";
  else if (worst >= MINOR_GAP_PCT) severity = "minor";

  const findings = [];
  if (unitGapPct !== null && Math.abs(unitGapPct) >= MINOR_GAP_PCT) {
    findings.push(
      unitGap > 0
        ? `Billed ${billedUnits} units against ${meteredUnits} units actually recorded by the meter — ${Math.abs(unitGap)} units (${Math.abs(unitGapPct)}%) more than the reading difference.`
        : `Billed ${billedUnits} units against ${meteredUnits} units recorded by the meter — ${Math.abs(unitGap)} units (${Math.abs(unitGapPct)}%) less than the reading difference, which usually means unbilled consumption will be added later.`,
    );
  }
  if (vsAverageUnitsPct !== null && vsAverageUnitsPct >= MINOR_GAP_PCT) {
    findings.push(
      `Billed consumption is ${vsAverageUnitsPct}% above my average of ${averageUnits} units per billing cycle.`,
    );
  }
  if (vsAverageAmountPct !== null && vsAverageAmountPct >= MINOR_GAP_PCT) {
    findings.push(
      `The billed amount is ${vsAverageAmountPct}% above my usual bill of about Rs ${averageAmount} per cycle.`,
    );
  }
  if (findings.length === 0) {
    findings.push(
      "Billed units and amount are broadly in line with the meter reading and past consumption; the dispute rests on the other grounds stated below.",
    );
  }

  return {
    billAmount: round2(billAmount),
    meteredUnits,
    billedUnits: round2(billedUnits),
    unitGap,
    unitGapPct,
    ratePerUnit,
    fairAmount,
    overcharge,
    vsAverageUnitsPct,
    vsAverageAmountPct,
    severity,
    findings,
    withinDistrictCommissionLimit: billAmount <= DISTRICT_COMMISSION_LIMIT_INR,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const rupees = (value) =>
  isNum(value)
    ? `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`
    : "Rs —";

/**
 * Compose the complaint letter. Pure string assembly — every date and figure
 * is supplied by the caller.
 */
export function buildElectricityComplaintLetter({
  consumerName,
  consumerNumber,
  meterNumber,
  serviceAddress,
  discomName,
  officeAddress,
  billMonth,
  billNumber,
  billDateISO,
  letterDateISO,
  complaintTypeId,
  previousReading,
  currentReading,
  phone,
  email,
  extraNotes,
  discrepancy,
  targetDays = BILLING_COMPLAINT_TARGET_DAYS,
}) {
  if (!discrepancy || discrepancy.error) {
    return { error: discrepancy?.error || "Fix the billing figures before drafting the letter." };
  }
  const name = clean(consumerName) || "[Your name]";
  const consumerNo = clean(consumerNumber) || "[Consumer / service connection number]";
  const meterNo = clean(meterNumber) || "[Meter number]";
  const address = clean(serviceAddress) || "[Service address]";
  const discom = clean(discomName) || "[Name of the electricity distribution company]";
  const office = clean(officeAddress) || "[Section / divisional office address]";
  const month = clean(billMonth) || "[billing month]";
  const billNo = clean(billNumber) || "[bill number]";

  const type = COMPLAINT_TYPES.find((item) => item.id === complaintTypeId) || COMPLAINT_TYPES[0];
  const letterDateLong = formatLongDate(letterDateISO) || "[date]";
  const billDateLong = formatLongDate(billDateISO) || "[bill date]";
  const replyByISO = addDaysISO(letterDateISO, targetDays);
  const replyByLong = replyByISO ? formatLongDate(replyByISO) : "";

  const subject = `Complaint against excess billing on consumer number ${consumerNo} for ${month}`;

  const findingLines = discrepancy.findings.map((line, index) => `${index + 1}. ${line}`);

  const paragraphs = [
    letterDateLong,
    "",
    "To,",
    "The Assistant Engineer / Nodal Officer (Billing),",
    `${discom},`,
    office,
    "",
    `Subject: ${subject}`,
    "",
    "Sir / Madam,",
    "",
    `I am a registered consumer of ${discom} under consumer number ${consumerNo}, meter number ${meterNo}, for the premises at ${address}. I have received bill number ${billNo} dated ${billDateLong} for the billing period of ${month} demanding ${rupees(discrepancy.billAmount)}.`,
    "",
    `I am constrained to dispute this bill because ${type.line}. The position on record is as follows:`,
    "",
    `Previous meter reading: ${isNum(previousReading) ? previousReading : "[previous reading]"}`,
    `Current meter reading: ${isNum(currentReading) ? currentReading : "[current reading]"}`,
    `Units actually recorded by the meter: ${discrepancy.meteredUnits}`,
    `Units charged in the bill: ${discrepancy.billedUnits}`,
    `Effective rate applied in the bill: ${rupees(discrepancy.ratePerUnit)} per unit`,
    `Amount payable on the recorded units at the same rate: ${rupees(discrepancy.fairAmount)}`,
    discrepancy.overcharge > 0
      ? `Excess amount demanded: ${rupees(discrepancy.overcharge)}`
      : "Excess amount demanded: nil on units, disputed on the grounds stated above",
    "",
    "Specific findings:",
    ...findingLines,
    "",
    clean(extraNotes)
      ? `Additional facts: ${clean(extraNotes)}`
      : "I have not made any change to my connected load, appliances or usage pattern that could explain this jump.",
    "",
    "I therefore request that you please:",
    "1. Get the meter tested in my presence and share the test report, as provided under the Electricity (Rights of Consumers) Rules, 2020.",
    "2. Withdraw the disputed amount and issue a revised bill based on the actual meter reading.",
    "3. Furnish the detailed calculation sheet and reading history for the disputed period.",
    "4. Confirm in writing that no disconnection will be effected on the disputed amount while the complaint is pending.",
    "",
    replyByLong
      ? `Kindly treat this as a formal billing complaint and let me have a written reply by ${replyByLong}, being ${targetDays} days from the date of this letter, in line with the Standards of Performance notified by the State Electricity Regulatory Commission under Section 57 of the Electricity Act, 2003.`
      : `Kindly treat this as a formal billing complaint and let me have a written reply within ${targetDays} days, in line with the Standards of Performance notified by the State Electricity Regulatory Commission under Section 57 of the Electricity Act, 2003.`,
    "",
    `If the complaint is not resolved, I shall be constrained to approach the Consumer Grievance Redressal Forum constituted under ${CGRF_SECTION}, and thereafter the Electricity Ombudsman under ${OMBUDSMAN_SECTION}.`,
    "",
    "Please acknowledge receipt of this complaint and give me the complaint / docket number for my record.",
    "",
    "Yours faithfully,",
    "",
    name,
    `Consumer number: ${consumerNo}`,
    address,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email]",
    "",
    "Enclosures: copy of the disputed bill, copies of the last three bills, meter photograph showing the current reading, payment receipts.",
  ];

  const body = paragraphs.join("\n").replace(/\n{3,}/g, "\n\n");
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return { subject, body, wordCount, replyByISO, replyByLong };
}

/** Escalation ladder shown next to the letter. */
export function escalationSteps(billAmount) {
  const steps = [
    {
      stage: "1. Section / divisional office",
      detail: `Submit this letter to the billing office and get a docket number. Most state Standards of Performance regulations expect a billing complaint to be settled in about ${BILLING_COMPLAINT_TARGET_DAYS} days.`,
    },
    {
      stage: "2. Nodal / grievance officer of the DISCOM",
      detail: "Escalate in writing with the docket number if there is no reply or the reply is unsatisfactory.",
    },
    {
      stage: "3. Consumer Grievance Redressal Forum (CGRF)",
      detail: `Every distribution licensee must run a CGRF under ${CGRF_SECTION}. Filing is free and does not need a lawyer.`,
    },
    {
      stage: "4. Electricity Ombudsman",
      detail: `If the CGRF order does not satisfy you, represent the matter to the Electricity Ombudsman under ${OMBUDSMAN_SECTION}.`,
    },
  ];
  if (isNum(billAmount) && billAmount > 0 && billAmount <= DISTRICT_COMMISSION_LIMIT_INR) {
    steps.push({
      stage: "5. District Consumer Commission (optional)",
      detail:
        "Deficiency in service can also be taken to the District Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019, which handles claims up to Rs 50 lakh.",
    });
  }
  return steps;
}
