/**
 * Exam Attempt Cost Tracker.
 *
 * Pure summation over user-entered attempts — no statutory rules. For each
 * attempt: total = application fee + coaching + test series + books + travel
 * + stay + other. Across attempts: grand total, average per attempt, and
 * which cost head consumed the most money overall.
 */

/** Cost heads recorded per attempt. */
export const COST_HEADS = [
  { id: "applicationFee", label: "Application / form fee" },
  { id: "coaching", label: "Coaching / classes" },
  { id: "testSeries", label: "Test series / mocks" },
  { id: "books", label: "Books / material" },
  { id: "travel", label: "Travel to centre" },
  { id: "stay", label: "Stay / lodging" },
  { id: "other", label: "Other" },
];

/**
 * @param {object} input
 * @param {Array<{label?: string} & Object<string, number>>} input.attempts
 *        One object per attempt with amounts for each cost head.
 * @returns {{attempts: Array<{label:string,total:number,heads:Object}>,
 *   grandTotal:number, averagePerAttempt:number,
 *   headTotals: Array<{id:string,label:string,total:number,share:number|null}>,
 *   costliestHead: object|null, costliestAttempt: object|null}|{error:string}}
 */
export function trackAttemptCosts({ attempts }) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return { error: "Add at least one exam attempt." };
  }

  const cleaned = [];
  const headTotalMap = Object.fromEntries(COST_HEADS.map((head) => [head.id, 0]));
  let grandTotal = 0;

  for (let i = 0; i < attempts.length; i += 1) {
    const raw = attempts[i] ?? {};
    const label =
      typeof raw.label === "string" && raw.label.trim() !== ""
        ? raw.label.trim()
        : `Attempt ${i + 1}`;
    const heads = {};
    let total = 0;
    for (const head of COST_HEADS) {
      const value =
        raw[head.id] === undefined || raw[head.id] === null || raw[head.id] === ""
          ? 0
          : Number(raw[head.id]);
      if (!Number.isFinite(value)) {
        return { error: `${label}: ${head.label} must be a number (0 is fine).` };
      }
      if (value < 0) {
        return { error: `${label}: ${head.label} cannot be negative.` };
      }
      heads[head.id] = value;
      total += value;
      headTotalMap[head.id] += value;
    }
    grandTotal += total;
    cleaned.push({ label, total, heads });
  }

  const headTotals = COST_HEADS.map((head) => ({
    id: head.id,
    label: head.label,
    total: headTotalMap[head.id],
    share: grandTotal > 0 ? (headTotalMap[head.id] / grandTotal) * 100 : null,
  }));

  const costliestHead =
    grandTotal > 0
      ? headTotals.reduce((max, head) => (head.total > max.total ? head : max))
      : null;
  const costliestAttempt =
    grandTotal > 0
      ? cleaned.reduce((max, attempt) => (attempt.total > max.total ? attempt : max))
      : null;

  return {
    attempts: cleaned,
    grandTotal,
    averagePerAttempt: grandTotal / cleaned.length,
    headTotals,
    costliestHead,
    costliestAttempt,
  };
}
