/**
 * Revaluation / re-check decision maths.
 *
 * Applying for revaluation is a bet with a known cost and an uncertain payoff,
 * and boards make it a one-way bet in one important respect: the revised marks
 * stand whether they are higher OR lower than the original. CBSE's Examination
 * Bye-Laws put it plainly — the marks awarded after re-evaluation are final, and
 * a candidate cannot go back to the original score. Most university ordinances
 * carry the same clause. That means a decision model has to price the downside,
 * not only the hoped-for gain.
 *
 * The model here is a plain expected-value calculation on marks:
 *
 *   expected change = P(up) × gain if raised − P(down) × loss if reduced
 *   expected marks  = current marks + expected change
 *   cost per expected mark = total fee ÷ expected change
 *
 * and the break-even probability — the chance of a rise at which the bet stops
 * being negative once the downside is priced in:
 *
 *   P(up) at break-even = P(down) × loss ÷ gain
 *
 * Nothing here predicts your result. The probabilities are YOUR estimate, and
 * the only honest anchor for them is the board's own past revaluation data plus
 * how specific your grievance is: an unmarked question or a totalling error is
 * a far stronger case than a general feeling that the marking was harsh.
 *
 * MOST BOARDS RUN THREE SEPARATE STAGES, in this order, each with its own fee
 * and its own short window that starts the day the result is declared:
 *   1. Verification / re-totalling — a clerk re-adds the marks and checks that
 *      no question was left unmarked. This does not re-judge any answer.
 *   2. Photocopy of the evaluated answer book — lets you see the marking before
 *      committing to stage 3.
 *   3. Re-evaluation — a fresh examiner re-marks the specific questions you
 *      name, usually charged per question and often available only after the
 *      photocopy has been obtained.
 * Fees and window lengths are revised every year and differ by board, so they
 * are inputs here rather than hard-coded numbers. Take them from the current
 * post-result circular on your board's website.
 */

/** The three stages, in the order boards require them to be taken. */
export const REVALUATION_STAGES = [
  {
    id: "verification",
    label: "Verification / re-totalling",
    what: "A clerk re-adds the marks and checks that no question or page was left unmarked. Answers are not re-judged.",
    typicalOutcome: "Catches addition slips and unmarked questions. Small changes, but the cheapest stage.",
  },
  {
    id: "photocopy",
    label: "Photocopy of the evaluated answer book",
    what: "You receive a scan of your marked answer book so you can see where marks were lost before spending more.",
    typicalOutcome: "No change to marks by itself. It is the evidence you need for a targeted re-evaluation.",
  },
  {
    id: "re-evaluation",
    label: "Re-evaluation of named questions",
    what: "A fresh examiner re-marks only the questions you list, normally charged per question.",
    typicalOutcome: "The largest possible change, and the only stage where marks can move in either direction.",
  },
];

/** Boards treat the post-revaluation marks as final, higher or lower. */
export const REVISED_MARKS_ARE_FINAL = true;

/** Sanity ceilings. */
export const MAX_SUBJECTS = 20;
export const MAX_MARKS_CAP = 1000;
export const MAX_FEE = 100000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function isNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Whole days from one ISO date (YYYY-MM-DD) to another, counted in UTC so that
 * the answer does not shift with the viewer's time zone.
 * @returns {number|null} null when either date cannot be read
 */
export function daysBetweenIsoDates(fromIso, toIso) {
  const parse = (value) => {
    if (typeof value !== "string") return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const stamp = Date.UTC(year, month - 1, day);
    const check = new Date(stamp);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
      return null;
    }
    return stamp;
  };
  const from = parse(fromIso);
  const to = parse(toIso);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Weigh a revaluation application.
 *
 * @param {object} input
 * @param {number} input.currentMarks     marks awarded in the subject
 * @param {number} input.maxMarks         maximum marks for that subject
 * @param {number} input.targetMarks      the mark you actually need
 * @param {number} input.feePerSubject    fee for the stage you are applying for
 * @param {number} input.subjects         how many subjects you would apply for
 * @param {number} input.chanceOfIncrease your estimate, in percent
 * @param {number} input.gainIfIncreased  marks you expect to gain if it is raised
 * @param {number} input.chanceOfDecrease your estimate, in percent
 * @param {number} input.lossIfDecreased  marks you would lose if it is reduced
 * @param {string} [input.todayIso]       today, as YYYY-MM-DD
 * @param {string} [input.deadlineIso]    last date to apply, as YYYY-MM-DD
 * @returns {object} result, or { error }
 */
