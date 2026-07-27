/**
 * Distributed-team overlap matrix.
 *
 * Model: each teammate sits in a city with a fixed UTC offset and works the
 * same local hours (e.g. 09:00-17:00). For every UTC hour of the day the
 * matrix marks who is inside working hours; the overlap analysis finds the
 * hours when everyone (or the most people) are simultaneously at work —
 * the slots distributed teams reserve for standups and pairing.
 *
 * Offsets are standard-time values; DST-observing cities shift one hour
 * for part of the year (flagged in the UI).
 */

/** Common engineering-hub cities with standard UTC offsets in minutes. */
export const CITY_PRESETS = [
  { id: "san-francisco", label: "San Francisco (UTC−8)", offsetMinutes: -480 },
  { id: "new-york", label: "New York (UTC−5)", offsetMinutes: -300 },
  { id: "sao-paulo", label: "São Paulo (UTC−3)", offsetMinutes: -180 },
  { id: "london", label: "London (UTC+0)", offsetMinutes: 0 },
  { id: "berlin", label: "Berlin (UTC+1)", offsetMinutes: 60 },
  { id: "kyiv", label: "Kyiv (UTC+2)", offsetMinutes: 120 },
  { id: "bengaluru", label: "Bengaluru (UTC+5:30)", offsetMinutes: 330 },
  { id: "singapore", label: "Singapore (UTC+8)", offsetMinutes: 480 },
  { id: "tokyo", label: "Tokyo (UTC+9)", offsetMinutes: 540 },
  { id: "sydney", label: "Sydney (UTC+10)", offsetMinutes: 600 },
];

export const MINUTES_PER_DAY = 24 * 60;

/** Format minutes-past-midnight as hh:mm, wrapping across days. */
export function formatMinutes(totalMinutes) {
  const wrapped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Build the overlap matrix for a set of cities sharing local working hours.
 *
 * @param {object} input
 * @param {string[]} input.cityIds       Ids from CITY_PRESETS (at least two).
 * @param {number} input.workStartHour   Local working-day start (0-23).
 * @param {number} input.workEndHour     Local working-day end, exclusive (1-24, > start).
 * @returns {object} matrix and overlap analysis, or { error }.
 */
export function computeTeamOverlap({ cityIds, workStartHour, workEndHour }) {
  if (!Array.isArray(cityIds) || cityIds.length < 2) {
    return { error: "Pick at least two cities to compare." };
  }
  const cities = cityIds.map((id) => CITY_PRESETS.find((c) => c.id === id)).filter(Boolean);
  if (cities.length !== cityIds.length) return { error: "Unknown city selected." };

  const start = Number(workStartHour);
  const end = Number(workEndHour);
  if (!Number.isInteger(start) || start < 0 || start > 23) {
    return { error: "Work-start hour must be a whole number from 0 to 23." };
  }
  if (!Number.isInteger(end) || end < 1 || end > 24) {
    return { error: "Work-end hour must be a whole number from 1 to 24." };
  }
  if (end <= start) {
    return { error: "The working day must end after it starts (no overnight shifts here)." };
  }

  const startMinute = start * 60;
  const endMinute = end * 60;

  const matrix = [];
  for (let utcHour = 0; utcHour < 24; utcHour += 1) {
    const utcMinute = utcHour * 60;
    const entries = cities.map((city) => {
      const localMinute =
        ((utcMinute + city.offsetMinutes) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
      return {
        id: city.id,
        label: city.label,
        localTime: formatMinutes(localMinute),
        working: localMinute >= startMinute && localMinute < endMinute,
      };
    });
    matrix.push({
      utcHour,
      entries,
      workingCount: entries.filter((e) => e.working).length,
    });
  }

  const counts = matrix.map((row) => row.workingCount);
  const maxOverlap = Math.max(...counts);
  const everyoneHours = matrix.filter((row) => row.workingCount === cities.length);
  const bestHours = matrix.filter((row) => row.workingCount === maxOverlap).map((r) => r.utcHour);

  // Longest contiguous run at the maximum overlap level, wrapping midnight.
  const atMax = counts.map((c) => c === maxOverlap);
  let bestRun = null;
  if (atMax.every(Boolean)) {
    bestRun = { startUtcHour: 0, lengthHours: 24 };
  } else {
    const firstBreak = atMax.findIndex((v) => !v);
    let runStart = null;
    for (let i = 0; i < 24; i += 1) {
      const hour = (firstBreak + 1 + i) % 24;
      if (atMax[hour]) {
        if (runStart === null) runStart = hour;
      } else if (runStart !== null) {
        const length = ((hour - runStart + 24) % 24) || 24;
        if (!bestRun || length > bestRun.lengthHours) bestRun = { startUtcHour: runStart, lengthHours: length };
        runStart = null;
      }
    }
    if (runStart !== null) {
      const length = ((firstBreak + 1 - runStart + 24) % 24) || 24;
      if (!bestRun || length > bestRun.lengthHours) bestRun = { startUtcHour: runStart, lengthHours: length };
    }
  }

  const meetingLocalTimes = cities.map((city) => ({
    label: city.label,
    start: formatMinutes(bestRun.startUtcHour * 60 + city.offsetMinutes),
    end: formatMinutes((bestRun.startUtcHour + bestRun.lengthHours) * 60 + city.offsetMinutes),
  }));

  return {
    matrix,
    cities: cities.map((c) => c.label),
    teamSize: cities.length,
    fullOverlapHours: everyoneHours.length,
    maxOverlap,
    maxOverlapIsEveryone: maxOverlap === cities.length,
    bestHours,
    bestRun,
    meetingLocalTimes,
  };
}
