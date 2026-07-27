/**
 * GitHub Actions cron schedule builder.
 *
 * Rules encoded from GitHub's docs, "Events that trigger workflows → schedule"
 * (docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule):
 *  - schedule uses 5-field POSIX cron syntax evaluated in UTC — there is no
 *    timezone option, so local times must be converted by hand.
 *  - The shortest allowed interval is once every 5 minutes.
 *  - Runs can be delayed or dropped during periods of high load; the start of
 *    every hour (and 00:00 UTC especially) is the worst time to schedule.
 *  - Scheduled workflows run on the default branch, and on public repos they
 *    are disabled after 60 days without repository activity.
 */

export const MINUTES_PER_DAY = 1440;
export const DAYS_PER_WEEK = 7;

/** GitHub's documented minimum schedule interval (minutes). */
export const MIN_INTERVAL_MINUTES = 5;

export const FREQUENCY_OPTIONS = [
  { id: "every-n-minutes", label: "Every N minutes" },
  { id: "hourly", label: "Hourly (at a minute)" },
  { id: "daily", label: "Daily (at a local time)" },
  { id: "weekly", label: "Weekly (chosen days, local time)" },
  { id: "monthly", label: "Monthly (day of month, local time)" },
];

/** Cron day-of-week numbering: 0 = Sunday … 6 = Saturday. */
export const WEEKDAYS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

/**
 * Fixed UTC offsets in minutes. Cron cannot follow DST, so zones are expressed
 * as offsets; zones that observe DST are labelled with both variants.
 */
export const OFFSET_OPTIONS = [
  { id: 0, label: "UTC±00:00 (UTC / London winter)" },
  { id: 60, label: "UTC+01:00 (Berlin winter / London summer)" },
  { id: 120, label: "UTC+02:00 (Berlin summer / Cairo)" },
  { id: 330, label: "UTC+05:30 (India)" },
  { id: 480, label: "UTC+08:00 (Singapore / Beijing)" },
  { id: 540, label: "UTC+09:00 (Tokyo)" },
  { id: 600, label: "UTC+10:00 (Sydney winter)" },
  { id: 660, label: "UTC+11:00 (Sydney summer)" },
  { id: -300, label: "UTC-05:00 (New York winter)" },
  { id: -240, label: "UTC-04:00 (New York summer)" },
  { id: -360, label: "UTC-06:00 (Chicago winter)" },
  { id: -480, label: "UTC-08:00 (Los Angeles winter)" },
  { id: -420, label: "UTC-07:00 (Los Angeles summer / Denver winter)" },
];

/** Offsets shown in the team preview table. */
export const PREVIEW_OFFSETS = [
  { offset: 0, label: "UTC" },
  { offset: -300, label: "New York (UTC-5)" },
  { offset: -480, label: "Los Angeles (UTC-8)" },
  { offset: 60, label: "Berlin (UTC+1)" },
  { offset: 330, label: "India (UTC+5:30)" },
  { offset: 540, label: "Tokyo (UTC+9)" },
];

const pad = (value) => String(value).padStart(2, "0");

/** Positive modulo. */
const mod = (value, base) => ((value % base) + base) % base;

/**
 * Convert a local wall time to UTC given a fixed offset.
 * dayShift is -1 / 0 / +1: the UTC calendar day relative to the local day.
 */
export function localToUtc(localHour, localMinute, offsetMinutes) {
  const localTotal = localHour * 60 + localMinute;
  const utcTotal = localTotal - offsetMinutes;
  const wrapped = mod(utcTotal, MINUTES_PER_DAY);
  const dayShift = Math.floor(utcTotal / MINUTES_PER_DAY);
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60, dayShift };
}

/** Convert a UTC time to a local wall time for the preview table. */
export function utcToLocal(utcHour, utcMinute, offsetMinutes) {
  const utcTotal = utcHour * 60 + utcMinute;
  const localTotal = utcTotal + offsetMinutes;
  const wrapped = mod(localTotal, MINUTES_PER_DAY);
  const dayShift = Math.floor(localTotal / MINUTES_PER_DAY);
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60, dayShift };
}

const dayShiftSuffix = (shift) => (shift === 0 ? "" : shift > 0 ? " (+1 day)" : " (-1 day)");

/**
 * Build the cron entry.
 * @returns {object} { cron, yaml, description, utc, warnings, preview } or { error }
 */
