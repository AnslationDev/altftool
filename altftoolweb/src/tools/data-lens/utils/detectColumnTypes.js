export const detectColumnTypes = (data) => {
  if (!data.length) return {};
  const columns = Object.keys(data[0]);
  const types = {};
  columns.forEach((col) => {
    const values = data.map((row) => row[col]).filter(Boolean);
    if (values.length === 0) {
      types[col] = "categorical";
      return;
    }
    const isNumeric = values.every((v) => {
      if (v === null || v === undefined || v === "") return false;
      const cleaned = String(v).replace(/,/g, "").trim();
      const num = Number(cleaned);
      return !isNaN(num) && isFinite(num);
    });
    let dateCount = 0;
    values.forEach((v) => {
      const parsed = Date.parse(v);
      if (!isNaN(parsed)) dateCount++;
    });
    const dateRatio = dateCount / values.length;
    if (isNumeric) types[col] = "numeric";
    else if (dateRatio >= 0.8) types[col] = "date";
    else types[col] = "categorical";
  });
  return types;
};