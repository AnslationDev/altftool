/**
 * Missed dose timing helper.
 *
 * Implements the general "half-interval rule" that is printed on most patient
 * information leaflets and taught in pharmacy practice:
 *
 *   Take the missed dose as soon as you remember, UNLESS it is nearly time for
 *   the next dose — then skip the missed one and carry on with the normal
 *   schedule. Never take two doses together to make up for a missed one.
 *
 * "Nearly time" is quantified here as halfway to the next scheduled dose, i.e.
 * the cut-off is half the dosing interval:
 *
 *   threshold hours = dosing interval / 2
 *   hours late      = now - scheduled time of the missed dose
 *   hours late < threshold  -> the leaflet rule points to taking it now
 *   hours late >= threshold -> the leaflet rule points to skipping it
 *
 * Number of scheduled doses that have already gone by:
 *   doses missed = 1 + floor(hours late / interval)
 *
 * Some medicine classes have their OWN published missed-dose rules that
 * override the general rule (combined oral contraceptives, anticoagulants,
 * insulin, antiepileptics, transplant immunosuppressants, HIV antiretrovirals,
 * weekly bisphosphonates). For those this module deliberately refuses to apply
 * the half-interval rule and returns a "check" outcome instead.
 *
 * Informational only. This module models a leaflet rule; it is not advice and
 * does not replace the specific instructions on your own medicine.
 */

/** Fraction of the dosing interval used as the take-it-or-skip-it cut-off. */
export const HALF_INTERVAL = 0.5;

/** Doubling up is never part of the general rule, whatever the interval. */
export const NEVER_DOUBLE_UP = true;

const MS_PER_HOUR = 3600000;

/** Common dosing frequencies and the hours between doses. */
export const FREQUENCY_PRESETS = [
  { id: "od", label: "Once a day (OD)", hours: 24 },
  { id: "bd", label: "Twice a day (BD, every 12 h)", hours: 12 },
  { id: "tds", label: "Three times a day (TDS, every 8 h)", hours: 8 },
  { id: "qds", label: "Four times a day (QDS, every 6 h)", hours: 6 },
  { id: "q4h", label: "Every 4 hours", hours: 4 },
  { id: "weekly", label: "Once a week", hours: 168 },
  { id: "custom", label: "Other interval (enter hours)", hours: null },
];

/**
 * Medicine categories. `ownRules: true` means the class has published
 * missed-dose instructions of its own and the general rule must not be applied.
 */
export const MEDICINE_CLASSES = [
  {
    id: "general",
    label: "General / not listed below",
    ownRules: false,
    note: "The leaflet rule below is the usual starting point, but your own leaflet always wins.",
  },
  {
    id: "antibiotic",
    label: "Antibiotic course",
    ownRules: false,
    note: "Finish the full course even after a missed dose; stopping early is what drives resistance and relapse, so tell the prescriber if several doses were missed.",
  },
  {
    id: "contraceptive",
    label: "Contraceptive pill",
    ownRules: true,
    note: "Combined and progestogen-only pills have their own missed-pill rules that depend on which pill, which week of the pack and how many hours late, and additional contraception may be needed. Follow the pack leaflet or ask a pharmacist the same day.",
  },
  {
    id: "anticoagulant",
    label: "Blood thinner / anticoagulant",
    ownRules: true,
    note: "Warfarin and the direct oral anticoagulants each have specific missed-dose instructions, and doubling up carries a real bleeding risk. Contact the anticoagulant clinic or prescriber.",
  },
  {
    id: "insulin",
    label: "Insulin or diabetes medicine",
    ownRules: true,
    note: "The right action depends on the insulin type, your glucose reading and when you last ate. Check your glucose and follow your diabetes team's sick-day or missed-dose plan.",
  },
  {
    id: "antiepileptic",
    label: "Anti-epileptic / seizure medicine",
    ownRules: true,
    note: "Missed doses can trigger breakthrough seizures, and several of these drugs have drug-specific catch-up instructions. Contact the prescriber or an out-of-hours pharmacist rather than guessing.",
  },
  {
    id: "immunosuppressant",
    label: "Transplant immunosuppressant",
    ownRules: true,
    note: "Levels have to stay in a narrow window to protect the graft. Transplant teams normally want to be told the same day a dose is missed.",
  },
  {
    id: "antiretroviral",
    label: "HIV antiretroviral",
    ownRules: true,
    note: "Adherence is what keeps the virus suppressed and resistance from developing. Contact your HIV clinic or pharmacist about the specific regimen.",
  },
  {
    id: "bisphosphonate",
    label: "Weekly or monthly bisphosphonate",
    ownRules: true,
    note: "These are taken on an empty stomach with plain water while staying upright, so the catch-up instruction is usually to take it the next morning rather than later the same day. Check the leaflet.",
  },
];

