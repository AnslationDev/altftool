/**
 * Medicine Schedule Builder — turn a prescription frequency into an actual
 * timetable.
 *
 * The frequency codes are the standard Latin prescription abbreviations still
 * printed on Indian and UK prescriptions:
 *   OD / QD  omni die            once a day
 *   BD / BID bis in die          twice a day, about 12 hours apart
 *   TDS / TID ter die sumendum   three times a day, spread across waking hours
 *   QDS / QID quater die sumendum four times a day
 *   HS      hora somni           at bedtime
 *   PRN     pro re nata          only when needed — no fixed timetable
 *   q4h/q6h/q8h/q12h             strict clock intervals, day and night
 *
 * Note the distinction the module is careful about: "three times a day" (TDS)
 * is spread across waking hours, while "every 8 hours" (q8h) runs round the
 * clock and will wake you up. They are not the same instruction.
 *
 * Everything here is pure: dates and the current time are always passed in as
 * arguments, never read from the clock, so the same input always produces the
 * same timetable. This is an organiser, not medical advice — follow the
 * instructions on your own prescription.
 */

/** Minutes in a day and in an hour. */
export const MINUTES_PER_DAY = 1440;
export const MINUTES_PER_HOUR = 60;

/** Longest course this tool will lay out, to keep the table usable. */
export const MAX_DAYS = 365;

/** Longest list of individual doses rendered. */
export const MAX_DOSES = 2000;

/**
 * Frequency table. `fixedTimes` are minutes from midnight and follow common
 * clinical spacing (TDS at 08:00/14:00/20:00, QDS at 08:00/12:00/16:00/20:00);
 * `intervalHours` frequencies instead run strictly round the clock.
 */
export const FREQUENCIES = [
  { id: "od", label: "Once a day (OD / QD)", dosesPerDay: 1, fixedTimes: [9 * 60], roundTheClock: false },
  { id: "bd", label: "Twice a day (BD / BID)", dosesPerDay: 2, fixedTimes: [9 * 60, 21 * 60], roundTheClock: false },
  { id: "tds", label: "Three times a day (TDS / TID)", dosesPerDay: 3, fixedTimes: [8 * 60, 14 * 60, 20 * 60], roundTheClock: false },
  { id: "qds", label: "Four times a day (QDS / QID)", dosesPerDay: 4, fixedTimes: [8 * 60, 12 * 60, 16 * 60, 20 * 60], roundTheClock: false },
  { id: "hs", label: "At bedtime (HS)", dosesPerDay: 1, fixedTimes: [22 * 60], roundTheClock: false },
  { id: "q12h", label: "Every 12 hours (q12h)", dosesPerDay: 2, intervalHours: 12, roundTheClock: true },
  { id: "q8h", label: "Every 8 hours (q8h)", dosesPerDay: 3, intervalHours: 8, roundTheClock: true },
  { id: "q6h", label: "Every 6 hours (q6h)", dosesPerDay: 4, intervalHours: 6, roundTheClock: true },
  { id: "q4h", label: "Every 4 hours (q4h)", dosesPerDay: 6, intervalHours: 4, roundTheClock: true },
  { id: "prn", label: "Only when needed (PRN)", dosesPerDay: 0, fixedTimes: [], roundTheClock: false },
];

