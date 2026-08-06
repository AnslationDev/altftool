/**
 * Daily hair shedding log and comparison against typical ranges.
 *
 * Reference figures:
 *  - Shedding roughly 50 to 100 hairs a day is normal for an adult scalp
 *    (American Academy of Dermatology). Scalps carry on the order of 100,000
 *    hairs, so 100 a day is about 0.1% of the head.
 *  - Shedding is not evenly spread across days. Hairs that have already
 *    detached stay caught in the hair until they are dislodged, so a wash after
 *    several dry days collects the shed from all of them. The meaningful figure
 *    is therefore the AVERAGE over the whole logged period, not a wash-day peak.
 *  - Telogen effluvium — diffuse shedding after a trigger such as illness with
 *    fever, surgery, childbirth, a crash diet or severe stress — typically
 *    begins about 2 to 3 months after the trigger and usually settles within
 *    about 6 months once the trigger has gone.
 *  - Sustained shedding above roughly 100 a day, a widening parting, or patchy
 *    loss are reasons to see a doctor or dermatologist rather than to keep
 *    counting.
 */

/** Lower and upper bound of the normal daily shedding range. */
export const NORMAL_DAILY_MIN = 50;
export const NORMAL_DAILY_MAX = 100;

/** Above this daily average, prompt a medical review rather than more logging. */
export const HIGH_DAILY_THRESHOLD = 150;

/** Telogen effluvium usually starts 2-3 months after its trigger. */
export const TELOGEN_LAG_MIN_DAYS = 60;
export const TELOGEN_LAG_MAX_DAYS = 90;

/** Telogen effluvium usually settles within about 6 months of the trigger. */
export const TELOGEN_SETTLE_DAYS = 180;

/** Window used for the rolling average and the trend comparison. */
export const ROLLING_WINDOW_DAYS = 7;

/** Highest plausible single-day count this log will accept. */
export const MAX_DAILY_COUNT = 2000;

export const MS_PER_DAY = 86400000;

/** Parse "YYYY-MM-DD" to epoch milliseconds at local midnight, or null. */
export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const [, y, mo, d] = match.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date.getTime();
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function formatDate(ms) {
  if (!Number.isFinite(ms)) return "—";
  return DATE_FORMAT.format(new Date(ms));
}

export function addDays(ms, days) {
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return NaN;
  return ms + days * MS_PER_DAY;
}

/** Band for a daily average shed count. */
export function sheddingBand(dailyAverage) {
  if (!Number.isFinite(dailyAverage)) return { label: "Unknown", tone: "neutral", note: "" };
  if (dailyAverage < NORMAL_DAILY_MIN) {
    return {
      label: "Below the typical range",
      tone: "success",
      note: "Under 50 a day on average. Low counts are not a problem in themselves, though they can also mean some shed hairs are being missed.",
    };
  }
  if (dailyAverage <= NORMAL_DAILY_MAX) {
    return {
      label: "Within the typical range",
      tone: "success",
      note: "Between 50 and 100 a day is the normal range for an adult scalp.",
    };
  }
  if (dailyAverage <= HIGH_DAILY_THRESHOLD) {
    return {
      label: "Above the typical range",
      tone: "warn",
      note: "Above 100 a day on average. Keep logging for a few more weeks — short logs and irregular washing both inflate this figure.",
    };
  }
  return {
    label: "Well above the typical range",
    tone: "danger",
    note: "Above 150 a day on average. Sustained shedding at this level is worth a medical opinion rather than more counting.",
  };
}

function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Analyse a shedding log.
 *
 * @param {object} input
 * @param {Array<{date:string,count:number,washDay:boolean}>} input.entries
 * @param {string} [input.triggerDate] Optional "YYYY-MM-DD" date of an illness,
 *        surgery, childbirth, crash diet or major stressor.
 * @returns {object|{error:string}}
 */
