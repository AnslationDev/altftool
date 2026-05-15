export const aggregateData = (data, groupCol, valueCol, method = "SUM") => {
  const groups = {};
  data.forEach((row) => {
    const key = row[groupCol];
    if (key === null || key === undefined) return;
    const rawVal = row[valueCol];
    if (method !== "COUNT" && (rawVal === null || rawVal === undefined || rawVal === "")) return;
    if (!groups[key]) groups[key] = [];
    if (method === "COUNT") {
      groups[key].push(1);
    } else {
      const num = parseFloat(String(rawVal).replace(/,/g, "").trim());
      if (isNaN(num) || !isFinite(num)) return;
      groups[key].push(num);
    }
  });
  const result = [];
  for (const [key, vals] of Object.entries(groups)) {
    if (vals.length === 0) continue;
    const count = vals.length;
    let aggregated;
    switch (method) {
      case "SUM": aggregated = vals.reduce((a, b) => a + b, 0); break;
      case "AVG": aggregated = vals.reduce((a, b) => a + b, 0) / count; break;
      case "COUNT": aggregated = count; break;
      case "MIN": aggregated = Math.min(...vals); break;
      case "MAX": aggregated = Math.max(...vals); break;
      default: aggregated = vals.reduce((a, b) => a + b, 0);
    }
    result.push({ [groupCol]: key, [valueCol]: aggregated, count });
  }
  return result;
};

export const filterData = (data, filters) => {
  return data.filter((row) => {
    return Object.entries(filters).every(([col, condition]) => {
      if (!condition) return true;
      const cellValue = row[col];
      if (condition.type === "range") {
        const num = parseFloat(cellValue);
        return !isNaN(num) && num >= condition.min && num <= condition.max;
      }
      if (condition.type === "select") {
        return condition.values.includes(String(cellValue));
      }
      if (condition.type === "dateRange") {
        const date = new Date(cellValue);
        const start = new Date(condition.start);
        const end = new Date(condition.end);
        return !isNaN(date) && date >= start && date <= end;
      }
      return true;
    });
  });
};

