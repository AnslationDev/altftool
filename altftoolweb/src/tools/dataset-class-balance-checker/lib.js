/**
 * Dataset class balance analysis.
 *
 * Pure functions only: label parsing plus the standard imbalance statistics used
 * when preparing a supervised classification dataset.
 */

/**
 * Imbalance Ratio (IR) = count(majority class) / count(minority class).
 * The bands below follow the convention used throughout the imbalanced-learning
 * literature (Fernandez et al., "Learning from Imbalanced Data Sets", 2018),
 * where IR <= 1.5 is treated as effectively balanced and IR > 9-10 is the point
 * at which plain accuracy stops being a usable metric.
 */
export const IR_BALANCED_MAX = 1.5;
export const IR_MILD_MAX = 3;
export const IR_MODERATE_MAX = 10;

/**
 * scikit-learn's StratifiedKFold raises "n_splits cannot be greater than the
 * number of members in each class" when the smallest class has fewer rows than
 * the fold count. 5 is scikit-learn's default n_splits since version 0.22.
 */
export const DEFAULT_CV_FOLDS = 5;

/** Below this many rows a class is generally too small to train or evaluate on. */
export const RARE_CLASS_MIN_COUNT = 10;

export const INPUT_FORMATS = ["lines", "csv", "jsonl"];

/** Splits one CSV record on commas, honouring RFC 4180 double-quoted fields. */
export function splitCsvLine(line) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

/**
 * Extracts a flat list of label strings from pasted text.
 *
 * @param {string} text raw pasted content
 * @param {object} options
 * @param {"lines"|"csv"|"jsonl"} options.format
 * @param {string} options.column CSV header name or 0-based index
 * @param {boolean} options.hasHeader treat the first CSV row as a header
 * @param {string} options.field JSONL property holding the label
 * @param {boolean} options.caseSensitive keep "Spam" and "spam" apart
 * @returns {{labels: string[], skipped: number, rows: number}|{error: string}}
 */
export function parseLabels(text, options = {}) {
  const {
    format = "lines",
    column = "0",
    hasHeader = false,
    field = "label",
    caseSensitive = true,
  } = options;

  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste some labels first — one per line, a CSV column, or JSONL records." };
  }
  if (!INPUT_FORMATS.includes(format)) {
    return { error: `Unknown input format "${format}".` };
  }

  const rawRows = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (rawRows.length === 0) {
    return { error: "No non-empty rows found in the pasted text." };
  }

  const normalise = (value) => {
    const cleaned = String(value).trim().replace(/^"|"$/g, "");
    return caseSensitive ? cleaned : cleaned.toLowerCase();
  };

  const labels = [];
  let skipped = 0;

  if (format === "lines") {
    for (const row of rawRows) {
      const value = normalise(row);
      if (value === "") skipped += 1;
      else labels.push(value);
    }
  } else if (format === "csv") {
    let header = null;
    let body = rawRows;
    if (hasHeader) {
      header = splitCsvLine(rawRows[0]).map((cell) => cell.trim());
      body = rawRows.slice(1);
      if (body.length === 0) {
        return { error: "The CSV has a header row but no data rows below it." };
      }
    }

    const wanted = String(column).trim();
    let index = -1;
    if (header) {
      index = header.findIndex((name) => name.toLowerCase() === wanted.toLowerCase());
    }
    if (index < 0) {
      const asNumber = Number(wanted);
      if (Number.isInteger(asNumber) && asNumber >= 0) index = asNumber;
    }
    if (index < 0) {
      return {
        error: header
          ? `No column named "${wanted}" in the header row (${header.join(", ")}).`
          : `Column must be a 0-based number when there is no header row — "${wanted}" is not one.`,
      };
    }

    for (const row of body) {
      const cells = splitCsvLine(row);
      if (index >= cells.length) {
        skipped += 1;
        continue;
      }
      const value = normalise(cells[index]);
      if (value === "") skipped += 1;
      else labels.push(value);
    }
  } else {
    const key = String(field).trim();
    if (key === "") return { error: "Enter the JSON property that holds the label." };
    for (const row of rawRows) {
      let parsed;
      try {
        parsed = JSON.parse(row);
      } catch {
        skipped += 1;
        continue;
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        skipped += 1;
        continue;
      }
      const value = parsed[key];
      if (value === undefined || value === null || String(value).trim() === "") {
        skipped += 1;
        continue;
      }
      labels.push(normalise(value));
    }
  }

  if (labels.length === 0) {
    return {
      error:
        format === "jsonl"
          ? `No row contained a usable "${field}" property.`
          : "No usable labels were found — check the format and column settings.",
    };
  }

  return { labels, skipped, rows: rawRows.length };
}

