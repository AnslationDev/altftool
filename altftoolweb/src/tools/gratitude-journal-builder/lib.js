/**
 * Gratitude journal builder.
 *
 * The format follows the "three good things" exercise used in positive
 * psychology research: each night write down three things that went well and,
 * for each one, why it happened (Seligman, Steen, Park & Peterson, American
 * Psychologist, 2005). The related gratitude-list work of Emmons & McCullough
 * (Journal of Personality and Social Psychology, 2003) used weekly or daily
 * lists of things to be grateful for.
 *
 * Practical points those studies support and that this module encodes:
 *   - Three items per entry is the standard dose.
 *   - The "why" line is part of the exercise, not decoration.
 *   - Consistency over a week or more is what the effects were measured on,
 *     which is why streaks are tracked.
 *
 * All date maths takes dates as ISO YYYY-MM-DD arguments so the module stays
 * pure - nothing here reads the clock.
 */

export const ITEMS_PER_ENTRY = 3;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Rotating prompts so the practice does not collapse into the same three answers. */
export const GRATITUDE_PROMPTS = [
  { theme: "People", text: "Who made your day easier today, and what exactly did they do?" },
  { theme: "Small things", text: "What small, ordinary thing did you genuinely enjoy today?" },
  { theme: "Yourself", text: "What did you handle today that a younger you would have struggled with?" },
  { theme: "Progress", text: "What moved forward today, however slightly?" },
  { theme: "Place", text: "What about where you are right now is worth noticing?" },
  { theme: "Difficulty", text: "What went less badly than it could have, and why?" },
  { theme: "Body", text: "What did your body let you do today without you having to think about it?" },
  { theme: "Learning", text: "What did you find out today that you did not know yesterday?" },
  { theme: "Given", text: "What do you have today that you once had to wait or work for?" },
  { theme: "Connection", text: "Which conversation today would you be sorry to have missed?" },
  { theme: "Work", text: "What part of your work today would you still choose to do unpaid?" },
  { theme: "Rest", text: "Where did you get a moment of quiet today, even a short one?" },
];

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** ISO YYYY-MM-DD -> UTC milliseconds, or null when the string is not a real date. */
export function isoToUtcMs(iso) {
  if (typeof iso !== "string") return null;
  const match = iso.trim().match(ISO_PATTERN);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  // Rejects 2026-02-30 and similar roll-overs.
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Whole days from isoA to isoB (positive when B is later). null on bad input. */
export function daysBetween(isoA, isoB) {
  const a = isoToUtcMs(isoA);
  const b = isoToUtcMs(isoB);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Days elapsed since 1970-01-01, used to rotate the prompt deterministically. */
export function dayNumber(iso) {
  const ms = isoToUtcMs(iso);
  if (ms === null) return null;
  return Math.floor(ms / MS_PER_DAY);
}

/** The prompt for a given day. Same date always gives the same prompt. */
export function promptForDate(iso) {
  const day = dayNumber(iso);
  if (day === null) return { error: "Enter the date as YYYY-MM-DD." };
  const index = ((day % GRATITUDE_PROMPTS.length) + GRATITUDE_PROMPTS.length) % GRATITUDE_PROMPTS.length;
  return { index, ...GRATITUDE_PROMPTS[index] };
}

/**
 * Validate one journal entry before it is saved.
 *
 * @param {object} input
 * @param {string} input.date  ISO YYYY-MM-DD
 * @param {string[]} input.items three "good things"
 * @param {string[]} [input.whys] optional reason for each item
 * @param {string[]} [input.existingDates] dates already in the journal
 */
export function buildEntry({ date, items = [], whys = [], existingDates = [] } = {}) {
  if (isoToUtcMs(date) === null) {
    return { error: "Pick a valid date before saving the entry." };
  }
  if (!Array.isArray(items)) {
    return { error: "Write three good things before saving." };
  }
  const cleaned = items.slice(0, ITEMS_PER_ENTRY).map((item) => String(item == null ? "" : item).trim());
  const filled = cleaned.filter((item) => item.length > 0);
  if (filled.length < ITEMS_PER_ENTRY) {
    const missing = ITEMS_PER_ENTRY - filled.length;
    return {
      error: `Write all ${ITEMS_PER_ENTRY} good things - ${missing} ${missing === 1 ? "is" : "are"} still empty.`,
    };
  }
  if (Array.isArray(existingDates) && existingDates.includes(date)) {
    return { error: `There is already an entry for ${date}. Delete it first if you want to rewrite it.` };
  }

  const prompt = promptForDate(date);
  const cleanedWhys = cleaned.map((_, index) =>
    String(whys[index] == null ? "" : whys[index]).trim(),
  );

  return {
    date,
    theme: prompt.theme,
    promptText: prompt.text,
    items: cleaned,
    whys: cleanedWhys,
    whyCount: cleanedWhys.filter((why) => why.length > 0).length,
    wordCount: cleaned
      .concat(cleanedWhys)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length,
  };
}

/**
 * Current and longest streak from a list of entry dates.
 *
 * @param {string[]} dates   ISO YYYY-MM-DD strings, any order
 * @param {string} todayIso  the date to measure "current" against
 */
export function computeStreaks(dates, todayIso) {
  if (!Array.isArray(dates)) return { error: "Pass the entry dates as a list." };
  if (isoToUtcMs(todayIso) === null) return { error: "Enter today's date as YYYY-MM-DD." };

  const unique = [...new Set(dates.filter((date) => isoToUtcMs(date) !== null))].sort();
  if (unique.length === 0) {
    return {
      total: 0,
      current: 0,
      longest: 0,
      lastEntry: null,
      wroteToday: false,
      daysSinceLast: null,
      streakAtRisk: false,
    };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (daysBetween(unique[i - 1], unique[i]) === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  const lastEntry = unique[unique.length - 1];
  const gap = daysBetween(lastEntry, todayIso);
  let current = 0;
  // A streak is alive if the last entry was today or yesterday.
  if (gap !== null && gap >= 0 && gap <= 1) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      if (daysBetween(unique[i - 1], unique[i]) === 1) current += 1;
      else break;
    }
  }

  return {
    total: unique.length,
    current,
    longest,
    lastEntry,
    wroteToday: gap === 0,
    daysSinceLast: gap,
    // Wrote yesterday but not yet today: one more day and the streak breaks.
    streakAtRisk: gap === 1 && current > 0,
    dates: unique,
  };
}

/** Number of days in a YYYY-MM month. */
export function daysInMonth(yearMonth) {
  if (typeof yearMonth !== "string" || !/^\d{4}-\d{2}$/.test(yearMonth.trim())) return null;
  const [year, month] = yearMonth.trim().split("-").map(Number);
  if (month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Monthly review of the journal.
 *
 * @param {Array<{date: string, theme: string, items: string[], whys?: string[]}>} entries
 * @param {string} yearMonth "YYYY-MM"
 */
export function monthlyReview(entries, yearMonth) {
  const days = daysInMonth(yearMonth);
  if (days === null) return { error: "Pick a month in YYYY-MM form." };
  if (!Array.isArray(entries)) return { error: "Pass the entries as a list." };

  const inMonth = entries.filter(
    (entry) => entry && typeof entry.date === "string" && entry.date.startsWith(`${yearMonth}-`),
  );
  const themeCounts = {};
  let itemCount = 0;
  let whyCount = 0;
  inMonth.forEach((entry) => {
    const theme = entry.theme || "Unlabelled";
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    itemCount += (entry.items || []).filter((item) => String(item).trim().length > 0).length;
    whyCount += (entry.whys || []).filter((why) => String(why).trim().length > 0).length;
  });

  const themes = Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme));

  const monthDates = inMonth.map((entry) => entry.date);
  const streaksInMonth = computeStreaks(monthDates, `${yearMonth}-${String(days).padStart(2, "0")}`);

  return {
    yearMonth,
    days,
    entries: inMonth.length,
    completionPercent: days > 0 ? Math.round((inMonth.length / days) * 100) : 0,
    itemCount,
    whyCount,
    whyRate: itemCount > 0 ? Math.round((whyCount / itemCount) * 100) : 0,
    themes,
    topTheme: themes.length > 0 ? themes[0].theme : null,
    longestStreakInMonth: streaksInMonth.error ? 0 : streaksInMonth.longest,
  };
}
