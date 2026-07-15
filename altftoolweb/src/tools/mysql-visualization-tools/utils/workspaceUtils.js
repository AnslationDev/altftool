import Papa from "papaparse";

export const normalizeName = (value = "table") =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "t_$1")
    .toLowerCase() || "table";

const inferType = (values) => {
  const real = values.filter((value) => value !== null && value !== undefined && `${value}`.trim() !== "");
  if (!real.length) return "VARCHAR(255)";
  if (real.every((value) => /^-?\d+$/.test(`${value}`))) return "INT";
  if (real.every((value) => /^-?\d+(\.\d+)?$/.test(`${value}`))) return "DECIMAL(12,2)";
  if (real.every((value) => /^(true|false|0|1)$/i.test(`${value}`))) return "BOOLEAN";
  if (real.every((value) => !Number.isNaN(Date.parse(value)))) return "DATETIME";
  const longest = Math.max(...real.map((value) => `${value}`.length), 20);
  return `VARCHAR(${Math.min(Math.max(longest * 2, 50), 255)})`;
};

export const tablesToCreateSql = (tables) =>
  tables
    .map((table) => {
      const columns = table.columns.map((column) => `  \`${column.name}\` ${column.type}${column.primary ? " PRIMARY KEY" : ""}`);
      return `CREATE TABLE \`${table.name}\` (\n${columns.join(",\n")}\n);`;
    })
    .join("\n\n");

export const rowsToTable = (name, rows) => {
  const cleanRows = rows.filter((row) => row && Object.keys(row).length);
  const columnNames = [...new Set(cleanRows.flatMap((row) => Object.keys(row).map(normalizeName)))];
  const normalizedRows = cleanRows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeName(key), value]))
  );
  const columns = columnNames.map((columnName) => ({
    name: columnName,
    type: inferType(normalizedRows.map((row) => row[columnName])),
    nullable: normalizedRows.some((row) => row[columnName] === "" || row[columnName] === null || row[columnName] === undefined),
    primary: columnName === "id",
    unique: false,
  }));
  return { name: normalizeName(name), columns, rows: normalizedRows };
};

export const parseCsvFile = (name, text) => {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
  return rowsToTable(name, parsed.data);
};

export const parseJsonFile = (name, text) => {
  const value = JSON.parse(text);
  const rows = Array.isArray(value) ? value : Array.isArray(value?.rows) ? value.rows : Object.values(value).find(Array.isArray);
  if (!Array.isArray(rows)) throw new Error("JSON must be an array of row objects or contain a rows array.");
  return rowsToTable(name, rows);
};

const parseInsertValue = (value) => {
  const trimmed = value.trim();
  if (/^null$/i.test(trimmed)) return null;
  if (/^'.*'$|^".*"$/.test(trimmed)) return trimmed.slice(1, -1).replace(/\\'/g, "'");
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
};

const splitCsvLike = (input) => {
  const result = [];
  let current = "";
  let quote = null;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if ((char === "'" || char === '"') && input[index - 1] !== "\\") quote = quote === char ? null : quote || char;
    if (char === "," && !quote) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const extractRowsFromSql = (sql) => {
  const datasets = {};
  [...sql.matchAll(/INSERT\s+INTO\s+`?([A-Za-z_][\w$]*)`?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gi)].forEach((match) => {
    const tableName = normalizeName(match[1]);
    const columns = splitCsvLike(match[2]).map((column) => normalizeName(column.replace(/[`"']/g, "")));
    const tuples = [...match[3].matchAll(/\(([^()]*)\)/g)].map((tuple) => splitCsvLike(tuple[1]).map(parseInsertValue));
    datasets[tableName] = [
      ...(datasets[tableName] || []),
      ...tuples.map((values) => Object.fromEntries(columns.map((column, index) => [column, values[index]]))),
    ];
  });
  return datasets;
};

export const readDatasetFiles = async (files) => {
  const tables = [];
  const sqlParts = [];
  for (const file of files) {
    const text = await file.text();
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") tables.push(parseCsvFile(file.name, text));
    if (ext === "json") tables.push(parseJsonFile(file.name, text));
    if (ext === "sql") {
      sqlParts.push(text);
      const inserted = extractRowsFromSql(text);
      Object.entries(inserted).forEach(([tableName, rows]) => tables.push(rowsToTable(tableName, rows)));
    }
  }
  return { tables, sql: sqlParts.filter(Boolean).join("\n\n") };
};

export const sampleDatasets = {
  ecommerce: [
    rowsToTable("users", [{ id: 1, name: "Ava", email: "ava@example.com" }, { id: 6, name: "Milo", email: "milo@example.com" }]),
    rowsToTable("orders", [{ id: 101, user_id: 1, total: 79.5 }, { id: 102, user_id: 6, total: 142 }]),
  ],
  school: [
    rowsToTable("students", [{ id: 1, name: "Nia", grade: "A" }, { id: 2, name: "Omar", grade: "B" }]),
    rowsToTable("courses", [{ id: 10, title: "SQL Basics" }, { id: 11, title: "Data Design" }]),
  ],
  hospital: [
    rowsToTable("patients", [{ id: 1, name: "Ira", age: 37 }, { id: 2, name: "Sam", age: 44 }]),
    rowsToTable("visits", [{ id: 1, patient_id: 1, department: "Cardiology" }, { id: 2, patient_id: 2, department: "Ortho" }]),
  ],
  social_media: [
    rowsToTable("profiles", [{ id: 1, handle: "pixelpro", followers: 1200 }, { id: 2, handle: "queryqueen", followers: 5400 }]),
    rowsToTable("posts", [{ id: 1, profile_id: 2, likes: 410 }, { id: 2, profile_id: 1, likes: 88 }]),
  ],
  employees: [
    rowsToTable("employees", [{ id: 1, name: "Chen", department_id: 2, salary: 78000 }, { id: 2, name: "Leah", department_id: 1, salary: 92000 }]),
    rowsToTable("departments", [{ id: 1, name: "Engineering" }, { id: 2, name: "Support" }]),
  ],
};
