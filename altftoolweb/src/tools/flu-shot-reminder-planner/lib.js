/**
 * Annual influenza vaccination window planner.
 *
 * The rules encoded here come from the standing public-health guidance:
 *
 *  - Northern hemisphere: influenza circulates roughly October to May with a peak
 *    between December and February. CDC/ACIP advise vaccinating in September or
 *    October, ideally by the end of October, and continuing to offer vaccination
 *    throughout the season while viruses circulate.
 *  - Southern hemisphere: the season runs roughly April to September, peaking
 *    June-August, so the vaccination window is April-May, before the end of May.
 *  - Tropics: influenza circulates year-round with local peaks, so timing is driven
 *    by the last dose being more than a year old and by upcoming travel.
 *  - Protective antibody takes about 14 days to develop after the injection.
 *  - Children aged 6 months through 8 years being vaccinated against influenza for
 *    the first time need 2 doses at least 4 weeks (28 days) apart.
 *  - Vaccination is repeated every season because the strains are reformulated and
 *    antibody titres wane over the year.
 *
 * All maths is pure and calendar-based on ISO date strings in UTC — no clock is read
 * inside this module; "today" is always an argument.
 *
 * Informational scheduling only. Eligibility, contraindications and which product to
 * use are decisions for a doctor, pharmacist or nurse.
 */

/** Days from injection to protective antibody levels. */
export const PROTECTION_LEAD_DAYS = 14;

/** Minimum interval between the two priming doses for a first-time child under 9. */
export const CHILD_SECOND_DOSE_MIN_DAYS = 28;

/** How far before the ideal window the season's vaccine is usually available. */
export const VACCINE_AVAILABLE_LEAD_DAYS = 62;

export const HEMISPHERES = ["northern", "southern", "tropical"];

export const HEMISPHERE_LABELS = {
  northern: "Northern hemisphere",
  southern: "Southern hemisphere",
  tropical: "Tropical / equatorial",
};

const MS_PER_DAY = 86400000;

