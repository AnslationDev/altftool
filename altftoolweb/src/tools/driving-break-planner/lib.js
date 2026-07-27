/**
 * Long-drive break and arrival planning.
 *
 * Fatigue guidance used
 *  - Private driving: a break of at least 15 minutes after every 2 hours at the
 *    wheel, the interval recommended in road-safety guidance worldwide and in
 *    rule 91 of the UK Highway Code.
 *  - Commercial driving in India: the Motor Transport Workers Act, 1961 limits an
 *    adult motor transport worker to 8 hours a day and 48 hours a week (s.13) and
 *    requires a rest interval of at least half an hour after 5 hours of continuous
 *    work (s.16).
 *
 * Times are minutes from the start; the start date and time are arguments, so
 * nothing here reads the clock.
 */

const MS_PER_DAY = 86400000;
const MINUTES_PER_DAY = 1440;

/** Private-car defaults. */
export const PRIVATE_BREAK_INTERVAL_HOURS = 2;
export const PRIVATE_BREAK_MINUTES = 15;

/** Motor Transport Workers Act, 1961. */
export const COMMERCIAL_BREAK_INTERVAL_HOURS = 5;
export const COMMERCIAL_BREAK_MINUTES = 30;
export const COMMERCIAL_MAX_DAILY_HOURS = 8;

/** A sensible ceiling for a private driver's own day at the wheel. */
export const DEFAULT_MAX_DAILY_HOURS = 8;

export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year) return NaN;
  if (probe.getUTCMonth() !== month - 1) return NaN;
  if (probe.getUTCDate() !== day) return NaN;
  return stamp;
}

