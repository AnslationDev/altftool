/**
 * Upload Consistency Score — pure gap, dispersion and scoring maths.
 * No React, no DOM. Dates come in as arguments; nothing here reads the clock.
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Weights of the consistency index. They sum to 1 and are shown in the UI so
 * the score can be reproduced by hand.
 *  - adherence: share of gaps that land inside the target cadence tolerance
 *  - regularity: 1 - coefficient of variation, i.e. how even the gaps are
 *  - pace: how close the average gap is to the target (capped at 1)
 */
export const SCORE_WEIGHTS = { adherence: 0.5, regularity: 0.3, pace: 0.2 };

export const SCORE_BANDS = [
  { min: 85, label: "Metronomic", note: "Gaps are even and on schedule." },
  { min: 70, label: "Consistent", note: "Mostly on schedule with a few stretched gaps." },
  { min: 50, label: "Uneven", note: "The schedule slips often enough for the audience to notice." },
  { min: 0, label: "Sporadic", note: "There is no predictable cadence to follow." },
];

/** A gap more than this multiple of the target counts as a momentum-breaking silence. */
export const SILENCE_MULTIPLE = 2.5;

/**
 * Parse ISO-like date strings (YYYY-MM-DD) into UTC day numbers.
 * Anything unparseable is reported instead of silently dropped.
 */
export function parseUploadDates(input) {
  const raw = Array.isArray(input) ? input : String(input ?? "").split(/[\n,;]+/);
  const valid = [];
  const invalid = [];
  raw.forEach((entry) => {
    const text = String(entry).trim();
    if (!text) return;
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      invalid.push(text);
      return;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const stamp = Date.UTC(year, month - 1, day);
    const check = new Date(stamp);
    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day
    ) {
      invalid.push(text);
      return;
    }
    valid.push({ text, stamp });
  });
  const seen = new Set();
  const unique = [];
  valid
    .sort((a, b) => a.stamp - b.stamp)
    .forEach((entry) => {
      if (seen.has(entry.stamp)) return;
      seen.add(entry.stamp);
      unique.push(entry);
    });
  return { dates: unique, invalid, duplicates: valid.length - unique.length };
}

/** Gaps in whole days between consecutive uploads. */
export function computeGaps(dates) {
  if (!Array.isArray(dates) || dates.length < 2) return [];
  const gaps = [];
  for (let i = 1; i < dates.length; i += 1) {
    gaps.push((dates[i].stamp - dates[i - 1].stamp) / MS_PER_DAY);
  }
  return gaps;
}

/** Mean, population standard deviation and coefficient of variation of a sample. */
export function describeGaps(gaps) {
  if (!Array.isArray(gaps) || gaps.length === 0) return { error: "At least two uploads are needed to measure a gap." };
  const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + (gap - mean) ** 2, 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  return {
    count: gaps.length,
    mean,
    variance,
    stdDev,
    cv: mean > 0 ? stdDev / mean : 0,
    shortest: Math.min(...gaps),
    longest: Math.max(...gaps),
  };
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The weighted consistency index, 0-100. */
export function computeConsistencyScore({ gaps, targetGapDays, toleranceDays }) {
  if (!Array.isArray(gaps) || gaps.length === 0) {
    return { error: "At least two uploads are needed to score consistency." };
  }
  const target = Number(targetGapDays);
  const tolerance = Number(toleranceDays);
  if (!(target > 0)) return { error: "Target gap must be greater than zero days." };
  if (!(tolerance >= 0)) return { error: "Tolerance cannot be negative." };

  const stats = describeGaps(gaps);
  if (stats.error) return { error: stats.error };

  const onSchedule = gaps.filter((gap) => Math.abs(gap - target) <= tolerance).length;
  const adherence = onSchedule / gaps.length;
  const regularity = clamp(1 - stats.cv, 0, 1);
  const pace = clamp(target / stats.mean, 0, 1);

  const score = Math.round(
    100 * (SCORE_WEIGHTS.adherence * adherence + SCORE_WEIGHTS.regularity * regularity + SCORE_WEIGHTS.pace * pace),
  );
  const band = SCORE_BANDS.find((entry) => score >= entry.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];

  return { score, band, adherence, regularity, pace, onSchedule, stats };
}

/** Every gap longer than the silence threshold, with the dates it sits between. */
export function findSilences({ dates, gaps, targetGapDays }) {
  const target = Number(targetGapDays);
  if (!Array.isArray(dates) || !Array.isArray(gaps)) return [];
  if (!(target > 0)) return [];
  const threshold = target * SILENCE_MULTIPLE;
  const out = [];
  gaps.forEach((gap, index) => {
    if (gap > threshold) {
      out.push({ from: dates[index].text, to: dates[index + 1].text, days: gap });
    }
  });
  return out;
}

/** One call that does the whole analysis from raw text. */
export function analyseUploads({ input, targetGapDays = 7, toleranceDays = 2 } = {}) {
  const parsed = parseUploadDates(input);
  if (parsed.dates.length === 0) {
    return { error: "Enter at least two upload dates in YYYY-MM-DD form, one per line." };
  }
  if (parsed.dates.length < 2) {
    return { error: "Two or more upload dates are needed before a gap can be measured." };
  }

  const gaps = computeGaps(parsed.dates);
  const scored = computeConsistencyScore({ gaps, targetGapDays, toleranceDays });
  if (scored.error) return { error: scored.error };

  const silences = findSilences({ dates: parsed.dates, gaps, targetGapDays });
  const spanDays = (parsed.dates[parsed.dates.length - 1].stamp - parsed.dates[0].stamp) / MS_PER_DAY;

  const notes = [];
  if (parsed.invalid.length > 0) {
    notes.push(`Ignored ${parsed.invalid.length} unreadable line(s): ${parsed.invalid.slice(0, 3).join(", ")}`);
  }
  if (parsed.duplicates > 0) notes.push(`${parsed.duplicates} duplicate date(s) merged.`);
  if (silences.length > 0) {
    notes.push(
      `${silences.length} silence(s) longer than ${(Number(targetGapDays) * SILENCE_MULTIPLE).toFixed(0)} days — the longest was ${scored.stats.longest} days.`,
    );
  }
  if (scored.pace < 1) {
    notes.push(
      `Average gap is ${scored.stats.mean.toFixed(1)} days against a ${Number(targetGapDays)}-day target, so the pace component is capped at ${(scored.pace * 100).toFixed(0)}%.`,
    );
  }

  return {
    dates: parsed.dates,
    gaps,
    spanDays,
    uploadsPerWeek: spanDays > 0 ? (parsed.dates.length - 1) / (spanDays / 7) : 0,
    silences,
    targetGapDays: Number(targetGapDays),
    toleranceDays: Number(toleranceDays),
    notes,
    ...scored,
  };
}