/** Food instructions that appear on a label. */
export const FOOD_INSTRUCTIONS = [
  { id: "any", label: "With or without food" },
  { id: "before", label: "30 minutes before food" },
  { id: "after", label: "After food" },
  { id: "empty", label: "On an empty stomach" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look a frequency up by id. */
export function getFrequency(id) {
  return FREQUENCIES.find((entry) => entry.id === id) ?? null;
}

/** "HH:MM" → minutes from midnight, or null if it is not a valid time. */
export function parseTime(text) {
  if (typeof text !== "string") return null;
  const match = text.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Minutes from midnight → "HH:MM" in 24-hour form. */
export function formatTime(minutes) {
  if (!isNum(minutes)) return "--:--";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / MINUTES_PER_HOUR);
  return `${String(hours).padStart(2, "0")}:${String(wrapped % MINUTES_PER_HOUR).padStart(2, "0")}`;
}

/**
 * The times of day for one medicine.
 *
 * For fixed-time frequencies the whole set is shifted so the first dose lands
 * on the time you chose; for interval frequencies the doses simply repeat from
 * that time until the day is full.
 *
 * @param {string} frequencyId
 * @param {number} firstDoseMinutes minutes from midnight
 * @returns {{ times: number[] } | { error: string }}
 */
export function dailyDoseTimes(frequencyId, firstDoseMinutes) {
  const frequency = getFrequency(frequencyId);
  if (!frequency) return { error: "Choose how often the medicine is taken." };
  if (!isNum(firstDoseMinutes) || firstDoseMinutes < 0 || firstDoseMinutes >= MINUTES_PER_DAY) {
    return { error: "Enter the first dose time as a valid 24-hour time." };
  }
  if (frequency.dosesPerDay === 0) {
    return { times: [], asNeeded: true };
  }

  if (frequency.roundTheClock) {
    const step = frequency.intervalHours * MINUTES_PER_HOUR;
    const times = [];
    for (let minutes = firstDoseMinutes; minutes < firstDoseMinutes + MINUTES_PER_DAY; minutes += step) {
      times.push(minutes % MINUTES_PER_DAY);
    }
    return { times: times.sort((a, b) => a - b) };
  }

  const offset = firstDoseMinutes - frequency.fixedTimes[0];
  const times = frequency.fixedTimes
    .map((time) => ((time + offset) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY)
    .sort((a, b) => a - b);
  return { times };
}

/** "YYYY-MM-DD" plus a whole number of days, still as "YYYY-MM-DD". */
export function addDays(isoDate, days) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  if (!Number.isInteger(days)) return null;
  // Anchored at noon UTC so a daylight-saving shift cannot roll the date over.
  const base = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(base.getTime())) return null;
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/**
 * Build the full dose timetable.
 *
 * @param {object} input
 * @param {string} input.name medicine name
 * @param {string} input.dose text such as "500 mg" or "1 tablet"
 * @param {string} input.frequencyId
 * @param {string} input.firstDose "HH:MM"
 * @param {string} input.startDate "YYYY-MM-DD"
 * @param {number} input.days length of the course
 * @param {string} [input.food] one of FOOD_INSTRUCTIONS ids
 * @param {number} [input.unitsPerDose] tablets or millilitres per dose, for the refill count
 * @returns {object} schedule, or { error }
 */
export function buildSchedule({
  name,
  dose,
  frequencyId,
  firstDose,
  startDate,
  days,
  food = "any",
  unitsPerDose = 1,
}) {
  if (typeof name !== "string" || name.trim() === "") {
    return { error: "Enter the medicine's name." };
  }
  const frequency = getFrequency(frequencyId);
  if (!frequency) return { error: "Choose how often the medicine is taken." };

  const firstDoseMinutes = parseTime(firstDose);
  if (firstDoseMinutes === null) {
    return { error: "Enter the first dose time as HH:MM, for example 08:00." };
  }
  if (!Number.isInteger(days) || days <= 0) {
    return { error: "The course must run for at least one day." };
  }
  if (days > MAX_DAYS) {
    return { error: `This planner covers up to ${MAX_DAYS} days at a time.` };
  }
  if (!isNum(unitsPerDose) || unitsPerDose <= 0) {
    return { error: "Enter how much is taken per dose — it must be more than zero." };
  }
  if (addDays(startDate, 0) === null) {
    return { error: "Enter the start date as YYYY-MM-DD." };
  }

  const daily = dailyDoseTimes(frequencyId, firstDoseMinutes);
  if (daily.error) return { error: daily.error };

  const foodLabel = FOOD_INSTRUCTIONS.find((entry) => entry.id === food)?.label ?? FOOD_INSTRUCTIONS[0].label;

  if (daily.asNeeded) {
    return {
      name: name.trim(),
      dose,
      frequencyLabel: frequency.label,
      foodLabel,
      asNeeded: true,
      doses: [],
      dosesPerDay: 0,
      totalDoses: 0,
      totalUnits: 0,
      days,
      startDate,
      endDate: addDays(startDate, days - 1),
      dailyTimes: [],
    };
  }

  const totalDoses = daily.times.length * days;
  if (totalDoses > MAX_DOSES) {
    return { error: `That is ${totalDoses.toLocaleString("en-IN")} doses — shorten the course to keep the list readable.` };
  }

  const doses = [];
  for (let day = 0; day < days; day += 1) {
    const date = addDays(startDate, day);
    daily.times.forEach((minutes, position) => {
      doses.push({
        date,
        time: formatTime(minutes),
        minutes,
        stamp: `${date}T${formatTime(minutes)}`,
        doseNumber: day * daily.times.length + position + 1,
        dayNumber: day + 1,
      });
    });
  }
  doses.sort((a, b) => a.stamp.localeCompare(b.stamp));

  return {
    name: name.trim(),
    dose,
    frequencyLabel: frequency.label,
    roundTheClock: Boolean(frequency.roundTheClock),
    foodLabel,
    asNeeded: false,
    dailyTimes: daily.times.map(formatTime),
    dosesPerDay: daily.times.length,
    totalDoses,
    unitsPerDose,
    totalUnits: totalDoses * unitsPerDose,
    days,
    startDate,
    endDate: addDays(startDate, days - 1),
    doses,
  };
}

/**
 * The next dose at or after a given moment. The moment is an argument, so the
 * function stays pure and testable.
 *
 * @param {Array<{ stamp: string }>} doses
 * @param {string} nowStamp "YYYY-MM-DDTHH:MM"
 * @returns {object | null}
 */
export function nextDose(doses, nowStamp) {
  if (!Array.isArray(doses) || doses.length === 0) return null;
  if (typeof nowStamp !== "string") return null;
  return doses.find((entry) => entry.stamp >= nowStamp) ?? null;
}

/**
 * Minutes between two "YYYY-MM-DDTHH:MM" stamps — positive when the second is
 * later.
 *
 * @param {string} fromStamp
 * @param {string} toStamp
 * @returns {number | null}
 */
export function minutesBetween(fromStamp, toStamp) {
  const from = new Date(`${fromStamp}:00Z`);
  const to = new Date(`${toStamp}:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / 60000);
}

/**
 * A minute count as "3 h 20 min" / "45 min", for the countdown line.
 *
 * @param {number} minutes
 * @returns {string | null} null when the value is not a usable duration
 */
export function formatDuration(minutes) {
  if (!isNum(minutes) || minutes < 0) return null;
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / MINUTES_PER_HOUR);
  const rest = whole % MINUTES_PER_HOUR;
  if (hours === 0) return `${rest} min`;
  return `${hours} h ${rest} min`;
}

/**
 * Adherence as a percentage of scheduled doses actually taken.
 *
 * @param {number} taken
 * @param {number} scheduled
 * @returns {{ percent: number, missed: number } | { error: string }}
 */
export function adherence(taken, scheduled) {
  if (!isNum(taken) || !isNum(scheduled) || taken < 0 || scheduled <= 0) {
    return { error: "Enter how many doses were scheduled and how many were taken." };
  }
  if (taken > scheduled) {
    return { error: "More doses were recorded than were scheduled — check the numbers." };
  }
  return { percent: (taken / scheduled) * 100, missed: scheduled - taken };
}

/** Plain-text printout of a schedule, for sharing or sticking on the fridge. */
export function scheduleToText(schedule) {
  if (!schedule || schedule.error) return "";
  const lines = [
    `${schedule.name} — ${schedule.dose}`,
    `${schedule.frequencyLabel} · ${schedule.foodLabel}`,
    `Course: ${schedule.startDate} to ${schedule.endDate} (${schedule.days} days)`,
  ];
  if (schedule.asNeeded) {
    lines.push("Taken only when needed — no fixed times.");
    return lines.join("\n");
  }
  lines.push(
    `Daily times: ${schedule.dailyTimes.join(", ")}`,
    `Total doses: ${schedule.totalDoses}`,
    `Units to have in stock: ${schedule.totalUnits}`,
  );
  return lines.join("\n");
}