/** "HH:MM" to minutes past midnight, or NaN. */
export function parseClock(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/** Minutes past midnight back to "HH:MM". */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** A duration in minutes as "5h 20m". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Start date plus an offset in minutes, returned as { date, time, dayOffset }. */
export function stampAt(startDate, startMinutes, offsetMinutes) {
  const base = parseDate(startDate);
  if (!Number.isFinite(base) || !Number.isFinite(startMinutes) || !Number.isFinite(offsetMinutes)) {
    return { date: "", time: "", dayOffset: 0 };
  }
  const total = startMinutes + offsetMinutes;
  const dayOffset = Math.floor(total / MINUTES_PER_DAY);
  return {
    date: new Date(base + dayOffset * MS_PER_DAY).toISOString().slice(0, 10),
    time: formatClock(total),
    dayOffset,
  };
}

/**
 * Build the stop plan and arrival time for a drive.
 *
 * @param {object} input
 * @param {number} input.distanceKm
 * @param {number} input.averageSpeedKmh   realistic moving average, not the speed limit
 * @param {string} input.startDate         "YYYY-MM-DD"
 * @param {string} input.startTime         "HH:MM"
 * @param {number} input.trafficBufferPct  percentage added to driving time for traffic and detours
 * @param {number} input.breakIntervalHours
 * @param {number} input.breakMinutes
 * @param {number} input.mealStops
 * @param {number} input.mealMinutes
 * @param {number} input.fuelRangeKm       distance on a full tank, 0 to skip
 * @param {number} input.fuelMinutes
 * @param {boolean} input.combineStops     count meal and fuel halts as rest breaks
 * @param {number} input.maxDailyDrivingHours
 * @param {number} input.overnightHours    halt length when the drive spills into another day
 */
export function planDrive({
  distanceKm,
  averageSpeedKmh,
  startDate,
  startTime,
  trafficBufferPct = 0,
  breakIntervalHours = PRIVATE_BREAK_INTERVAL_HOURS,
  breakMinutes = PRIVATE_BREAK_MINUTES,
  mealStops = 0,
  mealMinutes = 30,
  fuelRangeKm = 0,
  fuelMinutes = 10,
  combineStops = false,
  maxDailyDrivingHours = DEFAULT_MAX_DAILY_HOURS,
  overnightHours = 10,
} = {}) {
  const numeric = {
    distanceKm,
    averageSpeedKmh,
    trafficBufferPct,
    breakIntervalHours,
    breakMinutes,
    mealStops,
    mealMinutes,
    fuelRangeKm,
    fuelMinutes,
    maxDailyDrivingHours,
    overnightHours,
  };
  for (const value of Object.values(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: "Enter a valid number in every field." };
    }
  }
  const startMinutes = parseClock(startTime);
  if (!Number.isFinite(parseDate(startDate))) {
    return { error: "Start date must be a real calendar date." };
  }
  if (!Number.isFinite(startMinutes)) {
    return { error: "Start time must be in 24-hour HH:MM form." };
  }
  if (!(distanceKm > 0)) return { error: "Distance must be greater than zero." };
  if (distanceKm > 20000) return { error: "That distance is longer than any single road trip." };
  if (!(averageSpeedKmh > 0)) return { error: "Average speed must be greater than zero." };
  if (averageSpeedKmh > 150) {
    return { error: "Plan on an average of 150 km/h or less — Indian expressway limits top out at 120 km/h." };
  }
  if (trafficBufferPct < 0 || trafficBufferPct > 200) {
    return { error: "Traffic buffer should be between 0% and 200%." };
  }
  if (!(breakIntervalHours > 0) || breakIntervalHours > 12) {
    return { error: "Break interval should be between 0 and 12 hours." };
  }
  if (breakMinutes < 0 || breakMinutes > 240) {
    return { error: "A break should be between 0 and 240 minutes." };
  }
  if (mealStops < 0 || mealStops > 10 || mealMinutes < 0 || mealMinutes > 240) {
    return { error: "Check the meal stop count and length." };
  }
  if (fuelRangeKm < 0 || fuelMinutes < 0 || fuelMinutes > 120) {
    return { error: "Check the fuel range and refuelling time." };
  }
  if (!(maxDailyDrivingHours > 0) || maxDailyDrivingHours > 24) {
    return { error: "Driving hours per day should be between 0 and 24." };
  }
  if (overnightHours < 0 || overnightHours > 24) {
    return { error: "An overnight halt should be between 0 and 24 hours." };
  }

  const pureDrivingMinutes = (distanceKm / averageSpeedKmh) * 60;
  const drivingMinutes = pureDrivingMinutes * (1 + trafficBufferPct / 100);
  const drivingHours = drivingMinutes / 60;

  const intervalMinutes = breakIntervalHours * 60;
  const rawBreaks = Math.max(0, Math.ceil(drivingMinutes / intervalMinutes) - 1);
  const fuelStops = fuelRangeKm > 0 ? Math.max(0, Math.ceil(distanceKm / fuelRangeKm) - 1) : 0;
  const mealCount = Math.trunc(mealStops);
  const restBreaks = combineStops
    ? Math.max(0, rawBreaks - fuelStops - mealCount)
    : rawBreaks;

  const restMinutesTotal = restBreaks * breakMinutes;
  const fuelMinutesTotal = fuelStops * fuelMinutes;
  const mealMinutesTotal = mealCount * mealMinutes;
  const stopMinutes = restMinutesTotal + fuelMinutesTotal + mealMinutesTotal;

  const days = Math.max(1, Math.ceil(drivingHours / maxDailyDrivingHours));
  const overnightMinutes = (days - 1) * overnightHours * 60;
  const totalMinutes = drivingMinutes + stopMinutes + overnightMinutes;

  const arrival = stampAt(startDate, startMinutes, totalMinutes);
  const arrivalNoStops = stampAt(startDate, startMinutes, drivingMinutes);

  // Build the running order: a stop every `breakIntervalHours` of driving, with the
  // clock advanced by the stops taken so far.
  const timeline = [];
  const stopEvery = intervalMinutes;
  let drivenSoFar = 0;
  let elapsed = 0;
  let stopIndex = 0;
  let dayDriven = 0;
  const maxDailyMinutes = maxDailyDrivingHours * 60;
  // Total time off the road is spread evenly across the planned stop points, so
  // the last timeline entry lands on the same arrival the totals give.
  const perStopMinutes = rawBreaks > 0 ? stopMinutes / rawBreaks : 0;

  timeline.push({
    kind: "start",
    label: "Set off",
    atKm: 0,
    ...stampAt(startDate, startMinutes, 0),
  });

  while (drivenSoFar + stopEvery < drivingMinutes - 1 && stopIndex < 60) {
    const segment = Math.min(stopEvery, drivingMinutes - drivenSoFar);
    drivenSoFar += segment;
    elapsed += segment;
    dayDriven += segment;
    stopIndex += 1;

    const needsOvernight = dayDriven >= maxDailyMinutes && drivenSoFar < drivingMinutes;
    const pauseMinutes = perStopMinutes + (needsOvernight ? overnightHours * 60 : 0);
    timeline.push({
      kind: needsOvernight ? "overnight" : "break",
      label: needsOvernight
        ? `Overnight halt after ${formatDuration(dayDriven)} of driving`
        : `Stop ${stopIndex} — ${formatDuration(Math.round(perStopMinutes))} off the road`,
      atKm: Math.round((drivenSoFar / drivingMinutes) * distanceKm),
      ...stampAt(startDate, startMinutes, elapsed),
    });
    elapsed += pauseMinutes;
    if (needsOvernight) dayDriven = 0;
  }

  timeline.push({
    kind: "arrive",
    label: "Arrive",
    atKm: Math.round(distanceKm),
    ...arrival,
  });

  return {
    distanceKm,
    pureDrivingMinutes: Math.round(pureDrivingMinutes),
    drivingMinutes: Math.round(drivingMinutes),
    drivingHours: Math.round(drivingHours * 100) / 100,
    restBreaks,
    restMinutesTotal,
    fuelStops,
    fuelMinutesTotal,
    mealStops: mealCount,
    mealMinutesTotal,
    totalStops: restBreaks + fuelStops + mealCount,
    stopMinutes,
    days,
    overnightMinutes,
    totalMinutes: Math.round(totalMinutes),
    averageOverallSpeed: Math.round((distanceKm / (totalMinutes / 60)) * 10) / 10,
    arrival,
    arrivalNoStops,
    timeline,
    overDailyLimit: drivingHours > maxDailyDrivingHours,
  };
}

/** Swap in the commercial-driver rule set from the Motor Transport Workers Act. */
export function commercialDefaults() {
  return {
    breakIntervalHours: COMMERCIAL_BREAK_INTERVAL_HOURS,
    breakMinutes: COMMERCIAL_BREAK_MINUTES,
    maxDailyDrivingHours: COMMERCIAL_MAX_DAILY_HOURS,
  };
}
