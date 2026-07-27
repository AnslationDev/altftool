/**
 * Vitamin D dosing schedule builder.
 *
 * Turns an intermittent instruction ("60,000 IU once a week for 8 weeks",
 * "50,000 IU weekly", "one sachet a month") into explicit calendar dates and
 * converts the intermittent dose into the average daily intake it represents:
 *
 *   average daily IU = total course IU / days covered by the course
 *   days covered     = (date after the last interval) - (start date)
 *
 * Reference intakes used for the comparison come from the US Institute of
 * Medicine / National Academies Dietary Reference Intakes for vitamin D (2011),
 * which are also the values quoted by the NIH Office of Dietary Supplements:
 *   RDA  600 IU (15 mcg) per day, ages 1-70
 *   RDA  800 IU (20 mcg) per day, ages 71+
 *   UL  4000 IU (100 mcg) per day for adults and children aged 9+
 *   UL  3000 IU per day ages 4-8, 2500 IU ages 1-3, 1000-1500 IU in infancy
 *
 * Conversion factor: 1 microgram of cholecalciferol = 40 IU (WHO/USP definition).
 *
 * The upper limit applies to long-term average daily intake, so a short
 * loading course prescribed by a clinician can legitimately sit above it.
 * This module only reports the arithmetic; it never recommends a dose.
 */

/** 1 microgram of vitamin D3 = 40 International Units (USP/WHO definition). */
export const IU_PER_MCG = 40;

/** IOM/NAM 2011 RDA, ages 1-70. */
export const RDA_IU_ADULT = 600;

/** IOM/NAM 2011 RDA, ages 71 and over. */
export const RDA_IU_SENIOR = 800;

/** IOM/NAM 2011 Tolerable Upper Intake Level, ages 9 and over. */
export const UL_IU_ADULT = 4000;

/** Longest course the builder will lay out, to keep the table usable. */
export const MAX_DOSES = 104;

/** Interval in days for each fixed-interval frequency. Monthly is calendar-based. */
export const FREQUENCIES = [
  { id: "daily", label: "Every day", days: 1 },
  { id: "alternate", label: "Every other day", days: 2 },
  { id: "twice-weekly", label: "Twice a week (every 3-4 days)", days: 3.5 },
  { id: "weekly", label: "Once a week", days: 7 },
  { id: "fortnightly", label: "Once every 2 weeks", days: 14 },
  { id: "monthly", label: "Once a month (same date)", days: null },
];

const MS_PER_DAY = 86400000;

function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

/** Add whole calendar months, clamping to the last valid day (31 Jan + 1m = 28/29 Feb). */
export function addMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

/** Convert micrograms of vitamin D to International Units. */
export function mcgToIu(mcg) {
  return mcg * IU_PER_MCG;
}

/** Convert International Units of vitamin D to micrograms. */
export function iuToMcg(iu) {
  return iu / IU_PER_MCG;
}

/**
 * Build the dated schedule.
 *
 * @param {object} input
 * @param {number} input.doseAmount  Dose taken each time, in the chosen unit.
 * @param {"iu"|"mcg"} input.unit    Unit the dose is written in.
 * @param {string} input.frequency   One of FREQUENCIES[].id
 * @param {string} input.startDate   First dose date, "YYYY-MM-DD".
 * @param {number} input.doseCount   Number of doses in the course.
 * @param {number} [input.ageYears]  Age, used only to pick the RDA to compare against.
 * @returns {object} schedule or { error }
 */
export function buildVitaminDSchedule({
  doseAmount,
  unit = "iu",
  frequency = "weekly",
  startDate,
  doseCount,
  ageYears = 35,
}) {
  if (typeof doseAmount !== "number" || !Number.isFinite(doseAmount)) {
    return { error: "Enter the dose taken each time as a number." };
  }
  if (doseAmount <= 0) {
    return { error: "The dose must be greater than zero." };
  }
  if (unit !== "iu" && unit !== "mcg") {
    return { error: "Choose whether the dose is written in IU or micrograms." };
  }
  const freq = FREQUENCIES.find((item) => item.id === frequency);
  if (!freq) {
    return { error: "Choose how often the dose is taken." };
  }
  if (typeof doseCount !== "number" || !Number.isFinite(doseCount) || doseCount < 1) {
    return { error: "Enter how many doses the course contains (at least 1)." };
  }
  if (doseCount > MAX_DOSES) {
    return { error: `This builder lays out up to ${MAX_DOSES} doses at a time.` };
  }
  const start = parseIsoDate(startDate);
  if (!start) {
    return { error: "Enter the first dose date as a valid calendar date." };
  }

  const totalDoses = Math.floor(doseCount);
  const perDoseIu = unit === "mcg" ? mcgToIu(doseAmount) : doseAmount;
  if (perDoseIu > 1000000) {
    return { error: "That dose is far outside any real vitamin D product. Check the unit." };
  }

  const dateForIndex = (index) => {
    if (freq.id === "monthly") return addMonths(start, index);
    return new Date(start.getTime() + Math.round(index * freq.days) * MS_PER_DAY);
  };

  const doses = [];
  for (let index = 0; index < totalDoses; index += 1) {
    const date = dateForIndex(index);
    doses.push({
      number: index + 1,
      iso: toIso(date),
      weekday: date.getUTCDay(),
      cumulativeIu: perDoseIu * (index + 1),
    });
  }

  const lastDose = dateForIndex(totalDoses - 1);
  const afterCourse = dateForIndex(totalDoses);
  const coveredDays = Math.max(1, Math.round((afterCourse - start) / MS_PER_DAY));
  const totalIu = perDoseIu * totalDoses;
  const averageDailyIu = totalIu / coveredDays;

  const rdaIu = ageYears >= 71 ? RDA_IU_SENIOR : RDA_IU_ADULT;

  return {
    perDoseIu,
    perDoseMcg: iuToMcg(perDoseIu),
    totalDoses,
    totalIu,
    totalMcg: iuToMcg(totalIu),
    doses,
    firstDoseIso: toIso(start),
    lastDoseIso: toIso(lastDose),
    courseEndsIso: toIso(new Date(afterCourse.getTime() - MS_PER_DAY)),
    coveredDays,
    averageDailyIu,
    averageDailyMcg: iuToMcg(averageDailyIu),
    rdaIu,
    rdaMultiple: averageDailyIu / rdaIu,
    ulIu: UL_IU_ADULT,
    aboveUpperLimit: averageDailyIu > UL_IU_ADULT,
    intervalLabel: freq.label,
    intervalDays: freq.days,
  };
}
