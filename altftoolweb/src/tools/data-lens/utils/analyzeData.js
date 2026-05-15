export const analyzeData = (data, types) => {
  const result = {};
  Object.keys(types).forEach((col) => {
    const values = data.map((row) => row[col]);
    const cleanValues = values.filter((v) => v !== null && v !== undefined && v !== "");
    const nullCount = values.length - cleanValues.length;
    if (types[col] === "numeric") {
      const nums = cleanValues
        .map((v) => Number(String(v).replace(/,/g, "").trim()))
        .filter((n) => !isNaN(n) && isFinite(n));
      if (nums.length === 0) {
        result[col] = { type: "numeric", mean: "N/A", nulls: nullCount };
      } else {
        const mean = nums.reduce((sum, val) => sum + val, 0) / nums.length;
        result[col] = { type: "numeric", mean: mean.toFixed(2), nulls: nullCount };
      }
    } else {
      const unique = new Set(cleanValues);
      result[col] = { type: types[col], uniqueCount: unique.size, nulls: nullCount };
    }
  });
  return result;
};