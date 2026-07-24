const MAX_OCCURRENCES = 5_000;
const MAX_MERCHANT_LENGTH = 120;

export const OFFICIAL_REFERENCES = [
  {
    title: "NPCI — UPI AutoPay for Recurring Payments",
    url: "https://www.npci.org.in/product/autopay",
    accessedOn: "2026-07-24",
    supports:
      "Recurring e-mandates, customer pause/unpause/revoke controls, recurrence options, and pre-debit notification concepts.",
  },
  {
    title: "NPCI — AutoPay launch press release",
    url: "https://www.npci.org.in/PDF/npci/press-releases/2020/NPCI_Press_Release-NPCI_introduces_AutoPay_facility_on_UPI_for_recurring_payments.pdf",
    accessedOn: "2026-07-24",
    supports:
      "Officially described recurrence families and mandate-management concepts.",
  },
  {
    title: "NPCI — UPI Frequently Asked Questions",
    url: "https://www.npci.org.in/what-we-do/upi/faqs",
    accessedOn: "2026-07-24",
    supports:
      "General UPI authorization, PIN safety, transaction-history, and complaint-channel concepts.",
  },
];

export const FREQUENCIES = [
  {
    id: "one-time",
    label: "One time",
    kind: "once",
    description: "One estimated occurrence on the start date.",
  },
  {
    id: "daily",
    label: "Daily",
    kind: "days",
    interval: 1,
    description: "One estimated occurrence per calendar day.",
  },
  {
    id: "weekly",
    label: "Weekly",
    kind: "days",
    interval: 7,
    description: "Every seven days, anchored to the start date.",
  },
  {
    id: "fortnightly",
    label: "Fortnightly",
    kind: "days",
    interval: 14,
    description: "Every fourteen days, anchored to the start date.",
  },
  {
    id: "monthly",
    label: "Monthly",
    kind: "months",
    interval: 1,
    description: "Every month on the selected debit day.",
  },
  {
    id: "bimonthly",
    label: "Every two months",
    kind: "months",
    interval: 2,
    description:
      "Once every two months. This planner uses “bi-monthly” in that sense.",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    kind: "months",
    interval: 3,
    description: "Every three months on the selected debit day.",
  },
  {
    id: "half-yearly",
    label: "Half-yearly",
    kind: "months",
    interval: 6,
    description: "Every six months on the selected debit day.",
  },
  {
    id: "yearly",
    label: "Yearly",
    kind: "months",
    interval: 12,
    description: "Every twelve months on the selected debit day.",
  },
];

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function strictIsoDate(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

function formatIsoDate(date) {
  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
  ].join("-");
}

function addUtcDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function lastDayOfMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function monthCandidate(year, monthIndex, debitDay) {
  const normalizedYear = year + Math.floor(monthIndex / 12);
  const normalizedMonth = ((monthIndex % 12) + 12) % 12;
  const day = Math.min(
    debitDay,
    lastDayOfMonth(normalizedYear, normalizedMonth),
  );
  return {
    date: new Date(Date.UTC(normalizedYear, normalizedMonth, day)),
    clamped: day !== debitDay,
  };
}

function frequencyById(id) {
  return FREQUENCIES.find((frequency) => frequency.id === id) || null;
}

function positiveAmount(value) {
  const normalized = String(value ?? "").replace(/,/gu, "").trim();
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function boundedInteger(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    return null;
  }
  return number;
}

function generateDayOccurrences(start, end, interval) {
  const dates = [];
  let current = start;
  while (current <= end && dates.length < MAX_OCCURRENCES) {
    dates.push(formatIsoDate(current));
    current = addUtcDays(current, interval);
  }
  return {
    dates,
    clampedMonths: 0,
    truncated: current <= end,
  };
}

function generateMonthOccurrences(start, end, interval, debitDay) {
  const dates = [];
  let clampedMonths = 0;
  let offset = 0;
  let candidate = monthCandidate(
    start.getUTCFullYear(),
    start.getUTCMonth() + offset,
    debitDay,
  );
  if (candidate.date < start) {
    offset += interval;
    candidate = monthCandidate(
      start.getUTCFullYear(),
      start.getUTCMonth() + offset,
      debitDay,
    );
  }

  while (candidate.date <= end && dates.length < MAX_OCCURRENCES) {
    dates.push(formatIsoDate(candidate.date));
    if (candidate.clamped) clampedMonths += 1;
    offset += interval;
    candidate = monthCandidate(
      start.getUTCFullYear(),
      start.getUTCMonth() + offset,
      debitDay,
    );
  }
  return {
    dates,
    clampedMonths,
    truncated: candidate.date <= end,
  };
}