export function buildCronSchedule({
  frequency,
  everyN = 15,
  localHour = 9,
  localMinute = 0,
  offsetMinutes = 0,
  daysOfWeek = [],
  dayOfMonth = 1,
}) {
  if (!FREQUENCY_OPTIONS.some((option) => option.id === frequency)) {
    return { error: "Choose a schedule frequency." };
  }
  const offset = Number(offsetMinutes);
  if (!Number.isFinite(offset) || offset < -720 || offset > 840) {
    return { error: "UTC offset must be between -12:00 and +14:00." };
  }

  const warnings = [];
  let cron;
  let description;
  let utc = null;

  if (frequency === "every-n-minutes") {
    const n = Number(everyN);
    if (!Number.isInteger(n) || n < 1 || n > 720) {
      return { error: "Enter an interval between 1 and 720 minutes." };
    }
    if (n < MIN_INTERVAL_MINUTES) {
      return {
        error: `GitHub's shortest schedule interval is ${MIN_INTERVAL_MINUTES} minutes — increase the interval.`,
      };
    }
    if (60 % n !== 0 && n < 60) {
      warnings.push(
        `*/${n} restarts each hour, so gaps of ${60 - (Math.floor(60 / n) * n)} minutes appear at the top of the hour.`,
      );
    }
    cron = n >= 60 ? `0 */${Math.floor(n / 60)} * * *` : `*/${n} * * * *`;
    if (n >= 60 && n % 60 !== 0) {
      warnings.push(`Cron cannot express "every ${n} minutes" exactly — rounded to every ${Math.floor(n / 60)} hour(s).`);
    }
    description = n >= 60 ? `Every ${Math.floor(n / 60)} hour(s), on the hour (UTC).` : `Every ${n} minutes.`;
  } else {
    const hour = Number(localHour);
    const minute = Number(localMinute);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return { error: "Hour must be a whole number between 0 and 23." };
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      return { error: "Minute must be a whole number between 0 and 59." };
    }

    if (frequency === "hourly") {
      cron = `${minute} * * * *`;
      description = `Every hour at minute ${pad(minute)} (UTC — offsets do not change an hourly cadence).`;
      if (minute === 0) {
        warnings.push(
          "Minute 0 is the highest-load moment on GitHub's schedulers — runs are often delayed or dropped. Pick an odd minute.",
        );
      }
    } else {
      utc = localToUtc(hour, minute, offset);
      if (utc.minute === 0 && utc.hour === 0) {
        warnings.push(
          "This lands on 00:00 UTC, the single busiest schedule slot on GitHub — expect delays. Shift by a few minutes.",
        );
      } else if (utc.minute === 0) {
        warnings.push("On-the-hour UTC schedules queue behind thousands of workflows — an odd minute runs more punctually.");
      }

      if (frequency === "daily") {
        cron = `${utc.minute} ${utc.hour} * * *`;
        description = `Daily at ${pad(hour)}:${pad(minute)} local = ${pad(utc.hour)}:${pad(utc.minute)} UTC${dayShiftSuffix(utc.dayShift)}.`;
      } else if (frequency === "weekly") {
        const days = [...new Set(daysOfWeek.map(Number))].filter(
          (day) => Number.isInteger(day) && day >= 0 && day <= 6,
        );
        if (days.length === 0) return { error: "Pick at least one day of the week." };
        // The chosen days are LOCAL days; shift them onto UTC days when the
        // conversion crosses midnight.
        const utcDays = [...new Set(days.map((day) => mod(day + utc.dayShift, DAYS_PER_WEEK)))].sort(
          (a, b) => a - b,
        );
        cron = `${utc.minute} ${utc.hour} * * ${utcDays.join(",")}`;
        const localNames = days
          .sort((a, b) => a - b)
          .map((day) => WEEKDAYS[day].label)
          .join(", ");
        const utcNames = utcDays.map((day) => WEEKDAYS[day].label).join(", ");
        description = `Weekly on ${localNames} at ${pad(hour)}:${pad(minute)} local = ${utcNames} at ${pad(utc.hour)}:${pad(utc.minute)} UTC.`;
        if (utc.dayShift !== 0) {
          warnings.push("The UTC conversion crosses midnight, so the cron day-of-week differs from your local day.");
        }
      } else {
        const dom = Number(dayOfMonth);
        if (!Number.isInteger(dom) || dom < 1 || dom > 31) {
          return { error: "Day of month must be between 1 and 31." };
        }
        if (dom > 28) {
          warnings.push(`Day ${dom} does not exist in every month — those months are skipped by cron.`);
        }
        if (utc.dayShift !== 0) {
          warnings.push(
            "The UTC conversion crosses midnight; cron cannot shift a day-of-month, so runs land a calendar day off in local terms.",
          );
        }
        cron = `${utc.minute} ${utc.hour} ${dom} * *`;
        description = `Monthly on day ${dom} at ${pad(hour)}:${pad(minute)} local = ${pad(utc.hour)}:${pad(utc.minute)} UTC${dayShiftSuffix(utc.dayShift)}.`;
      }
    }
  }

  const yaml = ["on:", "  schedule:", `    - cron: "${cron}"`].join("\n");

  const previewBase =
    utc ?? (frequency === "hourly" ? { hour: null, minute: Number(localMinute) } : null);
  const preview =
    utc === null
      ? []
      : PREVIEW_OFFSETS.map((zone) => {
          const local = utcToLocal(utc.hour, utc.minute, zone.offset);
          return {
            label: zone.label,
            time: `${pad(local.hour)}:${pad(local.minute)}${dayShiftSuffix(local.dayShift)}`,
          };
        });

  return { cron, yaml, description, utc: previewBase, warnings, preview };
}