/** "YYYY-MM-DD" -> UTC timestamp in ms, or null when unparseable. */
export function parseISODate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** UTC timestamp -> "YYYY-MM-DD". */
export function toISODate(ms) {
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(ms, days) {
  return ms + days * MS_PER_DAY;
}

export function diffDays(fromMs, toMs) {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

function utc(year, monthIndex, day) {
  return Date.UTC(year, monthIndex, day);
}

/**
 * Work out which influenza season a date belongs to, and that season's key dates.
 * @param {string} hemisphere
 * @param {number} todayMs
 */
export function seasonForDate(hemisphere, todayMs) {
  const date = new Date(todayMs);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0 = January

  if (hemisphere === "southern") {
    // Season sits inside one calendar year: April to September.
    // From October onwards the next relevant season is the following year's.
    const seasonYear = month <= 8 ? year : year + 1;
    return {
      label: `${seasonYear} southern hemisphere season`,
      seasonYear,
      windowStartMs: utc(seasonYear, 3, 1), // 1 April
      windowEndMs: utc(seasonYear, 4, 31), // 31 May
      seasonStartMs: utc(seasonYear, 3, 1), // 1 April
      seasonEndMs: utc(seasonYear, 8, 30), // 30 September
      peakLabel: "June to August",
      deadlineLabel: "end of May",
    };
  }

  if (hemisphere === "tropical") {
    // Year-round circulation: the "window" is the next 12 months from today.
    return {
      label: "Year-round circulation",
      seasonYear: year,
      windowStartMs: todayMs,
      windowEndMs: addDays(todayMs, 365),
      seasonStartMs: todayMs,
      seasonEndMs: addDays(todayMs, 365),
      peakLabel: "local rainy-season peaks",
      deadlineLabel: "12 months after your last dose",
    };
  }

  // Northern hemisphere: season spans two calendar years, October to May.
  // June onwards belongs to the season that starts that autumn.
  const seasonYear = month >= 5 ? year : year - 1;
  return {
    label: `${seasonYear}-${String(seasonYear + 1).slice(-2)} northern hemisphere season`,
    seasonYear,
    windowStartMs: utc(seasonYear, 8, 1), // 1 September
    windowEndMs: utc(seasonYear, 9, 31), // 31 October
    seasonStartMs: utc(seasonYear, 9, 1), // 1 October
    seasonEndMs: utc(seasonYear + 1, 4, 31), // 31 May
    peakLabel: "December to February",
    deadlineLabel: "end of October",
  };
}

/**
 * @param {object} input
 * @param {string} input.hemisphere    "northern" | "southern" | "tropical"
 * @param {string} input.todayISO      Reference date, "YYYY-MM-DD".
 * @param {string} [input.lastDoseISO] Date of the previous flu vaccination.
 * @param {string} [input.travelISO]   Date of upcoming travel you want cover for.
 * @param {boolean} [input.firstTimeChild] True for a 6-month to 8-year-old never vaccinated against flu.
 * @returns {object} plan, or { error }
 */
export function planFluShot({
  hemisphere = "northern",
  todayISO,
  lastDoseISO = "",
  travelISO = "",
  firstTimeChild = false,
} = {}) {
  if (!HEMISPHERES.includes(hemisphere)) {
    return { error: "Choose northern, southern or tropical." };
  }
  const todayMs = parseISODate(todayISO);
  if (todayMs === null) return { error: "Enter today's date as a valid calendar date." };

  let lastDoseMs = null;
  if (lastDoseISO) {
    lastDoseMs = parseISODate(lastDoseISO);
    if (lastDoseMs === null) return { error: "The last dose date is not a valid calendar date." };
    if (lastDoseMs > todayMs) return { error: "The last dose date cannot be in the future." };
  }

  let travelMs = null;
  if (travelISO) {
    travelMs = parseISODate(travelISO);
    if (travelMs === null) return { error: "The travel date is not a valid calendar date." };
    if (travelMs < todayMs) return { error: "The travel date has already passed." };
  }

  const season = seasonForDate(hemisphere, todayMs);
  const availableFromMs = addDays(season.windowStartMs, -VACCINE_AVAILABLE_LEAD_DAYS);

  let status;
  if (todayMs < season.windowStartMs) status = "before-window";
  else if (todayMs <= season.windowEndMs) status = "in-window";
  else if (todayMs <= season.seasonEndMs) status = "late-but-worthwhile";
  else status = "between-seasons";

  let recommendedMs =
    status === "before-window" ? season.windowStartMs : todayMs;

  // Travel pulls the date earlier so protection is in place before departure.
  let latestForTravelMs = null;
  let travelTooSoon = false;
  if (travelMs !== null) {
    latestForTravelMs = addDays(travelMs, -PROTECTION_LEAD_DAYS);
    if (latestForTravelMs < todayMs) {
      travelTooSoon = true;
      recommendedMs = todayMs;
    } else if (recommendedMs > latestForTravelMs) {
      recommendedMs = latestForTravelMs;
    }
  }

  const protectedFromMs = addDays(recommendedMs, PROTECTION_LEAD_DAYS);
  const secondDoseMs = firstTimeChild ? addDays(recommendedMs, CHILD_SECOND_DOSE_MIN_DAYS) : null;
  const fullyProtectedMs =
    secondDoseMs === null ? protectedFromMs : addDays(secondDoseMs, PROTECTION_LEAD_DAYS);

  const daysSinceLastDose = lastDoseMs === null ? null : diffDays(lastDoseMs, todayMs);
  // In a seasonal hemisphere a dose counts once this season's vaccine is out; in the
  // tropics there is no season boundary, so the annual 365-day rule is used instead.
  const coveredThisSeason =
    lastDoseMs === null
      ? false
      : hemisphere === "tropical"
        ? daysSinceLastDose < 365
        : lastDoseMs >= availableFromMs;

  return {
    hemisphere,
    hemisphereLabel: HEMISPHERE_LABELS[hemisphere],
    seasonLabel: season.label,
    seasonYear: season.seasonYear,
    peakLabel: season.peakLabel,
    deadlineLabel: season.deadlineLabel,
    status,
    todayISO: toISODate(todayMs),
    windowStartISO: toISODate(season.windowStartMs),
    windowEndISO: toISODate(season.windowEndMs),
    seasonStartISO: toISODate(season.seasonStartMs),
    seasonEndISO: toISODate(season.seasonEndMs),
    availableFromISO: toISODate(availableFromMs),
    recommendedISO: toISODate(recommendedMs),
    protectedFromISO: toISODate(protectedFromMs),
    secondDoseISO: secondDoseMs === null ? null : toISODate(secondDoseMs),
    fullyProtectedISO: toISODate(fullyProtectedMs),
    daysUntilRecommended: diffDays(todayMs, recommendedMs),
    daysUntilWindowOpens:
      status === "before-window" ? diffDays(todayMs, season.windowStartMs) : 0,
    daysLeftInWindow:
      status === "in-window" ? diffDays(todayMs, season.windowEndMs) : 0,
    daysLeftInSeason: Math.max(0, diffDays(todayMs, season.seasonEndMs)),
    travelISO: travelMs === null ? null : toISODate(travelMs),
    latestForTravelISO: latestForTravelMs === null ? null : toISODate(latestForTravelMs),
    travelTooSoon,
    protectedBeforeTravel: travelMs === null ? null : protectedFromMs <= travelMs,
    lastDoseISO: lastDoseMs === null ? null : toISODate(lastDoseMs),
    daysSinceLastDose,
    coveredThisSeason,
    dueAgain: lastDoseMs === null ? true : !coveredThisSeason,
    firstTimeChild: Boolean(firstTimeChild),
  };
}
