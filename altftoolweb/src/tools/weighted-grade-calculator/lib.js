/**
 * Weighted Grade Calculator — weighted average, letter grade and the score
 * still needed on whatever has not been graded yet.
 *
 * The weighted average is the standard definition:
 *
 *   grade % = SUM(score_i x weight_i) / SUM(weight_i)
 *
 * Internally each graded item contributes "grade points":
 *
 *   points_i        = weight_i x score_i / 100
 *   points earned   = SUM(points_i) over graded items
 *   current grade   = points earned / graded weight x 100
 *   projected grade = points earned / total weight x 100   (ungraded scored 0)
 *
 * Turning that around gives the classic "what do I need on the final?":
 *
 *   needed % = (target x total weight / 100 - points earned) / remaining weight x 100
 *
 * Weights do not have to add to 100 — they are normalised by their own sum, so
 * a syllabus written in raw points (say 200 + 300 + 500) works unchanged.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Standard US letter-grade cut-offs and their 4.0-scale grade points.
 * This is the common +/- scale (A = 93, A- = 90, B+ = 87 ...); some schools use
 * a straight ten-point scale instead, which is offered as a second option.
 */
export const PLUS_MINUS_SCALE = [
  { letter: "A", min: 93, gpa: 4.0 },
  { letter: "A-", min: 90, gpa: 3.7 },
  { letter: "B+", min: 87, gpa: 3.3 },
  { letter: "B", min: 83, gpa: 3.0 },
  { letter: "B-", min: 80, gpa: 2.7 },
  { letter: "C+", min: 77, gpa: 2.3 },
  { letter: "C", min: 73, gpa: 2.0 },
  { letter: "C-", min: 70, gpa: 1.7 },
  { letter: "D+", min: 67, gpa: 1.3 },
  { letter: "D", min: 63, gpa: 1.0 },
  { letter: "D-", min: 60, gpa: 0.7 },
  { letter: "F", min: 0, gpa: 0.0 },
];

/** Straight ten-point scale with no plus or minus grades. */
export const TEN_POINT_SCALE = [
  { letter: "A", min: 90, gpa: 4.0 },
  { letter: "B", min: 80, gpa: 3.0 },
  { letter: "C", min: 70, gpa: 2.0 },
  { letter: "D", min: 60, gpa: 1.0 },
  { letter: "F", min: 0, gpa: 0.0 },
];

export const GRADE_SCALES = [
  { id: "plus-minus", label: "Letter grades with + / -", scale: PLUS_MINUS_SCALE },
  { id: "ten-point", label: "Straight 10-point scale", scale: TEN_POINT_SCALE },
];

/** A percentage above this is not a real score on a normal marking scheme. */
export const MAX_SCORE_PERCENT = 200;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Look a percentage up on a grade scale. */
export function letterForPercent(percent, scaleId = "plus-minus") {
  if (!isNum(percent)) return { error: "Enter a numeric percentage." };
  const chosen = GRADE_SCALES.find((s) => s.id === scaleId) ?? GRADE_SCALES[0];
  const band = chosen.scale.find((row) => percent >= row.min) ?? chosen.scale[chosen.scale.length - 1];
  return { letter: band.letter, gpa: band.gpa, cutoff: band.min };
}

/** Convert points earned out of points possible into a percentage. */
export function pointsToPercent(earned, possible) {
  if (!isNum(earned) || !isNum(possible)) return { error: "Enter both the marks earned and the marks possible." };
  if (possible <= 0) return { error: "Marks possible must be greater than zero." };
  if (earned < 0) return { error: "Marks earned cannot be negative." };
  return { percent: (earned / possible) * 100 };
}

/**
 * Weighted grade across a list of assessments.
 *
 * @param {{ items: Array<{ name?: string, weight: number, score: number|null,
 *           graded?: boolean }>, scaleId?: string }} input
 */
export function computeWeightedGrade({ items, scaleId = "plus-minus" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one assessment with a weight." };
  }

  let totalWeight = 0;
  let gradedWeight = 0;
  let pointsEarned = 0;
  const rows = [];

  for (const item of items) {
    const weight = Number(item.weight);
    if (!isNum(weight) || weight < 0) {
      return { error: `"${item.name || "Untitled"}" needs a weight of zero or more.` };
    }
    totalWeight += weight;

    const isGraded = item.graded !== false && item.score !== null && item.score !== "" && isNum(Number(item.score));
    if (!isGraded) {
      rows.push({ ...item, weight, scorePercent: null, points: null, shareOfGrade: 0 });
      continue;
    }

    const score = Number(item.score);
    if (score < 0) return { error: `"${item.name || "Untitled"}" cannot have a negative score.` };
    if (score > MAX_SCORE_PERCENT) {
      return { error: `"${item.name || "Untitled"}" scores above ${MAX_SCORE_PERCENT}% are outside this calculator's range.` };
    }

    const points = (weight * score) / 100;
    gradedWeight += weight;
    pointsEarned += points;
    rows.push({ ...item, weight, scorePercent: score, points, shareOfGrade: 0 });
  }

  if (totalWeight <= 0) return { error: "The weights add up to zero — give at least one assessment a weight above zero." };
  if (gradedWeight <= 0) {
    return { error: "Nothing has been graded yet, so there is no grade to average. Enter a score for at least one assessment." };
  }

  for (const row of rows) {
    row.shareOfGrade = row.points === null ? 0 : (row.points / totalWeight) * 100;
    row.weightSharePercent = (row.weight / totalWeight) * 100;
  }

  const currentPercent = (pointsEarned / gradedWeight) * 100;
  const projectedPercent = (pointsEarned / totalWeight) * 100;
  const remainingWeight = totalWeight - gradedWeight;

  const current = letterForPercent(currentPercent, scaleId);
  const projected = letterForPercent(projectedPercent, scaleId);

  return {
    rows,
    totalWeight,
    gradedWeight,
    remainingWeight,
    pointsEarned,
    pointsAvailable: totalWeight,
    currentPercent,
    projectedPercent,
    maxPossiblePercent: ((pointsEarned + remainingWeight) / totalWeight) * 100,
    currentLetter: current.letter,
    currentGpa: current.gpa,
    projectedLetter: projected.letter,
    projectedGpa: projected.gpa,
    weightsSumTo100: Math.abs(totalWeight - 100) < 1e-9,
  };
}

/**
 * Average score needed across everything still ungraded to finish on `target`.
 *
 * @param {{ items: Array, targetPercent: number, scaleId?: string }} input
 */
export function requiredOnRemaining({ items, targetPercent, scaleId = "plus-minus" }) {
  const grade = computeWeightedGrade({ items, scaleId });
  if (grade.error) return grade;
  if (!isNum(targetPercent) || targetPercent < 0 || targetPercent > MAX_SCORE_PERCENT) {
    return { error: `Enter a target between 0 and ${MAX_SCORE_PERCENT}%.` };
  }
  if (grade.remainingWeight <= 0) {
    return {
      error: `Every assessment is already graded, so the final grade is fixed at ${grade.projectedPercent.toFixed(2)}%.`,
    };
  }
  const targetPoints = (targetPercent * grade.totalWeight) / 100;
  const needed = ((targetPoints - grade.pointsEarned) / grade.remainingWeight) * 100;
  return {
    neededPercent: needed,
    remainingWeight: grade.remainingWeight,
    alreadyAchieved: needed <= 0,
    impossible: needed > 100,
    maxPossiblePercent: grade.maxPossiblePercent,
    targetPercent,
  };
}
