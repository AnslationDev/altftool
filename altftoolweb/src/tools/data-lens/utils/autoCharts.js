/**
 * Smart auto‑chart generator.
 * - Pie for categorical columns with ≤5 unique values
 * - Bar for categorical columns with >5 unique values
 * - Line for date columns
 * - Scatter for strongly correlated numeric pairs (or first two numeric)
 * 
 * Works directly on data + columnTypes (doesn’t need full profiling).
 */

const getUniqueCount = (data, col, maxSample = 2000) => {
  const sample = data.length <= maxSample ? data : data.slice(0, maxSample);
  const unique = new Set(sample.map(row => row[col]).filter(v => v != null && v !== ''));
  return unique.size;
};

export const generateAutoCharts = (data, columnTypes, profiling) => {
  if (!data.length) return [];

  const columns = Object.keys(data[0]);
  const numericCols = columns.filter(c => columnTypes[c] === 'numeric');
  const categoricalCols = columns.filter(c => columnTypes[c] === 'categorical' || (!columnTypes[c] && columnTypes[c] !== 'numeric' && columnTypes[c] !== 'date'));
  const dateCols = columns.filter(c => columnTypes[c] === 'date');
  const charts = [];
  let id = Date.now() + Math.random() * 1000;   // avoid duplicate IDs

  // helper to get first numeric column (for Y axis)
  const defaultNumeric = numericCols.length > 0 ? numericCols[0] : null;

  // ----- Categorical columns -----
  categoricalCols.forEach(col => {
    const uniqueCount = getUniqueCount(data, col);
    if (uniqueCount === 0) return;

    if (uniqueCount <= 5 && defaultNumeric) {
      // Pie chart
      charts.push({
        id: id++,
        chartType: 'pie',
        groupBy: col,
        yColumn: defaultNumeric,
        aggregation: 'COUNT',
      });
    } else if (defaultNumeric) {
      // Bar chart
      charts.push({
        id: id++,
        chartType: 'bar',
        xColumn: col,
        yColumn: defaultNumeric,
        aggregation: 'COUNT',
      });
    } else {
      // No numeric column – skip (can’t render)
    }
  });

  // ----- Date columns -----
  dateCols.forEach(col => {
    if (defaultNumeric) {
      charts.push({
        id: id++,
        chartType: 'line',
        xColumn: col,
        yColumn: defaultNumeric,
        aggregation: 'COUNT',
      });
    }
  });

  // ----- Scatter plots (correlated numeric pairs) -----
  if (numericCols.length >= 2) {
    const correlations = profiling?.correlations || [];
    const strongPairs = correlations.filter(c => Math.abs(c.correlation) > 0.5);   // slightly lower threshold

    if (strongPairs.length > 0) {
      strongPairs.slice(0, 3).forEach(pair => {   // max 3 scatter plots
        charts.push({
          id: id++,
          chartType: 'scatter',
          xColumn: pair.colA,
          yColumn: pair.colB,
        });
      });
    } else {
      // default first two numeric
      charts.push({
        id: id++,
        chartType: 'scatter',
        xColumn: numericCols[0],
        yColumn: numericCols[1],
      });
    }
  }

  // Ensure at least one chart if we have data but nothing generated (e.g., no numeric column)
  if (charts.length === 0 && data.length > 0) {
    // fallback: scatter with first two columns (any type)
    if (columns.length >= 2) {
      charts.push({
        id: id++,
        chartType: 'scatter',
        xColumn: columns[0],
        yColumn: columns[1],
      });
    }
  }

  return charts.slice(0, 10);
};