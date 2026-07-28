/**
 * Luteal phase length from a confirmed ovulation date and the next period start.
 *
 * Counting rule used here (the standard fertility-charting convention):
 *   the luteal phase runs from the DAY AFTER ovulation up to and INCLUDING the
 *   day before the next period starts.
 * So with ovulation on cycle day 14 and the next period starting on cycle day
 * 29, the luteal phase covers cycle days 15-28 = 14 days, which matches the
 * textbook "about 14 days" figure.
 *
 * In date arithmetic that is:
 *   lutealDays = daysBetween(ovulation, nextPeriodStart) - 1
 *   follicularDays = daysBetween(previousPeriodStart, ovulation) + 1
 *   cycleLength = daysBetween(previousPeriodStart, nextPeriodStart)
 *                = follicularDays + lutealDays
 *
 * Some apps instead count ovulation day itself as the first luteal day, which
 * gives a figure one day longer; both are reported so the numbers can be
 * compared with whatever your chart uses.
 *
 * Everything is pure — dates come in as YYYY-MM-DD strings and are parsed as
 * UTC midnight so daylight saving never shifts a day count.
 */

/** Milliseconds in one day. */
export const MS_PER_DAY = 86400000;

/**
 * Luteal phase length bands.
 * A luteal phase of about 12-14 days is typical; 11-17 days is the range
 * usually described as normal. Under 10 days is commonly called a short luteal
 * phase in charting, and whether that alone reduces fertility is still debated
 * in the clinical literature. Seventeen days or more without a period is
 * uncommon and is one of the classic early signs of pregnancy.
 */
export const LUTEAL_BANDS = [
  {
    id: "very-short",
    label: "Short luteal phase",
    min: 0,
    max: 9,
    note: "Under 10 days is described as a short luteal phase. It is worth mentioning to a clinician if you are trying to conceive, especially if it repeats across cycles.",
  },
  {
    id: "borderline",
    label: "Borderline",
    min: 10,
    max: 11,
    note: "Ten to eleven days sits at the short end of the usual range. Many people conceive with a luteal phase this length; a repeated pattern is the thing to raise with a clinician.",
  },
  {
    id: "typical",
    label: "Typical",
    min: 12,
    max: 14,
    note: "Twelve to fourteen days is the most common luteal phase length and matches the textbook average of about 14 days.",
  },
  {
    id: "long-normal",
    label: "Long side of normal",
    min: 15,
    max: 16,
    note: "Fifteen to sixteen days is still inside the range usually described as normal.",
  },
  {
    id: "long",
    label: "Unusually long",
    min: 17,
    max: Infinity,
    note: "Seventeen days or more is uncommon. If a period has not arrived by 18 days past ovulation, a pregnancy test is the usual next step.",
  },
];

/** Number of days past ovulation after which a missed period usually prompts a test. */
export const PREGNANCY_TEST_DPO = 18;

export const LIMITS = {
  lutealDays: { min: 1, max: 40 },
  cycleDays: { min: 15, max: 90 },
  follicularDays: { min: 1, max: 80 },
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string into UTC-midnight milliseconds, or null. */
export function parseDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
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

/** Whole days from one UTC-midnight timestamp to another. */
export function daysBetween(startMs, endMs) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return NaN;
  return Math.round((endMs - startMs) / MS_PER_DAY);
}

/** Format a UTC-midnight timestamp back to YYYY-MM-DD. */
export function formatDate(ms) {
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

/** Add whole days to a UTC-midnight timestamp. */
export function addDays(ms, days) {
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return NaN;
  return ms + days * MS_PER_DAY;
}

/** The band a luteal phase length falls into. */
export function bandForLuteal(lutealDays) {
  if (!Number.isFinite(lutealDays)) return null;
  return (
    LUTEAL_BANDS.find((band) => lutealDays >= band.min && lutealDays <= band.max) || null
  );
}

/**
 * Compute luteal phase length and the surrounding cycle figures.
 *
 * @param {object} input
 * @param {string} input.ovulationDate       YYYY-MM-DD, the day ovulation was confirmed.
 * @param {string} input.nextPeriodDate      YYYY-MM-DD, day 1 of the period that followed.
 * @param {string} [input.previousPeriodDate] YYYY-MM-DD, day 1 of the period before ovulation.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computeLutealPhase({
  ovulationDate,
  nextPeriodDate,
  previousPeriodDate = "",
} = {}) {
  const ovulation = parseDate(ovulationDate);
  const nextPeriod = parseDate(nextPeriodDate);

  if (ovulation === null) return { error: "Enter a valid ovulation date." };
  if (nextPeriod === null) return { error: "Enter a valid date for the period that followed." };

  const gap = daysBetween(ovulation, nextPeriod);
  if (gap <= 0) {
    return { error: "The next period must start after the ovulation date." };
  }

  const lutealDays = gap - 1;
  if (lutealDays < LIMITS.lutealDays.min) {
    return {
      error: "A period starting the day after ovulation gives a luteal phase of zero days — check the dates.",
    };
  }
  if (lutealDays > LIMITS.lutealDays.max) {
    return {
      error: `That is ${lutealDays} days between ovulation and the period, which is longer than this tool models. Check the dates or take a pregnancy test if the period was very late.`,
    };
  }

  const band = bandForLuteal(lutealDays);

  let previousPeriod = null;
  let follicularDays = null;
  let cycleLength = null;
  let follicularShare = null;
  let lutealShare = null;

  if (previousPeriodDate) {
    previousPeriod = parseDate(previousPeriodDate);
    if (previousPeriod === null) {
      return { error: "Enter a valid date for the previous period, or leave it blank." };
    }
    if (previousPeriod >= ovulation) {
      return { error: "The previous period must start before the ovulation date." };
    }
    follicularDays = daysBetween(previousPeriod, ovulation) + 1;
    cycleLength = daysBetween(previousPeriod, nextPeriod);
    if (cycleLength < LIMITS.cycleDays.min || cycleLength > LIMITS.cycleDays.max) {
      return {
        error: `Those dates give a ${cycleLength}-day cycle, outside the ${LIMITS.cycleDays.min}-${LIMITS.cycleDays.max} day range this tool models.`,
      };
    }
    follicularShare = (follicularDays / cycleLength) * 100;
    lutealShare = (lutealDays / cycleLength) * 100;
  }

  return {
    lutealDays,
    lutealDaysInclusive: gap,
    daysBetweenOvulationAndPeriod: gap,
    bandId: band ? band.id : "",
    bandLabel: band ? band.label : "",
    bandNote: band ? band.note : "",
    follicularDays,
    cycleLength,
    follicularShare,
    lutealShare,
    ovulationDate: formatDate(ovulation),
    nextPeriodDate: formatDate(nextPeriod),
    previousPeriodDate: previousPeriod === null ? "" : formatDate(previousPeriod),
    testDate: formatDate(addDays(ovulation, PREGNANCY_TEST_DPO)),
  };
}

/**
 * Predict the next period start from an ovulation date and a known luteal
 * phase length, using the same counting rule.
 * @returns {string} YYYY-MM-DD, or "" when the inputs are unusable.
 */
export function predictNextPeriod({ ovulationDate, lutealDays } = {}) {
  const ovulation = parseDate(ovulationDate);
  if (ovulation === null) return "";
  if (!Number.isFinite(lutealDays)) return "";
  if (lutealDays < LIMITS.lutealDays.min || lutealDays > LIMITS.lutealDays.max) return "";
  return formatDate(addDays(ovulation, lutealDays + 1));
}