export function weighRevaluation({
  currentMarks,
  maxMarks,
  targetMarks,
  feePerSubject,
  subjects = 1,
  chanceOfIncrease,
  gainIfIncreased,
  chanceOfDecrease = 0,
  lossIfDecreased = 0,
  todayIso = null,
  deadlineIso = null,
} = {}) {
  const current = Number(currentMarks);
  const max = Number(maxMarks);
  const target = Number(targetMarks);
  const fee = Number(feePerSubject);
  const subjectCount = Number(subjects);
  const pUp = Number(chanceOfIncrease);
  const gain = Number(gainIfIncreased);
  const pDown = Number(chanceOfDecrease);
  const loss = Number(lossIfDecreased);

  if (![current, max, target, fee, subjectCount, pUp, gain, pDown, loss].every(isNonNegative)) {
    return { error: "Every figure must be a number of zero or more." };
  }
  if (max <= 0 || max > MAX_MARKS_CAP) {
    return { error: `Maximum marks must be above 0 and at most ${MAX_MARKS_CAP}.` };
  }
  if (current > max) {
    return { error: `Marks awarded (${current}) cannot exceed the maximum of ${max}.` };
  }
  if (target > max) {
    return { error: `The mark you need (${target}) cannot exceed the maximum of ${max}.` };
  }
  if (!Number.isInteger(subjectCount) || subjectCount < 1 || subjectCount > MAX_SUBJECTS) {
    return { error: `Apply for between 1 and ${MAX_SUBJECTS} subjects.` };
  }
  if (fee > MAX_FEE) {
    return { error: `A per-subject fee above ${MAX_FEE} looks like a typo. Check the circular.` };
  }
  if (pUp > 100 || pDown > 100) {
    return { error: "A chance cannot be more than 100%." };
  }
  if (pUp + pDown > 100) {
    return {
      error: `The chance of a rise (${pUp}%) and of a fall (${pDown}%) add up to more than 100%. The rest is the chance of no change.`,
    };
  }
  if (current + gain > max) {
    return {
      error: `A gain of ${gain} would take the score past the maximum of ${max}. Lower the expected gain.`,
    };
  }
  if (loss > current) {
    return { error: `A loss of ${loss} is larger than the ${current} marks currently awarded.` };
  }

  const totalFee = round(fee * subjectCount, 2);
  const chanceUnchanged = round(100 - pUp - pDown, 2);

  // Expected value on marks, per subject.
  const expectedChange = round((pUp / 100) * gain - (pDown / 100) * loss, 3);
  const expectedMarks = round(current + expectedChange, 2);
  const expectedPercentPoints = round((expectedChange / max) * 100, 2);

  // Break-even chance of a rise, given the downside you have priced in.
  const breakEvenChance = gain > 0 ? round(((pDown / 100) * loss * 100) / gain, 2) : null;

  // Cost of each mark you can expect to gain. Meaningless when the expected
  // change is zero or negative, so it is reported as null rather than Infinity.
  const costPerExpectedMark =
    expectedChange > 0 ? round(totalFee / (expectedChange * subjectCount), 2) : null;

  // Does the upside even reach what you need?
  const gapToTarget = round(Math.max(0, target - current), 2);
  const targetMet = current + 1e-9 >= target;
  const bestCaseMarks = round(current + gain, 2);
  const targetReachedOnGain = bestCaseMarks + 1e-9 >= target;
  const gainStillNeeded = round(Math.max(0, target - bestCaseMarks), 2);
  const worstCaseMarks = round(current - loss, 2);

  // Deadline.
  const daysLeft = todayIso && deadlineIso ? daysBetweenIsoDates(todayIso, deadlineIso) : null;
  let deadlineState = "unknown";
  if (daysLeft !== null) {
    if (daysLeft < 0) deadlineState = "closed";
    else if (daysLeft === 0) deadlineState = "last-day";
    else if (daysLeft <= 3) deadlineState = "urgent";
    else deadlineState = "open";
  }

  const reasons = [];
  if (targetMet) {
    reasons.push(`You are already at or above the ${target} marks you need, so the only thing revaluation can do here is take marks away.`);
  }
  if (!targetMet && !targetReachedOnGain) {
    reasons.push(`Even the ${gain}-mark gain you expect leaves you ${gainStillNeeded} short of ${target}.`);
  }
  if (expectedChange <= 0) {
    reasons.push(`On your own numbers the expected change is ${expectedChange} marks — the downside outweighs the upside.`);
  }
  if (deadlineState === "closed") {
    reasons.push("The application window has already closed.");
  }

  let recommendation;
  let recommendationTone;
  if (deadlineState === "closed") {
    recommendation = "Window closed";
    recommendationTone = "danger";
  } else if (targetMet) {
    recommendation = "Not worth it — you already have the mark you need";
    recommendationTone = "danger";
  } else if (expectedChange <= 0) {
    recommendation = "Weak case — the expected change is not positive";
    recommendationTone = "danger";
  } else if (!targetReachedOnGain) {
    recommendation = "Marginal — the expected gain does not reach your target";
    recommendationTone = "warning";
  } else if (costPerExpectedMark !== null && costPerExpectedMark > fee) {
    recommendation = "Worth considering — positive, but each expected mark costs more than the fee";
    recommendationTone = "warning";
  } else {
    recommendation = "Worth applying on these numbers";
    recommendationTone = "success";
  }

  const verdict =
    reasons.length > 0
      ? reasons.join(" ")
      : `On your estimates the application is worth ${totalFee} for an expected ${expectedChange} marks, about ${costPerExpectedMark} per mark. Start with verification or the photocopy: seeing the marked script turns a guess about the chance of a rise into evidence.`;

  return {
    currentMarks: current,
    maxMarks: max,
    targetMarks: target,
    feePerSubject: fee,
    subjects: subjectCount,
    totalFee,
    chanceOfIncrease: pUp,
    chanceOfDecrease: pDown,
    chanceUnchanged,
    gainIfIncreased: gain,
    lossIfDecreased: loss,
    expectedChange,
    expectedMarks,
    expectedPercentPoints,
    breakEvenChance,
    costPerExpectedMark,
    gapToTarget,
    targetMet,
    targetReachedOnGain,
    gainStillNeeded,
    bestCaseMarks,
    worstCaseMarks,
    currentPercent: round((current / max) * 100, 2),
    bestCasePercent: round((bestCaseMarks / max) * 100, 2),
    worstCasePercent: round((worstCaseMarks / max) * 100, 2),
    daysLeft,
    deadlineState,
    recommendation,
    recommendationTone,
    reasons,
    verdict,
  };
}
