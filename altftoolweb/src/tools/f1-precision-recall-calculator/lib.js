/**
 * Precision Recall F1 Calculator
 *
 * Every figure below is the standard textbook definition for a binary
 * confusion matrix of true positives (TP), false positives (FP), false
 * negatives (FN) and true negatives (TN):
 *
 *   precision (PPV)      = TP / (TP + FP)
 *   recall (TPR)         = TP / (TP + FN)
 *   specificity (TNR)    = TN / (TN + FP)
 *   NPV                  = TN / (TN + FN)
 *   false positive rate  = FP / (FP + TN) = 1 - specificity
 *   false negative rate  = FN / (FN + TP) = 1 - recall
 *   accuracy             = (TP + TN) / N
 *   balanced accuracy    = (recall + specificity) / 2
 *   F1                   = 2PR / (P + R) = 2TP / (2TP + FP + FN)
 *   F-beta               = (1 + beta^2) PR / (beta^2 P + R)   (van Rijsbergen)
 *   MCC                  = (TP.TN - FP.FN)
 *                          / sqrt((TP+FP)(TP+FN)(TN+FP)(TN+FN))
 *   Cohen's kappa        = (po - pe) / (1 - pe)
 *
 * Where a denominator is zero the metric is genuinely undefined, so it is
 * returned as null with a plain-language warning rather than as a zero that
 * would read like a real score. The one exception is MCC, where a zero
 * denominator is conventionally reported as 0 (the same convention scikit-learn
 * uses), and that is flagged too.
 */

/** F-beta of 1 weights precision and recall equally. */
export const DEFAULT_BETA = 1;

/** Guard against a beta so large the metric stops being meaningful. */
export const MAX_BETA = 100;

/** Common F-beta presets. */
export const BETA_PRESETS = [
  { value: 0.5, label: "F0.5 — precision matters twice as much" },
  { value: 1, label: "F1 — precision and recall weighted equally" },
  { value: 2, label: "F2 — recall matters twice as much" },
];

function safeDivide(numerator, denominator) {
  if (!(denominator > 0)) return null;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : null;
}

/**
 * Compute every metric from a binary confusion matrix.
 *
 * @param {object} input
 * @param {number} input.tp true positives
 * @param {number} input.fp false positives
 * @param {number} input.fn false negatives
 * @param {number} input.tn true negatives
 * @param {number} input.beta F-beta weighting, greater than zero
 * @returns {object|{error:string}}
 */
export function computeConfusionMetrics({ tp = 0, fp = 0, fn = 0, tn = 0, beta = DEFAULT_BETA } = {}) {
  const counts = { tp: Number(tp), fp: Number(fp), fn: Number(fn), tn: Number(tn) };
  const names = { tp: "True positives", fp: "False positives", fn: "False negatives", tn: "True negatives" };

  for (const key of Object.keys(counts)) {
    const value = counts[key];
    if (!Number.isFinite(value)) return { error: `${names[key]} must be a number.` };
    if (value < 0) return { error: `${names[key]} cannot be negative.` };
    if (!Number.isInteger(value)) return { error: `${names[key]} must be a whole number of cases.` };
  }

  const b = Number(beta);
  if (!Number.isFinite(b) || b <= 0) {
    return { error: "Beta must be greater than zero. Use 1 for the plain F1 score." };
  }
  if (b > MAX_BETA) {
    return { error: `Beta above ${MAX_BETA} no longer describes a useful trade-off.` };
  }

  const { tp: TP, fp: FP, fn: FN, tn: TN } = counts;
  const total = TP + FP + FN + TN;
  if (total === 0) {
    return { error: "The confusion matrix is empty. Enter at least one case." };
  }

  const warnings = [];

  const precision = safeDivide(TP, TP + FP);
  if (precision === null) warnings.push("Precision is undefined: the model predicted no positives at all.");

  const recall = safeDivide(TP, TP + FN);
  if (recall === null) warnings.push("Recall is undefined: there are no actual positive cases.");

  const specificity = safeDivide(TN, TN + FP);
  if (specificity === null) warnings.push("Specificity is undefined: there are no actual negative cases.");

  const npv = safeDivide(TN, TN + FN);

  const falsePositiveRate = specificity === null ? null : 1 - specificity;
  const falseNegativeRate = recall === null ? null : 1 - recall;

  const accuracy = safeDivide(TP + TN, total);

  const balancedAccuracy =
    recall !== null && specificity !== null ? (recall + specificity) / 2 : null;

  // 2TP / (2TP + FP + FN) is algebraically identical to the harmonic mean form
  // and stays defined whenever any of TP, FP or FN is non-zero.
  const f1 = safeDivide(2 * TP, 2 * TP + FP + FN);

  let fBeta = null;
  if (precision !== null && recall !== null) {
    const b2 = b * b;
    const denominator = b2 * precision + recall;
    fBeta = denominator > 0 ? ((1 + b2) * precision * recall) / denominator : 0;
  }

  const mccDenominatorSquared = (TP + FP) * (TP + FN) * (TN + FP) * (TN + FN);
  let mcc;
  if (mccDenominatorSquared === 0) {
    mcc = 0;
    warnings.push(
      "MCC has a zero denominator here, so it is reported as 0 by the usual convention rather than as undefined.",
    );
  } else {
    mcc = (TP * TN - FP * FN) / Math.sqrt(mccDenominatorSquared);
  }

  // Cohen's kappa: observed agreement against agreement expected by chance.
  const po = accuracy;
  const pe = ((TP + FP) * (TP + FN) + (FN + TN) * (FP + TN)) / (total * total);
  const kappa = pe === 1 ? null : (po - pe) / (1 - pe);
  if (kappa === null) {
    warnings.push("Cohen's kappa is undefined here: chance agreement is already 100%.");
  }

  const prevalence = safeDivide(TP + FN, total);
  const predictedPositiveRate = safeDivide(TP + FP, total);

  return {
    total,
    precision,
    recall,
    specificity,
    npv,
    falsePositiveRate,
    falseNegativeRate,
    accuracy,
    balancedAccuracy,
    f1,
    fBeta,
    beta: b,
    mcc,
    kappa,
    prevalence,
    predictedPositiveRate,
    counts,
    warnings,
  };
}