function parseDateTime(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value.length === 16 ? `${value}:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * @param {object} input
 * @param {string} input.scheduledAt   Local datetime the dose was due, "YYYY-MM-DDTHH:mm".
 * @param {string} input.now           Local datetime you noticed, "YYYY-MM-DDTHH:mm".
 * @param {number} input.intervalHours Hours between doses.
 * @param {string} [input.medicineClass] One of MEDICINE_CLASSES[].id
 * @returns {object} assessment or { error }
 */
export function assessMissedDose({ scheduledAt, now, intervalHours, medicineClass = "general" }) {
  if (typeof intervalHours !== "number" || !Number.isFinite(intervalHours)) {
    return { error: "Enter the number of hours between doses." };
  }
  if (intervalHours <= 0) {
    return { error: "The gap between doses must be greater than zero hours." };
  }
  if (intervalHours > 24 * 60) {
    return { error: "Enter a dosing interval of 60 days or less." };
  }
  const scheduled = parseDateTime(scheduledAt);
  if (!scheduled) return { error: "Enter a valid date and time for the dose that was missed." };
  const current = parseDateTime(now);
  if (!current) return { error: "Enter a valid current date and time." };

  const klass =
    MEDICINE_CLASSES.find((item) => item.id === medicineClass) ?? MEDICINE_CLASSES[0];

  const hoursLate = (current.getTime() - scheduled.getTime()) / MS_PER_HOUR;
  const thresholdHours = intervalHours * HALF_INTERVAL;

  // Next dose on the original, unchanged schedule.
  let nextDose = new Date(scheduled.getTime() + intervalHours * MS_PER_HOUR);
  while (nextDose.getTime() <= current.getTime()) {
    nextDose = new Date(nextDose.getTime() + intervalHours * MS_PER_HOUR);
  }
  const hoursToNext = (nextDose.getTime() - current.getTime()) / MS_PER_HOUR;

  const base = {
    hoursLate,
    minutesLate: Math.round(hoursLate * 60),
    thresholdHours,
    intervalHours,
    nextDoseIso: nextDose.toISOString(),
    hoursToNext,
    className: klass.label,
    classNote: klass.note,
    neverDoubleUp: NEVER_DOUBLE_UP,
    dosesMissed: hoursLate > 0 ? 1 + Math.floor(hoursLate / intervalHours) : 0,
  };

  if (hoursLate < 0) {
    return {
      ...base,
      outcome: "not-due",
      headline: "This dose is not due yet",
      detail: `The time you entered is ${formatHours(-hoursLate)} before the dose is due, so nothing has been missed. Set an alarm for the scheduled time.`,
      dosesMissed: 0,
    };
  }

  if (klass.ownRules) {
    return {
      ...base,
      outcome: "check",
      headline: "This medicine has its own missed-dose rule",
      detail: `The dose is ${formatHours(hoursLate)} late. The general half-interval rule does not apply to ${klass.label.toLowerCase()}, so follow the leaflet for your specific product or speak to a pharmacist or the prescriber today.`,
    };
  }

  if (hoursLate < thresholdHours) {
    return {
      ...base,
      outcome: "take-now",
      headline: "Leaflet rule: take the missed dose now",
      detail: `It is ${formatHours(hoursLate)} late, which is less than the ${formatHours(thresholdHours)} halfway point to the next dose. Take it now and keep the next dose at its normal time. Do not double up.`,
    };
  }

  return {
    ...base,
    outcome: "skip",
    headline: "Leaflet rule: skip it and carry on",
    detail: `It is ${formatHours(hoursLate)} late, past the ${formatHours(thresholdHours)} halfway point to the next dose. The usual instruction is to leave the missed dose out and take the next one at its normal time, never two together.`,
  };
}

/** Human-friendly hours: "45 minutes", "3 h 20 m", "2 days 4 h". */
export function formatHours(hours) {
  if (typeof hours !== "number" || !Number.isFinite(hours) || hours < 0) return "0 minutes";
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  const days = Math.floor(totalMinutes / 1440);
  const wholeHours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}${wholeHours ? ` ${wholeHours} h` : ""}`;
  }
  return `${wholeHours} h${minutes ? ` ${minutes} m` : ""}`;
}
