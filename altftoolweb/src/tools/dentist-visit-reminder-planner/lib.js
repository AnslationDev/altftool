/**
 * Dental recall interval logic.
 *
 * Pure module — no React, no DOM, no clock reads. Dates arrive as ISO strings.
 * Informational only. The recall interval is a clinical decision made by your
 * own dentist after examining you; this tool shows where you sit in the
 * evidence-based range and why.
 */

const MS_PER_DAY = 86400000;

/**
 * The recall interval range used in evidence-based dental guidance (NICE
 * clinical guideline CG19, Dental recall): between 3 and 24 months for adults,
 * and between 3 and 12 months for patients under 18. The interval inside that
 * range is set by risk, not by a fixed "every six months" rule.
 */
export const ADULT_INTERVAL_RANGE_MONTHS = { min: 3, max: 24 };
export const CHILD_INTERVAL_RANGE_MONTHS = { min: 3, max: 12 };
export const ADULT_AGE_YEARS = 18;

/** How far ahead to fire the calendar reminder so there is time to book. */
export const REMINDER_LEAD_DAYS = 14;

/**
 * Risk factors used in routine caries and periodontal risk assessment.
 * Weight 2 marks the factors most strongly associated with new disease.
 */
export const RISK_FACTORS = [
  { id: "recent-decay", label: "New decay or a filling in the last 2 years", weight: 2, group: "Disease history" },
  { id: "gum-disease", label: "Bleeding gums, gum disease or deep pockets", weight: 2, group: "Disease history" },
  { id: "tooth-loss", label: "Teeth lost to decay or gum disease", weight: 1, group: "Disease history" },
  { id: "smoking", label: "Smoking or any tobacco use", weight: 2, group: "Lifestyle" },
  { id: "sugar-frequency", label: "Sugary food or drink more than 4 times a day", weight: 2, group: "Lifestyle" },
  { id: "alcohol", label: "Regularly drinking above low-risk alcohol limits", weight: 1, group: "Lifestyle" },
  { id: "dry-mouth", label: "Dry mouth, or medicines that cause it", weight: 2, group: "Medical" },
  { id: "diabetes", label: "Diabetes, or a condition affecting immunity or healing", weight: 1, group: "Medical" },
  { id: "no-fluoride", label: "Not using a fluoride toothpaste of 1350–1500 ppm", weight: 1, group: "Habits" },
  { id: "no-interdental", label: "Not cleaning between the teeth most days", weight: 1, group: "Habits" },
  { id: "plaque", label: "Visible plaque or staining between check-ups", weight: 1, group: "Habits" },
  { id: "appliance", label: "Braces, dentures, bridges or implants", weight: 1, group: "Habits" },
  { id: "irregular", label: "Missed or skipped the last recommended check-up", weight: 1, group: "Attendance" },
];

/**
 * Risk bands and the interval each maps to, in months, for adults and for
 * under-18s. Every value stays inside the guideline range above.
 */
export const RISK_BANDS = [
  {
    id: "low",
    label: "Low risk",
    minScore: 0,
    maxScore: 0,
    adultMonths: 24,
    childMonths: 12,
    summary: "No risk factors ticked. The longest interval in the range is reasonable if your dentist agrees.",
  },
  {
    id: "moderate",
    label: "Moderate risk",
    minScore: 1,
    maxScore: 3,
    adultMonths: 12,
    childMonths: 9,
    summary: "A few risk factors. An annual adult check is the common landing point.",
  },
  {
    id: "high",
    label: "High risk",
    minScore: 4,
    maxScore: 6,
    adultMonths: 6,
    childMonths: 6,
    summary: "Several risk factors together. Six months lets problems be caught while they are small.",
  },
  {
    id: "very-high",
    label: "Very high risk",
    minScore: 7,
    maxScore: Infinity,
    adultMonths: 3,
    childMonths: 3,
    summary: "The shortest interval in the range, usually alongside a prevention plan and hygienist visits.",
  },
];

/** Prevention actions that shorten the list of risk factors over time. */
export const PREVENTION_ACTIONS = {
  "recent-decay": "Ask about a high-fluoride toothpaste or fluoride varnish; cut the number of sugar occasions rather than the total amount.",
  "gum-disease": "Book a hygienist appointment and clean between the teeth daily — bleeding usually settles within about two weeks.",
  "tooth-loss": "Ask what is being monitored on the remaining teeth and how often.",
  smoking: "Smoking is the single biggest modifiable risk for gum disease; ask about a stop-smoking service.",
  "sugar-frequency": "Frequency matters more than quantity — each sugar occasion drops the pH for around 20 minutes.",
  alcohol: "Alcohol adds both acid and sugar exposure, and is a risk factor for mouth cancer.",
  "dry-mouth": "Ask your prescriber whether any medicine can be changed, and about saliva substitutes.",
  diabetes: "Gum disease and blood-sugar control affect each other; tell your dentist and your diabetes team about both.",
  "no-fluoride": "Switch to a 1350–1500 ppm fluoride toothpaste, spit out and do not rinse.",
  "no-interdental": "Add floss or an interdental brush once a day — the brush only reaches three of five tooth surfaces.",
  plaque: "Ask for disclosing tablets to see exactly which areas your brushing misses.",
  appliance: "Appliances trap plaque; ask for a cleaning routine specific to the appliance you have.",
  irregular: "Ask the practice to put you on a recall list with SMS or email reminders.",
};

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, ms: probe.getTime() };
}

const pad = (n) => String(n).padStart(2, "0");

export function addMonthsIso(isoDate, months) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(months)) return null;
  const zeroBased = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return `${year}-${pad(month + 1)}-${pad(Math.min(date.day, daysInMonth))}`;
}

