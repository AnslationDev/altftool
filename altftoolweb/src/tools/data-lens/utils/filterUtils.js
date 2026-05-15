export const buildFilterMeta = (data, columns, types) => {
  const meta = {};
  columns.forEach((col) => {
    const values = data.map((row) => row[col]).filter((v) => v != null && v !== '');
    if (types[col] === 'numeric') {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      meta[col] = {
        type: 'numeric',
        min: nums.length ? Math.min(...nums) : 0,
        max: nums.length ? Math.max(...nums) : 0,
      };
    } else if (types[col] === 'date') {
      const dates = values.map((v) => new Date(v)).filter((d) => !isNaN(d));
      meta[col] = {
        type: 'date',
        min: dates.length ? new Date(Math.min(...dates)) : new Date(),
        max: dates.length ? new Date(Math.max(...dates)) : new Date(),
      };
    } else {
      // Categorical: frequency count, keep top 50 to avoid enormous lists
      const freqMap = {};
      values.forEach(v => { freqMap[v] = (freqMap[v] || 0) + 1; });
      const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      const topValues = sorted.slice(0, 50).map(entry => entry[0]).sort();
      meta[col] = {
        type: 'categorical',
        options: topValues,
        totalUnique: sorted.length,   // can be used in UI to show “(top 50 of X)”
      };
    }
  });
  return meta;
};

export const filtersToCondition = (filters) => {
  const condition = {};
  Object.entries(filters).forEach(([col, val]) => {
    if (val === undefined || val === null || val === '') return;
    if (val.type === 'numeric' && val.min !== undefined && val.max !== undefined)
      condition[col] = { type: 'range', min: val.min, max: val.max };
    else if (val.type === 'date' && val.start && val.end)
      condition[col] = { type: 'dateRange', start: val.start, end: val.end };
    else if (val.type === 'categorical' && Array.isArray(val.selected) && val.selected.length)
      condition[col] = { type: 'select', values: val.selected };
  });
  return condition;
};