function validateReminderDate(value, label, errors) {
  if (!value) return null;
  const parsed = strictIsoDate(value);
  if (!parsed) errors.push(`${label} must be a valid calendar date.`);
  return parsed;
}

export function validateAndPlanMandate(input = {}) {
  const errors = [];
  const warnings = [];
  const merchant = normalizeText(input.merchant).slice(0, MAX_MERCHANT_LENGTH);
  const amount = positiveAmount(input.amount);
  const frequency = frequencyById(input.frequency);
  const start = strictIsoDate(input.startDate);
  const end = strictIsoDate(input.endDate);
  const reminderDays = boundedInteger(input.debitReminderDays ?? 1, 0, 30);
  const pauseReminder = validateReminderDate(
    input.pauseReminderDate,
    "Pause-review reminder",
    errors,
  );
  const revokeReminder = validateReminderDate(
    input.revokeReminderDate,
    "Revoke-review reminder",
    errors,
  );

  if (!merchant) errors.push("Merchant or mandate label is required.");
  if (!amount) errors.push("Amount must be a positive number.");
  if (!frequency) errors.push("Choose a supported planner frequency.");
  if (!start) errors.push("Start date must be a valid calendar date.");
  if (!end) errors.push("End date must be a valid calendar date.");
  if (start && end && end < start) {
    errors.push("End date must be on or after the start date.");
  }
  if (reminderDays == null) {
    errors.push("Debit reminder lead time must be a whole number from 0 to 30.");
  }

  let debitDay = null;
  if (frequency?.kind === "months") {
    debitDay = boundedInteger(
      input.debitDay || start?.getUTCDate(),
      1,
      31,
    );
    if (debitDay == null) errors.push("Debit day must be a whole number from 1 to 31.");
  }

  if (errors.length) {
    return {
      valid: false,
      errors,
      warnings,
      occurrences: [],
      reminderEvents: [],
    };
  }

  let generated;
  if (frequency.kind === "once") {
    generated = {
      dates: [formatIsoDate(start)],
      clampedMonths: 0,
      truncated: false,
    };
  } else if (frequency.kind === "days") {
    generated = generateDayOccurrences(start, end, frequency.interval);
  } else {
    generated = generateMonthOccurrences(
      start,
      end,
      frequency.interval,
      debitDay,
    );
  }

  if (generated.clampedMonths) {
    warnings.push(
      `${generated.clampedMonths} estimated occurrence${generated.clampedMonths === 1 ? "" : "s"} used the month’s last calendar day because the selected debit day did not exist. Your UPI app or merchant may handle this differently.`,
    );
  }
  if (generated.truncated) {
    warnings.push(
      `The planner capped output at ${MAX_OCCURRENCES.toLocaleString("en-US")} occurrences. Shorten the date range before calendar export.`,
    );
  }

  const reminderEvents = [];
  if (pauseReminder) {
    reminderEvents.push({
      kind: "pause-review",
      date: formatIsoDate(pauseReminder),
      label: "Review whether to pause mandate",
    });
    if (pauseReminder > end) {
      warnings.push("The pause-review reminder is after the planned mandate end date.");
    }
  }
  if (revokeReminder) {
    reminderEvents.push({
      kind: "revoke-review",
      date: formatIsoDate(revokeReminder),
      label: "Review whether to revoke mandate",
    });
    if (revokeReminder > end) {
      warnings.push("The revoke-review reminder is after the planned mandate end date.");
    }
  }

  warnings.push(
    "Occurrences are planning estimates only. Verify the authorized mandate, actual debit schedule, pre-debit notice, amount, status, and controls in your UPI app or bank.",
  );

  return {
    valid: true,
    errors,
    warnings,
    merchant,
    amount,
    frequency,
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    debitDay,
    debitReminderDays: reminderDays,
    includeAmountInCalendar: Boolean(input.includeAmountInCalendar),
    occurrences: generated.dates.map((date, index) => ({
      kind: "estimated-debit",
      date,
      sequence: index + 1,
    })),
    reminderEvents,
    clampedMonths: generated.clampedMonths,
    truncated: generated.truncated,
  };
}

function formatIcsDate(value) {
  return String(value).replace(/-/gu, "");
}

function formatUtcTimestamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/gu, "")
    .replace(/\.\d{3}Z$/u, "Z");
}

export function escapeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/gu, "\\\\")
    .replace(/\r\n?|\n/gu, "\\n")
    .replace(/,/gu, "\\,")
    .replace(/;/gu, "\\;");
}

