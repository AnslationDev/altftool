export const profileData = (data, columnTypes) => {
  if (!data.length) return null;

  const columns = Object.keys(data[0]);
  const totalRows = data.length;
  const totalCells = totalRows * columns.length;

  // Missing values
  let totalMissing = 0;
  const missingByColumn = {};
  columns.forEach(col => {
    const missing = data.filter(row => row[col] === null || row[col] === undefined || row[col] === "").length;
    missingByColumn[col] = { count: missing, percent: (missing / totalRows) * 100 };
    totalMissing += missing;
  });

  // Duplicate rows (exact match)
  const rowStrings = data.map(row => JSON.stringify(row));
  const rowCounts = {};
  rowStrings.forEach(str => { rowCounts[str] = (rowCounts[str] || 0) + 1; });
  const duplicateCount = Object.values(rowCounts).filter(c => c > 1).reduce((sum, c) => sum + c - 1, 0);

  // Column profiles
  const columnProfiles = {};
  const warnings = [];

  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const clean = values.filter(v => v !== null && v !== undefined && v !== "");
    const nullCount = totalRows - clean.length;
    const type = columnTypes[col] || "categorical";

    const profile = {
      column: col,
      type,
      nullCount,
      nullPercent: (nullCount / totalRows) * 100,
    };

    if (type === "numeric") {
      const nums = clean
        .map(v => parseFloat(String(v).replace(/,/g, "").trim()))
        .filter(v => !isNaN(v) && isFinite(v));
      if (nums.length) {
        const sorted = [...nums].sort((a, b) => a - b);
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const median = sorted[Math.floor(sorted.length / 2)];
        const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
        const stdDev = Math.sqrt(variance);

        // Skewness
        const skew = nums.reduce((s, n) => s + ((n - mean) / stdDev) ** 3, 0) / nums.length;

        // Outliers (IQR)
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;
        const outliers = nums.filter(n => n < lowerFence || n > upperFence);

        // Histogram bins (20 bins)
        const binCount = 20;
        const binWidth = (max - min) / binCount || 1;
        const histogram = [];
        for (let i = 0; i < binCount; i++) {
          const lower = min + i * binWidth;
          const upper = lower + binWidth;
          histogram.push({
            bin: `${lower.toFixed(1)}-${upper.toFixed(1)}`,
            count: nums.filter(n => n >= lower && (i === binCount - 1 ? n <= max : n < upper)).length,
          });
        }

        Object.assign(profile, {
          min, max, mean, median, stdDev, skew,
          outliersCount: outliers.length,
          outliersPercent: (outliers.length / nums.length) * 100,
          histogram,
        });

        if (outliers.length > nums.length * 0.05) {
          warnings.push(`${col} has ${((outliers.length / nums.length) * 100).toFixed(1)}% outliers.`);
        }
      }
    } else {
      // Categorical / Date
      const freqMap = {};
      clean.forEach(v => { freqMap[v] = (freqMap[v] || 0) + 1; });
      const sortedFreq = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      const topValues = sortedFreq.slice(0, 10).map(([val, cnt]) => ({ value: val, count: cnt, percent: (cnt / clean.length) * 100 }));
      profile.uniqueCount = sortedFreq.length;
      profile.topValues = topValues;

      if (type === "date") {
        // Check chronological order
        const dates = clean.map(v => new Date(v)).filter(d => !isNaN(d));
        if (dates.length) {
          let isSorted = true;
          for (let i = 1; i < dates.length; i++) {
            if (dates[i] < dates[i - 1]) { isSorted = false; break; }
          }
          profile.isSorted = isSorted;
          profile.minDate = new Date(Math.min(...dates));
          profile.maxDate = new Date(Math.max(...dates));
          if (!isSorted) warnings.push(`${col} is not in chronological order.`);
        }
      }
    }

    // Constant column warning
    if (profile.uniqueCount === 1) {
      warnings.push(`${col} is constant (only one value).`);
    }

    // All unique warning
    if (profile.uniqueCount === clean.length && clean.length > 5) {
      warnings.push(`${col} has all unique values – might be an ID.`);
    }

    // High missing warning
    if (profile.nullPercent > 80) {
      warnings.push(`${col} has ${profile.nullPercent.toFixed(1)}% missing values.`);
    }

    columnProfiles[col] = profile;
  });

  // Correlation matrix (numeric columns only)
  const numericCols = columns.filter(c => columnTypes[c] === "numeric");
  const correlations = [];
  if (numericCols.length > 1) {
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const colA = numericCols[i];
        const colB = numericCols[j];
        const numsA = data.map(r => parseFloat(r[colA])).filter(v => !isNaN(v));
        const numsB = data.map(r => parseFloat(r[colB])).filter(v => !isNaN(v));
        // Use only rows where both are valid
        const pairs = [];
        for (let k = 0; k < data.length; k++) {
          const a = parseFloat(data[k][colA]);
          const b = parseFloat(data[k][colB]);
          if (!isNaN(a) && !isNaN(b)) pairs.push({ a, b });
        }
        if (pairs.length > 2) {
          const n = pairs.length;
          const sumA = pairs.reduce((s, p) => s + p.a, 0);
          const sumB = pairs.reduce((s, p) => s + p.b, 0);
          const sumAB = pairs.reduce((s, p) => s + p.a * p.b, 0);
          const sumA2 = pairs.reduce((s, p) => s + p.a ** 2, 0);
          const sumB2 = pairs.reduce((s, p) => s + p.b ** 2, 0);
          const numerator = n * sumAB - sumA * sumB;
          const denominator = Math.sqrt((n * sumA2 - sumA ** 2) * (n * sumB2 - sumB ** 2));
          const r = denominator ? numerator / denominator : 0;
          correlations.push({ colA, colB, correlation: r });
          if (Math.abs(r) > 0.9) {
            warnings.push(`${colA} and ${colB} are highly correlated (${r.toFixed(2)}).`);
          }
        }
      }
    }
  }

  if (duplicateCount > 0) warnings.push(`${duplicateCount} duplicate row(s) found.`);

  return {
    totalRows,
    totalColumns: columns.length,
    totalCells,
    totalMissing,
    missingPercent: (totalMissing / totalCells) * 100,
    duplicateCount,
    columns: columnProfiles,
    correlations,
    warnings,
  };
};