/**
 * Computes the class balance report for a list of labels.
 *
 * @param {string[]} labels
 * @param {{folds?: number, rareMin?: number}} options
 */
export function analyseClassBalance(labels, options = {}) {
  const folds = Number(options.folds ?? DEFAULT_CV_FOLDS);
  const rareMin = Number(options.rareMin ?? RARE_CLASS_MIN_COUNT);

  if (!Array.isArray(labels) || labels.length === 0) {
    return { error: "No labels were supplied to analyse." };
  }
  if (!Number.isFinite(folds) || !Number.isInteger(folds) || folds < 2) {
    return { error: "Cross-validation folds must be a whole number of 2 or more." };
  }
  if (!Number.isFinite(rareMin) || rareMin < 0) {
    return { error: "The rare-class threshold must be zero or a positive number." };
  }

  const counts = new Map();
  for (const raw of labels) {
    const label = String(raw);
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  const total = labels.length;
  const k = counts.size;
  if (k < 2) {
    return {
      error: `Only one distinct label ("${[...counts.keys()][0]}") was found — a classification dataset needs at least two classes.`,
    };
  }

  const classes = [...counts.entries()]
    .map(([label, count]) => ({ label, count, share: count / total }))
    .sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : 1));

  const majority = classes[0];
  const minority = classes[classes.length - 1];
  const imbalanceRatio = majority.count / minority.count; // minority.count >= 1

  // Shannon entropy in bits, and its ratio to the log2(k) maximum.
  let entropy = 0;
  let gini = 1;
  for (const cls of classes) {
    entropy -= cls.share * Math.log2(cls.share);
    gini -= cls.share * cls.share;
  }
  gini = Math.max(0, gini);
  const maxEntropy = Math.log2(k);
  const normalisedEntropy = maxEntropy > 0 ? Math.min(1, entropy / maxEntropy) : 0;

  // scikit-learn class_weight="balanced": w_j = n_samples / (n_classes * n_j).
  const perfectShare = 1 / k;
  const detail = classes.map((cls) => ({
    ...cls,
    weight: total / (k * cls.count),
    deviation: cls.share - perfectShare,
    oversampleBy: majority.count - cls.count,
    undersampleBy: cls.count - minority.count,
  }));

  let severity = "severe";
  if (imbalanceRatio <= IR_BALANCED_MAX) severity = "balanced";
  else if (imbalanceRatio <= IR_MILD_MAX) severity = "mild";
  else if (imbalanceRatio <= IR_MODERATE_MAX) severity = "moderate";

  const warnings = [];
  if (minority.count < folds) {
    warnings.push(
      `"${minority.label}" has only ${minority.count} row${minority.count === 1 ? "" : "s"}, so ${folds}-fold stratified cross-validation will fail — scikit-learn needs at least ${folds} members per class.`,
    );
  }
  const rare = detail.filter((cls) => cls.count < rareMin);
  if (rare.length > 0) {
    warnings.push(
      `${rare.length} class${rare.length === 1 ? "" : "es"} below ${rareMin} rows (${rare.map((c) => c.label).join(", ")}) — too few to score reliably per class.`,
    );
  }
  if (severity === "severe") {
    warnings.push(
      `Imbalance ratio ${imbalanceRatio.toFixed(1)}:1 — report macro-F1, balanced accuracy or PR-AUC instead of plain accuracy.`,
    );
  }
  if (majority.share >= 0.9) {
    warnings.push(
      `Always predicting "${majority.label}" already scores ${(majority.share * 100).toFixed(1)}% accuracy, so accuracy alone cannot show that a model learned anything.`,
    );
  }

  return {
    total,
    classCount: k,
    classes: detail,
    majority,
    minority,
    imbalanceRatio,
    severity,
    entropy,
    maxEntropy,
    normalisedEntropy,
    gini,
    baselineAccuracy: majority.share,
    perfectShare,
    perfectCountPerClass: total / k,
    oversampleTotal: majority.count * k,
    undersampleTotal: minority.count * k,
    folds,
    warnings,
  };
}

/** Convenience wrapper: parse then analyse in one call. */
export function checkDatasetBalance(text, options = {}) {
  const parsed = parseLabels(text, options);
  if (parsed.error) return parsed;
  const report = analyseClassBalance(parsed.labels, options);
  if (report.error) return report;
  return { ...report, skipped: parsed.skipped, rowsRead: parsed.rows };
}