export function foldIcsLine(line, maximumBytes = 75) {
  const encoder = new TextEncoder();
  const segments = [];
  let current = "";
  let currentBytes = 0;
  let availableBytes = maximumBytes;

  for (const character of String(line)) {
    const characterBytes = encoder.encode(character).length;
    if (current && currentBytes + characterBytes > availableBytes) {
      segments.push(current);
      current = " ";
      currentBytes = 1;
      availableBytes = maximumBytes;
    }
    current += character;
    currentBytes += characterBytes;
  }
  segments.push(current);
  return segments.join("\r\n");
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function eventLines({
  uidSeed,
  date,
  summary,
  description,
  generatedAt,
  alarmDays,
}) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${stableHash(uidSeed)}@altftool.local`,
    `DTSTAMP:${formatUtcTimestamp(generatedAt)}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(date)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "STATUS:TENTATIVE",
    "TRANSP:TRANSPARENT",
  ];
  if (Number.isInteger(alarmDays) && alarmDays > 0) {
    lines.push(
      "BEGIN:VALARM",
      `TRIGGER:-P${alarmDays}D`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(summary)}`,
      "END:VALARM",
    );
  }
  lines.push("END:VEVENT");
  return lines;
}

export function buildMandateIcs(plan, options = {}) {
  if (!plan?.valid) {
    throw new TypeError("A valid mandate plan is required for ICS export.");
  }
  if (plan.truncated) {
    throw new RangeError("Shorten the date range before exporting a truncated plan.");
  }
  const generatedAt =
    options.generatedAt instanceof Date
      ? options.generatedAt
      : new Date(options.generatedAt || Date.now());
  if (Number.isNaN(generatedAt.getTime())) {
    throw new TypeError("generatedAt must be a valid date.");
  }

  const amountSuffix = plan.includeAmountInCalendar
    ? ` — INR ${plan.amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`
    : "";
  const description =
    "Planning estimate only. Verify the mandate, amount, debit date, and status in your UPI app or bank. This calendar event cannot initiate, pause, or revoke a payment.";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALTFTool//UPI AutoPay Mandate Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Estimated UPI AutoPay mandate plan",
  ];

  plan.occurrences.forEach((occurrence) => {
    lines.push(
      ...eventLines({
        uidSeed: `${plan.merchant}|${occurrence.date}|${occurrence.sequence}|debit`,
        date: occurrence.date,
        summary: `Estimated UPI AutoPay debit — ${plan.merchant}${amountSuffix}`,
        description,
        generatedAt,
        alarmDays: plan.debitReminderDays,
      }),
    );
  });
  plan.reminderEvents.forEach((reminder) => {
    lines.push(
      ...eventLines({
        uidSeed: `${plan.merchant}|${reminder.date}|${reminder.kind}`,
        date: reminder.date,
        summary: `${reminder.label} — ${plan.merchant}`,
        description:
          "Review reminder only. Open your UPI app or bank independently to inspect available mandate controls. This event cannot change the mandate.",
        generatedAt,
        alarmDays: null,
      }),
    );
  });
  lines.push("END:VCALENDAR");
  return `${lines.map((line) => foldIcsLine(line)).join("\r\n")}\r\n`;
}

export function buildCountsOnlyMandateReport(plan) {
  if (!plan?.valid) {
    throw new TypeError("A valid mandate plan is required for the summary.");
  }
  const lines = [
    "UPI AutoPay Mandate Planner — Counts-Only Summary",
    "================================================",
    `Estimated debit occurrences: ${plan.occurrences.length}`,
    `Planner frequency: ${plan.frequency.label}`,
    `Pause/revoke review reminders: ${plan.reminderEvents.length}`,
    `Debit reminder lead days: ${plan.debitReminderDays}`,
    `Month-end adjustments: ${plan.clampedMonths}`,
    `Output truncated: ${plan.truncated ? "yes" : "no"}`,
    "",
    "Important: This is a private planning estimate, not an authoritative mandate schedule or bank record.",
    "Privacy: This summary excludes merchant name, amount, start date, end date, debit dates, reminder dates, account details, UPI IDs, and transaction identifiers.",
    "Capability boundary: The planner does not access a UPI or bank app and cannot create, approve, modify, pause, unpause, revoke, debit, or verify a mandate.",
  ];
  return lines.join("\n");
}

export const plannerLimits = {
  maxOccurrences: MAX_OCCURRENCES,
  maxMerchantLength: MAX_MERCHANT_LENGTH,
};
