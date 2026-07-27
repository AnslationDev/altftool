/**
 * Marksheet analysis — pure percentage and dispersion maths.
 *
 * Percentages follow the standard marksheet rule: subject % = obtained ÷
 * maximum × 100, and overall % = total obtained ÷ total maximum × 100
 * (mark-weighted, NOT the average of subject percentages — the two differ
 * whenever subjects carry different maximum marks).
 *
 * Division bands follow the long-standing Indian board/university
 * convention (also used by CBSE-affiliated schools):
 *   >= 75%  distinction, >= 60% first division, >= 50% second division,
 *   >= 33%  pass (33 is the common board pass mark), below 33% fail.
 */

export const BANDS = [
  { id: "distinction", label: "Distinction", min: 75 },
  { id: "first", label: "First division", min: 60 },
  { id: "second", label: "Second division", min: 50 },
  { id: "pass", label: "Pass", min: 33 },
  { id: "below-pass", label: "Below pass mark", min: 0 },
];

/** Band for a percentage (assumes 0-100 input). */
export function bandFor(percent) {
  return BANDS.find((band) => percent >= band.min) ?? BANDS[BANDS.length - 1];
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Analyse a set of subject marks.
 *
 * @param {object} input
 * @param {Array<{name:string, obtained:number, max:number}>} input.subjects
 * @returns {object} analysis or { error }
 */
export function analyzeMarks({ subjects }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }

  let totalObtained = 0;
  let totalMax = 0;
  const perSubject = [];

  for (const subject of subjects) {
    const name = String(subject?.name ?? "").trim();
    const obtained = Number(subject?.obtained);
    const max = Number(subject?.max);

    if (name === "") return { error: "Every subject needs a name." };
    if (!Number.isFinite(max) || max <= 0) {
      return { error: `"${name}" needs maximum marks greater than zero.` };
    }
    if (!Number.isFinite(obtained) || obtained < 0) {
      return { error: `"${name}" needs obtained marks of zero or more.` };
    }
    if (obtained > max) {
      return { error: `"${name}": obtained marks cannot exceed the maximum (${max}).` };
    }

    const percent = (obtained / max) * 100;
    perSubject.push({
      name,
      obtained,
      max,
      percent: round1(percent),
      band: bandFor(percent).label,
    });
    totalObtained += obtained;
    totalMax += max;
  }

  const overallPercent = (totalObtained / totalMax) * 100;

  // Mean and population standard deviation of subject percentages —
  // dispersion shows whether performance is even or lopsided.
  const mean =
    perSubject.reduce((sum, s) => sum + s.percent, 0) / perSubject.length;
  const variance =
    perSubject.reduce((sum, s) => sum + (s.percent - mean) ** 2, 0) / perSubject.length;
  const stdDev = Math.sqrt(variance);

  let strongest = perSubject[0];
  let weakest = perSubject[0];
  for (const s of perSubject) {
    if (s.percent > strongest.percent) strongest = s;
    if (s.percent < weakest.percent) weakest = s;
  }

  return {
    subjects: perSubject,
    totalObtained,
    totalMax,
    overallPercent: round1(overallPercent),
    overallBand: bandFor(overallPercent).label,
    meanPercent: round1(mean),
    stdDevPercent: round1(stdDev),
    strongest: { name: strongest.name, percent: strongest.percent },
    weakest: { name: weakest.name, percent: weakest.percent },
    spreadIsWide: stdDev > 15, // > 15 pt spread flags seriously uneven subjects
  };
}
