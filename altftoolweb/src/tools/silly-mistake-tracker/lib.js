/**
 * Silly Mistake Tracker — analysis over user-logged avoidable errors across
 * mock tests.
 *
 * The categories are the standard error-log taxonomy used in test-prep
 * review ("error log" method): mistakes that are NOT knowledge gaps but
 * process failures, each with a different fix.
 *
 * Maths:
 *   mockTotal   = sum of category counts for that mock
 *   marksLost   = mockTotal × marksPerMistake (user-set, e.g. 4 for a
 *                 4-mark MCQ, or 5 to include a -1 negative mark)
 *   trend       = last mock total − first mock total (negative = improving)
 *   trendPercent= trend / first mock total × 100 (null when first total is 0)
 */

/** Standard silly-mistake categories from the error-log review method. */
export const MISTAKE_CATEGORIES = [
  { id: "misread", label: "Misread the question", fix: "Underline what is asked before solving." },
  { id: "calc", label: "Calculation slip", fix: "Re-check arithmetic on a second line, not in the head." },
  { id: "sign", label: "Sign / unit error", fix: "Carry signs and units through every step." },
  { id: "entry", label: "Wrong bubble / entry", fix: "Match question number to answer sheet every 5 questions." },
  { id: "instruction", label: "Ignored instruction", fix: "Read section instructions before starting the section." },
  { id: "rush", label: "Time-pressure guess", fix: "Flag and skip early; return with remaining time." },
];

/**
 * Analyse mistake counts across mocks.
 *
 * @param {object} input
 * @param {Array<{label?: string, counts: Object<string, number>}>} input.mocks
 *        Chronological list of mocks (first = oldest).
 * @param {number} [input.marksPerMistake] Marks lost per silly mistake
 *        (question marks plus any negative marking). Default 1.
 * @returns {object} per-mock totals, category totals, trend, or { error }.
 */
export function analyzeMistakes({ mocks, marksPerMistake = 1 }) {
  if (!Array.isArray(mocks) || mocks.length === 0) {
    return { error: "Add at least one mock test." };
  }

  const perMistake = Number(marksPerMistake);
  if (!Number.isFinite(perMistake) || perMistake < 0) {
    return { error: "Marks lost per mistake must be zero or a positive number." };
  }

  const categoryTotalMap = Object.fromEntries(
    MISTAKE_CATEGORIES.map((category) => [category.id, 0]),
  );
  const analysed = [];
  let grandTotal = 0;

  for (let i = 0; i < mocks.length; i += 1) {
    const raw = mocks[i] ?? {};
    const label =
      typeof raw.label === "string" && raw.label.trim() !== "" ? raw.label.trim() : `Mock ${i + 1}`;
    const counts = {};
    let total = 0;
    for (const category of MISTAKE_CATEGORIES) {
      const value =
        raw.counts?.[category.id] === undefined ||
        raw.counts?.[category.id] === null ||
        raw.counts?.[category.id] === ""
          ? 0
          : Number(raw.counts[category.id]);
      if (!Number.isFinite(value) || !Number.isInteger(value)) {
        return { error: `${label}: ${category.label} must be a whole number (0 is fine).` };
      }
      if (value < 0) {
        return { error: `${label}: ${category.label} cannot be negative.` };
      }
      if (value > 500) {
        return { error: `${label}: ${category.label} looks too large — max 500 per mock.` };
      }
      counts[category.id] = value;
      total += value;
      categoryTotalMap[category.id] += value;
    }
    grandTotal += total;
    analysed.push({ label, counts, total, marksLost: total * perMistake });
  }

  const categoryTotals = MISTAKE_CATEGORIES.map((category) => ({
    ...category,
    total: categoryTotalMap[category.id],
    share: grandTotal > 0 ? (categoryTotalMap[category.id] / grandTotal) * 100 : null,
  }));

  const worstCategory =
    grandTotal > 0
      ? categoryTotals.reduce((max, category) => (category.total > max.total ? category : max))
      : null;

  const first = analysed[0];
  const last = analysed[analysed.length - 1];
  const trend = analysed.length > 1 ? last.total - first.total : null; // negative = fewer mistakes
  const trendPercent =
    analysed.length > 1 && first.total > 0 ? (trend / first.total) * 100 : null;

  return {
    mocks: analysed,
    grandTotal,
    totalMarksLost: grandTotal * perMistake,
    averagePerMock: grandTotal / analysed.length,
    categoryTotals,
    worstCategory,
    trend,
    trendPercent,
    latestTotal: last.total,
    latestMarksLost: last.marksLost,
  };
}