export function addDaysIso(isoDate, days) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(days)) return null;
  const next = new Date(date.ms + days * MS_PER_DAY);
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export function daysBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (!from || !to) return null;
  return Math.round((to.ms - from.ms) / MS_PER_DAY);
}

export function bandForScore(score) {
  if (!Number.isFinite(score) || score < 0) return null;
  return RISK_BANDS.find((band) => score >= band.minScore && score <= band.maxScore) || RISK_BANDS[RISK_BANDS.length - 1];
}

/** Escape a string for an iCalendar text value (RFC 5545). */
export function icsEscape(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

const icsDate = (isoDate) => isoDate.replace(/-/g, "");

/**
 * Plan the recall.
 * @returns {{error: string}|object}
 */
export function planDentalRecall(input = {}) {
  const lastVisit = clean(input.lastVisitDate);
  const todayIso = clean(input.today);
  const ageYears = Number(input.ageYears);

  if (!parseIsoDate(lastVisit)) {
    return { error: "Enter the date of your last check-up as a real date in YYYY-MM-DD form." };
  }
  if (!parseIsoDate(todayIso)) {
    return { error: "Today's date must be a real date in YYYY-MM-DD form." };
  }
  if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 120) {
    return { error: "Age must be between 0 and 120 years." };
  }
  const sinceLastVisit = daysBetween(lastVisit, todayIso);
  if (sinceLastVisit === null || sinceLastVisit < 0) {
    return { error: "The last check-up date is in the future. Check both dates." };
  }
  if (sinceLastVisit > 365 * 30) {
    return { error: "That last-visit date is more than 30 years ago. Re-check it." };
  }

  const selectedIds = Array.isArray(input.riskFactors) ? input.riskFactors.filter((id) => typeof id === "string") : [];
  const selected = RISK_FACTORS.filter((factor) => selectedIds.includes(factor.id));
  const score = selected.reduce((sum, factor) => sum + factor.weight, 0);
  const maxScore = RISK_FACTORS.reduce((sum, factor) => sum + factor.weight, 0);
  const band = bandForScore(score);

  const isChild = ageYears < ADULT_AGE_YEARS;
  const range = isChild ? CHILD_INTERVAL_RANGE_MONTHS : ADULT_INTERVAL_RANGE_MONTHS;
  const suggested = isChild ? band.childMonths : band.adultMonths;
  const intervalMonths = Math.min(range.max, Math.max(range.min, suggested));

  const dueDate = addMonthsIso(lastVisit, intervalMonths);
  const reminderDate = addDaysIso(dueDate, -REMINDER_LEAD_DAYS);
  const daysUntilDue = daysBetween(todayIso, dueDate);
  const overdue = daysUntilDue !== null && daysUntilDue < 0;
  const monthsSinceLastVisit = sinceLastVisit / 30.4375; // mean month length in days

  const actions = selected
    .map((factor) => ({ id: factor.id, label: factor.label, action: PREVENTION_ACTIONS[factor.id] }))
    .filter((row) => row.action);

  const warnings = [];
  if (overdue) {
    warnings.push(
      `You are ${Math.abs(daysUntilDue)} days past the ${intervalMonths}-month interval this risk profile suggests. Ring the practice rather than waiting for their reminder.`,
    );
  } else if (daysUntilDue !== null && daysUntilDue <= REMINDER_LEAD_DAYS) {
    warnings.push(`Your check-up is due in ${daysUntilDue} days. Practices book up — call now.`);
  }
  if (selected.some((factor) => factor.id === "gum-disease")) {
    warnings.push("Bleeding gums that do not settle within about two weeks of daily interdental cleaning need looking at, whatever the recall date says.");
  }
  if (sinceLastVisit > 730) {
    warnings.push("It has been more than two years since the last check-up, which is beyond the longest interval in the guideline range for adults.");
  }
  if (isChild && intervalMonths > CHILD_INTERVAL_RANGE_MONTHS.max) {
    warnings.push("Under-18s are not recalled beyond 12 months in the guideline range.");
  }

  const summaryText = [
    "Dental recall plan",
    `Last check-up: ${lastVisit}`,
    `Risk score: ${score} of ${maxScore} — ${band.label}`,
    `Recall interval: ${intervalMonths} months (guideline range ${range.min}–${range.max} months for ${isChild ? "under-18s" : "adults"})`,
    `Next check-up due: ${dueDate}`,
    `Set a reminder for: ${reminderDate}`,
  ].join("\n");

  const generatedAt = parseIsoDate(todayIso) ? `${icsDate(todayIso)}T090000Z` : `${icsDate(lastVisit)}T090000Z`;
  const icsText = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALTFTool//Dentist Visit Reminder Planner//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:dental-recall-${icsDate(dueDate)}@altftool`,
    `DTSTAMP:${generatedAt}`,
    `DTSTART;VALUE=DATE:${icsDate(dueDate)}`,
    `DTEND;VALUE=DATE:${icsDate(addDaysIso(dueDate, 1))}`,
    `SUMMARY:${icsEscape("Dental check-up due")}`,
    `DESCRIPTION:${icsEscape(`${band.label} — ${intervalMonths}-month recall interval. Last check-up ${lastVisit}.`)}`,
    "BEGIN:VALARM",
    `TRIGGER:-P${REMINDER_LEAD_DAYS}D`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape("Book your dental check-up")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    lastVisit,
    today: todayIso,
    ageYears,
    isChild,
    range,
    score,
    maxScore,
    band,
    selected,
    intervalMonths,
    dueDate,
    reminderDate,
    daysUntilDue,
    overdue,
    daysSinceLastVisit: sinceLastVisit,
    monthsSinceLastVisit,
    actions,
    summaryText,
    icsText,
    warnings,
  };
}
