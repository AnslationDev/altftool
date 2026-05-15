// Normalize column names: trim, lowercase, replace spaces & special chars with underscores
export const normalizeColumnNames = (data) => {
  if (!data.length) return data;
  const oldKeys = Object.keys(data[0]);
  const newKeys = oldKeys.map(k =>
    k.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  );
  return data.map(row => {
    const newRow = {};
    oldKeys.forEach((old, i) => {
      newRow[newKeys[i]] = row[old];
    });
    return newRow;
  });
};

// Trim whitespace from all string values
export const trimAllValues = (data) => {
  return data.map(row => {
    const newRow = {};
    Object.keys(row).forEach(col => {
      const val = row[col];
      newRow[col] = (typeof val === 'string') ? val.trim() : val;
    });
    return newRow;
  });
};

// Replace "None" strings with empty values
export const replaceNoneWithEmpty = (data) => {
  return data.map(row => {
    const newRow = {};
    Object.keys(row).forEach(col => {
      const val = row[col];
      if (typeof val === 'string' && val.trim().toLowerCase() === 'none') {
        newRow[col] = '';
      } else {
        newRow[col] = val;
      }
    });
    return newRow;
  });
};

// Remove exact duplicate rows
export const removeDuplicates = (data) => {
  const seen = new Set();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Remove columns where all values are identical (constant) or null percent > 80%
export const dropLowQualityColumns = (data, columnTypes, analysis) => {
  if (!data.length) return { data, dropped: [] };
  const columns = Object.keys(data[0]);
  const dropped = [];

  const remainingCols = columns.filter(col => {
    const colProfile = analysis?.columns?.[col];
    if (!colProfile) return true;
    if (colProfile.uniqueCount === 1) {
      dropped.push(col);
      return false;
    }
    if (colProfile.nullPercent > 80) {
      dropped.push(col);
      return false;
    }
    return true;
  });

  if (remainingCols.length === 0) return { data, dropped };

  const newData = data.map(row => {
    const newRow = {};
    remainingCols.forEach(col => { newRow[col] = row[col]; });
    return newRow;
  });
  return { data: newData, dropped };
};

// Fill missing numeric values with median
export const fillMissingNumericWithMedian = (data, columnTypes) => {
  if (!data.length) return data;
  const columns = Object.keys(data[0]);
  const medians = {};
  columns.forEach(col => {
    if (columnTypes[col] !== 'numeric') return;
    const nums = data
      .map(row => parseFloat(String(row[col]).replace(/,/g, '')))
      .filter(v => !isNaN(v) && isFinite(v))
      .sort((a, b) => a - b);
    if (nums.length) {
      medians[col] = nums[Math.floor(nums.length / 2)];
    }
  });
  return data.map(row => {
    const newRow = { ...row };
    columns.forEach(col => {
      if (medians[col] !== undefined) {
        const val = row[col];
        if (val === null || val === undefined || val === '') {
          newRow[col] = medians[col];
        }
      }
    });
    return newRow;
  });
};

// Fill missing categorical values with mode (most frequent value)
export const fillMissingCategoricalWithMode = (data, columnTypes) => {
  if (!data.length) return data;
  const columns = Object.keys(data[0]);
  const modes = {};
  columns.forEach(col => {
    if (columnTypes[col] === 'numeric' || columnTypes[col] === 'date') return;
    const freq = {};
    data.forEach(row => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        freq[val] = (freq[val] || 0) + 1;
      }
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    if (sorted.length) modes[col] = sorted[0][0];
  });
  return data.map(row => {
    const newRow = { ...row };
    columns.forEach(col => {
      if (modes[col] !== undefined) {
        const val = row[col];
        if (val === null || val === undefined || val === '') {
          newRow[col] = modes[col];
        }
      }
    });
    return newRow;
  });
};

// Convert cleaned data to CSV string
export const convertToCSV = (data) => {
  if (!data.length) return '';
  const columns = Object.keys(data[0]);
  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
};