export function analyseShedding(input) {
  const { entries, triggerDate } = input || {};

  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Log at least one day to see an average." };
  }

  const parsed = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] || {};
    const ms = parseDate(entry.date);
    if (ms === null) return { error: `Day ${index + 1} needs a valid date.` };

    const count = Number(entry.count);
    if (!Number.isFinite(count)) return { error: `Day ${index + 1} needs a hair count.` };
    if (count < 0) return { error: "A hair count cannot be negative." };
    if (count > MAX_DAILY_COUNT) return { error: `Counts above ${MAX_DAILY_COUNT} in a day are not plausible — check the entry.` };

    parsed.push({ ms, count, washDay: Boolean(entry.washDay) });
  }

  const sorted = [...parsed].sort((a, b) => a.ms - b.ms);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].ms === sorted[index - 1].ms) {
      return { error: "Two entries share the same date — log one entry per day." };
    }
  }

  const counts = sorted.map((entry) => entry.count);
  const totalHairs = counts.reduce((sum, value) => sum + value, 0);
  const daysLogged = sorted.length;
  // Calendar days covered, first and last day inclusive.
  const spanDays = Math.round((sorted[daysLogged - 1].ms - sorted[0].ms) / MS_PER_DAY) + 1;
  // Headline rate. Dividing by calendar days rather than by entries is what
  // makes a wash-only log comparable to the 50-100 a day range: hairs shed on
  // the uncounted days between washes are already in the wash-day total.
  const dailyAverage = totalHairs / spanDays;
  const averagePerLoggedDay = totalHairs / daysLogged;
  const missingDays = spanDays - daysLogged;

  const washDays = sorted.filter((entry) => entry.washDay);
  const nonWashDays = sorted.filter((entry) => !entry.washDay);

  const rolling = sorted.map((entry, index) => {
    const start = Math.max(0, index - (ROLLING_WINDOW_DAYS - 1));
    const window = counts.slice(start, index + 1);
    return { ms: entry.ms, average: mean(window), windowSize: window.length };
  });

  // Calendar-day-normalised rate per entry, so an infrequent wash day's
  // accumulated count is spread over the days it actually represents
  // instead of being compared raw against a per-day threshold (which would
  // make normal, infrequent washing look like a shedding problem). The
  // first entry has no prior log to measure a gap from, so it borrows the
  // gap to the next entry when one exists.
  const rated = sorted.map((entry, index) => {
    let effectiveDays;
    if (sorted.length === 1) {
      effectiveDays = 1;
    } else if (index === 0) {
      effectiveDays = Math.max(1, Math.round((sorted[1].ms - sorted[0].ms) / MS_PER_DAY));
    } else {
      effectiveDays = Math.max(1, Math.round((sorted[index].ms - sorted[index - 1].ms) / MS_PER_DAY));
    }
    return { ...entry, effectiveDays, dailyRate: entry.count / effectiveDays };
  });

  let trend = null;
  if (daysLogged >= ROLLING_WINDOW_DAYS * 2) {
    const recent = counts.slice(-ROLLING_WINDOW_DAYS);
    const prior = counts.slice(-ROLLING_WINDOW_DAYS * 2, -ROLLING_WINDOW_DAYS);
    const recentAverage = mean(recent);
    const priorAverage = mean(prior);
    trend = {
      recentAverage,
      priorAverage,
      changePct: priorAverage > 0 ? ((recentAverage - priorAverage) / priorAverage) * 100 : null,
      direction: recentAverage > priorAverage ? "up" : recentAverage < priorAverage ? "down" : "flat",
    };
  }

  let telogen = null;
  if (triggerDate) {
    const triggerMs = parseDate(triggerDate);
    if (triggerMs === null) return { error: "Enter the trigger date as a valid date, or leave it blank." };
    telogen = {
      triggerMs,
      windowStartMs: addDays(triggerMs, TELOGEN_LAG_MIN_DAYS),
      windowEndMs: addDays(triggerMs, TELOGEN_LAG_MAX_DAYS),
      settleByMs: addDays(triggerMs, TELOGEN_SETTLE_DAYS),
    };
  }

  const peak = sorted.reduce((best, entry) => (entry.count > best.count ? entry : best), sorted[0]);
  const lowest = sorted.reduce((best, entry) => (entry.count < best.count ? entry : best), sorted[0]);

  return {
    daysLogged,
    spanDays,
    missingDays,
    firstDateMs: sorted[0].ms,
    lastDateMs: sorted[daysLogged - 1].ms,
    totalHairs,
    dailyAverage,
    averagePerLoggedDay,
    band: sheddingBand(dailyAverage),
    washDayCount: washDays.length,
    washDayAverage: mean(washDays.map((entry) => entry.count)),
    nonWashDayAverage: mean(nonWashDays.map((entry) => entry.count)),
    daysAboveNormal: rated.filter((entry) => entry.dailyRate > NORMAL_DAILY_MAX).length,
    peak: { ms: peak.ms, count: peak.count, washDay: peak.washDay },
    lowest: { ms: lowest.ms, count: lowest.count, washDay: lowest.washDay },
    rolling,
    trend,
    telogen,
    entries: rated,
  };
}
