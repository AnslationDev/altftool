/**
 * Helper functions to prepare data for charts.
 */

// Compute bins for a numeric column (histogram)
export const computeBins = (values, binCount = 10) => {
  const nums = values
    .map((v) => Number(String(v).replace(/,/g, "").trim()))
    .filter((v) => !isNaN(v) && isFinite(v));

  if (nums.length === 0) return [];

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  // Avoid division by zero if all numbers are the same
  const range = max - min || 1;
  const binWidth = range / binCount;

  const bins = [];
  for (let i = 0; i < binCount; i++) {
    const lower = min + i * binWidth;
    const upper = lower + binWidth;
    const label = `${lower.toFixed(1)}-${upper.toFixed(1)}`;
    const count = nums.filter(
      (n) => n >= lower && (i === binCount - 1 ? n <= max : n < upper)
    ).length;
    bins.push({ label, count });
  }
  return bins;
};

// Compute frequency for a categorical column
export const computeFrequencies = (values) => {
  const freq = new Map();
  values.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
  return Array.from(freq, ([name, count]) => ({ name, count }));
};